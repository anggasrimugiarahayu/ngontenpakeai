"use client";

import React, { useState } from "react";
import { InstagramPostItem, InstagramTargetProfile, SortOption } from "./types";
import {
  Layers,
  Play,
  Heart,
  MessageSquare,
  Zap,
  Bookmark,
  Download,
  ArrowUpRight,
  Check,
  Film,
} from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { downloadMediaAsset } from "./exportUtils";
import toast from "react-hot-toast";

function InstagramIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

interface Props {
  posts: InstagramPostItem[];
  profile: InstagramTargetProfile;
  sortOption?: SortOption;
  onSelectPost: (post: InstagramPostItem) => void;
  isSelectMode?: boolean;
  selectedIds?: string[];
  onToggleSelect?: (id: string) => void;
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
  isSelectMode = false,
  selectedIds = [],
  onToggleSelect,
}: Props) {
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(() => {
    if (typeof window === "undefined") return new Set();
    try {
      const saved = localStorage.getItem("ruang_riset_ig_bookmarks");
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  const handleBookmark = (post: InstagramPostItem) => {
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
        localStorage.setItem("ruang_riset_ig_bookmarks", JSON.stringify(Array.from(next)));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const handleDownloadMedia = async (post: InstagramPostItem) => {
    const isVideo = post.mediaType === "VIDEO" && Boolean(post.videoUrl);
    const mediaUrl = isVideo ? post.videoUrl! : post.thumbnailUrl;
    const ext = isVideo ? "mp4" : "jpg";
    const filename = `${profile.username}-${post.shortcode || post.id}.${ext}`;

    toast.loading(isVideo ? "Mengunduh video Reels..." : "Mengunduh gambar...", {
      id: `dl-${post.id}`,
      duration: 1200,
    });

    const ok = await downloadMediaAsset(mediaUrl, filename);
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
          description="Coba ganti kata kunci pencarian atau ubah pengaturan filter."
        />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 bg-white dark:bg-[#141B31]">
      {posts.map((post) => {
        const isReel = post.mediaType === "VIDEO";
        const isCarousel = post.mediaType === "CAROUSEL_ALBUM";
        const isSelected = selectedIds.includes(post.id);
        const isBookmarked = bookmarkedIds.has(post.id);

        // Menentukan jumlah icon petir (Outlier Tier)
        const boltCount =
          post.outlierScore >= 8 ? 3 : post.outlierScore >= 4 ? 2 : post.outlierScore >= 1.8 ? 1 : 1;

        return (
          <div
            key={post.id}
            onClick={() => {
              if (isSelectMode && onToggleSelect) {
                onToggleSelect(post.id);
              } else {
                onSelectPost(post);
              }
            }}
            className={`group relative aspect-[3/4] overflow-hidden bg-white dark:bg-[#141B31] border-r border-b border-gray-200/80 dark:border-[#2C3246] cursor-pointer transition-all duration-200 ${
              isSelected ? "ring-2 ring-orange-500 ring-inset z-30" : ""
            }`}
          >
            {/* Thumbnail Image (Instan cache, tanpa lazy reload flickering) */}
            <img
              src={post.thumbnailUrl}
              alt={post.caption || "Instagram post"}
              decoding="async"
              className="w-full h-full object-cover"
            />

            {/* Gradient Overlay Normal (Non-Hover) untuk teks terbaca jelas */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none transition-opacity duration-200 group-hover:opacity-0" />

            {/* ========================================================================= */}
            {/* TAMPILAN NORMAL (NON-HOVER) */}
            {/* ========================================================================= */}

            {/* Kiri Atas: Badge Petir (⚡ / ⚡⚡ / ⚡⚡⚡) */}
            <div className="absolute top-2.5 left-2.5 z-10 transition-opacity duration-200 group-hover:opacity-0 pointer-events-none">
              <div className="flex items-center gap-0.5 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-md text-white border border-white/10 text-xs shadow-sm">
                {Array.from({ length: boltCount }).map((_, i) => (
                  <Zap key={i} className="w-3 h-3 fill-white text-white" />
                ))}
              </div>
            </div>

            {/* Kanan Atas: Media Type Icon (Layers untuk Carousel, Play untuk Reels) */}
            <div className="absolute top-2.5 right-2.5 z-10 transition-opacity duration-200 group-hover:opacity-0 pointer-events-none">
              {isReel ? (
                <div className="w-6 h-6 rounded-md bg-black/50 backdrop-blur-md flex items-center justify-center text-white border border-white/15 shadow-sm">
                  <Play className="w-3 h-3 fill-white text-white ml-0.5" />
                </div>
              ) : isCarousel ? (
                <div className="w-6 h-6 rounded-md bg-black/50 backdrop-blur-md flex items-center justify-center text-white border border-white/15 shadow-sm">
                  <Layers className="w-3.5 h-3.5 text-white" />
                </div>
              ) : null}
            </div>

            {/* Checkbox Jika Mode Select Aktif */}
            {isSelectMode && (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  if (onToggleSelect) onToggleSelect(post.id);
                }}
                className={`absolute top-2.5 right-2.5 z-30 w-6 h-6 rounded-md flex items-center justify-center border transition-all ${
                  isSelected
                    ? "bg-orange-500 border-orange-500 text-white shadow-md"
                    : "bg-black/60 border-white/40 text-transparent hover:border-white"
                }`}
              >
                <Check className="w-4 h-4 stroke-[3]" />
              </div>
            )}

            {/* Bawah Normal: Like Counter & Info Singkat */}
            <div className="absolute bottom-2.5 inset-x-2.5 z-10 flex items-center justify-between text-white text-[11px] font-semibold transition-opacity duration-200 group-hover:opacity-0 pointer-events-none drop-shadow-md">
              <div className="flex items-center gap-1">
                <Heart className="w-3 h-3 fill-white text-white" />
                <span>{formatCompact(post.likesCount)}</span>
              </div>
              <div className="text-[10px] text-white/70 font-normal">
                {post.carouselMedia && post.carouselMedia.length > 1 ? (
                  <span>1/{post.carouselMedia.length}</span>
                ) : (
                  <span>@{profile.username}</span>
                )}
              </div>
            </div>

            {/* ========================================================================= */}
            {/* TAMPILAN HOVER (SAAT KURSOR DIDEKATKAN KE KARTU) */}
            {/* ========================================================================= */}
            <div className="absolute inset-0 bg-black/65 backdrop-blur-[1.5px] p-3 sm:p-3.5 flex flex-col justify-between z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              {/* Baris Atas Hover: Badge Petir di Kiri & Tombol Pop-out (↗) di Kanan */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-0.5 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-md text-white border border-white/10 text-xs shadow-sm">
                  {Array.from({ length: boltCount }).map((_, i) => (
                    <Zap key={i} className="w-3 h-3 fill-white text-white" />
                  ))}
                </div>

                {!isSelectMode && (
                  <a
                    href={post.permalink}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="w-7 h-7 rounded-lg bg-white/15 hover:bg-white/25 active:scale-95 backdrop-blur-md flex items-center justify-center text-white transition-all cursor-pointer"
                    title="Buka Postingan Asli di Instagram"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </a>
                )}
              </div>

              {/* Bagian Tengah Hover: 3 Metrik Utama Bertumpuk Vertikal */}
              <div className="flex flex-col items-center justify-center gap-2 text-white my-auto select-none pointer-events-none">
                {/* 1. Likes */}
                <div className="flex items-center gap-1.5 text-sm sm:text-base font-bold">
                  <Heart className="w-4 h-4 fill-white text-white" />
                  <span>{formatCompact(post.likesCount)}</span>
                </div>

                {/* 2. Comments */}
                <div className="flex items-center gap-1.5 text-sm sm:text-base font-bold">
                  <MessageSquare className="w-4 h-4 fill-white text-white" />
                  <span>{formatCompact(post.commentsCount)}</span>
                </div>

                {/* 3. Outlier Score */}
                <div className="flex items-center gap-1 text-sm sm:text-base font-black text-amber-300">
                  <Zap className="w-4 h-4 fill-amber-300 text-amber-300" />
                  <span>{post.outlierScore}×</span>
                </div>
              </div>

              {/* Baris Bawah Hover: Info Akun di Kiri, Aksi Bookmark & Download di Kanan */}
              <div className="flex items-end justify-between gap-2 pt-1 border-t border-white/15">
                {/* Kiri: Icon Instagram + @username + nomor slide */}
                <div className="flex items-center gap-1.5 text-[10px] text-white/80 font-medium truncate max-w-[120px]">
                  <InstagramIcon className="w-3 h-3 text-white/70 shrink-0" />
                  <span className="truncate">@{profile.username}</span>
                  {post.carouselMedia && post.carouselMedia.length > 1 && (
                    <span className="text-white/60 shrink-0">1/{post.carouselMedia.length}</span>
                  )}
                </div>

                {/* Kanan: Tombol Bookmark & Download Media */}
                <div className="flex flex-col gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBookmark(post);
                    }}
                    className={`w-7 h-7 rounded-md backdrop-blur-md flex items-center justify-center text-white transition-all active:scale-95 cursor-pointer ${
                      isBookmarked
                        ? "bg-amber-500/80 hover:bg-amber-500 text-white shadow-sm"
                        : "bg-white/15 hover:bg-white/25 text-white"
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
                    className="w-7 h-7 rounded-md bg-white/15 hover:bg-white/25 active:scale-95 backdrop-blur-md flex items-center justify-center text-white transition-all cursor-pointer"
                    title={isReel ? "Download Video Reels (.mp4)" : "Download Gambar (.jpg)"}
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
