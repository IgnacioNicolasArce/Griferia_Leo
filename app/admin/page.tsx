"use client";

import { useEffect, useState } from "react";
import {
  DollarSign,
  ShoppingBag,
  Package,
  TrendingUp,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

type Stats = {
  totalRevenue: number;
  totalOrders: number;
  totalStock: number;
  byStatus: Record<string, number>;
  salesByDay: { date: string; ventas: number; ordenes: number }[];
};

const STATUS_COLORS: Record<string, string> = {
  pending: "#94a3b8",
  paid: "#22c55e",
  processing: "#3b82f6",
  confirmed: "#16a34a",
  shipped: "#8b5cf6",
  cancelled: "#ef4444",
};

export default function AdminPanelPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/stats");
        const data = await res.json();
        setStats(data);
      } catch {
        setStats(null);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-sm text-zinc-500">Cargando panel...</p>
      </div>
    );
  }

  const kpis = [
    {
      label: "Ingresos Totales",
      value: `$${(stats?.totalRevenue ?? 0).toLocaleString("es-AR")}`,
      icon: DollarSign,
      color: "bg-emerald-500",
    },
    {
      label: "Total Órdenes",
      value: String(stats?.totalOrders ?? 0),
      icon: ShoppingBag,
      color: "bg-blue-500",
    },
    {
      label: "Stock de Productos",
      value: String(stats?.totalStock ?? 0),
      icon: Package,
      color: "bg-amber-500",
    },
  ];

  const pieData = stats?.byStatus
    ? Object.entries(stats.byStatus).map(([name, value]) => ({
        name: name === "paid" ? "Pagado" : name === "pending" ? "Pendiente" : name === "confirmed" ? "Confirmado" : name === "cancelled" ? "Cancelado" : name,
        value,
        color: STATUS_COLORS[name] ?? "#94a3b8",
      }))
    : [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          Panel de Control
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Resumen de ventas, órdenes e inventario.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.label}
              className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                    {kpi.label}
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
                    {kpi.value}
                  </p>
                </div>
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-lg ${kpi.color} text-white`}
                >
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Ventas últimos 7 días
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.salesByDay ?? []}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-zinc-200 dark:stroke-zinc-700" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v) => new Date(v).toLocaleDateString("es-AR", { day: "2-digit", month: "short" })}
                />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
                <Tooltip
                  formatter={(value) => [`$${Number(value ?? 0).toLocaleString("es-AR")}`, "Ventas"]}
                  labelFormatter={(label) => new Date(label).toLocaleDateString("es-AR")}
                />
                <Bar dataKey="ventas" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Órdenes por estado
          </h2>
          <div className="flex h-64 items-center justify-center">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    nameKey="name"
                  >
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [value ?? 0, "Órdenes"]} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-zinc-500">Sin datos aún</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
