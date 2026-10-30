"use client";

import React, { useState, useMemo } from "react";
import {
  FacebookUserProfile,
  FacebookPostItem,
  FacebookFormatFilter,
  FacebookSortOption,
  FacebookFilterMode,
  FacebookVideoLimit,
  FacebookDateFilter,
} from "./types";
import { FacebookProfileHeader } from "./FacebookProfileHeader";
import { FacebookSortToolbar } from "./FacebookSortToolbar";
import { FacebookFeedGrid } from "./FacebookFeedGrid";
import { FacebookPostModal } from "./FacebookPostModal";
import { FacebookDeepInsightModal } from "./FacebookDeepInsightModal";
import { FacebookSortFeedFilterDropdown } from "./FacebookSortFeedFilterDropdown";
import {
  FacebookCardFilterModal,
  FacebookAdvancedFilterState,
  DEFAULT_FACEBOOK_ADVANCED_FILTER,
} from "./FacebookCardFilterModal";
import { downloadFacebookMediaBatch } from "./exportUtils";
import {
  saveRisetSessionCache,
  loadRisetSessionCache,
} from "../risetCacheUtils";
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
  dateFilter: FacebookDateFilter
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

export function FacebookResearchStudio({
  onBackToHub,
  defaultUsername = "RaffiAhmadLagi",
}: Props) {
  const [usernameInput, setUsernameInput] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const cached = loadRisetSessionCache<FacebookUserProfile, FacebookPostItem>("facebook");
      if (cached?.username) return cached.username;
    }
    return defaultUsername;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStepText, setLoadingStepText] = useState("");
  const [loadingPercent, setLoadingPercent] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Profile and posts state with SWR / Session Cache support
  const [profile, setProfile] = useState<FacebookUserProfile | null>(() => {
    if (typeof window !== "undefined") {
      const cached = loadRisetSessionCache<FacebookUserProfile, FacebookPostItem>("facebook");
      return cached?.profile || null;
    }
    return null;
  });
  const [posts, setPosts] = useState<FacebookPostItem[]>(() => {
    if (typeof window !== "undefined") {
      const cached = loadRisetSessionCache<FacebookUserProfile, FacebookPostItem>("facebook");
      return cached?.items || [];
    }
    return [];
  });
  const [activeModalPost, setActiveModalPost] =
    useState<FacebookPostItem | null>(null);

  // Search input filter dropdown state
  const [isSearchFilterOpen, setIsSearchFilterOpen] = useState(false);

  // Filters & Sorting state (Identik dengan Riset TikTok, YouTube & Instagram)
  const [filterMode, setFilterMode] = useState<FacebookFilterMode>("videos");
  const [formatFilter, setFormatFilter] = useState<FacebookFormatFilter>("videos");
  const [videoLimit, setVideoLimit] = useState<FacebookVideoLimit>("all");
  const [dateFilter, setDateFilter] = useState<FacebookDateFilter>("all");
  const [sortOption, setSortOption] = useState<FacebookSortOption>("likes");
  const [advancedFilters, setAdvancedFilters] = useState<FacebookAdvancedFilterState>(
    DEFAULT_FACEBOOK_ADVANCED_FILTER
  );

  // Multi-select state
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedPostIds, setSelectedPostIds] = useState<Set<string>>(new Set());

  // Filter modal state
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isInsightModalOpen, setIsInsightModalOpen] = useState(false);

  const handleToggleSelectMode = () => {
    setIsSelectMode((prev) => {
      if (prev) {
        setSelectedPostIds(new Set());
      }
      return !prev;
    });
  };

  const handleToggleSelectPost = (postId: string) => {
    setSelectedPostIds((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) {
        next.delete(postId);
      } else {
        next.add(postId);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedPostIds.size === filteredAndSortedPosts.length) {
      setSelectedPostIds(new Set());
    } else {
      setSelectedPostIds(new Set(filteredAndSortedPosts.map((v) => v.id)));
    }
  };

  const handleResetFilters = () => {
    setFilterMode("videos");
    setFormatFilter("videos");
    setVideoLimit("all");
    setDateFilter("all");
    setSortOption("likes");
    setAdvancedFilters(DEFAULT_FACEBOOK_ADVANCED_FILTER);
  };

  const isFilterCustomized =
    sortOption !== "likes" ||
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
      toast.error("Masukkan username atau link Facebook terlebih dahulu");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setLoadingPercent(15);
    setLoadingStepText(`Mengambil profil @${handleToQuery} dari Facebook...`);

    const timer1 = setTimeout(() => {
      setLoadingPercent(45);
      setLoadingStepText("Memproses feed Reels, Video & Foto Facebook...");
    }, 450);

    const timer2 = setTimeout(() => {
      setLoadingPercent(75);
      setLoadingStepText("Menghitung baseline rata-rata interaksi & tayangan...");
    }, 950);

    const timer3 = setTimeout(() => {
      setLoadingPercent(95);
      setLoadingStepText("Mengkalkulasi Outlier Score & ranking konten viral...");
    }, 1400);

    try {
      const res = await fetch("/api/ruang-riset/facebook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: handleToQuery,
          forceRefresh,
        }),
      });

      const rawText = await res.text();
      let data: any = {};
      try {
        data = rawText ? JSON.parse(rawText) : {};
      } catch {
        throw new Error(
          `Gagal memproses respons server Facebook (HTTP ${res.status}). Silakan coba lagi.`
        );
      }

      if (!res.ok) {
        throw new Error(data.error || "Gagal memuat data akun Facebook.");
      }

      setLoadingPercent(100);
      setLoadingStepText("Selesai 100%!");

      setTimeout(() => {
        const fetchedPosts: FacebookPostItem[] = data.posts || [];
        const hasVideos = fetchedPosts.some((p) => !p.isPhoto);
        const hasPhotos = fetchedPosts.some((p) => p.isPhoto);

        // Jika akun hanya punya foto (tidak ada video), otomatis pindah ke tab Foto agar langsung tampil
        if (!hasVideos && hasPhotos) {
          setFormatFilter("photos");
        } else {
          setFormatFilter("videos");
        }

        setProfile(data.profile);
        setPosts(fetchedPosts);
        saveRisetSessionCache("facebook", data.profile?.username || handleToQuery, data.profile, fetchedPosts);
        setUsernameInput(data.profile?.username || handleToQuery);
        setIsLoading(false);
        toast.success(
          `Berhasil memuat riset @${data.profile?.username || handleToQuery}`
        );
      }, 250);
    } catch (err: any) {
      setErrorMsg(
        err.message || "Terjadi kesalahan saat mencari akun Facebook."
      );
      setProfile(null);
      setPosts([]);
      setIsLoading(false);
      toast.error(err.message || "Gagal mencari akun Facebook");
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

  // 1. Base Search Posts (Filter Toolbar Format, Tanggal Search Box, Sort Awal, dan Limit)
  const baseSearchPosts = useMemo(() => {
    let result = [...posts];

    // 1. Filter Format Toolbar (Reels & Video vs Foto)
    if (formatFilter === "videos") {
      result = result.filter((v) => !v.isPhoto);
    } else if (formatFilter === "photos") {
      result = result.filter((v) => v.isPhoto);
    }

    // 2. Filter Berdasarkan Mode Aktif (Posts Limit vs Date Range)
    if (filterMode === "date") {
      if (dateFilter !== "all") {
        result = result.filter((v) => isWithinDateFilter(v.timestamp, dateFilter));
      }
    } else if (filterMode === "videos" && videoLimit !== "all") {
      result.sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      result = result.slice(0, Number(videoLimit));
    }

    // 3. Sort Sesuai Pilihan User (Likes, Views, Outlier, Shares, Comments, Oldest, Newest)
    result.sort((a, b) => {
      if (sortOption === "likes") {
        return b.likesCount - a.likesCount;
      }
      if (sortOption === "views") {
        return b.viewsCount - a.viewsCount;
      }
      if (sortOption === "outlier") {
        return b.outlierScore - a.outlierScore;
      }
      if (sortOption === "shares") {
        return (b.sharesCount || 0) - (a.sharesCount || 0);
      }
      if (sortOption === "comments") {
        return b.commentsCount - a.commentsCount;
      }
      if (sortOption === "er") {
        return (b.engagementRate || 0) - (a.engagementRate || 0);
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

    return result;
  }, [posts, formatFilter, filterMode, dateFilter, sortOption, videoLimit]);

  // 2. Filtered & Sorted Posts (Menerapkan Filter Lanjutan dari Card Modal)
  const filteredAndSortedPosts = useMemo(() => {
    let result = [...baseSearchPosts];

    if (advancedFilters.types.length === 1) {
      if (advancedFilters.types.includes("videos")) {
        result = result.filter((v) => !v.isPhoto);
      } else if (advancedFilters.types.includes("photos")) {
        result = result.filter((v) => v.isPhoto);
      }
    }

    if (advancedFilters.minVal !== null || advancedFilters.maxVal !== null) {
      result = result.filter((v) => {
        let val = 0;
        if (advancedFilters.metric === "views") val = v.viewsCount || 0;
        else if (advancedFilters.metric === "likes") val = v.likesCount || 0;
        else if (advancedFilters.metric === "comments") val = v.commentsCount || 0;
        else if (advancedFilters.metric === "shares") val = v.sharesCount || 0;
        else if (advancedFilters.metric === "outlier") val = v.outlierScore || 0;

        if (advancedFilters.minVal !== null && val < advancedFilters.minVal) return false;
        if (advancedFilters.maxVal !== null && val > advancedFilters.maxVal) return false;
        return true;
      });
    }

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
  }, [baseSearchPosts, advancedFilters]);

  const targetPostsForExport = useMemo(() => {
    if (isSelectMode && selectedPostIds.size > 0) {
      return filteredAndSortedPosts.filter((v) => selectedPostIds.has(v.id));
    }
    return filteredAndSortedPosts;
  }, [filteredAndSortedPosts, isSelectMode, selectedPostIds]);

  const handleDownloadMediaBatch = async () => {
    if (!profile) return;
    const targets = targetPostsForExport;

    if (targets.length === 0) {
      toast.error("Tidak ada konten untuk diunduh");
      return;
    }

    const toastId = "fb-zip-dl";
    toast.loading(`Menyiapkan ${targets.length} thumbnail & info ke dalam ZIP...`, {
      id: toastId,
    });

    try {
      const ok = await downloadFacebookMediaBatch(
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

      {/* Header Terpusat & Elegan (Identik dengan Riset TikTok, YouTube & Instagram) */}
      <div className="flex flex-col items-center justify-center text-center gap-2 mb-8 md:mb-10">
        <div className="space-y-3 flex flex-col items-center">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 dark:text-white font-heading">
            Mau riset akun Facebook siapa?
          </h1>
          <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 max-w-xl mx-auto text-balance leading-relaxed">
            Ketik username halaman/kreator Facebook di niche kamu untuk menyortir Reels,
            Video & Foto dengan interaksi tertinggi dan Outlier Score terbaik.
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
                placeholder="Ketik username Facebook (contoh: RaffiAhmadLagi atau DeddyCorbuzier)"
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

              {/* Dropdown Filter Anchored ke Kotak Search */}
              <FacebookSortFeedFilterDropdown
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

      {/* Loading Progress Indicator */}
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
            Menganalisis interaksi Reels, Video & Foto serta Outlier Score secara live...
          </p>
        </div>
      )}

      {/* Error Message */}
      {errorMsg && !isLoading && (
        <div className="max-w-2xl mx-auto p-4 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 text-red-700 dark:text-red-400 text-xs sm:text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-500" />
          <div>
            <p className="font-bold">Gagal Mengambil Data Akun Facebook</p>
            <p className="mt-0.5 text-xs text-red-600 dark:text-red-300">
              {errorMsg}
            </p>
          </div>
        </div>
      )}

      {/* Profil Header & Feed Grid */}
      {profile && !isLoading && (
        <div className="space-y-6">
          <FacebookProfileHeader
            profile={profile}
            onOpenInsights={() => setIsInsightModalOpen(true)}
          />

          {/* Unified Galeri Feed & Toolbar Card */}
          <div className="w-full bg-white dark:bg-[#141B31] border border-gray-200/90 dark:border-[#2C3246] rounded-2xl shadow-xs overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
            <FacebookSortToolbar
              formatFilter={formatFilter}
              onFormatFilterChange={setFormatFilter}
              sortOption={sortOption}
              onSortOptionChange={setSortOption}
              posts={posts}
              profile={profile}
              totalFilteredCount={filteredAndSortedPosts.length}
              onDownloadMedia={handleDownloadMediaBatch}
              onResetFilters={handleResetFilters}
              isCustomized={isFilterCustomized}
              isSelectMode={isSelectMode}
              onToggleSelectMode={handleToggleSelectMode}
              selectedCount={selectedPostIds.size}
              onSelectAll={handleSelectAll}
              onOpenFilterModal={() => setIsFilterModalOpen(true)}
              targetPostsForExport={targetPostsForExport}
              filterMode={filterMode}
              videoLimit={videoLimit}
              dateFilter={dateFilter}
              onOpenInsights={() => setIsInsightModalOpen(true)}
            />

            <FacebookFeedGrid
              posts={filteredAndSortedPosts}
              profile={profile}
              sortOption={sortOption}
              onSelectPost={setActiveModalPost}
              isSelectMode={isSelectMode}
              selectedPostIds={selectedPostIds}
              onToggleSelectPost={handleToggleSelectPost}
            />
          </div>

          {/* Modal Insight Mendalam */}
          <FacebookDeepInsightModal
            isOpen={isInsightModalOpen}
            onClose={() => setIsInsightModalOpen(false)}
            profile={profile}
            posts={posts}
            onSelectPost={setActiveModalPost}
            onApplySortEr={() => setSortOption("er")}
          />

          {/* Modal Filters (Hanya Untuk Card Toolbar) */}
          <FacebookCardFilterModal
            isOpen={isFilterModalOpen}
            onClose={() => setIsFilterModalOpen(false)}
            posts={baseSearchPosts}
            advancedFilters={advancedFilters}
            onApplyAdvancedFilters={(next) => setAdvancedFilters(next)}
            onResetAdvancedFilters={() => setAdvancedFilters(DEFAULT_FACEBOOK_ADVANCED_FILTER)}
          />
        </div>
      )}

      {/* Post Modal Player & ATM Bridge */}
      {activeModalPost && profile && (
        <FacebookPostModal
          post={activeModalPost}
          profile={profile}
          onClose={() => setActiveModalPost(null)}
        />
      )}
    </div>
  );
}
