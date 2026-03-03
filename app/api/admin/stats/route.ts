import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  const [ordersRes, productsRes] = await Promise.all([
    supabaseAdmin.from("orders").select("id, total_amount, status, created_at"),
    supabaseAdmin.from("products").select("id, stock"),
  ]);

  if (ordersRes.error || productsRes.error) {
    return NextResponse.json(
      { error: ordersRes.error?.message || productsRes.error?.message },
      { status: 500 }
    );
  }

  const orders = ordersRes.data ?? [];
  const products = productsRes.data ?? [];

  const countsTowardRevenue = (status: string) =>
    status !== "pending" && status !== "cancelled";

  const totalRevenue = orders
    .filter((o) => countsTowardRevenue(o.status))
    .reduce((acc, o) => acc + Number(o.total_amount), 0);

  const totalOrders = orders.length;
  const totalStock = products.reduce((acc, p) => acc + (p.stock ?? 0), 0);

  const byStatus = orders.reduce(
    (acc, o) => {
      acc[o.status] = (acc[o.status] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    d.setHours(0, 0, 0, 0);
    return d.toISOString().slice(0, 10);
  });

  const salesByDay = last7Days.map((day) => {
    const dayOrders = orders.filter((o) =>
      o.created_at?.startsWith(day)
    );
    const revenue = dayOrders
      .filter((o) => countsTowardRevenue(o.status))
      .reduce((acc, o) => acc + Number(o.total_amount), 0);
    return {
      date: day,
      ventas: revenue,
      ordenes: dayOrders.length,
    };
  });

  return NextResponse.json({
    totalRevenue,
    totalOrders,
    totalStock,
    byStatus,
    salesByDay,
  });
}
