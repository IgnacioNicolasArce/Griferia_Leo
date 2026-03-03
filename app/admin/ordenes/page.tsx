"use client";

import { useEffect, useState } from "react";
import { ShoppingBag, ChevronDown } from "lucide-react";

type Order = {
  id: string;
  order_number?: number | null;
  email: string;
  customer_name: string;
  phone: string;
  status: string;
  total_amount: number;
  created_at: string;
};

export default function AdminOrdenesPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/orders");
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

  async function handleStatusChange(orderId: string, newStatus: string) {
    const res = await fetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      alert(err.error || "Error al actualizar estado");
      return;
    }
    const updated = await res.json();
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: updated.status } : o))
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          Órdenes
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Historial de pedidos y estados.
        </p>
      </div>

      {loading ? (
        <p className="text-center text-sm text-zinc-500">Cargando...</p>
      ) : orders.length === 0 ? (
        <div className="rounded-xl border border-zinc-200 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <ShoppingBag className="mx-auto h-12 w-12 text-zinc-400" />
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            No hay órdenes aún.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <table className="min-w-full text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-zinc-700 dark:text-zinc-300">
                  Nº / Cliente
                </th>
                <th className="px-4 py-3 text-left font-medium text-zinc-700 dark:text-zinc-300">
                  Email
                </th>
                <th className="px-4 py-3 text-right font-medium text-zinc-700 dark:text-zinc-300">
                  Total
                </th>
                <th className="px-4 py-3 text-left font-medium text-zinc-700 dark:text-zinc-300">
                  Estado / Cambiar
                </th>
                <th className="px-4 py-3 text-left font-medium text-zinc-700 dark:text-zinc-300">
                  Fecha
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-zinc-100 last:border-0 dark:border-zinc-800"
                >
                  <td className="px-4 py-3">
                    <div className="font-medium text-zinc-900 dark:text-zinc-100">
                      {order.order_number != null ? `#${order.order_number}` : order.id.slice(0, 8)} · {order.customer_name || "-"}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                    {order.email}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-zinc-900 dark:text-zinc-100">
                    ${Number(order.total_amount).toLocaleString("es-AR")}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className="rounded-lg border border-zinc-200 bg-white px-2 py-1.5 text-xs font-medium text-zinc-700 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                    >
                      <option value="pending">Pendiente</option>
                      <option value="paid">Pagado</option>
                      <option value="processing">Procesando</option>
                      <option value="confirmed">Confirmado</option>
                      <option value="shipped">Enviado</option>
                      <option value="cancelled">Cancelado</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400">
                    {new Date(order.created_at).toLocaleDateString("es-AR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
