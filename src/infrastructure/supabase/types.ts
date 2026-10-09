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
  image_provider: string | null;
  image_upload_id: string | null;
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
  is_preorder: boolean;
  image_provider: string | null;
  image_upload_id: string | null;
  price_range: string | null;
  created_at: string;
  updated_at: string;
};

export type ProductGalleryRow = {
  id: string;
  product_id: string;
  image_url: string;
  image_provider: string | null;
  image_upload_id: string | null;
  order: number;
};

export type ProductVariantRow = {
  id: string;
  product_id: string;
  label: string;
  sku: string | null;
  price: number | null;
  stocks: number | null;
  available: boolean;
  order: number;
  created_at: string;
  updated_at: string;
};

export type UploadRow = {
  id: string;
  provider: string;
  upload_id: string;
  image_url: string;
  display_url: string | null;
  thumb_url: string | null;
  delete_url: string | null;
  mime: string | null;
  width: number | null;
  height: number | null;
  size_bytes: number | null;
  original_name: string | null;
  created_at: string;
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

export type OrderRow = {
  id: string;
  customer_name: string;
  note: string | null;
  status: string;
  total: number;
  created_at: string;
  updated_at: string;
};

export type OrderItemRow = {
  id: string;
  order_id: string;
  product_id: string | null;
  variant_id: string | null;
  product_name: string;
  variant_label: string | null;
  unit_price: number;
  quantity: number;
  note: string | null;
  created_at: string;
};
