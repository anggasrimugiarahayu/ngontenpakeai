"use server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function getRuangBelajarDataAction() {
  const session = await auth();
  
  let isPro = false;
  let ownedProductIds: string[] = [];
  let isAdmin = false;

  const [userObj, userProducts, products] = await Promise.all([
    session?.user?.id ? prisma.user.findUnique({ where: { id: session.user.id } }).catch(() => null) : Promise.resolve(null),
    session?.user?.id ? prisma.userOwnedProduct.findMany({
      where: { userId: session.user.id },
      select: { digitalProductId: true }
    }).catch(() => []) : Promise.resolve([]),
    prisma.digitalProduct.findMany({
      where: { isActive: true },
      take: 100, // Safe limit for production
      include: { category: true, reviews: { select: { rating: true } } },
      orderBy: { createdAt: 'desc' }
    }).catch(() => [])
  ]);

  if (session?.user?.id && userObj) {
    isAdmin = session.user.email?.toLowerCase() === "anggasrimugiarahayu@gmail.com";
    isPro = userObj.role === "PRO" || isAdmin;
    ownedProductIds = userProducts.map(up => up.digitalProductId);
  }

  return {
    isPro,
    isAdmin,
    ownedProductIds,
    products: JSON.parse(JSON.stringify(products))
  };
}

export async function getEbookDetailAction(slug: string) {
  const session = await auth();
  if (!session?.user?.id) return { notFound: true, reason: 'unauthorized' };
  const userId = session.user.id;

  const [userObj, ebook, userProducts] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }).catch(() => null),
    prisma.digitalProduct.findFirst({
      where: { slug: slug, isActive: true },
      include: { 
        category: true,
        favorites: { where: { userId } },
        reviews: { 
          take: 20, // Limit reviews so server doesn't crash on popular ebooks
          include: { user: { select: { name: true, image: true } } },
          orderBy: { createdAt: 'desc' }
        }
      }
    }).catch(() => null),
    prisma.userOwnedProduct.findMany({
      where: { userId: userId },
      select: { digitalProductId: true }
    }).catch(() => [])
  ]);

  if (!ebook) {
    return { notFound: true, reason: 'not-found' };
  }

  const isAdmin = session.user.email?.toLowerCase() === "anggasrimugiarahayu@gmail.com";
  const isPro = userObj?.role === "PRO" || isAdmin;
  const ownedProductIds = userProducts.map(up => up.digitalProductId);

  return {
    ebook: JSON.parse(JSON.stringify(ebook)),
    isPro,
    isAdmin,
    ownedProductIds,
    userId
  };
}
