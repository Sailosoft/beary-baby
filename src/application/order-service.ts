import "server-only";
import { getSupabase } from "@/infrastructure/supabase/client";
import type {
  OrderItemRow,
  OrderRow,
  ProductRow,
  ProductVariantRow,
} from "@/infrastructure/supabase/types";

export class OrderValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OrderValidationError";
  }
}

export type PlaceOrderItemInput = {
  productId: string;
  variantId?: string | null;
  quantity: number;
  note?: string | null;
};

export type PlaceOrderInput = {
  customerName: string;
  note?: string | null;
  items: PlaceOrderItemInput[];
};

export type PlacedOrder = {
  orderId: string;
  total: number;
};

export type OrderStatus = "new" | "fulfilled" | "cancelled";

export type AdminOrderItem = {
  id: string;
  productName: string;
  variantLabel: string | null;
  imageUrl: string | null;
  unitPrice: number;
  quantity: number;
  note: string | null;
};

export type AdminOrder = {
  id: string;
  customerName: string;
  note: string | null;
  status: string;
  total: number;
  createdAt: Date;
  items: AdminOrderItem[];
};

/**
 * Validates the order and persists it. Prices are recomputed from the database
 * so a tampered client price cannot affect the stored total. Does not touch
 * stock (fire-and-forget).
 */
export async function placeOrder(input: PlaceOrderInput): Promise<PlacedOrder> {
  const customerName = input.customerName?.trim();
  if (!customerName) {
    throw new OrderValidationError("Please enter your name.");
  }

  const items = input.items.filter(
    (item) => item.productId && Number.isFinite(item.quantity) && item.quantity > 0,
  );
  if (items.length === 0) {
    throw new OrderValidationError("Your cart is empty.");
  }

  const supabase = getSupabase();
  const productIds = [...new Set(items.map((item) => item.productId))];
  const { data: products, error: productErr } = await supabase
    .from("products")
    .select("*")
    .in("id", productIds);
  if (productErr) throw productErr;
  const productById = new Map(
    (products as ProductRow[]).map((p) => [p.id, p]),
  );

  const variantIds = [
    ...new Set(items.map((item) => item.variantId).filter(Boolean)),
  ] as string[];
  const variantById = new Map<string, ProductVariantRow>();
  if (variantIds.length > 0) {
    const { data: variants, error: variantErr } = await supabase
      .from("product_variants")
      .select("*")
      .in("id", variantIds);
    if (variantErr) throw variantErr;
    for (const variant of variants as ProductVariantRow[]) {
      variantById.set(variant.id, variant);
    }
  }

  const lines = items.map((item) => {
    const product = productById.get(item.productId);
    if (!product) {
      throw new OrderValidationError(
        "One of the products is no longer available.",
      );
    }
    const variant = item.variantId ? variantById.get(item.variantId) : undefined;
    const unitPrice = variant?.price ?? product.price;
    return {
      product_id: product.id,
      variant_id: variant?.id ?? null,
      product_name: product.name,
      variant_label: variant?.label ?? null,
      unit_price: unitPrice,
      quantity: Math.max(1, Math.floor(item.quantity)),
      note: item.note?.trim() || null,
    };
  });

  const total = lines.reduce(
    (sum, line) => sum + line.unit_price * line.quantity,
    0,
  );

  const { data: order, error: orderErr } = await supabase
    .from("orders")
    .insert({
      customer_name: customerName,
      note: input.note?.trim() || null,
      status: "new",
      total,
    })
    .select("*")
    .single();
  if (orderErr) throw orderErr;
  const orderId = (order as OrderRow).id;

  const { error: itemsErr } = await supabase
    .from("order_items")
    .insert(lines.map((line) => ({ ...line, order_id: orderId })));
  if (itemsErr) throw itemsErr;

  return { orderId, total };
}

export async function listOrdersAdmin(filter: {
  customerName?: string;
}): Promise<AdminOrder[]> {
  const supabase = getSupabase();
  let query = supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });
  const name = filter.customerName?.trim();
  if (name) {
    query = query.ilike("customer_name", `%${name}%`);
  }
  const { data, error } = await query;
  if (error) throw error;
  const orders = data as OrderRow[];
  if (orders.length === 0) return [];

  const orderIds = orders.map((o) => o.id);
  const { data: itemsData, error: itemsErr } = await supabase
    .from("order_items")
    .select("*")
    .in("order_id", orderIds);
  if (itemsErr) throw itemsErr;

  const itemRows = itemsData as OrderItemRow[];

  // Product main image per order item (variants have no image of their own).
  const productIds = [
    ...new Set(
      itemRows
        .map((row) => row.product_id)
        .filter((id): id is string => Boolean(id)),
    ),
  ];
  const imageByProduct = new Map<string, string>();
  if (productIds.length > 0) {
    const { data: productsData, error: productsErr } = await supabase
      .from("products")
      .select("id, image_url")
      .in("id", productIds);
    if (productsErr) throw productsErr;
    for (const product of productsData as Pick<ProductRow, "id" | "image_url">[]) {
      imageByProduct.set(product.id, product.image_url);
    }
  }

  const itemsByOrder = new Map<string, AdminOrderItem[]>();
  for (const row of itemRows) {
    const list = itemsByOrder.get(row.order_id) ?? [];
    list.push({
      id: row.id,
      productName: row.product_name,
      variantLabel: row.variant_label,
      imageUrl: row.product_id
        ? imageByProduct.get(row.product_id) ?? null
        : null,
      unitPrice: row.unit_price,
      quantity: row.quantity,
      note: row.note,
    });
    itemsByOrder.set(row.order_id, list);
  }

  return orders.map((order) => ({
    id: order.id,
    customerName: order.customer_name,
    note: order.note,
    status: order.status,
    total: order.total,
    createdAt: new Date(order.created_at),
    items: itemsByOrder.get(order.id) ?? [],
  }));
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus,
): Promise<void> {
  const { error } = await getSupabase()
    .from("orders")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

/** Deletes an order; order_items are removed via the FK `on delete cascade`. */
export async function deleteOrder(id: string): Promise<void> {
  const { error } = await getSupabase().from("orders").delete().eq("id", id);
  if (error) throw error;
}
