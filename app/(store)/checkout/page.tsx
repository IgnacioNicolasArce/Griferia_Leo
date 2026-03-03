"use client";

import {
  CreditCard,
  Building2,
  Banknote,
  ShoppingBag,
  ChevronRight,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useMemo, useState } from "react";
import Link from "next/link";
import { submitOrder } from "./actions";
import { useCart } from "@/lib/cart-context";

type PaymentMethod = "card" | "transfer" | "cash";

const PAYMENT_OPTIONS: {
  id: PaymentMethod;
  label: string;
  description: string;
  discount: number;
  icon: React.ElementType;
}[] = [
  {
    id: "card",
    label: "Tarjeta (Crédito/Débito)",
    description: "Pago con Mercado Pago o similar. Precio de lista.",
    discount: 0,
    icon: CreditCard,
  },
  {
    id: "transfer",
    label: "Transferencia bancaria",
    description: "10% de descuento. Te enviamos CBU/Alias.",
    discount: 0.1,
    icon: Building2,
  },
  {
    id: "cash",
    label: "Efectivo",
    description: "10% de descuento. Pagás al retirar.",
    discount: 0.1,
    icon: Banknote,
  },
];

const CBU_ALIAS = "CBU 0000000000000000000000 · Alias: griferia.leo.pago";

