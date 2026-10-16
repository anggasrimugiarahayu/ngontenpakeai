import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Helper Spintax Randomizer
function parseSpintax(text: string): string {
  if (!text) return "";
  return text.replace(/\{([^{}]+)\}/g, (match, choices) => {
    const parts = choices.split("|");
    return parts[Math.floor(Math.random() * parts.length)];
  });
}

// Helper Variable Resolver
function resolveVariables(text: string, username: string): string {
  if (!text) return "";
  const cleanUsername = username ? `@${username.replace(/^@/, "")}` : "@pengguna";
  const firstName = username || "Kak";

  let resolved = text
    .replace(/@\{username\}/g, cleanUsername)
    .replace(/\{username\}/g, cleanUsername)
    .replace(/\[Nama Pengguna\]/g, cleanUsername)
    .replace(/\{first_name\}/g, firstName)
    .replace(/\[Nama Depan\]/g, firstName)
    .replace(/\{full_name\}/g, firstName);

  return parseSpintax(resolved);
}

/**
 * Helper: Mengirim request POST ke Meta Graph API
 * Mendukung format Instagram Login (graph.instagram.com) maupun Facebook Page (graph.facebook.com)
 */
async function postToMetaGraph(endpoint: string, payload: any, token: string) {
  const isIgToken = token && token.startsWith("IG");
  const primaryDomain = isIgToken ? "https://graph.instagram.com/v22.0" : "https://graph.facebook.com/v22.0";
  const fallbackDomain = isIgToken ? "https://graph.facebook.com/v22.0" : "https://graph.instagram.com/v22.0";

  const url = `${primaryDomain}${endpoint}`;
  let res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...payload, access_token: token }),
  });

  if (!res.ok) {
    const errorData = await res.clone().json().catch(() => null);
    // Jika token tidak cocok di domain utama (misal error 190 OAuthException), coba domain alternatif
    if (errorData?.error?.code === 190 || errorData?.error?.type === "OAuthException") {
      const fallbackUrl = `${fallbackDomain}${endpoint}`;
      console.log(`🔄 [Meta Webhook] Retrying Meta Graph request via fallback domain: ${fallbackUrl}`);
      const fallbackRes = await fetch(fallbackUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, access_token: token }),
      });
      if (fallbackRes.ok) {
        return fallbackRes;
      }
    }
  }

  return res;
}

/**
 * Helper: Membuat payload pesan DM dengan tombol menggunakan Button Template standar Instagram
 * Tanpa header kartu tambahan (seperti "Pesan Pembuka" / nama aturan) dan menampilkan teks hitam jelas (bukan subtitle abu-abu tipis)
 */
function buildButtonTemplateMessage(text: string, buttons: any[]) {
  return {
    attachment: {
      type: "template",
      payload: {
        template_type: "button",
        text: (text || "").slice(0, 640),
        buttons,
      },
    },
  };
}

/**
 * Helper: Mengecek profil & status follow real-time (is_user_follow_business) dari pengirim DM ke akun bisnis
 */
async function getIgUserProfile(
  senderId: string,
  token: string
): Promise<{ username: string; name: string; isFollowing: boolean | null }> {
  const isIgToken = token && token.startsWith("IG");
  const primaryDomain = isIgToken ? "https://graph.instagram.com/v22.0" : "https://graph.facebook.com/v22.0";
  const fallbackDomain = isIgToken ? "https://graph.facebook.com/v22.0" : "https://graph.instagram.com/v22.0";

  for (const domain of [primaryDomain, fallbackDomain]) {
    try {
      const res = await fetch(
        `${domain}/${senderId}?fields=id,name,username,is_user_follow_business&access_token=${token}`,
        { cache: "no-store" }
      );
      if (res.ok) {
        const data = await res.json();
        return {
          username: data.username || "kak",
          name: data.name || data.username || "Kak",
          isFollowing: typeof data.is_user_follow_business === "boolean" ? data.is_user_follow_business : null,
        };
      }
    } catch {}
  }

  return { username: "kak", name: "Kak", isFollowing: null };
}

function parseLogMeta(errorMessage?: string | null): Record<string, any> {
  if (!errorMessage || !errorMessage.startsWith("__META__:")) return {};
  try {
    return JSON.parse(errorMessage.slice(9));
  } catch {
    return {};
  }
}

function stringifyLogMeta(meta: Record<string, any>): string {
  return `__META__:${JSON.stringify(meta)}`;
}

function buildTrackedUrl(
  origin: string,
  rawUrl: string,
  ruleId: string,
  enableTracking: boolean = true,
  logId?: string,
  senderId?: string
): string {
  const cleanUrl = (rawUrl || "https://ruangcreativemuslim.com").trim();
  if (!enableTracking) return cleanUrl;
  const params = new URLSearchParams({
    url: cleanUrl,
    ruleId,
    ...(logId ? { logId } : {}),
    ...(senderId ? { senderId } : {}),
  });
  return `${origin}/api/track/instagram?${params.toString()}`;
}

function parseDelayToMs(delayStr?: string): number {
  if (!delayStr) return 60 * 60 * 1000;
  const lower = delayStr.toLowerCase();
  if (lower.includes("15 menit")) return 15 * 60 * 1000;
  if (lower.includes("30 menit")) return 30 * 60 * 1000;
  if (lower.includes("1 jam")) return 60 * 60 * 1000;
  if (lower.includes("3 jam")) return 3 * 60 * 60 * 1000;
  if (lower.includes("6 jam")) return 6 * 60 * 60 * 1000;
  if (lower.includes("12 jam")) return 12 * 60 * 60 * 1000;
  if (lower.includes("23 jam") || lower.includes("24 jam")) return 23 * 60 * 60 * 1000;
  return 60 * 60 * 1000;
}

