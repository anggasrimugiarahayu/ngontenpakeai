import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [dbUser, features, usages] = await Promise.all([
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: { googleApiKey: true }
      }),
      prisma.feature.findMany({
        where: { isActive: true },
        orderBy: { createdAt: 'asc' }
      }),
      prisma.usage.findMany({
        where: { userId: session.user.id }
      })
    ]);

    return NextResponse.json({
      googleApiKey: dbUser?.googleApiKey || null,
      features,
      usages
    });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
