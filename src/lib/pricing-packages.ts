export type PricingCategoryKey = "ebook" | "tools" | "automation" | "riset" | "plus";

export interface PricingCategoryMeta {
  id: PricingCategoryKey;
  label: string;
  iconName: string;
  badge?: string;
  description: string;
}

export interface PricingPackageItem {
  id: string;
  category: PricingCategoryKey;
  name: string;
  desc: string;
  price: number;
  originalPrice: number;
  discountLabel: string;
  highlightText: string;
  periodLabel?: string; // e.g. "Sekali Bayar", "/bulan", "/3 bulan", "/tahun"
  subBillingText?: string; // e.g. "Hemat Rp 68.000 dibanding bulanan"
  durationDays?: number; // 0 = Lifetime, 30, 90, 365
  features: string[];
  bundledProductIds: string[];
  isActive?: boolean;
}

export interface PromoBannerConfig {
  text: string;
  show: boolean;
}

export interface PricingPackagesConfig {
  packages: Record<string, PricingPackageItem>;
  categoryOrder: Record<PricingCategoryKey, string[]>;
  promoBanner: PromoBannerConfig;
  [key: string]: any; // Backward compatible for config[packageId]
}

export const PRICING_CATEGORIES: PricingCategoryMeta[] = [
  {
    id: "ebook",
    label: "E-Book",
    iconName: "BookOpen",
    description: "Bahan belajar faceless creator terlengkap, akses seumur hidup.",
  },
  {
    id: "tools",
    label: "Tools",
    iconName: "Wrench",
    description: "8 Sistem AI untuk percepat produksi script, konten, dan riset.",
  },
  {
    id: "automation",
    label: "Automation",
    iconName: "Bot",
    badge: "Populer",
    description: "Otomasi interaksi, auto DM & balas komentar Instagram 24/7.",
  },
  {
    id: "riset",
    label: "Riset",
    iconName: "Search",
    description: "Bongkar Outlier Score & analisis video viral kompetitor.",
  },
  {
    id: "plus",
    label: "Paket Plus",
    iconName: "Gem",
    badge: "Paling Worth",
    description: "Akses komplit seluruh ekosistem: E-Book, Tools, Automation & Riset.",
  },
];

export const DEFAULT_PROMO_BANNER: PromoBannerConfig = {
  text: "PROMO hingga 95%",
  show: true,
};

