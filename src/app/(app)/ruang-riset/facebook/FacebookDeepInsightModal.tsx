"use client";

import React, { useMemo } from "react";
import {
  FacebookUserProfile,
  FacebookPostItem,
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
  Share2,
  FileText,
} from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  profile: FacebookUserProfile;
  posts: FacebookPostItem[];
  onSelectPost?: (post: FacebookPostItem) => void;
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

export function FacebookDeepInsightModal({
  isOpen,
  onClose,
  profile,
  posts,
  onSelectPost,
  onApplySortEr,
}: Props) {
  if (!isOpen) return null;

  const analytics = useMemo(() => {
    const rawList = posts || [];
    const totalPosts = rawList.length;
    const followerDenominator = Math.max(1, profile.followersCount || profile.averageViews);

    // Standar Baku Industri: ER dihitung terhadap Followers ((Likes + Comments + Shares) / Followers * 100%)
    const list = rawList.map((p) => {
      const interactions = p.likesCount + p.commentsCount + (p.sharesCount || 0);
      const calculatedEr = Number(((interactions / followerDenominator) * 100).toFixed(2));
      return {
        ...p,
        engagementRate: calculatedEr,
      };
    });

    // 1. Agregasi Metrik Utama
    const totalViews = list.reduce((sum, p) => sum + (p.viewsCount || 0), 0);
    const totalLikes = list.reduce((sum, p) => sum + (p.likesCount || 0), 0);
    const totalComments = list.reduce((sum, p) => sum + (p.commentsCount || 0), 0);
    const totalShares = list.reduce((sum, p) => sum + (p.sharesCount || 0), 0);

    const avgViews = totalPosts > 0 ? Math.round(totalViews / totalPosts) : profile.averageViews;
    const avgLikes = totalPosts > 0 ? Math.round(totalLikes / totalPosts) : profile.averageLikes;
    const avgComments = totalPosts > 0 ? Math.round(totalComments / totalPosts) : 0;
    const avgShares = totalPosts > 0 ? Math.round(totalShares / totalPosts) : 0;

    const avgInteractions = avgLikes + avgComments + avgShares;
    const avgEr =
      totalPosts > 0
        ? Number(((avgInteractions / followerDenominator) * 100).toFixed(2))
        : Number((profile.averageEngagementRate || 0).toFixed(2));

    const maxOutlier =
      totalPosts > 0
        ? Math.max(...list.map((p) => p.outlierScore || 0), 1.0)
        : profile.topOutlierMultiplier;

    // 2. Juara ER (Top Engagement Rate Post)
    const sortedByEr = [...list].sort((a, b) => (b.engagementRate || 0) - (a.engagementRate || 0));
    const topErPost = sortedByEr[0] || null;

    // Top Outlier Post
    const sortedByOutlier = [...list].sort((a, b) => (b.outlierScore || 0) - (a.outlierScore || 0));
    const topOutlierPost = sortedByOutlier[0] || null;

    // 3. Format Battle: Video/Reels vs Foto
    const videoList = list.filter((p) => !p.isPhoto);
    const photoList = list.filter((p) => p.isPhoto);

    const avgVideoViews =
      videoList.length > 0
        ? Math.round(videoList.reduce((acc, p) => acc + p.viewsCount, 0) / videoList.length)
        : 0;
    const avgPhotoViews =
      photoList.length > 0
        ? Math.round(photoList.reduce((acc, p) => acc + p.viewsCount, 0) / photoList.length)
        : 0;

    const avgVideoLikes =
      videoList.length > 0
        ? Math.round(videoList.reduce((acc, p) => acc + p.likesCount, 0) / videoList.length)
        : 0;
    const avgPhotoLikes =
      photoList.length > 0
        ? Math.round(photoList.reduce((acc, p) => acc + p.likesCount, 0) / photoList.length)
        : 0;

    // 4. Waktu & Hari Upload
    const dayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    const dayCounts: Record<string, { count: number; totalViews: number }> = {};
    const hourCounts: Record<string, number> = {};

    list.forEach((p) => {
      if (!p.timestamp) return;
      const date = new Date(p.timestamp);
      if (isNaN(date.getTime())) return;

      const dayName = dayNames[date.getDay()];
      if (!dayCounts[dayName]) dayCounts[dayName] = { count: 0, totalViews: 0 };
      dayCounts[dayName].count += 1;
      dayCounts[dayName].totalViews += p.viewsCount;

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

    // 5. Facebook Virality Ratio (Share Rate % & Comment Rate %)
    const shareRate =
      totalViews > 0 ? Number(((totalShares / totalViews) * 100).toFixed(2)) : 0;
    const commentRate =
      totalViews > 0 ? Number(((totalComments / totalViews) * 100).toFixed(2)) : 0;

    return {
      totalPosts,
      avgViews,
      avgLikes,
      avgComments,
      avgShares,
      avgEr,
      maxOutlier,
      topErPost,
      topOutlierPost,
      videoCount: videoList.length,
      photoCount: photoList.length,
      avgVideoViews,
      avgPhotoViews,
      avgVideoLikes,
      avgPhotoLikes,
      bestDay: bestDay ? bestDay[0] : "Kamis",
      bestHour: bestHour ? bestHour[0] : "Malam (19:00 - 22:00)",
      shareRate,
      commentRate,
    };
  }, [posts, profile]);

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
                  Insight Facebook: {profile.name}
                </h3>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center gap-1">
                  <BarChart3 className="w-3 h-3" />
                  <span>Insight</span>
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                Analisis mendalam dari {analytics.totalPosts} konten Facebook terakhir
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
              <span>Metrik Pondasi Halaman</span>
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
                  per konten Facebook
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
                  {analytics.topOutlierPost ? `${formatNumber(analytics.topOutlierPost.viewsCount)} views` : "Viral Peak"}
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
                  rata-rata suka/konten
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
                  vs {formatNumber(profile.followersCount)} pengikut
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 4 KARTU INSIGHT SPESIFIK FACEBOOK */}
          {/* ========================================================================= */}
          <div>
            <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <span>Deep Strategic Facebook Analytics</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* KARTU 1: JUARA ENGAGEMENT (TOP ER POST) */}
              <div className="p-4 rounded-2xl bg-white dark:bg-[#171F36] border border-gray-200 dark:border-[#2C3246] flex flex-col justify-between shadow-2xs">
                <div>
                  <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-gray-100 dark:border-[#2C3246]">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      <Award className="w-4 h-4" />
                      <span>Juara Engagement (Top ER)</span>
                    </div>
                    {analytics.topErPost && (
                      <span className="text-xs font-black px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        {analytics.topErPost.engagementRate}% ER
                      </span>
                    )}
                  </div>

                  {analytics.topErPost ? (
                    <div className="pt-3 flex gap-3 items-start">
                      <div className="relative w-16 h-20 rounded-lg overflow-hidden bg-gray-100 dark:bg-black/40 shrink-0 border border-gray-200 dark:border-white/10">
                        <img
                          src={analytics.topErPost.thumbnailUrl}
                          alt={analytics.topErPost.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-1 left-1 px-1 py-0.2 rounded bg-black/70 text-[9px] font-bold text-amber-300">
                          {analytics.topErPost.outlierScore}×
                        </div>
                      </div>

                      <div className="min-w-0 flex-1 space-y-1.5 text-xs">
                        <p className="font-semibold text-gray-900 dark:text-white line-clamp-2 leading-snug">
                          {analytics.topErPost.title || "Konten Facebook Terpopuler"}
                        </p>

                        <div className="grid grid-cols-2 gap-1.5 text-[11px] text-gray-600 dark:text-gray-300">
                          <div className="flex items-center gap-1">
                            <Eye className="w-3 h-3 text-blue-500" />
                            <span>{formatNumber(analytics.topErPost.viewsCount)} views</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Heart className="w-3 h-3 text-rose-500" />
                            <span>{formatNumber(analytics.topErPost.likesCount)} likes</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageSquare className="w-3 h-3 text-sky-400" />
                            <span>{formatNumber(analytics.topErPost.commentsCount)} comments</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Forward className="w-3 h-3 text-emerald-500" />
                            <span>{formatNumber(analytics.topErPost.sharesCount || 0)} shares</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 py-4">Data konten belum tersedia.</p>
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

              {/* KARTU 2: FORMAT BATTLE (REELS/VIDEO VS FOTO) */}
              <div className="p-4 rounded-2xl bg-white dark:bg-[#171F36] border border-gray-200 dark:border-[#2C3246] flex flex-col justify-between shadow-2xs">
                <div>
                  <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-gray-100 dark:border-[#2C3246]">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                      <Video className="w-4 h-4" />
                      <span>Format: Reels/Video vs Foto</span>
                    </div>
                    <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">
                      Rata-rata Views
                    </span>
                  </div>

                  <div className="pt-3 space-y-3">
                    {/* Bar Video/Reels */}
                    <div>
                      <div className="flex items-center justify-between text-xs font-semibold mb-1">
                        <span className="flex items-center gap-1.5 text-gray-800 dark:text-gray-200">
                          <Video className="w-3.5 h-3.5 text-indigo-500" />
                          <span>Video &amp; Reels ({analytics.videoCount})</span>
                        </span>
                        <span className="font-bold text-gray-900 dark:text-white">
                          {formatNumber(analytics.avgVideoViews)} views
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-gray-100 dark:bg-black/30 overflow-hidden">
                        <div
                          className="h-full bg-indigo-500 rounded-full"
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

                    {/* Bar Foto / Album */}
                    <div>
                      <div className="flex items-center justify-between text-xs font-semibold mb-1">
                        <span className="flex items-center gap-1.5 text-gray-800 dark:text-gray-200">
                          <Layers className="w-3.5 h-3.5 text-blue-500" />
                          <span>Post Foto/Album ({analytics.photoCount})</span>
                        </span>
                        <span className="font-bold text-gray-900 dark:text-white">
                          {analytics.photoCount > 0 ? `${formatNumber(analytics.avgPhotoViews)} views` : "Belum Ada"}
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-gray-100 dark:bg-black/30 overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
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
                  {analytics.videoCount > analytics.photoCount
                    ? "💡 Format Reels dan Video memiliki daya jangkau rekomendasi organik Facebook tertinggi."
                    : "💡 Format visual foto poster mendominasi interaksi komunitas di halaman ini."}
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
                  ⏰ Posting di jam santai Facebook memicu lonjakan share dan diskusi komentar yang masif.
                </div>
              </div>

              {/* KARTU 4: VIRALITY INDEX (SHARE & COMMENT RATIO) */}
              <div className="p-4 rounded-2xl bg-white dark:bg-[#171F36] border border-gray-200 dark:border-[#2C3246] flex flex-col justify-between shadow-2xs">
                <div>
                  <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-gray-100 dark:border-[#2C3246]">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-sky-600 dark:text-sky-400">
                      <Share2 className="w-4 h-4" />
                      <span>Virality Facebook: Share &amp; Diskusi</span>
                    </div>
                    <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">
                      Kekuatan Distribusi
                    </span>
                  </div>

                  <div className="pt-3 grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-gray-600 dark:text-gray-300 font-medium">Share Rate</span>
                        <Forward className="w-3.5 h-3.5 text-[#1877F2]" />
                      </div>
                      <div className="text-base font-black text-[#1877F2] dark:text-sky-400">
                        {analytics.shareRate}%
                      </div>
                      <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                        rerata {formatNumber(analytics.avgShares)} bagikan/post
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-gray-600 dark:text-gray-300 font-medium">Comment Rate</span>
                        <MessageSquare className="w-3.5 h-3.5 text-amber-500" />
                      </div>
                      <div className="text-base font-black text-amber-600 dark:text-amber-400">
                        {analytics.commentRate}%
                      </div>
                      <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                        rerata {formatNumber(analytics.avgComments)} komen/post
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-gray-100 dark:border-[#2C3246] text-[11px] text-gray-600 dark:text-gray-300">
                  🔥 Facebook adalah jaringan berbasis 'Share ke Grup/Timeline'. 1 Share menyumbang hingga 15× eksposur baru!
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
