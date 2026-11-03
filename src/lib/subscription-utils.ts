import {
  INITIAL_PACKAGES,
  mergePricingConfig,
  PricingCategoryKey,
  BundledRoomsConfig,
} from "./pricing-packages";
import { isAdminEmail, isAdminUser, SUPER_ADMIN_EMAILS } from "./admin";

export const ADMIN_EMAIL = SUPER_ADMIN_EMAILS[0];

export interface ResolvedPackageMeta {
  id: string;
  name: string;
  category: PricingCategoryKey | "single_ebook";
  durationDays: number;
  periodLabel: string;
  image: string;
  bundledProductIds: string[];
  bundledRooms?: BundledRoomsConfig;
}

export function resolvePackageMeta(
  orderType: string,
  rawPricingConfig?: any
): ResolvedPackageMeta {
  const cleanType = (orderType || "").trim();

  if (cleanType === "EBOOK") {
    return {
      id: "EBOOK",
      name: "E-Book Satuan",
      category: "single_ebook",
      durationDays: 0,
      periodLabel: "Selamanya",
      image: "/img_paket/paket_ebook.png",
      bundledProductIds: [],
    };
  }

  const merged = rawPricingConfig
    ? mergePricingConfig(rawPricingConfig)
    : null;
  const pkg =
    merged?.packages?.[cleanType] ||
    merged?.[cleanType] ||
    INITIAL_PACKAGES[cleanType];

  if (pkg) {
    const cat = pkg.category;
    const defaultDays =
      cat === "ebook"
        ? 0
        : cleanType.endsWith("_1Y")
        ? 365
        : cleanType.endsWith("_3M")
        ? 90
        : 30;
    const durationDays =
      typeof pkg.durationDays === "number" ? pkg.durationDays : defaultDays;

    const image =
      cat === "ebook"
        ? "/img_paket/paket_ebook.png"
        : cat === "tools"
        ? "/img_paket/paket_tools.png"
        : "/img_paket/paket_lengkap.png";

    return {
      id: cleanType,
      name: pkg.name || cleanType,
      category: cat,
      durationDays,
      periodLabel: pkg.periodLabel || (durationDays === 0 ? "Selamanya" : `${durationDays} Hari`),
      image,
      bundledProductIds: Array.isArray(pkg.bundledProductIds)
        ? pkg.bundledProductIds
        : [],
      bundledRooms: pkg.bundledRooms,
    };
  }

  // Fallback pattern detection for custom or legacy orderType keys
  const upper = cleanType.toUpperCase();
  let category: PricingCategoryKey = "tools";
  if (upper.includes("PLUS")) category = "plus";
  else if (upper.includes("RISET")) category = "riset";
  else if (upper.includes("AUTO")) category = "automation";
  else if (upper.includes("TOOLS")) category = "tools";
  else if (upper.includes("BOOK")) category = "ebook";

  const durationDays =
    category === "ebook"
      ? 0
      : upper.endsWith("_1Y")
      ? 365
      : upper.endsWith("_3M")
      ? 90
      : 30;

  const fallbackNameMap: Record<string, string> = {
    PRO_BOOK: "Paket Ebook Starter",
    PRO_BOOK_PRO: "Paket Ebook Pro (PLR)",
    PRO_TOOLS: "Paket Tools 1 Bulan",
    PRO_TOOLS_3M: "Paket Tools 3 Bulan",
    PRO_TOOLS_1Y: "Paket Tools Tahunan",
    PRO_AUTOMATION: "Paket Auto 1 Bulan",
    PRO_AUTO_3M: "Paket Auto 3 Bulan",
    PRO_AUTO_1Y: "Paket Auto Tahunan",
    PRO_RISET_1M: "Paket Riset 1 Bulan",
    PRO_RISET_3M: "Paket Riset 3 Bulan",
    PRO_RISET_1Y: "Paket Riset Tahunan",
    PRO_PLUS: "Paket Lengkap (Semua Akses)",
    PRO_PLUS_1Y: "Bundle Ultimate VIP (1 Tahun)",
    TOOLS: "Paket Tools",
  };

  const image =
    category === "ebook"
      ? "/img_paket/paket_ebook.png"
      : category === "tools"
      ? "/img_paket/paket_tools.png"
      : "/img_paket/paket_lengkap.png";

  return {
    id: cleanType,
    name: fallbackNameMap[cleanType] || `Paket ${cleanType.replace(/_/g, " ")}`,
    category,
    durationDays,
    periodLabel: durationDays === 0 ? "Selamanya" : `${durationDays} Hari`,
    image,
    bundledProductIds: [],
  };
}

