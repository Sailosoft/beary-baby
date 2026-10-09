import "server-only";

/**
 * Minimal ImgBB API v1 client. Runs server-side only so IMGBB_API_KEY is never
 * exposed to the browser. See docs/PM/imgbb/imgbb-api.md.
 */

export class ImgbbUploadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ImgbbUploadError";
  }
}

export type ImgbbUploadInput = {
  file?: File;
  base64?: string;
  imageUrl?: string;
  name?: string;
};

export type ImgbbUploadResult = {
  id: string;
  url: string;
  displayUrl: string | null;
  thumbUrl: string | null;
  deleteUrl: string | null;
  mime: string | null;
  width: number | null;
  height: number | null;
  size: number | null;
  title: string | null;
};

type ImgbbApiData = {
  id?: string;
  title?: string;
  url?: string;
  display_url?: string;
  delete_url?: string;
  width?: string | number;
  height?: string | number;
  size?: string | number;
  image?: { mime?: string };
  thumb?: { url?: string };
};

type ImgbbApiResponse = {
  data?: ImgbbApiData;
  success?: boolean;
  status?: number;
  error?: { message?: string };
};

function toNumber(value: string | number | undefined): number | null {
  if (value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function getApiKey(): string {
  const key = process.env.IMGBB_API_KEY;
  if (!key) {
    throw new ImgbbUploadError(
      "IMGBB_API_KEY is not set. Add it to your environment to enable uploads.",
    );
  }
  return key;
}

export async function uploadImage(
  input: ImgbbUploadInput,
): Promise<ImgbbUploadResult> {
  const key = getApiKey();
  const params = new URLSearchParams({ key });

  const form = new FormData();
  if (input.file) {
    form.set("image", input.file, input.name ?? input.file.name);
    if (input.name) form.set("name", input.name);
  } else if (input.base64) {
    form.set("image", input.base64);
    if (input.name) form.set("name", input.name);
  } else if (input.imageUrl) {
    form.set("image", input.imageUrl);
    if (input.name) form.set("name", input.name);
  } else {
    throw new ImgbbUploadError("No image data provided.");
  }

  let response: Response;
  try {
    response = await fetch(`https://api.imgbb.com/1/upload?${params}`, {
      method: "POST",
      body: form,
      cache: "no-store",
    });
  } catch {
    throw new ImgbbUploadError("Could not reach ImgBB. Check your connection.");
  }

  let json: ImgbbApiResponse;
  try {
    json = (await response.json()) as ImgbbApiResponse;
  } catch {
    throw new ImgbbUploadError("ImgBB returned an invalid response.");
  }

  if (!response.ok || json.success === false || !json.data?.url) {
    throw new ImgbbUploadError(
      json.error?.message ?? "ImgBB upload failed. Check your API key.",
    );
  }

  const data = json.data;
  return {
    id: data.id ?? "",
    url: data.url!,
    displayUrl: data.display_url ?? null,
    thumbUrl: data.thumb?.url ?? null,
    deleteUrl: data.delete_url ?? null,
    mime: data.image?.mime ?? null,
    width: toNumber(data.width),
    height: toNumber(data.height),
    size: toNumber(data.size),
    title: data.title ?? null,
  };
}

/** Best-effort ImgBB delete by the stored delete_url. */
export async function deleteImage(deleteUrl: string): Promise<void> {
  if (!deleteUrl) return;
  try {
    await fetch(deleteUrl, { method: "GET", cache: "no-store" });
  } catch {
    // Cleanup is best-effort; the DB row is removed regardless.
  }
}
