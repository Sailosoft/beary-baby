"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/actions/auth-actions";

const NAV_ITEMS = [
  { href: "/admin/products", label: "Products" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/featured", label: "Featured" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/import", label: "Import CSV" },
  { href: "/admin/uploads", label: "Uploads" },
];

export function AdminHeader({ username }: { username: string }) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-xl">
      <div
        className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-pink-300 to-transparent"
        aria-hidden
      />
      <div className="max-w-6xl mx-auto px-4 py-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Link
            href="/admin/products"
            className="btn btn-ghost gap-2 px-2 text-lg font-extrabold"
          >
            <span
              className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-pink-400 via-rose-400 to-orange-300 text-base shadow-md shadow-pink-200"
              aria-hidden
            >
              🧸
            </span>
            <span className="beary-text-gradient">Beary Baby</span>
            <span className="badge badge-sm border-pink-200 bg-pink-50 text-pink-600 font-semibold">
              Admin
            </span>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="btn btn-sm rounded-full border-pink-200 bg-white/70 text-pink-600 hover:border-pink-300 hover:bg-white hidden sm:inline-flex"
          >
            View store
          </Link>
          <span className="text-sm text-pink-500">{username}</span>
          <form action={logoutAction}>
            <button type="submit" className="btn btn-xs btn-ghost">
              Logout
            </button>
          </form>
        </div>
      </div>
      {/* Horizontally scrollable on small screens so tabs never overflow */}
      <div className="max-w-6xl mx-auto px-4 pb-2 -mx-4 overflow-x-auto">
        <nav className="tabs tabs-box bg-white border border-pink-100 w-max lg:w-fit">
          {NAV_ITEMS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`tab whitespace-nowrap ${
                pathname.startsWith(href)
                  ? "tab-active text-beary-pink-deep"
                  : ""
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
