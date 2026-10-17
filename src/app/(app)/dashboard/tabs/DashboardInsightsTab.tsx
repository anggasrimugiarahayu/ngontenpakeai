"use client";

import React from "react";

export function DashboardInsightsTab({ insightsData }: { insightsData: any }) {
  if (!insightsData)
    return <div className="p-8 text-center text-gray-500">Memuat data insights...</div>;
  if (insightsData.total === 0)
    return (
      <div className="p-8 text-center text-gray-500 border border-gray-100 dark:border-white/5 rounded-2xl bg-white dark:bg-[#121214]">
        Belum ada data onboarding dari user.
      </div>
    );

  const getTopWinner = (obj: Record<string, number>) => {
    const entries = Object.entries(obj || {});
    if (entries.length === 0) return { name: "-", count: 0, percentage: 0 };
    const top = entries.sort((a, b) => b[1] - a[1])[0];
    return {
      name: top[0],
      count: top[1],
      percentage: Math.round((top[1] / insightsData.total) * 100) || 0,
    };
  };

  const topNiche = getTopWinner(insightsData.niche);
  const topStruggle = getTopWinner(insightsData.struggle);
  const topPlatform = getTopWinner(insightsData.platform);
  const topGoal = getTopWinner(insightsData.goal);

  const renderWaffle = (
    percentage: number,
    colorClass: string,
    bgColorClass: string
  ) => {
    return (
      <div className="grid grid-cols-10 gap-0.5 w-full max-w-[180px] aspect-square mb-4">
        {Array.from({ length: 100 }).map((_, i) => (
          <div
            key={i}
            className={`w-full h-full rounded-[1px] ${
              100 - i <= percentage ? colorClass : bgColorClass
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="animate-in fade-in duration-300 mt-2">
      <div className="bg-white dark:bg-[#121214] border border-gray-100 dark:border-white/5 rounded-3xl p-6 md:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-10">
          <div className="text-left max-w-2xl">
            <h3 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white mb-2">
              Top Mayoritas Karakteristik Audiens
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Profil dominan audiens Anda berdasarkan jawaban terbanyak dari setiap kategori.
            </p>
          </div>

          <div className="flex flex-col items-start md:items-end bg-gray-50 dark:bg-white/5 p-3 px-5 rounded-xl border border-gray-100 dark:border-white/10 shrink-0">
            <div className="text-gray-400 dark:text-gray-500 text-[10px] font-bold mb-1 uppercase tracking-wider">
              Total Responden
            </div>
            <div className="text-2xl font-black text-gray-900 dark:text-white flex items-baseline gap-1.5">
              {insightsData.total}{" "}
              <span className="text-xs font-bold text-gray-400">User</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
          {/* Waffle 1: Niche */}
          <div className="flex flex-col text-left">
            {renderWaffle(topNiche.percentage, "bg-[#4a5d23]", "bg-[#e5eadb]")}
            <div className="text-4xl font-black text-[#4a5d23] mb-2">
              {topNiche.percentage}%
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-snug">
              Audiens Anda tertarik pada topik <br />
              <strong className="text-gray-900 dark:text-white">
                ({topNiche.name})
              </strong>
            </p>
          </div>

          {/* Waffle 2: Struggle */}
          <div className="flex flex-col text-left">
            {renderWaffle(topStruggle.percentage, "bg-[#cc0000]", "bg-[#f5ccff]")}
            <div className="text-4xl font-black text-[#cc0000] mb-2">
              {topStruggle.percentage}%
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-snug">
              Mengaku paling sering mengalami hambatan <br />
              <strong className="text-gray-900 dark:text-white">
                ({topStruggle.name})
              </strong>
            </p>
          </div>

          {/* Waffle 3: Platform */}
          <div className="flex flex-col text-left">
            {renderWaffle(topPlatform.percentage, "bg-[#3399ff]", "bg-[#dbeafe]")}
            <div className="text-4xl font-black text-[#3399ff] mb-2">
              {topPlatform.percentage}%
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-snug">
              Memilih fokus membangun aset di <br />
              <strong className="text-gray-900 dark:text-white">
                ({topPlatform.name})
              </strong>
            </p>
          </div>

          {/* Waffle 4: Goal */}
          <div className="flex flex-col text-left">
            {renderWaffle(topGoal.percentage, "bg-[#f59e0b]", "bg-[#fef3c7]")}
            <div className="text-4xl font-black text-[#f59e0b] mb-2">
              {topGoal.percentage}%
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-snug">
              Memiliki target utama untuk bisa <br />
              <strong className="text-gray-900 dark:text-white">
                ({topGoal.name})
              </strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
