"use client";

import React, { useState, useEffect } from "react";
import { InstagramPostItem, InstagramTargetProfile } from "./types";
import { tokens, cn } from "@/lib/design-tokens";
import {
  X,
  ExternalLink,
  Copy,
  Check,
  Flame,
  Play,
  Heart,
  MessageSquare,
  TrendingUp,
  Calendar,
  Film,
  Layers,
} from "lucide-react";

interface Props {
  post: InstagramPostItem | null;
  profile: InstagramTargetProfile;
  onClose: () => void;
}

function formatNumber(num: number): string {
  return num.toLocaleString("id-ID");
}

export function InstagramPostModal({ post, profile, onClose }: Props) {
  const [copied, setCopied] = useState(false);

  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!post) return null;

  const handleCopyCaption = () => {
    navigator.clipboard.writeText(post.caption);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedDate = new Date(post.timestamp).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={cn("w-full max-w-4xl max-h-[92vh] rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row relative animate-in zoom-in-95 duration-200", tokens.card.base)}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Floating Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-30 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white transition-colors cursor-pointer"
          title="Tutup"
        >
          <X className="w-5 h-5" />
        </button>

        {/* ===================================================================== */}
        {/* SISI KIRI: Visual Media Preview */}
        {/* ===================================================================== */}
        <div className="w-full md:w-1/2 bg-black flex items-center justify-center relative min-h-[260px] sm:min-h-[340px] md:min-h-[520px] overflow-hidden">
          <img
            src={post.thumbnailUrl}
            alt={post.hookText}
            className="w-full h-full object-cover max-h-[40vh] md:max-h-full"
          />

          {/* Badge Outlier di Preview */}
          <div className="absolute top-4 left-4 z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black bg-rose-600 text-white shadow-lg ring-1 ring-white/30">
              <Flame className="w-4 h-4 fill-amber-300 text-amber-300" />
              <span>{post.outlierScore}× Viral Outlier</span>
            </span>
          </div>

          {/* Media type indicator */}
          <div className="absolute bottom-4 left-4 z-10 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-white/90 text-xs font-semibold flex items-center gap-1.5 border border-white/10">
            {post.mediaType === "VIDEO" ? (
              <>
                <Film className="w-3.5 h-3.5 text-orange-400" />
                <span>Instagram Reels</span>
              </>
            ) : (
              <>
                <Layers className="w-3.5 h-3.5 text-purple-400" />
                <span>Carousel / Foto</span>
              </>
            )}
          </div>
        </div>

        {/* ===================================================================== */}
        {/* SISI KANAN: Detail Analitik & Naskah */}
        {/* ===================================================================== */}
        <div className="w-full md:w-1/2 flex flex-col p-4 sm:p-6 overflow-y-auto max-h-[55vh] md:max-h-[92vh]">
          {/* Header Akun */}
          <div className="flex items-center gap-3 pb-4 border-b border-gray-100 dark:border-[#2C3246]">
            <img
              src={profile.profilePicUrl}
              alt={profile.username}
              className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-[#2C3246]"
            />
            <div className="min-w-0 flex-1">
              <p className="font-bold text-sm text-gray-900 dark:text-white truncate">
                @{profile.username}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{formattedDate}</span>
              </p>
            </div>

            <a
              href={post.permalink}
              target="_blank"
              rel="noreferrer"
              className={cn("inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors", tokens.button.variants.secondary)}
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Buka IG</span>
            </a>
          </div>

          {/* Grid Metrik Detail */}
          <div className="grid grid-cols-3 gap-2 py-4 border-b border-gray-100 dark:border-[#2C3246] text-center">
            <div className="p-2.5 rounded-xl bg-orange-50/60 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-500/20">
              <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-orange-600 dark:text-orange-400">
                <Play className="w-3 h-3 fill-orange-500" />
                <span>Views</span>
              </div>
              <p className="font-black text-sm sm:text-base text-gray-900 dark:text-white mt-0.5">
                {formatNumber(post.viewsCount)}
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-rose-50/60 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20">
              <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                <Heart className="w-3 h-3 fill-rose-500" />
                <span>Likes</span>
              </div>
              <p className="font-black text-sm sm:text-base text-gray-900 dark:text-white mt-0.5">
                {formatNumber(post.likesCount)}
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20">
              <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                <TrendingUp className="w-3 h-3" />
                <span>ER</span>
              </div>
              <p className="font-black text-sm sm:text-base text-emerald-600 dark:text-emerald-400 mt-0.5">
                {post.engagementRate}%
              </p>
            </div>
          </div>

          {/* Outlier Performance Notice */}
          <div className="my-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 flex items-start gap-2.5">
            <Flame className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5 fill-amber-500/20" />
            <div className="text-xs leading-relaxed text-amber-900 dark:text-amber-200">
              <span className="font-bold">Analisis Viralitas:</span> Video ini mendapatkan tayangan{" "}
              <span className="font-bold text-rose-600 dark:text-rose-400">{post.outlierScore}× lebih tinggi</span>{" "}
              dibanding rata-rata akun @{profile.username} ({formatNumber(profile.averageViews)} views). Format hook dan topik ini sangat direkomendasikan untuk dijadikan bahan referensi.
            </div>
          </div>

          {/* Caption & Hook Box */}
          <div className="flex-1 flex flex-col space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Naskah & Caption Konten
              </span>

              <button
                onClick={handleCopyCaption}
                className="inline-flex items-center gap-1 text-xs font-bold text-orange-600 dark:text-orange-400 hover:underline cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-emerald-500">Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin Naskah</span>
                  </>
                )}
              </button>
            </div>

            <div className={cn("p-3.5 text-xs sm:text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed max-h-[220px] overflow-y-auto", tokens.card.subtle)}>
              {post.caption}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
