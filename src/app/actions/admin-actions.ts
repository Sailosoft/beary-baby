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
  type VariantInput,
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

type ImageMeta = { url: string; provider: string; uploadId: string };

function parseImageMeta(raw: unknown): ImageMeta | null {
  const value = String(raw ?? "").trim();
  if (!value) return null;
  try {
    const obj = JSON.parse(value) as Partial<ImageMeta>;
    if (
      obj &&
      typeof obj.url === "string" &&
      typeof obj.provider === "string"
    ) {
      return {
        url: obj.url,
        provider: obj.provider,
        uploadId: typeof obj.uploadId === "string" ? obj.uploadId : "",
      };
    }
  } catch {
    // Malformed metadata — fall back to external URL (no provider).
  }
  return null;
}

function parseGalleryMeta(raw: unknown): Map<string, ImageMeta> {
  const value = String(raw ?? "").trim();
  const map = new Map<string, ImageMeta>();
  if (!value) return map;
  try {
    const arr = JSON.parse(value) as Partial<ImageMeta>[];
    if (Array.isArray(arr)) {
      for (const item of arr) {
        if (
          item &&
          typeof item.url === "string" &&
          typeof item.provider === "string"
        ) {
          map.set(item.url, {
            url: item.url,
            provider: item.provider,
            uploadId: typeof item.uploadId === "string" ? item.uploadId : "",
          });
        }
      }
    }
  } catch {
    // Ignore malformed gallery metadata.
  }
  return map;
}

function parseVariants(raw: unknown): VariantInput[] {
  const value = String(raw ?? "").trim();
  if (!value) return [];
  let arr: unknown;
  try {
    arr = JSON.parse(value);
  } catch {
    return [];
  }
  if (!Array.isArray(arr)) return [];

  const toNullableNumber = (input: unknown): number | null => {
    if (input === null || input === undefined || input === "") return null;
    const n = Number(input);
    return Number.isFinite(n) ? n : null;
  };

  return arr
    .map((item, index) => {
      const row = item as Record<string, unknown>;
      return {
        label: String(row.label ?? "").trim(),
        sku: row.sku ? String(row.sku).trim() : null,
        price: toNullableNumber(row.price),
        stocks: toNullableNumber(row.stocks),
        available: row.available !== false,
        order:
          typeof row.order === "number" && Number.isFinite(row.order)
            ? row.order
            : index,
      };
    })
    .filter((variant) => variant.label);
}

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

  const imageMeta = parseImageMeta(formData.get("imageMeta"));
  const imageProvider =
    imageMeta && imageMeta.url === imageUrl ? imageMeta.provider : null;
  const imageUploadId =
    imageMeta && imageMeta.url === imageUrl ? imageMeta.uploadId : null;

  try {
    if (id) {
      await updateCategory(id, {
        name,
        imageUrl: imageUrl || null,
        imageProvider,
        imageUploadId,
        order,
      });
    } else {
      await createCategory({
        name,
        imageUrl: imageUrl || null,
        imageProvider,
        imageUploadId,
        order,
      });
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
  const isPreorder = formData.get("isPreorder") === "on";
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

  const imageMeta = parseImageMeta(formData.get("imageMeta"));
  const imageProvider =
    imageMeta && imageMeta.url === imageUrl ? imageMeta.provider : null;
  const imageUploadId =
    imageMeta && imageMeta.url === imageUrl ? imageMeta.uploadId : null;
  const galleryMeta = parseGalleryMeta(formData.get("galleryMeta"));
  const galleryImages = galleryUrls.map((url) => {
    const meta = galleryMeta.get(url);
    return {
      url,
      provider: meta?.provider ?? null,
      uploadId: meta?.uploadId ?? null,
    };
  });

  const variants = parseVariants(formData.get("variants"));

  const input: ProductInput = {
    name,
    code,
    description: description || null,
    price,
    available,
    stocks,
    imageUrl,
    displayPrice,
    isPreorder,
    imageProvider,
    imageUploadId,
    categoryIds,
    galleryImages,
    variants,
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
