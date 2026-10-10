import Link from "next/link";
import { Suspense } from "react";
import { listCategories } from "@/application/category-service";
import { listProducts, type ProductSort } from "@/application/product-service";
import { ProductCard } from "@/components/product-card";
import { ProductFilters } from "@/components/product-filters";
import { LoadMore } from "@/components/load-more";

type SearchParams = Promise<{
  q?: string;
  category?: string;
  min?: string;
  max?: string;
  sort?: string;
  page?: string;
}>;

const VALID_SORTS: ProductSort[] = [
  "name-asc",
  "name-desc",
  "price-asc",
  "price-desc",
  "category-asc",
  "category-desc",
];

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  return (
    <div className="flex flex-col">
      {/* Banner */}
      <section className="relative overflow-hidden beary-mesh border-b border-white/60">
        <div className="beary-noise" aria-hidden />
        <div
          className="beary-orb w-64 h-64 bg-pink-300/60 -top-16 -left-10 animate-float"
          aria-hidden
        />
        <div
          className="beary-orb w-72 h-72 bg-orange-200/50 -top-24 right-[-4rem] animate-float-slow [animation-delay:1.5s]"
          aria-hidden
        />
        <div className="relative max-w-6xl mx-auto px-4 py-12 sm:py-16 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/70 px-4 py-1.5 text-xs font-semibold text-beary-pink-deep shadow-sm backdrop-blur animate-fade-up">
            ✨ Tiny things, big smiles
          </span>
          <h1
            className="mt-4 text-4xl sm:text-5xl font-extrabold tracking-tight animate-fade-up"
            style={{ animationDelay: "100ms" }}
          >
            <span className="beary-gradient-text">Products</span>
          </h1>
          <p
            className="mt-3 max-w-lg mx-auto text-pink-700/90 animate-fade-up"
            style={{ animationDelay: "200ms" }}
          >
            Browse our handpicked collection of cozy, cute, and comfy finds for
            your little bear.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto w-full px-4 py-8 flex flex-col gap-6">
        <Suspense
          fallback={<div className="skeleton h-9 w-44 rounded-full bg-pink-100" />}
        >
          <FiltersSlot />
        </Suspense>

        <Suspense fallback={<ProductGridSkeleton />}>
          <ProductList searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}

async function FiltersSlot() {
  const [categories] = await Promise.all([listCategories()]);
  return <ProductFilters categories={categories} />;
}

async function ProductList({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const sort = VALID_SORTS.includes(sp.sort as ProductSort)
    ? (sp.sort as ProductSort)
    : undefined;
  const min = sp.min !== undefined && sp.min !== "" ? Number(sp.min) : undefined;
  const max = sp.max !== undefined && sp.max !== "" ? Number(sp.max) : undefined;

  const result = await listProducts({
    q: sp.q,
    categorySlug: sp.category,
    minPrice: Number.isFinite(min) ? min : undefined,
    maxPrice: Number.isFinite(max) ? max : undefined,
    sort,
    page,
    pageSize: 12,
  });

  if (result.items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-3xl border border-white/70 bg-white/70 py-20 text-center shadow-sm backdrop-blur">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-pink-100 via-rose-50 to-orange-100 p-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/beary.ico"
            alt=""
            className="h-full w-full rounded-full object-contain"
            aria-hidden
          />
        </div>
        <p className="text-lg font-bold text-pink-900">No products found</p>
        <p className="text-sm text-pink-500">
          Try different filters or search for another word.
        </p>
        <Link href="/products" className="beary-btn btn rounded-full px-6">
          Clear all filters
        </Link>
      </div>
    );
  }

  return (
    <>
      <p className="text-sm font-medium text-pink-600">
        Showing{" "}
        <span className="font-bold beary-text-gradient">{result.total}</span>{" "}
        {result.total === 1 ? "product" : "products"}
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-5">
        {result.items.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      <LoadMore hasMore={result.hasMore} page={page} />
    </>
  );
}

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="skeleton aspect-[3/4] rounded-3xl bg-pink-100" />
      ))}
    </div>
  );
}
