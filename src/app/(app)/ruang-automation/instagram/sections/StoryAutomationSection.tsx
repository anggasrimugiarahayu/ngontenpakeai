"use client";

import React, { useState, useEffect } from "react";
import {
  Camera,
  Sparkles,
  MoreVertical,
  Pause,
  Play,
  Copy,
  Pencil,
  Trash2,
  ChevronRight,
  AlertTriangle,
  Link2,
  Plus,
  Unlink,
} from "lucide-react";
import {
  parseClientRuleConfig,
  parseClientLogMeta,
  getCachedCoverUrl,
  setCachedCoverUrl,
} from "../../utils/automationHelpers";

interface StoryRuleCardProps {
  rule: any;
  isAccountLinked: boolean;
  accountUsername?: string | null;
  activeStories: any[];
  logs: any[];
  activeDropdownRuleId: string | null;
  setActiveDropdownRuleId: (id: string | null) => void;
  handleToggleRule: (ruleId: string, currentStatus: boolean) => void;
  handleDuplicateRule: (ruleId: string) => void;
  handleOpenEditRuleModal: (rule: any) => void;
  handleDeleteRule: (ruleId: string, ruleName: string) => void;
  setDetailRuleId: (id: string | null) => void;
}

export function StoryRuleCard({
  rule,
  isAccountLinked,
  accountUsername,
  activeStories,
  logs,
  activeDropdownRuleId,
  setActiveDropdownRuleId,
  handleToggleRule,
  handleDuplicateRule,
  handleOpenEditRuleModal,
  handleDeleteRule,
  setDetailRuleId,
}: StoryRuleCardProps) {
  const keywordList = Array.isArray(rule.keywords)
    ? rule.keywords
    : typeof rule.keywords === "string"
    ? JSON.parse(rule.keywords || "[]")
    : [];

  const ruleConfig = parseClientRuleConfig(rule.dmMessage);
  const matchedStory = rule.specificPostId
    ? activeStories.find((s) => String(s.id) === String(rule.specificPostId))
    : null;

  const isDirectImg =
    typeof rule.buttonUrl === "string" &&
    (rule.buttonUrl.startsWith("/images/") ||
      Boolean(rule.buttonUrl.match(/\.(jpeg|jpg|gif|png|webp|svg)($|\?)/i)));

  // Prioritaskan URL yang sudah tersimpan di DB (postCoverUrl) atau cache lokal
  // agar tampil instan 0ms dan TIDAK reload saat activeStories selesai di-fetch di background.
  const immediateCover =
    ruleConfig.postCoverUrl ||
    getCachedCoverUrl(rule.specificPostId) ||
    matchedStory?.image ||
    matchedStory?.thumb ||
    (isDirectImg ? rule.buttonUrl : null);

  const [stableCoverSrc, setStableCoverSrc] = useState<string | null>(immediateCover);
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    const freshMediaCover = matchedStory?.image || matchedStory?.thumb || null;
    const savedCover = ruleConfig.postCoverUrl || getCachedCoverUrl(rule.specificPostId) || null;
    const candidate = savedCover || freshMediaCover || (isDirectImg ? rule.buttonUrl : null);

    if (rule.specificPostId && (freshMediaCover || savedCover)) {
      setCachedCoverUrl(rule.specificPostId, freshMediaCover || savedCover);
    }

    if (!stableCoverSrc && candidate) {
      setStableCoverSrc(candidate);
      setImgFailed(false);
    } else if (
      ruleConfig.postCoverUrl &&
      ruleConfig.postCoverUrl !== stableCoverSrc &&
      !imgFailed
    ) {
      setStableCoverSrc(ruleConfig.postCoverUrl);
    }
  }, [
    rule.specificPostId,
    ruleConfig.postCoverUrl,
    matchedStory?.image,
    matchedStory?.thumb,
    rule.buttonUrl,
    isDirectImg,
    stableCoverSrc,
    imgFailed,
  ]);

  // Real metrics dari log rule ini
  const ruleLogs = (logs || []).filter((l: any) => l.ruleId === rule.id);
  const sentLogsCount = ruleLogs.filter((l: any) => l.dmStatus === "SENT").length;
  const sentCount = sentLogsCount > 0 ? sentLogsCount : (rule._count?.logs || 0);

  let clickCount = 0;
  let followerCount = 0;
  for (const l of ruleLogs) {
    const m = parseClientLogMeta(l.errorMessage);
    if (m.clicked) clickCount += 1;
    if (m.newFollower) followerCount += 1;
  }
  const ctrRate =
    sentCount > 0
      ? ((clickCount / sentCount) * 100).toFixed(1).replace(/\.0$/, "") + "%"
      : "0%";

  return (
    <div
      className="flex flex-row items-stretch w-full hover:border-rn-accent dark:hover:border-rn-accent/50 hover:shadow-xl hover:-translate-y-1.5 hover:shadow-gray-200 dark:hover:shadow-black/50 transition-all duration-300 border border-gray-200 dark:border-[#2C3246] bg-white dark:bg-[#141B31] rounded-2xl relative p-3 sm:p-5 gap-3.5 sm:gap-5"
    >
      {/* Sisi Kiri: Cover 4:5 Ramping */}
      <div className="w-[105px] sm:w-[125px] aspect-[4/5] shrink-0 relative overflow-hidden bg-gray-200/80 dark:bg-white/10 rounded-xl sm:rounded-2xl shadow-2xs self-start">
        <div className="w-full h-full relative flex items-center justify-center overflow-hidden">
          {!isAccountLinked ? (
            <div className="absolute inset-0 flex items-center justify-center p-2 text-center text-gray-500 dark:text-gray-400 font-semibold text-xs sm:text-sm">
              Terputus
            </div>
          ) : rule.triggerType === "SPECIFIC_STORY" ||
            ruleConfig.targetOtomasi === "Story Tertentu" ? (
            stableCoverSrc && !imgFailed ? (
              <img
                src={stableCoverSrc}
                alt={rule.name}
                referrerPolicy="no-referrer"
                className="absolute inset-0 w-full h-full object-cover"
                onError={() => {
                  const fallback = matchedStory?.image || matchedStory?.thumb || null;
                  if (fallback && fallback !== stableCoverSrc) {
                    setStableCoverSrc(fallback);
                  } else {
                    setImgFailed(true);
                  }
                }}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center p-2 text-center text-gray-500 dark:text-gray-400 font-semibold text-xs sm:text-sm">
                Story Tertentu
              </div>
            )
          ) : rule.triggerType === "ALL_STORIES" ||
            ruleConfig.targetOtomasi === "Semua Story" ? (
            <div className="absolute inset-0 flex items-center justify-center p-2 text-center text-gray-500 dark:text-gray-400 font-semibold text-xs sm:text-sm">
              Semua Story
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center p-2 text-center text-gray-500 dark:text-gray-400 font-semibold text-xs sm:text-sm">
              Story Mention
            </div>
          )}
        </div>
      </div>

      {/* Sisi Kanan: Konten Informasi */}
      <div className="flex flex-col flex-1 min-w-0 justify-between">
        <div className="space-y-2 sm:space-y-2.5">
          {/* Baris 1: Judul & Menu Titik Tiga */}
          <div className="flex items-start justify-between gap-2">
            <h3
              className="text-base sm:text-lg font-bold leading-tight tracking-tight text-gray-900 dark:text-white line-clamp-1 flex-1"
              title={rule.name}
            >
              {rule.name}
            </h3>

            {/* Menu Titik Tiga Vertikal */}
            <div className="relative rule-dropdown-menu shrink-0 ml-1">
              <button
                type="button"
                onClick={() =>
                  setActiveDropdownRuleId(
                    activeDropdownRuleId === rule.id ? null : rule.id
                  )
                }
                className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
                title="Opsi Aturan"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {activeDropdownRuleId === rule.id && (
                <div className="absolute right-0 mt-1 w-40 rounded-xl bg-white dark:bg-[#141B31] border border-gray-200 dark:border-[#2C3246] shadow-xl py-1 z-30 animate-in fade-in zoom-in-95 duration-150">
                  <button
                    onClick={() => {
                      setActiveDropdownRuleId(null);
                      handleToggleRule(rule.id, rule.isActive);
                    }}
                    className="w-full px-3.5 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    {rule.isActive ? (
                      <>
                        <Pause className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
                        <span>Jeda</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>Lanjutkan</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      setActiveDropdownRuleId(null);
                      handleDuplicateRule(rule.id);
                    }}
                    className="w-full px-3.5 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
                    <span>Buat Salinan</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveDropdownRuleId(null);
                      handleOpenEditRuleModal(rule);
                    }}
                    className="w-full px-3.5 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <Pencil className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
                    <span>Edit</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveDropdownRuleId(null);
                      handleDeleteRule(rule.id, rule.name);
                    }}
                    className="w-full px-3.5 py-2 text-left text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 flex items-center gap-2.5 transition-colors border-t border-gray-100 dark:border-white/5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                    <span>Hapus</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Baris 2: Status */}
          <div className="leading-none">
            {!isAccountLinked ? (
              <span className="text-xs sm:text-sm font-medium text-gray-400 dark:text-gray-500">
                Terputus
              </span>
            ) : (
              <span className="text-xs sm:text-sm font-medium text-emerald-600 dark:text-emerald-400">
                Terhubung
              </span>
            )}
          </div>

          {/* Baris 3: 4 Metrics Columns */}
          <div className="grid grid-cols-4 gap-2 sm:gap-3 max-w-sm pt-0.5">
            <div>
              <span className="text-[10px] sm:text-[11px] text-gray-400 block font-normal leading-tight mb-1">
                Terkirim
              </span>
              <span
                className={`text-sm sm:text-base font-bold block leading-none ${
                  isAccountLinked
                    ? "text-orange-600 dark:text-orange-500"
                    : "text-gray-600 dark:text-gray-400"
                }`}
              >
                {sentCount}
              </span>
            </div>
            <div>
              <span className="text-[10px] sm:text-[11px] text-gray-400 block font-normal leading-tight mb-1">
                Klik
              </span>
              <span
                className={`text-sm sm:text-base font-bold block leading-none ${
                  isAccountLinked
                    ? "text-orange-600 dark:text-orange-500"
                    : "text-gray-600 dark:text-gray-400"
                }`}
              >
                {clickCount}
              </span>
            </div>
            <div>
              <span className="text-[10px] sm:text-[11px] text-gray-400 block font-normal leading-tight mb-1">
                Follower
              </span>
              <span
                className={`text-sm sm:text-base font-bold block leading-none ${
                  isAccountLinked
                    ? "text-orange-600 dark:text-orange-500"
                    : "text-gray-600 dark:text-gray-400"
                }`}
              >
                {followerCount}
              </span>
            </div>
            <div>
              <span className="text-[10px] sm:text-[11px] text-gray-400 block font-normal leading-tight mb-1">
                CTR
              </span>
              <span
                className={`text-sm sm:text-base font-bold block leading-none ${
                  isAccountLinked
                    ? "text-orange-600 dark:text-orange-500"
                    : "text-gray-600 dark:text-gray-400"
                }`}
              >
                {ctrRate}
              </span>
            </div>
          </div>

          {/* Baris 4: Kata Pemicu / Frekuensi */}
          <div>
            <span className="text-[10px] sm:text-[11px] text-gray-400 block font-normal mb-1">
              {rule.triggerType === "STORY_MENTION" ||
              ruleConfig.targetOtomasi === "Story Mention"
                ? "Frekuensi"
                : "Kata Pemicu"}
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {rule.triggerType === "STORY_MENTION" ||
              ruleConfig.targetOtomasi === "Story Mention" ? (
                <span
                  className={`font-bold uppercase text-[10px] sm:text-[11px] px-2 py-0.5 rounded-sm tracking-wide ${
                    isAccountLinked
                      ? "bg-[#ff5500] text-white"
                      : "bg-[#6b7280] text-white"
                  }`}
                >
                  {ruleConfig.storyMentionFrequency || "24 JAM SEKALI"}
                </span>
              ) : keywordList.length === 0 ? (
                <span
                  className={`font-bold uppercase text-[10px] sm:text-[11px] px-2 py-0.5 rounded-sm tracking-wide ${
                    isAccountLinked
                      ? "bg-[#ff5500] text-white"
                      : "bg-[#6b7280] text-white"
                  }`}
                >
                  SEMUA KATA
                </span>
              ) : (
                keywordList.map((kw: string, idx: number) => (
                  <span
                    key={idx}
                    className={`font-bold uppercase text-[10px] sm:text-[11px] px-2 py-0.5 rounded-sm tracking-wide ${
                      isAccountLinked
                        ? "bg-[#ff5500] text-white"
                        : "bg-[#6b7280] text-white"
                    }`}
                  >
                    {kw}
                  </span>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Baris 5: Action Buttons (Bawah Kanan) */}
        <div className="flex items-center justify-end gap-2 sm:gap-2.5 pt-3 mt-auto">
          {(rule.triggerType === "SPECIFIC_STORY" ||
            ruleConfig.targetOtomasi === "Story Tertentu") && (
            <button
              type="button"
              onClick={() => {
                if (accountUsername) {
                  window.open(
                    `https://instagram.com/${accountUsername.replace(/^@/, "")}`,
                    "_blank"
                  );
                } else {
                  window.open("https://instagram.com", "_blank");
                }
              }}
              className="px-3 sm:px-3.5 py-1.5 rounded-xl bg-[#222226] hover:bg-black dark:bg-[#222226] dark:hover:bg-[#2c2c31] text-white text-xs font-semibold whitespace-nowrap transition-all shadow-xs active:scale-[0.98] cursor-pointer shrink-0"
            >
              Lihat Profile
            </button>
          )}
          <button
            type="button"
            onClick={() => setDetailRuleId(rule.id)}
            className="px-3.5 sm:px-4 py-1.5 rounded-xl bg-[#222226] hover:bg-black dark:bg-[#222226] dark:hover:bg-[#2c2c31] text-white text-xs font-semibold whitespace-nowrap transition-all shadow-xs active:scale-[0.98] cursor-pointer shrink-0"
          >
            Detail
          </button>
        </div>
      </div>
    </div>
  );
}

interface StoryAutomationSectionProps {
  filteredRules: any[];
  filterStatus: "ALL" | "ACTIVE" | "INACTIVE";
  isAccountLinked: boolean;
  accountUsername?: string | null;
  activeStories: any[];
  logs: any[];
  activeDropdownRuleId: string | null;
  setActiveDropdownRuleId: (id: string | null) => void;
  handleToggleRule: (ruleId: string, currentStatus: boolean) => void;
  handleDuplicateRule: (ruleId: string) => void;
  handleOpenEditRuleModal: (rule: any) => void;
  handleDeleteRule: (ruleId: string, ruleName: string) => void;
  setDetailRuleId: (id: string | null) => void;
  handleOpenAddRuleModal: () => void;
}

export function StoryAutomationSection({
  filteredRules,
  filterStatus,
  isAccountLinked,
  accountUsername,
  activeStories,
  logs,
  activeDropdownRuleId,
  setActiveDropdownRuleId,
  handleToggleRule,
  handleDuplicateRule,
  handleOpenEditRuleModal,
  handleDeleteRule,
  setDetailRuleId,
  handleOpenAddRuleModal,
}: StoryAutomationSectionProps) {
  if (filteredRules.length === 0) {
    return (
      <div className="text-center py-16 px-4 border-2 border-dashed border-gray-200 dark:border-[#2C3246] rounded-2xl space-y-4 bg-white dark:bg-[#141B31]">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 flex items-center justify-center">
          <Camera className="w-7 h-7 text-pink-500" />
        </div>
        <div className="space-y-1">
          <h4 className="font-bold text-gray-900 dark:text-white">
            {filterStatus !== "ALL"
              ? "Tidak ada aturan yang sesuai filter"
              : "Belum Ada Story Automation"}
          </h4>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            Buat aturan automasi Story pertama Anda untuk membalas reaksi/reply story dan kirim DM instan 24/7.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {filteredRules.map((rule: any) => (
        <StoryRuleCard
          key={rule.id}
          rule={rule}
          isAccountLinked={isAccountLinked}
          accountUsername={accountUsername}
          activeStories={activeStories}
          logs={logs}
          activeDropdownRuleId={activeDropdownRuleId}
          setActiveDropdownRuleId={setActiveDropdownRuleId}
          handleToggleRule={handleToggleRule}
          handleDuplicateRule={handleDuplicateRule}
          handleOpenEditRuleModal={handleOpenEditRuleModal}
          handleDeleteRule={handleDeleteRule}
          setDetailRuleId={setDetailRuleId}
        />
      ))}
    </div>
  );
}
