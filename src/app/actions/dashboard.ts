"use server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function getDashboardDataAction() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const isAdmin = session?.user?.email === "anggasrimugiarahayu@gmail.com";
  if (!isAdmin) return null;

  let totalUsers = 0;
  let totalProducts = 0;
  let totalUsersFree = 0;
  let totalUsersPro = 0;
  let totalSubscribers = 0;

  try {
    totalUsers = await prisma.user.count();
    totalProducts = await prisma.digitalProduct.count();
    
    const userRoles = await prisma.user.groupBy({
      by: ['role'],
      _count: { id: true }
    });
    
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
  } catch (e) {
    console.log("Supabase timeout on counting users/products");
  }

  let totalViews = 0;
  let totalClicks = 0;
  let productAnalyticsMap: Record<string, { views: number, clicks: number }> = {};

  try {
    const analytics = await prisma.productAnalytics.groupBy({
      by: ['digitalProductId'],
      _sum: { views: true, clicks: true }
    });
    
    analytics.forEach(a => {
      totalViews += (a._sum.views || 0);
      totalClicks += (a._sum.clicks || 0);
      productAnalyticsMap[a.digitalProductId] = {
        views: a._sum.views || 0,
        clicks: a._sum.clicks || 0
      };
    });
  } catch(e) { console.error("Analytics Error", e); }

  let successfulOrders: any = { _sum: { amount: 0 }, _count: { id: 0 } };
  let topProducts: any[] = [];
  
  if (prisma.order) {
    try {
      successfulOrders = await prisma.order.aggregate({
        _sum: { amount: true },
        _count: { id: true },
        where: { status: 'SUCCESS' }
      });
      
      topProducts = await prisma.order.groupBy({
        by: ['digitalProductId'],
        _sum: { amount: true },
        _count: { id: true },
        where: { status: 'SUCCESS' },
        orderBy: { _sum: { amount: 'desc' } },
        take: 5
      });
    } catch(e) { console.error("Prisma error:", e); }
  }

  const lifetimeSalesIDR = successfulOrders._sum?.amount || 0;
  const lifetimeOrders = successfulOrders._count?.id || 0;

  let fullOrders: any[] = [];
  if (prisma.order) {
    try {
      fullOrders = await prisma.order.findMany({
        include: {
          user: { select: { name: true, email: true, phone: true } },
          product: { select: { title: true, coverUrl: true, isProOnly: true } }
        },
        orderBy: { createdAt: 'desc' }
      });
    } catch(e) { console.error("Prisma error fullOrders:", e); }
  }

  const productIds = topProducts.map(p => p.digitalProductId);
  const products = await prisma.digitalProduct.findMany({
    where: { id: { in: productIds } },
    select: { id: true, title: true, coverUrl: true }
  });

  // -- CHARTS & GROWTH CALCULATIONS --
  const now = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(now.getDate() - 30);
  const sixtyDaysAgo = new Date();
  sixtyDaysAgo.setDate(now.getDate() - 60);

  let salesGrowth = 0;
  let viewsGrowth = 0;
  let salesChartData: any[] = [];
  let viewsChartData: any[] = [];

  try {
    const salesLast30 = await prisma.order.aggregate({
      _sum: { amount: true },
      where: { status: 'SUCCESS', createdAt: { gte: thirtyDaysAgo } }
    });
    const salesPrev30 = await prisma.order.aggregate({
      _sum: { amount: true },
      where: { status: 'SUCCESS', createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } }
    });
    const val30 = salesLast30._sum.amount || 0;
    const valPrev30 = salesPrev30._sum.amount || 0;
    salesGrowth = valPrev30 === 0 ? (val30 > 0 ? 100 : 0) : (((val30 - valPrev30) / valPrev30) * 100);

    const viewsLast30 = await prisma.productAnalytics.aggregate({
      _sum: { views: true, clicks: true },
      where: { date: { gte: thirtyDaysAgo } }
    });
    const viewsPrev30 = await prisma.productAnalytics.aggregate({
      _sum: { views: true, clicks: true },
      where: { date: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } }
    });
    const valVC30 = (viewsLast30._sum.views || 0) + (viewsLast30._sum.clicks || 0);
    const valVCPrev30 = (viewsPrev30._sum.views || 0) + (viewsPrev30._sum.clicks || 0);
    viewsGrowth = valVCPrev30 === 0 ? (valVC30 > 0 ? 100 : 0) : (((valVC30 - valVCPrev30) / valVCPrev30) * 100);

    const ordersLast30 = await prisma.order.findMany({
      where: { status: 'SUCCESS', createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true, amount: true }
    });
    
    const analyticsLast30 = await prisma.productAnalytics.findMany({
      where: { date: { gte: thirtyDaysAgo } },
      select: { date: true, views: true, clicks: true }
    });

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

    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
      salesChartData.push({ date: dateStr, sales: salesChartMap[dateStr] || 0 });
      viewsChartData.push({ date: dateStr, views: viewsChartMap[dateStr]?.views || 0, clicks: viewsChartMap[dateStr]?.clicks || 0 });
    }
  } catch(e) { console.error("Error charting", e); }
  
  const realProductSales = topProducts.map(p => {
    const productDef = products.find(prod => prod.id === p.digitalProductId);
    const analytics = productAnalyticsMap[p.digitalProductId] || { views: 0, clicks: 0 };
    const views = analytics.views;
    const sold = p._count.id;
    const conversion = views > 0 ? ((sold / views) * 100) : 0;

    return {
      id: p.digitalProductId,
      title: productDef?.title || "Unknown Product",
      views: views,
      sold: sold,
      amount: p._sum.amount || 0,
      conversion: parseFloat(conversion.toFixed(1)), 
      image: productDef?.coverUrl || 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=100&h=100&fit=crop'
    };
  });

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
    fullOrders: JSON.parse(JSON.stringify(fullOrders)),
    salesGrowth: parseFloat(salesGrowth.toFixed(2)),
    viewsGrowth: parseFloat(viewsGrowth.toFixed(2)),
    salesChartData,
    viewsChartData
  };
}
