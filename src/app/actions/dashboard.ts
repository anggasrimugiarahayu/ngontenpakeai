"use server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { unstable_cache, revalidatePath, revalidateTag } from "next/cache";
import { attachLightweightCovers } from "@/lib/ebook-covers";

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

export async function calculateDashboardStats() {
  const now = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(now.getDate() - 30);
  const sixtyDaysAgo = new Date();
  sixtyDaysAgo.setDate(now.getDate() - 60);

  // Run all 13 queries concurrently in a single parallel roundtrip
  const [
    totalUsers,
    totalProducts,
    userRoles,
    analyticsGroup,
    successfulOrders,
    topProducts,
    fullOrders,
    salesLast30,
    salesPrev30,
    viewsLast30,
    viewsPrev30,
    ordersLast30,
    analyticsLast30
  ] = await Promise.all([
    prisma.user.count().catch(() => 0),
    prisma.digitalProduct.count().catch(() => 0),
    prisma.user.groupBy({ by: ['role'], _count: { id: true } }).catch(() => []),
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
    }).catch(() => [])
  ]);

  let totalUsersFree = 0;
  let totalUsersPro = 0;
  let totalSubscribers = 0;

  userRoles.forEach(ur => {
    if (ur.role === 'PRO') {
      totalUsersPro += ur._count.id;
      totalSubscribers += ur._count.id;
    } else if (ur.role === 'ADMIN') {
      totalUsersPro += ur._count.id;
    } else {
      totalUsersFree += ur._count.id;
    }
  });

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
    switch(p.orderType) {
      case "PRO_BOOK": return "/img_paket/paket_ebook.png";
      case "PRO_TOOLS": return "/img_paket/paket_tools.png";
      case "PRO_AUTOMATION": return "/img_paket/paket_lengkap.png";
      case "PRO_PLUS": return "/img_paket/paket_lengkap.png";
      case "TOOLS": return "/img_paket/paket_tools.png";
      default: return "/img_paket/paket_ebook.png";
    }
  };

  const getProductTitle = (p: any, productDef: any) => {
    if (productDef?.title) return productDef.title;
    switch(p.orderType) {
      case "PRO_BOOK": return "Paket PRO BOOK";
      case "PRO_TOOLS": return "Paket PRO TOOLS";
      case "PRO_AUTOMATION": return "Paket PRO AUTOMATION";
      case "PRO_PLUS": return "Paket PRO PLUS";
      case "TOOLS": return "Tools";
      default: return "Unknown Product";
    }
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

  const enrichedFullOrders = await populateOrderAddons(fullOrders);

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
    salesGrowth: parseFloat(salesGrowth.toFixed(2)),
    viewsGrowth: parseFloat(viewsGrowth.toFixed(2)),
    salesChartData,
    viewsChartData
  };
}

export const getCachedDashboardStats = unstable_cache(
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

export const revalidateAllAppDataAction = revalidateDashboardAction;

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
