"use client";

import React from "react";
import {
  SortOption,
  FormatFilter,
  FilterMode,
  PostLimit,
  DateFilter,
} from "./types";
import {
  Flame,
  Eye,
  Heart,
  MessageSquare,
  Clock,
  Download,
  Search,
  SlidersHorizontal,
  Film,
  Layers,
  RotateCcw,
  Sparkles,
} from "lucide-react";

interface Props {
  sortOption: SortOption;
  setSortOption: (val: SortOption) => void;
  formatFilter: FormatFilter;
  setFormatFilter: (val: FormatFilter) => void;
  searchKeyword: string;
  setSearchKeyword: (val: string) => void;
  onExport: () => void;
  totalFiltered: number;
  totalCount: number;
  filterMode?: FilterMode;
  postLimit?: PostLimit;
  dateFilter?: DateFilter;
  onClearFilters: () => void;
}

export function InstagramSortToolbar({
  sortOption,
  setSortOption,
  formatFilter,
  setFormatFilter,
  searchKeyword,
  setSearchKeyword,
  onExport,
  totalFiltered,
  totalCount,
  filterMode,
  postLimit,
  dateFilter,
  onClearFilters,
}: Props) {
  // Title dynamic matching SortFeed Image 4
  const getSortTitle = () => {
    switch (sortOption) {
      case "outlier":
        return "Highest Outlier Posts";
      case "likes":
        return "Most Liked Posts";
      case "views":
        return "Most Viewed Posts";
      case "comments":
        return "Most Commented Posts";
      case "newest":
        return "Latest Posts";
      case "oldest":
        return "Oldest Posts";
      default:
        return "Highest Outlier Posts";
    }
  };

  const isFiltered =
    searchKeyword.trim() !== "" ||
    formatFilter !== "all" ||
    (filterMode === "posts" && postLimit !== 25) ||
    (filterMode === "date" && dateFilter !== "all");

  return (
    <div className="w-full bg-white dark:bg-[#18181b] border border-gray-200 dark:border-white/10 rounded-2xl p-4 sm:p-5 md:p-6 shadow-xs space-y-4">
      {/* ========================================================================= */}
      {/* HEADER SECTION (Persis Layout Gambar 4 SortFeed) */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Left: Dynamic Title & Showing Count */}
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <h3 className="text-xl sm:text-2xl font-bold font-heading text-gray-900 dark:text-white tracking-tight">
              {getSortTitle()}
            </h3>
            {sortOption === "outlier" && (
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
                <Sparkles className="w-3 h-3" />
                SortFeed
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
            Showing <span className="font-bold text-gray-900 dark:text-white">{totalFiltered}</span> Posts
            {totalFiltered !== totalCount && (
              <span className="text-gray-400 ml-1">
                (dari total {totalCount} postingan)
              </span>
            )}
          </p>
        </div>

        {/* Right: Export Button (Standard Platform Button Style) */}
        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
          <button
            onClick={onExport}
            disabled={totalFiltered === 0}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-rn-accent hover:bg-orange-600 text-white font-bold text-xs sm:text-sm shadow-sm transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shrink-0"
            title="Download CSV yang kompatibel dengan Excel & Google Sheets"
          >
            <Download className="w-4 h-4" />
            <span>Export {totalFiltered}</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECONDARY ROW: Search, Format Filter, Quick Sort & Clear */}
      {/* ========================================================================= */}
      <div className="pt-3 border-t border-gray-100 dark:border-white/10 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Left: Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            placeholder="Cari kata kunci dalam caption/hook..."
            className="w-full pl-9 pr-14 py-2 text-xs sm:text-sm rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rn-accent/20 focus:border-rn-accent transition-all"
          />
          {searchKeyword && (
            <button
              onClick={() => setSearchKeyword("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 cursor-pointer"
            >
              Hapus
            </button>
          )}
        </div>

        {/* Center / Right: Quick Sort Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
          <button
            onClick={() => setSortOption("outlier")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
              sortOption === "outlier"
                ? "bg-rn-accent text-white shadow-xs"
                : "bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10"
            }`}
          >
            <Flame className="w-3.5 h-3.5 fill-current" />
            <span>Outlier</span>
          </button>

          <button
            onClick={() => setSortOption("likes")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
              sortOption === "likes"
                ? "bg-rn-accent text-white shadow-xs"
                : "bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10"
            }`}
          >
            <Heart className="w-3.5 h-3.5 fill-current" />
            <span>Likes</span>
          </button>

          <button
            onClick={() => setSortOption("views")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
              sortOption === "views"
                ? "bg-rn-accent text-white shadow-xs"
                : "bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Views</span>
          </button>

          <button
            onClick={() => setSortOption("comments")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
              sortOption === "comments"
                ? "bg-rn-accent text-white shadow-xs"
                : "bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10"
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Comments</span>
          </button>

          <button
            onClick={() => setSortOption("newest")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
              sortOption === "newest"
                ? "bg-rn-accent text-white shadow-xs"
                : "bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Newest</span>
          </button>
        </div>

        {/* Right: Format Switcher & Clear All */}
        <div className="flex items-center gap-2 self-start lg:self-auto shrink-0">
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-white/5 p-1 rounded-xl">
            <button
              onClick={() => setFormatFilter("all")}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                formatFilter === "all"
                  ? "bg-white dark:bg-[#202023] text-gray-900 dark:text-white shadow-xs"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setFormatFilter("reels")}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                formatFilter === "reels"
                  ? "bg-white dark:bg-[#202023] text-gray-900 dark:text-white shadow-xs"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <Film className="w-3 h-3" />
              <span>Reels</span>
            </button>
            <button
              onClick={() => setFormatFilter("posts")}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                formatFilter === "posts"
                  ? "bg-white dark:bg-[#202023] text-gray-900 dark:text-white shadow-xs"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <Layers className="w-3 h-3" />
              <span>Foto</span>
            </button>
          </div>

          {isFiltered && (
            <button
              onClick={onClearFilters}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-gray-500 hover:text-rose-600 dark:text-gray-400 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors cursor-pointer"
              title="Reset pencarian & filter format"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