export const INITIAL_PACKAGES: Record<string, PricingPackageItem> = {
  // 1. EBOOK
  PRO_BOOK: {
    id: "PRO_BOOK",
    category: "ebook",
    name: "Paket Ebook Starter",
    desc: "Cocok buat yang mau fokus belajar teori faceless creator.",
    price: 99000,
    originalPrice: 2419000,
    discountLabel: "95% OFF",
    highlightText: "",
    periodLabel: "Sekali Bayar",
    subBillingText: "Akses Selamanya",
    durationDays: 0,
    features: [
      "Ebook Ngonten Pakai AI (Personal Use)",
      "Ebook 30 Day Creator Challenge (Personal Use)",
      "6+ Bonus Strategi & Template Lainnya",
      "Akses Update Materi Selamanya",
    ],
    bundledProductIds: [],
    isActive: true,
  },
  PRO_BOOK_PRO: {
    id: "PRO_BOOK_PRO",
    category: "ebook",
    name: "Paket Ebook Pro (PLR)",
    desc: "Lengkap dengan Hak Jual Ulang (PLR) dan Bimbingan Private WhatsApp.",
    price: 149000,
    originalPrice: 2999000,
    discountLabel: "95% OFF",
    highlightText: "LENGKAP",
    periodLabel: "Sekali Bayar",
    subBillingText: "Akses Selamanya",
    durationDays: 0,
    features: [
      "Semua isi Paket Ebook Starter",
      "Hak Jual Ulang (PLR 100% Keuntungan Milik Anda)",
      "Bimbingan Private 1-on-1 WhatsApp (6 Bulan)",
      "Template Promosi & Copywriting Siap Pakai",
      "Akses Update Materi Selamanya",
    ],
    bundledProductIds: [],
    isActive: true,
  },

  // 2. TOOLS
  PRO_TOOLS: {
    id: "PRO_TOOLS",
    category: "tools",
    name: "Paket Tools 1 Bulan",
    desc: "Akses penuh 8 Sistem AI Ngonten untuk eksekusi konten harian.",
    price: 99000,
    originalPrice: 299000,
    discountLabel: "67% OFF",
    highlightText: "",
    periodLabel: "/bulan",
    durationDays: 30,
    features: [
      "Akses 8 Sistem AI Ngonten Pakai AI",
      "Script Builder, Carousel, Hook, Idea Rooms",
      "Bonus 4 Resource Ekstra (Footage & Tools)",
      "Masa Aktif 30 Hari",
    ],
    bundledProductIds: [],
    isActive: true,
  },
  PRO_TOOLS_3M: {
    id: "PRO_TOOLS_3M",
    category: "tools",
    name: "Paket Tools 3 Bulan",
    desc: "Paling pas untuk konsistensi ngonten selama 1 kuartal penuh.",
    price: 229000,
    originalPrice: 666000,
    discountLabel: "65% OFF",
    highlightText: "HEMAT 25%",
    periodLabel: "/3 bulan",
    subBillingText: "Hemat Rp 68.000 dibanding bulanan",
    durationDays: 90,
    features: [
      "Akses 8 Sistem AI Ngonten Pakai AI",
      "Script Builder, Carousel, Hook, Idea Rooms",
      "Bonus 4 Resource Ekstra (Footage & Tools)",
      "Masa Aktif 90 Hari (3 Bulan)",
    ],
    bundledProductIds: [],
    isActive: true,
  },
  PRO_TOOLS_1Y: {
    id: "PRO_TOOLS_1Y",
    category: "tools",
    name: "Paket Tools Tahunan",
    desc: "Komitmen jangka panjang untuk kreator serius dan agensi.",
    price: 699000,
    originalPrice: 1999000,
    discountLabel: "65% OFF",
    highlightText: "PALING HEMAT",
    periodLabel: "/tahun",
    subBillingText: "Hanya ~Rp 58k/bulan",
    durationDays: 365,
    features: [
      "Akses 8 Sistem AI Ngonten Selama 1 Tahun Penuh",
      "Akses Semua Fitur AI Baru yang Akan Dirilis",
      "Priority Server & Rendering AI Cepat",
      "Masa Aktif 365 Hari (1 Tahun)",
    ],
    bundledProductIds: [],
    isActive: true,
  },

  // 3. AUTOMATION
  PRO_AUTOMATION: {
    id: "PRO_AUTOMATION",
    category: "automation",
    name: "Paket Auto 1 Bulan",
    desc: "Otomasi interaksi, auto DM & komentar Instagram 24/7.",
    price: 99000,
    originalPrice: 299000,
    discountLabel: "67% OFF",
    highlightText: "",
    periodLabel: "/bulan",
    durationDays: 30,
    features: [
      "Koneksi Akun Instagram Bisnis & Creator",
      "Auto Balas Komentar Post & Reels Instan",
      "Auto Kirim Link / Kupon Diskon via DM",
      "Analitik Funnel Konversi Realtime",
      "Akses Selama 30 Hari",
    ],
    bundledProductIds: [],
    isActive: true,
  },
  PRO_AUTO_3M: {
    id: "PRO_AUTO_3M",
    category: "automation",
    name: "Paket Auto 3 Bulan",
    desc: "Amankan interaksi dan closing otomatis selama 3 bulan.",
    price: 229000,
    originalPrice: 799000,
    discountLabel: "71% OFF",
    highlightText: "HEMAT",
    periodLabel: "/3 bulan",
    subBillingText: "Hemat Rp 68.000 dibanding bulanan",
    durationDays: 90,
    features: [
      "Semua Fitur Paket Auto 1 Bulan",
      "Dukungan Multi Akun Instagram",
      "Auto Kirim Link / Kupon Diskon via DM",
      "Analitik Funnel Konversi Realtime",
      "Akses Selama 90 Hari (3 Bulan)",
    ],
    bundledProductIds: [],
    isActive: true,
  },
  PRO_AUTO_1Y: {
    id: "PRO_AUTO_1Y",
    category: "automation",
    name: "Paket Auto Tahunan",
    desc: "Otomatisasi bisnis Instagram tanpa jeda selama 1 tahun.",
    price: 699000,
    originalPrice: 1999000,
    discountLabel: "65% OFF",
    highlightText: "PALING HEMAT",
    periodLabel: "/tahun",
    subBillingText: "Hanya ~Rp 58k/bulan",
    durationDays: 365,
    features: [
      "Semua Fitur Instagram Automation 1 Tahun Penuh",
      "Prioritas Webhook & Kecepatan Respon DM Instan",
      "Unlimited Trigger Kata Kunci Post & Reels",
      "Masa Aktif 365 Hari (1 Tahun)",
    ],
    bundledProductIds: [],
    isActive: true,
  },

  // 4. RISET
  PRO_RISET_1M: {
    id: "PRO_RISET_1M",
    category: "riset",
    name: "Paket Riset 1 Bulan",
    desc: "Bongkar Outlier Score & konten kompetitor viral di Instagram.",
    price: 89000,
    originalPrice: 250000,
    discountLabel: "64% OFF",
    highlightText: "",
    periodLabel: "/bulan",
    durationDays: 30,
    features: [
      "Riset Akun & Kompetitor Instagram",
      "Bongkar Outlier Score & Konten Paling Viral",
      "Urutkan Reels Berdasarkan Views & Komentar",
      "Ekspor Naskah, Hook, & Data ke CSV/Excel",
      "Masa Aktif 30 Hari",
    ],
    bundledProductIds: [],
    isActive: true,
  },
  PRO_RISET_3M: {
    id: "PRO_RISET_3M",
    category: "riset",
    name: "Paket Riset 3 Bulan",
    desc: "Riset konsisten untuk menemukan pola konten pemenang setiap minggu.",
    price: 199000,
    originalPrice: 650000,
    discountLabel: "69% OFF",
    highlightText: "HEMAT",
    periodLabel: "/3 bulan",
    subBillingText: "Hanya ~Rp 66k/bulan",
    durationDays: 90,
    features: [
      "Semua Fitur Riset Instagram 1 Bulan",
      "Track Akun Kompetitor & Analisis Tren Berkala",
      "Akses Awal Fitur Riset TikTok & YouTube",
      "Masa Aktif 90 Hari (3 Bulan)",
    ],
    bundledProductIds: [],
    isActive: true,
  },
  PRO_RISET_1Y: {
    id: "PRO_RISET_1Y",
    category: "riset",
    name: "Paket Riset Tahunan",
    desc: "Database riset dan intelijen konten terlengkap selama 1 tahun.",
    price: 599000,
    originalPrice: 1800000,
    discountLabel: "67% OFF",
    highlightText: "PALING HEMAT",
    periodLabel: "/tahun",
    subBillingText: "Hanya ~Rp 49k/bulan",
    durationDays: 365,
    features: [
      "Akses Penuh Ruang Riset Selama 1 Tahun",
      "Akses Langsung Riset TikTok & YouTube Saat Rilis",
      "Kuota Pencarian & Ekspor Data Maksimal",
      "Masa Aktif 365 Hari (1 Tahun)",
    ],
    bundledProductIds: [],
    isActive: true,
  },

  // 5. PAKET PLUS
  PRO_PLUS: {
    id: "PRO_PLUS",
    category: "plus",
    name: "Paket Lengkap (Semua Akses)",
    desc: "Semua fitur E-Book, Tools, Automation, Riset, dan Bimbingan 1-on-1.",
    price: 149000,
    originalPrice: 3419000,
    discountLabel: "95% OFF",
    highlightText: "PALING WORTH",
    periodLabel: "/bulan + Lifetime Ebook",
    durationDays: 30,
    features: [
      "Semua Ebook Ngonten Pakai AI + Hak Jual Ulang (PLR)",
      "Akses Penuh 8 Sistem AI Tools",
      "Akses Penuh Instagram Automation",
      "Akses Penuh Ruang Riset Konten Viral",
      "Bimbingan Private 1-on-1 WhatsApp (Lifetime)",
    ],
    bundledProductIds: [],
    isActive: true,
  },
  PRO_PLUS_1Y: {
    id: "PRO_PLUS_1Y",
    category: "plus",
    name: "Bundle Ultimate VIP (1 Tahun)",
    desc: "Investasi terbaik untuk kreator, pebisnis online, dan agensi.",
    price: 999000,
    originalPrice: 4999000,
    discountLabel: "80% OFF",
    highlightText: "VIP ACCESS",
    periodLabel: "/tahun",
    subBillingText: "Akses Seluruh Ekosistem 1 Tahun Penuh",
    durationDays: 365,
    features: [
      "Hak Milik Selamanya (Lifetime) Seluruh E-Book + Lisensi PLR",
      "Akses 1 Tahun Penuh 8 Sistem AI Ngonten",
      "Akses 1 Tahun Penuh Instagram Automation",
      "Akses 1 Tahun Penuh Ruang Riset",
      "Bimbingan Private VIP 1-on-1 WhatsApp (Prioritas)",
    ],
    bundledProductIds: [],
    isActive: true,
  },
};

