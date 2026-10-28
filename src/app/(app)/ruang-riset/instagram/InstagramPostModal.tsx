"use client";

import React, { useState, useEffect, useRef } from "react";
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
  TrendingUp,
  MessageSquare,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Volume2,
  VolumeX,
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
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const touchStartX = useRef<number | null>(null);

  const slides =
    post?.carouselMedia && post.carouselMedia.length > 0
      ? post.carouselMedia
      : post?.thumbnailUrl
      ? [post.thumbnailUrl]
      : [];

  const isCarousel =
    post?.mediaType === "CAROUSEL_ALBUM" || slides.length > 1;
  const isVideo = post?.mediaType === "VIDEO" && Boolean(post.videoUrl);

  // Reset slide index when post changes
  useEffect(() => {
    setCurrentSlideIndex(0);
  }, [post?.id]);

  // Keyboard navigation: ESC to close, Left/Right for carousel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft" && isCarousel) {
        setCurrentSlideIndex((prev) => Math.max(0, prev - 1));
      } else if (e.key === "ArrowRight" && isCarousel) {
        setCurrentSlideIndex((prev) => Math.min(slides.length - 1, prev + 1));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, isCarousel, slides.length]);

  if (!post) return null;

  const handleCopyCaption = () => {
    navigator.clipboard.writeText(post.caption);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrevSlide = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCurrentSlideIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNextSlide = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCurrentSlideIndex((prev) => Math.min(slides.length - 1, prev + 1));
  };

  // Touch swipe support for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        // Swiped left -> next
        handleNextSlide();
      } else {
        // Swiped right -> prev
        handlePrevSlide();
      }
    }
    touchStartX.current = null;
  };

  const formattedDate = new Date(post.timestamp).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={cn(
          "w-full max-w-4xl max-h-[92vh] rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row relative animate-in zoom-in-95 duration-200 border border-gray-200 dark:border-[#2C3246]",
          tokens.card.base
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Floating Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-30 p-2 rounded-full bg-black/60 hover:bg-black/85 text-white transition-colors cursor-pointer shadow-lg"
          title="Tutup"
        >
          <X className="w-5 h-5" />
        </button>

        {/* ===================================================================== */}
        {/* SISI KIRI: Visual Media Preview (Video Player Asli / Carousel Slider Asli) */}
        {/* Menggunakan Rasio Standar Instagram 3:4 Presisi Tanpa Terpotong */}
        {/* ===================================================================== */}
        <div
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="w-full md:w-1/2 bg-black flex items-center justify-center relative aspect-[3/4] md:aspect-auto md:min-h-[550px] overflow-hidden select-none shrink-0"
        >
          {/* A. REELS / VIDEO PLAYER ASLI */}
          {isVideo ? (
            <div className="relative w-full h-full flex items-center justify-center bg-black">
              <video
                ref={videoRef}
                src={post.videoUrl}
                poster={post.thumbnailUrl}
                controls
                playsInline
                autoPlay
                loop
                muted={isVideoMuted}
                className="w-full h-full object-contain bg-black"
              />

              {/* Quick Mute/Unmute toggle overlay */}
              <button
                type="button"
                onClick={() => {
                  if (videoRef.current) {
                    videoRef.current.muted = !videoRef.current.muted;
                    setIsVideoMuted(videoRef.current.muted);
                  }
                }}
                className="absolute top-4 right-14 md:right-4 z-20 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md transition-colors cursor-pointer"
                title={isVideoMuted ? "Aktifkan Suara" : "Bisukan"}
              >
                {isVideoMuted ? (
                  <VolumeX className="w-4 h-4 text-rose-400" />
                ) : (
                  <Volume2 className="w-4 h-4 text-white" />
                )}
              </button>
            </div>
          ) : (
            /* B. CAROUSEL SLIDER ASLI ATAU FOTO */
            <div className="relative w-full h-full flex items-center justify-center bg-black">
              <img
                src={slides[currentSlideIndex] || post.thumbnailUrl}
                alt={`${post.hookText} - slide ${currentSlideIndex + 1}`}
                key={slides[currentSlideIndex] || post.thumbnailUrl}
                className="w-full h-full object-contain transition-opacity duration-200"
              />

              {/* Navigation Arrows for Carousel */}
              {isCarousel && slides.length > 1 && (
                <>
                  {/* Left Arrow Button */}
                  {currentSlideIndex > 0 && (
                    <button
                      type="button"
                      onClick={handlePrevSlide}
                      className="absolute left-3 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/65 hover:bg-black/85 text-white transition-all shadow-lg hover:scale-110 cursor-pointer"
                      title="Slide Sebelumnya"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                  )}

                  {/* Right Arrow Button */}
                  {currentSlideIndex < slides.length - 1 && (
                    <button
                      type="button"
                      onClick={handleNextSlide}
                      className="absolute right-3 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/65 hover:bg-black/85 text-white transition-all shadow-lg hover:scale-110 cursor-pointer"
                      title="Slide Berikutnya"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  )}

                  {/* Slide Counter Badge di Atas Kanan (di samping tombol X pada mobile) */}
                  <div className="absolute top-4 right-14 md:right-4 z-20 px-2.5 py-1 rounded-full bg-black/70 text-white text-xs font-bold border border-white/15 shadow-sm">
                    {currentSlideIndex + 1} / {slides.length}
                  </div>

                  {/* Bottom Dot Pagination - Presisi di Tengah-tengah */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/70 max-w-[85%] overflow-x-auto border border-white/10 shadow-sm pointer-events-auto">
                    {slides.map((_, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setCurrentSlideIndex(idx)}
                        className={`rounded-full transition-all cursor-pointer ${
                          idx === currentSlideIndex
                            ? "w-4 h-1.5 bg-orange-500 shadow-sm shadow-orange-500/50"
                            : "w-1.5 h-1.5 bg-white/40 hover:bg-white/70"
                        }`}
                        title={`Slide ${idx + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Badge Outlier di Preview Kiri Atas */}
          <div className="absolute top-4 left-4 z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black bg-rose-600 text-white shadow-lg ring-1 ring-white/30">
              <Flame className="w-4 h-4 fill-amber-300 text-amber-300" />
              <span>{post.outlierScore}× Viral Outlier</span>
            </span>
          </div>
        </div>

        {/* ===================================================================== */}
        {/* SISI KANAN: Detail Analitik & Naskah */}
        {/* ===================================================================== */}
        <div className="w-full md:w-1/2 flex flex-col p-4 sm:p-6 overflow-y-auto flex-1 min-h-0 md:max-h-[92vh]">
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
              className={cn(
                "inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors",
                tokens.button.variants.secondary
              )}
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Buka IG</span>
            </a>
          </div>

          {/* Grid Metrik Detail */}
          <div className="grid grid-cols-4 gap-2 py-4 border-b border-gray-100 dark:border-[#2C3246] text-center">
            <div className="p-2 sm:p-2.5 rounded-xl bg-orange-50/60 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-500/20">
              <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-orange-600 dark:text-orange-400">
                <Play className="w-3 h-3 fill-orange-500" />
                <span>Views</span>
              </div>
              <p className="font-black text-xs sm:text-base text-gray-900 dark:text-white mt-0.5 truncate">
                {formatNumber(post.viewsCount)}
              </p>
            </div>

            <div className="p-2 sm:p-2.5 rounded-xl bg-rose-50/60 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20">
              <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                <Heart className="w-3 h-3 fill-rose-500" />
                <span>Likes</span>
              </div>
              <p className="font-black text-xs sm:text-base text-gray-900 dark:text-white mt-0.5 truncate">
                {formatNumber(post.likesCount)}
              </p>
            </div>

            <div className="p-2 sm:p-2.5 rounded-xl bg-sky-50/60 dark:bg-sky-500/10 border border-sky-100 dark:border-sky-500/20">
              <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-sky-600 dark:text-sky-400">
                <MessageSquare className="w-3 h-3 fill-sky-500 text-sky-500" />
                <span>Komen</span>
              </div>
              <p className="font-black text-xs sm:text-base text-gray-900 dark:text-white mt-0.5 truncate">
                {formatNumber(post.commentsCount)}
              </p>
            </div>

            <div className="p-2 sm:p-2.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20">
              <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                <TrendingUp className="w-3 h-3" />
                <span>ER</span>
              </div>
              <p className="font-black text-xs sm:text-base text-emerald-600 dark:text-emerald-400 mt-0.5 truncate">
                {post.engagementRate}%
              </p>
            </div>
          </div>

          {/* Outlier Performance Notice */}
          <div className="my-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 flex items-start gap-2.5">
            <Flame className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5 fill-amber-500/20" />
            <div className="text-xs leading-relaxed text-amber-900 dark:text-amber-200">
              <span className="font-bold">Analisis Viralitas:</span> Konten ini
              mendapatkan tayangan{" "}
              <span className="font-bold text-rose-600 dark:text-rose-400">
                {post.outlierScore}× lebih tinggi
              </span>{" "}
              dibanding rata-rata akun @{profile.username} (
              {formatNumber(profile.averageViews)} views). Format hook dan topik
              ini sangat direkomendasikan untuk dijadikan bahan referensi.
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

            <div
              className={cn(
                "p-3.5 text-xs sm:text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed max-h-[220px] overflow-y-auto",
                tokens.card.subtle
              )}
            >
              {post.caption}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
