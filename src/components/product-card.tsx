import Link from "next/link";
import { formatPeso, isOutOfStock, type Product } from "@/domain/product";

export function ProductCard({
  product,
}: {
  product: Product & { categories?: { name: string }[] };
}) {
  const outOfStock = isOutOfStock(product);
  const category = product.categories?.[0]?.name;

  return (
    <Link
      href={`/products/${product.slug}`}
      className={`group card beary-card overflow-hidden ${
        outOfStock ? "opacity-80" : ""
      }`}
    >
      <figure className="relative aspect-square overflow-hidden bg-gradient-to-br from-pink-100 via-rose-50 to-orange-50">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.imageUrl}
          alt={product.name}
          loading="lazy"
          className={`h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105 ${
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
        <span
          className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          aria-hidden
        />
      </figure>
      <div className="card-body gap-1.5 p-4">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-pink-950 transition-colors group-hover:text-beary-pink-dark">
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
    </Link>
  );
}
