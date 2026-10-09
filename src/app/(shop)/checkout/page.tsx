"use client";

import Link from "next/link";
import { useState } from "react";
import { formatPeso } from "@/domain/product";
import { useCart } from "@/components/cart/cart-provider";
import { CustomerMetaModal } from "@/components/cart/customer-meta-modal";
import { placeOrderAction } from "@/app/actions/order-actions";
import { getLocalDB } from "@/infrastructure/local/db";

export default function CheckoutPage() {
  const {
    items,
    subtotal,
    customerName,
    customerNameLoaded,
    clear,
    removeItem,
    clearCustomerName,
  } = useCart();
  const [note, setNote] = useState("");
  const [metaOpen, setMetaOpen] = useState(false);
  const [namePromptDismissed, setNamePromptDismissed] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [placed, setPlaced] = useState<{ id: string; total: number } | null>(
    null,
  );

  const needsName =
    customerNameLoaded && items.length > 0 && !customerName;
  const showMeta = metaOpen || (needsName && !namePromptDismissed);

  async function placeOrder() {
    if (!customerName) {
      setMetaOpen(true);
      return;
    }
    setPending(true);
    setError(null);
    try {
      const result = await placeOrderAction({
        customerName,
        note: note.trim() || null,
        items: items.map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          note: item.note ?? null,
        })),
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      const snapshot = items.map((item) => ({
        name: item.name,
        variantLabel: item.variantLabel,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        note: item.note ?? null,
      }));
      await getLocalDB().orderHistory.add({
        serverOrderId: result.orderId,
        customerName,
        total: result.total,
        status: "new",
        createdAt: Date.now(),
        items: snapshot,
      });
      await clear();
      setPlaced({ id: result.orderId, total: result.total });
    } finally {
      setPending(false);
    }
  }

  if (placed) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center gap-4 px-4 py-20 text-center">
        <div className="text-5xl" aria-hidden>
          🎉
        </div>
        <h1 className="text-2xl font-extrabold text-pink-900">
          Order placed!
        </h1>
        <p className="text-sm text-pink-600">
          Thanks, {customerName}. Your total was{" "}
          <span className="font-bold">{formatPeso(placed.total)}</span>.
        </p>
        <p className="font-mono text-xs text-pink-400">
          Order #{placed.id.slice(0, 8)}
        </p>
        <div className="flex gap-2">
          <Link href="/orders" className="beary-btn btn rounded-full px-6">
            View my orders
          </Link>
          <Link
            href="/products"
            className="btn btn-ghost rounded-full px-6 text-pink-600"
          >
            Keep shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-8">
      <h1 className="text-2xl font-extrabold text-pink-900">Checkout</h1>

      {items.length === 0 ? (
        <div className="rounded-3xl border border-pink-100 bg-white py-16 text-center">
          <p className="text-sm text-pink-500">
            Your cart is empty. Add something first.
          </p>
          <Link
            href="/products"
            className="beary-btn btn mt-4 rounded-full px-6"
          >
            Browse products
          </Link>
        </div>
      ) : (
        <>
          <div className="rounded-2xl border border-pink-100 bg-white p-4">
            <p className="mb-2 text-sm text-pink-500">Ordering as</p>
            <div className="flex items-center justify-between gap-3">
              <span className="font-semibold text-pink-900">
                {customerName || "No name set"}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  className="btn btn-ghost btn-xs"
                  onClick={() => setMetaOpen(true)}
                >
                  {customerName ? "Change" : "Set name"}
                </button>
                {customerName && (
                  <button
                    type="button"
                    className="btn btn-ghost btn-xs text-error"
                    onClick={() => {
                      setNamePromptDismissed(true);
                      clearCustomerName();
                    }}
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>

          <ul className="flex flex-col gap-2">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-3 rounded-2xl border border-pink-100 bg-white p-3"
              >
                <div className="min-w-0">
                  <p className="line-clamp-1 font-semibold text-pink-950">
                    {item.name}
                  </p>
                  {item.variantLabel && (
                    <p className="text-xs text-pink-500">{item.variantLabel}</p>
                  )}
                  <p className="text-xs text-pink-400">
                    {formatPeso(item.unitPrice)} × {item.quantity}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-beary-pink-deep">
                    {formatPeso(item.unitPrice * item.quantity)}
                  </span>
                  <button
                    type="button"
                    className="btn btn-ghost btn-xs text-error"
                    onClick={() => removeItem(item.id!)}
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <label className="form-control">
            <span className="label-text text-pink-700">Note (optional)</span>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              placeholder="Any special instructions?"
              className="textarea textarea-bordered bg-white w-full"
            />
          </label>

          {error && <p className="text-sm text-error">{error}</p>}

          <div className="flex items-center justify-between rounded-2xl border border-pink-100 bg-white p-4">
            <span className="text-sm text-pink-500">Total</span>
            <span className="text-xl font-extrabold text-pink-900">
              {formatPeso(subtotal)}
            </span>
          </div>

          <button
            type="button"
            className="beary-btn btn w-full rounded-full"
            disabled={pending || items.length === 0}
            onClick={placeOrder}
          >
            {pending ? (
              <span className="loading loading-spinner loading-sm" />
            ) : (
              "Place order"
            )}
          </button>
        </>
      )}

      {showMeta && (
        <CustomerMetaModal
          required={!customerName}
          onClose={() => setMetaOpen(false)}
          onSaved={() => setMetaOpen(false)}
        />
      )}
    </div>
  );
}
