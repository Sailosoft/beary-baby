import { ImportForm } from "@/components/admin/import-form";

export default function AdminImportPage() {
  return (
    <div className="card bg-white border border-pink-100">
      <div className="card-body gap-4">
        <h2 className="font-semibold text-pink-900">Batch import products (CSV)</h2>
        <div className="text-xs text-pink-500 bg-pink-50 rounded-box p-3 font-mono whitespace-pre-wrap">
          {"name,code,description,price,available,stocks,imageUrl,displayPrice,categories\nTeddy Bear Small,BB-001,\"Soft brown teddy\",299,true,10,https://i.ibb.co/x.png,true,Bears"}
        </div>
        <p className="text-xs text-pink-400">
          Rows with an existing product code are skipped. Categories is a
          comma-separated list of existing category names.
        </p>
        <ImportForm />
      </div>
    </div>
  );
}
