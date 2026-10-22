"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, HelpCircle } from "lucide-react";

export type KeywordRuleOption = "Contains" | "Match" | "Starts with";

interface TriggerKeywordBuilderProps {
  mode: "COMMENT" | "STORY" | "DM";
  triggerCommentType: "KEYWORDS" | "ALL";
  keywords: string;
  keywordRule: KeywordRuleOption;
  onChange: (next: {
    triggerCommentType?: "KEYWORDS" | "ALL";
    keywords?: string;
    keywordRule?: KeywordRuleOption;
  }) => void;
  onFocusSection?: () => void;
}

export function TriggerKeywordBuilder({
  mode,
  triggerCommentType,
  keywords,
  keywordRule,
  onChange,
  onFocusSection,
}: TriggerKeywordBuilderProps) {
  const [isKeywordRuleOpen, setIsKeywordRuleOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideMouseDown = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideMouseDown);
    return () =>
      document.removeEventListener("mousedown", handleOutsideMouseDown);
  }, []);

  const renderRuleDropdown = () => (
    <div className="space-y-1.5" ref={dropdownRef}>
      <div className="flex items-center gap-1.5">
        <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
          Aturan
        </label>
        <div className="group relative inline-flex">
          <HelpCircle className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-help" />
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block w-52 p-2.5 rounded-lg bg-gray-900 text-white text-[10px] leading-relaxed shadow-lg z-50 pointer-events-none">
            Pilih logika pencocokan kata: <strong>Contains</strong> (mengandung
            kata), <strong>Match</strong> (persis sama),{" "}
            <strong>Starts with</strong> (diawali dengan).
          </div>
        </div>
      </div>

      <div className="relative">
        <button
          type="button"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            setIsDropdownOpen((prev) => !prev);
          }}
          className={`w-full px-3.5 py-2.5 rounded-xl border bg-white dark:bg-[#141B31] text-xs sm:text-sm text-gray-900 dark:text-white flex items-center justify-between transition-colors cursor-pointer ${
            isDropdownOpen
              ? "border-orange-500 ring-2 ring-orange-500/20"
              : "border-gray-200 dark:border-[#2C3246] hover:border-gray-300 dark:hover:border-white/20"
          }`}
        >
          <span className="font-medium">{keywordRule || "Contains"}</span>
          <ChevronDown
            className={`w-4 h-4 text-gray-400 transition-transform ${
              isDropdownOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {isDropdownOpen && (
          <div
            onMouseDown={(e) => e.stopPropagation()}
            className="absolute left-0 right-0 mt-1.5 bg-white dark:bg-[#141B31] border border-gray-200 dark:border-[#2C3246] rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
          >
            {(["Contains", "Match", "Starts with"] as const).map((ruleOpt) => {
              const isSelected = (keywordRule || "Contains") === ruleOpt;
              return (
                <button
                  key={ruleOpt}
                  type="button"
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange({ keywordRule: ruleOpt });
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full px-3.5 py-2 text-left text-xs sm:text-sm font-medium flex items-center justify-between transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-orange-500/10 text-orange-600 dark:text-orange-400 font-bold"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"
                  }`}
                >
                  <span>{ruleOpt}</span>
                  {isSelected && (
                    <Check className="w-4 h-4 text-orange-600 dark:text-orange-400 stroke-[2.5]" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  // Mode Khusus Pesan Instagram (DM): Langsung menampilkan kartu Pemicu Pesan (Aturan + Keyword)
  if (mode === "DM") {
    return (
      <div
        onClick={() => onFocusSection?.()}
        className="space-y-3 pt-4 border-t border-gray-200 dark:border-[#2C3246]"
      >
        <div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">
            Pemicu Pesan
          </h3>
          <p className="text-xs text-gray-500">
            Pesan yang akan memicu otomasi
          </p>
        </div>

        <div className="p-4 rounded-xl border border-gray-200/80 dark:border-[#2C3246] bg-gray-50/40 dark:bg-white/[0.02] space-y-3.5">
          {/* 1. Aturan Dropdown */}
          {renderRuleDropdown()}

          {/* 2. Keyword Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
              Keyword
            </label>
            <input
              type="text"
              value={keywords}
              onChange={(e) =>
                onChange({
                  triggerCommentType: "KEYWORDS",
                  keywords: e.target.value,
                })
              }
              placeholder="Masukkan kata"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-[#2C3246] bg-white dark:bg-[#141B31] text-xs sm:text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
            />
            {!keywords.trim() && (
              <p className="text-[11px] text-rose-500 font-medium">
                Silakan masukkan kata
              </p>
            )}
            <p className="text-[11px] text-gray-400">
              Gunakan koma untuk memisahkan beberapa kata
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Mode Post/Reels ("COMMENT") dan Story ("STORY")
  const isStory = mode === "STORY";

  return (
    <div onClick={() => onFocusSection?.()} className="space-y-3 pt-2">
      <div>
        <h3 className="text-sm font-bold text-gray-900 dark:text-white">
          {isStory ? "Pemicu Pesan" : "Trigger Komentar"}
        </h3>
        <p className="text-xs text-gray-500">
          {isStory
            ? "Pesan yang akan memicu otomasi"
            : "Komentar yang akan memicu otomasi"}
        </p>
      </div>

      <div className="space-y-2.5">
        {/* Radio Card 1: Kata tertentu */}
        <div
          onClick={() => onChange({ triggerCommentType: "KEYWORDS" })}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
            triggerCommentType === "KEYWORDS"
              ? "border-blue-500 bg-blue-50/40 dark:bg-blue-500/5 ring-1 ring-blue-500/20"
              : "border-gray-200 dark:border-[#2C3246] bg-white dark:bg-[#141B31] hover:bg-gray-50 dark:hover:bg-white/5"
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                triggerCommentType === "KEYWORDS"
                  ? "border-blue-600 bg-blue-600"
                  : "border-gray-300 dark:border-gray-600 bg-white dark:bg-black"
              }`}
            >
              {triggerCommentType === "KEYWORDS" && (
                <div className="w-1.5 h-1.5 rounded-full bg-white" />
              )}
            </div>
            <span className="text-xs font-semibold text-gray-900 dark:text-white">
              Kata tertentu
            </span>
          </div>

          {triggerCommentType === "KEYWORDS" && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="mt-3 pl-7 space-y-2 animate-in fade-in duration-150"
            >
              {/* Input Keyword */}
              <div className="space-y-1">
                <input
                  type="text"
                  value={keywords}
                  onChange={(e) => onChange({ keywords: e.target.value })}
                  placeholder="Masukkan kata"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-[#2C3246] bg-white dark:bg-[#202024] text-xs text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                />
                {!keywords.trim() && (
                  <p className="text-[11px] text-rose-500 font-medium">
                    Silakan masukkan kata
                  </p>
                )}
                <p className="text-[10px] text-gray-400">
                  Gunakan koma untuk memisahkan beberapa kata
                </p>

                {/* Quick Reaction Emoji Bar untuk Story */}
                {isStory && (
                  <div className="pt-1.5 space-y-1.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {["😂", "😮", "😍", "😢", "👏", "🔥"].map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => {
                            const current = keywords.trim();
                            if (!current) {
                              onChange({ keywords: emoji });
                            } else {
                              const parts = current
                                .split(",")
                                .map((p) => p.trim());
                              if (!parts.includes(emoji)) {
                                onChange({ keywords: `${current}, ${emoji}` });
                              }
                            }
                          }}
                          className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/15 flex items-center justify-center text-base transition-transform hover:scale-110 active:scale-95 cursor-pointer shadow-2xs"
                          title={`Tambahkan emoji ${emoji}`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                    <p className="text-[10px] text-gray-400">
                      Klik emoji di atas untuk reaksi cepat story
                    </p>
                  </div>
                )}
              </div>

              {/* Ubah aturan toggle */}
              <div className="pt-0.5">
                <button
                  type="button"
                  onClick={() => setIsKeywordRuleOpen(!isKeywordRuleOpen)}
                  className="text-xs text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1 hover:underline cursor-pointer"
                >
                  <span>Ubah aturan</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      isKeywordRuleOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isKeywordRuleOpen && (
                  <div className="mt-2 p-3 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200/80 dark:border-[#2C3246] space-y-1.5 animate-in fade-in duration-150">
                    {renderRuleDropdown()}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Radio Card 2: Semua komentar */}
        <div
          onClick={() => onChange({ triggerCommentType: "ALL" })}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
            triggerCommentType === "ALL"
              ? "border-blue-500 bg-blue-50/40 dark:bg-blue-500/5 ring-1 ring-blue-500/20"
              : "border-gray-200 dark:border-[#2C3246] bg-white dark:bg-[#141B31] hover:bg-gray-50 dark:hover:bg-white/5"
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                triggerCommentType === "ALL"
                  ? "border-blue-600 bg-blue-600"
                  : "border-gray-300 dark:border-gray-600 bg-white dark:bg-black"
              }`}
            >
              {triggerCommentType === "ALL" && (
                <div className="w-1.5 h-1.5 rounded-full bg-white" />
              )}
            </div>
            <span className="text-xs font-semibold text-gray-900 dark:text-white">
              Semua komentar
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
