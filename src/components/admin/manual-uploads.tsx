"use client";

import { useRouter } from "next/navigation";
import { MultiImageDropzone } from "@/components/admin/multi-image-upload";

/**
 * Manual multi-file upload entry point for the uploads page. Refreshes the
 * server-rendered list once the batch completes so new rows appear.
 */
export function ManualUploads() {
  const router = useRouter();

  return (
    <MultiImageDropzone
      label="Drop images here or click to upload"
      onComplete={() => router.refresh()}
    />
  );
}
