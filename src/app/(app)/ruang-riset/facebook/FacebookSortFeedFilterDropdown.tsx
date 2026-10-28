"use client";

import React, { useState } from "react";
import {
  FacebookSortOption,
  FacebookFilterMode,
  FacebookVideoLimit,
  FacebookDateFilter,
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
  Forward,
  MessageSquare,
  Clock,
  X,
  TrendingUp,
} from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onApply?: () => void;
  filterMode: FacebookFilterMode;
  setFilterMode: (val: FacebookFilterMode) => void;
  videoLimit: FacebookVideoLimit;
  setVideoLimit: (val: FacebookVideoLimit) => void;
  dateFilter: FacebookDateFilter;
  setDateFilter: (val: FacebookDateFilter) => void;
  sortOption: FacebookSortOption;
  setSortOption: (val: FacebookSortOption) => void;
  onReset: () => void;
}

export function FacebookSortFeedFilterDropdown({
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

  const videoLimitOptions: { label: string; value: FacebookVideoLimit }[] = [
    { label: "Latest 25 Posts", value: 25 },
    { label: "Latest 50 Posts", value: 50 },
    { label: "Latest 100 Posts", value: 100 },
    { label: "All Posts", value: "all" },
  ];

  const dateFilterOptions: { label: string; value: FacebookDateFilter }[] = [
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
        "Latest 25 Posts"
      : dateFilterOptions.find((o) => o.value === dateFilter)?.label ||
        "All Time";

  const handleApply = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onApply) onApply();
    onClose();
  };

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/20 dark:bg-black/40 backdrop-blur-[0.5px]"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
      />

      <div
        onClick={(e) => e.stopPropagation()}
        className="absolute top-full right-0 mt-1.5 z-50 w-72 sm:w-80 bg-white dark:bg-[#141B31] border border-gray-200 dark:border-[#2C3246] rounded-xl shadow-2xl p-3 sm:p-3.5 text-gray-900 dark:text-white animate-in zoom-in-95 fade-in duration-150"
      >
        <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-[#2C3246]">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-md bg-orange-500/10 text-orange-500 flex items-center justify-center font-bold">
              <SlidersHorizontal className="w-3 h-3" />
            </div>
            <h3 className="font-bold text-xs sm:text-sm font-heading">
              Sort &amp; Filter Facebook
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

        {/* Section 1: Filters (Posts Limit / Date) */}
        <div className="py-2.5 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 text-left">
              Filters
            </p>
          </div>

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
              <span>Posts</span>
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

        {/* Section 2: Sort by */}
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

            {/* Engagement Rate */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSortOption("er");
              }}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                sortOption === "er"
                  ? "bg-orange-50 dark:bg-orange-500/10 text-rn-accent font-bold"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#1f2947]"
              }`}
            >
              <div className="flex items-center gap-2">
                <TrendingUp className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                <span>Engagement Rate</span>
              </div>
              {sortOption === "er" && (
                <Check className="w-3.5 h-3.5 text-rn-accent" />
              )}
            </button>

            {/* Shares */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSortOption("shares");
              }}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                sortOption === "shares"
                  ? "bg-orange-50 dark:bg-orange-500/10 text-rn-accent font-bold"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#1f2947]"
              }`}
            >
              <div className="flex items-center gap-2">
                <Forward className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                <span>Shares</span>
              </div>
              {sortOption === "shares" && (
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

        {/* Footer Actions */}
        <div className="pt-2.5 mt-2 border-t border-gray-100 dark:border-[#2C3246] grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onReset();
            }}
            className="py-1.5 px-3 rounded-lg border border-gray-200 dark:border-[#2C3246] hover:bg-gray-50 dark:hover:bg-[#1f2947] font-semibold text-xs text-gray-600 dark:text-gray-300 transition-colors cursor-pointer"
          >
            Reset
          </button>

          <button
            type="button"
            onClick={handleApply}
            className="py-1.5 px-3 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
          >
            Apply
          </button>
        </div>
      </div>
    </>
  );
}
