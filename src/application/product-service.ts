import "server-only";
import { cacheTag } from "next/cache";
import { getSupabase } from "@/infrastructure/supabase/client";
import type {
  CategoryRow,
  ProductGalleryRow,
  ProductRow,
  ProductVariantRow,
} from "@/infrastructure/supabase/types";
import { slugifyName } from "@/domain/category";
import {
  computePriceRange,
  isOutOfStock,
  type Category,
  type Product,
  type ProductGallery,
  type ProductVariant,
} from "@/domain/product";

export type ProductSort =
  | "name-asc"
  | "name-desc"
  | "price-asc"
  | "price-desc"
  | "category-asc"
  | "category-desc";

export type ProductFilter = {
  q?: string;
  categorySlug?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: ProductSort;
  page?: number;
  pageSize?: number;
};

export type ProductListResult = {
  items: (Product & { categories: Category[] })[];
  total: number;
  hasMore: boolean;
};

export type ProductDetail = Product & {
  categories: Category[];
  galleries: ProductGallery[];
};

export class ProductConflictError extends Error {
  constructor(field: "slug" | "code", value: string) {
    super(`Product ${field} "${value}" already exists`);
    this.name = "ProductConflictError";
  }
}

function toProduct(row: ProductRow): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    code: row.code,
    description: row.description,
    price: row.price,
    available: row.available,
    stocks: row.stocks,
    imageUrl: row.image_url,
    displayPrice: row.display_price,
    isPreorder: row.is_preorder ?? false,
    imageProvider: row.image_provider ?? null,
    imageUploadId: row.image_upload_id ?? null,
    priceRange: row.price_range ?? null,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

async function loadCategoriesMap(
  productIds: string[],
): Promise<Map<string, Category[]>> {
  if (productIds.length === 0) return new Map();
  const { data, error } = await getSupabase()
    .from("product_categories")
    .select("product_id, category_id, categories(*)")
    .in("product_id", productIds);
  if (error) throw error;

  const map = new Map<string, Category[]>();
  for (const row of data as {
    product_id: string;
    categories: CategoryRow | CategoryRow[];
  }[]) {
    const cats = Array.isArray(row.categories) ? row.categories : [row.categories];
    for (const c of cats) {
      if (!c) continue;
      const list = map.get(row.product_id) ?? [];
      list.push({
        id: c.id,
        name: c.name,
        slug: c.slug,
        imageUrl: c.image_url,
        order: c.order,
      });
      map.set(row.product_id, list);
    }
  }
  for (const list of map.values()) {
    list.sort((a, b) => a.name.localeCompare(b.name));
  }
  return map;
}

/**
 * Customer-facing listing. Out-of-stock products (Available=false or Stocks=0)
 * are pushed to the bottom per spec. Unavailable products are still displayed.
 */
export async function listProducts(
  filter: ProductFilter,
): Promise<ProductListResult> {
  "use cache";
  cacheTag("catalog");
  const page = Math.max(1, filter.page ?? 1);
  const pageSize = Math.min(50, Math.max(1, filter.pageSize ?? 12));
  const supabase = getSupabase();

  let query = supabase
    .from("products")
    .select("*", { count: "exact" });

  if (filter.q) {
    const pattern = `%${filter.q}%`;
    query = query.or(`name.ilike.${pattern},description.ilike.${pattern}`);
  }
  if (filter.minPrice !== undefined) {
    query = query.gte("price", filter.minPrice);
  }
  if (filter.maxPrice !== undefined) {
    query = query.lte("price", filter.maxPrice);
  }
  if (filter.categorySlug) {
    const { data: cat, error } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", filter.categorySlug)
      .limit(1);
    if (error) throw error;
    const catRow = (cat as { id: string }[])[0];
    if (!catRow) {
      return { items: [], total: 0, hasMore: false };
    }
    const { data: links, error: linkErr } = await supabase
      .from("product_categories")
      .select("product_id")
      .eq("category_id", catRow.id);
    if (linkErr) throw linkErr;
    const ids = (links as { product_id: string }[]).map((l) => l.product_id);
    if (ids.length === 0) {
      return { items: [], total: 0, hasMore: false };
    }
    query = query.in("id", ids);
  }

  let orderBy: { column: string; ascending: boolean; nullsFirst?: boolean }[] = [];
  switch (filter.sort) {
    case "name-asc":
      orderBy = [{ column: "name", ascending: true }];
      break;
    case "name-desc":
      orderBy = [{ column: "name", ascending: false }];
      break;
    case "price-asc":
      orderBy = [{ column: "price", ascending: true }];
      break;
    case "price-desc":
      orderBy = [{ column: "price", ascending: false }];
      break;
    case "category-asc":
    case "category-desc":
      // Category sort falls back to name; category ordering applied client-side below.
      orderBy = [{ column: "name", ascending: filter.sort === "category-asc" }];
      break;
    default:
      orderBy = [{ column: "created_at", ascending: false }];
  }

  const { data, error, count } = await query
    .order("available", { ascending: false }) // available=true first
    .order("stocks", {
      ascending: false,
      nullsFirst: false, // null stocks treated as normal (in stock)
    })
    .order(orderBy[0].column, {
      ascending: orderBy[0].ascending,
      nullsFirst: false,
    })
    .range((page - 1) * pageSize, page * pageSize - 1);

  if (error) throw error;

  const total = count ?? 0;
  const hasMore = page * pageSize < total;
  const items = (data as ProductRow[]).map(toProduct);
  const categoriesMap = await loadCategoriesMap(items.map((p) => p.id));

  let result = items.map((p) => ({
    ...p,
    categories: categoriesMap.get(p.id) ?? [],
  }));

  if (filter.sort === "category-asc" || filter.sort === "category-desc") {
    const dir = filter.sort === "category-asc" ? 1 : -1;
    result = [...result].sort((a, b) => {
      const an = a.categories[0]?.name ?? "";
      const bn = b.categories[0]?.name ?? "";
      return an.localeCompare(bn) * dir;
    });
  }

  return { items: result, total, hasMore };
}

