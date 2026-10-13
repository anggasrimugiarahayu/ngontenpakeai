"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Compass, X, ArrowRight } from "lucide-react";

interface BlueprintRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  toolName?: string;
}

export default function BlueprintRequiredModal({
  isOpen,
  onClose,
  toolName = "Fitur AI",
}: BlueprintRequiredModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const handleNavigateToBlueprint = () => {
    onClose();
    if (window.location.pathname.startsWith("/ruang-ngonten")) {
      window.history.pushState(null, "", "/ruang-ngonten/master-blueprint");
      window.dispatchEvent(new Event("app-shallow-navigate"));
    } else {
      router.push("/ruang-ngonten/master-blueprint");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-sm bg-white dark:bg-[#18181b] border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl p-6 text-center z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
          title="Tutup"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon */}
        <div className="w-12 h-12 rounded-xl bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 text-orange-500 flex items-center justify-center mx-auto mb-3 shadow-sm">
          <Compass className="w-6 h-6" />
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold font-heading text-gray-900 dark:text-white mb-2 leading-tight">
          Master Blueprint Diperlukan
        </h3>

        {/* Description - Simple and Clean */}
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
          Untuk menggunakan <strong className="text-gray-900 dark:text-white font-semibold">{toolName}</strong>, silakan isi Master Blueprint terlebih dahulu agar AI dapat memahami persona dan strategi bisnismu.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2">
          <button
            onClick={handleNavigateToBlueprint}
            className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 px-4 rounded-xl transition-all shadow-md shadow-orange-500/20 text-xs sm:text-sm cursor-pointer"
          >
            <span>Isi Blueprint Sekarang</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onClose}
            className="w-full py-2 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 rounded-xl transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
