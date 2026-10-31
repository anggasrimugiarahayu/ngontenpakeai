"use client";

import React from "react";
import { InstagramIcon } from "./AutomationIcons";
import { TikTokPlatformCard } from "../tiktok/TikTokAutomationSection";
import { WhatsAppPlatformCard } from "../whatsapp/WhatsAppAutomationSection";
import { Badge } from "@/components/ui/Badge";

interface PlatformHubSectionProps {
  isLoggedIn: boolean;
  isPro: boolean;
  isAdmin: boolean;
  isProOnly?: boolean;
  onSelectInstagram: () => void;
}

export function PlatformHubSection({
  isLoggedIn,
  isPro,
  isAdmin,
  isProOnly = true,
  onSelectInstagram,
}: PlatformHubSectionProps) {
  const canAccess = isLoggedIn && (isPro || isAdmin);
  const igPoints = [
    "Koneksikan Akun Meta",
    "Atur Template Balasan",
    "Auto DM & Komentar 24/7",
  ];

  return (
    <div>
      {/* Header - EXACT SAME STYLE & CENTER ALIGNED AS RUANG NGONTEN */}
      <div className="flex flex-col items-center justify-center text-center gap-2 mb-8 md:mb-10">
        <div className="space-y-3 flex flex-col items-center">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Mau mulai dari mana?
          </h1>
          <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 max-w-xl mx-auto text-balance leading-relaxed">
            Pilih platform media sosial di bawah ini untuk mengaktifkan automasi balasan komentar pintar, kirim pesan DM privat otomatis, dan perluas jangkauan audiens Anda 24/7.
          </p>
        </div>
      </div>

      {/* Platform Cards Grid - EXACT SAME STYLE & SIZE AS RUANG NGONTEN TOOLCARD */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 max-w-5xl mx-auto">
        {/* 1. INSTAGRAM AUTOMATION */}
        <div
          role="button"
          tabIndex={0}
          onClick={onSelectInstagram}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") onSelectInstagram();
          }}
          className="group relative flex flex-col justify-start rounded-xl border-2 p-5 text-left transition-all duration-200 cursor-pointer z-0 overflow-hidden bg-white dark:bg-[#141B31] border-gray-200 dark:border-[#2C3246] hover:border-rn-accent dark:hover:border-orange-500/50 shadow-gray-200 dark:shadow-black/50 hover:shadow-xl hover:-translate-y-1"
        >
          {/* Card Header */}
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-[#0A1128] border border-transparent dark:border-[#2C3246]/50 flex items-center justify-center transition-colors text-gray-600 dark:text-gray-400 group-hover:bg-rn-accent/10 group-hover:text-rn-accent shrink-0">
              <InstagramIcon className="w-5 h-5" />
            </div>
            <div className="flex flex-col gap-1 w-full">
              <div className="flex items-start justify-between w-full">
                <h3 className="font-bold text-base leading-tight transition-colors text-gray-900 dark:text-white group-hover:text-rn-accent">
                  Instagram Automation
                </h3>
                <div className="flex items-center gap-1 shrink-0">
                  {isProOnly ? (
                    !canAccess ? (
                      <Badge variant="primary" size="xs">
                        PRO
                      </Badge>
                    ) : (
                      <Badge variant="neutral" size="xs">
                        PRO
                      </Badge>
                    )
                  ) : (
                    <Badge variant="success" size="xs">
                      FREE
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <p className="text-[13px] leading-relaxed text-gray-500 dark:text-gray-400 mb-5 line-clamp-2">
            Balas komentar postingan & Reels otomatis serta kirim link/DM instan ke followers secara otomatis.
          </p>

          {/* Timeline Points List */}
          <div className="relative ml-1.5 space-y-3">
            <div className="absolute left-[3px] top-1.5 bottom-1.5 w-[2px] bg-gray-200 dark:bg-[#2C3246]" />

            {igPoints.map((point, pIdx) => (
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

        {/* 2. TIKTOK AUTOMATION (MODULARIZED) */}
        <TikTokPlatformCard />

        {/* 3. WHATSAPP AUTOMATION (MODULARIZED) */}
        <WhatsAppPlatformCard />
      </div>
    </div>
  );
}
