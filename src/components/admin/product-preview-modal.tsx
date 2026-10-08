"use client";

import { useEffect, useState } from "react";
import { GalleryCarousel } from "@/components/gallery-carousel";
import { formatPeso, isOutOfStock, type Product } from "@/domain/product";

export type PreviewProduct = Product & {
  categories?: { name: string }[];
  galleries: { id: string; productId: string; imageUrl: string; order: number }[];
};

export function ProductPreviewModal({
  product,
  onClose,
}: {
  product: PreviewProduct;
  onClose: () => void;
}) {
  const outOfStock = isOutOfStock(product);
  const category = product.categories?.[0]?.name;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold text-pink-900">
            Preview: {product.name}
          </h3>
          <button
            type="button"
            className="btn btn-circle btn-sm btn-ghost"
            onClick={onClose}
            aria-label="Close preview"
          >
            ✕
          </button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Store card preview */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-pink-400">
              Store card
            </p>
            <div
              className={`card beary-card overflow-hidden ${
                outOfStock ? "opacity-80" : ""
              }`}
            >
              <figure className="relative aspect-square overflow-hidden bg-gradient-to-br from-pink-100 via-rose-50 to-orange-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className={`h-full w-full object-cover ${
                    outOfStock ? "grayscale" : ""
                  }`}
                />
                {outOfStock ? (
                  <span className="absolute left-3 top-3 rounded-full bg-rose-500/90 px-3 py-1 text-[11px] font-bold text-white shadow">
                    Out of stock
                  </span>
                ) : (
                  category && (
                    <span className="absolute left-3 top-3 rounded-full bg-white/85 px-3 py-1 text-[11px] font-semibold text-beary-pink-deep backdrop-blur">
                      {category}
                    </span>
                  )
                )}
              </figure>
              <div className="card-body gap-1.5 p-4">
                <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-pink-950">
                  {product.name}
                </h3>
                {product.displayPrice ? (
                  <p className="text-base font-extrabold">
                    <span className="beary-text-gradient">
                      {formatPeso(product.price)}
                    </span>
                  </p>
                ) : (
                  <p className="text-sm text-pink-400">Price on inquiry</p>
                )}
              </div>
            </div>
          </div>

          {/* Gallery preview */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-pink-400">
              Product page gallery
            </p>
            <GalleryCarousel
              mainImage={product.imageUrl}
              galleries={product.galleries}
              alt={product.name}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProductPreviewButton({
  product,
}: {
  product: PreviewProduct;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="btn btn-ghost btn-xs"
        onClick={() => setOpen(true)}
      >
        Preview
      </button>
      {open && (
        <ProductPreviewModal product={product} onClose={() => setOpen(false)} />
      )}
    </>
  );
}
