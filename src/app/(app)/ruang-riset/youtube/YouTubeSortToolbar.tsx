"use client";

import React, { useState } from "react";
import {
  YouTubeFormatFilter,
  YouTubeSortOption,
  YouTubeVideoItem,
  YouTubeChannelProfile,
} from "./types";
import {
  ArrowUpDown,
  Download,
  Share2,
  Copy,
  ChevronDown,
  Check,
} from "lucide-react";
import {
  exportYouTubeToCSV,
  exportYouTubeToExcel,
  copyYouTubeToGoogleSheets,
  exportYouTubeToJSON,
} from "./exportUtils";
import toast from "react-hot-toast";

interface Props {
  formatFilter: YouTubeFormatFilter;
  onFormatFilterChange: (format: YouTubeFormatFilter) => void;
  sortOption: YouTubeSortOption;
  onSortOptionChange: (sort: YouTubeSortOption) => void;
  videos: YouTubeVideoItem[];
  profile: YouTubeChannelProfile;
  totalFilteredCount: number;
}

export function YouTubeSortToolbar({
  formatFilter,
  onFormatFilterChange,
  sortOption,
  onSortOptionChange,
  videos,
  profile,
  totalFilteredCount,
}: Props) {
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);

  const getSortTitle = () => {
    switch (sortOption) {
      case "outlier":
        return "Top Outlier Videos";
      case "views":
        return "Most Viewed Videos";
      case "likes":
        return "Most Liked Videos";
      case "newest":
        return "Latest Videos";
      case "oldest":
        return "Oldest Videos";
      default:
        return "Top Outlier Videos";
    }
  };

  const sortOptions: { value: YouTubeSortOption; label: string }[] = [
    { value: "outlier", label: "Outlier Score" },
    { value: "views", label: "Views Terbanyak" },
    { value: "likes", label: "Likes Terbanyak" },
    { value: "newest", label: "Video Terbaru" },
    { value: "oldest", label: "Video Terlama" },
  ];

  const currentSortLabel =
    sortOptions.find((o) => o.value === sortOption)?.label || "Outlier Score";

  const exportFormats: { id: "sheets" | "excel" | "csv" | "json"; label: string }[] = [
    { id: "sheets", label: "Google Sheets" },
    { id: "excel", label: "Excel" },
    { id: "csv", label: "CSV" },
    { id: "json", label: "JSON" },
  ];

  const handleExportAction = async (
    format: "sheets" | "excel" | "csv" | "json",
    action: "download" | "copy"
  ) => {
    try {
      if (format === "sheets") {
        const ok = await copyYouTubeToGoogleSheets(videos, profile);
        if (ok) {
          toast.success("Data Google Sheets berhasil disalin ke clipboard!");
        }
      } else if (format === "excel") {
        exportYouTubeToExcel(videos, profile);
        toast.success("File Excel berhasil diunduh!");
      } else if (format === "csv") {
        exportYouTubeToCSV(videos, profile);
        toast.success("File CSV berhasil diunduh!");
      } else if (format === "json") {
        exportYouTubeToJSON(videos, profile);
        toast.success("File JSON berhasil diunduh!");
      }
    } catch (err) {
      console.error("Export error:", err);
      toast.error("Gagal mengekspor data");
    }
  };

  const shortsCount = videos.filter((v) => v.isShorts).length;
  const regularCount = videos.filter((v) => !v.isShorts).length;

  return (
    <div className="w-full p-4 sm:p-5 border-b border-gray-100 dark:border-[#2C3246] relative">
      {/* ========================================================================= */}
      {/* BARIS 1: Judul & Subtitle (Kiri) + Tombol Export (Kanan) Identik dengan IG */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3.5">
        <div>
          <h3 className="text-lg sm:text-xl font-bold font-heading text-gray-900 dark:text-white tracking-tight">
            {getSortTitle()}
          </h3>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-0.5">
            Showing {totalFilteredCount} Konten
            {totalFilteredCount !== videos.length && ` (dari total ${videos.length})`}
          </p>
        </div>

        {/* Kanan: Tombol Export Dropdown Multi-Format */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsExportMenuOpen((prev) => !prev)}
            disabled={totalFilteredCount === 0}
            className={`w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2 sm:py-1.5 rounded-lg text-xs font-semibold border transition-all disabled:opacity-50 cursor-pointer ${
              isExportMenuOpen
                ? "border-orange-500 ring-2 ring-orange-500/20 text-orange-600 dark:text-orange-400 bg-orange-50/50 dark:bg-orange-500/10"
                : "border-gray-300 dark:border-[#384260] bg-white hover:bg-gray-50 dark:bg-transparent dark:hover:bg-[#1E293B] text-gray-800 dark:text-white"
            }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Export {totalFilteredCount}</span>
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
                      {/* Tombol Download */}
                      <button
                        type="button"
                        onClick={() => {
                          setIsExportMenuOpen(false);
                          handleExportAction(fmt.id, "download");
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
                          handleExportAction(fmt.id, "copy");
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

      {/* ========================================================================= */}
      {/* BARIS 2: Tab Format Pills + Custom Sort by Dropdown (Style Ruang Automation) */}
      {/* ========================================================================= */}
      <div className="pt-2.5 text-xs flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Format Tabs Pills */}
          <div className="inline-flex items-center gap-1 p-0.5 bg-gray-100 dark:bg-[#0F172A] rounded-lg border border-gray-200/60 dark:border-[#2C3246] shrink-0">
            <button
              type="button"
              onClick={() => onFormatFilterChange("all")}
              className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                formatFilter === "all"
                  ? "bg-white dark:bg-[#141B31] text-gray-900 dark:text-white shadow-2xs"
                  : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              }`}
            >
              Semua ({videos.length})
            </button>
            <button
              type="button"
              onClick={() => onFormatFilterChange("shorts")}
              className={`inline-flex items-center gap-1 px-3 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                formatFilter === "shorts"
                  ? "bg-white dark:bg-[#141B31] text-red-600 dark:text-red-400 shadow-2xs"
                  : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
              <span>Shorts ({shortsCount})</span>
            </button>
            <button
              type="button"
              onClick={() => onFormatFilterChange("videos")}
              className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                formatFilter === "videos"
                  ? "bg-white dark:bg-[#141B31] text-gray-900 dark:text-white shadow-2xs"
                  : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              }`}
            >
              Video Reguler ({regularCount})
            </button>
          </div>

          {/* Custom Selector Sort by (Style Ruang Automation / Custom Select) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsSortDropdownOpen((prev) => !prev)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-[#141B31] border border-gray-200 dark:border-[#2C3246] hover:border-gray-300 dark:hover:border-[#384260] text-xs font-semibold text-gray-800 dark:text-gray-200 transition-all cursor-pointer"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400 shrink-0">
                Sort by:
              </span>
              <span className="font-bold text-gray-900 dark:text-white">
                {currentSortLabel}
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${
                  isSortDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isSortDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40 bg-transparent"
                  onClick={() => setIsSortDropdownOpen(false)}
                />
                <div className="absolute left-0 top-full mt-1.5 bg-white dark:bg-[#141B31] border border-gray-200 dark:border-[#2C3246] rounded-xl shadow-2xl py-1.5 z-50 min-w-[190px] animate-in fade-in zoom-in-95 duration-150">
                  {sortOptions.map((opt) => {
                    const isSelected = sortOption === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => {
                          onSortOptionChange(opt.value);
                          setIsSortDropdownOpen(false);
                        }}
                        className={`w-full px-3.5 py-2 text-left text-xs font-medium flex items-center justify-between transition-colors cursor-pointer ${
                          isSelected
                            ? "bg-orange-500/10 text-orange-600 dark:text-orange-400 font-bold"
                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"
                        }`}
                      >
                        <span>{opt.label}</span>
                        {isSelected && (
                          <Check className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400 stroke-[2.5]" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
