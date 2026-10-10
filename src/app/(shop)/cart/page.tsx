"use client";

import Link from "next/link";
import { useState } from "react";
import { formatPeso } from "@/domain/product";
import { useCart } from "@/components/cart/cart-provider";

export default function CartPage() {
  const { items, subtotal, updateQuantity, removeItem, removeItems } = useCart();
  const [selected, setSelected] = useState<Set<number>>(new Set());

  function toggle(id: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function deleteSelected() {
    await removeItems([...selected]);
    setSelected(new Set());
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-pink-900">Your cart</h1>
        <Link
          href="/products"
          className="text-sm font-semibold text-beary-pink-deep hover:underline"
        >
          Continue shopping
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-pink-100 bg-white py-16 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/beary.ico" alt="" className="h-12 w-12 rounded-full" aria-hidden />
          <p className="text-sm text-pink-500">Your cart is empty.</p>
          <Link href="/products" className="beary-btn btn rounded-full px-6">
            Browse products
          </Link>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <label className="label cursor-pointer gap-2">
              <input
                type="checkbox"
                className="checkbox checkbox-primary checkbox-sm"
                checked={selected.size === items.length && items.length > 0}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelected(new Set(items.map((i) => i.id!)));
                  } else {
                    setSelected(new Set());
                  }
                }}
              />
              <span className="label-text text-pink-700">Select all</span>
            </label>
            {selected.size > 0 && (
              <button
                type="button"
                className="btn btn-ghost btn-sm text-error"
                onClick={deleteSelected}
              >
                Delete selected ({selected.size})
              </button>
            )}
          </div>

          <ul className="flex flex-col gap-3">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex items-center gap-3 rounded-2xl border border-pink-100 bg-white p-3"
              >
                <input
                  type="checkbox"
                  className="checkbox checkbox-primary checkbox-sm shrink-0"
                  checked={selected.has(item.id!)}
                  onChange={() => toggle(item.id!)}
                  aria-label={`Select ${item.name}`}
                />
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-pink-50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 font-semibold text-pink-950">
                    {item.name}
                  </p>
                  {item.variantLabel && (
                    <p className="text-xs text-pink-500">{item.variantLabel}</p>
                  )}
                  <p className="text-sm font-bold text-beary-pink-deep">
                    {formatPeso(item.unitPrice)}
                  </p>
                </div>
                <div className="join">
                  <button
                    type="button"
                    className="btn join-item btn-xs"
                    onClick={() => updateQuantity(item.id!, item.quantity - 1)}
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <span className="join-item flex min-w-8 items-center justify-center border-y border-pink-100 px-2 text-sm">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    className="btn join-item btn-xs"
                    onClick={() => updateQuantity(item.id!, item.quantity + 1)}
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
                <button
                  type="button"
                  className="btn btn-ghost btn-xs text-error"
                  onClick={() => removeItem(item.id!)}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>

          <div className="flex flex-col items-end gap-3 rounded-2xl border border-pink-100 bg-white p-4">
            <div className="flex items-center gap-3">
              <span className="text-sm text-pink-500">Subtotal</span>
              <span className="text-xl font-extrabold text-pink-900">
                {formatPeso(subtotal)}
              </span>
            </div>
            <Link href="/checkout" className="beary-btn btn rounded-full px-8">
              Proceed to checkout
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
