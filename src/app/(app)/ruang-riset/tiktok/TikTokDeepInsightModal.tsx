"use client";

import React, { useMemo } from "react";
import {
  TikTokUserProfile,
  TikTokPostItem,
} from "./types";
import {
  X,
  Eye,
  Flame,
  Heart,
  TrendingUp,
  MessageSquare,
  Clock,
  Calendar,
  Video,
  Layers,
  Award,
  ArrowUpRight,
  BarChart3,
  Forward,
  Bookmark,
  Share2,
} from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  profile: TikTokUserProfile;
  videos: TikTokPostItem[];
  onSelectVideo?: (video: TikTokPostItem) => void;
  onApplySortEr?: () => void;
}

function formatNumber(num: number): string {
  if (!num || isNaN(num)) return "0";
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + " Jt";
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1).replace(/\.0$/, "") + " Rb";
  }
  return num.toLocaleString("id-ID");
}

export function TikTokDeepInsightModal({
  isOpen,
  onClose,
  profile,
  videos,
  onSelectVideo,
  onApplySortEr,
}: Props) {
  if (!isOpen) return null;

  const analytics = useMemo(() => {
    const rawList = videos || [];
    const totalVideos = rawList.length;
    const followerDenominator = Math.max(1, profile.followerCount || profile.averageViews);

    // Standar Baku Industri: ER dihitung terhadap Followers ((Likes + Comments + Shares + Saves) / Followers * 100%)
    const list = rawList.map((v) => {
      const interactions = v.likesCount + v.commentsCount + (v.sharesCount || 0) + (v.savesCount || 0);
      const calculatedEr = Number(((interactions / followerDenominator) * 100).toFixed(2));
      return {
        ...v,
        engagementRate: calculatedEr,
      };
    });

    // 1. Agregasi Metrik Utama
    const totalViews = list.reduce((sum, v) => sum + (v.viewsCount || 0), 0);
    const totalLikes = list.reduce((sum, v) => sum + (v.likesCount || 0), 0);
    const totalComments = list.reduce((sum, v) => sum + (v.commentsCount || 0), 0);
    const totalShares = list.reduce((sum, v) => sum + (v.sharesCount || 0), 0);
    const totalSaves = list.reduce((sum, v) => sum + (v.savesCount || 0), 0);

    const avgViews = totalVideos > 0 ? Math.round(totalViews / totalVideos) : profile.averageViews;
    const avgLikes = totalVideos > 0 ? Math.round(totalLikes / totalVideos) : profile.averageLikes;
    const avgComments = totalVideos > 0 ? Math.round(totalComments / totalVideos) : 0;
    const avgShares = totalVideos > 0 ? Math.round(totalShares / totalVideos) : 0;
    const avgSaves = totalVideos > 0 ? Math.round(totalSaves / totalVideos) : 0;

    const avgInteractions = avgLikes + avgComments + avgShares + avgSaves;
    const avgEr =
      totalVideos > 0
        ? Number(((avgInteractions / followerDenominator) * 100).toFixed(2))
        : Number((profile.averageEngagementRate || 0).toFixed(2));

    const maxOutlier =
      totalVideos > 0
        ? Math.max(...list.map((v) => v.outlierScore || 0), 1.0)
        : profile.topOutlierMultiplier;

    // 2. Juara ER (Top Engagement Rate Video)
    const sortedByEr = [...list].sort((a, b) => (b.engagementRate || 0) - (a.engagementRate || 0));
    const topErVideo = sortedByEr[0] || null;

    // Top Outlier Video
    const sortedByOutlier = [...list].sort((a, b) => (b.outlierScore || 0) - (a.outlierScore || 0));
    const topOutlierVideo = sortedByOutlier[0] || null;

    // 3. Format Battle: Video vs Photo Slide
    const videoOnlyList = list.filter((v) => !v.isPhoto);
    const photoList = list.filter((v) => v.isPhoto);

    const avgVideoViews =
      videoOnlyList.length > 0
        ? Math.round(videoOnlyList.reduce((acc, v) => acc + v.viewsCount, 0) / videoOnlyList.length)
        : 0;
    const avgPhotoViews =
      photoList.length > 0
        ? Math.round(photoList.reduce((acc, v) => acc + v.viewsCount, 0) / photoList.length)
        : 0;

    const avgVideoLikes =
      videoOnlyList.length > 0
        ? Math.round(videoOnlyList.reduce((acc, v) => acc + v.likesCount, 0) / videoOnlyList.length)
        : 0;
    const avgPhotoLikes =
      photoList.length > 0
        ? Math.round(photoList.reduce((acc, v) => acc + v.likesCount, 0) / photoList.length)
        : 0;

    // 4. Waktu & Hari Upload
    const dayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    const dayCounts: Record<string, { count: number; totalViews: number }> = {};
    const hourCounts: Record<string, number> = {};

    list.forEach((v) => {
      if (!v.timestamp) return;
      const date = new Date(v.timestamp);
      if (isNaN(date.getTime())) return;

      const dayName = dayNames[date.getDay()];
      if (!dayCounts[dayName]) dayCounts[dayName] = { count: 0, totalViews: 0 };
      dayCounts[dayName].count += 1;
      dayCounts[dayName].totalViews += v.viewsCount;

      const hour = date.getHours();
      const hourSlot =
        hour >= 6 && hour < 12
          ? "Pagi (06:00 - 12:00)"
          : hour >= 12 && hour < 17
          ? "Siang (12:00 - 17:00)"
          : hour >= 17 && hour < 21
          ? "Sore (17:00 - 21:00)"
          : "Malam (21:00 - 06:00)";
      hourCounts[hourSlot] = (hourCounts[hourSlot] || 0) + 1;
    });

    const bestDay = Object.entries(dayCounts).sort(
      (a, b) => b[1].totalViews / Math.max(1, b[1].count) - a[1].totalViews / Math.max(1, a[1].count)
    )[0];

    const bestHour = Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0];

    // 5. FYP Signals: Save Rate & Share Rate %
    const saveRate =
      totalViews > 0 ? Number(((totalSaves / totalViews) * 100).toFixed(2)) : 0;
    const shareRate =
      totalViews > 0 ? Number(((totalShares / totalViews) * 100).toFixed(2)) : 0;

    return {
      totalVideos,
      avgViews,
      avgLikes,
      avgComments,
      avgShares,
      avgSaves,
      avgEr,
      maxOutlier,
      topErVideo,
      topOutlierVideo,
      videoOnlyCount: videoOnlyList.length,
      photoCount: photoList.length,
      avgVideoViews,
      avgPhotoViews,
      avgVideoLikes,
      avgPhotoLikes,
      bestDay: bestDay ? bestDay[0] : "Rabu",
      bestHour: bestHour ? bestHour[0] : "Sore (17:00 - 21:00)",
      saveRate,
      shareRate,
    };
  }, [videos, profile]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl max-h-[90vh] bg-white dark:bg-[#141B31] border border-gray-200 dark:border-[#2C3246] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ========================================================================= */}
        {/* HEADER MODAL */}
        {/* ========================================================================= */}
        <div className="p-4 sm:p-5 border-b border-gray-200 dark:border-[#2C3246] flex items-center justify-between bg-gray-50/70 dark:bg-[#121727]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-base sm:text-lg text-gray-900 dark:text-white truncate">
                  Insight TikTok: @{profile.username}
                </h3>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center gap-1">
                  <BarChart3 className="w-3 h-3" />
                  <span>Insight</span>
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                Analisis mendalam dari {analytics.totalVideos} video TikTok terakhir
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
            title="Tutup Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ========================================================================= */}
        {/* BODY MODAL (Scrollable) */}
        {/* ========================================================================= */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 min-h-0 text-gray-800 dark:text-gray-200">
          {/* ========================================================================= */}
          {/* 4 KARTU PONDASI UTAMA */}
          {/* ========================================================================= */}
          <div>
            <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <span>Metrik Pondasi Akun</span>
            </h4>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {/* 1. Rata-rata Views */}
              <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-[#1A2238] border border-gray-200/80 dark:border-[#2C3246]">
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                  <span className="font-medium">Rata-rata Views</span>
                  <Eye className="w-4 h-4 text-blue-500" />
                </div>
                <div className="text-lg sm:text-xl font-black text-gray-900 dark:text-white">
                  {formatNumber(analytics.avgViews)}
                </div>
                <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                  per video TikTok
                </div>
              </div>

              {/* 2. Puncak Viral */}
              <div className="p-3.5 rounded-xl bg-gradient-to-br from-amber-500/10 via-rose-500/10 to-orange-500/10 border border-amber-500/30">
                <div className="flex items-center justify-between text-xs text-amber-600 dark:text-amber-400 font-semibold mb-1">
                  <span>Puncak Viral</span>
                  <Flame className="w-4 h-4 fill-current" />
                </div>
                <div className="text-lg sm:text-xl font-black text-amber-600 dark:text-amber-400">
                  {analytics.maxOutlier.toFixed(1)}× Outlier
                </div>
                <div className="text-[11px] text-amber-700/80 dark:text-amber-300/80 mt-0.5 truncate">
                  {analytics.topOutlierVideo ? `${formatNumber(analytics.topOutlierVideo.viewsCount)} views` : "Viral Peak"}
                </div>
              </div>

              {/* 3. Rata-rata Likes */}
              <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-[#1A2238] border border-gray-200/80 dark:border-[#2C3246]">
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                  <span className="font-medium">Rata-rata Likes</span>
                  <Heart className="w-4 h-4 text-rose-500" />
                </div>
                <div className="text-lg sm:text-xl font-black text-gray-900 dark:text-white">
                  {formatNumber(analytics.avgLikes)}
                </div>
                <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                  rata-rata suka/video
                </div>
              </div>

              {/* 4. Engagement Rate */}
              <div className="p-3.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30">
                <div className="flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400 font-semibold mb-1">
                  <span>Engagement Rate</span>
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="text-lg sm:text-xl font-black text-emerald-600 dark:text-emerald-400">
                  {analytics.avgEr}%
                </div>
                <div className="text-[11px] text-emerald-700/80 dark:text-emerald-300/80 mt-0.5 truncate">
                  vs {formatNumber(profile.followerCount)} pengikut
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 4 KARTU INSIGHT SPESIFIK TIKTOK */}
          {/* ========================================================================= */}
          <div>
            <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <span>Deep Strategic TikTok Analytics</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* KARTU 1: JUARA ENGAGEMENT (TOP ER VIDEO) */}
              <div className="p-4 rounded-2xl bg-white dark:bg-[#171F36] border border-gray-200 dark:border-[#2C3246] flex flex-col justify-between shadow-2xs">
                <div>
                  <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-gray-100 dark:border-[#2C3246]">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      <Award className="w-4 h-4" />
                      <span>Juara Engagement (Top ER)</span>
                    </div>
                    {analytics.topErVideo && (
                      <span className="text-xs font-black px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        {analytics.topErVideo.engagementRate}% ER
                      </span>
                    )}
                  </div>

                  {analytics.topErVideo ? (
                    <div className="pt-3 flex gap-3 items-start">
                      <div className="relative w-16 h-22 rounded-lg overflow-hidden bg-gray-100 dark:bg-black/40 shrink-0 border border-gray-200 dark:border-white/10">
                        <img
                          src={analytics.topErVideo.thumbnailUrl}
                          alt={analytics.topErVideo.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-1 left-1 px-1 py-0.2 rounded bg-black/70 text-[9px] font-bold text-amber-300">
                          {analytics.topErVideo.outlierScore}×
                        </div>
                      </div>

                      <div className="min-w-0 flex-1 space-y-1.5 text-xs">
                        <p className="font-semibold text-gray-900 dark:text-white line-clamp-2 leading-snug">
                          {analytics.topErVideo.title || "Video TikTok Terpopuler"}
                        </p>

                        <div className="grid grid-cols-2 gap-1.5 text-[11px] text-gray-600 dark:text-gray-300">
                          <div className="flex items-center gap-1">
                            <Eye className="w-3 h-3 text-blue-500" />
                            <span>{formatNumber(analytics.topErVideo.viewsCount)} views</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Heart className="w-3 h-3 text-rose-500" />
                            <span>{formatNumber(analytics.topErVideo.likesCount)} likes</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Forward className="w-3 h-3 text-cyan-500" />
                            <span>{formatNumber(analytics.topErVideo.sharesCount || 0)} shares</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Bookmark className="w-3 h-3 text-amber-500" />
                            <span>{formatNumber(analytics.topErVideo.savesCount || 0)} saves</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 py-4">Data video belum tersedia.</p>
                  )}
                </div>

                <div className="pt-3 mt-3 border-t border-gray-100 dark:border-[#2C3246] flex items-center justify-between gap-2">
                  <span className="text-[11px] text-gray-500 dark:text-gray-400">
                    Formula baku: Interaksi / Followers × 100%
                  </span>
                  {onApplySortEr && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onApplySortEr();
                      }}
                      className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                    >
                      <span>Urutkan Semua</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* KARTU 2: FORMAT BATTLE (VIDEO VS PHOTO SLIDE) */}
              <div className="p-4 rounded-2xl bg-white dark:bg-[#171F36] border border-gray-200 dark:border-[#2C3246] flex flex-col justify-between shadow-2xs">
                <div>
                  <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-gray-100 dark:border-[#2C3246]">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-purple-600 dark:text-purple-400">
                      <Video className="w-4 h-4" />
                      <span>Format: Video vs Photo Slide</span>
                    </div>
                    <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">
                      Rata-rata Views
                    </span>
                  </div>

                  <div className="pt-3 space-y-3">
                    {/* Bar Video Reguler */}
                    <div>
                      <div className="flex items-center justify-between text-xs font-semibold mb-1">
                        <span className="flex items-center gap-1.5 text-gray-800 dark:text-gray-200">
                          <Video className="w-3.5 h-3.5 text-purple-500" />
                          <span>Video ({analytics.videoOnlyCount})</span>
                        </span>
                        <span className="font-bold text-gray-900 dark:text-white">
                          {formatNumber(analytics.avgVideoViews)} views
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-gray-100 dark:bg-black/30 overflow-hidden">
                        <div
                          className="h-full bg-purple-500 rounded-full"
                          style={{
                            width: `${
                              analytics.avgVideoViews + analytics.avgPhotoViews > 0
                                ? Math.min(
                                    100,
                                    (analytics.avgVideoViews /
                                      (analytics.avgVideoViews + analytics.avgPhotoViews)) *
                                      100
                                  )
                                : 100
                            }%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Bar Photo Slide */}
                    <div>
                      <div className="flex items-center justify-between text-xs font-semibold mb-1">
                        <span className="flex items-center gap-1.5 text-gray-800 dark:text-gray-200">
                          <Layers className="w-3.5 h-3.5 text-cyan-500" />
                          <span>Photo Slide ({analytics.photoCount})</span>
                        </span>
                        <span className="font-bold text-gray-900 dark:text-white">
                          {analytics.photoCount > 0 ? `${formatNumber(analytics.avgPhotoViews)} views` : "Belum Ada"}
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-gray-100 dark:bg-black/30 overflow-hidden">
                        <div
                          className="h-full bg-cyan-500 rounded-full"
                          style={{
                            width: `${
                              analytics.avgVideoViews + analytics.avgPhotoViews > 0 && analytics.photoCount > 0
                                ? Math.min(
                                    100,
                                    (analytics.avgPhotoViews /
                                      (analytics.avgVideoViews + analytics.avgPhotoViews)) *
                                      100
                                  )
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-gray-100 dark:border-[#2C3246] text-[11px] text-gray-600 dark:text-gray-300">
                  {analytics.photoCount > 0 && analytics.avgPhotoViews > analytics.avgVideoViews
                    ? "💡 Format Photo Slide menghasilkan jangkauan views lebih tinggi pada akun ini!"
                    : "💡 Format Video gerakan vertikal merupakan format konten dominan akun ini."}
                </div>
              </div>

              {/* KARTU 3: WAKTU & RITME UPLOAD OPTIMAL (WIB) */}
              <div className="p-4 rounded-2xl bg-white dark:bg-[#171F36] border border-gray-200 dark:border-[#2C3246] flex flex-col justify-between shadow-2xs">
                <div>
                  <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-gray-100 dark:border-[#2C3246]">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
                      <Clock className="w-4 h-4" />
                      <span>Waktu &amp; Ritme Upload (WIB)</span>
                    </div>
                    <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">
                      Pola Histori
                    </span>
                  </div>

                  <div className="pt-3 grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-white/5">
                      <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 mb-1">
                        <Calendar className="w-3.5 h-3.5 text-amber-500" />
                        <span>Hari Tersubur</span>
                      </div>
                      <div className="font-black text-sm text-gray-900 dark:text-white">
                        {analytics.bestDay}
                      </div>
                      <div className="text-[10px] text-gray-500 mt-0.5">
                        rata-rata views tertinggi
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-white/5">
                      <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 mb-1">
                        <Clock className="w-3.5 h-3.5 text-orange-500" />
                        <span>Jam Emas Rilis</span>
                      </div>
                      <div className="font-black text-sm text-gray-900 dark:text-white truncate">
                        {analytics.bestHour.split(" ")[0]}
                      </div>
                      <div className="text-[10px] text-gray-500 mt-0.5 truncate">
                        {analytics.bestHour}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-gray-100 dark:border-[#2C3246] text-[11px] text-gray-600 dark:text-gray-300">
                  ⏰ Upload 30-45 menit sebelum jam puncak agar algoritma TikTok memproses indexing FYP.
                </div>
              </div>

              {/* KARTU 4: SINYAL ALGORITMA FYP (SAVE & SHARE RATE) */}
              <div className="p-4 rounded-2xl bg-white dark:bg-[#171F36] border border-gray-200 dark:border-[#2C3246] flex flex-col justify-between shadow-2xs">
                <div>
                  <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-gray-100 dark:border-[#2C3246]">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-sky-600 dark:text-sky-400">
                      <Share2 className="w-4 h-4" />
                      <span>Sinyal Algoritma FYP (Share &amp; Save)</span>
                    </div>
                    <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">
                      Rasio per Views
                    </span>
                  </div>

                  <div className="pt-3 grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-gray-600 dark:text-gray-300 font-medium">Share Rate</span>
                        <Forward className="w-3.5 h-3.5 text-cyan-500" />
                      </div>
                      <div className="text-base font-black text-cyan-600 dark:text-cyan-400">
                        {analytics.shareRate}%
                      </div>
                      <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                        rerata {formatNumber(analytics.avgShares)} bagikan/post
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-gray-600 dark:text-gray-300 font-medium">Save Rate</span>
                        <Bookmark className="w-3.5 h-3.5 text-amber-500" />
                      </div>
                      <div className="text-base font-black text-amber-600 dark:text-amber-400">
                        {analytics.saveRate}%
                      </div>
                      <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                        rerata {formatNumber(analytics.avgSaves)} simpan/post
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-gray-100 dark:border-[#2C3246] text-[11px] text-gray-600 dark:text-gray-300">
                  🔥 TikTok memprioritaskan video dengan rasio Saves &gt; 1% dan Shares &gt; 0.5% untuk disorongkan ke FYP audiens luas!
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* FOOTER MODAL */}
        {/* ========================================================================= */}
        <div className="p-4 border-t border-gray-200 dark:border-[#2C3246] bg-gray-50/70 dark:bg-[#121727] flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold text-xs hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
