"use client";

import { useEffect, useState } from "react";
import {
  effectiveVariantPrice,
  formatPeso,
  isOutOfStock,
  variantIsOutOfStock,
  type Product,
  type ProductVariant,
} from "@/domain/product";
import { useCart } from "./cart-provider";

export type CartProduct = Product & { variants?: ProductVariant[] };

export function AddToCartModal({
  product,
  onClose,
  onAdded,
}: {
  product: CartProduct;
  onClose: () => void;
  onAdded?: () => void;
}) {
  const { addItem } = useCart();
  const variants = product.variants ?? [];

  const [variantId, setVariantId] = useState<string | null>(
    variants.find((v) => !variantIsOutOfStock(v))?.id ?? variants[0]?.id ?? null,
  );
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const selected = variants.find((v) => v.id === variantId) ?? null;
  const unitPrice = selected
    ? effectiveVariantPrice(selected, product)
    : product.price;
  const unavailable = selected
    ? variantIsOutOfStock(selected)
    : isOutOfStock(product);

  async function submit() {
    if (unavailable) return;
    setPending(true);
    try {
      await addItem({
        productId: product.id,
        variantId: selected?.id ?? null,
        variantLabel: selected?.label ?? null,
        name: product.name,
        imageUrl: product.imageUrl,
        unitPrice,
        quantity,
        note: note.trim() || null,
      });
      onClose();
      onAdded?.();
    } finally {
      setPending(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-extrabold text-pink-900">Add to cart</h3>
          <button
            type="button"
            className="btn btn-circle btn-sm btn-ghost"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="flex gap-4">
          <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-pink-50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={product.imageUrl}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-pink-950">{product.name}</p>
            <p className="mt-1 text-lg font-extrabold text-beary-pink-deep">
              {product.displayPrice ? formatPeso(unitPrice) : "Price on inquiry"}
            </p>
          </div>
        </div>

        {variants.length > 0 && (
          <div className="mt-4">
            <span className="label-text text-pink-700">Variant</span>
            <div className="mt-1 flex flex-wrap gap-2">
              {variants.map((variant) => {
                const disabled = variantIsOutOfStock(variant);
                const active = variant.id === variantId;
                return (
                  <button
                    key={variant.id}
                    type="button"
                    disabled={disabled}
                    onClick={() => setVariantId(variant.id)}
                    className={`btn btn-sm rounded-full ${
                      active
                        ? "btn-primary"
                        : "btn-outline border-pink-200 text-pink-600"
                    } ${disabled ? "btn-disabled line-through opacity-50" : ""}`}
                  >
                    {variant.label}
                    {disabled ? " (out)" : ""}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-4 flex items-center gap-3">
          <span className="label-text text-pink-700">Qty</span>
          <div className="join">
            <button
              type="button"
              className="btn join-item btn-sm"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span className="join-item flex min-w-10 items-center justify-center border-y border-pink-100 px-3">
              {quantity}
            </span>
            <button
              type="button"
              className="btn join-item btn-sm"
              onClick={() => setQuantity((q) => q + 1)}
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
        </div>

        <label className="form-control mt-4">
          <span className="label-text text-pink-700">Note (optional)</span>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. gift wrap"
            className="input input-bordered bg-white w-full"
          />
        </label>

        <button
          type="button"
          className="beary-btn btn mt-5 w-full rounded-full"
          disabled={pending || unavailable}
          onClick={submit}
        >
          {pending ? (
            <span className="loading loading-spinner loading-sm" />
          ) : unavailable ? (
            "Out of stock"
          ) : (
            "Add to cart"
          )}
        </button>
      </div>
    </div>
  );
}
