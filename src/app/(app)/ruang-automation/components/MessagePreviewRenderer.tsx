"use client";

import React from "react";
import { Image as ImageIcon } from "lucide-react";
import { MessagePayloadValue } from "./MessagePayloadBuilder";

interface MessagePreviewRendererProps {
  payload: MessagePayloadValue;
  avatarUrl: string;
  defaultSlideImage?: string;
  simulatedButtonId: string | null;
  setSimulatedButtonId: (id: string) => void;
  simulatedQrId: string | null;
  setSimulatedQrId: (id: string) => void;
  resolvePreviewVariables: (text: string) => string;
  defaultFallbackText?: string;
}

export function MessagePreviewRenderer({
  payload,
  avatarUrl,
  defaultSlideImage = "",
  simulatedButtonId,
  setSimulatedButtonId,
  simulatedQrId,
  setSimulatedQrId,
  resolvePreviewVariables,
  defaultFallbackText = "Halo {first_name}! Terima kasih sudah tertarik.",
}: MessagePreviewRendererProps) {
  const activeSimulatedButton =
    payload.buttons?.find((b) => b.id === simulatedButtonId) ||
    payload.buttons?.find((b) => b.action === "Kirim Teks") ||
    (payload.buttons?.[0]?.action === "Kirim Teks" ? payload.buttons[0] : null);

  const activeSimulatedQr =
    payload.quickReplies?.find((q) => q.id === simulatedQrId) ||
    payload.quickReplies?.[0] ||
    null;

  return (
    <>
      <div className="flex items-start gap-2 pt-1 animate-in fade-in slide-in-from-bottom-1 duration-200">
        {/* Small Avatar on left */}
        <div className="w-6 h-6 rounded-full overflow-hidden shrink-0 mt-0.5 border border-gray-200 dark:border-white/10">
          <img
            src={avatarUrl}
            alt="Profile"
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src =
                "/images/instagram/rcm-avatar.png";
            }}
          />
        </div>

        {/* Message Content Bubble */}
        <div className="flex-1 max-w-[85%] space-y-2">
          {/* 1. BUTTON TEMPLATE VIEW */}
          {payload.messageType === "BUTTON_TEMPLATE" && (
            <div className="rounded-2xl rounded-tl-xs bg-gray-100 dark:bg-[#202024] border border-gray-200/80 dark:border-white/10 p-3 space-y-2.5 shadow-2xs">
              <div className="text-xs leading-relaxed text-gray-900 dark:text-white whitespace-pre-wrap break-words font-medium">
                {resolvePreviewVariables(
                  payload.message || defaultFallbackText
                )}
              </div>

              {payload.buttons && payload.buttons.length > 0 && (
                <div className="space-y-1.5 pt-0.5">
                  {payload.buttons.map((btn, bIdx) => {
                    const isBtnActive = activeSimulatedButton?.id === btn.id;
                    return (
                      <button
                        key={btn.id || bIdx}
                        type="button"
                        onClick={() => setSimulatedButtonId(btn.id)}
                        className={`w-full py-2 px-3 rounded-xl border shadow-2xs text-center text-xs font-semibold transition-all cursor-pointer truncate ${
                          isBtnActive
                            ? "bg-white dark:bg-[#2a2a2e] border-purple-500/50 ring-1 ring-purple-500/30 text-purple-700 dark:text-purple-300"
                            : "bg-white dark:bg-[#2a2a2e] border-gray-200/80 dark:border-white/10 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-white/5"
                        }`}
                      >
                        {btn.labelType === "Klik Disini"
                          ? "Klik Disini"
                          : btn.label || `Button ${bIdx + 1}`}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* 2. PLAIN TEXT VIEW */}
          {payload.messageType === "PLAIN_TEXT" && (
            <div className="space-y-2">
              <div className="rounded-2xl rounded-tl-xs bg-gray-100 dark:bg-[#202024] border border-gray-200/80 dark:border-white/10 p-3 shadow-2xs">
                <div className="text-xs leading-relaxed text-gray-900 dark:text-white whitespace-pre-wrap break-words font-medium">
                  {resolvePreviewVariables(
                    payload.message || defaultFallbackText
                  )}
                </div>
              </div>

              {/* Quick Replies Chips */}
              {payload.quickReplies && payload.quickReplies.length > 0 && (
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 scrollbar-none">
                  {payload.quickReplies.map((qr, qIdx) => {
                    const isSelectedQr = activeSimulatedQr?.id === qr.id;
                    const qrLabel =
                      qr.label ?? qr.text ?? `Quick Reply ${qIdx + 1}`;
                    return (
                      <button
                        key={qr.id || qIdx}
                        type="button"
                        onClick={() => setSimulatedQrId(qr.id)}
                        className={`px-2.5 py-1 rounded-full border text-[10px] font-semibold shrink-0 shadow-2xs transition-colors cursor-pointer ${
                          isSelectedQr
                            ? "border-purple-500 bg-purple-500/15 text-purple-600 dark:text-purple-300"
                            : "border-blue-500/40 text-blue-600 dark:text-blue-400 bg-blue-50/60 dark:bg-blue-500/10"
                        }`}
                      >
                        {qrLabel || `Quick Reply ${qIdx + 1}`}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* 3. CAROUSEL VIEW */}
          {payload.messageType === "CAROUSEL" && (
            <div className="flex items-stretch gap-2.5 overflow-x-auto pb-2 scrollbar-none -mr-2 pr-2">
              {(payload.carouselSlides || []).map((slide, sIdx) => (
                <div
                  key={slide.id || sIdx}
                  className="w-44 shrink-0 rounded-2xl bg-white dark:bg-[#202024] border border-gray-200 dark:border-white/10 shadow-xs overflow-hidden flex flex-col"
                >
                  <div className="w-full aspect-square bg-gray-100 dark:bg-white/5 overflow-hidden">
                    {slide.image || defaultSlideImage ? (
                      <img
                        src={slide.image || defaultSlideImage}
                        alt={slide.title || "Slide"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100 dark:bg-white/5">
                        <ImageIcon className="w-6 h-6 opacity-40" />
                      </div>
                    )}
                  </div>
                  <div className="p-2.5 space-y-0.5 flex-1">
                    <h5 className="font-bold text-xs text-gray-900 dark:text-white truncate">
                      {slide.title || "Judul Slide"}
                    </h5>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 line-clamp-2 leading-tight">
                      {slide.subtitle || "Subjudul slide"}
                    </p>
                  </div>
                  {slide.buttons && slide.buttons.length > 0 && (
                    <div className="border-t border-gray-200 dark:border-white/10 divide-y divide-gray-200 dark:divide-white/10 bg-gray-50/60 dark:bg-white/[0.02]">
                      {slide.buttons.map((sBtn, sbIdx) => (
                        <div
                          key={sBtn.id || sbIdx}
                          className="py-1.5 px-2 text-center text-[11px] font-semibold text-blue-600 dark:text-blue-400 truncate"
                        >
                          {sBtn.label || `Button ${sbIdx + 1}`}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Simulated Button Kirim Teks Auto-Response (Label -> Text) */}
      {payload.messageType === "BUTTON_TEMPLATE" &&
        activeSimulatedButton &&
        activeSimulatedButton.action === "Kirim Teks" && (
          <>
            <div className="flex justify-end pt-0.5 animate-in fade-in slide-in-from-bottom-1 duration-200">
              <div className="px-3.5 py-1.5 rounded-2xl rounded-tr-xs bg-[#7048e8] text-white text-xs font-semibold shadow-xs max-w-[75%] break-words">
                {activeSimulatedButton.labelType === "Klik Disini"
                  ? "Klik Disini"
                  : activeSimulatedButton.label || "Klik"}
              </div>
            </div>

            <div className="flex items-start gap-2 pt-0.5 animate-in fade-in slide-in-from-bottom-1 duration-200">
              <div className="w-6 h-6 rounded-full overflow-hidden shrink-0 mt-0.5 border border-gray-200 dark:border-white/10">
                <img
                  src={avatarUrl}
                  alt="Profile"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      "/images/instagram/rcm-avatar.png";
                  }}
                />
              </div>
              <div className="rounded-2xl rounded-tl-xs bg-gray-100 dark:bg-[#202024] border border-gray-200/80 dark:border-white/10 px-3.5 py-2 text-xs leading-relaxed text-gray-900 dark:text-white shadow-xs max-w-[80%] whitespace-pre-wrap break-words font-medium">
                {resolvePreviewVariables(
                  activeSimulatedButton.text ||
                    "Terima kasih sudah tertarik! Ini info detail balasan dari kami."
                )}
              </div>
            </div>
          </>
        )}

      {/* Simulated Quick Reply Auto-Response (Label -> Text) */}
      {payload.messageType === "PLAIN_TEXT" &&
        activeSimulatedQr &&
        ((activeSimulatedQr.label ?? "").trim() ||
          (activeSimulatedQr.text ?? "").trim()) && (
          <>
            <div className="flex justify-end pt-0.5 animate-in fade-in slide-in-from-bottom-1 duration-200">
              <div className="px-3.5 py-1.5 rounded-2xl rounded-tr-xs bg-[#7048e8] text-white text-xs font-semibold shadow-xs max-w-[75%] break-words">
                {activeSimulatedQr.label || activeSimulatedQr.text || "Quick Reply"}
              </div>
            </div>

            {activeSimulatedQr.label !== undefined && (
              <div className="flex items-start gap-2 pt-0.5 animate-in fade-in slide-in-from-bottom-1 duration-200">
                <div className="w-6 h-6 rounded-full overflow-hidden shrink-0 mt-0.5 border border-gray-200 dark:border-white/10">
                  <img
                    src={avatarUrl}
                    alt="Profile"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src =
                        "/images/instagram/rcm-avatar.png";
                    }}
                  />
                </div>
                <div className="rounded-2xl rounded-tl-xs bg-gray-100 dark:bg-[#202024] border border-gray-200/80 dark:border-white/10 px-3.5 py-2 text-xs leading-relaxed text-gray-900 dark:text-white shadow-xs max-w-[80%] whitespace-pre-wrap break-words font-medium">
                  {resolvePreviewVariables(
                    activeSimulatedQr.text ||
                      "Teks balasan otomatis untuk quick reply ini..."
                  )}
                </div>
              </div>
            )}
          </>
        )}
    </>
  );
}
