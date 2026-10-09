"use client";

import { useEffect, useState } from "react";
import { Eye } from "lucide-react";
import { formatPeso } from "@/domain/product";

export type OrderDetailItem = {
  id: string;
  productName: string;
  variantLabel: string | null;
  imageUrl: string | null;
  unitPrice: number;
  quantity: number;
  note: string | null;
};

export type OrderDetail = {
  id: string;
  customerName: string;
  note: string | null;
  status: string;
  total: number;
  createdAt: Date;
  items: OrderDetailItem[];
};

export function OrderDetailModal({
  order,
  onClose,
}: {
  order: OrderDetail;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold text-pink-900">
              Order #{order.id.slice(0, 8)}
            </h3>
            <p className="text-xs text-pink-400">
              {order.createdAt.toLocaleString()}
            </p>
          </div>
          <button
            type="button"
            className="btn btn-circle btn-sm btn-ghost"
            onClick={onClose}
            aria-label="Close order detail"
          >
            ✕
          </button>
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="badge badge-sm border-pink-200 bg-pink-50 text-pink-700">
            {order.customerName}
          </span>
          <span className="badge badge-ghost badge-sm">{order.status}</span>
          <span className="ml-auto font-extrabold text-pink-900">
            {formatPeso(order.total)}
          </span>
        </div>

        {order.note && (
          <p className="mb-4 rounded-2xl bg-pink-50/70 px-3 py-2 text-xs text-pink-600">
            Note: {order.note}
          </p>
        )}

        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-pink-400">
          Items ({order.items.length})
        </p>
        <ul className="flex flex-col gap-2">
          {order.items.map((item) => (
            <li
              key={item.id}
              className="flex items-center gap-3 rounded-2xl border border-pink-100 bg-white p-3"
            >
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-pink-50">
                {item.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.imageUrl}
                    alt={item.productName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[10px] text-pink-300">
                    No image
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-pink-900">
                  {item.productName}
                </p>
                <p className="text-xs text-pink-500">
                  {item.variantLabel
                    ? `Variant: ${item.variantLabel}`
                    : "No variant"}
                </p>
                {item.note && (
                  <p className="text-xs text-pink-400">Note: {item.note}</p>
                )}
              </div>
              <div className="shrink-0 text-right">
                <p className="text-xs text-pink-500">
                  {item.quantity} × {formatPeso(item.unitPrice)}
                </p>
                <p className="text-sm font-semibold text-pink-900">
                  {formatPeso(item.unitPrice * item.quantity)}
                </p>
              </div>
            </li>
          ))}
          {order.items.length === 0 && (
            <li className="rounded-2xl border border-pink-100 py-6 text-center text-xs text-pink-400">
              No items on this order.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}

export function OrderDetailButton({ order }: { order: OrderDetail }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        aria-label="View order"
        data-tip="View"
        className="btn btn-ghost btn-sm btn-circle tooltip tooltip-top"
        onClick={() => setOpen(true)}
      >
        <Eye className="size-4" />
      </button>
      {open && (
        <OrderDetailModal order={order} onClose={() => setOpen(false)} />
      )}
    </>
  );
}
