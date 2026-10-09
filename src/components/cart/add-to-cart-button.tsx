"use client";

import { useState } from "react";
import type { Product, ProductVariant } from "@/domain/product";
import { useCart } from "./cart-provider";
import { AddToCartModal } from "./add-to-cart-modal";

export function AddToCartButton({
  product,
  disabled,
}: {
  product: Product & { variants?: ProductVariant[] };
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const { setOpen: setCartOpen } = useCart();

  return (
    <>
      <button
        type="button"
        className="beary-btn btn rounded-full px-6"
        disabled={disabled}
        onClick={() => setOpen(true)}
      >
        {disabled ? "Out of stock" : "Add to cart"}
      </button>
      {open && (
        <AddToCartModal
          product={product}
          onClose={() => setOpen(false)}
          onAdded={() => setCartOpen(true)}
        />
      )}
    </>
  );
}
