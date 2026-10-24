import { unlink } from "fs/promises";
import path from "path";

/**
 * Menghapus file fisik dari direktori public/uploads di server
 * @param url URL path lokal file, contoh: "/uploads/1790932277183-cover.png"
 * @returns boolean true jika berhasil terhapus atau file sudah tidak ada
 */
export async function deletePhysicalUploadFile(url: string | null | undefined): Promise<boolean> {
  if (!url || typeof url !== "string") return false;

  // Bersihkan parameter query seperti ?v=123
  const cleanUrl = url.split("?")[0].trim();
  if (!cleanUrl.startsWith("/uploads/")) return false;

  const fileName = path.basename(cleanUrl);
  if (!fileName || fileName === "uploads") return false;

  const uploadDir = path.join(process.cwd(), "public/uploads");
  const filePath = path.join(uploadDir, fileName);

  // Mencegah path traversal keluar dari folder public/uploads
  if (!filePath.startsWith(uploadDir)) {
    console.warn("Akses path traversal ditolak:", filePath);
    return false;
  }

  try {
    await unlink(filePath);
    return true;
  } catch (err: any) {
    if (err?.code === "ENOENT") {
      // File fisik sudah tidak ada, anggap sukses
      return true;
    }
    console.error("Gagal menghapus file fisik di server:", err);
    return false;
  }
}
