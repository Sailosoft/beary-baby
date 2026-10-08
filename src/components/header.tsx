"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

export function Header() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(searchParams.get("q") ?? "");
  const [pending, startTransition] = useTransition();
  const [menuOpen, setMenuOpen] = useState(false);

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    startTransition(() => {
      router.push(params.toString() ? `/products?${params}` : "/products");
    });
  }

  function closeMenu() {
    setMenuOpen(false);
    // Also blur so the focus-based dropdown collapses.
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  }

  return (
    <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-xl">
      <div
        className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-pink-300 to-transparent"
        aria-hidden
      />
      <div className="navbar max-w-6xl mx-auto px-4 py-1.5">
        <div className="navbar-start">
          <Link
            href="/"
            className="btn btn-ghost gap-2 px-2 text-lg font-extrabold"
          >
            <span
              className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-pink-400 via-rose-400 to-orange-300 text-base shadow-md shadow-pink-200"
              aria-hidden
            >
              🧸
            </span>
            <span className="beary-text-gradient">Beary Baby</span>
          </Link>
        </div>
        <div className="navbar-center hidden sm:flex">
          <nav className="flex gap-1">
            <Link
              href="/"
              className="btn btn-ghost btn-sm rounded-full text-pink-700 hover:bg-pink-100/70 hover:text-beary-pink-deep"
            >
              Home
            </Link>
            <Link
              href="/products"
              className="btn btn-ghost btn-sm rounded-full text-pink-700 hover:bg-pink-100/70 hover:text-beary-pink-deep"
            >
              Products
            </Link>
          </nav>
        </div>
        <div className="navbar-end gap-2">
          {/* Search: inline on desktop… */}
          <form onSubmit={submitSearch} className="join hidden sm:flex">
            <input
              type="search"
              name="q"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search products…"
              className="input input-sm join-item w-56 rounded-full border-pink-200/80 bg-white/80 ps-4 focus:border-pink-400 focus:outline-none"
              aria-label="Search products"
            />
            <button
              type="submit"
              className="beary-btn btn btn-sm join-item rounded-full px-4"
              disabled={pending}
              aria-label="Search"
            >
              🔍
            </button>
          </form>
          <Link
            href="/login"
            className="btn btn-sm rounded-full border-pink-200 bg-white/70 text-pink-600 hover:border-pink-300 hover:bg-white hidden sm:inline-flex"
            aria-label="Admin login"
          >
            Login
          </Link>
          {/* …hamburger menu on mobile */}
          <div className={`dropdown dropdown-end sm:hidden ${menuOpen ? "dropdown-open" : ""}`}>
            <div
              tabIndex={0}
              role="button"
              className="btn btn-ghost btn-sm btn-circle"
              aria-label="Open menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </div>
            <ul
              tabIndex={0}
              className="menu dropdown-content z-50 mt-2 w-56 rounded-3xl bg-white p-3 shadow-xl ring-1 ring-pink-100"
            >
              <li>
                <Link
                  href="/"
                  onClick={closeMenu}
                  className="rounded-full text-pink-700"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/products"
                  onClick={closeMenu}
                  className="rounded-full text-pink-700"
                >
                  Products
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  onClick={closeMenu}
                  className="rounded-full text-pink-700"
                >
                  Admin login
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
      {/* Search: full-width row on mobile */}
      <form onSubmit={submitSearch} className="join sm:hidden px-4 pb-3">
        <input
          type="search"
          name="q"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search products…"
          className="input join-item flex-1 min-w-0 rounded-full border-pink-200/80 bg-white/80 ps-4 focus:border-pink-400 focus:outline-none"
          aria-label="Search products"
        />
        <button
          type="submit"
          className="beary-btn btn join-item rounded-full px-5"
          disabled={pending}
          aria-label="Search"
        >
          🔍
        </button>
      </form>
    </header>
  );
}
