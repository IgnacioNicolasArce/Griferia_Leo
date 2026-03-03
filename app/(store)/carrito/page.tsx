"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { ShoppingCart, Minus, Plus, Trash2 } from "lucide-react";

export default function CarritoPage() {
  const { cart, cartCount, updateQuantity, removeFromCart, clearCart } =
    useCart();

  const total = useMemo(
    () =>
      cart.reduce(
        (acc, item) => acc + item.quantity * item.product.price,
        0
      ),
    [cart]
  );

  if (cartCount === 0) {
    return (
      <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
        <div className="mx-auto max-w-3xl px-6 py-16 text-center">
          <ShoppingCart className="mx-auto h-16 w-16 text-zinc-400" />
          <h1 className="mt-4 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            Tu carrito está vacío
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Agregá productos desde el catálogo y volvé acá para ver el resumen
            y proceder al pago.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            Ver catálogo
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto max-w-4xl px-6 py-10">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          Carrito
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Revisá los productos y procedé al pago cuando estés listo.
        </p>

        <div className="mt-8 space-y-6">
          {cart.map((item) => (
            <article
              key={item.product.id}
              className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:flex-row sm:items-start"
            >
              <div className="h-32 w-full shrink-0 overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800 sm:h-28 sm:w-28">
                {item.product.main_image_url ? (
                  <img
                    src={item.product.main_image_url}
                    alt={item.product.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-zinc-500">
                    Sin imagen
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="font-medium text-zinc-900 dark:text-zinc-100">
                  {item.product.name}
                </h2>
                <p className="mt-0.5 text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  {item.product.type}
                </p>
                {item.product.description ? (
                  <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">
                    {item.product.description}
                  </p>
                ) : null}
                <p className="mt-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  ${item.product.price.toFixed(2)} c/u
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-1 rounded-lg border border-zinc-200 dark:border-zinc-700">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.product.id, -1)}
                      className="flex h-8 w-8 items-center justify-center text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                      aria-label="Menos"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="min-w-[2rem] text-center text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.product.id, 1)}
                      className="flex h-8 w-8 items-center justify-center text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                      aria-label="Más"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFromCart(item.product.id)}
                    className="flex items-center gap-1 text-xs font-medium text-red-600 hover:underline"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Quitar
                  </button>
                </div>
              </div>
              <div className="flex shrink-0 flex-col items-end sm:items-end">
                <span className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                  $
                  {(item.quantity * item.product.price).toFixed(2)}
                </span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  {item.quantity} × ${item.product.price.toFixed(2)}
                </span>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-8 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between text-base font-semibold text-zinc-900 dark:text-zinc-100">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-between">
            <button
              type="button"
              onClick={clearCart}
              className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
            >
              Vaciar carrito
            </button>
            <Link
              href="/checkout"
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              Proceder al pago
            </Link>
          </div>
        </div>

        <p className="mt-4 text-center">
          <Link
            href="/"
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            Seguir comprando
          </Link>
        </p>
      </div>
    </main>
  );
}
