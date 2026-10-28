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
  const averageLikes =
    profile.averageLikes || Math.round(profile.averageViews * 0.048);
  const averageER = profile.averageEngagementRate || 4.8;

  return (
    <div className="w-full bg-white dark:bg-[#141B31] border border-gray-200 dark:border-[#2C3246] rounded-2xl p-5 sm:p-6 shadow-xs">
      {/* ========================================================================= */}
      {/* DESKTOP LAYOUT (md:flex) - Clean, Sleek & Hemat Tempat Seperti TikTok */}
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

        {/* Info & Deskripsi (Tengah) */}
        <div className="flex-1 min-w-0 space-y-2.5">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-xl lg:text-2xl font-bold font-heading text-gray-900 dark:text-white flex items-center gap-1.5">
              <span>{profile.title}</span>
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
          <div className="flex items-center gap-6 text-sm text-gray-700 dark:text-gray-300 flex-wrap">
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

        {/* 4 Kartu Analitik Utama (Kanan Desktop - Format Grid 2x2 Hemat Tempat Seperti TikTok) */}
        <div className="grid grid-cols-2 gap-2.5 shrink-0 min-w-[280px]">
          {/* 1. Rata-rata Views */}
          <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#1A2238] border border-gray-100 dark:border-[#2C3246]/60">
            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mb-1">
              <Eye className="w-3.5 h-3.5 text-blue-500" />
              <span>Rata-rata Views</span>
            </div>
            <div className="text-base font-bold text-gray-900 dark:text-white">
              {formatNumber(profile.averageViews)}
            </div>
          </div>

          {/* 2. Puncak Viral / Top Outlier */}
          <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500/10 to-rose-500/10 dark:from-amber-500/20 dark:to-rose-500/20 border border-amber-500/20">
            <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-semibold mb-1">
              <Flame className="w-3.5 h-3.5 fill-current" />
              <span>Puncak Viral</span>
            </div>
            <div className="text-base font-bold text-amber-600 dark:text-amber-400">
              {profile.topOutlierMultiplier.toFixed(1)}x
            </div>
          </div>

          {/* 3. Rata-rata Likes */}
          <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#1A2238] border border-gray-100 dark:border-[#2C3246]/60">
            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mb-1">
              <Heart className="w-3.5 h-3.5 text-rose-500" />
              <span>Rata-rata Likes</span>
            </div>
            <div className="text-base font-bold text-gray-900 dark:text-white">
              {formatNumber(averageLikes)}
            </div>
          </div>

          {/* 4. Engagement Rate */}
          <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#1A2238] border border-gray-100 dark:border-[#2C3246]/60">
            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mb-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
              <span>Engagement Rate</span>
            </div>
            <div className="text-base font-bold text-emerald-600 dark:text-emerald-400">
              {averageER}%
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MOBILE LAYOUT (md:hidden) - Hemat Tempat */}
      {/* ========================================================================= */}
      <div className="md:hidden space-y-4">
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

        {/* 4 Kotak Analitik Mobile (Grid 2x2 Hemat Tempat) */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-[#1A2238] border border-gray-100 dark:border-[#2C3246]/60">
            <div className="text-[11px] text-gray-500 dark:text-gray-400 mb-0.5">
              Rata-rata Views
            </div>
            <div className="text-sm font-bold text-gray-900 dark:text-white">
              {formatNumber(profile.averageViews)}
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500/10 to-rose-500/10 dark:from-amber-500/20 dark:to-rose-500/20 border border-amber-500/20">
            <div className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold mb-0.5 flex items-center gap-1">
              <Flame className="w-3 h-3 fill-current" />
              <span>Puncak Viral</span>
            </div>
            <div className="text-sm font-bold text-amber-600 dark:text-amber-400">
              {profile.topOutlierMultiplier.toFixed(1)}x
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-[#1A2238] border border-gray-100 dark:border-[#2C3246]/60">
            <div className="text-[11px] text-gray-500 dark:text-gray-400 mb-0.5">
              Rata-rata Likes
            </div>
            <div className="text-sm font-bold text-gray-900 dark:text-white">
              {formatNumber(averageLikes)}
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-[#1A2238] border border-gray-100 dark:border-[#2C3246]/60">
            <div className="text-[11px] text-gray-500 dark:text-gray-400 mb-0.5">
              Engagement Rate
            </div>
            <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
              {averageER}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
