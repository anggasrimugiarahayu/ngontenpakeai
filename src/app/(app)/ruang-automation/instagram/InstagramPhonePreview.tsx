"use client";

import React from "react";
import {
  ArrowLeft,
  Bookmark,
  Camera,
  Clock,
  CornerUpLeft,
  Film,
  Heart,
  Home,
  Image as ImageIcon,
  Loader2,
  MessageCircle,
  Mic,
  Phone,
  Plus,
  RefreshCw,
  Save,
  Search,
  Send,
  Video,
  Wifi,
  X,
} from "lucide-react";
import { InstagramIcon } from "../components/AutomationIcons";
import { MessagePreviewRenderer } from "../components/MessagePreviewRenderer";
import { resolvePreviewVariables } from "../utils/automationHelpers";

interface InstagramPhonePreviewProps {
  ruleFormData: any;
  setRuleFormData: (data: any) => void;
  editingRule: any | null;
  isPending: boolean;
  setIsRuleModalOpen: (open: boolean) => void;
  handleSaveRule: (e: React.FormEvent) => void;
  activePreviewTab: "COMMENT" | "DM";
  setActivePreviewTab: (tab: "COMMENT" | "DM") => void;
  isStoryTarget: boolean;
  isStoryMentionTarget: boolean;
  isLiveTarget: boolean;
  isDmTarget: boolean;
  isBasicInfoFilled: boolean;
  activeLiveContentIdx: number;
  setActiveLiveContentIdx: (idx: number) => void;
  activeLiveContent: any;
  account: any;
  currentAgent: any;
  selectedPost: any;
  selectedStory: any;
  feedPosts: any[];
  simulatedFollowStep: "GATE" | "RETRY" | "VERIFIED";
  setSimulatedFollowStep: (step: "GATE" | "RETRY" | "VERIFIED") => void;
  simulatedButtonId: string | null;
  setSimulatedButtonId: (id: string | null) => void;
  simulatedLiveQrId: string | null;
  setSimulatedLiveQrId: (id: string | null) => void;
}