export default function CheckoutPage() {
  const { cart, clearCart } = useCart();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [customerName, setCustomerName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );
  const [errorMessage, setErrorMessage] = useState("");
  const [successWaMeLink, setSuccessWaMeLink] = useState<string | null>(null);
  const [successOrderNumber, setSuccessOrderNumber] = useState<string | null>(null);

  const subtotal = useMemo(
    () =>
      cart.reduce(
        (acc, item) => acc + item.quantity * item.product.price,
        0
      ),
    [cart]
  );

  const option = useMemo(
    () => PAYMENT_OPTIONS.find((o) => o.id === paymentMethod),
    [paymentMethod]
  );

  const discountAmount = useMemo(() => {
    if (!option || option.discount <= 0) return 0;
    return subtotal * option.discount;
  }, [subtotal, option]);

  const total = useMemo(
    () => Math.max(0, subtotal - discountAmount),
    [subtotal, discountAmount]
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage("");
    setStatus("loading");

    const result = await submitOrder({
      customerName: customerName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      shippingAddress: shippingAddress.trim() || undefined,
      paymentMethod,
      totalAmount: total,
      items: cart.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
        unitPrice: item.product.price,
      })),
    });

    if (result.success) {
      clearCart();
      setSuccessWaMeLink("waMeLink" in result ? result.waMeLink : null);
      setSuccessOrderNumber("orderNumber" in result ? result.orderNumber : null);
      setStatus("success");
    } else {
      setStatus("error");
      setErrorMessage(result.error);
    }
  }

  if (status === "success") {
    return (
      <main className="min-h-screen bg-zinc-50 px-4 py-12 dark:bg-zinc-950">
        <div className="mx-auto max-w-lg rounded-2xl bg-white p-8 shadow-sm dark:bg-zinc-900 dark:ring-1 dark:ring-zinc-800">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="rounded-full bg-green-100 p-4 dark:bg-green-900/30">
              <ShoppingBag className="h-10 w-10 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
              Compra confirmada
            </h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Recibimos tu pedido.
              {successOrderNumber && (
                <> Tu número de orden es <strong>#{successOrderNumber}</strong>. </>
              )}
              Te contactaremos por email o teléfono para coordinar el pago y la entrega.
            </p>
            {successWaMeLink && (
              <a
                href={successWaMeLink}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center justify-center gap-2 rounded-lg bg-[#25D366] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#20bd5a]"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Enviar WhatsApp con mi número de orden
              </a>
            )}
            <Link
              href="/"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Volver al catálogo
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (cart.length === 0 && status !== "loading") {
    return (
      <main className="min-h-screen bg-zinc-50 px-4 py-12 dark:bg-zinc-950">
        <div className="mx-auto max-w-lg rounded-2xl bg-white p-8 shadow-sm dark:bg-zinc-900 dark:ring-1 dark:ring-zinc-800">
          <div className="flex flex-col items-center gap-4 text-center">
            <ShoppingBag className="h-12 w-12 text-zinc-400 dark:text-zinc-500" />
            <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
              Tu carrito está vacío
            </h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Agregá productos desde el catálogo para finalizar la compra.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Ir al catálogo
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto max-w-4xl px-4 py-8 pb-24">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          ← Volver al catálogo
        </Link>

        <h1 className="mb-8 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 md:text-3xl">
          Finalizar compra
        </h1>

        <form onSubmit={handleSubmit} className="space-y-8 lg:grid lg:grid-cols-[1fr,360px] lg:gap-10 lg:space-y-0">
          <div className="space-y-8">
            <section className="rounded-2xl bg-white p-6 shadow-sm dark:bg-zinc-900 dark:ring-1 dark:ring-zinc-800">
              <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Datos de contacto
              </h2>
              <div className="grid gap-4">
                <div>
                  <label
                    htmlFor="customerName"
                    className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                  >
                    Nombre completo *
                  </label>
                  <input
                    id="customerName"
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500"
                    placeholder="Juan Pérez"
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                  >
                    Email *
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500"
                    placeholder="tu@email.com"
                  />
                </div>
                <div>
                  <label
                    htmlFor="phone"
                    className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                  >
                    Teléfono *
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500"
                    placeholder="+54 11 1234-5678"
                  />
                </div>
                <div>
                  <label
                    htmlFor="shippingAddress"
                    className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                  >
                    Dirección de envío
                  </label>
                  <textarea
                    id="shippingAddress"
                    rows={2}
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500"
                    placeholder="Calle, ciudad, código postal"
                  />
                </div>
              </div>
            </section>

            <section className="rounded-2xl bg-white p-6 shadow-sm dark:bg-zinc-900 dark:ring-1 dark:ring-zinc-800">
              <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Método de pago
              </h2>
              <div className="space-y-3">
                {PAYMENT_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  const selected = paymentMethod === opt.id;
                  return (
                    <label
                      key={opt.id}
                      className={`flex cursor-pointer gap-4 rounded-xl border p-4 transition ${
                        selected
                          ? "border-blue-500 bg-blue-50 ring-2 ring-blue-500/30 dark:border-blue-500 dark:bg-blue-950/30 dark:ring-blue-500/20"
                          : "border-zinc-200 hover:border-zinc-300 dark:border-zinc-700 dark:hover:border-zinc-600"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={opt.id}
                        checked={selected}
                        onChange={() => setPaymentMethod(opt.id)}
                        className="sr-only"
                      />
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
                        <Icon className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-zinc-900 dark:text-zinc-100">
                          {opt.label}
                        </p>
                        <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                          {opt.description}
                        </p>
                        {opt.id === "transfer" && selected && (
                          <p className="mt-2 rounded-lg bg-zinc-100 px-2 py-1.5 font-mono text-xs text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                            {CBU_ALIAS}
                          </p>
                        )}
                        {opt.id === "cash" && selected && (
                          <p className="mt-2 text-xs italic text-zinc-600 dark:text-zinc-400">
                            El pago se realiza al retirar el pedido.
                          </p>
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>
            </section>
          </div>

          <aside className="lg:sticky lg:top-8 lg:self-start">
            <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-zinc-900 dark:ring-1 dark:ring-zinc-800">
              <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Resumen del pedido
              </h2>

              <ul className="mb-4 max-h-48 space-y-2 overflow-y-auto">
                {cart.map((item) => (
                  <li
                    key={item.product.id}
                    className="flex justify-between gap-2 text-sm"
                  >
                    <span className="text-zinc-700 dark:text-zinc-300">
                      {item.product.name} × {item.quantity}
                    </span>
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">
                      $
                      {(item.quantity * item.product.price).toLocaleString(
                        "es-AR"
                      )}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="space-y-2 border-t border-zinc-200 pt-4 dark:border-zinc-700">
                <div className="flex justify-between text-sm text-zinc-600 dark:text-zinc-400">
                  <span>Subtotal</span>
                  <span>${subtotal.toLocaleString("es-AR")}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                    <span>Descuento (10%)</span>
                    <span>-${discountAmount.toLocaleString("es-AR")}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-semibold text-zinc-900 dark:text-zinc-100">
                  <span>Total</span>
                  <span>${total.toLocaleString("es-AR")}</span>
                </div>
              </div>

              {status === "error" && (
                <div className="mt-4 flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-800 dark:bg-red-950/50 dark:text-red-200">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={status === "loading"}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-70 dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                {status === "loading" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Confirmando...
                  </>
                ) : (
                  <>
                    Confirmar compra
                    <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </aside>
        </form>
      </div>
    </main>
  );
}
