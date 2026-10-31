"use server";

import prisma from "@/lib/prisma";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/auth";
import { revalidatePath, revalidateTag as nextRevalidateTag, unstable_cache } from "next/cache";
import { isAdminEmail } from "@/lib/admin";

function revalidateTag(tag: string) {
  try {
    (nextRevalidateTag as any)(tag, "default");
  } catch {
    try {
      (nextRevalidateTag as any)(tag);
    } catch {}
  }
}

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

async function assertProAutomation(userId: string, email?: string | null, agentId?: string) {
  const isAdmin = isAdminEmail(email);
  if (isAdmin) return true;

  const db = getDb();
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { role: true, proAutomationExpiredAt: true }
  });

  if (user?.role === "ADMIN") return true;

  const now = new Date();
  if (agentId) {
    const agent = await (db as any).instagramAccount.findUnique({
      where: { id: agentId },
      select: { expiredAt: true }
    });
    if (agent?.expiredAt) {
      if (new Date(agent.expiredAt) > now) return true;
      throw new Error("Masa aktif untuk Agen ini telah berakhir. Silakan perpanjang agen untuk mengelola aturan.");
    }
  }

  const isPro = !!(user?.proAutomationExpiredAt && new Date(user.proAutomationExpiredAt) > now);
  if (!isPro) {
    throw new Error("Masa aktif Paket PRO Automation Anda telah berakhir atau belum aktif. Silakan perpanjang paket untuk mengelola aturan.");
  }
  return true;
}

/**
 * Cache data automasi Instagram menggunakan unstable_cache (STA / SWR pattern di Next.js)
 * Cache otomatis di-revalidate tiap 60 detik atau instan saat ada perubahan aturan/koneksi.
 */
