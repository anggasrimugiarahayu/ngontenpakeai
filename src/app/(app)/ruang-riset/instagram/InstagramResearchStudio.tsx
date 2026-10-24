"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  InstagramTargetProfile,
  InstagramPostItem,
  SortOption,
  FilterMode,
  PostLimit,
  DateFilter,
} from "./types";
import { InstagramProfileHeader } from "./InstagramProfileHeader";
import { InstagramSortToolbar } from "./InstagramSortToolbar";
import { InstagramFeedGrid } from "./InstagramFeedGrid";
import { InstagramPostModal } from "./InstagramPostModal";
import { exportPostsToCSV } from "./exportUtils";
import { BackButton } from "@/components/ui/BackButton";
import { Button } from "@/components/ui/Button";
import {
  Search,
  AlertCircle,
  SlidersHorizontal,
  Settings2,
  CheckCircle2,
  KeyRound,
  RefreshCw,
  X,
  ShieldCheck,
  Info,
} from "lucide-react";

interface Props {
  onBackToPlatformHub: () => void;
  defaultUsername?: string;
  isAdmin?: boolean;
}

interface RisetConfigStatus {
  hasSessionId: boolean;
  maskedSessionId: string;
  hasRapidApiKey: boolean;
  maskedRapidApiKey: string;
  rapidApiHost: string;
  hasMetaPageToken: boolean;
  maskedMetaPageToken: string;
  instagramBusinessAccountId: string;
}

function isWithinDateFilter(timestamp: string, dateFilter: DateFilter): boolean {
  if (dateFilter === "all") return true;
  const postTime = new Date(timestamp).getTime();
  if (isNaN(postTime)) return true;
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  let days = Infinity;
  switch (dateFilter) {
    case "1w":
      days = 7;
      break;
    case "1m":
      days = 30;
      break;
    case "3m":
      days = 90;
      break;
    case "6m":
      days = 180;
      break;
    case "1y":
      days = 365;
      break;
  }
  return now - postTime <= days * dayMs;
}

function getSourceLabel(source?: string | null): string {
  switch (source) {
    case "instagram_direct_api":
      return "Live: Instagram Graph API Resmi";
    case "instagram_web_session":
      return "Live: Instagram Web Session (Real-Time)";
    case "rapidapi_live_scraper":
      return "Live: RapidAPI Instagram Scraper";
    case "meta_business_discovery":
      return "Live: Meta Business Discovery API";
    case "instagram_public_header_only":
      return "Live: Profil Publik Instagram (Tanpa Feed)";
    default:
      return "Live Data Instagram";
  }
}

