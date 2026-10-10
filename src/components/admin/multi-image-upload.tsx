"use client";

import { useRef, useState } from "react";
import { uploadImageAction } from "@/app/actions/upload-actions";
import type { ImageUploadValue } from "@/components/admin/upload-field";

type UploadFailure = { name: string; error: string };

/**
 * Sequential multi-file uploader. Uploads one file at a time so each result is
 * reported as it completes and a failed file does not abort the batch.
 */
function useMultiUpload({
  onUploaded,
  onComplete,
}: {
  onUploaded?: (value: ImageUploadValue) => void;
  onComplete?: (values: ImageUploadValue[]) => void;
}) {
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(0);
  const [total, setTotal] = useState(0);
  const [failures, setFailures] = useState<UploadFailure[]>([]);

  async function run(files: File[]) {
    const images = files.filter(
      (file) => file.type === "" || file.type.startsWith("image/"),
    );
    if (images.length === 0) {
      setFailures(
        files.length > 0
          ? [{ name: "Selection", error: "Only image files are allowed." }]
          : [],
      );
      return;
    }

    setPending(true);
    setDone(0);
    setTotal(images.length);
    setFailures([]);

    const values: ImageUploadValue[] = [];
    const errors: UploadFailure[] = [];

    for (const file of images) {
      try {
        const formData = new FormData();
        formData.set("file", file);
        const result = await uploadImageAction(formData);
        if (result.ok) {
          const value: ImageUploadValue = {
            url: result.url,
            provider: result.provider,
            uploadId: result.uploadId,
          };
          values.push(value);
          onUploaded?.(value);
        } else {
          errors.push({ name: file.name, error: result.error });
        }
      } catch {
        errors.push({ name: file.name, error: "Upload failed. Please try again." });
      }
      setDone((count) => count + 1);
    }

    setFailures(errors);
    setPending(false);
    onComplete?.(values);
  }

  return { pending, done, total, failures, run };
}

function ErrorList({ failures }: { failures: UploadFailure[] }) {
  if (failures.length === 0) return null;
  return (
    <ul className="flex flex-col gap-0.5 text-[10px] text-error">
      {failures.map((failure, index) => (
        <li
          key={`${failure.name}-${index}`}
          className="max-w-64 truncate"
          title={`${failure.name}: ${failure.error}`}
        >
          {failure.name}: {failure.error}
        </li>
      ))}
    </ul>
  );
}

export function MultiImageUploadButton({
  onUploaded,
  onComplete,
  label = "Upload images",
}: {
  onUploaded?: (value: ImageUploadValue) => void;
  onComplete?: (values: ImageUploadValue[]) => void;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { pending, done, total, failures, run } = useMultiUpload({
    onUploaded,
    onComplete,
  });

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (inputRef.current) inputRef.current.value = "";
    await run(files);
  }

  return (
    <span className="flex flex-col gap-1">
      <span className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleChange}
        />
        <button
          type="button"
          className="btn btn-outline btn-sm"
          disabled={pending}
          onClick={() => inputRef.current?.click()}
          title="Upload one or more images to ImgBB"
        >
          {pending ? (
            <span className="loading loading-spinner loading-xs" />
          ) : (
            `⬆ ${label}`
          )}
        </button>
        {pending && (
          <span className="text-xs text-pink-500">
            Uploading {done}/{total}…
          </span>
        )}
      </span>
      <ErrorList failures={failures} />
    </span>
  );
}

export function MultiImageDropzone({
  onUploaded,
  onComplete,
  label = "Drop images here or click to upload",
}: {
  onUploaded?: (value: ImageUploadValue) => void;
  onComplete?: (values: ImageUploadValue[]) => void;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const { pending, done, total, failures, run } = useMultiUpload({
    onUploaded,
    onComplete,
  });

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (inputRef.current) inputRef.current.value = "";
    await run(files);
  }

  async function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragActive(false);
    await run(Array.from(e.dataTransfer.files));
  }

  return (
    <div className="flex flex-col gap-1 w-full">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleChange}
      />
      <div
        role="button"
        tabIndex={0}
        aria-disabled={pending}
        onClick={() => {
          if (!pending) inputRef.current?.click();
        }}
        onKeyDown={(e) => {
          if (pending) return;
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          if (!pending) setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        className={`flex flex-col items-center justify-center gap-1 rounded-box border-2 border-dashed px-6 py-6 text-center transition-colors ${
          dragActive
            ? "border-pink-400 bg-pink-50"
            : "border-pink-200 bg-white hover:border-pink-300"
        } ${pending ? "pointer-events-none opacity-70" : "cursor-pointer"}`}
      >
        <span className="text-sm font-medium text-pink-700">
          {pending ? `Uploading ${done}/${total}…` : label}
        </span>
        <span className="text-xs text-pink-400">
          PNG, JPG, GIF, WebP, AVIF or SVG · up to 32 MB each · multiple
          allowed
        </span>
        {pending && <span className="loading loading-spinner loading-sm" />}
      </div>
      <ErrorList failures={failures} />
    </div>
  );
}
