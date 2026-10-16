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

          // Filter aturan yang cocok
          const matchedRule = rules.find((rule: any) => {
            console.log(`🔍 [Meta Webhook] Checking rule "${rule.name}" (${rule.triggerType}) against media ID: ${mediaId}`);
            // Cek target postingan
            if (rule.triggerType === "SPECIFIC_POST" && rule.specificPostId) {
              if (rule.specificPostId !== mediaId) {
                console.log(`⏩ [Meta Webhook] Media ID mismatch for rule "${rule.name}": expects ${rule.specificPostId}, but comment is on ${mediaId}`);
                return false;
              }
            } else if (rule.triggerType === "NEXT_POST") {
              if (!rule.specificPostId) {
                // Postingan baru pertama kali terdeteksi! Kunci specificPostId ke postingan baru ini
                console.log(`🎯 [Meta Webhook] Next post detected! Binding rule "${rule.name}" to media ID: ${mediaId}`);
                (prisma as any).instagramAutomationRule.update({
                  where: { id: rule.id },
                  data: { specificPostId: mediaId },
                }).catch(() => null);
              } else if (rule.specificPostId !== mediaId) {
                console.log(`⏩ [Meta Webhook] Media ID mismatch for rule "${rule.name}" (NEXT_POST locked to ${rule.specificPostId}): comment is on ${mediaId}`);
                return false;
              }
            }

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
            } else {
              // Step 4d: Pesan Utama (Delivery Akses/Materi Langsung)
              const deliveredText = resolveVariables(mainDmText, fromUsername);

              if (matchedRule.buttonText && matchedRule.buttonUrl) {
                // Template Tombol tanpa header aturan dan tanpa pemotongan 80 karakter
                dmPayloadMessage = buildButtonTemplateMessage(deliveredText, [
                  {
                    type: "web_url",
                    url: matchedRule.buttonUrl,
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
              errorMessage: failureReason,
            },
          });
        }
      }

      // =========================================================================
      // B. EVENT: INTERAKSI DM BALASAN (User Mengirim Email/WA atau Klik Tombol)
      // =========================================================================
      const messagingList = entry.messaging || [];
      for (const msgEvent of messagingList) {
        const senderId = String(msgEvent.sender?.id || "");
        const msgText = msgEvent.message?.text || "";
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

            // Helper untuk membangun pesan tahap akhir (Ask for Contact atau Pesan Utama)
            const buildFinalOrContactStep = () => {
              if (ruleConfig.featureAskForContact && ruleConfig.askContactMessage) {
                return { text: resolveVariables(ruleConfig.askContactMessage, senderUsername) };
              }
              if (targetRule.buttonText && targetRule.buttonUrl) {
                return buildButtonTemplateMessage(mainText, [
                  {
                    type: "web_url",
                    url: targetRule.buttonUrl,
                    title: targetRule.buttonText.slice(0, 20),
                  },
                ]);
              }
              return { text: mainText };
            };

            let nextMsg: any = null;

            if (postbackPayload.startsWith("WELCOME_AGREE")) {
              // User baru saja klik tombol pada Pesan Pembuka
              // Cek apakah aturan mengaktifkan Ask For Follow
              if (ruleConfig.featureAskForFollow && ruleConfig.askForFollowMessage) {
                if (userProfile.isFollowing === true) {
                  // Jika ternyata user sudah follow, langsung kirim Ask For Contact / Pesan Utama
                  console.log(`✅ [Meta Webhook] @${senderUsername} already follows @${account.username}, skipping Ask For Follow gate.`);
                  nextMsg = buildFinalOrContactStep();
                } else {
                  // Jika belum follow, kirim pesan Ask For Follow
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
                // User sudah benar-benar follow! Kirim Ask For Contact atau Pesan Utama
                console.log(`✅ [Meta Webhook] Verified @${senderUsername} follows @${account.username}! Delivering content.`);
                nextMsg = buildFinalOrContactStep();
              }
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
        }

        // 2. Cek apakah user mengirim Email / No WhatsApp (Respon Ask for Contact)
        const emailMatch = msgText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
        const phoneMatch = msgText.match(/(?:\+62|62|08)[0-9]{8,13}/);

        if (emailMatch || phoneMatch) {
          // Cari aturan aktif terakhir pada akun ini yang menggunakan Ask for Contact
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
            const userProfile = await getIgUserProfile(senderId, account.accessToken);
            const deliveredMain = resolveVariables(
              ruleConfig.mainMessage || latestRule.dmMessage || "Sip, kontak kamu sudah tersimpan dengan aman! Ini link akses materinya ya:",
              userProfile.username
            );
            const finalPayload =
              latestRule.buttonText && latestRule.buttonUrl
                ? buildButtonTemplateMessage(deliveredMain, [
                    {
                      type: "web_url",
                      url: latestRule.buttonUrl,
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

    return new NextResponse("EVENT_RECEIVED", { status: 200 });
  } catch (error: any) {
    console.error("❌ [Meta Webhook Error]:", error);
    // Meta mewajibkan respon HTTP 200 agar webhook tidak di-retry berulang kali jika ada error internal
    return new NextResponse("EVENT_RECEIVED", { status: 200 });
  }
}
