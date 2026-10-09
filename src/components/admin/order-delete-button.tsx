"use client";

import { useEffect, useState } from "react";
import { Trash } from "lucide-react";
import { deleteOrderAction } from "@/app/actions/order-actions";

export function OrderDeleteButton({
  orderId,
  customerName,
}: {
  orderId: string;
  customerName: string;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        aria-label={`Delete order from ${customerName}`}
        data-tip="Delete"
        className="btn btn-ghost btn-sm btn-circle text-error tooltip tooltip-top"
        onClick={() => setOpen(true)}
      >
        <Trash className="size-4" />
      </button>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-semibold text-pink-900">Delete order?</h3>
            <p className="mt-2 text-sm text-pink-600">
              Are you sure you want to delete the order from{" "}
              <span className="font-semibold">{customerName}</span>?
            </p>
            <p className="mt-1 text-xs text-pink-400">
              Order #{orderId.slice(0, 8)} and all of its items will be
              permanently removed. This cannot be undone.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setOpen(false)}
              >
                Cancel
              </button>
              <form action={deleteOrderAction}>
                <input type="hidden" name="id" value={orderId} />
                <button type="submit" className="btn btn-error btn-sm">
                  Delete order
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
