import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getAiModels, getAppSettings, getFeatures, getCategories, getProducts } from "./admin-actions";
import { SettingsTabs } from "./SettingsTabs";
import prisma from "@/lib/prisma";

export const metadata = {
  title: "Pengaturan - Ngonten Pakai AI",
};

export default async function SettingsPage() {
  // auth() is instant
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const isAdmin = session?.user?.email === "anggasrimugiarahayu@gmail.com";
  const isPro = isAdmin || false; // Later add actual Pro check for normal users

  const [features, usages] = await Promise.all([
    prisma.feature.findMany({ where: { isActive: true }, orderBy: { createdAt: 'asc' } }),
    prisma.usage.findMany({ where: { userId: session.user.id } })
  ]);
  const userData = { features, usages };

  let adminData: any = null;
  if (isAdmin) {
    const [models, settings, features, categories, products] = await Promise.all([
      getAiModels(),
      getAppSettings(),
      getFeatures(),
      getCategories(),
      getProducts()
    ]);
    adminData = { models, settings, features, categories, products };
  }

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto p-6 py-10 md:py-16">
      <h1 className="text-2xl md:text-3xl font-bold font-heading mb-8 md:mb-10 text-gray-900 dark:text-white">
        Pengaturan
      </h1>

      <SettingsTabs 
        user={session.user} 
        isAdmin={isAdmin} 
        isPro={isPro} 
        adminData={adminData}
        userData={userData} 
      />
    </div>
  );
}