async function processPendingFollowUps(account: any, origin: string) {
  try {
    const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const logs = await (prisma as any).instagramAutomationLog.findMany({
      where: {
        accountId: account.id,
        dmStatus: "SENT",
        createdAt: { gte: since24h },
      },
      include: { rule: true },
      orderBy: { createdAt: "desc" },
      take: 40,
    });

    for (const log of logs) {
      if (!log.rule || !log.rule.isActive) continue;
      const meta = parseLogMeta(log.errorMessage);
      if (!meta.senderId || !meta.mainSentAt || meta.followUpSent || meta.followUpSkipped) continue;

      let ruleConfig: any = {};
      try {
        if (log.rule.dmMessage && (log.rule.dmMessage.startsWith("{") || log.rule.dmMessage.includes('"mainMessage"'))) {
          ruleConfig = JSON.parse(log.rule.dmMessage);
        }
      } catch {}

      if (!ruleConfig.featureFollowUp || !ruleConfig.followUpMessage) continue;

      const delayMs = parseDelayToMs(ruleConfig.followUpDelay);
      const elapsed = Date.now() - new Date(meta.mainSentAt).getTime();
      if (elapsed < delayMs) continue;

      // Cek kondisi Follow Up
      if (ruleConfig.followUpCondition === "Hanya yang Belum Klik Link" && meta.clicked) {
        await (prisma as any).instagramAutomationLog.update({
          where: { id: log.id },
          data: { errorMessage: stringifyLogMeta({ ...meta, followUpSkipped: true }) },
        }).catch(() => {});
        continue;
      }

      const followUpText = resolveVariables(ruleConfig.followUpMessage, log.fromUsername || "kak");
      const btnLabel = ruleConfig.followUpButtonLabel || log.rule.buttonText || "Buka Link Sekarang";
      const targetUrl = log.rule.buttonUrl || "https://ruangcreativemuslim.com";
      const trackedUrl = buildTrackedUrl(
        origin,
        targetUrl,
        log.rule.id,
        ruleConfig.featureLinkTracking !== false,
        log.id,
        meta.senderId
      );

      const followUpPayload =
        ruleConfig.followUpMessageType === "Teks Biasa" || !log.rule.buttonUrl
          ? { text: followUpText }
          : buildButtonTemplateMessage(followUpText, [
              {
                type: "web_url",
                url: trackedUrl,
                title: btnLabel.slice(0, 20),
              },
            ]);

      const res = await postToMetaGraph(
        `/me/messages`,
        {
          recipient: { id: meta.senderId },
          message: followUpPayload,
        },
        account.accessToken
      );

      if (res.ok) {
        await (prisma as any).instagramAutomationLog.update({
          where: { id: log.id },
          data: {
            errorMessage: stringifyLogMeta({
              ...meta,
              followUpSent: true,
              followUpSentAt: new Date().toISOString(),
            }),
          },
        }).catch(() => {});
      }
    }
  } catch (err) {
    console.warn("FollowUp processor warning:", err);
  }
}

/**
 * 1. GET Handler: Verifikasi Meta Webhook
 * Meta Developer Dashboard memvalidasi endpoint ini menggunakan hub.challenge & hub.verify_token
 */
export async function GET(req: NextRequest) {
  const mode = req.nextUrl.searchParams.get("hub.mode");
  const token = req.nextUrl.searchParams.get("hub.verify_token");
  const challenge = req.nextUrl.searchParams.get("hub.challenge");

  const expectedToken =
    process.env.INSTAGRAM_WEBHOOK_VERIFY_TOKEN ||
    process.env.META_WEBHOOK_VERIFY_TOKEN ||
    "ruang_creative_muslim_secret_2026";

  if (mode === "subscribe" && token === expectedToken) {
    console.log("✅ [Meta Webhook] Verifikasi Berhasil! Challenge:", challenge);
    return new Response(challenge || "", {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
      },
    });
  }

  console.warn("⚠️ [Meta Webhook] Verifikasi Gagal! Token tidak cocok.");
  return new Response("Forbidden", { status: 403 });
}

