"use server";

import prisma from "@/lib/prisma";
import { revalidatePath, revalidateTag } from "next/cache";

// 1. Models AI
export async function getAiModels() {
  return await prisma.aiModel.findMany({ orderBy: { createdAt: 'desc' } });
}
export async function createAiModel(data: any) {
  await prisma.aiModel.create({ data });
  revalidatePath("/pengaturan");
}
export async function setDefaultModel(id: string) {
  await prisma.aiModel.updateMany({ data: { isDefault: false } });
  await prisma.aiModel.update({ where: { id }, data: { isDefault: true } });
  revalidatePath("/pengaturan");
}

export async function setFallbackModel(id: string) {
  await prisma.aiModel.updateMany({ data: { isFallback: false } });
  await prisma.aiModel.update({ where: { id }, data: { isFallback: true } });
  revalidatePath("/pengaturan");
}

export async function toggleModel(id: string, isActive: boolean) {
  await prisma.aiModel.update({ where: { id }, data: { isActive } });
  revalidatePath("/pengaturan");
}
export async function deleteModel(id: string) {
  await prisma.aiModel.delete({ where: { id } });
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
    create: { key, value }
  });
  if (key === "PRICING_PACKAGES") {
    try {
      revalidateTag("pricing-packages", "default");
    } catch (e) {
      console.error("Error revalidating pricing-packages:", e);
    }
  }
  revalidatePath("/pengaturan");
}

export async function deleteAppSetting(key: string) {
  try {
    await prisma.appSetting.delete({
      where: { key }
    });
    if (key === "PRICING_PACKAGES") {
      revalidateTag("pricing-packages", "default");
    }
  } catch (e) {
    // Ignore error if not found
  }
  revalidatePath("/pengaturan");
}

// 3. Features (Ruang Ngonten)
export async function getFeatures() {
  return await prisma.feature.findMany({ orderBy: { name: 'asc' } });
}
export async function toggleFeatureStatus(id: string, isActive: boolean) {
  await prisma.feature.update({ where: { id }, data: { isActive } });
  revalidatePath("/pengaturan");
}
export async function toggleFeaturePro(id: string, isProOnly: boolean) {
  await prisma.feature.update({ where: { id }, data: { isProOnly } });
  revalidatePath("/pengaturan");
}

// 4. Digital Categories & Products
export async function getCategories() {
  return await prisma.digitalCategory.findMany({ orderBy: { createdAt: 'desc' } });
}
export async function createCategory(data: any) {
  if (data.slug) {
    const existing = await prisma.digitalCategory.findUnique({ where: { slug: data.slug } });
    if (existing) {
      data.slug = `${data.slug}-${Math.random().toString(36).substring(2, 6)}`;
    }
  }
  await prisma.digitalCategory.create({ data });
  revalidatePath("/pengaturan");
}

export async function getProducts() {
  return await prisma.digitalProduct.findMany({ 
    include: { 
      category: true, 
      vouchers: true, 
      reviews: { select: { rating: true } }, 
      _count: { select: { owners: true } } 
    }, 
    orderBy: { createdAt: 'desc' } 
  });
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
      category: categoryId ? { connect: { id: categoryId } } : undefined
    } 
  });
  revalidatePath("/pengaturan");
}

export async function deleteCategory(id: string) {
  // Check if there are products in this category first?
  // In a real app we might prevent deletion, but Prisma relation might Cascade delete or Restrict.
  // Assuming Restrict for now, so we need to be careful. If we want it simple, we just delete.
  await prisma.digitalCategory.delete({ where: { id } });
  revalidatePath("/pengaturan");
}

export async function deleteProduct(id: string) {
  await prisma.digitalProduct.delete({ where: { id } });
  revalidatePath("/pengaturan");
}


export async function updateProduct(id: string, data: any) {
  if (data.slug) {
    const existing = await prisma.digitalProduct.findFirst({ where: { slug: data.slug, id: { not: id } } });
    if (existing) {
      data.slug = `${data.slug}-${Math.random().toString(36).substring(2, 6)}`;
    }
  }
  const { categoryId, ...restData } = data;
  await prisma.digitalProduct.update({
    where: { id },
    data: {
      ...restData,
      category: categoryId ? { connect: { id: categoryId } } : undefined
    }
  });
  revalidatePath("/pengaturan");
}


export async function createVoucher(data: { code: string, discountType: string, discountValue: number, digitalProductId: string }) {
  await prisma.voucher.create({ data });
}
export async function deleteVoucher(id: string) {
  await prisma.voucher.delete({ where: { id } });
}
