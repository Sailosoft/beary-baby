import { listOrdersAdmin } from "@/application/order-service";
import { formatPeso } from "@/domain/product";
import { updateOrderStatusAction } from "@/app/actions/order-actions";
import { OrderDetailButton } from "@/components/admin/order-detail-modal";
import { OrderDeleteButton } from "@/components/admin/order-delete-button";

export const instant = false;

const STATUSES = ["new", "fulfilled", "cancelled"] as const;

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ customer?: string }>;
}) {
  const sp = await searchParams;
  const customer = sp.customer?.trim() ?? "";
  const orders = await listOrdersAdmin({ customerName: customer });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-semibold text-pink-900">
          Orders ({orders.length})
        </h2>
        <form method="get" className="join">
          <input
            type="search"
            name="customer"
            defaultValue={customer}
            placeholder="Filter by customer name…"
            className="input input-sm join-item w-56 rounded-full border-pink-200/80 bg-white"
          />
          <button type="submit" className="btn btn-sm join-item rounded-full">
            Search
          </button>
        </form>
      </div>

      <div className="overflow-x-auto md:overflow-visible bg-white border border-pink-100 rounded-box">
        <table className="table table-sm">
          <thead>
            <tr className="text-pink-700">
              <th>Date</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total</th>
              <th>Note</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td className="whitespace-nowrap text-xs">
                  {order.createdAt.toLocaleString()}
                  <div className="font-mono text-[10px] text-pink-400">
                    #{order.id.slice(0, 8)}
                  </div>
                </td>
                <td className="font-medium text-pink-900">
                  {order.customerName}
                </td>
                <td>
                  <ul className="flex flex-col gap-0.5 text-xs">
                    {order.items.map((item) => (
                      <li key={item.id}>
                        {item.quantity} × {item.productName}
                        {item.variantLabel ? ` · ${item.variantLabel}` : ""}
                      </li>
                    ))}
                  </ul>
                </td>
                <td className="whitespace-nowrap font-semibold">
                  {formatPeso(order.total)}
                </td>
                <td className="max-w-40 text-xs text-pink-500">
                  {order.note ?? "—"}
                </td>
                <td>
                  <form
                    action={updateOrderStatusAction}
                    className="flex items-center gap-1"
                  >
                    <input type="hidden" name="id" value={order.id} />
                    <select
                      name="status"
                      defaultValue={order.status}
                      className="select select-bordered select-xs"
                    >
                      {STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                    <button type="submit" className="btn btn-ghost btn-xs">
                      Save
                    </button>
                  </form>
                </td>
                <td className="whitespace-nowrap text-right">
                  <OrderDetailButton order={order} />
                  <OrderDeleteButton
                    orderId={order.id}
                    customerName={order.customerName}
                  />
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={7} className="py-8 text-center text-pink-400">
                  No orders{customer ? " for that customer" : ""} yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
