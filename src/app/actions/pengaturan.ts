"use server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { revalidatePath, unstable_cache, updateTag, revalidateTag } from "next/cache";
import {
  queryAiModels,
  queryAppSettings,
  queryFeatures,
  queryCategories,
  queryProducts
} from "@/lib/server/adminDbQueries";
import { getCachedFeatures, getCachedAppUser, getCachedUserOrders, getCachedUserUsages, getCachedQuotaConfig } from "@/lib/cache";
import { computeUserSubscriptionStatus } from "@/lib/subscription-utils";

function invalidateUserSessionTag() {
  try {
    updateTag("user-session");
  } catch {}
  try {
    (revalidateTag as any)("user-session");
  } catch {}
}

const getCachedAdminConfig = unstable_cache(
  async () => {
    const [models, settings, adminFeatures, categories, products] = await Promise.all([
      queryAiModels(),
      queryAppSettings(),
      queryFeatures(),
      queryCategories(),
      queryProducts()
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
  
  const [features, usages, dbUser, userOrders, adminData, pricingConfig, quotaConfig] = await Promise.all([
    getCachedFeatures(),
    getCachedUserUsages(session.user.id),
    getCachedAppUser(session.user.id),
    getCachedUserOrders(session.user.id),
    isAdmin ? getCachedAdminConfig() : Promise.resolve(null),
    getCachedPricingPackages().catch(() => null),
    getCachedQuotaConfig().catch(() => ({ ngontenFreeLimit: 3, risetFreeLimit: 3, automationFreeTrialDays: 3 })),
  ]);

  const subStatus = computeUserSubscriptionStatus(dbUser, userOrders, pricingConfig);
  const {
    hasBook,
    hasTools,
    hasAutomation,
    hasRiset,
    isPro,
    isFullyPro,
    badgeName,
  } = subStatus;
  
  const ownedEbooks = userOrders
    .filter((o: any) => o.product && o.orderType === "EBOOK")
    .map((o: any) => o.product.title);

  const userData = { 
    features, 
    usages, 
    hasBook,
    hasTools,
    hasAutomation,
    hasRiset,
    isFullyPro,
    badgeName,
    proToolsExpiredAt: subStatus.proToolsExpiredAt,
    proAutomationExpiredAt: subStatus.proAutomationExpiredAt,
    proRisetExpiredAt: subStatus.proRisetExpiredAt,
    ownedEbooks,
    pricingConfig,
    quotaConfig,
  };

  return JSON.parse(JSON.stringify({ userData, adminData, isPro, isAdmin: subStatus.isAdmin || isAdmin, dbUser, userOrders }));
}

const getCachedPricingPackages = unstable_cache(
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

    invalidateUserSessionTag();
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

    invalidateUserSessionTag();
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

    invalidateUserSessionTag();
    revalidatePath("/pengaturan");
    
    return { success: true };
  } catch (error) {
    console.error("Failed to delete API Key:", error);
    return { success: false, error: "Gagal menghapus API Key." };
  }
}

