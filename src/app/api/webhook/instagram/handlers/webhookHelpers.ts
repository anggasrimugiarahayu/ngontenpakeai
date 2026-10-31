import prisma from "@/lib/prisma";
import { isAdminUser } from "@/lib/admin";

// Helper Spintax Randomizer
export function parseSpintax(text: string): string {
  if (!text) return "";
  return text.replace(/\{([^{}]+)\}/g, (match, choices) => {
    const parts = choices.split("|");
    return parts[Math.floor(Math.random() * parts.length)];
  });
}

// Helper Variable Resolver
export function resolveVariables(text: string, username: string): string {
  if (!text) return "";
  const cleanUsername = username ? `@${username.replace(/^@/, "")}` : "@pengguna";
  const firstName = username || "Kak";

  const resolved = text
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
 * Digunakan secara konsisten baik pada komentar Post/Reels, Live, Story, maupun DM
 */
export function checkKeywordMatch(
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
export async function postToMetaGraph(endpoint: string, payload: any, token: string) {
  const isIgToken = token && token.startsWith("IG");
  const primaryDomain = isIgToken ? "https://graph.instagram.com/v22.0" : "https://graph.facebook.com/v22.0";
  const fallbackDomain = isIgToken ? "https://graph.facebook.com/v22.0" : "https://graph.instagram.com/v22.0";

  const url = `${primaryDomain}${endpoint}`;
  const res = await fetch(url, {
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
export function buildButtonTemplateMessage(text: string, buttons: any[]) {
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
export async function getIgUserProfile(
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

export function parseLogMeta(errorMessage?: string | null): Record<string, any> {
  if (!errorMessage || !errorMessage.startsWith("__META__:")) return {};
  try {
    return JSON.parse(errorMessage.slice(9));
  } catch {
    return {};
  }
}

export function stringifyLogMeta(meta: Record<string, any>): string {
  return `__META__:${JSON.stringify(meta)}`;
}

export function buildTrackedUrl(
  origin: string,
  rawUrl: string,
  ruleId: string,
  enableTracking: boolean = true,
  logId?: string,
  senderId?: string,
  btnLabel?: string,
  btnAction?: string
): string {
  const cleanUrl = (rawUrl || "https://ruangcreativemuslim.com").trim();
  if (!enableTracking) return cleanUrl;
  const params = new URLSearchParams({
    url: cleanUrl,
    ruleId,
    ...(logId ? { logId } : {}),
    ...(senderId ? { senderId } : {}),
    ...(btnLabel ? { btnLabel } : {}),
    ...(btnAction ? { btnAction } : {}),
  });
  return `${origin}/api/track/instagram?${params.toString()}`;
}

/**
 * Helper: Membangun payload Pesan Utama DM (mendukung 3 Jenis Pesan: BUTTON_TEMPLATE, PLAIN_TEXT, dan CAROUSEL)
 * Berlaku untuk semua tipe aturan termasuk multi-item Konten pada Live Instagram
 */
export function buildMainDmPayload(params: {
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
              .map((b: any) => {
                const bTitle = b.label.trim();
                return {
                  type: "web_url",
                  url: buildTrackedUrl(
                    origin,
                    b.url,
                    rule.id,
                    enableTracking,
                    logId,
                    senderId,
                    bTitle,
                    `Carousel (Slide ${idx + 1})`
                  ),
                  title: bTitle.slice(0, 20),
                };
              })
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
          url: buildTrackedUrl(
            origin,
            b.url,
            rule.id,
            enableTracking,
            logId,
            senderId,
            title,
            "Pesan Utama"
          ),
          title,
        };
      });

    if (validButtons.length > 0) {
      return buildButtonTemplateMessage(deliveredText, validButtons);
    }

    if (rule?.buttonText && rule?.buttonUrl) {
      const trackedUrl = buildTrackedUrl(
        origin,
        rule.buttonUrl,
        rule.id,
        enableTracking,
        logId,
        senderId,
        rule.buttonText,
        "Pesan Utama"
      );
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

export function parseDelayToMs(delayStr?: string): number {
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

/**
 * Helper: Mencari akun Instagram terdaftar di database berdasarkan igAccountId (entry.id)
 * Dilengkapi fallback verifikasi dinamis ke Meta Graph API (/me?fields=id,user_id,username)
 */
export async function resolveAccountForEntry(igAccountId: string) {
  let account = await (prisma as any).instagramAccount.findFirst({
    where: {
      OR: [
        { instagramId: igAccountId },
        { pageId: igAccountId },
        { id: igAccountId },
      ],
      isActive: true,
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          role: true,
          proAutomationExpiredAt: true,
        },
      },
    },
  });

  if (!account) {
    const activeAccounts = await (prisma as any).instagramAccount.findMany({
      where: {
        isActive: true,
        accessToken: { not: "" },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            proAutomationExpiredAt: true,
          },
        },
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

        if (trueBusinessId && (candidate.instagramId !== trueBusinessId || candidate.pageId !== trueScopedId)) {
          await (prisma as any).instagramAccount
            .update({
              where: { id: candidate.id },
              data: {
                instagramId: trueBusinessId,
                pageId: trueScopedId,
                ...(meData.username ? { username: meData.username } : {}),
              },
            })
            .catch(() => null);
          candidate.instagramId = trueBusinessId;
          candidate.pageId = trueScopedId;
        }

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

  if (!account) return null;

  // Verifikasi Hak Akses & Masa Aktif PRO Automation Pemilik Akun
  const user = account.user;
  const isAdmin = isAdminUser(user);
  const isProAutomation = isAdmin || !!(
    user?.proAutomationExpiredAt && new Date(user.proAutomationExpiredAt) > new Date()
  );

  if (!isProAutomation) {
    console.warn(
      `⛔ [Meta Webhook] Automation blocked for @${account.username || account.id}: User Pro Automation has expired or inactive (expiredAt: ${user?.proAutomationExpiredAt || "Never"}).`
    );
    return null;
  }

  return account;
}
