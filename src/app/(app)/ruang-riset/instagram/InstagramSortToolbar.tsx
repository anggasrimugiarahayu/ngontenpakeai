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
  SlidersHorizontal,
  ArrowUpDown,
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

  // Dynamic clean title
  const getSortTitle = () => {
    switch (sortOption) {
      case "outlier":
        return "Highest Outlier Posts";
      case "views":
        return "Most Viewed Posts";
      case "likes":
        return "Most Liked Posts";
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

  const isCustomized =
    sortOption !== "outlier" ||
    (filterMode === "posts" && postLimit !== 25) ||
    filterMode === "date";

  return (
    <div className="w-full bg-white dark:bg-[#141B31] border border-gray-200 dark:border-[#2C3246] rounded-2xl p-4 sm:p-5 shadow-xs relative">
      {/* ========================================================================= */}
      {/* BARIS UTAMA: Judul & Jumlah Postingan (Kiri) + Satu Tombol Export CSV (Kanan) */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-gray-100 dark:border-[#2C3246]">
        {/* Kiri: Judul & Post Counter */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <h3 className="text-lg sm:text-xl font-bold font-heading text-gray-900 dark:text-white tracking-tight">
            {getSortTitle()}
          </h3>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300">
            {totalFiltered} {totalFiltered !== totalCount ? `dari total ${totalCount}` : ""} Postingan
          </span>
        </div>

        {/* Kanan: HANYA 1 TOMBOL AKSI UTAMA (Export CSV) */}
        <div className="flex items-center self-stretch sm:self-auto justify-end">
          <button
            type="button"
            onClick={onExport}
            disabled={totalFiltered === 0}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#f97316] hover:bg-[#ea580c] dark:bg-[#f97316] dark:hover:bg-[#fb923c] text-white font-bold text-xs sm:text-sm shadow-sm shadow-orange-500/20 transition-all transform active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SUB-BARIS: Filter & Sort Controls Ringkas & Simpel */}
      {/* ========================================================================= */}
      <div className="flex items-center justify-between gap-3 text-xs pt-0.5">
        <div className="flex items-center gap-3 sm:gap-4 flex-wrap relative">
          {/* Tombol Pengaturan Filter & Urutan Tunggal */}
          <button
            type="button"
            onClick={() => setIsFilterOpen((prev) => !prev)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 dark:bg-[#0F172A] dark:hover:bg-[#1E293B] border border-gray-200 dark:border-[#2C3246] font-semibold text-gray-700 dark:text-gray-200 transition-colors cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-rn-accent" />
            <span>Filter & Limit</span>
          </button>

          {/* Quick Sort Selector Langsung */}
          <div className="inline-flex items-center gap-1.5 text-gray-600 dark:text-gray-300 font-medium">
            <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
            <span className="hidden sm:inline text-gray-400">Urutkan:</span>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as SortOption)}
              className="bg-transparent font-bold text-gray-900 dark:text-white border-0 focus:outline-none focus:ring-0 cursor-pointer text-xs"
            >
              <option value="outlier" className="bg-white dark:bg-[#141B31] text-gray-900 dark:text-white">
                Outlier Score (Paling Viral)
              </option>
              <option value="views" className="bg-white dark:bg-[#141B31] text-gray-900 dark:text-white">
                Views Terbanyak
              </option>
              <option value="likes" className="bg-white dark:bg-[#141B31] text-gray-900 dark:text-white">
                Likes Terbanyak
              </option>
              <option value="comments" className="bg-white dark:bg-[#141B31] text-gray-900 dark:text-white">
                Komentar Terbanyak
              </option>
              <option value="newest" className="bg-white dark:bg-[#141B31] text-gray-900 dark:text-white">
                Postingan Terbaru
              </option>
              <option value="oldest" className="bg-white dark:bg-[#141B31] text-gray-900 dark:text-white">
                Postingan Terlama
              </option>
            </select>
          </div>

          {/* Reset Filter (jika dikustomisasi) */}
          {isCustomized && (
            <button
              type="button"
              onClick={onResetFilters}
              className="inline-flex items-center gap-1 text-gray-400 hover:text-rose-500 font-medium transition-colors cursor-pointer ml-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}

          {/* Modal Filter Dropdown jika dibuka */}
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
      </div>
    </div>
  );
}
