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

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const targetUrl = searchParams.get("url") || "https://ruangcreativemuslim.com";
  const ruleId = searchParams.get("ruleId");
  const logId = searchParams.get("logId");
  const senderId = searchParams.get("senderId");
  const btnLabel = searchParams.get("btnLabel") || "Buka Website";
  const btnAction = searchParams.get("btnAction") || "Buka Website";

  try {
    let targetLog: any = null;

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

  // Pastikan URL tujuan memiliki protokol http/https
  const finalDestination = /^https?:\/\//i.test(targetUrl)
    ? targetUrl
    : `https://${targetUrl}`;

  return NextResponse.redirect(finalDestination, { status: 302 });
}
