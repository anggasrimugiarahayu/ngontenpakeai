"use client";

import React, { useState } from "react";
import { Sparkles } from "lucide-react";

export interface RisetPlatform {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  badge: string;
  points: string[];
}

export function RisetPlatformCard({ platform }: { platform: RisetPlatform }) {
  const [showSoon, setShowSoon] = useState(false);
  const Icon = platform.icon;

  const handleClick = () => {
    setShowSoon(true);
    setTimeout(() => setShowSoon(false), 3000);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") handleClick();
      }}
      className="group relative flex flex-col justify-start rounded-xl border-2 p-5 text-left transition-all duration-300 cursor-pointer z-0 overflow-hidden bg-white dark:bg-[#18181b] border-gray-200 dark:border-white/5 hover:border-rn-accent dark:hover:border-rn-accent/50 shadow-gray-200 dark:shadow-black/50 hover:shadow-xl hover:-translate-y-1.5"
    >
      {/* Coming Soon Overlay on Click (Matches Ruang Ngonten ToolCard) */}
      {showSoon && (
        <div className="absolute inset-0 bg-orange-500/10 backdrop-blur-[2px] flex flex-col items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="bg-orange-50 dark:bg-orange-950/90 text-orange-600 dark:text-orange-400 text-xs font-bold px-3.5 py-1.5 rounded-full flex items-center gap-2 shadow-md border border-orange-200 dark:border-orange-800">
            <Sparkles className="w-4 h-4" />
            Fitur Sedang Dikembangkan
          </div>
        </div>
      )}

      {/* Card Header */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-white/5 flex items-center justify-center transition-colors text-gray-600 dark:text-gray-400 group-hover:bg-rn-accent/10 group-hover:text-rn-accent shrink-0">
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex flex-col gap-1 w-full">
          <div className="flex items-start justify-between w-full">
            <h3 className="font-bold text-base leading-tight transition-colors text-gray-900 dark:text-white group-hover:text-rn-accent">
              {platform.name}
            </h3>
            <div className="flex items-center gap-1 shrink-0">
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400 uppercase tracking-wider">
                {platform.badge}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-[13px] leading-relaxed text-gray-500 dark:text-gray-400 mb-5 line-clamp-2">
        {platform.description}
      </p>

      {/* Timeline Points List */}
      <div className="relative ml-1.5 space-y-3 mt-auto">
        <div className="absolute left-[3px] top-1.5 bottom-1.5 w-[2px] bg-gray-200 dark:bg-white/5" />

        {platform.points.map((point, pIdx) => (
          <div key={pIdx} className="relative flex items-center gap-3">
            <div
              className={`w-2 h-2 rounded-full z-10 transition-colors ${
                pIdx === 0
                  ? "bg-rn-accent ring-4 ring-rn-accent/20"
                  : "bg-gray-300 dark:bg-gray-600 group-hover:bg-rn-accent/50"
              }`}
            />
            <span
              className={`text-[11px] font-medium transition-colors ${
                pIdx === 0
                  ? "text-gray-900 dark:text-white"
                  : "text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300"
              }`}
            >
              {point}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
