"use server";

import prisma from "@/lib/prisma";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/auth";
import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";

// Defensive Prisma accessor to guarantee fresh model definitions
let fallbackPrisma: PrismaClient | null = null;
function getDb(): PrismaClient {
  if (prisma && (prisma as any).instagramAccount) {
    return prisma;
  }
  if (!fallbackPrisma) {
    fallbackPrisma = new PrismaClient();
  }
  return fallbackPrisma;
}

/**
 * Cache data automasi Instagram menggunakan unstable_cache (STA / SWR pattern di Next.js)
 * Cache otomatis di-revalidate tiap 60 detik atau instan saat ada perubahan aturan/koneksi.
 */
export const getCachedInstagramData = unstable_cache(
  async (userId: string, isAdmin: boolean) => {
    try {
      const db = getDb();
      let account = await (db as any).instagramAccount.findFirst({
        where: { userId, isActive: true },
        include: {
          rules: {
            orderBy: { createdAt: "desc" }
          }
        }
      });

      if (!account) {
        return {
          account: null,
          rules: [],
          stats: { totalComments: 0, totalDms: 0 },
          logs: []
        };
      }

      // Hitung statistik dan ambil log aktivitas terbaru
      const [totalComments, totalDms, recentLogs] = await Promise.all([
        (db as any).instagramAutomationLog.count({
          where: { accountId: account.id, replyCommentStatus: "SENT" }
        }).catch(() => 0),
        (db as any).instagramAutomationLog.count({
          where: { accountId: account.id, dmStatus: "SENT" }
        }).catch(() => 0),
        (db as any).instagramAutomationLog.findMany({
          where: { accountId: account.id },
          take: 20,
          orderBy: { createdAt: "desc" },
          include: { rule: { select: { name: true } } }
        }).catch(() => [])
      ]);

      return {
        account: {
          id: account.id,
          instagramId: account.instagramId,
          username: account.username,
          name: account.name,
          profilePicUrl: account.profilePicUrl,
          isActive: account.isActive,
          createdAt: account.createdAt
        },
        rules: account.rules || [],
        stats: {
          totalComments,
          totalDms
        },
        logs: recentLogs
      };
    } catch (err) {
      console.error("getCachedInstagramData error:", err);
      return {
        account: null,
        rules: [],
        stats: { totalComments: 0, totalDms: 0 },
        logs: []
      };
    }
  },
  ["instagram-automation-data"],
  { revalidate: 60, tags: ["instagram-automation"] }
);

/**
 * Server Action: Mengambil data automasi Instagram
 */
export async function getInstagramAutomationDataAction() {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized", account: null, rules: [], stats: { totalComments: 0, totalDms: 0 }, logs: [] };
  }

  const userId = session.user.id;
  const isAdmin = session.user.email?.toLowerCase() === "anggasrimugiarahayu@gmail.com";

  try {
    const data = await getCachedInstagramData(userId, isAdmin);
    return JSON.parse(JSON.stringify(data));
  } catch (err) {
    console.error("getInstagramAutomationDataAction error:", err);
    return {
      account: null,
      rules: [],
      stats: { totalComments: 0, totalDms: 0 },
      logs: []
    };
  }
}

/**
 * Server Action: Menghubungkan akun Instagram
 */
export async function connectInstagramAccountAction(tokenInput?: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Silakan login terlebih dahulu" };
    }

    const userId = session.user.id;
    const token = tokenInput?.trim() || process.env.INSTAGRAM_ACCESS_TOKEN;

    if (!token) {
      return { success: false, error: "Token Akses Instagram tidak ditemukan" };
    }

    const res = await fetch(`https://graph.instagram.com/me?fields=id,username,name,profile_picture_url,account_type&access_token=${token}`);
    if (!res.ok) {
      const errText = await res.text();
      console.error("Meta Graph API error:", res.status, errText);
      return { success: false, error: "Token Instagram tidak valid atau telah kedaluwarsa dari Meta" };
    }

    const data = await res.json();
    if (!data.id) {
      return { success: false, error: "Gagal mengambil ID Akun Instagram dari Meta" };
    }

    const db = getDb();

    // Nonaktifkan akun lain milik user ini agar akun yang baru menjadi akun aktif utama
    await (db as any).instagramAccount.updateMany({
      where: { userId },
      data: { isActive: false }
    });

    const account = await (db as any).instagramAccount.upsert({
      where: { instagramId: data.id },
      update: {
        userId,
        username: data.username || "ruangcreativemuslim",
        name: data.name || (data.username ? `@${data.username}` : "Ruang Creative Muslim"),
        profilePicUrl: data.profile_picture_url || null,
        accessToken: token,
        isActive: true
      },
      create: {
        userId,
        instagramId: data.id,
        username: data.username || "ruangcreativemuslim",
        name: data.name || (data.username ? `@${data.username}` : "Ruang Creative Muslim"),
        profilePicUrl: data.profile_picture_url || null,
        accessToken: token,
        isActive: true
      }
    });

    revalidateTag("instagram-automation");
    revalidatePath("/ruang-automation");
    return { success: true, account: JSON.parse(JSON.stringify(account)) };
  } catch (error: any) {
    console.error("Connect Instagram error:", error);
    return { success: false, error: error.message || "Gagal menghubungkan akun Instagram" };
  }
}

