"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ClawdMaintenanceVisual,
  ClawdThinkingLabel,
} from "@/components/ui/ClawdLoadingVisuals";
import { MaintenanceConfig } from "@/lib/cache";
import {
  RefreshCw,
  Clock,
  Shield,
  Settings,
  LayoutDashboard,
  MessageCircle,
  Sparkles,
} from "lucide-react";

interface MaintenanceViewProps {
  config: MaintenanceConfig;
  isAdmin?: boolean;
}

const MAINTENANCE_PHRASES = [
  "Mengoptimalkan performa server AI...",
  "Memperbarui infrastruktur sistem...",
  "Memeriksa kestabilan database...",
  "Menyiapkan pembaruan fitur terbaik...",
  "Hampir selesai, menyelaraskan konfigurasi...",
];

export default function MaintenanceView({
  config,
  isAdmin = false,
}: MaintenanceViewProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    window.location.reload();
  };

  return (
    <div className="min-h-screen w-full relative flex flex-col items-center justify-center p-4 sm:p-6 bg-gradient-to-b from-orange-50/50 via-white to-gray-50 dark:from-[#0c0f17] dark:via-[#090b11] dark:to-[#06080d] text-gray-900 dark:text-gray-100 overflow-hidden select-none">
      {/* Background Decorative Auras */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-orange-400/10 via-amber-300/10 to-transparent dark:from-orange-500/5 dark:via-amber-400/5 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-24 -right-24 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />

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
              Mode Maintenance Aktif <span className="text-xs font-normal text-gray-500 hidden md:inline">(Admin Preview)</span>
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

      {/* Main Maintenance Card */}
      <main className="w-full max-w-xl mx-auto flex flex-col items-center text-center relative z-10 py-8 px-2">
        {/* Status Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-600 dark:text-amber-400 text-xs font-semibold tracking-wide uppercase mb-6 backdrop-blur-sm">
          <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
          <span>Pemeliharaan Sistem Sedang Berlangsung</span>
        </div>

        {/* Animated Clawd the Mechanic */}
        <div className="w-full flex justify-center mb-4">
          <ClawdMaintenanceVisual className="drop-shadow-sm" />
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight font-heading text-gray-900 dark:text-white mb-3 leading-snug">
          {config.title || "Sistem Sedang Dalam Pemeliharaan"}
        </h1>

        {/* Message */}
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 max-w-md mx-auto leading-relaxed mb-5">
          {config.message ||
            "Clawd sedang meng-upgrade mesin & merapikan sistem agar pengalaman ngontenmu makin ngebut. Kami akan segera kembali!"}
        </p>

        {/* Estimated Time Badge */}
        {config.estimatedTime && (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400 text-xs sm:text-sm font-medium mb-6">
            <Clock size={16} />
            <span>{config.estimatedTime}</span>
          </div>
        )}

        {/* Live Status Label with Clawd Rotating Phrases */}
        <div className="w-full max-w-sm mb-8 px-4 py-2.5 rounded-xl bg-white/80 dark:bg-white/5 border border-gray-200/80 dark:border-white/10 shadow-sm backdrop-blur-sm flex items-center justify-center gap-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
          <Sparkles size={14} className="text-orange-500 shrink-0 animate-pulse" />
          <ClawdThinkingLabel
            phrases={MAINTENANCE_PHRASES}
            intervalMs={2400}
            className="font-medium text-gray-700 dark:text-gray-300 truncate"
          />
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-xs">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-orange-500 text-white font-semibold text-sm hover:bg-orange-600 active:scale-95 transition-all shadow-md shadow-orange-500/20 disabled:opacity-60"
          >
            <RefreshCw
              size={16}
              className={isRefreshing ? "animate-spin" : ""}
            />
            <span>{isRefreshing ? "Memeriksa..." : "Cek Status (Refresh)"}</span>
          </button>

          <a
            href="https://wa.me/6281234567890?text=Halo%20Admin%20ruangcreativemuslim,%20saya%20ingin%20tanya%20mengenai%20status%20maintenance"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/15 text-gray-700 dark:text-gray-200 font-medium text-sm transition-colors"
          >
            <MessageCircle size={16} />
            <span>Hubungi Bantuan</span>
          </a>
        </div>

        {/* Footer info */}
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-10">
          ruangcreativemuslim &bull; Terima kasih atas kesabarannya 🙏
        </p>
      </main>
    </div>
  );
}
