"use client";

import React, { useState } from "react";
import { FacebookPostItem, FacebookUserProfile, FacebookSortOption } from "./types";
import {
  Play,
  Heart,
  MessageSquare,
  Zap,
  Bookmark,
  Download,
  ArrowUpRight,
  Eye,
  Forward,
  Check,
  Image as ImageIcon,
  Film,
} from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { downloadMediaAsset } from "./exportUtils";
import { useFlipGridAnimation } from "@/hooks/useFlipGridAnimation";
import toast from "react-hot-toast";

function FacebookMiniIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

interface Props {
  posts: FacebookPostItem[];
  profile?: FacebookUserProfile | null;
  sortOption?: FacebookSortOption;
  onSelectPost: (post: FacebookPostItem) => void;
  isSelectMode?: boolean;
  selectedPostIds?: Set<string>;
  onToggleSelectPost?: (postId: string) => void;
}

function formatCompact(num: number): string {
  if (!num) return "0";
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (num >= 1_000) return (num / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return num.toString();
}

export function FacebookFeedGrid({
  posts,
  profile,
  sortOption = "likes",
  onSelectPost,
  isSelectMode = false,
  selectedPostIds = new Set(),
  onToggleSelectPost,
}: Props) {
  const { registerCard } = useFlipGridAnimation(posts);

  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(() => {
    if (typeof window === "undefined") return new Set();
    try {
      const saved = localStorage.getItem("ruang_riset_facebook_bookmarks");
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  const handleBookmark = (post: FacebookPostItem) => {
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (next.has(post.id)) {
        next.delete(post.id);
        toast.success("Dihapus dari bookmark");
      } else {
        next.add(post.id);
        toast.success("Disimpan ke bookmark!");
      }
      try {
        localStorage.setItem("ruang_riset_facebook_bookmarks", JSON.stringify(Array.from(next)));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const handleDownloadMedia = async (post: FacebookPostItem) => {
    const username = profile?.username || "facebook_creator";
    const filename = `${username}-${post.id}.jpg`;

    toast.loading("Mengunduh media postingan...", {
      id: `dl-${post.id}`,
      duration: 1200,
    });

    const ok = await downloadMediaAsset(post.thumbnailUrl, filename);
    if (ok) {
      toast.success("Media berhasil diunduh!", { id: `dl-${post.id}` });
    } else {
      toast.error("Gagal mengunduh media", { id: `dl-${post.id}` });
    }
  };

  if (!posts || posts.length === 0) {
    return (
      <div className="p-8 sm:p-12">
        <EmptyState
          icon={<Film className="w-6 h-6" />}
          title="Tidak ada konten yang cocok"
          description="Coba ganti tab Reels & Video / Foto atau ubah pengaturan filter."
        />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 bg-white dark:bg-[#141B31]">
      {posts.map((post) => {
        const isBookmarked = bookmarkedIds.has(post.id);
        const isSelected = selectedPostIds.has(post.id);
        const permalink =
          post.permalink ||
          `https://www.facebook.com/${profile?.username || ""}`;

        return (
          <div
            key={post.id}
            ref={registerCard(post.id)}
            onClick={() => {
              if (isSelectMode) {
                onToggleSelectPost?.(post.id);
              } else {
                onSelectPost(post);
              }
            }}
            className={`group relative aspect-[3/4] overflow-hidden bg-gray-100 dark:bg-[#121727] border-r border-b border-gray-200/80 dark:border-[#2C3246] cursor-pointer transition-colors duration-150 rounded-none ${
              isSelected ? "ring-3 ring-orange-500 ring-inset" : ""
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
                  <Check
                    className={`w-3.5 h-3.5 ${isSelected ? "opacity-100 text-white" : "opacity-0"}`}
                    strokeWidth={3}
                  />
                </div>
              </div>
            )}

            {/* Thumbnail Image Penuh */}
            <img
              src={post.thumbnailUrl}
              alt={post.title || "Facebook post"}
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
                  post.outlierScore >= 4 ? "text-amber-300" : "text-white"
                }`}
              >
                <Zap
                  className={`w-3 h-3 ${
                    post.outlierScore >= 4
                      ? "fill-amber-300 text-amber-300"
                      : "fill-white text-white"
                  }`}
                />
                <span>{post.outlierScore.toFixed(1)}×</span>
              </div>
            </div>

            {/* Kanan Atas: Media Type Icon (Foto atau Video Play) */}
            <div className="absolute top-2.5 right-2.5 z-10 transition-opacity duration-150 group-hover:opacity-0 pointer-events-none">
              {post.isPhoto ? (
                <div className="w-6 h-6 rounded-md bg-black/60 flex items-center justify-center text-white border border-white/15 shadow-sm">
                  <ImageIcon className="w-3.5 h-3.5 text-white" />
                </div>
              ) : (
                <div className="w-6 h-6 rounded-md bg-black/60 flex items-center justify-center text-white border border-white/15 shadow-sm">
                  <Play className="w-3 h-3 fill-white text-white ml-0.5" />
                </div>
              )}
            </div>

            {/* Bawah Normal: Like Counter & Info Durasi */}
            <div className="absolute bottom-2.5 inset-x-2.5 z-10 flex items-center justify-between text-white text-[11px] font-semibold transition-opacity duration-150 group-hover:opacity-0 pointer-events-none drop-shadow-md">
              <div className="flex items-center gap-1">
                <Heart className="w-3 h-3 fill-white text-white" />
                <span>{formatCompact(post.likesCount)}</span>
              </div>
              {post.duration ? (
                <div className="text-[10px] text-white/80 font-medium px-1.5 py-0.5 rounded bg-black/60 border border-white/10">
                  {post.duration}
                </div>
              ) : post.viewsCount > 0 ? (
                <div className="flex items-center gap-1 text-[10px] text-white/85 font-medium">
                  <Eye className="w-3 h-3 text-white/80" />
                  <span>{formatCompact(post.viewsCount)}</span>
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
                    post.outlierScore >= 4 ? "text-amber-300" : "text-white"
                  }`}
                >
                  <Zap
                    className={`w-3 h-3 ${
                      post.outlierScore >= 4
                        ? "fill-amber-300 text-amber-300"
                        : "fill-white text-white"
                    }`}
                  />
                  <span>{post.outlierScore.toFixed(1)}×</span>
                </div>

                <a
                  href={permalink}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="w-7 h-7 rounded-lg bg-white/20 hover:bg-white/30 active:scale-95 flex items-center justify-center text-white transition-colors cursor-pointer"
                  title="Buka Postingan Asli di Facebook"
                >
                  <ArrowUpRight className="w-4 h-4" />
                </a>
              </div>

              {/* Bagian Tengah Hover: Metrik Facebook (Views, Likes, Comments, Shares, Outlier) */}
              <div className="flex flex-col items-center justify-center gap-1.5 text-white my-auto select-none pointer-events-none">
                {/* 1. Views */}
                <div
                  className={`flex items-center gap-1.5 text-xs sm:text-sm font-bold ${
                    sortOption === "views" ? "text-emerald-400 font-extrabold" : "text-white"
                  }`}
                >
                  <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                  <span>{formatCompact(post.viewsCount)}</span>
                </div>

                {/* 2. Likes */}
                <div
                  className={`flex items-center gap-1.5 text-xs sm:text-sm font-bold ${
                    sortOption === "likes" ? "text-emerald-400 font-extrabold" : "text-white"
                  }`}
                >
                  <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-white text-white" />
                  <span>{formatCompact(post.likesCount)}</span>
                </div>

                {/* 3. Comments */}
                <div
                  className={`flex items-center gap-1.5 text-xs sm:text-sm font-bold ${
                    sortOption === "comments" ? "text-emerald-400 font-extrabold" : "text-white"
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-white text-white" />
                  <span>{formatCompact(post.commentsCount)}</span>
                </div>

                {/* 4. Shares */}
                <div
                  className={`flex items-center gap-1.5 text-xs sm:text-sm font-bold ${
                    sortOption === "shares" ? "text-emerald-400 font-extrabold" : "text-white"
                  }`}
                >
                  <Forward className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                  <span>{formatCompact(post.sharesCount || 0)}</span>
                </div>

                {/* 5. Outlier Score */}
                <div
                  className={`flex items-center gap-1 text-xs sm:text-sm font-black ${
                    sortOption === "outlier" ? "text-amber-400" : "text-amber-300"
                  }`}
                >
                  <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-amber-300 text-amber-300" />
                  <span>{post.outlierScore.toFixed(1)}×</span>
                </div>
              </div>

              {/* Baris Bawah Hover: Info Akun di Kiri, Aksi Bookmark & Download di Kanan */}
              <div className="flex items-end justify-between gap-2 pt-1 border-t border-white/15">
                <div className="flex items-center gap-1.5 text-[10px] text-white/80 font-medium truncate max-w-[120px]">
                  <FacebookMiniIcon className="w-3 h-3 text-white/70 shrink-0" />
                  <span className="truncate">@{profile?.username || "page"}</span>
                </div>

                <div className="flex flex-col gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBookmark(post);
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
                      handleDownloadMedia(post);
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
