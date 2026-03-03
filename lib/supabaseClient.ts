import { createBrowserClient } from "@supabase/ssr";

let _instance: ReturnType<typeof createBrowserClient> | null = null;

function getSupabaseBrowser() {
  if (_instance) return _instance;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY deben estar definidos");
  }
  _instance = createBrowserClient(url, key);
  return _instance;
}

/** Cliente para el navegador: guarda la sesión en cookies para que el middleware la reconozca */
export const supabaseBrowser = new Proxy({} as ReturnType<typeof createBrowserClient>, {
  get(_, prop) {
    return (getSupabaseBrowser() as Record<string, unknown>)[prop as string];
  },
});

