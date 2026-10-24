import prisma from "@/lib/prisma";
import { unstable_cache } from "next/cache";

const getCachedDefaultModelId = unstable_cache(
  async () => {
    try {
      const defaultModel = await prisma.aiModel.findFirst({
        where: { isDefault: true, isActive: true },
        select: { modelId: true },
      });
      return defaultModel?.modelId || null;
    } catch {
      return null;
    }
  },
  ["default-ai-model-id"],
  { revalidate: 3600, tags: ["admin-config"] }
);

const getCachedFallbackModelId = unstable_cache(
  async () => {
    try {
      const fallback = await prisma.aiModel.findFirst({
        where: { isFallback: true, isActive: true },
        select: { modelId: true },
      });
      return fallback?.modelId || null;
    } catch {
      return null;
    }
  },
  ["fallback-ai-model-id"],
  { revalidate: 3600, tags: ["admin-config"] }
);

export async function getDefaultAiModel(fallbackModel = "gemini-2.5-flash") {
  const modelId = await getCachedDefaultModelId();
  return modelId || fallbackModel;
}

export async function getFallbackAiModel(fallbackModel = "gemini-3.5-flash-lite") {
  const modelId = await getCachedFallbackModelId();
  return modelId || fallbackModel;
}
