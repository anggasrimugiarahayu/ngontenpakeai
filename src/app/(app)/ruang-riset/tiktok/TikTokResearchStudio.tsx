"use client";

import React, { useState, useMemo } from "react";
import {
  TikTokUserProfile,
  TikTokPostItem,
  TikTokFormatFilter,
  TikTokSortOption,
  TikTokFilterMode,
  TikTokVideoLimit,
  TikTokDateFilter,
} from "./types";
import { TikTokProfileHeader } from "./TikTokProfileHeader";
import { TikTokSortToolbar } from "./TikTokSortToolbar";
import { TikTokFeedGrid } from "./TikTokFeedGrid";
import { TikTokVideoModal } from "./TikTokVideoModal";
import { TikTokSortFeedFilterDropdown } from "./TikTokSortFeedFilterDropdown";
import {
  TikTokCardFilterModal,
  TikTokAdvancedFilterState,
  DEFAULT_TIKTOK_ADVANCED_FILTER,
} from "./TikTokCardFilterModal";
import { downloadTikTokMediaBatch } from "./exportUtils";
import { BackButton } from "@/components/ui/BackButton";
import { Button } from "@/components/ui/Button";
import toast from "react-hot-toast";
import {
  Search,
  AlertCircle,
  SlidersHorizontal,
} from "lucide-react";

interface Props {
  onBackToHub: () => void;
  defaultUsername?: string;
  isAdmin?: boolean;
}

