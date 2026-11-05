"use client";

import React from "react";
import Link from "next/link";
import { ClawdMaintenanceVisual } from "@/components/ui/ClawdLoadingVisuals";
import { MaintenanceConfig } from "@/lib/cache";
import { Clock, Shield, Settings, LayoutDashboard } from "lucide-react";

interface MaintenanceViewProps {
  config: MaintenanceConfig;
  isAdmin?: boolean;
}

const CLEAN_DEFAULT_MESSAGE =
  "Kami sedang melakukan peningkatan sistem dan pembaruan fitur agar pengalaman ngontenmu semakin optimal. Kami akan segera kembali!";

export default function MaintenanceView({
  config,
  isAdmin = false,
}: MaintenanceViewProps) {
  const displayMessage =
    config.message && !config.message.toLowerCase().includes("clawd sedang")
      ? config.message
      : CLEAN_DEFAULT_MESSAGE;

  return (
    <div className="w-full flex-1 flex flex-col items-center justify-center px-4 py-2 sm:py-4 -mt-2 sm:-mt-4 text-gray-900 dark:text-gray-100 select-none animate-in fade-in duration-300">
      {/* Floating Admin Control Bar */}
      {isAdmin && (
        <aside
          aria-label="Admin quick actions"
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-auto max-w-[94vw] bg-white/95 dark:bg-[#1A1F2C]/95 backdrop-blur-md border border-orange-200 dark:border-orange-500/30 shadow-lg shadow-orange-500/10 rounded-full px-4 py-2 flex items-center gap-3 transition-all animate-in fade-in slide-in-from-top-3 duration-300"
        >
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500" />
            </span>
            <Shield size={16} className="text-orange-500 hidden sm:inline" />
            <span className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-200">
              Mode Maintenance Aktif{" "}
              <span className="text-xs font-normal text-gray-500 hidden md:inline">
                (Admin Preview)
              </span>
            </span>
          </div>

          <div className="h-4 w-px bg-gray-200 dark:bg-gray-700" />

          <div className="flex items-center gap-2">
            <Link
              href="/pengaturan?tab=homepage"
              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full bg-orange-500 text-white hover:bg-orange-600 transition-colors shadow-sm"
            >
              <Settings size={13} />
              <span>Pengaturan</span>
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-white/15 transition-colors"
            >
              <LayoutDashboard size={13} />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>
          </div>
        </aside>
      )}

      {/* Main Maintenance Content */}
      <main className="w-full max-w-xl mx-auto flex flex-col items-center text-center py-1 sm:py-3 px-2">
        {/* Animated Clawd the Mechanic */}
        <div className="w-full flex justify-center mb-1.5 sm:mb-2.5">
          <ClawdMaintenanceVisual className="drop-shadow-sm scale-85 sm:scale-100 origin-center" />
        </div>

        {/* Title */}
        <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight font-heading text-gray-900 dark:text-white mb-2 sm:mb-3 leading-snug">
          {config.title || "Sistem Sedang Dalam Pemeliharaan"}
        </h1>

        {/* Message */}
        <p className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-300 max-w-sm sm:max-w-md mx-auto leading-relaxed mb-3 sm:mb-4">
          {displayMessage}
        </p>

        {/* Estimated Time Badge (if provided) */}
        {config.estimatedTime && (
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400 text-xs sm:text-sm font-medium">
            <Clock size={14} className="sm:w-[15px] sm:h-[15px]" />
            <span>{config.estimatedTime}</span>
          </div>
        )}
      </main>
    </div>
  );
}
