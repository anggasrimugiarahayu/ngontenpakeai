import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import {
  InstagramPostItem,
  InstagramTargetProfile,
} from "@/app/(app)/ruang-riset/instagram/types";
import { getResolvedRisetConfig } from "@/lib/riset-config";

// In-memory cache (15 minutes TTL) to protect Instagram rate-limits & speed up repeated research
const RISET_CACHE_TTL_MS = 15 * 60 * 1000;
const risetMemoryCache = new Map<
  string,
  {
    expiresAt: number;
    source: string;
    profile: InstagramTargetProfile;
    posts: InstagramPostItem[];
  }
>();

function toProxiedImageUrl(rawUrl?: string | null): string {
  if (!rawUrl || typeof rawUrl !== "string") return "";
  const cleaned = rawUrl.replace(/&amp;/g, "&").trim();
  if (!cleaned.startsWith("http")) return cleaned;
  try {
    const parsed = new URL(cleaned);
    const host = parsed.hostname.toLowerCase();
    if (
      host.endsWith(".cdninstagram.com") ||
      host.endsWith(".fbcdn.net") ||
      host === "instagram.com" ||
      host.endsWith(".instagram.com")
    ) {
      return `/api/ruang-riset/image-proxy?url=${encodeURIComponent(cleaned)}`;
    }
    return cleaned;
  } catch {
    return cleaned;
  }
}

function decodeHtmlEntities(str: string): string {
  if (!str) return "";
  return str
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => {
      try {
        return String.fromCodePoint(parseInt(hex, 16));
      } catch {
        return "";
      }
    })
    .replace(/&#([0-9]+);/g, (_, dec) => {
      try {
        return String.fromCodePoint(parseInt(dec, 10));
      } catch {
        return "";
      }
    })
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#064;/g, "@")
    .replace(/&#x2022;/g, "•")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function enrichPostsAndProfile(
  rawProfile: {
    username: string;
    fullName: string;
    profilePicUrl: string;
    isVerified: boolean;
    biography: string;
    externalUrl?: string;
    followersCount: number;
    followingCount: number;
    mediaCount: number;
  },
  rawPosts: Array<{
    id: string;
    shortcode?: string;
    caption?: string;
    mediaType: "VIDEO" | "IMAGE" | "CAROUSEL_ALBUM";
    thumbnailUrl: string;
    permalink: string;
    likesCount: number;
    commentsCount: number;
    viewsCount?: number;
    timestamp: string;
  }>
): { profile: InstagramTargetProfile; posts: InstagramPostItem[] } {
  const proxiedProfilePic = toProxiedImageUrl(rawProfile.profilePicUrl);

  if (rawPosts.length === 0) {
    return {
      profile: {
        ...rawProfile,
        profilePicUrl: proxiedProfilePic,
        fullName: decodeHtmlEntities(rawProfile.fullName),
        biography: decodeHtmlEntities(rawProfile.biography),
        averageViews: 0,
        averageLikes: 0,
        averageComments: 0,
        averageEngagementRate: 0,
        topOutlierMultiplier: 1,
      },
      posts: [],
    };
  }

  const preparedPosts = rawPosts.map((p) => {
    // Use real viewsCount when provided; if upstream endpoint omits video views (e.g. Meta Graph API),
    // fallback to engagement-derived baseline so outlier ratio remains comparable
    const viewsCount =
      typeof p.viewsCount === "number" && p.viewsCount > 0
        ? p.viewsCount
        : Math.max(
            p.likesCount + p.commentsCount,
            Math.round(p.likesCount * 11.2 + p.commentsCount * 18.5)
          );

    return {
      ...p,
      viewsCount,
    };
  });

  const totalViews = preparedPosts.reduce((acc, p) => acc + p.viewsCount, 0);
  const averageViews = Math.max(1, Math.round(totalViews / preparedPosts.length));
  const averageLikes = Math.round(
    preparedPosts.reduce((acc, p) => acc + p.likesCount, 0) / preparedPosts.length
  );
  const averageComments = Math.round(
    preparedPosts.reduce((acc, p) => acc + p.commentsCount, 0) / preparedPosts.length
  );

  const posts: InstagramPostItem[] = preparedPosts.map((p) => {
    const outlierScore = Number((p.viewsCount / averageViews).toFixed(1));
    const outlierTier =
      outlierScore >= 8
        ? ("super_viral" as const)
        : outlierScore >= 4
        ? ("viral" as const)
        : outlierScore >= 1.8
        ? ("high" as const)
        : ("normal" as const);

    const denominator = p.viewsCount > 0 ? p.viewsCount : Math.max(1, rawProfile.followersCount);
    const engagementRate = Number(
      (((p.likesCount + p.commentsCount) / denominator) * 100).toFixed(2)
    );
    const captionText = decodeHtmlEntities(p.caption || "");
    const firstSentence =
      captionText
        .split("\n")
        .map((line) => line.trim())
        .find((line) => line.length > 0) || captionText.slice(0, 80);

    const proxiedThumb = toProxiedImageUrl(p.thumbnailUrl);

    return {
      id: p.id,
      shortcode: p.shortcode || p.id,
      permalink: p.permalink,
      caption: captionText,
      mediaType: p.mediaType,
      mediaUrl: proxiedThumb,
      thumbnailUrl: proxiedThumb,
      viewsCount: p.viewsCount,
      likesCount: p.likesCount,
      commentsCount: p.commentsCount,
      timestamp: p.timestamp,
      outlierScore,
      outlierTier,
      engagementRate,
      hookText: firstSentence || "Konten visual tanpa teks pembuka",
    };
  });

  const topOutlier = Math.max(...posts.map((p) => p.outlierScore), 1);
  const avgER = Number(
    (((averageLikes + averageComments) / averageViews) * 100).toFixed(2)
  );

  const profile: InstagramTargetProfile = {
    ...rawProfile,
    profilePicUrl: proxiedProfilePic,
    fullName: decodeHtmlEntities(rawProfile.fullName),
    biography: decodeHtmlEntities(rawProfile.biography),
    averageViews,
    averageLikes,
    averageComments,
    averageEngagementRate: avgER,
    topOutlierMultiplier: topOutlier,
  };

  return { profile, posts };
}

