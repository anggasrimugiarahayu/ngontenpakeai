"use client";

import React, { useState } from "react";
import {
  YouTubeFormatFilter,
  YouTubeSortOption,
  YouTubeVideoItem,
  YouTubeChannelProfile,
} from "./types";
import {
  Flame,
  Eye,
  Clock,
  Download,
  Search,
  FileSpreadsheet,
  FileText,
  Copy,
  Check,
  ChevronDown,
} from "lucide-react";
import {
  exportYouTubeToCSV,
  exportYouTubeToExcel,
  copyYouTubeToGoogleSheets,
  exportYouTubeToJSON,
} from "./exportUtils";

interface Props {
  formatFilter: YouTubeFormatFilter;
  onFormatFilterChange: (format: YouTubeFormatFilter) => void;
  sortOption: YouTubeSortOption;
  onSortOptionChange: (sort: YouTubeSortOption) => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  videos: YouTubeVideoItem[];
  profile: YouTubeChannelProfile;
  totalFilteredCount: number;
}

export function YouTubeSortToolbar({
  formatFilter,
  onFormatFilterChange,
  sortOption,
  onSortOptionChange,
  searchQuery,
  onSearchQueryChange,
  videos,
  profile,
  totalFilteredCount,
}: Props) {
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [copiedSheets, setCopiedSheets] = useState(false);

  const handleCopySheets = async () => {
    const success = await copyYouTubeToGoogleSheets(videos, profile);
    if (success) {
      setCopiedSheets(true);
      setTimeout(() => setCopiedSheets(false), 2500);
    }
  };

  return (
    <div className="w-full space-y-3">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-white dark:bg-[#141B2D] border border-gray-200 dark:border-[#232D42] rounded-2xl p-3 sm:p-4 shadow-xs">
        {/* Sisi Kiri: Format Tabs (Semua / Shorts / Video) */}
        <div className="flex items-center gap-1.5 p-1 bg-gray-100 dark:bg-[#0B0F19] rounded-xl overflow-x-auto shrink-0">
          <button
            onClick={() => onFormatFilterChange("all")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
              formatFilter === "all"
                ? "bg-white dark:bg-[#141B2D] text-gray-900 dark:text-white shadow-xs"
                : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            }`}
          >
            Semua ({videos.length})
          </button>
          <button
            onClick={() => onFormatFilterChange("shorts")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1 cursor-pointer ${
              formatFilter === "shorts"
                ? "bg-white dark:bg-[#141B2D] text-red-600 dark:text-red-400 shadow-xs"
                : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-red-500" />
            Shorts ({videos.filter((v) => v.isShorts).length})
          </button>
          <button
            onClick={() => onFormatFilterChange("videos")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
              formatFilter === "videos"
                ? "bg-white dark:bg-[#141B2D] text-gray-900 dark:text-white shadow-xs"
                : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            }`}
          >
            Video Reguler ({videos.filter((v) => !v.isShorts).length})
          </button>
        </div>

        {/* Sisi Kanan: Search + Sort + Export */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Search Judul Video */}
          <div className="relative flex-1 sm:w-48 lg:w-56">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari judul video..."
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-gray-50 dark:bg-[#0B0F19] border border-gray-200 dark:border-[#232D42] rounded-xl text-xs text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-hidden focus:ring-1 focus:ring-red-500"
            />
          </div>

          {/* Sortir Dropdown */}
          <div className="relative shrink-0">
            <select
              value={sortOption}
              onChange={(e) => onSortOptionChange(e.target.value as YouTubeSortOption)}
              aria-label="Urutkan Video"
              className="appearance-none pl-3 pr-8 py-1.5 bg-gray-50 dark:bg-[#0B0F19] border border-gray-200 dark:border-[#232D42] rounded-xl text-xs font-semibold text-gray-800 dark:text-gray-200 focus:outline-hidden focus:ring-1 focus:ring-red-500 cursor-pointer"
            >
              <option value="outlier">⚡ Outlier Tertinggi</option>
              <option value="views">👁️ Views Terbanyak</option>
              <option value="newest">🕒 Video Terbaru</option>
              <option value="oldest">⏳ Video Terlama</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          {/* Tombol Ekspor Dropdown */}
          <div className="relative shrink-0">
            <button
              onClick={() => setIsExportOpen(!isExportOpen)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold transition-colors shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Ekspor</span>
              <ChevronDown className="w-3 h-3 ml-0.5" />
            </button>

            {isExportOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsExportOpen(false)}
                />
                <div className="absolute right-0 mt-1.5 w-48 bg-white dark:bg-[#141B2D] border border-gray-200 dark:border-[#232D42] rounded-xl shadow-xl z-50 p-1.5 space-y-0.5 animate-in fade-in slide-in-from-top-2 duration-150 text-xs">
                  <button
                    onClick={() => {
                      exportYouTubeToCSV(videos, profile);
                      setIsExportOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-[#0B0F19] flex items-center gap-2 text-gray-700 dark:text-gray-300 font-medium cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-blue-500" />
                    <span>Download CSV</span>
                  </button>
                  <button
                    onClick={() => {
                      exportYouTubeToExcel(videos, profile);
                      setIsExportOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-[#0B0F19] flex items-center gap-2 text-gray-700 dark:text-gray-300 font-medium cursor-pointer"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Download Excel (.xls)</span>
                  </button>
                  <button
                    onClick={() => {
                      handleCopySheets();
                      setIsExportOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-[#0B0F19] flex items-center gap-2 text-gray-700 dark:text-gray-300 font-medium cursor-pointer"
                  >
                    {copiedSheets ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-amber-500" />
                    )}
                    <span>{copiedSheets ? "Tersalin!" : "Salin ke Google Sheets"}</span>
                  </button>
                  <button
                    onClick={() => {
                      exportYouTubeToJSON(videos, profile);
                      setIsExportOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-[#0B0F19] flex items-center gap-2 text-gray-700 dark:text-gray-300 font-medium cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-purple-500" />
                    <span>Download JSON</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 px-1">
        <span>Menampilkan {totalFilteredCount} konten video</span>
        <span className="text-[11px] text-gray-400">
          Badge ⚡ Outlier = Views $\ge 2.0\times$ rata-rata channel
        </span>
      </div>
    </div>
  );
}
