"use client";

import { useActionState, useState } from "react";
import type { Category } from "@/domain/product";
import { saveCategoryAction, type ActionState } from "@/app/actions/admin-actions";
import { UrlField } from "@/components/admin/url-field";
import { ImageUploadButton } from "@/components/admin/upload-field";

export function CategoryForm({ category }: { category?: Category }) {
  const [state, formAction, pending] = useActionState(
    saveCategoryAction,
    undefined as ActionState | undefined,
  );

  const [imageMeta, setImageMeta] = useState<{
    url: string;
    provider: string;
    uploadId: string;
  } | null>(
    category?.imageProvider
      ? {
          url: category.imageUrl ?? "",
          provider: category.imageProvider,
          uploadId: category.imageUploadId ?? "",
        }
      : null,
  );

  return (
    <form action={formAction} className="flex flex-col gap-3 w-full min-w-0">
      {category && <input type="hidden" name="id" value={category.id} />}
      <input
        type="hidden"
        name="imageMeta"
        value={imageMeta ? JSON.stringify(imageMeta) : ""}
        readOnly
      />
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
        <div className="form-control min-w-0">
          <span className="label-text text-pink-700">Image URL (optional)</span>
          <UrlField
            name="imageUrl"
            defaultValue={category?.imageUrl ?? ""}
            placeholder="https://i.ibb.co/…"
            trailingSlot={({ setValue }) => (
              <ImageUploadButton
                onUploaded={(uploaded) => {
                  setValue(uploaded.url);
                  setImageMeta({
                    url: uploaded.url,
                    provider: uploaded.provider,
                    uploadId: uploaded.uploadId,
                  });
                }}
              />
            )}
          />
        </div>
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
