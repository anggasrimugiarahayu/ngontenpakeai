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
export async function fetchFreshInstagramData(userId: string, isAdmin: boolean, targetAgentId?: string) {
  try {
    const db = getDb();
    
    // 1. Ambil semua agen milik user
    const allAccounts = await (db as any).instagramAccount.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { rules: true, logs: true }
        }
      }
    });

    // Format list agen untuk card grid di halaman depan IG Automation
    const agents = allAccounts.map((acc: any) => ({
      id: acc.id,
      name: acc.name || (acc.username ? `Agen @${acc.username}` : "Agen Instagram"),
      username: acc.username || "",
      instagramId: acc.instagramId || "",
      profilePicUrl: acc.profilePicUrl || null,
      isActive: acc.isActive,
      isLinked: Boolean(acc.accessToken && !acc.instagramId?.startsWith("pending_") && !acc.instagramId?.startsWith("unlinked_")),
      createdAt: acc.createdAt ? new Date(acc.createdAt).toISOString() : new Date().toISOString(),
      rulesCount: acc._count?.rules || 0,
      logsCount: acc._count?.logs || 0,
    }));

    // 2. Tentukan agen mana yang aktif saat masuk ke workspace detail
    let activeAccount: any = null;
    if (targetAgentId) {
      activeAccount = allAccounts.find((a: any) => a.id === targetAgentId);
    }
    if (!activeAccount && allAccounts.length > 0) {
      activeAccount = allAccounts.find((a: any) => a.isActive) || allAccounts[0];
    }

    if (!activeAccount) {
      return {
        agents,
        account: null,
        rules: [],
        stats: { totalComments: 0, totalDms: 0 },
        logs: []
      };
    }

    // 3. Hitung statistik dan ambil log aktivitas terbaru untuk agen aktif
    const [rules, totalComments, totalDms, recentLogs] = await Promise.all([
      (db as any).instagramAutomationRule.findMany({
        where: { accountId: activeAccount.id },
        orderBy: { createdAt: "desc" },
        include: {
          _count: {
            select: { logs: true }
          }
        }
      }).catch(() => []),
      (db as any).instagramAutomationLog.count({
        where: { accountId: activeAccount.id, replyCommentStatus: "SENT" }
      }).catch(() => 0),
      (db as any).instagramAutomationLog.count({
        where: { accountId: activeAccount.id, dmStatus: "SENT" }
      }).catch(() => 0),
      (db as any).instagramAutomationLog.findMany({
        where: { accountId: activeAccount.id },
        take: 20,
        orderBy: { createdAt: "desc" },
        include: { rule: { select: { name: true } } }
      }).catch(() => [])
    ]);

    const isLinked = Boolean(
      activeAccount.accessToken &&
      !activeAccount.instagramId?.startsWith("pending_") &&
      !activeAccount.instagramId?.startsWith("unlinked_")
    );

    return {
      agents,
      account: {
        id: activeAccount.id,
        instagramId: activeAccount.instagramId,
        username: activeAccount.username || "",
        name: activeAccount.name || (activeAccount.username ? `Agen @${activeAccount.username}` : "Agen Instagram"),
        profilePicUrl: activeAccount.profilePicUrl,
        isActive: activeAccount.isActive,
        isLinked,
        createdAt: activeAccount.createdAt
      },
      rules: rules || [],
      stats: {
        totalComments,
        totalDms
      },
      logs: recentLogs || []
    };
  } catch (err) {
    console.error("fetchFreshInstagramData error:", err);
    return {
      agents: [],
      account: null,
      rules: [],
      stats: { totalComments: 0, totalDms: 0 },
      logs: []
    };
  }
}

export async function getCachedInstagramData(userId: string, isAdmin: boolean, targetAgentId?: string) {
  return unstable_cache(
    async () => fetchFreshInstagramData(userId, isAdmin, targetAgentId),
    ["instagram-automation-data", userId, targetAgentId || "default"],
    { revalidate: 60, tags: ["instagram-automation", `instagram-automation-${userId}`] }
  )();
}

/**
 * Server Action: Mengambil data automasi Instagram (Real-time untuk SWR)
 */
export async function getInstagramAutomationDataAction(targetAgentId?: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized", agents: [], account: null, rules: [], stats: { totalComments: 0, totalDms: 0 }, logs: [] };
  }

  const userId = session.user.id;
  const isAdmin = session.user.email?.toLowerCase() === "anggasrimugiarahayu@gmail.com";

  try {
    const data = await fetchFreshInstagramData(userId, isAdmin, targetAgentId);
    return JSON.parse(JSON.stringify(data));
  } catch (err) {
    console.error("getInstagramAutomationDataAction error:", err);
    return {
      agents: [],
      account: null,
      rules: [],
      stats: { totalComments: 0, totalDms: 0 },
      logs: []
    };
  }
}