/**
 * Server Action: Memutuskan koneksi akun Instagram
 */
export async function disconnectInstagramAccountAction(accountId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const db = getDb();
    const account = await (db as any).instagramAccount.findUnique({
      where: { id: accountId }
    });

    if (!account || (account.userId !== session.user.id && session.user.email !== "anggasrimugiarahayu@gmail.com")) {
      return { success: false, error: "Akun tidak ditemukan atau tidak memiliki izin" };
    }

    await (db as any).instagramAccount.update({
      where: { id: accountId },
      data: { isActive: false }
    });

    revalidateTag("instagram-automation");
    revalidatePath("/ruang-automation");
    return { success: true };
  } catch (error: any) {
    console.error("Disconnect error:", error);
    return { success: false, error: error.message || "Gagal memutuskan koneksi" };
  }
}

/**
 * Server Action: Menyimpan (Create / Update) Aturan Automasi
 */
export async function saveAutomationRuleAction(payload: {
  id?: string;
  ruleId?: string;
  accountId?: string;
  name: string;
  postType?: string;
  postId?: string;
  triggerType?: string;
  keywords?: string[] | string;
  isReplyComment?: boolean;
  replyCommentTemplates?: string[];
  commentReplies?: string[];
  isSendDm?: boolean;
  dmTemplates?: string[];
  dmMessage?: string;
  buttonText?: string;
  buttonUrl?: string;
  isActive?: boolean;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const db = getDb();
  let targetAccountId = payload.accountId;

  // Jika accountId tidak dikirim langsung, cari akun aktif milik user
  if (!targetAccountId) {
    const activeAccount = await (db as any).instagramAccount.findFirst({
      where: { userId: session.user.id, isActive: true }
    });
    if (!activeAccount) {
      throw new Error("Akun Instagram belum terhubung");
    }
    targetAccountId = activeAccount.id;
  }

  // Parse keywords
  let cleanKeywords: string[] = [];
  if (Array.isArray(payload.keywords)) {
    cleanKeywords = payload.keywords.map(k => k.trim().toUpperCase()).filter(Boolean);
  } else if (typeof payload.keywords === "string") {
    cleanKeywords = payload.keywords.split(",").map(k => k.trim().toUpperCase()).filter(Boolean);
  }

  // Parse replies
  let cleanReplies: string[] = [];
  if (Array.isArray(payload.replyCommentTemplates)) {
    cleanReplies = payload.replyCommentTemplates.map(r => r.trim()).filter(Boolean);
  } else if (Array.isArray(payload.commentReplies)) {
    cleanReplies = payload.commentReplies.map(r => r.trim()).filter(Boolean);
  }

  // Parse DM message
  let cleanDm = payload.dmMessage?.trim() || "";
  if (!cleanDm && Array.isArray(payload.dmTemplates) && payload.dmTemplates.length > 0) {
    cleanDm = payload.dmTemplates[0].trim();
  }

  const existingId = payload.id || payload.ruleId;

  if (existingId) {
    // Update
    const updated = await (db as any).instagramAutomationRule.update({
      where: { id: existingId },
      data: {
        name: payload.name.trim(),
        triggerType: payload.postType === "SPECIFIC" ? "SPECIFIC_POST" : "ALL_POSTS",
        specificPostId: payload.postId?.trim() || null,
        keywords: cleanKeywords,
        commentReplies: cleanReplies,
        dmMessage: cleanDm,
        buttonText: payload.buttonText?.trim() || null,
        buttonUrl: payload.buttonUrl?.trim() || null,
        isActive: payload.isActive ?? true
      }
    });

    revalidateTag("instagram-automation");
    revalidatePath("/ruang-automation");
    return { success: true, rule: JSON.parse(JSON.stringify(updated)) };
  } else {
    // Create
    const created = await (db as any).instagramAutomationRule.create({
      data: {
        accountId: targetAccountId,
        name: payload.name.trim() || `Aturan: ${cleanKeywords[0] || "Umum"}`,
        triggerType: payload.postType === "SPECIFIC" ? "SPECIFIC_POST" : "ALL_POSTS",
        specificPostId: payload.postId?.trim() || null,
        keywords: cleanKeywords,
        commentReplies: cleanReplies,
        dmMessage: cleanDm,
        buttonText: payload.buttonText?.trim() || null,
        buttonUrl: payload.buttonUrl?.trim() || null,
        isActive: payload.isActive ?? true
      }
    });

    revalidateTag("instagram-automation");
    revalidatePath("/ruang-automation");
    return { success: true, rule: JSON.parse(JSON.stringify(created)) };
  }
}

/**
 * Server Action: Mengubah status aktif/nonaktif aturan automasi (Toggle switch)
 */
export async function toggleAutomationRuleAction(ruleId: string, isActive: boolean) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const db = getDb();
  await (db as any).instagramAutomationRule.update({
    where: { id: ruleId },
    data: { isActive }
  });

  revalidateTag("instagram-automation");
  revalidatePath("/ruang-automation");
  return { success: true };
}

/**
 * Server Action: Menghapus aturan automasi
 */
export async function deleteAutomationRuleAction(ruleId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const db = getDb();
  await (db as any).instagramAutomationRule.delete({
    where: { id: ruleId }
  });

  revalidateTag("instagram-automation");
  revalidatePath("/ruang-automation");
  return { success: true };
}
