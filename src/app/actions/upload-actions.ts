"use server";

import { revalidatePath } from "next/cache";
import { isAdminAuthenticated } from "@/infrastructure/auth/session";
import {
  deleteImage,
  ImgbbUploadError,
  uploadImage,
} from "@/infrastructure/imgbb/client";
import {
  deleteUpload,
  getUploadById,
  recordUpload,
} from "@/application/upload-service";

const MAX_BYTES = 32 * 1024 * 1024;
const ALLOWED_MIME = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/avif",
  "image/bmp",
  "image/svg+xml",
];

export type UploadActionResult =
  | { ok: true; url: string; provider: string; uploadId: string; thumbUrl: string | null }
  | { ok: false; error: string };

export async function uploadImageAction(
  formData: FormData,
): Promise<UploadActionResult> {
  if (!(await isAdminAuthenticated())) {
    return { ok: false, error: "Unauthorized" };
  }

  const file = formData.get("file");
  if (!file || typeof file === "string") {
    return { ok: false, error: "Choose an image file first." };
  }
  if (file.size === 0) {
    return { ok: false, error: "Choose an image file first." };
  }
  if (file.size > MAX_BYTES) {
    return { ok: false, error: "Image must be 32 MB or smaller." };
  }
  if (file.type && !ALLOWED_MIME.includes(file.type)) {
    return { ok: false, error: "Only image files are allowed." };
  }

  try {
    const result = await uploadImage({ file, name: file.name });
    const record = await recordUpload(result, file.name);
    return {
      ok: true,
      url: record.imageUrl,
      provider: record.provider,
      uploadId: record.uploadId,
      thumbUrl: record.thumbUrl,
    };
  } catch (err) {
    return {
      ok: false,
      error:
        err instanceof ImgbbUploadError
          ? err.message
          : "Upload failed. Please try again.",
    };
  }
}

export async function deleteUploadAction(formData: FormData): Promise<void> {
  if (!(await isAdminAuthenticated())) return;
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const record = await getUploadById(id);
  if (record?.deleteUrl) {
    await deleteImage(record.deleteUrl);
  }
  await deleteUpload(id);
  revalidatePath("/admin/uploads");
}
