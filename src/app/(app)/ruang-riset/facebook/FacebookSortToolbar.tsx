"use client";

import React, { useState } from "react";
import {
  FacebookFormatFilter,
  FacebookSortOption,
  FacebookPostItem,
  FacebookUserProfile,
  FacebookFilterMode,
  FacebookVideoLimit,
  FacebookDateFilter,
} from "./types";
import {
  ArrowUpDown,
  Download,
  Share2,
  Copy,
  Check,
  SlidersHorizontal,
  Heart,
  Play,
  Zap,
  Forward,
  MessageSquare,
  Clock,
  Info,
  Film,
  Layers,
} from "lucide-react";
import {
  exportFacebookToCSV,
  exportFacebookToExcel,
  exportFacebookToGoogleSheets,
} from "./exportUtils";
import toast from "react-hot-toast";

interface Props {
  formatFilter: FacebookFormatFilter;
  onFormatFilterChange: (format: FacebookFormatFilter) => void;
  sortOption: FacebookSortOption;
  onSortOptionChange: (sort: FacebookSortOption) => void;
  posts: FacebookPostItem[];
  profile: FacebookUserProfile;
  totalFilteredCount: number;
  onDownloadMedia?: () => void;
  onResetFilters?: () => void;
  isCustomized?: boolean;
  isSelectMode?: boolean;
  onToggleSelectMode?: () => void;
  selectedCount?: number;
  onSelectAll?: () => void;
  onOpenFilterModal?: () => void;
  targetPostsForExport?: FacebookPostItem[];
  filterMode?: FacebookFilterMode;
  videoLimit?: FacebookVideoLimit;
  dateFilter?: FacebookDateFilter;
}

