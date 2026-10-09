"use client";

import Dexie, { type Table } from "dexie";
import type { Cart, CartItem, CustomerMeta, OrderHistory } from "./types";

/**
 * Browser-only local database (cart, order history, customer meta). Never
 * import this from server components or server actions.
 */
export class BearyLocalDB extends Dexie {
  carts!: Table<Cart, number>;
  cartItems!: Table<CartItem, number>;
  orderHistory!: Table<OrderHistory, number>;
  customerMeta!: Table<CustomerMeta, number>;

  constructor() {
    super("beary-baby");
    this.version(1).stores({
      carts: "++id, createdAt, updatedAt",
      cartItems: "++id, cartId, productId, variantId",
      orderHistory: "++id, serverOrderId, createdAt",
      customerMeta: "id",
    });
  }
}

let db: BearyLocalDB | null = null;

export function getLocalDB(): BearyLocalDB {
  if (typeof window === "undefined") {
    throw new Error("The local database is only available in the browser.");
  }
  if (!db) {
    db = new BearyLocalDB();
  }
  return db;
}
