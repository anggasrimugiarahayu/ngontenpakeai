"use server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { revalidatePath, unstable_cache } from "next/cache";
import { getAiModels, getAppSettings, getFeatures, getCategories, getProducts } from "@/app/actions/adminSettings";
import { getCachedFeatures, getCachedAppUser, getCachedUserOrders, getCachedUserUsages } from "@/lib/cache";

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
  
  const [features, usages, dbUser, userOrders, adminData] = await Promise.all([
    getCachedFeatures(),
    getCachedUserUsages(session.user.id),
    getCachedAppUser(session.user.id),
    getCachedUserOrders(session.user.id),
    isAdmin ? getCachedAdminConfig() : Promise.resolve(null)
  ]);

  const hasTools = !!(dbUser?.proToolsExpiredAt && new Date(dbUser.proToolsExpiredAt) > new Date());
  const hasAutomation = !!((dbUser as any)?.proAutomationExpiredAt && new Date((dbUser as any).proAutomationExpiredAt) > new Date());
  const hasBook = userOrders.some((o: any) => o.orderType === "PRO_BOOK" || o.orderType === "PRO_PLUS");
  const isPro = isAdmin || hasTools || hasAutomation || hasBook || false;
  
  const ownedEbooks = userOrders
    .filter((o: any) => o.product && o.orderType !== 'PRO_TOOLS' && o.orderType !== 'PRO_AUTOMATION')
    .map((o: any) => o.product.title);

  const userData = { 
    features, 
    usages, 
    hasBook,
    hasTools,
    hasAutomation,
    proExpiredAt: dbUser?.proToolsExpiredAt || null,
    proAutomationExpiredAt: (dbUser as any)?.proAutomationExpiredAt || null,
    ownedEbooks
  };

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

export async function updateProfile(formData: FormData) {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  const name = formData.get("name") as string;
  const image = formData.get("image") as string;

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: name || undefined,
        image: image || undefined,
      },
    });

    revalidatePath("/pengaturan");
    revalidatePath("/");
    
    return { success: true };
  } catch (error) {
    console.error("Failed to update profile:", error);
    return { success: false, error: "Gagal memperbarui profil." };
  }
}

export async function updateApiKey(formData: FormData) {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  const apiKey = formData.get("apiKey") as string;

  if (!apiKey || apiKey.trim() === "") {
    return { success: false, error: "API Key tidak boleh kosong." };
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        googleApiKey: apiKey.trim(),
      },
    });

    revalidatePath("/pengaturan");
    
    return { success: true };
  } catch (error) {
    console.error("Failed to update API Key:", error);
    return { success: false, error: "Gagal menyimpan API Key." };
  }
}

export async function deleteApiKey() {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        googleApiKey: null,
      },
    });

    revalidatePath("/pengaturan");
    
    return { success: true };
  } catch (error) {
    console.error("Failed to delete API Key:", error);
    return { success: false, error: "Gagal menghapus API Key." };
  }
}

