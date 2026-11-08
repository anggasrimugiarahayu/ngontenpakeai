"use server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { unstable_cache, revalidatePath, revalidateTag as nextRevalidateTag } from "next/cache";
import { attachComputedBuyerCounts } from "@/lib/product-buyers";
import { attachLightweightCovers } from "@/lib/ebook-covers";
import { getCachedAppUser, getCachedUserOrders, getCachedUserOwnedProducts } from "@/lib/cache";
import { computeUserSubscriptionStatus, isBookPackageOrder, resolveUserPackageBundledProductIds } from "@/lib/subscription-utils";
import { isAdminEmail, isAdminUser } from "@/lib/admin";

function safeRevalidateTag(tag: string) {
  try {
    (nextRevalidateTag as any)(tag, "default");
  } catch {
    try {
      (nextRevalidateTag as any)(tag);
    } catch {}
  }
}

const CATALOG_PRODUCT_SELECT = {
  id: true,
  categoryId: true,
  title: true,
  price: true,
  originalPrice: true,
  pageCount: true,
  description: true,
  slug: true,
  language: true,
  formatType: true,
  productType: true,
  totalDuration: true,
  author: true,
  isProOnly: true,
  accessLevel: true,
  isDownloadable: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  category: true,
  reviews: { select: { rating: true } },
  _count: { select: { owners: true, favorites: true } },
} as const;

const getCachedDigitalProductsList = unstable_cache(
  async () => {
    const [rawProducts, sortSetting] = await Promise.all([
      prisma.digitalProduct.findMany({
        where: { isActive: true },
        take: 100,
        select: CATALOG_PRODUCT_SELECT,
        orderBy: { createdAt: "desc" },
      }),
      prisma.appSetting.findUnique({ where: { key: "EBOOK_SORT_ORDER" } }).catch(() => null),
    ]);

    const [withBuyers, withCovers] = await Promise.all([
      attachComputedBuyerCounts(rawProducts),
      attachLightweightCovers(rawProducts, false),
    ]);
    const coverMap = new Map(withCovers.map((c) => [c.id, c]));
    const products = withBuyers.map((p) => {
      const cov = coverMap.get(p.id);
      return cov ? { ...p, coverUrl: cov.coverUrl } : p;
    });

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
      } catch {}
    }

    return products;
  },
  ["digital-products-list-v2"],
  { revalidate: 3600, tags: ["ebook-catalog"] }
);

