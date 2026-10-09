import "server-only";
import Papa from "papaparse";
import { getSupabase } from "@/infrastructure/supabase/client";
import { createProduct, type ProductInput } from "./product-service";

export type ImportResult = {
  imported: number;
  skipped: number;
  errors: string[];
};

function parseBool(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined || value === "") return fallback;
  return ["true", "1", "yes", "y"].includes(value.toLowerCase());
}

function parseNumber(value: string | undefined): number | undefined {
  if (value === undefined || value === "") return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

/**
 * Batch import products from CSV (per spec: skip rows whose product code
 * already exists). Expected headers:
 * name, code, description, price, available, stocks, imageUrl, displayPrice, categories
 */
export async function importProductsFromCsv(csvText: string): Promise<ImportResult> {
  const parsed = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
  });

  const result: ImportResult = { imported: 0, skipped: 0, errors: [] };
  const supabase = getSupabase();

  // Preload existing codes to skip duplicates.
  const { data: existing, error: exErr } = await supabase
    .from("products")
    .select("code");
  if (exErr) throw exErr;
  const existingCodes = new Set(
    (existing as { code: string }[]).map((r) => r.code.toLowerCase()),
  );

  // Preload categories for name -> id mapping.
  const { data: catRows, error: catErr } = await supabase
    .from("categories")
    .select("id, name");
  if (catErr) throw catErr;
  const catByName = new Map(
    (catRows as { id: string; name: string }[]).map((c) => [
      c.name.toLowerCase(),
      c.id,
    ]),
  );

  for (const [index, raw] of parsed.data.entries()) {
    const line = index + 2; // header is line 1
    const name = raw.name?.trim();
    const code = raw.code?.trim();
    const price = parseNumber(raw.price);

    if (!name || !code || price === undefined) {
      result.errors.push(`Line ${line}: missing name, code, or price`);
      continue;
    }
    if (existingCodes.has(code.toLowerCase())) {
      result.skipped += 1;
      continue;
    }

    const categoryIds: string[] = [];
    if (raw.categories) {
      for (const catName of raw.categories.split(",")) {
        const id = catByName.get(catName.trim().toLowerCase());
        if (id) categoryIds.push(id);
      }
    }

    const input: ProductInput = {
      name,
      code,
      description: raw.description?.trim() || null,
      price,
      available: parseBool(raw.available, true),
      stocks: parseNumber(raw.stocks) ?? null,
      imageUrl: raw.imageUrl?.trim() || "",
      displayPrice: parseBool(raw.displayPrice, true),
      isPreorder: parseBool(raw.isPreorder, false),
      categoryIds,
      galleryImages: [],
      variants: [],
    };

    try {
      await createProduct(input);
      existingCodes.add(code.toLowerCase());
      result.imported += 1;
    } catch (err) {
      result.errors.push(
        `Line ${line}: ${err instanceof Error ? err.message : "failed"}`,
      );
    }
  }

  return result;
}
