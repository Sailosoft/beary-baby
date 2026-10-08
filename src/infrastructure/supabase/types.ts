import "server-only";

/**
 * Row types matching the manual migration (drizzle/0000_init.sql).
 * Used with the Supabase client's generic query results.
 */

export type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  order: number;
  created_at: string;
  updated_at: string;
};

export type ProductRow = {
  id: string;
  slug: string;
  name: string;
  code: string;
  description: string | null;
  price: number;
  available: boolean;
  stocks: number | null;
  image_url: string;
  display_price: boolean;
  created_at: string;
  updated_at: string;
};

export type ProductGalleryRow = {
  id: string;
  product_id: string;
  image_url: string;
  order: number;
};

export type FeatureProductRow = {
  id: string;
  order: number;
  product_id: string;
};

export type ProductCategoryRow = {
  product_id: string;
  category_id: string;
};
