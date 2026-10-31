"use server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { unstable_cache, revalidatePath, revalidateTag } from "next/cache";
import { attachLightweightCovers } from "@/lib/ebook-covers";
import {
  addDurationToExpiry,
  computeUserSubscriptionStatus,
  resolvePackageMeta,
} from "@/lib/subscription-utils";

async function populateOrderAddons(orders: any[]) {
  if (!orders || orders.length === 0) return orders;
  const allAddonIds = Array.from(new Set(orders.flatMap((o: any) => o.addonIds || []))).filter(Boolean) as string[];
  const mainProductIds = Array.from(new Set(orders.map((o: any) => o.product?.id).filter(Boolean))) as string[];
  const combinedIds = Array.from(new Set([...allAddonIds, ...mainProductIds]));

  if (combinedIds.length === 0) {
    return orders.map((o: any) => ({ ...o, addons: [] }));
  }

  const rawAddonProducts = await prisma.digitalProduct.findMany({
    where: { id: { in: combinedIds } },
    select: { id: true, title: true, price: true, updatedAt: true }
  }).catch(() => []);
  const addonProducts = await attachLightweightCovers(rawAddonProducts, false);

  const addonMap = new Map(addonProducts.map((p: any) => [p.id, p]));

  return orders.map((o: any) => ({
    ...o,
    product: o.product ? { ...o.product, coverUrl: (addonMap.get(o.product.id) as any)?.coverUrl || null } : null,
    addons: (o.addonIds || []).map((id: string) => addonMap.get(id)).filter(Boolean)
  }));
}

