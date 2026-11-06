// src/app/(app)/ruang-automation/instagram/flow-nodes/FlowHelperNoteNode.tsx
"use client";

import React from "react";
import { StickyNote, X } from "lucide-react";

interface FlowHelperNoteNodeProps {
  id: string;
  text: string;
  isSelected?: boolean;
  onSelect?: () => void;
  onDelete?: () => void;
  onMouseDownDrag?: (e: React.MouseEvent) => void;
}

export function FlowHelperNoteNode({
  id,
  text,
  isSelected,
  onSelect,
  onDelete,
  onMouseDownDrag,
}: FlowHelperNoteNodeProps) {
  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onSelect?.();
      }}
      onMouseDown={onMouseDownDrag}
      className={`group relative w-64 p-3.5 rounded-2xl bg-[#FFF9E6] dark:bg-[#2b271a] border text-xs text-amber-950 dark:text-amber-100 shadow-sm transition-all duration-150 cursor-grab active:cursor-grabbing select-none ${
        isSelected
          ? "border-amber-400 ring-2 ring-amber-400/30 shadow-md"
          : "border-amber-200/80 dark:border-amber-800/40 hover:border-amber-300"
      }`}
    >
      <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-amber-200/50 dark:border-amber-800/30">
        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
          <StickyNote className="w-3 h-3" />
          <span>Panduan</span>
        </div>
        {onDelete && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="opacity-0 group-hover:opacity-100 w-4 h-4 rounded flex items-center justify-center text-amber-600 hover:text-amber-800 transition-opacity"
            title="Sembunyikan catatan"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      <p className="text-[11px] leading-relaxed opacity-90">{text}</p>
    </div>
  );
}
