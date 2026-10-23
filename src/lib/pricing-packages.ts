export interface PricingPackageItem {
  name: string;
  desc: string;
  price: number;
  originalPrice: number;
  discountLabel: string;
  highlightText: string;
  features: string[];
  bundledProductIds: string[];
  isActive?: boolean;
}

export interface PromoBannerConfig {
  text: string;
  show: boolean;
}

export interface PricingPackagesConfig {
  PRO_BOOK: PricingPackageItem;
  PRO_TOOLS: PricingPackageItem;
  PRO_AUTOMATION: PricingPackageItem;
  PRO_PLUS: PricingPackageItem;
  packageOrder: string[];
  promoBanner: PromoBannerConfig;
  [key: string]: any;
}

export const DEFAULT_PACKAGE_ORDER = [
  "PRO_BOOK",
  "PRO_TOOLS",
  "PRO_AUTOMATION",
  "PRO_PLUS",
];

export const DEFAULT_PROMO_BANNER: PromoBannerConfig = {
  text: "PROMO hingga 95%",
  show: true,
};

export const DEFAULT_PRICING_PACKAGES: PricingPackagesConfig = {
  PRO_BOOK: {
    name: "Paket PRO BOOK",
    desc: "Cocok buat yang mau fokus belajar teori faceless creator.",
    price: 99000,
    originalPrice: 2419000,
    discountLabel: "95% OFF",
    highlightText: "",
    features: [
      "Ebook Ngonten Pakai AI (Personal Use)",
      "Ebook 30 Day Creator Challenge (Personal Use)",
      "Bimbingan Private 1-on-1 WhatsApp (6 Bulan)",
      "6+ Bonus Strategi & Template Lainnya",
    ],
    bundledProductIds: [],
    isActive: true,
  },
  PRO_TOOLS: {
    name: "Paket Sistem Tools",
    desc: "Cocok buat yang butuh bantuan AI untuk eksekusi ngonten.",
    price: 99000,
    originalPrice: 666000,
    discountLabel: "85% OFF",
    highlightText: "",
    features: [
      "Akses 8 Sistem AI Ngonten Pakai AI",
      "Ebook Ngonten Pakai AI (Included)",
      "Bonus 4 Resource Ekstra (Footage, Hook, Tools)",
      "Akses Selama 30 Hari",
    ],
    bundledProductIds: [],
    isActive: true,
  },
  PRO_AUTOMATION: {
    name: "Paket Pro Automation",
    desc: "Cocok buat yang ingin mengotomasi interaksi, auto DM & komentar Instagram 24/7.",
    price: 99000,
    originalPrice: 799000,
    discountLabel: "88% OFF",
    highlightText: "",
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
  PRO_PLUS: {
    name: "Paket Lengkap (Ebook)",
    desc: "Bonus terbanyak, akses jualan (PLR) dan Lifetime support.",
    price: 149000,
    originalPrice: 2419000,
    discountLabel: "94% OFF",
    highlightText: "PALING WORTH",
    features: [
      "Semua isi Paket Basic & Tools",
      "Akses Penuh Instagram Automation",
      "Hak Jual Ulang (PLR) untuk berbagai materi",
      "Bimbingan Private 1-on-1 (Lifetime)",
      "Tools Text to Voice Over & Video Footage",
    ],
    bundledProductIds: [],
    isActive: true,
  },
  packageOrder: DEFAULT_PACKAGE_ORDER,
  promoBanner: DEFAULT_PROMO_BANNER,
};

export function mergePricingConfig(rawConfig: any): PricingPackagesConfig {
  if (!rawConfig || typeof rawConfig !== "object") {
    return DEFAULT_PRICING_PACKAGES;
  }

  // Merge packages
  const merged: PricingPackagesConfig = {
    PRO_BOOK: {
      ...DEFAULT_PRICING_PACKAGES.PRO_BOOK,
      ...(rawConfig.PRO_BOOK || {}),
      isActive: rawConfig.PRO_BOOK?.isActive !== false,
      features: Array.isArray(rawConfig.PRO_BOOK?.features)
        ? rawConfig.PRO_BOOK.features
        : DEFAULT_PRICING_PACKAGES.PRO_BOOK.features,
      bundledProductIds: Array.isArray(rawConfig.PRO_BOOK?.bundledProductIds)
        ? rawConfig.PRO_BOOK.bundledProductIds
        : [],
    },
    PRO_TOOLS: {
      ...DEFAULT_PRICING_PACKAGES.PRO_TOOLS,
      ...(rawConfig.PRO_TOOLS || {}),
      isActive: rawConfig.PRO_TOOLS?.isActive !== false,
      features: Array.isArray(rawConfig.PRO_TOOLS?.features)
        ? rawConfig.PRO_TOOLS.features
        : DEFAULT_PRICING_PACKAGES.PRO_TOOLS.features,
      bundledProductIds: Array.isArray(rawConfig.PRO_TOOLS?.bundledProductIds)
        ? rawConfig.PRO_TOOLS.bundledProductIds
        : [],
    },
    PRO_AUTOMATION: {
      ...DEFAULT_PRICING_PACKAGES.PRO_AUTOMATION,
      ...(rawConfig.PRO_AUTOMATION || {}),
      isActive: rawConfig.PRO_AUTOMATION?.isActive !== false,
      features: Array.isArray(rawConfig.PRO_AUTOMATION?.features)
        ? rawConfig.PRO_AUTOMATION.features
        : DEFAULT_PRICING_PACKAGES.PRO_AUTOMATION.features,
      bundledProductIds: Array.isArray(rawConfig.PRO_AUTOMATION?.bundledProductIds)
        ? rawConfig.PRO_AUTOMATION.bundledProductIds
        : [],
    },
    PRO_PLUS: {
      ...DEFAULT_PRICING_PACKAGES.PRO_PLUS,
      ...(rawConfig.PRO_PLUS || {}),
      isActive: rawConfig.PRO_PLUS?.isActive !== false,
      features: Array.isArray(rawConfig.PRO_PLUS?.features)
        ? rawConfig.PRO_PLUS.features
        : DEFAULT_PRICING_PACKAGES.PRO_PLUS.features,
      bundledProductIds: Array.isArray(rawConfig.PRO_PLUS?.bundledProductIds)
        ? rawConfig.PRO_PLUS.bundledProductIds
        : [],
    },
    packageOrder: Array.isArray(rawConfig.packageOrder) && rawConfig.packageOrder.length > 0
      ? rawConfig.packageOrder
      : DEFAULT_PACKAGE_ORDER,
    promoBanner: {
      text: typeof rawConfig.promoBanner?.text === "string" && rawConfig.promoBanner.text.trim() !== ""
        ? rawConfig.promoBanner.text
        : typeof rawConfig.promoText === "string" && rawConfig.promoText.trim() !== ""
        ? rawConfig.promoText
        : DEFAULT_PROMO_BANNER.text,
      show: rawConfig.promoBanner?.show !== false,
    },
  };

  // Ensure all 4 package keys are present in packageOrder
  const validKeys = DEFAULT_PACKAGE_ORDER;
  const currentOrder = merged.packageOrder.filter((k) => validKeys.includes(k));
  for (const key of validKeys) {
    if (!currentOrder.includes(key)) {
      currentOrder.push(key);
    }
  }
  merged.packageOrder = currentOrder;

  return merged;
}
