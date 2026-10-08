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
  createdAt: Date;
  updatedAt: Date;
};

export type ProductGallery = {
  id: string;
  productId: string;
  imageUrl: string;
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
