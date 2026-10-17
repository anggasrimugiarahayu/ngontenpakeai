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
 * Helper: Memeriksa kecocokan kata kunci berdasarkan aturan (Contains, Match, Starts with)
 * Digunakan secara konsisten baik pada komentar Post/Reels maupun interaksi Story
 */
function checkKeywordMatch(
  inputText: string,
  rawKeywords: string[] | string,
  ruleStyle: string = "Contains"
): boolean {
  const keywords = (
    Array.isArray(rawKeywords)
      ? rawKeywords
      : typeof rawKeywords === "string"
      ? rawKeywords.split(",")
      : []
  )
    .map((k: string) => k.trim().toLowerCase())
    .filter(Boolean);

  // Jika daftar kata kunci kosong, dianggap pemicu wildcard (semua kata cocok)
  if (keywords.length === 0) return true;

  const cleanText = (inputText || "").trim().toLowerCase();
  if (!cleanText) return false;

  const style = (ruleStyle || "Contains").toLowerCase().trim();

  if (style === "match" || style === "exact") {
    // Match: Seluruh kata/pesan komentar harus sama persis dengan salah satu kata kunci
    return keywords.some((kw) => cleanText === kw);
  } else if (style === "starts with" || style === "startswith") {
    // Starts with: Komentar/pesan harus diawali dengan salah satu kata kunci
    return keywords.some((kw) => cleanText.startsWith(kw));
  } else {
    // Contains (default): Komentar/pesan mengandung kata kunci di mana saja
    return keywords.some((kw) => cleanText.includes(kw));
  }
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

/**
 * Helper: Membangun payload Pesan Utama DM (mendukung 3 Jenis Pesan: BUTTON_TEMPLATE, PLAIN_TEXT, dan CAROUSEL)
 * Berlaku untuk semua tipe aturan termasuk multi-item Konten pada Live Instagram
 */
function buildMainDmPayload(params: {
  rule: any;
  ruleConfig: any;
  liveContentItem?: any;
  username: string;
  origin: string;
  logId?: string;
  senderId?: string;
}): any {
  const { rule, ruleConfig, liveContentItem, username, origin, logId, senderId } = params;
  const enableTracking = ruleConfig?.featureLinkTracking !== false;
  const msgType: "BUTTON_TEMPLATE" | "PLAIN_TEXT" | "CAROUSEL" =
    liveContentItem?.messageType ||
    ruleConfig?.messageType ||
    (rule?.buttonText && rule?.buttonUrl ? "BUTTON_TEMPLATE" : "PLAIN_TEXT");

  const rawText =
    liveContentItem?.message ||
    liveContentItem?.dmMessage ||
    ruleConfig?.mainMessage ||
    rule?.dmMessage ||
    "Halo @{username}! Terima kasih sudah tertarik.";
  const deliveredText = resolveVariables(rawText, username);

  // 1. CAROUSEL (Generic Template)
  if (msgType === "CAROUSEL") {
    const rawSlides =
      Array.isArray(liveContentItem?.carouselSlides) && liveContentItem.carouselSlides.length > 0
        ? liveContentItem.carouselSlides
        : Array.isArray(ruleConfig?.carouselSlides)
        ? ruleConfig.carouselSlides
        : [];

    const elements = rawSlides
      .filter((s: any) => s && (s.title?.trim() || s.subtitle?.trim() || s.image?.trim()))
      .slice(0, 10)
      .map((s: any, idx: number) => {
        const slideButtons = Array.isArray(s.buttons)
          ? s.buttons
              .filter((b: any) => b && b.label?.trim() && b.url?.trim())
              .slice(0, 3)
              .map((b: any) => ({
                type: "web_url",
                url: buildTrackedUrl(origin, b.url, rule.id, enableTracking, logId, senderId),
                title: b.label.trim().slice(0, 20),
              }))
          : [];
        const el: Record<string, any> = {
          title: resolveVariables(s.title?.trim() || `Slide ${idx + 1}`, username).slice(0, 80),
        };
        if (s.subtitle?.trim()) {
          el.subtitle = resolveVariables(s.subtitle.trim(), username).slice(0, 80);
        }
        const imgUrl = (s.image || ruleConfig?.postCoverUrl || "").trim();
        if (imgUrl && /^https?:\/\//i.test(imgUrl)) {
          el.image_url = imgUrl;
        }
        if (slideButtons.length > 0) {
          el.buttons = slideButtons;
        }
        return el;
      });

    if (elements.length > 0) {
      return {
        attachment: {
          type: "template",
          payload: {
            template_type: "generic",
            elements,
          },
        },
      };
    }
  }

  // 2. BUTTON_TEMPLATE (Template Tombol: Buka Website & Kirim Teks)
  if (msgType === "BUTTON_TEMPLATE") {
    const rawButtons = Array.isArray(liveContentItem?.buttons)
      ? liveContentItem.buttons
      : Array.isArray(ruleConfig?.buttons)
      ? ruleConfig.buttons
      : [];

    const validButtons = rawButtons
      .filter((b: any) => {
        const lbl = b?.labelType === "Klik Disini" ? "Klik Disini" : b?.label?.trim();
        if (!lbl) return false;
        if (b?.action === "Kirim Teks") return Boolean(b?.text?.trim());
        return Boolean(b?.url?.trim());
      })
      .slice(0, 3)
      .map((b: any) => {
        const title = (b.labelType === "Klik Disini" ? "Klik Disini" : b.label.trim()).slice(0, 20);
        if (b.action === "Kirim Teks") {
          return {
            type: "postback",
            title,
            payload: `BTN_TEXT::${rule.id}::${b.id}`,
          };
        }
        return {
          type: "web_url",
          url: buildTrackedUrl(origin, b.url, rule.id, enableTracking, logId, senderId),
          title,
        };
      });

    if (validButtons.length > 0) {
      return buildButtonTemplateMessage(deliveredText, validButtons);
    }

    if (rule?.buttonText && rule?.buttonUrl) {
      const trackedUrl = buildTrackedUrl(origin, rule.buttonUrl, rule.id, enableTracking, logId, senderId);
      return buildButtonTemplateMessage(deliveredText, [
        {
          type: "web_url",
          url: trackedUrl,
          title: rule.buttonText.slice(0, 20),
        },
      ]);
    }
  }

  // 3. PLAIN_TEXT (Teks Biasa + Quick Replies)
  const rawQuickReplies = Array.isArray(liveContentItem?.quickReplies)
    ? liveContentItem.quickReplies
    : Array.isArray(ruleConfig?.quickReplies)
    ? ruleConfig.quickReplies
    : [];

  const activeQuickReplies = rawQuickReplies.filter((q: any) => (q?.label || q?.text || "").trim());
  if (activeQuickReplies.length > 0) {
    return {
      text: deliveredText,
      quick_replies: activeQuickReplies.slice(0, 13).map((q: any) => ({
        content_type: "text",
        title: (q.label || q.text || "Pilih").trim().slice(0, 20),
        payload: `LIVE_QR::${rule.id}::${q.id}`,
      })),
    };
  }

  return { text: deliveredText };
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
      // A. EVENT: KOMENTAR MASUK (field === "comments" atau "live_comments")
      // =========================================================================
      const changes = entry.changes || [];
      for (const change of changes) {
        if ((change.field === "comments" || change.field === "live_comments") && change.value) {
          const comment = change.value;
          const commentId = comment.id;
          const commentText = (comment.text || "").trim();
          const fromUser = comment.from || {};
          const fromId = String(fromUser.id || "");
          const fromUsername = fromUser.username || "pengguna";
          const mediaId = comment.media?.id;
          const isLiveCommentEvent =
            change.field === "live_comments" ||
            String(comment.media?.media_product_type || "").toUpperCase() === "LIVE";

          console.log(
            `💬 [Meta Webhook] New ${isLiveCommentEvent ? "LIVE comment" : "comment"} on media ${mediaId} from @${fromUsername} (${fromId}): "${commentText}"`
          );

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

          let candidateRules: any[] = [];
          let matchedLiveContent: any = null;

          if (isLiveCommentEvent) {
            // Khusus Komentar Live Instagram: hanya evaluasi aturan LIVE / INSTAGRAM_LIVE
            candidateRules = rules.filter(
              (r: any) => r.triggerType === "LIVE" || r.triggerType === "INSTAGRAM_LIVE"
            );
          } else {
            // Rule Isolation & Priority Hierarchy untuk Post / Reels
            // 1. Cek apakah mediaId ini memiliki aturan khusus (SPECIFIC_POST atau NEXT_POST yang sudah terikat)
            const specificRules = rules.filter(
              (r: any) =>
                (r.triggerType === "SPECIFIC_POST" && r.specificPostId === mediaId) ||
                (r.triggerType === "NEXT_POST" && r.specificPostId === mediaId)
            );

            // 2. Cek apakah ada aturan NEXT_POST yang belum terikat (unbound)
            const unboundNextPostRules = rules.filter(
              (r: any) => r.triggerType === "NEXT_POST" && !r.specificPostId
            );

            // Jika mediaId ini belum punya specificRule, tapi ada unboundNextPostRule:
            if (specificRules.length === 0 && unboundNextPostRules.length > 0) {
              const nextRule = unboundNextPostRules[0];
              console.log(
                `🎯 [Meta Webhook] Next post detected! Binding NEXT_POST rule "${nextRule.name}" to media ID: ${mediaId}`
              );
              (prisma as any).instagramAutomationRule
                .update({
                  where: { id: nextRule.id },
                  data: { specificPostId: mediaId },
                })
                .catch(() => null);
              nextRule.specificPostId = mediaId;
              specificRules.push(nextRule);
            }

            // 3. SELEKSI CANDIDATE RULES DENGAN ATURAN ISOLASI:
            if (specificRules.length > 0) {
              console.log(
                `🔒 [Meta Webhook] Media ${mediaId} is a DEDICATED post with ${specificRules.length} specific rule(s). ALL_POSTS rules are strictly excluded.`
              );
              candidateRules = specificRules;
            } else {
              console.log(
                `🌐 [Meta Webhook] Media ${mediaId} is a GENERAL post without dedicated rules. Evaluating ALL_POSTS rules.`
              );
              candidateRules = rules.filter((r: any) => r.triggerType === "ALL_POSTS");
            }

            // 4. SORTING PRIORITAS KATA KUNCI:
            candidateRules.sort((a: any, b: any) => {
              const aKeywords = Array.isArray(a.keywords) ? a.keywords.length : 0;
              const bKeywords = Array.isArray(b.keywords) ? b.keywords.length : 0;
              if (aKeywords > 0 && bKeywords === 0) return -1;
              if (aKeywords === 0 && bKeywords > 0) return 1;
              return 0;
            });
          }

          // Filter aturan yang cocok kata kuncinya (Single Winner Rule)
          const matchedRule = candidateRules.find((rule: any) => {
            console.log(`🔍 [Meta Webhook] Checking rule "${rule.name}" (${rule.triggerType}) against media ID: ${mediaId}`);

            // Unpack konfigurasi aturan lanjutan jika ada
            let cfg: any = {};
            try {
              if (rule.dmMessage && (rule.dmMessage.startsWith("{") || rule.dmMessage.includes('"mainMessage"'))) {
                cfg = JSON.parse(rule.dmMessage);
              }
            } catch (e) {}

            const ruleStyle = cfg.keywordRule || "Contains";

            // Jika aturan Live Instagram memiliki multi-content (liveContents), cari item Content yang kata pemicunya cocok
            if (isLiveCommentEvent && Array.isArray(cfg.liveContents) && cfg.liveContents.length > 0) {
              const foundContent = cfg.liveContents.find((c: any) =>
                checkKeywordMatch(commentText, c.keywords || "", ruleStyle)
              );
              if (foundContent) {
                matchedLiveContent = foundContent;
                console.log(
                  `✅ [Meta Webhook] Live Rule "${rule.name}" matched content keywords "${foundContent.keywords}"`
                );
                return true;
              }
              return false;
            }

            // Cek jika triggerCommentType === "ALL" (Semua Komentar)
            if (cfg.triggerCommentType === "ALL") {
              console.log(`✅ [Meta Webhook] Rule "${rule.name}" matched: triggerCommentType is ALL`);
              return true;
            }

            // Cek kata kunci pemicu dengan aturan (Contains, Match, Starts with)
            const keywords = Array.isArray(rule.keywords) ? rule.keywords : [];
            if (keywords.length === 0) {
              console.log(`✅ [Meta Webhook] Rule "${rule.name}" matched: trigger on ALL keywords`);
              return true;
            }

            const isMatched = checkKeywordMatch(commentText, keywords, ruleStyle);
            if (isMatched) {
              console.log(`✅ [Meta Webhook] Rule "${rule.name}" matched keyword with style "${ruleStyle}": "${commentText}"`);
            } else {
              console.log(`⏩ [Meta Webhook] Keyword mismatch for comment "${commentText}" against keywords:`, keywords, `(style: ${ruleStyle})`);
            }
            return isMatched;
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
            matchedLiveContent?.message ||
            ruleConfig.mainMessage ||
            matchedRule.dmMessage ||
            "Halo @{username}! Terima kasih sudah tertarik. Ini link akses yang kamu minta:\nhttps://ruangcreativemuslim.com";

          let replyCommentStatus = "SKIPPED";
          let dmStatus = "SKIPPED";
          let failureReason = null;

          // =====================================================================
          // 3. EKSEKUSI: BALAS KOMENTAR PUBLIK (Spintax Acak - khusus Post/Reels)
          // =====================================================================
          const shouldReplyComment =
            !isLiveCommentEvent &&
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
            ...(fromId ? { senderId: fromId } : {}),
            ...(isLiveCommentEvent ? { isLive: true } : {}),
            ...(matchedLiveContent?.id ? { liveContentId: matchedLiveContent.id } : {}),
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
              // Step 4d: Pesan Utama (Delivery Akses/Materi Langsung - mendukung BUTTON_TEMPLATE, PLAIN_TEXT, dan CAROUSEL)
              initialMeta.mainSentAt = new Date().toISOString();
              dmPayloadMessage = buildMainDmPayload({
                rule: matchedRule,
                ruleConfig,
                liveContentItem: matchedLiveContent,
                username: fromUsername,
                origin,
                senderId: fromId || undefined,
              });
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
              commentText: isLiveCommentEvent
                ? `[Live] ${commentText}`.slice(0, 500)
                : commentText.slice(0, 500),
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

        // 1. Cek apakah ada postback (contoh: user klik tombol di Pesan Pembuka, "Sudah mengikuti 🙌", Kirim Teks, atau Quick Reply)
        if (postbackPayload) {
          if (postbackPayload.startsWith("LIVE_QR::") || postbackPayload.startsWith("BTN_TEXT::")) {
            const isBtnText = postbackPayload.startsWith("BTN_TEXT::");
            const parts = postbackPayload.split("::");
            const pbRuleId = parts[1];
            const itemId = parts[2];
            const pbRule = await (prisma as any).instagramAutomationRule.findFirst({
              where: { id: pbRuleId },
            });
            if (pbRule) {
              let pbRuleConfig: any = {};
              try {
                if (pbRule.dmMessage && (pbRule.dmMessage.startsWith("{") || pbRule.dmMessage.includes('"mainMessage"'))) {
                  pbRuleConfig = JSON.parse(pbRule.dmMessage);
                }
              } catch {}

              let foundReplyText = "";
              if (isBtnText) {
                // Cari di buttons utama atau di liveContents[].buttons
                const allButtons: any[] = [
                  ...(Array.isArray(pbRuleConfig.buttons) ? pbRuleConfig.buttons : []),
                  ...(Array.isArray(pbRuleConfig.liveContents)
                    ? pbRuleConfig.liveContents.flatMap((c: any) => (Array.isArray(c.buttons) ? c.buttons : []))
                    : []),
                ];
                const matchedBtn = allButtons.find((b: any) => String(b?.id) === String(itemId));
                foundReplyText = matchedBtn?.text || "";
              } else {
                // Cari di quickReplies utama atau di liveContents[].quickReplies
                const allQrs: any[] = [
                  ...(Array.isArray(pbRuleConfig.quickReplies) ? pbRuleConfig.quickReplies : []),
                  ...(Array.isArray(pbRuleConfig.liveContents)
                    ? pbRuleConfig.liveContents.flatMap((c: any) => (Array.isArray(c.quickReplies) ? c.quickReplies : []))
                    : []),
                ];
                const matchedQr = allQrs.find(
                  (q: any) =>
                    String(q?.id) === String(itemId) ||
                    (msgText && q?.label?.trim().toLowerCase() === msgText.toLowerCase())
                );
                foundReplyText = matchedQr?.text || "";
              }

              if (foundReplyText) {
                const userProfile = await getIgUserProfile(senderId, account.accessToken);
                const senderUsername = userProfile.username || "kak";
                const replyText = resolveVariables(foundReplyText, senderUsername);
                await postToMetaGraph(
                  `/me/messages`,
                  {
                    recipient: { id: senderId },
                    message: { text: replyText },
                  },
                  account.accessToken
                ).catch(() => {});
              }
            }
            continue;
          }

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

            const matchedLiveContentItem =
              updatedMeta.liveContentId && Array.isArray(ruleConfig.liveContents)
                ? ruleConfig.liveContents.find((c: any) => c.id === updatedMeta.liveContentId)
                : null;

            // Helper untuk membangun pesan tahap akhir (Ask for Contact atau Pesan Utama)
            const buildFinalOrContactStep = () => {
              if (ruleConfig.featureAskForContact && ruleConfig.askContactMessage && !updatedMeta.contact) {
                updatedMeta.awaitingContact = true;
                updatedMeta.askContactType = ruleConfig.askContactType || "Email Saja";
                return { text: resolveVariables(ruleConfig.askContactMessage, senderUsername) };
              }
              updatedMeta.awaitingContact = false;
              updatedMeta.mainSentAt = new Date().toISOString();

              return buildMainDmPayload({
                rule: targetRule,
                ruleConfig,
                liveContentItem: matchedLiveContentItem,
                username: senderUsername,
                origin,
                logId: userLog?.id,
                senderId,
              });
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
        const storyId = msgEvent.message?.reply_to?.story?.id || (msgEvent.message as any)?.story_id;
        const messageId = msgEvent.message?.mid || msgEvent.message?.id || (msgEvent as any)?.mid;

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

          // Filter aturan Story yang sesuai dengan tipe pemicunya (dengan Rule Isolation)
          let candidateRules: any[] = [];

          if (isStoryReply) {
            const specificStoryRules = storyId
              ? activeRules.filter(
                  (r: any) =>
                    r.triggerType === "SPECIFIC_STORY" &&
                    String(r.specificPostId) === String(storyId)
                )
              : [];

            // Rule Isolation: Jika story ini punya aturan SPECIFIC_STORY aktif,
            // hanya evaluasi aturan SPECIFIC_STORY tersebut (jangan bocor ke ALL_STORIES).
            if (specificStoryRules.length > 0) {
              candidateRules = specificStoryRules;
            } else {
              candidateRules = activeRules.filter(
                (r: any) => r.triggerType === "ALL_STORIES"
              );
            }
          } else if (isStoryMention) {
            candidateRules = activeRules.filter(
              (r: any) => r.triggerType === "STORY_MENTION"
            );
          }

          let matchedRule: any = null;
          let ruleConfig: any = {};

          for (const rule of candidateRules) {
            let cfg: any = {};
            try {
              if (
                rule.dmMessage &&
                (rule.dmMessage.startsWith("{") ||
                  rule.dmMessage.includes('"mainMessage"'))
              ) {
                cfg = JSON.parse(rule.dmMessage);
              }
            } catch (e) {}

            // Story Mention tidak menggunakan filter keyword (selalu cocok)
            if (isStoryMention) {
              matchedRule = rule;
              ruleConfig = cfg;
              break;
            }

            // Untuk Story Reply: Cek kecocokan kata kunci jika triggerCommentType === "KEYWORDS"
            const triggerTypeSetting =
              cfg.triggerCommentType || (rule as any).triggerCommentType;
            if (triggerTypeSetting === "KEYWORDS") {
              const rawKeywords = rule.keywords;
              const ruleStyle = cfg.keywordRule || "Contains";
              if (
                msgText &&
                msgText.trim().length > 0 &&
                checkKeywordMatch(msgText, rawKeywords, ruleStyle)
              ) {
                matchedRule = rule;
                ruleConfig = cfg;
                break;
              }
            } else {
              matchedRule = rule;
              ruleConfig = cfg;
              break;
            }
          }

          if (matchedRule) {
            // Cek Cooldown Frekuensi khusus untuk Story Mention
            let isCooldownPassed = true;
            if (isStoryMention && senderId) {
              const freqLabel: string =
                ruleConfig.storyMentionFrequency || "24 jam sekali";
              const freqHoursMap: Record<string, number> = {
                "24 jam sekali": 24,
                "48 jam sekali": 48,
                Mingguan: 24 * 7,
                Bulanan: 24 * 30,
                "3 bulan sekali": 24 * 90,
                "6 bulan sekali": 24 * 180,
                "Hanya sekali": Number.POSITIVE_INFINITY,
              };
              const cooldownHours = freqHoursMap[freqLabel] ?? 24;

              try {
                const lastSentLog = await (
                  prisma as any
                ).instagramAutomationLog.findFirst({
                  where: {
                    ruleId: matchedRule.id,
                    dmStatus: "SENT",
                    errorMessage: {
                      contains: `"senderId":"${senderId}"`,
                    },
                  },
                  orderBy: { createdAt: "desc" },
                });

                if (lastSentLog) {
                  if (!Number.isFinite(cooldownHours)) {
                    isCooldownPassed = false;
                    console.log(
                      `⏳ [Meta Webhook] Story Mention skipped for sender ${senderId}: frequency is "Hanya sekali" and already sent at ${lastSentLog.createdAt}`
                    );
                  } else {
                    const elapsedMs =
                      Date.now() - new Date(lastSentLog.createdAt).getTime();
                    const requiredMs = cooldownHours * 60 * 60 * 1000;
                    if (elapsedMs < requiredMs) {
                      isCooldownPassed = false;
                      const remainingHours = (
                        (requiredMs - elapsedMs) /
                        (1000 * 60 * 60)
                      ).toFixed(1);
                      console.log(
                        `⏳ [Meta Webhook] Story Mention skipped for sender ${senderId}: cooldown "${freqLabel}" active (${remainingHours}h remaining)`
                      );
                    }
                  }
                }
              } catch (cooldownErr) {
                console.warn(
                  "⚠️ [Meta Webhook] Failed checking Story Mention frequency cooldown:",
                  cooldownErr
                );
              }
            }

            if (isCooldownPassed) {
              console.log(`🎯 [Meta Webhook] Story Rule "${matchedRule.name}" matched for sender ${senderId}!`);

              // A. Balas Reaksi Love (❤️) jika diaktifkan di konfigurasi aturan
              const shouldReplyHeart = Boolean(ruleConfig.replyHeartReaction);
              if (shouldReplyHeart && messageId) {
                console.log(`❤️ [Meta Webhook] Sending heart reaction to story message ${messageId} for sender ${senderId}`);
                try {
                  const reactionRes = await postToMetaGraph(
                    `/me/messages`,
                    {
                      recipient: { id: senderId },
                      sender_action: "react",
                      payload: {
                        message_id: messageId,
                        reaction: "❤️",
                      },
                    },
                    account.accessToken
                  );

                  if (!reactionRes.ok) {
                    const reactionErr = await reactionRes.json().catch(() => ({}));
                    console.warn(`⚠️ [Meta Webhook] Reaction failed (${reactionRes.status}):`, reactionErr);
                  } else {
                    console.log(`✅ [Meta Webhook] Heart reaction ❤️ successfully sent to message ${messageId}`);
                  }
                } catch (err: any) {
                  console.warn("⚠️ [Meta Webhook] Exception while sending reaction:", err?.message || err);
                }
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
                    // Pesan Utama Langsung (Mendukung BUTTON_TEMPLATE, PLAIN_TEXT, dan CAROUSEL)
                    initialMeta.mainSentAt = new Date().toISOString();
                    firstDmPayload = buildMainDmPayload({
                      rule: matchedRule,
                      ruleConfig,
                      username: senderUsername,
                      origin,
                      senderId,
                    });
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
              const updatedMeta: Record<string, any> = {
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

              const matchedLiveContentForContact =
                updatedMeta.liveContentId && Array.isArray(ruleConfig.liveContents)
                  ? ruleConfig.liveContents.find((c: any) => c.id === updatedMeta.liveContentId)
                  : null;

              const finalPayload = buildMainDmPayload({
                rule: targetRule,
                ruleConfig,
                liveContentItem: matchedLiveContentForContact,
                username: senderUsername,
                origin,
                logId: awaitingLog.id,
                senderId,
              });

              await postToMetaGraph(
                `/me/messages`,
                {
                  recipient: { id: senderId },
                  message: finalPayload,
                },
                account.accessToken
              ).catch(() => {});
            }
          } else {
            // 4. Cek Aturan Otomasi Pesan Instagram (triggerType === "DM")
            let dmRuleHandled = false;

            // Deduplikasi Idempotency berdasarkan messageId
            const alreadyProcessedDm =
              messageId &&
              recentAccountLogs.some((l: any) => l.commentId === messageId);

            if (!alreadyProcessedDm) {
              const activeDmRules = await (prisma as any).instagramAutomationRule.findMany({
                where: {
                  accountId: account.id,
                  isActive: true,
                  triggerType: "DM",
                },
                orderBy: { createdAt: "desc" },
              });

              let matchedDmRule: any = null;
              let dmRuleConfig: any = {};

              for (const rule of activeDmRules) {
                let cfg: any = {};
                try {
                  if (
                    rule.dmMessage &&
                    (rule.dmMessage.startsWith("{") ||
                      rule.dmMessage.includes('"mainMessage"'))
                  ) {
                    cfg = JSON.parse(rule.dmMessage);
                  }
                } catch {}

                const triggerTypeSetting =
                  cfg.triggerCommentType || (rule as any).triggerCommentType || "KEYWORDS";
                const ruleStyle = cfg.keywordRule || "Contains";

                if (triggerTypeSetting === "ALL") {
                  matchedDmRule = rule;
                  dmRuleConfig = cfg;
                  break;
                } else if (
                  msgText.trim().length > 0 &&
                  checkKeywordMatch(msgText, rule.keywords, ruleStyle)
                ) {
                  matchedDmRule = rule;
                  dmRuleConfig = cfg;
                  break;
                }
              }

              if (matchedDmRule) {
                dmRuleHandled = true;
                console.log(
                  `💬 [Meta Webhook] DM Automation Rule "${matchedDmRule.name}" matched for sender ${senderId} (msg: "${msgText}")`
                );

                const initialMeta: Record<string, any> = {
                  senderId,
                  read: false,
                  sentAt: new Date().toISOString(),
                  isDmTrigger: true,
                };

                let dmStatus = "SENT";
                let failureReason = "";

                try {
                  let firstDmPayload: any = null;

                  if (dmRuleConfig.featureWelcomeMessage && dmRuleConfig.welcomeMessage) {
                    // 1. Pesan Pembuka
                    initialMeta.awaitingWelcome = true;
                    const welcomeText = resolveVariables(dmRuleConfig.welcomeMessage, senderUsername);
                    const welcomeBtnLabel = dmRuleConfig.welcomeButtonLabel || "Ya, Saya Mau!";
                    firstDmPayload =
                      dmRuleConfig.welcomeMessageType === "Template Tombol"
                        ? buildButtonTemplateMessage(welcomeText, [
                            {
                              type: "postback",
                              title: welcomeBtnLabel.slice(0, 20),
                              payload: `WELCOME_AGREE_${matchedDmRule.id}`,
                            },
                          ])
                        : { text: welcomeText };
                  } else if (dmRuleConfig.featureAskForFollow && dmRuleConfig.askForFollowMessage) {
                    // 2. Ask For Follow
                    if (userProfile.isFollowing === true) {
                      initialMeta.awaitingWelcome = false;
                    } else {
                      initialMeta.wasUnfollowed = true;
                      const followText = resolveVariables(dmRuleConfig.askForFollowMessage, senderUsername);
                      const followBtnLabel = dmRuleConfig.askForFollowButtonLabel || "Sudah mengikuti 🙌";
                      firstDmPayload = buildButtonTemplateMessage(followText, [
                        {
                          type: "postback",
                          title: followBtnLabel.slice(0, 20),
                          payload: `CHECK_FOLLOW_${matchedDmRule.id}`,
                        },
                      ]);
                    }
                  }

                  // 3. Jika belum diisi oleh Welcome / Ask Follow -> Cek Ask For Contact atau Pesan Utama
                  if (!firstDmPayload) {
                    if (dmRuleConfig.featureAskForContact && dmRuleConfig.askContactMessage) {
                      initialMeta.awaitingContact = true;
                      initialMeta.askContactType = dmRuleConfig.askContactType || "Email Saja";
                      firstDmPayload = {
                        text: resolveVariables(dmRuleConfig.askContactMessage, senderUsername),
                      };
                    } else {
                      initialMeta.mainSentAt = new Date().toISOString();
                      firstDmPayload = buildMainDmPayload({
                        rule: matchedDmRule,
                        ruleConfig: dmRuleConfig,
                        username: senderUsername,
                        origin,
                        senderId,
                      });
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
                    failureReason = errDm?.error?.message || "Gagal mengirim balasan DM Otomasi";
                    console.error(`❌ [Meta Webhook] Failed to send DM automation reply:`, errDm);
                  } else {
                    console.log(`✅ [Meta Webhook] DM automation reply sent successfully to ${senderId}`);
                  }
                } catch (err: any) {
                  dmStatus = "FAILED";
                  failureReason = err.message || "Exception sending DM automation reply";
                }

                await (prisma as any).instagramAutomationLog.create({
                  data: {
                    accountId: account.id,
                    ruleId: matchedDmRule.id,
                    fromUsername: senderUsername || "pengguna",
                    commentText: `[DM] ${msgText}`,
                    commentId: messageId || `dm_${Date.now()}`,
                    replyCommentStatus: "SKIPPED",
                    dmStatus: dmStatus,
                    errorMessage: failureReason ? failureReason : stringifyLogMeta(initialMeta),
                  },
                });
              }
            }

            if (!dmRuleHandled && (emailMatch || phoneMatch)) {
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
