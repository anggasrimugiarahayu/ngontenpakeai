"use server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { unstable_cache } from "next/cache";
import { attachComputedBuyerCounts } from "@/lib/product-buyers";

export const getCachedDigitalProductsList = unstable_cache(
  async () => {
    const [rawProducts, sortSetting] = await Promise.all([
      prisma.digitalProduct.findMany({
        where: { isActive: true },
        take: 100,
        include: { category: true, reviews: { select: { rating: true } }, _count: { select: { owners: true, favorites: true } } },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.appSetting.findUnique({ where: { key: "EBOOK_SORT_ORDER" } }).catch(() => null)
    ]);

    const products = await attachComputedBuyerCounts(rawProducts);

    if (sortSetting?.value) {
      try {
        const orderIds: string[] = JSON.parse(sortSetting.value);
        const orderMap = new Map<string, number>();
        orderIds.forEach((id, idx) => orderMap.set(id, idx));

        return [...products].sort((a, b) => {
          const orderA = orderMap.has(a.id) ? orderMap.get(a.id)! : 999999;
          const orderB = orderMap.has(b.id) ? orderMap.get(b.id)! : 999999;
          if (orderA !== orderB) return orderA - orderB;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
      } catch (e) {}
    }

    return products;
  },
  ['digital-products-list'],
  { revalidate: 3600, tags: ['ebook-catalog'] }
);

export const getCachedEbookBySlug = unstable_cache(
  async (slug: string) => {
    const rawEbook = await prisma.digitalProduct.findFirst({
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
    });

    if (!rawEbook) return null;
    const [computedEbook] = await attachComputedBuyerCounts([rawEbook]);
    return computedEbook;
  },
  ['digital-product-by-slug'],
  { revalidate: 3600, tags: ['ebook-catalog'] }
);

import { getCachedAppUser, getCachedUserOrders } from "@/lib/cache";

export async function getRuangBelajarDataAction() {
  const session = await auth();
  
  let isPro = false;
  let ownedProductIds: string[] = [];
  let isAdmin = false;

  const [userObj, userProducts, cachedProducts, userOrders] = await Promise.all([
    session?.user?.id ? getCachedAppUser(session.user.id) : Promise.resolve(null),
    session?.user?.id 
      ? prisma.userOwnedProduct.findMany({ where: { userId: session.user.id }, select: { digitalProductId: true } }).catch(() => [])
      : Promise.resolve([]),
    getCachedDigitalProductsList().catch(() => []),
    session?.user?.id ? getCachedUserOrders(session.user.id).catch(() => []) : Promise.resolve([])
  ]);

  let products = cachedProducts;
  if (!products || products.length === 0) {
    try {
      const rawFallback = await prisma.digitalProduct.findMany({
        where: { isActive: true },
        take: 100,
        include: { category: true, reviews: { select: { rating: true } }, _count: { select: { owners: true, favorites: true } } },
        orderBy: { createdAt: 'desc' }
      });
      products = await attachComputedBuyerCounts(rawFallback);
    } catch (e) {
      console.error("Fallback fetch products error:", e);
      products = [];
    }
  }

  if (session?.user?.id && userObj) {
    isAdmin = session.user.email?.toLowerCase() === "anggasrimugiarahayu@gmail.com";
    const hasBookPackage = userOrders.some(
      (o: any) => o.orderType === "PRO_BOOK" || o.orderType === "PRO_PLUS"
    );
    isPro = hasBookPackage || isAdmin;
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

  const [userObj, cachedEbook, userProducts, userOrders] = await Promise.all([
    getCachedAppUser(userId),
    getCachedEbookBySlug(slug),
    prisma.userOwnedProduct.findMany({ where: { userId }, select: { digitalProductId: true } }).catch(() => []),
    getCachedUserOrders(userId).catch(() => [])
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
  const hasBookPackage = userOrders.some(
    (o: any) => o.orderType === "PRO_BOOK" || o.orderType === "PRO_PLUS"
  );
  const isPro = hasBookPackage || isAdmin;
  const ownedProductIds = userProducts.map(up => up.digitalProductId);

  return {
    ebook: JSON.parse(JSON.stringify(ebook)),
    isPro,
    isAdmin,
    ownedProductIds,
    userId
  };
}
