import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (cloudName && apiKey && apiSecret) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });
}

export async function POST(request: Request) {
  if (!cloudName || !apiKey || !apiSecret) {
    return NextResponse.json(
      { error: "Cloudinary no configurado. Agregá CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY y CLOUDINARY_API_SECRET en .env.local" },
      { status: 500 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file || !file.size) {
      return NextResponse.json(
        { error: "No se envió ningún archivo" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString("base64");
    const dataUri = `data:${file.type};base64,${base64}`;

    const result = await new Promise<{ secure_url?: string }>((resolve, reject) => {
      cloudinary.uploader.upload(
        dataUri,
        { folder: "griferia-leo", resource_type: "image" },
        (err, res) => {
          if (err) reject(err);
          else resolve(res ?? {});
        }
      );
    });

    if (!result?.secure_url) {
      throw new Error("Cloudinary no devolvió URL");
    }

    return NextResponse.json({ url: result.secure_url });
  } catch (err) {
    console.error("Error subiendo a Cloudinary:", err);
    const message = err instanceof Error ? err.message : "Error al subir la imagen";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
