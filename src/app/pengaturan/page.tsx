import { auth } from "@/auth";
import { redirect } from "next/navigation";
import ProfileForm from "./ProfileForm";
import ApiKeyForm from "./ApiKeyForm";
import Link from "next/link";
import { Key } from "lucide-react";
import prisma from "@/lib/prisma";

export const metadata = {
  title: "Pengaturan - Ngonten Pakai AI",
};

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Determine if user is pro (dummy logic for UI, can be replaced by actual DB later)
  const isPro = false;

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id }
  });

  const features = await prisma.feature.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'asc' }
  });

  const usages = await prisma.usage.findMany({
    where: { userId: session.user.id }
  });

  const usageMap = usages.reduce((acc, usage) => {
    acc[usage.featureId] = usage.count;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto p-6 py-10 md:py-16">
      <h1 className="text-2xl md:text-3xl font-bold font-heading mb-8 md:mb-10 text-gray-900 dark:text-white">
        Pengaturan
      </h1>

      <div className="space-y-6">
        {/* Plan & Penggunaan */}
        <div className="border border-gray-200 dark:border-white/5 rounded-2xl p-6 bg-white dark:bg-[#121214]">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Plan & Penggunaan</h2>
              {isPro && (
                <span className="bg-orange-500/10 text-orange-500 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                  Pro
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Penggunaan fitur dan kuota aktif kamu.</p>
          </div>

          <div className="space-y-4">
            {features.map((feature) => (
              <div key={feature.id} className="flex justify-between items-center text-sm">
                <span className="text-gray-700 dark:text-gray-300">{feature.name}</span>
                <span className="text-gray-500 dark:text-gray-400">
                  {usageMap[feature.id] || 0} digunakan — {isPro ? "Unlimited" : "Terbatas"}
                </span>
              </div>
            ))}
            {features.length === 0 && (
              <div className="text-sm text-gray-500 dark:text-gray-400">Belum ada fitur tersedia.</div>
            )}
          </div>

          <div className="mt-8 pt-4 border-t border-gray-200 dark:border-white/5 text-sm text-gray-500 dark:text-gray-400">
            {isPro ? "Aktif — berlaku hingga 3 Oktober 2026" : "Paket Free (Terbatas)"}
          </div>
        </div>

        {/* Riwayat Langganan */}
        <div className="border border-gray-200 dark:border-white/5 rounded-2xl p-6 bg-white dark:bg-[#121214]">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Riwayat Langganan</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Semua langganan kamu — yang aktif, sudah berakhir, dan yang belum mulai.</p>
          </div>

          <div className="flex justify-between items-center">
            <div>
              <div className="font-bold text-gray-900 dark:text-white">{isPro ? "Pro" : "Free"}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {isPro ? "3 Sep 2026 – 3 Okt 2026" : "Selamanya"}
              </div>
            </div>
            {isPro && (
              <span className="bg-green-500/10 text-green-500 text-[10px] font-bold px-3 py-1 rounded-full uppercase">
                Aktif
              </span>
            )}
          </div>
        </div>

        {/* Upgrade Plan */}
        {!isPro && (
          <div className="border border-gray-200 dark:border-white/5 rounded-2xl p-6 bg-white dark:bg-[#121214]">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Upgrade Plan</h2>
            </div>
            <div className="flex items-center gap-4">
              <span className="bg-orange-500/10 text-orange-500 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                Pro
              </span>
              <Link
                href="/?pricing=true"
                className="px-4 py-1.5 rounded-lg border border-gray-300 dark:border-white/10 text-sm font-medium hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-gray-900 dark:text-white"
              >
                Lihat semua plan
              </Link>
            </div>
          </div>
        )}

        {/* Profil Section */}
        <ProfileForm user={session.user} />

        {/* API Keys */}
        <ApiKeyForm apiKey={dbUser?.googleApiKey} />

      </div>
    </div>
  );
}
