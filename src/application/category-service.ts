import "server-only";
import { cacheTag } from "next/cache";
import { getSupabase } from "@/infrastructure/supabase/client";
import type { CategoryRow } from "@/infrastructure/supabase/types";
import { slugifyName } from "@/domain/category";
import type { Category } from "@/domain/product";

export type CategoryInput = {
  name: string;
  imageUrl?: string | null;
  order?: number;
};

function toCategory(row: CategoryRow): Category {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    imageUrl: row.image_url,
    order: row.order,
  };
}

export async function listCategories(): Promise<Category[]> {
  "use cache";
  cacheTag("catalog");
  const { data, error } = await getSupabase()
    .from("categories")
    .select("*")
    .order("order", { ascending: true })
    .order("name", { ascending: true });
  if (error) throw error;
  return (data as CategoryRow[]).map(toCategory);
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const { data, error } = await getSupabase()
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .limit(1);
  if (error) throw error;
  const row = (data as CategoryRow[])[0];
  return row ? toCategory(row) : null;
}

export async function getCategoryById(id: string): Promise<Category | null> {
  const { data, error } = await getSupabase()
    .from("categories")
    .select("*")
    .eq("id", id)
    .limit(1);
  if (error) throw error;
  const row = (data as CategoryRow[])[0];
  return row ? toCategory(row) : null;
}

export class SlugExistsError extends Error {
  constructor(slug: string) {
    super(`Slug "${slug}" already exists`);
    this.name = "SlugExistsError";
  }
}

export async function createCategory(input: CategoryInput): Promise<Category> {
  const slug = slugifyName(input.name);
  const existing = await getCategoryBySlug(slug);
  if (existing) {
    throw new SlugExistsError(slug);
  }
  const { data, error } = await getSupabase()
    .from("categories")
    .insert({
      name: input.name,
      slug,
      image_url: input.imageUrl ?? null,
      order: input.order ?? 0,
    })
    .select("*")
    .single();
  if (error) throw error;
  return toCategory(data as CategoryRow);
}

export async function updateCategory(
  id: string,
  input: CategoryInput,
): Promise<Category> {
  const slug = slugifyName(input.name);
  const existing = await getCategoryBySlug(slug);
  if (existing && existing.id !== id) {
    throw new SlugExistsError(slug);
  }
  const { data, error } = await getSupabase()
    .from("categories")
    .update({
      name: input.name,
      slug,
      image_url: input.imageUrl ?? null,
      order: input.order ?? 0,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return toCategory(data as CategoryRow);
}

export async function deleteCategory(id: string): Promise<void> {
  const { error } = await getSupabase().from("categories").delete().eq("id", id);
  if (error) throw error;
}
