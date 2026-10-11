"use server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { unstable_cache } from "next/cache";

export const getCachedDigitalProductsList = unstable_cache(
  async () => {
    return prisma.digitalProduct.findMany({
      where: { isActive: true },
      take: 100,
      include: { category: true, reviews: { select: { rating: true } }, _count: { select: { owners: true, favorites: true } } },
      orderBy: { createdAt: 'desc' }
    }).catch(() => []);
  },
  ['digital-products-list'],
  { revalidate: 3600, tags: ['ebook-catalog'] }
);

export const getCachedEbookBySlug = unstable_cache(
  async (slug: string) => {
    return prisma.digitalProduct.findFirst({
      where: { slug: slug, isActive: true },
      include: { 
        category: true,
        _count: { select: { owners: true, favorites: true } },
        reviews: { 
          take: 20,
          include: { user: { select: { name: true, image: true } } },
          orderBy: { createdAt: 'desc' }
        }
      }
    }).catch(() => null);
  },
  ['digital-product-by-slug'],
  { revalidate: 3600, tags: ['ebook-catalog'] }
);

import { getCachedAppUser, getCachedUserOwnedProducts } from "@/lib/cache";

export async function getRuangBelajarDataAction() {
  const session = await auth();
  
  let isPro = false;
  let ownedProductIds: string[] = [];
  let isAdmin = false;

  const [userObj, userProducts, products] = await Promise.all([
    session?.user?.id ? getCachedAppUser(session.user.id) : Promise.resolve(null),
    session?.user?.id ? getCachedUserOwnedProducts(session.user.id) : Promise.resolve([]),
    getCachedDigitalProductsList()
  ]);

  if (session?.user?.id && userObj) {
    isAdmin = session.user.email?.toLowerCase() === "anggasrimugiarahayu@gmail.com";
    isPro = userObj.role === "PRO" || isAdmin;
    ownedProductIds = userProducts.map((up: any) => up.digitalProductId);
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

  const [userObj, cachedEbook, userProducts] = await Promise.all([
    getCachedAppUser(userId),
    getCachedEbookBySlug(slug),
    getCachedUserOwnedProducts(userId)
  ]);

  if (!cachedEbook) {
    return { notFound: true, reason: 'not-found' };
  }

  let isFavorite = false;
  let favoriteCount = (cachedEbook as any)?._count?.favorites || 0;
  try {
    const [fav, freshCount] = await Promise.all([
      prisma.favorite.findUnique({
        where: { userId_digitalProductId: { userId, digitalProductId: cachedEbook.id } }
      }),
      prisma.favorite.count({
        where: { digitalProductId: cachedEbook.id }
      })
    ]);
    isFavorite = !!fav;
    if (typeof freshCount === 'number') {
      favoriteCount = freshCount;
    }
  } catch (e) {
    console.error("Error checking favorite status:", e);
  }

  const ebook = {
    ...cachedEbook,
    favorites: isFavorite ? [{ id: 'fav', userId }] : [],
    favoriteCount
  };

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
