import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import sharp from "sharp";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { deletePhysicalUploadFile } from "@/lib/server-uploads";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_UPLOAD_SIZE_BYTES = 1 * 1024 * 1024; // 1MB

async function verifyAdmin(userId: string, email?: string | null): Promise<boolean> {
  if (email?.toLowerCase() === "anggasrimugiarahayu@gmail.com") return true;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  return user?.role === "ADMIN";
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isAdmin = await verifyAdmin(session.user.id, session.user.email);
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const data = await req.formData();
    const file: File | null = data.get("file") as unknown as File;

    if (!file) {
      return NextResponse.json({ error: "Tidak ada file yang diunggah" }, { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Format file tidak didukung. Gunakan JPG, PNG, WebP, atau GIF." },
        { status: 400 }
      );
    }

    if (file.size > MAX_UPLOAD_SIZE_BYTES) {
      return NextResponse.json(
        { error: "Ukuran gambar cover maksimal 1MB." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const rawBuffer = Buffer.from(bytes);

    // Kompresi & Optimasi Otomatis dengan sharp:
    // Resize max lebar 900px, konversi ke WebP kualitas 80
    let optimizedBuffer: Buffer;
    let mimeType = "image/webp";
    try {
      optimizedBuffer = await sharp(rawBuffer)
        .rotate()
        .resize({ width: 900, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toBuffer();
    } catch (sharpErr) {
      console.warn("Sharp optimization fallback to raw buffer:", sharpErr);
      optimizedBuffer = rawBuffer;
      mimeType = file.type || "image/png";
    }

    // Create safe unique filename
    const ext = mimeType === "image/webp" ? ".webp" : (path.extname(file.name) || ".png");
    const cleanBaseName = path.basename(file.name, path.extname(file.name)).replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 50);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = `${uniqueSuffix}-${cleanBaseName || "cover"}${ext}`;
    
    const uploadDir = path.join(process.cwd(), "public/uploads");
    
    // Try saving to disk (local dev / VPS)
    try {
      await mkdir(uploadDir, { recursive: true });
      const filepath = path.join(uploadDir, filename);
      await writeFile(filepath, optimizedBuffer);

      return NextResponse.json({ 
        success: true, 
        url: `/uploads/${filename}`
      });
    } catch (fsErr: any) {
      // In serverless / read-only environment like Vercel (EROFS),
      // gracefully fallback to lightweight optimized Base64 Data URI (~50KB-120KB)
      const base64Data = optimizedBuffer.toString("base64");
      const dataUri = `data:${mimeType};base64,${base64Data}`;

      return NextResponse.json({ 
        success: true, 
        url: dataUri
      });
    }
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: error?.message || "Gagal mengunggah file" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isAdmin = await verifyAdmin(session.user.id, session.user.email);
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const body = await req.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json({ error: "URL file tidak ditemukan" }, { status: 400 });
    }

    // Base64 data URI or external URL does not have a physical disk file
    if (url.startsWith("data:") || url.startsWith("http://") || url.startsWith("https://")) {
      return NextResponse.json({ success: true, message: "URL dibersihkan" });
    }

    // Remove file from /public/uploads/ if it points to local storage
    if (url.includes("/uploads/")) {
      const deleted = await deletePhysicalUploadFile(url);
      return NextResponse.json({
        success: true,
        message: deleted ? "File fisik berhasil dihapus" : "File sudah tidak ada atau URL dibersihkan"
      });
    }

    return NextResponse.json({ success: true, message: "URL dibersihkan" });
  } catch (error: any) {
    console.error("Delete file error:", error);
    return NextResponse.json({ error: error?.message || "Gagal menghapus file" }, { status: 500 });
  }
}
