import prisma from "@/lib/prisma";

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
