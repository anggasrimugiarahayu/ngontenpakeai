"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  ChevronDown,
  Check,
  HelpCircle,
  Plus,
  Trash2,
  X,
  Image as ImageIcon,
} from "lucide-react";
import { SpintaxAntiSpamTips } from "./SpintaxAntiSpamTips";

export type MessageTypeOption = "BUTTON_TEMPLATE" | "PLAIN_TEXT" | "CAROUSEL";

export interface MessageButtonItem {
  id: string;
  labelType: "Klik Disini" | "Kustom";
  label: string;
  action: "Buka Website" | "Kirim Teks" | "";
  url: string;
  text?: string;
}

export interface MessageQuickReplyItem {
  id: string;
  label?: string;
  text: string;
}

export interface MessageCarouselSlideItem {
  id: string;
  image: string;
  title: string;
  subtitle: string;
  buttons: {
    id: string;
    labelType: "Klik Disini" | "Kustom";
    label: string;
    action: "Buka Website" | "Kirim Teks" | "";
    url: string;
    text?: string;
  }[];
}

export interface MessagePayloadValue {
  messageType: MessageTypeOption;
  message: string;
  buttons: MessageButtonItem[];
  quickReplies: MessageQuickReplyItem[];
  carouselSlides: MessageCarouselSlideItem[];
}

interface MessagePayloadBuilderProps {
  value: MessagePayloadValue;
  onChange: (next: MessagePayloadValue) => void;
  onFocusPreviewDm?: () => void;
  onSelectSimulatedButton?: (btnId: string) => void;
  onSelectSimulatedQr?: (qrId: string) => void;
  defaultSlideImage?: string;
  requiredMark?: boolean;
}

