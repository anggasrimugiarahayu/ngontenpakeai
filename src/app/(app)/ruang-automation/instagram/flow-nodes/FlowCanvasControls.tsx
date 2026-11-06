// src/app/(app)/ruang-automation/instagram/flow-nodes/FlowCanvasControls.tsx
"use client";

import React from "react";
import { Plus, Wand2, ZoomIn, ZoomOut, Maximize2, HelpCircle } from "lucide-react";

interface FlowCanvasControlsProps {
  onOpenAddStepMenu: () => void;
  onAutoArrange: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
  zoom: number;
}

export function FlowCanvasControls({
  onOpenAddStepMenu,
  onAutoArrange,
  onZoomIn,
  onZoomOut,
  onResetView,
  zoom,
}: FlowCanvasControlsProps) {
  return (
    <>
      {/* Top Right Floating Add Step (+) FAB */}
      <div className="absolute top-4 right-4 z-30">
        <button
          type="button"
          onClick={onOpenAddStepMenu}
          className="w-12 h-12 rounded-full bg-[#f97316] hover:bg-[#ea580c] text-white shadow-xl shadow-orange-500/30 flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
          title="Tambah Langkah Alur Baru (+)"
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
        </button>
      </div>

      {/* Right Floating Vertical Control Bar */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-2">
        <div className="bg-white dark:bg-[#141B31] border border-gray-200 dark:border-[#2C3246] rounded-2xl shadow-xl p-1.5 flex flex-col gap-1 select-none">
          {/* Auto Arrange (Magic Wand) */}
          <button
            type="button"
            onClick={onAutoArrange}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-700 dark:text-gray-200 hover:bg-orange-50 dark:hover:bg-orange-950/20 hover:text-orange-600 dark:hover:text-orange-400 transition-colors cursor-pointer"
            title="Rapikan Alur Otomatis (Magic Wand)"
          >
            <Wand2 className="w-4 h-4" />
          </button>

          <div className="h-px bg-gray-200 dark:bg-[#2C3246] mx-1 my-0.5" />

          {/* Zoom In */}
          <button
            type="button"
            onClick={onZoomIn}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
            title="Perbesar Canvas (+)"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          {/* Zoom Out */}
          <button
            type="button"
            onClick={onZoomOut}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
            title="Perkecil Canvas (-)"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          {/* Reset / Fit View */}
          <button
            type="button"
            onClick={onResetView}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
            title="Pusatkan Layar"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

        {/* Zoom percentage pill */}
        <div className="text-center py-1 px-2 rounded-lg bg-black/60 backdrop-blur-xs text-[10px] font-bold text-white shadow-xs">
          {Math.round(zoom * 100)}%
        </div>
      </div>
    </>
  );
}
