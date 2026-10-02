"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function toggleFavorite(productId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const userId = session.user.id;
  
  const existing = await prisma.favorite.findUnique({
    where: { userId_digitalProductId: { userId, digitalProductId: productId } }
  });

  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } });
  } else {
    await prisma.favorite.create({
      data: { userId, digitalProductId: productId }
    });
  }

  revalidatePath(`/ruang-belajar`);
  revalidatePath(`/ruang-belajar/[slug]`);
}

export async function addReview(productId: string, rating: number, comment: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const userId = session.user.id;

  await prisma.review.upsert({
    where: { userId_digitalProductId: { userId, digitalProductId: productId } },
    update: { rating, comment },
    create: { userId, digitalProductId: productId, rating, comment }
  });

  revalidatePath(`/ruang-belajar`);
  revalidatePath(`/ruang-belajar/[slug]`);
}
