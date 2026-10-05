"use server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function getBioBuilderAction() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const bioBuilder = await prisma.bioBuilder.findFirst({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });
  return bioBuilder ? JSON.parse(JSON.stringify(bioBuilder)) : null;
}

export async function getContentCalendarAction() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const contentCalendar = await prisma.contentCalendar.findFirst({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });
  return contentCalendar ? JSON.parse(JSON.stringify(contentCalendar)) : null;
}
