import { auth } from "@/auth";
import { redirect } from "next/navigation";
import ProfileForm from "./ProfileForm";
import Link from "next/link";
import { PlanUsageSection, ApiKeySection } from "./SettingsClientData";

export const metadata = {
  title: "Pengaturan - Ngonten Pakai AI",
};

export default async function SettingsPage() {
  // auth() is instant
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const isPro = false;

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto p-6 py-10 md:py-16">
      <h1 className="text-2xl md:text-3xl font-bold font-heading mb-8 md:mb-10 text-gray-900 dark:text-white">
        Pengaturan
      </h1>

      <div className="space-y-6">
        
        {/* Instant Client UI with SWR */}
        <PlanUsageSection isPro={isPro} />

        {/* Static Section: Riwayat Langganan */}
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

        {/* Static Section: Upgrade Plan */}
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

        {/* Client Component (Fast) */}
        <ProfileForm user={session.user} />

        {/* Instant Client UI with SWR */}
        <ApiKeySection />

      </div>
    </div>
  );
}