export async function getProductBySlug(
  slug: string,
): Promise<ProductDetail | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .limit(1);
  if (error) throw error;
  const row = (data as ProductRow[])[0];
  if (!row) return null;

  const [catsRes, galRes, varRes] = await Promise.all([
    supabase
      .from("product_categories")
      .select("categories(*)")
      .eq("product_id", row.id),
    supabase
      .from("product_galleries")
      .select("*")
      .eq("product_id", row.id)
      .order("order", { ascending: true }),
    supabase
      .from("product_variants")
      .select("*")
      .eq("product_id", row.id)
      .order("order", { ascending: true }),
  ]);
  if (catsRes.error) throw catsRes.error;
  if (galRes.error) throw galRes.error;
  if (varRes.error) throw varRes.error;

  const cats = (catsRes.data as { categories: CategoryRow | CategoryRow[] }[])
    .flatMap((r) => (Array.isArray(r.categories) ? r.categories : [r.categories]))
    .filter((c): c is CategoryRow => Boolean(c))
    .map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      imageUrl: c.image_url,
      order: c.order,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  const galleries = (galRes.data as ProductGalleryRow[]).map((g) => ({
    id: g.id,
    productId: g.product_id,
    imageUrl: g.image_url,
    imageProvider: g.image_provider ?? null,
    imageUploadId: g.image_upload_id ?? null,
    order: g.order,
  }));

  const variants = (varRes.data as ProductVariantRow[]).map(toVariant);

  return { ...toProduct(row), categories: cats, galleries, variants };
}

/**
 * Other products sharing at least one category with the given product,
 * in random order (per spec functionality #5).
 */
export async function getRelatedProducts(
  productId: string,
  limit = 6,
): Promise<Product[]> {
  "use cache";
  cacheTag("catalog");
  const supabase = getSupabase();

  // Category ids of the given product.
  const { data: own, error: ownErr } = await supabase
    .from("product_categories")
    .select("category_id")
    .eq("product_id", productId);
  if (ownErr) throw ownErr;
  const categoryIds = (own as { category_id: string }[]).map((r) => r.category_id);
  if (categoryIds.length === 0) return [];

  // Product ids sharing those categories (excluding the product itself).
  const { data: links, error: linkErr } = await supabase
    .from("product_categories")
    .select("product_id")
    .in("category_id", categoryIds)
    .neq("product_id", productId);
  if (linkErr) throw linkErr;
  const productIds = [
    ...new Set((links as { product_id: string }[]).map((l) => l.product_id)),
  ];
  if (productIds.length === 0) return [];

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .in("id", productIds)
    .limit(limit);
  if (error) throw error;

  // Random order client-side.
  return (data as ProductRow[])
    .map(toProduct)
    .sort(() => Math.random() - 0.5);
}

export async function getFeaturedProducts(): Promise<
  (Product & { categories: Category[] })[]
> {
  "use cache";
  cacheTag("catalog");
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("feature_products")
    .select("order, products(*)")
    .order("order", { ascending: true });
  if (error) throw error;

  const rows = data as { order: number; products: ProductRow | ProductRow[] }[];
  const items = rows
    .flatMap((r) => (Array.isArray(r.products) ? r.products : [r.products]))
    .filter((p): p is ProductRow => Boolean(p))
    .map(toProduct);
  const categoriesMap = await loadCategoriesMap(items.map((p) => p.id));
  return items.map((p) => ({ ...p, categories: categoriesMap.get(p.id) ?? [] }));
}

