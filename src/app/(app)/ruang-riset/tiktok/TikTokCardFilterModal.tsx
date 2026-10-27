"use client";

import React, { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { TikTokPostItem } from "./types";
import {
  X,
  Play,
  Zap,
  Film,
  Layers,
  Clock,
  Calendar,
  ChevronDown,
  Heart,
  MessageSquare,
  Forward,
  Bookmark,
} from "lucide-react";

export type TikTokPerformanceMetric =
  | "views"
  | "likes"
  | "comments"
  | "shares"
  | "saves"
  | "outlier";

export interface TikTokAdvancedFilterState {
  types: ("videos" | "photos")[];
  metric: TikTokPerformanceMetric;
  minVal: number | null;
  maxVal: number | null;
  postedType: "in_last" | "between";
  inLastValue: number;
  inLastUnit: "days" | "weeks" | "months" | "years";
  startDate?: string;
  endDate?: string;
}

export const DEFAULT_TIKTOK_ADVANCED_FILTER: TikTokAdvancedFilterState = {
  types: [],
  metric: "views",
  minVal: null,
  maxVal: null,
  postedType: "in_last",
  inLastValue: 0,
  inLastUnit: "years",
  startDate: "",
  endDate: "",
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  videos: TikTokPostItem[];
  advancedFilters: TikTokAdvancedFilterState;
  onApplyAdvancedFilters: (filters: TikTokAdvancedFilterState) => void;
  onResetAdvancedFilters: () => void;
}

export function TikTokCardFilterModal({
  isOpen,
  onClose,
  videos,
  advancedFilters,
  onApplyAdvancedFilters,
  onResetAdvancedFilters,
}: Props) {
  // Local state for edits inside the modal
  const [types, setTypes] = useState<("videos" | "photos")[]>(advancedFilters.types);
  const [metric, setMetric] = useState<TikTokPerformanceMetric>(advancedFilters.metric);
  const [postedType, setPostedType] = useState<"in_last" | "between">(advancedFilters.postedType);
  const [inLastValue, setInLastValue] = useState<string>(String(advancedFilters.inLastValue || 0));
  const [inLastUnit, setInLastUnit] = useState<"days" | "weeks" | "months" | "years">(advancedFilters.inLastUnit);
  const [startDate, setStartDate] = useState<string>(advancedFilters.startDate || "");
  const [endDate, setEndDate] = useState<string>(advancedFilters.endDate || "");
  const [isUnitDropdownOpen, setIsUnitDropdownOpen] = useState(false);

  // Sync state whenever modal is opened
  useEffect(() => {
    if (isOpen) {
      setTypes(advancedFilters.types);
      setMetric(advancedFilters.metric);
      setPostedType(advancedFilters.postedType);
      setInLastValue(String(advancedFilters.inLastValue || 0));
      setInLastUnit(advancedFilters.inLastUnit);
      setStartDate(advancedFilters.startDate || "");
      setEndDate(advancedFilters.endDate || "");
    }
  }, [isOpen, advancedFilters]);

  // Compute absolute min & max for each metric from loaded videos
  const metricBounds = useMemo(() => {
    if (!videos || videos.length === 0) {
      return {
        views: { min: 0, max: 1000 },
        likes: { min: 0, max: 100 },
        comments: { min: 0, max: 50 },
        shares: { min: 0, max: 50 },
        saves: { min: 0, max: 50 },
        outlier: { min: 0.1, max: 5.0 },
      };
    }

    const viewsList = videos.map((v) => v.viewsCount || 0);
    const likesList = videos.map((v) => v.likesCount || 0);
    const commentsList = videos.map((v) => v.commentsCount || 0);
    const sharesList = videos.map((v) => v.sharesCount || 0);
    const savesList = videos.map((v) => v.savesCount || 0);
    const outlierList = videos.map((v) => v.outlierScore || 0);

    const minViews = Math.min(...viewsList);
    const maxViews = Math.max(...viewsList);
    const minLikes = Math.min(...likesList);
    const maxLikes = Math.max(...likesList);
    const minComments = Math.min(...commentsList);
    const maxComments = Math.max(...commentsList);
    const minShares = Math.min(...sharesList);
    const maxShares = Math.max(...sharesList);
    const minSaves = Math.min(...savesList);
    const maxSaves = Math.max(...savesList);
    const minOutlier = Number(Math.min(...outlierList).toFixed(1));
    const maxOutlier = Number(Math.max(...outlierList).toFixed(1));

    return {
      views: { min: minViews, max: maxViews === minViews ? minViews + 100 : maxViews },
      likes: { min: minLikes, max: maxLikes === minLikes ? minLikes + 10 : maxLikes },
      comments: { min: minComments, max: maxComments === minComments ? minComments + 5 : maxComments },
      shares: { min: minShares, max: maxShares === minShares ? minShares + 5 : maxShares },
      saves: { min: minSaves, max: maxSaves === minSaves ? minSaves + 5 : maxSaves },
      outlier: { min: minOutlier, max: maxOutlier === minOutlier ? minOutlier + 1.0 : maxOutlier },
    };
  }, [videos]);

  const activeBound = metricBounds[metric];
  const isDecimalMetric = metric === "outlier";

  // Min and Max values currently selected by user
  const [minVal, setMinVal] = useState<number>(activeBound.min);
  const [maxVal, setMaxVal] = useState<number>(activeBound.max);

  // When metric tab changes or modal opens, re-initialize min/max to bounds if previously default
  useEffect(() => {
    if (
      advancedFilters.metric === metric &&
      advancedFilters.minVal !== null &&
      advancedFilters.maxVal !== null &&
      advancedFilters.minVal >= activeBound.min &&
      advancedFilters.maxVal <= activeBound.max
    ) {
      setMinVal(advancedFilters.minVal);
      setMaxVal(advancedFilters.maxVal);
    } else {
      setMinVal(activeBound.min);
      setMaxVal(activeBound.max);
    }
  }, [metric, activeBound, advancedFilters]);

  // Slider Track Ref
  const trackRef = useRef<HTMLDivElement>(null);

  // Compute percentages for dual slider knobs
  const leftPercent = useMemo(() => {
    const range = activeBound.max - activeBound.min;
    if (range <= 0) return 0;
    const clamped = Math.max(activeBound.min, Math.min(activeBound.max, minVal));
    return Math.max(0, Math.min(100, ((clamped - activeBound.min) / range) * 100));
  }, [minVal, activeBound]);

  const rightPercent = useMemo(() => {
    const range = activeBound.max - activeBound.min;
    if (range <= 0) return 100;
    const clamped = Math.max(activeBound.min, Math.min(activeBound.max, maxVal));
    return Math.max(0, Math.min(100, ((clamped - activeBound.min) / range) * 100));
  }, [maxVal, activeBound]);

  // Histogram calculation: 35 bins
  const histogramBins = useMemo(() => {
    const BIN_COUNT = 35;
    if (!videos || videos.length === 0) {
      return Array.from({ length: BIN_COUNT }, () => ({ count: 0, heightPercent: 10, isActive: false }));
    }

    const range = activeBound.max - activeBound.min;
    const step = range / BIN_COUNT;

    const values = videos.map((v) => {
      if (metric === "views") return v.viewsCount || 0;
      if (metric === "likes") return v.likesCount || 0;
      if (metric === "comments") return v.commentsCount || 0;
      if (metric === "shares") return v.sharesCount || 0;
      if (metric === "saves") return v.savesCount || 0;
      return v.outlierScore || 0;
    });

    const bins = Array.from({ length: BIN_COUNT }, (_, i) => {
      const binStart = activeBound.min + i * step;
      const binEnd = i === BIN_COUNT - 1 ? activeBound.max : binStart + step;
      return { binStart, binEnd, count: 0 };
    });

    values.forEach((v) => {
      for (let i = 0; i < BIN_COUNT; i++) {
        const bin = bins[i];
        if (i === BIN_COUNT - 1) {
          if (v >= bin.binStart && v <= bin.binEnd) {
            bin.count++;
            break;
          }
        } else if (v >= bin.binStart && v < bin.binEnd) {
          bin.count++;
          break;
        }
      }
    });

    const maxCount = Math.max(...bins.map((b) => b.count), 1);

    return bins.map((bin) => {
      const heightPercent = bin.count > 0 ? Math.max(14, (bin.count / maxCount) * 100) : 10;
      const binMid = (bin.binStart + bin.binEnd) / 2;
      const isActive = binMid >= minVal - (step / 2) && binMid <= maxVal + (step / 2);
      return { count: bin.count, heightPercent, isActive };
    });
  }, [videos, metric, activeBound, minVal, maxVal]);

  // Dual Slider Pointer Drag Handlers
  const handlePointerDown = useCallback(
    (thumb: "min" | "max", e: React.PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const track = trackRef.current;
      if (!track) return;

      const updateValue = (clientX: number) => {
        const rect = track.getBoundingClientRect();
        const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        const raw = activeBound.min + ratio * (activeBound.max - activeBound.min);
        const nextVal = isDecimalMetric ? Number(raw.toFixed(1)) : Math.round(raw);

        if (thumb === "min") {
          setMinVal(Math.min(nextVal, maxVal));
        } else {
          setMaxVal(Math.max(nextVal, minVal));
        }
      };

      updateValue(e.clientX);

      const onPointerMove = (moveEvt: PointerEvent) => {
        updateValue(moveEvt.clientX);
      };

      const onPointerUp = () => {
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerup", onPointerUp);
      };

      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", onPointerUp);
    },
    [activeBound, isDecimalMetric, minVal, maxVal]
  );

  // Toggle Type
  const handleToggleType = (targetType: "videos" | "photos") => {
    setTypes((prev) => {
      if (prev.includes(targetType)) {
        return prev.filter((t) => t !== targetType);
      } else {
        return [...prev, targetType];
      }
    });
  };

  // Real-time preview count of videos matching current modal settings
  const previewCount = useMemo(() => {
    if (!videos) return 0;
    return videos.filter((v) => {
      // Type (Video vs Photo Slide)
      if (types.length === 1) {
        if (types.includes("videos") && v.isPhoto) return false;
        if (types.includes("photos") && !v.isPhoto) return false;
      }

      // Performance
      let val = 0;
      if (metric === "views") val = v.viewsCount || 0;
      else if (metric === "likes") val = v.likesCount || 0;
      else if (metric === "comments") val = v.commentsCount || 0;
      else if (metric === "shares") val = v.sharesCount || 0;
      else if (metric === "saves") val = v.savesCount || 0;
      else if (metric === "outlier") val = v.outlierScore || 0;

      if (val < minVal || val > maxVal) return false;

      // Date
      const numVal = Number(inLastValue) || 0;
      if (postedType === "in_last" && numVal > 0) {
        const mult =
          inLastUnit === "days"
            ? 86400000
            : inLastUnit === "weeks"
            ? 7 * 86400000
            : inLastUnit === "months"
            ? 30 * 86400000
            : 365 * 86400000;
        const threshold = Date.now() - numVal * mult;
        if (new Date(v.timestamp).getTime() < threshold) return false;
      } else if (postedType === "between") {
        if (startDate && new Date(v.timestamp).getTime() < new Date(startDate).getTime()) return false;
        if (endDate && new Date(v.timestamp).getTime() > new Date(endDate).getTime() + 86400000) return false;
      }

      return true;
    }).length;
  }, [videos, types, metric, minVal, maxVal, postedType, inLastValue, inLastUnit, startDate, endDate]);

  if (!isOpen) return null;

  const handleApply = () => {
    const isMinBound = minVal <= activeBound.min;
    const isMaxBound = maxVal >= activeBound.max;

    onApplyAdvancedFilters({
      types,
      metric,
      minVal: isMinBound && isMaxBound ? null : minVal,
      maxVal: isMinBound && isMaxBound ? null : maxVal,
      postedType,
      inLastValue: Number(inLastValue) || 0,
      inLastUnit,
      startDate,
      endDate,
    });
    onClose();
  };

  const handleReset = () => {
    setTypes([]);
    setMetric("views");
    setMinVal(metricBounds.views.min);
    setMaxVal(metricBounds.views.max);
    setPostedType("in_last");
    setInLastValue("0");
    setInLastUnit("years");
    setStartDate("");
    setEndDate("");
    onResetAdvancedFilters();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-white dark:bg-[#161D2F] text-gray-900 dark:text-white border border-gray-200 dark:border-[#27324B] rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-[#252E44]">
          <div className="w-6" />
          <h3 className="font-bold text-sm sm:text-base tracking-wide text-gray-900 dark:text-white">
            Filters
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-5 text-xs max-h-[75vh] overflow-y-auto">
          {/* SECTION 1: Type (Video | Photo Slide) */}
          <div className="space-y-2.5">
            <p className="font-semibold text-gray-500 dark:text-gray-400 text-xs">Type</p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleToggleType("videos")}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  types.includes("videos")
                    ? "bg-blue-50 dark:bg-[#25324E] text-blue-700 dark:text-white border-2 border-blue-500 shadow-xs font-bold"
                    : "bg-gray-100 dark:bg-[#1E263B] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-transparent hover:text-gray-900 dark:hover:text-white hover:bg-gray-200/70 dark:hover:bg-[#25304B]"
                }`}
              >
                <Film className="w-3.5 h-3.5 text-blue-500" />
                <span>Video</span>
              </button>

              <button
                type="button"
                onClick={() => handleToggleType("photos")}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  types.includes("photos")
                    ? "bg-blue-50 dark:bg-[#25324E] text-blue-700 dark:text-white border-2 border-blue-500 shadow-xs font-bold"
                    : "bg-gray-100 dark:bg-[#1E263B] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-transparent hover:text-gray-900 dark:hover:text-white hover:bg-gray-200/70 dark:hover:bg-[#25304B]"
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-rose-500" />
                <span>Photo Slide</span>
              </button>
            </div>
          </div>

          <div className="border-t border-gray-100 dark:border-[#252E44]" />

          {/* SECTION 2: Performance range */}
          <div className="space-y-3">
            <p className="font-semibold text-gray-500 dark:text-gray-400 text-xs">
              Performance range
            </p>

            {/* Performance Metric Pills: 2 Baris Rapi (grid-cols-3) */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setMetric("views")}
                className={`inline-flex items-center justify-center gap-1.5 px-2 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  metric === "views"
                    ? "bg-orange-50 dark:bg-[#25324E] text-orange-700 dark:text-white border-2 border-orange-500 shadow-xs font-bold"
                    : "bg-gray-100 dark:bg-[#1E263B] text-gray-700 dark:text-gray-400 border border-gray-200 dark:border-transparent hover:text-gray-900 dark:hover:text-white hover:bg-gray-200/70 dark:hover:bg-[#25304B]"
                }`}
              >
                <Play className="w-3.5 h-3.5 text-blue-500" />
                <span>Views</span>
              </button>

              <button
                type="button"
                onClick={() => setMetric("likes")}
                className={`inline-flex items-center justify-center gap-1.5 px-2 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  metric === "likes"
                    ? "bg-orange-50 dark:bg-[#25324E] text-orange-700 dark:text-white border-2 border-orange-500 shadow-xs font-bold"
                    : "bg-gray-100 dark:bg-[#1E263B] text-gray-700 dark:text-gray-400 border border-gray-200 dark:border-transparent hover:text-gray-900 dark:hover:text-white hover:bg-gray-200/70 dark:hover:bg-[#25304B]"
                }`}
              >
                <Heart className="w-3.5 h-3.5 text-rose-500" />
                <span>Likes</span>
              </button>

              <button
                type="button"
                onClick={() => setMetric("comments")}
                className={`inline-flex items-center justify-center gap-1.5 px-2 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  metric === "comments"
                    ? "bg-orange-50 dark:bg-[#25324E] text-orange-700 dark:text-white border-2 border-orange-500 shadow-xs font-bold"
                    : "bg-gray-100 dark:bg-[#1E263B] text-gray-700 dark:text-gray-400 border border-gray-200 dark:border-transparent hover:text-gray-900 dark:hover:text-white hover:bg-gray-200/70 dark:hover:bg-[#25304B]"
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5 text-sky-500" />
                <span>Comments</span>
              </button>

              <button
                type="button"
                onClick={() => setMetric("shares")}
                className={`inline-flex items-center justify-center gap-1.5 px-2 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  metric === "shares"
                    ? "bg-orange-50 dark:bg-[#25324E] text-orange-700 dark:text-white border-2 border-orange-500 shadow-xs font-bold"
                    : "bg-gray-100 dark:bg-[#1E263B] text-gray-700 dark:text-gray-400 border border-gray-200 dark:border-transparent hover:text-gray-900 dark:hover:text-white hover:bg-gray-200/70 dark:hover:bg-[#25304B]"
                }`}
              >
                <Forward className="w-3.5 h-3.5 text-emerald-500" />
                <span>Shares</span>
              </button>

              <button
                type="button"
                onClick={() => setMetric("saves")}
                className={`inline-flex items-center justify-center gap-1.5 px-2 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  metric === "saves"
                    ? "bg-orange-50 dark:bg-[#25324E] text-orange-700 dark:text-white border-2 border-orange-500 shadow-xs font-bold"
                    : "bg-gray-100 dark:bg-[#1E263B] text-gray-700 dark:text-gray-400 border border-gray-200 dark:border-transparent hover:text-gray-900 dark:hover:text-white hover:bg-gray-200/70 dark:hover:bg-[#25304B]"
                }`}
              >
                <Bookmark className="w-3.5 h-3.5 text-purple-500" />
                <span>Saves</span>
              </button>

              <button
                type="button"
                onClick={() => setMetric("outlier")}
                className={`inline-flex items-center justify-center gap-1.5 px-2 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  metric === "outlier"
                    ? "bg-orange-50 dark:bg-[#25324E] text-orange-700 dark:text-white border-2 border-orange-500 shadow-xs font-bold"
                    : "bg-gray-100 dark:bg-[#1E263B] text-gray-700 dark:text-gray-400 border border-gray-200 dark:border-transparent hover:text-gray-900 dark:hover:text-white hover:bg-gray-200/70 dark:hover:bg-[#25304B]"
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>Outlier score</span>
              </button>
            </div>

            {/* Real Histogram Distribution Bars */}
            <div className="pt-2 space-y-2">
              <div className="h-14 flex items-end gap-[2px] px-1">
                {histogramBins.map((bin, i) => (
                  <div
                    key={i}
                    style={{ height: `${bin.heightPercent}%` }}
                    className={`flex-1 rounded-t-xs transition-colors duration-100 ${
                      bin.isActive ? "bg-[#4F75FF]" : "bg-gray-200 dark:bg-[#242E44]"
                    }`}
                  />
                ))}
              </div>

              {/* Dual Slider Interactive Bar */}
              <div
                ref={trackRef}
                className="relative w-full h-6 flex items-center select-none cursor-pointer"
              >
                {/* Background Track */}
                <div className="w-full h-1 bg-gray-200 dark:bg-[#25304B] rounded-full relative">
                  {/* Highlighted Active Range */}
                  <div
                    style={{
                      left: `${leftPercent}%`,
                      width: `${Math.max(0, rightPercent - leftPercent)}%`,
                    }}
                    className="absolute top-0 bottom-0 bg-[#4F75FF] rounded-full"
                  />
                </div>

                {/* Left Knob (Min) */}
                <div
                  style={{ left: `${leftPercent}%` }}
                  onPointerDown={(e) => handlePointerDown("min", e)}
                  className="absolute w-5 h-5 rounded-full bg-white shadow-lg border-2 border-[#4F75FF] top-1/2 -translate-y-1/2 -translate-x-1/2 cursor-grab active:cursor-grabbing hover:scale-110 transition-transform z-10"
                />

                {/* Right Knob (Max) */}
                <div
                  style={{ left: `${rightPercent}%` }}
                  onPointerDown={(e) => handlePointerDown("max", e)}
                  className="absolute w-5 h-5 rounded-full bg-white shadow-lg border-2 border-[#4F75FF] top-1/2 -translate-y-1/2 -translate-x-1/2 cursor-grab active:cursor-grabbing hover:scale-110 transition-transform z-10"
                />
              </div>

              {/* Min & Max Inputs (Linked) */}
              <div className="pt-2 flex items-center justify-between gap-3">
                <div className="flex-1 space-y-1">
                  <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">Min</span>
                  <input
                    type="number"
                    step={isDecimalMetric ? "0.1" : "1"}
                    value={minVal}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setMinVal(isNaN(v) ? activeBound.min : Math.min(v, maxVal));
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-[#1E263B] border border-gray-200 dark:border-[#2B354F] text-gray-900 dark:text-white font-bold text-xs focus:outline-hidden focus:border-blue-500"
                  />
                </div>
                <span className="text-gray-400 pt-5 font-bold">—</span>
                <div className="flex-1 space-y-1">
                  <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">Max</span>
                  <input
                    type="number"
                    step={isDecimalMetric ? "0.1" : "1"}
                    value={maxVal}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setMaxVal(isNaN(v) ? activeBound.max : Math.max(v, minVal));
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-[#1E263B] border border-gray-200 dark:border-[#2B354F] text-gray-900 dark:text-white font-bold text-xs focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 dark:border-[#252E44]" />

          {/* SECTION 3: Posted (Date Filter) */}
          <div className="space-y-3">
            <p className="font-semibold text-gray-500 dark:text-gray-400 text-xs">Posted</p>

            {/* In the last / Between Pills */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPostedType("in_last")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  postedType === "in_last"
                    ? "bg-orange-50 dark:bg-[#25324E] text-orange-700 dark:text-white border-2 border-orange-500 shadow-xs font-bold"
                    : "bg-gray-100 dark:bg-[#1E263B] text-gray-700 dark:text-gray-400 border border-gray-200 dark:border-transparent hover:text-gray-900 dark:hover:text-white hover:bg-gray-200/70 dark:hover:bg-[#25304B]"
                }`}
              >
                <Clock className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                <span>In the last</span>
              </button>

              <button
                type="button"
                onClick={() => setPostedType("between")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  postedType === "between"
                    ? "bg-orange-50 dark:bg-[#25324E] text-orange-700 dark:text-white border-2 border-orange-500 shadow-xs font-bold"
                    : "bg-gray-100 dark:bg-[#1E263B] text-gray-700 dark:text-gray-400 border border-gray-200 dark:border-transparent hover:text-gray-900 dark:hover:text-white hover:bg-gray-200/70 dark:hover:bg-[#25304B]"
                }`}
              >
                <Calendar className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                <span>Between</span>
              </button>
            </div>

            {/* Inputs based on tab */}
            {postedType === "in_last" ? (
              <div className="grid grid-cols-2 gap-3 pt-1">
                <input
                  type="number"
                  min="0"
                  value={inLastValue}
                  onChange={(e) => setInLastValue(e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-[#1E263B] border border-gray-200 dark:border-[#2B354F] text-gray-900 dark:text-white font-bold text-xs focus:outline-hidden focus:border-blue-500"
                />

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsUnitDropdownOpen((prev) => !prev)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-gray-50 dark:bg-[#1E263B] border border-gray-200 dark:border-[#2B354F] text-gray-900 dark:text-white font-bold text-xs cursor-pointer hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
                  >
                    <span className="capitalize">{inLastUnit}</span>
                    <ChevronDown className={`w-3.5 h-3.5 text-gray-500 dark:text-gray-400 transition-transform duration-200 ${isUnitDropdownOpen ? "rotate-180" : ""}`} />
                  </button>

                  {isUnitDropdownOpen && (
                    <>
                      {/* Invisible backdrop to dismiss when clicking outside */}
                      <div
                        className="fixed inset-0 z-20 cursor-default"
                        onClick={() => setIsUnitDropdownOpen(false)}
                      />
                      {/* Drop-up Menu (Membuka ke atas agar tidak perlu scroll) */}
                      <div className="absolute left-0 right-0 bottom-full mb-1.5 bg-white dark:bg-[#1E263B] border border-gray-200 dark:border-[#2B354F] rounded-xl shadow-2xl overflow-hidden z-30 divide-y divide-gray-100 dark:divide-white/5">
                        {(["days", "weeks", "months", "years"] as const).map((u) => (
                          <button
                            key={u}
                            type="button"
                            onClick={() => {
                              setInLastUnit(u);
                              setIsUnitDropdownOpen(false);
                            }}
                            className={`w-full px-3 py-2 text-left text-xs font-semibold hover:bg-gray-100 dark:hover:bg-white/10 capitalize transition-colors cursor-pointer ${
                              inLastUnit === u ? "text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-white/5 font-bold" : "text-gray-700 dark:text-white"
                            }`}
                          >
                            {u}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 pt-1">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-[#1E263B] border border-gray-200 dark:border-[#2B354F] text-gray-900 dark:text-white font-semibold text-xs focus:outline-hidden focus:border-blue-500"
                />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-[#1E263B] border border-gray-200 dark:border-[#2B354F] text-gray-900 dark:text-white font-semibold text-xs focus:outline-hidden focus:border-blue-500"
                />
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 flex items-center justify-between gap-3 border-t border-gray-100 dark:border-[#252E44] bg-gray-50/60 dark:bg-[#161D2F]">
          <button
            type="button"
            onClick={handleReset}
            className="text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors cursor-pointer"
          >
            Reset
          </button>

          <button
            type="button"
            onClick={handleApply}
            className="px-5 py-2.5 rounded-xl bg-gray-900 hover:bg-black text-white dark:bg-white dark:hover:bg-gray-100 dark:text-gray-950 font-bold text-xs shadow-lg transition-all cursor-pointer transform active:scale-95"
          >
            Show {previewCount} Posts
          </button>
        </div>
      </div>
    </div>
  );
}
