"use server";

import { revalidatePath } from "next/cache";
import { isAdminAuthenticated } from "@/infrastructure/auth/session";
import {
  OrderValidationError,
  deleteOrder,
  placeOrder,
  updateOrderStatus,
  type OrderStatus,
  type PlaceOrderInput,
} from "@/application/order-service";

export type PlaceOrderActionResult =
  | { ok: true; orderId: string; total: number }
  | { ok: false; error: string };

/** Fire-and-forget: no auth required, like a Google Form submission. */
export async function placeOrderAction(
  input: PlaceOrderInput,
): Promise<PlaceOrderActionResult> {
  try {
    const result = await placeOrder(input);
    revalidatePath("/admin/orders");
    return { ok: true, orderId: result.orderId, total: result.total };
  } catch (err) {
    if (err instanceof OrderValidationError) {
      return { ok: false, error: err.message };
    }
    return { ok: false, error: "Could not place your order. Please try again." };
  }
}

export async function updateOrderStatusAction(
  formData: FormData,
): Promise<void> {
  if (!(await isAdminAuthenticated())) return;
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "new") as OrderStatus;
  if (!id) return;
  await updateOrderStatus(id, status);
  revalidatePath("/admin/orders");
}

export async function deleteOrderAction(formData: FormData): Promise<void> {
  if (!(await isAdminAuthenticated())) return;
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await deleteOrder(id);
  revalidatePath("/admin/orders");
}
