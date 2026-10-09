"use client";

import { useState } from "react";
import {
  computePriceRange,
  formatPeso,
  type ProductVariant,
} from "@/domain/product";

type VariantRow = {
  key: string;
  label: string;
  sku: string;
  price: string;
  stocks: string;
  available: boolean;
};

let keyCounter = 0;
function nextKey(): string {
  keyCounter += 1;
  return `variant-${keyCounter}`;
}

function toRow(variant: ProductVariant): VariantRow {
  return {
    key: nextKey(),
    label: variant.label,
    sku: variant.sku ?? "",
    price: variant.price === null || variant.price === undefined ? "" : String(variant.price),
    stocks:
      variant.stocks === null || variant.stocks === undefined
        ? ""
        : String(variant.stocks),
    available: variant.available,
  };
}

export function VariantEditor({
  initialVariants = [],
  basePrice,
  displayPrice,
}: {
  initialVariants?: ProductVariant[];
  basePrice: number;
  displayPrice: boolean;
}) {
  const [rows, setRows] = useState<VariantRow[]>(() =>
    initialVariants.map(toRow),
  );

  function update(index: number, patch: Partial<VariantRow>) {
    setRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, ...patch } : row)),
    );
  }

  function addRow() {
    setRows((prev) => [
      ...prev,
      { key: nextKey(), label: "", sku: "", price: "", stocks: "", available: true },
    ]);
  }

  function removeRow(index: number) {
    setRows((prev) => prev.filter((_, i) => i !== index));
  }

  const serialized = rows
    .map((row, index) => ({
      label: row.label.trim(),
      sku: row.sku.trim() || null,
      price: row.price.trim() === "" ? null : Number(row.price),
      stocks: row.stocks.trim() === "" ? null : Number(row.stocks),
      available: row.available,
      order: index,
    }))
    .filter((row) => row.label);

  const previewVariants = serialized.map((row, index) => ({
    id: "",
    productId: "",
    label: row.label,
    sku: row.sku,
    price: Number.isFinite(row.price) ? row.price : null,
    stocks: Number.isFinite(row.stocks) ? row.stocks : null,
    available: row.available,
    order: index,
  }));

  const range = computePriceRange(
    { price: basePrice, displayPrice },
    previewVariants,
  );

  return (
    <fieldset className="border border-pink-100 rounded-box p-4 min-w-0">
      <legend className="text-xs text-pink-700 px-1">
        Variants (optional)
      </legend>
      <div className="flex flex-col gap-3">
        {rows.map((row, index) => (
          <div
            key={row.key}
            className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-end border-b border-pink-50 pb-3 sm:border-0 sm:pb-0"
          >
            <label className="form-control sm:col-span-3 min-w-0">
              <span className="label-text text-xs text-pink-600">Label *</span>
              <input
                value={row.label}
                onChange={(e) => update(index, { label: e.target.value })}
                placeholder="e.g. Small"
                className="input input-bordered input-sm bg-white w-full"
              />
            </label>
            <label className="form-control sm:col-span-2 min-w-0">
              <span className="label-text text-xs text-pink-600">SKU</span>
              <input
                value={row.sku}
                onChange={(e) => update(index, { sku: e.target.value })}
                className="input input-bordered input-sm bg-white w-full"
              />
            </label>
            <label className="form-control sm:col-span-2 min-w-0">
              <span className="label-text text-xs text-pink-600">
                Price (₱, blank=base)
              </span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={row.price}
                onChange={(e) => update(index, { price: e.target.value })}
                className="input input-bordered input-sm bg-white w-full"
              />
            </label>
            <label className="form-control sm:col-span-2 min-w-0">
              <span className="label-text text-xs text-pink-600">
                Stocks (blank=∞)
              </span>
              <input
                type="number"
                min="0"
                value={row.stocks}
                onChange={(e) => update(index, { stocks: e.target.value })}
                className="input input-bordered input-sm bg-white w-full"
              />
            </label>
            <label className="label cursor-pointer justify-start gap-2 sm:col-span-2">
              <input
                type="checkbox"
                checked={row.available}
                onChange={(e) => update(index, { available: e.target.checked })}
                className="toggle toggle-primary toggle-xs"
              />
              <span className="label-text text-xs">Available</span>
            </label>
            <div className="sm:col-span-1">
              <button
                type="button"
                onClick={() => removeRow(index)}
                className="btn btn-ghost btn-xs text-error"
                aria-label="Remove variant"
              >
                ✕
              </button>
            </div>
          </div>
        ))}

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={addRow}
            className="btn btn-ghost btn-xs w-fit text-beary-pink-deep"
          >
            + Add variant
          </button>
          {serialized.length > 0 && (
            <span className="text-xs text-pink-500">
              {range ? (
                <>
                  Price range:{" "}
                  <span className="font-semibold">{range}</span>
                </>
              ) : (
                <>
                  All variants share {formatPeso(basePrice)} (no range shown).
                </>
              )}
            </span>
          )}
        </div>
      </div>

      <input
        type="hidden"
        name="variants"
        value={JSON.stringify(serialized)}
        readOnly
      />
    </fieldset>
  );
}
