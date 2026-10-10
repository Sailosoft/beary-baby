import { listUploads } from "@/application/upload-service";
import { CopyButton } from "@/components/admin/copy-button";
import { ManualUploads } from "@/components/admin/manual-uploads";
import { deleteUploadAction } from "@/app/actions/upload-actions";

export const instant = false;

function formatBytes(bytes: number | null): string {
  if (bytes === null || bytes <= 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default async function AdminUploadsPage() {
  const uploads = await listUploads();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap justify-between items-center gap-2">
        <h2 className="font-semibold text-pink-900">
          Uploads ({uploads.length})
        </h2>
        <p className="text-xs text-pink-400">
          Copy a URL, then paste it into a product&apos;s Main image / Gallery
          or a category&apos;s Image URL.
        </p>
      </div>

      <ManualUploads />

      <div className="overflow-x-auto bg-white border border-pink-100 rounded-box">
        <table className="table table-sm">
          <thead>
            <tr className="text-pink-700">
              <th>Image</th>
              <th>URL</th>
              <th>Provider</th>
              <th>Size</th>
              <th>Created</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {uploads.map((u) => (
              <tr key={u.id}>
                <td>
                  <div className="w-12 h-12 rounded overflow-hidden bg-pink-50">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={u.thumbUrl ?? u.imageUrl}
                      alt={u.originalName ?? "upload"}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </td>
                <td className="max-w-xs">
                  <div className="flex items-center gap-1">
                    <span className="truncate font-mono text-xs">{u.imageUrl}</span>
                    <CopyButton value={u.imageUrl} />
                  </div>
                </td>
                <td>
                  <span className="badge badge-ghost badge-sm">{u.provider}</span>
                </td>
                <td className="text-xs">
                  {formatBytes(u.sizeBytes)}
                  {u.width && u.height ? (
                    <span className="text-pink-400">
                      {" "}
                      · {u.width}×{u.height}
                    </span>
                  ) : null}
                </td>
                <td className="whitespace-nowrap text-xs">
                  {u.createdAt.toLocaleString()}
                </td>
                <td className="text-right">
                  <form action={deleteUploadAction}>
                    <input type="hidden" name="id" value={u.id} />
                    <button
                      type="submit"
                      className="btn btn-ghost btn-xs text-error"
                    >
                      Delete
                    </button>
                  </form>
                </td>
              </tr>
            ))}
            {uploads.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-pink-400">
                  No uploads yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
