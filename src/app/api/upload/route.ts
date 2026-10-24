import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { auth } from "@/auth";
import { deletePhysicalUploadFile } from "@/lib/server-uploads";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
        { error: "Ukuran file maksimal 10MB." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create safe unique filename
    const ext = path.extname(file.name) || ".png";
    const cleanBaseName = path.basename(file.name, ext).replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 50);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = `${uniqueSuffix}-${cleanBaseName || "cover"}${ext}`;
    
    const uploadDir = path.join(process.cwd(), "public/uploads");
    
    // Try saving to disk (local dev / VPS)
    try {
      await mkdir(uploadDir, { recursive: true });
      const filepath = path.join(uploadDir, filename);
      await writeFile(filepath, buffer);

      return NextResponse.json({ 
        success: true, 
        url: `/uploads/${filename}`
      });
    } catch (fsErr: any) {
      // In serverless / read-only environment like Vercel (EROFS),
      // gracefully fallback to Base64 Data URI so upload never fails.
      console.warn("Disk write unavailable, fallback to base64 Data URI:", fsErr?.message);
      const mimeType = file.type || "image/png";
      const base64Data = buffer.toString("base64");
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
