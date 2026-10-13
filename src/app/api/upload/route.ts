import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const data = await req.formData();
    const file: File | null = data.get("file") as unknown as File;

    if (!file) {
      return NextResponse.json({ error: "Tidak ada file yang diunggah" }, { status: 400 });
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
    if (url.startsWith("/uploads/")) {
      const fileName = path.basename(url);
      const uploadDir = path.join(process.cwd(), "public/uploads");
      const filePath = path.join(uploadDir, fileName);

      // Prevent path traversal outside uploads directory
      if (!filePath.startsWith(uploadDir)) {
        return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
      }

      try {
        await unlink(filePath);
      } catch (err: any) {
        // Ignore if file doesn't exist
        if (err.code !== "ENOENT") {
          console.error("Error saat menghapus file fisik:", err);
        }
      }

      return NextResponse.json({ success: true, message: "File fisik berhasil dihapus" });
    }

    return NextResponse.json({ success: true, message: "URL dibersihkan" });
  } catch (error: any) {
    console.error("Delete file error:", error);
    return NextResponse.json({ error: error?.message || "Gagal menghapus file" }, { status: 500 });
  }
}
