import { listCategories } from "@/application/category-service";
import { ProductForm } from "@/components/admin/product-form";

export default async function NewProductPage() {
  const categories = await listCategories();
  return (
    <div className="card bg-white border border-pink-100">
      <div className="card-body">
        <h2 className="font-semibold text-pink-900">New product</h2>
        <ProductForm categories={categories} />
      </div>
    </div>
  );
}
