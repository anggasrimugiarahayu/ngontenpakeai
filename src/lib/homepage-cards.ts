export interface HomepageCardConfig {
  id: string; // "ruang-belajar" | "ruang-ngonten" | "ruang-automation" | "ruang-riset"
  title: string;
  description: string;
  href: string;
  badgeText: string;
  showBadge: boolean;
  isActive: boolean;
}

export const DEFAULT_HOMEPAGE_CARDS: HomepageCardConfig[] = [
  {
    id: "ruang-belajar",
    title: "Ruang Belajar",
    description: "Dari dasar sampai strategi, pelajari ilmu yang kamu butuhkan untuk ngonten lebih terarah.",
    href: "/ruang-belajar",
    badgeText: "UPDATE BARU",
    showBadge: true,
    isActive: true,
  },
  {
    id: "ruang-ngonten",
    title: "Ruang Ngonten",
    description: "Dari ide sampai jadi konten, kerjakan semuanya lebih cepat dengan bantuan AI.",
    href: "/ruang-ngonten",
    badgeText: "",
    showBadge: false,
    isActive: true,
  },
  {
    id: "ruang-automation",
    title: "Ruang Automation",
    description: "Otomasi interaksi media sosial, balas komentar otomatis, dan kirim DM instan 24/7.",
    href: "/ruang-automation",
    badgeText: "COMING SOON",
    showBadge: true,
    isActive: true,
  },
  {
    id: "ruang-riset",
    title: "Ruang Riset",
    description: "Riset tren konten, analisis audiens, dan bedah kompetitor bareng AI, dari ide hingga eksekusi.",
    href: "/ruang-riset",
    badgeText: "COMING SOON",
    showBadge: true,
    isActive: true,
  },
];

export function mergeHomepageCards(stored: any): HomepageCardConfig[] {
  if (!Array.isArray(stored) || stored.length === 0) {
    return DEFAULT_HOMEPAGE_CARDS;
  }
  const result: HomepageCardConfig[] = [];
  const existingIds = new Set<string>();

  for (const item of stored) {
    const fallback = DEFAULT_HOMEPAGE_CARDS.find((d) => d.id === item?.id);
    if (fallback) {
      existingIds.add(fallback.id);
      result.push({
        id: fallback.id,
        title: typeof item.title === "string" ? item.title : fallback.title,
        description: typeof item.description === "string" ? item.description : fallback.description,
        href: fallback.href,
        badgeText: typeof item.badgeText === "string" ? item.badgeText : fallback.badgeText,
        showBadge: typeof item.showBadge === "boolean" ? item.showBadge : fallback.showBadge,
        isActive: typeof item.isActive === "boolean" ? item.isActive : fallback.isActive,
      });
    }
  }

  // If any default cards were omitted, add them at the end
  for (const def of DEFAULT_HOMEPAGE_CARDS) {
    if (!existingIds.has(def.id)) {
      result.push(def);
    }
  }

  return result;
}
