"use client";

import React from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface QuotaExceededModalProps {
  isOpen: boolean;
  onClose: () => void;
  toolName?: string;
}

export default function QuotaExceededModal({
  isOpen,
  onClose,
  toolName = "fitur ini",
}: QuotaExceededModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#141B31] border border-gray-200 dark:border-[#2C3246] rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl text-center relative animate-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
          aria-label="Tutup"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-14 h-14 bg-orange-500/10 text-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl border border-orange-500/20">
          ✨
        </div>

        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Kuota Percobaan Gratis Kamu Sudah Habis ✨
        </h3>

        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
          Kamu sudah menggunakan 3x kesempatan coba gratis di {toolName}. Yuk, upgrade ke Paket PRO Tools untuk lanjut generate tanpa batas kuota!
        </p>

        <div className="space-y-3">
          <Link href="/checkout?type=PRO_TOOLS" className="block w-full">
            <Button variant="primary" size="lg" className="w-full">
              🚀 Upgrade ke PRO Tools — Rp 99.000 / bln
            </Button>
          </Link>
          <button
            onClick={onClose}
            className="w-full py-2.5 text-sm font-bold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white transition-colors cursor-pointer"
          >
            Nanti Saja
          </button>
        </div>
      </div>
    </div>
  );
}
