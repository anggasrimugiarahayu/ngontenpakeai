import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

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

function isSafeRedirectUrl(urlStr: string, allowedUrls: string[] = []): boolean {
  try {
    const parsed = new URL(urlStr);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return false;
    }

    const hostname = parsed.hostname.toLowerCase();
    if (
      hostname === "ruangcreativemuslim.com" ||
      hostname.endsWith(".ruangcreativemuslim.com") ||
      hostname === "localhost"
    ) {
      return true;
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL;
    if (appUrl) {
      try {
        const appHost = new URL(appUrl).hostname.toLowerCase();
        if (hostname === appHost || hostname.endsWith(`.${appHost}`)) {
          return true;
        }
      } catch {}
    }

    for (const allowed of allowedUrls) {
      if (!allowed) continue;
      try {
        const allowedClean = allowed.trim();
        const p = new URL(allowedClean.startsWith("http") ? allowedClean : `https://${allowedClean}`);
        if (p.origin.toLowerCase() === parsed.origin.toLowerCase()) {
          return true;
        }
      } catch {}
    }

    return false;
  } catch {
    return false;
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const rawTargetUrl = searchParams.get("url") || "https://ruangcreativemuslim.com";
  const ruleId = searchParams.get("ruleId");
  const logId = searchParams.get("logId");
  const senderId = searchParams.get("senderId");
  const btnLabel = searchParams.get("btnLabel") || "Buka Website";
  const btnAction = searchParams.get("btnAction") || "Buka Website";

  const targetUrl = /^https?:\/\//i.test(rawTargetUrl) ? rawTargetUrl : `https://${rawTargetUrl}`;
  const allowedUrls: string[] = [];

  try {
    let targetLog: any = null;

    if (ruleId) {
      const rule = await (prisma as any).instagramAutomationRule.findUnique({
        where: { id: ruleId },
        select: { buttonUrl: true, dmMessage: true },
      });
      if (rule?.buttonUrl) allowedUrls.push(rule.buttonUrl);
      if (rule?.dmMessage) {
        try {
          const cfg = JSON.parse(rule.dmMessage);
          if (cfg.buttonUrl) allowedUrls.push(cfg.buttonUrl);
          if (cfg.buttonUrl2) allowedUrls.push(cfg.buttonUrl2);
          if (cfg.buttonUrl3) allowedUrls.push(cfg.buttonUrl3);
        } catch {}
      }
    }

    if (logId) {
      targetLog = await (prisma as any).instagramAutomationLog.findUnique({
        where: { id: logId },
      });
    }

    if (!targetLog && ruleId) {
      const recentLogs = await (prisma as any).instagramAutomationLog.findMany({
        where: { ruleId },
        orderBy: { createdAt: "desc" },
        take: 25,
      });

      if (senderId) {
        targetLog = recentLogs.find((l: any) => {
          const meta = parseLogMeta(l.errorMessage);
          return meta.senderId === senderId;
        });
      }

      if (!targetLog && recentLogs.length > 0) {
        targetLog = recentLogs[0];
      }
    }

    if (targetLog) {
      const currentMeta = parseLogMeta(targetLog.errorMessage);
      const buttonClicks = Array.isArray(currentMeta.buttonClicks) ? [...currentMeta.buttonClicks] : [];
      buttonClicks.push({
        label: btnLabel,
        type: "web_url",
        action: btnAction,
        url: targetUrl,
        clickedAt: new Date().toISOString(),
      });

      const updatedMeta = {
        ...currentMeta,
        read: true,
        clicked: true,
        clickCount: (Number(currentMeta.clickCount) || 0) + 1,
        clickedAt: new Date().toISOString(),
        buttonClicks,
        ...(senderId ? { senderId } : {}),
      };

      await (prisma as any).instagramAutomationLog.update({
        where: { id: targetLog.id },
        data: {
          errorMessage: stringifyLogMeta(updatedMeta),
        },
      });
    }
  } catch (err) {
    console.warn("Link tracking log update warning:", err);
  }

  const safeDestination = isSafeRedirectUrl(targetUrl, allowedUrls)
    ? targetUrl
    : "https://ruangcreativemuslim.com";

  return NextResponse.redirect(safeDestination, { status: 302 });
}
