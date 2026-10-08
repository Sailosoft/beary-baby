"use client";

import { useActionState } from "react";
import type { Category } from "@/domain/product";
import { saveCategoryAction, type ActionState } from "@/app/actions/admin-actions";

export function CategoryForm({ category }: { category?: Category }) {
  const [state, formAction, pending] = useActionState(
    saveCategoryAction,
    undefined as ActionState | undefined,
  );

  return (
    <form action={formAction} className="flex flex-col gap-3 w-full min-w-0">
      {category && <input type="hidden" name="id" value={category.id} />}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 min-w-0">
        <label className="form-control min-w-0">
          <span className="label-text text-pink-700">Name *</span>
          <input
            name="name"
            defaultValue={category?.name}
            required
            className="input input-bordered bg-white w-full"
          />
        </label>
        <label className="form-control min-w-0">
          <span className="label-text text-pink-700">Image URL (optional)</span>
          <input
            name="imageUrl"
            type="url"
            defaultValue={category?.imageUrl ?? ""}
            className="input input-bordered bg-white w-full"
          />
        </label>
        <label className="form-control min-w-0">
          <span className="label-text text-pink-700">Order</span>
          <input
            name="order"
            type="number"
            defaultValue={category?.order ?? 0}
            className="input input-bordered bg-white w-full"
          />
        </label>
      </div>
      {state?.error && <p className="text-error text-sm">{state.error}</p>}
      {state?.success && <p className="text-success text-sm">{state.success}</p>}
      <button type="submit" className="btn btn-primary btn-sm rounded-full w-full sm:w-fit" disabled={pending}>
        {pending ? <span className="loading loading-spinner loading-xs" /> : category ? "Update" : "Add category"}
      </button>
    </form>
  );
}
