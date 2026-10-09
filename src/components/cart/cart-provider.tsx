"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { getLocalDB } from "@/infrastructure/local/db";
import type { CartItem } from "@/infrastructure/local/types";

const CART_ID = 1;

export type AddItemInput = {
  productId: string;
  variantId?: string | null;
  variantLabel?: string | null;
  name: string;
  imageUrl: string;
  unitPrice: number;
  quantity?: number;
  note?: string | null;
};

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotal: number;
  open: boolean;
  setOpen: (open: boolean) => void;
  addItem: (input: AddItemInput) => Promise<void>;
  updateQuantity: (id: number, quantity: number) => Promise<void>;
  removeItem: (id: number) => Promise<void>;
  removeItems: (ids: number[]) => Promise<void>;
  clear: () => Promise<void>;
  customerName: string;
  customerNameLoaded: boolean;
  setCustomerName: (name: string) => Promise<void>;
  clearCustomerName: () => Promise<void>;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  const items = useLiveQuery<CartItem[], CartItem[]>(
    async () => {
      if (typeof window === "undefined") return [];
      return getLocalDB().cartItems.where("cartId").equals(CART_ID).toArray();
    },
    [],
    [],
  );

  const customerMeta = useLiveQuery(
    async () => {
      if (typeof window === "undefined") return null;
      return (await getLocalDB().customerMeta.get(1)) ?? null;
    },
    [],
    undefined,
  );

  const addItem = useCallback(async (input: AddItemInput) => {
    const db = getLocalDB();
    const quantity = Math.max(1, Math.floor(input.quantity ?? 1));
    const variantId = input.variantId ?? null;
    const existing = (
      await db.cartItems.where("cartId").equals(CART_ID).toArray()
    ).find(
      (item) =>
        item.productId === input.productId &&
        (item.variantId ?? null) === variantId,
    );
    if (existing?.id != null) {
      await db.cartItems.update(existing.id, {
        quantity: existing.quantity + quantity,
      });
    } else {
      await db.cartItems.add({
        cartId: CART_ID,
        productId: input.productId,
        variantId,
        variantLabel: input.variantLabel ?? null,
        name: input.name,
        imageUrl: input.imageUrl,
        unitPrice: input.unitPrice,
        quantity,
        note: input.note ?? null,
        createdAt: Date.now(),
      });
    }
  }, []);

  const updateQuantity = useCallback(async (id: number, quantity: number) => {
    const db = getLocalDB();
    if (quantity <= 0) {
      await db.cartItems.delete(id);
      return;
    }
    await db.cartItems.update(id, { quantity: Math.floor(quantity) });
  }, []);

  const removeItem = useCallback(async (id: number) => {
    await getLocalDB().cartItems.delete(id);
  }, []);

  const removeItems = useCallback(async (ids: number[]) => {
    await getLocalDB().cartItems.bulkDelete(ids);
  }, []);

  const clear = useCallback(async () => {
    await getLocalDB().cartItems.where("cartId").equals(CART_ID).delete();
  }, []);

  const setCustomerName = useCallback(async (name: string) => {
    await getLocalDB().customerMeta.put({
      id: 1,
      name: name.trim(),
      updatedAt: Date.now(),
    });
  }, []);

  const clearCustomerName = useCallback(async () => {
    await getLocalDB().customerMeta.delete(1);
  }, []);

  const count = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items],
  );
  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
    [items],
  );
  const value: CartContextValue = {
    items,
    count,
    subtotal,
    open,
    setOpen,
    addItem,
    updateQuantity,
    removeItem,
    removeItems,
    clear,
    customerName: customerMeta?.name ?? "",
    customerNameLoaded: customerMeta !== undefined,
    setCustomerName,
    clearCustomerName,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return ctx;
}
