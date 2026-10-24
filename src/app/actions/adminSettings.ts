"use server";

import prisma from "@/lib/prisma";
import { revalidatePath, revalidateTag } from "next/cache";
import { attachComputedBuyerCounts } from "@/lib/product-buyers";
import { attachLightweightCovers } from "@/lib/ebook-covers";
import { deletePhysicalUploadFile } from "@/lib/server-uploads";
import { HomepageCardConfig } from "@/lib/homepage-cards";
import { getCachedHomepageCards } from "@/lib/cache";

function safeRevalidateTag(tag: string) {
  try {
    (revalidateTag as any)(tag);
  } catch {}
  try {
    (revalidateTag as any)(tag, "default");
  } catch {}
}

function revalidateAdminConfig() {
  safeRevalidateTag("admin-config");
  safeRevalidateTag("features");
  try {
    revalidatePath("/", "layout");
  } catch {}
  try {
    revalidatePath("/pengaturan");
  } catch {}
  try {
    revalidatePath("/ruang-ngonten");
  } catch {}
}

function revalidateEbookCatalog(slug?: string) {
  safeRevalidateTag("ebook-catalog");
  safeRevalidateTag("admin-config");
  try {
    revalidatePath("/ruang-belajar");
  } catch {}
  if (slug) {
    try {
      revalidatePath(`/ruang-belajar/${slug}`);
    } catch {}
  }
  try {
    revalidatePath("/pengaturan");
  } catch {}
}

// 1. Models AI
export async function getAiModels() {
  return await prisma.aiModel.findMany({ orderBy: { createdAt: "desc" } });
}
export async function createAiModel(data: any) {
  await prisma.aiModel.create({ data });
  revalidateAdminConfig();
  revalidatePath("/pengaturan");
}
export async function setDefaultModel(id: string) {
  await prisma.aiModel.updateMany({ data: { isDefault: false } });
  await prisma.aiModel.update({ where: { id }, data: { isDefault: true } });
  revalidateAdminConfig();
  revalidatePath("/pengaturan");
}

export async function setFallbackModel(id: string) {
  await prisma.aiModel.updateMany({ data: { isFallback: false } });
  await prisma.aiModel.update({ where: { id }, data: { isFallback: true } });
  revalidateAdminConfig();
  revalidatePath("/pengaturan");
}

export async function toggleModel(id: string, isActive: boolean) {
  await prisma.aiModel.update({ where: { id }, data: { isActive } });
  revalidateAdminConfig();
  revalidatePath("/pengaturan");
}
export async function deleteModel(id: string) {
  await prisma.aiModel.delete({ where: { id } });
  revalidateAdminConfig();
  revalidatePath("/pengaturan");
}

// 2. Settings (Default API Key)
export async function getAppSettings() {
  return await prisma.appSetting.findMany();
}
export async function saveAppSetting(key: string, value: string) {
  await prisma.appSetting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
  if (key === "PRICING_PACKAGES") {
    safeRevalidateTag("pricing-packages");
    try {
      revalidatePath("/checkout");
    } catch (e) {}
    try {
      revalidatePath("/");
    } catch (e) {}
  }
  if (key === "HOMEPAGE_CARDS") {
    safeRevalidateTag("homepage-cards");
    try {
      revalidatePath("/");
    } catch (e) {}
    try {
      revalidatePath("/(app)", "layout");
    } catch (e) {}
    try {
      revalidatePath("/pengaturan");
    } catch (e) {}
  }
  revalidateAdminConfig();
}

export async function getHomepageCardsAction(): Promise<HomepageCardConfig[]> {
  return await getCachedHomepageCards();
}

export async function saveHomepageCardsAction(cards: HomepageCardConfig[]) {
  await prisma.appSetting.upsert({
    where: { key: "HOMEPAGE_CARDS" },
    update: { value: JSON.stringify(cards) },
    create: { key: "HOMEPAGE_CARDS", value: JSON.stringify(cards) },
  });
  safeRevalidateTag("homepage-cards");
  safeRevalidateTag("admin-config");
  try {
    revalidatePath("/");
  } catch (e) {}
  try {
    revalidatePath("/(app)", "layout");
  } catch (e) {}
  try {
    revalidatePath("/pengaturan");
  } catch (e) {}
  revalidateAdminConfig();
  return { success: true };
}

export async function deleteAppSetting(key: string) {
  try {
    await prisma.appSetting.delete({
      where: { key },
    });
    if (key === "PRICING_PACKAGES") {
      safeRevalidateTag("pricing-packages");
      try {
        revalidatePath("/checkout");
      } catch (e) {}
      try {
        revalidatePath("/");
      } catch (e) {}
    }
  } catch (e) {
    // Ignore error if not found
  }
  revalidateAdminConfig();
}

// 3. Features (Ruang Ngonten)
export async function getFeatures() {
  return await prisma.feature.findMany({ orderBy: { name: "asc" } });
}
export async function toggleFeatureStatus(id: string, isActive: boolean) {
  await prisma.feature.update({ where: { id }, data: { isActive } });
  revalidateAdminConfig();
}
export async function toggleFeaturePro(id: string, isProOnly: boolean) {
  await prisma.feature.update({ where: { id }, data: { isProOnly } });
  revalidateAdminConfig();
}

// 4. Digital Categories & Products
export async function getCategories() {
  return await prisma.digitalCategory.findMany({ orderBy: { createdAt: "desc" } });
}
export async function createCategory(data: any) {
  if (data.slug) {
    const existing = await prisma.digitalCategory.findUnique({ where: { slug: data.slug } });
    if (existing) {
      data.slug = `${data.slug}-${Math.random().toString(36).substring(2, 6)}`;
    }
  }
  await prisma.digitalCategory.create({ data });
  revalidateEbookCatalog();
}

