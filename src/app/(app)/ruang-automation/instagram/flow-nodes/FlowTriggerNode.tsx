// src/app/(app)/ruang-automation/instagram/flow-nodes/FlowTriggerNode.tsx
"use client";

import React from "react";
import { Zap, Plus, MessageCircle, Image as ImageIcon } from "lucide-react";
import { InstagramIcon } from "../../components/AutomationIcons";

interface FlowTriggerNodeProps {
  id: string;
  data: {
    targetOtomasi: string;
    postType: string;
    postId?: string;
    postCoverUrl?: string;
    triggerCommentType: "KEYWORDS" | "ALL";
    keywords?: string;
    featureReplyComment?: boolean;
    commentReplies?: string[];
  };
  isSelected?: boolean;
  onSelect?: () => void;
  onMouseDownDrag?: (e: React.MouseEvent) => void;
  onPortMouseDown?: (e: React.MouseEvent, portId: string) => void;
}

export function FlowTriggerNode({
  id,
  data,
  isSelected,
  onSelect,
  onMouseDownDrag,
  onPortMouseDown,
}: FlowTriggerNodeProps) {
  const isPostTarget =
    data.targetOtomasi === "Postingan Tertentu" ||
    data.targetOtomasi === "Semua Postingan" ||
    data.targetOtomasi === "Postingan Berikutnya";
  const isStoryTarget = data.targetOtomasi.includes("Story");
  const isLiveTarget = data.targetOtomasi === "Live Instagram";
  const isDmTarget = data.targetOtomasi === "Pesan Instagram";

  const triggerLabel = isDmTarget
    ? "User sends a Direct Message"
    : isLiveTarget
    ? "User comments during Live"
    : isStoryTarget
    ? "User replies to your Story"
    : "User comments on your Post or Reel";

  const triggerSublabel =
    data.targetOtomasi === "Postingan Tertentu"
      ? (data.postId ? "Postingan Terpilih" : "Belum pilih postingan")
      : data.targetOtomasi;

  const keywordsArray = (data.keywords || "")
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onSelect?.();
      }}
      className={`relative w-80 bg-white dark:bg-[#141B31] rounded-2xl border transition-all duration-150 shadow-md ${
        isSelected
          ? "border-orange-500 ring-4 ring-orange-500/20 shadow-xl"
          : "border-gray-200 dark:border-[#2C3246] hover:border-orange-400"
      }`}
    >
      {/* Node Header (Drag Handle) */}
      <div
        onMouseDown={onMouseDownDrag}
        className="px-4 py-3 flex items-center justify-between border-b border-gray-100 dark:border-[#2C3246] cursor-grab active:cursor-grabbing select-none"
      >
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 fill-amber-500" />
          </div>
          <span className="text-xs font-bold text-gray-900 dark:text-white">
            When...
          </span>
        </div>
        <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
          Trigger
        </span>
      </div>

      {/* Node Content Body */}
      <div className="p-3.5 space-y-2.5">
        {/* Trigger Item Box (ManyChat Card) */}
        <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#0E1528] border border-gray-200/80 dark:border-[#2C3246] flex items-center gap-3">
          {/* Thumbnail / Icon */}
          <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-white relative shadow-xs">
            {data.postCoverUrl ? (
              <img
                src={data.postCoverUrl}
                alt="Post cover"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            ) : (
              <InstagramIcon className="w-5 h-5 text-white" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-gray-900 dark:text-white truncate">
              {triggerLabel}
            </h4>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate mt-0.5">
              {triggerSublabel}
            </p>
          </div>
        </div>

        {/* Keywords Pill tags */}
        <div className="px-1 space-y-1">
          <div className="flex items-center justify-between text-[10px] font-semibold text-gray-500 dark:text-gray-400">
            <span>Kata Kunci Pemicu:</span>
            <span className="font-bold text-gray-700 dark:text-gray-300">
              {data.triggerCommentType === "ALL" ? "Semua Komentar" : `${keywordsArray.length} Kata`}
            </span>
          </div>

          {data.triggerCommentType !== "ALL" && keywordsArray.length > 0 && (
            <div className="flex flex-wrap gap-1 max-h-12 overflow-hidden">
              {keywordsArray.slice(0, 4).map((kw, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-md bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-900/40 text-[10px] font-semibold truncate max-w-[90px]"
                >
                  {kw}
                </span>
              ))}
              {keywordsArray.length > 4 && (
                <span className="px-1.5 py-0.5 text-[9px] text-gray-400">
                  +{keywordsArray.length - 4}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Public Comment Reply Indicator */}
        {data.featureReplyComment && !isDmTarget && (
          <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-medium border border-emerald-500/20">
            <MessageCircle className="w-3 h-3 shrink-0" />
            <span className="truncate">Auto-balas komentar publik aktif</span>
          </div>
        )}

        {/* Edit Trigger Action Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSelect?.();
          }}
          className="w-full py-2 rounded-xl border border-dashed border-gray-300 dark:border-[#2C3246] hover:border-orange-500 hover:bg-orange-50/50 dark:hover:bg-orange-950/20 text-gray-600 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Atur Target & Keyword</span>
        </button>
      </div>

      {/* Output Port: "Then ●" */}
      <div className="relative px-4 py-2.5 bg-gray-50/60 dark:bg-[#0E1528]/60 border-t border-gray-100 dark:border-[#2C3246] flex items-center justify-end rounded-b-2xl">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400">
            Then
          </span>
          <div
            id={`${id}_port_then`}
            onMouseDown={(e) => onPortMouseDown?.(e, "then")}
            className="w-4 h-4 rounded-full bg-slate-500 hover:bg-orange-500 border-2 border-white dark:border-[#141B31] shadow-xs cursor-crosshair transition-all hover:scale-125"
            title="Tarik panah ke langkah berikutnya"
          />
        </div>
      </div>
    </div>
  );
}
