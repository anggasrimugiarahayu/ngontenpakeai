"use client";

import React from "react";
import {
  AlertCircle,
  Check,
  ChevronDown,
  Info,
  Plus,
  RefreshCw,
  Trash2,
  X,
} from "lucide-react";
import { MessagePayloadBuilder } from "../components/MessagePayloadBuilder";
import { AdditionalFeaturesBuilder } from "../components/AdditionalFeaturesBuilder";
import { TriggerKeywordBuilder } from "../components/TriggerKeywordBuilder";
import { InstagramPhonePreview } from "./InstagramPhonePreview";

interface InstagramRuleStudioModalProps {
  isRuleModalOpen: boolean;
  setIsRuleModalOpen: (open: boolean) => void;
  editingRule: any | null;
  ruleFormData: any;
  setRuleFormData: (data: any) => void;
  handleSaveRule: (e: React.FormEvent) => void;
  isPending: boolean;
  isTargetDropdownOpen: boolean;
  setIsTargetDropdownOpen: (open: boolean) => void;
  isFrequencyDropdownOpen: boolean;
  setIsFrequencyDropdownOpen: (open: boolean) => void;
  isAccountLinked: boolean;
  isFeedLive: boolean;
  isLoadingFeed: boolean;
  feedPosts: any[];
  selectedPost: any;
  setSelectedPost: (post: any) => void;
  showAllPostsModal: boolean;
  setShowAllPostsModal: (open: boolean) => void;
  isStoriesLive: boolean;
  isLoadingStories: boolean;
  isValidatingStories: boolean;
  activeStories: any[];
  selectedStory: any;
  setSelectedStory: (story: any) => void;
  handleRefreshStories: () => void;
  activePreviewTab: "COMMENT" | "DM";
  setActivePreviewTab: (tab: "COMMENT" | "DM") => void;
  activeLiveContentIdx: number;
  setActiveLiveContentIdx: (idx: number) => void;
  simulatedButtonId: string | null;
  setSimulatedButtonId: (id: string | null) => void;
  simulatedLiveQrId: string | null;
  setSimulatedLiveQrId: (id: string | null) => void;
  simulatedFollowStep: "GATE" | "RETRY" | "VERIFIED";
  setSimulatedFollowStep: (step: "GATE" | "RETRY" | "VERIFIED") => void;
  account: any;
  currentAgent: any;
  showToast: (type: "success" | "error" | "info", message: string) => void;
}

