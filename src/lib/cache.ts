import { unstable_cache } from 'next/cache';
import prisma from './prisma';
import { mergeHomepageCards, DEFAULT_HOMEPAGE_CARDS } from './homepage-cards';

export const getCachedHomepageCards = unstable_cache(
  async () => {
    try {
      const setting = await prisma.appSetting.findUnique({
        where: { key: "HOMEPAGE_CARDS" }
      });
      if (setting?.value) {
        return mergeHomepageCards(JSON.parse(setting.value));
      }
      return DEFAULT_HOMEPAGE_CARDS;
    } catch (e) {
      console.error("Failed to fetch homepage cards in cache:", e);
      return DEFAULT_HOMEPAGE_CARDS;
    }
  },
  ['homepage-cards-config'],
  { revalidate: 3600, tags: ['homepage-cards'] }
);

export const getCachedFeatures = unstable_cache(
  async () => {
    try {
      return await prisma.feature.findMany();
    } catch (e) {
      console.error("Failed to fetch features:", e);
      return [];
    }
  },
  ['global-features'],
  { revalidate: 3600, tags: ['features'] }
);

export interface FeatureQuotaConfig {
  ngontenFreeLimit: number;
  risetFreeLimit: number;
  automationFreeTrialDays: number;
}

export const DEFAULT_QUOTA_CONFIG: FeatureQuotaConfig = {
  ngontenFreeLimit: 3,
  risetFreeLimit: 3,
  automationFreeTrialDays: 3,
};

export const getCachedQuotaConfig = unstable_cache(
  async (): Promise<FeatureQuotaConfig> => {
    try {
      const setting = await prisma.appSetting.findUnique({
        where: { key: "FEATURE_QUOTA_CONFIG" },
      });
      if (setting?.value) {
        const parsed = JSON.parse(setting.value);
        return {
          ngontenFreeLimit: Number(parsed.ngontenFreeLimit) || 3,
          risetFreeLimit: Number(parsed.risetFreeLimit) || 3,
          automationFreeTrialDays: Number(parsed.automationFreeTrialDays) || 3,
        };
      }
      return DEFAULT_QUOTA_CONFIG;
    } catch (e) {
      console.error("Failed to fetch quota config in cache:", e);
      return DEFAULT_QUOTA_CONFIG;
    }
  },
  ['feature-quota-config'],
  { revalidate: 3600, tags: ['quota-config', 'admin-config'] }
);

export const getCachedHasBlueprint = unstable_cache(
  async (userId: string) => {
    try {
      const blueprint = await prisma.masterBlueprint.findFirst({
        where: { userId },
        select: { id: true }
      });
      return !!blueprint;
    } catch (e) {
      console.error("Failed to fetch blueprint status:", e);
      return false;
    }
  },
  ['has-blueprint'],
  { revalidate: 3600, tags: ['blueprint'] }
);

export const getCachedNicheReferences = unstable_cache(
  async () => {
    try {
      return await prisma.nicheReference.findMany({ select: { id: true, nama: true, data: true } });
    } catch (e) {
      console.error("Failed to fetch niche references:", e);
      return [];
    }
  },
  ['niche-references'],
  { revalidate: 86400, tags: ['niche-references'] }
);

export const getCachedMemberCount = unstable_cache(
  async () => {
    try {
      return await prisma.user.count();
    } catch (e) {
      console.error("Failed to fetch member count:", e);
      return 0;
    }
  },
  ['member-count'],
  { revalidate: 300, tags: ['global-stats'] }
);

export const getCachedAppUser = unstable_cache(
  async (userId: string) => {
    try {
      return await prisma.user.findUnique({
        where: { id: userId },
        select: {
          role: true,
          hasProBook: true,
          proToolsExpiredAt: true,
          proAutomationExpiredAt: true,
          proRisetExpiredAt: true,
          onboardingCompleted: true,
          email: true,
        },
      });
    } catch (e) {
      console.error("Failed to fetch app user in cache:", e);
      return null;
    }
  },
  ['app-user-profile-v2'],
  { revalidate: 300, tags: ['user-session'] }
);

export const getCachedUserOwnedProducts = unstable_cache(
  async (userId: string) => {
    try {
      return await prisma.userOwnedProduct.findMany({
        where: { userId },
        select: { digitalProductId: true }
      });
    } catch (e) {
      console.error("Failed to fetch user owned products in cache:", e);
      return [];
    }
  },
  ['user-owned-products'],
  { revalidate: 86400, tags: ['user-ownership'] }
);

export const getCachedUserOrders = unstable_cache(
  async (userId: string) => {
    try {
      return await prisma.order.findMany({
        where: { userId, status: "SUCCESS" },
        include: {
          product: {
            select: {
              id: true,
              title: true,
              slug: true,
              price: true,
              accessLevel: true,
              isProOnly: true,
            },
          },
        },
        orderBy: { createdAt: "desc" }
      });
    } catch (e) {
      console.error("Failed to fetch user orders in cache:", e);
      return [];
    }
  },
  ['user-success-orders-v2'],
  { revalidate: 86400, tags: ['user-orders'] }
);

export const getCachedUserUsages = unstable_cache(
  async (userId: string) => {
    try {
      return await prisma.usage.findMany({ where: { userId } });
    } catch (e) {
      console.error("Failed to fetch user usages in cache:", e);
      return [];
    }
  },
  ['user-usages'],
  { revalidate: 86400, tags: ['user-usages'] }
);

