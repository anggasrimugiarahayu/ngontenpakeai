"use client";

import React from "react";
import { YouTubeVideoItem } from "./types";
import { Play, Flame, Clock, Eye, Sparkles, Check } from "lucide-react";

interface Props {
  videos: YouTubeVideoItem[];
  onSelectVideo: (video: YouTubeVideoItem) => void;
  isSelectMode?: boolean;
  selectedVideoIds?: Set<string>;
  onToggleSelectVideo?: (videoId: string) => void;
}

function formatViews(num: number): string {
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + " Jt";
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1).replace(/\.0$/, "") + " Rb";
  }
  return num.toLocaleString("id-ID");
}

export function YouTubeFeedGrid({
  videos,
  onSelectVideo,
  isSelectMode = false,
  selectedVideoIds = new Set(),
  onToggleSelectVideo,
}: Props) {
  if (videos.length === 0) {
    return (
      <div className="w-full text-center py-16 px-4">
        <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-gray-100 dark:bg-[#1E293B] text-gray-400 flex items-center justify-center">
          <Play className="w-6 h-6" />
        </div>
        <h3 className="font-bold text-gray-900 dark:text-white text-base mb-1">
          Tidak ada video yang cocok
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
          Coba ganti kata kunci pencarian atau ubah filter format video.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 p-4 sm:p-5">
      {videos.map((video) => {
        const isViralOutlier = video.outlierScore >= 2.0;
        const isSuperViral = video.outlierScore >= 5.0;
        const isSelected = selectedVideoIds.has(video.id);

        return (
          <div
            key={video.id}
            onClick={() => {
              if (isSelectMode) {
                onToggleSelectVideo?.(video.id);
              } else {
                onSelectVideo(video);
              }
            }}
            className={`group relative flex flex-col bg-white dark:bg-[#141B31] border border-gray-200 dark:border-[#2C3246] rounded-2xl overflow-hidden hover:border-orange-500/50 hover:shadow-lg transition-all duration-200 cursor-pointer ${
              isSelected ? "ring-3 ring-orange-500" : ""
            }`}
          >
            {/* Select Checkbox (Saat Mode Select Aktif) */}
            {isSelectMode && (
              <div className="absolute top-2.5 right-2.5 z-30">
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all shadow-md ${
                    isSelected
                      ? "bg-orange-500 text-white ring-2 ring-white"
                      : "bg-black/60 text-transparent border border-white/40 backdrop-blur-xs hover:border-white"
                  }`}
                >
                  <Check className={`w-3.5 h-3.5 ${isSelected ? "opacity-100 text-white" : "opacity-0"}`} strokeWidth={3} />
                </div>
              </div>
            )}

            {/* Thumbnail Area */}
            <div className={`relative w-full overflow-hidden bg-gray-950 ${video.isShorts ? "aspect-[9/14]" : "aspect-[16/9]"}`}>
              <img
                src={video.thumbnailUrl}
                alt={video.title}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />

              {/* Gradient Overlay saat Hover (hanya saat tidak dalam select mode) */}
              {!isSelectMode && (
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="w-11 h-11 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  </div>
                </div>
              )}

              {/* Badges Top: Outlier Score & Shorts */}
              <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
                {isViralOutlier ? (
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold text-white shadow-md ${
                      isSuperViral
                        ? "bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 animate-pulse"
                        : "bg-gradient-to-r from-amber-500 to-rose-600"
                    }`}
                  >
                    <Flame className="w-3 h-3 fill-current" />
                    <span>{video.outlierScore.toFixed(1)}x Outlier</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-black/60 backdrop-blur-xs text-gray-300">
                    <span>{video.outlierScore.toFixed(1)}x</span>
                  </span>
                )}

                {video.isShorts && !isSelectMode && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-red-600 text-white shadow-sm">
                    SHORTS
                  </span>
                )}
              </div>

              {/* Duration Bottom Right */}
              {video.duration && !video.isShorts && (
                <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded-md bg-black/80 backdrop-blur-xs text-[10px] font-bold text-white tracking-wide">
                  {video.duration}
                </div>
              )}
            </div>

            {/* Video Meta Info */}
            <div className="p-3.5 sm:p-4 flex flex-col flex-1 justify-between gap-2.5">
              <h4 className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white line-clamp-2 leading-snug group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                {video.title}
              </h4>

              <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400 pt-1 border-t border-gray-100 dark:border-[#2C3246]/60">
                <span className="flex items-center gap-1 font-semibold text-gray-700 dark:text-gray-300">
                  <Eye className="w-3.5 h-3.5 text-blue-500" />
                  <span>{formatViews(video.viewsCount)} views</span>
                </span>

                <span className="text-[11px] text-gray-400">
                  {video.publishedText}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
