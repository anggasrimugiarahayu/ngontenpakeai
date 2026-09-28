import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const calendar = await prisma.contentCalendar.findFirst({
      where: { userId: session.user.id }
    });

    return NextResponse.json(calendar?.data || {});
  } catch (error: any) {
    console.error("Calendar GET Error:", error);
    return NextResponse.json({ error: "Failed to fetch calendar data" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { calendarData } = body;

    if (!calendarData) {
      return NextResponse.json({ error: "Missing calendarData" }, { status: 400 });
    }

    // Upsert the calendar record for the user
    // Since we don't have @unique on userId, we findFirst and then update or create
    const existing = await prisma.contentCalendar.findFirst({
      where: { userId: session.user.id }
    });

    if (existing) {
      await prisma.contentCalendar.update({
        where: { id: existing.id },
        data: { data: calendarData }
      });
    } else {
      await prisma.contentCalendar.create({
        data: {
          userId: session.user.id,
          data: calendarData
        }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Calendar POST Error:", error);
    return NextResponse.json({ error: "Failed to save calendar data" }, { status: 500 });
  }
}
