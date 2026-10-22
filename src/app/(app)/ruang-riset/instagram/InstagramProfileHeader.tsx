"use client";

import React, { useState } from "react";
import {
  InstagramTargetProfile,
  SortOption,
  FilterMode,
  PostLimit,
  DateFilter,
} from "./types";
import { SortFeedFilterDropdown } from "./SortFeedFilterDropdown";
import {
  CheckCircle2,
  ExternalLink,
  Flame,
  TrendingUp,
  Eye,
  Heart,
  SlidersHorizontal,
  ChevronDown,
} from "lucide-react";

interface Props {
  profile: InstagramTargetProfile;
  filterMode: FilterMode;
  setFilterMode: (val: FilterMode) => void;
  postLimit: PostLimit;
  setPostLimit: (val: PostLimit) => void;
  dateFilter: DateFilter;
  setDateFilter: (val: DateFilter) => void;
  sortOption: SortOption;
  setSortOption: (val: SortOption) => void;
  onResetFilters: () => void;
  onApplyFilters?: () => void;
  hasAppliedFilter?: boolean;
}

function formatNumber(num: number): string {
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + " Jt";
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1).replace(/\.0$/, "") + " Rb";
  }
  return num.toLocaleString("id-ID");
}

export function InstagramProfileHeader({
  profile,
  filterMode,
  setFilterMode,
  postLimit,
  setPostLimit,
  dateFilter,
  setDateFilter,
  sortOption,
  setSortOption,
  onResetFilters,
  onApplyFilters,
  hasAppliedFilter = false,
}: Props) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  return (
    <div className="w-full bg-white dark:bg-[#141B31] border border-gray-200 dark:border-[#2C3246] rounded-2xl p-5 sm:p-6 md:p-8 shadow-xs relative">
      {/* ========================================================================= */}
      {/* DESKTOP LAYOUT (md:flex) */}
      {/* ========================================================================= */}
      <div className="hidden md:flex items-start gap-8 lg:gap-10">
        {/* Avatar Profil */}
        <div className="relative shrink-0">
          <div className="w-24 h-24 lg:w-28 lg:h-28 rounded-full p-1 bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 shadow-sm">
            <img
              src={profile.profilePicUrl}
              alt={profile.username}
              className="w-full h-full rounded-full object-cover border-2 border-white dark:border-[#141B31]"
            />
          </div>
        </div>

        {/* Info & Bio */}
        <div className="flex-1 min-w-0 space-y-3.5">
          {/* Baris 1: Username & Link + Tombol Filter di Kanan Atas */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-xl lg:text-2xl font-bold font-heading text-gray-900 dark:text-white flex items-center gap-1.5">
                @{profile.username}
                {profile.isVerified && (
                  <CheckCircle2 className="w-5 h-5 text-sky-500 fill-sky-500 shrink-0 inline-block" />
                )}
              </h2>

              {profile.externalUrl && (
                <a
                  href={profile.externalUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/15 text-gray-700 dark:text-gray-300 transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Kunjungi Website</span>
                </a>
              )}
            </div>

            {/* Menu Filter Trigger di Kanan Atas (Desktop) */}
            <div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsFilterOpen((prev) => !prev);
                }}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm cursor-pointer border ${
                  !hasAppliedFilter
                    ? "bg-[#f97316] text-white hover:bg-[#ea580c] dark:bg-[#f97316] dark:hover:bg-[#fb923c] border-orange-500 ring-2 ring-orange-500/20"
                    : "bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 dark:bg-[#141B31] dark:hover:bg-[#1f2947] dark:border-[#2C3246] dark:text-gray-200"
                }`}
              >
                <SlidersHorizontal className={`w-4 h-4 ${!hasAppliedFilter ? "text-white" : "text-rn-accent"}`} />
                <span>Filters & Sort</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform ${
                    isFilterOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Baris 2: Metrik Standar IG (Postingan, Pengikut, Mengikuti) */}
          <div className="flex items-center gap-8 text-sm text-gray-700 dark:text-gray-300">
            <div>
              <span className="font-bold text-gray-900 dark:text-white text-base mr-1.5">
                {formatNumber(profile.mediaCount)}
              </span>
              <span>postingan</span>
            </div>
            <div>
              <span className="font-bold text-gray-900 dark:text-white text-base mr-1.5">
                {formatNumber(profile.followersCount)}
              </span>
              <span>pengikut</span>
            </div>
            <div>
              <span className="font-bold text-gray-900 dark:text-white text-base mr-1.5">
                {formatNumber(profile.followingCount)}
              </span>
              <span>mengikuti</span>
            </div>
          </div>

          {/* Baris 3: Nama Lengkap & Bio */}
          <div className="space-y-1">
            <p className="font-bold text-sm text-gray-900 dark:text-white">
              {profile.fullName}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-line leading-relaxed max-w-2xl">
              {profile.biography}
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MOBILE LAYOUT (md:hidden - Persis Instagram App) */}
      {/* ========================================================================= */}
      <div className="block md:hidden space-y-4">
        {/* Top: Avatar & 3-Column Stats */}
        <div className="flex items-center gap-4">
          <div className="w-18 h-18 rounded-full p-0.5 bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 shrink-0">
            <img
              src={profile.profilePicUrl}
              alt={profile.username}
              className="w-full h-full rounded-full object-cover border-2 border-white dark:border-[#141B31]"
            />
          </div>

          <div className="flex-1 flex items-center justify-around text-center">
            <div>
              <p className="font-bold text-gray-900 dark:text-white text-base">
                {formatNumber(profile.mediaCount)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Post</p>
            </div>
            <div>
              <p className="font-bold text-gray-900 dark:text-white text-base">
                {formatNumber(profile.followersCount)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Pengikut</p>
            </div>
            <div>
              <p className="font-bold text-gray-900 dark:text-white text-base">
                {formatNumber(profile.followingCount)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Mengikuti</p>
            </div>
          </div>
        </div>

        {/* Bio & Link */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm text-gray-900 dark:text-white">
                @{profile.username}
              </span>
              {profile.isVerified && (
                <CheckCircle2 className="w-4 h-4 text-sky-500 fill-sky-500 inline-block" />
              )}
            </div>

            {/* Mobile Filter Button */}
            <div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsFilterOpen((prev) => !prev);
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold ${
                  !hasAppliedFilter
                    ? "bg-[#f97316] text-white hover:bg-[#ea580c] dark:bg-[#f97316] dark:hover:bg-[#fb923c]"
                    : "bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 dark:bg-[#141B31] dark:hover:bg-[#1f2947] dark:border-[#2C3246] dark:text-gray-200"
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Filters & Sort</span>
              </button>
            </div>
          </div>

          <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">
            {profile.fullName}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">
            {profile.biography}
          </p>
          {profile.externalUrl && (
            <a
              href={profile.externalUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs text-sky-600 dark:text-sky-400 font-semibold hover:underline pt-0.5"
            >
              <ExternalLink className="w-3 h-3" />
              <span>{profile.externalUrl.replace(/^https?:\/\//, "")}</span>
            </a>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SINGLE DROPDOWN MODAL (Anchored at top-right of Card, 100% Reliable) */}
      {/* ========================================================================= */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 md:top-8 md:right-8 pointer-events-none">
        <div className="pointer-events-auto">
          <SortFeedFilterDropdown
            isOpen={isFilterOpen}
            onClose={() => setIsFilterOpen(false)}
            onApply={() => {
              if (onApplyFilters) onApplyFilters();
              setIsFilterOpen(false);
            }}
            filterMode={filterMode}
            setFilterMode={setFilterMode}
            postLimit={postLimit}
            setPostLimit={setPostLimit}
            dateFilter={dateFilter}
            setDateFilter={setDateFilter}
            sortOption={sortOption}
            setSortOption={setSortOption}
            onReset={onResetFilters}
          />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ANALYTICAL SUPER-CARDS STANDAR (Bersih, Rapi, Harmonis) */}
      {/* ========================================================================= */}
      <div className="mt-6 pt-5 border-t border-gray-100 dark:border-[#2C3246] grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Card 1: Rata-rata Views Baseline */}
        <div className="p-4 rounded-xl bg-gray-50/70 dark:bg-[#141B31] border border-gray-200 dark:border-[#2C3246]">
          <div className="flex items-center justify-between text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
            <span>Rata-rata Views</span>
            <div className="w-6 h-6 rounded-md bg-orange-500/10 text-orange-500 flex items-center justify-center shrink-0">
              <Eye className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-lg sm:text-xl font-bold font-heading text-gray-900 dark:text-white">
            {formatNumber(profile.averageViews)}
          </p>
          <p className="text-[11px] text-gray-400 mt-0.5">
            Patokan baseline akun
          </p>
        </div>

        {/* Card 2: Puncak Viralitas (Outlier Terbesar) */}
        <div className="p-4 rounded-xl bg-gray-50/70 dark:bg-[#141B31] border border-gray-200 dark:border-[#2C3246]">
          <div className="flex items-center justify-between text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
            <span>Puncak Viral</span>
            <div className="w-6 h-6 rounded-md bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0">
              <Flame className="w-3.5 h-3.5 fill-rose-500/20" />
            </div>
          </div>
          <p className="text-lg sm:text-xl font-bold font-heading text-rose-600 dark:text-rose-400">
            {profile.topOutlierMultiplier.toFixed(1)}× Outlier
          </p>
          <p className="text-[11px] text-gray-400 mt-0.5">
            Di atas performa normal
          </p>
        </div>

        {/* Card 3: Rata-rata Likes */}
        <div className="p-4 rounded-xl bg-gray-50/70 dark:bg-[#141B31] border border-gray-200 dark:border-[#2C3246]">
          <div className="flex items-center justify-between text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
            <span>Rata-rata Likes</span>
            <div className="w-6 h-6 rounded-md bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0">
              <Heart className="w-3.5 h-3.5 fill-purple-500/20" />
            </div>
          </div>
          <p className="text-lg sm:text-xl font-bold font-heading text-gray-900 dark:text-white">
            {formatNumber(profile.averageLikes)}
          </p>
          <p className="text-[11px] text-gray-400 mt-0.5">
            Apresiasi tiap postingan
          </p>
        </div>

        {/* Card 4: Engagement Rate */}
        <div className="p-4 rounded-xl bg-gray-50/70 dark:bg-[#141B31] border border-gray-200 dark:border-[#2C3246]">
          <div className="flex items-center justify-between text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
            <span>Engagement Rate</span>
            <div className="w-6 h-6 rounded-md bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-lg sm:text-xl font-bold font-heading text-emerald-600 dark:text-emerald-400">
            {profile.averageEngagementRate}%
          </p>
          <p className="text-[11px] text-gray-400 mt-0.5">
            Rasio keterlibatan audiens
          </p>
        </div>
      </div>
    </div>
  );
}
