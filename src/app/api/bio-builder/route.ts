import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, username, profileName, bioText, avatarUrl, suggestions } = await req.json();

    if (id) {
      const updated = await prisma.bioBuilder.update({
        where: { id, userId: session.user.id },
        data: {
          username, profileName, bioText, avatarUrl, suggestions
        }
      });
      return NextResponse.json({ success: true, id: updated.id });
    } else {
      const created = await prisma.bioBuilder.create({
        data: {
          userId: session.user.id,
          username, profileName, bioText, avatarUrl, suggestions
        }
      });
      return NextResponse.json({ success: true, id: created.id });
    }
  } catch (error: any) {
    console.error("Error saving bio:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const deleted = await prisma.bioBuilder.deleteMany({
      where: { userId: session.user.id }
    });
    
    return NextResponse.json({ success: true, count: deleted.count });
  } catch (error: any) {
    console.error("Error deleting bio:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
