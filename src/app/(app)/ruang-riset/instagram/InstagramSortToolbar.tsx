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
  Users,
  Check,
  Share2,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

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
  onDownloadMedia?: () => void;
  onResetFilters: () => void;
  onApply?: () => void;
  isSelectMode?: boolean;
  setIsSelectMode?: (val: boolean) => void;
  selectedCount?: number;
  onSelectAll?: () => void;
  onClearSelection?: () => void;
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
  onDownloadMedia,
  onResetFilters,
  onApply,
  isSelectMode = false,
  setIsSelectMode,
  selectedCount = 0,
  onSelectAll,
  onClearSelection,
}: Props) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Dynamic clean title
  const getSortTitle = () => {
    switch (sortOption) {
      case "outlier":
        return "Top Outlier Posts";
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
        return "Top Outlier Posts";
    }
  };

  const isCustomized =
    sortOption !== "outlier" ||
    (filterMode === "posts" && postLimit !== 25) ||
    filterMode === "date";

  const activeCount = isSelectMode && selectedCount > 0 ? selectedCount : totalFiltered;

  return (
    <div className="w-full p-4 sm:p-5 border-b border-gray-100 dark:border-[#2C3246] relative">
      {/* ========================================================================= */}
      {/* BARIS 1: Judul & Subtitle (Kiri) + Tombol Similar, Download, Export (Kanan) */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3.5">
        {/* Kiri: Judul & Subtitle */}
        <div>
          <h3 className="text-lg sm:text-xl font-bold font-heading text-gray-900 dark:text-white tracking-tight">
            {getSortTitle()}
          </h3>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-0.5">
            Showing {totalFiltered} Posts
            {totalFiltered !== totalCount && ` (dari total ${totalCount})`}
          </p>
        </div>

        {/* Kanan: 3 Tombol Aksi (Similar, Download, Export) */}
        <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap self-stretch sm:self-auto justify-end">
          {/* 1. Similar (New) */}
          <button
            type="button"
            onClick={() => {
              toast("Menemukan pola konten serupa dengan performa outlier tinggi!", {
                icon: "💡",
              });
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 hover:bg-gray-200 dark:bg-[#1E293B] dark:hover:bg-[#2A374F] text-gray-700 dark:text-gray-200 transition-colors cursor-pointer"
          >
            <Users className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
            <span>Similar</span>
            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-orange-500/15 text-orange-600 dark:bg-orange-500/25 dark:text-orange-400">
              New
            </span>
          </button>

          {/* 2. Download Media Post/Reels */}
          <button
            type="button"
            onClick={onDownloadMedia}
            disabled={totalFiltered === 0}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 hover:bg-gray-200 dark:bg-[#1E293B] dark:hover:bg-[#2A374F] text-gray-700 dark:text-gray-200 transition-colors disabled:opacity-50 cursor-pointer"
            title="Download file media foto & video Reels postingan"
          >
            <Download className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
            <span>Download {activeCount}</span>
          </button>

          {/* 3. Export Data CSV (Outline Button) */}
          <button
            type="button"
            onClick={onExport}
            disabled={totalFiltered === 0}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold border border-gray-300 dark:border-[#384260] bg-white hover:bg-gray-50 dark:bg-transparent dark:hover:bg-[#1E293B] text-gray-800 dark:text-white transition-colors disabled:opacity-50 cursor-pointer"
            title="Export data metrik dan link ke spreadsheet CSV"
          >
            <Share2 className="w-3.5 h-3.5 text-gray-600 dark:text-gray-300" />
            <span>Export {activeCount}</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* BARIS 2: Filters, Sort By, Clear All (Kiri) + Select (Kanan) */}
      {/* ========================================================================= */}
      <div className="flex items-center justify-between gap-3 pt-2 text-xs">
        {/* Kiri: Filters, Sort by, Clear all */}
        <div className="flex items-center gap-3 sm:gap-4 flex-wrap relative">
          {/* Tombol Filters */}
          <button
            type="button"
            onClick={() => setIsFilterOpen((prev) => !prev)}
            className="inline-flex items-center gap-1.5 font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-rn-accent" />
            <span>Filters</span>
          </button>

          {/* Selector Sort by Langsung */}
          <div className="inline-flex items-center gap-1 font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
            <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
            <span>Sort by:</span>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as SortOption)}
              className="bg-transparent font-bold text-gray-900 dark:text-white border-0 focus:outline-none focus:ring-0 cursor-pointer text-xs ml-0.5"
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

          {/* Clear all (jika filter dikustomisasi) */}
          {isCustomized && (
            <button
              type="button"
              onClick={onResetFilters}
              className="inline-flex items-center gap-1 text-gray-400 hover:text-rose-500 font-medium transition-colors cursor-pointer ml-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Clear all</span>
            </button>
          )}

          {/* Modal Filter Dropdown jika dibuka */}
          <SortFeedFilterDropdown
            isOpen={isFilterOpen}
            onClose={() => setIsFilterOpen(false)}
            onApply={() => {
              setIsFilterOpen(false);
              if (onApply) onApply();
            }}
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

        {/* Kanan: Tombol Select / Mode Pemilihan */}
        <div className="flex items-center gap-2">
          {isSelectMode ? (
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-orange-500">
                {selectedCount} Terpilih
              </span>
              <button
                type="button"
                onClick={onSelectAll}
                className="text-[11px] font-semibold text-gray-600 dark:text-gray-300 hover:underline cursor-pointer"
              >
                Pilih Semua
              </button>
              <button
                type="button"
                onClick={() => {
                  if (setIsSelectMode) setIsSelectMode(false);
                  if (onClearSelection) onClearSelection();
                }}
                className="inline-flex items-center gap-1 px-2 py-1 rounded bg-gray-100 dark:bg-[#1E293B] text-gray-600 dark:text-gray-300 text-[11px] font-semibold hover:text-rose-500 cursor-pointer"
              >
                <X className="w-3 h-3" />
                <span>Batal</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                if (setIsSelectMode) setIsSelectMode(true);
              }}
              className="inline-flex items-center gap-1 font-semibold text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Select</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

