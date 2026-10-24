import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import {
  getResolvedRisetConfig,
  InstagramRisetConfig,
  RISET_CONFIG_KEY,
} from "@/lib/riset-config";

function maskSecret(val?: string | null): string {
  if (!val || val.trim().length === 0) return "";
  const clean = val.trim();
  if (clean.length <= 8) return "••••••••";
  return `${clean.slice(0, 6)}••••••${clean.slice(-4)}`;
}

async function isAdminSession() {
  const session = await auth();
  if (!session?.user?.id) return false;
  if (session.user.email?.toLowerCase() === "anggasrimugiarahayu@gmail.com") {
    return true;
  }
  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  return dbUser?.role === "ADMIN";
}

export async function GET() {
  try {
    const isAdmin = await isAdminSession();
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const cfg = await getResolvedRisetConfig();

    return NextResponse.json({
      hasSessionId: Boolean(cfg.instagramSessionId),
      maskedSessionId: maskSecret(cfg.instagramSessionId),
      hasRapidApiKey: Boolean(cfg.rapidApiKey),
      maskedRapidApiKey: maskSecret(cfg.rapidApiKey),
      rapidApiHost: cfg.rapidApiHost,
      hasMetaPageToken: Boolean(cfg.metaPageAccessToken),
      maskedMetaPageToken: maskSecret(cfg.metaPageAccessToken),
      instagramBusinessAccountId: cfg.instagramBusinessAccountId,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Gagal memuat konfigurasi riset" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const isAdmin = await isAdminSession();
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();

    let existing: InstagramRisetConfig = {};
    const row = await prisma.appSetting.findUnique({
      where: { key: RISET_CONFIG_KEY },
    });
    if (row?.value) {
      try {
        existing = JSON.parse(row.value);
      } catch {}
    }

    const updated: InstagramRisetConfig = {
      instagramSessionId:
        typeof body.instagramSessionId === "string"
          ? body.instagramSessionId.trim()
          : existing.instagramSessionId || "",
      rapidApiKey:
        typeof body.rapidApiKey === "string"
          ? body.rapidApiKey.trim()
          : existing.rapidApiKey || "",
      rapidApiHost:
        typeof body.rapidApiHost === "string" && body.rapidApiHost.trim()
          ? body.rapidApiHost.trim()
          : existing.rapidApiHost || "instagram-scraper-api2.p.rapidapi.com",
      metaPageAccessToken:
        typeof body.metaPageAccessToken === "string"
          ? body.metaPageAccessToken.trim()
          : existing.metaPageAccessToken || "",
      instagramBusinessAccountId:
        typeof body.instagramBusinessAccountId === "string" &&
        body.instagramBusinessAccountId.trim()
          ? body.instagramBusinessAccountId.trim()
          : existing.instagramBusinessAccountId || "17841445108128356",
    };

    await prisma.appSetting.upsert({
      where: { key: RISET_CONFIG_KEY },
      update: { value: JSON.stringify(updated) },
      create: { key: RISET_CONFIG_KEY, value: JSON.stringify(updated) },
    });

    const cfg = await getResolvedRisetConfig();

    return NextResponse.json({
      success: true,
      hasSessionId: Boolean(cfg.instagramSessionId),
      maskedSessionId: maskSecret(cfg.instagramSessionId),
      hasRapidApiKey: Boolean(cfg.rapidApiKey),
      maskedRapidApiKey: maskSecret(cfg.rapidApiKey),
      rapidApiHost: cfg.rapidApiHost,
      hasMetaPageToken: Boolean(cfg.metaPageAccessToken),
      maskedMetaPageToken: maskSecret(cfg.metaPageAccessToken),
      instagramBusinessAccountId: cfg.instagramBusinessAccountId,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Gagal menyimpan konfigurasi riset" },
      { status: 500 }
    );
  }
}