async function calculateDashboardStats() {
  const now = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(now.getDate() - 30);
  const sixtyDaysAgo = new Date();
  sixtyDaysAgo.setDate(now.getDate() - 60);

  // Run all queries concurrently in a single parallel roundtrip
  const [
    totalUsers,
    totalProducts,
    activeProUsersCount,
    analyticsGroup,
    successfulOrders,
    topProducts,
    fullOrders,
    salesLast30,
    salesPrev30,
    viewsLast30,
    viewsPrev30,
    ordersLast30,
    analyticsLast30,
    pricingSetting,
  ] = await Promise.all([
    prisma.user.count().catch(() => 0),
    prisma.digitalProduct.count().catch(() => 0),
    prisma.user
      .count({
        where: {
          OR: [
            { role: "ADMIN" },
            { hasProBook: true },
            { proToolsExpiredAt: { gt: now } },
            { proAutomationExpiredAt: { gt: now } },
            { proRisetExpiredAt: { gt: now } },
            {
              orders: {
                some: {
                  status: "SUCCESS",
                  orderType: {
                    in: [
                      "PRO_BOOK",
                      "PRO_BOOK_PRO",
                      "PRO_PLUS",
                      "PRO_PLUS_1Y",
                    ],
                  },
                },
              },
            },
          ],
        },
      })
      .catch(() => 0),
    prisma.productAnalytics.groupBy({ by: ['digitalProductId'], _sum: { views: true, clicks: true } }).catch(() => []),
    prisma.order.aggregate({
      _sum: { amount: true },
      _count: { id: true },
      where: { status: 'SUCCESS' }
    }).catch(() => ({ _sum: { amount: 0 }, _count: { id: 0 } })),
    
    prisma.order.groupBy({
      by: ['digitalProductId', 'orderType'],
      _sum: { amount: true },
      _count: { id: true },
      where: { status: 'SUCCESS' },
      orderBy: { _sum: { amount: 'desc' } },
      take: 5
    }).catch(() => []),

    prisma.order.findMany({
      take: 50,
      include: {
        user: { select: { name: true, email: true, phone: true } },
        product: { select: { id: true, title: true, price: true, isProOnly: true } }
      },
      orderBy: { createdAt: 'desc' }
    }).catch(() => []),

    prisma.order.aggregate({
      _sum: { amount: true },
      where: { status: 'SUCCESS', createdAt: { gte: thirtyDaysAgo } }
    }).catch(() => ({ _sum: { amount: 0 } })),
    
    prisma.order.aggregate({
      _sum: { amount: true },
      where: { status: 'SUCCESS', createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } }
    }).catch(() => ({ _sum: { amount: 0 } })),
    
    prisma.productAnalytics.aggregate({
      _sum: { views: true, clicks: true },
      where: { date: { gte: thirtyDaysAgo } }
    }).catch(() => ({ _sum: { views: 0, clicks: 0 } })),
    
    prisma.productAnalytics.aggregate({
      _sum: { views: true, clicks: true },
      where: { date: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } }
    }).catch(() => ({ _sum: { views: 0, clicks: 0 } })),
    
    prisma.order.findMany({
      where: { status: 'SUCCESS', createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true, amount: true }
    }).catch(() => []),
    
    prisma.productAnalytics.findMany({
      where: { date: { gte: thirtyDaysAgo } },
      select: { date: true, views: true, clicks: true }
    }).catch(() => []),

    prisma.appSetting
      .findUnique({ where: { key: "PRICING_PACKAGES" } })
      .catch(() => null),
  ]);

  let rawPricingConfig: any = null;
  if (pricingSetting?.value) {
    try {
      rawPricingConfig = JSON.parse(pricingSetting.value);
    } catch {}
  }

  const totalUsersPro = activeProUsersCount;
  const totalUsersFree = Math.max(0, totalUsers - totalUsersPro);
  const totalSubscribers = activeProUsersCount;

  let totalViews = 0;
  let totalClicks = 0;
  let productAnalyticsMap: Record<string, { views: number, clicks: number }> = {};

  analyticsGroup.forEach(a => {
    totalViews += (a._sum.views || 0);
    totalClicks += (a._sum.clicks || 0);
    productAnalyticsMap[a.digitalProductId] = {
      views: a._sum.views || 0,
      clicks: a._sum.clicks || 0
    };
  });

  const lifetimeSalesIDR = successfulOrders._sum?.amount || 0;
  const lifetimeOrders = successfulOrders._count?.id || 0;

  const productIds = topProducts.map(p => p.digitalProductId).filter(Boolean) as string[];
  const rawProducts = await prisma.digitalProduct.findMany({
    where: { id: { in: productIds } },
    select: { id: true, title: true, slug: true, updatedAt: true }
  }).catch(() => []);
  const products = await attachLightweightCovers(rawProducts, false);

  // -- CALCULATIONS --
  const val30 = salesLast30._sum.amount || 0;
  const valPrev30 = salesPrev30._sum.amount || 0;
  const salesGrowth = valPrev30 === 0 ? (val30 > 0 ? 100 : 0) : (((val30 - valPrev30) / valPrev30) * 100);

  const valVC30 = (viewsLast30._sum.views || 0) + (viewsLast30._sum.clicks || 0);
  const valVCPrev30 = (viewsPrev30._sum.views || 0) + (viewsPrev30._sum.clicks || 0);
  const viewsGrowth = valVCPrev30 === 0 ? (valVC30 > 0 ? 100 : 0) : (((valVC30 - valVCPrev30) / valVCPrev30) * 100);

  const salesChartMap: Record<string, number> = {};
  ordersLast30.forEach(o => {
    const dateStr = o.createdAt.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
    salesChartMap[dateStr] = (salesChartMap[dateStr] || 0) + o.amount;
  });

  const viewsChartMap: Record<string, {views: number, clicks: number}> = {};
  analyticsLast30.forEach(a => {
    const dateStr = a.date.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
    if (!viewsChartMap[dateStr]) viewsChartMap[dateStr] = {views: 0, clicks: 0};
    viewsChartMap[dateStr].views += a.views;
    viewsChartMap[dateStr].clicks += a.clicks;
  });

  let salesChartData: any[] = [];
  let viewsChartData: any[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
    salesChartData.push({ date: dateStr, sales: salesChartMap[dateStr] || 0 });
    viewsChartData.push({ date: dateStr, views: viewsChartMap[dateStr]?.views || 0, clicks: viewsChartMap[dateStr]?.clicks || 0 });
  }


  const getProductImage = (p: any, productDef: any) => {
    if (productDef?.coverUrl) return productDef.coverUrl;
    const meta = resolvePackageMeta(p.orderType || "", rawPricingConfig);
    return meta.image || "/img_paket/paket_ebook.png";
  };

  const getProductTitle = (p: any, productDef: any) => {
    if (productDef?.title) return productDef.title;
    const meta = resolvePackageMeta(p.orderType || "", rawPricingConfig);
    return meta.name;
  };

  const realProductSales = topProducts.map(p => {
    const productDef = products.find(prod => prod.id === p.digitalProductId);
    const analytics = p.digitalProductId ? productAnalyticsMap[p.digitalProductId] : null; const finalAnalytics = analytics || { views: 0, clicks: 0 };
    const views = finalAnalytics.views;
    const sold = p._count.id;
    const conversion = views > 0 ? ((sold / views) * 100) : 0;

    return {
      id: p.digitalProductId || p.orderType,
      title: getProductTitle(p, productDef),
      views: views,

      sold: sold,
      amount: p._sum.amount || 0,
      conversion: parseFloat(conversion.toFixed(1)), 
      image: getProductImage(p, productDef),
      slug: productDef?.slug || null,
      orderType: p.orderType
    };
  });

  const [enrichedFullOrders, initialUsersData] = await Promise.all([
    populateOrderAddons(fullOrders),
    fetchAllDashboardUsersData().catch(() => ({
      users: [],
      total: 0,
    })),
  ]);

  return {
    totalUsers,
    totalUsersFree, 
    totalUsersPro,
    totalSubscribers,
    earningsIDR: lifetimeSalesIDR,
    lifetimeSalesIDR: lifetimeSalesIDR,
    lifetimeOrders: lifetimeOrders,
    totalDigitalProducts: totalProducts,
    totalViews,
    totalClicks,
    realProductSales: JSON.parse(JSON.stringify(realProductSales)),
    fullOrders: JSON.parse(JSON.stringify(enrichedFullOrders)),
    initialUsersData: JSON.parse(JSON.stringify(initialUsersData)),
    salesGrowth: parseFloat(salesGrowth.toFixed(2)),
    viewsGrowth: parseFloat(viewsGrowth.toFixed(2)),
    salesChartData,
    viewsChartData,
    pricingConfig: rawPricingConfig,
  };
}