export function FacebookSortToolbar({
  formatFilter,
  onFormatFilterChange,
  sortOption,
  onSortOptionChange,
  posts,
  profile,
  totalFilteredCount,
  onDownloadMedia,
  onResetFilters,
  isCustomized = false,
  isSelectMode = false,
  onToggleSelectMode,
  selectedCount = 0,
  onSelectAll,
  onOpenFilterModal,
  targetPostsForExport,
  filterMode,
  videoLimit,
  dateFilter,
}: Props) {
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);

  const getDateLabel = (df: FacebookDateFilter) => {
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
    if (filterMode === "date" && dateFilter && dateFilter !== "all") {
      return `Showing ${totalFilteredCount} Posts from ${getDateLabel(dateFilter)}`;
    }
    if (
      filterMode === "videos" &&
      videoLimit &&
      videoLimit !== "all" &&
      totalFilteredCount !== posts.length
    ) {
      return `Showing ${totalFilteredCount} Posts of ${posts.length} total`;
    }
    if (totalFilteredCount !== posts.length) {
      return `Showing ${totalFilteredCount} Posts of ${posts.length} total`;
    }
    return `Showing ${totalFilteredCount} Posts total`;
  };

  const getSortTitle = () => {
    switch (sortOption) {
      case "outlier":
        return "Top Outlier Posts";
      case "views":
        return "Most Viewed Posts";
      case "likes":
        return "Most Liked Posts";
      case "shares":
        return "Most Shared Posts";
      case "comments":
        return "Most Commented Posts";
      case "oldest":
        return "Oldest Posts";
      default:
        return "Top Outlier Posts";
    }
  };

  const sortOptions: {
    value: FacebookSortOption;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    hasInfo?: boolean;
  }[] = [
    { value: "likes", label: "Likes", icon: Heart },
    { value: "views", label: "Views", icon: Play },
    { value: "outlier", label: "Outlier score", icon: Zap, hasInfo: true },
    { value: "shares", label: "Shares", icon: Forward },
    { value: "comments", label: "Comments", icon: MessageSquare },
    { value: "oldest", label: "Oldest", icon: Clock },
  ];

  const exportFormats: { id: "sheets" | "excel" | "csv"; label: string }[] = [
    { id: "sheets", label: "Google Sheets" },
    { id: "excel", label: "Excel" },
    { id: "csv", label: "CSV" },
  ];

  const activePosts =
    targetPostsForExport && targetPostsForExport.length > 0
      ? targetPostsForExport
      : posts;

  const handleExportAction = async (format: "sheets" | "excel" | "csv") => {
    try {
      if (format === "sheets") {
        const ok = await exportFacebookToGoogleSheets(activePosts, profile);
        if (ok) {
          toast.success("Data Google Sheets berhasil disalin ke clipboard!");
        }
      } else if (format === "excel") {
        exportFacebookToExcel(activePosts, profile);
        toast.success("File Excel berhasil diunduh!");
      } else if (format === "csv") {
        exportFacebookToCSV(activePosts, profile);
        toast.success("File CSV berhasil diunduh!");
      }
    } catch (err) {
      console.error("Export error:", err);
      toast.error("Gagal mengekspor data");
    }
  };

  const videoReelsCount = posts.filter((v) => !v.isPhoto).length;
  const photoPostsCount = posts.filter((v) => v.isPhoto).length;

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
              {selectedCount === totalFilteredCount ? "Deselect" : "Select All"}
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

  return (
    <div className="w-full relative bg-white dark:bg-[#141B31] border-b border-gray-200/80 dark:border-[#2C3246]">
      {/* BARIS 1: Judul & Subtitle (Kiri) + Tombol Download & Export (Kanan) */}
      <div className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-lg sm:text-xl font-bold font-heading text-gray-900 dark:text-white tracking-tight">
            {getSortTitle()}
          </h3>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-0.5">
            {getSubtitle()}
          </p>
        </div>

        <div className="w-full sm:w-auto flex items-center gap-2 sm:gap-3 justify-end relative">
          <button
            type="button"
            onClick={onDownloadMedia}
            disabled={
              totalFilteredCount === 0 || (isSelectMode && selectedCount === 0)
            }
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-colors disabled:opacity-50 cursor-pointer"
            title="Download thumbnail dan info konten"
          >
            <Download className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
            <span>
              Download{" "}
              {isSelectMode && selectedCount > 0
                ? `(${selectedCount})`
                : totalFilteredCount}
            </span>
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setIsExportMenuOpen((prev) => !prev)}
              disabled={
                totalFilteredCount === 0 ||
                (isSelectMode && selectedCount === 0)
              }
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all disabled:opacity-50 cursor-pointer ${
                isExportMenuOpen
                  ? "border-orange-500 ring-2 ring-orange-500/20 text-orange-600 dark:text-orange-400 bg-orange-50/50 dark:bg-orange-500/10"
                  : "border-gray-200 dark:border-[#384260] bg-white dark:bg-[#1A2238] hover:bg-gray-50 dark:hover:bg-[#202945] text-gray-800 dark:text-white shadow-2xs"
              }`}
              title="Export data konten ke Google Sheets, Excel, atau CSV"
            >
              <Share2 className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
              <span>
                Export{" "}
                {isSelectMode && selectedCount > 0
                  ? `(${selectedCount})`
                  : totalFilteredCount}
              </span>
            </button>

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
                            handleExportAction(fmt.id);
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
                            handleExportAction(fmt.id);
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

      <div className="w-full border-t border-gray-200/90 dark:border-[#2C3246]" />

      {/* BARIS 2: Tab Format, Filters, Sort By + Select */}
      <div className="px-4 py-2.5 sm:py-3 sm:px-5 text-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 sm:gap-4 relative">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-4 w-full sm:w-auto">
          <div className="flex items-center justify-between w-full sm:w-auto gap-2">
            <div className="inline-flex items-center gap-1 p-0.5 bg-gray-100 dark:bg-[#0F172A] rounded-lg border border-gray-200/60 dark:border-[#2C3246] shrink-0">
              <button
                type="button"
                onClick={() => onFormatFilterChange("videos")}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                  formatFilter === "videos"
                    ? "bg-white dark:bg-[#141B31] text-gray-900 dark:text-white shadow-2xs"
                    : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                }`}
              >
                <Film className="w-3.5 h-3.5 text-[#1877F2]" />
                <span>Reels &amp; Video ({videoReelsCount})</span>
              </button>

              <button
                type="button"
                onClick={() => onFormatFilterChange("photos")}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                  formatFilter === "photos"
                    ? "bg-white dark:bg-[#141B31] text-gray-900 dark:text-white shadow-2xs"
                    : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-sky-500" />
                <span>Foto ({photoPostsCount})</span>
              </button>
            </div>

            <div className="sm:hidden">{renderSelectButton()}</div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 pt-1 sm:pt-0 border-t border-gray-100 dark:border-[#2C3246]/50 sm:border-0">
            <button
              type="button"
              onClick={onOpenFilterModal}
              className="inline-flex items-center gap-1.5 font-semibold text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
              <span>Filters</span>
            </button>

            <div className="relative">
              <button
                type="button"
                onClick={() => setIsSortDropdownOpen((prev) => !prev)}
                className="inline-flex items-center gap-1.5 font-semibold text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                <ArrowUpDown className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                <span>Sort by</span>
              </button>

              {isSortDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40 bg-transparent"
                    onClick={() => setIsSortDropdownOpen(false)}
                  />
                  <div className="absolute left-0 top-full mt-2 z-50 w-52 bg-white dark:bg-[#161B2E] border border-gray-200 dark:border-[#2C3246] rounded-xl shadow-2xl p-1.5 text-xs text-gray-800 dark:text-gray-200 animate-in zoom-in-95 fade-in duration-150">
                    {sortOptions.map((opt) => {
                      const Icon = opt.icon;
                      const isActive = sortOption === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => {
                            onSortOptionChange(opt.value);
                            setIsSortDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors cursor-pointer ${
                            isActive
                              ? "bg-orange-50 dark:bg-orange-500/15 text-orange-600 dark:text-orange-400 font-bold"
                              : "hover:bg-gray-50 dark:hover:bg-[#1E293B] text-gray-700 dark:text-gray-300 font-semibold"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <Icon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                            <span>{opt.label}</span>
                            {opt.hasInfo && (
                              <Info className="w-3.5 h-3.5 text-gray-400" />
                            )}
                          </div>
                          {isActive && (
                            <Check className="w-4 h-4 text-orange-500" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {isCustomized && onResetFilters && (
              <button
                type="button"
                onClick={onResetFilters}
                className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 font-medium transition-colors cursor-pointer"
              >
                Clear all
              </button>
            )}
          </div>
        </div>

        <div className="hidden sm:flex items-center justify-end">
          {renderSelectButton()}
        </div>
      </div>
    </div>
  );
}
