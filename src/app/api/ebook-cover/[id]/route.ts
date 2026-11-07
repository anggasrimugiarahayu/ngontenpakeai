import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const slot = req.nextUrl.searchParams.get("slot") || "1";

    let rawCover: string | null = null;

    if (slot === "2") {
      const prod = await prisma.digitalProduct.findUnique({
        where: { id },
        select: { coverUrl2: true },
      });
      rawCover = prod?.coverUrl2 || null;
    } else if (slot === "3") {
      const prod = await prisma.digitalProduct.findUnique({
        where: { id },
        select: { coverUrl3: true },
      });
      rawCover = prod?.coverUrl3 || null;
    } else {
      const prod = await prisma.digitalProduct.findUnique({
        where: { id },
        select: { coverUrl: true },
      });
      rawCover = prod?.coverUrl || null;
    }

    if (!rawCover) {
      return new NextResponse("Not Found", { status: 404 });
    }

    if (rawCover.startsWith("data:")) {
      const commaIdx = rawCover.indexOf(",");
      if (commaIdx === -1) {
        return new NextResponse("Invalid Data URI", { status: 400 });
      }
      const meta = rawCover.substring(5, commaIdx);
      const mimeType = meta.split(";")[0] || "image/png";
      const base64Data = rawCover.substring(commaIdx + 1);
      const buffer = Buffer.from(base64Data, "base64");

      const hasVersion = req.nextUrl.searchParams.has("v") && req.nextUrl.searchParams.get("v") !== "1";
      const cacheHeader = hasVersion
        ? "public, max-age=31536000, s-maxage=31536000, stale-while-revalidate=86400, immutable"
        : "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400";

      return new NextResponse(buffer, {
        status: 200,
        headers: {
          "Content-Type": mimeType,
          "Cache-Control": cacheHeader,
          "CDN-Cache-Control": cacheHeader,
          "Vercel-CDN-Cache-Control": cacheHeader,
        },
      });
    }

    // If it's a normal path or external URL, redirect
    const targetUrl = rawCover.startsWith("http")
      ? rawCover
      : new URL(rawCover, req.url).toString();

    const hasVersion = req.nextUrl.searchParams.has("v") && req.nextUrl.searchParams.get("v") !== "1";
    const cacheHeader = hasVersion
      ? "public, max-age=31536000, s-maxage=31536000, stale-while-revalidate=86400, immutable"
      : "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400";

    return NextResponse.redirect(targetUrl, {
      status: 302,
      headers: {
        "Cache-Control": cacheHeader,
        "CDN-Cache-Control": cacheHeader,
        "Vercel-CDN-Cache-Control": cacheHeader,
      },
    });
  } catch (error) {
    console.error("Error serving ebook cover:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
