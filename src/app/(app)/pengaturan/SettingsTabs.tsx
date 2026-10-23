"use client";

import { useState } from "react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import useSWR from "swr";
import { getPengaturanDataAction } from "@/app/actions/pengaturan";
import ProfileForm from "./ProfileForm";
import { PlanUsageSection, ApiKeySection } from "./SettingsClientData";
import { AdminSettingsContent } from "./AdminSettingsContent";

import { format } from "date-fns";
import { id } from "date-fns/locale";

export function SettingsTabs({ user, dbUser, orders = [], initialData }: { user: any, dbUser?: any, orders?: any[], initialData?: any }) {
  const { data } = useSWR("pengaturan", getPengaturanDataAction, {
    fallbackData: initialData,
    revalidateOnFocus: false,
    revalidateIfStale: false,
    dedupingInterval: 60000
  });
  const [activeTab, setActiveTab] = useState("profil");

  if (!data) return <LoadingSpinner message="Memuat Pengaturan..." />;
  const { userData, adminData, isPro, isAdmin } = data;
  
  const hasBook = orders.some((o: any) => o.orderType === "PRO_BOOK" || o.orderType === "PRO_PLUS");
  const hasTools = dbUser?.proToolsExpiredAt && new Date(dbUser.proToolsExpiredAt) > new Date();
  const hasAutomation = (dbUser as any)?.proAutomationExpiredAt && new Date((dbUser as any).proAutomationExpiredAt) > new Date();
  const isFullyPro = isAdmin || (hasBook && hasTools && hasAutomation);


  const adminTabs = [
    { id: "profil", label: "Profil" },
    { id: "api", label: "API Key Global" },
    { id: "model", label: "Model AI" },
    { id: "fitur", label: "Ruang Ngonten" },
    { id: "belajar", label: "Ruang Belajar" },
    { id: "pricing", label: "Pricing Paket" },
    { id: "homepage", label: "Home Page" },
  ];

  const userTabs = [
    { id: "profil", label: "Profil" },
    { id: "langganan", label: "Langganan" },
    { id: "api", label: "API Key" },
  ];

  const tabs = isAdmin ? adminTabs : userTabs;

  return (
    <div className="space-y-6">
      {/* Horizontal Tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-hide">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-bold whitespace-nowrap transition-all rounded-lg border ${
              activeTab === tab.id
                ? "border-orange-500/50 bg-orange-500/10 text-orange-600 dark:text-orange-400"
                : "border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-[#1f2947]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      <div className="pt-2 animate-in fade-in duration-300">
        
        {/* COMMON: PROFIL */}
        {activeTab === "profil" && (
          <ProfileForm user={user} />
        )}

        {/* USER: LANGGANAN */}
        {activeTab === "langganan" && !isAdmin && (
          <div className="space-y-6">
            <PlanUsageSection isPro={isPro} userData={userData} />
            
            <div className="border border-gray-200 dark:border-[#2C3246] rounded-2xl p-6 bg-white dark:bg-[#141B31]">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Riwayat Langganan</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Semua riwayat pembelian paket dan status masa aktifnya.</p>
              </div>
              
              <div className="space-y-4">
                {orders.length === 0 ? (
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-bold text-gray-900 dark:text-white">Free</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Selamanya</div>
                    </div>
                  </div>
                ) : (
                  orders.map((order: any) => {
                    let title = "Paket";
                    let dateInfo = "";
                    let isActive = false;
                    const createdAt = new Date(order.createdAt);
                    const createdStr = format(createdAt, "d MMM yyyy", { locale: id });
                    
                    if (order.orderType === "PRO_BOOK") {
                      title = "PRO BOOK";
                      dateInfo = `${createdStr} – Selamanya`;
                      isActive = true;
                    } else if (order.orderType === "PRO_TOOLS") {
                      title = "PRO TOOLS";
                      const expiredAt = new Date(createdAt);
                      expiredAt.setDate(expiredAt.getDate() + 30);
                      const expiredStr = format(expiredAt, "d MMM yyyy", { locale: id });
                      dateInfo = `${createdStr} – ${expiredStr}`;
                      isActive = new Date() < expiredAt;
                    } else if (order.orderType === "PRO_AUTOMATION") {
                      title = "PRO AUTOMATION";
                      const expiredAt = new Date(createdAt);
                      expiredAt.setDate(expiredAt.getDate() + 30);
                      const expiredStr = format(expiredAt, "d MMM yyyy", { locale: id });
                      dateInfo = `${createdStr} – ${expiredStr}`;
                      isActive = new Date() < expiredAt;
                    } else if (order.orderType === "PRO_PLUS") {
                      title = "PRO PLUS";
                      const expiredAt = new Date(createdAt);
                      expiredAt.setDate(expiredAt.getDate() + 30);
                      const expiredStr = format(expiredAt, "d MMM yyyy", { locale: id });
                      dateInfo = `${createdStr} – ${expiredStr} (Tools & Auto), Ebook Selamanya`;
                      isActive = true; 
                    } else if (order.orderType === "EBOOK") {
                      title = order.product?.title || "E-Book";
                      dateInfo = `${createdStr} – Selamanya`;
                      isActive = true;
                    }

                    return (
                      <div key={order.id} className="flex justify-between items-center pb-4 border-b border-gray-100 dark:border-[#2C3246]/50 last:border-0 last:pb-0">
                        <div>
                          <div className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            {title}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                            {dateInfo}
                          </div>
                        </div>
                        {isActive ? (
                          <span className="bg-green-500/10 text-green-500 text-[10px] font-bold px-3 py-1 rounded-full uppercase shrink-0">
                            Aktif
                          </span>
                        ) : (
                          <span className="bg-red-500/10 text-red-500 text-[10px] font-bold px-3 py-1 rounded-full uppercase shrink-0">
                            Berakhir
                          </span>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {!isFullyPro && (
              <div className="border border-gray-200 dark:border-[#2C3246] rounded-2xl p-6 bg-white dark:bg-[#141B31]">
                <div className="mb-4">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Upgrade Plan</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-2xl">
                    Masih kurang puas dengan fitur saat ini? Upgrade ke paket PRO PLUS sekarang dan nikmati sensasi bikin ratusan konten viral setiap hari tanpa batas waktu!
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="bg-orange-500/10 text-orange-500 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                    Pro
                  </span>
                  <a
                    href="/?pricing=true"
                    className="px-5 py-2 rounded-xl text-sm font-bold bg-rn-accent hover:bg-orange-600 text-white transition-all hover:shadow-lg hover:shadow-orange-500/20"
                  >
                    Lihat semua plan
                  </a>
                </div>
              </div>
            )}
          </div>
        )}

        {/* USER: API KEY PRIBADI */}
        {activeTab === "api" && !isAdmin && (
          <ApiKeySection />
        )}

        {/* ADMIN SETTINGS COMPONENTS */}
        {isAdmin && adminData && (
          <AdminSettingsContent activeTab={activeTab} adminData={adminData} />
        )}
      </div>
    </div>
  );
}
