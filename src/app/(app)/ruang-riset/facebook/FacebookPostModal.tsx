"use client";

import React, { useState } from "react";
import { FacebookPostItem, FacebookUserProfile } from "./types";
import {
  X,
  ExternalLink,
  Flame,
  Eye,
  Copy,
  Check,
  Sparkles,
  Share2,
  Heart,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Forward,
  Newspaper,
} from "lucide-react";
import Link from "next/link";

function FacebookMiniIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

interface Props {
  post: FacebookPostItem;
  profile: FacebookUserProfile;
  onClose: () => void;
}

function formatViews(num: number): string {
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + " Juta";
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1).replace(/\.0$/, "") + " Ribu";
  }
  return num.toLocaleString("id-ID");
}

export function FacebookPostModal({ post, profile, onClose }: Props) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  const photos =
    post.photoUrls && post.photoUrls.length > 0
      ? post.photoUrls
      : [post.thumbnailUrl];

  const fullTextToCopy = post.caption || post.title;

  const handleCopyLink = async () => {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(post.permalink);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleCopyCaption = async () => {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(fullTextToCopy);
      setCopiedCaption(true);
      setTimeout(() => setCopiedCaption(false), 2000);
    }
  };

  const nextPhoto = () => {
    setActivePhotoIndex((prev) => (prev + 1) % photos.length);
  };

  const prevPhoto = () => {
    setActivePhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Dialog Box: 2 Kolom Sejajar Rapi (Media di Kiri, Detail di Kanan) */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl max-h-[92vh] bg-white dark:bg-[#141B2D] border border-gray-200 dark:border-[#232D42] rounded-3xl overflow-hidden shadow-2xl z-10 flex flex-col md:flex-row animate-in zoom-in-95 duration-200"
      >
        {/* Floating Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 z-30 p-1.5 rounded-full bg-black/60 hover:bg-black/85 text-white transition-colors cursor-pointer shadow-lg"
          title="Tutup Modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* ===================================================================== */}
        {/* SISI KIRI: Media Player / Photo Slider (Rasio Vertikal Presisi) */}
        {/* ===================================================================== */}
        <div className="w-full md:w-1/2 bg-black flex items-center justify-center relative aspect-[3/4] md:aspect-auto md:min-h-[540px] overflow-hidden select-none shrink-0">
          {post.isPhoto ? (
            <div className="relative w-full h-full flex items-center justify-center bg-black group">
              <img
                src={photos[activePhotoIndex]}
                alt={`${post.title} slide ${activePhotoIndex + 1}`}
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain"
              />

              {photos.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={prevPhoto}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/85 text-white flex items-center justify-center transition-colors cursor-pointer z-10"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={nextPhoto}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/85 text-white flex items-center justify-center transition-colors cursor-pointer z-10"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <div className="absolute bottom-3 inset-x-0 flex justify-center gap-1.5 z-10">
                    {photos.map((_, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActivePhotoIndex(idx)}
                        className={`rounded-full transition-all cursor-pointer ${
                          idx === activePhotoIndex
                            ? "bg-[#1877F2] w-4 h-1.5"
                            : "bg-white/40 hover:bg-white/70 w-1.5 h-1.5"
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="relative w-full h-full flex items-center justify-center bg-black">
              {post.videoUrl ? (
                <video
                  src={post.videoUrl}
                  poster={post.thumbnailUrl}
                  controls
                  autoPlay
                  loop
                  playsInline
                  className="w-full h-full object-contain bg-black"
                />
              ) : post.permalink ? (
                <iframe
                  src={`https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(
                    post.permalink
                  )}&show_text=false`}
                  title={post.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              ) : (
                <img
                  src={post.thumbnailUrl}
                  alt={post.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          )}

          {/* Badge Outlier di Sisi Kiri Atas Preview */}
          <div className="absolute top-3.5 left-3.5 z-20 pointer-events-none">
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold text-white shadow-md ${
                post.outlierScore >= 5.0
                  ? "bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 animate-pulse"
                  : post.outlierScore >= 2.0
                  ? "bg-gradient-to-r from-amber-500 to-rose-600"
                  : "bg-gray-800/90 text-gray-200 border border-white/10"
              }`}
            >
              <Flame className="w-3.5 h-3.5 fill-current" />
              <span>{post.outlierScore.toFixed(1)}x Outlier</span>
            </span>
          </div>
        </div>

        {/* ===================================================================== */}
        {/* SISI KANAN: Detail Metadata, Naskah Berita, Metrik & Action Buttons */}
        {/* ===================================================================== */}
        <div className="w-full md:w-1/2 flex flex-col justify-between p-5 sm:p-6 bg-white dark:bg-[#141B2D] overflow-y-auto max-h-[92vh] space-y-4">
          <div className="space-y-3.5">
            {/* Header Mini: Profil Akun & Platform Badge */}
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <span className="p-1 rounded-md bg-[#1877F2]/10 text-[#1877F2]">
                <FacebookMiniIcon className="w-3.5 h-3.5" />
              </span>
              <span className="font-semibold text-gray-900 dark:text-white">
                @{profile.username}
              </span>
              <span>•</span>
              <span className="font-medium">{post.publishedText}</span>
            </div>

            {/* Headline Bersih (Tanpa URL Panjang) */}
            <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white leading-snug break-words line-clamp-3">
              {post.title || "Konten Facebook"}
            </h2>

            {/* Hook Highlight */}
            {post.hookText && (
              <div className="p-3 bg-blue-50/50 dark:bg-[#1877F2]/10 border border-blue-100 dark:border-[#1877F2]/25 rounded-xl text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-[#1877F2] text-[11px] uppercase tracking-wide">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Hook Konten:</span>
                </div>
                <p className="text-gray-800 dark:text-gray-200 italic font-medium">
                  &ldquo;{post.hookText}&rdquo;
                </p>
              </div>
            )}

            {/* Naskah / Caption Lengkap Berita (Scrollable & Rapih) */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wide block">
                Naskah / Caption Lengkap:
              </span>
              <div className="p-3 bg-gray-50 dark:bg-[#0B0F19] border border-gray-200/80 dark:border-[#232D42] rounded-xl text-xs max-h-36 overflow-y-auto leading-relaxed text-gray-700 dark:text-gray-300 whitespace-pre-line break-words">
                {fullTextToCopy}
              </div>

              {/* Tombol Tautan Berita Sumber Eksternal jika ada (tanpa merusak judul) */}
              {post.articleUrl && (
                <div className="pt-1">
                  <a
                    href={post.articleUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1877F2] hover:underline"
                  >
                    <Newspaper className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate max-w-[280px]">
                      Baca artikel lengkap di sumber
                    </span>
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                </div>
              )}
            </div>

            {/* Grid Metrik Performa Postingan */}
            <div className="grid grid-cols-4 gap-2 p-3 bg-gray-50 dark:bg-[#0B0F19] border border-gray-200/80 dark:border-[#232D42] rounded-2xl text-center text-xs">
              <div>
                <span className="text-[10px] text-gray-400 block mb-0.5">Views</span>
                <span className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white flex items-center justify-center gap-1">
                  <Eye className="w-3 h-3 text-blue-500" />
                  {formatViews(post.viewsCount)}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 block mb-0.5">Likes</span>
                <span className="font-bold text-xs sm:text-sm text-rose-500 flex items-center justify-center gap-1">
                  <Heart className="w-3 h-3 fill-rose-500/20 text-rose-500" />
                  {formatViews(post.likesCount)}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 block mb-0.5">Comments</span>
                <span className="font-bold text-xs sm:text-sm text-sky-400 flex items-center justify-center gap-1">
                  <MessageSquare className="w-3 h-3 text-sky-400" />
                  {formatViews(post.commentsCount)}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 block mb-0.5">Shares</span>
                <span className="font-bold text-xs sm:text-sm text-emerald-500 flex items-center justify-center gap-1">
                  <Forward className="w-3 h-3 text-emerald-500" />
                  {formatViews(post.sharesCount || 0)}
                </span>
              </div>
            </div>
          </div>

          {/* Bagian Bawah: Integrasi ATM Content Builder & Aksi Salin */}
          <div className="pt-2 border-t border-gray-100 dark:border-[#232D42] space-y-2.5">
            <Link
              href={`/ruang-ngonten/atm-builder?refTitle=${encodeURIComponent(post.title)}`}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#1877F2] to-blue-600 hover:opacity-95 text-white font-bold text-xs flex items-center justify-center gap-2 transition-opacity shadow-sm cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Bawa ke ATM Content Builder</span>
            </Link>

            <div className="flex items-center gap-2 text-xs">
              <button
                type="button"
                onClick={handleCopyCaption}
                className="flex-1 py-2 px-3 rounded-xl bg-gray-100 dark:bg-[#1E263B] hover:bg-gray-200 dark:hover:bg-[#25304B] text-gray-800 dark:text-gray-200 font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedCaption ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>{copiedCaption ? "Naskah Tersalin!" : "Salin Naskah"}</span>
              </button>

              <button
                type="button"
                onClick={handleCopyLink}
                className="py-2 px-3 rounded-xl bg-gray-100 dark:bg-[#1E263B] hover:bg-gray-200 dark:hover:bg-[#25304B] text-gray-800 dark:text-gray-200 font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                title="Salin Link Postingan"
              >
                {copiedLink ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Share2 className="w-3.5 h-3.5" />
                )}
                <span>{copiedLink ? "Tersalin!" : "Link"}</span>
              </button>

              <a
                href={post.permalink}
                target="_blank"
                rel="noreferrer"
                className="py-2 px-3 rounded-xl border border-gray-200 dark:border-[#2C3246] hover:bg-gray-50 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300 font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                title="Buka Postingan Asli di Facebook"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Facebook</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
