"use client";

import React from "react";
import { Bot } from "lucide-react";

export function LiveAutomationSection() {
  return (
    <div className="text-center py-16 px-4 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-2xl space-y-4 bg-white dark:bg-[#18181b]">
      <div className="w-14 h-14 mx-auto rounded-2xl bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 flex items-center justify-center">
        <Bot className="w-7 h-7" />
      </div>
      <div className="space-y-1">
        <h4 className="font-bold text-gray-900 dark:text-white">
          Live Automations Segera Hadir
        </h4>
        <p className="text-sm text-gray-500 max-w-md mx-auto">
          Fitur automasi ini sedang dalam pengembangan dan akan segera aktif via pembaruan Meta Graph API.
        </p>
      </div>
    </div>
  );
}