function isWithinDateFilter(
  timestamp: string,
  dateFilter: TikTokDateFilter
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

export function TikTokResearchStudio({
  onBackToHub,
  defaultUsername = "fadiljaidi",
}: Props) {
  const [usernameInput, setUsernameInput] = useState(defaultUsername);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStepText, setLoadingStepText] = useState("");
  const [loadingPercent, setLoadingPercent] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Profile and videos state
  const [profile, setProfile] = useState<TikTokUserProfile | null>(null);
  const [videos, setVideos] = useState<TikTokPostItem[]>([]);
  const [activeModalVideo, setActiveModalVideo] =
    useState<TikTokPostItem | null>(null);

  // Search input filter dropdown state
  const [isSearchFilterOpen, setIsSearchFilterOpen] = useState(false);

  // Filters & Sorting state (Identik dengan Riset YouTube & Instagram)
  const [filterMode, setFilterMode] = useState<TikTokFilterMode>("videos");
  const [formatFilter, setFormatFilter] = useState<TikTokFormatFilter>("videos");
  const [videoLimit, setVideoLimit] = useState<TikTokVideoLimit>("all");
  const [dateFilter, setDateFilter] = useState<TikTokDateFilter>("all");
  const [sortOption, setSortOption] = useState<TikTokSortOption>("outlier");
  const [advancedFilters, setAdvancedFilters] = useState<TikTokAdvancedFilterState>(
    DEFAULT_TIKTOK_ADVANCED_FILTER
  );

  // Multi-select state
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedVideoIds, setSelectedVideoIds] = useState<Set<string>>(new Set());

  // Filter modal state
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  const handleToggleSelectMode = () => {
    setIsSelectMode((prev) => {
      if (prev) {
        setSelectedVideoIds(new Set());
      }
      return !prev;
    });
  };

  const handleToggleSelectVideo = (videoId: string) => {
    setSelectedVideoIds((prev) => {
      const next = new Set(prev);
      if (next.has(videoId)) {
        next.delete(videoId);
      } else {
        next.add(videoId);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedVideoIds.size === filteredAndSortedVideos.length) {
      setSelectedVideoIds(new Set());
    } else {
      setSelectedVideoIds(new Set(filteredAndSortedVideos.map((v) => v.id)));
    }
  };

  const handleResetFilters = () => {
    setFilterMode("videos");
    setFormatFilter("videos");
    setVideoLimit("all");
    setDateFilter("all");
    setSortOption("outlier");
    setAdvancedFilters(DEFAULT_TIKTOK_ADVANCED_FILTER);
  };

  const isFilterCustomized =
    sortOption !== "outlier" ||
    (filterMode === "videos" && videoLimit !== "all") ||
    filterMode === "date" ||
    formatFilter !== "videos" ||
    advancedFilters.types.length > 0 ||
    advancedFilters.minVal !== null ||
    advancedFilters.maxVal !== null ||
    (advancedFilters.postedType === "in_last" && advancedFilters.inLastValue > 0) ||
    (advancedFilters.postedType === "between" && (Boolean(advancedFilters.startDate) || Boolean(advancedFilters.endDate)));

  const handleSearch = async (targetUsername?: string, forceRefresh = false) => {
    const handleToQuery = (targetUsername || usernameInput).replace(/^@/, "").trim();
    if (!handleToQuery) {
      toast.error("Masukkan username TikTok terlebih dahulu");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setLoadingPercent(15);
    setLoadingStepText(`Mengambil profil @${handleToQuery} dari TikTok...`);

    const timer1 = setTimeout(() => {
      setLoadingPercent(45);
      setLoadingStepText("Memproses feed Video & Photo Slide TikTok...");
    }, 400);

    const timer2 = setTimeout(() => {
      setLoadingPercent(75);
      setLoadingStepText("Menghitung baseline rata-rata views akun...");
    }, 900);

    const timer3 = setTimeout(() => {
      setLoadingPercent(95);
      setLoadingStepText("Mengkalkulasi Outlier Score & ranking konten viral...");
    }, 1350);

    try {
      const res = await fetch("/api/ruang-riset/tiktok", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: handleToQuery,
          forceRefresh,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal memuat data akun TikTok.");
      }

      setLoadingPercent(100);
      setLoadingStepText("Selesai 100%!");

      setTimeout(() => {
        setProfile(data.profile);
        setVideos(data.videos || []);
        setUsernameInput(data.profile?.username || handleToQuery);
        setIsLoading(false);
        toast.success(
          `Berhasil memuat riset @${data.profile?.username || handleToQuery}`
        );
      }, 250);
    } catch (err: any) {
      setErrorMsg(
        err.message || "Terjadi kesalahan saat mencari akun TikTok."
      );
      setProfile(null);
      setVideos([]);
      setIsLoading(false);
      toast.error(err.message || "Gagal mencari akun TikTok");
    } finally {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    }
  };

  const handleApplyFilters = () => {
    setIsSearchFilterOpen(false);
    toast.success("Filter berhasil diterapkan");
  };

  // 1. Base Search Videos (Filter Toolbar Format, Tanggal Search Box, Sort Awal, dan Limit)
  const baseSearchVideos = useMemo(() => {
    let result = [...videos];

    // 1. Filter Format Toolbar (Video vs Photo Slide)
    if (formatFilter === "videos") {
      result = result.filter((v) => !v.isPhoto);
    } else if (formatFilter === "photos") {
      result = result.filter((v) => v.isPhoto);
    }

    // 2. Filter Tanggal Search Box
    if (dateFilter !== "all") {
      result = result.filter((v) => isWithinDateFilter(v.timestamp, dateFilter));
    }

    // 3. Sort Awal
    result.sort((a, b) => {
      if (sortOption === "outlier") {
        return b.outlierScore - a.outlierScore;
      }
      if (sortOption === "views") {
        return b.viewsCount - a.viewsCount;
      }
      if (sortOption === "likes") {
        return b.likesCount - a.likesCount;
      }
      if (sortOption === "comments") {
        return b.commentsCount - a.commentsCount;
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

    // 4. Limit Konten Awal
    if (videoLimit !== "all") {
      result = result.slice(0, Number(videoLimit));
    }

    return result;
  }, [videos, formatFilter, dateFilter, sortOption, videoLimit]);

  // 2. Filtered & Sorted Videos (Menerapkan Filter Lanjutan dari Card Modal)
  const filteredAndSortedVideos = useMemo(() => {
    let result = [...baseSearchVideos];

    // Advanced Card Filters (Type, Performance Range, Posted Date)
    if (advancedFilters.types.length === 1) {
      if (advancedFilters.types.includes("videos")) {
        result = result.filter((v) => !v.isPhoto);
      } else if (advancedFilters.types.includes("photos")) {
        result = result.filter((v) => v.isPhoto);
      }
    }

    // Performance range
    if (advancedFilters.minVal !== null || advancedFilters.maxVal !== null) {
      result = result.filter((v) => {
        let val = 0;
        if (advancedFilters.metric === "views") val = v.viewsCount || 0;
        else if (advancedFilters.metric === "likes") val = v.likesCount || 0;
        else if (advancedFilters.metric === "comments") val = v.commentsCount || 0;
        else if (advancedFilters.metric === "outlier") val = v.outlierScore || 0;

        if (advancedFilters.minVal !== null && val < advancedFilters.minVal) return false;
        if (advancedFilters.maxVal !== null && val > advancedFilters.maxVal) return false;
        return true;
      });
    }

    // Posted date
    if (advancedFilters.postedType === "in_last" && advancedFilters.inLastValue > 0) {
      const mult =
        advancedFilters.inLastUnit === "days"
          ? 86400000
          : advancedFilters.inLastUnit === "weeks"
          ? 7 * 86400000
          : advancedFilters.inLastUnit === "months"
          ? 30 * 86400000
          : 365 * 86400000;
      const threshold = Date.now() - advancedFilters.inLastValue * mult;
      result = result.filter((v) => new Date(v.timestamp).getTime() >= threshold);
    } else if (advancedFilters.postedType === "between") {
      if (advancedFilters.startDate) {
        const start = new Date(advancedFilters.startDate).getTime();
        result = result.filter((v) => new Date(v.timestamp).getTime() >= start);
      }
      if (advancedFilters.endDate) {
        const end = new Date(advancedFilters.endDate).getTime() + 86400000;
        result = result.filter((v) => new Date(v.timestamp).getTime() <= end);
      }
    }

    return result;
  }, [baseSearchVideos, advancedFilters]);

  const targetVideosForExport = useMemo(() => {
    if (isSelectMode && selectedVideoIds.size > 0) {
      return filteredAndSortedVideos.filter((v) => selectedVideoIds.has(v.id));
    }
    return filteredAndSortedVideos;
  }, [filteredAndSortedVideos, isSelectMode, selectedVideoIds]);

  const handleDownloadMediaBatch = async () => {
    if (!profile) return;
    const targets = targetVideosForExport;

    if (targets.length === 0) {
      toast.error("Tidak ada konten untuk diunduh");
      return;
    }

    const toastId = "tt-zip-dl";
    toast.loading(`Menyiapkan ${targets.length} thumbnail & info ke dalam ZIP...`, {
      id: toastId,
    });

    try {
      const ok = await downloadTikTokMediaBatch(
        targets,
        profile,
        (curr, total) => {
          toast.loading(`Mengunduh file (${curr}/${total}) ke dalam ZIP...`, {
            id: toastId,
          });
        }
      );
      if (ok) {
        toast.success(`Berhasil mengunduh ${targets.length} file ZIP!`, {
          id: toastId,
        });
      } else {
        toast.error("Gagal mengunduh file ZIP", { id: toastId });
      }
    } catch (e) {
      console.error("Download ZIP error:", e);
      toast.error("Terjadi kesalahan saat mengunduh ZIP", { id: toastId });
    }
  };

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-300 pb-16">
      {/* Top Navigation: Tombol Kembali Minimalis */}
      <div className="flex items-center justify-start">
        <BackButton onClick={onBackToHub} />
      </div>

      {/* Header Terpusat & Elegan (Identik dengan Riset YouTube & Instagram) */}
      <div className="flex flex-col items-center justify-center text-center gap-2 mb-8 md:mb-10">
        <div className="space-y-3 flex flex-col items-center">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 dark:text-white font-heading">
            Mau riset akun TikTok siapa?
          </h1>
          <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 max-w-xl mx-auto text-balance leading-relaxed">
            Ketik username akun TikTok kompetitor di niche kamu untuk menyortir konten
            dengan tayangan terbanyak dan Outlier Score tertinggi.
          </p>
        </div>

        {/* Input Search Form: Bersih, dengan Icon Filter di Ujung Kanan Kolom Input */}
        <div className="w-full max-w-2xl mx-auto mt-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch(usernameInput);
            }}
            className="flex flex-col sm:flex-row items-stretch gap-2.5"
          >
            <div className="relative flex-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-sm text-gray-400 pointer-events-none">
                @
              </span>
              <input
                type="text"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder="Ketik username TikTok (contoh: fadiljaidi atau mrbeast)"
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

              {/* Dropdown Filter Anchored ke Kotak Search (Identik dengan YouTube & Instagram) */}
              <TikTokSortFeedFilterDropdown
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
              disabled={isLoading || !usernameInput.trim()}
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

      {/* Loading Progress Indicator (Identik dengan Riset YouTube & Instagram) */}
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
            <p className="font-bold">Gagal Mengambil Data Akun TikTok</p>
            <p className="mt-0.5 text-xs text-red-600 dark:text-red-300">
              {errorMsg}
            </p>
          </div>
        </div>
      )}

      {/* Profil Header & Feed Grid */}
      {profile && !isLoading && (
        <div className="space-y-6">
          <TikTokProfileHeader profile={profile} />

          {/* Unified Galeri Feed & Toolbar Card (Menyambung Mulus Sesuai Referensi IG & YT) */}
          <div className="w-full bg-white dark:bg-[#141B31] border border-gray-200/90 dark:border-[#2C3246] rounded-2xl shadow-xs overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
            <TikTokSortToolbar
              formatFilter={formatFilter}
              onFormatFilterChange={setFormatFilter}
              sortOption={sortOption}
              onSortOptionChange={setSortOption}
              videos={videos}
              profile={profile}
              totalFilteredCount={filteredAndSortedVideos.length}
              onDownloadMedia={handleDownloadMediaBatch}
              onResetFilters={handleResetFilters}
              isCustomized={isFilterCustomized}
              isSelectMode={isSelectMode}
              onToggleSelectMode={handleToggleSelectMode}
              selectedCount={selectedVideoIds.size}
              onSelectAll={handleSelectAll}
              onOpenFilterModal={() => setIsFilterModalOpen(true)}
              targetVideosForExport={targetVideosForExport}
              filterMode={filterMode}
              videoLimit={videoLimit}
              dateFilter={dateFilter}
            />

            <TikTokFeedGrid
              videos={filteredAndSortedVideos}
              onSelectVideo={setActiveModalVideo}
              isSelectMode={isSelectMode}
              selectedVideoIds={selectedVideoIds}
              onToggleSelectVideo={handleToggleSelectVideo}
            />
          </div>

          {/* Modal Filters Sesuai Image 2 (Hanya Untuk Card Toolbar) */}
          <TikTokCardFilterModal
            isOpen={isFilterModalOpen}
            onClose={() => setIsFilterModalOpen(false)}
            videos={baseSearchVideos}
            advancedFilters={advancedFilters}
            onApplyAdvancedFilters={(next) => setAdvancedFilters(next)}
            onResetAdvancedFilters={() => setAdvancedFilters(DEFAULT_TIKTOK_ADVANCED_FILTER)}
          />
        </div>
      )}

      {/* Video Modal Player & ATM Bridge */}
      {activeModalVideo && profile && (
        <TikTokVideoModal
          video={activeModalVideo}
          profile={profile}
          onClose={() => setActiveModalVideo(null)}
        />
      )}
    </div>
  );
}
