"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  ChevronDown,
  Check,
  Plus,
  Trash2,
  X,
  ExternalLink,
} from "lucide-react";

interface AdditionalFeaturesBuilderProps {
  ruleFormData: any;
  setRuleFormData: React.Dispatch<React.SetStateAction<any>>;
  isStoryTarget: boolean;
  isLiveTarget: boolean;
  isDmTarget?: boolean;
  setActivePreviewTab: (tab: "COMMENT" | "DM") => void;
  setSimulatedFollowStep: (step: "GATE" | "RETRY" | "VERIFIED") => void;
  showToast: (type: "success" | "error" | "info", message: string) => void;
}

export function AdditionalFeaturesBuilder({
  ruleFormData,
  setRuleFormData,
  isStoryTarget,
  isLiveTarget,
  isDmTarget = false,
  setActivePreviewTab,
  setSimulatedFollowStep,
  showToast,
}: AdditionalFeaturesBuilderProps) {
  const [openDropdown, setOpenDropdown] = useState<
    | "followUpDelay"
    | "followUpCondition"
    | "followUpMsgType"
    | "commentLimit"
    | "welcomeMsgType"
    | "askFollowMsgType"
    | "askContactType"
    | null
  >(null);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideMouseDown = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleOutsideMouseDown);
    return () => document.removeEventListener("mousedown", handleOutsideMouseDown);
  }, []);

  const toggleDropdown = (
    key:
      | "followUpDelay"
      | "followUpCondition"
      | "followUpMsgType"
      | "commentLimit"
      | "welcomeMsgType"
      | "askFollowMsgType"
      | "askContactType"
  ) => {
    setOpenDropdown((prev) => (prev === key ? null : key));
  };

  return (
    <div
      ref={containerRef}
      className="space-y-3 pt-4 border-t border-gray-200 dark:border-white/10"
    >
      <h3 className="text-sm font-bold text-gray-900 dark:text-white">
        Fitur Tambahan
      </h3>

      <div className="space-y-2.5">
        {/* 1. Follow Up */}
        <div
          onClick={() => {
            if (ruleFormData.featureFollowUp) {
              setActivePreviewTab("DM");
            }
          }}
          className="p-3.5 rounded-xl border border-gray-200/80 dark:border-white/10 bg-white dark:bg-[#18181b] space-y-3"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-gray-900 dark:text-white">
                Follow Up
              </span>
              <p className="text-[11px] text-gray-500">
                Kirim pesan follow up secara otomatis
              </p>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                const nextVal = !ruleFormData.featureFollowUp;
                setRuleFormData({ ...ruleFormData, featureFollowUp: nextVal });
                if (nextVal) {
                  setActivePreviewTab("DM");
                }
              }}
              className={`w-10 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                ruleFormData.featureFollowUp
                  ? "bg-gray-900 dark:bg-white"
                  : "bg-gray-200 dark:bg-white/15"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white dark:bg-black shadow-sm transition-transform ${
                  ruleFormData.featureFollowUp ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {ruleFormData.featureFollowUp && (
            <div className="pt-2 border-t border-gray-100 dark:border-white/5 space-y-3.5 animate-in fade-in duration-150">
              {/* Kirim Setelah (Delay Waktu) */}
              <div className="space-y-1.5 relative">
                <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
                  Kirim Setelah
                </label>
                <button
                  type="button"
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleDropdown("followUpDelay");
                  }}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#18181b] text-xs sm:text-sm text-gray-900 dark:text-white flex items-center justify-between hover:border-gray-300 dark:hover:border-white/20 transition-colors cursor-pointer"
                >
                  <span className="font-medium">
                    {ruleFormData.followUpDelay || "1 Jam"}
                  </span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-gray-400 transition-transform ${
                      openDropdown === "followUpDelay" ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {openDropdown === "followUpDelay" && (
                  <div
                    onMouseDown={(e) => e.stopPropagation()}
                    className="absolute left-0 right-0 mt-1.5 bg-white dark:bg-[#1f1f23] border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150"
                  >
                    {(
                      ["15 Menit", "1 Jam", "3 Jam", "6 Jam", "12 Jam", "23 Jam"] as const
                    ).map((delayOpt) => {
                      const isSelected =
                        (ruleFormData.followUpDelay || "1 Jam") === delayOpt;
                      return (
                        <button
                          key={delayOpt}
                          type="button"
                          onMouseDown={(e) => e.stopPropagation()}
                          onClick={(e) => {
                            e.stopPropagation();
                            setRuleFormData({
                              ...ruleFormData,
                              followUpDelay: delayOpt,
                            });
                            setOpenDropdown(null);
                          }}
                          className={`w-full px-4 py-2 text-left text-xs sm:text-sm font-medium flex items-center justify-between transition-colors cursor-pointer ${
                            isSelected
                              ? "bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white font-semibold"
                              : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"
                          }`}
                        >
                          <span>{delayOpt}</span>
                          {isSelected && (
                            <Check className="w-3.5 h-3.5 text-gray-900 dark:text-white stroke-[2.5]" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Kondisi Pengiriman */}
              <div className="space-y-1.5 relative">
                <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
                  Kondisi Pengiriman
                </label>
                <button
                  type="button"
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleDropdown("followUpCondition");
                  }}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#18181b] text-xs sm:text-sm text-gray-900 dark:text-white flex items-center justify-between hover:border-gray-300 dark:hover:border-white/20 transition-colors cursor-pointer"
                >
                  <span className="font-medium">
                    {ruleFormData.followUpCondition || "Hanya yang Belum Klik Link"}
                  </span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-gray-400 transition-transform ${
                      openDropdown === "followUpCondition" ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {openDropdown === "followUpCondition" && (
                  <div
                    onMouseDown={(e) => e.stopPropagation()}
                    className="absolute left-0 right-0 mt-1.5 bg-white dark:bg-[#1f1f23] border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150"
                  >
                    {(
                      ["Semua Penerima", "Hanya yang Belum Klik Link"] as const
                    ).map((condOpt) => {
                      const isSelected =
                        (ruleFormData.followUpCondition ||
                          "Hanya yang Belum Klik Link") === condOpt;
                      return (
                        <button
                          key={condOpt}
                          type="button"
                          onMouseDown={(e) => e.stopPropagation()}
                          onClick={(e) => {
                            e.stopPropagation();
                            setRuleFormData({
                              ...ruleFormData,
                              followUpCondition: condOpt,
                            });
                            setOpenDropdown(null);
                          }}
                          className={`w-full px-4 py-2 text-left text-xs sm:text-sm font-medium flex items-center justify-between transition-colors cursor-pointer ${
                            isSelected
                              ? "bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white font-semibold"
                              : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"
                          }`}
                        >
                          <span>{condOpt}</span>
                          {isSelected && (
                            <Check className="w-3.5 h-3.5 text-gray-900 dark:text-white stroke-[2.5]" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Jenis Pesan */}
              <div className="space-y-1.5 relative">
                <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
                  Jenis Pesan
                </label>
                <button
                  type="button"
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleDropdown("followUpMsgType");
                  }}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#18181b] text-xs sm:text-sm text-gray-900 dark:text-white flex items-center justify-between hover:border-gray-300 dark:hover:border-white/20 transition-colors cursor-pointer"
                >
                  <span className="font-medium">
                    {ruleFormData.followUpMessageType || "Template Tombol"}
                  </span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-gray-400 transition-transform ${
                      openDropdown === "followUpMsgType" ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {openDropdown === "followUpMsgType" && (
                  <div
                    onMouseDown={(e) => e.stopPropagation()}
                    className="absolute left-0 right-0 mt-1.5 bg-white dark:bg-[#1f1f23] border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150"
                  >
                    {(["Template Tombol", "Teks Biasa"] as const).map(
                      (typeOpt) => {
                        const isSelected =
                          (ruleFormData.followUpMessageType ||
                            "Template Tombol") === typeOpt;
                        return (
                          <button
                            key={typeOpt}
                            type="button"
                            onMouseDown={(e) => e.stopPropagation()}
                            onClick={(e) => {
                              e.stopPropagation();
                              setRuleFormData({
                                ...ruleFormData,
                                followUpMessageType: typeOpt,
                              });
                              setOpenDropdown(null);
                            }}
                            className={`w-full px-4 py-2 text-left text-xs sm:text-sm font-medium flex items-center justify-between transition-colors cursor-pointer ${
                              isSelected
                                ? "bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white font-semibold"
                                : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"
                            }`}
                          >
                            <span>{typeOpt}</span>
                            {isSelected && (
                              <Check className="w-3.5 h-3.5 text-gray-900 dark:text-white stroke-[2.5]" />
                            )}
                          </button>
                        );
                      }
                    )}
                  </div>
                )}
              </div>

              {/* Pesan */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
                  Pesan
                </label>
                <div className="relative">
                  <textarea
                    rows={3}
                    maxLength={
                      ruleFormData.followUpMessageType === "Template Tombol"
                        ? 640
                        : 1000
                    }
                    value={ruleFormData.followUpMessage}
                    onChange={(e) =>
                      setRuleFormData({
                        ...ruleFormData,
                        followUpMessage: e.target.value,
                      })
                    }
                    placeholder="Tulis pesan follow up..."
                    className="w-full px-3.5 py-2.5 pb-6 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#18181b] text-xs text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 leading-relaxed font-normal resize-none"
                  />
                  <div className="absolute right-2.5 bottom-2 text-[10px] text-gray-400 font-mono">
                    {ruleFormData.followUpMessage.length}/
                    {ruleFormData.followUpMessageType === "Template Tombol"
                      ? 640
                      : 1000}
                  </div>
                </div>
              </div>

              {/* Label Tombol (Hanya untuk Template Tombol) */}
              {ruleFormData.followUpMessageType === "Template Tombol" && (
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
                    Label Tombol
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      maxLength={80}
                      value={ruleFormData.followUpButtonLabel}
                      onChange={(e) =>
                        setRuleFormData({
                          ...ruleFormData,
                          followUpButtonLabel: e.target.value,
                        })
                      }
                      placeholder="Buka Link Sekarang"
                      className="w-full px-3.5 py-2 pr-12 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#18181b] text-xs text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                    />
                    <div className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 font-mono">
                      {ruleFormData.followUpButtonLabel.length}/80
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 2. Balasan Komentar (Hanya untuk Post / Reels, sembunyikan untuk Story, Live Instagram & Pesan Instagram) */}
        {!isStoryTarget && !isLiveTarget && !isDmTarget && (
          <div
            onClick={() => setActivePreviewTab("COMMENT")}
            className="p-3.5 rounded-xl border border-gray-200/80 dark:border-white/10 bg-white dark:bg-[#18181b] space-y-3"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-gray-900 dark:text-white">
                  Balasan Komentar
                </span>
                <p className="text-[11px] text-gray-500">
                  Balas pengguna yang mengomentari postingan Anda
                </p>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  const nextVal = !ruleFormData.featureReplyComment;
                  setRuleFormData({
                    ...ruleFormData,
                    featureReplyComment: nextVal,
                  });
                  if (nextVal) {
                    setActivePreviewTab("COMMENT");
                  }
                }}
                className={`w-10 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                  ruleFormData.featureReplyComment
                    ? "bg-gray-900 dark:bg-white"
                    : "bg-gray-200 dark:bg-white/15"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white dark:bg-black shadow-sm transition-transform ${
                    ruleFormData.featureReplyComment
                      ? "translate-x-4"
                      : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {ruleFormData.featureReplyComment && (
              <div className="pt-2 border-t border-gray-100 dark:border-white/5 space-y-4 animate-in fade-in duration-150">
                {/* Tips Box */}
                <div className="p-3.5 sm:p-4 rounded-xl border border-blue-400/50 dark:border-blue-500/30 bg-blue-50/40 dark:bg-blue-950/20 space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="text-xs font-bold text-gray-900 dark:text-white">
                        Tips
                      </div>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400">
                        Tips bermanfaat untuk menghindari spam
                      </p>
                    </div>
                    <div className="w-5 h-5 rounded-full border border-blue-500 text-blue-500 flex items-center justify-center shrink-0 text-xs font-bold font-serif">
                      i
                    </div>
                  </div>

                  <ol className="space-y-1.5 text-[11px] text-gray-600 dark:text-gray-400 list-decimal pl-4 leading-relaxed">
                    <li>
                      Matikan fitur ini ketika konten Anda mendapatkan banyak
                      trafik
                    </li>
                    <li>Ganti secara berkala isi balasan komentar</li>
                    <li>
                      Pastikan balasan komentar pada konten Anda berbeda-beda
                    </li>
                    <li>
                      Balas menggunakan{" "}
                      <code className="text-blue-600 dark:text-blue-400 font-semibold font-mono">
                        @&#123;username&#125;
                      </code>{" "}
                      untuk bisa secara dinamis memanggil username audiens
                    </li>
                    <li>
                      Balas menggunakan format{" "}
                      <code className="text-blue-600 dark:text-blue-400 font-semibold font-mono">
                        &#123;option1|option2|option3|dan seterusnya..&#125;
                      </code>{" "}
                      untuk membuat variasi balasan dalam 1 input
                    </li>
                  </ol>

                  <div className="flex justify-end pt-0.5">
                    <a
                      href="https://help.instagram.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>Panduan</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                {/* Limit Dropdown */}
                <div className="space-y-1.5 relative">
                  <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
                    Limit
                  </label>
                  <button
                    type="button"
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleDropdown("commentLimit");
                    }}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#18181b] text-xs sm:text-sm text-gray-900 dark:text-white flex items-center justify-between hover:border-gray-300 dark:hover:border-white/20 transition-colors cursor-pointer"
                  >
                    <span className="font-medium">
                      {ruleFormData.commentReplyLimit || "Tak Terbatas"}
                    </span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-gray-400 transition-transform ${
                        openDropdown === "commentLimit" ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {openDropdown === "commentLimit" && (
                    <div
                      onMouseDown={(e) => e.stopPropagation()}
                      className="absolute left-0 right-0 mt-1.5 bg-white dark:bg-[#1f1f23] border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150"
                    >
                      {(
                        [
                          "Tak Terbatas",
                          "1 Kali per Pengguna",
                          "2 Kali per Pengguna",
                        ] as const
                      ).map((limitOpt) => {
                        const isSelected =
                          (ruleFormData.commentReplyLimit || "Tak Terbatas") ===
                          limitOpt;
                        return (
                          <button
                            key={limitOpt}
                            type="button"
                            onMouseDown={(e) => e.stopPropagation()}
                            onClick={(e) => {
                              e.stopPropagation();
                              setRuleFormData({
                                ...ruleFormData,
                                commentReplyLimit: limitOpt,
                              });
                              setOpenDropdown(null);
                            }}
                            className={`w-full px-4 py-2 text-left text-xs sm:text-sm font-medium flex items-center justify-between transition-colors cursor-pointer ${
                              isSelected
                                ? "bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white font-semibold"
                                : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"
                            }`}
                          >
                            <span>{limitOpt}</span>
                            {isSelected && (
                              <Check className="w-3.5 h-3.5 text-gray-900 dark:text-white stroke-[2.5]" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Pesan (Variasi Balasan Komentar) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-gray-800 dark:text-gray-200">
                      Pesan
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const variations = [
                          ...ruleFormData.commentReplyVariations,
                        ];
                        if (variations.length === 0) {
                          variations.push("@{username} ");
                        } else {
                          const lastIdx = variations.length - 1;
                          variations[lastIdx] = `${variations[lastIdx]} @{username} `;
                        }
                        setRuleFormData({
                          ...ruleFormData,
                          commentReplyVariations: variations,
                          replyCommentTemplates: variations[0] || "",
                        });
                      }}
                      className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                    >
                      Tambah @mention
                    </button>
                  </div>

                  <div className="space-y-2">
                    {ruleFormData.commentReplyVariations.map(
                      (text: string, vIdx: number) => (
                        <div key={vIdx} className="relative flex items-center gap-2">
                          <input
                            type="text"
                            value={text}
                            onChange={(e) => {
                              const nextVariations = [
                                ...ruleFormData.commentReplyVariations,
                              ];
                              nextVariations[vIdx] = e.target.value;
                              setRuleFormData({
                                ...ruleFormData,
                                commentReplyVariations: nextVariations,
                                replyCommentTemplates: nextVariations[0] || "",
                              });
                            }}
                            placeholder="Pesan balasan komentar..."
                            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#18181b] text-xs sm:text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                          />
                          {ruleFormData.commentReplyVariations.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                const nextVariations =
                                  ruleFormData.commentReplyVariations.filter(
                                    (_: string, idx: number) => idx !== vIdx
                                  );
                                setRuleFormData({
                                  ...ruleFormData,
                                  commentReplyVariations: nextVariations,
                                  replyCommentTemplates:
                                    nextVariations[0] || "",
                                });
                              }}
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors shrink-0 cursor-pointer"
                              title="Hapus variasi"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      )
                    )}
                  </div>

                  {ruleFormData.commentReplyVariations.length < 5 && (
                    <button
                      type="button"
                      onClick={() => {
                        setRuleFormData({
                          ...ruleFormData,
                          commentReplyVariations: [
                            ...ruleFormData.commentReplyVariations,
                            "Terima kasih sudah komen! Cek DM ya kak! 🙌",
                          ],
                        });
                      }}
                      className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer pt-0.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tambah variasi balasan</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 3. Pesan Pembuka */}
        <div
          onClick={() => setActivePreviewTab("DM")}
          className="p-3.5 rounded-xl border border-gray-200/80 dark:border-white/10 bg-white dark:bg-[#18181b] space-y-3"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-gray-900 dark:text-white">
                Pesan Pembuka
              </span>
              <p className="text-[11px] text-gray-500">
                Kirim pesan pertama ke pengguna
              </p>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                const nextVal = !ruleFormData.featureWelcomeMessage;
                setRuleFormData({
                  ...ruleFormData,
                  featureWelcomeMessage: nextVal,
                  ...(nextVal ? {} : { featureAskForFollow: false }),
                });
                if (nextVal) {
                  setActivePreviewTab("DM");
                }
              }}
              className={`w-10 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                ruleFormData.featureWelcomeMessage
                  ? "bg-gray-900 dark:bg-white"
                  : "bg-gray-200 dark:bg-white/15"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white dark:bg-black shadow-sm transition-transform ${
                  ruleFormData.featureWelcomeMessage
                    ? "translate-x-4"
                    : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {ruleFormData.featureWelcomeMessage && (
            <div className="pt-2 border-t border-gray-100 dark:border-white/5 space-y-3.5 animate-in fade-in duration-150">
              {/* Jenis Pesan */}
              <div className="space-y-1.5 relative">
                <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
                  Jenis Pesan
                </label>
                <button
                  type="button"
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleDropdown("welcomeMsgType");
                  }}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#18181b] text-xs sm:text-sm text-gray-900 dark:text-white flex items-center justify-between hover:border-gray-300 dark:hover:border-white/20 transition-colors cursor-pointer"
                >
                  <span className="font-medium">
                    {ruleFormData.welcomeMessageType || "Template Tombol"}
                  </span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-gray-400 transition-transform ${
                      openDropdown === "welcomeMsgType" ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {openDropdown === "welcomeMsgType" && (
                  <div
                    onMouseDown={(e) => e.stopPropagation()}
                    className="absolute left-0 right-0 mt-1.5 bg-white dark:bg-[#1f1f23] border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150"
                  >
                    {(["Template Tombol", "Teks Biasa"] as const).map(
                      (typeOpt) => {
                        const isSelected =
                          (ruleFormData.welcomeMessageType ||
                            "Template Tombol") === typeOpt;
                        return (
                          <button
                            key={typeOpt}
                            type="button"
                            onMouseDown={(e) => e.stopPropagation()}
                            onClick={(e) => {
                              e.stopPropagation();
                              setRuleFormData({
                                ...ruleFormData,
                                welcomeMessageType: typeOpt,
                              });
                              setOpenDropdown(null);
                            }}
                            className={`w-full px-4 py-2 text-left text-xs sm:text-sm font-medium flex items-center justify-between transition-colors cursor-pointer ${
                              isSelected
                                ? "bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white font-semibold"
                                : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"
                            }`}
                          >
                            <span>{typeOpt}</span>
                            {isSelected && (
                              <Check className="w-3.5 h-3.5 text-gray-900 dark:text-white stroke-[2.5]" />
                            )}
                          </button>
                        );
                      }
                    )}
                  </div>
                )}
              </div>

              {/* Pesan */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
                  Pesan
                </label>
                <div className="relative">
                  <textarea
                    rows={3}
                    maxLength={
                      ruleFormData.welcomeMessageType === "Template Tombol"
                        ? 640
                        : 1000
                    }
                    value={ruleFormData.welcomeMessage}
                    onChange={(e) =>
                      setRuleFormData({
                        ...ruleFormData,
                        welcomeMessage: e.target.value,
                      })
                    }
                    placeholder="Ketik pesan pembuka..."
                    className="w-full px-3.5 py-2.5 pb-6 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#18181b] text-xs text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium leading-relaxed resize-none"
                  />
                  <div className="absolute right-2.5 bottom-1.5 text-[10px] text-gray-400 font-mono">
                    {ruleFormData.welcomeMessage.length}/
                    {ruleFormData.welcomeMessageType === "Template Tombol"
                      ? 640
                      : 1000}
                  </div>
                </div>
              </div>

              {/* Label Tombol (only when Template Tombol) */}
              {ruleFormData.welcomeMessageType === "Template Tombol" && (
                <div className="space-y-1 animate-in fade-in duration-150">
                  <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
                    Label Tombol
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      maxLength={80}
                      value={ruleFormData.welcomeButtonLabel}
                      onChange={(e) =>
                        setRuleFormData({
                          ...ruleFormData,
                          welcomeButtonLabel: e.target.value,
                        })
                      }
                      placeholder="Ya, Saya Mau!"
                      className="w-full px-3.5 py-2 pr-12 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#18181b] text-xs text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                    />
                    <div className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 font-mono">
                      {ruleFormData.welcomeButtonLabel.length}/80
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 4. Ask For Follow */}
        <div
          onClick={() => {
            if (
              ruleFormData.featureWelcomeMessage &&
              ruleFormData.featureAskForFollow
            ) {
              setActivePreviewTab("DM");
            }
          }}
          className={`p-3.5 rounded-xl border border-gray-200/80 dark:border-white/10 bg-white dark:bg-[#18181b] space-y-3 transition-all ${
            !ruleFormData.featureWelcomeMessage ? "opacity-60" : "opacity-100"
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-900 dark:text-white">
                  Ask For Follow
                </span>
                {!ruleFormData.featureWelcomeMessage && (
                  <span className="text-[9px] font-semibold text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                    Perlu Pesan Pembuka
                  </span>
                )}
              </div>
              <p className="text-[11px] text-gray-500">
                Minta pengguna untuk mengikuti akun Anda
              </p>
            </div>
            <button
              type="button"
              disabled={!ruleFormData.featureWelcomeMessage}
              onClick={(e) => {
                e.stopPropagation();
                if (!ruleFormData.featureWelcomeMessage) {
                  showToast("info", "Aktifkan Pesan Pembuka terlebih dahulu");
                  return;
                }
                const nextVal = !ruleFormData.featureAskForFollow;
                setRuleFormData({
                  ...ruleFormData,
                  featureAskForFollow: nextVal,
                });
                if (nextVal) {
                  setActivePreviewTab("DM");
                  setSimulatedFollowStep("GATE");
                }
              }}
              title={
                !ruleFormData.featureWelcomeMessage
                  ? "Aktifkan Pesan Pembuka terlebih dahulu"
                  : undefined
              }
              className={`w-10 h-6 rounded-full transition-colors relative p-0.5 ${
                !ruleFormData.featureWelcomeMessage
                  ? "bg-gray-200 dark:bg-white/10 cursor-not-allowed opacity-50"
                  : ruleFormData.featureAskForFollow
                  ? "bg-gray-900 dark:bg-white cursor-pointer"
                  : "bg-gray-200 dark:bg-white/15 cursor-pointer"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white dark:bg-black shadow-sm transition-transform ${
                  ruleFormData.featureAskForFollow &&
                  ruleFormData.featureWelcomeMessage
                    ? "translate-x-4"
                    : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {ruleFormData.featureWelcomeMessage &&
            ruleFormData.featureAskForFollow && (
              <div className="pt-2 border-t border-gray-100 dark:border-white/5 space-y-3.5 animate-in fade-in duration-150">
                {/* Jenis Pesan */}
                <div className="space-y-1.5 relative">
                  <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
                    Jenis Pesan
                  </label>
                  <button
                    type="button"
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleDropdown("askFollowMsgType");
                    }}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#18181b] text-xs sm:text-sm text-gray-900 dark:text-white flex items-center justify-between hover:border-gray-300 dark:hover:border-white/20 transition-colors cursor-pointer"
                  >
                    <span className="font-medium">
                      {ruleFormData.askForFollowMessageType || "Template Tombol"}
                    </span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-gray-400 transition-transform ${
                        openDropdown === "askFollowMsgType" ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {openDropdown === "askFollowMsgType" && (
                    <div
                      onMouseDown={(e) => e.stopPropagation()}
                      className="absolute left-0 right-0 mt-1.5 bg-white dark:bg-[#1f1f23] border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150"
                    >
                      {(["Template Tombol", "Teks Biasa"] as const).map(
                        (typeOpt) => {
                          const isSelected =
                            (ruleFormData.askForFollowMessageType ||
                              "Template Tombol") === typeOpt;
                          return (
                            <button
                              key={typeOpt}
                              type="button"
                              onMouseDown={(e) => e.stopPropagation()}
                              onClick={(e) => {
                                e.stopPropagation();
                                setRuleFormData({
                                  ...ruleFormData,
                                  askForFollowMessageType: typeOpt,
                                });
                                setOpenDropdown(null);
                              }}
                              className={`w-full px-4 py-2 text-left text-xs sm:text-sm font-medium flex items-center justify-between transition-colors cursor-pointer ${
                                isSelected
                                  ? "bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white font-semibold"
                                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"
                              }`}
                            >
                              <span>{typeOpt}</span>
                              {isSelected && (
                                <Check className="w-3.5 h-3.5 text-gray-900 dark:text-white stroke-[2.5]" />
                              )}
                            </button>
                          );
                        }
                      )}
                    </div>
                  )}
                </div>

                {/* Pesan Utama */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
                    Pesan
                  </label>
                  <div className="relative">
                    <textarea
                      rows={4}
                      maxLength={
                        ruleFormData.askForFollowMessageType ===
                        "Template Tombol"
                          ? 640
                          : 1000
                      }
                      value={ruleFormData.askForFollowMessage}
                      onChange={(e) =>
                        setRuleFormData({
                          ...ruleFormData,
                          askForFollowMessage: e.target.value,
                        })
                      }
                      placeholder="Tulis pesan ajakan follow..."
                      className="w-full px-3.5 py-2.5 pb-6 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#18181b] text-xs text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 leading-relaxed font-normal resize-none"
                    />
                    <div className="absolute right-2.5 bottom-2 text-[10px] text-gray-400 font-mono">
                      {ruleFormData.askForFollowMessage.length}/
                      {ruleFormData.askForFollowMessageType ===
                      "Template Tombol"
                        ? 640
                        : 1000}
                    </div>
                  </div>
                </div>

                {/* Label Tombol (Hanya untuk Template Tombol) */}
                {ruleFormData.askForFollowMessageType === "Template Tombol" && (
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
                      Label Tombol
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        maxLength={80}
                        value={ruleFormData.askForFollowButtonLabel}
                        onChange={(e) =>
                          setRuleFormData({
                            ...ruleFormData,
                            askForFollowButtonLabel: e.target.value,
                          })
                        }
                        placeholder="Udah follow 🙌"
                        className="w-full px-3.5 py-2 pr-12 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#18181b] text-xs text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                      />
                      <div className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 font-mono">
                        {ruleFormData.askForFollowButtonLabel.length}/80
                      </div>
                    </div>
                  </div>
                )}

                {/* Masih belum mengikuti? (+ Tambah Pesan / Pesan ke-2) */}
                {ruleFormData.askForFollowHasRetry ? (
                  <div className="pt-2 border-t border-gray-100 dark:border-white/5 space-y-3 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
                        Pesan
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          setRuleFormData({
                            ...ruleFormData,
                            askForFollowHasRetry: false,
                          })
                        }
                        className="p-1 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                        title="Hapus pesan pengingat"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="relative">
                      <textarea
                        rows={4}
                        maxLength={
                          ruleFormData.askForFollowMessageType ===
                          "Template Tombol"
                            ? 640
                            : 1000
                        }
                        value={ruleFormData.askForFollowRetryMessage}
                        onChange={(e) =>
                          setRuleFormData({
                            ...ruleFormData,
                            askForFollowRetryMessage: e.target.value,
                          })
                        }
                        placeholder="Ih kayaknya masih belum follow beneran nih 😅..."
                        className="w-full px-3.5 py-2.5 pb-6 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#18181b] text-xs text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 leading-relaxed font-normal resize-none"
                      />
                      <div className="absolute right-2.5 bottom-2 text-[10px] text-gray-400 font-mono">
                        {ruleFormData.askForFollowRetryMessage.length}/
                        {ruleFormData.askForFollowMessageType ===
                        "Template Tombol"
                          ? 640
                          : 1000}
                      </div>
                    </div>

                    {ruleFormData.askForFollowMessageType ===
                      "Template Tombol" && (
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
                          Label Tombol
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            maxLength={80}
                            value={ruleFormData.askForFollowRetryButtonLabel}
                            onChange={(e) =>
                              setRuleFormData({
                                ...ruleFormData,
                                askForFollowRetryButtonLabel: e.target.value,
                              })
                            }
                            placeholder="Udah follow 🙌"
                            className="w-full px-3.5 py-2 pr-12 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#18181b] text-xs text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                          />
                          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 font-mono">
                            {ruleFormData.askForFollowRetryButtonLabel.length}/80
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="pt-2 space-y-2">
                    <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
                      Masih belum mengikuti?
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setRuleFormData({
                          ...ruleFormData,
                          askForFollowHasRetry: true,
                        })
                      }
                      className="w-full py-2.5 px-3 rounded-xl border border-dashed border-gray-300 dark:border-white/20 hover:border-gray-400 dark:hover:border-white/30 text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tambah Pesan</span>
                    </button>
                  </div>
                )}
              </div>
            )}
        </div>

        {/* 5. Ask for Contact */}
        <div
          onClick={() => {
            if (ruleFormData.featureAskForContact) {
              setActivePreviewTab("DM");
            }
          }}
          className="p-3.5 rounded-xl border border-gray-200/80 dark:border-white/10 bg-white dark:bg-[#18181b] space-y-3"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-gray-900 dark:text-white">
                Ask for Contact
              </span>
              <p className="text-[11px] text-gray-500">
                Kumpulkan email atau nomor WhatsApp sebelum mengirim konten
              </p>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                const nextVal = !ruleFormData.featureAskForContact;
                setRuleFormData({
                  ...ruleFormData,
                  featureAskForContact: nextVal,
                });
                if (nextVal) {
                  setActivePreviewTab("DM");
                }
              }}
              className={`w-10 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                ruleFormData.featureAskForContact
                  ? "bg-gray-900 dark:bg-white"
                  : "bg-gray-200 dark:bg-white/15"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white dark:bg-black shadow-sm transition-transform ${
                  ruleFormData.featureAskForContact
                    ? "translate-x-4"
                    : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {ruleFormData.featureAskForContact && (
            <div className="pt-2 border-t border-gray-100 dark:border-white/5 space-y-3.5 animate-in fade-in duration-150">
              {/* Data yang Diminta */}
              <div className="space-y-1.5 relative">
                <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
                  Data yang Diminta
                </label>
                <button
                  type="button"
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleDropdown("askContactType");
                  }}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#18181b] text-xs sm:text-sm text-gray-900 dark:text-white flex items-center justify-between hover:border-gray-300 dark:hover:border-white/20 transition-colors cursor-pointer"
                >
                  <span className="font-medium">
                    {ruleFormData.askContactType || "Email Saja"}
                  </span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-gray-400 transition-transform ${
                      openDropdown === "askContactType" ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {openDropdown === "askContactType" && (
                  <div
                    onMouseDown={(e) => e.stopPropagation()}
                    className="absolute left-0 right-0 mt-1.5 bg-white dark:bg-[#1f1f23] border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150"
                  >
                    {(
                      [
                        "Email Saja",
                        "Nomor WhatsApp Saja",
                        "Email & WhatsApp",
                      ] as const
                    ).map((typeOpt) => {
                      const isSelected =
                        (ruleFormData.askContactType || "Email Saja") ===
                        typeOpt;
                      return (
                        <button
                          key={typeOpt}
                          type="button"
                          onMouseDown={(e) => e.stopPropagation()}
                          onClick={(e) => {
                            e.stopPropagation();
                            setRuleFormData({
                              ...ruleFormData,
                              askContactType: typeOpt,
                              askContactMessage:
                                typeOpt === "Nomor WhatsApp Saja"
                                  ? "Sip! Biar aksesnya langsung terkirim ke WhatsApp kamu, boleh ketik nomor WhatsApp aktif kamu di bawah ini ya 👇"
                                  : "Sip! Biar aksesnya langsung terkirim dan tersimpan aman di inbox kamu, boleh ketik Email aktif kamu di bawah ini ya 👇",
                            });
                            setOpenDropdown(null);
                          }}
                          className={`w-full px-4 py-2 text-left text-xs sm:text-sm font-medium flex items-center justify-between transition-colors cursor-pointer ${
                            isSelected
                              ? "bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white font-semibold"
                              : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"
                          }`}
                        >
                          <span>{typeOpt}</span>
                          {isSelected && (
                            <Check className="w-3.5 h-3.5 text-gray-900 dark:text-white stroke-[2.5]" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Pesan Permintaan Kontak */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
                  Pesan Permintaan Kontak
                </label>
                <div className="relative">
                  <textarea
                    rows={3}
                    maxLength={640}
                    value={ruleFormData.askContactMessage}
                    onChange={(e) =>
                      setRuleFormData({
                        ...ruleFormData,
                        askContactMessage: e.target.value,
                      })
                    }
                    placeholder="Ketik pesan permintaan kontak..."
                    className="w-full px-3.5 py-2.5 pb-6 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#18181b] text-xs text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 leading-relaxed font-normal resize-none"
                  />
                  <div className="absolute right-2.5 bottom-2 text-[10px] text-gray-400 font-mono">
                    {ruleFormData.askContactMessage.length}/640
                  </div>
                </div>
              </div>

              {/* Pesan Jika Format Salah */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
                  Pesan Jika Format Salah
                </label>
                <div className="relative">
                  <textarea
                    rows={3}
                    maxLength={640}
                    value={ruleFormData.askContactInvalidMessage}
                    onChange={(e) =>
                      setRuleFormData({
                        ...ruleFormData,
                        askContactInvalidMessage: e.target.value,
                      })
                    }
                    placeholder="Ketik pesan perbaikan format..."
                    className="w-full px-3.5 py-2.5 pb-6 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#18181b] text-xs text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 leading-relaxed font-normal resize-none"
                  />
                  <div className="absolute right-2.5 bottom-2 text-[10px] text-gray-400 font-mono">
                    {ruleFormData.askContactInvalidMessage.length}/640
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 6. Aktifkan Link Tracking */}
        <div className="p-3.5 rounded-xl border border-gray-200/80 dark:border-white/10 bg-white dark:bg-[#18181b] flex items-center justify-between gap-3">
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-gray-900 dark:text-white">
              Aktifkan Link Tracking
            </span>
            <p className="text-[11px] text-gray-500">Untuk statistik</p>
            <p className="text-[10px] text-gray-400">
              Hanya untuk jenis pesan Tombol atau Carousel
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              setRuleFormData({
                ...ruleFormData,
                featureLinkTracking: !ruleFormData.featureLinkTracking,
              })
            }
            className={`w-10 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
              ruleFormData.featureLinkTracking
                ? "bg-gray-900 dark:bg-white"
                : "bg-gray-200 dark:bg-white/15"
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white dark:bg-black shadow-sm transition-transform ${
                ruleFormData.featureLinkTracking
                  ? "translate-x-4"
                  : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
