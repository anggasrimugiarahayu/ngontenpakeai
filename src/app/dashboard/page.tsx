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

  // Fetch real data where possible
  const totalUsers = await prisma.user.count();
  const totalProducts = await prisma.digitalProduct.count();

  // Dummy data for missing backend implementation (sales, orders, etc.)
  const dashboardData = {
    totalUsers,
    totalUsersFree: totalUsers, // assuming all free until PRO role is added
    totalUsersPro: 0,
    totalSubscribers: 0,
    earningsIDR: 0,
    lifetimeSalesIDR: 0,
    lifetimeOrders: 0,
    totalDigitalProducts: totalProducts,
    totalViews: 0,
    totalClicks: 0
  };

  return (
    <div className="min-h-screen bg-gray-50/30 dark:bg-[#0f0f11] pt-20 pb-10">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <DashboardClient data={dashboardData} user={session.user} />
      </div>
    </div>
  );
}
