import { unstable_cache } from 'next/cache';
import prisma from './prisma';

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
