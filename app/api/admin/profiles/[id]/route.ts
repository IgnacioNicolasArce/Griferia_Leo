import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type Params = { params: Promise<{ id: string }> };

const ALLOWED_ROLES = ["admin", "customer"];

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const url = new URL(request.url);
  const segments = url.pathname.split("/");
  const idFromPath = segments[segments.length - 1] || id;

  if (!idFromPath || idFromPath === "undefined") {
    return NextResponse.json({ error: "ID de usuario inválido" }, { status: 400 });
  }

  const body = await request.json();
  const role = body.role;

  if (!role || typeof role !== "string" || !ALLOWED_ROLES.includes(role)) {
    return NextResponse.json(
      { error: "Rol inválido. Usá: admin o customer" },
      { status: 400 }
    );
  }

  const { data: existing } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .eq("id", idFromPath)
    .single();

  if (existing) {
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .update({ role, updated_at: new Date().toISOString() })
      .eq("id", idFromPath)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(data);
  }

  const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(idFromPath);
  const { data: inserted, error: insertError } = await supabaseAdmin
    .from("profiles")
    .insert({
      id: idFromPath,
      full_name: authUser?.user?.user_metadata?.full_name ?? null,
      email: authUser?.user?.email ?? null,
      role,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 400 });
  }
  return NextResponse.json(inserted);
}
