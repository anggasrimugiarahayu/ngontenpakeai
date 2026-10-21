"use client";

import React from "react";
import { InstagramPostItem } from "./types";
import { Film, Layers, Play, Heart, MessageSquare, Flame, Sparkles } from "lucide-react";

interface Props {
  posts: InstagramPostItem[];
  onSelectPost: (post: InstagramPostItem) => void;
}

function formatCompact(num: number): string {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (num >= 1_000) return (num / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return num.toString();
}

export function InstagramFeedGrid({ posts, onSelectPost }: Props) {
  if (!posts || posts.length === 0) {
    return (
      <div className="w-full min-h-[300px] flex flex-col items-center justify-center p-8 bg-white dark:bg-[#18181b] rounded-2xl border border-gray-200 dark:border-white/10 text-center">
        <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-400 mb-3">
          <Film className="w-6 h-6" />
        </div>
        <h4 className="text-base font-bold text-gray-900 dark:text-white">
          Tidak ada konten yang cocok
        </h4>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-sm">
          Coba ganti kata kunci pencarian atau ubah filter format (Semua / Reels / Foto).
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-1.5 sm:gap-3 md:gap-4 lg:gap-5">
      {posts.map((post) => {
        const isReel = post.mediaType === "VIDEO";
        const isCarousel = post.mediaType === "CAROUSEL_ALBUM";

        return (
          <div
            key={post.id}
            onClick={() => onSelectPost(post)}
            className="group relative aspect-square sm:aspect-[4/5] rounded-lg sm:rounded-xl md:rounded-2xl overflow-hidden bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-white/10 cursor-pointer shadow-xs hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          >
            {/* Thumbnail Image */}
            <img
              src={post.thumbnailUrl}
              alt={post.hookText || "Instagram post"}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />

            {/* Gradient Overlay for Text Readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/40 pointer-events-none" />

            {/* Top-Left: Outlier Score Badge (The SortFeed Power Indicator) */}
            <div className="absolute top-1.5 left-1.5 sm:top-2.5 sm:left-2.5 z-10">
              {post.outlierTier === "super_viral" ? (
                <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md sm:rounded-lg text-[10px] sm:text-xs font-black tracking-tight bg-gradient-to-r from-red-600 via-rose-600 to-orange-500 text-white shadow-md ring-1 ring-white/30 animate-pulse">
                  <Flame className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 fill-amber-300 text-amber-300" />
                  <span>{post.outlierScore}× VIRAL</span>
                </span>
              ) : post.outlierTier === "viral" ? (
                <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md sm:rounded-lg text-[10px] sm:text-xs font-black tracking-tight bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md">
                  <Flame className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 fill-white text-white" />
                  <span>{post.outlierScore}× VIRAL</span>
                </span>
              ) : post.outlierTier === "high" ? (
                <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md sm:rounded-lg text-[10px] sm:text-xs font-bold tracking-tight bg-purple-600 text-white shadow-md">
                  <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  <span>{post.outlierScore}× TOP</span>
                </span>
              ) : (
                <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded-md text-[9px] sm:text-[11px] font-semibold bg-black/50 backdrop-blur-md text-white/90 border border-white/10">
                  {post.outlierScore}×
                </span>
              )}
            </div>

            {/* Top-Right: Media Type Icon */}
            <div className="absolute top-1.5 right-1.5 sm:top-2.5 sm:right-2.5 z-10 text-white/90 drop-shadow-md">
              {isReel ? (
                <Film className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              ) : isCarousel ? (
                <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              ) : null}
            </div>

            {/* Bottom: Metrics Bar */}
            <div className="absolute bottom-0 inset-x-0 p-1.5 sm:p-2.5 md:p-3 text-white z-10 flex flex-col justify-end">
              {/* Hook text preview (Visible on tablet/desktop) */}
              <p className="hidden sm:line-clamp-2 text-[11px] font-medium text-white/90 leading-tight mb-2 drop-shadow-sm">
                "{post.hookText}"
              </p>

              {/* Numbers: Views, Likes, Comments */}
              <div className="flex items-center justify-between text-[10px] sm:text-xs font-bold tracking-tight">
                {/* Views */}
                <div className="flex items-center gap-1 text-orange-300">
                  <Play className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-orange-300" />
                  <span>{formatCompact(post.viewsCount)}</span>
                </div>

                {/* Likes */}
                <div className="flex items-center gap-1 text-white/90">
                  <Heart className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-rose-500 text-rose-500" />
                  <span>{formatCompact(post.likesCount)}</span>
                </div>

                {/* Comments (Desktop only) */}
                <div className="hidden md:flex items-center gap-1 text-white/80">
                  <MessageSquare className="w-3 h-3" />
                  <span>{formatCompact(post.commentsCount)}</span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