export function InstagramPhonePreview({
  ruleFormData,
  setRuleFormData,
  editingRule,
  isPending,
  setIsRuleModalOpen,
  handleSaveRule,
  activePreviewTab,
  setActivePreviewTab,
  isStoryTarget,
  isStoryMentionTarget,
  isLiveTarget,
  isDmTarget,
  isBasicInfoFilled,
  activeLiveContentIdx,
  setActiveLiveContentIdx,
  activeLiveContent,
  account,
  currentAgent,
  selectedPost,
  selectedStory,
  feedPosts,
  simulatedFollowStep,
  setSimulatedFollowStep,
  simulatedButtonId,
  setSimulatedButtonId,
  simulatedLiveQrId,
  setSimulatedLiveQrId,
}: InstagramPhonePreviewProps) {
  const activeAccount = currentAgent || account;
  const previewUsername =
    activeAccount?.username ||
    activeAccount?.name?.replace(/^Agen\s*@?/i, "") ||
    "ruangcreativemuslim";
  const previewDisplayName =
    activeAccount?.profileName || activeAccount?.name || previewUsername;
  const previewAvatarUrl =
    activeAccount?.profilePicUrl || "/images/instagram/rcm-avatar.png";

  return (
    <div className="lg:col-span-7 xl:col-span-7 bg-gray-50/70 dark:bg-black/30 p-5 md:p-6 flex flex-col justify-between overflow-y-auto">
      {/* Header Pratinjau */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200/60 dark:border-white/5">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white">
          Pratinjau
        </h3>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsRuleModalOpen(false)}
            className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-[#2C3246] bg-white hover:bg-gray-50 dark:bg-[#141B31] dark:hover:bg-[#1f2947] text-xs font-bold text-gray-700 dark:text-gray-200 transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSaveRule}
            disabled={isPending || !ruleFormData.name.trim()}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#f97316] hover:bg-[#ea580c] dark:bg-[#f97316] dark:hover:bg-[#fb923c] text-white text-xs font-bold shadow-sm shadow-orange-500/20 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
          >
            {isPending ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>{editingRule ? "Simpan Perubahan" : "Buat Otomasi"}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Switcher Tab Pratinjau: Postingan & Komentar vs Pesan DM (Disembunyikan untuk Story Mention, Live Instagram & Pesan Instagram) */}
      {!isStoryMentionTarget && !isLiveTarget && !isDmTarget && (
        <div className="flex items-center justify-center pt-2 pb-1">
          <div className="p-1 rounded-xl bg-gray-200/80 dark:bg-white/10 flex items-center gap-1 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActivePreviewTab("COMMENT")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activePreviewTab === "COMMENT"
                  ? "bg-white dark:bg-[#141B31] text-gray-900 dark:text-white shadow-xs"
                  : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              {isStoryTarget ? "Story Instagram" : "Postingan & Komentar"}
            </button>
            <button
              type="button"
              onClick={() => setActivePreviewTab("DM")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activePreviewTab === "DM"
                  ? "bg-white dark:bg-[#141B31] text-gray-900 dark:text-white shadow-xs"
                  : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              Pesan DM
            </button>
          </div>
        </div>
      )}

      {/* Switcher Pratinjau Multi-Konten khusus Live Instagram (jika ada > 1 Konten) */}
      {isLiveTarget && ruleFormData.liveContents.length > 1 && (
        <div className="flex items-center justify-center pt-2 pb-1">
          <div className="p-1 rounded-xl bg-gray-200/80 dark:bg-white/10 flex items-center gap-1 text-xs font-semibold overflow-x-auto max-w-full scrollbar-none">
            {ruleFormData.liveContents.map((c: any, idx: number) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setActiveLiveContentIdx(idx)}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer shrink-0 ${
                  activeLiveContentIdx === idx
                    ? "bg-white dark:bg-[#141B31] text-gray-900 dark:text-white shadow-xs"
                    : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                Content {idx + 1}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* iPhone 16 Pro Mockup Chassis */}
      <div className="my-auto py-3">
        <div className="w-[285px] sm:w-[295px] h-[585px] mx-auto rounded-[52px] p-[6px] bg-gradient-to-b from-[#38383e] via-[#1c1c1f] to-[#121214] ring-1 ring-white/20 shadow-2xl relative select-none">
          {/* Left Hardware Buttons */}
          <div className="w-[3px] h-3.5 bg-gray-600 rounded-l absolute -left-[3px] top-24" />
          <div className="w-[3px] h-8 bg-gray-600 rounded-l absolute -left-[3px] top-32" />
          <div className="w-[3px] h-8 bg-gray-600 rounded-l absolute -left-[3px] top-42" />
          {/* Right Hardware Button */}
          <div className="w-[3px] h-12 bg-gray-600 rounded-r absolute -right-[3px] top-32" />

          {/* Screen Inner Container */}
          <div className="w-full h-full bg-white dark:bg-black rounded-[46px] overflow-hidden flex flex-col relative border border-black/80 text-gray-900 dark:text-white">
            {/* Dynamic Island Floating Notch */}
            <div className="w-24 h-6 bg-black rounded-full mx-auto absolute top-2.5 left-1/2 -translate-x-1/2 z-30 flex items-center justify-end pr-2.5 shadow-md">
              <div className="w-2.5 h-2.5 rounded-full bg-[#18181b] ring-1 ring-white/10" />
            </div>

            {/* Status Bar */}
            <div className="flex items-center justify-between px-6 pt-3 pb-1 text-[11px] font-semibold text-gray-900 dark:text-white shrink-0 z-20">
              <span>10:03</span>
              <div className="flex items-center gap-1.5 text-gray-900 dark:text-white">
                <Wifi className="w-3.5 h-3.5" />
                <div className="w-4 h-2.5 border border-current rounded-xs p-0.5 flex items-center relative">
                  <div className="w-full h-full bg-current rounded-2xs" />
                </div>
              </div>
            </div>

            {activePreviewTab === "DM" || isStoryMentionTarget || isLiveTarget || isDmTarget ? (
              /* INSTAGRAM DM CHAT VIEW */
              <div className="flex-1 flex flex-col overflow-hidden pt-2 relative bg-white dark:bg-black">
                {/* Instagram DM Top Header */}
                <div className="flex items-center justify-between px-3.5 py-1.5 border-b border-gray-100 dark:border-white/5 shrink-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <button
                      type="button"
                      onClick={() => {
                        if (!isStoryMentionTarget && !isLiveTarget && !isDmTarget) setActivePreviewTab("COMMENT");
                      }}
                      className="text-gray-800 dark:text-gray-200 hover:opacity-70 transition-opacity cursor-pointer p-0.5"
                      title="Lihat Postingan"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-yellow-400 to-pink-500 p-0.5 shrink-0 overflow-hidden shadow-2xs">
                      <img
                        src={previewAvatarUrl}
                        alt={previewUsername}
                        className="w-full h-full object-cover rounded-full"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = "/images/instagram/rcm-avatar.png";
                        }}
                      />
                    </div>
                    <div className="min-w-0">
                      <span className="block font-bold text-xs text-gray-900 dark:text-white truncate leading-tight">
                        {previewDisplayName}
                      </span>
                      <span className="block text-[10px] text-gray-400 truncate -mt-0.5 font-medium">
                        @{previewUsername}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-gray-800 dark:text-gray-200 shrink-0">
                    <Phone className="w-4 h-4 cursor-pointer hover:opacity-70" />
                    <Video className="w-4 h-4 cursor-pointer hover:opacity-70" />
                  </div>
                </div>

                {/* Scrollable Chat Area */}
                <div className="flex-1 overflow-y-auto p-3 space-y-3 text-xs bg-gray-50/50 dark:bg-[#121214]">
                  {isDmTarget ? (
                    /* Incoming Trigger DM Bubble from User (Pesan Instagram) */
                    <div className="flex justify-end pt-1 animate-in fade-in slide-in-from-bottom-1 duration-200">
                      <div className="max-w-[78%] rounded-2xl rounded-tr-xs bg-[#7048e8] text-white px-3.5 py-2 shadow-xs text-xs font-semibold break-words">
                        {ruleFormData.keywords.split(",")[0]?.trim() || ruleFormData.keywords.trim() || "mau"}
                      </div>
                    </div>
                  ) : isStoryMentionTarget ? (
                    /* Story Mention Native Indicator (sesuai referensi: "↩ Mentioned in your story |") */
                    <div className="flex justify-end items-center gap-1.5 pt-2 pr-1 animate-in fade-in duration-200">
                      <CornerUpLeft className="w-3.5 h-3.5 text-gray-400 stroke-[2]" />
                      <span className="text-[11px] font-medium text-gray-400 dark:text-gray-400">
                        Mentioned in your story
                      </span>
                      <div className="w-[2px] h-6 rounded-full bg-gray-200 dark:bg-white/20 ml-1" />
                    </div>
                  ) : (
                    <>
                      {/* Centered Trigger Notification Badge */}
                      <div className="flex justify-center pt-1">
                        <span className="px-3 py-1 rounded-full bg-gray-200/90 dark:bg-white/10 text-[10px] font-medium text-gray-600 dark:text-gray-300 shadow-2xs text-center">
                          {isStoryTarget ? "User replied to your story" : "User commented on your post"}
                        </span>
                      </div>

                      {/* Story Quoted User Bubble (when Semua Story / Story Tertentu) */}
                      {isStoryTarget && (
                        <div className="flex justify-end pt-1 animate-in fade-in slide-in-from-bottom-1 duration-200">
                          <div className="relative group max-w-[78%]">
                            {/* User Bubble with quoted story preview */}
                            <div className="rounded-2xl rounded-tr-xs bg-[#7048e8] text-white p-2.5 shadow-xs space-y-1.5">
                              {/* Quoted Story Card Header */}
                              <div className="flex items-center gap-2 p-1.5 rounded-xl bg-white/15 border border-white/20 text-[10px]">
                                <div className="w-4 h-6 rounded bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600 shrink-0 flex items-center justify-center shadow-2xs">
                                  <InstagramIcon className="w-2.5 h-2.5 text-white" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <span className="font-semibold block truncate text-white/95">
                                    {ruleFormData.targetOtomasi === "Semua Story"
                                      ? "All Stories"
                                      : "Story"}
                                  </span>
                                  <span className="text-[9px] text-white/70 block truncate">
                                    Balasan Cerita
                                  </span>
                                </div>
                              </div>

                              {/* User Text or Reaction */}
                              <div className="text-xs font-semibold pl-1 pr-1 break-words">
                                {ruleFormData.triggerCommentType === "ALL"
                                  ? "🔥"
                                  : (ruleFormData.keywords.split(",")[0]?.trim() || ruleFormData.keywords.trim() || "🔥")}
                              </div>
                            </div>

                            {/* Small Heart Badge on User Message if Balas Reaksi is active */}
                            {ruleFormData.replyHeartReaction && (
                              <div className="absolute -bottom-2 -right-1 bg-white dark:bg-[#18181b] border border-gray-200 dark:border-white/15 rounded-full px-1.5 py-0.5 shadow-md flex items-center justify-center animate-in zoom-in-75 duration-200">
                                <span className="text-xs leading-none">❤️</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {/* 0. PESAN PEMBUKA (Icebreaker / Welcome Message) */}
                  {ruleFormData.featureWelcomeMessage && (
                    <>
                      {/* Bot Welcome Message */}
                      <div className="flex items-start gap-2 pt-1 animate-in fade-in slide-in-from-top-1 duration-200">
                        <div className="w-6 h-6 rounded-full overflow-hidden shrink-0 mt-0.5 border border-gray-200 dark:border-white/10">
                          <img
                            src={previewAvatarUrl}
                            alt="Profile"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = "/images/instagram/rcm-avatar.png";
                            }}
                          />
                        </div>

                        <div className="flex-1 max-w-[85%] space-y-2">
                          {ruleFormData.welcomeMessageType === "Template Tombol" ? (
                            <div className="rounded-2xl rounded-tl-xs bg-gray-100 dark:bg-[#202024] border border-gray-200/80 dark:border-white/10 p-3 space-y-2.5 shadow-2xs">
                              <div className="text-xs leading-relaxed text-gray-900 dark:text-white whitespace-pre-wrap break-words font-medium">
                                {resolvePreviewVariables(ruleFormData.welcomeMessage || "Akses nya udah kita buatin nihh!!\n\nMau? ✨")}
                              </div>
                              <div className="pt-0.5">
                                <div className="w-full py-2 px-3 rounded-xl bg-white dark:bg-[#2a2a2e] border border-gray-200/80 dark:border-white/10 shadow-2xs text-center text-xs font-semibold text-gray-900 dark:text-white truncate">
                                  {ruleFormData.welcomeButtonLabel || "Ya, Saya Mau!"}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="rounded-2xl rounded-tl-xs bg-gray-100 dark:bg-[#202024] border border-gray-200/80 dark:border-white/10 p-3 shadow-2xs">
                              <div className="text-xs leading-relaxed text-gray-900 dark:text-white whitespace-pre-wrap break-words font-medium">
                                {resolvePreviewVariables(ruleFormData.welcomeMessage || "Halo! Terima kasih sudah berkomentar.")}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* User Simulated Response to Welcome Button (Right - Balon Ungu) */}
                      {ruleFormData.welcomeMessageType === "Template Tombol" && (
                        <div className="flex justify-end pt-0.5 animate-in fade-in slide-in-from-bottom-1 duration-200">
                          <div className="px-3.5 py-1.5 rounded-2xl rounded-tr-xs bg-[#7048e8] text-white text-xs font-semibold shadow-xs max-w-[75%] break-words">
                            {ruleFormData.welcomeButtonLabel || "Ya, Saya Mau!"}
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {/* 1. ASK FOR FOLLOW (Gatekeeper Message) */}
                  {ruleFormData.featureAskForFollow && (
                    <>
                      {/* Bot Ask For Follow Message Bubble */}
                      <div className="flex items-start gap-2 pt-1 animate-in fade-in slide-in-from-top-1 duration-200">
                        <div className="w-6 h-6 rounded-full overflow-hidden shrink-0 mt-0.5 border border-gray-200 dark:border-white/10">
                          <img
                            src={previewAvatarUrl}
                            alt="Profile"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = "/images/instagram/rcm-avatar.png";
                            }}
                          />
                        </div>

                        <div className="flex-1 max-w-[85%] space-y-2">
                          {ruleFormData.askForFollowMessageType === "Template Tombol" ? (
                            <div className="rounded-2xl rounded-tl-xs bg-gray-100 dark:bg-[#202024] border border-gray-200/80 dark:border-white/10 p-3 space-y-2.5 shadow-2xs">
                              <div className="text-xs leading-relaxed text-gray-900 dark:text-white whitespace-pre-wrap break-words font-medium">
                                {resolvePreviewVariables(
                                  ruleFormData.askForFollowMessage ||
                                    "Btw, kayaknya kamu belum follow akun ini nih, sistemnya kita cuma bisa ngasih khusus untuk followers aja.\n\nKalo mau, follow dulu ya dan klik \"Udah Follow\" nanti dikirimin aksesnya"
                                )}
                              </div>
                              <div className="pt-0.5">
                                <div className="w-full py-2 px-3 rounded-xl bg-white dark:bg-[#2a2a2e] border border-gray-200/80 dark:border-white/10 shadow-2xs text-center text-xs font-semibold text-gray-900 dark:text-white truncate">
                                  {ruleFormData.askForFollowButtonLabel || "Udah follow 🙌"}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="rounded-2xl rounded-tl-xs bg-gray-100 dark:bg-[#202024] border border-gray-200/80 dark:border-white/10 p-3 shadow-2xs">
                              <div className="text-xs leading-relaxed text-gray-900 dark:text-white whitespace-pre-wrap break-words font-medium">
                                {resolvePreviewVariables(
                                  ruleFormData.askForFollowMessage ||
                                    "Btw, kayaknya kamu belum follow akun ini nih..."
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* User Simulated Response to Follow 1 (Balon Ungu Kanan) */}
                      <div className="flex justify-end pt-0.5 animate-in fade-in slide-in-from-bottom-1 duration-200">
                        <div className="px-3.5 py-1.5 rounded-2xl rounded-tr-xs bg-[#7048e8] text-white text-xs font-semibold shadow-xs max-w-[75%] break-words">
                          {ruleFormData.askForFollowButtonLabel || "Udah follow 🙌"}
                        </div>
                      </div>

                      {/* Bot Retry Message & User Response 2 (Jika Masih Belum Mengikuti / Retry Aktif) */}
                      {ruleFormData.askForFollowHasRetry && (
                        <>
                          <div className="flex items-start gap-2 pt-1 animate-in fade-in slide-in-from-top-1 duration-200">
                            <div className="w-6 h-6 rounded-full overflow-hidden shrink-0 mt-0.5 border border-gray-200 dark:border-white/10">
                              <img
                                src={previewAvatarUrl}
                                alt="Profile"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.currentTarget as HTMLImageElement).src = "/images/instagram/rcm-avatar.png";
                                }}
                              />
                            </div>

                            <div className="flex-1 max-w-[85%] space-y-2">
                              {ruleFormData.askForFollowMessageType === "Template Tombol" ? (
                                <div className="rounded-2xl rounded-tl-xs bg-gray-100 dark:bg-[#202024] border border-gray-200/80 dark:border-white/10 p-3 space-y-2.5 shadow-2xs">
                                  <div className="text-xs leading-relaxed text-gray-900 dark:text-white whitespace-pre-wrap break-words font-medium">
                                    {resolvePreviewVariables(
                                      ruleFormData.askForFollowRetryMessage ||
                                        "Ah kayaknya masih belum follow beneran nih 😅\n\nCoba follow dulu ya ke profile, kalo udah nanti klik \"Udah Follow\""
                                    )}
                                  </div>
                                  <div className="pt-0.5">
                                    <div className="w-full py-2 px-3 rounded-xl bg-white dark:bg-[#2a2a2e] border border-gray-200/80 dark:border-white/10 shadow-2xs text-center text-xs font-semibold text-gray-900 dark:text-white truncate">
                                      {ruleFormData.askForFollowRetryButtonLabel ||
                                        ruleFormData.askForFollowButtonLabel ||
                                        "Udah follow 🙌"}
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="rounded-2xl rounded-tl-xs bg-gray-100 dark:bg-[#202024] border border-gray-200/80 dark:border-white/10 p-3 shadow-2xs">
                                  <div className="text-xs leading-relaxed text-gray-900 dark:text-white whitespace-pre-wrap break-words font-medium">
                                    {resolvePreviewVariables(
                                      ruleFormData.askForFollowRetryMessage ||
                                        "Ah kayaknya masih belum follow beneran nih 😅..."
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* User Simulated Response to Retry (Balon Ungu Kanan Kedua) */}
                          <div className="flex justify-end pt-0.5 animate-in fade-in slide-in-from-bottom-1 duration-200">
                            <div className="px-3.5 py-1.5 rounded-2xl rounded-tr-xs bg-[#7048e8] text-white text-xs font-semibold shadow-xs max-w-[75%] break-words">
                              {ruleFormData.askForFollowRetryButtonLabel ||
                                ruleFormData.askForFollowButtonLabel ||
                                "Udah follow 🙌"}
                            </div>
                          </div>
                        </>
                      )}
                    </>
                  )}

                  {/* 2. ASK FOR CONTACT (Jika aktif) */}
                  {ruleFormData.featureAskForContact && (
                    <>
                      <div className="flex items-start gap-2 pt-1 animate-in fade-in slide-in-from-top-1 duration-200">
                        <div className="w-6 h-6 rounded-full overflow-hidden shrink-0 mt-0.5 border border-gray-200 dark:border-white/10">
                          <img
                            src={previewAvatarUrl}
                            alt="Profile"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = "/images/instagram/rcm-avatar.png";
                            }}
                          />
                        </div>
                        <div className="rounded-2xl rounded-tl-xs bg-gray-100 dark:bg-[#202024] border border-gray-200/80 dark:border-white/10 p-3 shadow-2xs max-w-[85%]">
                          <div className="text-xs leading-relaxed text-gray-900 dark:text-white whitespace-pre-wrap break-words font-medium">
                            {resolvePreviewVariables(
                              ruleFormData.askContactMessage ||
                                "Sip! Biar aksesnya langsung terkirim dan tersimpan aman di inbox kamu, boleh ketik Email aktif kamu di bawah ini ya 👇"
                            )}
                          </div>
                        </div>
                      </div>

                      {/* User Response to Ask for Contact (Purple Pill) */}
                      <div className="flex justify-end pt-0.5 animate-in fade-in slide-in-from-bottom-1 duration-200">
                        <div className="px-3.5 py-1.5 rounded-2xl rounded-tr-xs bg-[#7048e8] text-white text-xs font-semibold shadow-xs max-w-[75%] break-words">
                          {ruleFormData.askContactType === "Nomor WhatsApp Saja"
                            ? "+62 812-3456-7890"
                            : ruleFormData.askContactType === "Email & WhatsApp"
                            ? "budi@gmail.com, +62 812-3456-7890"
                            : "budi@gmail.com"}
                        </div>
                      </div>
                    </>
                  )}

                  {/* 3. PESAN YANG DIKIRIM SETELAH KOMENTAR (PESAN UTAMA DM) */}
                  <MessagePreviewRenderer
                    payload={
                      isLiveTarget && activeLiveContent
                        ? {
                            messageType: activeLiveContent.messageType,
                            message: activeLiveContent.message,
                            buttons: activeLiveContent.buttons || [],
                            quickReplies: activeLiveContent.quickReplies || [],
                            carouselSlides: activeLiveContent.carouselSlides || [],
                          }
                        : {
                            messageType: ruleFormData.messageType,
                            message: ruleFormData.dmMessage,
                            buttons: ruleFormData.buttons || [],
                            quickReplies: ruleFormData.quickReplies || [],
                            carouselSlides: ruleFormData.carouselSlides || [],
                          }
                    }
                    avatarUrl={previewAvatarUrl}
                    resolvePreviewVariables={resolvePreviewVariables}
                    defaultSlideImage={selectedPost?.thumb || selectedPost?.image || feedPosts[0]?.thumb || feedPosts[0]?.image || ""}
                    simulatedButtonId={simulatedButtonId}
                    setSimulatedButtonId={(id) => setSimulatedButtonId(id)}
                    simulatedQrId={simulatedLiveQrId}
                    setSimulatedQrId={(id) => setSimulatedLiveQrId(id)}
                  />

                  {/* 4. FOLLOW UP MESSAGE (Jika aktif) */}
                  {ruleFormData.featureFollowUp && (
                    <div className="pt-2 space-y-2 animate-in fade-in slide-in-from-bottom-1 duration-200">
                      {/* Delay Time Pill */}
                      <div className="flex justify-center">
                        <span className="px-2.5 py-0.5 rounded-full bg-gray-200/90 dark:bg-white/10 text-[9px] font-semibold text-gray-600 dark:text-gray-300 shadow-2xs text-center flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          <span>{ruleFormData.followUpDelay || "1 Jam"} kemudian...</span>
                        </span>
                      </div>

                      {/* Message Preview Renderer for Follow Up */}
                      <MessagePreviewRenderer
                        payload={{
                          messageType:
                            ruleFormData.followUpMessageType === "Teks Biasa" ||
                            ruleFormData.followUpMessageType === "PLAIN_TEXT"
                              ? "PLAIN_TEXT"
                              : ruleFormData.followUpMessageType === "Carousel" ||
                                ruleFormData.followUpMessageType === "CAROUSEL"
                              ? "CAROUSEL"
                              : "BUTTON_TEMPLATE",
                          message:
                            ruleFormData.followUpMessage ||
                            "Halo {first_name}! Link materinya tadi udah sempat kamu buka belum? Kalau ada kendala atau mau tanya-tanya bilang ya 😉",
                          buttons:
                            Array.isArray(ruleFormData.followUpButtons) &&
                            ruleFormData.followUpButtons.length > 0
                              ? ruleFormData.followUpButtons
                              : [
                                  {
                                    id: "followup_btn_1",
                                    labelType: "Kustom",
                                    label:
                                      ruleFormData.followUpButtonLabel ||
                                      "Buka Link Sekarang",
                                    action: "Buka Website",
                                    url:
                                      ruleFormData.buttonUrl ||
                                      "https://ruangcreativemuslim.com",
                                  },
                                ],
                          quickReplies: ruleFormData.followUpQuickReplies || [],
                          carouselSlides:
                            Array.isArray(ruleFormData.followUpCarouselSlides) &&
                            ruleFormData.followUpCarouselSlides.length > 0
                              ? ruleFormData.followUpCarouselSlides
                              : [
                                  {
                                    id: "slide_followup_1",
                                    image:
                                      selectedPost?.thumb ||
                                      selectedPost?.image ||
                                      feedPosts[0]?.thumb ||
                                      feedPosts[0]?.image ||
                                      "",
                                    title: "Follow Up Materi",
                                    subtitle:
                                      "Cek penawaran spesial atau info lanjutan",
                                    buttons: [
                                      {
                                        id: "slide_btn_followup_1",
                                        labelType: "Kustom",
                                        label: "Buka Sekarang",
                                        action: "Buka Website",
                                        url:
                                          ruleFormData.buttonUrl ||
                                          "https://ruangcreativemuslim.com",
                                      },
                                    ],
                                  },
                                ],
                        }}
                        avatarUrl={previewAvatarUrl}
                        resolvePreviewVariables={resolvePreviewVariables}
                        defaultSlideImage={selectedPost?.thumb || selectedPost?.image || feedPosts[0]?.thumb || feedPosts[0]?.image || ""}
                        simulatedButtonId={null}
                        setSimulatedButtonId={() => {}}
                        simulatedQrId={null}
                        setSimulatedQrId={() => {}}
                        defaultFallbackText="Halo {first_name}! Link materinya tadi udah sempat kamu buka belum?"
                      />
                    </div>
                  )}
                </div>

                {/* Instagram DM Bottom Bar */}
                <div className="flex items-center gap-2 px-3 py-2 border-t border-gray-100 dark:border-white/5 bg-white dark:bg-black shrink-0">
                  {/* Purple Camera Circle */}
                  <button
                    type="button"
                    className="w-7 h-7 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-xs"
                  >
                    <Camera className="w-3.5 h-3.5" />
                  </button>

                  {/* Pill Input Bar */}
                  <div className="flex-1 flex items-center justify-between px-3 py-1.5 rounded-full bg-gray-100 dark:bg-[#202024] text-xs text-gray-400">
                    <span className="text-[11px]">Message...</span>
                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                      <Mic className="w-3.5 h-3.5 hover:text-gray-900 dark:hover:text-white cursor-pointer" />
                      <ImageIcon className="w-3.5 h-3.5 hover:text-gray-900 dark:hover:text-white cursor-pointer" />
                      <Plus className="w-3.5 h-3.5 hover:text-gray-900 dark:hover:text-white cursor-pointer" />
                    </div>
                  </div>
                </div>
              </div>
            ) : isStoryTarget ? (
              /* INSTAGRAM STORY VIEW */
              <div className="flex-1 flex flex-col overflow-hidden relative bg-black text-white">
                {/* 1. Top Story Progress Bars */}
                <div className="flex items-center gap-1 px-3 pt-2.5 z-20 shrink-0">
                  <div className="flex-1 h-[2px] rounded-full bg-white shadow-xs" />
                  <div className="flex-1 h-[2px] rounded-full bg-white/40" />
                  <div className="flex-1 h-[2px] rounded-full bg-white/40" />
                </div>

                {/* 2. Top Story Header (User Info + Close) */}
                <div className="flex items-center justify-between px-3 py-2 z-20 shrink-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-yellow-400 via-rose-500 to-purple-600 p-[1.5px] shrink-0 overflow-hidden shadow-xs">
                      <img
                        src={previewAvatarUrl}
                        alt={previewUsername}
                        className="w-full h-full object-cover rounded-full"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = "/images/instagram/rcm-avatar.png";
                        }}
                      />
                    </div>
                    <span className="font-bold text-xs text-white truncate max-w-[120px]">
                      {previewUsername}
                    </span>
                    <span className="text-[11px] text-white/70 shrink-0">10m</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActivePreviewTab("DM")}
                    className="text-white/80 hover:text-white transition-opacity p-1 cursor-pointer"
                    title="Tutup Story"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* 3. Story Visual Canvas */}
                <div className="flex-1 relative flex flex-col items-center justify-center p-6 text-center overflow-hidden bg-gradient-to-br from-[#833ab4] via-[#fd1d1d] to-[#fcb045]">
                  {/* Selected Story Actual Image Preview */}
                  {ruleFormData.targetOtomasi === "Story Tertentu" && (selectedStory?.image || selectedStory?.thumb) && (
                    <img
                      src={selectedStory.image || selectedStory.thumb}
                      alt="Story Content"
                      className="absolute inset-0 w-full h-full object-cover z-0"
                    />
                  )}

                  {/* Decorative background glow rings & dimming overlay */}
                  <div className="absolute inset-0 bg-radial from-white/10 to-transparent pointer-events-none z-1" />
                  {ruleFormData.targetOtomasi === "Story Tertentu" && (selectedStory?.image || selectedStory?.thumb) && (
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] z-1" />
                  )}

                  {/* Center Floating Story Sticker Card */}
                  <div className="w-full max-w-[210px] p-4 rounded-2xl bg-black/50 backdrop-blur-md border border-white/20 text-white shadow-2xl space-y-2.5 animate-in zoom-in-95 duration-200 z-10">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-pink-500 flex items-center justify-center mx-auto shadow-md">
                      <InstagramIcon className="w-5 h-5 text-white" />
                    </div>

                    <div className="space-y-0.5">
                      <span className="inline-block px-2 py-0.5 rounded-full bg-white/20 text-[9px] font-bold tracking-wider uppercase text-white/95">
                        {ruleFormData.targetOtomasi}
                      </span>
                      <h4 className="text-xs font-bold text-white line-clamp-2 pt-1 leading-snug">
                        {ruleFormData.name.trim() || (selectedStory?.title || "Otomasi Story")}
                      </h4>
                    </div>

                    <div className="pt-1 border-t border-white/15">
                      <p className="text-[10px] text-white/80 leading-tight">
                        {ruleFormData.triggerCommentType === "ALL"
                          ? "Balas story apa saja untuk memicu DM otomatis"
                          : `Ketik "${ruleFormData.keywords.split(",")[0]?.trim() || "kata kunci"}" untuk info lengkap`}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 4. Bottom Story Interactive Bar (Input + Heart + Send) */}
                <div className="flex items-center gap-2.5 px-3 py-3 z-20 shrink-0 bg-black/40 backdrop-blur-sm">
                  <div className="flex-1 px-3 py-2 rounded-full border border-white/40 bg-white/10 text-[11px] text-white/70 flex items-center justify-between">
                    <span className="truncate">Kirim pesan...</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setRuleFormData({ ...ruleFormData, replyHeartReaction: !ruleFormData.replyHeartReaction })}
                    className="p-1 hover:scale-110 active:scale-90 transition-transform cursor-pointer"
                    title="Kirim Reaksi Love"
                  >
                    <Heart className={`w-5 h-5 ${ruleFormData.replyHeartReaction ? "text-rose-500 fill-rose-500" : "text-white"}`} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setActivePreviewTab("DM")}
                    className="p-1 hover:scale-110 active:scale-90 transition-transform cursor-pointer"
                    title="Buka DM"
                  >
                    <Send className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>
            ) : (
              /* POSTINGAN VIEW */
              <div className="flex-1 flex flex-col overflow-hidden pt-2 relative">
                {/* Instagram App Top Header */}
                <div className="flex items-center justify-between px-4 py-1.5 border-b border-gray-100 dark:border-white/5 shrink-0">
                  <ArrowLeft className="w-4 h-4 text-gray-800 dark:text-gray-200" />
                  <div className="text-center">
                    <span className="text-[10px] text-gray-400 block -mb-0.5 font-medium">
                      {previewUsername}
                    </span>
                    <span className="text-xs font-bold">
                      {ruleFormData.targetOtomasi.includes("Story") ? "Story" : "Postingan"}
                    </span>
                  </div>
                  <div className="w-4" />
                </div>

                {/* Scrollable Post Content */}
                <div className="flex-1 overflow-y-auto space-y-2 text-xs">
                  {/* Post Author Row */}
                  <div className="flex items-center justify-between px-4 pt-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-yellow-400 to-orange-500 p-0.5 shrink-0 overflow-hidden shadow-xs">
                        <div className="w-full h-full rounded-full bg-white dark:bg-black overflow-hidden flex items-center justify-center">
                          <img
                            src={previewAvatarUrl}
                            alt={previewUsername}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover rounded-full"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = "/images/instagram/rcm-avatar.png";
                            }}
                          />
                        </div>
                      </div>
                      <span className="font-bold text-xs">{previewUsername}</span>
                    </div>
                    <span className="text-gray-800 dark:text-gray-200 text-sm font-bold tracking-widest leading-none">•••</span>
                  </div>

                  {/* Post Media Container (Aspect 4:5 Portrait) */}
                  <div className="w-full aspect-[4/5] bg-gray-100 dark:bg-white/5 flex flex-col items-center justify-center text-center overflow-hidden">
                    {ruleFormData.targetOtomasi === "Postingan Tertentu" && (selectedPost?.thumb || selectedPost?.image) ? (
                      <img
                        src={selectedPost.thumb || selectedPost.image}
                        alt={selectedPost.title || "Post"}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          if (selectedPost?.image && e.currentTarget.src !== selectedPost.image) {
                            e.currentTarget.src = selectedPost.image;
                          }
                        }}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center p-4 text-center text-gray-400">
                        <InstagramIcon className="w-8 h-8 mb-2 opacity-40 text-gray-400" />
                        <span className="text-xs font-semibold text-gray-500">
                          {ruleFormData.targetOtomasi === "Semua Postingan"
                            ? "Semua Postingan"
                            : "Postingan Tertentu"}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons Row */}
                  <div className="flex items-center justify-between px-4 pt-0.5">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Heart className="w-4 h-4 text-gray-800 dark:text-gray-200" />
                        <span className="text-[11px] font-semibold text-gray-800 dark:text-gray-200">
                          {selectedPost?.likes ?? 127}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="w-4 h-4 text-gray-800 dark:text-gray-200" />
                        <span className="text-[11px] font-semibold text-gray-800 dark:text-gray-200">
                          {selectedPost?.comments ?? 124}
                        </span>
                      </div>
                      <Send className="w-3.5 h-3.5 text-gray-800 dark:text-gray-200" />
                    </div>
                    <Bookmark className="w-4 h-4 text-gray-800 dark:text-gray-200" />
                  </div>

                  {/* Caption Block */}
                  <div className="space-y-0.5 px-4 pt-0.5 pb-2">
                    <p className="text-xs leading-relaxed">
                      <strong className="font-bold mr-1.5">{previewUsername}</strong>
                      <span className="text-gray-700 dark:text-gray-300">
                        {selectedPost?.caption || "Kehilangan penghasilan tetap bukan akhir segalanya kalau kamu punya sistem yang..."}
                      </span>
                    </p>
                    <span className="text-[11px] text-gray-400 block pt-0.5 cursor-pointer">Lihat semua komentar</span>
                    <span className="text-[9px] text-gray-400 uppercase tracking-wider block">
                      {selectedPost?.date || "14 Oct, 2026"}
                    </span>
                  </div>
                </div>

                {/* Bottom Nav */}
                <div className="flex items-center justify-around py-2.5 px-3 border-t border-gray-100 dark:border-white/5 text-gray-800 dark:text-gray-200 bg-white dark:bg-black shrink-0">
                  <Home className="w-4 h-4" />
                  <Search className="w-4 h-4" />
                  <div className="w-4 h-4 border border-current rounded-sm flex items-center justify-center font-bold text-[10px]">
                    +
                  </div>
                  <Film className="w-4 h-4" />
                  <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-yellow-400 to-orange-500 p-0.5 shrink-0 overflow-hidden">
                    <img
                      src={previewAvatarUrl}
                      alt="Profile"
                      className="w-full h-full object-cover rounded-full"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = "/images/instagram/rcm-avatar.png";
                      }}
                    />
                  </div>
                </div>

                {/* INSTAGRAM COMMENTS BOTTOM SHEET (Overlay on top of post) */}
                {(isBasicInfoFilled || editingRule) && (
                  <div className="absolute inset-x-0 bottom-0 top-[36%] bg-white dark:bg-[#18181b] rounded-t-[22px] shadow-[0_-8px_30px_rgba(0,0,0,0.25)] border-t border-gray-200/80 dark:border-white/10 flex flex-col z-20 animate-in slide-in-from-bottom duration-300">
                    {/* Drag Handle */}
                    <div className="w-9 h-1 rounded-full bg-gray-300 dark:bg-gray-600 mx-auto my-2 shrink-0" />

                    {/* Header */}
                    <div className="text-center pb-2 border-b border-gray-100 dark:border-white/5 shrink-0">
                      <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                        Komentar
                      </h4>
                    </div>

                    {/* Comment Item */}
                    <div className="flex-1 p-3.5 space-y-3 overflow-y-auto">
                      <div className="flex items-start justify-between gap-2.5">
                        <div className="flex items-start gap-2.5 flex-1 min-w-0">
                          {/* Gray Circle Avatar */}
                          <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 shrink-0" />
                          <div className="space-y-0.5 min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-xs text-gray-900 dark:text-white">
                                Nama Pengguna
                              </span>
                              <span className="text-[10px] text-gray-400">
                                baru saja
                              </span>
                            </div>
                            {/* The live synced comment text */}
                            <p className="text-xs text-gray-800 dark:text-gray-200 break-words font-normal">
                              {ruleFormData.triggerCommentType === "ALL"
                                ? "Komentar"
                                : (ruleFormData.keywords.split(",")[0]?.trim() || ruleFormData.keywords.trim() || "Komentar")}
                            </p>
                            <button
                              type="button"
                              className="text-[10px] text-gray-400 font-semibold hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer pt-0.5"
                            >
                              Balas
                            </button>
                          </div>
                        </div>

                        <button
                          type="button"
                          className="text-gray-400 hover:text-rose-500 pt-1 shrink-0 cursor-pointer transition-colors"
                        >
                          <Heart className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* 2. Bot Reply Comment (when featureReplyComment is active) */}
                      {ruleFormData.featureReplyComment && (
                        <div className="flex items-start justify-between gap-2.5 pl-6 pt-0.5 animate-in fade-in slide-in-from-top-1 duration-200">
                          <div className="flex items-start gap-2.5 flex-1 min-w-0">
                            {/* Bot Avatar */}
                            <div className="w-6 h-6 rounded-full overflow-hidden shrink-0 border border-gray-200 dark:border-white/10 mt-0.5">
                              <img
                                src={previewAvatarUrl}
                                alt="Bot"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.currentTarget as HTMLImageElement).src = "/images/instagram/rcm-avatar.png";
                                }}
                              />
                            </div>
                            <div className="space-y-0.5 min-w-0 flex-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-bold text-xs text-gray-900 dark:text-white">
                                  {previewUsername}
                                </span>
                                <span className="text-[10px] text-gray-400">
                                  baru saja
                                </span>
                              </div>
                              <p className="text-xs text-gray-800 dark:text-gray-200 break-words font-normal">
                                {resolvePreviewVariables(
                                  ruleFormData.commentReplyVariations?.[0] ||
                                  ruleFormData.replyCommentTemplates ||
                                  "Pesan terkirim! 🚀"
                                )}
                              </p>
                              <button
                                type="button"
                                className="text-[10px] text-gray-400 font-semibold hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer pt-0.5"
                              >
                                Balas
                              </button>
                            </div>
                          </div>

                          <button
                            type="button"
                            className="text-gray-400 hover:text-rose-500 pt-1 shrink-0 cursor-pointer transition-colors"
                          >
                            <Heart className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Quick Emoji Reaction Bar */}
                    <div className="flex items-center justify-around px-3 py-2 border-t border-gray-100 dark:border-white/5 text-base select-none shrink-0 bg-white dark:bg-[#18181b]">
                      <span className="hover:scale-125 transition-transform cursor-pointer">❤️</span>
                      <span className="hover:scale-125 transition-transform cursor-pointer">🙌</span>
                      <span className="hover:scale-125 transition-transform cursor-pointer">🔥</span>
                      <span className="hover:scale-125 transition-transform cursor-pointer">👏</span>
                      <span className="hover:scale-125 transition-transform cursor-pointer">😢</span>
                      <span className="hover:scale-125 transition-transform cursor-pointer">😍</span>
                    </div>

                    {/* Add Comment Input Bar */}
                    <div className="flex items-center gap-2.5 px-3 py-2 border-t border-gray-100 dark:border-white/5 bg-gray-50/70 dark:bg-white/[0.02] shrink-0">
                      <div className="w-5 h-5 rounded-full overflow-hidden shrink-0 border border-gray-200 dark:border-white/10">
                        <img
                          src={previewAvatarUrl}
                          alt="Profile"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = "/images/instagram/rcm-avatar.png";
                          }}
                        />
                      </div>
                      <div className="text-[11px] text-gray-400 font-normal">
                        Tambahkan komentar..
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Bottom Home Indicator */}
            <div className="w-24 h-1 rounded-full bg-black/40 dark:bg-white/40 mx-auto my-1.5 shrink-0 z-30" />
          </div>
        </div>
      </div>
    </div>
  );
}