const getCachedDashboardStats = unstable_cache(
  calculateDashboardStats,
  ['admin-dashboard-stats'],
  { revalidate: 3600, tags: ['admin-dashboard-stats'] }
);

export async function revalidateDashboardAction() {
  const session = await auth();
  if (!session?.user?.id || session?.user?.email !== "anggasrimugiarahayu@gmail.com") {
    return { success: false, message: "Unauthorized" };
  }
  
  const tags = [
    "admin-dashboard-stats",
    "admin-users-list",
    "global-stats",
    "user-session",
    "user-ownership",
    "user-orders",
    "user-usages",
    "ebook-catalog",
    "pricing-packages",
    "admin-config",
    "blueprint",
    "features",
    "niche-references"
  ];

  for (const tag of tags) {
    try {
      (revalidateTag as any)(tag, "default");
    } catch {
      try {
        (revalidateTag as any)(tag);
      } catch {}
    }
  }

  try {
    revalidatePath("/", "layout");
  } catch (err) {
    console.error("revalidatePath layout error:", err);
  }

  return { success: true };
}

export async function getDashboardDataAction(forceFresh = false) {
  const session = await auth();
  if (!session?.user?.id) return null;
  const isAdmin = session?.user?.email === "anggasrimugiarahayu@gmail.com";
  if (!isAdmin) return null;

  if (forceFresh) {
    return calculateDashboardStats();
  }
  return getCachedDashboardStats();
}

export async function getDashboardOrdersAction(page = 1, limit = 20, search = '', status = 'all') {
  const session = await auth();
  if (!session?.user?.id || session?.user?.email !== "anggasrimugiarahayu@gmail.com") return { orders: [], total: 0 };

  const where: any = {};
  if (status !== 'all') {
    where.status = status;
  }
  if (search) {
    where.OR = [
      { user: { name: { contains: search, mode: 'insensitive' } } },
      { user: { email: { contains: search, mode: 'insensitive' } } },
      { id: { contains: search, mode: 'insensitive' } }
    ];
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      take: limit,
      skip: (page - 1) * limit,
      include: {
        user: { select: { name: true, email: true, phone: true } },
        product: { select: { id: true, title: true, price: true, isProOnly: true } }
      },
      orderBy: { createdAt: 'desc' }
    }).catch(() => []),
    prisma.order.count({ where }).catch(() => 0)
  ]);

  const enrichedOrders = await populateOrderAddons(orders);

  return { orders: JSON.parse(JSON.stringify(enrichedOrders)), total };
}

