"use server";

import { revalidatePath } from "next/cache";
import { isAdminAuthenticated } from "@/infrastructure/auth/session";
import {
  createCategory,
  deleteCategory,
  updateCategory,
} from "@/application/category-service";
import {
  createProduct,
  deleteProduct,
  updateProduct,
  setFeaturedProducts,
  type ProductInput,
} from "@/application/product-service";
import { importProductsFromCsv } from "@/application/import-service";
import { revalidateCatalog } from "./auth-actions";

async function assertAdmin(): Promise<void> {
  if (!(await isAdminAuthenticated())) {
    throw new Error("Unauthorized");
  }
}

function refresh(): void {
  revalidateCatalog();
  revalidatePath("/admin", "layout");
}

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

export type ActionState = { error?: string; success?: string };

export async function saveCategoryAction(
  _prev: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  await assertAdmin();
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const imageUrl = String(formData.get("imageUrl") ?? "").trim();
  const order = Number(formData.get("order") ?? 0) || 0;

  if (!name) return { error: "Name is required." };

  try {
    if (id) {
      await updateCategory(id, { name, imageUrl: imageUrl || null, order });
    } else {
      await createCategory({ name, imageUrl: imageUrl || null, order });
    }
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to save" };
  }
  refresh();
  return { success: "Category saved." };
}

export async function deleteCategoryAction(formData: FormData): Promise<void> {
  await assertAdmin();
  const id = String(formData.get("id") ?? "");
  if (id) await deleteCategory(id);
  refresh();
}

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------

export async function saveProductAction(
  _prev: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  await assertAdmin();
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const code = String(formData.get("code") ?? "").trim();
  const price = Number(formData.get("price") ?? 0);
  const imageUrl = String(formData.get("imageUrl") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const available = formData.get("available") === "on";
  const displayPrice = formData.get("displayPrice") === "on";
  const stocksRaw = String(formData.get("stocks") ?? "").trim();
  const stocks = stocksRaw === "" ? null : Number(stocksRaw);
  const categoryIds = formData.getAll("categoryIds").map(String);
  const galleryUrls = String(formData.get("galleryUrls") ?? "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

  if (!name || !code || !imageUrl) {
    return { error: "Name, code, and main image URL are required." };
  }
  if (!Number.isFinite(price) || price < 0) {
    return { error: "Price must be a non-negative number." };
  }

  const input: ProductInput = {
    name,
    code,
    description: description || null,
    price,
    available,
    stocks,
    imageUrl,
    displayPrice,
    categoryIds,
    galleryUrls,
  };

  try {
    if (id) {
      await updateProduct(id, input);
    } else {
      await createProduct(input);
    }
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to save" };
  }
  refresh();
  return { success: "Product saved." };
}

export async function deleteProductAction(formData: FormData): Promise<void> {
  await assertAdmin();
  const id = String(formData.get("id") ?? "");
  if (id) await deleteProduct(id);
  refresh();
}

// ---------------------------------------------------------------------------
// Featured products
// ---------------------------------------------------------------------------

export async function saveFeaturedAction(
  _prev: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  await assertAdmin();
  const productIds = formData.getAll("productIds").map(String);
  const orders = formData.getAll("orders").map((v) => Number(v) || 0);
  const entries = productIds
    .map((productId, i) => ({ productId, order: orders[i] ?? i }))
    .filter((e) => e.productId);
  await setFeaturedProducts(entries);
  refresh();
  return { success: "Featured products updated." };
}

// ---------------------------------------------------------------------------
// CSV import
// ---------------------------------------------------------------------------

export async function importCsvAction(
  _prev: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  await assertAdmin();
  const csv = String(formData.get("csv") ?? "").trim();
  if (!csv) return { error: "Paste CSV content first." };
  const result = await importProductsFromCsv(csv);
  refresh();
  const parts = [`Imported: ${result.imported}`, `Skipped: ${result.skipped}`];
  if (result.errors.length > 0) {
    parts.push(`Errors: ${result.errors.join(" | ")}`);
  }
  return { success: parts.join(" — ") };
}