// ============================================================================
// LAYER 1: Official Connected Instagram Graph API (For accounts connected in DB)
// ============================================================================
async function fetchDirectInstagramApi(targetUsername: string) {
  try {
    let token = "";

    const connectedAccount = await prisma.instagramAccount.findFirst({
      where: {
        username: { equals: targetUsername, mode: "insensitive" },
        isActive: true,
        accessToken: { not: "" },
      },
      orderBy: { updatedAt: "desc" },
    });

    if (connectedAccount?.accessToken) {
      token = connectedAccount.accessToken;
    }

    if (!token) return null;

    const profileUrl = `https://graph.instagram.com/v22.0/me?fields=id,username,name,account_type,profile_picture_url,biography,website,followers_count,follows_count,media_count&access_token=${encodeURIComponent(
      token
    )}`;
    const mediaUrl = `https://graph.instagram.com/v22.0/me/media?fields=id,shortcode,caption,media_type,media_product_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count&limit=40&access_token=${encodeURIComponent(
      token
    )}`;

    const [profileRes, mediaRes] = await Promise.all([
      fetch(profileUrl, { cache: "no-store" }),
      fetch(mediaUrl, { cache: "no-store" }),
    ]);

    if (!profileRes.ok || !mediaRes.ok) {
      return null;
    }

    const [pData, mData] = await Promise.all([
      profileRes.json(),
      mediaRes.json(),
    ]);

    if (
      pData.username &&
      pData.username.toLowerCase() !== targetUsername.toLowerCase()
    ) {
      return null;
    }

    const mediaList = mData.data || [];
    const rawProfile = {
      username: pData.username || targetUsername,
      fullName: pData.name || pData.username || targetUsername,
      profilePicUrl: pData.profile_picture_url || "",
      isVerified: Boolean((pData.followers_count || 0) > 100000),
      biography: pData.biography || "",
      externalUrl: pData.website || undefined,
      followersCount: pData.followers_count || 0,
      followingCount: pData.follows_count || 0,
      mediaCount: pData.media_count || mediaList.length,
    };

    const rawPosts = mediaList.map((m: any) => ({
      id: m.id,
      shortcode: m.shortcode || m.id,
      caption: m.caption || "",
      mediaType: (m.media_type === "VIDEO" || m.media_product_type === "REELS"
        ? "VIDEO"
        : m.media_type === "CAROUSEL_ALBUM"
        ? "CAROUSEL_ALBUM"
        : "IMAGE") as "VIDEO" | "IMAGE" | "CAROUSEL_ALBUM",
      thumbnailUrl: m.thumbnail_url || m.media_url || "",
      permalink: m.permalink || `https://www.instagram.com/${targetUsername}/`,
      likesCount: m.like_count || 0,
      commentsCount: m.comments_count || 0,
      timestamp: m.timestamp || new Date().toISOString(),
    }));

    return enrichPostsAndProfile(rawProfile, rawPosts);
  } catch (err) {
    console.warn("fetchDirectInstagramApi error:", err);
    return null;
  }
}

