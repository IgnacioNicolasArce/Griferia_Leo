"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingBag, ChevronRight } from "lucide-react";

type Order = {
  id: string;
  order_number?: number | null;
  email: string;
  customer_name: string;
  status: string;
  total_amount: number;
  created_at: string;
};

export default function MisOrdenesPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/orders");
        const data = await res.json();
        setOrders(Array.isArray(data) ? data : []);
      } catch {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const statusLabel: Record<string, string> = {
    pending: "Pendiente",
    paid: "Pagado",
    processing: "Procesando",
    confirmed: "Confirmado",
    shipped: "Enviado",
    cancelled: "Cancelado",
  };

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          Mis Órdenes
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Historial de tus compras y estado actual.
        </p>

        {loading ? (
          <p className="mt-8 text-center text-sm text-zinc-500">
            Cargando órdenes...
          </p>
        ) : orders.length === 0 ? (
          <div className="mt-8 rounded-xl border border-zinc-200 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-900">
            <ShoppingBag className="mx-auto h-12 w-12 text-zinc-400" />
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              No tenés órdenes aún.
            </p>
            <Link
              href="/"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Ver catálogo
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <ul className="mt-8 space-y-4">
            {orders.map((order) => (
              <li
                key={order.id}
                className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-zinc-900 dark:text-zinc-100">
                      Orden #{order.order_number ?? order.id.slice(0, 8)}
                    </p>
                    <p className="mt-0.5 text-sm text-zinc-600 dark:text-zinc-400">
                      {new Date(order.created_at).toLocaleDateString("es-AR", {
                        dateStyle: "long",
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                      ${Number(order.total_amount).toLocaleString("es-AR")}
                    </p>
                    <span className="inline-flex rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                      {statusLabel[order.status] ?? order.status}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