export async function getAudienceInsightsAction() {
  const session = await auth();
  if (!session?.user?.id || session?.user?.email !== "anggasrimugiarahayu@gmail.com") return null;

  try {
    const users = await prisma.user.findMany({
      where: { onboardingCompleted: true },
      select: { preferences: true }
    });

    const aggregate = {
      niche: {} as Record<string, number>,
      struggle: {} as Record<string, number>,
      platform: {} as Record<string, number>,
      goal: {} as Record<string, number>,
      total: users.length
    };

    users.forEach(u => {
      if (u.preferences && typeof u.preferences === 'object') {
        const p = u.preferences as any;
        if (p.niche) aggregate.niche[p.niche] = (aggregate.niche[p.niche] || 0) + 1;
        if (p.struggle) aggregate.struggle[p.struggle] = (aggregate.struggle[p.struggle] || 0) + 1;
        if (p.platform) aggregate.platform[p.platform] = (aggregate.platform[p.platform] || 0) + 1;
        if (p.goal) aggregate.goal[p.goal] = (aggregate.goal[p.goal] || 0) + 1;
      }
    });

    return aggregate;
  } catch (error) {
    console.error("Error fetching audience insights:", error);
    return null;
  }
}

async function fetchAllDashboardUsersData() {
  const [rawUsers, pricingSetting] = await Promise.all([
    prisma.user
      .findMany({
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          image: true,
          role: true,
          hasProBook: true,
          proToolsExpiredAt: true,
          proAutomationExpiredAt: true,
          proRisetExpiredAt: true,
          orders: {
            select: {
              id: true,
              orderType: true,
              status: true,
              amount: true,
              createdAt: true,
              product: {
                select: {
                  id: true,
                  title: true,
                },
              },
            },
            orderBy: { createdAt: "desc" },
          },
          _count: {
            select: {
              orders: true,
              usages: true,
              ownedProducts: true,
            },
          },
        },
        orderBy: { id: "desc" },
      })
      .catch(() => []),
    prisma.appSetting
      .findUnique({ where: { key: "PRICING_PACKAGES" } })
      .catch(() => null),
  ]);

  let rawPricingConfig: any = null;
  if (pricingSetting?.value) {
    try {
      rawPricingConfig = JSON.parse(pricingSetting.value);
    } catch {}
  }

  const enrichedUsers = rawUsers.map((u: any) => {
    const successOrders = (u.orders || []).filter(
      (o: any) => o.status === "SUCCESS"
    );
    const subStatus = computeUserSubscriptionStatus(
      u,
      successOrders,
      rawPricingConfig
    );
    const resolvedOrders = (u.orders || []).map((o: any) => {
      if (o.orderType === "EBOOK" && o.product?.title) {
        return {
          ...o,
          resolvedTitle: o.product.title,
          resolvedPeriod: "Selamanya",
        };
      }
      const meta = resolvePackageMeta(o.orderType || "", rawPricingConfig);
      return {
        ...o,
        resolvedTitle: o.product?.title || meta.name,
        resolvedPeriod: meta.periodLabel,
      };
    });
    return {
      ...u,
      orders: resolvedOrders,
      subStatus,
    };
  });

  return {
    users: JSON.parse(JSON.stringify(enrichedUsers)),
    total: enrichedUsers.length,
  };
}

const getCachedAllDashboardUsers = unstable_cache(
  fetchAllDashboardUsersData,
  ["admin-all-users-list"],
  { revalidate: 3600, tags: ["admin-users-list", "admin-dashboard-stats"] }
);

export async function getAllDashboardUsersAction(forceFresh = false) {
  const session = await auth();
  if (
    !session?.user?.id ||
    session?.user?.email?.toLowerCase() !== "anggasrimugiarahayu@gmail.com"
  ) {
    return { users: [], total: 0 };
  }

  if (forceFresh) {
    return fetchAllDashboardUsersData();
  }
  return getCachedAllDashboardUsers();
}

