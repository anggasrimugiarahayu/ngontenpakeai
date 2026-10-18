import prisma from "@/lib/prisma";
import {
  buildButtonTemplateMessage,
  buildMainDmPayload,
  getIgUserProfile,
  parseLogMeta,
  postToMetaGraph,
  resolveVariables,
  stringifyLogMeta,
} from "./webhookHelpers";

// In-Memory Debounce Cache (Mencegah event duplikat dari retry Meta atau klik ganda tak sengaja dalam 8 detik)
const recentPostbackEvents = new Map<string, number>();

function isPostbackDebounced(senderId: string, payload: string, windowMs = 8000): boolean {
  const now = Date.now();
  const dedupKey = `${senderId}:${payload}`;
  const lastTime = recentPostbackEvents.get(dedupKey);

  if (lastTime && now - lastTime < windowMs) {
    return true; // Sedang dalam masa cooldown debounce
  }

  recentPostbackEvents.set(dedupKey, now);

  // Bersihkan cache yang sudah lebih dari 30 detik agar hemat memori
  if (recentPostbackEvents.size > 500) {
    for (const [key, timestamp] of recentPostbackEvents.entries()) {
      if (now - timestamp > 30000) {
        recentPostbackEvents.delete(key);
      }
    }
  }

  return false;
}

/**
 * Handler: Postback & Quick Reply (LIVE_QR::, BTN_TEXT::, WELCOME_AGREE_, CHECK_FOLLOW_)
 */
export async function handlePostbackEvent(
  account: any,
  origin: string,
  senderId: string,
  msgText: string,
  postbackPayload: string
) {
  // 1. In-Memory Debounce Guard (Jeda 8 detik)
  // Menahan retry otomatis dari Meta / double-tap dalam rentang 8 detik
  // Jika lewat dari 8 detik (misal user klik lagi di lain waktu), pesan akan tetap dikirim normal 1x
  if (isPostbackDebounced(senderId, postbackPayload, 8000)) {
    console.log(
      `⏩ [Meta Webhook] Suppressed duplicate postback event for sender ${senderId} (payload: ${postbackPayload}) within debounce window.`
    );
    return;
  }

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
    return;
  }

  const ruleId = postbackPayload.split("_").pop();
  const targetRule = await (prisma as any).instagramAutomationRule.findFirst({
    where: { id: ruleId },
  });

  if (!targetRule) return;

  let ruleConfig: any = {};
  try {
    if (targetRule.dmMessage && (targetRule.dmMessage.startsWith("{") || targetRule.dmMessage.includes('"mainMessage"'))) {
      ruleConfig = JSON.parse(targetRule.dmMessage);
    }
  } catch {}

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

  // 2. Database Cooldown Guard (Perlindungan lintas container serverless dalam 8 detik)
  const now = Date.now();
  const lastPostbackTime = currentMeta.lastPostbackAt ? new Date(currentMeta.lastPostbackAt).getTime() : 0;
  const mainSentTime = currentMeta.mainSentAt ? new Date(currentMeta.mainSentAt).getTime() : 0;

  if (
    (currentMeta.lastPostbackPayload === postbackPayload && now - lastPostbackTime < 8000) ||
    (postbackPayload.startsWith("WELCOME_AGREE") && currentMeta.mainSentAt && now - mainSentTime < 8000)
  ) {
    console.log(
      `⏩ [Meta Webhook] Suppressed duplicate postback via DB cooldown for sender ${senderId} (last action was < 8s ago).`
    );
    return;
  }

  const updatedMeta: Record<string, any> = {
    ...currentMeta,
    read: true,
    senderId,
    lastPostbackAt: new Date().toISOString(),
    lastPostbackPayload: postbackPayload,
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
        ruleConfig.askForFollowHasRetry !== false && ruleConfig.askForFollowRetryMessage
          ? ruleConfig.askForFollowRetryMessage
          : ruleConfig.askForFollowMessage ||
            "Oiya kak, sepertinya akun ini belum di-follow 😊\n\nFollow dulu ya kak, setelah itu klik tombol di bawah 🙌";
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
    await (prisma as any).instagramAutomationLog
      .update({
        where: { id: userLog.id },
        data: { errorMessage: stringifyLogMeta(updatedMeta) },
      })
      .catch(() => {});
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
