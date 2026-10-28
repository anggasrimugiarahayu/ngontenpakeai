"use client";

import React, { useMemo } from "react";
import {
  YouTubeChannelProfile,
  YouTubeVideoItem,
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
  Film,
  Award,
  ArrowUpRight,
  BarChart3,
  Sparkles,
} from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  profile: YouTubeChannelProfile;
  videos: YouTubeVideoItem[];
  onSelectVideo?: (video: YouTubeVideoItem) => void;
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

export function YouTubeDeepInsightModal({
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
    const subDenominator = Math.max(1, profile.subscriberCount || profile.averageViews);

    // Standar Baku Industri: ER dihitung terhadap Subscribers ((Likes + Comments) / Subscribers * 100%)
    const list = rawList.map((v) => {
      const calculatedEr = Number(
        (((v.likesCount + v.commentsCount) / subDenominator) * 100).toFixed(2)
      );
      return {
        ...v,
        engagementRate: calculatedEr,
      };
    });

    // 1. Agregasi Metrik Utama
    const totalViews = list.reduce((sum, v) => sum + (v.viewsCount || 0), 0);
    const totalLikes = list.reduce((sum, v) => sum + (v.likesCount || 0), 0);
    const totalComments = list.reduce((sum, v) => sum + (v.commentsCount || 0), 0);

    const avgViews = totalVideos > 0 ? Math.round(totalViews / totalVideos) : profile.averageViews;
    const avgLikes = totalVideos > 0 ? Math.round(totalLikes / totalVideos) : (profile.averageLikes || 0);
    const avgComments = totalVideos > 0 ? Math.round(totalComments / totalVideos) : 0;
    const avgEr =
      totalVideos > 0
        ? Number((((avgLikes + avgComments) / subDenominator) * 100).toFixed(2))
        : Number((profile.averageEngagementRate || 0).toFixed(2));

    const maxOutlier =
      totalVideos > 0
        ? Math.max(...list.map((v) => v.outlierScore || 0), 1.0)
        : profile.topOutlierMultiplier;

    // Views / Subs Ratio
    const viewsToSubsRatio =
      profile.subscriberCount > 0
        ? Math.round((avgViews / profile.subscriberCount) * 100)
        : 0;

    // 2. Juara ER
    const sortedByEr = [...list].sort((a, b) => (b.engagementRate || 0) - (a.engagementRate || 0));
    const topErVideo = sortedByEr[0] || null;

    // 3. Format Battle (Shorts vs Long Video)
    const shortsList = list.filter((v) => v.isShorts || v.durationSeconds <= 60);
    const longList = list.filter((v) => !v.isShorts && v.durationSeconds > 60);

    const shortsAvgViews =
      shortsList.length > 0
        ? shortsList.reduce((s, v) => s + (v.viewsCount || 0), 0) / shortsList.length
        : 0;
    const longAvgViews =
      longList.length > 0
        ? longList.reduce((s, v) => s + (v.viewsCount || 0), 0) / longList.length
        : 0;

    let formatWinner = "Seimbang";
    let formatMultiplier = "1.0×";
    if (shortsAvgViews > 0 && longAvgViews > 0) {
      if (shortsAvgViews >= longAvgViews) {
        formatWinner = "Shorts";
        formatMultiplier = (shortsAvgViews / longAvgViews).toFixed(1) + "×";
      } else {
        formatWinner = "Long Video";
        formatMultiplier = (longAvgViews / shortsAvgViews).toFixed(1) + "×";
      }
    } else if (shortsList.length > longList.length) {
      formatWinner = "Shorts";
      formatMultiplier = "Unggul";
    } else {
      formatWinner = "Long Video";
      formatMultiplier = "Unggul";
    }

    const shortsPct = totalVideos > 0 ? Math.round((shortsList.length / totalVideos) * 100) : 50;
    const longPct = totalVideos > 0 ? Math.round((longList.length / totalVideos) * 100) : 50;

    // Durasi Long Video Gacor
    const highLongs = longList.filter((v) => (v.outlierScore || 0) >= 1.2);
    const targetLongs = highLongs.length > 0 ? highLongs : longList;
    const avgLongDurationSec =
      targetLongs.length > 0
        ? Math.round(targetLongs.reduce((sum, v) => sum + (v.durationSeconds || 600), 0) / targetLongs.length)
        : 600;
    const avgLongMins = Math.max(3, Math.round(avgLongDurationSec / 60));
    const optimalLongDuration = `${Math.max(2, avgLongMins - 2)}–${avgLongMins + 3} menit`;

    // 4. Waktu & Ritme Upload (WIB UTC+7)
    const dayCounts: Record<string, number> = {
      Minggu: 0,
      Senin: 0,
      Selasa: 0,
      Rabu: 0,
      Kamis: 0,
      Jumat: 0,
      Sabtu: 0,
    };
    const dayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    const hourBuckets: Record<string, number> = {
      "Pagi (08:00–11:00)": 0,
      "Siang (12:00–14:30)": 0,
      "Sore (15:30–18:00)": 0,
      "Malam (19:00–21:30)": 0,
    };

    let earliestTime = Infinity;
    let latestTime = -Infinity;

    list.slice(0, 20).forEach((v) => {
      if (!v.timestamp) return;
      const d = new Date(v.timestamp);
      const t = d.getTime();
      if (isNaN(t)) return;

      if (t < earliestTime) earliestTime = t;
      if (t > latestTime) latestTime = t;

      const utcHours = d.getUTCHours();
      const wibHour = (utcHours + 7) % 24;
      const wibDayIdx = (d.getUTCDay() + (utcHours + 7 >= 24 ? 1 : 0)) % 7;
      const dayName = dayNames[wibDayIdx];
      if (dayCounts[dayName] !== undefined) dayCounts[dayName]++;

      if (wibHour >= 8 && wibHour < 12) hourBuckets["Pagi (08:00–11:00)"]++;
      else if (wibHour >= 12 && wibHour < 15) hourBuckets["Siang (12:00–14:30)"]++;
      else if (wibHour >= 15 && wibHour < 19) hourBuckets["Sore (15:30–18:00)"]++;
      else hourBuckets["Malam (19:00–21:30)"]++;
    });

    const sortedDays = Object.entries(dayCounts).sort((a, b) => b[1] - a[1]);
    const topDays =
      sortedDays[0] && sortedDays[0][1] > 0
        ? `${sortedDays[0][0]}${sortedDays[1] && sortedDays[1][1] > 0 ? " & " + sortedDays[1][0] : ""}`
        : "Rabu & Sabtu";

    const sortedHours = Object.entries(hourBuckets).sort((a, b) => b[1] - a[1]);
    const topHourLabel =
      sortedHours[0] && sortedHours[0][1] > 0
        ? sortedHours[0][0]
        : "Sore (15:30–18:00 WIB)";

    let postsPerWeek = "2–4 video";
    if (earliestTime < latestTime && totalVideos >= 3) {
      const daysSpan = Math.max(1, (latestTime - earliestTime) / (1000 * 60 * 60 * 24));
      const weeksSpan = Math.max(0.5, daysSpan / 7);
      postsPerWeek = (totalVideos / weeksSpan).toFixed(1) + " video";
    }

    // 5. Retensi & Kata Kunci Judul
    const likeToViewRatio =
      totalViews > 0 ? Number(((totalLikes / totalViews) * 100).toFixed(1)) : 0;
    let retentionNote = "Performa Interaksi Sehat";
    if (likeToViewRatio >= 4.0) {
      retensiNote: retentionNote = "Like Ratio Tinggi (Di atas standar 3-4% YouTube)";
    } else if (likeToViewRatio < 2.0) {
      retentionNote = "Penonton Cenderung Menonton Tanpa Interaksi";
    }

    // Ekstraksi Kata Kunci Judul
    const stopWords = new Set([
      "dan", "di", "ke", "dari", "yang", "ini", "itu", "untuk", "pada", "adalah",
      "dengan", "akan", "juga", "bisa", "ada", "karena", "kita", "kamu", "saya",
      "video", "shorts", "part", "eps", "the", "and", "in", "to", "of", "a"
    ]);

    const wordCounts: Record<string, number> = {};
    list.slice(0, 30).forEach((v) => {
      const clean = (v.title || "")
        .toLowerCase()
        .replace(/[^\w\s]/g, " ")
        .replace(/\s+/g, " ");
      clean.split(" ").filter((w) => w.length >= 3 && !stopWords.has(w)).forEach((w) => {
        wordCounts[w] = (wordCounts[w] || 0) + 1;
      });
    });

    const popularKeywords = Object.entries(wordCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word]) => `"${word}"`);

    const finalKeywords =
      popularKeywords.length >= 2
        ? popularKeywords
        : ['"Kenapa"', '"Rahasia"', '"Fakta"', '"Terbaru"'];

    return {
      totalVideos,
      totalViews,
      totalLikes,
      totalComments,
      avgViews,
      avgLikes,
      avgComments,
      avgEr,
      maxOutlier,
      viewsToSubsRatio,
      topErVideo,
      formatWinner,
      formatMultiplier,
      shortsPct,
      longPct,
      shortsCount: shortsList.length,
      longCount: longList.length,
      shortsAvgViews: formatNumber(Math.round(shortsAvgViews)),
      longAvgViews: formatNumber(Math.round(longAvgViews)),
      optimalLongDuration,
      topDays,
      topHourLabel,
      postsPerWeek,
      likeToViewRatio,
      retentionNote,
      finalKeywords,
    };
  }, [videos, profile]);

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-4xl max-h-[92vh] flex flex-col bg-white dark:bg-[#141B31] border border-gray-200 dark:border-[#2C3246] rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-gray-100 dark:border-[#2C3246] bg-gray-50/50 dark:bg-[#1A2238]/50 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full p-0.5 bg-gradient-to-tr from-red-600 via-rose-500 to-amber-500 shrink-0">
              <img
                src={profile.avatarUrl}
                alt={profile.title}
                className="w-full h-full rounded-full object-cover border-2 border-white dark:border-[#141B31]"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-base sm:text-lg text-gray-900 dark:text-white truncate">
                  {profile.title}
                </h3>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-gradient-to-r from-orange-500/15 to-amber-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/20">
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>Insight</span>
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                Analisa data komprehensif channel YouTube ({analytics.totalVideos} video)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-white bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors cursor-pointer shrink-0"
            title="Tutup Popup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 min-h-0">
          {/* 1. ROW METRIK PONDASI UTAMA */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Pondasi Performa Channel
              </h4>
              <span className="text-xs font-semibold text-red-600 dark:text-red-400">
                Views vs Subs: {analytics.viewsToSubsRatio}%
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {/* Card 1: Rata-rata Views */}
              <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-[#1A2238] border border-gray-100 dark:border-[#2C3246]/60 space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                  <Eye className="w-3.5 h-3.5 text-blue-500" />
                  <span>Rata-rata Views</span>
                </div>
                <div className="text-lg sm:text-xl font-black text-gray-900 dark:text-white">
                  {formatNumber(analytics.avgViews)}
                </div>
                <p className="text-[11px] text-gray-400">
                  Total {formatNumber(analytics.totalViews)} Views
                </p>
              </div>

              {/* Card 2: Puncak Viral / Top Outlier */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-500/10 to-rose-500/10 dark:from-amber-500/20 dark:to-rose-500/20 border border-amber-500/20 space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-semibold">
                  <Flame className="w-3.5 h-3.5 fill-current" />
                  <span>Puncak Viral</span>
                </div>
                <div className="text-lg sm:text-xl font-black text-amber-600 dark:text-amber-400">
                  {analytics.maxOutlier.toFixed(1)}x
                </div>
                <p className="text-[11px] text-amber-600/70 dark:text-amber-400/70">
                  Kelipatan rata-rata channel
                </p>
              </div>

              {/* Card 3: Rata-rata Likes */}
              <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-[#1A2238] border border-gray-100 dark:border-[#2C3246]/60 space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                  <Heart className="w-3.5 h-3.5 text-rose-500" />
                  <span>Rata-rata Likes</span>
                </div>
                <div className="text-lg sm:text-xl font-black text-gray-900 dark:text-white">
                  {formatNumber(analytics.avgLikes)}
                </div>
                <p className="text-[11px] text-gray-400">
                  Total {formatNumber(analytics.totalLikes)} Likes
                </p>
              </div>

              {/* Card 4: Engagement Rate */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Rata-rata ER</span>
                </div>
                <div className="text-lg sm:text-xl font-black text-emerald-600 dark:text-emerald-400">
                  {analytics.avgEr}%
                </div>
                <p className="text-[11px] text-emerald-600/70 dark:text-emerald-400/70">
                  Interaksi vs Subscribers
                </p>
              </div>
            </div>
          </div>

          {/* 2. GRID 4 KARTU INSIGHT ANALITIK MENDALAM */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2.5">
              Strategi Konten & Algoritma YouTube
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {/* KARTU 1: VIDEO ER TERTINGGI & AKUMULASI */}
              <div className="p-4 rounded-2xl bg-white dark:bg-[#1A2238] border border-gray-200 dark:border-[#2C3246] shadow-xs flex flex-col justify-between space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/15 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold">
                      <Award className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-sm text-gray-900 dark:text-white">
                      Video ER Tertinggi
                    </span>
                  </div>
                  {analytics.topErVideo && (
                    <span className="px-2.5 py-1 rounded-full text-xs font-black bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      🏆 {analytics.topErVideo.engagementRate?.toFixed(2)}% ER
                    </span>
                  )}
                </div>

                {analytics.topErVideo ? (
                  <div className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-50 dark:bg-[#141B31] border border-gray-100 dark:border-[#2C3246]/60">
                    <img
                      src={analytics.topErVideo.thumbnailUrl}
                      alt={analytics.topErVideo.title}
                      className="w-14 h-14 rounded-lg object-cover shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-gray-900 dark:text-white line-clamp-1">
                        {analytics.topErVideo.title}
                      </p>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">
                        {formatNumber(analytics.topErVideo.viewsCount)} views •{" "}
                        {formatNumber(analytics.topErVideo.likesCount)} likes
                      </p>
                    </div>
                    {onSelectVideo && (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onSelectVideo(analytics.topErVideo!);
                        }}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-orange-500 hover:bg-orange-600 text-white flex items-center gap-1 transition-all shrink-0 cursor-pointer shadow-xs"
                      >
                        <span>Buka</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400">Belum ada video untuk dianalisis</p>
                )}

                <div className="pt-2 border-t border-gray-100 dark:border-[#2C3246] flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>Akumulasi: {formatNumber(analytics.totalViews)} Views</span>
                  <span>{analytics.totalVideos} Video Teranalisis</span>
                </div>
              </div>

              {/* KARTU 2: FORMAT & DURASI JUARA */}
              <div className="p-4 rounded-2xl bg-white dark:bg-[#1A2238] border border-gray-200 dark:border-[#2C3246] shadow-xs flex flex-col justify-between space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-red-500/15 flex items-center justify-center text-red-600 dark:text-red-400 font-bold">
                      <Film className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-sm text-gray-900 dark:text-white">
                      Shorts vs Long Video (16:9)
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-500/15 text-red-600 dark:text-red-400">
                    {analytics.formatWinner} {analytics.formatMultiplier}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
                      <Film className="w-3 h-3 text-red-500" />
                      <span>Shorts ({analytics.shortsCount})</span>
                    </span>
                    <span className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
                      <Video className="w-3 h-3 text-blue-500" />
                      <span>Long ({analytics.longCount})</span>
                    </span>
                  </div>

                  <div className="w-full h-2.5 rounded-full bg-gray-100 dark:bg-white/5 overflow-hidden flex">
                    <div
                      className="bg-red-500 h-full transition-all duration-300"
                      style={{ width: `${analytics.shortsPct}%` }}
                    />
                    <div
                      className="bg-blue-500 h-full transition-all duration-300"
                      style={{ width: `${analytics.longPct}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-gray-400">
                    <span>Avg: {analytics.shortsAvgViews} Views</span>
                    <span>Avg: {analytics.longAvgViews} Views</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-100 dark:border-[#2C3246] flex items-center justify-between text-xs">
                  <span className="text-gray-500 dark:text-gray-400">
                    Durasi Long Gacor: <strong className="text-gray-800 dark:text-gray-200">{analytics.optimalLongDuration}</strong>
                  </span>
                  <span className="text-gray-500 dark:text-gray-400">
                    Shorts: <strong className="text-gray-800 dark:text-gray-200">&lt; 60 detik</strong>
                  </span>
                </div>
              </div>

              {/* KARTU 3: WAKTU & RITME UPLOAD */}
              <div className="p-4 rounded-2xl bg-white dark:bg-[#1A2238] border border-gray-200 dark:border-[#2C3246] shadow-xs flex flex-col justify-between space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/15 flex items-center justify-center text-amber-600 dark:text-amber-400 font-bold">
                    <Clock className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-sm text-gray-900 dark:text-white">
                    Waktu & Jadwal Upload
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs">
                    <Calendar className="w-4 h-4 text-amber-500 shrink-0" />
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Hari Upload Viral: </span>
                      <strong className="text-gray-900 dark:text-white">{analytics.topDays}</strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Jam Tayang Optimal: </span>
                      <strong className="text-gray-900 dark:text-white">{analytics.topHourLabel}</strong>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-100 dark:border-[#2C3246] flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>Konsistensi Channel:</span>
                  <strong className="text-emerald-600 dark:text-emerald-400 font-bold">
                    {analytics.postsPerWeek}
                  </strong>
                </div>
              </div>

              {/* KARTU 4: RETENSI & KEYWORD VIRAL */}
              <div className="p-4 rounded-2xl bg-white dark:bg-[#1A2238] border border-gray-200 dark:border-[#2C3246] shadow-xs flex flex-col justify-between space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-indigo-500/15 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-sm text-gray-900 dark:text-white">
                      Retensi & Keyword Judul
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/15 text-indigo-600 dark:text-indigo-400">
                    Like-to-View: {analytics.likeToViewRatio}%
                  </span>
                </div>

                <div className="space-y-1.5">
                  <p className="text-xs text-gray-600 dark:text-gray-300">
                    {analytics.retentionNote}
                  </p>

                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    <span className="text-[11px] text-gray-400">Keyword Judul:</span>
                    {analytics.finalKeywords.map((kw, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-[#2C3246] text-xs font-semibold text-gray-800 dark:text-gray-200"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-100 dark:border-[#2C3246] text-[11px] text-gray-400">
                  Algoritma YouTube memprioritaskan Click-Through Rate (CTR) dan durasi tonton rata-rata.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* MODAL FOOTER */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 border-t border-gray-100 dark:border-[#2C3246] bg-gray-50/50 dark:bg-[#1A2238]/50 shrink-0">
          {onApplySortEr ? (
            <button
              type="button"
              onClick={() => {
                onApplySortEr();
                onClose();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white transition-all cursor-pointer shadow-xs"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Urutkan Feed Berdasarkan ER</span>
            </button>
          ) : (
            <div />
          )}

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-gray-200 hover:bg-gray-300 dark:bg-white/10 dark:hover:bg-white/15 text-gray-800 dark:text-gray-200 transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