export function InstagramRuleStudioModal({
  isRuleModalOpen,
  setIsRuleModalOpen,
  editingRule,
  ruleFormData,
  setRuleFormData,
  handleSaveRule,
  isPending,
  isTargetDropdownOpen,
  setIsTargetDropdownOpen,
  isFrequencyDropdownOpen,
  setIsFrequencyDropdownOpen,
  isAccountLinked,
  isFeedLive,
  isLoadingFeed,
  feedPosts,
  selectedPost,
  setSelectedPost,
  showAllPostsModal,
  setShowAllPostsModal,
  isStoriesLive,
  isLoadingStories,
  isValidatingStories,
  activeStories,
  selectedStory,
  setSelectedStory,
  handleRefreshStories,
  activePreviewTab,
  setActivePreviewTab,
  activeLiveContentIdx,
  setActiveLiveContentIdx,
  simulatedButtonId,
  setSimulatedButtonId,
  simulatedLiveQrId,
  setSimulatedLiveQrId,
  simulatedFollowStep,
  setSimulatedFollowStep,
  account,
  currentAgent,
  showToast,
}: InstagramRuleStudioModalProps) {
  const isBasicInfoFilled = Boolean(ruleFormData.name.trim()) && Boolean(ruleFormData.targetOtomasi);
  const isStoryTarget = ["Semua Story", "Story Tertentu", "Story Mention"].includes(ruleFormData.targetOtomasi);
  const isStoryMentionTarget =
    ruleFormData.targetOtomasi === "Story Mention" || ruleFormData.postType === "STORY_MENTION";
  const isLiveTarget =
    ruleFormData.targetOtomasi === "Live Instagram" || ruleFormData.postType === "LIVE";
  const isDmTarget =
    ruleFormData.targetOtomasi === "Pesan Instagram" || ruleFormData.postType === "DM";

  const activeLiveContent =
    ruleFormData.liveContents[activeLiveContentIdx] || ruleFormData.liveContents[0] || null;

  return (
    <>
      {isRuleModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-6xl h-[92vh] max-h-[860px] bg-white dark:bg-[#18181b] border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            {/* Top Header Mobile / Tablet Close */}
            <div className="lg:hidden flex items-center justify-between px-6 py-3 border-b border-gray-100 dark:border-white/10">
              <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                {editingRule ? "Edit Otomasi" : "Buat Otomasi Baru"}
              </h3>
              <button
                type="button"
                onClick={() => setIsRuleModalOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 2-Column Split Grid */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
              {/* LEFT COLUMN: Form Builder (42% Ratio) */}
              <div className="lg:col-span-5 xl:col-span-5 p-6 md:p-8 overflow-y-auto space-y-6 border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-white/10">
                <div>
                  <h2 className="text-xl md:text-2xl font-black font-heading text-gray-900 dark:text-white">
                    {editingRule ? "Edit Otomasi" : "Buat Otomasi Baru"}
                  </h2>
                </div>

                <form onSubmit={handleSaveRule} className="space-y-6">
                  {/* 1. Nama Otomasi */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
                      Nama Otomasi <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={ruleFormData.name}
                      onChange={(e) => setRuleFormData({ ...ruleFormData, name: e.target.value })}
                      placeholder="COBA"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#18181b] text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/20 dark:focus:ring-white/20 transition-all font-medium"
                    />
                    {!ruleFormData.name.trim() && (
                      <p className="text-[11px] text-rose-500 font-medium">Silakan masukkan nama otomasi</p>
                    )}
                  </div>

                  {/* 2. Target Otomasi */}
                  <div className="relative target-dropdown-container space-y-1.5">
                    <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
                      Target Otomasi <span className="text-rose-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsTargetDropdownOpen(!isTargetDropdownOpen)}
                      className={`w-full px-4 py-2.5 rounded-xl border bg-white dark:bg-[#18181b] text-sm text-gray-900 dark:text-white flex items-center justify-between transition-all cursor-pointer ${
                        isTargetDropdownOpen
                          ? "border-orange-500 ring-2 ring-orange-500/20"
                          : "border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20"
                      }`}
                    >
                      <span className="font-medium">{ruleFormData.targetOtomasi || "Postingan Tertentu"}</span>
                      <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isTargetDropdownOpen ? "rotate-180" : ""}`} />
                    </button>

                    {isTargetDropdownOpen && (
                      <div className="absolute left-0 right-0 mt-1.5 bg-white dark:bg-[#18181b] border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl py-2 z-50 max-h-72 overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
                        {[
                          {
                            category: "Post / Reel",
                            items: ["Postingan Tertentu", "Semua Postingan", "Postingan Berikutnya"],
                          },
                          {
                            category: "Story",
                            items: ["Semua Story", "Story Tertentu", "Story Mention"],
                          },
                          {
                            category: "Live",
                            items: ["Live Instagram"],
                          },
                          {
                            category: "Pesan",
                            items: ["Pesan Instagram"],
                          },
                        ].map((grp) => (
                          <div key={grp.category} className="py-1">
                            <div className="px-4 py-1 text-[11px] font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                              {grp.category}
                            </div>
                            {grp.items.map((item) => {
                              const isSelected = ruleFormData.targetOtomasi === item;
                              return (
                                <button
                                  key={item}
                                  type="button"
                                  onClick={() => {
                                    setRuleFormData({
                                      ...ruleFormData,
                                      targetOtomasi: item,
                                      ...(item === "Pesan Instagram"
                                        ? { triggerCommentType: "KEYWORDS" as const }
                                        : {}),
                                      postType:
                                        item === "Postingan Tertentu"
                                          ? "SPECIFIC"
                                          : item === "Postingan Berikutnya"
                                          ? "NEXT"
                                          : item === "Semua Story"
                                          ? "ALL_STORIES"
                                          : item === "Story Tertentu"
                                          ? "SPECIFIC_STORY"
                                          : item === "Story Mention"
                                          ? "STORY_MENTION"
                                          : item === "Live Instagram"
                                          ? "LIVE"
                                          : item === "Pesan Instagram"
                                          ? "DM"
                                          : "ALL",
                                    });
                                    if (
                                      item === "Story Mention" ||
                                      item === "Live Instagram" ||
                                      item === "Pesan Instagram"
                                    ) {
                                      setActivePreviewTab("DM");
                                    }
                                    setIsTargetDropdownOpen(false);
                                  }}
                                  className={`w-full px-4 py-2 text-left text-xs sm:text-sm font-medium flex items-center justify-between transition-colors cursor-pointer ${
                                    isSelected
                                      ? "bg-orange-500/10 text-orange-600 dark:text-orange-400 font-bold"
                                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"
                                  }`}
                                >
                                  <span>{item}</span>
                                  {isSelected && <Check className="w-4 h-4 text-orange-600 dark:text-orange-400 stroke-[2.5]" />}
                                </button>
                              );
                            })}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 3. Pilih Postingan (dengan tombol Lihat semua) */}
                  {ruleFormData.targetOtomasi === "Postingan Tertentu" && (
                    <div className="space-y-2.5 pt-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <label className="text-xs font-bold text-gray-800 dark:text-gray-200">
                            Pilih Postingan
                          </label>
                          {isFeedLive && isAccountLinked && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              LIVE FEED META
                            </span>
                          )}
                        </div>
                        {isAccountLinked && feedPosts.length > 4 && (
                          <button
                            type="button"
                            onClick={() => setShowAllPostsModal(true)}
                            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                          >
                            Lihat semua ({feedPosts.length})
                          </button>
                        )}
                      </div>

                      {!isAccountLinked ? (
                        <div className="p-3.5 rounded-xl border border-amber-200 dark:border-amber-500/20 bg-amber-50/70 dark:bg-amber-500/5 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2.5">
                          <AlertCircle className="w-4 h-4 shrink-0 text-amber-500 mt-0.5" />
                          <div className="space-y-1">
                            <p className="font-bold">Akun Instagram Belum Terhubung</p>
                            <p className="text-[11px] text-amber-700/80 dark:text-amber-400/80 leading-relaxed">
                              Daftar postingan asli Anda tidak dapat dimuat karena koneksi akun sedang terputus. Silakan hubungkan kembali akun Anda di tab{" "}
                              <strong>Koneksi Akun</strong> untuk memilih postingan spesifik.
                            </p>
                          </div>
                        </div>
                      ) : isLoadingFeed ? (
                        <div className="p-4 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 flex items-center justify-center gap-2 text-xs text-gray-500">
                          <RefreshCw className="w-4 h-4 animate-spin text-gray-400" />
                          <span>Memuat postingan feed Instagram Anda...</span>
                        </div>
                      ) : feedPosts.length === 0 ? (
                        <div className="p-3.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-center text-xs text-gray-500 space-y-1">
                          <p className="font-semibold text-gray-700 dark:text-gray-300">Belum Ada Postingan Ditemukan</p>
                          <p className="text-[11px] text-gray-400">Pastikan akun Instagram Anda sudah memiliki postingan feed atau Reels publik.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-4 gap-2.5">
                          {feedPosts.slice(0, 4).map((post) => {
                            const isSelected = selectedPost?.id === post.id;
                            return (
                              <button
                                key={post.id}
                                type="button"
                                onClick={() => {
                                  setSelectedPost(post);
                                  setRuleFormData({ ...ruleFormData, postId: post.id });
                                }}
                                className={`relative w-full block rounded-xl overflow-hidden aspect-[4/5] border-2 transition-all cursor-pointer ${
                                  isSelected
                                    ? "border-blue-600 ring-2 ring-blue-500/30 scale-[1.02] shadow-sm"
                                    : "border-gray-200 dark:border-white/10 hover:border-gray-400 dark:hover:border-white/20 opacity-85 hover:opacity-100"
                                }`}
                                title={post.title || post.caption}
                              >
                                <img
                                  src={post.thumb || post.image}
                                  alt={post.title || "Post"}
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover"
                                />
                                {post.mediaType === "VIDEO" && (
                                  <div className="absolute top-1 right-1 bg-black/70 rounded px-1 py-0.5 text-[8px] font-bold text-white">
                                    REEL
                                  </div>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* 3b. Pilih Story (untuk Story Tertentu) */}
                  {ruleFormData.targetOtomasi === "Story Tertentu" && (
                    <div className="space-y-2.5 pt-1 animate-in fade-in duration-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <label className="text-xs font-bold text-gray-800 dark:text-gray-200">
                            Pilih Story Aktif
                          </label>
                          {isStoriesLive && isAccountLinked && activeStories.length > 0 && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-pink-500/10 text-pink-600 dark:text-pink-400 border border-pink-500/20 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse" />
                              STORY LIVE
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={handleRefreshStories}
                          className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <RefreshCw className={`w-3 h-3 ${isValidatingStories ? "animate-spin" : ""}`} />
                          <span>Muat Ulang</span>
                        </button>
                      </div>

                      {!isAccountLinked ? (
                        <div className="p-3.5 rounded-xl border border-amber-200 dark:border-amber-500/20 bg-amber-50/70 dark:bg-amber-500/5 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2.5">
                          <AlertCircle className="w-4 h-4 shrink-0 text-amber-500 mt-0.5" />
                          <div className="space-y-1">
                            <p className="font-bold">Akun Instagram Belum Terhubung</p>
                            <p className="text-[11px] text-amber-700/80 dark:text-amber-400/80 leading-relaxed">
                              Daftar story aktif Anda tidak dapat dimuat karena akun belum terhubung.
                            </p>
                          </div>
                        </div>
                      ) : isLoadingStories ? (
                        <div className="p-4 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 flex items-center justify-center gap-2 text-xs text-gray-500">
                          <RefreshCw className="w-4 h-4 animate-spin text-gray-400" />
                          <span>Memeriksa story aktif dari Meta API...</span>
                        </div>
                      ) : activeStories.length === 0 ? (
                        <div className="p-4 rounded-xl border border-blue-200/70 dark:border-blue-500/20 bg-blue-50/50 dark:bg-blue-950/20 space-y-2">
                          <div className="flex items-start gap-2.5">
                            <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                            <div className="space-y-1">
                              <p className="text-xs font-bold text-gray-800 dark:text-gray-200">
                                Belum Ada Story Aktif dalam 24 Jam Terakhir
                              </p>
                              <p className="text-[11px] text-gray-600 dark:text-gray-400 leading-relaxed">
                                Meta Graph API hanya mendeteksi Story yang sedang tayang (maksimal 24 jam). Story yang sudah lewat 24 jam atau berada di{" "}
                                <strong>Sorotan / Highlights</strong> tidak dikirim oleh Meta.
                              </p>
                              <div className="pt-1.5 flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={handleRefreshStories}
                                  className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-semibold flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                                >
                                  <RefreshCw className={`w-3 h-3 ${isValidatingStories ? "animate-spin" : ""}`} />
                                  <span>Cek Ulang Story</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setRuleFormData({
                                      ...ruleFormData,
                                      targetOtomasi: "Semua Story",
                                      postType: "ALL_STORIES",
                                    });
                                  }}
                                  className="px-2.5 py-1 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#18181b] text-gray-700 dark:text-gray-200 text-[11px] font-semibold hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer"
                                >
                                  Gunakan Opsi Semua Story
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-4 gap-2.5">
                          {activeStories.map((story) => {
                            const isSelected = (selectedStory?.id === story.id) || (ruleFormData.postId === story.id);
                            return (
                              <button
                                key={story.id}
                                type="button"
                                onClick={() => {
                                  setSelectedStory(story);
                                  setRuleFormData({ ...ruleFormData, postId: story.id });
                                }}
                                className={`relative rounded-xl overflow-hidden aspect-[9/16] border-2 transition-all cursor-pointer ${
                                  isSelected
                                    ? "border-pink-500 ring-2 ring-pink-500/30 scale-[1.02] shadow-sm"
                                    : "border-gray-200 dark:border-white/10 hover:border-gray-400 dark:hover:border-white/20 opacity-85 hover:opacity-100"
                                }`}
                                title={story.caption || "Story"}
                              >
                                <img
                                  src={story.thumb || story.image}
                                  alt={story.title || "Story"}
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-1.5 text-left">
                                  <span className="text-[9px] font-semibold text-white block truncate">
                                    {story.date}
                                  </span>
                                </div>
                                {isSelected && (
                                  <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-pink-500 flex items-center justify-center text-white shadow-xs">
                                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                                  </div>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* 3c. Frekuensi (untuk Story Mention) */}
                  {isStoryMentionTarget && (
                    <div className="relative frequency-dropdown-container space-y-1.5 animate-in fade-in duration-200">
                      <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
                        Frekuensi
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsFrequencyDropdownOpen(!isFrequencyDropdownOpen)}
                        className={`w-full px-4 py-2.5 rounded-xl border bg-white dark:bg-[#18181b] text-sm text-gray-900 dark:text-white flex items-center justify-between transition-all cursor-pointer ${
                          isFrequencyDropdownOpen
                            ? "border-orange-500 ring-2 ring-orange-500/20"
                            : "border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20"
                        }`}
                      >
                        <span className="font-medium">
                          {ruleFormData.storyMentionFrequency || "Atur frekuensi"}
                        </span>
                        <ChevronDown
                          className={`w-4 h-4 text-gray-400 transition-transform ${
                            isFrequencyDropdownOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      {isFrequencyDropdownOpen && (
                        <div className="absolute left-0 right-0 mt-1.5 bg-white dark:bg-[#18181b] border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                          {(
                            [
                              "24 jam sekali",
                              "48 jam sekali",
                              "Mingguan",
                              "Bulanan",
                              "3 bulan sekali",
                              "6 bulan sekali",
                              "Hanya sekali",
                            ] as const
                          ).map((freqOpt) => {
                            const isSelected =
                              (ruleFormData.storyMentionFrequency || "24 jam sekali") === freqOpt;
                            return (
                              <button
                                key={freqOpt}
                                type="button"
                                onClick={() => {
                                  setRuleFormData({
                                    ...ruleFormData,
                                    storyMentionFrequency: freqOpt,
                                  });
                                  setIsFrequencyDropdownOpen(false);
                                }}
                                className={`w-full px-4 py-2.5 text-left text-xs sm:text-sm font-medium flex items-center justify-between transition-colors cursor-pointer ${
                                  isSelected
                                    ? "bg-orange-500/10 text-orange-600 dark:text-orange-400 font-bold"
                                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"
                                }`}
                              >
                                <span>{freqOpt}</span>
                                {isSelected && (
                                  <Check className="w-4 h-4 text-orange-600 dark:text-orange-400 stroke-[2.5]" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Progressive Disclosure Guide when basic info is not yet filled */}
                  {!isBasicInfoFilled && !editingRule && (
                    <div className="p-4 rounded-xl border border-dashed border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/[0.02] text-center space-y-1 animate-in fade-in duration-200">
                      <p className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                        Lengkapi Nama Otomasi di atas
                      </p>
                      <p className="text-[11px] text-gray-400">
                        Pengaturan pemicu komentar, balasan pesan, dan fitur lanjutan akan terbuka otomatis setelahnya.
                      </p>
                    </div>
                  )}

                  {/* Sections 4, 5, 6: Revealed after Nama & Target are filled */}
                  {(isBasicInfoFilled || editingRule) && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                      {/* 4A. KONTEN MULTI-ITEM BUILDER (Khusus Live Instagram) */}
                      {isLiveTarget && (
                        <div className="space-y-3 pt-1 animate-in fade-in duration-200">
                          <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
                            Konten <span className="text-rose-500">*</span>
                          </label>

                          {ruleFormData.liveContents.length > 0 && (
                            <div className="space-y-4">
                              {ruleFormData.liveContents.map((content: any, cIdx: number) => {
                                const isActiveCard = activeLiveContentIdx === cIdx;
                                return (
                                  <div
                                    key={content.id}
                                    onClick={() => {
                                      setActiveLiveContentIdx(cIdx);
                                      setActivePreviewTab("DM");
                                    }}
                                    className={`p-4 rounded-xl border transition-all space-y-4 shadow-xs ${
                                      isActiveCard
                                        ? "border-gray-300 dark:border-white/20 bg-white dark:bg-[#18181b]"
                                        : "border-gray-200 dark:border-white/10 bg-white dark:bg-[#18181b] hover:border-gray-300 dark:hover:border-white/15"
                                    }`}
                                  >
                                    {/* Card Header: Content N + Delete Icon */}
                                    <div className="flex items-center justify-between">
                                      <h4 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">
                                        Content {cIdx + 1}
                                      </h4>
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          const nextContents = ruleFormData.liveContents.filter((c: any) => c.id !== content.id);
                                          setRuleFormData({ ...ruleFormData, liveContents: nextContents });
                                          if (activeLiveContentIdx >= nextContents.length) {
                                            setActiveLiveContentIdx(Math.max(0, nextContents.length - 1));
                                          }
                                        }}
                                        className="w-7 h-7 rounded-lg flex items-center justify-center text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors cursor-pointer"
                                        title="Hapus Content"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>

                                    {/* Kata Pemicu * */}
                                    <div className="space-y-1.5">
                                      <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
                                        Kata Pemicu <span className="text-rose-500">*</span>
                                      </label>
                                      <div className="relative">
                                        <input
                                          type="text"
                                          maxLength={200}
                                          value={content.keywords}
                                          onChange={(e) => {
                                            const next = [...ruleFormData.liveContents];
                                            next[cIdx] = { ...next[cIdx], keywords: e.target.value };
                                            setRuleFormData({ ...ruleFormData, liveContents: next });
                                          }}
                                          placeholder="Masukkan kata"
                                          className="w-full px-3.5 py-2.5 pr-14 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#202024] text-xs sm:text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-gray-400 font-mono">
                                          {content.keywords.length}/200
                                        </span>
                                      </div>
                                      {!content.keywords.trim() && (
                                        <p className="text-[11px] text-rose-500 font-medium">
                                          Silakan masukkan kata
                                        </p>
                                      )}
                                      <p className="text-[11px] text-gray-500 dark:text-gray-400">
                                        Use comma to separate multiple words.
                                      </p>
                                    </div>

                                    {/* Global MessagePayloadBuilder (Jenis Pesan, Pesan, Tombol, Quick Replies, Carousel) */}
                                    <MessagePayloadBuilder
                                      requiredMark
                                      defaultSlideImage={selectedPost?.image || feedPosts[0]?.image || ""}
                                      value={{
                                        messageType: content.messageType,
                                        message: content.message,
                                        buttons: content.buttons || [],
                                        quickReplies: content.quickReplies || [],
                                        carouselSlides: content.carouselSlides || [],
                                      }}
                                      onFocusPreviewDm={() => {
                                        setActiveLiveContentIdx(cIdx);
                                        setActivePreviewTab("DM");
                                      }}
                                      onSelectSimulatedButton={(btnId) => {
                                        setActiveLiveContentIdx(cIdx);
                                        setSimulatedButtonId(btnId);
                                      }}
                                      onSelectSimulatedQr={(qrId) => {
                                        setActiveLiveContentIdx(cIdx);
                                        setSimulatedLiveQrId(qrId);
                                      }}
                                      onChange={(nextPayload) => {
                                        const next = [...ruleFormData.liveContents];
                                        next[cIdx] = {
                                          ...next[cIdx],
                                          messageType: nextPayload.messageType,
                                          message: nextPayload.message,
                                          buttons: nextPayload.buttons,
                                          quickReplies: nextPayload.quickReplies.map((qr) => ({
                                            id: qr.id,
                                            label: qr.label ?? qr.text ?? "",
                                            text: qr.text ?? "",
                                          })),
                                          carouselSlides: nextPayload.carouselSlides,
                                        };
                                        setRuleFormData({ ...ruleFormData, liveContents: next });
                                      }}
                                    />
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {ruleFormData.liveContents.length === 0 && (
                            <p className="text-[11px] text-rose-500 font-medium">Minimal 1 content</p>
                          )}

                          <button
                            type="button"
                            onClick={() => {
                              const newContent = {
                                id: `live_content_${Date.now()}`,
                                keywords: "",
                                messageType: "BUTTON_TEMPLATE" as "BUTTON_TEMPLATE" | "PLAIN_TEXT" | "CAROUSEL",
                                message: "",
                                buttons: [
                                  {
                                    id: `lbtn_${Date.now()}`,
                                    labelType: "Kustom" as "Klik Disini" | "Kustom",
                                    label: "Button 1",
                                    action: "Buka Website" as "Buka Website" | "Kirim Teks",
                                    url: "https://ruangcreativemuslim.com",
                                    text: "",
                                  },
                                ],
                                quickReplies: [],
                                carouselSlides: [
                                  {
                                    id: `lslide_${Date.now()}`,
                                    image: "",
                                    title: "",
                                    subtitle: "",
                                    buttons: [
                                      {
                                        id: `lsbtn_${Date.now()}`,
                                        labelType: "Kustom" as "Klik Disini" | "Kustom",
                                        label: "Button 1",
                                        action: "Buka Website" as "Buka Website" | "Kirim Teks",
                                        url: "https://ruangcreativemuslim.com",
                                      },
                                    ],
                                  },
                                ],
                              };
                              const nextContents = [...ruleFormData.liveContents, newContent];
                              setRuleFormData({ ...ruleFormData, liveContents: nextContents });
                              setActiveLiveContentIdx(nextContents.length - 1);
                              setActivePreviewTab("DM");
                            }}
                            className="w-full py-2.5 rounded-xl border border-gray-200 dark:border-white/15 hover:border-gray-300 dark:hover:border-white/25 bg-white dark:bg-[#18181b] text-xs sm:text-sm font-bold text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Tambah Konten</span>
                          </button>
                        </div>
                      )}

                      {/* 4. Trigger Komentar / Pemicu Pesan (Komponen Terpusat Global) */}
                      {!isStoryMentionTarget && !isLiveTarget && (
                        <TriggerKeywordBuilder
                          mode={isDmTarget ? "DM" : isStoryTarget ? "STORY" : "COMMENT"}
                          triggerCommentType={ruleFormData.triggerCommentType}
                          keywords={ruleFormData.keywords}
                          keywordRule={ruleFormData.keywordRule}
                          onChange={(nextVal) =>
                            setRuleFormData({
                              ...ruleFormData,
                              ...nextVal,
                            })
                          }
                          onFocusSection={() =>
                            setActivePreviewTab(isDmTarget ? "DM" : "COMMENT")
                          }
                        />
                      )}

                      {/* Balas Reaksi Card (Hanya untuk Semua Story & Story Tertentu) */}
                      {isStoryTarget && !isStoryMentionTarget && (
                        <div className="p-3.5 rounded-xl border border-gray-200/80 dark:border-white/10 bg-white dark:bg-[#18181b] flex items-center justify-between gap-3 animate-in fade-in duration-200">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-gray-900 dark:text-white">Balas Reaksi</span>
                              <span className="text-sm">❤️</span>
                            </div>
                            <p className="text-[11px] text-gray-500">Balas ❤️ pada balasan story Anda</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setRuleFormData({ ...ruleFormData, replyHeartReaction: !ruleFormData.replyHeartReaction })}
                            className={`w-10 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                              ruleFormData.replyHeartReaction ? "bg-gray-900 dark:bg-white" : "bg-gray-200 dark:bg-white/15"
                            }`}
                          >
                            <div
                              className={`w-5 h-5 rounded-full bg-white dark:bg-black shadow-sm transition-transform ${
                                ruleFormData.replyHeartReaction ? "translate-x-4" : "translate-x-0"
                              }`}
                            />
                          </button>
                        </div>
                      )}

                      {/* 5. Pesan yang Dikirim Setelah Komentar (Disembunyikan untuk Live Instagram karena menggunakan Konten *) */}
                      {!isLiveTarget && (
                        <div
                          onClick={() => setActivePreviewTab("DM")}
                          className="space-y-4 pt-4 border-t border-gray-200 dark:border-white/10"
                        >
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                              Pesan yang Dikirim Setelah Komentar
                            </h3>
                          </div>

                          <MessagePayloadBuilder
                            value={{
                              messageType: ruleFormData.messageType,
                              message: ruleFormData.dmMessage,
                              buttons: ruleFormData.buttons,
                              quickReplies: ruleFormData.quickReplies,
                              carouselSlides: ruleFormData.carouselSlides,
                            }}
                            onChange={(nextVal) =>
                              setRuleFormData({
                                ...ruleFormData,
                                messageType: nextVal.messageType,
                                dmMessage: nextVal.message,
                                buttons: nextVal.buttons,
                                quickReplies: nextVal.quickReplies,
                                carouselSlides: nextVal.carouselSlides,
                              })
                            }
                            onFocusPreviewDm={() => setActivePreviewTab("DM")}
                            onSelectSimulatedButton={(btnId) => setSimulatedButtonId(btnId)}
                            onSelectSimulatedQr={(qrId) => setSimulatedLiveQrId(qrId)}
                            defaultSlideImage={selectedPost?.image || feedPosts[0]?.image || ""}
                          />
                        </div>
                      )}

                      {/* 6. Fitur Tambahan (6 Switch Cards) */}
                      <AdditionalFeaturesBuilder
                        ruleFormData={ruleFormData}
                        setRuleFormData={setRuleFormData}
                        isStoryTarget={isStoryTarget}
                        isLiveTarget={isLiveTarget}
                        isDmTarget={isDmTarget}
                        setActivePreviewTab={setActivePreviewTab}
                        setSimulatedFollowStep={setSimulatedFollowStep}
                        showToast={showToast}
                        defaultSlideImage={selectedPost?.image || feedPosts[0]?.image || ""}
                      />
                    </div>
                  )}
                </form>
              </div>

              {/* RIGHT COLUMN: Pratinjau (58% Ratio - iPhone 16 Pro Titanium Style) */}
              <InstagramPhonePreview
                ruleFormData={ruleFormData}
                setRuleFormData={setRuleFormData}
                editingRule={editingRule}
                isPending={isPending}
                setIsRuleModalOpen={setIsRuleModalOpen}
                handleSaveRule={handleSaveRule}
                activePreviewTab={activePreviewTab}
                setActivePreviewTab={setActivePreviewTab}
                isStoryTarget={isStoryTarget}
                isStoryMentionTarget={isStoryMentionTarget}
                isLiveTarget={isLiveTarget}
                isDmTarget={isDmTarget}
                isBasicInfoFilled={isBasicInfoFilled}
                activeLiveContentIdx={activeLiveContentIdx}
                setActiveLiveContentIdx={setActiveLiveContentIdx}
                activeLiveContent={activeLiveContent}
                account={currentAgent || account}
                currentAgent={currentAgent || account}
                selectedPost={selectedPost}
                selectedStory={selectedStory}
                feedPosts={feedPosts}
                simulatedFollowStep={simulatedFollowStep}
                setSimulatedFollowStep={setSimulatedFollowStep}
                simulatedButtonId={simulatedButtonId}
                setSimulatedButtonId={setSimulatedButtonId}
                simulatedLiveQrId={simulatedLiveQrId}
                setSimulatedLiveQrId={setSimulatedLiveQrId}
              />
            </div>
          </div>
        </div>
      )}

      {/* MODAL POPUP: LIHAT SEMUA POSTINGAN */}
      {showAllPostsModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#18181b] border border-gray-200 dark:border-white/10 rounded-2xl p-5 sm:p-6 max-w-2xl w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-white/10">
              <div>
                <h4 className="font-bold text-base text-gray-900 dark:text-white">
                  Pilih Postingan Instagram
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Pilih salah satu postingan dari akun Instagram Anda untuk ditautkan ke automasi ini.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAllPostsModal(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-colors cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-[65vh] overflow-y-auto pr-1 -mr-1">
              {feedPosts.length === 0 ? (
                <div className="py-12 text-center text-xs text-gray-400">
                  Tidak ada postingan yang ditemukan di feed akun ini.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-0.5">
                  {feedPosts.map((post) => {
                    const isSelected = selectedPost?.id === post.id;
                    return (
                      <button
                        key={post.id}
                        type="button"
                        onClick={() => {
                          setSelectedPost(post);
                          setRuleFormData({ ...ruleFormData, postId: post.id });
                          setShowAllPostsModal(false);
                        }}
                        className={`group relative w-full aspect-[4/5] rounded-xl overflow-hidden border-2 transition-all cursor-pointer block text-left bg-gray-100 dark:bg-white/5 ${
                          isSelected
                            ? "border-blue-600 ring-2 ring-blue-500/30 scale-[1.02] shadow-md z-10"
                            : "border-gray-200 dark:border-white/10 hover:border-gray-400 dark:hover:border-white/30 opacity-90 hover:opacity-100"
                        }`}
                        title={post.title || post.caption}
                      >
                        <img
                          src={post.thumb || post.image}
                          alt={post.title || "Post"}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                        />
                        {post.mediaType === "VIDEO" && (
                          <div className="absolute top-1.5 right-1.5 bg-black/70 backdrop-blur-xs rounded px-1.5 py-0.5 text-[8px] font-bold text-white shadow-xs">
                            REEL
                          </div>
                        )}
                        {isSelected && (
                          <div className="absolute top-1.5 left-1.5 w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xs">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
