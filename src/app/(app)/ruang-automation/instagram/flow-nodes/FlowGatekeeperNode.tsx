// src/app/(app)/ruang-automation/instagram/flow-nodes/FlowGatekeeperNode.tsx
"use client";

import React from "react";
import { ShieldCheck, Mail, Phone, Trash2, Check, AlertCircle } from "lucide-react";

interface FlowGatekeeperNodeProps {
  id: string;
  type: "ASK_FOLLOW" | "ASK_CONTACT";
  data: Record<string, any>;
  isSelected?: boolean;
  onSelect?: () => void;
  onDelete?: () => void;
  onMouseDownDrag?: (e: React.MouseEvent) => void;
  onPortMouseDown?: (e: React.MouseEvent, portId: string) => void;
}

export function FlowGatekeeperNode({
  id,
  type,
  data,
  isSelected,
  onSelect,
  onDelete,
  onMouseDownDrag,
  onPortMouseDown,
}: FlowGatekeeperNodeProps) {
  const isFollow = type === "ASK_FOLLOW";

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

      {/* Header */}
      <div
        onMouseDown={onMouseDownDrag}
        className="px-4 py-3 flex items-center justify-between border-b border-gray-100 dark:border-[#2C3246] cursor-grab active:cursor-grabbing select-none"
      >
        <div className="flex items-center gap-2">
          <div
            className={`w-5 h-5 rounded-md flex items-center justify-center text-white shadow-xs ${
              isFollow ? "bg-emerald-600" : "bg-purple-600"
            }`}
          >
            {isFollow ? <ShieldCheck className="w-3.5 h-3.5" /> : <Mail className="w-3.5 h-3.5" />}
          </div>
          <div>
            <span className="block text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase leading-none">
              Logic Gate
            </span>
            <span className="text-xs font-bold text-gray-900 dark:text-white leading-tight">
              {isFollow ? "Cek Status Follow" : "Minta Kontak (Leads)"}
            </span>
          </div>
        </div>

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
      </div>

      {/* Body */}
      <div className="p-3.5 space-y-2.5">
        <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-[#0E1528] border border-gray-200/80 dark:border-[#2C3246] text-[11px] text-gray-700 dark:text-gray-300 leading-relaxed line-clamp-3">
          {isFollow
            ? (data.askForFollowMessage || "Wajib follow akun sebelum link materi dikirimkan...")
            : (data.askContactMessage || "Minta user mengetikkan email aktif sebelum akses dibuka...")}
        </div>

        {/* Condition Branch: Output Port 1 (Verified / Selesai) */}
        <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
          <div className="flex items-center gap-1.5 truncate">
            <Check className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">
              {isFollow ? "Sudah Follow" : "Email Diterima"}
            </span>
          </div>

          <div
            id={`${id}_port_success`}
            onMouseDown={(e) => onPortMouseDown?.(e, isFollow ? "already_followed" : "contact_submitted")}
            className="w-4 h-4 rounded-full bg-emerald-600 hover:bg-emerald-700 border-2 border-white dark:border-[#141B31] shadow-xs cursor-crosshair transition-all hover:scale-125 shrink-0"
            title="Lanjut ke Pesan Utama"
          />
        </div>
      </div>
    </div>
  );
}
