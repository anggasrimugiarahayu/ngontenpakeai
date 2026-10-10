import prisma from "@/lib/prisma";

export async function getDefaultAiModel(fallbackModel = "gemini-2.5-flash") {
  const defaultModel = await prisma.aiModel.findFirst({
    where: { isDefault: true, isActive: true }
  });

  return defaultModel?.modelId || fallbackModel;
}


export async function getFallbackAiModel(fallbackModel = "gemini-3.5-flash-lite") {
  const fallback = await prisma.aiModel.findFirst({
    where: { isFallback: true, isActive: true }
  });
  return fallback?.modelId || fallbackModel;
}
