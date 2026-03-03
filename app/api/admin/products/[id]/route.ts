import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const url = new URL(request.url);
  const segments = url.pathname.split("/");
  const idFromPath = segments[segments.length - 1] || id;
  const body = await request.json();

  if (!idFromPath || idFromPath === "undefined") {
    return NextResponse.json(
      { error: "ID de producto inválido en la URL", id: idFromPath },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from("products")
    .update({
      name: body.name,
      description: body.description,
      type: body.type,
      price: body.price,
      stock: body.stock,
      main_image_url: body.main_image_url,
      gallery_urls: body.gallery_urls,
      updated_at: new Date().toISOString(),
    })
    .eq("id", idFromPath)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data);
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  const url = new URL(_request.url);
  const segments = url.pathname.split("/");
  const idFromPath = segments[segments.length - 1] || id;

  if (!idFromPath || idFromPath === "undefined") {
    return NextResponse.json(
      { error: "ID de producto inválido en la URL", id: idFromPath },
      { status: 400 }
    );
  }

  const { error } = await supabaseAdmin
    .from("products")
    .delete()
    .eq("id", idFromPath);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}

