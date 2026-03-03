"use client";

import { useEffect, useRef, useState } from "react";
import { Plus, Pencil, Trash2, Package, Upload, ImageIcon } from "lucide-react";

type Product = {
  id: string;
  name: string;
  slug: string;
  type: string;
  price: number;
  stock: number;
  description?: string | null;
  main_image_url?: string | null;
};

export default function AdminProductosPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [stockDrafts, setStockDrafts] = useState<Record<string, number>>({});
  const [newProduct, setNewProduct] = useState({
    name: "",
    type: "",
    price: 0,
    stock: 0,
    description: "",
    main_image_url: "" as string | null,
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploadingForId, setUploadingForId] = useState<string | null>(null);
  const [editImageProductId, setEditImageProductId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  async function fetchProducts() {
    setLoading(true);
    const res = await fetch("/api/admin/products");
    const data = await res.json();
    setProducts(Array.isArray(data) ? data : []);
    if (Array.isArray(data)) {
      const initial: Record<string, number> = {};
      data.forEach((p: Product) => {
        initial[p.id] = p.stock;
      });
      setStockDrafts(initial);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  async function handleUpdateStock(id: string, stock: number) {
    const product = products.find((p) => p.id === id);
    if (!product) return;

    const res = await fetch(`/api/admin/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...product, stock }),
    });

    if (!res.ok) return;

    const updated = await res.json();
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, stock: updated.stock } : p))
    );
    setStockDrafts((prev) => ({ ...prev, [id]: updated.stock }));
    setEditingId(null);
  }

  async function handleDeleteProduct(id: string) {
    if (!confirm("¿Eliminar este producto?")) return;
    const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    if (!res.ok) return;
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setStockDrafts((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }

  async function handleUploadFile(file: File, forProductId?: string) {
    setUploading(true);
    if (forProductId) setUploadingForId(forProductId);

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    setUploading(false);
    setUploadingForId(null);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.error || "Error al subir la imagen");
      return null;
    }

    const { url } = await res.json();
    return url;
  }

  async function handleNewProductImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Elegí un archivo de imagen (JPG, PNG, etc.).");
      return;
    }

    try {
      const url = await handleUploadFile(file);
      if (url) setNewProduct((p) => ({ ...p, main_image_url: url }));
    } catch (err) {
      alert("Error al subir. Revisá la consola.");
    }
    e.target.value = "";
  }

  async function handleEditProductImage(productId: string, file: File) {
    const url = await handleUploadFile(file, productId);
    if (!url) return;

    const product = products.find((p) => p.id === productId);
    if (!product) return;

    const res = await fetch(`/api/admin/products/${productId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...product, main_image_url: url }),
    });

    if (!res.ok) return;

    const updated = await res.json();
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, main_image_url: updated.main_image_url } : p))
    );
  }

  async function handleCreateProduct(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);

    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...newProduct,
        description: newProduct.description || null,
        main_image_url: newProduct.main_image_url || null,
      }),
    });

    setCreating(false);

    if (!res.ok) return;

    const created = await res.json();
    setProducts((prev) => [created, ...prev]);
    setStockDrafts((prev) => ({ ...prev, [created.id]: created.stock }));
    setNewProduct({ name: "", type: "", price: 0, stock: 0, description: "", main_image_url: null });
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          Gestionar Productos
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          CRUD de productos con imagen, categoría, precio y stock.
        </p>
      </div>

      <form
        onSubmit={handleCreateProduct}
        className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
      >
        <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          <Plus className="h-4 w-4" />
          Nuevo producto
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <input
            id="new-product-image"
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={handleNewProductImageChange}
          />
          <input
            className="rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            placeholder="Nombre"
            value={newProduct.name}
            onChange={(e) =>
              setNewProduct((p) => ({ ...p, name: e.target.value }))
            }
            required
          />
          <input
            className="rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            placeholder="Tipo (cocina, lavatorio...)"
            value={newProduct.type}
            onChange={(e) =>
              setNewProduct((p) => ({ ...p, type: e.target.value }))
            }
            required
          />
          <input
            type="number"
            className="rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            placeholder="Precio"
            value={newProduct.price || ""}
            onChange={(e) =>
              setNewProduct((p) => ({
                ...p,
                price: Number(e.target.value),
              }))
            }
            required
          />
          <input
            type="number"
            className="rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            placeholder="Stock"
            value={newProduct.stock || ""}
            onChange={(e) =>
              setNewProduct((p) => ({
                ...p,
                stock: Number(e.target.value),
              }))
            }
            required
          />
          <textarea
            className="col-span-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            placeholder="Descripción del producto (opcional)"
            value={newProduct.description}
            onChange={(e) =>
              setNewProduct((p) => ({ ...p, description: e.target.value }))
            }
            rows={3}
          />
        </div>
        <div className="mt-4 space-y-3">
          <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Imagen del producto
          </p>
          <div className="flex flex-wrap items-start gap-4">
            <label
              htmlFor="new-product-image"
              className={`inline-flex cursor-pointer items-center gap-2 rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 ${uploading ? "pointer-events-none opacity-60" : ""}`}
            >
              <Upload className="h-4 w-4" />
              {uploading ? "Subiendo..." : "Subir imagen"}
            </label>
            {newProduct.main_image_url ? (
              <div className="flex flex-col gap-2">
                <img
                  src={newProduct.main_image_url}
                  alt="Imagen subida"
                  className="h-40 w-40 rounded-xl border border-zinc-200 object-cover dark:border-zinc-700"
                />
                <button
                  type="button"
                  onClick={() => setNewProduct((p) => ({ ...p, main_image_url: null }))}
                  className="text-xs font-medium text-red-600 hover:underline"
                >
                  Quitar imagen
                </button>
              </div>
            ) : (
              <div className="flex h-40 w-40 items-center justify-center rounded-xl border-2 border-dashed border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800/50">
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  Sin imagen
                </span>
              </div>
            )}
          </div>
        </div>
        <button
          type="submit"
          disabled={creating}
          className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-70"
        >
          {creating ? "Creando..." : "Agregar producto"}
        </button>
      </form>

      {loading ? (
        <p className="text-center text-sm text-zinc-500">Cargando...</p>
      ) : products.length === 0 ? (
        <div className="rounded-xl border border-zinc-200 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <Package className="mx-auto h-12 w-12 text-zinc-400" />
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            No hay productos. Creá el primero arriba.
          </p>
        </div>
      ) : (
        <>
          <input
            ref={editFileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (file && editImageProductId)
                await handleEditProductImage(editImageProductId, file);
              setEditImageProductId(null);
              e.target.value = "";
            }}
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <div
              key={product.id}
              className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="relative h-36 bg-zinc-100 dark:bg-zinc-800">
                {product.main_image_url ? (
                  <img
                    src={product.main_image_url}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Package className="h-10 w-10 text-zinc-400" />
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setEditImageProductId(product.id);
                    editFileInputRef.current?.click();
                  }}
                  disabled={uploadingForId === product.id}
                  className="absolute bottom-2 right-2 flex items-center gap-1 rounded-lg bg-black/60 px-2 py-1 text-xs font-medium text-white transition hover:bg-black/80 disabled:opacity-50"
                >
                  <ImageIcon className="h-3 w-3" />
                  {uploadingForId === product.id ? "Subiendo..." : "Cambiar"}
                </button>
              </div>
              <div className="p-4">
                <h3 className="font-medium text-zinc-900 dark:text-zinc-100">
                  {product.name}
                </h3>
                <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                  {product.type}
                </p>
                {product.description ? (
                  <p className="mt-1 line-clamp-2 text-xs text-zinc-600 dark:text-zinc-400">
                    {product.description}
                  </p>
                ) : null}
                <p className="mt-2 text-sm font-semibold text-blue-600 dark:text-blue-400">
                  ${product.price.toLocaleString("es-AR")}
                </p>
                <div className="mt-3 flex items-center justify-between">
                  {editingId === product.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        className="w-20 rounded border border-zinc-200 px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-800"
                        value={stockDrafts[product.id] ?? product.stock}
                        onChange={(e) =>
                          setStockDrafts((prev) => ({
                            ...prev,
                            [product.id]: Number(e.target.value),
                          }))
                        }
                      />
                      <button
                        onClick={() =>
                          handleUpdateStock(
                            product.id,
                            stockDrafts[product.id] ?? product.stock
                          )
                        }
                        className="text-xs font-medium text-blue-600 hover:underline"
                      >
                        Guardar
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="text-xs text-zinc-500 hover:underline"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs text-zinc-600 dark:text-zinc-400">
                      Stock: {product.stock}
                    </span>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        setEditingId(editingId === product.id ? null : product.id)
                      }
                      className="rounded p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                      title="Editar stock"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="rounded p-1.5 text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
                      title="Eliminar"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          </div>
        </>
      )}
    </div>
  );
}
