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
      const match = rawCover.match(/^data:([^;]+);base64,(.+)$/);
      if (!match) {
        return new NextResponse("Invalid Data URI", { status: 400 });
      }
      const mimeType = match[1] || "image/png";
      const base64Data = match[2];
      const buffer = Buffer.from(base64Data, "base64");

      return new NextResponse(buffer, {
        status: 200,
        headers: {
          "Content-Type": mimeType,
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    }

    // If it's a normal path or external URL, redirect
    const targetUrl = rawCover.startsWith("http")
      ? rawCover
      : new URL(rawCover, req.url).toString();

    return NextResponse.redirect(targetUrl, {
      status: 302,
      headers: {
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Error serving ebook cover:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