export function isBookPackageOrder(
  orderType?: string | null,
  rawPricingConfig?: any
): boolean {
  if (!orderType || orderType === "EBOOK") return false;
  const meta = resolvePackageMeta(orderType, rawPricingConfig);
  return meta.category === "ebook" || meta.category === "plus";
}

/**
 * Mengambil seluruh ID produk digital yang di-include ke dalam paket-paket
 * yang berhasil dibeli oleh user berdasarkan konfigurasi pricing terkini.
 * Memastikan bila admin menambahkan produk ke-7 ke Paket 99K di kemudian hari,
 * pembeli lama langsung otomatis memperoleh produk tersebut saat membuka aplikasi.
 */
export function resolveUserPackageBundledProductIds(
  userOrders: any[] = [],
  rawPricingConfig?: any
): string[] {
  const ids = new Set<string>();
  if (!Array.isArray(userOrders)) return [];
  for (const o of userOrders) {
    if (o?.status && o.status !== "SUCCESS") continue;
    const meta = resolvePackageMeta(o?.orderType || "", rawPricingConfig);
    if (Array.isArray(meta.bundledProductIds)) {
      meta.bundledProductIds.forEach((pid) => {
        if (pid) ids.add(pid);
      });
    }
  }
  return Array.from(ids);
}

export function addDurationToExpiry(
  currentExpiry: Date | string | null | undefined,
  daysToAdd: number,
  now: Date = new Date()
): Date {
  const validDays = daysToAdd > 0 ? daysToAdd : 30;
  const parsedCurrent = currentExpiry ? new Date(currentExpiry) : null;
  const baseDate =
    parsedCurrent && !isNaN(parsedCurrent.getTime()) && parsedCurrent > now
      ? new Date(parsedCurrent.getTime())
      : new Date(now.getTime());

  baseDate.setDate(baseDate.getDate() + validDays);
  return baseDate;
}

