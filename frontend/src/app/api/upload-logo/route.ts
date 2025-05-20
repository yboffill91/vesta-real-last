import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";

// Permitir solo imágenes jpeg, png, webp
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const UPLOAD_DIR = path.join(process.cwd(), "public", "logos");

export async function POST(req: NextRequest) {
  // Verifica que sea un form-data
  const contentType = req.headers.get("content-type") || "";
  if (!contentType.includes("multipart/form-data")) {
    return NextResponse.json({ error: "Formato no soportado" }, { status: 400 });
  }

  // Extraer el form-data
  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No se envió ningún archivo" }, { status: 400 });
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Tipo de archivo no permitido" }, { status: 400 });
  }

  // Crea el directorio si no existe
  await fs.mkdir(UPLOAD_DIR, { recursive: true });

  // Genera un nombre único
  const ext = file.name.split(".").pop();
  const fileName = `logo_${Date.now()}.${ext}`;
  const filePath = path.join(UPLOAD_DIR, fileName);

  // Guarda el archivo
  const arrayBuffer = await file.arrayBuffer();
  await fs.writeFile(filePath, Buffer.from(arrayBuffer));

  // Devuelve la ruta relativa para guardar en DB
  return NextResponse.json({ url: `/logos/${fileName}` });
}
