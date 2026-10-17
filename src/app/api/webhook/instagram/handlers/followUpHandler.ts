import prisma from "@/lib/prisma";
import {
  buildButtonTemplateMessage,
  buildTrackedUrl,
  parseDelayToMs,
  parseLogMeta,
  postToMetaGraph,
  resolveVariables,
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
