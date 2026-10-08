"use client";

import { useActionState } from "react";
import { importCsvAction, type ActionState } from "@/app/actions/admin-actions";

export function ImportForm() {
  const [state, formAction, pending] = useActionState(
    importCsvAction,
    undefined as ActionState | undefined,
  );

  return (
    <form action={formAction} className="flex flex-col gap-3 w-full min-w-0">
      <label className="form-control min-w-0">
        <span className="label-text text-pink-700">CSV content</span>
        <textarea
          name="csv"
          rows={10}
          required
          placeholder={"name,code,price,imageUrl\nTeddy,BB-001,299,https://i.ibb.co/x.png"}
          className="textarea textarea-bordered bg-white font-mono text-xs w-full"
        />
      </label>
      {state?.error && <p className="text-error text-sm">{state.error}</p>}
      {state?.success && (
        <p className="text-success text-sm whitespace-pre-wrap break-words">{state.success}</p>
      )}
      <button type="submit" className="btn btn-primary rounded-full w-full sm:w-fit" disabled={pending}>
        {pending ? <span className="loading loading-spinner loading-sm" /> : "Import"}
      </button>
    </form>
  );
}
