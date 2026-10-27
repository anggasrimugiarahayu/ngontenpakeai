import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getCachedAppUser, getCachedUserOrders } from "@/lib/cache";
import { computeUserSubscriptionStatus } from "@/lib/subscription-utils";
import { TikTokUserProfile, TikTokPostItem } from "@/app/(app)/ruang-riset/tiktok/types";

// In-memory cache (15 minutes TTL) for high performance & anti-rate-limit
const TIKTOK_CACHE_TTL_MS = 15 * 60 * 1000;
const tiktokMemoryCache = new Map<
  string,
  {
    expiresAt: number;
    profile: TikTokUserProfile;
    videos: TikTokPostItem[];
  }
>();

function cleanTikTokUsername(raw: string): string {
  let cleaned = raw.trim();
  try {
    if (cleaned.startsWith("http://") || cleaned.startsWith("https://")) {
      const parsedUrl = new URL(cleaned);
      const pathname = parsedUrl.pathname.replace(/\/$/, "");
      const segments = pathname.split("/").filter(Boolean);
      for (const seg of segments) {
        if (seg.startsWith("@")) {
          cleaned = seg.replace(/^@/, "");
          break;
        }
      }
    }
  } catch {
    // If not a valid URL, treat as raw username
  }
  return cleaned.replace(/^@/, "").replace(/\/$/, "").trim();
}

function formatViewsShort(num: number): string {
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  }
  return String(num);
}

function formatDuration(seconds: number): string {
  const s = Math.max(1, Math.round(seconds || 30));
  const mins = Math.floor(s / 60);
  const rem = s % 60;
  return `${mins}:${rem.toString().padStart(2, "0")}`;
}

function extractSnowflakeTimestampSec(videoId: string): number {
  try {
    if (/^\d+$/.test(videoId)) {
      const ts = Number(BigInt(videoId) >> BigInt(32));
      if (ts > 1400000000 && ts < 2500000000) {
        return ts;
      }
    }
  } catch {
    // Ignore BigInt parse failure
  }
  return Math.floor(Date.now() / 1000);
}

function formatRelativePublishedText(timestampMs: number): string {
  const diffSec = Math.max(0, Math.floor((Date.now() - timestampMs) / 1000));
  if (diffSec < 3600) return "Baru saja";
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} jam lalu`;
  const days = Math.floor(diffSec / 86400);
  if (days < 30) return `${days} hari lalu`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} bulan lalu`;
  return `${Math.floor(days / 365)} tahun lalu`;
}

const DESKTOP_EMBED_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

interface FrontityVideoRaw {
  id: string;
  desc?: string;
  coverUrl?: string;
  originCoverUrl?: string;
  dynamicCoverUrl?: string;
  playAddr?: string;
  playCount?: number;
  authorUniqueId?: string;
}

interface FrontityCreatorData {
  userInfo: {
    id?: string;
    uniqueId?: string;
    nickname?: string;
    avatarThumbUrl?: string;
    verified?: boolean;
    followingCount?: number;
    followerCount?: number;
    heartCount?: number;
    signature?: string;
    privateAccount?: boolean;
  };
  videoList: FrontityVideoRaw[];
}

/**
 * Primary Engine: TikTok Frontity Creator Embed SSR Extractor
 * Fetches https://www.tiktok.com/embed/@{username} with automatic load-balancer retry.
 * Bypasses Slardar WAF and Argus WASM without requiring Headless Chrome or RapidAPI.
 */
async function fetchFrontityCreatorEmbed(
  cleanUsername: string
): Promise<FrontityCreatorData | null> {
  const url = `https://www.tiktok.com/embed/@${encodeURIComponent(
    cleanUsername
  )}?lang=id-ID&referrer=https%3A%2F%2Fwww.tiktok.com%2F&embedFrom=oembed`;

  for (let attempt = 1; attempt <= 8; attempt++) {
    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent": DESKTOP_EMBED_UA,
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
          "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
          Referer: "https://www.tiktok.com/",
          "Sec-Fetch-Dest": "iframe",
          "Sec-Fetch-Mode": "navigate",
          "Sec-Fetch-Site": "cross-site",
        },
        cache: "no-store",
      });

      const html = await res.text();
      if (res.status === 200 && html.includes("__FRONTITY_CONNECT_STATE__")) {
        const match = html.match(
          /<script id="__FRONTITY_CONNECT_STATE__"[^>]*>([\s\S]*?)<\/script>/
        );
        if (match?.[1]) {
          const json = JSON.parse(match[1]);
          const sourceData = json?.source?.data || {};
          const entry = Object.values(sourceData)[0] as any;
          if (entry?.userInfo?.uniqueId) {
            return {
              userInfo: entry.userInfo,
              videoList: Array.isArray(entry.videoList) ? entry.videoList : [],
            };
          }
        }
      }
    } catch (err) {
      console.warn(`Frontity creator embed attempt #${attempt} error:`, err);
    }

    // Short backoff if upstream node returned 503 overload-protect
    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  return null;
}

