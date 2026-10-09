"use client";

import Link from "next/link";
import { useLiveQuery } from "dexie-react-hooks";
import { getLocalDB } from "@/infrastructure/local/db";
import { formatPeso } from "@/domain/product";
import type { OrderHistory } from "@/infrastructure/local/types";

export default function OrdersPage() {
  const orders = useLiveQuery<OrderHistory[], OrderHistory[]>(
    async () => {
      if (typeof window === "undefined") return [];
      return getLocalDB().orderHistory.orderBy("createdAt").reverse().toArray();
    },
    [],
    [],
  );

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-8">
      <h1 className="text-2xl font-extrabold text-pink-900">My orders</h1>
      <p className="-mt-4 text-xs text-pink-400">
        Saved in this browser only.
      </p>

      {orders.length === 0 ? (
        <div className="rounded-3xl border border-pink-100 bg-white py-16 text-center">
          <p className="text-sm text-pink-500">No orders yet.</p>
          <Link
            href="/products"
            className="beary-btn btn mt-4 rounded-full px-6"
          >
            Start shopping
          </Link>
        </div>
      ) : (
        <ul className="flex flex-col gap-4">
          {orders.map((order) => (
            <li
              key={order.id}
              className="rounded-2xl border border-pink-100 bg-white p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-xs text-pink-400">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                  <p className="font-mono text-xs text-pink-400">
                    #{order.serverOrderId.slice(0, 8)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="badge badge-ghost badge-sm">
                    {order.status}
                  </span>
                  <span className="font-extrabold text-pink-900">
                    {formatPeso(order.total)}
                  </span>
                </div>
              </div>
              <ul className="mt-3 flex flex-col gap-1">
                {order.items.map((item, index) => (
                  <li
                    key={index}
                    className="flex items-center justify-between text-sm text-pink-700"
                  >
                    <span className="min-w-0 truncate">
                      {item.name}
                      {item.variantLabel ? ` · ${item.variantLabel}` : ""}
                    </span>
                    <span className="shrink-0 text-pink-500">
                      {item.quantity} × {formatPeso(item.unitPrice)}
                    </span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
