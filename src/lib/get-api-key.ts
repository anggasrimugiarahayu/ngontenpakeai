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

export async function getApiKey(userApiKey?: string | null) {
  if (userApiKey) return userApiKey;

  const defaultKey = await getCachedDefaultGeminiApiKey();
  return defaultKey || process.env.GEMINI_API_KEY;
}
