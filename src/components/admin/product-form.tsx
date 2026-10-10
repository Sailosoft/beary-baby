"use client";

import { useActionState, useState } from "react";
import type { Category, Product } from "@/domain/product";
import { saveProductAction, type ActionState } from "@/app/actions/admin-actions";
import { UrlField, UrlListField } from "@/components/admin/url-field";
import { ImageUploadButton } from "@/components/admin/upload-field";
import { MultiImageUploadButton } from "@/components/admin/multi-image-upload";
import { VariantEditor } from "@/components/admin/variant-editor";

type GalleryMeta = Record<string, { provider: string; uploadId: string }>;

export function ProductForm({
  categories,
  product,
}: {
  categories: Category[];
  product?: Product & {
    categories: Category[];
    galleries: {
      imageUrl: string;
      imageProvider?: string | null;
      imageUploadId?: string | null;
    }[];
  };
}) {
  const [state, formAction, pending] = useActionState(
    saveProductAction,
    undefined as ActionState | undefined,
  );

  const selectedIds = new Set(product?.categories.map((c) => c.id) ?? []);

  const [imageMeta, setImageMeta] = useState<{
    url: string;
    provider: string;
    uploadId: string;
  } | null>(
    product?.imageProvider
      ? {
          url: product.imageUrl,
          provider: product.imageProvider,
          uploadId: product.imageUploadId ?? "",
        }
      : null,
  );

  const [galleryMeta, setGalleryMeta] = useState<GalleryMeta>(() => {
    const initial: GalleryMeta = {};
    for (const g of product?.galleries ?? []) {
      if (g.imageProvider) {
        initial[g.imageUrl] = {
          provider: g.imageProvider,
          uploadId: g.imageUploadId ?? "",
        };
      }
    }
    return initial;
  });

  const galleryMetaJson = JSON.stringify(
    Object.entries(galleryMeta).map(([url, meta]) => ({
      url,
      provider: meta.provider,
      uploadId: meta.uploadId,
    })),
  );

  return (
    <form action={formAction} className="flex flex-col gap-4 w-full min-w-0">
      {product && <input type="hidden" name="id" value={product.id} />}
      <input
        type="hidden"
        name="imageMeta"
        value={imageMeta ? JSON.stringify(imageMeta) : ""}
        readOnly
      />
      <input type="hidden" name="galleryMeta" value={galleryMetaJson} readOnly />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 min-w-0">
        <label className="form-control min-w-0">
          <span className="label-text text-pink-700">Name *</span>
          <input
            name="name"
            defaultValue={product?.name}
            required
            className="input input-bordered bg-white w-full"
          />
        </label>
        <label className="form-control min-w-0">
          <span className="label-text text-pink-700">Code * (unique)</span>
          <input
            name="code"
            defaultValue={product?.code}
            required
            className="input input-bordered bg-white w-full"
          />
        </label>
        <label className="form-control min-w-0">
          <span className="label-text text-pink-700">Price (₱) *</span>
          <input
            name="price"
            type="number"
            step="0.01"
            min="0"
            defaultValue={product?.price}
            required
            className="input input-bordered bg-white w-full"
          />
        </label>
        <label className="form-control min-w-0">
          <span className="label-text text-pink-700">Stocks (empty = unlimited)</span>
          <input
            name="stocks"
            type="number"
            min="0"
            defaultValue={product?.stocks ?? ""}
            className="input input-bordered bg-white w-full"
          />
        </label>
      </div>

      <div className="form-control min-w-0">
        <span className="label-text text-pink-700">Main image URL *</span>
        <UrlField
          name="imageUrl"
          defaultValue={product?.imageUrl}
          required
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
        <span className="label-text text-pink-700">Description</span>
        <textarea
          name="description"
          defaultValue={product?.description ?? ""}
          rows={3}
          className="textarea textarea-bordered bg-white w-full"
        />
      </label>

      <div className="form-control min-w-0">
        <span className="label-text text-pink-700">
          Gallery image URLs (order = top to bottom)
        </span>
        <UrlListField
          name="galleryUrls"
          defaultValue={product?.galleries.map((g) => g.imageUrl).join("\n")}
          trailingSlot={({ value, setValue }) => (
            <ImageUploadButton
              onUploaded={(uploaded) => {
                const previous = value;
                setValue(uploaded.url);
                setGalleryMeta((prev) => {
                  const next = { ...prev };
                  if (previous) delete next[previous];
                  next[uploaded.url] = {
                    provider: uploaded.provider,
                    uploadId: uploaded.uploadId,
                  };
                  return next;
                });
              }}
            />
          )}
          footerSlot={({ addValues }) => (
            <MultiImageUploadButton
              label="Upload images"
              onUploaded={(uploaded) => {
                setGalleryMeta((prev) => ({
                  ...prev,
                  [uploaded.url]: {
                    provider: uploaded.provider,
                    uploadId: uploaded.uploadId,
                  },
                }));
              }}
              onComplete={(values) => addValues(values.map((v) => v.url))}
            />
          )}
        />
      </div>

      <VariantEditor
        initialVariants={product?.variants ?? []}
        basePrice={product?.price ?? 0}
        displayPrice={product?.displayPrice ?? true}
      />

      <fieldset className="border border-pink-100 rounded-box p-4 min-w-0">
        <legend className="text-xs text-pink-700 px-1">Categories</legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-1 min-w-0">
          {categories.map((c) => (
            <label
              key={c.id}
              className="label cursor-pointer gap-2 justify-start min-w-0 py-1"
            >
              <input
                type="checkbox"
                name="categoryIds"
                value={c.id}
                defaultChecked={selectedIds.has(c.id)}
                className="checkbox checkbox-primary checkbox-sm shrink-0"
              />
              <span className="label-text truncate">{c.name}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label className="label cursor-pointer gap-2 justify-start">
          <input
            type="checkbox"
            name="available"
            defaultChecked={product?.available ?? true}
            className="toggle toggle-primary toggle-sm"
          />
          <span className="label-text">Available</span>
        </label>
        <label className="label cursor-pointer gap-2 justify-start">
          <input
            type="checkbox"
            name="displayPrice"
            defaultChecked={product?.displayPrice ?? true}
            className="toggle toggle-primary toggle-sm"
          />
          <span className="label-text">Display price</span>
        </label>
        <label className="label cursor-pointer gap-2 justify-start">
          <input
            type="checkbox"
            name="isPreorder"
            defaultChecked={product?.isPreorder ?? false}
            className="toggle toggle-primary toggle-sm"
          />
          <span className="label-text">Pre-order</span>
        </label>
      </div>

      {state?.error && <p className="text-error text-sm">{state.error}</p>}
      {state?.success && <p className="text-success text-sm">{state.success}</p>}

      <button
        type="submit"
        className="btn btn-primary rounded-full w-full sm:w-fit"
        disabled={pending}
      >
        {pending ? <span className="loading loading-spinner loading-sm" /> : "Save product"}
      </button>
    </form>
  );
}
