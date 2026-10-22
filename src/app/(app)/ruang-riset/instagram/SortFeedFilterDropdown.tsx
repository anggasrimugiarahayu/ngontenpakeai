"use client";

import React, { useState } from "react";
import {
  SortOption,
  FilterMode,
  PostLimit,
  DateFilter,
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
  filterMode: FilterMode;
  setFilterMode: (val: FilterMode) => void;
  postLimit: PostLimit;
  setPostLimit: (val: PostLimit) => void;
  dateFilter: DateFilter;
  setDateFilter: (val: DateFilter) => void;
  sortOption: SortOption;
  setSortOption: (val: SortOption) => void;
  onReset: () => void;
}

export function SortFeedFilterDropdown({
  isOpen,
  onClose,
  onApply,
  filterMode,
  setFilterMode,
  postLimit,
  setPostLimit,
  dateFilter,
  setDateFilter,
  sortOption,
  setSortOption,
  onReset,
}: Props) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  if (!isOpen) return null;

  const postLimitOptions: { label: string; value: PostLimit }[] = [
    { label: "Latest 25 Posts", value: 25 },
    { label: "Latest 50 Posts", value: 50 },
    { label: "Latest 100 Posts", value: 100 },
    { label: "All Posts", value: "all" },
  ];

  const dateFilterOptions: { label: string; value: DateFilter }[] = [
    { label: "Posts from 1 Week Back", value: "1w" },
    { label: "Posts from 1 Month Back", value: "1m" },
    { label: "Posts from 3 Months Back", value: "3m" },
    { label: "Posts from 6 Months Back", value: "6m" },
    { label: "Posts from 1 Year Back", value: "1y" },
    { label: "All Posts", value: "all" },
  ];

  const currentSelectLabel =
    filterMode === "posts"
      ? postLimitOptions.find((o) => o.value === postLimit)?.label ||
        "Latest 25 Posts"
      : dateFilterOptions.find((o) => o.value === dateFilter)?.label ||
        "All Posts";

  const handleApply = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onApply) onApply();
    onClose();
  };

  return (
    <>
      {/* Backdrop semi-transparan untuk menutup modal saat klik luar (Aman dari bentrok event React) */}
      <div
        className="fixed inset-0 z-40 bg-black/15 dark:bg-black/35 backdrop-blur-[0.5px]"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
      />

      {/* Kontainer Dropdown - stopPropagation menjamin klik di dalam TIDAK PERNAH menutup dropdown */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="absolute top-full right-0 mt-2 z-50 w-80 sm:w-88 bg-white dark:bg-[#141B31] border border-gray-200 dark:border-[#2C3246] rounded-2xl shadow-2xl p-4 sm:p-5 text-gray-900 dark:text-white animate-in zoom-in-95 fade-in duration-150"
      >
        {/* Header Dropdown */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-[#2C3246]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-orange-500/10 text-orange-500 flex items-center justify-center font-bold text-xs">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-base font-heading">Sort & Filter Feed</h3>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-[#1f2947] text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Section 1: Filters */}
        <div className="py-3.5 space-y-3">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
            Filters
          </p>

          {/* Tab Switcher: [ ⊞ Posts ] | [ 📅 Date ] */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-gray-100 dark:bg-[#0F172A] rounded-xl border border-gray-200/60 dark:border-[#2C3246]">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setFilterMode("posts");
                setIsDropdownOpen(false);
              }}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterMode === "posts"
                  ? "bg-white dark:bg-[#141B31] text-gray-900 dark:text-white shadow-xs"
                  : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Posts</span>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setFilterMode("date");
                setIsDropdownOpen(false);
              }}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterMode === "date"
                  ? "bg-white dark:bg-[#141B31] text-gray-900 dark:text-white shadow-xs"
                  : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Date</span>
            </button>
          </div>

          {/* Dynamic Select Dropdown (Posts / Date options) */}
          <div className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsDropdownOpen((prev) => !prev);
              }}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-orange-500/80 ring-2 ring-orange-500/20 bg-white dark:bg-[#141B31] text-xs font-semibold text-gray-900 dark:text-white cursor-pointer"
            >
              <span>{currentSelectLabel}</span>
              <ChevronDown
                className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Expanded Dropdown List */}
            {isDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-white dark:bg-[#141B31] border border-gray-200 dark:border-[#2C3246] rounded-xl shadow-xl overflow-hidden z-20 animate-in fade-in zoom-in-95 duration-100">
                {filterMode === "posts"
                  ? postLimitOptions.map((opt) => (
                      <button
                        key={String(opt.value)}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPostLimit(opt.value);
                          setIsDropdownOpen(false);
                        }}
                        className="w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-medium hover:bg-gray-50 dark:hover:bg-[#1f2947] transition-colors cursor-pointer border-b border-gray-50 dark:border-[#2C3246]/50 last:border-0"
                      >
                        <span
                          className={
                            postLimit === opt.value
                              ? "font-bold text-gray-900 dark:text-white"
                              : "text-gray-600 dark:text-gray-300"
                          }
                        >
                          {opt.label}
                        </span>
                        {postLimit === opt.value && (
                          <Check className="w-4 h-4 text-rn-accent" />
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
                        className="w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-medium hover:bg-gray-50 dark:hover:bg-[#1f2947] transition-colors cursor-pointer border-b border-gray-50 dark:border-[#2C3246]/50 last:border-0"
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
                          <Check className="w-4 h-4 text-rn-accent" />
                        )}
                      </button>
                    ))}
              </div>
            )}
          </div>
        </div>

        {/* Section 2: Sort by (Gambar 2 & 3) */}
        <div className="pt-3 border-t border-gray-100 dark:border-[#2C3246] space-y-2">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
            Sort by
          </p>

          <div className="space-y-1">
            {/* Outlier score (Viral) */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSortOption("outlier");
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                sortOption === "outlier"
                  ? "bg-orange-50 dark:bg-orange-500/10 text-rn-accent font-bold"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#1f2947]"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>Outlier score (Viralitas)</span>
              </div>
              {sortOption === "outlier" && <Check className="w-4 h-4 text-rn-accent" />}
            </button>

            {/* Likes */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSortOption("likes");
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                sortOption === "likes"
                  ? "bg-orange-50 dark:bg-orange-500/10 text-rn-accent font-bold"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#1f2947]"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                <span>Likes Terbanyak</span>
              </div>
              {sortOption === "likes" && <Check className="w-4 h-4 text-rn-accent" />}
            </button>

            {/* Views */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSortOption("views");
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                sortOption === "views"
                  ? "bg-orange-50 dark:bg-orange-500/10 text-rn-accent font-bold"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#1f2947]"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Play className="w-4 h-4 text-orange-500 fill-orange-500" />
                <span>Views Terbanyak</span>
              </div>
              {sortOption === "views" && <Check className="w-4 h-4 text-rn-accent" />}
            </button>

            {/* Comments */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSortOption("comments");
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                sortOption === "comments"
                  ? "bg-orange-50 dark:bg-orange-500/10 text-rn-accent font-bold"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#1f2947]"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <MessageSquare className="w-4 h-4 text-blue-500" />
                <span>Comments Terbanyak</span>
              </div>
              {sortOption === "comments" && <Check className="w-4 h-4 text-rn-accent" />}
            </button>

            {/* Newest */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSortOption("newest");
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                sortOption === "newest"
                  ? "bg-orange-50 dark:bg-orange-500/10 text-rn-accent font-bold"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#1f2947]"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-emerald-500" />
                <span>Newest (Terbaru)</span>
              </div>
              {sortOption === "newest" && <Check className="w-4 h-4 text-rn-accent" />}
            </button>

            {/* Oldest */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSortOption("oldest");
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                sortOption === "oldest"
                  ? "bg-orange-50 dark:bg-orange-500/10 text-rn-accent font-bold"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#1f2947]"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-gray-500" />
                <span>Oldest (Terlama)</span>
              </div>
              {sortOption === "oldest" && <Check className="w-4 h-4 text-rn-accent" />}
            </button>
          </div>
        </div>

        {/* Footer / Reset & Apply Action */}
        <div className="mt-4 pt-3 border-t border-gray-100 dark:border-[#2C3246] flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onReset();
            }}
            className="text-xs font-semibold text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors cursor-pointer"
          >
            Reset Filter
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="px-4 py-2 rounded-xl bg-[#f97316] hover:bg-[#ea580c] dark:bg-[#f97316] dark:hover:bg-[#fb923c] text-white font-bold text-xs shadow-sm shadow-orange-500/20 transition-all cursor-pointer transform active:scale-95"
          >
            Terapkan & Tampilkan Feed
          </button>
        </div>
      </div>
    </>
  );
}
