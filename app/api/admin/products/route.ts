import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

function slugFromName(name: string): string {
  const base = (name ?? "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
  const unique = base ? `${base}-${Date.now().toString(36)}` : `producto-${Date.now()}`;
  return unique;
}

export async function POST(request: Request) {
  const body = await request.json();
  const slug = body.slug ?? slugFromName(body.name ?? "");

  const { data, error } = await supabaseAdmin
    .from("products")
    .insert({
      name: body.name,
      slug,
      description: body.description ?? null,
      type: body.type,
      price: body.price,
      stock: body.stock ?? 0,
      main_image_url: body.main_image_url ?? null,
      gallery_urls: body.gallery_urls ?? [],
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data, { status: 201 });
}

