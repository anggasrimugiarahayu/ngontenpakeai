"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath, revalidateTag } from "next/cache";

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

  try {
    revalidateTag("ebook-catalog", "default");
  } catch (e) {}

  revalidatePath(`/ruang-belajar`);
  revalidatePath(`/ruang-belajar/[slug]`);
}

export async function claimFreeEbook(productId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const userId = session.user.id;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  
  if (!user) throw new Error("User not found");

  const product = await prisma.digitalProduct.findUnique({ where: { id: productId } });
  if (!product) throw new Error("Product not found");

  const isFree = product.accessLevel === "FREE";
  const isProEbook = product.accessLevel === "PRO";
  
  // Calculate if the user has an active PRO subscription
  // In the original code, PRO is determined by: user.role === "PRO"
  const isPro = user.role === "PRO" || user.email === "anggasrimugiarahayu@gmail.com";

  // Check if they are allowed to claim for free
  if (!isFree && !(isProEbook && isPro)) {
    throw new Error("Produk ini tidak bisa diklaim gratis. Anda harus berlangganan PRO atau membelinya.");
  }

  // Insert into UserOwnedProduct
  await prisma.userOwnedProduct.upsert({
    where: { userId_digitalProductId: { userId, digitalProductId: productId } },
    update: {},
    create: { userId, digitalProductId: productId }
  });

  try {
    revalidateTag("user-ownership", "default");
  } catch (e) {}

  revalidatePath(`/ruang-belajar`);
  revalidatePath(`/ruang-belajar/[slug]`);
}
