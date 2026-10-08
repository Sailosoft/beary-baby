import { notFound } from "next/navigation";
import { getCategoryById } from "@/application/category-service";
import { CategoryForm } from "@/components/admin/category-form";

// Admin pages read uncached data by design (always fresh). Opt this segment out
// of instant-navigation validation so it may block on the server.
export const instant = false;

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const category = await getCategoryById(id);
  if (!category) notFound();

  return (
    <div className="card bg-white border border-pink-100">
      <div className="card-body">
        <h2 className="font-semibold text-pink-900">Edit category</h2>
        <p className="text-xs text-pink-400">
          Slug is re-derived from the name on save (currently{" "}
          <code className="font-mono">{category.slug}</code>).
        </p>
        <CategoryForm category={category} />
      </div>
    </div>
  );
}
