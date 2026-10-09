"use client";

import { useEffect, useState } from "react";
import { Trash } from "lucide-react";
import { deleteCategoryAction } from "@/app/actions/admin-actions";

export function CategoryDeleteButton({
  id,
  name,
}: {
  id: string;
  name: string;
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
        aria-label={`Delete ${name}`}
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
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-semibold text-pink-900">Delete category</h3>
            <p className="mt-2 text-sm text-pink-500">
              Are you sure you want to delete{" "}
              <span className="font-medium text-pink-900">{name}</span>? Products
              in this category will move to uncategorized.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                className="btn btn-ghost btn-sm rounded-full"
                onClick={() => setOpen(false)}
              >
                Cancel
              </button>
              <form action={deleteCategoryAction}>
                <input type="hidden" name="id" value={id} />
                <button
                  type="submit"
                  className="btn btn-error btn-sm rounded-full text-white"
                >
                  Delete
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
