"use client";

import React from "react";
import { InstagramTargetProfile } from "./types";
import {
  CheckCircle2,
  ExternalLink,
  Flame,
  TrendingUp,
  Eye,
  Heart,
} from "lucide-react";

interface Props {
  profile: InstagramTargetProfile;
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

export function InstagramProfileHeader({ profile }: Props) {
  return (
    <div className="w-full bg-white dark:bg-[#141B31] border border-gray-200 dark:border-[#2C3246] rounded-2xl p-5 sm:p-6 shadow-xs">
      {/* ========================================================================= */}
      {/* DESKTOP LAYOUT (md:flex) - Clean, Sleek & Hemat Tempat Seperti TikTok */}
      {/* ========================================================================= */}
      <div className="hidden md:flex items-start gap-6 lg:gap-8">
        {/* Avatar Profil */}
        <div className="relative shrink-0">
          <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-full p-0.5 bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 shadow-sm">
            <img
              src={profile.profilePicUrl}
              alt={profile.username}
              className="w-full h-full rounded-full object-cover border-2 border-white dark:border-[#141B31]"
            />
          </div>
        </div>

        {/* Info & Bio (Tengah) */}
        <div className="flex-1 min-w-0 space-y-2.5">
          {/* Baris 1: Username & Link Website */}
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-xl lg:text-2xl font-bold font-heading text-gray-900 dark:text-white flex items-center gap-1.5">
              <span>@{profile.username}</span>
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

          {/* Baris 2: Metrik Standar IG (Postingan, Pengikut, Mengikuti) */}
          <div className="flex items-center gap-6 text-sm text-gray-700 dark:text-gray-300 flex-wrap">
            <div>
              <span className="font-bold text-gray-900 dark:text-white text-base mr-1">
                {formatNumber(profile.mediaCount)}
              </span>
              <span className="text-gray-500 dark:text-gray-400">postingan</span>
            </div>
            <div>
              <span className="font-bold text-gray-900 dark:text-white text-base mr-1">
                {formatNumber(profile.followersCount)}
              </span>
              <span className="text-gray-500 dark:text-gray-400">pengikut</span>
            </div>
            <div>
              <span className="font-bold text-gray-900 dark:text-white text-base mr-1">
                {formatNumber(profile.followingCount)}
              </span>
              <span className="text-gray-500 dark:text-gray-400">mengikuti</span>
            </div>
          </div>

          {/* Baris 3: Nama Lengkap & Bio */}
          <div className="space-y-1">
            <p className="font-bold text-sm text-gray-900 dark:text-white">
              {profile.fullName}
            </p>
            {profile.biography && (
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 whitespace-pre-line leading-relaxed max-w-2xl line-clamp-2">
                {profile.biography}
              </p>
            )}
          </div>
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
              {formatNumber(profile.averageLikes)}
            </div>
          </div>

          {/* 4. Engagement Rate */}
          <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#1A2238] border border-gray-100 dark:border-[#2C3246]/60">
            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mb-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
              <span>Engagement Rate</span>
            </div>
            <div className="text-base font-bold text-emerald-600 dark:text-emerald-400">
              {profile.averageEngagementRate}%
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MOBILE LAYOUT (md:hidden) - Hemat Tempat */}
      {/* ========================================================================= */}
      <div className="md:hidden space-y-4">
        {/* Top: Avatar & Stats */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full p-0.5 bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 shrink-0">
            <img
              src={profile.profilePicUrl}
              alt={profile.username}
              className="w-full h-full rounded-full object-cover border-2 border-white dark:border-[#141B31]"
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base text-gray-900 dark:text-white truncate">
                @{profile.username}
              </span>
              {profile.isVerified && (
                <CheckCircle2 className="w-4 h-4 text-sky-500 fill-sky-500 shrink-0 inline-block" />
              )}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {profile.fullName}
            </p>
            <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-300 mt-1">
              <span>
                <strong className="text-gray-900 dark:text-white">
                  {formatNumber(profile.followersCount)}
                </strong>{" "}
                pengikut
              </span>
              <span>
                <strong className="text-gray-900 dark:text-white">
                  {formatNumber(profile.mediaCount)}
                </strong>{" "}
                post
              </span>
            </div>
          </div>
        </div>

        {/* Bio & Link */}
        {profile.biography && (
          <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line line-clamp-3">
            {profile.biography}
          </p>
        )}
        {profile.externalUrl && (
          <div>
            <a
              href={profile.externalUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs text-sky-600 dark:text-sky-400 font-semibold hover:underline"
            >
              <ExternalLink className="w-3 h-3" />
              <span className="truncate max-w-xs">
                {profile.externalUrl.replace(/^https?:\/\//, "")}
              </span>
            </a>
          </div>
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
              {formatNumber(profile.averageLikes)}
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-[#1A2238] border border-gray-100 dark:border-[#2C3246]/60">
            <div className="text-[11px] text-gray-500 dark:text-gray-400 mb-0.5">
              Engagement Rate
            </div>
            <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
              {profile.averageEngagementRate}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
