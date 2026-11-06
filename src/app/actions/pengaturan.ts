"use server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { revalidatePath, unstable_cache, updateTag, revalidateTag } from "next/cache";
import {
  queryAiModels,
  queryAppSettings,
  queryFeatures,
  queryCategories,
  queryProducts,
  queryCarouselStyleArts,
  queryCarouselFonts,
  queryVouchers,
} from "@/lib/server/adminDbQueries";
import { getCachedFeatures, getCachedAppUser, getCachedUserOrders, getCachedUserUsages, getCachedQuotaConfig } from "@/lib/cache";
import { computeUserSubscriptionStatus, resolveUserPackageBundledProductIds } from "@/lib/subscription-utils";
import { isAdminEmail } from "@/lib/admin";

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
    const [models, settings, adminFeatures, categories, products, carouselStyles, carouselFonts, vouchers] = await Promise.all([
      queryAiModels(),
      queryAppSettings(),
      queryFeatures(),
      queryCategories(),
      queryProducts(),
      queryCarouselStyleArts(),
      queryCarouselFonts(),
      queryVouchers(),
    ]);
    return { models, settings, features: adminFeatures, categories, products, carouselStyles, carouselFonts, vouchers };
  },
  ['admin-config-data'],
  { revalidate: 3600, tags: ['admin-config'] }
);

export async function getPengaturanDataAction() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const isAdmin = isAdminEmail(session?.user?.email);
  
  const [features, usages, dbUser, userOrders, userOwned, adminData, pricingConfig, quotaConfig] = await Promise.all([
    getCachedFeatures(),
    getCachedUserUsages(session.user.id),
    getCachedAppUser(session.user.id),
    getCachedUserOrders(session.user.id),
    prisma.userOwnedProduct.findMany({
      where: { userId: session.user.id },
      include: {
        product: {
          select: { id: true, title: true, productType: true, slug: true, accessLevel: true },
        },
      },
    }).catch(() => []),
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
  
  const bundledIds = resolveUserPackageBundledProductIds(userOrders, pricingConfig);
  const directOwnedProductIds = new Set((userOwned || []).map((uo: any) => uo.product?.id).filter(Boolean));
  const missingBundledIds = bundledIds.filter((id) => !directOwnedProductIds.has(id));

  let additionalProducts: any[] = [];
  if (missingBundledIds.length > 0) {
    try {
      additionalProducts = await prisma.digitalProduct.findMany({
        where: { id: { in: missingBundledIds }, isActive: true },
        select: { id: true, title: true, productType: true, slug: true, accessLevel: true },
      });
    } catch {}
  }

  const ownedProducts = [
    ...(userOwned || []).map((uo: any) => uo.product).filter(Boolean),
    ...additionalProducts,
  ];

  const ownedEbooks = ownedProducts.map((p: any) => p.title);

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
    ownedProducts,
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

export async function updateGroqApiKey(formData: FormData) {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  const apiKey = formData.get("groqApiKey") as string;

  if (!apiKey || apiKey.trim() === "") {
    return { success: false, error: "Groq API Key tidak boleh kosong." };
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        groqApiKey: apiKey.trim(),
      },
    });

    invalidateUserSessionTag();
    revalidatePath("/pengaturan");

    return { success: true };
  } catch (error) {
    console.error("Failed to update Groq API Key:", error);
    return { success: false, error: "Gagal menyimpan Groq API Key." };
  }
}

export async function deleteGroqApiKey() {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        groqApiKey: null,
      },
    });

    invalidateUserSessionTag();
    revalidatePath("/pengaturan");

    return { success: true };
  } catch (error) {
    console.error("Failed to delete Groq API Key:", error);
    return { success: false, error: "Gagal menghapus Groq API Key." };
  }
}

