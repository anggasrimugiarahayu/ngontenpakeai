import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
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
  } catch (e) {
    // If not a valid URL, treat as raw username
  }
  return cleaned.replace(/^@/, "").replace(/\/$/, "").trim();
}

function formatDuration(sec: number): string {
  if (!sec || isNaN(sec) || sec <= 0) return "0:30";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function parseRelativeDate(timestampMs: number): string {
  const diffMs = Math.max(0, Date.now() - timestampMs);
  const diffDays = Math.floor(diffMs / (24 * 3600 * 1000));
  if (diffDays >= 365) {
    return `${Math.floor(diffDays / 365)} thn lalu`;
  }
  if (diffDays >= 30) {
    return `${Math.floor(diffDays / 30)} bln lalu`;
  }
  if (diffDays >= 7) {
    return `${Math.floor(diffDays / 7)} mgg lalu`;
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

function formatViewsShort(num: number): string {
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + " Jt";
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1).replace(/\.0$/, "") + " Rb";
  }
  return num.toLocaleString("id-ID");
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
      if (cached && cached.expiresAt > Date.now()) {
        return NextResponse.json({
          source: "cache",
          profile: cached.profile,
          videos: cached.videos,
        });
      }
    }

    // Fetch TikTok profile page
    const userAgent =
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
    const profileUrl = `https://www.tiktok.com/@${encodeURIComponent(cleanUsername)}`;

    const pageRes = await fetch(profileUrl, {
      headers: {
        "User-Agent": userAgent,
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
      },
      cache: "no-store",
    });

    if (!pageRes.ok && pageRes.status === 404) {
      return NextResponse.json(
        { error: `Akun TikTok @${cleanUsername} tidak ditemukan.` },
        { status: 404 }
      );
    }

    const html = await pageRes.text();

    // 1. Try parsing __UNIVERSAL_DATA_FOR_REHYDRATION__
    let profileData: any = null;
    let videoItems: any[] = [];
    let secUid = "";

    const uniMatch = html.match(
      /<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__" type="application\/json">([\s\S]*?)<\/script>/
    );

    if (uniMatch) {
      try {
        const parsed = JSON.parse(uniMatch[1]);
        const userDetail =
          parsed?.__DEFAULT_SCOPE__?.["webapp.user-detail"] ||
          parsed?.defaultScope?.["webapp.user-detail"];

        if (userDetail?.userInfo) {
          profileData = userDetail.userInfo;
          secUid = profileData.user?.secUid || "";
        }
      } catch (err) {
        console.warn("Failed to parse __UNIVERSAL_DATA_FOR_REHYDRATION__:", err);
      }
    }

    // 2. Try parsing SIGI_STATE as fallback
    if (!profileData) {
      const sigiMatch = html.match(/<script id="SIGI_STATE" type="application\/json">([\s\S]*?)<\/script>/);
      if (sigiMatch) {
        try {
          const sigi = JSON.parse(sigiMatch[1]);
          if (sigi.UserModule?.users) {
            const firstUserKey = Object.keys(sigi.UserModule.users)[0];
            const u = sigi.UserModule.users[firstUserKey];
            const s = sigi.UserModule.stats?.[firstUserKey];
            if (u) {
              profileData = { user: u, stats: s };
              secUid = u.secUid || "";
            }
          }
          if (sigi.ItemModule) {
            videoItems = Object.values(sigi.ItemModule);
          }
        } catch (err) {
          console.warn("Failed to parse SIGI_STATE:", err);
        }
      }
    }

    // 3. If secUid is found and videoItems is empty, fetch items via TikTok web API
    if (secUid && videoItems.length === 0) {
      try {
        const apiUrl = `https://www.tiktok.com/api/post/item_list/?aid=1988&app_language=id-ID&app_name=tiktok_web&battery_info=1&count=35&cursor=0&device_id=7300000000000000000&device_platform=web_pc&focus_state=true&from_page=user&history_len=3&is_fullscreen=false&is_page_visible=true&os=mac&priority_region=&referer=&region=ID&screen_height=1080&screen_width=1920&secUid=${encodeURIComponent(
          secUid
        )}&tz_name=Asia%2FJakarta&webcast_language=id-ID`;

        const apiRes = await fetch(apiUrl, {
          headers: {
            "User-Agent": userAgent,
            Referer: `https://www.tiktok.com/@${cleanUsername}`,
            Accept: "application/json, text/plain, */*",
            "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
          },
          cache: "no-store",
        });

        if (apiRes.ok) {
          const apiData = await apiRes.json();
          if (Array.isArray(apiData.itemList) && apiData.itemList.length > 0) {
            videoItems = apiData.itemList;
          }
        }
      } catch (err) {
        console.warn("Could not fetch TikTok item_list API:", err);
      }
    }

    // 4. Fallback RapidAPI if available and web scraping yielded no profile
    const rapidApiKey =
      process.env.RAPIDAPI_KEY?.trim() ||
      process.env.TIKTOK_SCRAPER_API_KEY?.trim();

    if ((!profileData || videoItems.length === 0) && rapidApiKey) {
      try {
        const rapidUrl = `https://tiktok-all-in-one.p.rapidapi.com/user/posts?username=${encodeURIComponent(
          cleanUsername
        )}&count=35`;
        const rapidRes = await fetch(rapidUrl, {
          headers: {
            "X-RapidAPI-Key": rapidApiKey,
            "X-RapidAPI-Host": "tiktok-all-in-one.p.rapidapi.com",
          },
          cache: "no-store",
        });
        if (rapidRes.ok) {
          const rData = await rapidRes.json();
          if (rData.data) {
            if (!profileData && rData.data.user) {
              profileData = { user: rData.data.user, stats: rData.data.stats };
            }
            if (Array.isArray(rData.data.posts)) {
              videoItems = rData.data.posts;
            }
          }
        }
      } catch (err) {
        console.warn("RapidAPI TikTok fetch failed:", err);
      }
    }

    if (!profileData) {
      return NextResponse.json(
        {
          error: `Akun TikTok @${cleanUsername} tidak dapat dianalisis atau bersifat Privat. Pastikan akun bersifat publik.`,
        },
        { status: 404 }
      );
    }

    const u = profileData.user || {};
    const s = profileData.stats || {};

    const profile: TikTokUserProfile = {
      username: u.uniqueId || cleanUsername,
      nickname: u.nickname || u.uniqueId || cleanUsername,
      avatarUrl: u.avatarLarger || u.avatarMedium || u.avatarThumb || "",
      isVerified: Boolean(u.verified || u.isVerify),
      signature: u.signature || u.bio || "",
      bioLink: u.bioLink?.link || "",
      followerCount: Number(s.followerCount) || 0,
      followingCount: Number(s.followingCount) || 0,
      heartCount: Number(s.heartCount || s.heart) || 0,
      videoCount: Number(s.videoCount) || 0,
      averageViews: 0,
      averageLikes: 0,
      averageEngagementRate: 0,
      topOutlierMultiplier: 1.0,
    };

    // Transform video items
    const parsedVideos: TikTokPostItem[] = [];

    for (const item of videoItems) {
      const vidId = String(item.id || item.aweme_id || item.video_id || "");
      if (!vidId) continue;

      const desc = item.desc || item.caption || item.title || "";
      const stats = item.stats || item.statistics || {};
      const viewsCount =
        Number(stats.playCount || stats.play_count || stats.views) || 0;
      const likesCount =
        Number(stats.diggCount || stats.digg_count || stats.likes) || 0;
      const commentsCount =
        Number(stats.commentCount || stats.comment_count || stats.comments) || 0;
      const sharesCount =
        Number(stats.shareCount || stats.share_count || stats.shares) || 0;

      const durSec = Number(item.video?.duration || item.duration) || 30;
      const createTime = Number(item.createTime || item.create_time) || 0;
      const timestampMs = createTime ? (createTime < 1e11 ? createTime * 1000 : createTime) : Date.now();
      const isoDate = new Date(timestampMs).toISOString();

      const thumb =
        item.video?.cover?.url_list?.[0] ||
        item.video?.cover ||
        item.video?.originCover ||
        item.video?.dynamicCover ||
        `https://p16-sign.tiktokcdn-us.com/tos-useast5-p-0068-tx/${vidId}~tplv-tiktok-play.jpeg`;

      // Check if photo slide mode
      const isPhoto = Boolean(
        item.imagePost ||
        item.images ||
        (Array.isArray(item.image_post_info?.images) && item.image_post_info.images.length > 0)
      );

      const photoUrls: string[] = [];
      if (Array.isArray(item.imagePost?.images)) {
        photoUrls.push(...item.imagePost.images.map((im: any) => im.imageURL?.urlList?.[0] || im.displayImage?.urlList?.[0]).filter(Boolean));
      } else if (Array.isArray(item.image_post_info?.images)) {
        photoUrls.push(...item.image_post_info.images.map((im: any) => im.display_image?.url_list?.[0]).filter(Boolean));
      }

      parsedVideos.push({
        id: vidId,
        title: desc || "Video TikTok",
        thumbnailUrl: thumb,
        permalink: `https://www.tiktok.com/@${profile.username}/video/${vidId}`,
        viewsCount,
        likesCount,
        commentsCount,
        sharesCount,
        viewsText: formatViewsShort(viewsCount),
        publishedText: parseRelativeDate(timestampMs),
        timestamp: isoDate,
        duration: formatDuration(durSec),
        durationSeconds: durSec,
        isPhoto,
        photoUrls: photoUrls.length > 0 ? photoUrls : undefined,
        outlierScore: 1.0,
        outlierTier: "normal",
        hookText: desc.slice(0, 75).trim(),
        musicTitle: item.music?.title || item.music?.authorName || undefined,
        musicAuthor: item.music?.authorName || undefined,
      });
    }

    if (parsedVideos.length === 0) {
      return NextResponse.json(
        {
          error: `@${cleanUsername} ditemukan, namun belum memiliki video publik yang dapat dianalisis.`,
        },
        { status: 404 }
      );
    }

    // Compute baseline metrics & Outlier Scores
    const validViews = parsedVideos
      .map((v) => v.viewsCount)
      .filter((n) => typeof n === "number" && n > 0);

    const totalViews = validViews.reduce((acc, curr) => acc + curr, 0);
    const averageViews =
      validViews.length > 0 ? Math.round(totalViews / validViews.length) : 1;

    const validLikes = parsedVideos.map((v) => v.likesCount).filter((n) => n > 0);
    const averageLikes =
      validLikes.length > 0
        ? Math.round(validLikes.reduce((a, b) => a + b, 0) / validLikes.length)
        : Math.round(averageViews * 0.05);

    const avgER = Number(
      ((averageLikes / (averageViews || 1)) * 100).toFixed(2)
    );

    const enrichedVideos: TikTokPostItem[] = parsedVideos.map((v) => {
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

    profile.averageViews = averageViews;
    profile.averageLikes = averageLikes;
    profile.averageEngagementRate = avgER;
    profile.topOutlierMultiplier = topOutlier;

    tiktokMemoryCache.set(cacheKey, {
      expiresAt: Date.now() + TIKTOK_CACHE_TTL_MS,
      profile,
      videos: enrichedVideos,
    });

    return NextResponse.json({
      source: "live",
      profile,
      videos: enrichedVideos,
    });
  } catch (error: any) {
    console.error("TikTok Research API Error:", error);
    return NextResponse.json(
      {
        error:
          error?.message ||
          "Terjadi kesalahan internal saat memproses riset akun TikTok.",
      },
      { status: 500 }
    );
  }
}
