// src/app/(app)/ruang-automation/instagram/flow-nodes/FlowAddStepMenu.tsx
"use client";

import React from "react";
import {
  X,
  Zap,
  ShieldCheck,
  Mail,
  Clock,
  StickyNote,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { InstagramIcon } from "../../components/AutomationIcons";

interface FlowAddStepMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onAddStep: (stepType: "WELCOME_DM" | "ASK_FOLLOW" | "ASK_CONTACT" | "FOLLOW_UP" | "HELPER_NOTE") => void;
  existingTypes: string[];
}

export function FlowAddStepMenu({
  isOpen,
  onClose,
  onAddStep,
  existingTypes,
}: FlowAddStepMenuProps) {
  if (!isOpen) return null;

  const hasWelcome = existingTypes.includes("WELCOME_DM");
  const hasFollow = existingTypes.includes("ASK_FOLLOW");
  const hasContact = existingTypes.includes("ASK_CONTACT");

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end p-4 sm:p-6 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm mt-12 bg-white dark:bg-[#141B31] border border-gray-200 dark:border-[#2C3246] rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-right duration-200"
      >
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-gray-100 dark:border-[#2C3246] flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-gray-900 dark:text-white">
              Tambah Langkah Alur
            </h3>
            <p className="text-[11px] text-gray-500">
              Pilih blok konten atau logika untuk alur Anda
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Categories */}
        <div className="p-4 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Category: Pesan & Konten */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 px-1">
              Pesan & Konten Instagram
            </span>

            {/* Opening DM */}
            <button
              type="button"
              disabled={hasWelcome}
              onClick={() => {
                onAddStep("WELCOME_DM");
                onClose();
              }}
              className="w-full p-3 rounded-xl border border-gray-200/80 dark:border-[#2C3246] hover:border-blue-500 hover:bg-blue-50/40 dark:hover:bg-blue-950/20 text-left flex items-center gap-3 transition-colors disabled:opacity-40 disabled:cursor-not-allowed group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-white shrink-0 shadow-xs">
                <InstagramIcon className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                  Pesan Pembuka (Opening DM)
                </h4>
                <p className="text-[11px] text-gray-500 truncate">
                  {hasWelcome ? "Sudah ada di alur" : "Teks + tombol pembuka respon komentar"}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500" />
            </button>
          </div>

          {/* Category: Logika & Percabangan */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 px-1">
              Logika & Filter Pengguna
            </span>

            {/* Ask Follow Gate */}
            <button
              type="button"
              disabled={hasFollow}
              onClick={() => {
                onAddStep("ASK_FOLLOW");
                onClose();
              }}
              className="w-full p-3 rounded-xl border border-gray-200/80 dark:border-[#2C3246] hover:border-emerald-500 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 text-left flex items-center gap-3 transition-colors disabled:opacity-40 disabled:cursor-not-allowed group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white shrink-0 shadow-xs">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                  Cek Status Follower (Gate)
                </h4>
                <p className="text-[11px] text-gray-500 truncate">
                  {hasFollow ? "Sudah ada di alur" : "Kunci link sampai user mem-follow akun"}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-emerald-500" />
            </button>

            {/* Ask Contact Gate */}
            <button
              type="button"
              disabled={hasContact}
              onClick={() => {
                onAddStep("ASK_CONTACT");
                onClose();
              }}
              className="w-full p-3 rounded-xl border border-gray-200/80 dark:border-[#2C3246] hover:border-purple-500 hover:bg-purple-50/40 dark:hover:bg-purple-950/20 text-left flex items-center gap-3 transition-colors disabled:opacity-40 disabled:cursor-not-allowed group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center text-white shrink-0 shadow-xs">
                <Mail className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                  Minta Email / WhatsApp (Leads)
                </h4>
                <p className="text-[11px] text-gray-500 truncate">
                  {hasContact ? "Sudah ada di alur" : "Kumpulkan data kontak sebelum materi dikirim"}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-purple-500" />
            </button>

            {/* Smart Delay & Follow Up */}
            <button
              type="button"
              onClick={() => {
                onAddStep("FOLLOW_UP");
                onClose();
              }}
              className="w-full p-3 rounded-xl border border-gray-200/80 dark:border-[#2C3246] hover:border-amber-500 hover:bg-amber-50/40 dark:hover:bg-amber-950/20 text-left flex items-center gap-3 transition-colors group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-white shrink-0 shadow-xs">
                <Clock className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                  Smart Delay & Pesan Follow-Up
                </h4>
                <p className="text-[11px] text-gray-500 truncate">
                  Kirim pengingat otomatis jika belum klik link
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-amber-500" />
            </button>
          </div>

          {/* Category: Edukasi & Catatan */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 px-1">
              Catatan & Panduan
            </span>

            <button
              type="button"
              onClick={() => {
                onAddStep("HELPER_NOTE");
                onClose();
              }}
              className="w-full p-3 rounded-xl border border-gray-200/80 dark:border-[#2C3246] hover:border-amber-400 hover:bg-amber-50/40 dark:hover:bg-amber-950/20 text-left flex items-center gap-3 transition-colors group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-[#FFEBAA] text-amber-800 flex items-center justify-center shrink-0 shadow-xs">
                <StickyNote className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                  Sticky Note (Catatan Kanvas)
                </h4>
                <p className="text-[11px] text-gray-500 truncate">
                  Tempelkan catatan pengingat di samping kotak alur
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-amber-500" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
