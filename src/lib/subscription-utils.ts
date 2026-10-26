import {
  INITIAL_PACKAGES,
  mergePricingConfig,
  PricingCategoryKey,
} from "./pricing-packages";

export const ADMIN_EMAIL = "anggasrimugiarahayu@gmail.com";

export interface ResolvedPackageMeta {
  id: string;
  name: string;
  category: PricingCategoryKey | "single_ebook";
  durationDays: number;
  periodLabel: string;
  image: string;
  bundledProductIds: string[];
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
  } | null;
  rawPricingConfig?: any;
}) {
  const { orderType, currentUser, rawPricingConfig } = params;
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
  const isAdmin = Boolean(
    dbUser?.email?.toLowerCase() === ADMIN_EMAIL || dbUser?.role === "ADMIN"
  );

  const hasTools =
    isAdmin ||
    Boolean(
      dbUser?.proToolsExpiredAt && new Date(dbUser.proToolsExpiredAt) > now
    );

  const hasAutomation =
    isAdmin ||
    Boolean(
      dbUser?.proAutomationExpiredAt &&
        new Date(dbUser.proAutomationExpiredAt) > now
    );

  // Backward-compatible fallback for Riset orders purchased before proRisetExpiredAt column existed
  let effectiveRisetExpiry: Date | null = dbUser?.proRisetExpiredAt
    ? new Date(dbUser.proRisetExpiredAt)
    : null;

  if (!effectiveRisetExpiry && Array.isArray(userOrders)) {
    for (const o of userOrders) {
      if (o?.status && o.status !== "SUCCESS") continue;
      const meta = resolvePackageMeta(o?.orderType || "", rawPricingConfig);
      if (
        (meta.category === "riset" || meta.category === "plus") &&
        o?.createdAt
      ) {
        const exp = addDurationToExpiry(
          effectiveRisetExpiry,
          meta.durationDays || 30,
          new Date(o.createdAt)
        );
        if (!effectiveRisetExpiry || exp > effectiveRisetExpiry) {
          effectiveRisetExpiry = exp;
        }
      }
    }
  }

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
    proToolsExpiredAt: dbUser?.proToolsExpiredAt
      ? new Date(dbUser.proToolsExpiredAt).toISOString()
      : null,
    proAutomationExpiredAt: dbUser?.proAutomationExpiredAt
      ? new Date(dbUser.proAutomationExpiredAt).toISOString()
      : null,
    proRisetExpiredAt: effectiveRisetExpiry
      ? effectiveRisetExpiry.toISOString()
      : null,
  };
}
