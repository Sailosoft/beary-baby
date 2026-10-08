"use client";

import { useActionState } from "react";
import { saveFeaturedAction, type ActionState } from "@/app/actions/admin-actions";

export function FeaturedForm({
  products,
  selected,
}: {
  products: { id: string; name: string }[];
  selected: Map<string, number>;
}) {
  const [state, formAction, pending] = useActionState(
    saveFeaturedAction,
    undefined as ActionState | undefined,
  );

  return (
    <form action={formAction} className="flex flex-col gap-3 w-full min-w-0">
      {products.map((p, i) => (
        <div
          key={p.id}
          className="grid grid-cols-[auto_1fr_auto] items-center gap-3 min-w-0"
        >
          <input
            type="hidden"
            name="productIds"
            value={selected.has(p.id) ? p.id : ""}
          />
          <input
            type="checkbox"
            name="productIds"
            value={p.id}
            defaultChecked={selected.has(p.id)}
            className="checkbox checkbox-primary checkbox-sm"
          />
          <span className="text-sm text-pink-900 truncate min-w-0">{p.name}</span>
          <input
            name="orders"
            type="number"
            defaultValue={selected.get(p.id) ?? i}
            className="input input-xs input-bordered bg-white w-16 shrink-0"
            aria-label={`Order for ${p.name}`}
          />
        </div>
      ))}
      {state?.error && <p className="text-error text-sm">{state.error}</p>}
      {state?.success && <p className="text-success text-sm">{state.success}</p>}
      <button type="submit" className="btn btn-primary btn-sm rounded-full w-full sm:w-fit" disabled={pending}>
        {pending ? <span className="loading loading-spinner loading-xs" /> : "Save featured"}
      </button>
    </form>
  );
}
