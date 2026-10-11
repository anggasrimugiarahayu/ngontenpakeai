"use server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { unstable_cache } from "next/cache";

export const getCachedDigitalProductsList = unstable_cache(
  async () => {
    return prisma.digitalProduct.findMany({
      where: { isActive: true },
      take: 100,
      include: { category: true, reviews: { select: { rating: true } }, _count: { select: { owners: true } } },
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
    getCachedDigitalProductsList()
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

  const [userObj, cachedEbook, userProducts] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { role: true } }).catch(() => null),
    getCachedEbookBySlug(slug),
    prisma.userOwnedProduct.findMany({
      where: { userId: userId },
      select: { digitalProductId: true }
    }).catch(() => [])
  ]);

  if (!cachedEbook) {
    return { notFound: true, reason: 'not-found' };
  }

  let isFavorite = false;
  try {
    const fav = await prisma.productFavorite.findFirst({
      where: { digitalProductId: cachedEbook.id, userId }
    });
    isFavorite = !!fav;
  } catch (e) {}

  const ebook = {
    ...cachedEbook,
    favorites: isFavorite ? [{ id: 'fav', userId }] : []
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
