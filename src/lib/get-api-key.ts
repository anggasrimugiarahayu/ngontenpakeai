import prisma from "@/lib/prisma";
import { unstable_cache } from "next/cache";

const getCachedDefaultGeminiApiKey = unstable_cache(
  async () => {
    try {
      const defaultKeySetting = await prisma.appSetting.findUnique({
        where: { key: "DEFAULT_GEMINI_API_KEY" },
        select: { value: true },
      });
      return defaultKeySetting?.value || null;
    } catch {
      return null;
    }
  },
  ["default-gemini-api-key"],
  { revalidate: 3600, tags: ["admin-config"] }
);

const getCachedDefaultGroqApiKey = unstable_cache(
  async () => {
    try {
      const defaultKeySetting = await prisma.appSetting.findUnique({
        where: { key: "DEFAULT_GROQ_API_KEY" },
        select: { value: true },
      });
      return defaultKeySetting?.value || null;
    } catch {
      return null;
    }
  },
  ["default-groq-api-key"],
  { revalidate: 3600, tags: ["admin-config"] }
);

export async function getApiKey(userApiKey?: string | null) {
  if (userApiKey) return userApiKey;

  const defaultKey = await getCachedDefaultGeminiApiKey();
  return defaultKey || process.env.GEMINI_API_KEY;
}

export async function getGroqApiKey(userApiKey?: string | null) {
  if (userApiKey) return userApiKey;

  const defaultKey = await getCachedDefaultGroqApiKey();
  return defaultKey || process.env.GROQ_API_KEY;
}
