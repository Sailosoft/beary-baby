import Link from "next/link";
import { Suspense } from "react";
import { listCategories } from "@/application/category-service";
import { getFeaturedProducts } from "@/application/product-service";
import { ProductCard } from "@/components/product-card";

const HIGHLIGHTS: { icon?: string; img?: string; label: string }[] = [
  { img: "/beary.ico", label: "Cute stuff" },
  { icon: "🗂️", label: "Office finds" },
  { icon: "🛍️", label: "Great deals" },
];

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden beary-mesh">
        <div className="beary-noise" aria-hidden />
        <div
          className="beary-orb w-72 h-72 bg-pink-300/70 -top-20 -left-16 animate-float"
          aria-hidden
        />
        <div
          className="beary-orb w-96 h-96 bg-orange-200/60 -top-24 right-[-6rem] animate-float-slow [animation-delay:1.5s]"
          aria-hidden
        />
        <div
          className="beary-orb w-80 h-80 bg-violet-300/50 bottom-[-10rem] left-1/3 animate-float [animation-delay:3s]"
          aria-hidden
        />

        <div className="relative max-w-6xl mx-auto px-4 pt-16 pb-20 sm:pt-24 sm:pb-28 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/70 px-4 py-1.5 text-xs font-semibold text-beary-pink-deep shadow-sm backdrop-blur animate-fade-up">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/beary.ico" alt="" className="h-4 w-4 rounded-full" aria-hidden />
            Cute stuff & office finds
          </span>

          <div className="mt-8 flex justify-center animate-fade-up" style={{ animationDelay: "80ms" }}>
            <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-white/70 shadow-lg shadow-pink-200/60 ring-8 ring-white/50 backdrop-blur animate-float">
              <span className="absolute inset-0 rounded-full bg-gradient-to-br from-pink-300/40 to-orange-200/40 animate-pulse-ring" aria-hidden />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/beary.ico"
                alt=""
                className="relative h-16 w-16 rounded-full object-contain"
                aria-hidden
              />
            </div>
          </div>

          <h1
            className="mt-6 text-4xl sm:text-6xl font-extrabold tracking-tight animate-fade-up"
            style={{ animationDelay: "160ms" }}
          >
            <span className="beary-gradient-text">Welcome to Beary Baby</span>
          </h1>

          <p
            className="mt-5 max-w-xl mx-auto text-lg text-pink-700/90 animate-fade-up"
            style={{ animationDelay: "240ms" }}
          >
            Your one-stop shop for cute stuff and office essentials —
            from adorable finds to desk-ready supplies.
          </p>

          <div
            className="mt-8 flex flex-col sm:flex-row flex-wrap justify-center gap-3 animate-fade-up"
            style={{ animationDelay: "320ms" }}
          >
            <Link
              href="/products"
              className="beary-btn btn w-full sm:w-auto rounded-full px-8"
            >
              Shop Products
            </Link>
            <a
              href="#categories"
              className="btn w-full sm:w-auto rounded-full border-pink-200 bg-white/70 px-8 text-pink-700 backdrop-blur hover:border-pink-300 hover:bg-white"
            >
              Browse Categories
            </a>
          </div>

          <ul
            className="mt-10 flex flex-wrap justify-center gap-3 animate-fade-up"
            style={{ animationDelay: "400ms" }}
          >
            {HIGHLIGHTS.map((item) => (
              <li
                key={item.label}
                className="flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-sm font-medium text-pink-800 shadow-sm ring-1 ring-white/80 backdrop-blur"
              >
                <span aria-hidden>
                  {item.img ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.img} alt="" className="h-4 w-4 rounded-full" />
                  ) : (
                    item.icon
                  )}
                </span>
                {item.label}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Featured products */}
      <section className="max-w-6xl mx-auto w-full px-4 py-14">
        <SectionHeader
          eyebrow="Customer favorites"
          title="Featured Products"
          subtitle="Handpicked picks that shoppers love."
        />
        <Suspense fallback={<FeaturedSkeleton />}>
          <FeaturedSection />
        </Suspense>
      </section>

      {/* Categories */}
      <section id="categories" className="max-w-6xl mx-auto w-full px-4 pb-20">
        <SectionHeader
          eyebrow="Browse by collection"
          title="Categories"
          subtitle="Browse our collections of cute finds and office essentials."
        />
        <Suspense fallback={<CategorySkeleton />}>
          <CategorySection />
        </Suspense>
      </section>
    </div>
  );
}

function SectionHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-8 flex flex-col items-center text-center">
      <span className="text-xs font-bold uppercase tracking-[0.2em] text-beary-pink-dark">
        {eyebrow}
      </span>
      <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
        <span className="beary-gradient-text">{title}</span>
      </h2>
      {subtitle && (
        <p className="mt-3 max-w-md text-pink-600/90">{subtitle}</p>
      )}
      <div
        className="mt-4 h-1 w-24 rounded-full bg-gradient-to-r from-pink-400 via-rose-400 to-orange-300"
        aria-hidden
      />
    </div>
  );
}

async function CategorySection() {
  "use cache";
  const categories = await listCategories();
  if (categories.length === 0) {
    return <p className="text-center text-pink-400">No categories yet.</p>;
  }
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-5">
      {categories.map((cat) => (
        <Link
          key={cat.id}
          href={`/products?category=${cat.slug}`}
          className="group card beary-card overflow-hidden"
        >
          <figure className="aspect-[4/3] overflow-hidden bg-gradient-to-br from-pink-100 via-rose-50 to-orange-50">
            {cat.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={cat.imageUrl}
                alt={cat.name}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center transition-transform duration-500 ease-out group-hover:scale-110">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/beary.ico"
                  alt=""
                  className="h-14 w-14 rounded-full object-contain"
                  aria-hidden
                />
              </span>
            )}
          </figure>
          <div className="card-body flex-row items-center justify-between p-4">
            <h3 className="text-sm font-semibold text-pink-950 transition-colors group-hover:text-beary-pink-dark">
              {cat.name}
            </h3>
            <span
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-pink-400 to-rose-400 text-xs font-bold text-white shadow-sm transition-transform duration-300 group-hover:translate-x-0.5"
              aria-hidden
            >
              →
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}

async function FeaturedSection() {
  "use cache";
  const featured = await getFeaturedProducts();
  if (featured.length === 0) {
    return <p className="text-center text-pink-400">No featured products yet.</p>;
  }
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-5">
      {featured.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

function CategorySkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="skeleton aspect-[4/3] rounded-3xl bg-pink-100" />
      ))}
    </div>
  );
}

function FeaturedSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="skeleton aspect-[3/4] rounded-3xl bg-pink-100" />
      ))}
    </div>
  );
}
