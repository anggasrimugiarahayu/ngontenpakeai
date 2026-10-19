import prisma from "@/lib/prisma";
import {
  buildButtonTemplateMessage,
  buildMainDmPayload,
  buildTrackedUrl,
  checkKeywordMatch,
  getIgUserProfile,
  parseLogMeta,
  postToMetaGraph,
  resolveVariables,
  stringifyLogMeta,
} from "./webhookHelpers";

// In-Memory Debounce Cache untuk Pesan DM Masuk
const processedDms = new Map<string, number>();

function isDmDebounced(messageId: string, windowMs = 15000): boolean {
  if (!messageId) return false;
  const now = Date.now();
  const lastTime = processedDms.get(messageId);
  if (lastTime && now - lastTime < windowMs) return true;
  processedDms.set(messageId, now);
  if (processedDms.size > 500) {
    for (const [k, time] of processedDms.entries()) {
      if (now - time > 60000) processedDms.delete(k);
    }
  }
  return false;
}

/**
 * Handler: Pesan DM Teks Masuk
 * Menangani:
 * 1. Validasi balasan Ask for Contact (awaitingContact === true)
 * 2. Otomasi Pesan Instagram (triggerType === "DM")
 * 3. Fallback pengiriman link apabila pengguna mengirim kontak (Email/WA)
 */
export async function handleIncomingDmEvent(
  msgEvent: any,
  account: any,
  origin: string,
  senderId: string,
  msgText: string
) {
  if (!msgText || msgEvent.message?.is_echo) return;

  const messageId = msgEvent.message?.mid || msgEvent.message?.id || (msgEvent as any)?.mid;
  if (messageId && isDmDebounced(messageId, 15000)) {
    console.log(`⏩ [Meta Webhook] DM messageId ${messageId} already processed (in-memory debounce). Skipping duplicate.`);
    return;
  }
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
    const isValidContact =
      contactType.includes("whatsapp") && !contactType.includes("email")
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

      await (prisma as any).instagramAutomationLog
        .update({
          where: { id: awaitingLog.id },
          data: { errorMessage: stringifyLogMeta(updatedMeta) },
        })
        .catch(() => {});

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
    return;
  }

  // 4. Cek Aturan Otomasi Pesan Instagram (triggerType === "DM")
  let dmRuleHandled = false;

  // Deduplikasi Idempotency berdasarkan messageId
  const alreadyProcessedDm =
    messageId && recentAccountLogs.some((l: any) => l.commentId === messageId);

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
          (rule.dmMessage.startsWith("{") || rule.dmMessage.includes('"mainMessage"'))
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
        ruleConfig.mainMessage ||
          latestRule.dmMessage ||
          "Sip, kontak kamu sudah tersimpan dengan aman! Ini link akses materinya ya:",
        senderUsername
      );
      const trackedUrl = buildTrackedUrl(
        origin,
        latestRule.buttonUrl || "https://ruangcreativemuslim.com",
        latestRule.id,
        ruleConfig.featureLinkTracking !== false,
        undefined,
        senderId,
        latestRule.buttonText || "Buka Website",
        "Pesan Utama"
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
