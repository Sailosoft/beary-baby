/**
 * Domain: Product
 */

export type Product = {
  id: string;
  slug: string;
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
  priceRange?: string | null;
  variants?: ProductVariant[];
  createdAt: Date;
  updatedAt: Date;
};

export type ProductVariant = {
  id: string;
  productId: string;
  label: string;
  sku?: string | null;
  /** null => inherit the parent product price */
  price?: number | null;
  /** null => unlimited */
  stocks?: number | null;
  available: boolean;
  order: number;
};

export type ProductGallery = {
  id: string;
  productId: string;
  imageUrl: string;
  imageProvider?: string | null;
  imageUploadId?: string | null;
  order: number;
};

export type ProductWithCategories = Product & {
  categories: Category[];
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string | null;
  imageProvider?: string | null;
  imageUploadId?: string | null;
  order: number;
};

/**
 * Availability rules (per spec Q&A):
 * - Available=false -> out of stock, pushed to bottom
 * - Stocks=0 -> out of stock, pushed to bottom (stocks=0 always wins)
 * - Stocks=null -> behaves normally
 */
export function isOutOfStock(product: Pick<Product, "available" | "stocks">): boolean {
  if (!product.available) return true;
  if (product.stocks !== null && product.stocks !== undefined && product.stocks <= 0) {
    return true;
  }
  return false;
}

export function formatPeso(price: number): string {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(price);
}

/** Variant price, falling back to the parent product price when null. */
export function effectiveVariantPrice(
  variant: Pick<ProductVariant, "price">,
  product: Pick<Product, "price">,
): number {
  return variant.price ?? product.price;
}

/** Out of stock when unavailable or when stocks is a number <= 0. */
export function variantIsOutOfStock(
  variant: Pick<ProductVariant, "available" | "stocks">,
): boolean {
  if (!variant.available) return true;
  if (
    variant.stocks !== null &&
    variant.stocks !== undefined &&
    variant.stocks <= 0
  ) {
    return true;
  }
  return false;
}

/**
 * Cached display range: "₱min – ₱max" when variants have differing effective
 * prices, otherwise null (single price or "price on inquiry").
 */
export function computePriceRange(
  product: Pick<Product, "price" | "displayPrice">,
  variants: { price?: number | null }[],
): string | null {
  if (!product.displayPrice) return null;
  if (variants.length === 0) return null;
  const prices = variants.map((v) => effectiveVariantPrice(v, product));
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  if (min === max) return null;
  return `${formatPeso(min)} – ${formatPeso(max)}`;
}
