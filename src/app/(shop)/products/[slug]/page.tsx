import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getProductBySlug,
  getRelatedProducts,
} from "@/application/product-service";
import { formatPeso, isOutOfStock } from "@/domain/product";
import { GalleryCarousel } from "@/components/gallery-carousel";
import { ProductCard } from "@/components/product-card";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="skeleton h-96 bg-pink-100 rounded-3xl max-w-6xl mx-auto" />
      }
    >
      <ProductDetail params={params} />
    </Suspense>
  );
}

async function ProductDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = await getRelatedProducts(product.id);
  const outOfStock = isOutOfStock(product);

  return (
    <div className="relative overflow-hidden">
      <div
        className="beary-orb w-72 h-72 bg-pink-200/50 -top-24 right-[-4rem] animate-float-slow"
        aria-hidden
      />
      <div className="relative max-w-6xl mx-auto px-4 py-8 flex flex-col gap-10">
        <nav className="text-sm text-pink-500">
          <ul className="flex flex-wrap items-center gap-2">
            <li>
              <Link href="/" className="transition-colors hover:text-beary-pink-dark">
                Home
              </Link>
            </li>
            <li aria-hidden className="text-pink-300">
              /
            </li>
            <li>
              <Link
                href="/products"
                className="transition-colors hover:text-beary-pink-dark"
              >
                Products
              </Link>
            </li>
            <li aria-hidden className="text-pink-300">
              /
            </li>
            <li className="font-semibold text-pink-800">{product.name}</li>
          </ul>
        </nav>

        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          <GalleryCarousel
            mainImage={product.imageUrl}
            galleries={product.galleries}
            alt={product.name}
          />

          <div className="flex flex-col gap-4 beary-glass rounded-3xl p-6 sm:p-8">
            {product.categories.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {product.categories.map((c) => (
                  <Link
                    key={c.id}
                    href={`/products?category=${c.slug}`}
                    className="rounded-full border border-pink-200 bg-white/70 px-3 py-1 text-xs font-semibold text-beary-pink-deep transition-colors hover:border-pink-300 hover:bg-white"
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
            )}

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-pink-950">
              {product.name}
            </h1>

            {product.displayPrice ? (
              <p className="text-3xl font-extrabold">
                <span className="beary-text-gradient">
                  {formatPeso(product.price)}
                </span>
              </p>
            ) : (
              <p className="text-lg text-pink-400">Price on inquiry</p>
            )}

            {outOfStock && (
              <span className="w-fit rounded-full bg-rose-500/90 px-4 py-1.5 text-xs font-bold text-white shadow-md shadow-rose-200">
                Out of stock
              </span>
            )}

            <div
              className="h-px w-full bg-gradient-to-r from-pink-200 via-rose-200 to-transparent"
              aria-hidden
            />

            {product.description && (
              <div className="prose prose-sm max-w-none text-pink-800">
                <p className="whitespace-pre-line">{product.description}</p>
              </div>
            )}
          </div>
        </div>

        {related.length > 0 && (
          <section>
            <div className="mb-6 flex flex-col items-center text-center">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-beary-pink-dark">
                Keep exploring
              </span>
              <h2 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
                <span className="beary-gradient-text">You may also like</span>
              </h2>
              <div
                className="mt-4 h-1 w-24 rounded-full bg-gradient-to-r from-pink-400 via-rose-400 to-orange-300"
                aria-hidden
              />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-5">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