export function calculateSubscriptionFulfillment(params: {
  orderType: string;
  currentUser: {
    role?: string | null;
    hasProBook?: boolean | null;
    proToolsExpiredAt?: Date | string | null;
    proAutomationExpiredAt?: Date | string | null;
    proRisetExpiredAt?: Date | string | null;
    automationAgentLimit?: number | null;
  } | null;
  rawPricingConfig?: any;
  isAddingAgentSlot?: boolean;
}) {
  const { orderType, currentUser, rawPricingConfig, isAddingAgentSlot } = params;
  const meta = resolvePackageMeta(orderType, rawPricingConfig);
  const now = new Date();
  const days = meta.durationDays > 0 ? meta.durationDays : 30;

  const updateData: Record<string, any> = {
    role: currentUser?.role === "ADMIN" ? "ADMIN" : "PRO",
  };

  if (meta.category === "ebook") {
    updateData.hasProBook = true;
  } else if (meta.category === "tools") {
    updateData.proToolsExpiredAt = addDurationToExpiry(
      currentUser?.proToolsExpiredAt,
      days,
      now
    );
  } else if (meta.category === "automation") {
    updateData.proAutomationExpiredAt = addDurationToExpiry(
      currentUser?.proAutomationExpiredAt,
      days,
      now
    );
    // Tambah slot agen jika user membeli paket saat semua slot aktif sudah terisi penuh
    const currentLimit = Math.max(1, currentUser?.automationAgentLimit || 1);
    updateData.automationAgentLimit = isAddingAgentSlot ? currentLimit + 1 : currentLimit;
  } else if (meta.category === "riset") {
    updateData.proRisetExpiredAt = addDurationToExpiry(
      currentUser?.proRisetExpiredAt,
      days,
      now
    );
  } else if (meta.category === "plus") {
    updateData.hasProBook = true;
    updateData.proToolsExpiredAt = addDurationToExpiry(
      currentUser?.proToolsExpiredAt,
      days,
      now
    );
    updateData.proAutomationExpiredAt = addDurationToExpiry(
      currentUser?.proAutomationExpiredAt,
      days,
      now
    );
    updateData.proRisetExpiredAt = addDurationToExpiry(
      currentUser?.proRisetExpiredAt,
      days,
      now
    );
  }

  // Cross-room bundling fulfillment (misal paket E-Book atau Tools meng-include akses ruang lain)
  if (meta.bundledRooms) {
    if (meta.bundledRooms.toolsDays && meta.bundledRooms.toolsDays > 0) {
      updateData.proToolsExpiredAt = addDurationToExpiry(
        updateData.proToolsExpiredAt || currentUser?.proToolsExpiredAt,
        meta.bundledRooms.toolsDays,
        now
      );
    }
    if (meta.bundledRooms.risetDays && meta.bundledRooms.risetDays > 0) {
      updateData.proRisetExpiredAt = addDurationToExpiry(
        updateData.proRisetExpiredAt || currentUser?.proRisetExpiredAt,
        meta.bundledRooms.risetDays,
        now
      );
    }
    if (meta.bundledRooms.automationDays && meta.bundledRooms.automationDays > 0) {
      updateData.proAutomationExpiredAt = addDurationToExpiry(
        updateData.proAutomationExpiredAt || currentUser?.proAutomationExpiredAt,
        meta.bundledRooms.automationDays,
        now
      );
    }
  }

  return {
    meta,
    updateData,
  };
}

export interface UserSubscriptionStatus {
  isAdmin: boolean;
  hasBook: boolean;
  hasTools: boolean;
  hasAutomation: boolean;
  hasRiset: boolean;
  activePillarsCount: number;
  isPro: boolean;
  isFullyPro: boolean;
  badgeName:
    | "ADMIN"
    | "PRO PLUS"
    | "PRO AUTO"
    | "PRO RISET"
    | "PRO TOOLS"
    | "PRO BOOK"
    | "FREE";
  proToolsExpiredAt: string | null;
  proAutomationExpiredAt: string | null;
  proRisetExpiredAt: string | null;
}

