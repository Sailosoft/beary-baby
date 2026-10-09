"use client";

import { useRef, useState } from "react";
import { uploadImageAction } from "@/app/actions/upload-actions";

export type ImageUploadValue = {
  url: string;
  provider: string;
  uploadId: string;
};

/**
 * File picker + Upload button that posts to ImgBB (server-side) and reports the
 * resulting URL/provider/upload id to the owning URL field.
 */
export function ImageUploadButton({
  onUploaded,
  label = "Upload",
}: {
  onUploaded: (value: ImageUploadValue) => void;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPending(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.set("file", file);
      const result = await uploadImageAction(formData);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      onUploaded({
        url: result.url,
        provider: result.provider,
        uploadId: result.uploadId,
      });
    } finally {
      setPending(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <span className="flex items-center gap-1 shrink-0">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
      />
      <button
        type="button"
        className="btn btn-outline btn-xs"
        disabled={pending}
        onClick={() => inputRef.current?.click()}
        title={error ?? "Upload an image to ImgBB"}
      >
        {pending ? (
          <span className="loading loading-spinner loading-xs" />
        ) : (
          `⬆ ${label}`
        )}
      </button>
      {error && (
        <span
          className="max-w-32 truncate text-[10px] text-error"
          title={error}
        >
          {error}
        </span>
      )}
    </span>
  );
}
