"use client";

import React, { useState } from "react";
import { TikTokPostItem, TikTokUserProfile } from "./types";
import {
  X,
  ExternalLink,
  Flame,
  Eye,
  Clock,
  Copy,
  Check,
  Sparkles,
  Share2,
  Heart,
  MessageSquare,
  Bookmark,
  Music,
  Layers,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

interface Props {
  video: TikTokPostItem;
  profile: TikTokUserProfile;
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

export function TikTokVideoModal({ video, profile, onClose }: Props) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedTitle, setCopiedTitle] = useState(false);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  const photos = video.photoUrls && video.photoUrls.length > 0
    ? video.photoUrls
    : [video.thumbnailUrl];

  const handleCopyLink = async () => {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(video.permalink);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleCopyTitle = async () => {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(video.title);
      setCopiedTitle(true);
      setTimeout(() => setCopiedTitle(false), 2000);
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
      {/* Backdrop click */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Dialog Box */}
      <div className="relative w-full max-w-3xl bg-white dark:bg-[#141B2D] border border-gray-200 dark:border-[#232D42] rounded-3xl overflow-hidden shadow-2xl z-10 flex flex-col max-h-[92vh]">
        {/* Header Modal */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 dark:border-[#232D42]/80 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff004f] animate-pulse" />
            <h3 className="font-bold text-sm text-gray-900 dark:text-white truncate">
              Detail Riset: {video.isPhoto ? "TikTok Photo Slide" : "TikTok Video"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-[#0B0F19] text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Media Player Area */}
          <div className="w-full flex justify-center bg-gray-950 rounded-2xl overflow-hidden p-2">
            {video.isPhoto ? (
              <div className="relative w-full max-w-xs aspect-[9/14] flex items-center justify-center bg-black rounded-xl overflow-hidden group">
                <img
                  src={photos[activePhotoIndex]}
                  alt={`${video.title} slide ${activePhotoIndex + 1}`}
                  className="w-full h-full object-contain"
                />

                {photos.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={prevPhoto}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={nextPhoto}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                    <div className="absolute bottom-2.5 inset-x-0 flex justify-center gap-1.5">
                      {photos.map((_, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setActivePhotoIndex(idx)}
                          className={`w-2 h-2 rounded-full transition-all ${
                            idx === activePhotoIndex
                              ? "bg-white w-4"
                              : "bg-white/40 hover:bg-white/70"
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="w-full max-w-xs aspect-[9/14] rounded-xl overflow-hidden bg-black relative">
                {video.id ? (
                  <iframe
                    src={`https://www.tiktok.com/embed/v2/${video.id}`}
                    title={video.title}
                    allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full border-0"
                  />
                ) : (
                  <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            )}
          </div>

          {/* Video Title & Outlier Badge */}
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white leading-snug flex-1">
                {video.title || "TikTok Post"}
              </h2>

              <span
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold text-white shrink-0 ${
                  video.outlierScore >= 5.0
                    ? "bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 shadow-md animate-pulse"
                    : video.outlierScore >= 2.0
                    ? "bg-gradient-to-r from-amber-500 to-rose-600 shadow-sm"
                    : "bg-gray-700 text-gray-200"
                }`}
              >
                <Flame className="w-3.5 h-3.5 fill-current" />
                <span>{video.outlierScore.toFixed(1)}x Outlier</span>
              </span>
            </div>

            {/* Hook text & Music info if present */}
            {(video.hookText || video.musicTitle) && (
              <div className="space-y-2 p-3 bg-gray-50 dark:bg-[#0B0F19] border border-gray-100 dark:border-[#232D42] rounded-xl text-xs">
                {video.hookText && (
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-rose-500 shrink-0">Hook:</span>
                    <span className="text-gray-700 dark:text-gray-300 italic">"{video.hookText}"</span>
                  </div>
                )}
                {video.musicTitle && (
                  <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                    <Music className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    <span>{video.musicTitle} {video.musicAuthor ? `— ${video.musicAuthor}` : ""}</span>
                  </div>
                )}
              </div>
            )}

            {/* Metrics Row */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 p-3.5 bg-gray-50 dark:bg-[#0B0F19] border border-gray-200 dark:border-[#232D42] rounded-2xl text-center text-xs">
              <div>
                <span className="text-[11px] text-gray-400 block mb-0.5">Views Total</span>
                <span className="font-bold text-sm text-gray-900 dark:text-white flex items-center justify-center gap-1">
                  <Eye className="w-3.5 h-3.5 text-blue-500" />
                  {formatViews(video.viewsCount)}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-gray-400 block mb-0.5">Likes</span>
                <span className="font-bold text-sm text-rose-500 flex items-center justify-center gap-1">
                  <Heart className="w-3.5 h-3.5 fill-rose-500/20 text-rose-500" />
                  {formatViews(video.likesCount)}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-gray-400 block mb-0.5">Comments</span>
                <span className="font-bold text-sm text-sky-400 flex items-center justify-center gap-1">
                  <MessageSquare className="w-3.5 h-3.5 text-sky-400" />
                  {formatViews(video.commentsCount)}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-gray-400 block mb-0.5">Shares</span>
                <span className="font-bold text-sm text-emerald-500 flex items-center justify-center gap-1">
                  <Share2 className="w-3.5 h-3.5 text-emerald-500" />
                  {formatViews(video.sharesCount || 0)}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-gray-400 block mb-0.5">Saves</span>
                <span className="font-bold text-sm text-purple-500 flex items-center justify-center gap-1">
                  <Bookmark className="w-3.5 h-3.5 text-purple-500" />
                  {formatViews(video.savesCount || 0)}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-gray-400 block mb-0.5">Waktu Rilis</span>
                <span className="font-bold text-sm text-gray-900 dark:text-white">
                  {video.publishedText}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions (ATM Builder integration & Copy) */}
          <div className="p-4 bg-rose-500/5 border border-rose-500/20 rounded-2xl space-y-3">
            <h4 className="text-xs font-bold text-rose-700 dark:text-rose-400 flex items-center gap-1.5 uppercase tracking-wide">
              <Sparkles className="w-4 h-4" />
              <span>Gunakan Konten Ini Sebagai Referensi Ide:</span>
            </h4>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <Link
                href={`/ruang-ngonten/atm-builder?refTitle=${encodeURIComponent(video.title)}`}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#ff004f] to-rose-600 hover:opacity-90 text-white font-semibold flex items-center gap-1.5 transition-opacity shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Bawa ke ATM Content Builder</span>
              </Link>
              <button
                type="button"
                onClick={handleCopyTitle}
                className="px-3.5 py-2 rounded-xl bg-white dark:bg-[#141B2D] border border-gray-200 dark:border-[#232D42] text-gray-800 dark:text-gray-200 font-semibold hover:bg-gray-50 dark:hover:bg-[#0B0F19] flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedTitle ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedTitle ? "Judul Tersalin!" : "Salin Judul"}</span>
              </button>
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-3.5 py-2 rounded-xl bg-white dark:bg-[#141B2D] border border-gray-200 dark:border-[#232D42] text-gray-800 dark:text-gray-200 font-semibold hover:bg-gray-50 dark:hover:bg-[#0B0F19] flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
                <span>{copiedLink ? "Link Tersalin!" : "Salin Link"}</span>
              </button>
              <a
                href={video.permalink}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2 rounded-xl bg-white dark:bg-[#141B2D] border border-gray-200 dark:border-[#232D42] text-gray-800 dark:text-gray-200 font-semibold hover:bg-gray-50 dark:hover:bg-[#0B0F19] flex items-center gap-1.5 transition-colors ml-auto cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Buka di TikTok</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