export function InstagramResearchStudio({
  onBackToPlatformHub,
  defaultUsername = "creativemuslim.co",
  isAdmin = false,
}: Props) {
  const [usernameInput, setUsernameInput] = useState(defaultUsername);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStepText, setLoadingStepText] = useState("");
  const [loadingPercent, setLoadingPercent] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<string | null>(null);
  const [feedUnavailableReason, setFeedUnavailableReason] = useState<string | null>(null);

  // Clean initial state: profile & posts are null/empty until user triggers search
  const [profile, setProfile] = useState<InstagramTargetProfile | null>(null);
  const [posts, setPosts] = useState<InstagramPostItem[]>([]);
  const [selectedPost, setSelectedPost] = useState<InstagramPostItem | null>(null);

  // Gallery hidden initially until user selects & applies Filter & Sort
  const [hasAppliedFilter, setHasAppliedFilter] = useState(false);

  // Sorting & Filtering State (SortFeed UX)
  const [filterMode, setFilterMode] = useState<FilterMode>("posts");
  const [postLimit, setPostLimit] = useState<PostLimit>(25);
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [sortOption, setSortOption] = useState<SortOption>("likes");

  // Admin Config Modal State
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [configStatus, setConfigStatus] = useState<RisetConfigStatus | null>(null);
  const [sessionIdInput, setSessionIdInput] = useState("");
  const [rapidApiKeyInput, setRapidApiKeyInput] = useState("");
  const [rapidApiHostInput, setRapidApiHostInput] = useState("instagram-scraper-api2.p.rapidapi.com");
  const [metaTokenInput, setMetaTokenInput] = useState("");
  const [igBusinessIdInput, setIgBusinessIdInput] = useState("17841445108128356");
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [configMessage, setConfigMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (!isAdmin) return;
    fetch("/api/ruang-riset/config")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data && !data.error) {
          setConfigStatus(data);
          if (data.rapidApiHost) setRapidApiHostInput(data.rapidApiHost);
          if (data.instagramBusinessAccountId) {
            setIgBusinessIdInput(data.instagramBusinessAccountId);
          }
        }
      })
      .catch(() => {});
  }, [isAdmin]);

  // Function to execute research
  const handleSearch = async (userToSearch: string, forceRefresh = false) => {
    const clean = userToSearch.trim().replace(/^@/, "");
    if (!clean) return;

    setIsLoading(true);
    setError(null);
    setFeedUnavailableReason(null);
    setHasAppliedFilter(false);
    setLoadingPercent(15);
    setLoadingStepText(`Mengambil data live @${clean} dari Instagram...`);

    const timer1 = setTimeout(() => {
      setLoadingPercent(45);
      setLoadingStepText("Menarik daftar postingan, Reels & metrik tayangan asli...");
    }, 450);

    const timer2 = setTimeout(() => {
      setLoadingPercent(75);
      setLoadingStepText("Mengkalkulasi Outlier Score & ranking konten viral...");
    }, 950);

    const timer3 = setTimeout(() => {
      setLoadingPercent(92);
      setLoadingStepText("Menyusun data analitik profil...");
    }, 1400);

    try {
      const res = await fetch("/api/ruang-riset/instagram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: clean, forceRefresh }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || "Gagal mengambil data akun");
      }

      setLoadingPercent(100);
      setLoadingStepText("Selesai 100%!");

      setTimeout(() => {
        setProfile(data.profile);
        setPosts(data.posts || []);
        setDataSource(data.source || null);
        setFeedUnavailableReason(data.feedUnavailableReason || null);
        setIsLoading(false);
      }, 250);
    } catch (err: any) {
      setError(err?.message || "Terjadi kesalahan saat memproses riset akun.");
      setProfile(null);
      setPosts([]);
      setIsLoading(false);
    } finally {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingConfig(true);
    setConfigMessage(null);

    try {
      const payload: Record<string, string> = {
        rapidApiHost: rapidApiHostInput.trim(),
        instagramBusinessAccountId: igBusinessIdInput.trim(),
      };
      if (sessionIdInput.trim()) {
        payload.instagramSessionId = sessionIdInput.trim();
      }
      if (rapidApiKeyInput.trim()) {
        payload.rapidApiKey = rapidApiKeyInput.trim();
      }
      if (metaTokenInput.trim()) {
        payload.metaPageAccessToken = metaTokenInput.trim();
      }

      const res = await fetch("/api/ruang-riset/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Gagal menyimpan konfigurasi");
      }

      setConfigStatus(data);
      setSessionIdInput("");
      setRapidApiKeyInput("");
      setMetaTokenInput("");
      setConfigMessage({
        type: "success",
        text: "Konfigurasi berhasil disimpan! Memuat ulang riset akun...",
      });

      setTimeout(() => {
        setIsConfigOpen(false);
        setConfigMessage(null);
        if (usernameInput.trim()) {
          handleSearch(usernameInput, true);
        }
      }, 900);
    } catch (err: any) {
      setConfigMessage({
        type: "error",
        text: err?.message || "Gagal menyimpan konfigurasi",
      });
    } finally {
      setIsSavingConfig(false);
    }
  };

  // Reset all filters to default
  const handleResetFilters = () => {
    setFilterMode("posts");
    setPostLimit(25);
    setDateFilter("all");
    setSortOption("likes");
  };

  // Filtered & Sorted Posts with SortFeed Logic
  const filteredAndSortedPosts = useMemo(() => {
    let result = [...posts];

    if (filterMode === "date") {
      result = result.filter((p) => isWithinDateFilter(p.timestamp, dateFilter));
    }

    result.sort((a, b) => {
      switch (sortOption) {
        case "likes":
          return b.likesCount - a.likesCount;
        case "views":
          return b.viewsCount - a.viewsCount;
        case "outlier":
          return b.outlierScore - a.outlierScore;
        case "comments":
          return b.commentsCount - a.commentsCount;
        case "newest":
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        case "oldest":
          return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
        default:
          return b.likesCount - a.likesCount;
      }
    });

    if (filterMode === "posts" && postLimit !== "all") {
      result = result.slice(0, postLimit);
    }

    return result;
  }, [posts, sortOption, filterMode, postLimit, dateFilter]);

  const handleExportCSV = () => {
    if (!profile) return;
    exportPostsToCSV(filteredAndSortedPosts, profile);
  };

  const hasActiveScraperConnection = Boolean(
    configStatus?.hasSessionId || configStatus?.hasRapidApiKey
  );

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-300">
      {/* Top Navigation: Tombol Kembali & Tombol Koneksi API Riset (Khusus Admin) */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <BackButton onClick={onBackToPlatformHub} />

        {isAdmin && (
          <button
            type="button"
            onClick={() => {
              setConfigMessage(null);
              setIsConfigOpen(true);
            }}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-white hover:bg-gray-50 dark:bg-[#141B31] dark:hover:bg-[#1f2947] border border-gray-200 dark:border-[#2C3246] text-gray-700 dark:text-gray-200 shadow-xs transition-all cursor-pointer"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                hasActiveScraperConnection ? "bg-emerald-500" : "bg-amber-500 animate-pulse"
              }`}
            />
            <Settings2 className="w-3.5 h-3.5 text-rn-accent" />
            <span>Koneksi API Riset</span>
          </button>
        )}
      </div>

      {/* Header */}
      <div className="flex flex-col items-center justify-center text-center gap-2 mb-8 md:mb-10">
        <div className="space-y-3 flex flex-col items-center">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 dark:text-white font-heading">
            Mau riset akun siapa?
          </h1>
          <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 max-w-xl mx-auto text-balance leading-relaxed">
            Ketik username Instagram akun rujukan atau kompetitor di niche kamu untuk menyortir konten dengan tayangan terbanyak dan Outlier Score tertinggi.
          </p>
        </div>

        {/* Input Search Form Standar */}
        <div className="w-full max-w-2xl mx-auto mt-6 space-y-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch(usernameInput);
            }}
            className="flex flex-col sm:flex-row items-stretch gap-2.5"
          >
            <div className="relative flex-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-sm text-gray-400 pointer-events-none">
                @
              </span>
              <input
                type="text"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder="Ketik username (contoh: creativemuslim.co)"
                className="w-full pl-9 pr-4 py-3 text-sm font-medium rounded-xl bg-white dark:bg-[#141B31] border border-gray-200 dark:border-[#2C3246] text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rn-accent/20 focus:border-rn-accent transition-all shadow-xs"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading || !usernameInput.trim()}
              isLoading={isLoading}
              loadingText="Menganalisis..."
              icon={<Search className="w-4 h-4" />}
              size="lg"
              className="shrink-0"
            >
              Riset Konten
            </Button>
          </form>

          {/* Quick Suggestion Chips */}
          <div className="flex items-center justify-center gap-2 flex-wrap text-xs pt-1">
            <span className="text-gray-400 font-medium">Contoh Akun:</span>
            {["creativemuslim.co", "ruangngontenmuslim", "papamenyapa", "dr.tirta"].map((acc) => (
              <button
                key={acc}
                type="button"
                onClick={() => {
                  setUsernameInput(acc);
                  handleSearch(acc);
                }}
                className="px-2.5 py-1 rounded-lg bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 dark:bg-[#141B31] dark:hover:bg-[#1f2947] dark:border-[#2C3246] dark:text-gray-200 font-bold transition-colors cursor-pointer"
              >
                @{acc}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Loading Progress Indicator */}
      {isLoading && (
        <div className="w-full p-6 sm:p-8 bg-white dark:bg-[#141B31] rounded-2xl border border-gray-200 dark:border-[#2C3246] shadow-sm text-center space-y-4 animate-in fade-in duration-200 max-w-2xl mx-auto">
          <div className="w-10 h-10 rounded-full border-3 border-orange-500 border-t-transparent animate-spin mx-auto" />
          <div className="space-y-1.5 max-w-md mx-auto">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-gray-600 dark:text-gray-300">{loadingStepText}</span>
              <span className={loadingPercent === 100 ? "text-emerald-500" : "text-orange-500"}>
                {loadingPercent}%
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-gray-100 dark:bg-white/5 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  loadingPercent === 100 ? "bg-emerald-500" : "bg-orange-500"
                }`}
                style={{ width: `${loadingPercent}%` }}
              />
            </div>
          </div>
          <p className="text-[11px] text-gray-400">
            Mengambil data real-time langsung dari Instagram (bukan data simulasi)
          </p>
        </div>
      )}

      {/* Error Notice */}
      {error && !isLoading && (
        <div className="max-w-2xl mx-auto p-4 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-300 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm font-semibold">{error}</p>
        </div>
      )}

      {/* Main Results View */}
      {!isLoading && profile && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Status Bar Sumber Data & Refresh */}
          <div className="flex items-center justify-between gap-2 flex-wrap px-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{getSourceLabel(dataSource)}</span>
            </div>

            <button
              type="button"
              onClick={() => handleSearch(profile.username, true)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Data Live</span>
            </button>
          </div>

          {/* 1. Profile Header */}
          <InstagramProfileHeader
            profile={profile}
            filterMode={filterMode}
            setFilterMode={setFilterMode}
            postLimit={postLimit}
            setPostLimit={setPostLimit}
            dateFilter={dateFilter}
            setDateFilter={setDateFilter}
            sortOption={sortOption}
            setSortOption={setSortOption}
            onResetFilters={handleResetFilters}
            onApplyFilters={() => setHasAppliedFilter(true)}
            hasAppliedFilter={hasAppliedFilter}
          />

          {/* 2. Jika Post Feed Belum Terambil (Karena Butuh Session ID / RapidAPI Key) */}
          {posts.length === 0 && feedUnavailableReason && (
            <div className="w-full p-6 sm:p-8 rounded-2xl border border-amber-300/70 dark:border-amber-500/30 bg-amber-50/60 dark:bg-amber-500/10 text-center space-y-4 animate-in fade-in duration-200">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
                <KeyRound className="w-6 h-6" />
              </div>
              <div className="space-y-2 max-w-xl mx-auto">
                <h4 className="font-bold text-base sm:text-lg text-gray-900 dark:text-white font-heading">
                  Profil Asli @{profile.username} Berhasil Ditemukan, Namun Daftar Feed & Reels Membutuhkan Koneksi Session / API
                </h4>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  {feedUnavailableReason}
                </p>
              </div>
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => {
                    setConfigMessage(null);
                    setIsConfigOpen(true);
                  }}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#f97316] hover:bg-[#ea580c] text-white font-bold text-xs sm:text-sm shadow-sm shadow-orange-500/20 transition-all cursor-pointer"
                >
                  <Settings2 className="w-4 h-4" />
                  <span>Hubungkan Instagram Session ID / RapidAPI Sekarang</span>
                </button>
              )}
            </div>
          )}

          {/* 3. Kartu Panduan Sebelum Membuka Feed (Jika Posts Ada) */}
          {posts.length > 0 && !hasAppliedFilter && (
            <div className="w-full p-8 sm:p-10 rounded-2xl border border-dashed border-gray-300 dark:border-[#2C3246] bg-gray-50/50 dark:bg-[#141B31] text-center space-y-4 animate-in fade-in duration-200">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-rn-accent flex items-center justify-center mx-auto shadow-xs">
                <SlidersHorizontal className="w-6 h-6" />
              </div>
              <div className="space-y-1.5 max-w-md mx-auto">
                <h4 className="font-bold text-base sm:text-lg text-gray-900 dark:text-white font-heading">
                  Pilih Kriteria Sortir & Filter Feed
                </h4>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                  Berhasil menarik <strong>{posts.length} postingan & Reels asli</strong> dari @{profile.username}. Klik tombol <strong>Filters & Sort</strong> di kanan atas atau tombol di bawah ini untuk menampilkan postingan yang disortir.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setHasAppliedFilter(true)}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#f97316] hover:bg-[#ea580c] dark:bg-[#f97316] dark:hover:bg-[#fb923c] text-white font-bold text-xs sm:text-sm shadow-sm shadow-orange-500/20 transition-all transform active:scale-95 cursor-pointer"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>Tampilkan Feed Konten ({filteredAndSortedPosts.length} Post)</span>
              </button>
            </div>
          )}

          {/* 4. Galeri Feed & Toolbar */}
          {posts.length > 0 && hasAppliedFilter && (
            <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
              <InstagramSortToolbar
                sortOption={sortOption}
                setSortOption={setSortOption}
                filterMode={filterMode}
                setFilterMode={setFilterMode}
                postLimit={postLimit}
                setPostLimit={setPostLimit}
                dateFilter={dateFilter}
                setDateFilter={setDateFilter}
                totalFiltered={filteredAndSortedPosts.length}
                totalCount={posts.length}
                onExport={handleExportCSV}
                onResetFilters={handleResetFilters}
              />

              <InstagramFeedGrid
                posts={filteredAndSortedPosts}
                profile={profile}
                sortOption={sortOption}
                onSelectPost={(post) => setSelectedPost(post)}
              />
            </div>
          )}

          {/* 5. Post Inspect Modal */}
          <InstagramPostModal
            post={selectedPost}
            profile={profile}
            onClose={() => setSelectedPost(null)}
          />
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL KONFIGURASI KONEKSI RISET (KHUSUS ADMIN)                        */}
      {/* ===================================================================== */}
      {isAdmin && isConfigOpen && (
        <div
          className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setIsConfigOpen(false)}
        >
          <div
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-[#141B31] border border-gray-200 dark:border-[#2C3246] shadow-2xl p-6 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-gray-100 dark:border-[#2C3246] pb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white font-heading flex items-center gap-2">
                  <Settings2 className="w-5 h-5 text-rn-accent" />
                  <span>Konfigurasi Mesin Riset Instagram (Real-Time)</span>
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Hubungkan salah satu sumber di bawah ini agar Ruang Riset dapat menarik Post Feed, Reels, dan jumlah Views asli dari akun publik mana pun (seperti @creativemuslim.co).
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsConfigOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveConfig} className="space-y-5">
              {/* OPSI 1: INSTAGRAM SESSION ID (DIREKOMENDASIKAN & GRATIS) */}
              <div className="p-4 rounded-xl bg-orange-50/50 dark:bg-orange-500/5 border border-orange-200/70 dark:border-orange-500/20 space-y-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-orange-500 text-white">
                      Metode 1 (Direkomendasikan • Gratis)
                    </span>
                    <span className="font-bold text-sm text-gray-900 dark:text-white">
                      Instagram Web Session ID (sessionid)
                    </span>
                  </div>
                  {configStatus?.hasSessionId && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Aktif ({configStatus.maskedSessionId})</span>
                    </span>
                  )}
                </div>

                <div className="p-3 rounded-lg bg-white/80 dark:bg-[#0D1326] border border-orange-200/50 dark:border-[#2C3246] text-xs text-gray-600 dark:text-gray-300 space-y-1">
                  <p className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                    <span>Cara mengambil Session ID (30 detik):</span>
                  </p>
                  <ol className="list-decimal list-inside space-y-0.5 pl-1 text-[11px] leading-relaxed">
                    <li>Buka <strong>instagram.com</strong> di browser Chrome/Edge (gunakan akun IG kedua/pendukung).</li>
                    <li>Klik Kanan &gt; <strong>Inspect (F12)</strong> &gt; buka tab <strong>Application</strong> &gt; <strong>Cookies</strong> &gt; <code>https://www.instagram.com</code>.</li>
                    <li>Cari baris bernama <strong><code>sessionid</code></strong>, salin kolom <strong>Value</strong>-nya, lalu tempel di bawah ini.</li>
                  </ol>
                </div>

                <input
                  type="password"
                  value={sessionIdInput}
                  onChange={(e) => setSessionIdInput(e.target.value)}
                  placeholder={
                    configStatus?.hasSessionId
                      ? `Tersimpan (${configStatus.maskedSessionId}) — Isi untuk mengganti`
                      : "Tempel value cookie sessionid di sini..."
                  }
                  className="w-full px-3.5 py-2.5 text-xs font-mono rounded-xl bg-white dark:bg-[#0D1326] border border-gray-200 dark:border-[#2C3246] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rn-accent/20 focus:border-rn-accent"
                />
              </div>

              {/* OPSI 2: RAPIDAPI INSTAGRAM SCRAPER */}
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-[#0D1326]/60 border border-gray-200 dark:border-[#2C3246] space-y-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-purple-600 text-white">
                      Metode 2 (Standar SaaS)
                    </span>
                    <span className="font-bold text-sm text-gray-900 dark:text-white">
                      RapidAPI Instagram Scraper Key
                    </span>
                  </div>
                  {configStatus?.hasRapidApiKey && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Aktif ({configStatus.maskedRapidApiKey})</span>
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-1">
                      RapidAPI Key (x-rapidapi-key)
                    </label>
                    <input
                      type="password"
                      value={rapidApiKeyInput}
                      onChange={(e) => setRapidApiKeyInput(e.target.value)}
                      placeholder={
                        configStatus?.hasRapidApiKey
                          ? `Tersimpan (${configStatus.maskedRapidApiKey})`
                          : "Opsional: masukkan RapidAPI Key..."
                      }
                      className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-white dark:bg-[#141B31] border border-gray-200 dark:border-[#2C3246] text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-1">
                      RapidAPI Host
                    </label>
                    <input
                      type="text"
                      value={rapidApiHostInput}
                      onChange={(e) => setRapidApiHostInput(e.target.value)}
                      placeholder="instagram-scraper-api2.p.rapidapi.com"
                      className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-white dark:bg-[#141B31] border border-gray-200 dark:border-[#2C3246] text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* OPSI 3: META BUSINESS DISCOVERY */}
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-[#0D1326]/60 border border-gray-200 dark:border-[#2C3246] space-y-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-sky-600 text-white">
                      Metode 3 (Meta Resmi)
                    </span>
                    <span className="font-bold text-sm text-gray-900 dark:text-white">
                      Meta Page Access Token (Business Discovery)
                    </span>
                  </div>
                  {configStatus?.hasMetaPageToken && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Tersimpan ({configStatus.maskedMetaPageToken})</span>
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-1">
                      META_PAGE_ACCESS_TOKEN (EAA...)
                    </label>
                    <input
                      type="password"
                      value={metaTokenInput}
                      onChange={(e) => setMetaTokenInput(e.target.value)}
                      placeholder={
                        configStatus?.hasMetaPageToken
                          ? `Tersimpan (${configStatus.maskedMetaPageToken})`
                          : "Opsional: token EAA..."
                      }
                      className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-white dark:bg-[#141B31] border border-gray-200 dark:border-[#2C3246] text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-1">
                      Instagram Business Account ID Pemanggil
                    </label>
                    <input
                      type="text"
                      value={igBusinessIdInput}
                      onChange={(e) => setIgBusinessIdInput(e.target.value)}
                      placeholder="17841445108128356"
                      className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-white dark:bg-[#141B31] border border-gray-200 dark:border-[#2C3246] text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {configMessage && (
                <div
                  className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                    configMessage.type === "success"
                      ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/20"
                      : "bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-500/20"
                  }`}
                >
                  {configMessage.type === "success" ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0" />
                  )}
                  <span>{configMessage.text}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-gray-100 dark:border-[#2C3246]">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsConfigOpen(false)}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  isLoading={isSavingConfig}
                  loadingText="Menyimpan Perubahan..."
                >
                  Simpan Perubahan
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
