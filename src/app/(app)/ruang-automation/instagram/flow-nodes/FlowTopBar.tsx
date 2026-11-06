// src/app/(app)/ruang-automation/instagram/flow-nodes/FlowTopBar.tsx
"use client";

import React, { useState } from "react";
import {
  ArrowLeft,
  Check,
  Undo2,
  Redo2,
  Eye,
  Zap,
  Pencil,
  Sliders,
  ChevronRight,
  Sparkles,
} from "lucide-react";

interface FlowTopBarProps {
  ruleName: string;
  setRuleName: (name: string) => void;
  isActive: boolean;
  isSaving: boolean;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onOpenPreview: () => void;
  onSetLive: () => void;
  onSaveDraft: () => void;
  onGoToBasicBuilder: () => void;
  onBackToAutomation: () => void;
  selectedStepTitle?: string | null;
}

export function FlowTopBar({
  ruleName,
  setRuleName,
  isActive,
  isSaving,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onOpenPreview,
  onSetLive,
  onSaveDraft,
  onGoToBasicBuilder,
  onBackToAutomation,
  selectedStepTitle,
}: FlowTopBarProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  return (
    <header className="h-14 px-4 sm:px-6 bg-white dark:bg-[#141B31] border-b border-gray-200 dark:border-[#2C3246] flex items-center justify-between z-40 select-none shadow-xs">
      {/* LEFT SECTION: Back & Editable Breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onBackToAutomation}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
          title="Kembali ke Ruang Automation"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <span className="hidden sm:inline font-medium">Automations</span>
          <ChevronRight className="w-3.5 h-3.5 hidden sm:inline text-gray-400" />

          {/* Editable Title */}
          {isEditingTitle ? (
            <input
              type="text"
              autoFocus
              value={ruleName}
              onChange={(e) => setRuleName(e.target.value)}
              onBlur={() => setIsEditingTitle(false)}
              onKeyDown={(e) => {
                if (e.key === "Enter") setIsEditingTitle(false);
              }}
              className="px-2 py-0.5 rounded border border-blue-500 text-xs font-bold text-gray-900 dark:text-white bg-white dark:bg-[#0A1128] focus:outline-none max-w-[200px] sm:max-w-[260px]"
            />
          ) : (
            <button
              type="button"
              onClick={() => setIsEditingTitle(true)}
              className="flex items-center gap-1.5 font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors max-w-[180px] sm:max-w-[240px] md:max-w-[320px] truncate"
              title="Klik untuk ubah nama alur"
            >
              <span className="truncate">{ruleName || "Otomasi Tanpa Nama"}</span>
              <Pencil className="w-3 h-3 text-gray-400 shrink-0" />
            </button>
          )}

          {/* Status Badge */}
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 ${
              isActive
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
            }`}
          >
            {isActive ? "LIVE" : "DRAFT"}
          </span>
        </div>
      </div>

      {/* CENTER SECTION: Hint Pill */}
      <div className="hidden lg:flex items-center justify-center">
        <div className="px-3.5 py-1 rounded-full bg-gray-100/80 dark:bg-[#1A233D] border border-gray-200/60 dark:border-white/5 text-[11px] font-medium text-gray-600 dark:text-gray-300 flex items-center gap-1.5 shadow-2xs">
          {selectedStepTitle ? (
            <>
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span>Mengedit: <strong>{selectedStepTitle}</strong></span>
            </>
          ) : (
            <>
              <span>👇</span>
              <span>Klik salah satu kotak alur untuk mengedit</span>
            </>
          )}
        </div>
      </div>

      {/* RIGHT SECTION: Controls & Actions */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Saved Status Indicator */}
        <div className="hidden sm:flex items-center gap-1 text-[11px] font-semibold text-gray-400 dark:text-gray-500 mr-1">
          {isSaving ? (
            <span className="animate-pulse text-blue-500">Menyimpan...</span>
          ) : (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-500" />
              <span>Tersimpan</span>
            </>
          )}
        </div>

        {/* Undo / Redo */}
        <div className="hidden md:flex items-center bg-gray-100 dark:bg-[#1A233D] rounded-lg p-0.5 border border-gray-200/60 dark:border-white/5">
          <button
            type="button"
            disabled={!canUndo}
            onClick={onUndo}
            className="w-7 h-7 rounded flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Undo"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            disabled={!canRedo}
            onClick={onRedo}
            className="w-7 h-7 rounded flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Redo"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Go to Basic Builder */}
        <button
          type="button"
          onClick={onGoToBasicBuilder}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-[#2C3246] hover:bg-gray-50 dark:hover:bg-white/5 text-xs font-semibold text-gray-700 dark:text-gray-300 transition-colors cursor-pointer"
          title="Buka alur ini di form Basic Studio"
        >
          <Sliders className="w-3.5 h-3.5 text-gray-400" />
          <span>Ke Basic Builder</span>
        </button>

        {/* Preview Button */}
        <button
          type="button"
          onClick={onOpenPreview}
          className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-[#2C3246] bg-white dark:bg-[#141B31] hover:bg-gray-50 dark:hover:bg-white/5 text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
          title="Buka Simulator Chat Instagram"
        >
          <Eye className="w-3.5 h-3.5 text-gray-500" />
          <span>Preview</span>
        </button>

        {/* Set Live Primary Action */}
        <button
          type="button"
          disabled={isSaving}
          onClick={onSetLive}
          className="px-4 py-1.5 rounded-lg bg-[#0084FF] hover:bg-[#0073E6] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm shadow-blue-500/25 active:scale-95 disabled:opacity-60 cursor-pointer"
        >
          <Zap className="w-3.5 h-3.5 fill-white" />
          <span>{isActive ? "Update Live" : "Set Live"}</span>
        </button>
      </div>
    </header>
  );
}
