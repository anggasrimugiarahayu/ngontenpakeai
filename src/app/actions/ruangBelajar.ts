"use server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { unstable_cache, revalidatePath, revalidateTag } from "next/cache";
import { attachComputedBuyerCounts } from "@/lib/product-buyers";
import { getCachedAppUser, getCachedUserOrders } from "@/lib/cache";

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

export async function toggleFavorite(productId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const userId = session.user.id;
  
  const existing = await prisma.favorite.findUnique({
    where: { userId_digitalProductId: { userId, digitalProductId: productId } }
  });

  let isFavorite = false;
  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } });
    isFavorite = false;
  } else {
    await prisma.favorite.create({
      data: { userId, digitalProductId: productId }
    });
    isFavorite = true;
  }

  const count = await prisma.favorite.count({
    where: { digitalProductId: productId }
  });

  try {
    revalidateTag("ebook-catalog", "default");
  } catch (e) {}

  revalidatePath(`/ruang-belajar`);
  revalidatePath(`/ruang-belajar/[slug]`);

  return { success: true, isFavorite, count };
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
  
  const isAdmin = user.email?.toLowerCase() === "anggasrimugiarahayu@gmail.com" || user.role === "ADMIN";

  const hasBookPackage = await prisma.order.findFirst({
    where: {
      userId,
      status: "SUCCESS",
      orderType: { in: ["PRO_BOOK", "PRO_PLUS"] }
    }
  });

  const canClaimProEbook = isAdmin || !!hasBookPackage;

  if (!isFree && !(isProEbook && canClaimProEbook)) {
    throw new Error("Produk ini tidak bisa diklaim gratis. Anda harus berlangganan Paket E-Book atau membelinya secara satuan.");
  }

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

