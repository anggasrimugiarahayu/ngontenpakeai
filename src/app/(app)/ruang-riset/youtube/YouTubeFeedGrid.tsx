"use client";

import React, { useState } from "react";
import { YouTubeVideoItem, YouTubeChannelProfile, YouTubeSortOption } from "./types";
import {
  Play,
  Heart,
  MessageSquare,
  Zap,
  Bookmark,
  Download,
  ArrowUpRight,
  Eye,
  Check,
  Film,
} from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { downloadMediaAsset } from "./exportUtils";
import { useFlipGridAnimation } from "@/hooks/useFlipGridAnimation";
import toast from "react-hot-toast";

function YouTubeIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

interface Props {
  videos: YouTubeVideoItem[];
  profile?: YouTubeChannelProfile | null;
  sortOption?: YouTubeSortOption;
  onSelectVideo: (video: YouTubeVideoItem) => void;
  isSelectMode?: boolean;
  selectedVideoIds?: Set<string>;
  onToggleSelectVideo?: (videoId: string) => void;
}

function formatCompact(num: number): string {
  if (!num) return "0";
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (num >= 1_000) return (num / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return num.toString();
}

export function YouTubeFeedGrid({
  videos,
  profile,
  sortOption = "outlier",
  onSelectVideo,
  isSelectMode = false,
  selectedVideoIds = new Set(),
  onToggleSelectVideo,
}: Props) {
  const { registerCard } = useFlipGridAnimation(videos);

  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(() => {
    if (typeof window === "undefined") return new Set();
    try {
      const saved = localStorage.getItem("ruang_riset_youtube_bookmarks");
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  const handleBookmark = (video: YouTubeVideoItem) => {
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (next.has(video.id)) {
        next.delete(video.id);
        toast.success("Dihapus dari bookmark");
      } else {
        next.add(video.id);
        toast.success("Disimpan ke bookmark!");
      }
      try {
        localStorage.setItem("ruang_riset_youtube_bookmarks", JSON.stringify(Array.from(next)));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const handleDownloadMedia = async (video: YouTubeVideoItem) => {
    const channelName = (profile?.customUrl || profile?.title || "youtube_creator").replace(/[@\s]/g, "");
    const filename = `${channelName}-${video.id}.jpg`;

    toast.loading("Mengunduh thumbnail video...", {
      id: `dl-${video.id}`,
      duration: 1200,
    });

    const ok = await downloadMediaAsset(video.thumbnailUrl, filename);
    if (ok) {
      toast.success("Thumbnail berhasil diunduh!", { id: `dl-${video.id}` });
    } else {
      toast.error("Gagal mengunduh thumbnail", { id: `dl-${video.id}` });
    }
  };

  if (!videos || videos.length === 0) {
    return (
      <div className="p-8 sm:p-12">
        <EmptyState
          icon={<Film className="w-6 h-6" />}
          title="Tidak ada konten yang cocok"
          description="Coba ganti kata kunci pencarian atau ubah pengaturan filter."
        />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 bg-white dark:bg-[#141B31]">
      {videos.map((video) => {
        const isBookmarked = bookmarkedIds.has(video.id);
        const isSelected = selectedVideoIds.has(video.id);
        const permalink =
          video.permalink ||
          (video.isShorts
            ? `https://www.youtube.com/shorts/${video.id}`
            : `https://www.youtube.com/watch?v=${video.id}`);

        return (
          <div
            key={video.id}
            ref={registerCard(video.id)}
            onClick={() => {
              if (isSelectMode) {
                onToggleSelectVideo?.(video.id);
              } else {
                onSelectVideo(video);
              }
            }}
            className={`group relative overflow-hidden bg-gray-100 dark:bg-[#121727] border-r border-b border-gray-200/80 dark:border-[#2C3246] cursor-pointer transition-colors duration-150 rounded-none ${
              video.isShorts ? "aspect-[3/4]" : "aspect-[16/9]"
            } ${isSelected ? "ring-3 ring-orange-500 ring-inset" : ""}`}
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
                  <Check
                    className={`w-3.5 h-3.5 ${isSelected ? "opacity-100 text-white" : "opacity-0"}`}
                    strokeWidth={3}
                  />
                </div>
              </div>
            )}

            {/* Thumbnail Image Penuh */}
            <img
              src={video.thumbnailUrl}
              alt={video.title || "YouTube video"}
              loading="eager"
              decoding="async"
              fetchPriority="high"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover select-none pointer-events-none"
            />

            {/* Gradient Overlay Normal (Non-Hover) untuk teks terbaca jelas */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none transition-opacity duration-150 group-hover:opacity-0" />

            {/* ========================================================================= */}
            {/* TAMPILAN NORMAL (NON-HOVER) */}
            {/* ========================================================================= */}

            {/* Kiri Atas: Badge Outlier Score (⚡ 1.3×) */}
            <div className="absolute top-2.5 left-2.5 z-10 transition-opacity duration-150 group-hover:opacity-0 pointer-events-none">
              <div
                className={`flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/75 border border-white/10 text-[11px] font-bold shadow-sm ${
                  video.outlierScore >= 4 ? "text-amber-300" : "text-white"
                }`}
              >
                <Zap
                  className={`w-3 h-3 ${
                    video.outlierScore >= 4
                      ? "fill-amber-300 text-amber-300"
                      : "fill-white text-white"
                  }`}
                />
                <span>{video.outlierScore.toFixed(1)}×</span>
              </div>
            </div>

            {/* Kanan Atas: Media Type / Badge SHORTS */}
            <div className="absolute top-2.5 right-2.5 z-10 transition-opacity duration-150 group-hover:opacity-0 pointer-events-none">
              {video.isShorts ? (
                <div className="px-1.5 py-0.5 rounded bg-red-600 text-white font-bold text-[9px] tracking-wider shadow-sm">
                  SHORTS
                </div>
              ) : (
                <div className="w-6 h-6 rounded-md bg-black/60 flex items-center justify-center text-white border border-white/15 shadow-sm">
                  <Play className="w-3 h-3 fill-white text-white ml-0.5" />
                </div>
              )}
            </div>

            {/* Bawah Normal: Like Counter & Durasi / Tanggal */}
            <div className="absolute bottom-2.5 inset-x-2.5 z-10 flex items-center justify-between text-white text-[11px] font-semibold transition-opacity duration-150 group-hover:opacity-0 pointer-events-none drop-shadow-md">
              <div className="flex items-center gap-1">
                <Heart className="w-3 h-3 fill-white text-white" />
                <span>{formatCompact(video.likesCount)}</span>
              </div>
              {video.duration ? (
                <div className="text-[10px] text-white/80 font-medium px-1.5 py-0.5 rounded bg-black/60 border border-white/10">
                  {video.duration}
                </div>
              ) : null}
            </div>

            {/* ========================================================================= */}
            {/* TAMPILAN HOVER (SAAT KURSOR DIDEKATKAN KE KARTU) */}
            {/* ========================================================================= */}
            <div className="absolute inset-0 bg-black/75 p-3 sm:p-3.5 flex flex-col justify-between z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none group-hover:pointer-events-auto">
              {/* Baris Atas Hover: Badge Petir di Kiri & Tombol Pop-out (↗) di Kanan */}
              <div className="flex items-center justify-between">
                <div
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/70 border border-white/10 text-[11px] font-bold shadow-sm ${
                    video.outlierScore >= 4 ? "text-amber-300" : "text-white"
                  }`}
                >
                  <Zap
                    className={`w-3 h-3 ${
                      video.outlierScore >= 4
                        ? "fill-amber-300 text-amber-300"
                        : "fill-white text-white"
                    }`}
                  />
                  <span>{video.outlierScore.toFixed(1)}×</span>
                </div>

                <a
                  href={permalink}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="w-7 h-7 rounded-lg bg-white/20 hover:bg-white/30 active:scale-95 flex items-center justify-center text-white transition-colors cursor-pointer"
                  title="Buka Video di YouTube"
                >
                  <ArrowUpRight className="w-4 h-4" />
                </a>
              </div>

              {/* Bagian Tengah Hover: Metrik YouTube (Views, Likes, Comments, Outlier) */}
              <div className="flex flex-col items-center justify-center gap-2 text-white my-auto select-none pointer-events-none">
                {/* 1. Views */}
                <div
                  className={`flex items-center gap-1.5 text-xs sm:text-sm font-bold ${
                    sortOption === "views" ? "text-emerald-400 font-extrabold" : "text-white"
                  }`}
                >
                  <Eye className="w-4 h-4 text-white" />
                  <span>{formatCompact(video.viewsCount)}</span>
                </div>

                {/* 2. Likes */}
                <div
                  className={`flex items-center gap-1.5 text-xs sm:text-sm font-bold ${
                    sortOption === "likes" ? "text-emerald-400 font-extrabold" : "text-white"
                  }`}
                >
                  <Heart className="w-4 h-4 fill-white text-white" />
                  <span>{formatCompact(video.likesCount)}</span>
                </div>

                {/* 3. Comments */}
                <div
                  className={`flex items-center gap-1.5 text-xs sm:text-sm font-bold ${
                    sortOption === "comments" ? "text-emerald-400 font-extrabold" : "text-white"
                  }`}
                >
                  <MessageSquare className="w-4 h-4 fill-white text-white" />
                  <span>{formatCompact(video.commentsCount)}</span>
                </div>

                {/* 4. Outlier Score */}
                <div
                  className={`flex items-center gap-1 text-xs sm:text-sm font-black ${
                    sortOption === "outlier" ? "text-amber-400" : "text-amber-300"
                  }`}
                >
                  <Zap className="w-4 h-4 fill-amber-300 text-amber-300" />
                  <span>{video.outlierScore.toFixed(1)}×</span>
                </div>
              </div>

              {/* Baris Bawah Hover: Info Akun di Kiri, Aksi Bookmark & Download di Kanan */}
              <div className="flex items-end justify-between gap-2 pt-1 border-t border-white/15">
                {/* Kiri: Icon YouTube + @channelTitle */}
                <div className="flex items-center gap-1.5 text-[10px] text-white/80 font-medium truncate max-w-[130px]">
                  <YouTubeIcon className="w-3.5 h-3.5 text-red-500 shrink-0" />
                  <span className="truncate">
                    {profile?.customUrl ? profile.customUrl : profile?.title || "channel"}
                  </span>
                </div>

                {/* Kanan: Tombol Bookmark & Download Media */}
                <div className="flex flex-col gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBookmark(video);
                    }}
                    className={`w-7 h-7 rounded-md flex items-center justify-center text-white transition-colors active:scale-95 cursor-pointer ${
                      isBookmarked
                        ? "bg-amber-500 hover:bg-amber-600 text-white shadow-sm"
                        : "bg-white/20 hover:bg-white/30 text-white"
                    }`}
                    title={isBookmarked ? "Hapus dari Bookmark" : "Simpan ke Bookmark"}
                  >
                    <Bookmark
                      className={`w-3.5 h-3.5 ${isBookmarked ? "fill-white" : ""}`}
                    />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownloadMedia(video);
                    }}
                    className="w-7 h-7 rounded-md bg-white/20 hover:bg-white/30 active:scale-95 flex items-center justify-center text-white transition-colors cursor-pointer"
                    title="Download Thumbnail / Media"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