export function MessagePayloadBuilder({
  value,
  onChange,
  onFocusPreviewDm,
  onSelectSimulatedButton,
  onSelectSimulatedQr,
  defaultSlideImage = "",
  requiredMark = false,
}: MessagePayloadBuilderProps) {
  const [isMsgTypeOpen, setIsMsgTypeOpen] = useState(false);
  const [openButtonDropdown, setOpenButtonDropdown] = useState<{
    id: string;
    type: "label" | "action";
  } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideMouseDown = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsMsgTypeOpen(false);
        setOpenButtonDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleOutsideMouseDown);
    return () => document.removeEventListener("mousedown", handleOutsideMouseDown);
  }, []);

  const currentMessageType: MessageTypeOption =
    value.messageType === "PLAIN_TEXT" ||
    value.messageType === "CAROUSEL" ||
    value.messageType === "BUTTON_TEMPLATE"
      ? value.messageType
      : "BUTTON_TEMPLATE";

  const handleSelectMessageType = (nextType: MessageTypeOption) => {
    const ensuredButtons: MessageButtonItem[] =
      Array.isArray(value.buttons) && value.buttons.length > 0
        ? value.buttons
        : [
            {
              id: `btn_${Date.now()}`,
              labelType: "Kustom",
              label: "Button 1",
              action: "Buka Website",
              url: "https://ruangcreativemuslim.com",
              text: "Terima kasih sudah tertarik! Ini info detail balasan dari kami.",
            },
          ];

    const ensuredSlides: MessageCarouselSlideItem[] =
      Array.isArray(value.carouselSlides) && value.carouselSlides.length > 0
        ? value.carouselSlides
        : [
            {
              id: `slide_${Date.now()}`,
              image: defaultSlideImage || "",
              title: "Panduan Lengkap Ngonten",
              subtitle: "Pelajari cara mudah buat konten viral",
              buttons: [
                {
                  id: `slide_btn_${Date.now()}`,
                  labelType: "Kustom",
                  label: "Button 1",
                  action: "Buka Website",
                  url: "https://ruangcreativemuslim.com",
                },
              ],
            },
          ];

    onChange({
      ...value,
      messageType: nextType,
      buttons: ensuredButtons,
      carouselSlides: ensuredSlides,
      quickReplies: Array.isArray(value.quickReplies) ? value.quickReplies : [],
    });
    setIsMsgTypeOpen(false);
    onFocusPreviewDm?.();
  };

  return (
    <div
      ref={containerRef}
      onClick={() => onFocusPreviewDm?.()}
      className="space-y-4"
    >
      {/* 1. Dropdown Jenis Pesan */}
      <div className="space-y-1.5 relative">
        <div className="flex items-center gap-1.5">
          <label className="text-xs font-bold text-gray-800 dark:text-gray-200">
            Jenis Pesan {requiredMark && <span className="text-rose-500">*</span>}
          </label>
          <div className="group relative cursor-pointer">
            <HelpCircle className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" />
            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1 hidden group-hover:block w-56 p-2 bg-gray-900 text-white text-[10px] rounded-lg shadow-xl z-50 text-center pointer-events-none">
              Pilih format pesan balasan DM: Template Tombol, Teks Biasa, atau Carousel.
            </div>
          </div>
        </div>

        <button
          type="button"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            setIsMsgTypeOpen((prev) => !prev);
            setOpenButtonDropdown(null);
          }}
          className={`w-full px-3.5 py-2.5 rounded-xl border bg-white dark:bg-[#141B31] text-xs sm:text-sm text-gray-900 dark:text-white flex items-center justify-between transition-all cursor-pointer ${
            isMsgTypeOpen
              ? "border-orange-500 ring-2 ring-orange-500/20"
              : "border-gray-200 dark:border-[#2C3246] hover:border-gray-300 dark:hover:border-white/20"
          }`}
        >
          <span className="font-medium">
            {currentMessageType === "BUTTON_TEMPLATE"
              ? "Template Tombol"
              : currentMessageType === "PLAIN_TEXT"
              ? "Teks Biasa"
              : "Carousel"}
          </span>
          <ChevronDown
            className={`w-4 h-4 text-gray-400 transition-transform ${
              isMsgTypeOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {isMsgTypeOpen && (
          <div
            onMouseDown={(e) => e.stopPropagation()}
            className="absolute left-0 right-0 mt-1.5 bg-white dark:bg-[#141B31] border border-gray-200 dark:border-[#2C3246] rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
          >
            {(
              [
                { value: "BUTTON_TEMPLATE", label: "Template Tombol" },
                { value: "PLAIN_TEXT", label: "Teks Biasa" },
                { value: "CAROUSEL", label: "Carousel" },
              ] as const
            ).map((opt) => {
              const isSelected = currentMessageType === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectMessageType(opt.value);
                  }}
                  className={`w-full px-4 py-2.5 text-left text-xs sm:text-sm font-medium flex items-center justify-between transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 font-bold"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"
                  }`}
                >
                  <span>{opt.label}</span>
                  {isSelected && (
                    <Check className="w-4 h-4 text-orange-600 dark:text-orange-400 stroke-[2.5]" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. Isi Pesan (Untuk Template Tombol & Teks Biasa) */}
      {currentMessageType !== "CAROUSEL" && (
        <div className="space-y-1.5">
          <SpintaxAntiSpamTips context="dm" className="mb-2" />
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
              Pesan {requiredMark && <span className="text-rose-500">*</span>}
            </label>
          </div>
          <div className="relative">
            <textarea
              rows={4}
              maxLength={currentMessageType === "BUTTON_TEMPLATE" ? 640 : 1000}
              value={value.message}
              onChange={(e) =>
                onChange({
                  ...value,
                  message: e.target.value,
                })
              }
              placeholder="Halo {first_name}! Terima kasih sudah tertarik. Ini link yang kamu minta..."
              className="w-full px-3.5 py-2.5 pb-6 rounded-xl border border-gray-200 dark:border-[#2C3246] bg-white dark:bg-[#141B31] text-xs sm:text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium leading-relaxed resize-none"
            />
            <div className="absolute right-3 bottom-2 text-[11px] text-gray-400 font-mono">
              {(value.message || "").length}/
              {currentMessageType === "BUTTON_TEMPLATE" ? 640 : 1000}
            </div>
          </div>

          {/* Variabel Buttons */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none flex-nowrap py-1">
            <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 shrink-0">
              Variabel:
            </span>
            {[
              { label: "Nama Depan", token: "{first_name}" },
              { label: "Nama Belakang", token: "{last_name}" },
              { label: "Nama Lengkap", token: "{full_name}" },
              { label: "Nama Pengguna", token: "{username}" },
            ].map((v) => (
              <button
                key={v.token}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  const curMsg = value.message || "";
                  onChange({
                    ...value,
                    message: curMsg ? `${curMsg} ${v.token} ` : `${v.token} `,
                  });
                }}
                className="px-2.5 py-1 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-xs font-medium text-gray-700 dark:text-gray-300 transition-colors cursor-pointer shrink-0 whitespace-nowrap"
              >
                {v.label}
              </button>
            ))}
          </div>

          {!(value.message || "").trim() && (
            <p className="text-[11px] text-rose-500 font-medium">
              Silakan masukkan pesan
            </p>
          )}
        </div>
      )}

      {/* 3A. Quick Replies (Khusus Teks Biasa / PLAIN_TEXT) */}
      {currentMessageType === "PLAIN_TEXT" && (
        <div className="space-y-2.5 pt-1">
          <div className="flex items-center gap-1.5">
            <label className="text-xs font-bold text-gray-800 dark:text-gray-200">
              Quick Replies
            </label>
            <div className="group relative cursor-pointer">
              <HelpCircle className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" />
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1 hidden group-hover:block w-56 p-2 bg-gray-900 text-white text-[10px] rounded-lg shadow-xl z-50 text-center pointer-events-none">
                Pilihan balasan cepat (chip) yang bisa langsung diklik penerima di ruang chat DM beserta balasan otomatisnya.
              </div>
            </div>
          </div>

          {Array.isArray(value.quickReplies) && value.quickReplies.length > 0 && (
            <div className="space-y-3">
              {value.quickReplies.map((qr, qIdx) => {
                const qrLabel = qr.label ?? qr.text ?? "";
                const qrReplyText = qr.label !== undefined ? qr.text : "";
                return (
                  <div
                    key={qr.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectSimulatedQr?.(qr.id);
                      onFocusPreviewDm?.();
                    }}
                    className="p-3.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50/40 dark:bg-white/[0.02] space-y-3 transition-colors"
                  >
                    {/* Header Quick Reply N + Trash */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-900 dark:text-white">
                        Quick Reply {qIdx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onChange({
                            ...value,
                            quickReplies: value.quickReplies.filter(
                              (item) => item.id !== qr.id
                            ),
                          });
                        }}
                        className="w-6 h-6 rounded-md flex items-center justify-center text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title="Hapus Quick Reply"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Label Quick Reply */}
                    <div className="space-y-1">
                      <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300">
                        Label
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          maxLength={80}
                          value={qrLabel}
                          onChange={(e) => {
                            const nextQr = [...value.quickReplies];
                            nextQr[qIdx] = {
                              ...nextQr[qIdx],
                              label: e.target.value,
                              text:
                                nextQr[qIdx].label !== undefined
                                  ? nextQr[qIdx].text
                                  : "",
                            };
                            onChange({ ...value, quickReplies: nextQr });
                            onSelectSimulatedQr?.(qr.id);
                          }}
                          placeholder={`Quick Reply ${qIdx + 1}`}
                          className="w-full px-3 py-2 pr-12 rounded-xl border border-gray-200 dark:border-[#2C3246] bg-white dark:bg-[#141B31] text-xs text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 font-mono">
                          {qrLabel.length}/80
                        </span>
                      </div>
                      {!qrLabel.trim() && (
                        <p className="text-[10px] text-rose-500 font-medium">
                          Silakan masukkan label
                        </p>
                      )}
                    </div>

                    {/* Teks Balasan Saat Quick Reply Diklik */}
                    <div className="space-y-1">
                      <SpintaxAntiSpamTips
                        context="dm"
                        className="mb-1"
                        customExample="{Terima kasih sudah memilih opsi ini!|Siap kak, langsung kami proses ya!} ✨"
                      />
                      <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300">
                        Teks
                      </label>
                      <div className="relative">
                        <textarea
                          rows={3}
                          maxLength={1000}
                          value={qrReplyText}
                          onChange={(e) => {
                            const nextQr = [...value.quickReplies];
                            nextQr[qIdx] = {
                              ...nextQr[qIdx],
                              label: nextQr[qIdx].label ?? nextQr[qIdx].text ?? "",
                              text: e.target.value,
                            };
                            onChange({ ...value, quickReplies: nextQr });
                            onSelectSimulatedQr?.(qr.id);
                          }}
                          placeholder="Masukkan teks balasan saat quick reply diklik"
                          className="w-full px-3 py-2 pb-5 rounded-xl border border-gray-200 dark:border-[#2C3246] bg-white dark:bg-[#141B31] text-xs text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium leading-relaxed resize-none"
                        />
                        <span className="absolute right-3 bottom-1.5 text-[10px] text-gray-400 font-mono">
                          {qrReplyText.length}/1000
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {(value.quickReplies || []).length < 5 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                const newQrId = `qr_${Date.now()}`;
                onChange({
                  ...value,
                  quickReplies: [
                    ...(value.quickReplies || []),
                    { id: newQrId, label: "", text: "" },
                  ],
                });
                onSelectSimulatedQr?.(newQrId);
              }}
              className="w-full py-2.5 rounded-xl border border-dashed border-gray-300 dark:border-white/20 hover:border-gray-400 dark:hover:border-white/30 text-xs font-bold text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Quick Reply</span>
            </button>
          )}
        </div>
      )}

      {/* 3B. Tombol (Khusus Template Tombol / BUTTON_TEMPLATE) */}
      {currentMessageType === "BUTTON_TEMPLATE" && (
        <div className="space-y-3 pt-1">
          <div className="flex items-center gap-1.5">
            <label className="text-xs font-bold text-gray-800 dark:text-gray-200">
              Tombol
            </label>
            <div className="group relative cursor-pointer">
              <HelpCircle className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" />
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1 hidden group-hover:block w-52 p-2 bg-gray-900 text-white text-[10px] rounded-lg shadow-xl z-50 text-center pointer-events-none">
                Maksimal 3 tombol CTA di bawah pesan DM.
              </div>
            </div>
          </div>

          {(value.buttons || []).map((btn, bIdx) => (
            <div
              key={btn.id}
              onClick={(e) => {
                e.stopPropagation();
                onSelectSimulatedButton?.(btn.id);
                onFocusPreviewDm?.();
              }}
              className="p-3.5 rounded-xl border border-gray-200 dark:border-[#2C3246] bg-white dark:bg-[#141B31] space-y-3 relative shadow-2xs"
            >
              <div className="flex items-center justify-between">
                <h5 className="text-xs font-bold text-gray-900 dark:text-white">
                  Tombol {bIdx + 1}
                </h5>
                {value.buttons.length > 1 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onChange({
                        ...value,
                        buttons: value.buttons.filter((b) => b.id !== btn.id),
                      });
                    }}
                    className="w-6 h-6 rounded-md flex items-center justify-center text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors cursor-pointer"
                    title="Hapus Tombol"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Pilih Label Tombol */}
              <div className="relative space-y-1">
                <label className="text-[11px] font-semibold text-gray-600 dark:text-gray-400 block">
                  Pilih Label Tombol
                </label>
                <button
                  type="button"
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (
                      openButtonDropdown?.id === btn.id &&
                      openButtonDropdown?.type === "label"
                    ) {
                      setOpenButtonDropdown(null);
                    } else {
                      setOpenButtonDropdown({ id: btn.id, type: "label" });
                    }
                  }}
                  className={`w-full px-3.5 py-2 rounded-xl border bg-white dark:bg-[#141B31] text-xs text-gray-900 dark:text-white flex items-center justify-between transition-all cursor-pointer ${
                    openButtonDropdown?.id === btn.id && openButtonDropdown?.type === "label"
                      ? "border-orange-500 ring-2 ring-orange-500/20"
                      : "border-gray-200 dark:border-[#2C3246] hover:border-gray-300 dark:hover:border-white/20"
                  }`}
                >
                  <span className="font-medium">{btn.labelType || "Kustom"}</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-gray-400 transition-transform ${
                      openButtonDropdown?.id === btn.id &&
                      openButtonDropdown?.type === "label"
                        ? "rotate-180"
                        : ""
                    }`}
                  />
                </button>

                {openButtonDropdown?.id === btn.id &&
                  openButtonDropdown?.type === "label" && (
                    <div
                      onMouseDown={(e) => e.stopPropagation()}
                      className="absolute left-0 right-0 mt-1.5 bg-white dark:bg-[#141B31] border border-gray-200 dark:border-[#2C3246] rounded-2xl shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150"
                    >
                      {(["Klik Disini", "Kustom"] as const).map((labelOpt) => {
                        const isSelected =
                          (btn.labelType || "Kustom") === labelOpt;
                        return (
                          <button
                            key={labelOpt}
                            type="button"
                            onMouseDown={(e) => e.stopPropagation()}
                            onClick={(e) => {
                              e.stopPropagation();
                              const nextBtns = [...value.buttons];
                              nextBtns[bIdx] = {
                                ...nextBtns[bIdx],
                                labelType: labelOpt,
                                label:
                                  labelOpt === "Klik Disini"
                                    ? "Klik Disini"
                                    : nextBtns[bIdx].label === "Klik Disini"
                                    ? `Button ${bIdx + 1}`
                                    : nextBtns[bIdx].label,
                              };
                              onChange({ ...value, buttons: nextBtns });
                              setOpenButtonDropdown(null);
                            }}
                            className={`w-full px-3.5 py-2 text-left text-xs font-medium flex items-center justify-between transition-colors cursor-pointer ${
                              isSelected
                                ? "bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 font-bold"
                                : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"
                            }`}
                          >
                            <span>{labelOpt}</span>
                            {isSelected && (
                              <Check className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400 stroke-[2.5]" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
              </div>

              {/* Label Tombol (jika Kustom) */}
              {(btn.labelType || "Kustom") === "Kustom" && (
                <div className="space-y-1 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-semibold text-gray-600 dark:text-gray-400">
                      Label Tombol
                    </label>
                    <span className="text-[10px] text-gray-400 font-mono">
                      {(btn.label || "").length}/80
                    </span>
                  </div>
                  <input
                    type="text"
                    maxLength={80}
                    value={btn.label}
                    onChange={(e) => {
                      const nextBtns = [...value.buttons];
                      nextBtns[bIdx] = {
                        ...nextBtns[bIdx],
                        label: e.target.value,
                      };
                      onChange({ ...value, buttons: nextBtns });
                    }}
                    placeholder={`Button ${bIdx + 1}`}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#202024] text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                  />
                  {!(btn.label || "").trim() && (
                    <p className="text-[10px] text-rose-500 font-medium">
                      Silakan masukkan label
                    </p>
                  )}
                </div>
              )}

              {/* Pilih Tindakan */}
              <div className="relative space-y-1">
                <label className="text-[11px] font-semibold text-gray-600 dark:text-gray-400 block">
                  Pilih Tindakan
                </label>
                <button
                  type="button"
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (
                      openButtonDropdown?.id === btn.id &&
                      openButtonDropdown?.type === "action"
                    ) {
                      setOpenButtonDropdown(null);
                    } else {
                      setOpenButtonDropdown({ id: btn.id, type: "action" });
                    }
                  }}
                  className={`w-full px-3.5 py-2 rounded-xl border bg-white dark:bg-[#141B31] text-xs text-gray-900 dark:text-white flex items-center justify-between transition-all cursor-pointer ${
                    openButtonDropdown?.id === btn.id && openButtonDropdown?.type === "action"
                      ? "border-orange-500 ring-2 ring-orange-500/20"
                      : "border-gray-200 dark:border-[#2C3246] hover:border-gray-300 dark:hover:border-white/20"
                  }`}
                >
                  <span
                    className={`font-medium ${!btn.action ? "text-gray-400" : ""}`}
                  >
                    {btn.action || "Pilih tindakan"}
                  </span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-gray-400 transition-transform ${
                      openButtonDropdown?.id === btn.id &&
                      openButtonDropdown?.type === "action"
                        ? "rotate-180"
                        : ""
                    }`}
                  />
                </button>

                {openButtonDropdown?.id === btn.id &&
                  openButtonDropdown?.type === "action" && (
                    <div
                      onMouseDown={(e) => e.stopPropagation()}
                      className="absolute left-0 right-0 mt-1.5 bg-white dark:bg-[#141B31] border border-gray-200 dark:border-[#2C3246] rounded-2xl shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150"
                    >
                      {(
                        [
                          { value: "Buka Website", label: "Buka Website" },
                          { value: "Kirim Teks", label: "Kirim Teks" },
                        ] as const
                      ).map((actionOpt) => {
                        const isSelected = btn.action === actionOpt.value;
                        return (
                          <button
                            key={actionOpt.value}
                            type="button"
                            onMouseDown={(e) => e.stopPropagation()}
                            onClick={(e) => {
                              e.stopPropagation();
                              const nextBtns = [...value.buttons];
                              nextBtns[bIdx] = {
                                ...nextBtns[bIdx],
                                action: actionOpt.value,
                              };
                              onChange({ ...value, buttons: nextBtns });
                              setOpenButtonDropdown(null);
                              onSelectSimulatedButton?.(btn.id);
                            }}
                            className={`w-full px-3.5 py-2 text-left text-xs font-medium flex items-center justify-between transition-colors cursor-pointer ${
                              isSelected
                                ? "bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 font-bold"
                                : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"
                            }`}
                          >
                            <span>{actionOpt.label}</span>
                            {isSelected && (
                              <Check className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400 stroke-[2.5]" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                {!btn.action && (
                  <p className="text-[10px] text-rose-500 font-medium">
                    Silakan pilih tindakan
                  </p>
                )}
              </div>

              {/* Masukkan URL (jika Buka Website) */}
              {btn.action === "Buka Website" && (
                <div className="space-y-1 animate-in fade-in duration-150">
                  <label className="text-[11px] font-semibold text-gray-600 dark:text-gray-400 block">
                    Masukkan URL
                  </label>
                  <input
                    type="text"
                    value={btn.url}
                    onChange={(e) => {
                      const nextBtns = [...value.buttons];
                      nextBtns[bIdx] = {
                        ...nextBtns[bIdx],
                        url: e.target.value,
                      };
                      onChange({ ...value, buttons: nextBtns });
                    }}
                    placeholder="https://ruangcreativemuslim.com"
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#202024] text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono"
                  />
                  {!(btn.url || "").trim() && (
                    <p className="text-[10px] text-rose-500 font-medium">
                      Silakan masukkan URL
                    </p>
                  )}
                </div>
              )}

              {/* Masukkan Teks (jika Kirim Teks) */}
              {btn.action === "Kirim Teks" && (
                <div className="space-y-1 animate-in fade-in duration-150">
                  <SpintaxAntiSpamTips
                    context="dm"
                    className="mb-1"
                    customExample="{Siap kak, ini info tambahannya ya!|Baik kak, silakan disimak ya!} 🙌"
                  />
                  <label className="text-[11px] font-semibold text-gray-600 dark:text-gray-400 block">
                    Masukkan Teks
                  </label>
                  <div className="relative">
                    <textarea
                      rows={3}
                      maxLength={1000}
                      value={btn.text ?? ""}
                      onChange={(e) => {
                        const nextBtns = [...value.buttons];
                        nextBtns[bIdx] = {
                          ...nextBtns[bIdx],
                          text: e.target.value,
                        };
                        onChange({ ...value, buttons: nextBtns });
                        onSelectSimulatedButton?.(btn.id);
                      }}
                      placeholder="Masukkan teks balasan saat tombol diklik"
                      className="w-full px-3 py-2 pb-6 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#202024] text-xs text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium leading-relaxed resize-none"
                    />
                    <div className="absolute right-2.5 bottom-1.5 text-[10px] text-gray-400 font-mono">
                      {(btn.text ?? "").length}/1000
                    </div>
                  </div>
                  {!(btn.text ?? "").trim() && (
                    <p className="text-[10px] text-rose-500 font-medium">
                      Silakan masukkan teks
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}

          {(value.buttons || []).length < 3 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                const newBtnId = `btn_${Date.now()}`;
                onChange({
                  ...value,
                  buttons: [
                    ...(value.buttons || []),
                    {
                      id: newBtnId,
                      labelType: "Kustom",
                      label: `Button ${(value.buttons || []).length + 1}`,
                      action: "Buka Website",
                      url: "https://ruangcreativemuslim.com",
                      text: "Terima kasih sudah tertarik! Ini info detail balasan dari kami.",
                    },
                  ],
                });
                onSelectSimulatedButton?.(newBtnId);
              }}
              className="w-full py-2.5 rounded-xl border border-dashed border-gray-300 dark:border-white/20 hover:border-gray-400 dark:hover:border-white/30 text-xs font-bold text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Tombol Lagi</span>
            </button>
          )}
        </div>
      )}

      {/* 3C. Slide Carousel (Khusus Carousel / CAROUSEL) */}
      {currentMessageType === "CAROUSEL" && (
        <div className="space-y-4 pt-1">
          <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
            Slide Carousel
          </label>

          {(value.carouselSlides || []).map((slide, slideIdx) => (
            <div
              key={slide.id}
              className="p-4 rounded-xl border border-gray-200 dark:border-[#2C3246] bg-white dark:bg-[#141B31] space-y-3.5 relative shadow-xs"
            >
              <div className="flex items-center justify-between">
                <h5 className="text-xs font-bold text-gray-900 dark:text-white">
                  Slide {slideIdx + 1}
                </h5>
                {(value.carouselSlides || []).length > 1 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onChange({
                        ...value,
                        carouselSlides: value.carouselSlides.filter(
                          (s) => s.id !== slide.id
                        ),
                      });
                    }}
                    className="w-5 h-5 rounded-md flex items-center justify-center text-gray-400 hover:text-rose-500 cursor-pointer"
                    title="Hapus Slide"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Gambar Box (1:1 Aspect Ratio) */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-gray-600 dark:text-gray-400 block">
                  Gambar (1:1)
                </label>
                <div className="w-full aspect-video sm:aspect-square max-h-36 rounded-xl border-2 border-dashed border-gray-300 dark:border-white/15 bg-gray-50 dark:bg-white/5 flex flex-col items-center justify-center text-center p-3 relative overflow-hidden group">
                  {slide.image ? (
                    <>
                      <img
                        src={slide.image}
                        alt={slide.title || "Slide"}
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            const nextSlides = [...value.carouselSlides];
                            nextSlides[slideIdx] = {
                              ...nextSlides[slideIdx],
                              image: "",
                            };
                            onChange({ ...value, carouselSlides: nextSlides });
                          }}
                          className="px-2.5 py-1 rounded-md bg-rose-600 text-white text-[11px] font-bold cursor-pointer"
                        >
                          Hapus
                        </button>
                      </div>
                    </>
                  ) : (
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        if (defaultSlideImage) {
                          const nextSlides = [...value.carouselSlides];
                          nextSlides[slideIdx] = {
                            ...nextSlides[slideIdx],
                            image: defaultSlideImage,
                          };
                          onChange({ ...value, carouselSlides: nextSlides });
                        }
                      }}
                      className="flex flex-col items-center gap-1.5 cursor-pointer"
                    >
                      <ImageIcon className="w-6 h-6 text-gray-400 group-hover:text-blue-500 transition-colors" />
                      <span className="text-[11px] font-medium text-gray-500 group-hover:text-gray-900 dark:group-hover:text-white">
                        Pilih Gambar dari Postingan (1:1)
                      </span>
                    </div>
                  )}
                </div>
                <input
                  type="text"
                  value={slide.image || ""}
                  onChange={(e) => {
                    const nextSlides = [...value.carouselSlides];
                    nextSlides[slideIdx] = {
                      ...nextSlides[slideIdx],
                      image: e.target.value,
                    };
                    onChange({ ...value, carouselSlides: nextSlides });
                  }}
                  placeholder="Atau tempel URL gambar (https://...)"
                  className="w-full px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#202024] text-[11px] text-gray-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* Judul */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold text-gray-600 dark:text-gray-400">
                    Judul
                  </label>
                  <span className="text-[10px] text-gray-400 font-mono">
                    {(slide.title || "").length}/80
                  </span>
                </div>
                <input
                  type="text"
                  maxLength={80}
                  value={slide.title}
                  onChange={(e) => {
                    const nextSlides = [...value.carouselSlides];
                    nextSlides[slideIdx] = {
                      ...nextSlides[slideIdx],
                      title: e.target.value,
                    };
                    onChange({ ...value, carouselSlides: nextSlides });
                  }}
                  placeholder="Judul Slide"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#202024] text-xs text-gray-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
                {!(slide.title || "").trim() && (
                  <p className="text-[10px] text-rose-500 font-medium">
                    Silakan masukkan judul
                  </p>
                )}
              </div>

              {/* Subjudul */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold text-gray-600 dark:text-gray-400">
                    Subjudul (Opsional)
                  </label>
                  <span className="text-[10px] text-gray-400 font-mono">
                    {(slide.subtitle || "").length}/80
                  </span>
                </div>
                <input
                  type="text"
                  maxLength={80}
                  value={slide.subtitle}
                  onChange={(e) => {
                    const nextSlides = [...value.carouselSlides];
                    nextSlides[slideIdx] = {
                      ...nextSlides[slideIdx],
                      subtitle: e.target.value,
                    };
                    onChange({ ...value, carouselSlides: nextSlides });
                  }}
                  placeholder="Subjudul Slide"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#202024] text-xs text-gray-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* Tombol Slide */}
              <div className="space-y-2 pt-1 border-t border-gray-100 dark:border-white/5">
                <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400">
                  Tombol Slide
                </label>

                {(slide.buttons || []).map((sBtn, sbIdx) => (
                  <div
                    key={sBtn.id}
                    className="p-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50/70 dark:bg-white/[0.02] space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300">
                        Tombol {sbIdx + 1}
                      </span>
                      {slide.buttons.length > 1 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            const nextSlides = [...value.carouselSlides];
                            nextSlides[slideIdx] = {
                              ...nextSlides[slideIdx],
                              buttons: nextSlides[slideIdx].buttons.filter(
                                (b) => b.id !== sBtn.id
                              ),
                            };
                            onChange({ ...value, carouselSlides: nextSlides });
                          }}
                          className="text-gray-400 hover:text-rose-500 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      maxLength={80}
                      value={sBtn.label}
                      onChange={(e) => {
                        const nextSlides = [...value.carouselSlides];
                        const nextBtns = [...nextSlides[slideIdx].buttons];
                        nextBtns[sbIdx] = {
                          ...nextBtns[sbIdx],
                          label: e.target.value,
                        };
                        nextSlides[slideIdx] = {
                          ...nextSlides[slideIdx],
                          buttons: nextBtns,
                        };
                        onChange({ ...value, carouselSlides: nextSlides });
                      }}
                      placeholder="Label Tombol"
                      className="w-full px-2.5 py-1.5 rounded-md border border-gray-200 dark:border-white/10 bg-white dark:bg-[#202024] text-xs text-gray-900 dark:text-white"
                    />
                    <input
                      type="text"
                      value={sBtn.url}
                      onChange={(e) => {
                        const nextSlides = [...value.carouselSlides];
                        const nextBtns = [...nextSlides[slideIdx].buttons];
                        nextBtns[sbIdx] = {
                          ...nextBtns[sbIdx],
                          url: e.target.value,
                        };
                        nextSlides[slideIdx] = {
                          ...nextSlides[slideIdx],
                          buttons: nextBtns,
                        };
                        onChange({ ...value, carouselSlides: nextSlides });
                      }}
                      placeholder="https://ruangcreativemuslim.com"
                      className="w-full px-2.5 py-1.5 rounded-md border border-gray-200 dark:border-white/10 bg-white dark:bg-[#202024] text-xs text-gray-900 dark:text-white font-mono"
                    />
                  </div>
                ))}

                {(slide.buttons || []).length < 3 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      const nextSlides = [...value.carouselSlides];
                      nextSlides[slideIdx] = {
                        ...nextSlides[slideIdx],
                        buttons: [
                          ...(nextSlides[slideIdx].buttons || []),
                          {
                            id: `sbtn_${Date.now()}`,
                            labelType: "Kustom",
                            label: `Button ${(nextSlides[slideIdx].buttons || []).length + 1}`,
                            action: "Buka Website",
                            url: "https://ruangcreativemuslim.com",
                          },
                        ],
                      };
                      onChange({ ...value, carouselSlides: nextSlides });
                    }}
                    className="w-full py-2 rounded-lg border border-dashed border-gray-300 dark:border-white/20 text-[11px] font-bold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Tombol</span>
                  </button>
                )}
              </div>
            </div>
          ))}

          {(value.carouselSlides || []).length < 10 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange({
                  ...value,
                  carouselSlides: [
                    ...(value.carouselSlides || []),
                    {
                      id: `slide_${Date.now()}`,
                      image: defaultSlideImage || "",
                      title: "Slide Baru",
                      subtitle: "",
                      buttons: [
                        {
                          id: `sbtn_${Date.now()}`,
                          labelType: "Kustom",
                          label: "Button 1",
                          action: "Buka Website",
                          url: "https://ruangcreativemuslim.com",
                        },
                      ],
                    },
                  ],
                });
              }}
              className="w-full py-2.5 rounded-xl border border-dashed border-blue-400 dark:border-blue-500/40 hover:border-blue-500 text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Slide</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
