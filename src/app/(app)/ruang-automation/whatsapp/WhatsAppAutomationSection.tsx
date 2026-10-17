"use client";

import React from "react";
import { WhatsAppIcon } from "../components/AutomationIcons";

export function WhatsAppPlatformCard() {
  const waPoints = [
    "Scan QR WhatsApp",
    "Sambutan CS Otomatis",
    "Broadcast Pesan Terjadwal"
  ];

  return (
    <div
      className="group relative flex flex-col justify-start rounded-xl border-2 p-5 text-left transition-all duration-300 cursor-not-allowed z-0 overflow-hidden bg-white dark:bg-[#18181b] border-gray-200 dark:border-white/5 opacity-75"
      title="WhatsApp Automation sedang dalam tahap riset & pengembangan"
    >
      {/* Card Header */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-400 dark:text-gray-500 shrink-0">
          <WhatsAppIcon className="w-5 h-5" />
        </div>
        <div className="flex flex-col gap-1 w-full">
          <div className="flex items-start justify-between w-full">
            <h3 className="font-bold text-base leading-tight text-gray-800 dark:text-gray-200">
              WhatsApp Automation
            </h3>
            <div className="flex items-center gap-1 shrink-0">
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 dark:bg-white/10 dark:text-gray-400 uppercase tracking-wider">
                COMING SOON
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-[13px] leading-relaxed text-gray-500 dark:text-gray-400 mb-5 line-clamp-2">
        Kirim pesan broadcast, sambutan pelanggan otomatis, dan CS chatbot resmi WhatsApp Business API.
      </p>

      {/* Timeline Points List */}
      <div className="relative ml-1.5 space-y-3">
        <div className="absolute left-[3px] top-1.5 bottom-1.5 w-[2px] bg-gray-200 dark:bg-white/5" />

        {waPoints.map((point, pIdx) => (
          <div key={pIdx} className="relative flex items-center gap-3">
            <div className="w-2 h-2 rounded-full z-10 bg-gray-300 dark:bg-gray-600" />
            <span className="text-[11px] font-medium text-gray-400 dark:text-gray-500">
              {point}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
