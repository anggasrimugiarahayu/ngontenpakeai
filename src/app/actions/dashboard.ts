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
  try {
    totalUsers = await prisma.user.count();
    totalProducts = await prisma.digitalProduct.count();
  } catch (e) {
    console.log("Supabase timeout on counting users/products");
  }

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

  const realProductSales = topProducts.map(p => {
    const productDef = products.find(prod => prod.id === p.digitalProductId);
    return {
      id: p.digitalProductId,
      title: productDef?.title || "Unknown Product",
      views: 0,
      sold: p._count.id,
      amount: p._sum.amount || 0,
      conversion: 0, 
      image: productDef?.coverUrl || 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=100&h=100&fit=crop'
    };
  });

  return {
    totalUsers,
    totalUsersFree: totalUsers, 
    totalUsersPro: 0,
    totalSubscribers: 0,
    earningsIDR: lifetimeSalesIDR,
    lifetimeSalesIDR: lifetimeSalesIDR,
    lifetimeOrders: lifetimeOrders,
    totalDigitalProducts: totalProducts,
    totalViews: 0,
    totalClicks: 0,
    realProductSales: JSON.parse(JSON.stringify(realProductSales)),
    fullOrders: JSON.parse(JSON.stringify(fullOrders))
  };
}
