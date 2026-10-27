"use client";

import React from "react";
import { TikTokUserProfile } from "./types";
import {
  ExternalLink,
  Flame,
  Eye,
  Video,
  Users,
  Heart,
  TrendingUp,
  CheckCircle2,
} from "lucide-react";

interface Props {
  profile: TikTokUserProfile;
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

export function TikTokProfileHeader({ profile }: Props) {
  const profileUrl = `https://www.tiktok.com/@${profile.username}`;

  return (
    <div className="w-full bg-white dark:bg-[#141B31] border border-gray-200 dark:border-[#2C3246] rounded-2xl p-5 sm:p-6 shadow-xs">
      {/* ========================================================================= */}
      {/* DESKTOP LAYOUT (md:flex) */}
      {/* ========================================================================= */}
      <div className="hidden md:flex items-start gap-6 lg:gap-8">
        {/* Avatar Profil */}
        <div className="relative shrink-0">
          <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-full p-0.5 bg-gradient-to-tr from-cyan-400 via-rose-500 to-purple-600 shadow-sm">
            <img
              src={
                profile.avatarUrl ||
                "https://p16-sign-va.tiktokcdn.com/tos-maliva-avt-0068/default.jpeg"
              }
              alt={profile.nickname}
              referrerPolicy="no-referrer"
              className="w-full h-full rounded-full object-cover border-2 border-white dark:border-[#141B31]"
            />
          </div>
        </div>

        {/* Info & Deskripsi */}
        <div className="flex-1 min-w-0 space-y-2.5">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-xl lg:text-2xl font-bold font-heading text-gray-900 dark:text-white flex items-center gap-1.5">
              <span>{profile.nickname}</span>
              {profile.isVerified && (
                <CheckCircle2 className="w-5 h-5 text-sky-500 fill-sky-500/20" />
              )}
            </h2>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-gray-100 dark:bg-white/10 text-gray-800 dark:text-gray-200">
              @{profile.username}
            </span>

            <a
              href={profileUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/15 text-gray-700 dark:text-gray-300 transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              <span>Buka di TikTok</span>
            </a>
          </div>

          {/* Metrik Standar TikTok (Followers, Total Likes, Videos) */}
          <div className="flex items-center gap-6 text-sm text-gray-700 dark:text-gray-300 flex-wrap">
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-cyan-500" />
              <span className="font-bold text-gray-900 dark:text-white text-base mr-1">
                {formatNumber(profile.followerCount)}
              </span>
              <span className="text-gray-500 dark:text-gray-400">pengikut</span>
            </div>

            <div className="flex items-center gap-1.5">
              <Heart className="w-4 h-4 text-rose-500" />
              <span className="font-bold text-gray-900 dark:text-white text-base mr-1">
                {formatNumber(profile.heartCount)}
              </span>
              <span className="text-gray-500 dark:text-gray-400">suka</span>
            </div>

            {profile.videoCount > 0 && (
              <div className="flex items-center gap-1.5">
                <Video className="w-4 h-4 text-purple-500" />
                <span className="font-bold text-gray-900 dark:text-white text-base mr-1">
                  {formatNumber(profile.videoCount)}
                </span>
                <span className="text-gray-500 dark:text-gray-400">video</span>
              </div>
            )}
          </div>

          {profile.signature && (
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 line-clamp-2 leading-relaxed pt-1 whitespace-pre-line">
              {profile.signature}
            </p>
          )}

          {profile.bioLink && (
            <div className="pt-0.5">
              <a
                href={profile.bioLink.startsWith("http") ? profile.bioLink : `https://${profile.bioLink}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1"
              >
                <ExternalLink className="w-3 h-3" />
                <span className="truncate max-w-xs">{profile.bioLink}</span>
              </a>
            </div>
          )}
        </div>

        {/* 4 Kartu Analitik Utama (Desktop Kanan) */}
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

          {/* 2. Top Outlier Multiplier */}
          <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500/10 to-rose-500/10 dark:from-amber-500/20 dark:to-rose-500/20 border border-amber-500/20">
            <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-semibold mb-1">
              <Flame className="w-3.5 h-3.5 fill-current" />
              <span>Top Outlier</span>
            </div>
            <div className="text-base font-bold text-amber-600 dark:text-amber-400">
              {profile.topOutlierMultiplier.toFixed(1)}x
            </div>
          </div>

          {/* 3. Rata-rata Suka */}
          <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#1A2238] border border-gray-100 dark:border-[#2C3246]/60">
            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mb-1">
              <Heart className="w-3.5 h-3.5 text-rose-500" />
              <span>Rata-rata Likes</span>
            </div>
            <div className="text-base font-bold text-gray-900 dark:text-white">
              {formatNumber(profile.averageLikes)}
            </div>
          </div>

          {/* 4. Rata-rata Engagement Rate */}
          <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#1A2238] border border-gray-100 dark:border-[#2C3246]/60">
            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mb-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
              <span>Rata-rata ER</span>
            </div>
            <div className="text-base font-bold text-emerald-600 dark:text-emerald-400">
              {profile.averageEngagementRate}%
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MOBILE LAYOUT (md:hidden) */}
      {/* ========================================================================= */}
      <div className="md:hidden space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full p-0.5 bg-gradient-to-tr from-cyan-400 via-rose-500 to-purple-600 shadow-sm shrink-0">
            <img
              src={
                profile.avatarUrl ||
                "https://p16-sign-va.tiktokcdn.com/tos-maliva-avt-0068/default.jpeg"
              }
              alt={profile.nickname}
              referrerPolicy="no-referrer"
              className="w-full h-full rounded-full object-cover border-2 border-white dark:border-[#141B31]"
            />
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold font-heading text-gray-900 dark:text-white truncate flex items-center gap-1">
              <span>{profile.nickname}</span>
              {profile.isVerified && (
                <CheckCircle2 className="w-4 h-4 text-sky-500 fill-sky-500/20 shrink-0" />
              )}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              @{profile.username}
            </p>
            <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-300 mt-1">
              <span>
                <strong className="text-gray-900 dark:text-white">
                  {formatNumber(profile.followerCount)}
                </strong>{" "}
                pengikut
              </span>
              <span>
                <strong className="text-gray-900 dark:text-white">
                  {formatNumber(profile.heartCount)}
                </strong>{" "}
                suka
              </span>
            </div>
          </div>
        </div>

        {profile.signature && (
          <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-3 leading-relaxed whitespace-pre-line">
            {profile.signature}
          </p>
        )}

        {/* 4 Kotak Analitik (Mobile Grid 2x2) */}
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
              <span>Top Outlier</span>
            </div>
            <div className="text-sm font-bold text-amber-600 dark:text-amber-400">
              {profile.topOutlierMultiplier.toFixed(1)}x
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-[#1A2238] border border-gray-100 dark:border-[#2C3246]/60">
            <div className="text-[11px] text-gray-500 dark:text-gray-400 mb-0.5">
              Rata-rata Suka
            </div>
            <div className="text-sm font-bold text-gray-900 dark:text-white">
              {formatNumber(profile.averageLikes)}
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-[#1A2238] border border-gray-100 dark:border-[#2C3246]/60">
            <div className="text-[11px] text-gray-500 dark:text-gray-400 mb-0.5">
              Rata-rata ER
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
