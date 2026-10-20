import prisma from "@/lib/prisma";
import {
  buildButtonTemplateMessage,
  buildMainDmPayload,
  checkKeywordMatch,
  getIgUserProfile,
  postToMetaGraph,
  resolveVariables,
  stringifyLogMeta,
} from "./webhookHelpers";

const processedComments = new Map<string, number>();

function isCommentDebounced(commentId: string, windowMs = 15000): boolean {
  if (!commentId) return false;
  const now = Date.now();
  const lastTime = processedComments.get(commentId);
  if (lastTime && now - lastTime < windowMs) return true;
  processedComments.set(commentId, now);
  if (processedComments.size > 500) {
    for (const [k, time] of processedComments.entries()) {
      if (now - time > 60000) processedComments.delete(k);
    }
  }
  return false;
}

/**
 * Handler: Komentar masuk pada Post/Reels (field === "comments") maupun Live Instagram (field === "live_comments")
 */
export async function handleCommentEvent(change: any, account: any, origin: string) {
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

  if (!commentId || !commentText) return;

  if (isCommentDebounced(commentId, 15000)) {
    console.log(`⏩ [Meta Webhook] Comment ID ${commentId} already processed (in-memory debounce). Skipping duplicate.`);
    return;
  }

  console.log(
    `💬 [Meta Webhook] New ${isLiveCommentEvent ? "LIVE comment" : "comment"} on media ${mediaId} from @${fromUsername} (${fromId}): "${commentText}"`
  );

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
          await (prisma as any).instagramAccount
            .update({
              where: { id: account.id },
              data: { instagramId: realBusinessId, pageId: realScopedId },
            })
            .catch(() => null);
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
    return;
  }

  // Guardrail 2: Deduplikasi Idempotency (Jangan proses komentar yang sama 2x)
  const existingLog = await (prisma as any).instagramAutomationLog.findFirst({
    where: { commentId },
  });
  if (existingLog) {
    return;
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
    } catch {}

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
    return;
  }

  // Unpack konfigurasi aturan lanjutan (extendedConfig JSON)
  let ruleConfig: any = {};
  try {
    if (matchedRule.dmMessage && (matchedRule.dmMessage.startsWith("{") || matchedRule.dmMessage.includes('"mainMessage"'))) {
      ruleConfig = JSON.parse(matchedRule.dmMessage);
    }
  } catch {}

  let replyCommentStatus = "SKIPPED";
  let dmStatus = "SKIPPED";
  let failureReason: string | null = null;

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
      let alreadyFollows = false;
      if (fromId) {
        try {
          const userProfile = await getIgUserProfile(fromId, account.accessToken);
          if (userProfile?.isFollowing === true) {
            alreadyFollows = true;
            console.log(`✅ [Meta Webhook] @${fromUsername} already follows @${account.username}, skipping Ask For Follow gate.`);
          }
        } catch {}
      }

      if (alreadyFollows) {
        if (ruleConfig.featureAskForContact && ruleConfig.askContactMessage) {
          const contactText = resolveVariables(ruleConfig.askContactMessage, fromUsername);
          dmPayloadMessage = { text: contactText };
          initialMeta.awaitingContact = true;
          initialMeta.askContactType = ruleConfig.askContactType || "Email Saja";
        } else {
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
      } else {
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
      }
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