/**
 * Server Action: Membuat Agen Otomasi Instagram Baru
 */
export async function createInstagramAgentAction({ name }: { name: string }) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    const db = getDb();
    const userId = session.user.id;
    const cleanName = name?.trim() || "Agen Baru";
    const pendingId = `pending_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const newAgent = await (db as any).instagramAccount.create({
      data: {
        userId,
        name: cleanName,
        username: "",
        instagramId: pendingId,
        accessToken: "",
        isActive: true,
      }
    });

    revalidateTag("instagram-automation");
    revalidateTag(`instagram-automation-${userId}`);
    revalidatePath("/ruang-automation");
    return { success: true, agent: JSON.parse(JSON.stringify(newAgent)) };
  } catch (err: any) {
    console.error("createInstagramAgentAction error:", err);
    return { success: false, error: err.message || "Gagal membuat agen baru" };
  }
}

/**
 * Server Action: Mengubah detail / nama Agen
 */
export async function updateInstagramAgentAction({
  agentId,
  name,
  isActive
}: {
  agentId: string;
  name?: string;
  isActive?: boolean;
}) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    const db = getDb();
    const userId = session.user.id;
    const isAdmin = session.user.email?.toLowerCase() === "anggasrimugiarahayu@gmail.com";

    const dataToUpdate: any = {};
    if (typeof name === "string") dataToUpdate.name = name.trim();
    if (typeof isActive === "boolean") dataToUpdate.isActive = isActive;

    if (isAdmin) {
      await (db as any).instagramAccount.updateMany({
        where: { id: agentId },
        data: dataToUpdate,
      });
    } else {
      await (db as any).instagramAccount.updateMany({
        where: {
          id: agentId,
          OR: [
            { userId },
            { user: { email: session.user.email || "" } }
          ]
        },
        data: dataToUpdate,
      });
    }

    revalidateTag("instagram-automation");
    revalidateTag(`instagram-automation-${userId}`);
    revalidatePath("/ruang-automation");
    return { success: true };
  } catch (err: any) {
    console.error("updateInstagramAgentAction error:", err);
    return { success: false, error: err.message || "Gagal memperbarui agen" };
  }
}

/**
 * Server Action: Menghapus Agen beserta seluruh aturan & log miliknya
 */
export async function deleteInstagramAgentAction(agentId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    const db = getDb();
    const userId = session.user.id;
    const isAdmin = session.user.email?.toLowerCase() === "anggasrimugiarahayu@gmail.com";

    if (isAdmin) {
      await (db as any).instagramAccount.deleteMany({
        where: { id: agentId }
      });
    } else {
      await (db as any).instagramAccount.deleteMany({
        where: {
          id: agentId,
          OR: [
            { userId },
            { user: { email: session.user.email || "" } }
          ]
        }
      });
    }

    revalidateTag("instagram-automation");
    revalidateTag(`instagram-automation-${userId}`);
    revalidatePath("/ruang-automation");
    return { success: true };
  } catch (err: any) {
    console.error("deleteInstagramAgentAction error:", err);
    return { success: false, error: err.message || "Gagal menghapus agen" };
  }
}

/**
 * Server Action: Menghubungkan akun Instagram
 */
export async function connectInstagramAccountAction(tokenInput?: string, agentId?: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Silakan login terlebih dahulu" };
    }

    const userId = session.user.id;
    const db = getDb();

    // 1. Dapatkan akun target jika agentId diberikan (misal saat Sinkronkan Ulang)
    let existingAccount: any = null;
    if (agentId) {
      existingAccount = await (db as any).instagramAccount.findFirst({
        where: { id: agentId, userId },
      });
    }

    // 2. Tentukan access token: prioritaskan input token, token tersimpan di akun, atau env
    const token =
      tokenInput?.trim() ||
      existingAccount?.accessToken ||
      process.env.INSTAGRAM_ACCESS_TOKEN;

    if (!token) {
      return { success: false, error: "Token Akses Instagram tidak ditemukan" };
    }

    const res = await fetch(
      `https://graph.instagram.com/me?fields=id,username,name,profile_picture_url,account_type&access_token=${token}`
    );
    if (!res.ok) {
      const errText = await res.text();
      console.error("Meta Graph API error:", res.status, errText);
      return { success: false, error: "Token Instagram tidak valid atau telah kedaluwarsa dari Meta" };
    }

    const data = await res.json();
    if (!data.id) {
      return { success: false, error: "Gagal mengambil data Akun Instagram dari Meta" };
    }

    // 3. Pastikan webhook disubscribe ke Meta untuk akun ini (comments, messages, messaging_postbacks)
    await fetch(
      `https://graph.instagram.com/v22.0/me/subscribed_apps?subscribed_fields=comments,messages,messaging_postbacks&access_token=${token}`,
      { method: "POST" }
    ).catch(() => null);

    let account: any = null;

    if (agentId && existingAccount) {
      // Pertahankan Business ID Meta jika sudah ada, simpan Scoped ID di pageId
      const isBusinessId = existingAccount.instagramId && existingAccount.instagramId.startsWith("1784");
      const targetInstagramId = isBusinessId ? existingAccount.instagramId : (data.id || existingAccount.instagramId);

      account = await (db as any).instagramAccount.update({
        where: { id: agentId },
        data: {
          instagramId: targetInstagramId,
          pageId: data.id,
          username: data.username || existingAccount.username,
          name: data.name || (data.username ? `@${data.username}` : existingAccount.name),
          profilePicUrl: data.profile_picture_url || existingAccount.profilePicUrl || null,
          accessToken: token,
          isActive: true,
        },
      });
    } else {
      account = await (db as any).instagramAccount.upsert({
        where: { instagramId: data.id },
        update: {
          userId,
          pageId: data.id,
          username: data.username || "",
          name: data.name || (data.username ? `@${data.username}` : "Akun Instagram"),
          profilePicUrl: data.profile_picture_url || null,
          accessToken: token,
          isActive: true,
        },
        create: {
          userId,
          instagramId: data.id,
          pageId: data.id,
          username: data.username || "",
          name: data.name || (data.username ? `@${data.username}` : "Akun Instagram"),
          profilePicUrl: data.profile_picture_url || null,
          accessToken: token,
          isActive: true,
        },
      });
    }

    revalidateTag("instagram-automation");
    revalidateTag(`instagram-automation-${userId}`);
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
    const account = await (db as any).instagramAccount.findFirst({
      where: {
        id: accountId,
        OR: [
          { userId: session.user.id },
          { user: { email: session.user.email || "" } }
        ]
      }
    });

    const targetAccount = account || (
      session.user.email === "anggasrimugiarahayu@gmail.com"
        ? await (db as any).instagramAccount.findUnique({ where: { id: accountId } })
        : null
    );

    if (!targetAccount) {
      return { success: false, error: "Akun tidak ditemukan atau tidak memiliki izin" };
    }

    const unlinkedId = `unlinked_${accountId}_${Date.now()}`;
    await (db as any).instagramAccount.update({
      where: { id: accountId },
      data: {
        accessToken: "",
        instagramId: unlinkedId,
        username: "",
        profilePicUrl: null,
        isActive: false
      }
    });

    revalidateTag("instagram-automation");
    revalidateTag(`instagram-automation-${session.user.id}`);
    revalidatePath("/ruang-automation");
    return { success: true };
  } catch (error: any) {
    console.error("Disconnect error:", error);
    return { success: false, error: error.message || "Gagal memutuskan koneksi" };
  }
}

