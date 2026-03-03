"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingCart, User, LogOut } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { supabaseBrowser } from "@/lib/supabaseClient";
import type { User as AuthUser } from "@supabase/supabase-js";

export function Navbar() {
  const { cartCount } = useCart();
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    try {
      supabaseBrowser.auth
        .getUser()
        .then((res: { data: { user: AuthUser | null } }) => setUser(res.data.user))
        .catch(() => setUser(null));

      const {
        data: { subscription },
      } = supabaseBrowser.auth.onAuthStateChange(
        (_event: string, session: { user: AuthUser } | null) => {
          setUser(session?.user ?? null);
        }
      );

      return () => subscription.unsubscribe();
    } catch (e) {
      // Si Supabase no está configurado (ej. variables faltantes en Vercel),
      // evitamos romper toda la carga del sitio.
      setUser(null);
      return;
    }
  }, []);

  async function handleSignOut() {
    try {
      await supabaseBrowser.auth.signOut();
    } finally {
      window.location.href = "/";
    }
  }

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/95 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link
          href="/"
          className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100"
        >
          Dale Home Tienda
        </Link>
        <nav className="flex items-center gap-4">
          {user ? (
            <>
              <Link
                href="/ordenes"
                className="text-sm font-medium text-zinc-600 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              >
                Mis Órdenes
              </Link>
              <Link
                href="/carrito"
                className="relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                <ShoppingCart className="h-5 w-5" />
                <span>Carrito</span>
                {cartCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-semibold text-white">
                    {cartCount}
                  </span>
                )}
              </Link>
              <Link
                href="/admin"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
              >
                <User className="h-5 w-5" />
                <span className="hidden sm:inline">Admin</span>
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                title="Cerrar sesión"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Salir</span>
              </button>
            </>
          ) : (
            <>
              <Link
                href="/carrito"
                className="relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                <ShoppingCart className="h-5 w-5" />
                <span>Carrito</span>
                {cartCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-semibold text-white">
                    {cartCount}
                  </span>
                )}
              </Link>
              <Link
                href="/login"
                className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
              >
                Iniciar sesión
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
