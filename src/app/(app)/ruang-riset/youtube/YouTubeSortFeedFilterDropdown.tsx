"use client";

import React, { useState } from "react";
import {
  YouTubeSortOption,
  YouTubeFilterMode,
  YouTubeVideoLimit,
  YouTubeDateFilter,
} from "./types";
import {
  X,
  Heart,
  Zap,
  MessageSquare,
  Clock,
  Calendar,
  ChevronDown,
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
  totalFilteredCount?: number;
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
  totalFilteredCount = 25,
}: Props) {
  const [metricTab, setMetricTab] = useState<"likes" | "outlier" | "comments">("outlier");
  const [postedTab, setPostedTab] = useState<"in_last" | "between">("in_last");
  const [inLastValue, setInLastValue] = useState("3");
  const [inLastUnit, setInLastUnit] = useState<"months" | "weeks" | "days">("months");
  const [isUnitDropdownOpen, setIsUnitDropdownOpen] = useState(false);

  // Range values
  const [minValue, setMinValue] = useState("0");
  const [maxValue, setMaxValue] = useState("50000");

  if (!isOpen) return null;

  const handleApply = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onApply) onApply();
    onClose();
  };

  // Mock bar chart heights for visualization
  const barHeights = [
    30, 45, 60, 75, 85, 95, 100, 80, 65, 55, 45, 35, 25, 20, 15,
    30, 50, 70, 65, 55, 40, 30, 25, 20, 15, 18, 22, 25, 30, 20, 15, 10,
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card (Sesuai Screenshot Image 2) */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md bg-[#161D2F] text-white border border-[#27324B] rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#252E44]">
          <div className="w-6" />
          <h3 className="font-bold text-sm sm:text-base tracking-wide text-white">
            Filters
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-6 text-xs">
          {/* Section 1: Performance range */}
          <div className="space-y-3">
            <p className="font-semibold text-gray-400 text-xs">
              Performance range
            </p>

            {/* Performance Metric Pills */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setMetricTab("likes")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  metricTab === "likes"
                    ? "bg-[#25324E] text-white border border-blue-500/50"
                    : "bg-[#1E263B] text-gray-400 border border-transparent hover:text-white"
                }`}
              >
                <Heart className="w-3.5 h-3.5" />
                <span>Likes</span>
              </button>

              <button
                type="button"
                onClick={() => setMetricTab("outlier")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  metricTab === "outlier"
                    ? "bg-[#25324E] text-white border border-blue-500/50"
                    : "bg-[#1E263B] text-gray-400 border border-transparent hover:text-white"
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Outlier score</span>
              </button>

              <button
                type="button"
                onClick={() => setMetricTab("comments")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  metricTab === "comments"
                    ? "bg-[#25324E] text-white border border-blue-500/50"
                    : "bg-[#1E263B] text-gray-400 border border-transparent hover:text-white"
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Comments</span>
              </button>
            </div>

            {/* Distribution Histogram & Dual Slider */}
            <div className="pt-2 space-y-2">
              {/* Bars */}
              <div className="h-12 flex items-end gap-0.5 px-1">
                {barHeights.map((h, i) => (
                  <div
                    key={i}
                    style={{ height: `${h}%` }}
                    className="flex-1 bg-blue-500/60 rounded-xs hover:bg-blue-400 transition-colors"
                  />
                ))}
              </div>

              {/* Slider Track with Knobs */}
              <div className="relative w-full h-1 bg-blue-500/80 rounded-full flex items-center justify-between">
                <div className="w-4 h-4 rounded-full bg-white shadow-md border-2 border-blue-500 cursor-pointer -ml-1" />
                <div className="w-4 h-4 rounded-full bg-white shadow-md border-2 border-blue-500 cursor-pointer -mr-1" />
              </div>

              {/* Min - Max Inputs */}
              <div className="pt-2 flex items-center justify-between gap-3">
                <div className="flex-1 space-y-1">
                  <span className="text-[10px] text-gray-400 font-medium">Min</span>
                  <input
                    type="text"
                    value={minValue}
                    onChange={(e) => setMinValue(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#1E263B] border border-[#2B354F] text-white font-bold text-xs focus:outline-hidden focus:border-blue-500"
                  />
                </div>
                <span className="text-gray-400 pt-5 font-bold">—</span>
                <div className="flex-1 space-y-1">
                  <span className="text-[10px] text-gray-400 font-medium">Max</span>
                  <input
                    type="text"
                    value={maxValue}
                    onChange={(e) => setMaxValue(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#1E263B] border border-[#2B354F] text-white font-bold text-xs focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-[#252E44]" />

          {/* Section 2: Posted */}
          <div className="space-y-3">
            <p className="font-semibold text-gray-400 text-xs">
              Posted
            </p>

            {/* In the last / Between Pills */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPostedTab("in_last")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  postedTab === "in_last"
                    ? "bg-[#1E263B] text-white ring-2 ring-orange-500/80 border border-orange-500/40"
                    : "bg-[#1E263B] text-gray-400 border border-transparent hover:text-white"
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>In the last</span>
              </button>

              <button
                type="button"
                onClick={() => setPostedTab("between")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  postedTab === "between"
                    ? "bg-[#1E263B] text-white ring-2 ring-orange-500/80 border border-orange-500/40"
                    : "bg-[#1E263B] text-gray-400 border border-transparent hover:text-white"
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Between</span>
              </button>
            </div>

            {/* Inputs based on tab */}
            {postedTab === "in_last" ? (
              <div className="grid grid-cols-2 gap-3 pt-1">
                <input
                  type="number"
                  min="0"
                  value={inLastValue}
                  onChange={(e) => setInLastValue(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#1E263B] border border-[#2B354F] text-white font-bold text-xs focus:outline-hidden focus:border-blue-500"
                  placeholder="0"
                />

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsUnitDropdownOpen((p) => !p)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-[#1E263B] border border-[#2B354F] text-white font-bold text-xs cursor-pointer"
                  >
                    <span className="capitalize">{inLastUnit}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                  </button>

                  {isUnitDropdownOpen && (
                    <div className="absolute left-0 right-0 top-full mt-1 bg-[#1E263B] border border-[#2B354F] rounded-xl shadow-xl overflow-hidden z-20">
                      {(["days", "weeks", "months"] as const).map((u) => (
                        <button
                          key={u}
                          type="button"
                          onClick={() => {
                            setInLastUnit(u);
                            setIsUnitDropdownOpen(false);
                            if (u === "months") setDateFilter("3m");
                            else if (u === "weeks") setDateFilter("1w");
                            else setDateFilter("all");
                          }}
                          className="w-full px-3 py-2 text-left text-xs font-semibold hover:bg-white/10 capitalize"
                        >
                          {u}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 pt-1">
                <input
                  type="date"
                  className="w-full px-3 py-2 rounded-xl bg-[#1E263B] border border-[#2B354F] text-white font-semibold text-xs focus:outline-hidden focus:border-blue-500"
                />
                <input
                  type="date"
                  className="w-full px-3 py-2 rounded-xl bg-[#1E263B] border border-[#2B354F] text-white font-semibold text-xs focus:outline-hidden focus:border-blue-500"
                />
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 pt-2 flex items-center justify-between gap-3 border-t border-[#252E44]">
          <button
            type="button"
            onClick={() => {
              onReset();
              setMinValue("0");
              setMaxValue("50000");
              setInLastValue("0");
            }}
            className="text-xs font-semibold text-gray-400 hover:text-rose-400 transition-colors cursor-pointer"
          >
            Reset
          </button>

          <button
            type="button"
            onClick={handleApply}
            className="px-5 py-2.5 rounded-xl bg-white hover:bg-gray-100 text-gray-900 font-bold text-xs shadow-lg transition-all cursor-pointer"
          >
            Show {totalFilteredCount} Posts
          </button>
        </div>
      </div>
    </div>
  );
}
