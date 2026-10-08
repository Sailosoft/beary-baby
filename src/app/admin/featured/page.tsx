import { listAllProductsAdmin, listFeaturedAdmin } from "@/application/product-service";
import { FeaturedForm } from "@/components/admin/featured-form";

// Admin pages read uncached data by design (always fresh). Opt this segment out
// of instant-navigation validation so it may block on the server.
export const instant = false;

export default async function AdminFeaturedPage() {
  const [products, featured] = await Promise.all([
    listAllProductsAdmin(),
    listFeaturedAdmin(),
  ]);

  const featuredMap = new Map(featured.map((f) => [f.productId, f.order]));

  return (
    <div className="card bg-white border border-pink-100">
      <div className="card-body">
        <h2 className="font-semibold text-pink-900">Featured products</h2>
        <p className="text-xs text-pink-400">
          Select products to show on the home page. Lower order numbers appear first.
        </p>
        <FeaturedForm
          products={products.map((p) => ({ id: p.id, name: p.name }))}
          selected={featuredMap}
        />
      </div>
    </div>
  );
}
