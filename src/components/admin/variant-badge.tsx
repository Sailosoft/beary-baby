"use client";

import { useEffect, useRef, useState } from "react";
import {
  effectiveVariantPrice,
  formatPeso,
  variantIsOutOfStock,
  type ProductVariant,
} from "@/domain/product";

export function VariantBadge({
  variants,
  basePrice,
}: {
  variants: ProductVariant[];
  basePrice: number;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  if (variants.length === 0) return null;

  return (
    <div ref={ref} className="relative inline-flex">
      <button
        type="button"
        aria-label={`${variants.length} variant${variants.length === 1 ? "" : "s"}`}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="badge badge-secondary badge-sm rounded-full cursor-pointer select-none font-semibold"
      >
        {variants.length}
      </button>
      {open && (
        <div className="absolute left-0 top-full z-20 mt-2 w-64 rounded-box border border-pink-100 bg-white p-3 text-left shadow-lg">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-pink-400">
            Variants ({variants.length})
          </p>
          <ul className="flex flex-col gap-2">
            {variants.map((v) => {
              const out = variantIsOutOfStock(v);
              return (
                <li key={v.id} className="flex flex-col gap-0.5 text-xs">
                  <span className="flex items-center justify-between gap-2">
                    <span className="font-medium text-pink-900">{v.label}</span>
                    <span className="font-semibold text-pink-700">
                      {formatPeso(effectiveVariantPrice(v, { price: basePrice }))}
                    </span>
                  </span>
                  <span className="flex items-center justify-between gap-2 text-pink-400">
                    <span>
                      {v.stocks === null || v.stocks === undefined
                        ? "Unlimited"
                        : `${v.stocks} in stock`}
                    </span>
                    <span className={out ? "text-error" : "text-success"}>
                      {out ? "Out of stock" : "Available"}
                    </span>
                  </span>
                  {v.sku && (
                    <span className="font-mono text-[10px] text-pink-300">
                      {v.sku}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
