import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { computeUserSubscriptionStatus } from "@/lib/subscription-utils";
import { YouTubeChannelProfile, YouTubeVideoItem } from "@/app/(app)/ruang-riset/youtube/types";

// In-memory cache (15 minutes TTL) for high performance & rate-limit protection
const YOUTUBE_CACHE_TTL_MS = 15 * 60 * 1000;
const youtubeMemoryCache = new Map<
  string,
  {
    expiresAt: number;
    profile: YouTubeChannelProfile;
    videos: YouTubeVideoItem[];
  }
>();

function cleanChannelHandle(input: string): string {
  if (!input) return "";
  let clean = input.trim();
  // If it's a URL like https://www.youtube.com/@kokbisa or https://youtube.com/@kokbisa/videos
  if (clean.includes("youtube.com/")) {
    try {
      const parsed = new URL(clean.startsWith("http") ? clean : `https://${clean}`);
      const pathname = parsed.pathname;
      const match = pathname.match(/@([a-zA-Z0-9_.-]+)/);
      if (match) return `@${match[1]}`;
      const channelMatch = pathname.match(/\/channel\/([a-zA-Z0-9_.-]+)/);
      if (channelMatch) return channelMatch[1];
    } catch {}
  }
  clean = clean.replace(/^(https?:\/\/)?(www\.)?youtube\.com\/?/i, "");
  if (!clean.startsWith("@") && !clean.startsWith("UC")) {
    clean = `@${clean}`;
  }
  return clean;
}

function parseViews(text?: string | null): number {
  if (!text) return 0;
  const clean = text.toLowerCase().replace(/x ditonton|views|ditonton|\+/g, "").trim();
  const jtMatch = clean.match(/([\d.,]+)\s*(jt|juta|m|million)/i);
  if (jtMatch) {
    const num = parseFloat(jtMatch[1].replace(/,/g, "."));
    return Math.round(num * 1_000_000);
  }
  const rbMatch = clean.match(/([\d.,]+)\s*(rb|ribu|k)/i);
  if (rbMatch) {
    const num = parseFloat(rbMatch[1].replace(/,/g, "."));
    return Math.round(num * 1_000);
  }
  const rawNum = clean.replace(/[^\d]/g, "");
  return parseInt(rawNum, 10) || 0;
}