// ---------------------------------------------------------------------------
// Admin mutations (no caching — always fresh)
// ---------------------------------------------------------------------------

export type ProductGalleryInput = {
  url: string;
  provider?: string | null;
  uploadId?: string | null;
};

export type VariantInput = {
  label: string;
  sku?: string | null;
  price?: number | null;
  stocks?: number | null;
  available?: boolean;
  order?: number;
};

export type ProductInput = {
  name: string;
  code: string;
  description?: string | null;
  price: number;
  available: boolean;
  stocks?: number | null;
  imageUrl: string;
  displayPrice: boolean;
  isPreorder: boolean;
  imageProvider?: string | null;
  imageUploadId?: string | null;
  categoryIds: string[];
  galleryImages: ProductGalleryInput[];
  variants: VariantInput[];
};

function toVariant(row: ProductVariantRow): ProductVariant {
  return {
    id: row.id,
    productId: row.product_id,
    label: row.label,
    sku: row.sku,
    price: row.price,
    stocks: row.stocks,
    available: row.available,
    order: row.order,
  };
}

async function assertUnique(
  slug: string,
  code: string,
  excludeId?: string,
): Promise<void> {
  const { data, error } = await getSupabase()
    .from("products")
    .select("id, slug, code")
    .or(`slug.eq.${slug},code.eq.${code}`);
  if (error) throw error;
  for (const row of data as { id: string; slug: string; code: string }[]) {
    if (excludeId && row.id === excludeId) continue;
    if (row.slug === slug) throw new ProductConflictError("slug", slug);
    if (row.code === code) throw new ProductConflictError("code", code);
  }
}

async function replaceRelations(
  productId: string,
  input: ProductInput,
): Promise<void> {
  const supabase = getSupabase();
  await supabase.from("product_categories").delete().eq("product_id", productId);
  await supabase.from("product_galleries").delete().eq("product_id", productId);
  if (input.categoryIds.length > 0) {
    const { error } = await supabase.from("product_categories").insert(
      input.categoryIds.map((categoryId) => ({
        product_id: productId,
        category_id: categoryId,
      })),
    );
    if (error) throw error;
  }
  if (input.galleryImages.length > 0) {
    const { error } = await supabase.from("product_galleries").insert(
      input.galleryImages.map((image, i) => ({
        product_id: productId,
        image_url: image.url,
        image_provider: image.provider ?? null,
        image_upload_id: image.uploadId ?? null,
        order: i,
      })),
    );
    if (error) throw error;
  }

  // Variants are replaced wholesale; ids change on every save (labels/prices
  // are snapshotted on orders, so past orders stay correct).
  await supabase.from("product_variants").delete().eq("product_id", productId);
  if (input.variants.length > 0) {
    const { error } = await supabase.from("product_variants").insert(
      input.variants.map((variant, i) => ({
        product_id: productId,
        label: variant.label,
        sku: variant.sku ?? null,
        price: variant.price ?? null,
        stocks: variant.stocks ?? null,
        available: variant.available ?? true,
        order: variant.order ?? i,
      })),
    );
    if (error) throw error;
  }

  // Cache the computed price range on the product.
  const priceRange = computePriceRange(
    { price: input.price, displayPrice: input.displayPrice },
    input.variants,
  );
  const { error: rangeError } = await supabase
    .from("products")
    .update({ price_range: priceRange })
    .eq("id", productId);
  if (rangeError) throw rangeError;
}

export async function createProduct(input: ProductInput): Promise<Product> {
  const slug = slugifyName(input.name);
  await assertUnique(slug, input.code);
  const { data, error } = await getSupabase()
    .from("products")
    .insert({
      slug,
      name: input.name,
      code: input.code,
      description: input.description ?? null,
      price: input.price,
      available: input.available,
      stocks: input.stocks ?? null,
      image_url: input.imageUrl,
      display_price: input.displayPrice,
      is_preorder: input.isPreorder,
      image_provider: input.imageProvider ?? null,
      image_upload_id: input.imageUploadId ?? null,
    })
    .select("*")
    .single();
  if (error) throw error;
  await replaceRelations((data as ProductRow).id, input);
  return toProduct(data as ProductRow);
}

