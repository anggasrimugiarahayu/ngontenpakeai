"use client";

import { useState } from "react";
import useSWR from "swr";
import { getPengaturanDataAction } from "@/app/actions/pengaturan";
import ProfileForm from "./ProfileForm";
import { PlanUsageSection, ApiKeySection } from "./SettingsClientData";
import { AdminSettingsContent } from "./AdminSettingsContent";

export function SettingsTabs({ 
  user, 
  isAdmin, 
  isPro, 
  adminData, 
  userData 
}: { 
  user: any; 
  isAdmin: boolean; 
  isPro: boolean; 
  adminData?: any; 
  userData?: any; 
}) {
  const [activeTab, setActiveTab] = useState("profil");

  const adminTabs = [
    { id: "profil", label: "Profil" },
    { id: "api", label: "API Key Global" },
    { id: "model", label: "Model AI" },
    { id: "fitur", label: "Ruang Ngonten" },
    { id: "belajar", label: "Ruang Belajar" },
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
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors rounded-lg border ${
              activeTab === tab.id
                ? "border-orange-500 text-orange-500"
                : "border-transparent text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
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
            
            <div className="border border-gray-200 dark:border-white/5 rounded-2xl p-6 bg-white dark:bg-[#121214]">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Riwayat Langganan</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Semua langganan kamu yang aktif, sudah berakhir, dan yang belum mulai.</p>
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

            {!isPro && (
              <div className="border border-gray-200 dark:border-white/5 rounded-2xl p-6 bg-white dark:bg-[#121214]">
                <div className="mb-4">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Upgrade Plan</h2>
                </div>
                <div className="flex items-center gap-4">
                  <span className="bg-orange-500/10 text-orange-500 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                    Pro
                  </span>
                  <a
                    href="/?pricing=true"
                    className="px-4 py-1.5 rounded-lg border border-gray-300 dark:border-white/10 text-sm font-medium hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-gray-900 dark:text-white"
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
