"use server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { getAiModels, getAppSettings, getFeatures, getCategories, getProducts } from "@/app/(app)/pengaturan/admin-actions";

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
      include: { product: true }
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
    const [models, settings, adminFeatures, categories, products] = await Promise.all([
      getAiModels(),
      getAppSettings(),
      getFeatures(),
      getCategories(),
      getProducts()
    ]);
    adminData = { models, settings, features: adminFeatures, categories, products };
  }

  return JSON.parse(JSON.stringify({ userData, adminData, isPro, isAdmin }));
}

export async function getPricingPackagesAction() {
  const setting = await prisma.appSetting.findUnique({
    where: { key: "PRICING_PACKAGES" }
  });
  return setting?.value ? JSON.parse(setting.value) : null;
}
