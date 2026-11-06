// src/app/(app)/ruang-automation/instagram/flow-nodes/FlowWelcomeDmNode.tsx
"use client";

import React from "react";
import { MessageSquare, Trash2 } from "lucide-react";
import { InstagramIcon } from "../../components/AutomationIcons";

interface FlowWelcomeDmNodeProps {
  id: string;
  data: {
    welcomeMessage: string;
    welcomeButtonLabel: string;
    welcomeMessageType?: string;
  };
  isSelected?: boolean;
  onSelect?: () => void;
  onDelete?: () => void;
  onMouseDownDrag?: (e: React.MouseEvent) => void;
  onPortMouseDown?: (e: React.MouseEvent, portId: string) => void;
}

export function FlowWelcomeDmNode({
  id,
  data,
  isSelected,
  onSelect,
  onDelete,
  onMouseDownDrag,
  onPortMouseDown,
}: FlowWelcomeDmNodeProps) {
  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onSelect?.();
      }}
      className={`relative w-72 bg-white dark:bg-[#141B31] rounded-2xl border transition-all duration-150 shadow-md ${
        isSelected
          ? "border-orange-500 ring-4 ring-orange-500/20 shadow-xl"
          : "border-gray-200 dark:border-[#2C3246] hover:border-orange-400"
      }`}
    >
      {/* Input Port (Left Side Target) */}
      <div
        id={`${id}_input`}
        className="absolute -left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-slate-500 border-2 border-white dark:border-[#141B31] shadow-xs"
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
              Pesan Pembuka (DM)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {onDelete && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-1 rounded text-gray-400 hover:text-rose-500 transition-colors"
              title="Hapus step ini"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
          <MessageSquare className="w-4 h-4 text-orange-500" />
        </div>
      </div>

      {/* Message Balloon Body */}
      <div className="p-3.5 space-y-3">
        {/* Chat Bubble */}
        <div className="p-3 rounded-2xl bg-gray-50 dark:bg-[#0E1528] border border-gray-200/80 dark:border-[#2C3246] text-xs text-gray-800 dark:text-gray-200 leading-relaxed max-h-28 overflow-hidden line-clamp-4">
          {data.welcomeMessage || "Pesan pembuka belum diisi..."}
        </div>

        {/* Postback Button with Output Port */}
        <div className="relative group/btn">
          <div className="w-full py-2.5 px-3 rounded-xl bg-gray-100 dark:bg-[#1A233D] hover:bg-gray-200 dark:hover:bg-[#232F52] text-xs font-bold text-gray-900 dark:text-white flex items-center justify-between transition-colors border border-gray-200/60 dark:border-white/5">
            <span className="truncate pr-4">
              {data.welcomeButtonLabel || "Lihat Produk 🤩"}
            </span>

            {/* Source port circle inside button row */}
            <div
              id={`${id}_port_btn`}
              onMouseDown={(e) => onPortMouseDown?.(e, "welcome_btn_click")}
              className="w-4 h-4 rounded-full bg-slate-500 hover:bg-orange-500 border-2 border-white dark:border-[#141B31] shadow-xs cursor-crosshair transition-all hover:scale-125 shrink-0"
              title="Tarik panah saat tombol diklik"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
