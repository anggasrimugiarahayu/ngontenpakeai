import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, aiResult } = await req.json();
    if (!id || !aiResult) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const updated = await prisma.masterBlueprint.update({
      where: { id, userId: session.user.id },
      data: {
        title: (aiResult.canvas_blueprint || aiResult).niche_statement || "Master Blueprint",
        aiResult
      }
    });

    return NextResponse.json({ success: true, id: updated.id });
  } catch (error: any) {
    console.error("Error saving blueprint:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { formData, aiResult } = await req.json();
    if (!aiResult) {
      return NextResponse.json({ error: "Missing aiResult" }, { status: 400 });
    }

    // Since nested, try to extract niche_statement
    const blueprintData = aiResult.canvas_blueprint || aiResult;
    const title = blueprintData.niche_statement || "Master Blueprint";

    const created = await prisma.masterBlueprint.create({
      data: {
        userId: session.user.id,
        title,
        inputData: formData || {},
        aiResult
      }
    });

    return NextResponse.json({ success: true, id: created.id });
  } catch (error: any) {
    console.error("Error creating blueprint:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing blueprint id" }, { status: 400 });
    }

    // Delete ALL blueprints for this user to ensure complete reset
    const deleted = await prisma.masterBlueprint.deleteMany({
      where: { userId: session.user.id }
    });
    
    if (deleted.count === 0) {
      return NextResponse.json({ error: "Blueprint not found or unauthorized" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting blueprint:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
