import Link from "next/link";
import { notFound } from "next/navigation";
import { listCategories } from "@/application/category-service";
import { getProductById } from "@/application/product-service";
import { ProductView } from "@/components/admin/product-view";

// Admin pages read uncached data by design (always fresh). Opt this segment out
// of instant-navigation validation so it may block on the server.
export const instant = false;

export default async function ViewProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    getProductById(id),
    listCategories(),
  ]);
  if (!product) notFound();

  // Attach category names (getProductById only returns category ids).
  const catById = new Map(categories.map((c) => [c.id, c]));
  const productWithCats = {
    ...product,
    categories: product.categories
      .map((c) => catById.get(c.id))
      .filter((c): c is NonNullable<typeof c> => Boolean(c)),
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap justify-between items-center gap-2">
        <div>
          <h2 className="font-semibold text-pink-900">{product.name}</h2>
          <p className="text-xs text-pink-400">Product details (read-only)</p>
        </div>
        <Link
          href={`/admin/products/${id}`}
          className="btn btn-primary btn-sm rounded-full"
        >
          Edit product
        </Link>
      </div>

      <div className="card bg-white border border-pink-100">
        <div className="card-body">
          <ProductView product={productWithCats} />
        </div>
      </div>
    </div>
  );
}