// ============================================================================
// LAYER 2: Authenticated Instagram Internal Web API (Using INSTAGRAM_SESSION_ID)
// Fetches 100% REAL Profile, Post Feed, & Reels (including real play_count)
// ============================================================================
function normalizeSessionCookie(rawSession: string): string {
  let clean = rawSession.trim();
  if (clean.startsWith("sessionid=")) {
    clean = clean.replace(/^sessionid=/i, "").split(";")[0].trim();
  }
  return clean;
}

async function fetchFromInstagramWebSession(
  targetUsername: string,
  rawSessionId: string
) {
  if (!rawSessionId) return null;

  const sessionId = normalizeSessionCookie(rawSessionId);
  if (!sessionId) return null;

  const headers: Record<string, string> = {
    "x-ig-app-id": "936619743392459",
    "User-Agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    Accept: "*/*",
    "Accept-Language": "en-US,en;q=0.9,id;q=0.8",
    Referer: `https://www.instagram.com/${targetUsername}/`,
    "X-ASBD-ID": "129477",
    "X-IG-WWW-Claim": "0",
    "X-Requested-With": "XMLHttpRequest",
    Cookie: `sessionid=${sessionId};`,
  };

  try {
    // 1. Fetch web_profile_info (returns full profile + 12 timeline edges)
    const profileUrl = `https://www.instagram.com/api/v1/users/web_profile_info/?username=${encodeURIComponent(
      targetUsername
    )}`;
    const profileRes = await fetch(profileUrl, {
      headers,
      cache: "no-store",
    });

    if (!profileRes.ok) {
      console.warn(
        "fetchFromInstagramWebSession web_profile_info status:",
        profileRes.status
      );
      return null;
    }

    const profileJson = await profileRes.json();
    const user = profileJson?.data?.user;
    if (!user) return null;

    const rawProfile = {
      username: user.username || targetUsername,
      fullName: user.full_name || user.username || targetUsername,
      profilePicUrl: user.profile_pic_url_hd || user.profile_pic_url || "",
      isVerified: Boolean(user.is_verified),
      biography: user.biography || "",
      externalUrl: user.external_url || undefined,
      followersCount: user.edge_followed_by?.count ?? user.follower_count ?? 0,
      followingCount: user.edge_follow?.count ?? user.following_count ?? 0,
      mediaCount:
        user.edge_owner_to_timeline_media?.count ?? user.media_count ?? 0,
    };

    const postMap = new Map<
      string,
      {
        id: string;
        shortcode: string;
        caption: string;
        mediaType: "VIDEO" | "IMAGE" | "CAROUSEL_ALBUM";
        thumbnailUrl: string;
        permalink: string;
        likesCount: number;
        commentsCount: number;
        viewsCount?: number;
        timestamp: string;
      }
    >();

    // Extract posts from web_profile_info timeline edges
    const timelineEdges = [
      ...(user.edge_owner_to_timeline_media?.edges || []),
      ...(user.edge_felix_video_timeline?.edges || []),
    ];

    for (const edge of timelineEdges) {
      const n = edge?.node;
      if (!n) continue;
      const code = n.shortcode || n.code || n.id;
      if (!code) continue;

      const isVideo =
        Boolean(n.is_video) ||
        n.__typename === "GraphVideo" ||
        n.product_type === "clips";
      const isCarousel =
        n.__typename === "GraphSidecar" ||
        n.product_type === "carousel_container";

      const mediaType: "VIDEO" | "IMAGE" | "CAROUSEL_ALBUM" = isVideo
        ? "VIDEO"
        : isCarousel
        ? "CAROUSEL_ALBUM"
        : "IMAGE";

      const caption =
        n.edge_media_to_caption?.edges?.[0]?.node?.text ||
        n.caption?.text ||
        "";

      const likesCount =
        n.edge_liked_by?.count ??
        n.edge_media_preview_like?.count ??
        n.like_count ??
        0;
      const commentsCount =
        n.edge_media_to_comment?.count ?? n.comment_count ?? 0;
      const viewsCount =
        n.video_view_count ?? n.play_count ?? n.view_count ?? undefined;

      postMap.set(code, {
        id: String(n.id || code),
        shortcode: String(code),
        caption,
        mediaType,
        thumbnailUrl: n.display_url || n.thumbnail_src || "",
        permalink: isVideo
          ? `https://www.instagram.com/reel/${code}/`
          : `https://www.instagram.com/p/${code}/`,
        likesCount: Math.max(0, likesCount),
        commentsCount: Math.max(0, commentsCount),
        viewsCount:
          typeof viewsCount === "number" && viewsCount > 0
            ? viewsCount
            : undefined,
        timestamp: n.taken_at_timestamp
          ? new Date(n.taken_at_timestamp * 1000).toISOString()
          : new Date().toISOString(),
      });
    }

    // 2. Also fetch up to 33 feed items + Reels clips endpoint in parallel for richer play_count & more posts
    const feedPromise = fetch(
      `https://www.instagram.com/api/v1/feed/user/${encodeURIComponent(
        targetUsername
      )}/username/?count=33`,
      { headers, cache: "no-store" }
    )
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null);

    const clipsPromise = user.id
      ? fetch("https://www.instagram.com/api/v1/clips/user/", {
          method: "POST",
          headers: {
            ...headers,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            target_user_id: String(user.id),
            page_size: "24",
            include_feed_video: "true",
          }).toString(),
          cache: "no-store",
        })
          .then((r) => (r.ok ? r.json() : null))
          .catch(() => null)
      : Promise.resolve(null);

    const [feedJson, clipsJson] = await Promise.all([feedPromise, clipsPromise]);

    const feedItems = [
      ...(feedJson?.items || []),
      ...((clipsJson?.items || []).map((it: any) => it?.media || it) || []),
    ];

    for (const m of feedItems) {
      if (!m) continue;
      const code = m.code || m.shortcode || m.pk || m.id;
      if (!code) continue;

      const isVideo =
        m.media_type === 2 ||
        m.product_type === "clips" ||
        Boolean(m.play_count) ||
        Boolean(m.video_versions);
      const isCarousel =
        m.media_type === 8 ||
        m.product_type === "carousel_container" ||
        Boolean(m.carousel_media);

      const mediaType: "VIDEO" | "IMAGE" | "CAROUSEL_ALBUM" = isVideo
        ? "VIDEO"
        : isCarousel
        ? "CAROUSEL_ALBUM"
        : "IMAGE";

      const thumb =
        m.image_versions2?.candidates?.[0]?.url ||
        m.carousel_media?.[0]?.image_versions2?.candidates?.[0]?.url ||
        m.display_url ||
        m.thumbnail_url ||
        "";

      const viewsCount =
        m.play_count ?? m.view_count ?? m.video_view_count ?? undefined;
      const likesCount = m.like_count ?? 0;
      const commentsCount = m.comment_count ?? 0;
      const caption =
        typeof m.caption === "string"
          ? m.caption
          : m.caption?.text || "";

      const existing = postMap.get(String(code));
      postMap.set(String(code), {
        id: String(m.pk || m.id || code),
        shortcode: String(code),
        caption: caption || existing?.caption || "",
        mediaType,
        thumbnailUrl: thumb || existing?.thumbnailUrl || "",
        permalink: isVideo
          ? `https://www.instagram.com/reel/${code}/`
          : `https://www.instagram.com/p/${code}/`,
        likesCount: Math.max(0, likesCount || existing?.likesCount || 0),
        commentsCount: Math.max(
          0,
          commentsCount || existing?.commentsCount || 0
        ),
        viewsCount:
          typeof viewsCount === "number" && viewsCount > 0
            ? viewsCount
            : existing?.viewsCount,
        timestamp: m.taken_at
          ? new Date(m.taken_at * 1000).toISOString()
          : existing?.timestamp || new Date().toISOString(),
      });
    }

    const rawPosts = Array.from(postMap.values());
    return enrichPostsAndProfile(rawProfile, rawPosts);
  } catch (err) {
    console.error("fetchFromInstagramWebSession error:", err);
    return null;
  }
}

// ============================================================================
// LAYER 3: Third-party Scraper API (RapidAPI Instagram Scraper)
// ============================================================================
async function fetchFromRapidApiInstagramScraper(
  targetUsername: string,
  apiKey: string,
  host: string
) {
  if (!apiKey) return null;

  try {
    const headers = {
      "x-rapidapi-key": apiKey,
      "x-rapidapi-host": host,
    };

    const [infoRes, postsRes] = await Promise.all([
      fetch(
        `https://${host}/v1/info?username_or_id_or_url=${encodeURIComponent(
          targetUsername
        )}`,
        { headers, cache: "no-store" }
      ).catch(() => null),
      fetch(
        `https://${host}/v1/posts?username_or_id_or_url=${encodeURIComponent(
          targetUsername
        )}`,
        { headers, cache: "no-store" }
      ).catch(() => null),
    ]);

    if (!postsRes || !postsRes.ok) return null;

    const postsJson = await postsRes.json();
    const infoJson = infoRes && infoRes.ok ? await infoRes.json().catch(() => null) : null;

    const items = postsJson?.data?.items || postsJson?.items || [];
    if (!Array.isArray(items) || items.length === 0) return null;

    const userObj =
      infoJson?.data ||
      infoJson?.user ||
      postsJson?.data?.user ||
      items[0]?.user ||
      {};

    const rawProfile = {
      username: userObj.username || targetUsername,
      fullName: userObj.full_name || targetUsername,
      profilePicUrl:
        userObj.hd_profile_pic_url_info?.url ||
        userObj.profile_pic_url_hd ||
        userObj.profile_pic_url ||
        "",
      isVerified: Boolean(userObj.is_verified),
      biography: userObj.biography || "",
      externalUrl: userObj.external_url || undefined,
      followersCount: userObj.follower_count ?? 0,
      followingCount: userObj.following_count ?? 0,
      mediaCount: userObj.media_count ?? items.length,
    };

    const rawPosts = items.map((m: any) => {
      const code = m.code || m.shortcode || m.id;
      const isVideo =
        m.media_type === 2 ||
        m.product_type === "clips" ||
        Boolean(m.play_count) ||
        Boolean(m.video_versions);
      const isCarousel =
        m.media_type === 8 ||
        m.product_type === "carousel_container" ||
        Boolean(m.carousel_media);

      const thumb =
        m.image_versions2?.candidates?.[0]?.url ||
        m.carousel_media?.[0]?.image_versions2?.candidates?.[0]?.url ||
        m.thumbnail_url ||
        m.display_url ||
        "";

      return {
        id: String(m.id || code),
        shortcode: String(code),
        caption:
          typeof m.caption === "string" ? m.caption : m.caption?.text || "",
        mediaType: (isVideo
          ? "VIDEO"
          : isCarousel
          ? "CAROUSEL_ALBUM"
          : "IMAGE") as "VIDEO" | "IMAGE" | "CAROUSEL_ALBUM",
        thumbnailUrl: thumb,
        permalink: isVideo
          ? `https://www.instagram.com/reel/${code}/`
          : `https://www.instagram.com/p/${code}/`,
        likesCount: m.like_count ?? 0,
        commentsCount: m.comment_count ?? 0,
        viewsCount: m.play_count ?? m.view_count ?? undefined,
        timestamp: m.taken_at
          ? new Date(m.taken_at * 1000).toISOString()
          : new Date().toISOString(),
      };
    });

    return enrichPostsAndProfile(rawProfile, rawPosts);
  } catch (err) {
    console.error("fetchFromRapidApiInstagramScraper error:", err);
    return null;
  }
}

// ============================================================================
// LAYER 4: Official Meta Business Discovery API (Graph Facebook Page Token)
// ============================================================================
async function fetchFromMetaBusinessDiscovery(
  targetUsername: string,
  token: string,
  callerIgId: string
): Promise<{
  result: { profile: InstagramTargetProfile; posts: InstagramPostItem[] } | null;
  errorReason?: string;
}> {
  if (!token || !callerIgId) {
    return { result: null };
  }

  try {
    const fields = `business_discovery.username(${targetUsername}){username,name,profile_picture_url,biography,website,followers_count,follows_count,media_count,media.limit(40){id,caption,media_type,media_product_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count}}`;

    const url = `https://graph.facebook.com/v22.0/${callerIgId}?fields=${encodeURIComponent(
      fields
    )}&access_token=${encodeURIComponent(token)}`;

    const res = await fetch(url, { method: "GET", cache: "no-store" });
    if (!res.ok) {
      const errJson = await res.json().catch(() => null);
      const errMsg = errJson?.error?.message || `HTTP ${res.status}`;
      console.warn("Meta Business Discovery error:", res.status, errMsg);
      return { result: null, errorReason: errMsg };
    }

    const data = await res.json();
    const bd = data?.business_discovery;
    if (!bd) return { result: null };

    const rawProfile = {
      username: bd.username || targetUsername,
      fullName: bd.name || bd.username || targetUsername,
      profilePicUrl: bd.profile_picture_url || "",
      isVerified: Boolean((bd.followers_count || 0) > 100000),
      biography: bd.biography || "",
      externalUrl: bd.website || undefined,
      followersCount: bd.followers_count || 0,
      followingCount: bd.follows_count || 0,
      mediaCount: bd.media_count || 0,
    };

    const mediaList = bd.media?.data || [];
    const rawPosts = mediaList.map((m: any) => ({
      id: m.id,
      shortcode: m.id,
      caption: m.caption || "",
      mediaType: (m.media_type === "VIDEO" || m.media_product_type === "REELS"
        ? "VIDEO"
        : m.media_type === "CAROUSEL_ALBUM"
        ? "CAROUSEL_ALBUM"
        : "IMAGE") as "VIDEO" | "IMAGE" | "CAROUSEL_ALBUM",
      thumbnailUrl: m.thumbnail_url || m.media_url || "",
      permalink: m.permalink || `https://www.instagram.com/${targetUsername}/`,
      likesCount: m.like_count || 0,
      commentsCount: m.comments_count || 0,
      timestamp: m.timestamp || new Date().toISOString(),
    }));

    return { result: enrichPostsAndProfile(rawProfile, rawPosts) };
  } catch (err: any) {
    console.error("fetchFromMetaBusinessDiscovery error:", err);
    return { result: null, errorReason: err?.message };
  }
}

// ============================================================================
// LAYER 5: Real Public Profile Header Extractor (Unauthenticated Meta OG Tags)
// Extracts 100% REAL Profile Picture, Followers, Following, Posts Count, & Bio
// NEVER invents fake posts or Unsplash images!
// ============================================================================
async function fetchLiveInstagramPublicHeader(
  targetUsername: string
): Promise<InstagramTargetProfile | null> {
  try {
    const cleanUser = targetUsername.toLowerCase().trim().replace(/^@/, "");
    const userAgents = [
      "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
      "Twitterbot/1.0",
      "TelegramBot (like TwitterBot)",
    ];

    for (const ua of userAgents) {
      try {
        const res = await fetch(
          `https://www.instagram.com/${encodeURIComponent(cleanUser)}/`,
          {
            headers: {
              "User-Agent": ua,
              Accept:
                "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
              "Accept-Language": "en-US,en;q=0.9",
            },
            cache: "no-store",
          }
        );

        if (!res.ok) continue;
        const html = await res.text();

        const ogTitle = html.match(
          /<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i
        )?.[1];
        const ogImage = html.match(
          /<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i
        )?.[1];
        const ogDesc = html.match(
          /<meta\s+property=["']og:description["']\s+content=["']([^"']+)["']/i
        )?.[1];
        const nameDesc =
          html.match(
            /<meta\s+content=["']([\s\S]*?)["']\s+name=["']description["']/i
          )?.[1] ||
          html.match(
            /<meta\s+name=["']description["']\s+content=["']([\s\S]*?)["']/i
          )?.[1];

        const fullDesc = ogDesc || nameDesc || "";
        const followersMatch = fullDesc.match(/([\d\.,\w]+)\s+Followers/i);
        const followingMatch = fullDesc.match(/([\d\.,\w]+)\s+Following/i);
        const postsMatch = fullDesc.match(/([\d\.,\w]+)\s+Posts/i);

        if (followersMatch && ogTitle && ogTitle.includes("(")) {
          const parseCount = (str: string): number => {
            const clean = str.replace(/,/g, "").trim().toUpperCase();
            if (clean.endsWith("M"))
              return Math.round(parseFloat(clean) * 1_000_000);
            if (clean.endsWith("K"))
              return Math.round(parseFloat(clean) * 1_000);
            return parseInt(clean, 10) || 0;
          };

          const followersCount = parseCount(followersMatch[1]);
          const followingCount = followingMatch
            ? parseCount(followingMatch[1])
            : 0;
          const mediaCount = postsMatch ? parseCount(postsMatch[1]) : 0;

          let fullName = cleanUser;
          const nameMatch = ogTitle.match(/^([^\(]+)\s*\((?:@|&#064;)/);
          if (nameMatch) {
            fullName = decodeHtmlEntities(nameMatch[1]).trim();
          }

          let biography = "";
          const bioSplit = (nameDesc || ogDesc || "").split(
            /on Instagram:\s*(?:&quot;|["'])?/i
          );
          if (bioSplit[1]) {
            biography = decodeHtmlEntities(
              bioSplit[1].replace(/(?:&quot;|["'])\s*$/, "")
            ).trim();
          }

          const rawProfile = {
            username: cleanUser,
            fullName: fullName || cleanUser,
            profilePicUrl: ogImage ? ogImage.replace(/&amp;/g, "&") : "",
            isVerified: followersCount > 100000,
            biography,
            externalUrl: `https://www.instagram.com/${cleanUser}/`,
            followersCount,
            followingCount,
            mediaCount,
          };

          return enrichPostsAndProfile(rawProfile, []).profile;
        }
      } catch {
        // try next UA
      }
    }
    return null;
  } catch (err) {
    console.error("fetchLiveInstagramPublicHeader error:", err);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify PRO or Admin access on server
    const isAdminEmail =
      session.user.email?.toLowerCase() === "anggasrimugiarahayu@gmail.com";
    let hasAccess = isAdminEmail;
    if (!hasAccess) {
      const dbUser = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          role: true,
          proToolsExpiredAt: true,
          proAutomationExpiredAt: true,
        },
      });
      const now = new Date();
      hasAccess = Boolean(
        dbUser?.role === "ADMIN" ||
          dbUser?.role === "PRO" ||
          (dbUser?.proToolsExpiredAt && new Date(dbUser.proToolsExpiredAt) > now) ||
          (dbUser?.proAutomationExpiredAt &&
            new Date(dbUser.proAutomationExpiredAt) > now)
      );
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
    const rawUsername = body.username;
    const forceRefresh = Boolean(body.forceRefresh);

    if (!rawUsername || typeof rawUsername !== "string" || !rawUsername.trim()) {
      return NextResponse.json(
        { error: "Username Instagram wajib diisi" },
        { status: 400 }
      );
    }

    const cleanUsername = rawUsername
      .trim()
      .replace(/^@/, "")
      .replace(/^https?:\/\/(www\.)?instagram\.com\//i, "")
      .split("/")[0]
      .split("?")[0]
      .toLowerCase();

    // Check memory cache first unless forceRefresh is requested
    if (!forceRefresh) {
      const cached = risetMemoryCache.get(cleanUsername);
      if (cached && cached.expiresAt > Date.now() && cached.posts.length > 0) {
        return NextResponse.json({
          success: true,
          source: cached.source,
          cached: true,
          profile: cached.profile,
          posts: cached.posts,
        });
      }
    }

    const cfg = await getResolvedRisetConfig();

    // 1. Direct Instagram Graph API (for accounts connected in our DB, e.g. @ruangngontenmuslim)
    const directData = await fetchDirectInstagramApi(cleanUsername);
    if (directData && directData.posts.length > 0) {
      risetMemoryCache.set(cleanUsername, {
        expiresAt: Date.now() + RISET_CACHE_TTL_MS,
        source: "instagram_direct_api",
        profile: directData.profile,
        posts: directData.posts,
      });
      return NextResponse.json({
        success: true,
        source: "instagram_direct_api",
        profile: directData.profile,
        posts: directData.posts,
      });
    }

    // 2. Authenticated Instagram Internal Web API via INSTAGRAM_SESSION_ID (100% Real Profile + Feed + Reels + Views)
    if (cfg.instagramSessionId) {
      const sessionData = await fetchFromInstagramWebSession(
        cleanUsername,
        cfg.instagramSessionId
      );
      if (sessionData && sessionData.posts.length > 0) {
        risetMemoryCache.set(cleanUsername, {
          expiresAt: Date.now() + RISET_CACHE_TTL_MS,
          source: "instagram_web_session",
          profile: sessionData.profile,
          posts: sessionData.posts,
        });
        return NextResponse.json({
          success: true,
          source: "instagram_web_session",
          profile: sessionData.profile,
          posts: sessionData.posts,
        });
      }
    }

    // 3. RapidAPI Instagram Scraper (Production SaaS Scraper)
    if (cfg.rapidApiKey) {
      const rapidData = await fetchFromRapidApiInstagramScraper(
        cleanUsername,
        cfg.rapidApiKey,
        cfg.rapidApiHost
      );
      if (rapidData && rapidData.posts.length > 0) {
        risetMemoryCache.set(cleanUsername, {
          expiresAt: Date.now() + RISET_CACHE_TTL_MS,
          source: "rapidapi_live_scraper",
          profile: rapidData.profile,
          posts: rapidData.posts,
        });
        return NextResponse.json({
          success: true,
          source: "rapidapi_live_scraper",
          profile: rapidData.profile,
          posts: rapidData.posts,
        });
      }
    }

    // 4. Official Meta Business Discovery API
    const metaAttempt = await fetchFromMetaBusinessDiscovery(
      cleanUsername,
      cfg.metaPageAccessToken,
      cfg.instagramBusinessAccountId
    );
    if (metaAttempt.result && metaAttempt.result.posts.length > 0) {
      risetMemoryCache.set(cleanUsername, {
        expiresAt: Date.now() + RISET_CACHE_TTL_MS,
        source: "meta_business_discovery",
        profile: metaAttempt.result.profile,
        posts: metaAttempt.result.posts,
      });
      return NextResponse.json({
        success: true,
        source: "meta_business_discovery",
        profile: metaAttempt.result.profile,
        posts: metaAttempt.result.posts,
      });
    }

    // 5. Real Public Profile Header (No fake posts!)
    const publicProfile = await fetchLiveInstagramPublicHeader(cleanUsername);
    if (publicProfile) {
      const missingCredentials =
        !cfg.instagramSessionId && !cfg.rapidApiKey;
      const reason = missingCredentials
        ? "Profil asli berhasil diambil dari Instagram, namun pengambilan daftar Post Feed & Reels memerlukan koneksi Instagram Session ID atau RapidAPI Key pada menu Koneksi API Riset."
        : metaAttempt.errorReason
        ? `Profil asli berhasil ditemukan, namun pengambilan Feed & Reels gagal (Pastikan Instagram Session ID / RapidAPI Key masih aktif. Detail Meta: ${metaAttempt.errorReason}).`
        : "Profil asli berhasil ditemukan, namun daftar postingan tidak dapat diakses (akun mungkin bersifat Privat, belum memiliki postingan, atau sesi scraper perlu diperbarui).";

      return NextResponse.json({
        success: true,
        source: "instagram_public_header_only",
        feedUnavailableReason: reason,
        requiresConfig: true,
        profile: publicProfile,
        posts: [],
      });
    }

    return NextResponse.json(
      {
        error: `Akun @${cleanUsername} tidak ditemukan di Instagram atau bersifat Privat.`,
      },
      { status: 404 }
    );
  } catch (error: any) {
    console.error("Error in /api/ruang-riset/instagram:", error);
    return NextResponse.json(
      { error: error?.message || "Terjadi kesalahan saat memproses riset akun" },
      { status: 500 }
    );
  }
}
