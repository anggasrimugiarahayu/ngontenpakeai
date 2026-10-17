// Shared helpers & cover cache for Ruang Automation

// In-memory + localStorage cover cache so Post/Reels/Story covers render in 0ms without reloading
const memoryCoverCache: Record<string, string> = {};
const COVER_CACHE_STORAGE_KEY = "rcm_ig_cover_cache_v1";
let storageLoaded = false;

function ensureCoverCacheLoaded() {
  if (storageLoaded || typeof window === "undefined") return;
  storageLoaded = true;
  try {
    const raw = window.localStorage.getItem(COVER_CACHE_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        Object.assign(memoryCoverCache, parsed);
      }
    }
  } catch {
    // ignore storage errors
  }
}

export function getCachedCoverUrl(mediaId?: string | null): string | null {
  if (!mediaId) return null;
  ensureCoverCacheLoaded();
  return memoryCoverCache[String(mediaId)] || null;
}

export function setCachedCoverUrl(mediaId?: string | null, url?: string | null) {
  if (!mediaId || !url || typeof url !== "string") return;
  ensureCoverCacheLoaded();
  const key = String(mediaId);
  if (memoryCoverCache[key] === url) return;
  memoryCoverCache[key] = url;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(COVER_CACHE_STORAGE_KEY, JSON.stringify(memoryCoverCache));
    } catch {
      // ignore quota errors
    }
  }
}

export function syncMediaListToCoverCache(items: any[]) {
  if (!Array.isArray(items) || items.length === 0) return;
  ensureCoverCacheLoaded();
  let changed = false;
  for (const item of items) {
    if (!item?.id) continue;
    const url = item.thumb || item.image;
    if (url && typeof url === "string") {
      const key = String(item.id);
      if (memoryCoverCache[key] !== url) {
        memoryCoverCache[key] = url;
        changed = true;
      }
    }
  }
  if (changed && typeof window !== "undefined") {
    try {
      window.localStorage.setItem(COVER_CACHE_STORAGE_KEY, JSON.stringify(memoryCoverCache));
    } catch {
      // ignore
    }
  }
}

// Helper parse metadata log dari kolom errorMessage (__META__:{...})
export function parseClientLogMeta(errorMessage?: string | null): Record<string, any> {
  if (!errorMessage || typeof errorMessage !== "string") return {};
  if (errorMessage.startsWith("__META__:")) {
    try {
      return JSON.parse(errorMessage.slice("__META__:".length));
    } catch {
      return {};
    }
  }
  return {};
}

// Helper parse extendedConfig dari rule.dmMessage
export function parseClientRuleConfig(dmMessage?: string | null): Record<string, any> {
  if (!dmMessage || typeof dmMessage !== "string") return {};
  try {
    if (dmMessage.trim().startsWith("{") || dmMessage.includes('"mainMessage"')) {
      return JSON.parse(dmMessage);
    }
  } catch {
    return {};
  }
  return {};
}

// Helper Spintax Randomizer
export function parseSpintax(text: string): string {
  if (!text) return "";
  return text.replace(/\{([^{}]+)\}/g, (_, choices) => {
    const parts = choices.split("|");
    return parts[Math.floor(Math.random() * parts.length)];
  });
}

// Helper Variable Resolver for Instagram DM & Comment Live Preview
export function resolvePreviewVariables(text: string): string {
  if (!text) return "";
  let resolved = text
    .replace(/@\{username\}/g, "@ruangcreativemuslim")
    .replace(/\{username\}/g, "@ruangcreativemuslim")
    .replace(/\[Nama Pengguna\]/g, "@ruangcreativemuslim")
    .replace(/\{first_name\}/g, "Kak Harits")
    .replace(/\[Nama Depan\]/g, "Kak Harits")
    .replace(/\{last_name\}/g, "Creative")
    .replace(/\[Nama Belakang\]/g, "Creative")
    .replace(/\{full_name\}/g, "Kak Harits Creative")
    .replace(/\[Nama Lengkap\]/g, "Kak Harits Creative");
  try {
    resolved = parseSpintax(resolved);
  } catch {
    // ignore
  }
  return resolved;
}

// Sample Instagram Posts for feed selection & preview
export const SAMPLE_INSTAGRAM_POSTS = [
  {
    id: "post_1",
    title: "Kalau besok saya nggak punya penghasilan tetap lagi...",
    image: "/images/instagram/post-1-full.png",
    thumb: "/images/instagram/thumb-1-clean.png",
    caption: "Kehilangan penghasilan tetap bukan akhir segalanya kalau kamu punya sistem yang...",
    likes: 127,
    comments: 124,
    date: "14 Oct, 2026",
  },
  {
    id: "post_2",
    title: "Pak kalo kamu serius ngejalaninnya..",
    image: "/images/instagram/thumb-2-clean.png",
    thumb: "/images/instagram/thumb-2-clean.png",
    caption: "1 dari 10 niche ini mulai bisa gantiin gaji kantormu dalam 6 bulan ke depan. Luangkan 1 menit buat baca ini.",
    likes: 98,
    comments: 86,
    date: "12 Oct, 2026",
  },
  {
    id: "post_3",
    title: "Gini cara bapak-bapak usia 38+...",
    image: "/images/instagram/thumb-3-clean.png",
    thumb: "/images/instagram/thumb-3-clean.png",
    caption: "Ngonten tanpa nunjukin wajah, tapi bisa ngasilin 2-3x lipat gaji UMR dalam 30 hari. Aku bocorin di slide ini...",
    likes: 215,
    comments: 142,
    date: "10 Oct, 2026",
  },
  {
    id: "post_4",
    title: "Jangan resign...",
    image: "/images/instagram/thumb-4-clean.png",
    thumb: "/images/instagram/thumb-4-clean.png",
    caption: "Bikin IG baru, jangan kasih tahu orang lain, dan kejar 2 digit pakai cara ini.",
    likes: 310,
    comments: 198,
    date: "08 Oct, 2026",
  },
];
