import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { SettingsTabs } from "./SettingsTabs";

export const metadata = {
  title: "Pengaturan - Ngonten Pakai AI",
};

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { proToolsExpiredAt: true, role: true }
  });

  const userOrders = await prisma.order.findMany({
    where: { userId: session.user.id, status: "SUCCESS", orderType: { in: ["PRO_BOOK", "PRO_TOOLS", "PRO_PLUS"] } },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto p-6 py-10 md:py-16">
      <h1 className="text-2xl md:text-3xl font-bold font-heading mb-8 md:mb-10 text-gray-900 dark:text-white">
        Pengaturan
      </h1>
      <SettingsTabs 
        user={session.user} 
        dbUser={dbUser} 
        orders={userOrders} 
      />
    </div>
  );
}
