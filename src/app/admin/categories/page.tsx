import Link from "next/link";
import { Pencil } from "lucide-react";
import { listCategories } from "@/application/category-service";
import { CategoryDeleteButton } from "@/components/admin/category-delete-button";
import { CategoryForm } from "@/components/admin/category-form";

export default async function AdminCategoriesPage() {
  const categories = await listCategories();

  return (
    <div className="flex flex-col gap-6">
      <div className="card bg-white border border-pink-100">
        <div className="card-body">
          <h2 className="font-semibold text-pink-900">Add category</h2>
          <CategoryForm />
        </div>
      </div>

      <div className="overflow-x-auto md:overflow-visible bg-white border border-pink-100 rounded-box">
        <table className="table table-sm">
          <thead>
            <tr className="text-pink-700">
              <th>Name</th>
              <th>Slug</th>
              <th>Order</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.id}>
                <td className="font-medium text-pink-900">{c.name}</td>
                <td className="font-mono text-xs">{c.slug}</td>
                <td>{c.order}</td>
                <td className="text-right">
                  <div className="flex justify-end items-center gap-1">
                    <Link
                      href={`/admin/categories/${c.id}`}
                      aria-label={`Edit ${c.name}`}
                      data-tip="Edit"
                      className="btn btn-ghost btn-sm btn-circle tooltip tooltip-top"
                    >
                      <Pencil className="size-4" />
                    </Link>
                    <CategoryDeleteButton id={c.id} name={c.name} />
                  </div>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center text-pink-400 py-8">
                  No categories yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-pink-400">
        Note: editing a category re-derives its slug from the name. Deleting a
        category moves its products to uncategorized.
      </p>
    </div>
  );
}
