"use client";

import React, { useMemo } from "react";
import {
  InstagramTargetProfile,
  InstagramPostItem,
} from "./types";
import {
  X,
  Sparkles,
  Eye,
  Flame,
  Heart,
  TrendingUp,
  MessageSquare,
  Clock,
  Calendar,
  Layers,
  Film,
  Award,
  ChevronRight,
  ExternalLink,
  Zap,
  ArrowUpRight,
} from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  profile: InstagramTargetProfile;
  posts: InstagramPostItem[];
  onSelectPost?: (post: InstagramPostItem) => void;
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

export function InstagramDeepInsightModal({
  isOpen,
  onClose,
  profile,
  posts,
  onSelectPost,
  onApplySortEr,
}: Props) {
  if (!isOpen) return null;

  // Analitik Data Komprehensif
  const analytics = useMemo(() => {
    const list = posts || [];
    const totalPosts = list.length;

    // 1. Agregasi Metrik Utama
    const totalViews = list.reduce((sum, p) => sum + (p.viewsCount || 0), 0);
    const totalLikes = list.reduce((sum, p) => sum + (p.likesCount || 0), 0);
    const totalComments = list.reduce((sum, p) => sum + (p.commentsCount || 0), 0);

    const avgViews = totalPosts > 0 ? Math.round(totalViews / totalPosts) : profile.averageViews;
    const avgLikes = totalPosts > 0 ? Math.round(totalLikes / totalPosts) : profile.averageLikes;
    const avgComments = totalPosts > 0 ? Math.round(totalComments / totalPosts) : profile.averageComments;
    const avgEr =
      totalPosts > 0
        ? Number((list.reduce((sum, p) => sum + (p.engagementRate || 0), 0) / totalPosts).toFixed(1))
        : profile.averageEngagementRate;

    const maxOutlier =
      totalPosts > 0
        ? Math.max(...list.map((p) => p.outlierScore || 0), 1.0)
        : profile.topOutlierMultiplier;

    // Reach Ratio vs Followers
    const reachRatio =
      profile.followersCount > 0
        ? Math.round((avgViews / profile.followersCount) * 100)
        : 0;

    // 2. Juara ER
    const sortedByEr = [...list].sort((a, b) => (b.engagementRate || 0) - (a.engagementRate || 0));
    const topErPost = sortedByEr[0] || null;

    // 3. Format Battle (Carousel vs Reels vs Single Image)
    const carouselPosts = list.filter((p) => p.mediaType === "CAROUSEL_ALBUM");
    const reelsPosts = list.filter((p) => p.mediaType === "VIDEO");
    const imagePosts = list.filter((p) => p.mediaType === "IMAGE");

    const carouselAvgEr =
      carouselPosts.length > 0
        ? carouselPosts.reduce((s, p) => s + (p.engagementRate || 0), 0) / carouselPosts.length
        : 0;
    const reelsAvgEr =
      reelsPosts.length > 0
        ? reelsPosts.reduce((s, p) => s + (p.engagementRate || 0), 0) / reelsPosts.length
        : 0;

    const carouselAvgViews =
      carouselPosts.length > 0
        ? carouselPosts.reduce((s, p) => s + (p.viewsCount || 0), 0) / carouselPosts.length
        : 0;
    const reelsAvgViews =
      reelsPosts.length > 0
        ? reelsPosts.reduce((s, p) => s + (p.viewsCount || 0), 0) / reelsPosts.length
        : 0;

    let formatWinner = "Seimbang";
    let formatMultiplier = "1.0×";
    let isCarouselWinner = true;

    if (carouselAvgEr > 0 && reelsAvgEr > 0) {
      if (carouselAvgEr >= reelsAvgEr) {
        formatWinner = "Carousel";
        formatMultiplier = (carouselAvgEr / reelsAvgEr).toFixed(1) + "×";
        isCarouselWinner = true;
      } else {
        formatWinner = "Reels";
        formatMultiplier = (reelsAvgEr / carouselAvgEr).toFixed(1) + "×";
        isCarouselWinner = false;
      }
    } else if (carouselPosts.length > reelsPosts.length) {
      formatWinner = "Carousel";
      formatMultiplier = "Unggul";
      isCarouselWinner = true;
    } else {
      formatWinner = "Reels";
      formatMultiplier = "Unggul";
      isCarouselWinner = false;
    }

    const carouselPct = totalPosts > 0 ? Math.round((carouselPosts.length / totalPosts) * 100) : 50;
    const reelsPct = totalPosts > 0 ? Math.round((reelsPosts.length / totalPosts) * 100) : 50;

    // Slide Carousel Optimal
    const totalSlides = carouselPosts.reduce((sum, p) => sum + (p.carouselMedia?.length || 6), 0);
    const avgSlides = carouselPosts.length > 0 ? Math.round(totalSlides / carouselPosts.length) : 7;
    const optimalSlideRange = `${Math.max(4, avgSlides - 1)}–${avgSlides + 2} slide`;

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
      "Pagi (07:00–10:00)": 0,
      "Siang (11:30–14:00)": 0,
      "Sore (16:00–18:00)": 0,
      "Malam (19:00–21:30)": 0,
      "Malam Larut (22:00–00:00)": 0,
    };

    // Ambil top posts untuk menentukan waktu gacor
    const outlierPosts = list.filter((p) => (p.outlierScore || 0) >= 1.5);
    const timeTargetPosts = outlierPosts.length >= 3 ? outlierPosts : list.slice(0, 15);

    let earliestTime = Infinity;
    let latestTime = -Infinity;

    timeTargetPosts.forEach((p) => {
      if (!p.timestamp) return;
      const d = new Date(p.timestamp);
      const t = d.getTime();
      if (isNaN(t)) return;

      if (t < earliestTime) earliestTime = t;
      if (t > latestTime) latestTime = t;

      // Konversi ke UTC+7 (WIB)
      const utcHours = d.getUTCHours();
      const wibHour = (utcHours + 7) % 24;
      const wibDayIdx = (d.getUTCDay() + (utcHours + 7 >= 24 ? 1 : 0)) % 7;
      const dayName = dayNames[wibDayIdx];
      if (dayCounts[dayName] !== undefined) dayCounts[dayName]++;

      if (wibHour >= 7 && wibHour < 11) hourBuckets["Pagi (07:00–10:00)"]++;
      else if (wibHour >= 11 && wibHour < 15) hourBuckets["Siang (11:30–14:00)"]++;
      else if (wibHour >= 15 && wibHour < 19) hourBuckets["Sore (16:00–18:00)"]++;
      else if (wibHour >= 19 && wibHour < 22) hourBuckets["Malam (19:00–21:30)"]++;
      else hourBuckets["Malam Larut (22:00–00:00)"]++;
    });

    // Cari top 2 hari
    const sortedDays = Object.entries(dayCounts).sort((a, b) => b[1] - a[1]);
    const topDays =
      sortedDays[0] && sortedDays[0][1] > 0
        ? `${sortedDays[0][0]}${sortedDays[1] && sortedDays[1][1] > 0 ? " & " + sortedDays[1][0] : ""}`
        : "Selasa & Jumat";

    // Cari top jam
    const sortedHours = Object.entries(hourBuckets).sort((a, b) => b[1] - a[1]);
    const topHourLabel =
      sortedHours[0] && sortedHours[0][1] > 0
        ? sortedHours[0][0]
        : "Malam (19:00–21:30 WIB)";

    // Ritme upload per minggu
    let postsPerWeek = "3–5 post";
    if (earliestTime < latestTime && totalPosts >= 3) {
      const daysSpan = Math.max(1, (latestTime - earliestTime) / (1000 * 60 * 60 * 24));
      const weeksSpan = Math.max(0.5, daysSpan / 7);
      postsPerWeek = (totalPosts / weeksSpan).toFixed(1) + " post";
    }

    // 5. Indeks Algoritma & Hook Kata Kunci
    const commentToLikeRatio =
      totalLikes > 0 ? Number(((totalComments / totalLikes) * 100).toFixed(1)) : 0;

    let communityNote = "Diskusi Sehat & Positif";
    if (commentToLikeRatio >= 4.0) {
      communityNote = "Komunitas Sangat Loyal & Aktif Berdiskusi";
    } else if (commentToLikeRatio <= 1.0) {
      communityNote = "Interaksi Cepat (Penonton Scroll)";
    }

    // Ekstraksi Kata Kunci Viral
    const stopWords = new Set([
      "dan", "di", "ke", "dari", "yang", "ini", "itu", "untuk", "pada", "adalah",
      "dengan", "akan", "juga", "bisa", "ada", "karena", "kita", "kamu", "saya",
      "mereka", "sudah", "lagi", "mau", "hanya", "oleh", "saat", "the", "and", "to",
      "of", "in", "for", "a", "is", "that", "this"
    ]);

    const wordCounts: Record<string, number> = {};
    const topCandidatePosts = list.slice(0, 30);

    topCandidatePosts.forEach((p) => {
      const text = `${p.hookText || ""} ${p.caption || ""}`
        .toLowerCase()
        .replace(/https?:\/\/\S+/g, "")
        .replace(/[^\w\s#]/g, " ")
        .replace(/\s+/g, " ");

      const tokens = text.split(" ").filter((t) => t.length >= 3 && !stopWords.has(t));
      tokens.forEach((word) => {
        wordCounts[word] = (wordCounts[word] || 0) + 1;
      });
    });

    const popularKeywords = Object.entries(wordCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word]) => (word.startsWith("#") ? word : `"${word}"`));

    const finalKeywords =
      popularKeywords.length >= 2
        ? popularKeywords
        : ['"Rahasia"', '"Tips"', '"Jangan"', '#creator'];

    return {
      totalPosts,
      totalViews,
      totalLikes,
      totalComments,
      avgViews,
      avgLikes,
      avgComments,
      avgEr,
      maxOutlier,
      reachRatio,
      topErPost,
      formatWinner,
      formatMultiplier,
      isCarouselWinner,
      carouselPct,
      reelsPct,
      carouselCount: carouselPosts.length,
      reelsCount: reelsPosts.length,
      carouselAvgEr: carouselAvgEr.toFixed(1),
      reelsAvgEr: reelsAvgEr.toFixed(1),
      optimalSlideRange,
      topDays,
      topHourLabel,
      postsPerWeek,
      commentToLikeRatio,
      communityNote,
      finalKeywords,
    };
  }, [posts, profile]);

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-4xl max-h-[92vh] flex flex-col bg-white dark:bg-[#141B31] border border-gray-200 dark:border-[#2C3246] rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ===================================================================== */}
        {/* MODAL HEADER */}
        {/* ===================================================================== */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-gray-100 dark:border-[#2C3246] bg-gray-50/50 dark:bg-[#1A2238]/50 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full p-0.5 bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 shrink-0">
              <img
                src={profile.profilePicUrl}
                alt={profile.username}
                className="w-full h-full rounded-full object-cover border-2 border-white dark:border-[#141B31]"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-base sm:text-lg text-gray-900 dark:text-white truncate">
                  @{profile.username}
                </h3>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-gradient-to-r from-orange-500/15 to-amber-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/20">
                  <Sparkles className="w-3 h-3" />
                  <span>Insight Mendalam</span>
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                Analisa data komprehensif berdasarkan {analytics.totalPosts} postingan aktif
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

        {/* ===================================================================== */}
        {/* MODAL BODY (SCROLLABLE) */}
        {/* ===================================================================== */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 min-h-0">
          {/* 1. ROW METRIK PONDASI UTAMA (4 KARTU) */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Pondasi Performa Akun
              </h4>
              <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                Reach vs Followers: {analytics.reachRatio}%
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
                  Kelipatan rata-rata views
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
                  Interaksi penonton
                </p>
              </div>
            </div>
          </div>

          {/* 2. GRID 4 KARTU INSIGHT ANALITIK MENDALAM */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2.5">
              Strategi Konten & Algoritma Instagram
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {/* KARTU 1: KONTEN ER TERTINGGI & AKUMULASI */}
              <div className="p-4 rounded-2xl bg-white dark:bg-[#1A2238] border border-gray-200 dark:border-[#2C3246] shadow-xs flex flex-col justify-between space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/15 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold">
                      <Award className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-sm text-gray-900 dark:text-white">
                      Konten ER Tertinggi
                    </span>
                  </div>
                  {analytics.topErPost && (
                    <span className="px-2.5 py-1 rounded-full text-xs font-black bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      🏆 {analytics.topErPost.engagementRate.toFixed(1)}% ER
                    </span>
                  )}
                </div>

                {analytics.topErPost ? (
                  <div className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-50 dark:bg-[#141B31] border border-gray-100 dark:border-[#2C3246]/60">
                    <img
                      src={analytics.topErPost.thumbnailUrl}
                      alt={analytics.topErPost.hookText || "Top ER Post"}
                      className="w-14 h-14 rounded-lg object-cover shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-gray-900 dark:text-white line-clamp-1">
                        {analytics.topErPost.hookText || "Postingan Interaksi Tertinggi"}
                      </p>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">
                        {formatNumber(analytics.topErPost.likesCount)} likes •{" "}
                        {formatNumber(analytics.topErPost.commentsCount)} comments
                      </p>
                    </div>
                    {onSelectPost && (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onSelectPost(analytics.topErPost!);
                        }}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-orange-500 hover:bg-orange-600 text-white flex items-center gap-1 transition-all shrink-0 cursor-pointer shadow-xs"
                      >
                        <span>Buka</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400">Belum ada konten untuk dianalisis</p>
                )}

                <div className="pt-2 border-t border-gray-100 dark:border-[#2C3246] flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>Akumulasi: {formatNumber(analytics.totalViews)} Views</span>
                  <span>{analytics.totalPosts} Konten Aktif</span>
                </div>
              </div>

              {/* KARTU 2: FORMAT & DURASI JUARA */}
              <div className="p-4 rounded-2xl bg-white dark:bg-[#1A2238] border border-gray-200 dark:border-[#2C3246] shadow-xs flex flex-col justify-between space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-sky-500/15 flex items-center justify-center text-sky-600 dark:text-sky-400 font-bold">
                      <Layers className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-sm text-gray-900 dark:text-white">
                      Format & Durasi Juara
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-500/15 text-sky-600 dark:text-sky-400">
                    {analytics.formatWinner} {analytics.formatMultiplier}
                  </span>
                </div>

                {/* Progress Bar Visual Perbandingan */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
                      <Layers className="w-3 h-3 text-sky-500" />
                      <span>Carousel ({analytics.carouselCount})</span>
                    </span>
                    <span className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
                      <Film className="w-3 h-3 text-rose-500" />
                      <span>Reels ({analytics.reelsCount})</span>
                    </span>
                  </div>

                  <div className="w-full h-2.5 rounded-full bg-gray-100 dark:bg-white/5 overflow-hidden flex">
                    <div
                      className="bg-sky-500 h-full transition-all duration-300"
                      style={{ width: `${analytics.carouselPct}%` }}
                      title={`Carousel: ${analytics.carouselPct}%`}
                    />
                    <div
                      className="bg-rose-500 h-full transition-all duration-300"
                      style={{ width: `${analytics.reelsPct}%` }}
                      title={`Reels: ${analytics.reelsPct}%`}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-gray-400">
                    <span>Avg ER: {analytics.carouselAvgEr}%</span>
                    <span>Avg ER: {analytics.reelsAvgEr}%</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-100 dark:border-[#2C3246] flex items-center justify-between text-xs">
                  <span className="text-gray-500 dark:text-gray-400">
                    Slide Optimal: <strong className="text-gray-800 dark:text-gray-200">{analytics.optimalSlideRange}</strong>
                  </span>
                  <span className="text-gray-500 dark:text-gray-400">
                    Reels Gacor: <strong className="text-gray-800 dark:text-gray-200">18–35 dtk</strong>
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
                    Waktu & Ritme Upload
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs">
                    <Calendar className="w-4 h-4 text-amber-500 shrink-0" />
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Hari Paling Sering Viral: </span>
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
                  <span>Konsistensi Akun:</span>
                  <strong className="text-emerald-600 dark:text-emerald-400 font-bold">
                    {analytics.postsPerWeek} (Aktif)
                  </strong>
                </div>
              </div>

              {/* KARTU 4: INDEKS ALGORITMA & HOOK VIRAL */}
              <div className="p-4 rounded-2xl bg-white dark:bg-[#1A2238] border border-gray-200 dark:border-[#2C3246] shadow-xs flex flex-col justify-between space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-purple-500/15 flex items-center justify-center text-purple-600 dark:text-purple-400 font-bold">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-sm text-gray-900 dark:text-white">
                      Diskusi Komunitas & Hook
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-purple-500/15 text-purple-600 dark:text-purple-400">
                    Comment Ratio: {analytics.commentToLikeRatio}%
                  </span>
                </div>

                <div className="space-y-1.5">
                  <p className="text-xs text-gray-600 dark:text-gray-300">
                    {analytics.communityNote}
                  </p>

                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    <span className="text-[11px] text-gray-400">Kata Kunci Hook:</span>
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
                  Sinyal algoritma: Komentar panjang & interaksi save meningkatkan distribusi Reels.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ===================================================================== */}
        {/* MODAL FOOTER */}
        {/* ===================================================================== */}
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
              <span>Urutkan Feed Berdasarkan ER %</span>
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