export async function adminUpdateUserAccessAction(params: {
  userId: string;
  target: "book" | "tools" | "automation" | "riset" | "plus" | "revoke_all";
  mode: "grant" | "revoke";
  days?: number;
}) {
  const session = await auth();
  if (
    !session?.user?.id ||
    session?.user?.email?.toLowerCase() !== "anggasrimugiarahayu@gmail.com"
  ) {
    return { success: false, message: "Unauthorized" };
  }

  const { userId, target, mode, days = 30 } = params;
  if (!userId) {
    return { success: false, message: "User ID tidak valid" };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        hasProBook: true,
        proToolsExpiredAt: true,
        proAutomationExpiredAt: true,
        proRisetExpiredAt: true,
      },
    });

    if (!user) {
      return { success: false, message: "User tidak ditemukan" };
    }

    const now = new Date();
    const updateData: Record<string, any> = {};

    if (target === "revoke_all") {
      updateData.hasProBook = false;
      updateData.proToolsExpiredAt = null;
      updateData.proAutomationExpiredAt = null;
      updateData.proRisetExpiredAt = null;
      if (user.role !== "ADMIN") {
        updateData.role = "FREE";
      }
    } else if (target === "book") {
      updateData.hasProBook = mode === "grant";
      if (mode === "grant" && user.role !== "ADMIN") {
        updateData.role = "PRO";
      }
    } else if (target === "tools") {
      updateData.proToolsExpiredAt =
        mode === "grant"
          ? addDurationToExpiry(user.proToolsExpiredAt, days, now)
          : null;
      if (mode === "grant" && user.role !== "ADMIN") {
        updateData.role = "PRO";
      }
    } else if (target === "automation") {
      updateData.proAutomationExpiredAt =
        mode === "grant"
          ? addDurationToExpiry(user.proAutomationExpiredAt, days, now)
          : null;
      if (mode === "grant" && user.role !== "ADMIN") {
        updateData.role = "PRO";
      }
    } else if (target === "riset") {
      updateData.proRisetExpiredAt =
        mode === "grant"
          ? addDurationToExpiry(user.proRisetExpiredAt, days, now)
          : null;
      if (mode === "grant" && user.role !== "ADMIN") {
        updateData.role = "PRO";
      }
    } else if (target === "plus") {
      if (mode === "grant") {
        updateData.hasProBook = true;
        updateData.proToolsExpiredAt = addDurationToExpiry(
          user.proToolsExpiredAt,
          days,
          now
        );
        updateData.proAutomationExpiredAt = addDurationToExpiry(
          user.proAutomationExpiredAt,
          days,
          now
        );
        updateData.proRisetExpiredAt = addDurationToExpiry(
          user.proRisetExpiredAt,
          days,
          now
        );
        if (user.role !== "ADMIN") {
          updateData.role = "PRO";
        }
      }
    }

    const updatedDbUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        role: true,
        hasProBook: true,
        proToolsExpiredAt: true,
        proAutomationExpiredAt: true,
        proRisetExpiredAt: true,
        orders: {
          where: { status: "SUCCESS" },
          select: { orderType: true, status: true, createdAt: true },
        },
      },
    });

    // If granting book or plus, also unlock active PRO ebooks in userOwnedProduct
    if (mode === "grant" && (target === "book" || target === "plus")) {
      const proProducts = await prisma.digitalProduct.findMany({
        where: { isActive: true, accessLevel: "PRO" },
        select: { id: true },
      });
      if (proProducts.length > 0) {
        await prisma.userOwnedProduct
          .createMany({
            data: proProducts.map((p) => ({
              userId,
              digitalProductId: p.id,
            })),
            skipDuplicates: true,
          })
          .catch(() => null);
      }
    }

    const updatedSubStatus = computeUserSubscriptionStatus(
      updatedDbUser,
      updatedDbUser.orders || []
    );

    const tags = [
      "admin-dashboard-stats",
      "admin-users-list",
      "user-session",
      "user-ownership",
      "user-orders",
    ];
    for (const tag of tags) {
      try {
        (revalidateTag as any)(tag, "default");
      } catch {
        try {
          (revalidateTag as any)(tag);
        } catch {}
      }
    }

    try {
      revalidatePath("/", "layout");
    } catch {}

    return {
      success: true,
      message: "Status akses user berhasil diperbarui!",
      updatedFields: JSON.parse(
        JSON.stringify({
          role: updatedDbUser.role,
          hasProBook: updatedDbUser.hasProBook,
          proToolsExpiredAt: updatedDbUser.proToolsExpiredAt,
          proAutomationExpiredAt: updatedDbUser.proAutomationExpiredAt,
          proRisetExpiredAt: updatedDbUser.proRisetExpiredAt,
          subStatus: updatedSubStatus,
        })
      ),
    };
  } catch (error: any) {
    console.error("adminUpdateUserAccessAction error:", error);
    return {
      success: false,
      message: error?.message || "Gagal memperbarui akses user",
    };
  }
}
