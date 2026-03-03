"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { useToast } from "@/lib/toast";
import type { StoredProduct } from "@/lib/cartStorage";

export default function Home() {
  const [products, setProducts] = useState<StoredProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>("todos");
  const { cartCount, addToCart } = useCart();
  const { addToast } = useToast();

  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await fetch("/api/admin/products");
        const data = await res.json();
        if (Array.isArray(data)) setProducts(data);
        else setProducts([]);
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  const types = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => p?.type && set.add(p.type));
    return Array.from(set);
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (selectedType === "todos") return products;
    return products.filter((p) => p.type === selectedType);
  }, [products, selectedType]);

  function handleAddToCart(product: StoredProduct) {
    if (product.stock <= 0) return;
    addToCart(product);
    addToast("Producto agregado al carrito");
  }

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <section className="mx-auto max-w-6xl px-6 pb-12 pt-12">
        <header className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 md:text-5xl">
              Tu tienda online
            </h1>
            <p className="mt-3 max-w-xl text-sm text-zinc-800 dark:text-zinc-300 md:text-base">
              Catálogo de grifería para cocina, baño y ducha. Filtra por tipo y
              encontrá el modelo ideal para tus proyectos.
            </p>
          </div>
          <div className="flex gap-3 text-sm text-zinc-800 dark:text-zinc-300">
            <div className="rounded-full bg-white px-4 py-2 shadow-sm dark:bg-zinc-900">
              Stock en tiempo real
            </div>
            <div className="hidden rounded-full bg-white px-4 py-2 shadow-sm dark:bg-zinc-900 md:block">
              Pagos con Mercado Pago
            </div>
          </div>
        </header>

        <section className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedType("todos")}
              className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${
                selectedType === "todos"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-white text-zinc-700 shadow-sm hover:bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
              }`}
            >
              Todos
            </button>
            {types.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`rounded-full px-4 py-1.5 text-xs font-medium capitalize transition ${
                  selectedType === type
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-white text-zinc-700 shadow-sm hover:bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-4 text-xs text-zinc-700 dark:text-zinc-400">
            <p>
              {filteredProducts.length} producto
              {filteredProducts.length === 1 ? "" : "s"} disponible
              {selectedType !== "todos" && ` en "${selectedType}"`}
            </p>
            <div className="hidden h-5 w-px bg-zinc-300 dark:bg-zinc-700 md:block" />
            <p className="flex items-center gap-1">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-medium text-white">
                {cartCount}
              </span>
              en carrito
            </p>
          </div>
        </section>

        {loading ? (
          <div className="mt-10 text-center text-sm text-zinc-700 dark:text-zinc-400">
            Cargando catálogo...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="mt-10 rounded-xl bg-white p-10 text-center text-sm text-zinc-700 shadow-sm dark:bg-zinc-900 dark:text-zinc-400">
            No hay productos cargados aún. Accedé al panel de administración
            para crear tu primer producto.
          </div>
        ) : (
          <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredProducts.map((product) => (
                <article
                  key={product.id}
                  className="group flex flex-col overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-100 transition hover:-translate-y-1 hover:shadow-md dark:bg-zinc-900 dark:ring-zinc-800"
                >
                  <div className="relative h-48 w-full bg-zinc-100 dark:bg-zinc-800">
                    {product.main_image_url ? (
                      <div
                        className="h-full w-full bg-cover bg-center"
                        style={{
                          backgroundImage: `url(${product.main_image_url})`,
                        }}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-zinc-600 dark:text-zinc-500">
                        Imagen no disponible
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col gap-2 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <h2 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        {product.name}
                      </h2>
                      <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                        {product.type}
                      </span>
                    </div>
                    {product.description ? (
                      <p className="line-clamp-2 text-xs text-zinc-600 dark:text-zinc-400">
                        {product.description}
                      </p>
                    ) : null}
                    <p className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                      ${product.price.toFixed(2)}
                    </p>
                    <p className="text-xs text-zinc-700 dark:text-zinc-400">
                      {product.stock > 0
                        ? `Stock disponible: ${product.stock}`
                        : "Sin stock"}
                    </p>
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={product.stock <= 0}
                      className="mt-auto inline-flex items-center justify-center rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-zinc-300 dark:disabled:bg-zinc-700"
                    >
                      {product.stock > 0 ? "Agregar al carrito" : "Sin stock"}
                    </button>
                  </div>
                </article>
              ))}
          </section>
        )}
      </section>

      {cartCount > 0 && (
        <Link
          href="/carrito"
          className="fixed bottom-4 right-4 flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-xs font-medium text-white shadow-lg transition hover:bg-blue-700"
        >
          <span>Ver carrito</span>
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white text-[10px] font-semibold text-blue-600">
            {cartCount}
          </span>
        </Link>
      )}
    </main>
  );
}
