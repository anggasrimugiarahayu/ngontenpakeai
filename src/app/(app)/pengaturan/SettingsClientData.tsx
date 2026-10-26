"use client";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import Link from "next/link";


import { useEffect, useState } from "react";
import ApiKeyForm from "./ApiKeyForm";



export function PlanUsageSection({ isPro, userData }: { isPro: boolean, userData?: any }) {
  const features = userData?.features || [];
  const usages = userData?.usages || [];
  const ownedEbooks = userData?.ownedEbooks || [];
  const hasBook = Boolean(userData?.hasBook);
  const hasTools = Boolean(userData?.hasTools);
  const hasAutomation = Boolean(userData?.hasAutomation);
  const hasRiset = Boolean(userData?.hasRiset);
  const badgeName = userData?.badgeName || (isPro ? "PRO" : "FREE");

  const proToolsExpiredAt = userData?.proToolsExpiredAt
    ? new Date(userData.proToolsExpiredAt)
    : userData?.proExpiredAt
    ? new Date(userData.proExpiredAt)
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

  const pillars = [
    {
      label: "Ruang Belajar (E-Book PRO)",
      active: hasBook,
      statusText: hasBook ? "Aktif Selamanya" : "Free / Satuan",
    },
    {
      label: "Ruang Ngonten (AI Tools)",
      active: hasTools,
      statusText: hasTools && proToolsExpiredAt
        ? `Aktif s/d ${format(proToolsExpiredAt, "d MMM yyyy", { locale: id })}`
        : hasTools
        ? "Aktif (Unlimited)"
        : "Kuota Free (3x/fitur)",
    },
    {
      label: "Ruang Automation",
      active: hasAutomation,
      statusText: hasAutomation && proAutomationExpiredAt
        ? `Aktif s/d ${format(proAutomationExpiredAt, "d MMM yyyy", { locale: id })}`
        : hasAutomation
        ? "Aktif"
        : "Terkunci (PRO)",
    },
    {
      label: "Ruang Riset",
      active: hasRiset,
      statusText: hasRiset && proRisetExpiredAt
        ? `Aktif s/d ${format(proRisetExpiredAt, "d MMM yyyy", { locale: id })}`
        : hasRiset
        ? "Aktif"
        : "Terkunci (PRO)",
    },
  ];

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
            Status akses paket dan kuota aktif kamu di setiap ruang.
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

      {/* 4-Pillar Subscription Status Grid */}
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {pillars.map((pillar) => (
          <div
            key={pillar.label}
            className="flex items-center justify-between p-3.5 rounded-xl border border-gray-100 dark:border-[#2C3246] bg-gray-50/60 dark:bg-[#0D1322]/60"
          >
            <div>
              <div className="text-xs font-bold text-gray-900 dark:text-white">
                {pillar.label}
              </div>
              <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                {pillar.statusText}
              </div>
            </div>
            <span
              className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase shrink-0 ${
                pillar.active
                  ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                  : "bg-gray-200/70 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
              }`}
            >
              {pillar.active ? "PRO" : "FREE"}
            </span>
          </div>
        ))}
      </div>

      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Kuota AI Tools</h3>
        <div className="space-y-3">
          {features.map((feature: any) => {
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
                  <span className={`font-medium ${usageCount >= 3 ? "text-red-500 font-bold" : "text-gray-500 dark:text-gray-400"}`}>
                    {usageCount} / 3 digunakan {usageCount >= 3 ? "(Habis)" : ""}
                  </span>
                )}
              </div>
            );
          })}
          {features.length === 0 && (
            <div className="text-sm text-gray-500 dark:text-gray-400 italic">Belum ada fitur AI tersedia.</div>
          )}
        </div>
      </div>

      {ownedEbooks.length > 0 && (
        <div className="pt-4 border-t border-gray-200 dark:border-[#2C3246]">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Akses Permanen (Ebook)</h3>
          <ul className="space-y-2">
            {ownedEbooks.map((title: string, index: number) => (
              <li key={index} className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rn-accent"></span>
                {title} <span className="text-gray-400 text-xs">(Akses Selamanya)</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export function ApiKeySection() {
  const [apiKey, setApiKey] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then(res => res.json())
      .then(data => {
        if (data.googleApiKey !== undefined) setApiKey(data.googleApiKey);
      })
      .catch(console.error);
  }, []);

  return <ApiKeyForm apiKey={apiKey} />;
}
