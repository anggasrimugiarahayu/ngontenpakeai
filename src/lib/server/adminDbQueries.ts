import prisma from "@/lib/prisma";
import { attachComputedBuyerCounts } from "@/lib/product-buyers";
import { attachLightweightCovers } from "@/lib/ebook-covers";

export async function queryAiModels() {
  return await prisma.aiModel.findMany({ orderBy: { createdAt: "desc" } });
}

export async function queryAppSettings() {
  return await prisma.appSetting.findMany();
}

export async function queryFeatures() {
  return await prisma.feature.findMany({ orderBy: { createdAt: "asc" } });
}

export async function queryCategories() {
  return await prisma.digitalCategory.findMany({ orderBy: { createdAt: "desc" } });
}

export async function queryProducts() {
  const [rawProducts, sortSetting] = await Promise.all([
    prisma.digitalProduct.findMany({
      select: {
        id: true,
        categoryId: true,
        title: true,
        description: true,
        price: true,
        originalPrice: true,
        pageCount: true,
        slug: true,
        coverUrl: true,
        coverUrl2: true,
        coverUrl3: true,
        fileUrl: true,
        language: true,
        formatType: true,
        productType: true,
        totalDuration: true,
        videoList: true,
        resourceData: true,
        author: true,
        isProOnly: true,
        accessLevel: true,
        isDownloadable: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        category: { select: { id: true, name: true, slug: true } },
        vouchers: { select: { id: true, code: true, discountType: true, discountValue: true, isActive: true } },
        reviews: { select: { rating: true } },
        _count: { select: { owners: true, favorites: true } }
      },
      orderBy: { createdAt: "desc" }
    }),
    prisma.appSetting.findUnique({ where: { key: "PRODUCT_SORT_ORDER" } })
  ]);

  const withBuyers = await attachComputedBuyerCounts(rawProducts);
  const products = await attachLightweightCovers(withBuyers, false);

  if (sortSetting?.value) {
    try {
      const orderIds: string[] = JSON.parse(sortSetting.value);
      const orderMap = new Map(orderIds.map((id, index) => [id, index]));
      return [...products].sort((a, b) => {
        const indexA = orderMap.has(a.id) ? orderMap.get(a.id)! : 9999;
        const indexB = orderMap.has(b.id) ? orderMap.get(b.id)! : 9999;
        return indexA - indexB;
      });
    } catch (e) {
      console.error("Error sorting products in admin settings:", e);
    }
  }

  return products;
}

export async function queryCarouselStyleArts() {
  try {
    return await prisma.carouselStyleArt.findMany({
      orderBy: { kode: "asc" }
    });
  } catch (e) {
    console.error("Error queryCarouselStyleArts:", e);
    return [];
  }
}

export async function queryCarouselFonts() {
  try {
    return await prisma.carouselFont.findMany({
      orderBy: { kode: "asc" }
    });
  } catch (e) {
    console.error("Error queryCarouselFonts:", e);
    return [];
  }
}

export async function queryVouchers() {
  try {
    return await prisma.voucher.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        product: { select: { id: true, title: true } }
      }
    });
  } catch (e) {
    console.error("Error queryVouchers:", e);
    return [];
  }
}
