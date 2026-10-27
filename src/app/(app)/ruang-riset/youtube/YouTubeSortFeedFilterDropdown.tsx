"use client";

import React, { useState } from "react";
import {
  YouTubeSortOption,
  YouTubeFilterMode,
  YouTubeVideoLimit,
  YouTubeDateFilter,
} from "./types";
import {
  SlidersHorizontal,
  Grid,
  Calendar,
  ChevronDown,
  Check,
  Heart,
  Play,
  Zap,
  MessageSquare,
  Clock,
  X,
} from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onApply?: () => void;
  filterMode: YouTubeFilterMode;
  setFilterMode: (val: YouTubeFilterMode) => void;
  videoLimit: YouTubeVideoLimit;
  setVideoLimit: (val: YouTubeVideoLimit) => void;
  dateFilter: YouTubeDateFilter;
  setDateFilter: (val: YouTubeDateFilter) => void;
  sortOption: YouTubeSortOption;
  setSortOption: (val: YouTubeSortOption) => void;
  onReset: () => void;
}

export function YouTubeSortFeedFilterDropdown({
  isOpen,
  onClose,
  onApply,
  filterMode,
  setFilterMode,
  videoLimit,
  setVideoLimit,
  dateFilter,
  setDateFilter,
  sortOption,
  setSortOption,
  onReset,
}: Props) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  if (!isOpen) return null;

  const videoLimitOptions: { label: string; value: YouTubeVideoLimit }[] = [
    { label: "Latest 25 Videos", value: 25 },
    { label: "Latest 50 Videos", value: 50 },
    { label: "Latest 100 Videos", value: 100 },
    { label: "All Videos", value: "all" },
  ];

  const dateFilterOptions: { label: string; value: YouTubeDateFilter }[] = [
    { label: "1 Week Back", value: "1w" },
    { label: "1 Month Back", value: "1m" },
    { label: "3 Months Back", value: "3m" },
    { label: "6 Months Back", value: "6m" },
    { label: "1 Year Back", value: "1y" },
    { label: "All Time", value: "all" },
  ];

  const currentSelectLabel =
    filterMode === "videos"
      ? videoLimitOptions.find((o) => o.value === videoLimit)?.label ||
        "Latest 25 Videos"
      : dateFilterOptions.find((o) => o.value === dateFilter)?.label ||
        "All Time";

  const handleApply = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onApply) onApply();
    onClose();
  };

  return (
    <>
      {/* Backdrop semi-transparan untuk menutup modal saat klik luar */}
      <div
        className="fixed inset-0 z-40 bg-black/20 dark:bg-black/40 backdrop-blur-[0.5px]"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
      />

      {/* Kontainer Dropdown: Compact, Sleek, Sesuai Style App & Identik dengan Instagram */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="absolute top-full right-0 mt-1.5 z-50 w-72 sm:w-80 bg-white dark:bg-[#141B31] border border-gray-200 dark:border-[#2C3246] rounded-xl shadow-2xl p-3 sm:p-3.5 text-gray-900 dark:text-white animate-in zoom-in-95 fade-in duration-150"
      >
        {/* Header Dropdown (Compact) */}
        <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-[#2C3246]">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-md bg-orange-500/10 text-orange-500 flex items-center justify-center font-bold">
              <SlidersHorizontal className="w-3 h-3" />
            </div>
            <h3 className="font-bold text-xs sm:text-sm font-heading">
              Sort &amp; Filter YouTube
            </h3>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-[#1f2947] text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Section 1: Filters (Videos Limit / Tanggal) */}
        <div className="py-2.5 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 text-left">
              Filters
            </p>
          </div>

          {/* Tab Switcher: [ ⊞ Videos ] | [ 📅 Date ] */}
          <div className="grid grid-cols-2 gap-1 p-0.5 bg-gray-100 dark:bg-[#0F172A] rounded-lg border border-gray-200/60 dark:border-[#2C3246]">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setFilterMode("videos");
                setIsDropdownOpen(false);
              }}
              className={`flex items-center justify-center gap-1.5 py-1 px-2 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                filterMode === "videos"
                  ? "bg-white dark:bg-[#141B31] text-gray-900 dark:text-white shadow-2xs"
                  : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              }`}
            >
              <Grid className="w-3 h-3" />
              <span>Videos</span>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setFilterMode("date");
                setIsDropdownOpen(false);
              }}
              className={`flex items-center justify-center gap-1.5 py-1 px-2 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                filterMode === "date"
                  ? "bg-white dark:bg-[#141B31] text-gray-900 dark:text-white shadow-2xs"
                  : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              }`}
            >
              <Calendar className="w-3 h-3" />
              <span>Date</span>
            </button>
          </div>

          {/* Dynamic Select Dropdown (Videos / Date options) */}
          <div className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsDropdownOpen((prev) => !prev);
              }}
              className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg border border-orange-500/80 ring-1 ring-orange-500/20 bg-white dark:bg-[#141B31] text-xs font-semibold text-gray-900 dark:text-white cursor-pointer"
            >
              <span>{currentSelectLabel}</span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Expanded Dropdown List */}
            {isDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-[#141B31] border border-gray-200 dark:border-[#2C3246] rounded-lg shadow-xl overflow-hidden z-20 animate-in fade-in zoom-in-95 duration-100">
                {filterMode === "videos"
                  ? videoLimitOptions.map((opt) => (
                      <button
                        key={String(opt.value)}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setVideoLimit(opt.value);
                          setIsDropdownOpen(false);
                        }}
                        className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-medium hover:bg-gray-50 dark:hover:bg-[#1f2947] transition-colors cursor-pointer border-b border-gray-50 dark:border-[#2C3246]/50 last:border-0"
                      >
                        <span
                          className={
                            videoLimit === opt.value
                              ? "font-bold text-gray-900 dark:text-white"
                              : "text-gray-600 dark:text-gray-300"
                          }
                        >
                          {opt.label}
                        </span>
                        {videoLimit === opt.value && (
                          <Check className="w-3.5 h-3.5 text-rn-accent" />
                        )}
                      </button>
                    ))
                  : dateFilterOptions.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDateFilter(opt.value);
                          setIsDropdownOpen(false);
                        }}
                        className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-medium hover:bg-gray-50 dark:hover:bg-[#1f2947] transition-colors cursor-pointer border-b border-gray-50 dark:border-[#2C3246]/50 last:border-0"
                      >
                        <span
                          className={
                            dateFilter === opt.value
                              ? "font-bold text-gray-900 dark:text-white"
                              : "text-gray-600 dark:text-gray-300"
                          }
                        >
                          {opt.label}
                        </span>
                        {dateFilter === opt.value && (
                          <Check className="w-3.5 h-3.5 text-rn-accent" />
                        )}
                      </button>
                    ))}
              </div>
            )}
          </div>
        </div>

        {/* Section 2: Sort by (Compact List) */}
        <div className="pt-2 border-t border-gray-100 dark:border-[#2C3246] space-y-1">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 text-left">
            Sort
          </p>

          <div className="space-y-0.5">
            {/* Likes */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSortOption("likes");
              }}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                sortOption === "likes"
                  ? "bg-orange-50 dark:bg-orange-500/10 text-rn-accent font-bold"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#1f2947]"
              }`}
            >
              <div className="flex items-center gap-2">
                <Heart className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                <span>Likes</span>
              </div>
              {sortOption === "likes" && (
                <Check className="w-3.5 h-3.5 text-rn-accent" />
              )}
            </button>

            {/* Views */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSortOption("views");
              }}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                sortOption === "views"
                  ? "bg-orange-50 dark:bg-orange-500/10 text-rn-accent font-bold"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#1f2947]"
              }`}
            >
              <div className="flex items-center gap-2">
                <Play className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                <span>Views</span>
              </div>
              {sortOption === "views" && (
                <Check className="w-3.5 h-3.5 text-rn-accent" />
              )}
            </button>

            {/* Outlier score */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSortOption("outlier");
              }}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                sortOption === "outlier"
                  ? "bg-orange-50 dark:bg-orange-500/10 text-rn-accent font-bold"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#1f2947]"
              }`}
            >
              <div className="flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                <span>Outlier score</span>
              </div>
              {sortOption === "outlier" && (
                <Check className="w-3.5 h-3.5 text-rn-accent" />
              )}
            </button>

            {/* Comments */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSortOption("comments");
              }}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                sortOption === "comments"
                  ? "bg-orange-50 dark:bg-orange-500/10 text-rn-accent font-bold"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#1f2947]"
              }`}
            >
              <div className="flex items-center gap-2">
                <MessageSquare className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                <span>Comments</span>
              </div>
              {sortOption === "comments" && (
                <Check className="w-3.5 h-3.5 text-rn-accent" />
              )}
            </button>

            {/* Oldest */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSortOption("oldest");
              }}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                sortOption === "oldest"
                  ? "bg-orange-50 dark:bg-orange-500/10 text-rn-accent font-bold"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#1f2947]"
              }`}
            >
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                <span>Oldest</span>
              </div>
              {sortOption === "oldest" && (
                <Check className="w-3.5 h-3.5 text-rn-accent" />
              )}
            </button>
          </div>
        </div>

        {/* Footer: Reset & Terapkan (Compact) */}
        <div className="mt-3 pt-2 border-t border-gray-100 dark:border-[#2C3246] flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onReset();
            }}
            className="text-[11px] font-semibold text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors cursor-pointer"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="px-3 py-1.5 rounded-lg bg-[#f97316] hover:bg-[#ea580c] dark:bg-[#f97316] dark:hover:bg-[#fb923c] text-white font-bold text-xs shadow-sm shadow-orange-500/20 transition-all cursor-pointer transform active:scale-95"
          >
            Apply Filter
          </button>
        </div>
      </div>
    </>
  );
}
