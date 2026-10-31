import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { verifyFeatureAccess, incrementFeatureUsage } from "@/lib/auth-checks";
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

const STANDARD_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
  Cookie: "CONSENT=PENDING+999; SOCS=CAESEwgDEgk2MTQ5MTAzNjcaAmVuIAEaBgiA_LyaBg;",
};

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
      if (channelMatch) return `channel/${channelMatch[1]}`;
    } catch {}
  }
  clean = clean.replace(/^(https?:\/\/)?(www\.)?youtube\.com\/?/i, "");
  // Remove trailing slashes and subroutes like /videos or /shorts
  clean = clean.replace(/\/(videos|shorts|featured|community|playlists)$/i, "").trim();

  if (!clean.startsWith("@") && !clean.startsWith("channel/") && !clean.startsWith("UC")) {
    clean = `@${clean}`;
  }
  return clean;
}

async function resolveChannelBySearch(rawQuery: string): Promise<string | null> {
  try {
    const cleanQuery = rawQuery.replace(/^@/, "").trim();
    if (!cleanQuery) return null;
    const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(
      cleanQuery
    )}&sp=EgIQAg%3D%3D`;

    const res = await fetch(url, {
      headers: STANDARD_HEADERS,
      cache: "no-store",
    });
    if (!res.ok) return null;

    const html = await res.text();
    const match =
      html.match(/var ytInitialData = ({[\s\S]*?});<\/script>/) ||
      html.match(/ytInitialData\s*=\s*({[\s\S]+?});/);
    if (!match) return null;

    const data = JSON.parse(match[1]);
    const contents =
      data?.contents?.twoColumnSearchResultsRenderer?.primaryContents
        ?.sectionListRenderer?.contents || [];

    for (const section of contents) {
      const items = section.itemSectionRenderer?.contents || [];
      for (const item of items) {
        if (item.channelRenderer) {
          const cr = item.channelRenderer;
          const navUrl =
            cr.navigationEndpoint?.browseEndpoint?.canonicalBaseUrl ||
            cr.navigationEndpoint?.commandMetadata?.webCommandMetadata?.url ||
            "";
          if (navUrl.startsWith("/@")) {
            return navUrl.replace("/", ""); // returns "@corbuzier"
          }
          if (cr.channelId) {
            return `channel/${cr.channelId}`;
          }
        }
      }
    }
  } catch (err) {
    console.warn("YouTube channel search resolution error:", err);
  }
  return null;
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

function parseRelativeDateToISO(text?: string | null): string {
  if (!text) return new Date().toISOString();
  const now = Date.now();
  const trimmed = text.trim();

  // If text is already an ISO or standard date string
  if (trimmed.includes("-") || trimmed.includes("T")) {
    const parsed = Date.parse(trimmed);
    if (!isNaN(parsed)) {
      return new Date(parsed).toISOString();
    }
  }

  const lower = trimmed.toLowerCase();

  if (/kemarin|yesterday/i.test(lower)) {
    return new Date(now - 24 * 3600 * 1000).toISOString();
  }

  const numMatch = lower.match(/\d+/);
  const num = numMatch ? parseInt(numMatch[0], 10) : 1;

  let msAgo = 0;
  if (/tahun|thn|\bth\b|years?|\byrs?\b|\d+\s*y\b/i.test(lower)) {
    msAgo = num * 365 * 24 * 3600 * 1000;
  } else if (/bulan|bln|months?|\bmos?\b|\d+\s*mo\b/i.test(lower)) {
    msAgo = num * 30 * 24 * 3600 * 1000;
  } else if (/minggu|mgg|weeks?|\bwks?\b|\d+\s*w\b/i.test(lower)) {
    msAgo = num * 7 * 24 * 3600 * 1000;
  } else if (/hari|days?|\d+\s*d\b|\d+\s*h\s*lalu/i.test(lower)) {
    msAgo = num * 24 * 3600 * 1000;
  } else if (/jam|hours?|\bhrs?\b|\bj\b|\d+\s*h\b/i.test(lower)) {
    msAgo = num * 3600 * 1000;
  } else if (/menit|mnt|minutes?|\bmins?\b|\d+\s*m\b/i.test(lower)) {
    msAgo = num * 60 * 1000;
  } else if (/detik|dtk|seconds?|\bsecs?\b|\d+\s*s\b/i.test(lower)) {
    msAgo = num * 1000;
  }

  return new Date(now - msAgo).toISOString();
}

function formatRelativeDateFromISO(isoString: string): string {
  const time = new Date(isoString).getTime();
  if (isNaN(time)) return "Baru saja";
  const diffMs = Math.max(0, Date.now() - time);
  const diffDays = Math.floor(diffMs / (24 * 3600 * 1000));
  if (diffDays >= 365) {
    const y = Math.floor(diffDays / 365);
    return `${y} thn lalu`;
  }
  if (diffDays >= 30) {
    const m = Math.floor(diffDays / 30);
    return `${m} bln lalu`;
  }
  if (diffDays >= 7) {
    const w = Math.floor(diffDays / 7);
    return `${w} mgg lalu`;
  }
  if (diffDays >= 1) {
    return `${diffDays} hari lalu`;
  }
  const diffHours = Math.floor(diffMs / (3600 * 1000));
  if (diffHours >= 1) {
    return `${diffHours} jam lalu`;
  }
  const diffMins = Math.floor(diffMs / (60 * 1000));
  if (diffMins >= 1) {
    return `${diffMins} menit lalu`;
  }
  return "Baru saja";
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    // Verify Riset YouTube feature access (Free limit vs PRO)
    const access = await verifyFeatureAccess(
      session.user.id,
      "Riset YouTube",
      session.user.email
    );

    if (!access.authorized) {
      return NextResponse.json(
        {
          error: access.reason || "Akses tidak diizinkan",
          code: access.code,
          isProOnly: access.isProOnly,
          remainingQuota: access.remainingQuota ?? 0,
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

    let targetHandle = cleanChannelHandle(rawInput);
    let cacheKey = targetHandle.toLowerCase();

    // Check memory cache
    if (!forceRefresh) {
      const cached = youtubeMemoryCache.get(cacheKey);
      if (cached && cached.expiresAt > Date.now()) {
        return NextResponse.json({
          source: "cache",
          profile: cached.profile,
          videos: cached.videos,
          remainingQuota: access.isPro ? 9999 : access.remainingQuota,
        });
      }
    }

    // Fetch Videos Tab and Shorts Tab in parallel
    let baseUrl = `https://www.youtube.com/${targetHandle}`;

    let [videosRes, shortsRes] = await Promise.all([
      fetch(`${baseUrl}/videos`, { headers: STANDARD_HEADERS, cache: "no-store" }).catch(() => null),
      fetch(`${baseUrl}/shorts`, { headers: STANDARD_HEADERS, cache: "no-store" }).catch(() => null),
    ]);

    // If initial handle fetch fails (e.g. 404 because user typed full channel name like "deddy corbuzier"),
    // perform Smart Channel Search Resolution
    if (!videosRes || !videosRes.ok) {
      const resolvedHandle = await resolveChannelBySearch(rawInput);
      if (resolvedHandle && resolvedHandle !== targetHandle) {
        targetHandle = resolvedHandle;
        cacheKey = targetHandle.toLowerCase();
        baseUrl = `https://www.youtube.com/${targetHandle}`;

        // Retry fetch with resolved handle
        [videosRes, shortsRes] = await Promise.all([
          fetch(`${baseUrl}/videos`, { headers: STANDARD_HEADERS, cache: "no-store" }).catch(() => null),
          fetch(`${baseUrl}/shorts`, { headers: STANDARD_HEADERS, cache: "no-store" }).catch(() => null),
        ]);
      }
    }

    if (!videosRes || !videosRes.ok) {
      return NextResponse.json(
        {
          error: `Channel YouTube "${rawInput}" tidak ditemukan atau sedang tidak dapat diakses. Pastikan nama channel sudah benar (contoh: @corbuzier atau @kokbisa).`,
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
    const metadataRows =
      headerContent?.metadata?.contentMetadataViewModel?.metadataRows || [];

    // Scan all metadata rows to find subscriber count and video count
    let subText = "";
    let videoCountText = "";
    for (const row of metadataRows) {
      for (const part of row.metadataParts || []) {
        const text = part.text?.content || part.accessibilityLabel || "";
        if (/subscri|pelanggan/i.test(text)) {
          subText = text;
        } else if (/video/i.test(text)) {
          videoCountText = text;
        }
      }
    }

    const channelHeader = videosData?.header?.c4TabbedHeaderRenderer || {};
    if (!subText) {
      subText =
        channelHeader?.subscriberCountText?.simpleText ||
        metadataRows[1]?.metadataParts?.[0]?.text?.content ||
        "";
    }

    const channelProfile: YouTubeChannelProfile = {
      channelId: channelMeta.externalId || "",
      customUrl: targetHandle.startsWith("@") ? targetHandle : `@${channelMeta.title || targetHandle}`,
      title: channelMeta.title || targetHandle.replace("@", ""),
      avatarUrl:
        channelMeta.avatar?.thumbnails?.slice(-1)[0]?.url ||
        headerContent?.image?.sources?.slice(-1)[0]?.url ||
        "",
      bannerUrl:
        videosData?.header?.c4TabbedHeaderRenderer?.banner?.thumbnails?.slice(-1)[0]?.url ||
        undefined,
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
        let viewsStr = "";
        let pubStr = "";
        for (const p of parts) {
          const content = p?.text?.content || p?.accessibilityLabel || "";
          if (!content) continue;
          if (/ditonton|views|tayangan|penayangan/i.test(content) && !viewsStr) {
            viewsStr = content;
          } else if (/lalu|ago|kemarin|yesterday|detik|menit|jam|hari|minggu|mgg|bulan|bln|tahun|thn|sec|min|hour|day|week|month|year/i.test(content) && !pubStr) {
            pubStr = content;
          }
        }
        if (!viewsStr && parts[0]) {
          viewsStr = parts[0]?.text?.content || parts[0]?.accessibilityLabel || "";
        }
        if (!pubStr && parts[1]) {
          pubStr = parts[1]?.text?.content || parts[1]?.accessibilityLabel || "";
        }
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
            likesCount: 0,
            commentsCount: 0,
            viewsText: viewsStr || "0 views",
            publishedText: pubStr || "Baru saja",
            timestamp: parseRelativeDateToISO(pubStr),
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
            likesCount: 0,
            commentsCount: 0,
            viewsText: viewsStr || "0 views",
            publishedText: pubStr || "Baru saja",
            timestamp: parseRelativeDateToISO(pubStr),
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
                slvm.entityId?.replace("shorts-shelf-item-", "") ||
                slvm.videoId;

              // Avoid duplicates
              if (videoId && !parsedVideos.some((v) => v.id === videoId)) {
                const title =
                  slvm.overlayMetadata?.primaryText?.content ||
                  slvm.overlay?.reelPlayerOverlayRenderer?.reelPlayerHeaderSupportedRenderers
                    ?.reelPlayerHeaderRenderer?.reelTitleText?.runs?.[0]?.text ||
                  slvm.accessibilityText?.split(",")?.[0] ||
                  "YouTube Short";

                const viewsStr =
                  slvm.overlayMetadata?.secondaryText?.content ||
                  slvm.accessibilityText?.split(",")?.[1]?.replace("- putar video Shorts", "").trim() ||
                  "Shorts";

                const thumb =
                  slvm.thumbnailViewModel?.thumbnailViewModel?.image?.sources?.slice(-1)[0]?.url ||
                  slvm.onTap?.innertubeCommand?.reelWatchEndpoint?.thumbnail?.thumbnails?.slice(-1)[0]?.url ||
                  `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

                // Extract published text if available in accessibility or metadata
                let shortsPubStr = "Shorts";
                const aText = slvm.accessibilityText || "";
                const dateMatch = aText.match(
                  /\b\d+\s*(?:detik|dtk|menit|mnt|jam|j|hari|h|minggu|mgg|bulan|bln|tahun|thn|second|minute|hour|day|week|month|year|sec|min|hr|d|w|mo|yr)\s*(?:lalu|ago|yang lalu)?\b/i
                );
                if (dateMatch) {
                  shortsPubStr = dateMatch[0].trim();
                }

                parsedVideos.push({
                  id: videoId,
                  title,
                  thumbnailUrl: thumb,
                  permalink: `https://www.youtube.com/shorts/${videoId}`,
                  viewsCount: parseViews(viewsStr),
                  likesCount: 0,
                  commentsCount: 0,
                  viewsText: viewsStr,
                  publishedText: shortsPubStr,
                  timestamp: parseRelativeDateToISO(shortsPubStr !== "Shorts" ? shortsPubStr : ""),
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

    // 3. Optional: Enrich with YouTube Data API v3 statistics & snippet if YOUTUBE_API_KEY is available
    const ytApiKey = process.env.YOUTUBE_API_KEY?.trim();
    if (ytApiKey) {
      const videoIds = parsedVideos.map((v) => v.id);
      for (let i = 0; i < videoIds.length; i += 50) {
        const batchIds = videoIds.slice(i, i + 50).join(",");
        try {
          const ytRes = await fetch(
            `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${batchIds}&key=${ytApiKey}`,
            { cache: "no-store" }
          );
          if (ytRes.ok) {
            const ytData = await ytRes.json();
            const statsMap = new Map<
              string,
              {
                likes: number;
                comments: number;
                views: number;
                publishedAt?: string;
              }
            >();
            for (const item of ytData.items || []) {
              statsMap.set(item.id, {
                likes: Number(item.statistics?.likeCount) || 0,
                comments: Number(item.statistics?.commentCount) || 0,
                views: Number(item.statistics?.viewCount) || 0,
                publishedAt: item.snippet?.publishedAt,
              });
            }
            for (const v of parsedVideos) {
              const st = statsMap.get(v.id);
              if (st) {
                v.likesCount = st.likes;
                v.commentsCount = st.comments;
                (v as any).hasRealStats = true;
                if (st.views > 0 && v.viewsCount === 0) v.viewsCount = st.views;
                if (st.publishedAt) {
                  v.timestamp = st.publishedAt;
                  if (v.publishedText === "Shorts" || v.publishedText === "Baru saja") {
                    v.publishedText = formatRelativeDateFromISO(st.publishedAt);
                  }
                }
              }
            }
          } else {
            const errBody = await ytRes.text().catch(() => "");
            console.warn(`YouTube Data API responded with HTTP ${ytRes.status}:`, errBody);
          }
        } catch (err) {
          console.warn("YouTube Data API fetch failed:", err);
        }
      }
    }

    // 4. Compute Outlier Scores & Baseline Averages
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

      // Calculate benchmark likes & comments ONLY if not provided by YouTube Data API v3
      let likes = v.likesCount;
      if (!(v as any).hasRealStats && (!likes || likes <= 0)) {
        const likeRatio = Math.min(0.085, 0.045 * Math.pow(Math.max(0.6, outlierScore), 0.2));
        likes = Math.max(1, Math.round(views * likeRatio));
      }

      let comments = v.commentsCount;
      if (!(v as any).hasRealStats && (!comments || comments <= 0)) {
        const commentRatio = Math.min(0.0075, 0.0022 * Math.pow(Math.max(0.6, outlierScore), 0.25));
        comments = Math.max(0, Math.round(views * commentRatio));
      }

      const subDenominator = Math.max(1, channelProfile.subscriberCount || averageViews);
      const engagementRate = Number((((likes + comments) / subDenominator) * 100).toFixed(2));

      return {
        ...v,
        likesCount: likes,
        commentsCount: comments,
        outlierScore,
        outlierTier,
        engagementRate,
      };
    });

    const topOutlier = Math.max(...enrichedVideos.map((v) => v.outlierScore), 1);
    const totalLikes = enrichedVideos.reduce((acc, v) => acc + (v.likesCount || 0), 0);
    const averageLikes = enrichedVideos.length > 0 ? Math.round(totalLikes / enrichedVideos.length) : Math.round(averageViews * 0.048);
    const totalComments = enrichedVideos.reduce((acc, v) => acc + (v.commentsCount || 0), 0);
    const averageComments = enrichedVideos.length > 0 ? Math.round(totalComments / enrichedVideos.length) : 0;
    const subDenominator = Math.max(1, channelProfile.subscriberCount || averageViews);
    const avgER = Number((((averageLikes + averageComments) / subDenominator) * 100).toFixed(2));

    channelProfile.viewCount = totalViews;
    channelProfile.averageViews = averageViews;
    channelProfile.topOutlierMultiplier = topOutlier;
    channelProfile.averageLikes = averageLikes;
    channelProfile.averageEngagementRate = avgER;

    // Cache the enriched result for 15 minutes
    youtubeMemoryCache.set(cacheKey, {
      expiresAt: Date.now() + YOUTUBE_CACHE_TTL_MS,
      profile: channelProfile,
      videos: enrichedVideos,
    });

    if (!access.isPro && access.featureId) {
      await incrementFeatureUsage(userId, access.featureId);
    }
    const remainingQuota = access.isPro ? 9999 : Math.max(0, (access.remainingQuota ?? 1) - 1);

    return NextResponse.json({
      source: "live",
      profile: channelProfile,
      videos: enrichedVideos,
      remainingQuota,
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
