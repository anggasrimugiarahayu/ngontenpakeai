// src/app/(app)/ruang-automation/instagram/flow-nodes/FlowStepInspectorDrawer.tsx
"use client";

import React, { useState } from "react";
import {
  X,
  ChevronDown,
  Plus,
  Trash2,
  ExternalLink,
  Clock,
  Sparkles,
  Info,
  Check,
  RefreshCw,
} from "lucide-react";
import { Switch } from "@/components/ui/Switch";
import { FlowNodeData } from "../../utils/instagramFlowCompiler";

interface FlowStepInspectorDrawerProps {
  selectedNode: FlowNodeData | null;
  onClose: () => void;
  onUpdateNodeData: (nodeId: string, updatedData: Record<string, any>) => void;
  feedPosts: any[];
  activeStories?: any[];
  isAccountLinked: boolean;
  isLoadingFeed?: boolean;
}

export function FlowStepInspectorDrawer({
  selectedNode,
  onClose,
  onUpdateNodeData,
  feedPosts,
  activeStories = [],
  isAccountLinked,
  isLoadingFeed,
}: FlowStepInspectorDrawerProps) {
  if (!selectedNode) return null;

  const { id, type, data } = selectedNode;

  const handleChange = (field: string, value: any) => {
    onUpdateNodeData(id, { ...data, [field]: value });
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[420px] bg-white dark:bg-[#141B31] border-l border-gray-200 dark:border-[#2C3246] shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
      {/* Drawer Header */}
      <div className="px-5 py-4 border-b border-gray-100 dark:border-[#2C3246] flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400">
            Inspector Step
          </span>
          <h3 className="font-bold text-sm text-gray-900 dark:text-white mt-0.5">
            {type === "TRIGGER"
              ? "⚡ Pengaturan Trigger"
              : type === "WELCOME_DM"
              ? "💬 Pesan Pembuka (DM)"
              : type === "ASK_FOLLOW"
              ? "🛡️ Cek Status Follower"
              : type === "ASK_CONTACT"
              ? "📧 Minta Data Kontak"
              : type === "MAIN_DM"
              ? "🚀 Pesan Utama & Follow-Up"
              : "📝 Catatan Panduan"}
          </h3>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Drawer Scrollable Form Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* ============================================================== */}
        {/* 1. INSPECTOR: TRIGGER NODE */}
        {/* ============================================================== */}
        {type === "TRIGGER" && (
          <div className="space-y-4">
            {/* Target Otomasi */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
                Target Otomasi
              </label>
              <select
                value={data.targetOtomasi || "Postingan Tertentu"}
                onChange={(e) => {
                  const val = e.target.value;
                  const newPostType =
                    val === "Postingan Tertentu"
                      ? "SPECIFIC"
                      : val === "Postingan Berikutnya"
                      ? "NEXT"
                      : val === "Semua Story"
                      ? "ALL_STORIES"
                      : val === "Story Tertentu"
                      ? "SPECIFIC_STORY"
                      : val === "Story Mention"
                      ? "STORY_MENTION"
                      : val === "Live Instagram"
                      ? "LIVE"
                      : val === "Pesan Instagram"
                      ? "DM"
                      : "ALL";
                  onUpdateNodeData(id, {
                    ...data,
                    targetOtomasi: val,
                    postType: newPostType,
                  });
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-[#2C3246] bg-white dark:bg-[#141B31] text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              >
                <optgroup label="Post / Reel">
                  <option value="Postingan Tertentu">Postingan Tertentu</option>
                  <option value="Semua Postingan">Semua Postingan</option>
                  <option value="Postingan Berikutnya">Postingan Berikutnya</option>
                </optgroup>
                <optgroup label="Story">
                  <option value="Semua Story">Semua Story</option>
                  <option value="Story Tertentu">Story Tertentu</option>
                  <option value="Story Mention">Story Mention</option>
                </optgroup>
                <optgroup label="Live">
                  <option value="Live Instagram">Live Instagram</option>
                </optgroup>
                <optgroup label="Direct Message">
                  <option value="Pesan Instagram">Pesan Instagram (DM)</option>
                </optgroup>
              </select>
            </div>

            {/* Post Selector jika Postingan Tertentu */}
            {data.targetOtomasi === "Postingan Tertentu" && (
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
                  Pilih Postingan
                </label>
                {!isAccountLinked ? (
                  <p className="text-xs text-amber-600 bg-amber-500/10 p-2.5 rounded-xl">
                    Akun belum terhubung. Hubungkan akun di Ruang Automation untuk memilih postingan asli.
                  </p>
                ) : feedPosts.length === 0 ? (
                  <p className="text-xs text-gray-500 p-2.5 rounded-xl bg-gray-50 dark:bg-white/5">
                    Belum ada postingan feed terdeteksi dari Instagram.
                  </p>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {feedPosts.slice(0, 6).map((post) => {
                      const isSelected = data.postId === post.id;
                      return (
                        <button
                          key={post.id}
                          type="button"
                          onClick={() => {
                            onUpdateNodeData(id, {
                              ...data,
                              postId: post.id,
                              postCoverUrl: post.thumb || post.image,
                              postPermalink: post.permalink || "",
                            });
                          }}
                          className={`relative aspect-[4/5] rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                            isSelected
                              ? "border-orange-500 ring-2 ring-orange-500/30 scale-102"
                              : "border-gray-200 dark:border-white/10 opacity-70 hover:opacity-100"
                          }`}
                        >
                          <img
                            src={post.thumb || post.image}
                            alt="Post"
                            className="w-full h-full object-cover"
                          />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Kata Kunci Pemicu */}
            {data.targetOtomasi !== "Story Mention" && (
              <div className="space-y-3 pt-2 border-t border-gray-100 dark:border-[#2C3246]">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-800 dark:text-gray-200">
                    Kata Kunci Komentar
                  </label>
                  <select
                    value={data.triggerCommentType || "KEYWORDS"}
                    onChange={(e) => handleChange("triggerCommentType", e.target.value)}
                    className="text-[11px] px-2 py-1 rounded-lg border border-gray-200 dark:border-[#2C3246] bg-transparent text-gray-700 dark:text-gray-300"
                  >
                    <option value="KEYWORDS">Dengan Kata Kunci</option>
                    <option value="ALL">Semua Komentar</option>
                  </select>
                </div>

                {data.triggerCommentType !== "ALL" && (
                  <div className="space-y-1.5">
                    <input
                      type="text"
                      value={data.keywords || ""}
                      onChange={(e) => handleChange("keywords", e.target.value)}
                      placeholder="mau, link, spill, harga"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-[#2C3246] bg-white dark:bg-[#141B31] text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                    />
                    <p className="text-[10px] text-gray-400">
                      Pisahkan kata kunci dengan tanda koma (contoh: <code>mau, info, spill</code>).
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Balasan Komentar Publik */}
            {data.targetOtomasi !== "Pesan Instagram" && (
              <div className="space-y-2.5 pt-2 border-t border-gray-100 dark:border-[#2C3246]">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                      Balas Komentar Publik
                    </span>
                    <p className="text-[10px] text-gray-500">
                      Kirim respon publik di kolom komentar
                    </p>
                  </div>
                  <Switch
                    size="sm"
                    checked={Boolean(data.featureReplyComment)}
                    onChange={(val) => handleChange("featureReplyComment", val)}
                  />
                </div>

                {data.featureReplyComment && (
                  <textarea
                    rows={2}
                    value={data.commentReplies?.[0] || "Pesan terkirim! 🚀 Cek DMnya ya @{username}"}
                    onChange={(e) => handleChange("commentReplies", [e.target.value])}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-[#2C3246] bg-white dark:bg-[#141B31] text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  />
                )}
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* 2. INSPECTOR: WELCOME DM NODE */}
        {/* ============================================================== */}
        {type === "WELCOME_DM" && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
                Pesan Balasan Pembuka (DM)
              </label>
              <textarea
                rows={4}
                value={data.welcomeMessage || ""}
                onChange={(e) => handleChange("welcomeMessage", e.target.value)}
                placeholder="Halo {first_name}! Akses nya udah kita buatin nihh!! Mau? ✨"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-[#2C3246] bg-white dark:bg-[#141B31] text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 leading-relaxed"
              />
              <p className="text-[10px] text-gray-400">
                Gunakan variabel <code>&#123;first_name&#125;</code> atau <code>@&#123;username&#125;</code>.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
                Label Tombol Lanjut (Postback)
              </label>
              <input
                type="text"
                maxLength={20}
                value={data.welcomeButtonLabel || "Lihat Produk 🤩"}
                onChange={(e) => handleChange("welcomeButtonLabel", e.target.value)}
                placeholder="Lihat Produk 🤩"
                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-[#2C3246] bg-white dark:bg-[#141B31] text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              />
              <p className="text-[10px] text-gray-400">
                Maksimal 20 karakter sesuai batas resmi Meta API.
              </p>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* 3. INSPECTOR: ASK FOLLOW NODE */}
        {/* ============================================================== */}
        {type === "ASK_FOLLOW" && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
                Pesan Wajib Follow
              </label>
              <textarea
                rows={4}
                value={data.askForFollowMessage || ""}
                onChange={(e) => handleChange("askForFollowMessage", e.target.value)}
                placeholder="Btw, kamu belum follow akun ini nih. Follow dulu ya, nanti otomatis dikirimkan aksesnya!"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-[#2C3246] bg-white dark:bg-[#141B31] text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 leading-relaxed"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
                Label Tombol Konfirmasi Follow
              </label>
              <input
                type="text"
                maxLength={20}
                value={data.askForFollowButtonLabel || "Udah follow 🙌"}
                onChange={(e) => handleChange("askForFollowButtonLabel", e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-[#2C3246] bg-white dark:bg-[#141B31] text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              />
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* 4. INSPECTOR: ASK CONTACT NODE */}
        {/* ============================================================== */}
        {type === "ASK_CONTACT" && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
                Tipe Kontak yang Diminta
              </label>
              <select
                value={data.askContactType || "Email Saja"}
                onChange={(e) => handleChange("askContactType", e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-[#2C3246] bg-white dark:bg-[#141B31] text-xs font-medium text-gray-900 dark:text-white"
              >
                <option value="Email Saja">Email Saja</option>
                <option value="Nomor WhatsApp Saja">Nomor WhatsApp Saja</option>
                <option value="Email & WhatsApp">Email & WhatsApp</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
                Pesan Permintaan Kontak
              </label>
              <textarea
                rows={3}
                value={data.askContactMessage || ""}
                onChange={(e) => handleChange("askContactMessage", e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-[#2C3246] bg-white dark:bg-[#141B31] text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 leading-relaxed"
              />
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* 5. INSPECTOR: MAIN DM & SMART DELAY / FOLLOW-UP */}
        {/* ============================================================== */}
        {type === "MAIN_DM" && (
          <div className="space-y-5">
            {/* Main Message Text */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
                Teks Pesan Utama (Offer / Link)
              </label>
              <textarea
                rows={4}
                value={data.dmMessage || ""}
                onChange={(e) => handleChange("dmMessage", e.target.value)}
                placeholder="Halo {first_name}! Ini link akses materi yang kamu minta..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-[#2C3246] bg-white dark:bg-[#141B31] text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 leading-relaxed"
              />
            </div>

            {/* Buttons Setup */}
            <div className="space-y-3 pt-3 border-t border-gray-100 dark:border-[#2C3246]">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-gray-800 dark:text-gray-200">
                  Tombol Link Website
                </label>
              </div>

              {(data.buttons || []).map((btn: any, idx: number) => (
                <div
                  key={btn.id || idx}
                  className="p-3 rounded-xl border border-gray-200 dark:border-[#2C3246] bg-gray-50/50 dark:bg-white/5 space-y-2.5"
                >
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-gray-400">
                      Label Tombol
                    </span>
                    <input
                      type="text"
                      value={btn.label || ""}
                      onChange={(e) => {
                        const nextBtns = [...(data.buttons || [])];
                        nextBtns[idx] = { ...btn, label: e.target.value };
                        handleChange("buttons", nextBtns);
                      }}
                      placeholder="Buka Link Akses"
                      className="w-full px-3 py-1.5 rounded-lg border border-gray-200 dark:border-[#2C3246] bg-white dark:bg-[#141B31] text-xs font-semibold text-gray-900 dark:text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-gray-400">
                      Tautan URL (https://...)
                    </span>
                    <input
                      type="url"
                      value={btn.url || ""}
                      onChange={(e) => {
                        const nextBtns = [...(data.buttons || [])];
                        nextBtns[idx] = { ...btn, url: e.target.value };
                        handleChange("buttons", nextBtns);
                      }}
                      placeholder="https://ruangcreativemuslim.com"
                      className="w-full px-3 py-1.5 rounded-lg border border-gray-200 dark:border-[#2C3246] bg-white dark:bg-[#141B31] text-xs text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Smart Delay & Follow-Up Section */}
            <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-[#2C3246]">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-purple-600" />
                    <span>Smart Delay & Follow-Up</span>
                  </span>
                  <p className="text-[10px] text-gray-500">
                    Kirim pesan pengingat otomatis setelah jeda waktu
                  </p>
                </div>
                <Switch
                  size="sm"
                  checked={Boolean(data.featureFollowUp)}
                  onChange={(val) => handleChange("featureFollowUp", val)}
                />
              </div>

              {data.featureFollowUp && (
                <div className="p-3.5 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/60 dark:border-purple-800/40 space-y-3 animate-in fade-in duration-150">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-gray-600 dark:text-gray-400">
                        Jeda Waktu
                      </span>
                      <select
                        value={data.followUpDelay || "1 Jam"}
                        onChange={(e) => handleChange("followUpDelay", e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-[#2C3246] bg-white dark:bg-[#141B31] text-xs font-medium text-gray-900 dark:text-white"
                      >
                        <option value="15 Menit">15 Menit</option>
                        <option value="1 Jam">1 Jam</option>
                        <option value="3 Jam">3 Jam</option>
                        <option value="6 Jam">6 Jam</option>
                        <option value="12 Jam">12 Jam</option>
                        <option value="23 Jam">23 Jam</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-gray-600 dark:text-gray-400">
                        Kondisi Pengiriman
                      </span>
                      <select
                        value={data.followUpCondition || "Hanya yang Belum Klik Link"}
                        onChange={(e) => handleChange("followUpCondition", e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-[#2C3246] bg-white dark:bg-[#141B31] text-xs font-medium text-gray-900 dark:text-white"
                      >
                        <option value="Hanya yang Belum Klik Link">Belum Klik Link</option>
                        <option value="Semua Penerima">Semua Penerima</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-gray-600 dark:text-gray-400">
                      Pesan Pengingat Follow-Up
                    </span>
                    <textarea
                      rows={3}
                      value={data.followUpMessage || ""}
                      onChange={(e) => handleChange("followUpMessage", e.target.value)}
                      placeholder="Halo {first_name}! Link materinya udah sempat kamu buka belum? Kalau ada kendala bilang ya 😉"
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-[#2C3246] bg-white dark:bg-[#141B31] text-xs text-gray-900 dark:text-white leading-relaxed focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* 6. INSPECTOR: HELPER NOTE NODE */}
        {/* ============================================================== */}
        {type === "HELPER_NOTE" && (
          <div className="space-y-3">
            <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
              Isi Catatan Panduan
            </label>
            <textarea
              rows={4}
              value={data.text || ""}
              onChange={(e) => handleChange("text", e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-amber-300 dark:border-amber-800/40 bg-amber-50/50 dark:bg-amber-950/20 text-xs text-amber-950 dark:text-amber-100 leading-relaxed focus:outline-none"
            />
          </div>
        )}
      </div>

      {/* Drawer Footer Actions */}
      <div className="p-4 border-t border-gray-100 dark:border-[#2C3246] flex items-center justify-end">
        <button
          type="button"
          onClick={onClose}
          className="px-5 py-2 rounded-xl bg-[#f97316] hover:bg-[#ea580c] text-white text-xs font-bold shadow-sm shadow-orange-500/20 transition-colors cursor-pointer"
        >
          Selesai Edit
        </button>
      </div>
    </div>
  );
}
