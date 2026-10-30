/**
 * Utility functions for YouTube URL parsing, thumbnails, clean embed URLs, and duration calculations.
 */

export function getYoutubeVideoId(url?: string | null): string | null {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();

  // Handle standard formats:
  // - https://www.youtube.com/watch?v=VIDEO_ID
  // - https://youtu.be/VIDEO_ID
  // - https://www.youtube.com/embed/VIDEO_ID
  // - https://www.youtube.com/v/VIDEO_ID
  // - https://m.youtube.com/watch?v=VIDEO_ID
  // - VIDEO_ID directly (if 11 chars alphanumeric)
  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
  const match = trimmed.match(regExp);

  if (match && match[1]) {
    return match[1];
  }

  // If already an 11-char ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  return null;
}

export function getYoutubeThumbnail(url?: string | null): string | null {
  const id = getYoutubeVideoId(url);
  if (!id) return null;
  return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
}

export function getYoutubeEmbedUrl(url?: string | null, autoplay = false, origin?: string): string | null {
  const id = getYoutubeVideoId(url);
  if (!id) return null;
  const originParam = origin ? `&origin=${encodeURIComponent(origin)}` : "";
  return `https://www.youtube.com/embed/${id}?enablejsapi=1&rel=0&modestbranding=1${autoplay ? "&autoplay=1" : ""}${originParam}`;
}

/**
 * Parse YouTube ISO 8601 duration (e.g., PT15M38S, PT1H4M20S, PT45S)
 */
export function parseYouTubeIsoDuration(isoDuration?: string | null): { totalSeconds: number; formattedDuration: string } {
  if (!isoDuration || typeof isoDuration !== "string") {
    return { totalSeconds: 0, formattedDuration: "00:00" };
  }

  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/i);
  if (!match) return { totalSeconds: 0, formattedDuration: "00:00" };

  const h = parseInt(match[1] || "0", 10);
  const m = parseInt(match[2] || "0", 10);
  const s = parseInt(match[3] || "0", 10);
  const totalSeconds = h * 3600 + m * 60 + s;

  let formatted = "";
  if (h > 0) {
    formatted = `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  } else {
    formatted = `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }

  return { totalSeconds, formattedDuration: formatted };
}

/**
 * Parse string duration (e.g., "15:38", "1:15:30", "45") to total seconds
 */
export function parseDurationStringToSeconds(durationStr?: string | null): number {
  if (!durationStr || typeof durationStr !== "string") return 0;
  const parts = durationStr.trim().split(":").map((p) => parseInt(p, 10));
  if (parts.some((p) => isNaN(p))) return 0;
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 1) return parts[0];
  return 0;
}

/**
 * Format total seconds into human-readable Indonesian text:
 * e.g. "1 Jam 45 Menit (8 Video)" or "45 Menit (3 Video)"
 */
export function formatTotalDuration(totalSeconds: number, videoCount: number): string {
  if (totalSeconds <= 0) return videoCount > 0 ? `0 Menit (${videoCount} Video)` : "";
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.round((totalSeconds % 3600) / 60);

  if (h > 0) {
    const minPart = m > 0 ? ` ${m} Menit` : "";
    return `${h} Jam${minPart} (${videoCount} Video)`;
  }
  return `${Math.max(1, m)} Menit (${videoCount} Video)`;
}

/**
 * Calculate total duration of a video playlist
 */
export function calculatePlaylistTotalDuration(videos: { duration?: string }[]): string {
  if (!videos || videos.length === 0) return "";
  const totalSeconds = videos.reduce((acc, v) => acc + parseDurationStringToSeconds(v.duration), 0);
  return formatTotalDuration(totalSeconds, videos.length);
}