export async function getProducts() {
  const [rawProducts, sortSetting] = await Promise.all([
    prisma.digitalProduct.findMany({
      select: {
        id: true,
        categoryId: true,
        title: true,
        price: true,
        originalPrice: true,
        pageCount: true,
        description: true,
        slug: true,
        fileUrl: true,
        language: true,
        formatType: true,
        author: true,
        isProOnly: true,
        accessLevel: true,
        isDownloadable: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        category: true,
        vouchers: true,
        reviews: { select: { rating: true } },
        _count: { select: { owners: true, favorites: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.appSetting.findUnique({ where: { key: "EBOOK_SORT_ORDER" } }).catch(() => null),
  ]);

  const withBuyers = await attachComputedBuyerCounts(rawProducts);
  const products = await attachLightweightCovers(withBuyers, true);

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
}

export async function toggleProductStatus(id: string, isActive: boolean) {
  await prisma.digitalProduct.update({
    where: { id },
    data: { isActive },
  });
  revalidateEbookCatalog();
}

export async function reorderProducts(orderedIds: string[]) {
  await prisma.appSetting.upsert({
    where: { key: "EBOOK_SORT_ORDER" },
    update: { value: JSON.stringify(orderedIds) },
    create: { key: "EBOOK_SORT_ORDER", value: JSON.stringify(orderedIds) },
  });
  revalidateEbookCatalog();
}

export async function createProduct(data: any) {
  if (data.slug) {
    const existing = await prisma.digitalProduct.findUnique({ where: { slug: data.slug } });
    if (existing) {
      data.slug = `${data.slug}-${Math.random().toString(36).substring(2, 6)}`;
    }
  }
  const { categoryId, ...restData } = data;
  await prisma.digitalProduct.create({
    data: {
      ...restData,
      category: categoryId ? { connect: { id: categoryId } } : undefined,
    },
  });
  revalidateEbookCatalog(data.slug);
}

export async function deleteCategory(id: string) {
  await prisma.digitalCategory.delete({ where: { id } });
  revalidateEbookCatalog();
}

export async function deleteProduct(id: string) {
  const prod = await prisma.digitalProduct.findUnique({
    where: { id },
    select: { coverUrl: true, coverUrl2: true, coverUrl3: true },
  });
  if (prod) {
    if (prod.coverUrl) await deletePhysicalUploadFile(prod.coverUrl);
    if (prod.coverUrl2) await deletePhysicalUploadFile(prod.coverUrl2);
    if (prod.coverUrl3) await deletePhysicalUploadFile(prod.coverUrl3);
  }
  await prisma.digitalProduct.delete({ where: { id } });
  revalidateEbookCatalog();
}

export async function updateProduct(id: string, data: any) {
  if (data.slug) {
    const existing = await prisma.digitalProduct.findFirst({ where: { slug: data.slug, id: { not: id } } });
    if (existing) {
      data.slug = `${data.slug}-${Math.random().toString(36).substring(2, 6)}`;
    }
  }
  const { categoryId, ...restData } = data;

  // Pastikan string kosong "" dinormalisasi menjadi null
  if (restData.coverUrl === "") restData.coverUrl = null;
  if (restData.coverUrl2 === "") restData.coverUrl2 = null;
  if (restData.coverUrl3 === "") restData.coverUrl3 = null;

  if (typeof restData.coverUrl === "string" && restData.coverUrl.startsWith("/api/ebook-cover/")) {
    delete restData.coverUrl;
  }
  if (typeof restData.coverUrl2 === "string" && restData.coverUrl2.startsWith("/api/ebook-cover/")) {
    delete restData.coverUrl2;
  }
  if (typeof restData.coverUrl3 === "string" && restData.coverUrl3.startsWith("/api/ebook-cover/")) {
    delete restData.coverUrl3;
  }

  // Bersihkan file fisik di disk jika cover lama diganti atau dihapus
  const oldProduct = await prisma.digitalProduct.findUnique({
    where: { id },
    select: { coverUrl: true, coverUrl2: true, coverUrl3: true },
  });
  if (oldProduct) {
    if (restData.coverUrl !== undefined && oldProduct.coverUrl && oldProduct.coverUrl !== restData.coverUrl && oldProduct.coverUrl.startsWith("/uploads/")) {
      await deletePhysicalUploadFile(oldProduct.coverUrl);
    }
    if (restData.coverUrl2 !== undefined && oldProduct.coverUrl2 && oldProduct.coverUrl2 !== restData.coverUrl2 && oldProduct.coverUrl2.startsWith("/uploads/")) {
      await deletePhysicalUploadFile(oldProduct.coverUrl2);
    }
    if (restData.coverUrl3 !== undefined && oldProduct.coverUrl3 && oldProduct.coverUrl3 !== restData.coverUrl3 && oldProduct.coverUrl3.startsWith("/uploads/")) {
      await deletePhysicalUploadFile(oldProduct.coverUrl3);
    }
  }

  await prisma.digitalProduct.update({
    where: { id },
    data: {
      ...restData,
      category: categoryId ? { connect: { id: categoryId } } : undefined,
    },
  });
  revalidateEbookCatalog(data.slug);
}

export async function createVoucher(data: { code: string; discountType: string; discountValue: number; digitalProductId: string }) {
  await prisma.voucher.create({ data });
}
export async function deleteVoucher(id: string) {
  await prisma.voucher.delete({ where: { id } });
}
