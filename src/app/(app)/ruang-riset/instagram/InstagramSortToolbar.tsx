"use client";

import React from "react";
import { SortOption, FormatFilter } from "./types";
import {
  Flame,
  Eye,
  Heart,
  MessageSquare,
  Clock,
  Download,
  Search,
  Filter,
  Film,
  Grid,
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
}: Props) {
  return (
    <div className="w-full bg-white dark:bg-[#18181b] border border-gray-200 dark:border-white/10 rounded-2xl p-4 md:p-5 shadow-sm space-y-4">
      {/* Baris 1: Pencarian Keyword & Tombol Export */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            placeholder="Cari kata kunci di caption/hook (misal: 'hook', 'closing')..."
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
          />
          {searchKeyword && (
            <button
              onClick={() => setSearchKeyword("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              Hapus
            </button>
          )}
        </div>

        {/* Export Button & Count */}
        <div className="flex items-center gap-2 justify-between sm:justify-end">
          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
            Menampilkan <span className="font-bold text-gray-900 dark:text-white">{totalFiltered}</span> dari {totalCount} konten
          </span>

          <button
            onClick={onExport}
            disabled={totalFiltered === 0}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-sm transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shrink-0"
            title="Download CSV yang kompatibel dengan Microsoft Excel & Google Sheets"
          >
            <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Baris 2: Sorting Options & Format Filter */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 pt-3 border-t border-gray-100 dark:border-white/5">
        {/* Sort Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 lg:pb-0 scrollbar-none">
          <span className="text-xs font-semibold text-gray-400 shrink-0 mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Urutkan:
          </span>

          {/* Outlier Score Button (Default SortFeed) */}
          <button
            onClick={() => setSortOption("outlier")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
              sortOption === "outlier"
                ? "bg-rose-500 text-white shadow-sm ring-2 ring-rose-500/20"
                : "bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10"
            }`}
          >
            <Flame className="w-3 h-3 text-amber-300 fill-amber-300" />
            <span>Paling Viral (Outlier)</span>
          </button>

          {/* Most Views */}
          <button
            onClick={() => setSortOption("views")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
              sortOption === "views"
                ? "bg-orange-500 text-white shadow-sm ring-2 ring-orange-500/20"
                : "bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10"
            }`}
          >
            <Eye className="w-3 h-3" />
            <span>Views Terbanyak</span>
          </button>

          {/* Most Likes */}
          <button
            onClick={() => setSortOption("likes")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
              sortOption === "likes"
                ? "bg-purple-600 text-white shadow-sm"
                : "bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10"
            }`}
          >
            <Heart className="w-3 h-3" />
            <span>Likes Terbanyak</span>
          </button>

          {/* Most Comments */}
          <button
            onClick={() => setSortOption("comments")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
              sortOption === "comments"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10"
            }`}
          >
            <MessageSquare className="w-3 h-3" />
            <span>Komentar Terbanyak</span>
          </button>

          {/* Newest */}
          <button
            onClick={() => setSortOption("newest")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
              sortOption === "newest"
                ? "bg-gray-900 text-white dark:bg-white dark:text-black shadow-sm"
                : "bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10"
            }`}
          >
            <Clock className="w-3 h-3" />
            <span>Terbaru</span>
          </button>
        </div>

        {/* Format Filter Tabs (All / Reels / Posts) */}
        <div className="flex items-center gap-1 self-start sm:self-auto bg-gray-100 dark:bg-white/5 p-1 rounded-xl">
          <button
            onClick={() => setFormatFilter("all")}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              formatFilter === "all"
                ? "bg-white dark:bg-[#18181b] text-gray-900 dark:text-white shadow-xs"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            Semua
          </button>
          <button
            onClick={() => setFormatFilter("reels")}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              formatFilter === "reels"
                ? "bg-white dark:bg-[#18181b] text-gray-900 dark:text-white shadow-xs"
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
                ? "bg-white dark:bg-[#18181b] text-gray-900 dark:text-white shadow-xs"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <Grid className="w-3 h-3" />
            <span>Foto / Carousel</span>
          </button>
        </div>
      </div>
    </div>
  );
}
