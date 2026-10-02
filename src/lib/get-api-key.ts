import prisma from "@/lib/prisma";

export async function getApiKey(userApiKey?: string | null) {
  if (userApiKey) return userApiKey;
  
  const defaultKeySetting = await prisma.appSetting.findUnique({
    where: { key: "DEFAULT_GEMINI_API_KEY" }
  });

  return defaultKeySetting?.value || process.env.GEMINI_API_KEY;
}
