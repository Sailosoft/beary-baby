export type CartItem = {
  id?: number;
  cartId: number;
  productId: string;
  variantId: string | null;
  variantLabel: string | null;
  name: string;
  imageUrl: string;
  unitPrice: number;
  quantity: number;
  note?: string | null;
  createdAt: number;
};

export type Cart = {
  id?: number;
  name?: string | null;
  createdAt: number;
  updatedAt: number;
};

export type OrderHistoryItem = {
  name: string;
  variantLabel: string | null;
  unitPrice: number;
  quantity: number;
  note?: string | null;
};

export type OrderHistory = {
  id?: number;
  serverOrderId: string;
  customerName: string;
  total: number;
  status: string;
  createdAt: number;
  items: OrderHistoryItem[];
};

export type CustomerMeta = {
  id?: number;
  name: string;
  updatedAt: number;
};
