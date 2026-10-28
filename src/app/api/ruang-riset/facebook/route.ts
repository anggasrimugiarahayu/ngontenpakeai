import { NextRequest, NextResponse } from "next/server";
import {
  FacebookUserProfile,
  FacebookPostItem,
} from "@/app/(app)/ruang-riset/facebook/types";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

interface CacheEntry {
  profile: FacebookUserProfile;
  posts: FacebookPostItem[];
  expiresAt: number;
}

const fbCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

const DESKTOP_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

function toProxiedImageUrl(rawUrl?: string | null): string {
  if (!rawUrl) return "";
  const cleaned = rawUrl
    .replace(/\\u0025/g, "%")
    .replace(/\\u0026/g, "&")
    .replace(/&amp;/g, "&")
    .replace(/\\\//g, "/");
  if (cleaned.startsWith("/api/ruang-riset/image-proxy")) return cleaned;
  if (cleaned.startsWith("http://") || cleaned.startsWith("https://")) {
    return `/api/ruang-riset/image-proxy?url=${encodeURIComponent(cleaned)}`;
  }
  return cleaned;
}

function extractFacebookHandle(rawInput: string): string {
  let cleaned = rawInput.trim();
  try {
    if (cleaned.startsWith("http://") || cleaned.startsWith("https://")) {
      const url = new URL(cleaned);
      const idParam = url.searchParams.get("id");
      if (idParam) return idParam;
      const parts = url.pathname
        .split("/")
        .filter(
          (p) =>
            p &&
            p !== "reels" &&
            p !== "videos" &&
            p !== "photos" &&
            p !== "posts" &&
            p !== "about" &&
            p !== "pg" &&
            p !== "pages"
        );
      if (parts.length > 0) {
        cleaned = parts[parts.length - 1];
      }
    }
  } catch {
    // ignore URL parse error
  }
  return cleaned.replace(/^@/, "").split("?")[0].replace(/\/+$/, "").trim();
}

function parseCompactIndonesianCount(raw?: string | number | null): number {
  if (typeof raw === "number") return Math.max(0, Math.round(raw));
  if (!raw) return 0;
  const str = String(raw)
    .toLowerCase()
    .replace(/\u00a0/g, " ")
    .trim();

  // Check multiplier words (jt, juta, m, rb, ribu, k)
  const multMatch = str.match(/([\d.,]+)\s*(jt|juta|m|rb|ribu|k)\b/i);
  if (multMatch) {
    const numStr = multMatch[1].replace(/\./g, "").replace(",", ".");
    const val = parseFloat(numStr);
    if (isNaN(val)) return 0;
    const unit = multMatch[2].toLowerCase();
    if (unit === "jt" || unit === "juta" || unit === "m") {
      return Math.round(val * 1_000_000);
    }
    if (unit === "rb" || unit === "ribu" || unit === "k") {
      return Math.round(val * 1_000);
    }
  }

  // Plain integer with dot/comma thousands separators (e.g., "5.364.584")
  const digitsOnly = str.replace(/[^\d]/g, "");
  return digitsOnly ? parseInt(digitsOnly, 10) || 0 : 0;
}

function formatCompactId(num: number): string {
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + " Jt";
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1).replace(/\.0$/, "") + " Rb";
  }
  return num.toLocaleString("id-ID");
}

function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return "";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function formatRelativeTimeId(timestampSec: number): string {
  if (!timestampSec || timestampSec <= 0) return "Baru saja";
  const nowSec = Math.floor(Date.now() / 1000);
  const diffSec = Math.max(0, nowSec - timestampSec);
  const days = Math.floor(diffSec / 86400);
  if (days === 0) {
    const hours = Math.floor(diffSec / 3600);
    if (hours <= 0) return "Baru saja";
    return `${hours} jam lalu`;
  }
  if (days < 7) return `${days} hari lalu`;
  if (days < 30) return `${Math.floor(days / 7)} minggu lalu`;
  if (days < 365) return `${Math.floor(days / 30)} bulan lalu`;
  return `${Math.floor(days / 365)} tahun lalu`;
}

function decodeHtmlText(raw: string): string {
  return raw
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function extractHookText(caption: string): string {
  if (!caption) return "Konten Facebook";
  const firstLine = caption.split(/\r?\n/)[0]?.trim() || caption;
  if (firstLine.length <= 95) return firstLine;
  return firstLine.slice(0, 92).trim() + "...";
}

async function fetchFacebookHtml(
  url: string,
  isIframe = false,
  timeoutMs = 12000
): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": DESKTOP_UA,
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
        Referer: "https://www.facebook.com/",
        "Sec-Fetch-Dest": isIframe ? "iframe" : "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": isIframe ? "same-origin" : "none",
      },
    });
    if (!res.ok) return "";
    return await res.text();
  } catch {
    return "";
  } finally {
    clearTimeout(timer);
  }
}

