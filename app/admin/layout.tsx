import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingBag,
  ChevronLeft,
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <aside className="fixed inset-y-0 left-0 z-40 w-64 border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex h-16 items-center gap-2 border-b border-zinc-200 px-4 dark:border-zinc-800">
          <span className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Dale Home Tienda
          </span>
          <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
            Admin
          </span>
        </div>
        <nav className="flex flex-col gap-0.5 p-3">
          <Link
            href="/admin"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <LayoutDashboard className="h-5 w-5 text-zinc-500" />
            Panel
          </Link>
          <Link
            href="/admin/productos"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <Package className="h-5 w-5 text-zinc-500" />
            Gestionar Productos
          </Link>
          <Link
            href="/admin/ordenes"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <ShoppingBag className="h-5 w-5 text-zinc-500" />
            Órdenes
          </Link>
          <Link
            href="/admin/usuarios"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <Users className="h-5 w-5 text-zinc-500" />
            Usuarios
          </Link>
          <Link
            href="/"
            className="mt-4 flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
          >
            <ChevronLeft className="h-5 w-5" />
            Ver tienda
          </Link>
        </nav>
      </aside>
      <main className="ml-64 flex-1 p-8">{children}</main>
    </div>
  );
}
