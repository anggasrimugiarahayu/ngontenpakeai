import prisma from "@/lib/prisma";
import { revalidateTag } from "next/cache";
import { getCachedFeatures, getCachedQuotaConfig } from "@/lib/cache";

export interface FeatureAccessResult {
  authorized: boolean;
  isPro: boolean;
  featureId?: string;
  isProOnly?: boolean;
  currentUsage?: number;
  remainingQuota?: number;
  reason?: string;
  code?: "UNAUTHORIZED" | "PRO_ONLY" | "QUOTA_EXCEEDED" | "FEATURE_INACTIVE";
}

/**
 * Memvalidasi apakah user memiliki akses ke fitur tertentu (Freemium vs PRO).
 * - Admin: Selalu lolos (Unlimited)
 * - Pro (sesuai kategori fitur): Selalu lolos (Unlimited)
 * - Free:
 *   - Jika fitur diset isProOnly = true -> Ditolak (PRO_ONLY)
 *   - Jika fitur diset Free -> Dicek kuota percobaan gratis dari konfigurasi admin
 */
export async function verifyFeatureAccess(
  userId: string,
  featureName: string,
  email?: string | null
): Promise<FeatureAccessResult> {
  const isAdmin = email?.toLowerCase() === "anggasrimugiarahayu@gmail.com";
  if (isAdmin) return { authorized: true, isPro: true, remainingQuota: 9999 };

  const [user, allFeatures, quotaConfig] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        role: true,
        proToolsExpiredAt: true,
        proAutomationExpiredAt: true,
        proRisetExpiredAt: true,
      },
    }),
    getCachedFeatures(),
    getCachedQuotaConfig(),
  ]);

  const feature =
    allFeatures.find((f) => f.name.toLowerCase() === featureName.toLowerCase()) ||
    (await prisma.feature.findFirst({
      where: {
        name: { equals: featureName, mode: "insensitive" },
      },
    }));

  if (!user) {
    return { authorized: false, isPro: false, code: "UNAUTHORIZED", reason: "User tidak ditemukan" };
  }

  if (user.role === "ADMIN") {
    return { authorized: true, isPro: true, remainingQuota: 9999 };
  }

  const category = (feature as any)?.category || "ngonten";
  const now = new Date();

  // Evaluasi isPro spesifik berdasarkan kategori fitur
  let isPro = false;
  if (category === "riset") {
    isPro = !!(user.proRisetExpiredAt && new Date(user.proRisetExpiredAt) > now);
  } else if (category === "automation") {
    isPro = !!(user.proAutomationExpiredAt && new Date(user.proAutomationExpiredAt) > now);
  } else {
    // ngonten / tools
    isPro = !!(user.proToolsExpiredAt && new Date(user.proToolsExpiredAt) > now);
  }

  if (isPro) {
    return { authorized: true, isPro: true, featureId: feature?.id, remainingQuota: 9999 };
  }

  // User is Free
  if (feature && !feature.isActive) {
    return {
      authorized: false,
      isPro: false,
      code: "FEATURE_INACTIVE",
      reason: "Fitur ini sedang dinonaktifkan sementara oleh admin.",
    };
  }

  if (feature?.isProOnly) {
    const pkgName =
      category === "riset"
        ? "Paket PRO Riset"
        : category === "automation"
        ? "Paket PRO Auto"
        : "Paket PRO Tools";

    return {
      authorized: false,
      isPro: false,
      isProOnly: true,
      code: "PRO_ONLY",
      reason: `Fitur ini khusus untuk pengguna PRO. Silakan upgrade ke ${pkgName} untuk mengakses.`,
    };
  }

  // Free mode feature -> check dynamic quota from admin setting
  const maxQuota =
    category === "riset"
      ? quotaConfig.risetFreeLimit || 3
      : quotaConfig.ngontenFreeLimit || 3;

  let currentUsage = 0;
  if (feature) {
    const usage = await prisma.usage.findUnique({
      where: {
        userId_featureId: {
          userId,
          featureId: feature.id,
        },
      },
    });
    currentUsage = usage?.count || 0;
  }

  if (currentUsage >= maxQuota) {
    return {
      authorized: false,
      isPro: false,
      isProOnly: false,
      featureId: feature?.id,
      currentUsage,
      remainingQuota: 0,
      code: "QUOTA_EXCEEDED",
      reason: `Kuota percobaan gratis kamu sudah habis (${maxQuota}/${maxQuota}). Silakan upgrade ke Paket PRO untuk akses tanpa batas.`,
    };
  }

  return {
    authorized: true,
    isPro: false,
    isProOnly: false,
    featureId: feature?.id,
    currentUsage,
    remainingQuota: maxQuota - currentUsage,
  };
}

/**
 * Menambahkan 1x pemakaian fitur ke database.
 * HANYA dipanggil setelah AI berhasil menghasilkan output (Fair Usage).
 */
export async function incrementFeatureUsage(userId: string, featureId?: string) {
  if (!userId || !featureId) return;
  try {
    await prisma.usage.upsert({
      where: {
        userId_featureId: { userId, featureId },
      },
      update: { count: { increment: 1 } },
      create: { userId, featureId, count: 1 },
    });
    try {
      (revalidateTag as any)("user-usages", "default");
    } catch {
      try {
        (revalidateTag as any)("user-usages");
      } catch {}
    }
  } catch (e) {
    console.error("Failed to increment feature usage:", e);
  }
}
