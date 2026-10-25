"use client";

import React, { useState, useMemo } from "react";
import {
  InstagramTargetProfile,
  InstagramPostItem,
  SortOption,
  FilterMode,
  PostLimit,
  DateFilter,
} from "./types";
import { InstagramProfileHeader } from "./InstagramProfileHeader";
import { InstagramSortToolbar } from "./InstagramSortToolbar";
import { InstagramFeedGrid } from "./InstagramFeedGrid";
import { InstagramPostModal } from "./InstagramPostModal";
import { SortFeedFilterDropdown } from "./SortFeedFilterDropdown";
import { exportPostsToCSV, downloadBatchMediaAssets } from "./exportUtils";
import { BackButton } from "@/components/ui/BackButton";
import { Button } from "@/components/ui/Button";
import toast from "react-hot-toast";
import {
  Search,
  AlertCircle,
  SlidersHorizontal,
} from "lucide-react";

interface Props {
  onBackToPlatformHub: () => void;
  defaultUsername?: string;
  isAdmin?: boolean;
}

function isWithinDateFilter(timestamp: string, dateFilter: DateFilter): boolean {
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

export function InstagramResearchStudio({
  onBackToPlatformHub,
  defaultUsername = "creativemuslim.co",
}: Props) {
  const [usernameInput, setUsernameInput] = useState(defaultUsername);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStepText, setLoadingStepText] = useState("");
  const [loadingPercent, setLoadingPercent] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Clean initial state
  const [profile, setProfile] = useState<InstagramTargetProfile | null>(null);
  const [posts, setPosts] = useState<InstagramPostItem[]>([]);
  const [selectedPost, setSelectedPost] = useState<InstagramPostItem | null>(null);

  // Filter dropdown state for search box
  const [isSearchFilterOpen, setIsSearchFilterOpen] = useState(false);

  // Sorting & Filtering State
  const [filterMode, setFilterMode] = useState<FilterMode>("posts");
  const [postLimit, setPostLimit] = useState<PostLimit>(25);
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [sortOption, setSortOption] = useState<SortOption>("outlier");

  const isFilterCustomized =
    sortOption !== "outlier" ||
    (filterMode === "posts" && postLimit !== 25) ||
    filterMode === "date";

  // Function to execute research in 1 click
  const handleSearch = async (
    userToSearch: string,
    limitOverride?: PostLimit
  ) => {
    const clean = userToSearch.trim().replace(/^@/, "");
    if (!clean) return;

    const targetLimit = limitOverride ?? postLimit;
    const numericLimit =
      targetLimit === "all" ? 100 : Math.max(50, Number(targetLimit) || 50);

    setIsLoading(true);
    setError(null);
    setLoadingPercent(15);
    setLoadingStepText(`Mengambil profil @${clean} dari Instagram...`);

    const timer1 = setTimeout(() => {
      setLoadingPercent(45);
      setLoadingStepText("Menghitung baseline rata-rata views & interaksi...");
    }, 400);

    const timer2 = setTimeout(() => {
      setLoadingPercent(75);
      setLoadingStepText("Mengkalkulasi Outlier Score & ranking konten viral...");
    }, 850);

    const timer3 = setTimeout(() => {
      setLoadingPercent(95);
      setLoadingStepText("Menyusun data analitik profil & feed...");
    }, 1200);

    try {
      const res = await fetch("/api/ruang-riset/instagram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: clean,
          limit: numericLimit,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || "Gagal mengambil data akun");
      }

      setLoadingPercent(100);
      setLoadingStepText("Selesai 100%!");

      setTimeout(() => {
        setProfile(data.profile);
        setPosts(data.posts || []);
        setIsLoading(false);
      }, 250);
    } catch (err: any) {
      setError(err?.message || "Terjadi kesalahan saat memproses riset akun.");
      setProfile(null);
      setPosts([]);
      setIsLoading(false);
    } finally {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    }
  };

  const handleApplyFilters = () => {
    setIsSearchFilterOpen(false);
    if (profile && filterMode === "posts") {
      const needed = postLimit === "all" ? 100 : postLimit;
      if (posts.length < needed && profile.mediaCount > posts.length) {
        handleSearch(profile.username, postLimit);
      }
    }
  };

  // Selection Mode State (untuk Bulk Select Postingan)
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedPostIds, setSelectedPostIds] = useState<string[]>([]);

  // Reset all filters to default
  const handleResetFilters = () => {
    setFilterMode("posts");
    setPostLimit(25);
    setDateFilter("all");
    setSortOption("outlier");
    setSelectedPostIds([]);
  };

  const handleToggleSelect = (id: string) => {
    setSelectedPostIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedPostIds.length === filteredAndSortedPosts.length) {
      setSelectedPostIds([]);
    } else {
      setSelectedPostIds(filteredAndSortedPosts.map((p) => p.id));
    }
  };

  const handleClearSelection = () => {
    setSelectedPostIds([]);
  };

  // Filtered & Sorted Posts
  const filteredAndSortedPosts = useMemo(() => {
    let result = [...posts];

    if (filterMode === "date") {
      result = result.filter((p) => isWithinDateFilter(p.timestamp, dateFilter));
    }

    result.sort((a, b) => {
      switch (sortOption) {
        case "likes":
          return b.likesCount - a.likesCount;
        case "views":
          return b.viewsCount - a.viewsCount;
        case "outlier":
          return b.outlierScore - a.outlierScore;
        case "comments":
          return b.commentsCount - a.commentsCount;
        case "newest":
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        case "oldest":
          return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
        default:
          return b.outlierScore - a.outlierScore;
      }
    });

    if (filterMode === "posts" && postLimit !== "all") {
      result = result.slice(0, postLimit);
    }

    return result;
  }, [posts, sortOption, filterMode, postLimit, dateFilter]);

  const handleExportCSV = () => {
    if (!profile) return;
    const targetPosts =
      isSelectMode && selectedPostIds.length > 0
        ? filteredAndSortedPosts.filter((p) => selectedPostIds.includes(p.id))
        : filteredAndSortedPosts;

    exportPostsToCSV(targetPosts, profile);
    toast.success(`Berhasil mengekspor ${targetPosts.length} postingan ke CSV!`);
  };

  const handleDownloadMediaBatch = async () => {
    if (!profile) return;
    const targetPosts =
      isSelectMode && selectedPostIds.length > 0
        ? filteredAndSortedPosts.filter((p) => selectedPostIds.includes(p.id))
        : filteredAndSortedPosts;

    if (targetPosts.length === 0) {
      toast.error("Tidak ada postingan yang dipilih");
      return;
    }

    toast.loading(`Mengunduh ${targetPosts.length} file media postingan...`, {
      id: "batch-dl",
      duration: 2500,
    });

    await downloadBatchMediaAssets(targetPosts, profile.username);
    toast.success("Pengunduhan media selesai!", { id: "batch-dl" });
  };

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-300">
      {/* Top Navigation: Tombol Kembali Minimalis */}
      <div className="flex items-center justify-start">
        <BackButton onClick={onBackToPlatformHub} />
      </div>

      {/* Header */}
      <div className="flex flex-col items-center justify-center text-center gap-2 mb-8 md:mb-10">
        <div className="space-y-3 flex flex-col items-center">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 dark:text-white font-heading">
            Mau riset akun siapa?
          </h1>
          <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 max-w-xl mx-auto text-balance leading-relaxed">
            Ketik username Instagram akun rujukan atau kompetitor di niche kamu untuk menyortir konten dengan tayangan terbanyak dan Outlier Score tertinggi.
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
                placeholder="Ketik username (contoh: creativemuslim.co)"
                className="w-full pl-9 pr-12 py-3 text-sm font-medium rounded-xl bg-white dark:bg-[#141B31] border border-gray-200 dark:border-[#2C3246] text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rn-accent/20 focus:border-rn-accent transition-all shadow-xs"
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
              <SortFeedFilterDropdown
                isOpen={isSearchFilterOpen}
                onClose={() => setIsSearchFilterOpen(false)}
                onApply={handleApplyFilters}
                filterMode={filterMode}
                setFilterMode={setFilterMode}
                postLimit={postLimit}
                setPostLimit={setPostLimit}
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
              <span className="text-gray-600 dark:text-gray-300">{loadingStepText}</span>
              <span className={loadingPercent === 100 ? "text-emerald-500" : "text-orange-500"}>
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
          <p className="text-[11px] text-gray-400">
            Mengolah metrik performa, rata-rata penayangan, dan ranking konten
          </p>
        </div>
      )}

      {/* Error Notice */}
      {error && !isLoading && (
        <div className="max-w-2xl mx-auto p-4 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-300 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm font-semibold">{error}</p>
        </div>
      )}

      {/* Main Results View */}
      {!isLoading && profile && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* 1. Profile Header (Clean & Compact) */}
          <InstagramProfileHeader profile={profile} />

          {/* 2. Unified Galeri Feed & Toolbar Card (Menyambung Mulus Sesuai Referensi) */}
          <div className="w-full bg-white dark:bg-[#141B31] border border-gray-200/90 dark:border-[#2C3246] rounded-2xl shadow-xs overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
            <InstagramSortToolbar
              sortOption={sortOption}
              setSortOption={setSortOption}
              filterMode={filterMode}
              setFilterMode={setFilterMode}
              postLimit={postLimit}
              setPostLimit={setPostLimit}
              dateFilter={dateFilter}
              setDateFilter={setDateFilter}
              totalFiltered={filteredAndSortedPosts.length}
              totalCount={posts.length}
              onExport={handleExportCSV}
              onDownloadMedia={handleDownloadMediaBatch}
              onResetFilters={handleResetFilters}
              onApply={handleApplyFilters}
              isSelectMode={isSelectMode}
              setIsSelectMode={setIsSelectMode}
              selectedCount={selectedPostIds.length}
              onSelectAll={handleSelectAll}
              onClearSelection={handleClearSelection}
            />

            <InstagramFeedGrid
              posts={filteredAndSortedPosts}
              profile={profile}
              sortOption={sortOption}
              onSelectPost={(post) => setSelectedPost(post)}
              isSelectMode={isSelectMode}
              selectedIds={selectedPostIds}
              onToggleSelect={handleToggleSelect}
            />
          </div>

          {/* 3. Post Inspect Modal */}
          <InstagramPostModal
            post={selectedPost}
            profile={profile}
            onClose={() => setSelectedPost(null)}
          />
        </div>
      )}
    </div>
  );
}
