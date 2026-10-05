"use server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function getRuangBelajarDataAction() {
  const session = await auth();
  
  let isPro = false;
  let ownedProductIds: string[] = [];
  let isAdmin = false;

  if (session?.user?.id) {
    const userObj = await prisma.user.findUnique({ where: { id: session.user.id } });
    isAdmin = session.user.email?.toLowerCase() === "anggasrimugiarahayu@gmail.com";
    isPro = userObj?.role === "PRO" || isAdmin;
    
    const userProducts = await prisma.userOwnedProduct.findMany({
      where: { userId: session.user.id },
      select: { digitalProductId: true }
    });
    ownedProductIds = userProducts.map(up => up.digitalProductId);
  }

  const products = await prisma.digitalProduct.findMany({
    where: { isActive: true },
    include: { category: true, reviews: { select: { rating: true } } },
    orderBy: { createdAt: 'desc' }
  });

  return {
    isPro,
    isAdmin,
    ownedProductIds,
    products: JSON.parse(JSON.stringify(products))
  };
}
