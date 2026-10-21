"use client";

import React, { useState } from "react";
import {
  SortOption,
  FilterMode,
  PostLimit,
  DateFilter,
} from "./types";
import { SortFeedFilterDropdown } from "./SortFeedFilterDropdown";
import {
  Download,
  Users,
  SlidersHorizontal,
  ArrowUpDown,
  Check,
  RotateCcw,
} from "lucide-react";

interface Props {
  sortOption: SortOption;
  setSortOption: (val: SortOption) => void;
  filterMode: FilterMode;
  setFilterMode: (val: FilterMode) => void;
  postLimit: PostLimit;
  setPostLimit: (val: PostLimit) => void;
  dateFilter: DateFilter;
  setDateFilter: (val: DateFilter) => void;
  totalFiltered: number;
  totalCount: number;
  onExport: () => void;
  onResetFilters: () => void;
}

export function InstagramSortToolbar({
  sortOption,
  setSortOption,
  filterMode,
  setFilterMode,
  postLimit,
  setPostLimit,
  dateFilter,
  setDateFilter,
  totalFiltered,
  totalCount,
  onExport,
  onResetFilters,
}: Props) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSelectMode, setIsSelectMode] = useState(false);

  // Title dynamic matching SortFeed Image 4
  const getSortTitle = () => {
    switch (sortOption) {
      case "likes":
        return "Most Liked Posts";
      case "outlier":
        return "Highest Outlier Posts";
      case "views":
        return "Most Viewed Posts";
      case "comments":
        return "Most Commented Posts";
      case "newest":
        return "Latest Posts";
      case "oldest":
        return "Oldest Posts";
      default:
        return "Most Liked Posts";
    }
  };

  const isCustomized =
    sortOption !== "likes" ||
    (filterMode === "posts" && postLimit !== 25) ||
    filterMode === "date";

  return (
    <div className="w-full bg-white dark:bg-[#18181b] border border-gray-200 dark:border-white/10 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3.5 relative">
      {/* ========================================================================= */}
      {/* BARIS ATAS: Judul Kiri & Aksi Kanan (Persis Lampiran SortFeed) */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-gray-100 dark:border-white/5">
        {/* Kiri: Judul Dinamis & Jumlah Postingan */}
        <div>
          <h3 className="text-xl sm:text-2xl font-bold font-heading text-gray-900 dark:text-white tracking-tight">
            {getSortTitle()}
          </h3>
          <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mt-0.5">
            Showing <span className="font-bold text-gray-900 dark:text-white">{totalFiltered}</span> Posts
            {totalFiltered !== totalCount && (
              <span className="text-gray-400 ml-1">
                (dari total {totalCount} postingan)
              </span>
            )}
          </p>
        </div>

        {/* Kanan: [👥 Similar New] | [📥 Download X] | [📤 Export X] */}
        <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap self-stretch sm:self-auto justify-end">
          {/* Similar Button */}
          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 transition-colors cursor-pointer"
          >
            <Users className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
            <span>Similar</span>
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-orange-500/10 text-rn-accent border border-orange-500/20">
              New
            </span>
          </button>

          {/* Download Count Button */}
          <button
            type="button"
            onClick={onExport}
            disabled={totalFiltered === 0}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 transition-colors cursor-pointer disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
            <span>Download {totalFiltered}</span>
          </button>

          {/* Export Primary Button (Warna Standar App Kita) */}
          <button
            type="button"
            onClick={onExport}
            disabled={totalFiltered === 0}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rn-accent hover:bg-orange-600 text-white font-bold text-xs sm:text-sm shadow-sm transition-all transform active:scale-95 disabled:opacity-50 cursor-pointer shrink-0"
          >
            <Download className="w-4 h-4" />
            <span>Export {totalFiltered}</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* BARIS KEDUA (SUB-BAR): Filters, Sort by, Clear all, Select (Persis Lampiran) */}
      {/* ========================================================================= */}
      <div className="flex items-center justify-between gap-3 text-xs">
        {/* Sisi Kiri: [ ≡ Filters ] [ ⇅ Sort by ] [ Clear all ] */}
        <div className="flex items-center gap-3 sm:gap-4 flex-wrap relative">
          {/* Filters Button */}
          <button
            type="button"
            onClick={() => setIsFilterOpen((prev) => !prev)}
            className="inline-flex items-center gap-1.5 font-semibold text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-rn-accent" />
            <span>Filters</span>
          </button>

          {/* Sort by Button */}
          <button
            type="button"
            onClick={() => setIsFilterOpen((prev) => !prev)}
            className="inline-flex items-center gap-1.5 font-semibold text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-rn-accent" />
            <span>
              Sort by: <strong className="text-gray-900 dark:text-white capitalize">{sortOption}</strong>
            </span>
          </button>

          {/* Clear all */}
          {isCustomized && (
            <button
              type="button"
              onClick={onResetFilters}
              className="inline-flex items-center gap-1 text-gray-400 hover:text-rose-500 font-medium transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Clear all</span>
            </button>
          )}

          {/* Dropdown Modal anchored here if opened from toolbar */}
          <SortFeedFilterDropdown
            isOpen={isFilterOpen}
            onClose={() => setIsFilterOpen(false)}
            filterMode={filterMode}
            setFilterMode={setFilterMode}
            postLimit={postLimit}
            setPostLimit={setPostLimit}
            dateFilter={dateFilter}
            setDateFilter={setDateFilter}
            sortOption={sortOption}
            setSortOption={setSortOption}
            onReset={onResetFilters}
          />
        </div>

        {/* Sisi Kanan: [ ✓ Select ] */}
        <div>
          <button
            type="button"
            onClick={() => setIsSelectMode((prev) => !prev)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              isSelectMode
                ? "bg-orange-50 dark:bg-orange-500/10 text-rn-accent font-bold"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <Check className="w-3.5 h-3.5" />
            <span>{isSelectMode ? "Selected" : "Select"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
