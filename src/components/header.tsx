"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { useCart } from "@/components/cart/cart-provider";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/orders", label: "Orders" },
] as const;

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { count, setOpen } = useCart();
  const [q, setQ] = useState(searchParams.get("q") ?? "");
  const [pending, startTransition] = useTransition();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const mobileSearchPanelRef = useRef<HTMLDivElement>(null);
  const mobileSearchButtonRef = useRef<HTMLButtonElement>(null);
  const mobileSearchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!searchOpen) return;

    mobileSearchInputRef.current?.focus();

    function handlePointerDown(e: MouseEvent | TouchEvent) {
      const target = e.target as Node;
      if (mobileSearchPanelRef.current?.contains(target)) return;
      if (mobileSearchButtonRef.current?.contains(target)) return;
      setSearchOpen(false);
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setSearchOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [searchOpen]);

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    setSearchOpen(false);
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

  function isActive(href: string) {
    return href === "/" ? pathname === "/" : pathname.startsWith(href);
  }

  const navClass = (href: string) =>
    `btn btn-ghost btn-sm rounded-full text-base font-semibold transition-all ${
      isActive(href)
        ? "bg-white text-beary-pink-deep shadow-sm"
        : "text-pink-700 hover:bg-white/80 hover:text-beary-pink-deep"
    }`;

  return (
    <header className="beary-header sticky top-0 z-40 shadow-[0_10px_40px_-18px_rgba(236,72,153,0.5)]">
      {/* Ambient floating orbs, echoing the home hero */}
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden
      >
        <div className="beary-orb -left-10 -top-16 h-40 w-40 bg-[#e1d5f8]/70" />
        <div className="beary-orb -top-24 right-[-3rem] h-56 w-56 bg-[#fde3c4]/60 [animation-delay:1.5s]" />
        <div className="beary-orb -bottom-24 left-1/3 h-40 w-40 bg-[#f7c4d9]/60 [animation-delay:3s]" />
      </div>
      {/* Inner top highlight + bottom gradient hairline */}
      <div
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent"
        aria-hidden
      />
      <div
        className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-pink-400 to-transparent"
        aria-hidden
      />

      <div className="navbar relative max-w-6xl mx-auto px-4 py-1.5">
        <div className="navbar-start">
          <Link
            href="/"
            className="group flex items-center rounded-full bg-white/60 p-1 shadow-sm ring-1 ring-white/80 backdrop-blur transition-all hover:bg-white/85 hover:shadow-md"
            aria-label="Beary Baby — home"
          >
            <Image
              src="/beary-banner.jpg"
              alt="Beary Baby"
              width={300}
              height={72}
              priority
              className="animate-glow h-8 w-auto rounded-full ring-2 ring-yellow-100/80 transition-transform duration-300 group-hover:scale-[1.03]"
            />
          </Link>
        </div>

        <div className="navbar-center hidden sm:flex">
          <nav className="flex items-center gap-1 rounded-full bg-white/35 p-1 ring-1 ring-white/60 backdrop-blur">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className={navClass(link.href)}>
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="navbar-end gap-2">
          {/* Search: icon toggle on mobile… */}
          <button
            type="button"
            ref={mobileSearchButtonRef}
            onClick={() => {
              setMenuOpen(false);
              setSearchOpen((open) => !open);
            }}
            className="btn btn-ghost btn-sm btn-circle bg-white/50 text-pink-700 ring-1 ring-white/60 backdrop-blur transition hover:bg-white sm:hidden"
            aria-label="Search products"
            aria-expanded={searchOpen}
            aria-controls="mobile-search"
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
                d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z"
              />
            </svg>
          </button>
          {/* Search: inline on desktop… */}
          <form onSubmit={submitSearch} className="join hidden sm:flex">
            <input
              type="search"
              name="q"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search products…"
              className="input input-sm join-item w-56 rounded-full border-white/70 bg-white/75 ps-4 shadow-sm backdrop-blur transition focus:border-pink-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-300/60"
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
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="btn btn-ghost btn-sm btn-circle relative bg-white/50 text-pink-700 ring-1 ring-white/60 backdrop-blur transition hover:bg-white"
            aria-label={`Open cart${count > 0 ? ` (${count} items)` : ""}`}
          >
            🛒
            {count > 0 && (
              <span className="badge badge-primary badge-xs absolute -right-0.5 -top-0.5 shadow-sm">
                {count}
              </span>
            )}
          </button>
          <Link
            href="/login"
            className="btn btn-sm rounded-full border-pink-200 bg-white/70 text-base font-semibold text-pink-600 shadow-sm backdrop-blur transition hover:border-pink-300 hover:bg-white hidden sm:inline-flex"
            aria-label="Admin login"
          >
            Login
          </Link>
          {/* …hamburger menu on mobile */}
          <div className={`dropdown dropdown-end sm:hidden ${menuOpen ? "dropdown-open" : ""}`}>
            <div
              tabIndex={0}
              role="button"
              className="btn btn-ghost btn-sm btn-circle bg-white/50 text-pink-700 ring-1 ring-white/60 backdrop-blur hover:bg-white"
              aria-label="Open menu"
              aria-expanded={menuOpen}
              onClick={() => {
                setSearchOpen(false);
                setMenuOpen((open) => !open);
              }}
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
              className="menu dropdown-content z-50 mt-2 w-56 rounded-3xl bg-white/95 p-3 shadow-xl ring-1 ring-pink-100 backdrop-blur"
            >
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={closeMenu}
                    className={`rounded-full text-base font-medium ${
                      isActive(link.href) ? "bg-pink-100/80 text-beary-pink-deep" : "text-pink-700"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <button
                  type="button"
                  onClick={() => {
                    closeMenu();
                    setOpen(true);
                  }}
                  className="rounded-full text-base font-medium text-pink-700"
                >
                  Cart{count > 0 ? ` (${count})` : ""}
                </button>
              </li>
              <li>
                <Link
                  href="/login"
                  onClick={closeMenu}
                  className="rounded-full text-base font-medium text-pink-700"
                >
                  Admin login
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Search: dropdown panel on mobile — overlays content so the header stays one row */}
      {searchOpen && (
        <div
          ref={mobileSearchPanelRef}
          id="mobile-search"
          className="absolute inset-x-0 top-full z-50 px-4 pt-1 pb-3 sm:hidden"
        >
          <form
            onSubmit={submitSearch}
            className="join flex w-full overflow-hidden rounded-full bg-white/90 p-1 shadow-lg ring-1 ring-white/70 backdrop-blur"
          >
            <input
              type="search"
              name="q"
              ref={mobileSearchInputRef}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search products…"
              className="input join-item flex-1 min-w-0 rounded-full border-transparent bg-transparent ps-4 shadow-none focus:bg-white/70 focus:outline-none focus:ring-2 focus:ring-pink-300/60"
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
        </div>
      )}
    </header>
  );
}
