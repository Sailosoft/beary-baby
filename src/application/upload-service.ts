import "server-only";
import { getSupabase } from "@/infrastructure/supabase/client";
import type { UploadRow } from "@/infrastructure/supabase/types";
import type { ImgbbUploadResult } from "@/infrastructure/imgbb/client";

export type UploadRecord = {
  id: string;
  provider: string;
  uploadId: string;
  imageUrl: string;
  displayUrl: string | null;
  thumbUrl: string | null;
  deleteUrl: string | null;
  mime: string | null;
  width: number | null;
  height: number | null;
  sizeBytes: number | null;
  originalName: string | null;
  createdAt: Date;
};

function toUpload(row: UploadRow): UploadRecord {
  return {
    id: row.id,
    provider: row.provider,
    uploadId: row.upload_id,
    imageUrl: row.image_url,
    displayUrl: row.display_url,
    thumbUrl: row.thumb_url,
    deleteUrl: row.delete_url,
    mime: row.mime,
    width: row.width,
    height: row.height,
    sizeBytes: row.size_bytes,
    originalName: row.original_name,
    createdAt: new Date(row.created_at),
  };
}

export async function recordUpload(
  result: ImgbbUploadResult,
  originalName?: string | null,
): Promise<UploadRecord> {
  const { data, error } = await getSupabase()
    .from("uploads")
    .insert({
      provider: "imgbb",
      upload_id: result.id,
      image_url: result.url,
      display_url: result.displayUrl,
      thumb_url: result.thumbUrl,
      delete_url: result.deleteUrl,
      mime: result.mime,
      width: result.width,
      height: result.height,
      size_bytes: result.size,
      original_name: originalName ?? result.title ?? null,
    })
    .select("*")
    .single();
  if (error) throw error;
  return toUpload(data as UploadRow);
}

export async function listUploads(): Promise<UploadRecord[]> {
  const { data, error } = await getSupabase()
    .from("uploads")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as UploadRow[]).map(toUpload);
}

export async function getUploadById(id: string): Promise<UploadRecord | null> {
  const { data, error } = await getSupabase()
    .from("uploads")
    .select("*")
    .eq("id", id)
    .limit(1);
  if (error) throw error;
  const row = (data as UploadRow[])[0];
  return row ? toUpload(row) : null;
}

export async function deleteUpload(id: string): Promise<void> {
  const { error } = await getSupabase().from("uploads").delete().eq("id", id);
  if (error) throw error;
}
