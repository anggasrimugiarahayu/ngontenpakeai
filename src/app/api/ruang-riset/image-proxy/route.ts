import { NextRequest, NextResponse } from "next/server";

const ALLOWED_HOST_SUFFIXES = [
  ".cdninstagram.com",
  ".fbcdn.net",
  "instagram.com",
  ".tiktokcdn.com",
  ".tiktokcdn-us.com",
  ".tiktokcdn-eu.com",
];

function isAllowedMediaHost(rawUrl: string): boolean {
  try {
    const parsed = new URL(rawUrl);
    if (parsed.protocol !== "https:") return false;
    const host = parsed.hostname.toLowerCase();
    return ALLOWED_HOST_SUFFIXES.some(
      (suffix) => host === suffix.replace(/^\./, "") || host.endsWith(suffix)
    );
  } catch {
    return false;
  }
}

// In-memory RAM cache for images to eliminate duplicate upstream fetches on scroll
interface ImageCacheItem {
  buffer: Buffer;
  contentType: string;
  expiresAt: number;
}

const memoryImageCache = new Map<string, ImageCacheItem>();
const MAX_CACHE_ENTRIES = 500;
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export async function GET(request: NextRequest) {
  const rawUrl = request.nextUrl.searchParams.get("url");
  if (!rawUrl || !isAllowedMediaHost(rawUrl)) {
    return new NextResponse("Invalid or disallowed media URL", { status: 400 });
  }

  const rangeHeader = request.headers.get("range");
  const isVideo = rawUrl.includes(".mp4") || rawUrl.includes("video");

  // Check server RAM cache first for images (instant <1ms response)
  if (!rangeHeader && !isVideo) {
    const cached = memoryImageCache.get(rawUrl);
    if (cached && cached.expiresAt > Date.now()) {
      return new NextResponse(new Uint8Array(cached.buffer), {
        status: 200,
        headers: {
          "Content-Type": cached.contentType,
          "Content-Length": String(cached.buffer.length),
          "Cross-Origin-Resource-Policy": "cross-origin",
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "public, max-age=31536000, immutable",
          "X-Proxy-Cache": "HIT",
        },
      });
    }
  }

  try {
    const fetchHeaders: Record<string, string> = {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
      Accept: "*/*",
      Referer: "https://www.instagram.com/",
    };

    if (rangeHeader) {
      fetchHeaders["Range"] = rangeHeader;
    }

    const response = await fetch(rawUrl, {
      headers: fetchHeaders,
    });

    if (!response.ok && response.status !== 206) {
      return new NextResponse("Failed to fetch upstream media", {
        status: response.status,
      });
    }

    const contentType =
      response.headers.get("content-type") ||
      (isVideo ? "video/mp4" : "image/jpeg");

    // For images, read into memory buffer and cache in RAM
    if (!rangeHeader && !isVideo) {
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      if (memoryImageCache.size >= MAX_CACHE_ENTRIES) {
        const oldestKeys = Array.from(memoryImageCache.keys()).slice(0, 50);
        for (const k of oldestKeys) memoryImageCache.delete(k);
      }

      memoryImageCache.set(rawUrl, {
        buffer,
        contentType,
        expiresAt: Date.now() + CACHE_TTL_MS,
      });

      return new NextResponse(new Uint8Array(buffer), {
        status: 200,
        headers: {
          "Content-Type": contentType,
          "Content-Length": String(buffer.length),
          "Cross-Origin-Resource-Policy": "cross-origin",
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "public, max-age=31536000, immutable",
          "X-Proxy-Cache": "MISS",
        },
      });
    }

    // Video / streaming media with Range support
    const contentLength = response.headers.get("content-length");
    const contentRange = response.headers.get("content-range");
    const acceptRanges = response.headers.get("accept-ranges") || "bytes";

    const responseHeaders: Record<string, string> = {
      "Content-Type": contentType,
      "Cross-Origin-Resource-Policy": "cross-origin",
      "Access-Control-Allow-Origin": "*",
      "Accept-Ranges": acceptRanges,
      "Cache-Control":
        "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
    };

    if (contentLength) responseHeaders["Content-Length"] = contentLength;
    if (contentRange) responseHeaders["Content-Range"] = contentRange;

    return new NextResponse(response.body, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("Media proxy error:", error);
    return new NextResponse("Error proxying media", { status: 502 });
  }
}
