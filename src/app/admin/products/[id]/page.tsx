import { notFound } from "next/navigation";
import { listCategories } from "@/application/category-service";
import { getProductById } from "@/application/product-service";
import { ProductForm } from "@/components/admin/product-form";

export default async function EditProductPage({
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

  // Attach category names for the form checkboxes.
  const catById = new Map(categories.map((c) => [c.id, c]));
  const productWithCats = {
    ...product,
    categories: product.categories
      .map((c) => catById.get(c.id))
      .filter((c): c is NonNullable<typeof c> => Boolean(c)),
  };

  return (
    <div className="card bg-white border border-pink-100">
      <div className="card-body">
        <h2 className="font-semibold text-pink-900">Edit product</h2>
        <p className="text-xs text-pink-400">
          Slug stays <code className="font-mono">{product.slug}</code> (only changes on create).
        </p>
        <ProductForm categories={categories} product={productWithCats} />
      </div>
    </div>
  );
}
