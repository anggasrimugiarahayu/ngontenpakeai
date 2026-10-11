"use server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { getAiModels, getAppSettings, getFeatures, getCategories, getProducts } from "@/app/(app)/pengaturan/admin-actions";

import { unstable_cache } from "next/cache";

export const getCachedAdminConfig = unstable_cache(
  async () => {
    const [models, settings, adminFeatures, categories, products] = await Promise.all([
      getAiModels(),
      getAppSettings(),
      getFeatures(),
      getCategories(),
      getProducts()
    ]);
    return { models, settings, features: adminFeatures, categories, products };
  },
  ['admin-config-data'],
  { revalidate: 3600, tags: ['admin-config'] }
);

export async function getPengaturanDataAction() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const isAdmin = session?.user?.email === "anggasrimugiarahayu@gmail.com";
  
  const [features, usages, dbUser, userOrders] = await Promise.all([
    prisma.feature.findMany({ where: { isActive: true }, orderBy: { createdAt: 'asc' } }),
    prisma.usage.findMany({ where: { userId: session.user.id } }),
    prisma.user.findUnique({ where: { id: session.user.id }, select: { proToolsExpiredAt: true, role: true } }),
    prisma.order.findMany({ 
      where: { userId: session.user.id, status: "SUCCESS" },
      include: { product: true },
      orderBy: { createdAt: "desc" }
    })
  ]);

  const hasTools = dbUser?.proToolsExpiredAt && new Date(dbUser.proToolsExpiredAt) > new Date();
  const isPro = isAdmin || hasTools || false;
  
  const ownedEbooks = userOrders
    .filter((o: any) => o.product && o.orderType !== 'PRO_TOOLS')
    .map((o: any) => o.product.title);

  const userData = { 
    features, 
    usages, 
    proExpiredAt: dbUser?.proToolsExpiredAt || null,
    ownedEbooks
  };

  let adminData: any = null;
  if (isAdmin) {
    adminData = await getCachedAdminConfig();
  }

  return JSON.parse(JSON.stringify({ userData, adminData, isPro, isAdmin, dbUser, userOrders }));
}

export const getCachedPricingPackages = unstable_cache(
  async () => {
    try {
      const setting = await prisma.appSetting.findUnique({
        where: { key: "PRICING_PACKAGES" }
      });
      return setting?.value ? JSON.parse(setting.value) : null;
    } catch (e) {
      console.error("Failed to fetch pricing packages:", e);
      return null;
    }
  },
  ['pricing-packages'],
  { revalidate: 86400, tags: ['pricing-packages'] }
);

export async function getPricingPackagesAction() {
  return getCachedPricingPackages();
}
