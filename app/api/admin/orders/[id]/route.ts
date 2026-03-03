import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { notifyOrderConfirmed } from "@/lib/notifications";

type Params = { params: Promise<{ id: string }> };

const ALLOWED_STATUSES = ["pending", "paid", "processing", "confirmed", "shipped", "cancelled"];

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const url = new URL(request.url);
  const segments = url.pathname.split("/");
  const idFromPath = segments[segments.length - 1] || id;
  const body = await request.json();

  if (!idFromPath || idFromPath === "undefined") {
    return NextResponse.json(
      { error: "ID de orden inválido" },
      { status: 400 }
    );
  }

  const status = body.status;
  if (!status || typeof status !== "string" || !ALLOWED_STATUSES.includes(status)) {
    return NextResponse.json(
      { error: "Estado inválido. Usá: pending, paid, processing, confirmed, shipped, cancelled" },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from("orders")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", idFromPath)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (status === "confirmed" && data?.email) {
    try {
      await notifyOrderConfirmed({
        customerEmail: data.email,
        customerName: data.customer_name ?? undefined,
      });
    } catch (e) {
      console.warn("Notificación de pedido confirmado no enviada:", e);
    }
  }

  return NextResponse.json(data);
}
