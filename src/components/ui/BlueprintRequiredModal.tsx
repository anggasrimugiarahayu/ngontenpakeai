"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Compass, X, ArrowRight, Sparkles } from "lucide-react";

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
      <div className="relative w-full max-w-md bg-white dark:bg-[#18181b] border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl p-6 sm:p-7 text-center z-10 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-orange-500/10 dark:bg-orange-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-orange-500/10 dark:bg-orange-500/20 rounded-full blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
          title="Tutup"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon & Badge */}
        <div className="w-14 h-14 rounded-2xl bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 text-orange-500 flex items-center justify-center mx-auto mb-4 shadow-sm">
          <Compass className="w-7 h-7" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-500/20 mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Prasyarat AI Diperlukan</span>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold font-heading text-gray-900 dark:text-white mb-2 leading-tight">
          Buka Akses {toolName}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
          Untuk menggunakan fitur ini, Anda perlu membuat{" "}
          <strong className="text-gray-900 dark:text-white font-semibold">
            Master Blueprint
          </strong>{" "}
          terlebih dahulu. AI kami memerlukan data persona, target audiens, dan
          fondasi bisnis Anda agar output kontennya akurat dan terarah.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5">
          <button
            onClick={handleNavigateToBlueprint}
            className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-5 rounded-xl transition-all shadow-md shadow-orange-500/20 hover:shadow-orange-500/30 text-sm cursor-pointer"
          >
            <span>Isi Master Blueprint Sekarang</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 rounded-xl transition-colors cursor-pointer"
          >
            Nanti Saja
          </button>
        </div>
      </div>
    </div>
  );
}
