"use server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { getAiModels, getAppSettings, getFeatures, getCategories, getProducts } from "@/app/(app)/pengaturan/admin-actions";

export async function getPengaturanDataAction() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const isAdmin = session?.user?.email === "anggasrimugiarahayu@gmail.com";
  const isPro = isAdmin || false;

  const [features, usages] = await Promise.all([
    prisma.feature.findMany({ where: { isActive: true }, orderBy: { createdAt: 'asc' } }),
    prisma.usage.findMany({ where: { userId: session.user.id } })
  ]);
  const userData = { features, usages };

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
