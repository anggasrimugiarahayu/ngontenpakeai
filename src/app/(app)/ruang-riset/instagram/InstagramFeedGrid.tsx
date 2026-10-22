"use client";

import React from "react";
import { InstagramPostItem, InstagramTargetProfile, SortOption } from "./types";
import { Film, Layers, Play, Heart, MessageSquare, Flame, Sparkles } from "lucide-react";

interface Props {
  posts: InstagramPostItem[];
  profile: InstagramTargetProfile;
  sortOption?: SortOption;
  onSelectPost: (post: InstagramPostItem) => void;
}

function formatCompact(num: number): string {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (num >= 1_000) return (num / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return num.toString();
}

export function InstagramFeedGrid({
  posts,
  profile,
  sortOption = "outlier",
  onSelectPost,
}: Props) {
  if (!posts || posts.length === 0) {
    return (
      <div className="w-full min-h-[300px] flex flex-col items-center justify-center p-8 bg-white dark:bg-[#141B31] rounded-2xl border border-gray-200 dark:border-[#2C3246] text-center">
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
    /* 4 feed per baris di desktop (lg:grid-cols-4), 3 di tablet (sm:grid-cols-3), 2 di mobile (grid-cols-2) */
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3.5 md:gap-4">
      {posts.map((post) => {
        const isReel = post.mediaType === "VIDEO";
        const isCarousel = post.mediaType === "CAROUSEL_ALBUM";

        return (
          <div
            key={post.id}
            onClick={() => onSelectPost(post)}
            className="group relative aspect-[4/5] rounded-xl md:rounded-2xl overflow-hidden bg-gray-100 dark:bg-[#141B31] border border-gray-200 dark:border-[#2C3246] cursor-pointer shadow-xs hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          >
            {/* Thumbnail Image */}
            <img
              src={post.thumbnailUrl}
              alt={post.hookText || "Instagram post"}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />

            {/* Gradient Overlay for Text Readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/35 pointer-events-none" />

            {/* Top-Left: Outlier Score Badge (The SortFeed Power Indicator) */}
            <div className="absolute top-2.5 left-2.5 z-10">
              {post.outlierTier === "super_viral" ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 sm:py-1 rounded-lg text-[10px] sm:text-xs font-black tracking-tight bg-gradient-to-r from-red-600 via-rose-600 to-orange-500 text-white shadow-md ring-1 ring-white/30 animate-pulse">
                  <Flame className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-amber-300 text-amber-300" />
                  <span>{post.outlierScore}× VIRAL</span>
                </span>
              ) : post.outlierTier === "viral" ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 sm:py-1 rounded-lg text-[10px] sm:text-xs font-black tracking-tight bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md">
                  <Flame className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-white text-white" />
                  <span>{post.outlierScore}× VIRAL</span>
                </span>
              ) : post.outlierTier === "high" ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 sm:py-1 rounded-lg text-[10px] sm:text-xs font-bold tracking-tight bg-purple-600 text-white shadow-md">
                  <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  <span>{post.outlierScore}× TOP</span>
                </span>
              ) : (
                <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded-md text-[9px] sm:text-[10px] font-semibold bg-black/55 backdrop-blur-md text-white/90 border border-white/10">
                  {post.outlierScore}×
                </span>
              )}
            </div>

            {/* Top-Right: Media Type Icon (SortFeed Style - Clean rounded icon) */}
            <div className="absolute top-2.5 right-2.5 z-10">
              {isReel ? (
                <div className="w-6 h-6 rounded-md bg-black/45 backdrop-blur-md flex items-center justify-center text-white border border-white/15 shadow-sm">
                  <Play className="w-3 h-3 fill-white text-white ml-0.5" />
                </div>
              ) : isCarousel ? (
                <div className="w-6 h-6 rounded-md bg-black/45 backdrop-blur-md flex items-center justify-center text-white border border-white/15 shadow-sm">
                  <Layers className="w-3 h-3 text-white" />
                </div>
              ) : null}
            </div>

            {/* Bottom Row: Metrics on Left, Creator Profile Circle on Right (SortFeed Image 4) */}
            <div className="absolute bottom-0 inset-x-0 p-2.5 sm:p-3 text-white z-10 flex flex-col justify-end">
              {/* Hook text preview */}
              <p className="line-clamp-2 text-[10px] sm:text-[11px] font-medium text-white/90 leading-snug mb-2 drop-shadow-xs">
                "{post.hookText}"
              </p>

              <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/15">
                {/* Bottom-Left: Metric based on active Sort Option (SortFeed Style) */}
                <div className="flex items-center gap-2 text-[11px] sm:text-xs font-bold tracking-tight">
                  {sortOption === "likes" ? (
                    <div className="flex items-center gap-1 text-white">
                      <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                      <span>{formatCompact(post.likesCount)}</span>
                    </div>
                  ) : sortOption === "views" ? (
                    <div className="flex items-center gap-1 text-orange-400">
                      <Play className="w-3.5 h-3.5 fill-orange-400" />
                      <span>{formatCompact(post.viewsCount)}</span>
                    </div>
                  ) : sortOption === "comments" ? (
                    <div className="flex items-center gap-1 text-sky-400">
                      <MessageSquare className="w-3.5 h-3.5 fill-sky-400" />
                      <span>{formatCompact(post.commentsCount)}</span>
                    </div>
                  ) : (
                    /* Default/Outlier: Show Views & Likes */
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1 text-orange-400">
                        <Play className="w-3 h-3 fill-orange-400" />
                        {formatCompact(post.viewsCount)}
                      </span>
                      <span className="flex items-center gap-1 text-white/90">
                        <Heart className="w-3 h-3 fill-rose-500 text-rose-500" />
                        {formatCompact(post.likesCount)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Bottom-Right: Creator Profile Avatar Circle (SortFeed Image 4 Signature) */}
                {profile?.profilePicUrl && (
                  <div
                    className="w-6 h-6 sm:w-7 sm:h-7 rounded-full border-1.5 border-white/90 overflow-hidden shrink-0 shadow-md bg-white/20"
                    title={`@${profile.username}`}
                  >
                    <img
                      src={profile.profilePicUrl}
                      alt={profile.username}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
