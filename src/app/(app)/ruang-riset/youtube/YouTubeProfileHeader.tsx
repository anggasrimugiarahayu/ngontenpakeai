"use client";

import React from "react";
import { YouTubeChannelProfile } from "./types";
import { ExternalLink, Flame, Eye, Video, Users } from "lucide-react";

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
    <div className="w-full bg-white dark:bg-[#141B2D] border border-gray-200 dark:border-[#232D42] rounded-2xl p-5 sm:p-6 shadow-xs">
      {/* DESKTOP LAYOUT (md:flex) */}
      <div className="hidden md:flex items-start gap-6 lg:gap-8">
        {/* Avatar Profil */}
        <div className="relative shrink-0">
          <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-full p-0.5 bg-gradient-to-tr from-red-600 via-rose-500 to-amber-500 shadow-sm">
            <img
              src={profile.avatarUrl || "https://www.youtube.com/img/desktop/ftr/logo_dark.png"}
              alt={profile.title}
              className="w-full h-full rounded-full object-cover border-2 border-white dark:border-[#141B2D]"
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
                {profile.subscriberCount > 0 ? formatNumber(profile.subscriberCount) : profile.subscriberCountText}
              </span>
              <span className="text-gray-500 dark:text-gray-400">subscribers</span>
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
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed pt-1">
              {profile.description}
            </p>
          )}
        </div>

        {/* Kotak Analitik Outlier & Views Baseline */}
        <div className="shrink-0 flex items-center gap-3 bg-gray-50 dark:bg-[#0B0F19] border border-gray-200 dark:border-[#232D42] rounded-2xl p-4">
          <div className="text-center px-2">
            <div className="flex items-center justify-center gap-1 text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
              <Eye className="w-3.5 h-3.5 text-blue-500" />
              <span>Rata-rata Views</span>
            </div>
            <p className="text-lg lg:text-xl font-bold font-heading text-gray-900 dark:text-white">
              {formatNumber(profile.averageViews)}
            </p>
          </div>

          <div className="w-px h-10 bg-gray-200 dark:bg-gray-800" />

          <div className="text-center px-2">
            <div className="flex items-center justify-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400 mb-1">
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              <span>Top Outlier</span>
            </div>
            <p className="text-lg lg:text-xl font-bold font-heading text-amber-600 dark:text-amber-400">
              {profile.topOutlierMultiplier.toFixed(1)}x
            </p>
          </div>
        </div>
      </div>

      {/* MOBILE LAYOUT (md:hidden) */}
      <div className="md:hidden space-y-4">
        <div className="flex items-center gap-3.5">
          <div className="w-16 h-16 rounded-full p-0.5 bg-gradient-to-tr from-red-600 to-amber-500 shrink-0">
            <img
              src={profile.avatarUrl}
              alt={profile.title}
              className="w-full h-full rounded-full object-cover border-2 border-white dark:border-[#141B2D]"
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
              {profile.subscriberCount > 0 ? `${formatNumber(profile.subscriberCount)} subscriber` : profile.subscriberCountText}
            </p>
          </div>
        </div>

        {profile.description && (
          <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
            {profile.description}
          </p>
        )}

        <div className="grid grid-cols-2 gap-2 bg-gray-50 dark:bg-[#0B0F19] p-3 rounded-xl border border-gray-200 dark:border-[#232D42]">
          <div className="text-center">
            <span className="text-[11px] text-gray-500 block">Rata-rata Views</span>
            <span className="font-bold text-sm text-gray-900 dark:text-white">
              {formatNumber(profile.averageViews)}
            </span>
          </div>
          <div className="text-center">
            <span className="text-[11px] text-amber-500 block">Top Outlier</span>
            <span className="font-bold text-sm text-amber-500">
              {profile.topOutlierMultiplier.toFixed(1)}x
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
