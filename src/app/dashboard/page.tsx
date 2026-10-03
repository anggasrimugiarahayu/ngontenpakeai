import { auth } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import DashboardClient from "./DashboardClient";

export const metadata = {
  title: "Admin Dashboard - Ngonten Pakai AI",
};

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const isAdmin = session?.user?.email === "anggasrimugiarahayu@gmail.com";
  
  if (!isAdmin) {
    redirect("/");
  }

  // Fetch users & products
  const totalUsers = await prisma.user.count();
  const totalProducts = await prisma.digitalProduct.count();

  // Fetch real orders (safeguard for dev server restart)
  let successfulOrders: any = { _sum: { amount: 0 }, _count: { id: 0 } };
  let topProducts: any[] = [];
  
  if (prisma.order) {
    try {
      successfulOrders = await prisma.order.aggregate({
        _sum: { amount: true },
        _count: { id: true },
        where: { status: 'SUCCESS' }
      });
    } catch(e) { console.error("Prisma error successfulOrders:", e); }
    
    try {
      topProducts = await prisma.order.groupBy({
        by: ['digitalProductId'],
        _sum: { amount: true },
        _count: { id: true },
        where: { status: 'SUCCESS' },
        orderBy: { _sum: { amount: 'desc' } },
        take: 5
      });
    } catch(e) { console.error("Prisma error topProducts:", e); }
  }

  const lifetimeSalesIDR = successfulOrders._sum?.amount || 0;
  const lifetimeOrders = successfulOrders._count?.id || 0;

  let fullOrders: any[] = [];
  if (prisma.order) {
    try {
      fullOrders = await prisma.order.findMany({
        include: {
          user: { select: { name: true, email: true } },
          product: { select: { title: true, coverUrl: true, isProOnly: true } }
        },
        orderBy: { createdAt: 'desc' }
      });
    } catch(e) { console.error("Prisma error fullOrders:", e); }
  }

  // Fetch product details for the grouped data
  const productIds = topProducts.map(p => p.digitalProductId);
  const products = await prisma.digitalProduct.findMany({
    where: { id: { in: productIds } },
    select: { id: true, title: true, coverUrl: true }
  });

  // Format real product sales data
  const realProductSales = topProducts.map(p => {
    const productDef = products.find(prod => prod.id === p.digitalProductId);
    return {
      id: p.digitalProductId,
      title: productDef?.title || "Unknown Product",
      views: 0, // No analytics tracked yet
      sold: p._count.id,
      amount: p._sum.amount || 0,
      conversion: 0, 
      image: productDef?.coverUrl || 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=100&h=100&fit=crop'
    };
  });

  // Real data structure
  const dashboardData = {
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
    realProductSales,
    fullOrders
  };

  return (
    <div className="min-h-screen bg-gray-50/30 dark:bg-[#0f0f11] pt-20 pb-10">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <DashboardClient data={dashboardData} user={session.user} />
      </div>
    </div>
  );
}
