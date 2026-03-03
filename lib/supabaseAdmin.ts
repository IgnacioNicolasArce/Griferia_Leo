import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let _instance: SupabaseClient | null = null;

function getSupabaseAdmin(): SupabaseClient {
  if (_instance) return _instance;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY deben estar definidos");
  }
  _instance = createClient(url, key, { auth: { persistSession: false } });
  return _instance;
}

export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    return (getSupabaseAdmin() as unknown as Record<string, unknown>)[prop as string];
  },
});