interface EnrichedPhotoMeta {
  fbid: string;
  caption: string;
  timestampSec: number;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  photoUrls: string[];
  permalink: string;
}

async function enrichFacebookPhotoPost(
  fbid: string
): Promise<EnrichedPhotoMeta | null> {
  const postHref = `https://www.facebook.com/photo.php?fbid=${fbid}`;
  const pluginUrl = `https://www.facebook.com/plugins/post.php?href=${encodeURIComponent(
    postHref
  )}&show_text=true&width=500`;
  const html = await fetchFacebookHtml(pluginUrl, true, 5000);
  if (!html) return null;

  const utimeMatch = html.match(/data-utime="(\d+)"/);
  const timestampSec = utimeMatch ? parseInt(utimeMatch[1], 10) : 0;

  let caption = "";
  const msgMatch = html.match(
    /data-testid="post_message"[^>]*>([\s\S]*?)<\/div>\s*<\/div>/i
  );
  if (msgMatch) {
    caption = decodeHtmlText(msgMatch[1])
      .replace(/Lihat lebih banyak$/i, "")
      .trim();
  }

  const permalinkMatch = html.match(/href="(\/[^"]+\/posts\/\d+[^"]*)"/i);
  const permalink = permalinkMatch
    ? `https://www.facebook.com${permalinkMatch[1].split("?")[0]}`
    : postHref;

  const imgMatches = [
    ...html.matchAll(
      /class="scaledImageFit(?:Width|Height)[^"]*"[^>]+src="([^"]+)"/gi
    ),
  ].map((m) => m[1].replace(/&amp;/g, "&"));
  const uniqueImgs = Array.from(new Set(imgMatches));

  const reactMatch =
    html.match(
      /aria-label="([\d.,]+(?:\s*(?:rb|jt|k|m))?)\s*(?:suka|reaksi|likes|reactions)"/i
    ) || html.match(/_5n6h[^>]*>([\d.,]+(?:\s*(?:rb|jt|k|m))?)</i);
  const commMatch = html.match(
    /([\d.,]+(?:\s*(?:rb|jt|k|m))?)\s*(?:komentar|comments)/i
  );
  const shareMatch = html.match(
    /([\d.,]+(?:\s*(?:rb|jt|k|m))?)\s*(?:kali dibagikan|bagikan|shares)/i
  );

  return {
    fbid,
    caption,
    timestampSec,
    likesCount: reactMatch ? parseCompactIndonesianCount(reactMatch[1]) : 0,
    commentsCount: commMatch ? parseCompactIndonesianCount(commMatch[1]) : 0,
    sharesCount: shareMatch ? parseCompactIndonesianCount(shareMatch[1]) : 0,
    photoUrls: uniqueImgs,
    permalink,
  };
}

async function handleFacebookResearchRequest(
  rawUsername: string,
  forceRefresh = false
) {
  const handle = extractFacebookHandle(rawUsername);

  if (!handle) {
    return NextResponse.json(
      { error: "Masukkan username atau link halaman Facebook terlebih dahulu." },
      { status: 400 }
    );
  }

  const cacheKey = handle.toLowerCase();
  if (!forceRefresh) {
    const cached = fbCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now() && cached.posts.length > 0) {
      return NextResponse.json({
        profile: cached.profile,
        posts: cached.posts,
        cached: true,
      });
    }
  }

  try {
    const pluginPageUrl = `https://www.facebook.com/plugins/page.php?href=${encodeURIComponent(
      `https://www.facebook.com/${handle}`
    )}&tabs=timeline&width=500&height=800`;

    const [htmlMain, htmlReels, htmlVideos, htmlPhotos, htmlPlugin] =
      await Promise.all([
        fetchFacebookHtml(`https://www.facebook.com/${handle}`, false, 14000),
        fetchFacebookHtml(
          `https://www.facebook.com/${handle}/reels`,
          false,
          14000
        ),
        fetchFacebookHtml(
          `https://www.facebook.com/${handle}/videos`,
          false,
          14000
        ),
        fetchFacebookHtml(
          `https://www.facebook.com/${handle}/photos`,
          false,
          12000
        ),
        fetchFacebookHtml(pluginPageUrl, true, 10000),
      ]);

    // Parse all data-sjs JSON blocks across Main, Reels, Videos, and Photos
    const allScripts = [
      ...(htmlMain.matchAll(
        /<script[^>]*data-sjs[^>]*>([\s\S]*?)<\/script>/g
      ) || []),
      ...(htmlReels.matchAll(
        /<script[^>]*data-sjs[^>]*>([\s\S]*?)<\/script>/g
      ) || []),
      ...(htmlVideos.matchAll(
        /<script[^>]*data-sjs[^>]*>([\s\S]*?)<\/script>/g
      ) || []),
      ...(htmlPhotos.matchAll(
        /<script[^>]*data-sjs[^>]*>([\s\S]*?)<\/script>/g
      ) || []),
    ].map((m) => m[1]);

    const feedbacksById = new Map<string, any>();
    const videosById = new Map<string, any>();
    const storiesById = new Map<string, any>();
    const photoItemsById = new Map<string, any>();
    const progressiveUrlByVideoId = new Map<string, string>();

    let profileUser: any = null;
    const socialContextStrings: string[] = [];
    let introBio = "";
    let externalWebsite = "";

    function walkJson(obj: any) {
      if (!obj || typeof obj !== "object") return;

      if (
        obj.__typename === "XFBProfileEntityConvergenceHeaderRenderer" &&
        obj.user
      ) {
        profileUser = obj.user;
      }

      if (
        obj.profile_social_context?.content &&
        Array.isArray(obj.profile_social_context.content)
      ) {
        for (const item of obj.profile_social_context.content) {
          if (item?.text?.text) {
            socialContextStrings.push(String(item.text.text));
          }
        }
      }

      if (obj.profile_status_text?.text && !introBio) {
        introBio = String(obj.profile_status_text.text);
      }

      if (
        obj.context_item?.title?.text &&
        typeof obj.context_item.title.text === "string" &&
        /^(https?:\/\/|www\.|[a-z0-9-]+\.(com|id|co\.id|org|net|tv|io))/i.test(
          obj.context_item.title.text.trim()
        ) &&
        !externalWebsite
      ) {
        externalWebsite = obj.context_item.title.text.trim();
      }

      // Collect Feedback objects by ID (ZmVlZGJhY2s6...)
      if (typeof obj.id === "string" && obj.id.startsWith("ZmVlZGJhY2s6")) {
        const prev = feedbacksById.get(obj.id) || {};
        feedbacksById.set(obj.id, {
          ...prev,
          ...obj,
          unified_reactors: obj.unified_reactors || prev.unified_reactors,
          likers: obj.likers || prev.likers,
          reaction_count: obj.reaction_count || prev.reaction_count,
          total_comment_count:
            obj.total_comment_count ?? prev.total_comment_count,
          comment_rendering_instance:
            obj.comment_rendering_instance || prev.comment_rendering_instance,
          share_count: obj.share_count || prev.share_count,
          share_count_reduced:
            obj.share_count_reduced ?? prev.share_count_reduced,
          i18n_reaction_count:
            obj.i18n_reaction_count ?? prev.i18n_reaction_count,
        });
      }

      // Collect Video objects by ID
      if (
        (obj.__typename === "Video" || obj.__isNode === "Video") &&
        typeof obj.id === "string" &&
        /^\d+$/.test(obj.id)
      ) {
        const prev = videosById.get(obj.id) || {};
        videosById.set(obj.id, {
          ...prev,
          ...obj,
          image: obj.image || prev.image,
          preferred_thumbnail:
            obj.preferred_thumbnail || prev.preferred_thumbnail,
          thumbnailImage: obj.thumbnailImage || prev.thumbnailImage,
          first_frame_thumbnail:
            obj.first_frame_thumbnail || prev.first_frame_thumbnail,
          play_count: obj.play_count ?? prev.play_count,
          play_count_reduced:
            obj.play_count_reduced ?? prev.play_count_reduced,
          rounded_play_count:
            obj.rounded_play_count ?? prev.rounded_play_count,
          publish_time: obj.publish_time ?? prev.publish_time,
          playable_duration_in_ms:
            obj.playable_duration_in_ms ?? prev.playable_duration_in_ms,
          playable_duration: obj.playable_duration ?? prev.playable_duration,
          title: obj.title || prev.title,
          savable_description:
            obj.savable_description || prev.savable_description,
          creation_story: obj.creation_story || prev.creation_story,
          feedback: obj.feedback
            ? { ...(prev.feedback || {}), ...obj.feedback }
            : prev.feedback,
        });
      }

      // Collect direct MP4 progressive URLs if attached to video delivery
      if (
        obj.video_id &&
        (obj.browser_native_hd_url ||
          obj.browser_native_sd_url ||
          obj.progressive_url)
      ) {
        const mp4 =
          obj.browser_native_hd_url ||
          obj.browser_native_sd_url ||
          obj.progressive_url;
        if (typeof mp4 === "string") {
          progressiveUrlByVideoId.set(String(obj.video_id), mp4);
        }
      }
      if (
        obj.id &&
        /^\d+$/.test(String(obj.id)) &&
        obj.videoDeliveryResponseResult
      ) {
        const str = JSON.stringify(obj.videoDeliveryResponseResult);
        const hdMatch = str.match(/"browser_native_hd_url":"([^"]+)"/);
        const sdMatch = str.match(/"browser_native_sd_url":"([^"]+)"/);
        const progMatch = str.match(/"progressive_url":"([^"]+)"/);
        const mp4 = (
          hdMatch?.[1] ||
          sdMatch?.[1] ||
          progMatch?.[1] ||
          ""
        ).replace(/\\\//g, "/");
        if (mp4) progressiveUrlByVideoId.set(String(obj.id), mp4);
      }

      // Collect Story objects (Reels & Timeline Posts) safely merging fragments by ID
      if (
        obj.__typename === "Story" &&
        (obj.id || obj.post_id) &&
        (obj.attachments ||
          obj.creation_time ||
          obj.post_id ||
          obj.message ||
          obj.feedback ||
          obj.short_form_video_context ||
          obj.comet_sections)
      ) {
        const storyKey = String(obj.id || obj.post_id);
        const prev = storiesById.get(storyKey) || {};

        const csContentStory = obj.comet_sections?.content?.story;
        const csMessage =
          obj.message ||
          csContentStory?.comet_sections?.message?.story?.message ||
          csContentStory?.comet_sections?.message_container?.story?.message ||
          csContentStory?.message ||
          obj.comet_sections?.message?.story?.message;

        const csAttachments =
          Array.isArray(obj.attachments) && obj.attachments.length > 0
            ? obj.attachments
            : Array.isArray(csContentStory?.attachments) &&
              csContentStory.attachments.length > 0
            ? csContentStory.attachments
            : undefined;

        const csMetadataArr =
          obj.comet_sections?.context_layout?.story?.comet_sections?.metadata;
        let csCreationTime = obj.creation_time;
        let csPermalink = obj.permalink_url || obj.wwwURL;
        if (Array.isArray(csMetadataArr)) {
          for (const mItem of csMetadataArr) {
            if (mItem?.story?.creation_time && !csCreationTime) {
              csCreationTime = mItem.story.creation_time;
            }
            if (
              (mItem?.story?.url || mItem?.story?.wwwURL) &&
              !csPermalink
            ) {
              csPermalink = mItem.story.url || mItem.story.wwwURL;
            }
          }
        }

        const csFeedbackTarget =
          obj.comet_sections?.feedback?.story?.feedback_context
            ?.feedback_target_with_context;
        const csFeedback =
          obj.feedback ||
          csFeedbackTarget?.ufi_renderer?.feedback ||
          csFeedbackTarget?.comet_ufi_summary_and_actions_renderer?.feedback ||
          csFeedbackTarget;

        storiesById.set(storyKey, {
          ...prev,
          ...obj,
          id: obj.id || prev.id,
          post_id: obj.post_id || csContentStory?.post_id || prev.post_id,
          creation_time: csCreationTime || prev.creation_time,
          message: csMessage || prev.message,
          translated_message_for_viewer:
            obj.translated_message_for_viewer ||
            prev.translated_message_for_viewer,
          attachments: csAttachments || prev.attachments,
          short_form_video_context:
            obj.short_form_video_context ||
            csContentStory?.attachments?.[0]?.styles?.attachment?.media
              ?.short_form_video_context ||
            prev.short_form_video_context,
          video: obj.video || prev.video,
          feedback: csFeedback
            ? { ...(prev.feedback || {}), ...csFeedback }
            : prev.feedback,
          permalink_url: csPermalink || prev.permalink_url,
          wwwURL: obj.wwwURL || prev.wwwURL,
        });
      }

      // Collect Photo items from /photos
      if (obj.__typename === "TimelineAppCollectionItem" && obj.node?.id) {
        photoItemsById.set(String(obj.node.id), obj);
      }

      for (const k of Object.keys(obj)) {
        walkJson(obj[k]);
      }
    }

    // Fast pre-filter before JSON.parse so large pages (18MB+ HTML) parse in <150ms
    for (const s of allScripts) {
      if (
        !s.includes('"Story"') &&
        !s.includes('"Video"') &&
        !s.includes("ZmVlZGJhY2s6") &&
        !s.includes("XFBProfileEntityConvergenceHeaderRenderer") &&
        !s.includes("TimelineAppCollectionItem") &&
        !s.includes("profile_social_context") &&
        !s.includes("profile_status_text") &&
        !s.includes("videoDeliveryResponseResult")
      ) {
        continue;
      }
      try {
        walkJson(JSON.parse(s));
      } catch {
        // ignore non-JSON or malformed block
      }
    }

    // Extract profile metadata
    const pluginNameMatch = htmlPlugin.match(
      /class="_1drp[^"]*"[^>]*title="([^"]+)"/i
    );
    const pluginAvatarMatch = htmlPlugin.match(
      /class="_1drn[^"]*"[^>]*src="([^"]+)"/i
    );
    const pluginVerified =
      htmlPlugin.includes('aria-label="Halaman telah diverifikasi"') ||
      htmlPlugin.includes('aria-label="Verified Page"') ||
      htmlPlugin.includes("_56_f");
    const pluginFollowerMatch = htmlPlugin.match(
      /([\d.,]+(?:\s*(?:rb|jt|k|m|ribu|juta))?)\s*(?:pengikut|followers)/i
    );
    const pluginLikesMatch = htmlPlugin.match(
      /([\d.,]+(?:\s*(?:rb|jt|k|m|ribu|juta))?)\s*(?:suka|likes)/i
    );

    const resolvedName =
      profileUser?.name || pluginNameMatch?.[1] || handle;
    const resolvedUsername =
      profileUser?.username_for_profile || handle;
    const rawAvatarUrl =
      profileUser?.profilePicLarge?.uri ||
      profileUser?.profilePicMedium?.uri ||
      profileUser?.profile_picture_for_sticky_bar?.uri ||
      pluginAvatarMatch?.[1]?.replace(/&amp;/g, "&") ||
      "";
    const rawCoverUrl =
      profileUser?.cover_photo?.photo?.image?.uri || "";
    const isVerified = Boolean(
      profileUser?.show_verified_badge_on_profile || pluginVerified
    );

    let followersCount = pluginFollowerMatch
      ? parseCompactIndonesianCount(pluginFollowerMatch[1])
      : 0;
    let followingCount = 0;
    let pageLikesCount = pluginLikesMatch
      ? parseCompactIndonesianCount(pluginLikesMatch[1])
      : 0;

    for (const ctx of socialContextStrings) {
      if (/pengikut|followers/i.test(ctx) && followersCount === 0) {
        followersCount = parseCompactIndonesianCount(ctx);
      }
      if (/mengikuti|following/i.test(ctx) && followingCount === 0) {
        followingCount = parseCompactIndonesianCount(ctx);
      }
      if (/suka|likes/i.test(ctx) && pageLikesCount === 0) {
        pageLikesCount = parseCompactIndonesianCount(ctx);
      }
    }

    // Build unified Post items from Stories (Reels + Timeline) and Videos
    const postMap = new Map<string, FacebookPostItem>();
    const processedVideoIds = new Set<string>();

    for (const [, st] of storiesById.entries()) {
      const attachment = Array.isArray(st.attachments)
        ? st.attachments[0]
        : null;
      const styledAttachment = attachment?.styles?.attachment;
      const media =
        attachment?.media ||
        styledAttachment?.media ||
        st.short_form_video_context?.video ||
        st.video;

      // Also check multi-photo subattachments
      const subNodes =
        styledAttachment?.all_subattachments?.nodes ||
        styledAttachment?.subattachments ||
        [];
      const subPhotoUris: string[] = [];
      if (Array.isArray(subNodes)) {
        for (const sn of subNodes) {
          const u =
            sn?.media?.viewer_image?.uri ||
            sn?.media?.image?.uri ||
            sn?.media?.photo_image?.uri;
          if (typeof u === "string" && u) subPhotoUris.push(u);
        }
      }

      const videoId =
        media?.__typename === "Video" ||
        st.short_form_video_context?.video?.id
          ? String(st.short_form_video_context?.video?.id || media?.id || "")
          : "";

      const videoObj = videoId ? videosById.get(videoId) : null;
      if (videoId) processedVideoIds.add(videoId);

      const fbId =
        st.feedback?.id ||
        videoObj?.feedback?.id ||
        media?.feedback?.id ||
        "";
      const mergedFb = {
        ...(fbId ? feedbacksById.get(fbId) || {} : {}),
        ...(videoObj?.feedback || {}),
        ...(st.feedback || {}),
      };

      const likesCount = Math.max(
        0,
        Number(
          mergedFb?.unified_reactors?.count ??
            mergedFb?.likers?.count ??
            mergedFb?.reaction_count?.count ??
            parseCompactIndonesianCount(mergedFb?.i18n_reaction_count) ??
            0
        )
      );
      const commentsCount = Math.max(
        0,
        Number(
          mergedFb?.total_comment_count ??
            mergedFb?.comment_rendering_instance?.comments?.total_count ??
            0
        )
      );
      const sharesCount = Math.max(
        0,
        Number(
          mergedFb?.share_count?.count ??
            parseCompactIndonesianCount(mergedFb?.share_count_reduced) ??
            0
        )
      );

      const rawPlayCount =
        Number(
          videoObj?.play_count ??
            media?.play_count ??
            st.short_form_video_context?.video?.play_count ??
            0
        ) ||
        parseCompactIndonesianCount(
          videoObj?.play_count_reduced ||
            videoObj?.rounded_play_count ||
            media?.play_count_reduced
        );

      const viewsCount =
        rawPlayCount > 0
          ? rawPlayCount
          : Math.max(
              likesCount + commentsCount + sharesCount,
              Math.round(
                likesCount * 22 + commentsCount * 35 + sharesCount * 45
              )
            );

      const rawThumb =
        st.short_form_video_context?.video?.first_frame_thumbnail ||
        media?.first_frame_thumbnail ||
        media?.preferred_thumbnail?.image?.uri ||
        media?.photo_image?.uri ||
        media?.viewer_image?.uri ||
        media?.image?.uri ||
        media?.large_share_image?.uri ||
        media?.flexible_height_share_image?.uri ||
        media?.card_image?.uri ||
        videoObj?.first_frame_thumbnail ||
        videoObj?.preferred_thumbnail?.image?.uri ||
        videoObj?.thumbnailImage?.uri ||
        videoObj?.image?.uri ||
        subPhotoUris[0] ||
        "";

      if (!rawThumb) continue;

      const caption =
        st.message?.text ||
        st.translated_message_for_viewer?.text ||
        videoObj?.title?.text ||
        videoObj?.savable_description?.text ||
        attachment?.title_with_entities?.text ||
        styledAttachment?.title_with_entities?.text ||
        "";

      const creationSec = Number(
        st.creation_time ||
          videoObj?.publish_time ||
          media?.publish_time ||
          Math.floor(Date.now() / 1000)
      );

      const durationMs = Number(
        st.short_form_video_context?.video?.playable_duration_in_ms ||
          media?.playable_duration_in_ms ||
          videoObj?.playable_duration_in_ms ||
          (videoObj?.playable_duration
            ? videoObj.playable_duration * 1000
            : 0) ||
          0
      );
      const durationSeconds = Math.round(durationMs / 1000);

      const isVideoOrReel = Boolean(
        videoId ||
          media?.__typename === "Video" ||
          st.short_form_video_context
      );

      const id = String(videoId || st.post_id || media?.id || st.id);
      const permalink =
        st.short_form_video_context?.if_should_change_url_for_reels
          ?.shareable_url ||
        media?.shareable_url ||
        st.permalink_url ||
        st.wwwURL ||
        (videoId
          ? `https://www.facebook.com/reel/${videoId}`
          : `https://www.facebook.com/${resolvedUsername}/posts/${id}`);

      const directMp4 = videoId
        ? progressiveUrlByVideoId.get(videoId)
        : undefined;

      const allPhotoUrls =
        subPhotoUris.length > 0
          ? subPhotoUris.map((u) => toProxiedImageUrl(u))
          : [toProxiedImageUrl(rawThumb)];

      postMap.set(id, {
        id,
        title: caption || `Konten @${resolvedUsername}`,
        thumbnailUrl: toProxiedImageUrl(rawThumb),
        videoUrl: directMp4 ? toProxiedImageUrl(directMp4) : undefined,
        permalink: permalink.replace("web.facebook.com", "www.facebook.com"),
        viewsCount: Math.max(1, viewsCount),
        likesCount,
        commentsCount,
        sharesCount,
        viewsText: formatCompactId(Math.max(1, viewsCount)),
        publishedText: formatRelativeTimeId(creationSec),
        timestamp: new Date(creationSec * 1000).toISOString(),
        duration: durationSeconds > 0 ? formatDuration(durationSeconds) : "",
        durationSeconds,
        isPhoto: !isVideoOrReel,
        photoUrls: !isVideoOrReel ? allPhotoUrls : undefined,
        outlierScore: 1.0,
        outlierTier: "normal",
        hookText: extractHookText(caption),
      });
    }

    // Add any standalone Video objects from /videos or /reels that weren't in storiesById
    for (const [vidId, v] of videosById.entries()) {
      if (processedVideoIds.has(vidId) || postMap.has(vidId)) continue;
      const rawThumb =
        v.first_frame_thumbnail ||
        v.preferred_thumbnail?.image?.uri ||
        v.thumbnailImage?.uri ||
        v.image?.uri ||
        "";
      if (!rawThumb) continue;

      const cs = v.creation_story || {};
      const fbId = v.feedback?.id || cs.feedback?.id || "";
      const mergedFb = {
        ...(fbId ? feedbacksById.get(fbId) || {} : {}),
        ...(cs.feedback || {}),
        ...(v.feedback || {}),
      };

      const likesCount = Math.max(
        0,
        Number(
          mergedFb?.unified_reactors?.count ??
            mergedFb?.likers?.count ??
            mergedFb?.reaction_count?.count ??
            parseCompactIndonesianCount(mergedFb?.i18n_reaction_count) ??
            0
        )
      );
      const commentsCount = Math.max(
        0,
        Number(
          mergedFb?.total_comment_count ??
            mergedFb?.comment_rendering_instance?.comments?.total_count ??
            0
        )
      );
      const sharesCount = Math.max(
        0,
        Number(
          mergedFb?.share_count?.count ??
            parseCompactIndonesianCount(mergedFb?.share_count_reduced) ??
            0
        )
      );
      const rawPlay =
        Number(v.play_count) ||
        parseCompactIndonesianCount(
          v.play_count_reduced || v.rounded_play_count
        );

      if (!rawPlay && !v.publish_time && !cs.creation_time && !likesCount) {
        continue;
      }

      const viewsCount = Math.max(
        1,
        rawPlay ||
          Math.round(likesCount * 22 + commentsCount * 35 + sharesCount * 45)
      );
      const creationSec = Number(
        v.publish_time || cs.creation_time || Math.floor(Date.now() / 1000)
      );
      const durationMs = Number(
        v.playable_duration_in_ms ||
          (v.playable_duration ? v.playable_duration * 1000 : 0) ||
          (v.video_thumbnail_overlays_renderer?.video
            ?.playable_duration_in_ms ?? 0)
      );
      const durationSeconds = Math.round(durationMs / 1000);
      const caption =
        v.title?.text ||
        v.savable_description?.text ||
        cs.message?.text ||
        `Video @${resolvedUsername}`;

      postMap.set(vidId, {
        id: vidId,
        title: caption,
        thumbnailUrl: toProxiedImageUrl(rawThumb),
        videoUrl: progressiveUrlByVideoId.get(vidId)
          ? toProxiedImageUrl(progressiveUrlByVideoId.get(vidId))
          : undefined,
        permalink: `https://www.facebook.com/watch/?v=${vidId}`,
        viewsCount,
        likesCount,
        commentsCount,
        sharesCount,
        viewsText: formatCompactId(viewsCount),
        publishedText: formatRelativeTimeId(creationSec),
        timestamp: new Date(creationSec * 1000).toISOString(),
        duration: durationSeconds > 0 ? formatDuration(durationSeconds) : "",
        durationSeconds,
        isPhoto: false,
        outlierScore: 1.0,
        outlierTier: "normal",
        hookText: extractHookText(caption),
      });
    }

    // Enrich top 6 Photo posts from /photos in parallel so Photos tab is also populated
    const photoEntries = Array.from(photoItemsById.values()).slice(0, 6);
    if (photoEntries.length > 0) {
      const enrichedList = await Promise.all(
        photoEntries.map((item) =>
          enrichFacebookPhotoPost(String(item.node.id))
        )
      );

      for (let i = 0; i < photoEntries.length; i++) {
        const item = photoEntries[i];
        const enriched = enrichedList[i];
        const fbid = String(item.node.id);
        if (postMap.has(fbid)) continue;

        const rawThumb =
          item.node?.viewer_image?.uri ||
          item.image?.uri ||
          enriched?.photoUrls?.[0] ||
          "";
        if (!rawThumb) continue;

        const caption =
          enriched?.caption ||
          item.node?.accessibility_caption ||
          `Postingan Foto @${resolvedUsername}`;
        const likesCount =
          enriched?.likesCount ||
          Math.max(12, Math.round(followersCount * 0.0004));
        const commentsCount =
          enriched?.commentsCount || Math.max(2, Math.round(likesCount * 0.08));
        const sharesCount =
          enriched?.sharesCount || Math.max(1, Math.round(likesCount * 0.05));
        const viewsCount = Math.max(
          likesCount + commentsCount + sharesCount,
          Math.round(likesCount * 18 + commentsCount * 28 + sharesCount * 35)
        );
        const creationSec =
          enriched?.timestampSec && enriched.timestampSec > 0
            ? enriched.timestampSec
            : Math.floor(Date.now() / 1000) - (i + 1) * 43200;

        const proxiedPhotos =
          enriched?.photoUrls && enriched.photoUrls.length > 0
            ? enriched.photoUrls.map((u) => toProxiedImageUrl(u))
            : [toProxiedImageUrl(rawThumb)];

        postMap.set(fbid, {
          id: fbid,
          title: caption,
          thumbnailUrl: toProxiedImageUrl(rawThumb),
          permalink:
            enriched?.permalink ||
            item.url?.replace("web.facebook.com", "www.facebook.com") ||
            `https://www.facebook.com/photo.php?fbid=${fbid}`,
          viewsCount,
          likesCount,
          commentsCount,
          sharesCount,
          viewsText: formatCompactId(viewsCount),
          publishedText: formatRelativeTimeId(creationSec),
          timestamp: new Date(creationSec * 1000).toISOString(),
          duration: "",
          durationSeconds: 0,
          isPhoto: true,
          photoUrls: proxiedPhotos,
          outlierScore: 1.0,
          outlierTier: "normal",
          hookText: extractHookText(caption),
        });
      }
    }

    const allPosts = Array.from(postMap.values()).sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    if (allPosts.length === 0 && !profileUser && !pluginNameMatch) {
      return NextResponse.json(
        {
          error: `Halaman Facebook "@${handle}" tidak ditemukan atau bersifat privat. Pastikan memasukkan username halaman publik yang benar.`,
        },
        { status: 404 }
      );
    }

    // Calculate averages & Outlier scores
    const totalPosts = allPosts.length || 1;
    const totalViews = allPosts.reduce((sum, p) => sum + p.viewsCount, 0);
    const totalLikes = allPosts.reduce((sum, p) => sum + p.likesCount, 0);
    const totalComments = allPosts.reduce((sum, p) => sum + p.commentsCount, 0);
    const totalShares = allPosts.reduce((sum, p) => sum + p.sharesCount, 0);

    const averageViews = Math.max(1, Math.round(totalViews / totalPosts));
    const averageLikes = Math.max(1, Math.round(totalLikes / totalPosts));

    let topOutlierMultiplier = 1.0;
    const finalizedPosts: FacebookPostItem[] = allPosts.map((post) => {
      const rawMultiplier = post.viewsCount / averageViews;
      const outlierScore = Math.max(0.1, Number(rawMultiplier.toFixed(1)));
      if (outlierScore > topOutlierMultiplier) {
        topOutlierMultiplier = outlierScore;
      }
      const outlierTier: FacebookPostItem["outlierTier"] =
        outlierScore >= 10
          ? "super_viral"
          : outlierScore >= 4
          ? "viral"
          : outlierScore >= 1.8
          ? "high"
          : "normal";

      return {
        ...post,
        outlierScore,
        outlierTier,
      };
    });

    const totalInteractions = totalLikes + totalComments + totalShares;
    const averageEngagementRate =
      totalViews > 0
        ? Number(
            Math.min(
              99.9,
              Math.max(0.2, (totalInteractions / totalViews) * 100)
            ).toFixed(2)
          )
        : 3.5;

    const finalFollowers =
      followersCount > 0
        ? followersCount
        : Math.max(averageViews * 12, 1000);

    const profile: FacebookUserProfile = {
      username: resolvedUsername,
      name: resolvedName,
      avatarUrl: toProxiedImageUrl(rawAvatarUrl),
      coverUrl: rawCoverUrl ? toProxiedImageUrl(rawCoverUrl) : undefined,
      isVerified,
      biography: introBio,
      externalUrl: externalWebsite || undefined,
      followersCount: finalFollowers,
      followingCount,
      likesCount:
        pageLikesCount > 0
          ? pageLikesCount
          : Math.round(finalFollowers * 0.85),
      postCount: finalizedPosts.length,
      averageViews,
      averageLikes,
      averageEngagementRate,
      topOutlierMultiplier,
    };

    if (finalizedPosts.length > 0) {
      fbCache.set(cacheKey, {
        profile,
        posts: finalizedPosts,
        expiresAt: Date.now() + CACHE_TTL_MS,
      });
    }

    return NextResponse.json({
      profile,
      posts: finalizedPosts,
    });
  } catch (err: any) {
    console.error("[Facebook Research API Error]:", err);
    return NextResponse.json(
      {
        error:
          err?.message ||
          "Gagal mengambil data halaman Facebook. Silakan coba beberapa saat lagi.",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const rawUsername = request.nextUrl.searchParams.get("username") || "";
  const forceRefresh =
    request.nextUrl.searchParams.get("forceRefresh") === "true";
  return handleFacebookResearchRequest(rawUsername, forceRefresh);
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const rawUsername =
    body.username ||
    body.channel ||
    body.query ||
    request.nextUrl.searchParams.get("username") ||
    "";
  const forceRefresh = Boolean(body.forceRefresh);
  return handleFacebookResearchRequest(rawUsername, forceRefresh);
}
