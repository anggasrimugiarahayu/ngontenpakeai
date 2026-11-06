// src/app/(app)/ruang-automation/instagram/flow-nodes/FlowMainMessageNode.tsx
"use client";

import React from "react";
import { ExternalLink, Clock, MessageSquare, LayoutTemplate, Plus } from "lucide-react";
import { InstagramIcon } from "../../components/AutomationIcons";

interface FlowMainMessageNodeProps {
  id: string;
  data: {
    messageType: string;
    dmMessage: string;
    buttons?: any[];
    carouselSlides?: any[];
    featureFollowUp?: boolean;
    followUpDelay?: string;
    followUpCondition?: string;
    followUpMessage?: string;
    followUpButtonLabel?: string;
  };
  isSelected?: boolean;
  onSelect?: () => void;
  onMouseDownDrag?: (e: React.MouseEvent) => void;
  onPortMouseDown?: (e: React.MouseEvent, portId: string) => void;
}

export function FlowMainMessageNode({
  id,
  data,
  isSelected,
  onSelect,
  onMouseDownDrag,
  onPortMouseDown,
}: FlowMainMessageNodeProps) {
  const isCarousel = data.messageType === "CAROUSEL" || data.messageType === "Carousel";
  const buttons = Array.isArray(data.buttons) && data.buttons.length > 0 ? data.buttons : [];
  const primaryButton = buttons[0] || null;

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onSelect?.();
      }}
      className={`relative w-80 bg-white dark:bg-[#141B31] rounded-2xl border transition-all duration-150 shadow-md ${
        isSelected
          ? "border-blue-500 ring-4 ring-blue-500/20 shadow-xl"
          : "border-gray-200 dark:border-[#2C3246] hover:border-blue-400"
      }`}
    >
      {/* Input Port (Left Side Target) */}
      <div
        id={`${id}_input`}
        className="absolute -left-2.5 top-1/4 -translate-y-1/2 w-4 h-4 rounded-full bg-slate-500 border-2 border-white dark:border-[#141B31] shadow-xs"
        title="Input Alur Masuk"
      />

      {/* Node Header */}
      <div
        onMouseDown={onMouseDownDrag}
        className="px-4 py-3 flex items-center justify-between border-b border-gray-100 dark:border-[#2C3246] cursor-grab active:cursor-grabbing select-none"
      >
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-white shadow-xs">
            <InstagramIcon className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <span className="block text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase leading-none">
              Instagram
            </span>
            <span className="text-xs font-bold text-gray-900 dark:text-white leading-tight">
              Pesan Utama (Offer & Link)
            </span>
          </div>
        </div>

        <MessageSquare className="w-4 h-4 text-blue-500" />
      </div>

      {/* Node Body */}
      <div className="p-3.5 space-y-3">
        {/* Main DM Bubble */}
        <div className="p-3 rounded-2xl bg-gray-50 dark:bg-[#0E1528] border border-gray-200/80 dark:border-[#2C3246] text-xs text-gray-800 dark:text-gray-200 leading-relaxed max-h-28 overflow-hidden line-clamp-4">
          {data.dmMessage || "Pesan materi / link belum diisi..."}
        </div>

        {/* Buttons / Carousel Display */}
        {isCarousel ? (
          <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-700 dark:text-purple-300 flex items-center gap-2 text-xs font-semibold">
            <LayoutTemplate className="w-4 h-4 shrink-0 text-purple-600" />
            <span>Katalog Carousel ({data.carouselSlides?.length || 0} slide)</span>
          </div>
        ) : (
          <div className="space-y-1.5">
            {buttons.map((btn, idx) => (
              <div
                key={btn.id || idx}
                className="w-full py-2.5 px-3 rounded-xl bg-gray-100 dark:bg-[#1A233D] text-xs font-bold text-gray-900 dark:text-white flex items-center justify-between border border-gray-200/60 dark:border-white/5"
              >
                <span className="truncate pr-2">
                  {btn.label || "Buka Link Akses"}
                </span>
                <div className="flex items-center gap-1.5 text-gray-400 shrink-0">
                  <ExternalLink className="w-3.5 h-3.5 text-blue-500" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Smart Delay Block (ManyChat Purple block) */}
        {data.featureFollowUp && (
          <div className="space-y-2 pt-1 border-t border-gray-100 dark:border-[#2C3246]/60">
            {/* Delay pill banner */}
            <div className="p-2 rounded-xl bg-purple-100/70 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/40 text-purple-900 dark:text-purple-200 flex items-center justify-center gap-1.5 text-xs font-bold shadow-2xs">
              <Clock className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span>Menunggu {data.followUpDelay || "1 Jam"}...</span>
            </div>

            {/* Follow up message bubble */}
            <div className="p-2.5 rounded-2xl bg-gray-50 dark:bg-[#0E1528] border border-gray-200/80 dark:border-[#2C3246] text-[11px] text-gray-700 dark:text-gray-300 leading-relaxed line-clamp-3">
              {data.followUpMessage || "Pesan follow-up pengingat..."}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Footer & Next Step Port */}
      <div className="px-4 py-2.5 bg-gray-50/60 dark:bg-[#0E1528]/60 border-t border-gray-100 dark:border-[#2C3246] flex items-center justify-between rounded-b-2xl">
        <span className="text-[10px] font-semibold text-gray-400">
          {data.featureFollowUp ? "Selesai Alur + Follow-Up" : "Selesai Alur"}
        </span>

        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400">
            Next Step
          </span>
          <div
            id={`${id}_port_next`}
            onMouseDown={(e) => onPortMouseDown?.(e, "next_step")}
            className="w-4 h-4 rounded-full border-2 border-slate-400 dark:border-gray-500 hover:border-blue-500 hover:bg-blue-500/20 cursor-pointer transition-all hover:scale-125"
            title="Tambah atau sambungkan langkah lanjutan"
          />
        </div>
      </div>
    </div>
  );
}
