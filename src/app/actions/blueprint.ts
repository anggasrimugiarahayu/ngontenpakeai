"use server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function getBlueprintAction() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const blueprint = await prisma.masterBlueprint.findFirst({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });
  return blueprint ? JSON.parse(JSON.stringify(blueprint)) : null;
}
