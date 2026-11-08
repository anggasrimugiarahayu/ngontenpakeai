"use client";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import Link from "next/link";


import { useEffect, useState } from "react";
import ApiKeyForm from "./ApiKeyForm";
import { LayoutTemplate, Bot, Search, BookOpen } from "lucide-react";

const NGONTEN_ORDER = [
  "Master Blueprint",
  "Bio Builder",
  "Idea Rooms",
  "Script Builder",
  "Carousel Prompt",
  "Carousel Prompt Builder",
  "ATM Content",
  "ATM Content Builder",
  "Ebook Prompt",
  "Ebook Prompt Builder",
  "Content Calendar",
];

const AUTO_ORDER = [
  "Instagram Automation",
  "TikTok Automation",
  "WhatsApp Automation",
];

const RISET_ORDER = [
  "Riset Instagram",
  "Riset YouTube",
  "Riset TikTok",
  "Riset Facebook",
];



export function PlanUsageSection({ isPro, userData }: { isPro: boolean, userData?: any }) {
  const features = userData?.features || [];
  const usages = userData?.usages || [];
  const ownedEbooks = userData?.ownedEbooks || [];
  const hasBook = Boolean(userData?.hasBook);
  const hasTools = Boolean(userData?.hasTools);
  const hasAutomation = Boolean(userData?.hasAutomation);
  const hasAutomationTrial = Boolean(userData?.hasAutomationTrial);
  const hasRiset = Boolean(userData?.hasRiset);
  const badgeName = userData?.badgeName || (isPro ? "PRO" : "FREE");

  const proToolsExpiredAt = userData?.proToolsExpiredAt
    ? new Date(userData.proToolsExpiredAt)
    : null;
  const proAutomationExpiredAt = userData?.proAutomationExpiredAt
    ? new Date(userData.proAutomationExpiredAt)
    : null;
  const proRisetExpiredAt = userData?.proRisetExpiredAt
    ? new Date(userData.proRisetExpiredAt)
    : null;

  const usageMap = usages.reduce((acc: any, usage: any) => {
    acc[usage.featureId] = usage.count;
    return acc;
  }, {} as Record<string, number>);

  const now = new Date().getTime();
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
  const isNearlyExpired =
    (proToolsExpiredAt && proToolsExpiredAt.getTime() > now && proToolsExpiredAt.getTime() - now < sevenDaysMs) ||
    (proAutomationExpiredAt && proAutomationExpiredAt.getTime() > now && proAutomationExpiredAt.getTime() - now < sevenDaysMs) ||
    (proRisetExpiredAt && proRisetExpiredAt.getTime() > now && proRisetExpiredAt.getTime() - now < sevenDaysMs);

  const quotaConfig = userData?.quotaConfig || {
    ngontenFreeLimit: 3,
    risetFreeLimit: 3,
    automationFreeTrialDays: 3,
  };

  const ngontenLimit = quotaConfig.ngontenFreeLimit || 3;
  const risetLimit = quotaConfig.risetFreeLimit || 3;
  const autoTrialDays = quotaConfig.automationFreeTrialDays || 3;

  const ngontenFeatures = NGONTEN_ORDER.map((name) =>
    features.find((f: any) => f.name.toLowerCase() === name.toLowerCase())
  ).filter(Boolean) as any[];

  const autoFeatures = AUTO_ORDER.map((name) =>
    features.find((f: any) => f.name.toLowerCase() === name.toLowerCase())
  ).filter(Boolean) as any[];

  const risetFeatures = RISET_ORDER.map((name) =>
    features.find((f: any) => f.name.toLowerCase() === name.toLowerCase())
  ).filter(Boolean) as any[];

  const otherFeatures = features.filter(
    (f: any) =>
      !NGONTEN_ORDER.some((n) => n.toLowerCase() === f.name.toLowerCase()) &&
      !AUTO_ORDER.some((a) => a.toLowerCase() === f.name.toLowerCase()) &&
      !RISET_ORDER.some((r) => r.toLowerCase() === f.name.toLowerCase())
  );
  if (otherFeatures.length > 0) {
    ngontenFeatures.push(...otherFeatures);
  }

  return (
    <div className="border border-gray-200 dark:border-[#2C3246] rounded-2xl p-6 bg-white dark:bg-[#141B31]">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Plan & Penggunaan</h2>
            {isPro ? (
              <span className="bg-orange-500/10 text-orange-500 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                {badgeName}
              </span>
            ) : (
              <span className="bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-400 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                Free
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Penggunaan fitur dan kuota aktif kamu.
          </p>
        </div>
        
        {!isPro ? (
          <Link href="/?pricing=true" className="px-4 py-2 bg-rn-accent text-white font-bold text-sm rounded-xl hover:opacity-90 transition-opacity">
            Upgrade ke Pro
          </Link>
        ) : isNearlyExpired ? (
          <Link href="/?pricing=true" className="px-4 py-2 bg-red-500 text-white font-bold text-sm rounded-xl hover:opacity-90 transition-opacity">
            Perpanjang Paket
          </Link>
        ) : null}
      </div>

      {/* SEKSI KUOTA TOOLS TERPISAH */}
      <div className="space-y-6 mb-6">
        {/* 1. KUOTA AI TOOLS (RUANG NGONTEN) */}
        <div>
          <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <LayoutTemplate className="w-4 h-4 text-orange-500" />
            Kuota AI Tools
          </h3>
          <div className="space-y-3">
            {ngontenFeatures.map((feature: any) => {
              const usageCount = usageMap[feature.id] || 0;
              return (
                <div key={feature.id} className="flex justify-between items-center text-sm border-b border-gray-100 dark:border-[#2C3246] pb-2 last:border-0 last:pb-0">
                  <span className="text-gray-700 dark:text-gray-300">{feature.name}</span>
                  {hasTools ? (
                    <span className="text-emerald-500 font-medium">
                      {usageCount}x generasi (Unlimited)
                    </span>
                  ) : feature.isProOnly ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-orange-500/10 text-orange-500 border border-orange-500/20">
                      PRO Only
                    </span>
                  ) : (
                    <span className={`font-medium ${usageCount >= ngontenLimit ? "text-red-500 font-bold" : "text-gray-500 dark:text-gray-400"}`}>
                      {usageCount} / {ngontenLimit} digunakan {usageCount >= ngontenLimit ? "(Habis)" : ""}
                    </span>
                  )}
                </div>
              );
            })}
            {ngontenFeatures.length === 0 && (
              <div className="text-sm text-gray-500 dark:text-gray-400 italic">Belum ada fitur AI tersedia.</div>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100 dark:border-[#2C3246]" />

        {/* 2. KUOTA AUTOMATION TOOLS (RUANG AUTOMATION) */}
        <div>
          <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <Bot className="w-4 h-4 text-orange-500" />
            Kuota Automation Tools
          </h3>
          <div className="space-y-3">
            {autoFeatures.map((feature: any) => {
              return (
                <div key={feature.id} className="flex justify-between items-center text-sm border-b border-gray-100 dark:border-[#2C3246] pb-2 last:border-0 last:pb-0">
                  <span className="text-gray-700 dark:text-gray-300">{feature.name}</span>
                  {hasAutomation ? (
                    <span className="text-emerald-500 font-medium">
                      Aktif (Unlimited)
                    </span>
                  ) : hasAutomationTrial ? (
                    <span className="text-blue-500 dark:text-blue-400 font-semibold">
                      Free Trial (Aktif)
                    </span>
                  ) : feature.isProOnly ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-orange-500/10 text-orange-500 border border-orange-500/20">
                      PRO Only
                    </span>
                  ) : (
                    <span className="text-blue-500 dark:text-blue-400 font-medium">
                      Free Trial ({autoTrialDays} Hari)
                    </span>
                  )}
                </div>
              );
            })}
            {autoFeatures.length === 0 && (
              <div className="text-sm text-gray-500 dark:text-gray-400 italic">Belum ada fitur automasi tersedia.</div>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100 dark:border-[#2C3246]" />

        {/* 3. KUOTA RISET TOOLS (RUANG RISET) */}
        <div>
          <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <Search className="w-4 h-4 text-orange-500" />
            Kuota Riset Tools
          </h3>
          <div className="space-y-3">
            {risetFeatures.map((feature: any) => {
              const usageCount = usageMap[feature.id] || 0;
              return (
                <div key={feature.id} className="flex justify-between items-center text-sm border-b border-gray-100 dark:border-[#2C3246] pb-2 last:border-0 last:pb-0">
                  <span className="text-gray-700 dark:text-gray-300">{feature.name}</span>
                  {hasRiset ? (
                    <span className="text-emerald-500 font-medium">
                      {usageCount}x riset (Unlimited)
                    </span>
                  ) : feature.isProOnly ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-orange-500/10 text-orange-500 border border-orange-500/20">
                      PRO Only
                    </span>
                  ) : (
                    <span className={`font-medium ${usageCount >= risetLimit ? "text-red-500 font-bold" : "text-gray-500 dark:text-gray-400"}`}>
                      {usageCount} / {risetLimit} digunakan {usageCount >= risetLimit ? "(Habis)" : ""}
                    </span>
                  )}
                </div>
              );
            })}
            {risetFeatures.length === 0 && (
              <div className="text-sm text-gray-500 dark:text-gray-400 italic">Belum ada fitur riset tersedia.</div>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100 dark:border-[#2C3246]" />

        {/* 4. AKSES PERMANEN (RUANG BELAJAR) */}
        <div>
          <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-orange-500" />
            Akses Permanen (Ruang Belajar)
          </h3>
          <div className="space-y-3">
            {((userData?.ownedProducts && userData.ownedProducts.length > 0) || ownedEbooks.length > 0) ? (
              (userData?.ownedProducts || ownedEbooks.map((t: string) => ({ title: t }))).map((prod: any, index: number) => (
                <div
                  key={index}
                  className="flex justify-between items-center text-sm border-b border-gray-100 dark:border-[#2C3246] pb-2 last:border-0 last:pb-0"
                >
                  <div className="flex items-center gap-2 truncate mr-2">
                    <span className="text-gray-700 dark:text-gray-300 truncate">{prod.title}</span>
                    {prod.productType === "VIDEO" ? (
                      <span className="text-[10px] font-bold text-red-500 bg-red-100 dark:bg-red-950/40 px-2 py-0.5 rounded shrink-0">Video</span>
                    ) : prod.productType === "LINK" ? (
                      <span className="text-[10px] font-bold text-purple-500 bg-purple-100 dark:bg-purple-950/40 px-2 py-0.5 rounded shrink-0">Link</span>
                    ) : (
                      <span className="text-[10px] font-bold text-blue-500 bg-blue-100 dark:bg-blue-950/40 px-2 py-0.5 rounded shrink-0">E-Book</span>
                    )}
                  </div>
                  <span className="text-emerald-500 font-medium shrink-0">Akses Selamanya</span>
                </div>
              ))
            ) : (
              <div className="text-sm text-gray-500 dark:text-gray-400 italic">Belum ada produk ruang belajar yang dimiliki.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ApiKeySection() {
  const [googleApiKey, setGoogleApiKey] = useState<string | null>(null);
  const [groqApiKey, setGroqApiKey] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then(res => res.json())
      .then(data => {
        if (data.googleApiKey !== undefined) setGoogleApiKey(data.googleApiKey);
        if (data.groqApiKey !== undefined) setGroqApiKey(data.groqApiKey);
      })
      .catch(console.error);
  }, []);

  return <ApiKeyForm apiKey={googleApiKey} groqApiKey={groqApiKey} />;
}
