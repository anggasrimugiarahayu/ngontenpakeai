import prisma from "@/lib/prisma";
import {
  buildMainDmPayload,
  parseDelayToMs,
  parseLogMeta,
  postToMetaGraph,
  stringifyLogMeta,
} from "./webhookHelpers";

export async function processPendingFollowUps(account: any, origin: string) {
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
        await (prisma as any).instagramAutomationLog
          .update({
            where: { id: log.id },
            data: { errorMessage: stringifyLogMeta({ ...meta, followUpSkipped: true }) },
          })
          .catch(() => {});
        continue;
      }

      // Bangun konfigurasi Follow Up untuk dikirim via buildMainDmPayload
      const followUpConfig = {
        messageType:
          ruleConfig.followUpMessageType === "Teks Biasa" || ruleConfig.followUpMessageType === "PLAIN_TEXT"
            ? "PLAIN_TEXT"
            : ruleConfig.followUpMessageType === "Carousel" || ruleConfig.followUpMessageType === "CAROUSEL"
            ? "CAROUSEL"
            : "BUTTON_TEMPLATE",
        mainMessage: ruleConfig.followUpMessage,
        buttons:
          Array.isArray(ruleConfig.followUpButtons) && ruleConfig.followUpButtons.length > 0
            ? ruleConfig.followUpButtons
            : [
                {
                  id: "followup_btn_1",
                  label: ruleConfig.followUpButtonLabel || log.rule.buttonText || "Buka Link Sekarang",
                  action: "Buka Website",
                  url: log.rule.buttonUrl || "https://ruangcreativemuslim.com",
                },
              ],
        carouselSlides: ruleConfig.followUpCarouselSlides,
        quickReplies: ruleConfig.followUpQuickReplies,
        featureLinkTracking: ruleConfig.featureLinkTracking,
        postCoverUrl: ruleConfig.postCoverUrl,
      };

      const followUpPayload = buildMainDmPayload({
        rule: log.rule,
        ruleConfig: followUpConfig,
        username: log.fromUsername || "kak",
        origin,
        logId: log.id,
        senderId: meta.senderId,
      });

      const res = await postToMetaGraph(
        `/me/messages`,
        {
          recipient: { id: meta.senderId },
          message: followUpPayload,
        },
        account.accessToken
      );

      if (res.ok) {
        await (prisma as any).instagramAutomationLog
          .update({
            where: { id: log.id },
            data: {
              errorMessage: stringifyLogMeta({
                ...meta,
                followUpSent: true,
                followUpSentAt: new Date().toISOString(),
              }),
            },
          })
          .catch(() => {});
      }
    }
  } catch (err) {
    console.warn("FollowUp processor warning:", err);
  }
}
