"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import type { Category } from "@/domain/product";

const SORT_OPTIONS = [
  { value: "", label: "Newest" },
  { value: "name-asc", label: "Name A → Z" },
  { value: "name-desc", label: "Name Z → A" },
  { value: "price-asc", label: "Price low → high" },
  { value: "price-desc", label: "Price high → low" },
  { value: "category-asc", label: "Category A → Z" },
  { value: "category-desc", label: "Category Z → A" },
];

export function ProductFilters({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const setParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(key, value);
      else params.delete(key);
      params.delete("page"); // reset pagination on filter change
      router.push(`/products${params.toString() ? `?${params}` : ""}`);
    },
    [router, searchParams],
  );

  const q = searchParams.get("q") ?? "";
  const category = searchParams.get("category") ?? "";
  const min = searchParams.get("min") ?? "";
  const max = searchParams.get("max") ?? "";
  const sort = searchParams.get("sort") ?? "";

  const fieldClass =
    "input input-sm w-full rounded-xl border-pink-200/80 bg-white/80 focus:border-pink-400 focus:outline-none";
  const selectClass =
    "select select-sm w-full rounded-xl border-pink-200/80 bg-white/80 focus:border-pink-400 focus:outline-none";
  const labelClass = "flex flex-col gap-1.5";

  return (
    <div className="beary-glass rounded-3xl p-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <label className={labelClass}>
          <span className="text-xs font-bold uppercase tracking-wider text-beary-pink-dark">
            Search
          </span>
          <input
            type="search"
            defaultValue={q}
            placeholder="Product name…"
            className={fieldClass}
            onKeyDown={(e) => {
              if (e.key === "Enter") setParam("q", (e.target as HTMLInputElement).value);
            }}
            onBlur={(e) => setParam("q", e.target.value)}
          />
        </label>
        <label className={labelClass}>
          <span className="text-xs font-bold uppercase tracking-wider text-beary-pink-dark">
            Category
          </span>
          <select
            value={category}
            onChange={(e) => setParam("category", e.target.value)}
            className={selectClass}
          >
            <option value="">All</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className={labelClass}>
          <span className="text-xs font-bold uppercase tracking-wider text-beary-pink-dark">
            Price range (₱)
          </span>
          <div className="flex gap-1">
            <input
              type="number"
              min={0}
              defaultValue={min}
              placeholder="Min"
              className={fieldClass}
              onBlur={(e) => setParam("min", e.target.value)}
            />
            <input
              type="number"
              min={0}
              defaultValue={max}
              placeholder="Max"
              className={fieldClass}
              onBlur={(e) => setParam("max", e.target.value)}
            />
          </div>
        </label>
        <label className={labelClass}>
          <span className="text-xs font-bold uppercase tracking-wider text-beary-pink-dark">
            Sort by
          </span>
          <select
            value={sort}
            onChange={(e) => setParam("sort", e.target.value)}
            className={selectClass}
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}
