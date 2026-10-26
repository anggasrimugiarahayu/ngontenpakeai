"use client";

import React, { useState, useMemo } from "react";
import {
  YouTubeChannelProfile,
  YouTubeVideoItem,
  YouTubeFormatFilter,
  YouTubeSortOption,
  YouTubeFilterMode,
  YouTubeVideoLimit,
  YouTubeDateFilter,
} from "./types";
import { YouTubeProfileHeader } from "./YouTubeProfileHeader";
import { YouTubeSortToolbar } from "./YouTubeSortToolbar";
import { YouTubeFeedGrid } from "./YouTubeFeedGrid";
import { YouTubeVideoModal } from "./YouTubeVideoModal";
import { YouTubeSortFeedFilterDropdown } from "./YouTubeSortFeedFilterDropdown";
import { BackButton } from "@/components/ui/BackButton";
import { Button } from "@/components/ui/Button";
import toast from "react-hot-toast";
import {
  Search,
  AlertCircle,
  SlidersHorizontal,
  RefreshCw,
} from "lucide-react";

interface Props {
  onBackToHub: () => void;
  defaultChannel?: string;
  isAdmin?: boolean;
}

function isWithinDateFilter(
  timestamp: string,
  dateFilter: YouTubeDateFilter
): boolean {
  if (dateFilter === "all") return true;
  const postTime = new Date(timestamp).getTime();
  if (isNaN(postTime)) return true;
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  let days = Infinity;
  switch (dateFilter) {
    case "1w":
      days = 7;
      break;
    case "1m":
      days = 30;
      break;
    case "3m":
      days = 90;
      break;
    case "6m":
      days = 180;
      break;
    case "1y":
      days = 365;
      break;
  }
  return now - postTime <= days * dayMs;
}

