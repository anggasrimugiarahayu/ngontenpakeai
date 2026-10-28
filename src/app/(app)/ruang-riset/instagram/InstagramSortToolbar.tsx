"use client";

import React, { useState, useMemo } from "react";
import {
  SortOption,
  FilterMode,
  PostLimit,
  DateFilter,
  InstagramFormatFilter,
  InstagramPostItem,
} from "./types";
import {
  Download,
  ArrowUpDown,
  RotateCcw,
  Check,
  Share2,
  Copy,
  SlidersHorizontal,
  Heart,
  Play,
  Zap,
  MessageSquare,
  Clock,
  Info,
  Film,
  Layers,
  TrendingUp,
} from "lucide-react";
import toast from "react-hot-toast";

interface Props {
  formatFilter?: InstagramFormatFilter;
  onFormatFilterChange?: (format: InstagramFormatFilter) => void;
  posts?: InstagramPostItem[];
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
  // Multi-select props
  isSelectMode?: boolean;
  onToggleSelectMode?: () => void;
  selectedCount?: number;
  onSelectAll?: () => void;
  // Filter modal
  onOpenFilterModal?: () => void;
  isCustomized?: boolean;
}

export function InstagramSortToolbar({
  formatFilter,
  onFormatFilterChange,
  posts = [],
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
  isSelectMode = false,
  onToggleSelectMode,
  selectedCount = 0,
  onSelectAll,
  onOpenFilterModal,
  isCustomized = false,
}: Props) {
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);

  const reelsCount = useMemo(
    () => (posts || []).filter((p) => p.mediaType === "VIDEO").length,
    [posts]
  );
  const carouselCount = useMemo(
    () => (posts || []).filter((p) => p.mediaType === "CAROUSEL_ALBUM").length,
    [posts]
  );

  const renderSelectButton = () => {
    if (isSelectMode) {
      return (
        <div className="flex items-center gap-1.5 sm:gap-2">
          {onSelectAll && (
            <button
              type="button"
              onClick={onSelectAll}
              className="text-[11px] font-semibold text-orange-600 dark:text-orange-400 hover:underline cursor-pointer whitespace-nowrap"
            >
              {selectedCount === totalFiltered ? "Deselect" : "Select All"}
            </button>
          )}
          <button
            type="button"
            onClick={onToggleSelectMode}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-all shadow-xs cursor-pointer whitespace-nowrap"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Done ({selectedCount})</span>
          </button>
        </div>
      );
    }
    return (
      <button
        type="button"
        onClick={onToggleSelectMode}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer whitespace-nowrap"
      >
        <Check className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
        <span>Select</span>
      </button>
    );
  };

  // Dynamic clean title
  const getSortTitle = () => {
    switch (sortOption) {
      case "outlier":
        return "Top Outlier Posts";
      case "er":
        return "Highest Engagement Rate";
      case "views":
        return "Most Viewed Posts";
      case "likes":
        return "Most Liked Posts";
      case "comments":
        return "Most Commented Posts";
      case "oldest":
        return "Oldest Posts";
      case "newest":
        return "Latest Posts";
      default:
        return "Top Outlier Posts";
    }
  };

  // Exact sort options matching toolbar with icons
  const sortOptions: {
    value: SortOption;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    hasInfo?: boolean;
  }[] = [
    { value: "outlier", label: "Outlier score", icon: Zap, hasInfo: true },
    { value: "er", label: "Engagement Rate (ER %)", icon: TrendingUp },
    { value: "likes", label: "Likes", icon: Heart },
    { value: "views", label: "Views", icon: Play },
    { value: "comments", label: "Comments", icon: MessageSquare },
    { value: "oldest", label: "Oldest", icon: Clock },
  ];

  const exportFormats: { id: "sheets" | "excel" | "csv" | "json"; label: string }[] = [
    { id: "sheets", label: "Google Sheets" },
    { id: "excel", label: "Excel" },
    { id: "csv", label: "CSV" },
    { id: "json", label: "JSON" },
  ];

  const displayCount = isSelectMode && selectedCount > 0 ? selectedCount : totalFiltered;

  const getDateLabel = (df: DateFilter) => {
    switch (df) {
      case "1w":
        return "1 Week Back";
      case "1m":
        return "1 Month Back";
      case "3m":
        return "3 Months Back";
      case "6m":
        return "6 Months Back";
      case "1y":
        return "1 Year Back";
      default:
        return "All Time";
    }
  };

  const getSubtitle = () => {
    if (filterMode === "date" && dateFilter !== "all") {
      return `Showing ${totalFiltered} Posts from ${getDateLabel(dateFilter)}`;
    }
    if (filterMode === "posts" && postLimit !== "all" && totalFiltered !== totalCount) {
      return `Showing ${totalFiltered} Posts of ${totalCount} total`;
    }
    if (totalFiltered !== totalCount) {
      return `Showing ${totalFiltered} Posts of ${totalCount} total`;
    }
    return `Showing ${totalFiltered} Posts total`;
  };

  return (
    <div className="w-full relative bg-white dark:bg-[#141B31] border-b border-gray-200/80 dark:border-[#2C3246]">
      {/* ========================================================================= */}
      {/* BARIS 1: Judul & Subtitle (Kiri) + Tombol Download & Export (Kanan) */}
      {/* ========================================================================= */}
      <div className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        {/* Kiri: Judul & Subtitle */}
        <div>
          <h3 className="text-lg sm:text-xl font-bold font-heading text-gray-900 dark:text-white tracking-tight">
            {getSortTitle()}
          </h3>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-0.5">
            {getSubtitle()}
          </p>
        </div>

        {/* Kanan: 2 Tombol Aksi (Download & Export) */}
        <div className="w-full sm:w-auto flex items-center gap-2 sm:gap-3 justify-end relative">
          {/* 1. Download Media */}
          <button
            type="button"
            onClick={onDownloadMedia}
            disabled={totalFiltered === 0 || (isSelectMode && selectedCount === 0)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-colors disabled:opacity-50 cursor-pointer"
            title="Download media postingan (foto/video/zip)"
          >
            <Download className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
            <span>Download {isSelectMode && selectedCount > 0 ? `(${selectedCount})` : totalFiltered}</span>
          </button>

          {/* 2. Export Button dengan Border Frame */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsExportMenuOpen((prev) => !prev)}
              disabled={totalFiltered === 0 || (isSelectMode && selectedCount === 0)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all disabled:opacity-50 cursor-pointer ${
                isExportMenuOpen
                  ? "border-orange-500 ring-2 ring-orange-500/20 text-orange-600 dark:text-orange-400 bg-orange-50/50 dark:bg-orange-500/10"
                  : "border-gray-200 dark:border-[#384260] bg-white dark:bg-[#1A2238] hover:bg-gray-50 dark:hover:bg-[#202945] text-gray-800 dark:text-white shadow-2xs"
              }`}
              title="Export data ke Google Sheets, Excel, CSV, atau JSON"
            >
              <Share2 className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
              <span>Export {isSelectMode && selectedCount > 0 ? `(${selectedCount})` : totalFiltered}</span>
            </button>

            {/* Dropdown Menu Export Multi-Format */}
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
      {/* GARIS PEMBATAS TEGAS (DIVIDER HORIZONTAL) */}
      {/* ========================================================================= */}
      <div className="w-full border-t border-gray-200/90 dark:border-[#2C3246]" />

      {/* ========================================================================= */}
      {/* BARIS 2: Tab Format, Filters, Sort By (Statis), Clear all + Select */}
      {/* ========================================================================= */}
      <div className="px-4 py-2.5 sm:py-3 sm:px-5 text-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 sm:gap-4 relative">
        {/* Kiri (Mobile: 2 Sub-baris terstruktur; Desktop: 1 baris menyatu) */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-4 w-full sm:w-auto">
          {/* Sub-Baris 1 (Mobile): Format Tabs di Kiri + Select di Kanan */}
          <div className="flex items-center justify-between w-full sm:w-auto gap-2">
            {formatFilter && onFormatFilterChange && (
              <div className="inline-flex items-center gap-1 p-0.5 bg-gray-100 dark:bg-[#0F172A] rounded-lg border border-gray-200/60 dark:border-[#2C3246] shrink-0">
                <button
                  type="button"
                  onClick={() => onFormatFilterChange("reels")}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                    formatFilter === "reels"
                      ? "bg-white dark:bg-[#141B31] text-blue-600 dark:text-blue-400 shadow-2xs"
                      : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                  }`}
                >
                  <Film className="w-3.5 h-3.5 text-blue-500" />
                  <span>Reels ({reelsCount})</span>
                </button>
                <button
                  type="button"
                  onClick={() => onFormatFilterChange("carousels")}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                    formatFilter === "carousels"
                      ? "bg-white dark:bg-[#141B31] text-purple-600 dark:text-purple-400 shadow-2xs"
                      : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                  }`}
                >
                  <Layers className="w-3.5 h-3.5 text-purple-500" />
                  <span>Carousel ({carouselCount})</span>
                </button>
              </div>
            )}

            {/* Tombol Select (Khusus Mobile: Berada di pojok kanan Sub-Baris 1) */}
            <div className="sm:hidden shrink-0">
              {renderSelectButton()}
            </div>
          </div>

          {/* Sub-Baris 2 (Mobile) / Sejajar di Desktop: Filters + Sort by + Clear all */}
          <div className="flex items-center gap-2.5 sm:gap-3.5 w-full sm:w-auto pt-2 sm:pt-0 border-t border-gray-100 dark:border-[#2C3246]/50 sm:border-t-0">
            {/* Tombol ≡ Filters */}
            <button
              type="button"
              onClick={onOpenFilterModal}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
              <span>Filters</span>
            </button>

            {/* Tombol ⇅ Sort by */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsSortDropdownOpen((prev) => !prev)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                <ArrowUpDown className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                <span>Sort by</span>
              </button>

              {/* Popup Menu Sort By Persis Seperti Image 3 */}
              {isSortDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40 bg-transparent"
                    onClick={() => setIsSortDropdownOpen(false)}
                  />
                  <div className="absolute left-0 top-full mt-2 bg-white dark:bg-[#161B2E] border border-gray-200 dark:border-[#2C3246] rounded-2xl shadow-2xl z-50 min-w-[210px] overflow-hidden animate-in fade-in zoom-in-95 duration-150 divide-y divide-gray-100 dark:divide-white/5">
                    {sortOptions.map((opt) => {
                      const isSelected = sortOption === opt.value;
                      const IconComponent = opt.icon;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => {
                            setSortOption(opt.value);
                            setIsSortDropdownOpen(false);
                          }}
                          className={`w-full px-4 py-3 text-left text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                            isSelected
                              ? "bg-orange-500/10 text-orange-600 dark:text-orange-400 font-bold"
                              : "text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <IconComponent className="w-4 h-4 text-gray-500 dark:text-gray-400 shrink-0" />
                            <span>{opt.label}</span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {opt.hasInfo && (
                              <Info className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600" />
                            )}
                            {isSelected && (
                              <Check className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400 stroke-[2.5]" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {/* Tombol Clear all */}
            {isCustomized && (
              <button
                type="button"
                onClick={onResetFilters}
                className="text-xs font-medium text-gray-400 hover:text-rose-500 transition-colors cursor-pointer"
                title="Reset ke pengaturan default"
              >
                Clear all
              </button>
            )}
          </div>
        </div>

        {/* Kanan (Khusus Desktop: Tetap di pojok kanan Baris 2) */}
        <div className="hidden sm:flex items-center gap-2 shrink-0">
          {renderSelectButton()}
        </div>
      </div>
    </div>
  );
}
