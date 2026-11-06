// src/app/(app)/ruang-automation/instagram/flow-nodes/FlowPublicCommentNode.tsx
"use client";

import React from "react";
import { MessageSquareMore, Heart, Sparkles, Trash2 } from "lucide-react";

interface FlowPublicCommentNodeProps {
  id: string;
  data: {
    commentReplies?: string[];
    replyCommentTemplates?: string;
    likeComment?: boolean;
    commentLimit?: string;
  };
  isSelected?: boolean;
  onSelect?: () => void;
  onDelete?: () => void;
  onMouseDownDrag?: (e: React.MouseEvent) => void;
  onPortMouseDown?: (e: React.MouseEvent, portId: string) => void;
}

export function FlowPublicCommentNode({
  id,
  data,
  isSelected,
  onSelect,
  onDelete,
  onMouseDownDrag,
}: FlowPublicCommentNodeProps) {
  const replies = Array.isArray(data.commentReplies) && data.commentReplies.length > 0
    ? data.commentReplies
    : [data.replyCommentTemplates || "Pesan terkirim! 🚀 Cek DM ya! 📬"];

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onSelect?.();
      }}
      className={`relative w-80 bg-white dark:bg-[#141B31] rounded-2xl border transition-all duration-150 shadow-md cursor-pointer select-none ${
        isSelected
          ? "border-indigo-500 ring-4 ring-indigo-500/20 shadow-xl"
          : "border-gray-200 dark:border-[#2C3246] hover:border-indigo-400"
      }`}
    >
      {/* Input Port (Left Side Target) */}
      <div
        id={`${id}_input`}
        className="absolute -left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-indigo-500 border-2 border-white dark:border-[#141B31] shadow-xs"
        title="Input Alur Masuk dari Trigger"
      />

      {/* Node Header */}
      <div
        onMouseDown={onMouseDownDrag}
        className="px-4 py-3 flex items-center justify-between border-b border-gray-100 dark:border-[#2C3246] cursor-grab active:cursor-grabbing bg-indigo-50/70 dark:bg-indigo-950/30 rounded-t-2xl"
      >
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
            <MessageSquareMore className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="block text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide leading-none">
              Feed & Reels
            </span>
            <span className="text-xs font-bold text-gray-900 dark:text-white leading-tight">
              Balasan Komentar Publik
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
              className="w-6 h-6 rounded-md flex items-center justify-center text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
              title="Hapus Balasan Komentar"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Node Body */}
      <div className="p-3.5 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">
            Variasi Komentar ({replies.length} Template)
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
            <Sparkles className="w-2.5 h-2.5" />
            Spintax Anti-Spam
          </span>
        </div>

        {/* Display up to 2 replies preview */}
        <div className="space-y-1.5">
          {replies.slice(0, 2).map((item, idx) => (
            <div
              key={idx}
              className="p-2.5 rounded-xl bg-gray-50 dark:bg-[#0E1528] border border-gray-200/70 dark:border-[#2C3246] text-xs text-gray-700 dark:text-gray-300 leading-snug line-clamp-2"
            >
              💬 {item}
            </div>
          ))}
          {replies.length > 2 && (
            <div className="text-[10px] text-gray-400 text-center font-medium">
              +{replies.length - 2} variasi komentar lainnya
            </div>
          )}
        </div>

        {/* Extra Features Pill: Auto Like Comment */}
        <div className="pt-1 flex items-center justify-between text-[11px] text-gray-500 border-t border-gray-100 dark:border-white/5">
          <span className="flex items-center gap-1.5 font-medium text-rose-600 dark:text-rose-400">
            <Heart className="w-3 h-3 fill-rose-500 text-rose-500" />
            Like Komentar Otomatis
          </span>
          <span className="text-[10px] font-semibold text-gray-400">
            {data.commentLimit || "1x per akun"}
          </span>
        </div>
      </div>
    </div>
  );
}
