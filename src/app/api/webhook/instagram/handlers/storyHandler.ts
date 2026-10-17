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

/**
 * Handler: Interaksi Story (Story Reply / Reaksi Story / Story Mention)
 * Mengembalikan true jika event merupakan interaksi Story yang telah ditangani/di-skip sehingga tidak lanjut ke handler DM biasa.
 */
export async function handleStoryEvent(
  msgEvent: any,
  account: any,
  origin: string,
  senderId: string,
  msgText: string
): Promise<boolean> {
  const isStoryReply = Boolean(msgEvent.message?.reply_to?.story);
  const isStoryMention = Boolean(
    msgEvent.message?.attachments?.some((a: any) => a.type === "story_mention") ||
      (msgEvent.message as any)?.story_mention ||
      (msgEvent as any).story_mention
  );
  const storyId = msgEvent.message?.reply_to?.story?.id || (msgEvent.message as any)?.story_id;
  const messageId = msgEvent.message?.mid || msgEvent.message?.id || (msgEvent as any)?.mid;

  if (!(isStoryReply || isStoryMention) || msgEvent.message?.is_echo) {
    return false;
  }

  console.log(
    `📸 [Meta Webhook] Story interaction detected from ${senderId}. StoryId: ${storyId}, text: "${msgText}"`
  );

  // Deduplikasi Idempotency
  if (messageId) {
    const existingLog = await (prisma as any).instagramAutomationLog.findFirst({
      where: { commentId: messageId },
    });
    if (existingLog) {
      console.log(`⏩ [Meta Webhook] Story message ${messageId} already processed, skipping.`);
      return true;
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
      candidateRules = activeRules.filter((r: any) => r.triggerType === "ALL_STORIES");
    }
  } else if (isStoryMention) {
    candidateRules = activeRules.filter((r: any) => r.triggerType === "STORY_MENTION");
  }

  let matchedRule: any = null;
  let ruleConfig: any = {};

  for (const rule of candidateRules) {
    let cfg: any = {};
    try {
      if (
        rule.dmMessage &&
        (rule.dmMessage.startsWith("{") || rule.dmMessage.includes('"mainMessage"'))
      ) {
        cfg = JSON.parse(rule.dmMessage);
      }
    } catch {}

    // Story Mention tidak menggunakan filter keyword (selalu cocok)
    if (isStoryMention) {
      matchedRule = rule;
      ruleConfig = cfg;
      break;
    }

    // Untuk Story Reply: Cek kecocokan kata kunci jika triggerCommentType === "KEYWORDS"
    const triggerTypeSetting = cfg.triggerCommentType || (rule as any).triggerCommentType;
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

  if (!matchedRule) {
    return false;
  }

  // Cek Cooldown Frekuensi khusus untuk Story Mention
  let isCooldownPassed = true;
  if (isStoryMention && senderId) {
    const freqLabel: string = ruleConfig.storyMentionFrequency || "24 jam sekali";
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
      const lastSentLog = await (prisma as any).instagramAutomationLog.findFirst({
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
          const elapsedMs = Date.now() - new Date(lastSentLog.createdAt).getTime();
          const requiredMs = cooldownHours * 60 * 60 * 1000;
          if (elapsedMs < requiredMs) {
            isCooldownPassed = false;
            const remainingHours = ((requiredMs - elapsedMs) / (1000 * 60 * 60)).toFixed(1);
            console.log(
              `⏳ [Meta Webhook] Story Mention skipped for sender ${senderId}: cooldown "${freqLabel}" active (${remainingHours}h remaining)`
            );
          }
        }
      }
    } catch (cooldownErr) {
      console.warn("⚠️ [Meta Webhook] Failed checking Story Mention frequency cooldown:", cooldownErr);
    }
  }

  if (!isCooldownPassed) {
    return false;
  }

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

  return true;
}
