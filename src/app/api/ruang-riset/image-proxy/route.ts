import { NextRequest, NextResponse } from "next/server";

const ALLOWED_HOST_SUFFIXES = [
  ".cdninstagram.com",
  ".fbcdn.net",
  "instagram.com",
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

export async function GET(request: NextRequest) {
  const rawUrl = request.nextUrl.searchParams.get("url");
  if (!rawUrl || !isAllowedMediaHost(rawUrl)) {
    return new NextResponse("Invalid or disallowed media URL", { status: 400 });
  }

  try {
    const rangeHeader = request.headers.get("range");
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
      cache: "no-store",
    });

    if (!response.ok && response.status !== 206) {
      return new NextResponse("Failed to fetch upstream media", {
        status: response.status,
      });
    }

    const contentType =
      response.headers.get("content-type") ||
      (rawUrl.includes(".mp4") || rawUrl.includes("video")
        ? "video/mp4"
        : "image/jpeg");

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

    // Stream response.body directly for fast, non-blocking media playback
    return new NextResponse(response.body, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("Media proxy error:", error);
    return new NextResponse("Error proxying media", { status: 502 });
  }
}
