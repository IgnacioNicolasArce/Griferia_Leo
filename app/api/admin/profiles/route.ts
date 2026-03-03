import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  const [authRes, profilesRes] = await Promise.all([
    supabaseAdmin.auth.admin.listUsers({ perPage: 500 }),
    supabaseAdmin.from("profiles").select("id, full_name, email, role, created_at"),
  ]);

  if (authRes.error) {
    return NextResponse.json({ error: authRes.error.message }, { status: 500 });
  }

  const authUsers = authRes.data?.users ?? [];
  const profiles = (profilesRes.data ?? []) as { id: string; full_name: string | null; email: string | null; role: string; created_at: string }[];
  const profileById = new Map(profiles.map((p) => [p.id, p]));

  const merged = authUsers.map((u) => {
    const p = profileById.get(u.id);
    return {
      id: u.id,
      full_name: p?.full_name ?? (u.user_metadata?.full_name as string | undefined) ?? null,
      email: p?.email ?? u.email ?? null,
      role: p?.role ?? "customer",
      created_at: p?.created_at ?? u.created_at ?? new Date().toISOString(),
    };
  });

  merged.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return NextResponse.json(merged);
}
