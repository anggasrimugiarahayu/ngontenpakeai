"use client";

import { useEffect, useState } from "react";
import ApiKeyForm from "./ApiKeyForm";



export function PlanUsageSection({ isPro, userData }: { isPro: boolean, userData?: any }) {
  const [features, setFeatures] = useState(userData?.features || []);
  const [usages, setUsages] = useState<any[]>(userData?.usages || []);



  const usageMap = usages.reduce((acc: any, usage: any) => {
    acc[usage.featureId] = usage.count;
    return acc;
  }, {} as Record<string, number>);

  return (
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
        {features.map((feature: any) => (
          <div key={feature.id} className="flex justify-between items-center text-sm">
            <span className="text-gray-700 dark:text-gray-300">{feature.name}</span>
            <span className="text-gray-500 dark:text-gray-400">
              {usageMap[feature.id] || 0} digunakan ({isPro ? "Unlimited" : "Terbatas"})
            </span>
          </div>
        ))}
        {features.length === 0 && (
          <div className="text-sm text-gray-500 dark:text-gray-400">Belum ada fitur tersedia.</div>
        )}
      </div>

      <div className="mt-8 pt-4 border-t border-gray-200 dark:border-white/5 text-sm text-gray-500 dark:text-gray-400">
        {isPro ? "Aktif, berlaku hingga 3 Oktober 2026" : "Paket Free (Terbatas)"}
      </div>
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
