"use server";

import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { createClient } from "@/lib/supabase/server";
import { notifyNewOrder, getWaMeLinkForOrder } from "@/lib/notifications";

export type CheckoutItem = {
  productId: string;
  quantity: number;
  unitPrice: number;
};

export type CheckoutPayload = {
  customerName: string;
  email: string;
  phone: string;
  shippingAddress?: string;
  paymentMethod: "card" | "transfer" | "cash";
  totalAmount: number;
  items: CheckoutItem[];
};

export async function submitOrder(payload: CheckoutPayload): Promise<
  | { success: true; orderId: string; orderNumber: string; waMeLink: string }
  | { success: false; error: string }
> {
  const { customerName, email, phone, shippingAddress, paymentMethod, totalAmount, items } =
    payload;

  if (!customerName?.trim() || !email?.trim() || !phone?.trim()) {
    return { success: false, error: "Nombre, email y teléfono son obligatorios." };
  }

  if (!items?.length) {
    return { success: false, error: "El carrito está vacío." };
  }

  try {
    let userId: string | null = null;
    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      userId = user?.id ?? null;
    } catch {
      // Sin sesión
    }

    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert({
        user_id: userId,
        email: email.trim(),
        customer_name: customerName.trim(),
        phone: phone.trim(),
        shipping_address: shippingAddress?.trim() || null,
        payment_method: paymentMethod,
        status: "pending",
        total_amount: totalAmount,
      })
      .select("id, order_number")
      .single();

    if (orderError) {
      console.error("Error creando orden:", orderError);
      return {
        success: false,
        error: orderError.message || "Error al crear la orden.",
      };
    }

    const orderId = order.id;
    const orderNumber = String(order.order_number ?? orderId);

    const rows = items.map((item) => ({
      order_id: orderId,
      product_id: item.productId,
      quantity: item.quantity,
      unit_price: item.unitPrice,
    }));

    const { error: itemsError } = await supabaseAdmin
      .from("order_items")
      .insert(rows);

    if (itemsError) {
      console.error("Error creando order_items:", itemsError);
      await supabaseAdmin.from("orders").delete().eq("id", orderId);
      return {
        success: false,
        error: itemsError.message || "Error al guardar los ítems.",
      };
    }

    try {
      await notifyNewOrder({
        customerName: customerName.trim(),
        customerEmail: email.trim(),
        orderId,
        orderNumber,
      });
    } catch (e) {
      console.warn("Notificaciones de nueva orden no enviadas:", e);
    }

    const waMeLink = getWaMeLinkForOrder(customerName.trim(), orderNumber);
    return { success: true, orderId, orderNumber, waMeLink };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error inesperado.";
    return { success: false, error: message };
  }
}