/**
 * Server Action: Mengambil postingan feed asli secara real-time dari Meta Graph API
 */
export async function getInstagramFeedMediaAction(limit: number = 12, accountId?: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Silakan login terlebih dahulu", posts: [] };
    }

    const userId = session.user.id;
    const db = getDb();
    let account: any = null;

    const isAdmin = session.user.email?.toLowerCase() === "anggasrimugiarahayu@gmail.com";
    if (accountId) {
      account = await (db as any).instagramAccount.findFirst({
        where: isAdmin
          ? { id: accountId }
          : {
              id: accountId,
              OR: [
                { userId },
                { user: { email: session.user.email || "" } }
              ]
            },
      });
    } else {
      account = await (db as any).instagramAccount.findFirst({
        where: isAdmin
          ? { isActive: true }
          : {
              OR: [
                { userId },
                { user: { email: session.user.email || "" } }
              ],
              isActive: true
            },
      });
    }

    const token = account?.accessToken || process.env.INSTAGRAM_ACCESS_TOKEN;
    const instagramId = account?.instagramId;

    if (!token) {
      return { success: false, error: "Akun Instagram belum terhubung.", posts: [] };
    }

    let mediaItems: any[] = [];
    let metaErrorMessage: string | null = null;

    // 1. Coba panggil Instagram Graph API langsung
    try {
      const igUrl = `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count&limit=${limit}&access_token=${token}`;
      const res = await fetch(igUrl, { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json.data) && json.data.length > 0) {
          mediaItems = json.data;
        }
      } else {
        const errJson = await res.json().catch(() => null);
        if (errJson?.error?.message) {
          metaErrorMessage = errJson.error.message;
        }
      }
    } catch (e: any) {
      console.warn("Direct Instagram Graph API media fetch warning:", e.message || e);
    }

    // 2. Jika belum dapat, coba panggil Facebook Graph API v22.0 (untuk Instagram Business via Page)
    if (mediaItems.length === 0 && instagramId) {
      try {
        const fbUrl = `https://graph.facebook.com/v22.0/${instagramId}/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count&limit=${limit}&access_token=${token}`;
        const res = await fetch(fbUrl, { cache: "no-store" });
        if (res.ok) {
          const json = await res.json();
          if (Array.isArray(json.data) && json.data.length > 0) {
            mediaItems = json.data;
          }
        } else {
          const errJson = await res.json().catch(() => null);
          if (errJson?.error?.message) {
            metaErrorMessage = errJson.error.message;
          }
        }
      } catch (e: any) {
        console.warn("Facebook Graph API media fetch warning:", e.message || e);
      }
    }

    // Jika berhasil mendapatkan data feed asli dari Meta
    if (mediaItems.length > 0) {
      const formattedPosts = mediaItems.map((item: any) => {
        const img = item.media_url || item.thumbnail_url || "";
        const dateObj = item.timestamp ? new Date(item.timestamp) : new Date();
        const formattedDate = dateObj.toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });

        return {
          id: item.id,
          title: item.caption ? (item.caption.length > 45 ? item.caption.slice(0, 45) + "..." : item.caption) : "Postingan Instagram",
          image: img,
          thumb: item.thumbnail_url || img,
          caption: item.caption || "",
          likes: typeof item.like_count === "number" ? item.like_count : 0,
          comments: typeof item.comments_count === "number" ? item.comments_count : 0,
          date: formattedDate,
          mediaType: item.media_type || "IMAGE",
          permalink: item.permalink || `https://instagram.com/p/${item.id}`,
        };
      });

      return {
        success: true,
        isLive: true,
        posts: formattedPosts,
      };
    }

    return {
      success: false,
      isLive: false,
      error: metaErrorMessage || "Belum ada postingan yang ditemukan di akun Instagram ini atau token Meta memerlukan izin ulang.",
      posts: [],
    };
  } catch (err: any) {
    console.error("getInstagramFeedMediaAction exception:", err);
    return {
      success: false,
      error: err.message || "Gagal mengambil feed Instagram dari Meta API",
      posts: [],
    };
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
      where: {
        OR: [
          { userId: session.user.id },
          { user: { email: session.user.email || "" } }
        ],
        isActive: true
      }
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
    revalidateTag(`instagram-automation-${session.user.id}`);
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
    revalidateTag(`instagram-automation-${session.user.id}`);
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
  revalidateTag(`instagram-automation-${session.user.id}`);
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
  revalidateTag(`instagram-automation-${session.user.id}`);
  revalidatePath("/ruang-automation");
  return { success: true };
}

