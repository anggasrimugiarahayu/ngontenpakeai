"use client";

import React, { useState, useEffect } from "react";
import {
  Bot,
  Sparkles,
  MoreVertical,
  Pause,
  Play,
  Copy,
  Pencil,
  Trash2,
  ExternalLink,
  ChevronRight,
  AlertTriangle,
  Link2,
} from "lucide-react";
import { InstagramIcon } from "../../components/AutomationIcons";
import {
  parseClientRuleConfig,
  parseClientLogMeta,
  getCachedCoverUrl,
  setCachedCoverUrl,
} from "../../utils/automationHelpers";

interface PostRuleCardProps {
  rule: any;
  isAccountLinked: boolean;
  accountUsername?: string | null;
  feedPosts: any[];
  logs: any[];
  activeDropdownRuleId: string | null;
  setActiveDropdownRuleId: (id: string | null) => void;
  handleToggleRule: (ruleId: string, currentStatus: boolean) => void;
  handleDuplicateRule: (ruleId: string) => void;
  handleOpenEditRuleModal: (rule: any) => void;
  handleDeleteRule: (ruleId: string, ruleName: string) => void;
  setDetailRuleId: (id: string | null) => void;
}

export function PostRuleCard({
  rule,
  isAccountLinked,
  accountUsername,
  feedPosts,
  logs,
  activeDropdownRuleId,
  setActiveDropdownRuleId,
  handleToggleRule,
  handleDuplicateRule,
  handleOpenEditRuleModal,
  handleDeleteRule,
  setDetailRuleId,
}: PostRuleCardProps) {
  const keywordList = Array.isArray(rule.keywords)
    ? rule.keywords
    : typeof rule.keywords === "string"
    ? JSON.parse(rule.keywords || "[]")
    : [];

  const ruleConfig = parseClientRuleConfig(rule.dmMessage);
  const matchedPost = rule.specificPostId
    ? feedPosts.find((p) => String(p.id) === String(rule.specificPostId))
    : null;

  const isDirectImg =
    typeof rule.buttonUrl === "string" &&
    (rule.buttonUrl.startsWith("/images/") ||
      Boolean(rule.buttonUrl.match(/\.(jpeg|jpg|gif|png|webp|svg)($|\?)/i)));

  // Prioritaskan URL yang sudah tersimpan di DB (postCoverUrl) atau cache lokal
  // agar tampil instan 0ms dan TIDAK reload saat feedPosts selesai di-fetch di background.
  const immediateCover =
    ruleConfig.postCoverUrl ||
    getCachedCoverUrl(rule.specificPostId) ||
    matchedPost?.thumb ||
    matchedPost?.image ||
    (isDirectImg ? rule.buttonUrl : null);

  const [stableCoverSrc, setStableCoverSrc] = useState<string | null>(immediateCover);
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    const freshMediaCover = matchedPost?.thumb || matchedPost?.image || null;
    const savedCover = ruleConfig.postCoverUrl || getCachedCoverUrl(rule.specificPostId) || null;
    const candidate = savedCover || freshMediaCover || (isDirectImg ? rule.buttonUrl : null);

    if (rule.specificPostId && (freshMediaCover || savedCover)) {
      setCachedCoverUrl(rule.specificPostId, freshMediaCover || savedCover);
    }

    // Hanya update state gambar jika sebelumnya kosong, atau jika user baru mengganti post di Edit Modal
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
    matchedPost?.thumb,
    matchedPost?.image,
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

  const postPermalink =
    matchedPost?.permalink ||
    ruleConfig.postPermalink ||
    (accountUsername
      ? `https://www.instagram.com/${accountUsername}/`
      : "https://www.instagram.com/");

  return (
    <div
      className={`flex flex-row items-start w-full hover:border-rn-accent dark:hover:border-rn-accent/50 hover:shadow-xl hover:-translate-y-1.5 hover:shadow-gray-200 dark:hover:shadow-black/50 transition-all duration-300 border border-gray-200 dark:border-white/10 bg-white dark:bg-[#18181b] rounded-[16px] sm:rounded-[20px] relative p-3 sm:p-4 gap-3 sm:gap-4 ${
        !isAccountLinked
          ? "border-amber-200/60 dark:border-amber-500/20 bg-amber-500/[0.02]"
          : rule.isActive
          ? ""
          : "opacity-75 bg-gray-50/70 dark:bg-[#141417]"
      }`}
    >
      {/* Sisi Kiri: Cover 3:4 (hanya tampil jika akun terhubung) */}
      {isAccountLinked && (
        <div className="w-[105px] sm:w-[125px] shrink-0 relative overflow-hidden bg-gray-100 dark:bg-[#1f1f23] border border-gray-200 dark:border-white/5 rounded-[10px] sm:rounded-xl shadow-sm">
          <div className="aspect-[3/4] relative flex items-center justify-center overflow-hidden bg-gray-100 dark:bg-white/5">
            {rule.triggerType === "SPECIFIC_POST" ? (
              stableCoverSrc && !imgFailed ? (
                <>
                  <img
                    src={stableCoverSrc}
                    alt={rule.name}
                    referrerPolicy="no-referrer"
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={() => {
                      const fallback = matchedPost?.thumb || matchedPost?.image || null;
                      if (fallback && fallback !== stableCoverSrc) {
                        setStableCoverSrc(fallback);
                      } else {
                        setImgFailed(true);
                      }
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute bottom-1.5 left-2 right-2 text-[10px] font-bold text-white truncate drop-shadow">
                    {matchedPost?.title || rule.name}
                  </div>
                </>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-2 text-center bg-gray-100 dark:bg-white/5 text-gray-400">
                  <InstagramIcon className="w-5 h-5 mb-1 opacity-60 text-gray-500" />
                  <span className="text-[10px] font-semibold text-gray-500 truncate max-w-full px-1">
                    Postingan
                  </span>
                </div>
              )
            ) : rule.triggerType === "NEXT_POST" ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-2 text-center bg-gradient-to-br from-purple-500/15 via-indigo-500/10 to-pink-500/15 dark:bg-white/5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center text-white mb-1.5 shadow-sm">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold text-gray-700 dark:text-gray-300 leading-tight">
                  Menunggu<br />Post Baru
                </span>
              </div>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-2 text-center bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-orange-500/10 dark:bg-white/5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 flex items-center justify-center text-white mb-1.5 shadow-sm">
                  <InstagramIcon className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold text-gray-800 dark:text-gray-200 leading-tight">
                  Semua<br />Postingan
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sisi Kanan: Konten Informasi */}
      <div className="flex flex-col flex-1 min-w-0 justify-between py-0.5">
        <div>
          {/* Baris 1: Judul & Menu Titik Tiga */}
          <div className="flex items-start justify-between gap-2 mb-0.5">
            <h3
              className="text-[15px] sm:text-[17px] font-bold leading-tight tracking-tight text-gray-900 dark:text-white line-clamp-1 flex-1"
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
                className="w-7 h-7 rounded-lg border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                title="Opsi Aturan"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {activeDropdownRuleId === rule.id && (
                <div className="absolute right-0 mt-1 w-40 rounded-xl bg-white dark:bg-[#1f1f23] border border-gray-200 dark:border-white/10 shadow-xl py-1 z-30 animate-in fade-in zoom-in-95 duration-150">
                  <button
                    onClick={() => {
                      setActiveDropdownRuleId(null);
                      handleToggleRule(rule.id, rule.isActive);
                    }}
                    className="w-full px-3.5 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-2.5 transition-colors"
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
                    className="w-full px-3.5 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-2.5 transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
                    <span>Buat Salinan</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveDropdownRuleId(null);
                      handleOpenEditRuleModal(rule);
                    }}
                    className="w-full px-3.5 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-2.5 transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
                    <span>Edit</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveDropdownRuleId(null);
                      handleDeleteRule(rule.id, rule.name);
                    }}
                    className="w-full px-3.5 py-2 text-left text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 flex items-center gap-2.5 transition-colors border-t border-gray-100 dark:border-white/5"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                    <span>Hapus</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Baris 2: Status */}
          <div className="mb-1 leading-none">
            {!isAccountLinked ? (
              <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                Terputus
              </span>
            ) : (
              <span
                className={`text-[11px] font-semibold ${
                  rule.isActive
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-gray-400"
                }`}
              >
                {rule.isActive ? "Berjalan" : "Nonaktif"}
              </span>
            )}
          </div>

          {/* Baris 3: Lihat Post & Detail */}
          <div className="flex items-center gap-1.5 text-xs mb-2.5 flex-wrap">
            {isAccountLinked &&
              rule.triggerType === "SPECIFIC_POST" &&
              rule.specificPostId && (
                <>
                  <a
                    href={postPermalink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 inline-flex items-center gap-1 font-semibold transition-colors"
                  >
                    Lihat Post <ExternalLink className="w-3 h-3" />
                  </a>
                  <span className="text-gray-300 dark:text-gray-600">•</span>
                </>
              )}
            <button
              type="button"
              onClick={() => setDetailRuleId(rule.id)}
              className="text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 inline-flex items-center gap-0.5 font-semibold transition-colors cursor-pointer"
            >
              Detail <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {!isAccountLinked && (
            <div className="text-[11px] font-medium text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-2.5 py-1.5 rounded-lg border border-amber-200/80 dark:border-amber-500/20 flex items-center gap-1.5 mb-2">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-500" />
              <span>Koneksi akun terputus — automasi ini dijeda otomatis.</span>
            </div>
          )}

          {/* Baris 4: Kata Pemicu */}
          <div className="mb-2.5">
            <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400 block mb-1">
              Kata Pemicu
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {keywordList.length === 0 ? (
                <span className="font-semibold rounded-md px-2 py-0.5 text-[10px] sm:text-[11px] bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 inline-flex items-center gap-1">
                  <Link2 className="w-3 h-3" /> Semua Kata
                </span>
              ) : (
                <>
                  {ruleConfig.keywordRule &&
                    ruleConfig.keywordRule !== "Contains" && (
                      <span className="font-extrabold rounded-md px-1.5 py-0.5 text-[9px] sm:text-[10px] bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 uppercase tracking-wider">
                        {ruleConfig.keywordRule}
                      </span>
                    )}
                  {keywordList.map((kw: string, idx: number) => (
                    <span
                      key={idx}
                      className="font-medium rounded-md px-2 py-0.5 text-[10px] sm:text-[11px] bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 border border-gray-200/60 dark:border-white/5"
                    >
                      {kw}
                    </span>
                  ))}
                </>
              )}
              {ruleConfig.replyHeartReaction && (
                <span className="font-semibold rounded-md px-2 py-0.5 text-[10px] sm:text-[11px] bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 inline-flex items-center gap-1">
                  ❤️ Balas Reaksi
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Baris 5: 4 Metrics Columns */}
        <div className="pt-2 border-t border-gray-100 dark:border-white/5 grid grid-cols-4 gap-1.5 text-center sm:text-left">
          <div>
            <span className="text-[10px] text-gray-400 block font-medium leading-none">
              Terkirim
            </span>
            <span className="text-sm sm:text-base font-black text-orange-600 dark:text-orange-400 block mt-1 leading-none">
              {sentCount}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-gray-400 block font-medium leading-none">
              Klik
            </span>
            <span className="text-sm sm:text-base font-black text-orange-600 dark:text-orange-400 block mt-1 leading-none">
              {clickCount}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-gray-400 block font-medium leading-none">
              Follower
            </span>
            <span className="text-sm sm:text-base font-black text-orange-600 dark:text-orange-400 block mt-1 leading-none">
              {followerCount}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-gray-400 block font-medium leading-none">
              CTR
            </span>
            <span className="text-sm sm:text-base font-black text-orange-600 dark:text-orange-400 block mt-1 leading-none">
              {ctrRate}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface PostAutomationSectionProps {
  filteredRules: any[];
  filterStatus: "ALL" | "ACTIVE" | "INACTIVE";
  isAccountLinked: boolean;
  accountUsername?: string | null;
  feedPosts: any[];
  logs: any[];
  activeDropdownRuleId: string | null;
  setActiveDropdownRuleId: (id: string | null) => void;
  handleToggleRule: (ruleId: string, currentStatus: boolean) => void;
  handleDuplicateRule: (ruleId: string) => void;
  handleOpenEditRuleModal: (rule: any) => void;
  handleDeleteRule: (ruleId: string, ruleName: string) => void;
  setDetailRuleId: (id: string | null) => void;
}

export function PostAutomationSection({
  filteredRules,
  filterStatus,
  isAccountLinked,
  accountUsername,
  feedPosts,
  logs,
  activeDropdownRuleId,
  setActiveDropdownRuleId,
  handleToggleRule,
  handleDuplicateRule,
  handleOpenEditRuleModal,
  handleDeleteRule,
  setDetailRuleId,
}: PostAutomationSectionProps) {
  if (filteredRules.length === 0) {
    return (
      <div className="text-center py-16 px-4 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-2xl space-y-4 bg-white dark:bg-[#18181b]">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 flex items-center justify-center">
          <Bot className="w-7 h-7" />
        </div>
        <div className="space-y-1">
          <h4 className="font-bold text-gray-900 dark:text-white">
            {filterStatus !== "ALL"
              ? "Tidak ada aturan yang sesuai filter"
              : "Belum Ada Post Automation"}
          </h4>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            Buat aturan automasi postingan pertama Anda agar sistem membalas komentar dan mengirim link ke DM followers secara instan.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {filteredRules.map((rule: any) => (
        <PostRuleCard
          key={rule.id}
          rule={rule}
          isAccountLinked={isAccountLinked}
          accountUsername={accountUsername}
          feedPosts={feedPosts}
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
