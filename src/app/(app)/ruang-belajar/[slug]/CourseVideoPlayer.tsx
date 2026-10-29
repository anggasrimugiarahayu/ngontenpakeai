"use client";

import React, { useState, useEffect } from "react";
import {
  Play,
  CheckCircle2,
  Circle,
  ChevronLeft,
  ChevronRight,
  Clock,
  BookOpen,
  FileText,
  Star,
  Sparkles,
  Copy,
  Check,
  Share2,
} from "lucide-react";
import { BackButton } from "@/components/ui/BackButton";
import EbookActions from "./EbookActions";
import ReviewSection from "./ReviewSection";
import { getYoutubeEmbedUrl } from "@/lib/youtube-utils";
import toast from "react-hot-toast";

interface VideoItem {
  id: string;
  title: string;
  youtubeUrl: string;
  duration?: string;
  isFreePreview?: boolean;
  notes?: string;
}

interface CourseVideoPlayerProps {
  ebook: any;
  isFavorite: boolean;
  favoriteCount: number;
  userReview: any;
  userId?: string | null;
}

export default function CourseVideoPlayer({
  ebook,
  isFavorite,
  favoriteCount,
  userReview,
  userId,
}: CourseVideoPlayerProps) {
  // Parse video list
  const videoList: VideoItem[] = React.useMemo(() => {
    if (!ebook.videoList) return [];
    if (Array.isArray(ebook.videoList)) return ebook.videoList;
    try {
      const parsed = JSON.parse(ebook.videoList);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, [ebook.videoList]);

  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const [completedVideos, setCompletedVideos] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"notes" | "description" | "reviews">("notes");
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  // Load progress from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`course_progress_${ebook.id}`);
      if (saved) {
        setCompletedVideos(JSON.parse(saved));
      }
    } catch {}
  }, [ebook.id]);

  const toggleVideoCompleted = (videoId: string) => {
    setCompletedVideos((prev) => {
      let updated: string[];
      if (prev.includes(videoId)) {
        updated = prev.filter((id) => id !== videoId);
      } else {
        updated = [...prev, videoId];
        toast.success("Materi ditandai selesai! 🎉");
      }
      try {
        localStorage.setItem(`course_progress_${ebook.id}`, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const activeVideo = videoList[activeVideoIndex] || videoList[0];
  const embedUrl = activeVideo ? getYoutubeEmbedUrl(activeVideo.youtubeUrl, true) : null;
  const progressPercent = videoList.length > 0
    ? Math.round((completedVideos.length / videoList.length) * 100)
    : 0;

  const handleCopyNotes = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPrompt(true);
    toast.success("Catatan / Prompt berhasil disalin!");
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gray-50 dark:bg-[#0A1128] text-gray-900 dark:text-white flex flex-col">
      {/* Sticky Header Toolbar */}
      <header className="sticky top-0 z-30 h-16 border-b border-gray-200 dark:border-[#2C3246] bg-white/95 dark:bg-[#0A1128]/95 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <BackButton
            href="/ruang-belajar"
            onClick={() => {
              window.location.href = "/ruang-belajar";
            }}
          />
          <div className="min-w-0">
            <h1 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white truncate flex items-center gap-2">
              {ebook.title}
              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 shrink-0">
                VIDEO COURSE
              </span>
            </h1>
            <div className="flex items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
              <span>{ebook.category?.name || "Kelas Online"}</span>
              {ebook.totalDuration && (
                <>
                  <span>•</span>
                  <span>{ebook.totalDuration}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Progress & Actions */}
        <div className="flex items-center gap-3 sm:gap-5 shrink-0">
          <div className="hidden md:flex flex-col items-end">
            <div className="text-[11px] font-bold text-gray-700 dark:text-gray-300">
              Progress: {completedVideos.length} / {videoList.length} Selesai ({progressPercent}%)
            </div>
            <div className="w-36 h-2 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden mt-1">
              <div
                className="h-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <EbookActions
            productId={ebook.id}
            initialIsFavorite={isFavorite}
            initialFavoriteCount={favoriteCount}
            canReview={true}
            userReview={userReview}
          />
        </div>
      </header>

      {/* Main Classroom Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* KOLOM KIRI: Player Video & Konten (8 Kolom) */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            {/* Player Container 16:9 */}
            <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-xl border border-gray-200 dark:border-[#2C3246]">
              {embedUrl ? (
                <iframe
                  src={embedUrl}
                  title={activeVideo?.title || "Video Pembelajaran"}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-gray-400">
                  <Play size={48} className="text-gray-600 mb-2" />
                  <p className="font-bold text-sm text-gray-300">
                    Belum ada video materi yang dipilih
                  </p>
                </div>
              )}
            </div>

            {/* Navigasi Cepat Sebelum / Sesudah */}
            <div className="bg-white dark:bg-[#141B31] border border-gray-200 dark:border-[#2C3246] rounded-xl p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3 shadow-sm">
              <button
                onClick={() => setActiveVideoIndex((prev) => Math.max(0, prev - 1))}
                disabled={activeVideoIndex === 0}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-gray-700 dark:text-gray-200 disabled:opacity-40 disabled:hover:bg-gray-100 dark:disabled:hover:bg-white/5 cursor-pointer transition-colors"
              >
                <ChevronLeft size={16} />
                <span>Materi Sebelumnya</span>
              </button>

              {activeVideo && (
                <button
                  onClick={() => toggleVideoCompleted(activeVideo.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    completedVideos.includes(activeVideo.id)
                      ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                      : "bg-[#f97316] hover:bg-[#ea580c] text-white shadow-sm shadow-orange-500/20"
                  }`}
                >
                  <CheckCircle2 size={16} />
                  <span>
                    {completedVideos.includes(activeVideo.id)
                      ? "Materi Sudah Selesai ✓"
                      : "Tandai Materi Selesai"}
                  </span>
                </button>
              )}

              <button
                onClick={() =>
                  setActiveVideoIndex((prev) => Math.min(videoList.length - 1, prev + 1))
                }
                disabled={activeVideoIndex >= videoList.length - 1}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-gray-700 dark:text-gray-200 disabled:opacity-40 disabled:hover:bg-gray-100 dark:disabled:hover:bg-white/5 cursor-pointer transition-colors"
              >
                <span>Materi Berikutnya</span>
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Info Materi & Tabs di Bawah Video */}
            <div className="bg-white dark:bg-[#141B31] border border-gray-200 dark:border-[#2C3246] rounded-2xl p-5 shadow-sm">
              <div className="mb-4">
                <div className="flex items-center gap-2 text-xs font-bold text-rn-accent mb-1">
                  <span>MATERI #{activeVideoIndex + 1} DARI {videoList.length}</span>
                  {activeVideo?.duration && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                        <Clock size={12} /> {activeVideo.duration}
                      </span>
                    </>
                  )}
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white leading-tight">
                  {activeVideo?.title || "Judul Materi"}
                </h2>
              </div>

              {/* Tab Selector */}
              <div className="flex border-b border-gray-200 dark:border-[#2C3246] gap-6 text-sm font-bold mb-4">
                <button
                  onClick={() => setActiveTab("notes")}
                  className={`pb-3 transition-colors relative cursor-pointer ${
                    activeTab === "notes"
                      ? "text-rn-accent"
                      : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Sparkles size={16} /> Catatan & Prompt AI
                  </span>
                  {activeTab === "notes" && (
                    <div className="absolute bottom-0 left-0 w-full h-0.5 bg-rn-accent rounded-full" />
                  )}
                </button>

                <button
                  onClick={() => setActiveTab("description")}
                  className={`pb-3 transition-colors relative cursor-pointer ${
                    activeTab === "description"
                      ? "text-rn-accent"
                      : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <FileText size={16} /> Deskripsi Kelas
                  </span>
                  {activeTab === "description" && (
                    <div className="absolute bottom-0 left-0 w-full h-0.5 bg-rn-accent rounded-full" />
                  )}
                </button>

                <button
                  onClick={() => setActiveTab("reviews")}
                  className={`pb-3 transition-colors relative cursor-pointer ${
                    activeTab === "reviews"
                      ? "text-rn-accent"
                      : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Star size={16} /> Ulasan & Diskusi ({ebook.reviews?.length || 0})
                  </span>
                  {activeTab === "reviews" && (
                    <div className="absolute bottom-0 left-0 w-full h-0.5 bg-rn-accent rounded-full" />
                  )}
                </button>
              </div>

              {/* Tab Content */}
              <div>
                {activeTab === "notes" && (
                  <div>
                    {activeVideo?.notes ? (
                      <div className="space-y-3">
                        <div className="flex justify-end">
                          <button
                            onClick={() => handleCopyNotes(activeVideo.notes!)}
                            className="flex items-center gap-1.5 text-xs font-bold text-rn-accent hover:text-orange-600 bg-orange-50 dark:bg-orange-950/30 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                          >
                            {copiedPrompt ? <Check size={14} /> : <Copy size={14} />}
                            <span>{copiedPrompt ? "Tersalin!" : "Salin Catatan / Prompt"}</span>
                          </button>
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-black/30 rounded-xl border border-gray-200 dark:border-[#2C3246] text-xs sm:text-sm leading-relaxed text-gray-700 dark:text-gray-300 font-mono whitespace-pre-wrap">
                          {activeVideo.notes}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-400 text-xs">
                        Tidak ada catatan khusus untuk materi ini.
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "description" && (
                  <div className="prose prose-sm dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap text-xs sm:text-sm">
                    {ebook.description || "Tidak ada deskripsi kursus."}
                  </div>
                )}

                {activeTab === "reviews" && (
                  <ReviewSection
                    productId={ebook.id}
                    reviews={ebook.reviews}
                    canReview={true}
                    userReview={userReview}
                  />
                )}
              </div>
            </div>
          </div>

          {/* KOLOM KANAN: Sidebar Playlist Kurikulum (4 Kolom) */}
          <div className="lg:col-span-4 sticky top-20">
            <div className="bg-white dark:bg-[#141B31] border border-gray-200 dark:border-[#2C3246] rounded-2xl shadow-sm overflow-hidden flex flex-col max-h-[calc(100vh-120px)]">
              {/* Header Playlist */}
              <div className="p-4 border-b border-gray-200 dark:border-[#2C3246] bg-gray-50/50 dark:bg-white/5">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                    <BookOpen size={16} className="text-red-500" />
                    Silabus Materi ({videoList.length} Video)
                  </h3>
                  <span className="text-xs font-bold text-orange-500">
                    {progressPercent}%
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  {completedVideos.length} dari {videoList.length} video selesai
                </p>
                <div className="w-full h-1.5 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden mt-2">
                  <div
                    className="h-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Daftar Video Playlist */}
              <div className="overflow-y-auto custom-scrollbar divide-y divide-gray-100 dark:divide-white/5 flex-1 p-2 space-y-1">
                {videoList.map((vid, idx) => {
                  const isActive = idx === activeVideoIndex;
                  const isDone = completedVideos.includes(vid.id);

                  return (
                    <button
                      key={vid.id || idx}
                      onClick={() => setActiveVideoIndex(idx)}
                      className={`w-full text-left p-3 rounded-xl transition-all flex items-start gap-3 cursor-pointer ${
                        isActive
                          ? "bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 shadow-sm"
                          : "hover:bg-gray-50 dark:hover:bg-white/5 border border-transparent"
                      }`}
                    >
                      {/* Check / Status Icon */}
                      <div className="shrink-0 mt-0.5">
                        {isDone ? (
                          <CheckCircle2 size={18} className="text-emerald-500" />
                        ) : isActive ? (
                          <div className="w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center text-[10px] font-bold">
                            ▶
                          </div>
                        ) : (
                          <Circle size={18} className="text-gray-300 dark:text-gray-600" />
                        )}
                      </div>

                      {/* Video Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span
                            className={`text-[10px] font-extrabold uppercase ${
                              isActive
                                ? "text-red-600 dark:text-red-400"
                                : "text-gray-400 dark:text-gray-500"
                            }`}
                          >
                            VIDEO #{idx + 1}
                          </span>
                          {vid.isFreePreview && (
                            <span className="text-[9px] bg-green-100 dark:bg-green-950/40 text-green-600 dark:text-green-400 font-bold px-1.5 py-0.2 rounded">
                              TRAILER
                            </span>
                          )}
                        </div>
                        <h4
                          className={`text-xs font-bold leading-snug line-clamp-2 ${
                            isActive
                              ? "text-red-600 dark:text-white"
                              : "text-gray-800 dark:text-gray-200"
                          }`}
                        >
                          {vid.title}
                        </h4>
                        {vid.duration && (
                          <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-1">
                            <Clock size={10} />
                            <span>{vid.duration}</span>
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
