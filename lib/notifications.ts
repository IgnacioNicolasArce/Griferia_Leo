import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
const fromEmail =
  process.env.NOTIFICATION_FROM_EMAIL || "Dale Home Tienda <onboarding@resend.dev>";
const adminEmail = process.env.ADMIN_EMAIL || "nachitoarce04@gmail.com";
const adminWhatsApp = process.env.ADMIN_WHATSAPP || "1122628869";

/** Arma el link wa.me para que el cliente abra WhatsApp con mensaje prellenado (exportado para usarlo en checkout) */
export function getWaMeLinkForOrder(customerName: string, orderId: string): string {
  const digits = adminWhatsApp.replace(/\D/g, "");
  const number = digits.startsWith("54") ? digits : `54${digits}`;
  const text = `Hola soy ${customerName} y mi número de orden es ${orderId}`;
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}

export async function sendEmail(params: {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}): Promise<{ ok: boolean; error?: string }> {
  if (!resendApiKey) {
    console.warn("RESEND_API_KEY no configurado, no se envía email.");
    return { ok: false, error: "RESEND_API_KEY no configurado" };
  }
  const resend = new Resend(resendApiKey);
  const to = Array.isArray(params.to) ? params.to : [params.to];
  try {
    const { error } = await resend.emails.send({
      from: fromEmail,
      to,
      subject: params.subject,
      html: params.html,
      text: params.text,
    });
    if (error) {
      console.warn("Resend error:", error);
      return { ok: false, error: error.message };
    }
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error enviando email";
    console.warn("sendEmail error:", message);
    return { ok: false, error: message };
  }
}

/** Notificaciones cuando se crea una nueva orden (estado Pendiente) */
export async function notifyNewOrder(params: {
  customerName: string;
  customerEmail: string;
  orderId?: string;
  orderNumber?: string;
}): Promise<void> {
  const { customerName, customerEmail, orderId, orderNumber } = params;
  const ref = orderNumber ?? orderId ?? "";
  const adminSubject = "Nueva compra recibida - Dale Home Tienda";
  const adminMessage = `Nueva compra recibida de ${customerName}. Pendiente de confirmación de stock.`;

  const waMeUrl = ref ? getWaMeLinkForOrder(customerName, ref) : null;
  const customerHtml = [
    "<p>Gracias por tu compra. Tu pedido está en espera de confirmación por parte del vendedor.</p>",
    waMeUrl
      ? `<p>Podés contactarnos por WhatsApp con tu número de orden: <a href=\"${waMeUrl}\" target=\"_blank\" rel=\"noopener\">Abrir WhatsApp</a></p><p><small>El mensaje se completará automáticamente: &quot;Hola soy ${customerName} y mi número de orden es ${ref}&quot;</small></p>`
      : "",
  ].join("");

  await Promise.all([
    sendEmail({
      to: adminEmail,
      subject: adminSubject,
      html: `<p>${adminMessage}</p>${ref ? `<p>Nº de orden: ${ref}</p>` : ""}`,
    }),
    sendEmail({
      to: customerEmail,
      subject: "Gracias por tu compra - Dale Home Tienda",
      html: customerHtml,
    }),
  ]);
}

/** Notificación al cliente cuando el admin cambia el estado a Confirmado */
export async function notifyOrderConfirmed(params: {
  customerEmail: string;
  customerName?: string;
}): Promise<void> {
  const { customerEmail, customerName } = params;
  const greeting = customerName ? `Hola ${customerName},` : "Hola,";
  await sendEmail({
    to: customerEmail,
    subject: "Tu pedido ha sido confirmado - Dale Home Tienda",
    html: `<p>${greeting}</p><p>¡Tu pedido ha sido confirmado! El vendedor se pondrá en contacto contigo a la brevedad para coordinar la entrega.</p>`,
  });
}
