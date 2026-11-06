// src/app/(app)/ruang-automation/instagram/flow-nodes/FlowAddStepMenu.tsx
"use client";

import React, { useEffect, useRef } from "react";
import {
  X,
  Play,
  Plus,
  CornerDownRight,
  Zap,
  Filter,
  GitFork,
  Clock,
  StickyNote,
  MessageSquareMore,
  ShieldCheck,
  Mail,
  Send,
  Sparkles,
} from "lucide-react";
import { InstagramIcon } from "../../components/AutomationIcons";

export type FlowStepActionType =
  | "TRIGGER"
  | "PUBLIC_COMMENT_REPLY"
  | "WELCOME_DM"
  | "MAIN_DM"
  | "FOLLOW_UP"
  | "ASK_FOLLOW"
  | "ASK_CONTACT"
  | "INSTAGRAM"
  | "CHANNEL"
  | "START_AUTOMATION"
  | "ACTIONS"
  | "CONDITION"
  | "RANDOMIZER"
  | "SMART_DELAY"
  | "COMMENT"
  | "HELPER_NOTE";

interface FlowAddStepMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onAddStep: (stepType: FlowStepActionType) => void;
  existingTypes?: string[];
}

export function FlowAddStepMenu({
  isOpen,
  onClose,
  onAddStep,
}: FlowAddStepMenuProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Close on ESC key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-start justify-center sm:justify-end p-3 sm:p-4 sm:pr-20 sm:pt-4 bg-black/25 dark:bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-150 select-none"
    >
      <div
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[360px] sm:w-[370px] max-h-[calc(100vh-80px)] sm:max-h-[85vh] overflow-y-auto bg-white dark:bg-[#151C33] border border-gray-200 dark:border-[#2C3246] rounded-2xl shadow-2xl shadow-black/15 p-4 sm:p-5 space-y-4 animate-in zoom-in-95 duration-150"
      >
        {/* Header with Title and Close Button */}
        <div className="flex items-center justify-between pb-1 border-b border-gray-100 dark:border-white/5">
          <div>
            <h3 className="font-bold text-sm text-gray-900 dark:text-white">
              Tambah Part Alur
            </h3>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              Pilih part pesan, filter, atau logika untuk alur Anda
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
            title="Tutup Menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 1. STARTING STEP */}
        <div className="space-y-1.5">
          <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
            Pemicu (Starting Step)
          </span>
          <button
            type="button"
            onClick={() => {
              onAddStep("TRIGGER");
              onClose();
            }}
            className="w-full px-3.5 py-2.5 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-emerald-500 dark:hover:border-emerald-400 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 flex items-center gap-3 transition-all duration-150 active:scale-[0.98] cursor-pointer group text-left"
          >
            <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center shrink-0">
              <Play className="w-4 h-4 text-emerald-600 dark:text-emerald-400 fill-emerald-600/20 group-hover:scale-110 transition-transform" />
            </div>
            <div>
              <span className="text-xs sm:text-[13px] font-semibold text-gray-900 dark:text-gray-100 block group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                Trigger Pemicu
              </span>
              <span className="text-[10px] text-gray-500">
                Komentar Feed/Reels, Story, atau Pesan DM
              </span>
            </div>
          </button>
        </div>

        {/* 2. PESAN & BALASAN (MESSAGES & CONTENT) */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
            Pesan & Balasan (Basic Studio)
          </span>

          {/* Balasan Komentar Publik */}
          <button
            type="button"
            onClick={() => {
              onAddStep("PUBLIC_COMMENT_REPLY");
              onClose();
            }}
            className="w-full px-3 py-2.5 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-indigo-500 dark:hover:border-indigo-400 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/20 flex items-center gap-2.5 transition-all duration-150 active:scale-[0.98] cursor-pointer group text-left"
          >
            <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0 group-hover:scale-105 transition-transform">
              <MessageSquareMore className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-semibold text-gray-900 dark:text-gray-100 block group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                Balasan Komentar Publik
              </span>
              <span className="text-[10px] text-gray-500">
                Auto-reply di feed/reels dengan spintax anti-spam
              </span>
            </div>
          </button>

          {/* Grid: Pesan Pembuka & Pesan Utama */}
          <div className="grid grid-cols-2 gap-2">
            {/* Pesan Pembuka (DM) */}
            <button
              type="button"
              onClick={() => {
                onAddStep("WELCOME_DM");
                onClose();
              }}
              className="px-3 py-2.5 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-rose-500 dark:hover:border-rose-400 hover:bg-rose-50/40 dark:hover:bg-rose-950/20 flex items-center gap-2 transition-all duration-150 active:scale-[0.98] cursor-pointer group text-left"
            >
              <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-white shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                <InstagramIcon className="w-3.5 h-3.5 text-white" />
              </div>
              <div>
                <span className="text-xs font-semibold text-gray-900 dark:text-gray-100 block group-hover:text-rose-600 dark:group-hover:text-rose-400">
                  Pesan Pembuka
                </span>
                <span className="text-[10px] text-gray-500">Sapaan awal DM</span>
              </div>
            </button>

            {/* Pesan Utama / Offer */}
            <button
              type="button"
              onClick={() => {
                onAddStep("MAIN_DM");
                onClose();
              }}
              className="px-3 py-2.5 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-orange-500 dark:hover:border-orange-400 hover:bg-orange-50/40 dark:hover:bg-orange-950/20 flex items-center gap-2 transition-all duration-150 active:scale-[0.98] cursor-pointer group text-left"
            >
              <div className="w-6 h-6 rounded-md bg-orange-50 dark:bg-orange-950/40 text-orange-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Send className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-xs font-semibold text-gray-900 dark:text-gray-100 block group-hover:text-orange-600 dark:group-hover:text-orange-400">
                  Pesan Utama
                </span>
                <span className="text-[10px] text-gray-500">Link & Penawaran</span>
              </div>
            </button>
          </div>

          {/* Follow Up */}
          <button
            type="button"
            onClick={() => {
              onAddStep("FOLLOW_UP");
              onClose();
            }}
            className="w-full px-3 py-2.5 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-amber-500 dark:hover:border-amber-400 hover:bg-amber-50/40 dark:hover:bg-amber-950/20 flex items-center gap-2.5 transition-all duration-150 active:scale-[0.98] cursor-pointer group text-left"
          >
            <div className="w-6 h-6 rounded-md bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0 group-hover:scale-105 transition-transform">
              <Clock className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-gray-900 dark:text-gray-100 block group-hover:text-amber-600 dark:group-hover:text-amber-400">
                Follow Up Delay
              </span>
              <span className="text-[10px] text-gray-500">
                Kirim pengingat otomatis jika belum klik link
              </span>
            </div>
          </button>
        </div>

        {/* 3. FILTER & GERBANG AKSES (GATEKEEPER) */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
            Gerbang Akses & Leads
          </span>
          <div className="grid grid-cols-2 gap-2">
            {/* Ask For Follow */}
            <button
              type="button"
              onClick={() => {
                onAddStep("ASK_FOLLOW");
                onClose();
              }}
              className="px-3 py-2.5 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-emerald-500 dark:hover:border-emerald-400 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 flex items-center gap-2 transition-all duration-150 active:scale-[0.98] cursor-pointer group text-left"
            >
              <div className="w-6 h-6 rounded-md bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-xs font-semibold text-gray-900 dark:text-gray-100 block group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                  Cek Follower
                </span>
                <span className="text-[10px] text-gray-500">Kunci link</span>
              </div>
            </button>

            {/* Ask For Contact */}
            <button
              type="button"
              onClick={() => {
                onAddStep("ASK_CONTACT");
                onClose();
              }}
              className="px-3 py-2.5 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-purple-500 dark:hover:border-purple-400 hover:bg-purple-50/40 dark:hover:bg-purple-950/20 flex items-center gap-2 transition-all duration-150 active:scale-[0.98] cursor-pointer group text-left"
            >
              <div className="w-6 h-6 rounded-md bg-purple-50 dark:bg-purple-950/40 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0 group-hover:scale-105 transition-transform">
                <Mail className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-xs font-semibold text-gray-900 dark:text-gray-100 block group-hover:text-purple-600 dark:group-hover:text-purple-400">
                  Minta Kontak
                </span>
                <span className="text-[10px] text-gray-500">Email/WA Leads</span>
              </div>
            </button>
          </div>
        </div>

        {/* 4. LOGIKA & OTOMASI LANJUTAN */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
            Logika & Percabangan
          </span>
          <div className="grid grid-cols-2 gap-2">
            {/* Actions */}
            <button
              type="button"
              onClick={() => {
                onAddStep("ACTIONS");
                onClose();
              }}
              className="px-3 py-2.5 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-amber-500 dark:hover:border-amber-400 hover:bg-amber-50/40 dark:hover:bg-amber-950/20 flex items-center gap-2 transition-all duration-150 active:scale-[0.98] cursor-pointer group text-left"
            >
              <div className="w-6 h-6 rounded-md bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center text-amber-500 shrink-0 group-hover:scale-105 transition-transform">
                <Zap className="w-3.5 h-3.5 fill-amber-500/20" />
              </div>
              <span className="text-xs font-semibold text-gray-900 dark:text-gray-100 group-hover:text-amber-600 dark:group-hover:text-amber-400">
                Actions
              </span>
            </button>

            {/* Condition */}
            <button
              type="button"
              onClick={() => {
                onAddStep("CONDITION");
                onClose();
              }}
              className="px-3 py-2.5 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-cyan-500 dark:hover:border-cyan-400 hover:bg-cyan-50/40 dark:hover:bg-cyan-950/20 flex items-center gap-2 transition-all duration-150 active:scale-[0.98] cursor-pointer group text-left"
            >
              <div className="w-6 h-6 rounded-md bg-cyan-50 dark:bg-cyan-950/40 flex items-center justify-center text-cyan-600 dark:text-cyan-400 shrink-0 group-hover:scale-105 transition-transform">
                <Filter className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-semibold text-gray-900 dark:text-gray-100 group-hover:text-cyan-600 dark:group-hover:text-cyan-400">
                Condition
              </span>
            </button>

            {/* Randomizer */}
            <button
              type="button"
              onClick={() => {
                onAddStep("RANDOMIZER");
                onClose();
              }}
              className="px-3 py-2.5 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-purple-500 dark:hover:border-purple-400 hover:bg-purple-50/40 dark:hover:bg-purple-950/20 flex items-center gap-2 transition-all duration-150 active:scale-[0.98] cursor-pointer group text-left"
            >
              <div className="w-6 h-6 rounded-md bg-purple-50 dark:bg-purple-950/40 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0 group-hover:scale-105 transition-transform">
                <GitFork className="w-3.5 h-3.5 rotate-90" />
              </div>
              <span className="text-xs font-semibold text-gray-900 dark:text-gray-100 group-hover:text-purple-600 dark:group-hover:text-purple-400">
                Randomizer
              </span>
            </button>

            {/* Smart Delay */}
            <button
              type="button"
              onClick={() => {
                onAddStep("SMART_DELAY");
                onClose();
              }}
              className="px-3 py-2.5 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-rose-500 dark:hover:border-rose-400 hover:bg-rose-50/40 dark:hover:bg-rose-950/20 flex items-center gap-2 transition-all duration-150 active:scale-[0.98] cursor-pointer group text-left"
            >
              <div className="w-6 h-6 rounded-md bg-rose-50 dark:bg-rose-950/40 flex items-center justify-center text-rose-500 shrink-0 group-hover:scale-105 transition-transform">
                <Clock className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-semibold text-gray-900 dark:text-gray-100 group-hover:text-rose-600 dark:group-hover:text-rose-400">
                Smart Delay
              </span>
            </button>
          </div>

          {/* Start Automation */}
          <button
            type="button"
            onClick={() => {
              onAddStep("START_AUTOMATION");
              onClose();
            }}
            className="w-full px-3 py-2 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-emerald-500 dark:hover:border-emerald-400 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 flex items-center gap-2.5 transition-all duration-150 active:scale-[0.98] cursor-pointer group text-left"
          >
            <div className="w-6 h-6 rounded-md bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 group-hover:scale-105 transition-transform">
              <CornerDownRight className="w-3.5 h-3.5 stroke-[2.2]" />
            </div>
            <span className="text-xs font-semibold text-gray-900 dark:text-gray-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
              Start Automation (Chaining)
            </span>
          </button>
        </div>

        {/* 5. EXTRAS */}
        <div className="space-y-1.5">
          <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
            Catatan Kanvas
          </span>
          <button
            type="button"
            onClick={() => {
              onAddStep("COMMENT");
              onClose();
            }}
            className="w-full px-3.5 py-2.5 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-amber-400 dark:hover:border-amber-400 hover:bg-amber-50/40 dark:hover:bg-amber-950/20 flex items-center gap-2.5 transition-all duration-150 active:scale-[0.98] cursor-pointer group text-left"
          >
            <div className="w-6 h-6 rounded-md bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center text-amber-500 shrink-0 group-hover:scale-105 transition-transform">
              <StickyNote className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-semibold text-gray-900 dark:text-gray-100 group-hover:text-amber-600 dark:group-hover:text-amber-400">
              Sticky Note (Catatan Panduan)
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