const getCachedEbookBySlug = unstable_cache(
  async (slug: string) => {
    const rawEbook = await prisma.digitalProduct.findFirst({
      where: { slug: slug, isActive: true },
      select: {
        ...CATALOG_PRODUCT_SELECT,
        fileUrl: true,
        videoList: true,
        resourceData: true,
        reviews: {
          take: 20,
          include: { user: { select: { name: true, image: true } } },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!rawEbook) return null;
    const [[withBuyers], [withCover]] = await Promise.all([
      attachComputedBuyerCounts([rawEbook]),
      attachLightweightCovers([rawEbook], true),
    ]);
    return {
      ...withBuyers,
      coverUrl: withCover.coverUrl,
      coverUrl2: withCover.coverUrl2,
      coverUrl3: withCover.coverUrl3,
    };
  },
  ["digital-product-by-slug-v2"],
  { revalidate: 3600, tags: ["ebook-catalog"] }
);

export async function getRuangBelajarDataAction() {
  const session = await auth();

  let isPro = false;
  let ownedProductIds: string[] = [];
  let isAdmin = false;

  const [userObj, userProducts, cachedProducts, userOrders, pricingSetting] = await Promise.all([
    session?.user?.id ? getCachedAppUser(session.user.id) : Promise.resolve(null),
    session?.user?.id ? getCachedUserOwnedProducts(session.user.id).catch(() => []) : Promise.resolve([]),
    getCachedDigitalProductsList().catch(() => []),
    session?.user?.id ? getCachedUserOrders(session.user.id).catch(() => []) : Promise.resolve([]),
    prisma.appSetting.findUnique({ where: { key: "PRICING_PACKAGES" } }).catch(() => null),
  ]);

  let products = cachedProducts;
  if (!products || products.length === 0) {
    try {
      const rawFallback = await prisma.digitalProduct.findMany({
        where: { isActive: true },
        take: 100,
        select: CATALOG_PRODUCT_SELECT,
        orderBy: { createdAt: "desc" },
      });
      const withBuyers = await attachComputedBuyerCounts(rawFallback);
      products = await attachLightweightCovers(withBuyers, false);
    } catch (e) {
      console.error("Fallback fetch products error:", e);
      products = [];
    }
  }

  if (session?.user?.id && userObj) {
    let rawPricingConfig: any = null;
    if (pricingSetting?.value) {
      try {
        rawPricingConfig = JSON.parse(pricingSetting.value);
      } catch {}
    }

    const subStatus = computeUserSubscriptionStatus(userObj, userOrders, rawPricingConfig);
    isAdmin = subStatus.isAdmin || isAdminEmail(session.user.email);
    isPro = subStatus.hasBook || isAdmin;

    const ownedSet = new Set<string>();
    userProducts.forEach((up: any) => {
      if (up.digitalProductId) ownedSet.add(up.digitalProductId);
    });

    // Dynamic entitlement: bila ada produk baru yang di-include ke paket lunas user
    const dynamicPackageProductIds = resolveUserPackageBundledProductIds(userOrders, rawPricingConfig);
    dynamicPackageProductIds.forEach((pid) => ownedSet.add(pid));

    ownedProductIds = Array.from(ownedSet);
  }

  return {
    isPro,
    isAdmin,
    ownedProductIds,
    products: JSON.parse(JSON.stringify(products)),
  };
}

export async function getEbookDetailAction(slug: string) {
  const session = await auth();
  const userId = session?.user?.id;

  const [userObj, cachedEbook, userProducts, userOrders, pricingSetting] = await Promise.all([
    userId ? getCachedAppUser(userId) : Promise.resolve(null),
    getCachedEbookBySlug(slug),
    userId ? getCachedUserOwnedProducts(userId).catch(() => []) : Promise.resolve([]),
    userId ? getCachedUserOrders(userId).catch(() => []) : Promise.resolve([]),
    prisma.appSetting.findUnique({ where: { key: "PRICING_PACKAGES" } }).catch(() => null),
  ]);

  if (!cachedEbook) {
    return { notFound: true, reason: "not-found" };
  }

  let isFavorite = false;
  let favoriteCount = (cachedEbook as any)?._count?.favorites || 0;
  if (userId) {
    try {
      const [fav, freshCount] = await Promise.all([
        prisma.favorite.findUnique({
          where: { userId_digitalProductId: { userId, digitalProductId: cachedEbook.id } },
        }),
        prisma.favorite.count({
          where: { digitalProductId: cachedEbook.id },
        }),
      ]);
      isFavorite = !!fav;
      if (typeof freshCount === "number") {
        favoriteCount = freshCount;
      }
    } catch (e) {
      console.error("Error checking favorite status:", e);
    }
  }

  const ebook = {
    ...cachedEbook,
    favorites: isFavorite && userId ? [{ id: "fav", userId }] : [],
    favoriteCount,
  };

  let rawPricingConfig: any = null;
  if (pricingSetting?.value) {
    try {
      rawPricingConfig = JSON.parse(pricingSetting.value);
    } catch {}
  }

  const subStatus = computeUserSubscriptionStatus(userObj, userOrders, rawPricingConfig);
  const isAdmin = subStatus.isAdmin || isAdminEmail(session?.user?.email);
  const isPro = subStatus.hasBook || isAdmin;

  const ownedSet = new Set<string>();
  userProducts.forEach((up: any) => {
    if (up.digitalProductId) ownedSet.add(up.digitalProductId);
  });
  const dynamicPackageProductIds = resolveUserPackageBundledProductIds(userOrders, rawPricingConfig);
  dynamicPackageProductIds.forEach((pid) => ownedSet.add(pid));

  const ownedProductIds = Array.from(ownedSet);
  const isOwned = ownedSet.has(cachedEbook.id);
  const isFree = cachedEbook.accessLevel === "FREE" || !cachedEbook.price || cachedEbook.price <= 0;
  const canAccessContent = isAdmin || isOwned || isFree;

  let safeVideoList = null;
  if (canAccessContent) {
    safeVideoList = ebook.videoList;
  } else if (ebook.videoList) {
    // Jika belum memiliki akses, tetap kirimkan metadata kurikulum silabus (judul & durasi),
    // namun sensor youtubeUrl khusus video terkunci agar tidak bisa dibypass sebelum beli
    try {
      const parsed = typeof ebook.videoList === "string" ? JSON.parse(ebook.videoList) : ebook.videoList;
      if (Array.isArray(parsed)) {
        safeVideoList = parsed.map((item: any, idx: number) => ({
          id: item.id || `v-${idx}`,
          title: item.title || `Video ${idx + 1}`,
          duration: item.duration || "",
          isFreePreview: Boolean(item.isFreePreview),
          youtubeUrl: item.isFreePreview ? item.youtubeUrl : undefined,
        }));
      }
    } catch {
      safeVideoList = null;
    }
  }

  const safeEbook = {
    ...ebook,
    fileUrl: canAccessContent ? ebook.fileUrl : null,
    videoList: safeVideoList,
    resourceData: canAccessContent ? ebook.resourceData : null,
  };

  return {
    ebook: JSON.parse(JSON.stringify(safeEbook)),
    isPro,
    isAdmin,
    ownedProductIds,
    userId: userId || null,
  };
}

export async function toggleFavorite(productId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const userId = session.user.id;

  const existing = await prisma.favorite.findUnique({
    where: { userId_digitalProductId: { userId, digitalProductId: productId } },
  });

  let isFavorite = false;
  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } });
    isFavorite = false;
  } else {
    await prisma.favorite.create({
      data: { userId, digitalProductId: productId },
    });
    isFavorite = true;
  }

  const count = await prisma.favorite.count({
    where: { digitalProductId: productId },
  });

  safeRevalidateTag("ebook-catalog");
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
    create: { userId, digitalProductId: productId, rating, comment },
  });

  safeRevalidateTag("ebook-catalog");
  revalidatePath(`/ruang-belajar`);
  revalidatePath(`/ruang-belajar/[slug]`);
}

