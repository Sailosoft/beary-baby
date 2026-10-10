import type { ReactNode } from "react";
import {
  effectiveVariantPrice,
  formatPeso,
  isOutOfStock,
  variantIsOutOfStock,
  type Category,
  type Product,
  type ProductGallery,
} from "@/domain/product";
import { GalleryCarousel } from "@/components/gallery-carousel";

type ViewProduct = Product & {
  categories: Category[];
  galleries: ProductGallery[];
};

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="form-control min-w-0">
      <span className="label-text text-pink-700">{label}</span>
      <div className="text-sm text-pink-900 break-words">{children}</div>
    </div>
  );
}

export function ProductView({ product }: { product: ViewProduct }) {
  const outOfStock = isOutOfStock(product);
  const variants = product.variants ?? [];

  return (
    <div className="flex flex-col gap-5 w-full min-w-0">
      <div className="flex flex-wrap items-center gap-2">
        {outOfStock ? (
          <span className="badge badge-warning badge-sm">Out of stock</span>
        ) : (
          <span className="badge badge-success badge-sm">Available</span>
        )}
        {product.isPreorder && (
          <span className="badge badge-accent badge-sm">Pre-order</span>
        )}
        {!product.displayPrice && (
          <span className="badge badge-ghost badge-sm">Price on inquiry</span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 min-w-0">
        <Field label="Name">{product.name}</Field>
        <Field label="Code">
          <span className="font-mono text-xs">{product.code}</span>
        </Field>
        <Field label="Price (₱)">
          {product.displayPrice
            ? formatPeso(product.price)
            : `Hidden — ${formatPeso(product.price)}`}
        </Field>
        <Field label="Stocks">
          {product.stocks === null || product.stocks === undefined
            ? "Unlimited"
            : product.stocks}
        </Field>
      </div>

      <div className="form-control min-w-0">
        <span className="label-text text-pink-700">Main image & gallery</span>
        <div className="mt-1 w-full max-w-sm">
          <GalleryCarousel
            mainImage={product.imageUrl}
            galleries={product.galleries}
            alt={product.name}
          />
        </div>
      </div>

      <Field label="Description">
        {product.description ? (
          <p className="whitespace-pre-wrap">{product.description}</p>
        ) : (
          <span className="text-pink-300">—</span>
        )}
      </Field>

      {variants.length > 0 && (
        <div className="min-w-0">
          <span className="label-text text-pink-700">
            Variants ({variants.length})
          </span>
          <div className="mt-1 overflow-x-auto">
            <table className="table table-sm">
              <thead>
                <tr className="text-pink-700">
                  <th>Label</th>
                  <th>SKU</th>
                  <th>Price</th>
                  <th>Stocks</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {variants.map((v) => {
                  const vOut = variantIsOutOfStock(v);
                  return (
                    <tr key={v.id}>
                      <td className="font-medium text-pink-900">{v.label}</td>
                      <td className="font-mono text-xs">{v.sku || "—"}</td>
                      <td>
                        {formatPeso(effectiveVariantPrice(v, product))}
                        {(v.price === null || v.price === undefined) && (
                          <span className="ms-1 text-xs text-pink-400">(base)</span>
                        )}
                      </td>
                      <td>
                        {v.stocks === null || v.stocks === undefined
                          ? "Unlimited"
                          : v.stocks}
                      </td>
                      <td>
                        {vOut ? (
                          <span className="badge badge-warning badge-sm">
                            Out of stock
                          </span>
                        ) : (
                          <span className="badge badge-success badge-sm">
                            Available
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <fieldset className="border border-pink-100 rounded-box p-4 min-w-0">
        <legend className="text-xs text-pink-700 px-1">Categories</legend>
        {product.categories.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {product.categories.map((c) => (
              <span key={c.id} className="badge badge-outline badge-sm">
                {c.name}
              </span>
            ))}
          </div>
        ) : (
          <span className="text-sm text-pink-300">None</span>
        )}
      </fieldset>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Field label="Available">{product.available ? "Yes" : "No"}</Field>
        <Field label="Display price">
          {product.displayPrice ? "Yes" : "No"}
        </Field>
        <Field label="Pre-order">{product.isPreorder ? "Yes" : "No"}</Field>
      </div>
    </div>
  );
}