async function fetchFreshInstagramData(userId: string, isAdmin: boolean, targetAgentId?: string) {
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

    // Ambil data user untuk mengetahui kuota limit agen & fallback expiry
    const userRecord = await db.user.findUnique({
      where: { id: userId },
      select: { role: true, automationAgentLimit: true, proAutomationExpiredAt: true }
    });
    const agentLimit = (isAdmin || userRecord?.role === "ADMIN") ? 999 : (userRecord?.automationAgentLimit || 1);
    const now = new Date();

    // Format list agen untuk card grid di halaman depan IG Automation
    const agents = allAccounts.map((acc: any) => {
      const expiry = acc.expiredAt ? new Date(acc.expiredAt) : (userRecord?.proAutomationExpiredAt ? new Date(userRecord.proAutomationExpiredAt) : null);
      const isExpired = !isAdmin && userRecord?.role !== "ADMIN" && !!(expiry && expiry <= now);

      return {
        id: acc.id,
        name: acc.name || (acc.username ? `Agen @${acc.username}` : "Agen Instagram"),
        username: acc.username || "",
        boundUsername: acc.boundUsername || null,
        boundInstagramId: acc.boundInstagramId || null,
        profileName: acc.profileName || "",
        instagramId: acc.instagramId || "",
        profilePicUrl: acc.profilePicUrl || null,
        isActive: acc.isActive,
        isLinked: Boolean(acc.accessToken && !acc.instagramId?.startsWith("pending_") && !acc.instagramId?.startsWith("unlinked_")),
        expiredAt: expiry ? expiry.toISOString() : null,
        isTrial: Boolean(acc.isTrial),
        isExpired,
        createdAt: acc.createdAt ? new Date(acc.createdAt).toISOString() : new Date().toISOString(),
        updatedAt: acc.updatedAt ? new Date(acc.updatedAt).toISOString() : new Date().toISOString(),
        rulesCount: acc._count?.rules || 0,
        logsCount: acc._count?.logs || 0,
      };
    });

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
        agentLimit,
        account: null,
        rules: [],
        stats: { totalComments: 0, totalDms: 0 },
        logs: []
      };
    }

    const allAccountIds = allAccounts.map((a: any) => a.id);

    // 3. Hitung statistik dan ambil seluruh rules & log untuk semua agen milik user sekaligus
    // agar saat user klik agen & buka Komentar IG ke DM, card langsung tampil 0ms tanpa delay fetch ulang
    const [rules, totalComments, totalDms, recentLogs] = await Promise.all([
      (db as any).instagramAutomationRule.findMany({
        where: { accountId: { in: allAccountIds } },
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
        where: { accountId: { in: allAccountIds } },
        take: 500,
        orderBy: { createdAt: "desc" },
        include: { rule: { select: { name: true } } }
      }).catch(() => [])
    ]);

    // Auto-backfill postCoverUrl jika ada rule SPECIFIC_POST / SPECIFIC_STORY yang kehilangan postCoverUrl saat di-edit sebelumnya
    if (Array.isArray(rules) && rules.length > 0) {
      await Promise.all(
        rules.map(async (rule: any) => {
          if (!rule.specificPostId) return;
          if (rule.triggerType !== "SPECIFIC_POST" && rule.triggerType !== "SPECIFIC_STORY") return;
          let cfg: any = {};
          try {
            if (typeof rule.dmMessage === "string" && rule.dmMessage.trim().startsWith("{")) {
              cfg = JSON.parse(rule.dmMessage);
            }
          } catch {}
          if (cfg.postCoverUrl) return;

          const ownerAcc = allAccounts.find((a: any) => a.id === rule.accountId) || activeAccount;
          const token = ownerAcc?.accessToken;
          if (!token) return;

          try {
            const mediaRes = await fetch(
              `https://graph.instagram.com/${rule.specificPostId}?fields=id,media_url,thumbnail_url,caption,permalink&access_token=${token}`,
              { next: { revalidate: 300 } }
            );
            if (mediaRes.ok) {
              const mediaJson = await mediaRes.json();
              const resolvedCover = mediaJson.thumbnail_url || mediaJson.media_url || null;
              if (resolvedCover) {
                cfg.postCoverUrl = resolvedCover;
                if (mediaJson.permalink && !cfg.postPermalink) {
                  cfg.postPermalink = mediaJson.permalink;
                }
                const updatedDm = JSON.stringify(cfg);
                rule.dmMessage = updatedDm;
                await (db as any).instagramAutomationRule.update({
                  where: { id: rule.id },
                  data: { dmMessage: updatedDm }
                }).catch(() => {});
              }
            }
          } catch {}
        })
      );
    }

    const isLinked = Boolean(
      activeAccount.accessToken &&
      !activeAccount.instagramId?.startsWith("pending_") &&
      !activeAccount.instagramId?.startsWith("unlinked_")
    );

    return {
      agents,
      agentLimit,
      account: {
        id: activeAccount.id,
        instagramId: activeAccount.instagramId,
        boundInstagramId: activeAccount.boundInstagramId || null,
        boundUsername: activeAccount.boundUsername || null,
        username: activeAccount.username || "",
        name: activeAccount.name || (activeAccount.username ? `Agen @${activeAccount.username}` : "Agen Instagram"),
        profileName: activeAccount.profileName || "",
        profilePicUrl: activeAccount.profilePicUrl,
        isActive: activeAccount.isActive,
        isLinked,
        createdAt: activeAccount.createdAt,
        updatedAt: activeAccount.updatedAt,
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

/**
 * Server Action: Mengambil data automasi Instagram (Real-time untuk SWR)
 */
export async function getInstagramAutomationDataAction(targetAgentId?: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized", agents: [], account: null, rules: [], stats: { totalComments: 0, totalDms: 0 }, logs: [] };
  }

  const userId = session.user.id;
  const isAdmin = isAdminEmail(session.user.email);

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
    const isAdmin = isAdminEmail(session.user.email);

    // Validasi kuota agen:
    const user = await (db as any).user.findUnique({
      where: { id: userId },
      select: { role: true, automationAgentLimit: true, proAutomationExpiredAt: true }
    });

    const isUserAdmin = isAdmin || user?.role === "ADMIN";
    const allowedLimit = user?.automationAgentLimit || 1;

    const currentAgentCount = await (db as any).instagramAccount.count({
      where: {
        OR: [
          { userId },
          { user: { email: session.user.email || "" } }
        ]
      }
    });

    if (!isUserAdmin && currentAgentCount >= allowedLimit) {
      return {
        success: false,
        error: "payment_required",
        message: "Anda telah memiliki 1 agen aktif. Untuk membuat agen baru, silakan lakukan pembayaran paket terlebih dahulu."
      };
    }

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
        expiredAt: user?.proAutomationExpiredAt ? new Date(user.proAutomationExpiredAt) : null,
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
    const isAdmin = isAdminEmail(session.user.email);

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
    const isAdmin = isAdminEmail(session.user.email);

    const existing = await (db as any).instagramAccount.findFirst({
      where: isAdmin
        ? { id: agentId }
        : {
            id: agentId,
            OR: [
              { userId },
              { user: { email: session.user.email || "" } }
            ]
          }
    });

    if (!existing) {
      return { success: false, error: "Agen tidak ditemukan" };
    }

    // Proteksi: Jika user bukan admin dan agen sudah pernah terikat ke akun Instagram,
    // tidak boleh dihapus untuk mencegah manipulasi ganti akun gratis!
    if (!isAdmin && existing.boundInstagramId) {
      return {
        success: false,
        error: "Agen yang sudah terhubung dengan akun Instagram tidak dapat dihapus. Silakan hubungi admin jika ingin melakukan perubahan akun."
      };
    }

    if (existing?.accessToken) {
      await fetch(
        `https://graph.instagram.com/v22.0/me/subscribed_apps?access_token=${existing.accessToken}`,
        { method: "DELETE" }
      ).catch(() => null);
      await fetch(
        `https://graph.facebook.com/v22.0/me/subscribed_apps?access_token=${existing.accessToken}`,
        { method: "DELETE" }
      ).catch(() => null);
    }

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
 * Server Action: Menghubungkan / Sinkronisasi Ulang akun Instagram
 */
export async function connectInstagramAccountAction(tokenInput?: string, agentId?: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Silakan login terlebih dahulu" };
    }

    const userId = session.user.id;
    await assertProAutomation(userId, session.user.email);
    const isAdmin = isAdminEmail(session.user.email);
    const db = getDb();

    // 1. Dapatkan akun target jika agentId diberikan (misal saat Sinkronkan Ulang)
    let existingAccount: any = null;
    if (agentId) {
      existingAccount = await (db as any).instagramAccount.findFirst({
        where: isAdmin
          ? { id: agentId }
          : {
              id: agentId,
              OR: [
                { userId },
                { user: { email: session.user.email || "" } }
              ]
            },
      });
    }

    // 2. Tentukan access token: prioritaskan input token atau token tersimpan di akun
    const token = tokenInput?.trim() || existingAccount?.accessToken;

    if (!token) {
      return { success: false, error: "Token Akses Instagram tidak ditemukan" };
    }

    let data: any = null;
    let isFbGraph = false;

    // A. Jika token Facebook Page / Meta Graph (diawali EAA)
    if (token.startsWith("EAA") || token.startsWith("EAAG")) {
      try {
        const fbRes = await fetch(
          `https://graph.facebook.com/v22.0/me?fields=id,name,instagram_business_account{id,username,name,profile_picture_url}&access_token=${token}`
        );
        if (fbRes.ok) {
          const fbData = await fbRes.json();
          if (fbData.instagram_business_account?.id) {
            data = {
              id: fbData.id,
              user_id: fbData.instagram_business_account.id,
              username: fbData.instagram_business_account.username,
              name: fbData.instagram_business_account.name || fbData.name,
              profile_picture_url: fbData.instagram_business_account.profile_picture_url,
            };
            isFbGraph = true;
          }
        }
      } catch (fbErr) {
        console.warn("FB graph fetch error in connect:", fbErr);
      }
    }

    // B. Fallback ke Instagram Graph API standar (untuk token IGAA...)
    if (!data) {
      let res = await fetch(
        `https://graph.instagram.com/v22.0/me?fields=id,user_id,username,name,profile_picture_url,account_type&access_token=${token}`
      );
      if (!res.ok) {
        res = await fetch(
          `https://graph.instagram.com/me?fields=id,username,name,profile_picture_url,account_type&access_token=${token}`
        );
      }
      if (!res.ok) {
        const errText = await res.text();
        console.error("Meta Graph API error:", res.status, errText);
        return { success: false, error: "Token Instagram tidak valid atau telah kedaluwarsa dari Meta" };
      }
      data = await res.json();
    }

    if (!data || (!data.id && !data.user_id)) {
      return { success: false, error: "Gagal mengambil data Akun Instagram dari Meta" };
    }

    const resolvedBusinessId = String(data.user_id || data.id);
    const resolvedScopedId = String(data.id || data.user_id);

    // 3. Pastikan webhook disubscribe ke Meta untuk akun ini (comments, live_comments, messages, messaging_postbacks)
    if (isFbGraph && resolvedBusinessId) {
      await fetch(
        `https://graph.facebook.com/v22.0/${resolvedBusinessId}/subscribed_apps?subscribed_fields=comments,messages,messaging_postbacks&access_token=${token}`,
        { method: "POST" }
      ).catch(() => null);
      if (resolvedScopedId) {
        await fetch(
          `https://graph.facebook.com/v22.0/${resolvedScopedId}/subscribed_apps?subscribed_fields=feed,messages&access_token=${token}`,
          { method: "POST" }
        ).catch(() => null);
      }
    } else {
      await fetch(
        `https://graph.instagram.com/v22.0/me/subscribed_apps?subscribed_fields=comments,live_comments,messages,messaging_postbacks&access_token=${token}`,
        { method: "POST" }
      ).catch(() => null);
    }

    // Pastikan tidak ada record agen lain yang memegang instagramId yang sama (menghindari bentrok @unique)
    const conflictingAccounts = await (db as any).instagramAccount.findMany({
      where: {
        instagramId: resolvedBusinessId,
        ...(existingAccount ? { id: { not: existingAccount.id } } : {}),
      },
    });
    for (const conflict of conflictingAccounts) {
      await (db as any).instagramAccount.update({
        where: { id: conflict.id },
        data: {
          instagramId: `unlinked_${conflict.id}_${Date.now()}`,
          pageId: null,
          accessToken: "",
          isActive: false,
        },
      });
    }

    let account: any = null;

    if (agentId && existingAccount) {
      account = await (db as any).instagramAccount.update({
        where: { id: agentId },
        data: {
          instagramId: resolvedBusinessId,
          pageId: resolvedScopedId,
          username: data.username || existingAccount.username,
          name: existingAccount.name && !existingAccount.name.startsWith("Agen @")
            ? existingAccount.name
            : (data.name || (data.username ? `@${data.username}` : existingAccount.name)),
          profileName: data.name || existingAccount.profileName || null,
          profilePicUrl: data.profile_picture_url || existingAccount.profilePicUrl || null,
          accessToken: token,
          isActive: true,
        },
      });
    } else {
      account = await (db as any).instagramAccount.upsert({
        where: { instagramId: resolvedBusinessId },
        update: {
          userId,
          pageId: resolvedScopedId,
          username: data.username || "",
          name: data.name || (data.username ? `@${data.username}` : "Akun Instagram"),
          profileName: data.name || null,
          profilePicUrl: data.profile_picture_url || null,
          accessToken: token,
          isActive: true,
        },
        create: {
          userId,
          instagramId: resolvedBusinessId,
          pageId: resolvedScopedId,
          username: data.username || "",
          name: data.name || (data.username ? `@${data.username}` : "Akun Instagram"),
          profileName: data.name || null,
          profilePicUrl: data.profile_picture_url || null,
          accessToken: token,
          isActive: true,
        },
      });
    }

    revalidateTag("instagram-automation");
    revalidateTag(`instagram-automation-${userId}`);
    revalidatePath("/ruang-automation");
    const { accessToken, ...safeAccount } = account || {};
    return { success: true, account: JSON.parse(JSON.stringify(safeAccount)) };
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
      isAdminEmail(session.user.email)
        ? await (db as any).instagramAccount.findUnique({ where: { id: accountId } })
        : null
    );

    if (!targetAccount) {
      return { success: false, error: "Akun tidak ditemukan atau tidak memiliki izin" };
    }

    // Cabut langganan webhook dari Meta agar akun yang sudah diputus tidak lagi mengirim event webhook
    if (targetAccount.accessToken) {
      await fetch(
        `https://graph.instagram.com/v22.0/me/subscribed_apps?access_token=${targetAccount.accessToken}`,
        { method: "DELETE" }
      ).catch(() => null);
      await fetch(
        `https://graph.facebook.com/v22.0/me/subscribed_apps?access_token=${targetAccount.accessToken}`,
        { method: "DELETE" }
      ).catch(() => null);
    }

    const unlinkedId = `unlinked_${accountId}_${Date.now()}`;
    const boundId = targetAccount.boundInstagramId || (targetAccount.instagramId && !targetAccount.instagramId.startsWith("unlinked_") && !targetAccount.instagramId.startsWith("pending_") ? targetAccount.instagramId : null);
    const boundUser = targetAccount.boundUsername || targetAccount.username || null;

    await (db as any).instagramAccount.update({
      where: { id: accountId },
      data: {
        accessToken: "",
        instagramId: unlinkedId,
        pageId: null,
        boundInstagramId: boundId,
        boundUsername: boundUser,
        username: boundUser || "",
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

    const isAdmin = isAdminEmail(session.user.email);
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

    const token = account?.accessToken;
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
        const isVideo = item.media_type === "VIDEO";
        // Untuk Reels/Video: item.thumbnail_url adalah gambar cover JPG, sedangkan item.media_url adalah video MP4
        const coverImg = isVideo
          ? (item.thumbnail_url || item.media_url || "")
          : (item.media_url || item.thumbnail_url || "");
        const videoUrl = isVideo ? (item.media_url || null) : null;
        const dateObj = item.timestamp ? new Date(item.timestamp) : new Date();
        const formattedDate = dateObj.toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });

        return {
          id: item.id,
          title: item.caption ? (item.caption.length > 45 ? item.caption.slice(0, 45) + "..." : item.caption) : "Postingan Instagram",
          image: coverImg,
          thumb: item.thumbnail_url || coverImg,
          videoUrl,
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
 * Server Action: Mengambil Daftar Story Aktif (24 Jam Terakhir) dari Meta Graph API
 */
export async function getInstagramStoriesAction(limit: number = 20, accountId?: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Silakan login terlebih dahulu", stories: [] };
    }

    const userId = session.user.id;
    const db = getDb();
    let account: any = null;

    const isAdmin = isAdminEmail(session.user.email);
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

    const token = account?.accessToken;
    const instagramId = account?.instagramId;

    if (!token) {
      return { success: false, error: "Akun Instagram belum terhubung.", stories: [] };
    }

    let storyItems: any[] = [];
    let metaErrorMessage: string | null = null;

    // 1. Panggil Instagram Graph API untuk /me/stories
    try {
      const igUrl = `https://graph.instagram.com/me/stories?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp&limit=${limit}&access_token=${token}`;
      const res = await fetch(igUrl, { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json.data)) {
          storyItems = json.data;
        }
      } else {
        const errJson = await res.json().catch(() => null);
        if (errJson?.error?.message) {
          metaErrorMessage = errJson.error.message;
        }
      }
    } catch (e: any) {
      console.warn("Direct Instagram Graph API stories fetch warning:", e.message || e);
    }

    // 2. Jika belum dapat atau token Page, coba Facebook Graph API
    if (storyItems.length === 0 && instagramId && !token.startsWith("IG")) {
      try {
        const fbUrl = `https://graph.facebook.com/v22.0/${instagramId}/stories?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp&limit=${limit}&access_token=${token}`;
        const res = await fetch(fbUrl, { cache: "no-store" });
        if (res.ok) {
          const json = await res.json();
          if (Array.isArray(json.data)) {
            storyItems = json.data;
          }
        }
      } catch (e: any) {
        console.warn("Facebook Graph API stories fetch warning:", e.message || e);
      }
    }

    const formattedStories = storyItems.map((item: any) => {
      const img = item.media_url || item.thumbnail_url || "";
      const dateObj = item.timestamp ? new Date(item.timestamp) : new Date();
      const formattedDate = dateObj.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });

      return {
        id: item.id,
        title: item.caption ? item.caption.slice(0, 50) : "Instagram Story",
        caption: item.caption || "",
        image: img,
        thumb: item.thumbnail_url || img,
        mediaType: item.media_type || "IMAGE",
        permalink: item.permalink || "",
        date: formattedDate,
        rawTimestamp: item.timestamp,
      };
    });

    return {
      success: true,
      isLive: true,
      stories: formattedStories,
    };
  } catch (err: any) {
    console.error("getInstagramStoriesAction exception:", err);
    return {
      success: false,
      error: err.message || "Gagal mengambil stories Instagram dari Meta API",
      stories: [],
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
  await assertProAutomation(session.user.id, session.user.email);

  const isAdmin = isAdminEmail(session.user.email);
  const db = getDb();
  let targetAccountId = payload.accountId;

  // Jika accountId dikirim langsung, pastikan akun milik user (kecuali admin)
  if (targetAccountId) {
    const acc = await (db as any).instagramAccount.findFirst({
      where: isAdmin
        ? { id: targetAccountId }
        : {
            id: targetAccountId,
            OR: [
              { userId: session.user.id },
              { user: { email: session.user.email || "" } }
            ]
          }
    });
    if (!acc) {
      throw new Error("Akun Instagram tidak valid atau tidak memiliki izin");
    }
  } else {
    // Jika accountId tidak dikirim langsung, cari akun aktif milik user
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

    const resolvedTriggerType =
      payload.triggerType || (
        payload.postType === "SPECIFIC" || payload.postType === "SPECIFIC_POST"
          ? "SPECIFIC_POST"
          : payload.postType === "NEXT" || payload.postType === "NEXT_POST"
          ? "NEXT_POST"
          : payload.postType === "ALL_STORIES" || payload.postType === "Semua Story"
          ? "ALL_STORIES"
          : payload.postType === "SPECIFIC_STORY" || payload.postType === "Story Tertentu"
          ? "SPECIFIC_STORY"
          : payload.postType === "STORY_MENTION" || payload.postType === "Story Mention"
          ? "STORY_MENTION"
          : payload.postType === "LIVE" || payload.postType === "INSTAGRAM_LIVE" || payload.postType === "Live Instagram"
          ? "LIVE"
          : payload.postType === "DM" || payload.postType === "Pesan Instagram"
          ? "DM"
          : "ALL_POSTS"
      );

    const resolvedSpecificPostId =
      (payload.postType === "SPECIFIC" || payload.postType === "SPECIFIC_POST" || payload.postType === "SPECIFIC_STORY")
        ? (payload.postId?.trim() || null)
        : null;

    if (existingId) {
      // Pastikan aturan yang diupdate milik akun user (atau user admin)
      const existingRule = await (db as any).instagramAutomationRule.findUnique({
        where: { id: existingId },
        include: { account: true }
      });
      if (!existingRule) {
        throw new Error("Aturan tidak ditemukan");
      }
      if (!isAdmin && existingRule.account?.userId !== session.user.id) {
        throw new Error("Tidak memiliki izin untuk mengubah aturan ini");
      }

      // Update
      const updated = await (db as any).instagramAutomationRule.update({
        where: { id: existingId },
        data: {
          name: payload.name.trim(),
          triggerType: resolvedTriggerType,
          specificPostId: resolvedSpecificPostId,
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
          triggerType: resolvedTriggerType,
          specificPostId: resolvedSpecificPostId,
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
  await assertProAutomation(session.user.id, session.user.email);

  const isAdmin = isAdminEmail(session.user.email);
  const db = getDb();
  const rule = await (db as any).instagramAutomationRule.findUnique({
    where: { id: ruleId },
    include: { account: true }
  });
  if (!rule) throw new Error("Aturan tidak ditemukan");
  if (!isAdmin && rule.account?.userId !== session.user.id) {
    throw new Error("Tidak memiliki izin untuk mengubah aturan ini");
  }

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
  await assertProAutomation(session.user.id, session.user.email);

  const isAdmin = isAdminEmail(session.user.email);
  const db = getDb();
  const rule = await (db as any).instagramAutomationRule.findUnique({
    where: { id: ruleId },
    include: { account: true }
  });
  if (!rule) throw new Error("Aturan tidak ditemukan");
  if (!isAdmin && rule.account?.userId !== session.user.id) {
    throw new Error("Tidak memiliki izin untuk menghapus aturan ini");
  }

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
    await assertProAutomation(session.user.id, session.user.email);

    const isAdmin = isAdminEmail(session.user.email);
    const db = getDb();
    const rule = await (db as any).instagramAutomationRule.findUnique({
      where: { id: ruleId },
      include: { account: true }
    });

    if (!rule) {
      return { success: false, error: "Aturan tidak ditemukan" };
    }
    if (!isAdmin && rule.account?.userId !== session.user.id) {
      return { success: false, error: "Tidak memiliki izin untuk menduplikasi aturan ini" };
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

/**
 * Helper internal: Parse extended config dari dmMessage / buttonText
 */
function parseRuleExtendedConfig(raw: string | null | undefined): any {
  if (!raw) return {};
  try {
    if (raw.trim().startsWith("{") || raw.includes('"mainMessage"')) {
      return JSON.parse(raw);
    }
  } catch {
    // ignore
  }
  return {};
}

/**
 * Helper internal: Bungkus link dengan URL Tracker jika trackLinks aktif
 */
function wrapTrackedLink(rawUrl: string, trackLinks: boolean, ruleId: string, logId?: string): string {
  if (!rawUrl || !rawUrl.trim()) return "https://instagram.com";
  let cleanUrl = rawUrl.trim();
  if (!/^https?:\/\//i.test(cleanUrl)) {
    cleanUrl = `https://${cleanUrl}`;
  }
  if (!trackLinks) return cleanUrl;

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXTAUTH_URL ||
    "https://www.ruangcreativemuslim.com";

  const params = new URLSearchParams();
  params.set("url", cleanUrl);
  params.set("ruleId", ruleId);
  if (logId) params.set("logId", logId);

  return `${baseUrl.replace(/\/$/, "")}/api/track/instagram?${params.toString()}`;
}

/**
 * Server Action: Coba Lagi Semua yang Gagal (Retry Failed Logs dalam 14 hari terakhir)
 */
export async function retryFailedAutomationLogsAction(ruleId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    const isAdmin = isAdminEmail(session.user.email);
    const db = getDb();
    const rule = await (db as any).instagramAutomationRule.findUnique({
      where: { id: ruleId },
      include: { account: true }
    });

    if (!rule || !rule.account?.accessToken) {
      return { success: false, error: "Aturan atau token akses akun tidak ditemukan." };
    }

    if (!isAdmin && rule.account?.userId !== session.user.id) {
      return { success: false, error: "Tidak memiliki izin untuk mengakses aturan ini." };
    }

    const accessToken = rule.account.accessToken;
    const igBusinessId = rule.account.instagramId || "me";
    const ext = parseRuleExtendedConfig(rule.dmMessage);
    const trackLinks = ext.featureLinkTracking !== false;
    const rawMainDm = ext.mainMessage || rule.dmMessage || "";

    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    const failedLogs = await (db as any).instagramAutomationLog.findMany({
      where: {
        ruleId: rule.id,
        createdAt: { gte: fourteenDaysAgo },
        OR: [
          { dmStatus: "FAILED" },
          { replyCommentStatus: "FAILED" }
        ]
      },
      orderBy: { createdAt: "desc" }
    });

    if (!failedLogs || failedLogs.length === 0) {
      return { success: true, retriedCount: 0, successCount: 0, message: "Tidak ada log gagal untuk dicoba ulang." };
    }

    let successCount = 0;

    for (const log of failedLogs) {
      let newReplyStatus = log.replyCommentStatus;
      let newDmStatus = log.dmStatus;
      let lastError = "";
      const isCommentEvent = log.commentId && !String(log.commentId).startsWith("dm_");

      // 1. Retry Public Comment Reply jika sebelumnya FAILED
      const logUsername = (log.fromUsername || log.commenterUsername || "kak").replace(/^@/, "");

      if (log.replyCommentStatus === "FAILED" && isCommentEvent) {
        const replies: string[] = Array.isArray(rule.commentReplies) ? rule.commentReplies : [];
        if (replies.length > 0 && ext.featureReplyComment !== false) {
          const randomReply = replies[Math.floor(Math.random() * replies.length)];
          const personalizedReply = randomReply
            .replace(/@\{username\}/gi, `@${logUsername}`)
            .replace(/\{username\}/gi, `@${logUsername}`);
          try {
            const replyRes = await fetch(`https://graph.instagram.com/v22.0/${log.commentId}/replies`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`
              },
              body: JSON.stringify({ message: personalizedReply })
            });
            const replyData = await replyRes.json();
            if (replyRes.ok && !replyData.error) {
              newReplyStatus = "SENT";
            } else {
              lastError = replyData.error?.message || "Gagal membalas komentar";
            }
          } catch (e: any) {
            lastError = e.message;
          }
        }
      }

      // 2. Retry DM jika sebelumnya FAILED
      if (log.dmStatus === "FAILED" && isCommentEvent && rawMainDm) {
        const dmText = rawMainDm
          .replace(/@\{username\}/gi, `@${logUsername}`)
          .replace(/\{username\}/gi, logUsername)
          .replace(/\{first_name\}/gi, logUsername);
        let btnTitle = rule.buttonText || "Buka Tautan";
        if (ext && Array.isArray(ext.buttons) && ext.buttons[0]) {
          btnTitle = ext.buttons[0];
        } else if (rule.buttonText && rule.buttonText.trim().startsWith("{")) {
          btnTitle = "Buka Tautan";
        }

        const recipientPayload = { comment_id: log.commentId };
        let dmBody: any;

        if (rule.buttonUrl && rule.buttonUrl.trim() !== "") {
          const trackedUrl = wrapTrackedLink(rule.buttonUrl.trim(), trackLinks, rule.id, log.id);
          dmBody = {
            recipient: recipientPayload,
            message: {
              attachment: {
                type: "template",
                payload: {
                  template_type: "button",
                  text: dmText.substring(0, 640),
                  buttons: [
                    {
                      type: "web_url",
                      url: trackedUrl,
                      title: btnTitle.substring(0, 20)
                    }
                  ]
                }
              }
            }
          };
        } else {
          dmBody = {
            recipient: recipientPayload,
            message: { text: dmText }
          };
        }

        try {
          const dmRes = await fetch(`https://graph.instagram.com/v22.0/${igBusinessId}/messages`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`
            },
            body: JSON.stringify(dmBody)
          });
          const dmData = await dmRes.json();
          if (dmRes.ok && !dmData.error) {
            newDmStatus = "SENT";
          } else {
            // Fallback plain text jika template gagal
            const fallbackUrl = rule.buttonUrl
              ? wrapTrackedLink(rule.buttonUrl.trim(), trackLinks, rule.id, log.id)
              : "";
            const fallbackText = fallbackUrl ? `${dmText}\n\n🔗 ${btnTitle}: ${fallbackUrl}` : dmText;
            const fbRes = await fetch(`https://graph.instagram.com/v22.0/${igBusinessId}/messages`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`
              },
              body: JSON.stringify({
                recipient: recipientPayload,
                message: { text: fallbackText }
              })
            });
            const fbData = await fbRes.json();
            if (fbRes.ok && !fbData.error) {
              newDmStatus = "SENT";
            } else {
              lastError = fbData.error?.message || dmData.error?.message || "Gagal mengirim DM";
            }
          }
        } catch (e: any) {
          lastError = e.message;
        }
      }

      const isNowSuccess =
        (log.replyCommentStatus !== "FAILED" || newReplyStatus === "SENT") &&
        (log.dmStatus !== "FAILED" || newDmStatus === "SENT");

      if (newReplyStatus === "SENT" || newDmStatus === "SENT") {
        successCount++;
      }

      const metaObj = {
        commentedAt: log.createdAt ? new Date(log.createdAt).toISOString() : new Date().toISOString(),
        read: newDmStatus === "SENT",
        retriedAt: new Date().toISOString(),
        mainSentAt: newDmStatus === "SENT" ? new Date().toISOString() : undefined
      };

      await (db as any).instagramAutomationLog.update({
        where: { id: log.id },
        data: {
          replyCommentStatus: newReplyStatus,
          dmStatus: newDmStatus,
          errorMessage: isNowSuccess ? `__META__:${JSON.stringify(metaObj)}` : (lastError || log.errorMessage)
        }
      });
    }

    revalidateTag("instagram-automation");
    revalidateTag(`instagram-automation-${session.user.id}`);
    revalidatePath("/ruang-automation");

    return {
      success: true,
      retriedCount: failedLogs.length,
      successCount,
      message: `Berhasil memproses ulang ${successCount} dari ${failedLogs.length} log yang gagal.`
    };
  } catch (err: any) {
    console.error("retryFailedAutomationLogsAction error:", err);
    return { success: false, error: err.message || "Gagal mencoba ulang log." };
  }
}

/**
 * Server Action: Rewind Komentar (Menarik & memproses komentar terlewat dari 14 hari terakhir di postingan)
 */
export async function rewindAutomationCommentsAction(ruleId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    const isAdmin = isAdminEmail(session.user.email);
    const db = getDb();
    const rule = await (db as any).instagramAutomationRule.findUnique({
      where: { id: ruleId },
      include: { account: true }
    });

    if (!rule || !rule.account?.accessToken) {
      return { success: false, error: "Aturan atau token akses akun tidak ditemukan." };
    }

    if (!isAdmin && rule.account?.userId !== session.user.id) {
      return { success: false, error: "Tidak memiliki izin untuk mengakses aturan ini." };
    }

    const accessToken = rule.account.accessToken;
    const igBusinessId = rule.account.instagramId || "me";
    const ownerUsername = (rule.account.username || "").toLowerCase();
    const ext = parseRuleExtendedConfig(rule.dmMessage);
    const trackLinks = ext.featureLinkTracking !== false;
    const rawMainDm = ext.mainMessage || rule.dmMessage || "";

    // 1. Tentukan daftar mediaId yang akan di-scan
    let mediaIds: string[] = [];
    if (rule.triggerType === "SPECIFIC_POST" && rule.specificPostId) {
      mediaIds = [rule.specificPostId];
    } else {
      // Ambil 5 postingan terbaru dari akun jika ALL_POSTS / NEXT_POST
      const mediaRes = await fetch(
        `https://graph.instagram.com/v22.0/me/media?fields=id,timestamp&limit=5&access_token=${encodeURIComponent(accessToken)}`,
        { cache: "no-store" }
      );
      if (mediaRes.ok) {
        const mediaData = await mediaRes.json();
        if (Array.isArray(mediaData?.data)) {
          mediaIds = mediaData.data.map((m: any) => String(m.id));
        }
      }
    }

    if (mediaIds.length === 0) {
      return { success: false, error: "Tidak ada postingan yang ditemukan untuk di-rewind." };
    }

    // 2. Ambil semua commentId yang sudah pernah diproses oleh rule ini agar tidak dobel
    const existingLogs = await (db as any).instagramAutomationLog.findMany({
      where: { ruleId: rule.id },
      select: { commentId: true }
    });
    const processedCommentIds = new Set(existingLogs.map((l: any) => String(l.commentId)));

    const fourteenDaysAgoMs = Date.now() - 14 * 24 * 60 * 60 * 1000;
    const sevenDaysAgoMs = Date.now() - 7 * 24 * 60 * 60 * 1000; // Batas Private Reply Meta untuk komentar adalah 7 hari
    const keywords: string[] = Array.isArray(rule.keywords) ? rule.keywords : [];

    let processedCount = 0;
    let skippedOldCount = 0;

    for (const mediaId of mediaIds) {
      const commentsRes = await fetch(
        `https://graph.instagram.com/v22.0/${mediaId}/comments?fields=id,text,username,timestamp,from&limit=50&access_token=${encodeURIComponent(accessToken)}`,
        { cache: "no-store" }
      );
      if (!commentsRes.ok) continue;

      const commentsData = await commentsRes.json();
      const comments: any[] = Array.isArray(commentsData?.data) ? commentsData.data : [];

      for (const c of comments) {
        const commentId = String(c.id || "");
        if (!commentId || processedCommentIds.has(commentId)) continue;

        const commenterUsername = c.username || c.from?.username || "instagram_user";
        const commenterId = c.from?.id ? String(c.from.id) : "";

        // Jangan balas komentar dari akun sendiri
        if (
          (ownerUsername && commenterUsername.toLowerCase() === ownerUsername) ||
          (commenterId && commenterId === String(rule.account.instagramId))
        ) {
          continue;
        }

        const commentTimeMs = c.timestamp ? new Date(c.timestamp).getTime() : Date.now();
        if (commentTimeMs < fourteenDaysAgoMs) continue;

        const commentText = String(c.text || "").trim();
        const upperText = commentText.toUpperCase();

        // Cek kecocokan keyword
        const isMatched =
          keywords.length === 0 ||
          keywords.some((kw) => {
            const cleanKw = kw.trim().toUpperCase();
            return cleanKw === "SEMUA" || cleanKw === "*" || upperText.includes(cleanKw);
          });

        if (!isMatched) continue;

        // Buat log record terlebih dahulu agar dapat logId untuk tracking
        const initialMeta = {
          commentedAt: c.timestamp ? new Date(c.timestamp).toISOString() : new Date().toISOString(),
          mediaId,
          read: false,
          senderId: commenterId,
          rewound: true
        };

        const createdLog = await (db as any).instagramAutomationLog.create({
          data: {
            accountId: rule.account.id,
            ruleId: rule.id,
            commentId,
            commentText,
            fromUsername: commenterUsername,
            replyCommentStatus: "SKIPPED",
            dmStatus: "SKIPPED",
            errorMessage: `__META__:${JSON.stringify(initialMeta)}`
          }
        });

        let replyCommentStatus = "SKIPPED";
        let dmStatus = "SKIPPED";
        let errorMsg = "";

        // A. Balas Komentar Publik
        const replies: string[] = Array.isArray(rule.commentReplies) ? rule.commentReplies : [];
        if (replies.length > 0 && ext.featureReplyComment !== false) {
          const randomReply = replies[Math.floor(Math.random() * replies.length)];
          const personalizedReply = randomReply
            .replace(/@\{username\}/gi, `@${commenterUsername}`)
            .replace(/\{username\}/gi, `@${commenterUsername}`);
          try {
            const replyRes = await fetch(`https://graph.instagram.com/v22.0/${commentId}/replies`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`
              },
              body: JSON.stringify({ message: personalizedReply })
            });
            const replyData = await replyRes.json();
            if (replyRes.ok && !replyData.error) {
              replyCommentStatus = "SENT";
            } else {
              replyCommentStatus = "FAILED";
              errorMsg = replyData.error?.message || "Gagal membalas komentar";
            }
          } catch (e: any) {
            replyCommentStatus = "FAILED";
            errorMsg = e.message;
          }
        }

        // B. Kirim DM (Private Reply via comment_id berlaku maksimal 7 hari menurut kebijakan Meta)
        if (rawMainDm) {
          if (commentTimeMs < sevenDaysAgoMs) {
            dmStatus = "FAILED";
            errorMsg = "Komentar lebih dari 7 hari (batas Private Reply Meta)";
            skippedOldCount++;
          } else {
            const dmText = rawMainDm
              .replace(/@\{username\}/gi, `@${commenterUsername}`)
              .replace(/\{username\}/gi, commenterUsername)
              .replace(/\{first_name\}/gi, commenterUsername);
            let btnTitle = rule.buttonText || "Buka Tautan";
            if (ext && Array.isArray(ext.buttons) && ext.buttons[0]) {
              btnTitle = ext.buttons[0];
            } else if (rule.buttonText && rule.buttonText.trim().startsWith("{")) {
              btnTitle = "Buka Tautan";
            }

            const recipientPayload = { comment_id: commentId };
            let dmBody: any;

            if (rule.buttonUrl && rule.buttonUrl.trim() !== "") {
              const trackedUrl = wrapTrackedLink(rule.buttonUrl.trim(), trackLinks, rule.id, createdLog.id);
              dmBody = {
                recipient: recipientPayload,
                message: {
                  attachment: {
                    type: "template",
                    payload: {
                      template_type: "button",
                      text: dmText.substring(0, 640),
                      buttons: [
                        {
                          type: "web_url",
                          url: trackedUrl,
                          title: btnTitle.substring(0, 20)
                        }
                      ]
                    }
                  }
                }
              };
            } else {
              dmBody = {
                recipient: recipientPayload,
                message: { text: dmText }
              };
            }

            try {
              const dmRes = await fetch(`https://graph.instagram.com/v22.0/${igBusinessId}/messages`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${accessToken}`
                },
                body: JSON.stringify(dmBody)
              });
              const dmData = await dmRes.json();
              if (dmRes.ok && !dmData.error) {
                dmStatus = "SENT";
              } else {
                dmStatus = "FAILED";
                errorMsg = (errorMsg ? errorMsg + " | " : "") + (dmData.error?.message || "Gagal mengirim DM");
              }
            } catch (e: any) {
              dmStatus = "FAILED";
              errorMsg = (errorMsg ? errorMsg + " | " : "") + e.message;
            }
          }
        }

        const updatedMeta = {
          ...initialMeta,
          read: dmStatus === "SENT",
          mainSentAt: dmStatus === "SENT" ? new Date().toISOString() : undefined
        };

        await (db as any).instagramAutomationLog.update({
          where: { id: createdLog.id },
          data: {
            replyCommentStatus,
            dmStatus,
            errorMessage: errorMsg ? errorMsg : `__META__:${JSON.stringify(updatedMeta)}`
          }
        });

        processedCommentIds.add(commentId);
        processedCount++;
      }
    }

    revalidateTag("instagram-automation");
    revalidateTag(`instagram-automation-${session.user.id}`);
    revalidatePath("/ruang-automation");

    return {
      success: true,
      processedCount,
      skippedOldCount,
      message:
        processedCount > 0
          ? `Rewind selesai! ${processedCount} komentar terlewat berhasil diproses.`
          : "Tidak ditemukan komentar baru yang terlewat dari 14 hari terakhir."
    };
  } catch (err: any) {
    console.error("rewindAutomationCommentsAction error:", err);
    return { success: false, error: err.message || "Gagal melakukan Rewind Komentar." };
  }
}

