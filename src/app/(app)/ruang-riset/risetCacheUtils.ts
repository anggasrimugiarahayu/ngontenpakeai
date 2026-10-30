import { mutate } from "swr";

export interface RisetSessionCache<TProfile = any, TItem = any> {
  platform: "instagram" | "tiktok" | "youtube" | "facebook";
  username: string;
  profile: TProfile;
  items: TItem[];
  timestamp: number;
}

const CACHE_PREFIX = "ruang_riset_cache_";
const MAX_CACHE_AGE_MS = 24 * 60 * 60 * 1000; // 24 jam cache sesi lokal

/**
 * Menyimpan hasil riset terakhir ke sessionStorage dan SWR cache
 */
export function saveRisetSessionCache<TProfile, TItem>(
  platform: "instagram" | "tiktok" | "youtube" | "facebook",
  username: string,
  profile: TProfile,
  items: TItem[]
) {
  if (typeof window === "undefined") return;

  const cachePayload: RisetSessionCache<TProfile, TItem> = {
    platform,
    username,
    profile,
    items,
    timestamp: Date.now(),
  };

  try {
    sessionStorage.setItem(
      `${CACHE_PREFIX}${platform}`,
      JSON.stringify(cachePayload)
    );
  } catch (err) {
    console.warn(`[RisetCache] Gagal menyimpan cache sesi ${platform}:`, err);
  }

  // Perbarui SWR cache di memori
  try {
    mutate(`riset_cache_${platform}`, cachePayload, false);
  } catch {
    // Abaikan jika SWR provider belum mount
  }
}

/**
 * Membaca hasil riset terakhir dari sessionStorage
 */
export function loadRisetSessionCache<TProfile, TItem>(
  platform: "instagram" | "tiktok" | "youtube" | "facebook"
): RisetSessionCache<TProfile, TItem> | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = sessionStorage.getItem(`${CACHE_PREFIX}${platform}`);
    if (!raw) return null;

    const data: RisetSessionCache<TProfile, TItem> = JSON.parse(raw);
    if (!data || !data.profile || !Array.isArray(data.items)) return null;

    // Periksa masa berlaku cache
    if (Date.now() - data.timestamp > MAX_CACHE_AGE_MS) {
      sessionStorage.removeItem(`${CACHE_PREFIX}${platform}`);
      return null;
    }

    return data;
  } catch (err) {
    console.warn(`[RisetCache] Gagal memuat cache sesi ${platform}:`, err);
    return null;
  }
}

/**
 * Menghapus cache sesi untuk platform tertentu
 */
export function clearRisetSessionCache(
  platform: "instagram" | "tiktok" | "youtube" | "facebook"
) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(`${CACHE_PREFIX}${platform}`);
    mutate(`riset_cache_${platform}`, null, false);
  } catch (err) {
    console.warn(`[RisetCache] Gagal menghapus cache sesi ${platform}:`, err);
  }
}