export async function updateProduct(
  id: string,
  input: ProductInput,
): Promise<Product> {
  // Slug remains unchanged on update (per spec Q&A).
  const supabase = getSupabase();
  const { data: current, error: curErr } = await supabase
    .from("products")
    .select("slug")
    .eq("id", id)
    .limit(1);
  if (curErr) throw curErr;
  const currentRow = (current as { slug: string }[])[0];
  if (!currentRow) throw new Error("Product not found");
  await assertUnique(currentRow.slug, input.code, id);
  const { data, error } = await supabase
    .from("products")
    .update({
      name: input.name,
      code: input.code,
      description: input.description ?? null,
      price: input.price,
      available: input.available,
      stocks: input.stocks ?? null,
      image_url: input.imageUrl,
      display_price: input.displayPrice,
      is_preorder: input.isPreorder,
      image_provider: input.imageProvider ?? null,
      image_upload_id: input.imageUploadId ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  await replaceRelations(id, input);
  return toProduct(data as ProductRow);
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await getSupabase().from("products").delete().eq("id", id);
  if (error) throw error;
}

export async function getProductById(id: string): Promise<ProductDetail | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .limit(1);
  if (error) throw error;
  const row = (data as ProductRow[])[0];
  if (!row) return null;
  const [catsRes, galRes, varRes] = await Promise.all([
    supabase
      .from("product_categories")
      .select("category_id")
      .eq("product_id", id),
    supabase
      .from("product_galleries")
      .select("*")
      .eq("product_id", id)
      .order("order", { ascending: true }),
    supabase
      .from("product_variants")
      .select("*")
      .eq("product_id", id)
      .order("order", { ascending: true }),
  ]);
  if (catsRes.error) throw catsRes.error;
  if (galRes.error) throw galRes.error;
  if (varRes.error) throw varRes.error;
  return {
    ...toProduct(row),
    categories: (catsRes.data as { category_id: string }[]).map((c) => ({
      id: c.category_id,
      name: "",
      slug: "",
      imageUrl: null,
      order: 0,
    })),
    galleries: (galRes.data as ProductGalleryRow[]).map((g) => ({
      id: g.id,
      productId: g.product_id,
      imageUrl: g.image_url,
      imageProvider: g.image_provider ?? null,
      imageUploadId: g.image_upload_id ?? null,
      order: g.order,
    })),
    variants: (varRes.data as ProductVariantRow[]).map(toVariant),
  };
}

export async function listAllProductsAdmin(): Promise<
  (Product & {
    categories: Category[];
    galleries: ProductGallery[];
    variants: ProductVariant[];
  })[]
> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  const items = (data as ProductRow[]).map(toProduct);
  const ids = items.map((p) => p.id);
  const [categoriesMap, galleriesMap, variantsMap] = await Promise.all([
    loadCategoriesMap(ids),
    loadGalleriesMap(ids),
    loadVariantsMap(ids),
  ]);
  return items.map((p) => ({
    ...p,
    categories: categoriesMap.get(p.id) ?? [],
    galleries: galleriesMap.get(p.id) ?? [],
    variants: variantsMap.get(p.id) ?? [],
  }));
}

async function loadVariantsMap(
  ids: string[],
): Promise<Map<string, ProductVariant[]>> {
  const map = new Map<string, ProductVariant[]>();
  if (ids.length === 0) return map;
  const { data, error } = await getSupabase()
    .from("product_variants")
    .select("*")
    .in("product_id", ids)
    .order("order", { ascending: true });
  if (error) throw error;
  for (const row of data as ProductVariantRow[]) {
    const list = map.get(row.product_id) ?? [];
    list.push(toVariant(row));
    map.set(row.product_id, list);
  }
  return map;
}

async function loadGalleriesMap(
  ids: string[],
): Promise<Map<string, ProductGallery[]>> {
  const map = new Map<string, ProductGallery[]>();
  if (ids.length === 0) return map;
  const { data, error } = await getSupabase()
    .from("product_galleries")
    .select("*")
    .in("product_id", ids)
    .order("order", { ascending: true });
  if (error) throw error;
  for (const g of data as ProductGalleryRow[]) {
    const list = map.get(g.product_id) ?? [];
    list.push({
      id: g.id,
      productId: g.product_id,
      imageUrl: g.image_url,
      imageProvider: g.image_provider ?? null,
      imageUploadId: g.image_upload_id ?? null,
      order: g.order,
    });
    map.set(g.product_id, list);
  }
  return map;
}

// ---------------------------------------------------------------------------
// Featured products (admin)
// ---------------------------------------------------------------------------

export async function setFeaturedProducts(
  entries: { productId: string; order: number }[],
): Promise<void> {
  const supabase = getSupabase();
  const { error: delErr } = await supabase.from("feature_products").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  if (delErr) throw delErr;
  if (entries.length > 0) {
    const { error } = await supabase.from("feature_products").insert(
      entries.map((e) => ({
        order: e.order,
        product_id: e.productId,
      })),
    );
    if (error) throw error;
  }
}

export async function listFeaturedAdmin(): Promise<
  { productId: string; order: number }[]
> {
  const { data, error } = await getSupabase()
    .from("feature_products")
    .select("order, product_id")
    .order("order", { ascending: true });
  if (error) throw error;
  return (data as { order: number; product_id: string }[]).map((r) => ({
    productId: r.product_id,
    order: r.order,
  }));
}

export { isOutOfStock };
