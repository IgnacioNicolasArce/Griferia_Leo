import { NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
const client = accessToken
  ? new MercadoPagoConfig({ accessToken })
  : null;
const paymentClient = client ? new Payment(client) : null;

export async function POST(request: Request) {
  if (!paymentClient) {
    return NextResponse.json(
      { error: "MERCADOPAGO_ACCESS_TOKEN no configurado" },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();

    const paymentId = body?.data?.id;
    const eventType = body?.type;

    if (!paymentId || eventType !== "payment") {
      return NextResponse.json({ message: "Evento ignorado" }, { status: 200 });
    }

    const paymentData = await paymentClient.get({ id: paymentId }) as { id?: number; status?: string };
    const status = paymentData.status;
    const mpPaymentId = String(paymentData.id ?? paymentId);

    if (status === "approved") {
      const { error } = await supabaseAdmin
        .from("orders")
        .update({
          status: "paid",
          mp_payment_id: mpPaymentId,
          updated_at: new Date().toISOString(),
        })
        .eq("mp_payment_id", mpPaymentId);

      if (error) {
        console.error("Error actualizando orden:", error.message);
        return NextResponse.json(
          { error: "Order update failed" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("Error en webhook Mercado Pago:", error);
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}
