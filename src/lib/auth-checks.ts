import prisma from "@/lib/prisma";

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
 * Memvalidasi apakah user memiliki akses ke fitur tertentu (Freemium 3x vs PRO).
 * - Admin: Selalu lolos (Unlimited)
 * - Pro Tools / Pro Plus: Selalu lolos (Unlimited)
 * - Free:
 *   - Jika fitur diset isProOnly = true -> Ditolak (PRO_ONLY)
 *   - Jika fitur diset Free -> Dicek kuota 3x percobaan gratis (QUOTA_EXCEEDED jika >= 3)
 */
export async function verifyFeatureAccess(
  userId: string,
  featureName: string,
  email?: string | null
): Promise<FeatureAccessResult> {
  const isAdmin = email?.toLowerCase() === "anggasrimugiarahayu@gmail.com";
  if (isAdmin) return { authorized: true, isPro: true, remainingQuota: 9999 };

  const [user, feature] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, proToolsExpiredAt: true },
    }),
    prisma.feature.findFirst({
      where: {
        name: { equals: featureName, mode: "insensitive" },
      },
    }),
  ]);

  if (!user) {
    return { authorized: false, isPro: false, code: "UNAUTHORIZED", reason: "User tidak ditemukan" };
  }

  if (user.role === "ADMIN") {
    return { authorized: true, isPro: true, remainingQuota: 9999 };
  }

  const isPro = !!(user.proToolsExpiredAt && new Date(user.proToolsExpiredAt) > new Date());
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
    return {
      authorized: false,
      isPro: false,
      isProOnly: true,
      code: "PRO_ONLY",
      reason: "Fitur ini khusus untuk pengguna PRO. Silakan upgrade ke Paket PRO Tools untuk mengakses.",
    };
  }

  // Free mode feature -> check 3x quota
  const MAX_FREE_QUOTA = 3;
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

  if (currentUsage >= MAX_FREE_QUOTA) {
    return {
      authorized: false,
      isPro: false,
      isProOnly: false,
      featureId: feature?.id,
      currentUsage,
      remainingQuota: 0,
      code: "QUOTA_EXCEEDED",
      reason: "Kuota percobaan gratis kamu sudah habis (3/3).",
    };
  }

  return {
    authorized: true,
    isPro: false,
    isProOnly: false,
    featureId: feature?.id,
    currentUsage,
    remainingQuota: MAX_FREE_QUOTA - currentUsage,
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
  } catch (e) {
    console.error("Failed to increment feature usage:", e);
  }
}

/**
 * Memvalidasi apakah user memiliki akses aktif ke Paket PRO Tools.
 * Berlaku untuk Script Builder, Carousel Builder, ATM Builder, Idea Rooms, Ebook Builder.
 */
export async function verifyProToolsAccess(
  userId: string,
  email?: string | null
): Promise<{ authorized: boolean; reason?: string }> {
  const isAdmin = email?.toLowerCase() === "anggasrimugiarahayu@gmail.com";
  if (isAdmin) return { authorized: true };

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true, proToolsExpiredAt: true },
  });

  if (!user) {
    return { authorized: false, reason: "User tidak ditemukan" };
  }

  if (user.role === "ADMIN") {
    return { authorized: true };
  }

  const isPro = !!(user.proToolsExpiredAt && new Date(user.proToolsExpiredAt) > new Date());
  if (!isPro) {
    return {
      authorized: false,
      reason:
        "Masa aktif Paket PRO Tools Anda telah berakhir atau belum aktif. Silakan upgrade paket untuk melanjutkan.",
    };
  }

  return { authorized: true };
}

/**
 * Memvalidasi apakah user memiliki akses aktif ke Paket PRO Automation.
 * Berlaku untuk Rule Studio, Webhook execution, Follow-Up, dsb.
 */
export async function verifyProAutomationAccess(
  userId: string,
  email?: string | null
): Promise<{ authorized: boolean; reason?: string }> {
  const isAdmin = email?.toLowerCase() === "anggasrimugiarahayu@gmail.com";
  if (isAdmin) return { authorized: true };

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true, proAutomationExpiredAt: true },
  });

  if (!user) {
    return { authorized: false, reason: "User tidak ditemukan" };
  }

  if (user.role === "ADMIN") {
    return { authorized: true };
  }

  const isPro = !!(user.proAutomationExpiredAt && new Date(user.proAutomationExpiredAt) > new Date());
  if (!isPro) {
    return {
      authorized: false,
      reason:
        "Masa aktif Paket PRO Automation Anda telah berakhir atau belum aktif. Silakan upgrade paket untuk melanjutkan.",
    };
  }

  return { authorized: true };
}