export async function claimFreeProduct(productId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const userId = session.user.id;
  const [user, product, userOrders, pricingSetting] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.digitalProduct.findUnique({
      where: { id: productId },
      select: { id: true, accessLevel: true, productType: true },
    }),
    prisma.order.findMany({
      where: {
        userId,
        status: "SUCCESS",
      },
      select: { orderType: true, status: true, amount: true, paymentMethod: true },
    }),
    prisma.appSetting.findUnique({ where: { key: "PRICING_PACKAGES" } }).catch(() => null),
  ]);

  if (!user) throw new Error("User not found");
  if (!product) throw new Error("Product not found");

  const isFree = product.accessLevel === "FREE";
  const isAdmin = isAdminUser(user);

  let rawPricingConfig: any = null;
  if (pricingSetting?.value) {
    try {
      rawPricingConfig = JSON.parse(pricingSetting.value);
    } catch {}
  }

  // Hanya boleh klaim jika produk FREE, user adalah ADMIN, atau produk memang di-include di paket yang telah dibeli user
  const bundledIds = resolveUserPackageBundledProductIds(userOrders, rawPricingConfig);
  const isIncludedInUserPackage = bundledIds.includes(productId);

  if (!isFree && !isAdmin && !isIncludedInUserPackage) {
    throw new Error(
      "Produk ini tidak termasuk dalam paket yang Anda miliki. Silakan beli satuan atau pilih paket yang menyertakan produk ini."
    );
  }

  await prisma.userOwnedProduct.upsert({
    where: { userId_digitalProductId: { userId, digitalProductId: productId } },
    update: {},
    create: { userId, digitalProductId: productId },
  });

  // Rekam transaksi di tabel Order agar terlacak di Orders dan Product Lifetime Sales
  const existingOrder = await prisma.order.findFirst({
    where: {
      userId,
      digitalProductId: productId,
      status: "SUCCESS",
    },
  });

  if (!existingOrder) {
    await prisma.order.create({
      data: {
        userId,
        digitalProductId: productId,
        orderType: product.productType || "EBOOK",
        amount: 0,
        status: "SUCCESS",
        paymentMethod: isFree ? "FREE_CLAIM" : (isAdmin ? "ADMIN_GRANT" : "PACKAGE_INCLUDED"),
      },
    });
  }

  safeRevalidateTag("user-ownership");
  safeRevalidateTag("user-orders");
  safeRevalidateTag("admin-dashboard-stats");
  safeRevalidateTag("dashboard-data");
  safeRevalidateTag("dashboard-orders");
  revalidatePath(`/ruang-belajar`);
  revalidatePath(`/ruang-belajar/[slug]`);
  revalidatePath(`/dashboard`);
  return { success: true };
}

// Aliases for multi-format digital products (E-Book, Video Course, Notion / Link)
export const getProductDetailAction = getEbookDetailAction;
export const claimFreeEbook = claimFreeProduct;
