/**
 * Single Source of Truth untuk Seluruh Fitur Platform Ruang Creative Muslim
 */

export type FeatureCategory = "belajar" | "ngonten" | "automation" | "riset";

export interface PlatformFeatureDef {
  id: string;
  name: string;
  slug: string;
  href: string;
  category: FeatureCategory;
  description: string;
  isProOnlyDefault: boolean;
  aliases?: readonly string[];
}

export const PLATFORM_FEATURES: Record<string, PlatformFeatureDef> = {
  // 1. Ruang Ngonten
  CONTENT_CALENDAR: {
    id: "content-calendar",
    name: "Content Calendar",
    slug: "content-calendar",
    href: "/ruang-ngonten/content-calendar",
    category: "ngonten",
    description: "Jadwalkan postingan konten mingguan/bulanan otomatis dengan arahan tema cerdas.",
    isProOnlyDefault: false,
  },
  MASTER_BLUEPRINT: {
    id: "master-blueprint",
    name: "Master Blueprint",
    slug: "master-blueprint",
    href: "/ruang-ngonten/master-blueprint",
    category: "ngonten",
    description: "Fondasi profil, positioning, persona audiens, dan pilar konten akun Anda.",
    isProOnlyDefault: false,
  },
  BIO_BUILDER: {
    id: "bio-builder",
    name: "Bio Builder",
    slug: "bio-builder",
    href: "/ruang-ngonten/bio-builder",
    category: "ngonten",
    description: "Rancang bio profil profesional dengan hook tajam dan Call-To-Action terarah.",
    isProOnlyDefault: false,
  },
  CAROUSEL_BUILDER: {
    id: "carousel-builder",
    name: "Carousel Builder",
    slug: "carousel-builder",
    href: "/ruang-ngonten/carousel-builder",
    category: "ngonten",
    description: "Buat alur slide carousel edukasi dan storytelling slide demi slide siap tayang.",
    isProOnlyDefault: true,
    aliases: ["Carousel Prompt Builder", "Carousel Builder"],
  },
  ATM_BUILDER: {
    id: "atm-builder",
    name: "ATM Content Builder",
    slug: "atm-builder",
    href: "/ruang-ngonten/atm-builder",
    category: "ngonten",
    description: "Strategi Amati, Tiru, dan Modifikasi konten yang sudah terbukti sukses.",
    isProOnlyDefault: false,
    aliases: ["ATM Content Builder", "ATM Builder"],
  },
  EBOOK_BUILDER: {
    id: "ebook-builder",
    name: "Ebook Builder",
    slug: "ebook-builder",
    href: "/ruang-ngonten/ebook-builder",
    category: "ngonten",
    description: "Susun bab demi bab buku digital atau lead magnet edukatif dalam hitungan menit.",
    isProOnlyDefault: true,
    aliases: ["Ebook Prompt Builder", "Ebook Builder"],
  },
  SCRIPT_BUILDER: {
    id: "script-builder",
    name: "Script Builder",
    slug: "script-builder",
    href: "/ruang-ngonten/script-builder",
    category: "ngonten",
    description: "Tulis naskah video pendek (Reels, TikTok, Shorts) dengan formula hook & CTA viral.",
    isProOnlyDefault: false,
  },
  IDEA_ROOMS: {
    id: "idea-rooms",
    name: "Idea Rooms",
    slug: "idea-rooms",
    href: "/ruang-ngonten/idea-rooms",
    category: "ngonten",
    description: "Koleksi ribuan ide konten terstruktur per topik dan industri sasaran.",
    isProOnlyDefault: false,
  },

  // 2. Ruang Automation
  INSTAGRAM_AUTOMATION: {
    id: "instagram-automation",
    name: "Instagram Automation",
    slug: "instagram-automation",
    href: "/ruang-automation",
    category: "automation",
    description: "Balas komentar dan kirim DM otomatis berbasis kata kunci dengan integrasi resmi Meta API.",
    isProOnlyDefault: true,
  },

  // 3. Ruang Riset
  RISET_INSTAGRAM: {
    id: "riset-instagram",
    name: "Riset Instagram",
    slug: "instagram",
    href: "/ruang-riset?tab=instagram",
    category: "riset",
    description: "Analisis postingan kompetitor, tingkat outlier, dan engagement konten Instagram.",
    isProOnlyDefault: false,
  },
  RISET_YOUTUBE: {
    id: "riset-youtube",
    name: "Riset YouTube",
    slug: "youtube",
    href: "/ruang-riset?tab=youtube",
    category: "riset",
    description: "Bongkar video terpopuler, thumbnail, dan retensi channel YouTube kompetitor.",
    isProOnlyDefault: false,
  },
  RISET_TIKTOK: {
    id: "riset-tiktok",
    name: "Riset TikTok",
    slug: "tiktok",
    href: "/ruang-riset?tab=tiktok",
    category: "riset",
    description: "Temukan sound trending, topik viral FYP, dan formula video pendek TikTok.",
    isProOnlyDefault: false,
  },
  RISET_FACEBOOK: {
    id: "riset-facebook",
    name: "Riset Facebook",
    slug: "facebook",
    href: "/ruang-riset?tab=facebook",
    category: "riset",
    description: "Pantau performa postingan dan reaksi audiens pada Facebook Page & grup.",
    isProOnlyDefault: false,
  },
} as const;

export type PlatformFeatureKey = keyof typeof PLATFORM_FEATURES;

export function getFeatureByName(name: string): PlatformFeatureDef | undefined {
  const clean = name.toLowerCase().trim();
  return Object.values(PLATFORM_FEATURES).find((f: PlatformFeatureDef) => {
    if (f.name.toLowerCase() === clean) return true;
    if (f.aliases && f.aliases.some((a: string) => a.toLowerCase() === clean)) return true;
    return false;
  });
}

export function getFeaturesByCategory(category: FeatureCategory): PlatformFeatureDef[] {
  return Object.values(PLATFORM_FEATURES).filter((f: PlatformFeatureDef) => f.category === category);
}
