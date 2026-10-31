import prisma from "@/lib/prisma";

export interface InstagramRisetConfig {
  instagramSessionId?: string;
  tiktokSessionId?: string;
  rapidApiKey?: string;
  rapidApiHost?: string;
  metaPageAccessToken?: string;
  instagramBusinessAccountId?: string;
  sessionStatus?: "VALID" | "EXPIRED" | "UNKNOWN";
  lastCheckedAt?: string;
  statusError?: string;
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
    tiktokSessionId:
      dbConfig.tiktokSessionId?.trim() ||
      process.env.TIKTOK_SESSION_ID?.trim() ||
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
    sessionStatus: dbConfig.sessionStatus || "UNKNOWN",
    lastCheckedAt: dbConfig.lastCheckedAt || "",
    statusError: dbConfig.statusError || "",
  };
}

export async function updateInstagramSessionStatus(
  status: "VALID" | "EXPIRED" | "UNKNOWN",
  errorMsg?: string
) {
  try {
    const row = await prisma.appSetting.findUnique({
      where: { key: RISET_CONFIG_KEY },
    });
    const current: InstagramRisetConfig = row?.value ? JSON.parse(row.value) : {};
    const updated: InstagramRisetConfig = {
      ...current,
      sessionStatus: status,
      lastCheckedAt: new Date().toISOString(),
      statusError: errorMsg || (status === "VALID" ? "" : current.statusError || ""),
    };
    await prisma.appSetting.upsert({
      where: { key: RISET_CONFIG_KEY },
      update: { value: JSON.stringify(updated) },
      create: { key: RISET_CONFIG_KEY, value: JSON.stringify(updated) },
    });
  } catch (err) {
    console.error("Failed to update instagram session status:", err);
  }
}