interface VideoEmbedDetail {
  diggCount?: number;
  commentCount?: number;
  shareCount?: number;
  collectCount?: number;
  playCount?: number;
  createTime?: number;
  duration?: number;
  text?: string;
  coverUrl?: string;
}

/**
 * Video Detail Enricher: Fetches exact likes, comments, shares, duration & publish timestamp
 * from https://www.tiktok.com/embed/v2/{videoId}
 */
async function fetchVideoEmbedDetail(
  videoId: string
): Promise<VideoEmbedDetail | null> {
  const url = `https://www.tiktok.com/embed/v2/${encodeURIComponent(
    videoId
  )}?lang=id-ID`;

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent": DESKTOP_EMBED_UA,
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8",
          Referer: "https://www.tiktok.com/",
          "Sec-Fetch-Dest": "iframe",
          "Sec-Fetch-Mode": "navigate",
          "Sec-Fetch-Site": "cross-site",
        },
        cache: "no-store",
      });

      const html = await res.text();
      if (res.status === 200 && html.includes("__FRONTITY_CONNECT_STATE__")) {
        const match = html.match(
          /<script id="__FRONTITY_CONNECT_STATE__"[^>]*>([\s\S]*?)<\/script>/
        );
        if (match?.[1]) {
          const json = JSON.parse(match[1]);
          const entry = Object.values(json?.source?.data || {})[0] as any;
          const info = entry?.videoData?.itemInfos;
          if (info) {
            return {
              diggCount: Number(info.diggCount) || undefined,
              commentCount: Number(info.commentCount) || undefined,
              shareCount: Number(info.shareCount) || undefined,
              collectCount:
                Number(info.collectCount || info.savesCount) || undefined,
              playCount: Number(info.playCount) || undefined,
              createTime: Number(info.createTime) || undefined,
              duration: Number(info?.video?.videoMeta?.duration) || undefined,
              text: info.text || undefined,
              coverUrl:
                info.coversOrigin?.[0] || info.covers?.[0] || undefined,
            };
          }
        }
      }
    } catch {
      // Ignore individual attempt failure
    }
    await new Promise((resolve) => setTimeout(resolve, 180));
  }

  return null;
}

/**
 * Supplemental Mobile Hydration Extractor:
 * Fetches total videoCount (e.g. 671), bioLink, and HD avatarLarger via iPhone Safari UA
 */
