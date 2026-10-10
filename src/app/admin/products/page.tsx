import Link from "next/link";
import { Pencil } from "lucide-react";
import {
  listAllProductsAdmin,
  isOutOfStock,
} from "@/application/product-service";
import { ProductPreviewButton } from "@/components/admin/product-preview-modal";
import { ProductDeleteButton } from "@/components/admin/product-delete-button";
import { VariantBadge } from "@/components/admin/variant-badge";
import { listCategories } from "@/application/category-service";
import { formatPeso } from "@/domain/product";

// Admin pages read uncached data by design (always fresh). Opt this segment out
// of instant-navigation validation so it may block on the server.
export const instant = false;

export default async function AdminProductsPage() {
  const [products, categories] = await Promise.all([
    listAllProductsAdmin(),
    listCategories(),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap justify-between items-center gap-2">
        <h2 className="font-semibold text-pink-900">Products ({products.length})</h2>
        <Link href="/admin/products/new" className="btn btn-primary btn-sm rounded-full">
          + New product
        </Link>
      </div>

      <div className="overflow-x-auto md:overflow-visible bg-white border border-pink-100 rounded-box">
        <table className="table table-sm">
          <thead>
            <tr className="text-pink-700">
              <th>Image</th>
              <th>Name</th>
              <th>Code</th>
              <th>Price</th>
              <th>Categories</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td>
                  <div className="w-10 h-10 rounded overflow-hidden bg-pink-50">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.imageUrl} alt="" className="h-full w-full object-cover" />
                  </div>
                </td>
                <td className="font-medium text-pink-900">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/products/${p.id}/view`}
                      className="link link-hover text-pink-900"
                    >
                      {p.name}
                    </Link>
                    <VariantBadge variants={p.variants} basePrice={p.price} />
                  </div>
                </td>
                <td className="font-mono text-xs">{p.code}</td>
                <td>{p.displayPrice ? formatPeso(p.price) : "—"}</td>
                <td className="text-xs">{p.categories.map((c) => c.name).join(", ")}</td>
                <td>
                  {isOutOfStock(p) ? (
                    <span className="badge badge-warning badge-sm">Out of stock</span>
                  ) : (
                    <span className="badge badge-success badge-sm">Available</span>
                  )}
                  {p.isPreorder && (
                    <span className="badge badge-accent badge-sm ms-1">Pre-order</span>
                  )}
                </td>
                <td className="text-right whitespace-nowrap">
                  <div className="flex justify-end items-center gap-1">
                    <ProductPreviewButton product={p} />
                    <Link
                      href={`/admin/products/${p.id}`}
                      aria-label={`Edit ${p.name}`}
                      data-tip="Edit"
                      className="btn btn-ghost btn-sm btn-circle tooltip tooltip-top"
                    >
                      <Pencil className="size-4" />
                    </Link>
                    <ProductDeleteButton id={p.id} name={p.name} />
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center text-pink-400 py-8">
                  No products yet. Create one or import a CSV.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-pink-400">
        Categories available: {categories.map((c) => c.name).join(", ") || "none"}
      </p>
    </div>
  );
}
