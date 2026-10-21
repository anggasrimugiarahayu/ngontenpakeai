"use client";

import React, { useState, useRef, useEffect } from "react";
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
  Flame,
} from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
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
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

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

  return (
    <div
      ref={containerRef}
      className="absolute top-full right-0 mt-2 z-50 w-80 sm:w-88 bg-white dark:bg-[#18181b] border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl p-4 sm:p-5 text-gray-900 dark:text-white animate-in zoom-in-95 fade-in duration-150"
    >
      {/* Header Modal / Dropdown */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-orange-500/10 text-orange-500 flex items-center justify-center font-bold text-xs">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-base font-heading">Sort Feed</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 cursor-pointer"
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
        <div className="grid grid-cols-2 gap-1 p-1 bg-gray-100 dark:bg-white/5 rounded-xl border border-gray-200/60 dark:border-white/5">
          <button
            type="button"
            onClick={() => {
              setFilterMode("posts");
              setIsDropdownOpen(false);
            }}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filterMode === "posts"
                ? "bg-white dark:bg-[#202023] text-gray-900 dark:text-white shadow-xs"
                : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>Posts</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setFilterMode("date");
              setIsDropdownOpen(false);
            }}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filterMode === "date"
                ? "bg-white dark:bg-[#202023] text-gray-900 dark:text-white shadow-xs"
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
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-blue-500/80 ring-2 ring-blue-500/20 bg-white dark:bg-[#202023] text-xs font-semibold text-gray-900 dark:text-white cursor-pointer"
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
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-white dark:bg-[#202023] border border-gray-200 dark:border-white/10 rounded-xl shadow-xl overflow-hidden z-20 animate-in fade-in zoom-in-95 duration-100">
              {filterMode === "posts"
                ? postLimitOptions.map((opt) => (
                    <button
                      key={String(opt.value)}
                      type="button"
                      onClick={() => {
                        setPostLimit(opt.value);
                        setIsDropdownOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-medium hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer border-b border-gray-50 dark:border-white/5 last:border-0"
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
                      onClick={() => {
                        setDateFilter(opt.value);
                        setIsDropdownOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-medium hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer border-b border-gray-50 dark:border-white/5 last:border-0"
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

      {/* Section 2: Sort by (Gambar 2) */}
      <div className="pt-3 border-t border-gray-100 dark:border-white/10 space-y-2">
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
          Sort by
        </p>

        <div className="space-y-1">
          {/* Outlier score (Viral) */}
          <button
            type="button"
            onClick={() => setSortOption("outlier")}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              sortOption === "outlier"
                ? "bg-orange-50 dark:bg-orange-500/10 text-rn-accent font-bold"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>Outlier score</span>
            </div>
            {sortOption === "outlier" && <Check className="w-4 h-4 text-rn-accent" />}
          </button>

          {/* Views */}
          <button
            type="button"
            onClick={() => setSortOption("views")}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              sortOption === "views"
                ? "bg-orange-50 dark:bg-orange-500/10 text-rn-accent font-bold"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Play className="w-4 h-4 text-orange-500" />
              <span>Views</span>
            </div>
            {sortOption === "views" && <Check className="w-4 h-4 text-rn-accent" />}
          </button>

          {/* Likes */}
          <button
            type="button"
            onClick={() => setSortOption("likes")}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              sortOption === "likes"
                ? "bg-orange-50 dark:bg-orange-500/10 text-rn-accent font-bold"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Heart className="w-4 h-4 text-rose-500" />
              <span>Likes</span>
            </div>
            {sortOption === "likes" && <Check className="w-4 h-4 text-rn-accent" />}
          </button>

          {/* Comments */}
          <button
            type="button"
            onClick={() => setSortOption("comments")}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              sortOption === "comments"
                ? "bg-orange-50 dark:bg-orange-500/10 text-rn-accent font-bold"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <MessageSquare className="w-4 h-4 text-blue-500" />
              <span>Comments</span>
            </div>
            {sortOption === "comments" && <Check className="w-4 h-4 text-rn-accent" />}
          </button>

          {/* Oldest */}
          <button
            type="button"
            onClick={() => setSortOption("oldest")}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              sortOption === "oldest"
                ? "bg-orange-50 dark:bg-orange-500/10 text-rn-accent font-bold"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-gray-500" />
              <span>Oldest</span>
            </div>
            {sortOption === "oldest" && <Check className="w-4 h-4 text-rn-accent" />}
          </button>
        </div>
      </div>

      {/* Footer / Reset Action */}
      <div className="mt-4 pt-3 border-t border-gray-100 dark:border-white/10 flex items-center justify-between">
        <button
          type="button"
          onClick={onReset}
          className="text-xs font-semibold text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors cursor-pointer"
        >
          Reset Filter
        </button>
        <button
          type="button"
          onClick={onClose}
          className="px-3.5 py-1.5 rounded-lg bg-rn-accent hover:bg-orange-600 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
        >
          Terapkan
        </button>
      </div>
    </div>
  );
}