export const DEFAULT_CATEGORY_ORDER: Record<PricingCategoryKey, string[]> = {
  ebook: ["PRO_BOOK", "PRO_BOOK_PRO"],
  tools: ["PRO_TOOLS", "PRO_TOOLS_3M", "PRO_TOOLS_1Y"],
  automation: ["PRO_AUTOMATION", "PRO_AUTO_3M", "PRO_AUTO_1Y"],
  riset: ["PRO_RISET_1M", "PRO_RISET_3M", "PRO_RISET_1Y"],
  plus: ["PRO_PLUS", "PRO_PLUS_1Y"],
};

export function mergePricingConfig(rawConfig: any): PricingPackagesConfig {
  if (!rawConfig || typeof rawConfig !== "object") {
    const config: PricingPackagesConfig = {
      packages: { ...INITIAL_PACKAGES },
      categoryOrder: { ...DEFAULT_CATEGORY_ORDER },
      promoBanner: { ...DEFAULT_PROMO_BANNER },
    };
    for (const [key, val] of Object.entries(INITIAL_PACKAGES)) {
      config[key] = val;
    }
    return config;
  }

  // Determine packages
  const packages: Record<string, PricingPackageItem> = {};

  // Initialize with defaults
  for (const [key, defaultItem] of Object.entries(INITIAL_PACKAGES)) {
    packages[key] = { ...defaultItem };
  }

  // Merge packages from rawConfig.packages or direct properties
  const rawPackages = rawConfig.packages && typeof rawConfig.packages === "object"
    ? rawConfig.packages
    : rawConfig;

  for (const [key, val] of Object.entries(rawPackages)) {
    if (val && typeof val === "object" && typeof (val as any).name === "string") {
      const rawItem = val as any;
      const defaultItem = INITIAL_PACKAGES[key];

      // Auto-assign category if missing
      let category: PricingCategoryKey = rawItem.category;
      if (!category) {
        if (key.includes("BOOK") || key.includes("EBOOK")) category = "ebook";
        else if (key.includes("TOOLS")) category = "tools";
        else if (key.includes("AUTO")) category = "automation";
        else if (key.includes("RISET")) category = "riset";
        else if (key.includes("PLUS")) category = "plus";
        else category = defaultItem?.category || "ebook";
      }

      packages[key] = {
        id: key,
        category,
        name: rawItem.name || defaultItem?.name || "Paket " + key,
        desc: rawItem.desc || defaultItem?.desc || "",
        price: typeof rawItem.price === "number" ? rawItem.price : defaultItem?.price || 0,
        originalPrice: typeof rawItem.originalPrice === "number" ? rawItem.originalPrice : defaultItem?.originalPrice || 0,
        discountLabel: rawItem.discountLabel ?? defaultItem?.discountLabel ?? "",
        highlightText: rawItem.highlightText ?? defaultItem?.highlightText ?? "",
        periodLabel: rawItem.periodLabel ?? defaultItem?.periodLabel ?? "Sekali Bayar",
        subBillingText: rawItem.subBillingText ?? defaultItem?.subBillingText ?? "",
        durationDays: typeof rawItem.durationDays === "number" ? rawItem.durationDays : defaultItem?.durationDays ?? 30,
        features: Array.isArray(rawItem.features) ? rawItem.features : defaultItem?.features || [],
        bundledProductIds: Array.isArray(rawItem.bundledProductIds) ? rawItem.bundledProductIds : defaultItem?.bundledProductIds || [],
        isActive: rawItem.isActive !== false,
      };
    }
  }

  // Category order
  const categoryOrder: Record<PricingCategoryKey, string[]> = {
    ebook: [],
    tools: [],
    automation: [],
    riset: [],
    plus: [],
  };

  const rawCatOrder = rawConfig.categoryOrder || {};
  for (const cat of Object.keys(DEFAULT_CATEGORY_ORDER) as PricingCategoryKey[]) {
    const rawList = Array.isArray(rawCatOrder[cat]) ? rawCatOrder[cat] : null;
    const defaultList = DEFAULT_CATEGORY_ORDER[cat];

    if (rawList && rawList.length > 0) {
      categoryOrder[cat] = rawList.filter((k: string) => packages[k] && packages[k].category === cat);
      // Ensure any package with this category is included
      for (const [pkgId, pkg] of Object.entries(packages)) {
        if (pkg.category === cat && !categoryOrder[cat].includes(pkgId)) {
          categoryOrder[cat].push(pkgId);
        }
      }
    } else {
      categoryOrder[cat] = defaultList.filter((k) => packages[k]);
      for (const [pkgId, pkg] of Object.entries(packages)) {
        if (pkg.category === cat && !categoryOrder[cat].includes(pkgId)) {
          categoryOrder[cat].push(pkgId);
        }
      }
    }
  }

  const promoBanner: PromoBannerConfig = {
    text: typeof rawConfig.promoBanner?.text === "string" && rawConfig.promoBanner.text.trim() !== ""
      ? rawConfig.promoBanner.text
      : typeof rawConfig.promoText === "string" && rawConfig.promoText.trim() !== ""
      ? rawConfig.promoText
      : DEFAULT_PROMO_BANNER.text,
    show: rawConfig.promoBanner?.show !== false,
  };

  const config: PricingPackagesConfig = {
    packages,
    categoryOrder,
    promoBanner,
  };

  // Populate direct keys for backward compatibility (e.g. config[key] lookup in checkout/payment)
  for (const [key, pkg] of Object.entries(packages)) {
    config[key] = pkg;
  }

  return config;
}

export function generatePackageId(category: PricingCategoryKey): string {
  const prefix =
    category === "ebook"
      ? "PKG_EBOOK"
      : category === "tools"
      ? "PKG_TOOLS"
      : category === "automation"
      ? "PKG_AUTO"
      : category === "riset"
      ? "PKG_RISET"
      : "PKG_PLUS";
  return `${prefix}_${Date.now().toString(36).toUpperCase()}`;
}