/**
 * 2. POST Handler: Menerima Real-Time Event Komentar & DM dari Meta Graph API
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Verifikasi objek webhook berasal dari Instagram
    if (body.object !== "instagram") {
      return new NextResponse("NOT_INSTAGRAM_EVENT", { status: 200 });
    }

    const entries = body.entry || [];

    // Proses setiap entry secara asinkron (background pipeline)
    for (const entry of entries) {
      const igAccountId = String(entry.id || "");
      console.log(`📡 [Meta Webhook] Received entry for account ID: ${igAccountId}`);

      // 1. Cari akun Instagram terdaftar di database kita
      let account = await (prisma as any).instagramAccount.findFirst({
        where: {
          OR: [
            { instagramId: igAccountId },
            { pageId: igAccountId },
            { id: igAccountId },
          ],
          isActive: true,
        },
      });

      // Fallback Dinamis: Jika belum cocok di query awal, verifikasi token tiap agen aktif ke Meta Graph API (/me?fields=id,user_id,username)
      // Tidak pernah menebak/menimpa instagramId tanpa verifikasi resmi dari Meta API
      if (!account) {
        const activeAccounts = await (prisma as any).instagramAccount.findMany({
          where: {
            isActive: true,
            accessToken: { not: "" },
          },
        });

        for (const candidate of activeAccounts) {
          try {
            const verifyRes = await fetch(
              `https://graph.instagram.com/v22.0/me?fields=id,user_id,username&access_token=${candidate.accessToken}`
            );
            if (!verifyRes.ok) continue;
            const meData = await verifyRes.json();
            const trueBusinessId = String(meData.user_id || meData.id || "");
            const trueScopedId = String(meData.id || meData.user_id || "");

            // Sinkronkan instagramId & pageId agen ini jika di DB belum sesuai dengan user_id asli dari Meta
            if (trueBusinessId && (candidate.instagramId !== trueBusinessId || candidate.pageId !== trueScopedId)) {
              await (prisma as any).instagramAccount.update({
                where: { id: candidate.id },
                data: {
                  instagramId: trueBusinessId,
                  pageId: trueScopedId,
                  ...(meData.username ? { username: meData.username } : {}),
                },
              }).catch(() => null);
              candidate.instagramId = trueBusinessId;
              candidate.pageId = trueScopedId;
            }

            // Hanya cocokkan jika ID webhook (entry.id) benar-benar milik akun kandidat ini
            if (trueBusinessId === igAccountId || trueScopedId === igAccountId) {
              account = candidate;
              console.log(`✅ [Meta Webhook] Verified & matched account @${account.username} for Meta ID: ${igAccountId}`);
              break;
            }
          } catch (verifyErr) {
            console.warn(`⚠️ [Meta Webhook] Failed to verify candidate account ${candidate.id}:`, verifyErr);
          }
        }
      }

      if (!account || !account.accessToken) {
        console.warn(`⚠️ [Meta Webhook] No active connected account found for ID: ${igAccountId}`);
        continue;
      }

      // =========================================================================
      // A. EVENT: KOMENTAR MASUK (field === "comments")
      // =========================================================================
      const changes = entry.changes || [];
      for (const change of changes) {
        if (change.field === "comments" && change.value) {
          const comment = change.value;
          const commentId = comment.id;
          const commentText = (comment.text || "").trim();
          const fromUser = comment.from || {};
          const fromId = String(fromUser.id || "");
          const fromUsername = fromUser.username || "pengguna";
          const mediaId = comment.media?.id;

          console.log(`💬 [Meta Webhook] New comment on media ${mediaId} from @${fromUsername} (${fromId}): "${commentText}"`);

          if (!commentId || !commentText) continue;

          // Jika dari username berbeda namun fromId sama dengan account.instagramId (indikasi ID akun di DB belum tersinkron dengan user_id asli),
          // lakukan verifikasi dinamis ke Meta API
          if (
            fromId &&
            fromId === account.instagramId &&
            fromUsername &&
            account.username &&
            fromUsername.toLowerCase() !== account.username.toLowerCase()
          ) {
            try {
              const checkMeRes = await fetch(
                `https://graph.instagram.com/v22.0/me?fields=id,user_id,username&access_token=${account.accessToken}`
              );
              if (checkMeRes.ok) {
                const checkMe = await checkMeRes.json();
                const realBusinessId = String(checkMe.user_id || checkMe.id || "");
                const realScopedId = String(checkMe.id || checkMe.user_id || "");
                if (realBusinessId && realBusinessId !== account.instagramId) {
                  await (prisma as any).instagramAccount.update({
                    where: { id: account.id },
                    data: { instagramId: realBusinessId, pageId: realScopedId },
                  }).catch(() => null);
                  account.instagramId = realBusinessId;
                  account.pageId = realScopedId;
                }
              }
            } catch {}
          }

          // Guardrail 1: Anti-Self Loop (Abaikan komentar dari akun bot sendiri)
          if (
            fromId === account.instagramId ||
            fromId === account.pageId ||
            (fromUsername && account.username && fromUsername.toLowerCase() === account.username.toLowerCase())
          ) {
            console.log(`⏩ [Meta Webhook] Ignoring self-comment from @${fromUsername}`);
            continue;
          }

          // Guardrail 2: Deduplikasi Idempotency (Jangan proses komentar yang sama 2x)
          const existingLog = await (prisma as any).instagramAutomationLog.findFirst({
            where: { commentId },
          });
          if (existingLog) {
            continue;
          }

          // 2. Ambil Aturan Aktif yang Cocok
          const rules = await (prisma as any).instagramAutomationRule.findMany({
            where: {
              accountId: account.id,
              isActive: true,
            },
            orderBy: { createdAt: "desc" },
          });

          // Rule Isolation & Priority Hierarchy
          // 1. Cek apakah mediaId ini memiliki aturan khusus (SPECIFIC_POST atau NEXT_POST yang sudah terikat)
          const specificRules = rules.filter((r: any) => 
            (r.triggerType === "SPECIFIC_POST" && r.specificPostId === mediaId) ||
            (r.triggerType === "NEXT_POST" && r.specificPostId === mediaId)
          );

          // 2. Cek apakah ada aturan NEXT_POST yang belum terikat (unbound)
          const unboundNextPostRules = rules.filter((r: any) => 
            r.triggerType === "NEXT_POST" && !r.specificPostId
          );

          // Jika mediaId ini belum punya specificRule, tapi ada unboundNextPostRule:
          if (specificRules.length === 0 && unboundNextPostRules.length > 0) {
            const nextRule = unboundNextPostRules[0];
            console.log(`🎯 [Meta Webhook] Next post detected! Binding NEXT_POST rule "${nextRule.name}" to media ID: ${mediaId}`);
            (prisma as any).instagramAutomationRule.update({
              where: { id: nextRule.id },
              data: { specificPostId: mediaId },
            }).catch(() => null);
            nextRule.specificPostId = mediaId;
            specificRules.push(nextRule);
          }

          // 3. SELEKSI CANDIDATE RULES DENGAN ATURAN ISOLASI:
          let candidateRules: any[] = [];
          if (specificRules.length > 0) {
            // Postingan ini adalah POSTINGAN KHUSUS!
            // Aturan "ALL_POSTS" DIBLOKIR TOTAL dari postingan ini agar tidak tumpang tindih / saling serobot.
            console.log(`🔒 [Meta Webhook] Media ${mediaId} is a DEDICATED post with ${specificRules.length} specific rule(s). ALL_POSTS rules are strictly excluded.`);
            candidateRules = specificRules;
          } else {
            // Postingan ini adalah POSTINGAN UMUM (tidak punya aturan khusus).
            // Hanya aturan ALL_POSTS yang boleh berjalan!
            console.log(`🌐 [Meta Webhook] Media ${mediaId} is a GENERAL post without dedicated rules. Evaluating ALL_POSTS rules.`);
            candidateRules = rules.filter((r: any) => r.triggerType === "ALL_POSTS");
          }

          // 4. SORTING PRIORITAS KATA KUNCI:
          // Aturan dengan kata kunci spesifik lebih diutamakan daripada aturan "Semua Kata" (wildcard)
          candidateRules.sort((a: any, b: any) => {
            const aKeywords = Array.isArray(a.keywords) ? a.keywords.length : 0;
            const bKeywords = Array.isArray(b.keywords) ? b.keywords.length : 0;
            if (aKeywords > 0 && bKeywords === 0) return -1;
            if (aKeywords === 0 && bKeywords > 0) return 1;
            return 0;
          });

          // Filter aturan yang cocok kata kuncinya (Single Winner Rule)
          const matchedRule = candidateRules.find((rule: any) => {
            console.log(`🔍 [Meta Webhook] Checking rule "${rule.name}" (${rule.triggerType}) against media ID: ${mediaId}`);

            // Cek kata kunci pemicu
            const keywords = Array.isArray(rule.keywords) ? rule.keywords : [];
            if (keywords.length === 0) {
              // Rule pemicu "SEMUA KATA"
              console.log(`✅ [Meta Webhook] Rule "${rule.name}" matched: trigger on ALL keywords`);
              return true;
            }

            // Rule pemicu "KATA KUNCI TERTENTU"
            const upperComment = commentText.toUpperCase();
            const matched = keywords.some((kw: string) => upperComment.includes(kw.trim().toUpperCase()));
            if (matched) {
              console.log(`✅ [Meta Webhook] Rule "${rule.name}" matched keyword: "${commentText}"`);
            } else {
              console.log(`⏩ [Meta Webhook] Keyword mismatch for comment "${commentText}" against keywords:`, keywords);
            }
            return matched;
          });

          if (!matchedRule) {
            console.log(`⏩ [Meta Webhook] No active rule matched for comment on media ${mediaId} from @${fromUsername}`);
            continue;
          }

          // Unpack konfigurasi aturan lanjutan (extendedConfig JSON)
          let ruleConfig: any = {};
          try {
            if (matchedRule.dmMessage && (matchedRule.dmMessage.startsWith("{") || matchedRule.dmMessage.includes('"mainMessage"'))) {
              ruleConfig = JSON.parse(matchedRule.dmMessage);
            }
          } catch (e) {}

          const mainDmText =
            ruleConfig.mainMessage ||
            matchedRule.dmMessage ||
            "Halo @{username}! Terima kasih sudah tertarik. Ini link akses yang kamu minta:\nhttps://ruangcreativemuslim.com";

          let replyCommentStatus = "SKIPPED";
          let dmStatus = "SKIPPED";
          let failureReason = null;

          // =====================================================================
          // 3. EKSEKUSI: BALAS KOMENTAR PUBLIK (Spintax Acak)
          // =====================================================================
          const shouldReplyComment =
            ruleConfig.featureReplyComment !== false &&
            ((Array.isArray(matchedRule.commentReplies) && matchedRule.commentReplies.length > 0) ||
              ruleConfig.replyCommentTemplates);

          if (shouldReplyComment) {
            const repliesPool =
              Array.isArray(matchedRule.commentReplies) && matchedRule.commentReplies.length > 0
                ? matchedRule.commentReplies
                : ["Pesan terkirim! 🚀 Cek DM ya @{username}"];

            const randomReply = repliesPool[Math.floor(Math.random() * repliesPool.length)];
            const formattedCommentReply = resolveVariables(randomReply, fromUsername);

            try {
              const res = await postToMetaGraph(
                `/${commentId}/replies`,
                { message: formattedCommentReply },
                account.accessToken
              );

              if (res.ok) {
                replyCommentStatus = "SENT";
                console.log(`✅ [Meta Webhook] Public reply sent to @${fromUsername}`);
              } else {
                const errData = await res.json().catch(() => ({}));
                replyCommentStatus = "FAILED";
                failureReason = errData?.error?.message || "Gagal membalas komentar di Meta";
                console.error(`❌ [Meta Webhook] Failed to reply comment:`, errData);

                // Circuit Breaker: Jika akun terkena action block (Error 368)
                if (errData?.error?.code === 368) {
                  await (prisma as any).instagramAutomationRule.update({
                    where: { id: matchedRule.id },
                    data: { isActive: false },
                  });
                }
              }
            } catch (err: any) {
              replyCommentStatus = "FAILED";
              failureReason = err.message;
              console.error(`❌ [Meta Webhook] Exception replying comment:`, err);
            }
          }

          // =====================================================================
          // 4. EKSEKUSI: KIRIM PESAN DM PRIVAT (Private Reply to Comment)
          // =====================================================================
          const origin =
            req.nextUrl.origin && !req.nextUrl.origin.includes("localhost")
              ? req.nextUrl.origin
              : "https://ruangcreativemuslim-seven.vercel.app";

          const initialMeta: Record<string, any> = {
            commentedAt: comment.created_time
              ? new Date(Number(comment.created_time) * 1000 || comment.created_time).toISOString()
              : new Date().toISOString(),
            mediaId: mediaId || null,
          };

          try {
            // Tentukan konten pesan sesuai alur Funnel:
            // Flow: Pesan Pembuka -> Ask For Follow -> Ask for Contact -> Pesan Utama
            let dmPayloadMessage: any = null;

            if (ruleConfig.featureWelcomeMessage && ruleConfig.welcomeMessage) {
              // Step 4a: Pesan Pembuka (Tanpa header kartu, teks hitam jelas)
              const welcomeText = resolveVariables(ruleConfig.welcomeMessage, fromUsername);
              const btnLabel = ruleConfig.welcomeButtonLabel || "Ya, Saya Mau!";

              dmPayloadMessage = buildButtonTemplateMessage(welcomeText, [
                {
                  type: "postback",
                  title: btnLabel.slice(0, 20),
                  payload: `WELCOME_AGREE_${matchedRule.id}`,
                },
              ]);
            } else if (ruleConfig.featureAskForFollow && ruleConfig.askForFollowMessage) {
              // Step 4b: Ask For Follow Gate (Tanpa header kartu, teks hitam jelas)
              const followText = resolveVariables(ruleConfig.askForFollowMessage, fromUsername);
              const btnLabel = ruleConfig.askForFollowButtonLabel || "Sudah mengikuti 🙌";

              dmPayloadMessage = buildButtonTemplateMessage(followText, [
                {
                  type: "postback",
                  title: btnLabel.slice(0, 20),
                  payload: `CHECK_FOLLOW_${matchedRule.id}`,
                },
              ]);
            } else if (ruleConfig.featureAskForContact && ruleConfig.askContactMessage) {
              // Step 4c: Ask for Contact Request
              const contactText = resolveVariables(ruleConfig.askContactMessage, fromUsername);
              dmPayloadMessage = { text: contactText };
              initialMeta.awaitingContact = true;
              initialMeta.askContactType = ruleConfig.askContactType || "Email Saja";
            } else {
              // Step 4d: Pesan Utama (Delivery Akses/Materi Langsung)
              const deliveredText = resolveVariables(mainDmText, fromUsername);
              initialMeta.mainSentAt = new Date().toISOString();

              if (matchedRule.buttonText && matchedRule.buttonUrl) {
                const trackedUrl = buildTrackedUrl(
                  origin,
                  matchedRule.buttonUrl,
                  matchedRule.id,
                  ruleConfig.featureLinkTracking !== false
                );
                // Template Tombol tanpa header aturan dan tanpa pemotongan 80 karakter
                dmPayloadMessage = buildButtonTemplateMessage(deliveredText, [
                  {
                    type: "web_url",
                    url: trackedUrl,
                    title: matchedRule.buttonText.slice(0, 20),
                  },
                ]);
              } else {
                // Teks Biasa
                dmPayloadMessage = { text: deliveredText };
              }
            }

            // Panggil Meta Graph API Private Reply Endpoint
            const dmRes = await postToMetaGraph(
              `/me/messages`,
              {
                recipient: { comment_id: commentId },
                message: dmPayloadMessage,
              },
              account.accessToken
            );

            if (dmRes.ok) {
              dmStatus = "SENT";
              console.log(`✅ [Meta Webhook] Private reply DM sent to @${fromUsername}`);
            } else {
              const errDm = await dmRes.json().catch(() => ({}));
              dmStatus = "FAILED";
              failureReason = failureReason
                ? `${failureReason} | DM: ${errDm?.error?.message || "Gagal"}`
                : errDm?.error?.message || "Gagal mengirim DM";
              console.error(`❌ [Meta Webhook] Failed to send private DM:`, errDm);

              // Circuit Breaker jika token expired (Error 190)
              if (errDm?.error?.code === 190) {
                await (prisma as any).instagramAccount.update({
                  where: { id: account.id },
                  data: { isActive: false },
                });
              }
            }
          } catch (err: any) {
            dmStatus = "FAILED";
            failureReason = failureReason ? `${failureReason} | DM: ${err.message}` : err.message;
            console.error(`❌ [Meta Webhook] Exception sending private DM:`, err);
          }

          // =====================================================================
          // 5. CATAT LOG AKTIVITAS KE DATABASE
          // =====================================================================
          await (prisma as any).instagramAutomationLog.create({
            data: {
              accountId: account.id,
              ruleId: matchedRule.id,
              fromUsername: fromUsername || "pengguna",
              commentText: commentText.slice(0, 500),
              commentId: commentId,
              replyCommentStatus: replyCommentStatus,
              dmStatus: dmStatus,
              errorMessage: failureReason ? failureReason : stringifyLogMeta(initialMeta),
            },
          });
        }
      }

      // =========================================================================
      // B. EVENT: INTERAKSI DM BALASAN (User Mengirim Email/WA atau Klik Tombol)
      // =========================================================================
      const origin =
        req.nextUrl.origin && !req.nextUrl.origin.includes("localhost")
          ? req.nextUrl.origin
          : "https://ruangcreativemuslim-seven.vercel.app";

      const messagingList = entry.messaging || [];
      for (const msgEvent of messagingList) {
        const senderId = String(msgEvent.sender?.id || "");
        const msgText = (msgEvent.message?.text || "").trim();
        const postbackPayload = msgEvent.postback?.payload || msgEvent.message?.quick_reply?.payload;

        if (!senderId || senderId === account.instagramId || senderId === account.pageId) continue;

        // 1. Cek apakah ada postback (contoh: user klik tombol di Pesan Pembuka atau "Sudah mengikuti 🙌")
        if (postbackPayload) {
          const ruleId = postbackPayload.split("_").pop();
          const targetRule = await (prisma as any).instagramAutomationRule.findFirst({
            where: { id: ruleId },
          });

          if (targetRule) {
            let ruleConfig: any = {};
            try {
              if (targetRule.dmMessage && (targetRule.dmMessage.startsWith("{") || targetRule.dmMessage.includes('"mainMessage"'))) {
                ruleConfig = JSON.parse(targetRule.dmMessage);
              }
            } catch (e) {}

            // Ambil profil & status follow real-time (is_user_follow_business) dari Meta Graph API
            const userProfile = await getIgUserProfile(senderId, account.accessToken);
            const senderUsername = userProfile.username || "kak";
            const mainText = resolveVariables(ruleConfig.mainMessage || targetRule.dmMessage || "", senderUsername);

            // Cari log terbaru untuk user & rule ini agar bisa diupdate status read / newFollower / awaitingContact
            const recentLogs = await (prisma as any).instagramAutomationLog.findMany({
              where: { ruleId: targetRule.id },
              orderBy: { createdAt: "desc" },
              take: 25,
            });
            const userLog =
              recentLogs.find((l: any) => {
                const m = parseLogMeta(l.errorMessage);
                return (
                  m.senderId === senderId ||
                  (senderUsername && l.fromUsername?.toLowerCase() === senderUsername.toLowerCase())
                );
              }) || recentLogs[0];

            const currentMeta = userLog ? parseLogMeta(userLog.errorMessage) : {};
            const updatedMeta: Record<string, any> = {
              ...currentMeta,
              read: true,
              senderId,
            };

            // Helper untuk membangun pesan tahap akhir (Ask for Contact atau Pesan Utama)
            const buildFinalOrContactStep = () => {
              if (ruleConfig.featureAskForContact && ruleConfig.askContactMessage && !updatedMeta.contact) {
                updatedMeta.awaitingContact = true;
                updatedMeta.askContactType = ruleConfig.askContactType || "Email Saja";
                return { text: resolveVariables(ruleConfig.askContactMessage, senderUsername) };
              }
              updatedMeta.awaitingContact = false;
              updatedMeta.mainSentAt = new Date().toISOString();
              if (targetRule.buttonText && targetRule.buttonUrl) {
                const trackedUrl = buildTrackedUrl(
                  origin,
                  targetRule.buttonUrl,
                  targetRule.id,
                  ruleConfig.featureLinkTracking !== false,
                  userLog?.id,
                  senderId
                );
                return buildButtonTemplateMessage(mainText, [
                  {
                    type: "web_url",
                    url: trackedUrl,
                    title: targetRule.buttonText.slice(0, 20),
                  },
                ]);
              }
              return { text: mainText };
            };

            let nextMsg: any = null;

            if (postbackPayload.startsWith("WELCOME_AGREE")) {
              // User baru saja klik tombol pada Pesan Pembuka
              if (ruleConfig.featureAskForFollow && ruleConfig.askForFollowMessage) {
                if (userProfile.isFollowing === true) {
                  // Jika ternyata user sudah follow, langsung kirim Ask For Contact / Pesan Utama
                  console.log(`✅ [Meta Webhook] @${senderUsername} already follows @${account.username}, skipping Ask For Follow gate.`);
                  nextMsg = buildFinalOrContactStep();
                } else {
                  // Tandai bahwa user awalnya belum follow (agar saat nanti follow terhitung sebagai New Follower)
                  updatedMeta.wasUnfollowed = true;
                  console.log(`🔒 [Meta Webhook] @${senderUsername} has not followed @${account.username} yet. Sending Ask For Follow gate.`);
                  const followText = resolveVariables(ruleConfig.askForFollowMessage, senderUsername);
                  const followBtnLabel = ruleConfig.askForFollowButtonLabel || "Sudah mengikuti 🙌";
                  nextMsg = buildButtonTemplateMessage(followText, [
                    {
                      type: "postback",
                      title: followBtnLabel.slice(0, 20),
                      payload: `CHECK_FOLLOW_${targetRule.id}`,
                    },
                  ]);
                }
              } else {
                // Ask For Follow tidak aktif -> langsung ke Ask For Contact / Pesan Utama
                nextMsg = buildFinalOrContactStep();
              }
            } else if (postbackPayload.startsWith("CHECK_FOLLOW")) {
              // User klik tombol "Sudah mengikuti 🙌" -> Verifikasi real-time ke Meta API
              if (userProfile.isFollowing === false) {
                updatedMeta.wasUnfollowed = true;
                // User belum benar-benar follow! Kirim pesan Retry / Peringatan Belum Follow
                console.log(`⚠️ [Meta Webhook] @${senderUsername} clicked CHECK_FOLLOW but is_user_follow_business is false. Sending retry prompt.`);
                const retryRawText =
                  (ruleConfig.askForFollowHasRetry !== false && ruleConfig.askForFollowRetryMessage)
                    ? ruleConfig.askForFollowRetryMessage
                    : (ruleConfig.askForFollowMessage || "Oiya kak, sepertinya akun ini belum di-follow 😊\n\nFollow dulu ya kak, setelah itu klik tombol di bawah 🙌");
                const retryText = resolveVariables(retryRawText, senderUsername);
                const retryBtnLabel =
                  ruleConfig.askForFollowRetryButtonLabel ||
                  ruleConfig.askForFollowButtonLabel ||
                  "Sudah mengikuti 🙌";

                nextMsg = buildButtonTemplateMessage(retryText, [
                  {
                    type: "postback",
                    title: retryBtnLabel.slice(0, 20),
                    payload: `CHECK_FOLLOW_${targetRule.id}`,
                  },
                ]);
              } else {
                // User sudah benar-benar follow! Catat sebagai New Follower
                updatedMeta.newFollower = true;
                console.log(`✅ [Meta Webhook] Verified @${senderUsername} follows @${account.username}! Delivering content.`);
                nextMsg = buildFinalOrContactStep();
              }
            }

            if (userLog && (!userLog.errorMessage || userLog.errorMessage.startsWith("__META__:"))) {
              await (prisma as any).instagramAutomationLog.update({
                where: { id: userLog.id },
                data: { errorMessage: stringifyLogMeta(updatedMeta) },
              }).catch(() => {});
            }

            if (nextMsg) {
              await postToMetaGraph(
                `/me/messages`,
                {
                  recipient: { id: senderId },
                  message: nextMsg,
                },
                account.accessToken
              ).catch(() => {});
            }
          }
          continue;
        }

        // 2. Cek apakah ini Story Reply / Reaksi Story / Story Mention
        const isStoryReply = Boolean(msgEvent.message?.reply_to?.story);
        const isStoryMention = Boolean(
          msgEvent.message?.attachments?.some((a: any) => a.type === "story_mention") ||
          (msgEvent.message as any)?.story_mention ||
          (msgEvent as any).story_mention
        );
        const storyId = msgEvent.message?.reply_to?.story?.id;
        const messageId = msgEvent.message?.mid;

        if ((isStoryReply || isStoryMention) && !msgEvent.message?.is_echo) {
          console.log(`📸 [Meta Webhook] Story interaction detected from ${senderId}. StoryId: ${storyId}, text: "${msgText}"`);

          // Deduplikasi Idempotency
          if (messageId) {
            const existingLog = await (prisma as any).instagramAutomationLog.findFirst({
              where: { commentId: messageId },
            });
            if (existingLog) {
              console.log(`⏩ [Meta Webhook] Story message ${messageId} already processed, skipping.`);
              continue;
            }
          }

          // Cari semua aturan aktif untuk akun ini
          const activeRules = await (prisma as any).instagramAutomationRule.findMany({
            where: {
              accountId: account.id,
              isActive: true,
            },
            orderBy: { createdAt: "desc" },
          });

          // Filter aturan Story yang sesuai dengan tipe pemicunya
          let matchedRule: any = null;

          if (isStoryReply) {
            // Prioritas 1: SPECIFIC_STORY yang cocok dengan storyId
            if (storyId) {
              matchedRule = activeRules.find(
                (r: any) => r.triggerType === "SPECIFIC_STORY" && r.specificPostId === storyId
              );
            }
            // Prioritas 2: ALL_STORIES (semua story)
            if (!matchedRule) {
              matchedRule = activeRules.find((r: any) => r.triggerType === "ALL_STORIES");
            }
          } else if (isStoryMention) {
            // Prioritas 1: STORY_MENTION
            matchedRule = activeRules.find((r: any) => r.triggerType === "STORY_MENTION");
          }

          if (matchedRule) {
            let ruleConfig: any = {};
            try {
              if (matchedRule.dmMessage && (matchedRule.dmMessage.startsWith("{") || matchedRule.dmMessage.includes('"mainMessage"'))) {
                ruleConfig = JSON.parse(matchedRule.dmMessage);
              }
            } catch (e) {}

            // Cek kecocokan kata kunci (keywords) jika triggerCommentType === "KEYWORDS"
            let isTriggerMatched = true;
            if (matchedRule.triggerCommentType === "KEYWORDS") {
              const ruleKeywords = (matchedRule.keywords || "").split(",").map((k: string) => k.trim().toLowerCase()).filter(Boolean);
              const userText = msgText.toLowerCase();
              const ruleStyle = (ruleConfig.keywordRule || "Contains").toLowerCase();

              if (ruleKeywords.length > 0) {
                if (ruleStyle === "match") {
                  isTriggerMatched = ruleKeywords.some((kw: string) => userText === kw);
                } else if (ruleStyle === "starts with") {
                  isTriggerMatched = ruleKeywords.some((kw: string) => userText.startsWith(kw));
                } else {
                  // Contains (default)
                  isTriggerMatched = ruleKeywords.some((kw: string) => userText.includes(kw));
                }
              }
            }

            if (isTriggerMatched) {
              console.log(`🎯 [Meta Webhook] Story Rule "${matchedRule.name}" matched for sender ${senderId}!`);

              // A. Balas Reaksi Love (❤️) jika diaktifkan di konfigurasi aturan
              if (ruleConfig.replyHeartReaction && messageId) {
                console.log(`❤️ [Meta Webhook] Sending heart reaction to story reply ${messageId}`);
                await postToMetaGraph(
                  `/me/messages`,
                  {
                    recipient: { id: senderId },
                    message: {
                      reaction: {
                        action: "react",
                        emoji: "❤️",
                        message_id: messageId,
                      },
                    },
                  },
                  account.accessToken
                ).catch((err) => {
                  console.warn("⚠️ [Meta Webhook] Failed to react with heart:", err);
                });
              }

              // B. Ambil Profil & Status Follow Pengguna
              const userProfile = await getIgUserProfile(senderId, account.accessToken);
              const senderUsername = userProfile.username || "kak";

              const initialMeta: Record<string, any> = {
                senderId,
                read: false,
                sentAt: new Date().toISOString(),
                isStory: true,
                storyId: storyId || "story_mention",
              };

              let dmStatus = "SENT";
              let failureReason = "";

              // C. Eksekusi Funnel Pesan (Welcome -> Ask Follow -> Ask Contact -> Main Message)
              try {
                let firstDmPayload: any = null;

                if (ruleConfig.featureWelcomeMessage && ruleConfig.welcomeMessage) {
                  // 1. Pesan Pembuka
                  initialMeta.awaitingWelcome = true;
                  const welcomeText = resolveVariables(ruleConfig.welcomeMessage, senderUsername);
                  const welcomeBtnLabel = ruleConfig.welcomeButtonLabel || "Ya, Saya Mau!";
                  firstDmPayload =
                    ruleConfig.welcomeMessageType === "Template Tombol"
                      ? buildButtonTemplateMessage(welcomeText, [
                          {
                            type: "postback",
                            title: welcomeBtnLabel.slice(0, 20),
                            payload: `WELCOME_AGREE_${matchedRule.id}`,
                          },
                        ])
                      : { text: welcomeText };
                } else if (ruleConfig.featureAskForFollow && ruleConfig.askForFollowMessage) {
                  // 2. Ask For Follow
                  if (userProfile.isFollowing === true) {
                    console.log(`✅ [Meta Webhook] User already follows, proceeding to main DM`);
                    initialMeta.awaitingWelcome = false;
                  } else {
                    initialMeta.wasUnfollowed = true;
                    const followText = resolveVariables(ruleConfig.askForFollowMessage, senderUsername);
                    const followBtnLabel = ruleConfig.askForFollowButtonLabel || "Sudah mengikuti 🙌";
                    firstDmPayload = buildButtonTemplateMessage(followText, [
                      {
                        type: "postback",
                        title: followBtnLabel.slice(0, 20),
                        payload: `CHECK_FOLLOW_${matchedRule.id}`,
                      },
                    ]);
                  }
                }

                // 3. Jika belum diisi oleh Welcome / Ask Follow -> Cek Ask For Contact atau Pesan Utama
                if (!firstDmPayload) {
                  if (ruleConfig.featureAskForContact && ruleConfig.askContactMessage) {
                    initialMeta.awaitingContact = true;
                    initialMeta.askContactType = ruleConfig.askContactType || "Email Saja";
                    firstDmPayload = { text: resolveVariables(ruleConfig.askContactMessage, senderUsername) };
                  } else {
                    // Pesan Utama Langsung
                    initialMeta.mainSentAt = new Date().toISOString();
                    const mainText = resolveVariables(ruleConfig.mainMessage || matchedRule.dmMessage || "", senderUsername);
                    if (matchedRule.buttonText && matchedRule.buttonUrl) {
                      const trackedUrl = buildTrackedUrl(
                        origin,
                        matchedRule.buttonUrl,
                        matchedRule.id,
                        ruleConfig.featureLinkTracking !== false,
                        undefined,
                        senderId
                      );
                      firstDmPayload = buildButtonTemplateMessage(mainText, [
                        {
                          type: "web_url",
                          url: trackedUrl,
                          title: matchedRule.buttonText.slice(0, 20),
                        },
                      ]);
                    } else {
                      firstDmPayload = { text: mainText };
                    }
                  }
                }

                const dmRes = await postToMetaGraph(
                  `/me/messages`,
                  {
                    recipient: { id: senderId },
                    message: firstDmPayload,
                  },
                  account.accessToken
                );

                if (!dmRes.ok) {
                  const errDm = await dmRes.json().catch(() => ({}));
                  dmStatus = "FAILED";
                  failureReason = errDm?.error?.message || "Gagal mengirim DM Story";
                  console.error(`❌ [Meta Webhook] Failed to send story reply DM:`, errDm);
                } else {
                  console.log(`✅ [Meta Webhook] Story automation DM sent successfully to ${senderId}`);
                }
              } catch (err: any) {
                dmStatus = "FAILED";
                failureReason = err.message || "Exception sending story DM";
              }

              // D. Catat Log ke Database
              await (prisma as any).instagramAutomationLog.create({
                data: {
                  accountId: account.id,
                  ruleId: matchedRule.id,
                  fromUsername: senderUsername || "pengguna",
                  commentText: isStoryMention
                    ? `[Story Mention] ${msgText || ""}`.trim()
                    : `[Story Reply] ${msgText || "Reaction"}`,
                  commentId: messageId || `story_${Date.now()}`,
                  replyCommentStatus: "SKIPPED",
                  dmStatus: dmStatus,
                  errorMessage: failureReason ? failureReason : stringifyLogMeta(initialMeta),
                },
              });

              continue;
            }
          }
        }

        // 3. Cek apakah user sedang berada di tahap Ask for Contact (mengirim teks balasan di DM)
        if (msgText && !msgEvent.message?.is_echo) {
          const userProfile = await getIgUserProfile(senderId, account.accessToken);
          const senderUsername = userProfile.username || "kak";

          // Cari log terbaru milik user ini yang sedang menunggu input kontak (awaitingContact === true)
          const recentAccountLogs = await (prisma as any).instagramAutomationLog.findMany({
            where: { accountId: account.id },
            include: { rule: true },
            orderBy: { createdAt: "desc" },
            take: 30,
          });

          const awaitingLog = recentAccountLogs.find((l: any) => {
            const m = parseLogMeta(l.errorMessage);
            const isSameUser =
              m.senderId === senderId ||
              (senderUsername && l.fromUsername?.toLowerCase() === senderUsername.toLowerCase());
            return isSameUser && m.awaitingContact === true;
          });

          const emailMatch = msgText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
          const phoneMatch = msgText.match(/(?:\+62|62|08)[0-9]{8,13}/);

          if (awaitingLog && awaitingLog.rule) {
            const targetRule = awaitingLog.rule;
            let ruleConfig: any = {};
            try {
              if (targetRule.dmMessage && (targetRule.dmMessage.startsWith("{") || targetRule.dmMessage.includes('"mainMessage"'))) {
                ruleConfig = JSON.parse(targetRule.dmMessage);
              }
            } catch {}

            const contactType = (ruleConfig.askContactType || "Email Saja").toLowerCase();
            const isEmailValid = Boolean(emailMatch);
            const isPhoneValid = Boolean(phoneMatch);
            const isValidContact = contactType.includes("whatsapp") && !contactType.includes("email")
              ? isPhoneValid
              : contactType.includes("email") && !contactType.includes("whatsapp")
              ? isEmailValid
              : isEmailValid || isPhoneValid;

            if (!isValidContact) {
              // Kirim pesan peringatan format kontak belum sesuai (askContactInvalidMessage)
              const invalidMsg = resolveVariables(
                ruleConfig.askContactInvalidMessage ||
                  "Waduh, format kontaknya kayaknya belum pas nih kak 😅 Coba cek dan ketik ulang ya 🙏",
                senderUsername
              );
              await postToMetaGraph(
                `/me/messages`,
                {
                  recipient: { id: senderId },
                  message: { text: invalidMsg },
                },
                account.accessToken
              ).catch(() => {});
            } else {
              // Kontak valid! Simpan kontak ke metadata log dan kirim Pesan Utama
              const currentMeta = parseLogMeta(awaitingLog.errorMessage);
              const updatedMeta = {
                ...currentMeta,
                read: true,
                senderId,
                awaitingContact: false,
                contact: emailMatch?.[0] || phoneMatch?.[0] || msgText,
                mainSentAt: new Date().toISOString(),
              };

              await (prisma as any).instagramAutomationLog.update({
                where: { id: awaitingLog.id },
                data: { errorMessage: stringifyLogMeta(updatedMeta) },
              }).catch(() => {});

              const deliveredMain = resolveVariables(
                ruleConfig.mainMessage || targetRule.dmMessage || "Sip, kontak kamu sudah tersimpan dengan aman! Ini link akses materinya ya:",
                senderUsername
              );

              const trackedUrl = buildTrackedUrl(
                origin,
                targetRule.buttonUrl || "https://ruangcreativemuslim.com",
                targetRule.id,
                ruleConfig.featureLinkTracking !== false,
                awaitingLog.id,
                senderId
              );

              const finalPayload =
                targetRule.buttonText && targetRule.buttonUrl
                  ? buildButtonTemplateMessage(deliveredMain, [
                      {
                        type: "web_url",
                        url: trackedUrl,
                        title: targetRule.buttonText.slice(0, 20),
                      },
                    ])
                  : { text: deliveredMain };

              await postToMetaGraph(
                `/me/messages`,
                {
                  recipient: { id: senderId },
                  message: finalPayload,
                },
                account.accessToken
              ).catch(() => {});
            }
          } else if (emailMatch || phoneMatch) {
            // Fallback jika ada aturan aktif yang meminta kontak namun belum tercatat awaitingContact
            const latestRule = await (prisma as any).instagramAutomationRule.findFirst({
              where: { accountId: account.id, isActive: true },
              orderBy: { updatedAt: "desc" },
            });

            if (latestRule) {
              let ruleConfig: any = {};
              try {
                if (latestRule.dmMessage && (latestRule.dmMessage.startsWith("{") || latestRule.dmMessage.includes('"mainMessage"'))) {
                  ruleConfig = JSON.parse(latestRule.dmMessage);
                }
              } catch {}
              const deliveredMain = resolveVariables(
                ruleConfig.mainMessage || latestRule.dmMessage || "Sip, kontak kamu sudah tersimpan dengan aman! Ini link akses materinya ya:",
                senderUsername
              );
              const trackedUrl = buildTrackedUrl(
                origin,
                latestRule.buttonUrl || "https://ruangcreativemuslim.com",
                latestRule.id,
                ruleConfig.featureLinkTracking !== false,
                undefined,
                senderId
              );
              const finalPayload =
                latestRule.buttonText && latestRule.buttonUrl
                  ? buildButtonTemplateMessage(deliveredMain, [
                      {
                        type: "web_url",
                        url: trackedUrl,
                        title: latestRule.buttonText.slice(0, 20),
                      },
                    ])
                  : { text: deliveredMain };

              await postToMetaGraph(
                `/me/messages`,
                {
                  recipient: { id: senderId },
                  message: finalPayload,
                },
                account.accessToken
              ).catch(() => {});
            }
          }
        }
      }

      // Jalankan pemeriksaan pesan Follow Up yang sudah jatuh tempo secara non-blocking
      processPendingFollowUps(account, origin).catch(() => {});
    }

    return new NextResponse("EVENT_RECEIVED", { status: 200 });
  } catch (error: any) {
    console.error("❌ [Meta Webhook Error]:", error);
    // Meta mewajibkan respon HTTP 200 agar webhook tidak di-retry berulang kali jika ada error internal
    return new NextResponse("EVENT_RECEIVED", { status: 200 });
  }
}