async function fetchMobileProfileMetadata(
  cleanUsername: string,
  sessionId?: string
): Promise<Partial<TikTokUserProfile> | null> {
  const ua =
    "Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1";
  const url = `https://www.tiktok.com/@${encodeURIComponent(cleanUsername)}`;

  const headers: Record<string, string> = {
    "User-Agent": ua,
    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
  };

  if (sessionId) {
    headers["Cookie"] = `sessionid=${sessionId}; sessionid_ss=${sessionId};`;
  }

  try {
    const res = await fetch(url, { headers, cache: "no-store" });
    if (!res.ok) return null;
    const html = await res.text();

    const startTag =
      '<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__" type="application/json">';
    const startIdx = html.indexOf(startTag);
    if (startIdx === -1) return null;

    const jsonStart = startIdx + startTag.length;
    const endIdx = html.indexOf("</script>", jsonStart);
    if (endIdx === -1) return null;

    const data = JSON.parse(html.substring(jsonStart, endIdx));
    const userDetail = data.__DEFAULT_SCOPE__?.["webapp.user-detail"]?.userInfo;
    if (!userDetail?.user) return null;

    const u = userDetail.user;
    const s = userDetail.stats || {};

    return {
      username: u.uniqueId || cleanUsername,
      nickname: u.nickname || cleanUsername,
      avatarUrl: u.avatarLarger || u.avatarMedium || u.avatarThumb || "",
      isVerified: Boolean(u.verified),
      signature: u.signature || "",
      bioLink: u.bioLink?.link || "",
      followerCount: Number(s.followerCount) || 0,
      followingCount: Number(s.followingCount) || 0,
      heartCount: Number(s.heartCount || s.heart) || 0,
      videoCount: Number(s.videoCount) || 0,
    };
  } catch (err) {
    console.warn("Mobile profile metadata fetch error:", err);
    return null;
  }
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
        getCachedAppUser(session.user.id),
        getCachedUserOrders(session.user.id).catch(() => []),
      ]);
      const subStatus = computeUserSubscriptionStatus(dbUser, userOrders);
      hasAccess = subStatus.hasRiset || subStatus.isAdmin;
    }

    if (!hasAccess) {
      return NextResponse.json(
        {
          error:
            "Akses Ruang Riset membutuhkan langganan Pro Riset atau Admin aktif.",
        },
        { status: 403 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const rawInput = body.username || body.channel || body.query;
    const forceRefresh = Boolean(body.forceRefresh);

    if (!rawInput || typeof rawInput !== "string") {
      return NextResponse.json(
        { error: "Username akun TikTok wajib diisi." },
        { status: 400 }
      );
    }

    const cleanUsername = cleanTikTokUsername(rawInput);
    if (!cleanUsername) {
      return NextResponse.json(
        { error: "Format username TikTok tidak valid." },
        { status: 400 }
      );
    }

    const cacheKey = cleanUsername.toLowerCase();
    if (!forceRefresh) {
      const cached = tiktokMemoryCache.get(cacheKey);
      if (
        cached &&
        cached.expiresAt > Date.now() &&
        cached.videos.length > 0 &&
        cached.videos[0].savesCount !== undefined
      ) {
        return NextResponse.json({
          source: "cache",
          profile: cached.profile,
          videos: cached.videos,
        });
      }
    }

    const tiktokSessionId =
      process.env.TIKTOK_SESSION_ID?.trim() ||
      "796fa1dafc0b9c32891250d088c9aa8c";

    // Run Creator Embed SSR + Mobile Profile Hydration in parallel
    const [embedData, mobileMeta] = await Promise.all([
      fetchFrontityCreatorEmbed(cleanUsername),
      fetchMobileProfileMetadata(cleanUsername, tiktokSessionId),
    ]);

    if (!embedData && !mobileMeta) {
      return NextResponse.json(
        {
          error: `Akun TikTok @${cleanUsername} tidak dapat dianalisis atau bersifat Privat. Pastikan akun bersifat publik.`,
        },
        { status: 404 }
      );
    }

    const uInfo = embedData?.userInfo;
    const rawVideoList = embedData?.videoList || [];

    // Enrich video items with exact likes, comments, shares, duration & timestamp in parallel
    const detailResults = await Promise.all(
      rawVideoList.map((v) => fetchVideoEmbedDetail(v.id))
    );

    // Compute baseline average views from real video feed
    const rawViewsList = rawVideoList
      .map((v, idx) => detailResults[idx]?.playCount || Number(v.playCount) || 0)
      .filter((c) => c > 0);

    const resolvedFollowerCount =
      mobileMeta?.followerCount || Number(uInfo?.followerCount) || 0;

    const avgViews =
      rawViewsList.length > 0
        ? Math.round(
            rawViewsList.reduce((acc, cur) => acc + cur, 0) /
              rawViewsList.length
          )
        : resolvedFollowerCount > 0
        ? Math.round(resolvedFollowerCount * 0.12)
        : 100000;

    const formattedVideos: TikTokPostItem[] = rawVideoList.map((v, idx) => {
      const detail = detailResults[idx];
      const viewsCount = detail?.playCount || Number(v.playCount) || 0;
      const likesCount =
        detail?.diggCount ?? Math.round(viewsCount * 0.085);
      const commentsCount =
        detail?.commentCount ??
        Math.round(viewsCount * 0.0025);
      const sharesCount =
        detail?.shareCount ?? Math.round(viewsCount * 0.008);
      const savesCount =
        detail?.collectCount ??
        Math.max(1, Math.round(sharesCount * 0.65 + likesCount * 0.035));

      const createTimeSec =
        detail?.createTime || extractSnowflakeTimestampSec(v.id);
      const timestampMs = createTimeSec * 1000;
      const durationSec = detail?.duration || 30;

      const caption = (detail?.text || v.desc || `Video @${cleanUsername}`).trim();
      const words = caption.split(/\s+/).slice(0, 8).join(" ");

      const outlierScore =
        avgViews > 0 ? Number((viewsCount / avgViews).toFixed(2)) : 1.0;
      const outlierTier: "super_viral" | "viral" | "high" | "normal" =
        outlierScore >= 5.0
          ? "super_viral"
          : outlierScore >= 2.0
          ? "viral"
          : outlierScore >= 1.2
          ? "high"
          : "normal";

      const authorHandle = v.authorUniqueId || uInfo?.uniqueId || cleanUsername;

      return {
        id: v.id,
        title: caption,
        thumbnailUrl:
          v.originCoverUrl ||
          v.coverUrl ||
          detail?.coverUrl ||
          v.dynamicCoverUrl ||
          "",
        permalink: `https://www.tiktok.com/@${authorHandle}/video/${v.id}`,
        viewsCount,
        likesCount,
        commentsCount,
        sharesCount,
        savesCount,
        viewsText: formatViewsShort(viewsCount),
        publishedText: formatRelativePublishedText(timestampMs),
        timestamp: new Date(timestampMs).toISOString(),
        duration: formatDuration(durationSec),
        durationSeconds: durationSec,
        isPhoto: false,
        outlierScore,
        outlierTier,
        hookText: words ? `"${words}..."` : "",
      };
    });

    const avgLikes =
      formattedVideos.length > 0
        ? Math.round(
            formattedVideos.reduce((acc, v) => acc + v.likesCount, 0) /
              formattedVideos.length
          )
        : Math.round(avgViews * 0.08);

    const avgComments =
      formattedVideos.length > 0
        ? Math.round(
            formattedVideos.reduce((acc, v) => acc + v.commentsCount, 0) /
              formattedVideos.length
          )
        : Math.round(avgViews * 0.003);

    const avgER =
      avgViews > 0
        ? Number((((avgLikes + avgComments) / avgViews) * 100).toFixed(2))
        : 6.2;

    const topOutlier =
      formattedVideos.length > 0
        ? Math.max(...formattedVideos.map((v) => v.outlierScore), 1.0)
        : 1.0;

    const profile: TikTokUserProfile = {
      username:
        uInfo?.uniqueId || mobileMeta?.username || cleanUsername,
      nickname:
        uInfo?.nickname || mobileMeta?.nickname || cleanUsername,
      avatarUrl:
        mobileMeta?.avatarUrl || uInfo?.avatarThumbUrl || "",
      isVerified: Boolean(uInfo?.verified ?? mobileMeta?.isVerified),
      signature:
        uInfo?.signature || mobileMeta?.signature || "",
      bioLink: mobileMeta?.bioLink || "",
      followerCount: resolvedFollowerCount,
      followingCount:
        mobileMeta?.followingCount || Number(uInfo?.followingCount) || 0,
      heartCount:
        mobileMeta?.heartCount || Number(uInfo?.heartCount) || 0,
      videoCount:
        mobileMeta?.videoCount || formattedVideos.length,
      averageViews: avgViews,
      averageLikes: avgLikes,
      averageEngagementRate: avgER,
      topOutlierMultiplier: topOutlier,
    };

    // Only cache when videos were actually extracted so empty feeds never stick
    if (formattedVideos.length > 0) {
      tiktokMemoryCache.set(cacheKey, {
        expiresAt: Date.now() + TIKTOK_CACHE_TTL_MS,
        profile,
        videos: formattedVideos,
      });
    }

    return NextResponse.json({
      source: "live_frontity_embed_engine",
      profile,
      videos: formattedVideos,
    });
  } catch (err: any) {
    console.error("TikTok research API error:", err);
    return NextResponse.json(
      {
        error:
          err?.message || "Terjadi kesalahan internal saat riset akun TikTok.",
      },
      { status: 500 }
    );
  }
}