/**
 * Server Action: Menduplikasi aturan automasi (Buat Salinan)
 */
export async function duplicateAutomationRuleAction(ruleId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const db = getDb();
    const rule = await (db as any).instagramAutomationRule.findUnique({
      where: { id: ruleId },
      include: { account: true }
    });

    if (!rule) {
      return { success: false, error: "Aturan tidak ditemukan" };
    }

    const created = await (db as any).instagramAutomationRule.create({
      data: {
        accountId: rule.accountId,
        name: `${rule.name} (Salinan)`,
        triggerType: rule.triggerType,
        specificPostId: rule.specificPostId,
        keywords: rule.keywords || [],
        commentReplies: rule.commentReplies || [],
        dmMessage: rule.dmMessage || "",
        buttonText: rule.buttonText,
        buttonUrl: rule.buttonUrl,
        isActive: false // Dibuat dalam status jeda/nonaktif agar bisa dicek user dahulu
      }
    });

    revalidateTag("instagram-automation");
    revalidateTag(`instagram-automation-${session.user.id}`);
    revalidatePath("/ruang-automation");
    return { success: true, rule: JSON.parse(JSON.stringify(created)) };
  } catch (err: any) {
    console.error("duplicateAutomationRuleAction error:", err);
    return { success: false, error: err.message || "Gagal membuat salinan aturan" };
  }
}