export function YouTubeResearchStudio({
  onBackToHub,
  defaultChannel = "corbuzier",
}: Props) {
  const [channelInput, setChannelInput] = useState(defaultChannel);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStepText, setLoadingStepText] = useState("");
  const [loadingPercent, setLoadingPercent] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Profile and videos state
  const [profile, setProfile] = useState<YouTubeChannelProfile | null>(null);
  const [videos, setVideos] = useState<YouTubeVideoItem[]>([]);
  const [activeModalVideo, setActiveModalVideo] =
    useState<YouTubeVideoItem | null>(null);

  // Search input filter dropdown state
  const [isSearchFilterOpen, setIsSearchFilterOpen] = useState(false);

  // Filters & Sorting state (Identik dengan Riset Instagram)
  const [filterMode, setFilterMode] = useState<YouTubeFilterMode>("videos");
  const [formatFilter, setFormatFilter] = useState<YouTubeFormatFilter>("all");
  const [videoLimit, setVideoLimit] = useState<YouTubeVideoLimit>("all");
  const [dateFilter, setDateFilter] = useState<YouTubeDateFilter>("all");
  const [sortOption, setSortOption] = useState<YouTubeSortOption>("outlier");
  const [searchQuery, setSearchQuery] = useState("");

  const isFilterCustomized =
    sortOption !== "outlier" ||
    (filterMode === "videos" && videoLimit !== "all") ||
    filterMode === "date";

  const handleSearch = async (targetHandle?: string, forceRefresh = false) => {
    const handleToQuery = (targetHandle || channelInput).trim();
    if (!handleToQuery) {
      toast.error("Masukkan nama channel atau link YouTube terlebih dahulu");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setLoadingPercent(15);
    setLoadingStepText(`Mengambil profil ${handleToQuery} dari YouTube...`);

    const timer1 = setTimeout(() => {
      setLoadingPercent(45);
      setLoadingStepText("Memproses feed video reguler & YouTube Shorts...");
    }, 400);

    const timer2 = setTimeout(() => {
      setLoadingPercent(75);
      setLoadingStepText("Menghitung baseline rata-rata views channel...");
    }, 900);

    const timer3 = setTimeout(() => {
      setLoadingPercent(95);
      setLoadingStepText("Mengkalkulasi Outlier Score & ranking konten viral...");
    }, 1350);

    try {
      const res = await fetch("/api/ruang-riset/youtube", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel: handleToQuery,
          forceRefresh,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal memuat data channel YouTube.");
      }

      setLoadingPercent(100);
      setLoadingStepText("Selesai 100%!");

      setTimeout(() => {
        setProfile(data.profile);
        setVideos(data.videos || []);
        setChannelInput(data.profile?.customUrl || handleToQuery);
        setIsLoading(false);
        toast.success(
          `Berhasil memuat riset ${data.profile?.title || handleToQuery}`
        );
      }, 250);
    } catch (err: any) {
      setErrorMsg(
        err.message || "Terjadi kesalahan saat mencari channel YouTube."
      );
      setProfile(null);
      setVideos([]);
      setIsLoading(false);
      toast.error(err.message || "Gagal mencari channel");
    } finally {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    }
  };

  const handleResetFilters = () => {
    setFilterMode("videos");
    setVideoLimit("all");
    setDateFilter("all");
    setSortOption("outlier");
    setIsSearchFilterOpen(false);
    toast.success("Filter telah direset ke default");
  };

  const handleApplyFilters = () => {
    setIsSearchFilterOpen(false);
    toast.success("Filter berhasil diterapkan");
  };

  // Client-side filtering & sorting via useMemo (Instant 0ms UX)
  const filteredAndSortedVideos = useMemo(() => {
    let result = [...videos];

    // 1. Filter Format (Shorts vs Video Reguler dari toolbar)
    if (formatFilter === "shorts") {
      result = result.filter((v) => v.isShorts);
    } else if (formatFilter === "videos") {
      result = result.filter((v) => !v.isShorts);
    }

    // 2. Filter Tanggal
    if (dateFilter !== "all") {
      result = result.filter((v) => isWithinDateFilter(v.timestamp, dateFilter));
    }

    // 3. Filter Title Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((v) => v.title.toLowerCase().includes(q));
    }

    // 4. Sort
    result.sort((a, b) => {
      if (sortOption === "outlier") {
        return b.outlierScore - a.outlierScore;
      }
      if (sortOption === "views" || sortOption === "likes") {
        return b.viewsCount - a.viewsCount;
      }
      if (sortOption === "oldest") {
        return (
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
      }
      if (sortOption === "newest") {
        return (
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
      }
      return 0;
    });

    // 5. Limit Konten
    if (videoLimit !== "all") {
      result = result.slice(0, Number(videoLimit));
    }

    return result;
  }, [videos, formatFilter, dateFilter, searchQuery, sortOption, videoLimit]);

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-300 pb-16">
      {/* Top Navigation: Tombol Kembali Minimalis */}
      <div className="flex items-center justify-between">
        <BackButton onClick={onBackToHub} />

        {profile && (
          <button
            onClick={() => handleSearch(profile.customUrl, true)}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-[#2C3246] text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#141B31] transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${
                isLoading ? "animate-spin text-rn-accent" : ""
              }`}
            />
            <span>Segarkan Data</span>
          </button>
        )}
      </div>

      {/* Header Terpusat & Elegan (Identik dengan Riset Instagram) */}
      <div className="flex flex-col items-center justify-center text-center gap-2 mb-8 md:mb-10">
        <div className="space-y-3 flex flex-col items-center">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 dark:text-white font-heading">
            Mau riset channel siapa?
          </h1>
          <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 max-w-xl mx-auto text-balance leading-relaxed">
            Ketik nama channel atau handle YouTube kompetitor di niche kamu
            untuk menyortir konten dengan tayangan terbanyak dan Outlier Score
            tertinggi.
          </p>
        </div>

        {/* Input Search Form: Bersih, dengan Icon Filter di Ujung Kanan Kolom Input */}
        <div className="w-full max-w-2xl mx-auto mt-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch(channelInput);
            }}
            className="flex flex-col sm:flex-row items-stretch gap-2.5"
          >
            <div className="relative flex-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-sm text-gray-400 pointer-events-none">
                @
              </span>
              <input
                type="text"
                value={channelInput}
                onChange={(e) => setChannelInput(e.target.value)}
                placeholder="Ketik handle atau nama channel (contoh: corbuzier atau kokbisa)"
                disabled={isLoading}
                className="w-full pl-9 pr-12 py-3 text-sm font-medium rounded-xl bg-white dark:bg-[#141B31] border border-gray-200 dark:border-[#2C3246] text-gray-900 dark:text-white placeholder-gray-400 focus:outline-hidden focus:ring-2 focus:ring-rn-accent/20 focus:border-rn-accent transition-all shadow-xs"
              />

              {/* Icon Filter di Ujung Kanan Dalam Kotak Search */}
              <button
                type="button"
                onClick={() => setIsSearchFilterOpen((prev) => !prev)}
                title="Atur Filter & Urutan"
                className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-colors cursor-pointer ${
                  isFilterCustomized
                    ? "text-rn-accent bg-orange-500/10 hover:bg-orange-500/20"
                    : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5"
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                {isFilterCustomized && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-orange-500" />
                )}
              </button>

              {/* Dropdown Filter Anchored ke Kotak Search (Identik dengan Instagram) */}
              <YouTubeSortFeedFilterDropdown
                isOpen={isSearchFilterOpen}
                onClose={() => setIsSearchFilterOpen(false)}
                onApply={handleApplyFilters}
                filterMode={filterMode}
                setFilterMode={setFilterMode}
                videoLimit={videoLimit}
                setVideoLimit={setVideoLimit}
                dateFilter={dateFilter}
                setDateFilter={setDateFilter}
                sortOption={sortOption}
                setSortOption={setSortOption}
                onReset={handleResetFilters}
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading || !channelInput.trim()}
              isLoading={isLoading}
              loadingText="Menganalisis..."
              icon={<Search className="w-4 h-4" />}
              size="lg"
              className="shrink-0"
            >
              Riset Konten
            </Button>
          </form>
        </div>
      </div>

      {/* Loading Progress Indicator (Identik dengan Riset Instagram) */}
      {isLoading && (
        <div className="w-full p-6 sm:p-8 bg-white dark:bg-[#141B31] rounded-2xl border border-gray-200 dark:border-[#2C3246] shadow-sm text-center space-y-4 animate-in fade-in duration-200 max-w-2xl mx-auto">
          <div className="w-10 h-10 rounded-full border-3 border-orange-500 border-t-transparent animate-spin mx-auto" />
          <div className="space-y-1.5 max-w-md mx-auto">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-gray-600 dark:text-gray-300">
                {loadingStepText}
              </span>
              <span
                className={
                  loadingPercent === 100
                    ? "text-emerald-500"
                    : "text-orange-500"
                }
              >
                {loadingPercent}%
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-gray-100 dark:bg-white/5 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  loadingPercent === 100 ? "bg-emerald-500" : "bg-orange-500"
                }`}
                style={{ width: `${loadingPercent}%` }}
              />
            </div>
          </div>
          <p className="text-xs text-gray-400">
            Menganalisis rasio tayangan video dan Outlier Score secara live...
          </p>
        </div>
      )}

      {/* Error Message */}
      {errorMsg && !isLoading && (
        <div className="max-w-2xl mx-auto p-4 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 text-red-700 dark:text-red-400 text-xs sm:text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-500" />
          <div>
            <p className="font-bold">Gagal Mengambil Data Channel</p>
            <p className="mt-0.5 text-xs text-red-600 dark:text-red-300">
              {errorMsg}
            </p>
          </div>
        </div>
      )}

      {/* Profil Header & Feed Grid */}
      {profile && !isLoading && (
        <div className="space-y-6">
          <YouTubeProfileHeader profile={profile} />

          {/* Unified Galeri Feed & Toolbar Card (Menyambung Mulus Sesuai Referensi IG) */}
          <div className="w-full bg-white dark:bg-[#141B31] border border-gray-200/90 dark:border-[#2C3246] rounded-2xl shadow-xs overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
            <YouTubeSortToolbar
              formatFilter={formatFilter}
              onFormatFilterChange={setFormatFilter}
              sortOption={sortOption}
              onSortOptionChange={setSortOption}
              searchQuery={searchQuery}
              onSearchQueryChange={setSearchQuery}
              videos={videos}
              profile={profile}
              totalFilteredCount={filteredAndSortedVideos.length}
            />

            <div className="p-4 sm:p-5">
              <YouTubeFeedGrid
                videos={filteredAndSortedVideos}
                onSelectVideo={setActiveModalVideo}
              />
            </div>
          </div>
        </div>
      )}

      {/* Video Modal Player & ATM Bridge */}
      {activeModalVideo && profile && (
        <YouTubeVideoModal
          video={activeModalVideo}
          profile={profile}
          onClose={() => setActiveModalVideo(null)}
        />
      )}
    </div>
  );
}
