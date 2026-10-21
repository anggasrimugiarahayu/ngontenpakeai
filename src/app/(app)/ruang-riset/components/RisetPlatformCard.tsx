"use client";

import React from "react";

export interface RisetPlatform {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  badge: string;
  isActive: boolean;
  points: string[];
}

export function RisetPlatformCard({
  platform,
  onSelect,
}: {
  platform: RisetPlatform;
  onSelect?: () => void;
}) {
  const Icon = platform.icon;
  const isActive = platform.isActive;

  const handleClick = () => {
    if (isActive && onSelect) {
      onSelect();
    }
  };

  const cardClasses = `group relative flex flex-col justify-start rounded-xl border-2 p-5 text-left transition-all duration-300 z-0 overflow-hidden bg-white dark:bg-[#18181b] border-gray-200 dark:border-white/5 ${
    isActive
      ? "cursor-pointer hover:border-rn-accent dark:hover:border-rn-accent/50 shadow-gray-200 dark:shadow-black/50 hover:shadow-xl hover:-translate-y-1.5"
      : "cursor-not-allowed opacity-75 hover:border-gray-300 dark:hover:border-white/20"
  }`;

  return (
    <div
      role={isActive ? "button" : undefined}
      tabIndex={isActive ? 0 : -1}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (isActive && (e.key === "Enter" || e.key === " ")) handleClick();
      }}
      className={cardClasses}
    >
      {/* Card Header */}
      <div className="flex items-center gap-3 mb-3">
        <div
          className={`w-10 h-10 rounded-xl bg-gray-50 dark:bg-white/5 flex items-center justify-center transition-colors shrink-0 ${
            isActive
              ? "text-gray-600 dark:text-gray-400 group-hover:bg-rn-accent/10 group-hover:text-rn-accent"
              : "text-gray-400 dark:text-gray-500"
          }`}
        >
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex flex-col gap-1 w-full">
          <div className="flex items-start justify-between w-full">
            <h3
              className={`font-bold text-base leading-tight transition-colors ${
                isActive
                  ? "text-gray-900 dark:text-white group-hover:text-rn-accent"
                  : "text-gray-800 dark:text-gray-200"
              }`}
            >
              {platform.name}
            </h3>
            <div className="flex items-center gap-1 shrink-0">
              <span
                className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                  isActive
                    ? "bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400"
                    : "bg-gray-100 text-gray-500 dark:bg-white/10 dark:text-gray-400"
                }`}
              >
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
                  ? isActive
                    ? "bg-rn-accent ring-4 ring-rn-accent/20"
                    : "bg-gray-400 ring-4 ring-gray-400/20"
                  : `bg-gray-300 dark:bg-gray-600 ${
                      isActive ? "group-hover:bg-rn-accent/50" : ""
                    }`
              }`}
            />
            <span
              className={`text-[11px] font-medium transition-colors ${
                pIdx === 0
                  ? isActive
                    ? "text-gray-900 dark:text-white"
                    : "text-gray-400 dark:text-gray-500"
                  : `text-gray-500 dark:text-gray-400 ${
                      isActive
                        ? "group-hover:text-gray-700 dark:group-hover:text-gray-300"
                        : ""
                    }`
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
