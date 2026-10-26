"use client";

import React, { useState, useMemo } from "react";
import {
  YouTubeChannelProfile,
  YouTubeVideoItem,
  YouTubeFormatFilter,
  YouTubeSortOption,
} from "./types";
import { YouTubeProfileHeader } from "./YouTubeProfileHeader";
import { YouTubeSortToolbar } from "./YouTubeSortToolbar";
import { YouTubeFeedGrid } from "./YouTubeFeedGrid";
import { YouTubeVideoModal } from "./YouTubeVideoModal";
import {
  Search,
  Sparkles,
  RefreshCw,
  AlertCircle,
  Play,
  ArrowLeft,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

interface Props {
  onBackToHub?: () => void;
}

const SAMPLE_CHANNELS = ["@kokbisa", "@gadgetin", "@felixsiauw", "@radityadika"];

export function YouTubeResearchStudio({ onBackToHub }: Props) {
  const [searchInput, setSearchInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [profile, setProfile] = useState<YouTubeChannelProfile | null>(null);
  const [videos, setVideos] = useState<YouTubeVideoItem[]>([]);

  const [formatFilter, setFormatFilter] = useState<YouTubeFormatFilter>("all");
  const [sortOption, setSortOption] = useState<YouTubeSortOption>("outlier");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVideo, setSelectedVideo] = useState<YouTubeVideoItem[] | null>(null);
  const [activeModalVideo, setActiveModalVideo] = useState<YouTubeVideoItem | null>(null);

  const handleSearch = async (targetHandle?: string, forceRefresh = false) => {
    const handleToQuery = (targetHandle || searchInput).trim();
    if (!handleToQuery) {
      toast.error("Masukkan nama channel atau link YouTube terlebih dahulu");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");

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

      setProfile(data.profile);
      setVideos(data.videos || []);
      setSearchInput(data.profile?.customUrl || handleToQuery);
      toast.success(`Berhasil memuat riset ${data.profile?.title || handleToQuery}`);
    } catch (err: any) {
      setErrorMsg(err.message || "Terjadi kesalahan saat mencari channel YouTube.");
      toast.error(err.message || "Gagal mencari channel");
    } finally {
      setIsLoading(false);
    }
  };

  // Client-side filtering & sorting via useMemo (Instant 0ms UX)
  const filteredAndSortedVideos = useMemo(() => {
    let result = [...videos];

    // 1. Filter Format
    if (formatFilter === "shorts") {
      result = result.filter((v) => v.isShorts);
    } else if (formatFilter === "videos") {
      result = result.filter((v) => !v.isShorts);
    }

    // 2. Filter Title Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((v) => v.title.toLowerCase().includes(q));
    }

    // 3. Sort
    result.sort((a, b) => {
      if (sortOption === "outlier") {
        return b.outlierScore - a.outlierScore;
      }
      if (sortOption === "views") {
        return b.viewsCount - a.viewsCount;
      }
      if (sortOption === "oldest") {
        return (a.durationSeconds || 0) - (b.durationSeconds || 0);
      }
      return 0; // Default order (newest as retrieved)
    });

    return result;
  }, [videos, formatFilter, searchQuery, sortOption]);

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-300 pb-16">
      {/* Header / Navigasi Balik */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={onBackToHub}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Pilihan Platform</span>
        </button>

        {profile && (
          <button
            onClick={() => handleSearch(profile.customUrl, true)}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-[#232D42] text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#141B2D] transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-red-600" : ""}`} />
            <span>Segarkan Data</span>
          </button>
        )}
      </div>

      {/* Hero Search Box */}
      <div className="w-full bg-gradient-to-br from-red-600/10 via-rose-500/5 to-transparent border border-red-500/20 rounded-3xl p-5 sm:p-8 space-y-4">
        <div className="max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-600 text-white shadow-xs">
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Riset YouTube Studio</span>
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold font-heading text-gray-900 dark:text-white tracking-tight">
            Temukan Video &amp; Shorts Paling Viral
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            Bongkar formula Outlier Score channel kompetitor. Pisahkan YouTube Shorts vs Video Reguler dan temukan ide konten yang terbukti meledak.
          </p>
        </div>

        {/* Search Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="flex flex-col sm:flex-row items-stretch gap-2.5 max-w-2xl pt-2"
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Masukkan handle channel (misal: @kokbisa) atau link YouTube..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              disabled={isLoading}
              className="w-full pl-10 pr-9 py-2.5 bg-white dark:bg-[#141B2D] border border-gray-200 dark:border-[#232D42] rounded-2xl text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-hidden focus:ring-2 focus:ring-red-500 shadow-xs"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading || !searchInput.trim()}
            className="px-6 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 dark:disabled:bg-gray-800 text-white font-bold rounded-2xl text-sm transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer shrink-0 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Menganalisis...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Riset Channel</span>
              </>
            )}
          </button>
        </form>

        {/* Rekomendasi Sampel Channel */}
        <div className="flex items-center gap-2 flex-wrap text-xs text-gray-500 dark:text-gray-400 pt-1">
          <span>Contoh channel populer:</span>
          {SAMPLE_CHANNELS.map((ch) => (
            <button
              key={ch}
              type="button"
              onClick={() => {
                setSearchInput(ch);
                handleSearch(ch);
              }}
              className="px-2.5 py-1 rounded-lg bg-white/60 dark:bg-white/5 border border-gray-200 dark:border-[#232D42] hover:border-red-500/50 text-gray-700 dark:text-gray-300 transition-colors font-medium cursor-pointer"
            >
              {ch}
            </button>
          ))}
        </div>
      </div>

      {/* Error Banner */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs sm:text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p>{errorMsg}</p>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="space-y-6 animate-pulse">
          <div className="h-32 bg-gray-200 dark:bg-[#141B2D] rounded-3xl" />
          <div className="h-12 bg-gray-200 dark:bg-[#141B2D] rounded-2xl" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="aspect-[16/10] bg-gray-200 dark:bg-[#141B2D] rounded-2xl" />
            ))}
          </div>
        </div>
      )}

      {/* Results View */}
      {!isLoading && profile && (
        <div className="space-y-6">
          {/* Channel Profile Header */}
          <YouTubeProfileHeader profile={profile} />

          {/* Sort & Filter Toolbar */}
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

          {/* Feed Grid */}
          <YouTubeFeedGrid
            videos={filteredAndSortedVideos}
            onSelectVideo={(v) => setActiveModalVideo(v)}
          />
        </div>
      )}

      {/* Video Detail Modal */}
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
