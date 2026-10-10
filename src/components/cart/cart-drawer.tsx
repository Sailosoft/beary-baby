"use client";

import Link from "next/link";
import { formatPeso } from "@/domain/product";
import { useCart } from "./cart-provider";

export function CartDrawer() {
  const { items, subtotal, open, setOpen, updateQuantity, removeItem } =
    useCart();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={() => setOpen(false)}
        aria-hidden
      />
      <aside className="relative z-10 flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-pink-100 p-4">
          <h2 className="text-lg font-extrabold text-pink-900">Your cart</h2>
          <button
            type="button"
            className="btn btn-circle btn-sm btn-ghost"
            onClick={() => setOpen(false)}
            aria-label="Close cart"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/beary.ico" alt="" className="h-12 w-12 rounded-full" aria-hidden />
              <p className="text-sm text-pink-500">Your cart is empty.</p>
              <Link
                href="/products"
                className="beary-btn btn btn-sm rounded-full px-5"
                onClick={() => setOpen(false)}
              >
                Browse products
              </Link>
            </div>
          ) : (
            <ul className="flex flex-col gap-3">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="flex gap-3 rounded-2xl border border-pink-100 p-3"
                >
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-pink-50">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <p className="line-clamp-2 text-sm font-semibold text-pink-950">
                      {item.name}
                    </p>
                    {item.variantLabel && (
                      <p className="text-xs text-pink-500">{item.variantLabel}</p>
                    )}
                    <p className="text-sm font-bold text-beary-pink-deep">
                      {formatPeso(item.unitPrice)}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <div className="join">
                        <button
                          type="button"
                          className="btn join-item btn-xs"
                          onClick={() =>
                            updateQuantity(item.id!, item.quantity - 1)
                          }
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
                          onClick={() =>
                            updateQuantity(item.id!, item.quantity + 1)
                          }
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
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-pink-100 p-4">
            <div className="mb-3 flex items-center justify-between text-sm">
              <span className="text-pink-500">Subtotal</span>
              <span className="text-lg font-extrabold text-pink-900">
                {formatPeso(subtotal)}
              </span>
            </div>
            <Link
              href="/checkout"
              className="beary-btn btn w-full rounded-full"
              onClick={() => setOpen(false)}
            >
              Proceed to checkout
            </Link>
            <button
              type="button"
              className="btn btn-ghost btn-sm mt-1 w-full rounded-full text-pink-500"
              onClick={() => setOpen(false)}
            >
              Continue shopping
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}