function parseDurationSeconds(str?: string | null): number {
  if (!str) return 0;
  const parts = str.replace(/\./g, ":").split(":").map((p) => parseInt(p, 10) || 0);
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  } else if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }
  return parts[0] || 0;
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify PRO Riset or Admin access on server
    const isAdminEmail =
      session.user.email?.toLowerCase() === "anggasrimugiarahayu@gmail.com";
    let hasAccess = isAdminEmail;
    if (!hasAccess) {
      const [dbUser, userOrders] = await Promise.all([
        prisma.user.findUnique({
          where: { id: session.user.id },
          select: {
            email: true,
            role: true,
            hasProBook: true,
            proToolsExpiredAt: true,
            proAutomationExpiredAt: true,
            proRisetExpiredAt: true,
          },
        }),
        prisma.order.findMany({
          where: { userId: session.user.id, status: "SUCCESS" },
          select: { orderType: true, status: true, createdAt: true },
        }),
      ]);
      const subStatus = computeUserSubscriptionStatus(dbUser, userOrders);
      hasAccess = subStatus.hasRiset || subStatus.isAdmin;
    }

    if (!hasAccess) {
      return NextResponse.json(
        {
          error:
            "Fitur Ruang Riset hanya tersedia untuk member PRO. Silakan upgrade paket Anda terlebih dahulu.",
          code: "PRO_ONLY",
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const rawInput = body.channel || body.username || "";
    const forceRefresh = Boolean(body.forceRefresh);

    if (!rawInput || typeof rawInput !== "string" || !rawInput.trim()) {
      return NextResponse.json(
        { error: "Nama channel atau URL YouTube wajib diisi" },
        { status: 400 }
      );
    }

    const targetHandle = cleanChannelHandle(rawInput);
    const cacheKey = targetHandle.toLowerCase();

    // Check memory cache
    if (!forceRefresh) {
      const cached = youtubeMemoryCache.get(cacheKey);
      if (cached && cached.expiresAt > Date.now()) {
        return NextResponse.json({
          source: "cache",
          profile: cached.profile,
          videos: cached.videos,
        });
      }
    }

    // Fetch Videos Tab and Shorts Tab in parallel
    const baseUrl = `https://www.youtube.com/${targetHandle}`;
    const userAgent =
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
    const headers = {
      "User-Agent": userAgent,
      "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
    };

    const [videosRes, shortsRes] = await Promise.all([
      fetch(`${baseUrl}/videos`, { headers, cache: "no-store" }).catch(() => null),
      fetch(`${baseUrl}/shorts`, { headers, cache: "no-store" }).catch(() => null),
    ]);

    if (!videosRes || !videosRes.ok) {
      return NextResponse.json(
        {
          error: `Channel YouTube "${targetHandle}" tidak ditemukan atau sedang tidak dapat diakses. Pastikan nama channel sudah benar (contoh: @kokbisa).`,
        },
        { status: 404 }
      );
    }

    const videosHtml = await videosRes.text();
    const shortsHtml = shortsRes && shortsRes.ok ? await shortsRes.text() : "";

    // Parse ytInitialData from videos HTML
    const matchVideos =
      videosHtml.match(/var ytInitialData = ({[\s\S]*?});<\/script>/) ||
      videosHtml.match(/ytInitialData\s*=\s*({[\s\S]+?});/);

    if (!matchVideos) {
      return NextResponse.json(
        { error: "Gagal memproses data channel YouTube. Silakan coba kembali." },
        { status: 502 }
      );
    }

    let videosData: any = {};
    try {
      videosData = JSON.parse(matchVideos[1]);
    } catch {
      return NextResponse.json(
        { error: "Format respon YouTube tidak valid" },
        { status: 502 }
      );
    }

    // Extract Channel Profile
    const channelMeta = videosData?.metadata?.channelMetadataRenderer || {};
    const headerContent =
      videosData?.header?.pageHeaderRenderer?.content?.pageHeaderViewModel || {};
    const metadataParts =
      headerContent?.metadata?.contentMetadataViewModel?.metadataRows?.[1]
        ?.metadataParts || [];

    const subText =
      metadataParts?.[0]?.text?.content ||
      metadataParts?.[0]?.accessibilityLabel ||
      "";
    const videoCountText = metadataParts?.[1]?.text?.content || "";

    const channelProfile: YouTubeChannelProfile = {
      channelId: channelMeta.externalId || "",
      customUrl: targetHandle,
      title: channelMeta.title || targetHandle.replace("@", ""),
      avatarUrl:
        channelMeta.avatar?.thumbnails?.slice(-1)[0]?.url ||
        headerContent?.image?.sources?.slice(-1)[0]?.url ||
        "",
      bannerUrl:
        videosData?.header?.c4TabbedHeaderRenderer?.banner?.thumbnails?.slice(
          -1
        )[0]?.url || undefined,
      description: channelMeta.description || "",
      subscriberCount: parseViews(subText),
      subscriberCountText: subText || "Publik",
      videoCount: parseViews(videoCountText),
      viewCount: 0,
      averageViews: 0,
      topOutlierMultiplier: 1,
    };

    const parsedVideos: YouTubeVideoItem[] = [];

    // 1. Process Regular Videos from /videos tab
    const tabs = videosData?.contents?.twoColumnBrowseResultsRenderer?.tabs || [];
    const videoTab = tabs.find((t: any) => t.tabRenderer?.selected);
    const videoContents =
      videoTab?.tabRenderer?.content?.richGridRenderer?.contents || [];

    for (const item of videoContents) {
      const vr = item?.richItemRenderer?.content?.videoRenderer;
      const lvm = item?.richItemRenderer?.content?.lockupViewModel;

      if (lvm) {
        const videoId = lvm.contentId;
        const meta = lvm.metadata?.lockupMetadataViewModel;
        const title = meta?.title?.content || "Video YouTube";
        const parts =
          meta?.metadata?.contentMetadataViewModel?.metadataRows?.[0]
            ?.metadataParts || [];
        const viewsStr = parts[0]?.text?.content || parts[0]?.accessibilityLabel || "";
        const pubStr = parts[1]?.text?.content || parts[1]?.accessibilityLabel || "";
        const overlays = lvm.contentImage?.thumbnailViewModel?.overlays || [];
        const badgeOverlay = overlays.find(
          (o: any) => o.thumbnailBottomOverlayViewModel?.badges?.[0]?.thumbnailBadgeViewModel
        );
        const durationStr =
          badgeOverlay?.thumbnailBottomOverlayViewModel?.badges?.[0]
            ?.thumbnailBadgeViewModel?.text || "";

        const thumb =
          lvm.contentImage?.thumbnailViewModel?.image?.sources?.slice(-1)[0]?.url ||
          `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

        if (videoId) {
          const viewsNum = parseViews(viewsStr);
          const durSecs = parseDurationSeconds(durationStr);
          parsedVideos.push({
            id: videoId,
            title,
            thumbnailUrl: thumb,
            permalink: `https://www.youtube.com/watch?v=${videoId}`,
            viewsCount: viewsNum,
            viewsText: viewsStr || "0 views",
            publishedText: pubStr || "Baru saja",
            timestamp: new Date().toISOString(),
            duration: durationStr || "Video",
            durationSeconds: durSecs,
            isShorts: durSecs > 0 && durSecs <= 60,
            outlierScore: 1,
            outlierTier: "normal",
          });
        }
      } else if (vr) {
        const videoId = vr.videoId;
        const title = vr.title?.runs?.[0]?.text || "Video YouTube";
        const viewsStr = vr.viewCountText?.simpleText || "";
        const pubStr = vr.publishedTimeText?.simpleText || "";
        const durationStr = vr.lengthText?.simpleText || "";
        const thumb =
          vr.thumbnail?.thumbnails?.slice(-1)[0]?.url ||
          `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

        if (videoId) {
          const viewsNum = parseViews(viewsStr);
          const durSecs = parseDurationSeconds(durationStr);
          parsedVideos.push({
            id: videoId,
            title,
            thumbnailUrl: thumb,
            permalink: `https://www.youtube.com/watch?v=${videoId}`,
            viewsCount: viewsNum,
            viewsText: viewsStr || "0 views",
            publishedText: pubStr || "Baru saja",
            timestamp: new Date().toISOString(),
            duration: durationStr || "Video",
            durationSeconds: durSecs,
            isShorts: durSecs > 0 && durSecs <= 60,
            outlierScore: 1,
            outlierTier: "normal",
          });
        }
      }
    }

    // 2. Process Shorts from /shorts tab
    if (shortsHtml) {
      const matchShorts =
        shortsHtml.match(/var ytInitialData = ({[\s\S]*?});<\/script>/) ||
        shortsHtml.match(/ytInitialData\s*=\s*({[\s\S]+?});/);

      if (matchShorts) {
        try {
          const shortsData = JSON.parse(matchShorts[1]);
          const sTabs =
            shortsData?.contents?.twoColumnBrowseResultsRenderer?.tabs || [];
          const sTab = sTabs.find((t: any) => t.tabRenderer?.selected);
          const sContents =
            sTab?.tabRenderer?.content?.richGridRenderer?.contents || [];

          for (const sItem of sContents) {
            const slvm =
              sItem?.richItemRenderer?.content?.shortsLockupViewModel ||
              sItem?.richItemRenderer?.content?.reelItemRenderer;

            if (slvm) {
              const videoId =
                slvm.onTap?.innertubeCommand?.reelWatchEndpoint?.videoId ||
                slvm.videoId ||
                slvm.entityId?.replace("shorts-shelf-item-", "");

              // Avoid duplicates
              if (videoId && !parsedVideos.some((v) => v.id === videoId)) {
                const title =
                  slvm.overlay?.reelPlayerOverlayRenderer?.reelPlayerHeaderSupportedRenderers
                    ?.reelPlayerHeaderRenderer?.reelTitleText?.runs?.[0]?.text ||
                  slvm.accessibilityText?.split(",")?.[0] ||
                  "YouTube Short";
                const viewsStr =
                  slvm.accessibilityText?.split(",")?.[1]?.replace("- putar video Shorts", "").trim() ||
                  "Shorts";
                const thumb =
                  slvm.onTap?.innertubeCommand?.reelWatchEndpoint?.thumbnail
                    ?.thumbnails?.slice(-1)[0]?.url ||
                  `https://i.ytimg.com/vi/${videoId}/frame0.jpg`;

                parsedVideos.push({
                  id: videoId,
                  title,
                  thumbnailUrl: thumb,
                  permalink: `https://www.youtube.com/shorts/${videoId}`,
                  viewsCount: parseViews(viewsStr),
                  viewsText: viewsStr,
                  publishedText: "Shorts",
                  timestamp: new Date().toISOString(),
                  duration: "Shorts",
                  durationSeconds: 60,
                  isShorts: true,
                  outlierScore: 1,
                  outlierTier: "normal",
                });
              }
            }
          }
        } catch (e) {
          console.warn("Could not parse Shorts tab:", e);
        }
      }
    }

    if (parsedVideos.length === 0) {
      return NextResponse.json(
        {
          error: "Channel ditemukan namun belum memiliki video publik yang dapat dianalisis.",
        },
        { status: 404 }
      );
    }

    // 3. Compute Outlier Scores & Baseline Averages
    const validViews = parsedVideos
      .map((v) => v.viewsCount)
      .filter((n) => typeof n === "number" && n > 0);

    const totalViews = validViews.reduce((acc, curr) => acc + curr, 0);
    const averageViews =
      validViews.length > 0 ? Math.round(totalViews / validViews.length) : 1;

    const enrichedVideos: YouTubeVideoItem[] = parsedVideos.map((v) => {
      const views = v.viewsCount || 0;
      const outlierScore =
        averageViews > 0
          ? Number((views / averageViews).toFixed(1))
          : 1.0;

      let outlierTier: "super_viral" | "viral" | "high" | "normal" = "normal";
      if (outlierScore >= 10.0) outlierTier = "super_viral";
      else if (outlierScore >= 5.0) outlierTier = "viral";
      else if (outlierScore >= 2.0) outlierTier = "high";

      return {
        ...v,
        outlierScore,
        outlierTier,
      };
    });

    const topOutlier = Math.max(...enrichedVideos.map((v) => v.outlierScore), 1);

    channelProfile.viewCount = totalViews;
    channelProfile.averageViews = averageViews;
    channelProfile.topOutlierMultiplier = topOutlier;

    // Cache the enriched result for 15 minutes
    youtubeMemoryCache.set(cacheKey, {
      expiresAt: Date.now() + YOUTUBE_CACHE_TTL_MS,
      profile: channelProfile,
      videos: enrichedVideos,
    });

    return NextResponse.json({
      source: "live",
      profile: channelProfile,
      videos: enrichedVideos,
    });
  } catch (error: any) {
    console.error("YouTube Research API Error:", error);
    return NextResponse.json(
      {
        error: error.message || "Terjadi kesalahan internal saat meriset channel YouTube",
      },
      { status: 500 }
    );
  }
}
