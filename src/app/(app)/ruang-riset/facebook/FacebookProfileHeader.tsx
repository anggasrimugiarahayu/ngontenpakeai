"use client";

import React from "react";
import { FacebookUserProfile } from "./types";
import {
  ExternalLink,
  Flame,
  Eye,
  Video,
  Users,
  Heart,
  TrendingUp,
  CheckCircle2,
  ThumbsUp,
  Globe,
} from "lucide-react";

interface Props {
  profile: FacebookUserProfile;
  onOpenInsights?: () => void;
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

export function FacebookProfileHeader({ profile, onOpenInsights }: Props) {
  const profileUrl = `https://www.facebook.com/${profile.username}`;

  return (
    <div className="w-full bg-white dark:bg-[#141B31] border border-gray-200 dark:border-[#2C3246] rounded-2xl p-5 sm:p-6 shadow-xs">
      {/* ========================================================================= */}
      {/* DESKTOP LAYOUT (md:flex) - Clean, Sleek & Hemat Tempat Seperti TikTok */}
      {/* ========================================================================= */}
      <div className="hidden md:flex items-start gap-6 lg:gap-8">
        {/* Avatar Profil */}
        <div className="relative shrink-0">
          <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-full p-0.5 bg-gradient-to-tr from-[#1877F2] via-sky-500 to-indigo-600 shadow-sm">
            <img
              src={
                profile.avatarUrl ||
                "https://static.xx.fbcdn.net/rsrc.php/v3/yo/r/UlIqmHJn-SK.gif"
              }
              alt={profile.name}
              referrerPolicy="no-referrer"
              className="w-full h-full rounded-full object-cover border-2 border-white dark:border-[#141B31]"
            />
          </div>
        </div>

        {/* Info & Deskripsi (Tengah) */}
        <div className="flex-1 min-w-0 space-y-2.5">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-xl lg:text-2xl font-bold font-heading text-gray-900 dark:text-white flex items-center gap-1.5">
              <span>{profile.name}</span>
              {profile.isVerified && (
                <CheckCircle2 className="w-5 h-5 text-[#1877F2] fill-[#1877F2]/20 shrink-0" />
              )}
            </h2>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-500/15 text-[#1877F2] dark:text-blue-400">
              @{profile.username}
            </span>
          </div>

          {/* Metrik Standar Facebook (Followers, Likes, Konten) */}
          <div className="flex items-center gap-6 text-sm text-gray-700 dark:text-gray-300 flex-wrap">
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-[#1877F2]" />
              <span className="font-bold text-gray-900 dark:text-white text-base mr-1">
                {formatNumber(profile.followersCount)}
              </span>
              <span className="text-gray-500 dark:text-gray-400">pengikut</span>
            </div>

            {profile.likesCount > 0 && (
              <div className="flex items-center gap-1.5">
                <ThumbsUp className="w-4 h-4 text-sky-500" />
                <span className="font-bold text-gray-900 dark:text-white text-base mr-1">
                  {formatNumber(profile.likesCount)}
                </span>
                <span className="text-gray-500 dark:text-gray-400">suka halaman</span>
              </div>
            )}

            {profile.postCount > 0 && (
              <div className="flex items-center gap-1.5">
                <Video className="w-4 h-4 text-indigo-500" />
                <span className="font-bold text-gray-900 dark:text-white text-base mr-1">
                  {formatNumber(profile.postCount)}
                </span>
                <span className="text-gray-500 dark:text-gray-400">konten dianalisis</span>
              </div>
            )}
          </div>

          {profile.biography && (
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 line-clamp-2 leading-relaxed pt-1 whitespace-pre-line">
              {profile.biography}
            </p>
          )}

          {/* Action Link & Buka di Facebook (Di Bawah Bio) */}
          <div className="pt-2 flex items-center gap-2 flex-wrap">
            {profile.externalUrl && (
              <a
                href={
                  profile.externalUrl.startsWith("http")
                    ? profile.externalUrl
                    : `https://${profile.externalUrl}`
                }
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-[#1877F2] dark:text-sky-400 hover:bg-blue-100 dark:hover:bg-blue-500/20 border border-blue-200 dark:border-blue-500/30 transition-colors"
              >
                <Globe className="w-3.5 h-3.5" />
                <span className="truncate max-w-xs">{profile.externalUrl}</span>
              </a>
            )}
            <a
              href={profileUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-[#1A2238] dark:hover:bg-[#252F48] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-[#2C3246] transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Buka di Facebook</span>
            </a>
          </div>
        </div>

        {/* 4 Kartu Analitik Utama (Desktop Kanan - Grid 2x2 Hemat Tempat Seperti TikTok) */}
        <div
          onClick={onOpenInsights}
          className={`grid grid-cols-2 gap-2.5 shrink-0 min-w-[280px] ${
            onOpenInsights
              ? "cursor-pointer group/cards hover:opacity-95 transition-opacity"
              : ""
          }`}
          title={onOpenInsights ? "Klik untuk melihat analisis lengkap" : undefined}
        >
          {/* 1. Rata-rata Views */}
          <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#1A2238] border border-gray-100 dark:border-[#2C3246]/60 group-hover/cards:border-blue-500/30 transition-colors">
            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mb-1">
              <Eye className="w-3.5 h-3.5 text-blue-500" />
              <span>Rata-rata Views</span>
            </div>
            <div className="text-base font-bold text-gray-900 dark:text-white">
              {formatNumber(profile.averageViews)}
            </div>
          </div>

          {/* 2. Puncak Viral / Top Outlier */}
          <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500/10 to-rose-500/10 dark:from-amber-500/20 dark:to-rose-500/20 border border-amber-500/20 group-hover/cards:border-amber-500/40 transition-colors">
            <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-semibold mb-1">
              <Flame className="w-3.5 h-3.5 fill-current" />
              <span>Puncak Viral</span>
            </div>
            <div className="text-base font-bold text-amber-600 dark:text-amber-400">
              {profile.topOutlierMultiplier.toFixed(1)}x
            </div>
          </div>

          {/* 3. Rata-rata Likes */}
          <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#1A2238] border border-gray-100 dark:border-[#2C3246]/60 group-hover/cards:border-rose-500/30 transition-colors">
            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mb-1">
              <Heart className="w-3.5 h-3.5 text-rose-500" />
              <span>Rata-rata Likes</span>
            </div>
            <div className="text-base font-bold text-gray-900 dark:text-white">
              {formatNumber(profile.averageLikes)}
            </div>
          </div>

          {/* 4. Engagement Rate */}
          <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#1A2238] border border-gray-100 dark:border-[#2C3246]/60 group-hover/cards:border-emerald-500/30 transition-colors">
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
      {/* MOBILE LAYOUT (md:hidden) */}
      {/* ========================================================================= */}
      <div className="md:hidden space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full p-0.5 bg-gradient-to-tr from-[#1877F2] via-sky-500 to-indigo-600 shadow-sm shrink-0">
            <img
              src={
                profile.avatarUrl ||
                "https://static.xx.fbcdn.net/rsrc.php/v3/yo/r/UlIqmHJn-SK.gif"
              }
              alt={profile.name}
              referrerPolicy="no-referrer"
              className="w-full h-full rounded-full object-cover border-2 border-white dark:border-[#141B31]"
            />
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold font-heading text-gray-900 dark:text-white truncate flex items-center gap-1">
              <span>{profile.name}</span>
              {profile.isVerified && (
                <CheckCircle2 className="w-4 h-4 text-[#1877F2] fill-[#1877F2]/20 shrink-0" />
              )}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              @{profile.username}
            </p>
            <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-300 mt-1">
              <span>
                <strong className="text-gray-900 dark:text-white">
                  {formatNumber(profile.followersCount)}
                </strong>{" "}
                pengikut
              </span>
              {profile.likesCount > 0 && (
                <span>
                  <strong className="text-gray-900 dark:text-white">
                    {formatNumber(profile.likesCount)}
                  </strong>{" "}
                  suka
                </span>
              )}
            </div>
          </div>
        </div>

        {profile.biography && (
          <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-3 leading-relaxed whitespace-pre-line">
            {profile.biography}
          </p>
        )}

        {/* Action Link & Buka di Facebook (Mobile) */}
        <div className="pt-1 flex items-center gap-2 flex-wrap">
          {profile.externalUrl && (
            <a
              href={
                profile.externalUrl.startsWith("http")
                  ? profile.externalUrl
                  : `https://${profile.externalUrl}`
              }
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-[#1877F2] dark:text-sky-400 hover:bg-blue-100 dark:hover:bg-blue-500/20 border border-blue-200 dark:border-blue-500/30 transition-colors"
            >
              <Globe className="w-3.5 h-3.5" />
              <span className="truncate max-w-xs">{profile.externalUrl}</span>
            </a>
          )}
          <a
            href={profileUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-[#1A2238] dark:hover:bg-[#252F48] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-[#2C3246] transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Buka di Facebook</span>
          </a>
        </div>

        {/* 4 Kotak Analitik (Mobile Grid 2x2) */}
        <div
          onClick={onOpenInsights}
          className={`grid grid-cols-2 gap-2 pt-1 ${
            onOpenInsights ? "cursor-pointer active:opacity-90" : ""
          }`}
        >
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
              <Flame className="w-3.5 h-3.5 fill-current" />
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