export function computeUserSubscriptionStatus(
  dbUser: any,
  userOrders: any[] = [],
  rawPricingConfig?: any
): UserSubscriptionStatus {
  const now = new Date();
  const isAdmin = isAdminUser(dbUser);

  let effectiveToolsExpiry: Date | null = dbUser?.proToolsExpiredAt
    ? new Date(dbUser.proToolsExpiredAt)
    : null;
  let effectiveAutoExpiry: Date | null = dbUser?.proAutomationExpiredAt
    ? new Date(dbUser.proAutomationExpiredAt)
    : null;
  let effectiveRisetExpiry: Date | null = dbUser?.proRisetExpiredAt
    ? new Date(dbUser.proRisetExpiredAt)
    : null;

  if (Array.isArray(userOrders)) {
    for (const o of userOrders) {
      if (o?.status && o.status !== "SUCCESS") continue;
      const meta = resolvePackageMeta(o?.orderType || "", rawPricingConfig);
      const orderDate = o?.createdAt ? new Date(o.createdAt) : now;

      // Backward-compatible fallback for Riset orders purchased before proRisetExpiredAt column existed
      if (
        (meta.category === "riset" || meta.category === "plus") &&
        o?.createdAt
      ) {
        const exp = addDurationToExpiry(
          effectiveRisetExpiry,
          meta.durationDays || 30,
          orderDate
        );
        if (!effectiveRisetExpiry || exp > effectiveRisetExpiry) {
          effectiveRisetExpiry = exp;
        }
      }

      // Check bundledRooms dynamic cross-room bonus
      if (meta.bundledRooms) {
        if (meta.bundledRooms.toolsDays && meta.bundledRooms.toolsDays > 0) {
          const exp = addDurationToExpiry(
            effectiveToolsExpiry,
            meta.bundledRooms.toolsDays,
            orderDate
          );
          if (!effectiveToolsExpiry || exp > effectiveToolsExpiry) {
            effectiveToolsExpiry = exp;
          }
        }
        if (meta.bundledRooms.risetDays && meta.bundledRooms.risetDays > 0) {
          const exp = addDurationToExpiry(
            effectiveRisetExpiry,
            meta.bundledRooms.risetDays,
            orderDate
          );
          if (!effectiveRisetExpiry || exp > effectiveRisetExpiry) {
            effectiveRisetExpiry = exp;
          }
        }
        if (meta.bundledRooms.automationDays && meta.bundledRooms.automationDays > 0) {
          const exp = addDurationToExpiry(
            effectiveAutoExpiry,
            meta.bundledRooms.automationDays,
            orderDate
          );
          if (!effectiveAutoExpiry || exp > effectiveAutoExpiry) {
            effectiveAutoExpiry = exp;
          }
        }
      }
    }
  }

  const hasTools =
    isAdmin ||
    Boolean(effectiveToolsExpiry && effectiveToolsExpiry > now);

  const hasAutomation =
    isAdmin ||
    Boolean(effectiveAutoExpiry && effectiveAutoExpiry > now);

  const hasRiset =
    isAdmin || Boolean(effectiveRisetExpiry && effectiveRisetExpiry > now);

  const hasOrderBook = Array.isArray(userOrders)
    ? userOrders.some(
        (o: any) =>
          (!o?.status || o.status === "SUCCESS") &&
          isBookPackageOrder(o?.orderType, rawPricingConfig)
      )
    : false;

  const hasBook = isAdmin || Boolean(dbUser?.hasProBook) || hasOrderBook;

  const activePillarsCount = [
    hasBook,
    hasTools,
    hasAutomation,
    hasRiset,
  ].filter(Boolean).length;

  const isPro = isAdmin || activePillarsCount > 0;
  const isFullyPro =
    isAdmin || (hasBook && hasTools && hasAutomation && hasRiset);

  let badgeName: UserSubscriptionStatus["badgeName"] = "FREE";
  if (isAdmin) {
    badgeName = "ADMIN";
  } else if (activePillarsCount >= 2) {
    badgeName = "PRO PLUS";
  } else if (hasAutomation) {
    badgeName = "PRO AUTO";
  } else if (hasRiset) {
    badgeName = "PRO RISET";
  } else if (hasTools) {
    badgeName = "PRO TOOLS";
  } else if (hasBook) {
    badgeName = "PRO BOOK";
  }

  return {
    isAdmin,
    hasBook,
    hasTools,
    hasAutomation,
    hasRiset,
    activePillarsCount,
    isPro,
    isFullyPro,
    badgeName,
    proToolsExpiredAt: effectiveToolsExpiry
      ? effectiveToolsExpiry.toISOString()
      : null,
    proAutomationExpiredAt: effectiveAutoExpiry
      ? effectiveAutoExpiry.toISOString()
      : null,
    proRisetExpiredAt: effectiveRisetExpiry
      ? effectiveRisetExpiry.toISOString()
      : null,
  };
}
