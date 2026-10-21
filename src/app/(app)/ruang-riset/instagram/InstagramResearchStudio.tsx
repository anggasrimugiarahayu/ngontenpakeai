"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  InstagramTargetProfile,
  InstagramPostItem,
  SortOption,
  FormatFilter,
} from "./types";
import { InstagramProfileHeader } from "./InstagramProfileHeader";
import { InstagramSortToolbar } from "./InstagramSortToolbar";
import { InstagramFeedGrid } from "./InstagramFeedGrid";
import { InstagramPostModal } from "./InstagramPostModal";
import { exportPostsToCSV } from "./exportUtils";
import {
  ArrowLeft,
  Search,
  AlertCircle,
  Loader2,
} from "lucide-react";

interface Props {
  onBackToPlatformHub: () => void;
  defaultUsername?: string;
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

  const [profile, setProfile] = useState<InstagramTargetProfile | null>(null);
  const [posts, setPosts] = useState<InstagramPostItem[]>([]);
  const [selectedPost, setSelectedPost] = useState<InstagramPostItem | null>(null);

  // Sorting & Filtering State
  const [sortOption, setSortOption] = useState<SortOption>("outlier");
  const [formatFilter, setFormatFilter] = useState<FormatFilter>("all");
  const [searchKeyword, setSearchKeyword] = useState("");

  // Function to execute research
  const handleSearch = async (userToSearch: string) => {
    const clean = userToSearch.trim().replace(/^@/, "");
    if (!clean) return;

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
      setLoadingStepText("Menyusun grid feed visual...");
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

  // Initial load with defaultUsername on mount
  useEffect(() => {
    handleSearch(defaultUsername);
  }, []);

  // Filtered & Sorted Posts
  const filteredAndSortedPosts = useMemo(() => {
    let result = [...posts];

    // 1. Format Filter
    if (formatFilter === "reels") {
      result = result.filter((p) => p.mediaType === "VIDEO");
    } else if (formatFilter === "posts") {
      result = result.filter((p) => p.mediaType !== "VIDEO");
    }

    // 2. Keyword Search in Caption/Hook
    if (searchKeyword.trim()) {
      const q = searchKeyword.toLowerCase();
      result = result.filter(
        (p) =>
          p.caption.toLowerCase().includes(q) ||
          p.hookText.toLowerCase().includes(q)
      );
    }

    // 3. Sorting
    result.sort((a, b) => {
      switch (sortOption) {
        case "outlier":
          return b.outlierScore - a.outlierScore;
        case "views":
          return b.viewsCount - a.viewsCount;
        case "likes":
          return b.likesCount - a.likesCount;
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

    return result;
  }, [posts, sortOption, formatFilter, searchKeyword]);

  const handleExportCSV = () => {
    if (!profile) return;
    exportPostsToCSV(filteredAndSortedPosts, profile);
  };

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-300">
      {/* Top Navigation: Tombol Kembali Saja (Bersih, Tanpa Badge Tambahan) */}
      <div className="flex items-center justify-start">
        <button
          onClick={onBackToPlatformHub}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Pilihan Platform</span>
        </button>
      </div>

      {/* Header - EXACT SAME CLEAN STYLE, FONT, & SPACING AS RUANG NGONTEN / RUANG BELAJAR */}
      <div className="flex flex-col items-center justify-center text-center gap-2 mb-8 md:mb-10">
        <div className="space-y-3 flex flex-col items-center">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
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
                className="w-full pl-9 pr-4 py-3 text-sm font-medium rounded-xl bg-white dark:bg-[#18181b] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rn-accent/20 focus:border-rn-accent transition-all shadow-xs"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !usernameInput.trim()}
              className="px-6 py-3 rounded-xl bg-rn-accent hover:bg-orange-600 text-white font-bold text-sm shadow-sm transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 shrink-0"
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
                className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300 font-medium transition-colors cursor-pointer"
              >
                @{acc}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Loading Progress Indicator (Selesai 100%) */}
      {isLoading && (
        <div className="w-full p-6 sm:p-8 bg-white dark:bg-[#18181b] rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm text-center space-y-4 animate-in fade-in duration-200 max-w-2xl mx-auto">
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
            Mengolah metrik performa, rata-rata penayangan, dan ranking Outlier Score
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
          {/* 1. Profile Header (Desktop & Mobile) */}
          <InstagramProfileHeader profile={profile} />

          {/* 2. Sorting & Filter Toolbar ala SortFeed */}
          <InstagramSortToolbar
            sortOption={sortOption}
            setSortOption={setSortOption}
            formatFilter={formatFilter}
            setFormatFilter={setFormatFilter}
            searchKeyword={searchKeyword}
            setSearchKeyword={setSearchKeyword}
            onExport={handleExportCSV}
            totalFiltered={filteredAndSortedPosts.length}
            totalCount={posts.length}
          />

          {/* 3. Instagram Feed Grid with Outlier Badges */}
          <InstagramFeedGrid
            posts={filteredAndSortedPosts}
            onSelectPost={(post) => setSelectedPost(post)}
          />

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
