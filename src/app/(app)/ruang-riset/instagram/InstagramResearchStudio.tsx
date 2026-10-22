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
import { exportPostsToCSV } from "./exportUtils";
import { BackButton } from "@/components/ui/BackButton";
import {
  Search,
  AlertCircle,
  Loader2,
  SlidersHorizontal,
} from "lucide-react";

interface Props {
  onBackToPlatformHub: () => void;
  defaultUsername?: string;
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
  defaultUsername = "papamenyapa",
}: Props) {
  const [usernameInput, setUsernameInput] = useState(defaultUsername);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStepText, setLoadingStepText] = useState("");
  const [loadingPercent, setLoadingPercent] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Clean initial state: profile & posts are null/empty until user triggers search
  const [profile, setProfile] = useState<InstagramTargetProfile | null>(null);
  const [posts, setPosts] = useState<InstagramPostItem[]>([]);
  const [selectedPost, setSelectedPost] = useState<InstagramPostItem | null>(null);

  // Gallery hidden initially until user selects & applies Filter & Sort
  const [hasAppliedFilter, setHasAppliedFilter] = useState(false);

  // Sorting & Filtering State (SortFeed UX)
  const [filterMode, setFilterMode] = useState<FilterMode>("posts");
  const [postLimit, setPostLimit] = useState<PostLimit>(25);
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [sortOption, setSortOption] = useState<SortOption>("likes");

  // Function to execute research
  const handleSearch = async (userToSearch: string) => {
    const clean = userToSearch.trim().replace(/^@/, "");
    if (!clean) return;

    setIsLoading(true);
    setError(null);
    setHasAppliedFilter(false); // Reset gallery view until user clicks Filters & Sort
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
      setLoadingStepText("Menyusun data analitik profil...");
    }, 1200);

    try {
      const res = await fetch("/api/ruang-riset/instagram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: clean }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || "Gagal mengambil data akun");
      }

      setLoadingPercent(100);
      setLoadingStepText("Selesai 100%!");

      setTimeout(() => {
        setProfile(data.profile);
        setPosts(data.posts);
        setIsLoading(false);
      }, 350);
    } catch (err: any) {
      setError(err?.message || "Terjadi kesalahan saat memproses riset akun.");
      setIsLoading(false);
    } finally {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    }
  };

  // Reset all filters to default
  const handleResetFilters = () => {
    setFilterMode("posts");
    setPostLimit(25);
    setDateFilter("all");
    setSortOption("likes");
  };

  // Filtered & Sorted Posts with SortFeed Logic
  const filteredAndSortedPosts = useMemo(() => {
    let result = [...posts];

    // 1. Date Filter (if Filter Mode is 'date')
    if (filterMode === "date") {
      result = result.filter((p) => isWithinDateFilter(p.timestamp, dateFilter));
    }

    // 2. Sorting (Strict numeric sort)
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
          return b.likesCount - a.likesCount;
      }
    });

    // 3. Post Count Limit (if Filter Mode is 'posts')
    if (filterMode === "posts" && postLimit !== "all") {
      result = result.slice(0, postLimit);
    }

    return result;
  }, [posts, sortOption, filterMode, postLimit, dateFilter]);

  const handleExportCSV = () => {
    if (!profile) return;
    exportPostsToCSV(filteredAndSortedPosts, profile);
  };

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-300">
      {/* Top Navigation: Tombol Kembali Minimalis */}
      <div className="flex items-center justify-start">
        <BackButton onClick={onBackToPlatformHub} />
      </div>

      {/* Header - EXACT SAME CLEAN STYLE, FONT, & SPACING AS RUANG NGONTEN / RUANG BELAJAR */}
      <div className="flex flex-col items-center justify-center text-center gap-2 mb-8 md:mb-10">
        <div className="space-y-3 flex flex-col items-center">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 dark:text-white font-heading">
            Mau riset akun siapa?
          </h1>
          <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 max-w-xl mx-auto text-balance leading-relaxed">
            Ketik username Instagram akun rujukan atau kompetitor di niche kamu untuk menyortir konten dengan tayangan terbanyak dan Outlier Score tertinggi.
          </p>
        </div>

        {/* Input Search Form Standar */}
        <div className="w-full max-w-2xl mx-auto mt-6 space-y-3">
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
                placeholder="Ketik username (contoh: papamenyapa)"
                className="w-full pl-9 pr-4 py-3 text-sm font-medium rounded-xl bg-white dark:bg-[#141B31] border border-gray-200 dark:border-[#2C3246] text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rn-accent/20 focus:border-rn-accent transition-all shadow-xs"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !usernameInput.trim()}
              className="px-6 py-3 rounded-xl bg-[#f97316] hover:bg-[#ea580c] dark:bg-[#f97316] dark:hover:bg-[#fb923c] text-white font-bold text-sm shadow-sm shadow-orange-500/20 transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 shrink-0"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menganalisis...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Riset Konten</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Suggestion Chips */}
          <div className="flex items-center justify-center gap-2 flex-wrap text-xs pt-1">
            <span className="text-gray-400 font-medium">Contoh Akun:</span>
            {["papamenyapa", "ruangcreativemuslim", "ayutingting92", "dr.tirta"].map((acc) => (
              <button
                key={acc}
                type="button"
                onClick={() => {
                  setUsernameInput(acc);
                  handleSearch(acc);
                }}
                className="px-2.5 py-1 rounded-lg bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 dark:bg-[#141B31] dark:hover:bg-[#1f2947] dark:border-[#2C3246] dark:text-gray-200 font-bold transition-colors cursor-pointer"
              >
                @{acc}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Loading Progress Indicator (Selesai 100%) */}
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
            {/* Progress bar line */}
            <div className="w-full h-2 rounded-full bg-gray-100 dark:bg-white/5 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  loadingPercent === 100
                    ? "bg-emerald-500"
                    : "bg-orange-500"
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

      {/* Main Results View (Hanya Muncul Setelah User Riset Akun) */}
      {!isLoading && profile && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* 1. Profile Header with Filters & Sort button at top-right */}
          <InstagramProfileHeader
            profile={profile}
            filterMode={filterMode}
            setFilterMode={setFilterMode}
            postLimit={postLimit}
            setPostLimit={setPostLimit}
            dateFilter={dateFilter}
            setDateFilter={setDateFilter}
            sortOption={sortOption}
            setSortOption={setSortOption}
            onResetFilters={handleResetFilters}
            onApplyFilters={() => setHasAppliedFilter(true)}
            hasAppliedFilter={hasAppliedFilter}
          />

          {/* 2. Kartu Panduan Sebelum Membuka Feed */}
          {!hasAppliedFilter && (
            <div className="w-full p-8 sm:p-10 rounded-2xl border border-dashed border-gray-300 dark:border-[#2C3246] bg-gray-50/50 dark:bg-[#141B31] text-center space-y-4 animate-in fade-in duration-200">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-rn-accent flex items-center justify-center mx-auto shadow-xs">
                <SlidersHorizontal className="w-6 h-6" />
              </div>
              <div className="space-y-1.5 max-w-md mx-auto">
                <h4 className="font-bold text-base sm:text-lg text-gray-900 dark:text-white font-heading">
                  Pilih Kriteria Sortir & Filter Feed
                </h4>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                  Profil @{profile.username} berhasil dimuat. Klik tombol <strong>Filters & Sort</strong> di kanan atas atau tombol di bawah ini untuk menampilkan postingan yang disortir.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setHasAppliedFilter(true)}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#f97316] hover:bg-[#ea580c] dark:bg-[#f97316] dark:hover:bg-[#fb923c] text-white font-bold text-xs sm:text-sm shadow-sm shadow-orange-500/20 transition-all transform active:scale-95 cursor-pointer"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>Tampilkan Feed Konten ({filteredAndSortedPosts.length} Post)</span>
              </button>
            </div>
          )}

          {/* 3. Galeri Feed & Toolbar (HANYA MUNCUL SETELAH MEMILIH FILTER & SORT) */}
          {hasAppliedFilter && (
            <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
              {/* Gallery Header & Toolbar (Persis Lampiran SortFeed) */}
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
                onResetFilters={handleResetFilters}
              />

              {/* Instagram Feed Grid with 4 columns & Creator Avatar Badge */}
              <InstagramFeedGrid
                posts={filteredAndSortedPosts}
                profile={profile}
                sortOption={sortOption}
                onSelectPost={(post) => setSelectedPost(post)}
              />
            </div>
          )}

          {/* 4. Post Inspect Modal */}
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
