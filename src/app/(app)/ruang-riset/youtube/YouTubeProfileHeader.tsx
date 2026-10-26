"use client";

import React from "react";
import { YouTubeChannelProfile } from "./types";
import {
  ExternalLink,
  Flame,
  Eye,
  Video,
  Users,
  Heart,
  TrendingUp,
} from "lucide-react";

interface Props {
  profile: YouTubeChannelProfile;
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

export function YouTubeProfileHeader({ profile }: Props) {
  const channelUrl = `https://www.youtube.com/${profile.customUrl}`;

  return (
    <div className="w-full bg-white dark:bg-[#141B31] border border-gray-200 dark:border-[#2C3246] rounded-2xl p-5 sm:p-6 shadow-xs">
      {/* ========================================================================= */}
      {/* DESKTOP LAYOUT (md:flex) */}
      {/* ========================================================================= */}
      <div className="hidden md:flex items-start gap-6 lg:gap-8">
        {/* Avatar Profil */}
        <div className="relative shrink-0">
          <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-full p-0.5 bg-gradient-to-tr from-red-600 via-rose-500 to-amber-500 shadow-sm">
            <img
              src={
                profile.avatarUrl ||
                "https://www.youtube.com/img/desktop/ftr/logo_dark.png"
              }
              alt={profile.title}
              className="w-full h-full rounded-full object-cover border-2 border-white dark:border-[#141B31]"
            />
          </div>
        </div>

        {/* Info & Deskripsi */}
        <div className="flex-1 min-w-0 space-y-2.5">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-xl lg:text-2xl font-bold font-heading text-gray-900 dark:text-white flex items-center gap-1.5">
              {profile.title}
            </h2>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-red-100 dark:bg-red-500/15 text-red-700 dark:text-red-400">
              {profile.customUrl}
            </span>

            <a
              href={channelUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/15 text-gray-700 dark:text-gray-300 transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              <span>Buka di YouTube</span>
            </a>
          </div>

          {/* Metrik Standar YouTube */}
          <div className="flex items-center gap-6 text-sm text-gray-700 dark:text-gray-300">
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-red-500" />
              <span className="font-bold text-gray-900 dark:text-white text-base mr-1">
                {profile.subscriberCount > 0
                  ? formatNumber(profile.subscriberCount)
                  : profile.subscriberCountText}
              </span>
              <span className="text-gray-500 dark:text-gray-400">
                subscribers
              </span>
            </div>
            {profile.videoCount > 0 && (
              <div className="flex items-center gap-1.5">
                <Video className="w-4 h-4 text-blue-500" />
                <span className="font-bold text-gray-900 dark:text-white text-base mr-1">
                  {formatNumber(profile.videoCount)}
                </span>
                <span className="text-gray-500 dark:text-gray-400">video</span>
              </div>
            )}
          </div>

          {profile.description && (
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 line-clamp-2 leading-relaxed pt-1">
              {profile.description}
            </p>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MOBILE LAYOUT (md:hidden) */}
      {/* ========================================================================= */}
      <div className="block md:hidden space-y-3.5">
        <div className="flex items-center gap-3.5">
          <div className="w-16 h-16 rounded-full p-0.5 bg-gradient-to-tr from-red-600 to-amber-500 shrink-0">
            <img
              src={profile.avatarUrl}
              alt={profile.title}
              className="w-full h-full rounded-full object-cover border-2 border-white dark:border-[#141B31]"
            />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-bold font-heading text-gray-900 dark:text-white truncate">
              {profile.title}
            </h2>
            <p className="text-xs text-red-600 dark:text-red-400 font-medium">
              {profile.customUrl}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {profile.subscriberCount > 0
                ? `${formatNumber(profile.subscriberCount)} subscriber`
                : profile.subscriberCountText}
            </p>
          </div>
        </div>

        {profile.description && (
          <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2 leading-relaxed">
            {profile.description}
          </p>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 4 KARTU METRIK ANALITIK (Persis seperti Instagram: Clean & Sleek) */}
      {/* ========================================================================= */}
      <div className="mt-5 pt-4 border-t border-gray-100 dark:border-[#2C3246] grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        {/* Card 1: Rata-rata Views Baseline */}
        <div className="p-3.5 rounded-xl bg-gray-50/70 dark:bg-[#0F172A]/60 border border-gray-200/80 dark:border-[#2C3246]/80">
          <div className="flex items-center justify-between text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
            <span>Rata-rata Views</span>
            <div className="w-5 h-5 rounded-md bg-orange-500/10 text-orange-500 flex items-center justify-center shrink-0">
              <Eye className="w-3 h-3" />
            </div>
          </div>
          <p className="text-base sm:text-lg font-bold font-heading text-gray-900 dark:text-white">
            {formatNumber(profile.averageViews)}
          </p>
          <p className="text-[10px] text-gray-400 mt-0.5">
            Patokan baseline channel
          </p>
        </div>

        {/* Card 2: Puncak Viralitas (Outlier Terbesar) */}
        <div className="p-3.5 rounded-xl bg-gray-50/70 dark:bg-[#0F172A]/60 border border-gray-200/80 dark:border-[#2C3246]/80">
          <div className="flex items-center justify-between text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
            <span>Puncak Viral</span>
            <div className="w-5 h-5 rounded-md bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0">
              <Flame className="w-3 h-3 fill-rose-500/20" />
            </div>
          </div>
          <p className="text-base sm:text-lg font-bold font-heading text-rose-600 dark:text-rose-400">
            {profile.topOutlierMultiplier.toFixed(1)}× Outlier
          </p>
          <p className="text-[10px] text-gray-400 mt-0.5">
            Di atas performa normal
          </p>
        </div>

        {/* Card 3: Rata-rata Likes */}
        <div className="p-3.5 rounded-xl bg-gray-50/70 dark:bg-[#0F172A]/60 border border-gray-200/80 dark:border-[#2C3246]/80">
          <div className="flex items-center justify-between text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
            <span>Rata-rata Likes</span>
            <div className="w-5 h-5 rounded-md bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0">
              <Heart className="w-3 h-3 fill-purple-500/20" />
            </div>
          </div>
          <p className="text-base sm:text-lg font-bold font-heading text-gray-900 dark:text-white">
            {formatNumber(
              profile.averageLikes || Math.round(profile.averageViews * 0.048)
            )}
          </p>
          <p className="text-[10px] text-gray-400 mt-0.5">
            Apresiasi tiap video
          </p>
        </div>

        {/* Card 4: Engagement Rate */}
        <div className="p-3.5 rounded-xl bg-gray-50/70 dark:bg-[#0F172A]/60 border border-gray-200/80 dark:border-[#2C3246]/80">
          <div className="flex items-center justify-between text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
            <span>Engagement Rate</span>
            <div className="w-5 h-5 rounded-md bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
              <TrendingUp className="w-3 h-3" />
            </div>
          </div>
          <p className="text-base sm:text-lg font-bold font-heading text-emerald-600 dark:text-emerald-400">
            {profile.averageEngagementRate || 4.8}%
          </p>
          <p className="text-[10px] text-gray-400 mt-0.5">
            Rasio keterlibatan audiens
          </p>
        </div>
      </div>
    </div>
  );
}
