import { Suspense } from "react";
import { Header } from "@/components/header";
import { CartProvider } from "@/components/cart/cart-provider";
import { CartDrawer } from "@/components/cart/cart-drawer";

// Customer-facing shop chrome: sticky header with search + site footer.
export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <Suspense fallback={<div className="h-16 bg-white/80 border-b border-pink-100" />}>
        <Header />
      </Suspense>
      <main className="flex-1">{children}</main>
      <footer className="relative overflow-hidden border-t border-pink-100 bg-gradient-to-r from-pink-50 via-rose-50 to-orange-50">
        <div
          className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-pink-300 to-transparent"
          aria-hidden
        />
        <div className="footer footer-center max-w-6xl mx-auto p-8 text-sm text-beary-pink-deep">
          <aside className="flex flex-col items-center gap-2">
            <span
              className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-pink-400 via-rose-400 to-orange-300 shadow-md shadow-pink-200"
              aria-hidden
            >
              🧸
            </span>
            <p>
              <span className="font-bold beary-text-gradient">Beary Baby</span>
              {" — "}cute stuff & office finds, all in one place
            </p>
          </aside>
        </div>
      </footer>
      <CartDrawer />
    </CartProvider>
  );
}
