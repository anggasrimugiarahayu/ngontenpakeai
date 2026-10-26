"use client";

import React, { useState } from "react";
import {
  SortOption,
  FilterMode,
  PostLimit,
  DateFilter,
} from "./types";
import {
  Download,
  ArrowUpDown,
  RotateCcw,
  Check,
  Share2,
  Copy,
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
  onExportAction: (format: "sheets" | "excel" | "csv" | "json", action: "download" | "copy") => void;
  onDownloadMedia?: () => void;
  onResetFilters: () => void;
  onApply?: () => void;
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
  onExportAction,
  onDownloadMedia,
  onResetFilters,
  onApply,
}: Props) {
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);

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

  const exportFormats: { id: "sheets" | "excel" | "csv" | "json"; label: string }[] = [
    { id: "sheets", label: "Google Sheets" },
    { id: "excel", label: "Excel" },
    { id: "csv", label: "CSV" },
    { id: "json", label: "JSON" },
  ];

  return (
    <div className="w-full p-4 sm:p-5 border-b border-gray-100 dark:border-[#2C3246] relative">
      {/* ========================================================================= */}
      {/* BARIS 1: Judul & Subtitle (Kiri) + Tombol Download & Export (Kanan) */}
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

        {/* Kanan: 2 Tombol Aksi (Download ZIP & Export Dropdown) */}
        <div className="w-full sm:w-auto grid grid-cols-2 sm:flex sm:items-center gap-2 sm:gap-2.5 relative">
          {/* 1. Download Media ZIP */}
          <button
            type="button"
            onClick={onDownloadMedia}
            disabled={totalFiltered === 0}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-lg text-xs font-semibold bg-gray-100 hover:bg-gray-200 dark:bg-[#1E293B] dark:hover:bg-[#2A374F] text-gray-700 dark:text-gray-200 transition-colors disabled:opacity-50 cursor-pointer"
            title="Download semua file media (video Reels & foto) dalam bentuk file ZIP rapi"
          >
            <Download className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
            <span>Download {totalFiltered}</span>
          </button>

          {/* 2. Export Button dengan Dropdown Popup Multi-Format */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsExportMenuOpen((prev) => !prev)}
              disabled={totalFiltered === 0}
              className={`w-full inline-flex items-center justify-center gap-1.5 px-3.5 py-2 sm:py-1.5 rounded-lg text-xs font-semibold border transition-all disabled:opacity-50 cursor-pointer ${
                isExportMenuOpen
                  ? "border-orange-500 ring-2 ring-orange-500/20 text-orange-600 dark:text-orange-400 bg-orange-50/50 dark:bg-orange-500/10"
                  : "border-gray-300 dark:border-[#384260] bg-white hover:bg-gray-50 dark:bg-transparent dark:hover:bg-[#1E293B] text-gray-800 dark:text-white"
              }`}
              title="Export data ke Google Sheets, Excel, CSV, atau JSON"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Export {totalFiltered}</span>
            </button>

            {/* Dropdown Menu Export Multi-Format (Sesuai Referensi Screenshot 2) */}
            {isExportMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40 bg-transparent"
                  onClick={() => setIsExportMenuOpen(false)}
                />
                <div className="absolute right-0 top-full mt-2 z-50 w-56 sm:w-64 bg-white dark:bg-[#161B2E] border border-gray-200 dark:border-[#2C3246] rounded-xl shadow-2xl p-1.5 text-xs text-gray-800 dark:text-gray-200 animate-in zoom-in-95 fade-in duration-150">
                  {exportFormats.map((fmt) => (
                    <div
                      key={fmt.id}
                      className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-[#1E293B] transition-colors group"
                    >
                      <span className="font-semibold text-gray-900 dark:text-white text-xs">
                        {fmt.label}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {/* Tombol Download */}
                        <button
                          type="button"
                          onClick={() => {
                            setIsExportMenuOpen(false);
                            onExportAction(fmt.id, "download");
                          }}
                          title={`Download file ${fmt.label}`}
                          className="p-1 rounded text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-white/10 transition-colors cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>

                        {/* Tombol Copy Clipboard */}
                        <button
                          type="button"
                          onClick={() => {
                            setIsExportMenuOpen(false);
                            onExportAction(fmt.id, "copy");
                          }}
                          title={`Copy data ${fmt.label} ke clipboard`}
                          className="p-1 rounded text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-white/10 transition-colors cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* BARIS 2: Sort By (Compact & Rapi) */}
      {/* ========================================================================= */}
      <div className="pt-2.5 text-xs flex items-center justify-between gap-2.5 relative">
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Selector Sort by Ringkas & Tidak Melar */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gray-50 dark:bg-[#141B31] border border-gray-200 dark:border-[#2C3246] shrink-0">
            <ArrowUpDown className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400 shrink-0 hidden sm:inline">
              Sort by:
            </span>
            <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400 shrink-0 sm:hidden">
              Sort:
            </span>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as SortOption)}
              className="bg-transparent font-bold text-gray-900 dark:text-white border-0 focus:outline-none focus:ring-0 cursor-pointer text-xs w-auto"
            >
              <option value="outlier" className="bg-white dark:bg-[#141B31] text-gray-900 dark:text-white">
                Outlier Score
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
        </div>

        {/* Clear all (jika filter dikustomisasi) */}
        {isCustomized && (
          <button
            type="button"
            onClick={onResetFilters}
            className="inline-flex items-center gap-1 text-gray-400 hover:text-rose-500 font-medium text-[11px] shrink-0 cursor-pointer pl-1"
            title="Reset ke pengaturan default"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden sm:inline">Clear all</span>
            <span className="sm:hidden">Reset</span>
          </button>
        )}
      </div>
    </div>
  );
}

