import prisma from "@/lib/prisma";

export interface InstagramRisetConfig {
  instagramSessionId?: string;
  rapidApiKey?: string;
  rapidApiHost?: string;
  metaPageAccessToken?: string;
  instagramBusinessAccountId?: string;
}

export const RISET_CONFIG_KEY = "instagram_riset_config";

export async function getResolvedRisetConfig(): Promise<Required<InstagramRisetConfig>> {
  let dbConfig: InstagramRisetConfig = {};
  try {
    const row = await prisma.appSetting.findUnique({
      where: { key: RISET_CONFIG_KEY },
    });
    if (row?.value) {
      dbConfig = JSON.parse(row.value);
    }
  } catch (err) {
    console.warn("Failed to read instagram_riset_config from AppSetting:", err);
  }

  return {
    instagramSessionId:
      dbConfig.instagramSessionId?.trim() ||
      process.env.INSTAGRAM_SESSION_ID?.trim() ||
      "",
    rapidApiKey:
      dbConfig.rapidApiKey?.trim() ||
      process.env.RAPIDAPI_KEY?.trim() ||
      process.env.INSTAGRAM_SCRAPER_API_KEY?.trim() ||
      "",
    rapidApiHost:
      dbConfig.rapidApiHost?.trim() ||
      process.env.RAPIDAPI_HOST?.trim() ||
      "instagram-scraper-api2.p.rapidapi.com",
    metaPageAccessToken:
      dbConfig.metaPageAccessToken?.trim() ||
      process.env.META_PAGE_ACCESS_TOKEN?.trim() ||
      "",
    instagramBusinessAccountId:
      dbConfig.instagramBusinessAccountId?.trim() ||
      process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID?.trim() ||
      "17841445108128356",
  };
}
