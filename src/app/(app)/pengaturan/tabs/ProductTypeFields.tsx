"use client";

import React, { useState } from "react";
import {
  BookOpen,
  Video,
  Link2,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Clock,
  Sparkles,
  Loader2,
  Check,
} from "lucide-react";
import {
  getYoutubeThumbnail,
  getYoutubeVideoId,
  calculatePlaylistTotalDuration,
} from "@/lib/youtube-utils";
import { getYoutubeMetadataAction } from "@/app/actions/adminSettings";
import toast from "react-hot-toast";

export interface VideoItem {
  id: string;
  title: string;
  youtubeUrl: string;
  duration?: string;
  isFreePreview?: boolean;
  notes?: string;
}

export interface ResourceData {
  targetUrl: string;
  buttonText?: string;
  instructions?: string;
  accessPassword?: string;
  supportUrl?: string;
}

export const DEFAULT_RESOURCE_DATA: ResourceData = {
  targetUrl: "",
  buttonText: "Buka Template Notion ↗",
  instructions:
    "1. Buka tautan template di atas.\n2. Klik tombol Duplicate di pojok kanan atas akun Notion Anda.\n3. Template siap Anda gunakan di workspace pribadi!",
  accessPassword: "",
  supportUrl: "",
};

// ==========================================
// 1. SELECTOR TIPE PRODUK
// ==========================================
interface ProductTypeSelectorProps {
  value: "EBOOK" | "VIDEO" | "LINK";
  onChange: (type: "EBOOK" | "VIDEO" | "LINK") => void;
}

export function ProductTypeSelector({ value, onChange }: ProductTypeSelectorProps) {
  return (
    <div className="space-y-1.5 mb-2">
      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
        Format Produk Digital
      </label>
      <div className="grid grid-cols-3 gap-2 p-1.5 bg-gray-100 dark:bg-black/20 rounded-xl border border-gray-200 dark:border-[#2C3246]">
        <button
          type="button"
          onClick={() => onChange("EBOOK")}
          className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
            value === "EBOOK"
              ? "bg-white dark:bg-rn-accent text-gray-900 dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-white/10"
              : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          <BookOpen size={15} className={value === "EBOOK" ? "text-rn-accent dark:text-white" : ""} />
          <span>E-Book (PDF)</span>
        </button>

        <button
          type="button"
          onClick={() => onChange("VIDEO")}
          className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
            value === "VIDEO"
              ? "bg-white dark:bg-rn-accent text-gray-900 dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-white/10"
              : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          <Video size={15} className={value === "VIDEO" ? "text-red-500 dark:text-white" : ""} />
          <span>Video Course</span>
        </button>

        <button
          type="button"
          onClick={() => onChange("LINK")}
          className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
            value === "LINK"
              ? "bg-white dark:bg-rn-accent text-gray-900 dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-white/10"
              : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          <Link2 size={15} className={value === "LINK" ? "text-purple-500 dark:text-white" : ""} />
          <span>Akses Link / Notion</span>
        </button>
      </div>
    </div>
  );
}

// ==========================================
// 2. EDITOR PLAYLIST VIDEO (YOUTUBE)
// ==========================================
interface VideoListEditorProps {
  videos: VideoItem[];
  onChange: (videos: VideoItem[]) => void;
  totalDuration: string;
  onTotalDurationChange: (val: string) => void;
}

export function VideoListEditor({
  videos,
  onChange,
  totalDuration,
  onTotalDurationChange,
}: VideoListEditorProps) {
  const [loadingIndex, setLoadingIndex] = useState<number | null>(null);
  const [autoDetectedIndices, setAutoDetectedIndices] = useState<{ [key: number]: boolean }>({});

  // Fungsi kalkulasi otomatis total durasi seluruh video di playlist
  const handleAutoCalculateTotal = (vidsToCount = videos) => {
    const calculated = calculatePlaylistTotalDuration(vidsToCount);
    if (calculated) {
      onTotalDurationChange(calculated);
    }
  };

  // Fungsi deteksi otomatis durasi dan judul dari YouTube Data API
  const handleFetchMetadata = async (idx: number, url: string) => {
    const videoId = getYoutubeVideoId(url);
    if (!videoId) return;

    setLoadingIndex(idx);
    try {
      const res = await getYoutubeMetadataAction(url);
      if (res.success && res.duration) {
        const updated = [...videos];
        const currentVid = { ...updated[idx] };

        // 1. Otomatis isi durasi video
        currentVid.duration = res.duration;

        // 2. Otomatis isi judul jika masih kosong atau default "Materi X:"
        const isGenericTitle =
          !currentVid.title ||
          currentVid.title.trim() === `Materi ${idx + 1}:` ||
          currentVid.title.trim() === `Materi ${idx + 1}` ||
          currentVid.title.trim() === "";

        if (isGenericTitle && res.title) {
          currentVid.title = `Materi ${idx + 1}: ${res.title}`;
        }

        updated[idx] = currentVid;
        onChange(updated);
        setAutoDetectedIndices((prev) => ({ ...prev, [idx]: true }));

        // 3. Otomatis hitung dan update Total Estimasi Durasi Kursus
        handleAutoCalculateTotal(updated);

        toast.success(`Durasi materi #${idx + 1} otomatis terisi: ${res.duration}`, {
          icon: "⏱️",
        });
      } else if (res.error) {
        toast.error(res.error);
      }
    } catch (e: any) {
      toast.error("Gagal mendeteksi durasi YouTube");
    } finally {
      setLoadingIndex(null);
    }
  };

  const addVideo = () => {
    const newId = `vid-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newIndex = videos.length + 1;
    const updated = [
      ...videos,
      {
        id: newId,
        title: `Materi ${newIndex}: `,
        youtubeUrl: "",
        duration: "",
        isFreePreview: false,
        notes: "",
      },
    ];
    onChange(updated);
  };

  const removeVideo = (index: number) => {
    const updated = [...videos];
    updated.splice(index, 1);
    onChange(updated);
    handleAutoCalculateTotal(updated);
  };

  const moveVideo = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === videos.length - 1)
    )
      return;
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    const updated = [...videos];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIdx, 0, moved);
    onChange(updated);
  };

  const updateItem = (index: number, field: keyof VideoItem, value: any) => {
    const updated = [...videos];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);

    // Jika durasi diedit manual, otomatis perbarui total durasi
    if (field === "duration") {
      handleAutoCalculateTotal(updated);
    }
  };

  return (
    <div className="space-y-4 pt-2 border-t border-gray-100 dark:border-[#2C3246]">
      {/* Total Durasi Kelas (Auto-Calculated) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-red-50/50 dark:bg-red-950/10 p-3 rounded-xl border border-red-100 dark:border-red-900/30">
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
              Total Estimasi Durasi
            </label>
            <button
              type="button"
              onClick={() => {
                handleAutoCalculateTotal();
                toast.success("Total durasi playlist dihitung otomatis! ⚡");
              }}
              className="text-[10px] font-bold text-rn-accent hover:text-orange-600 dark:hover:text-orange-400 flex items-center gap-1 cursor-pointer transition-colors"
              title="Hitung ulang total durasi dari semua video di playlist"
            >
              <Sparkles size={11} /> Hitung Otomatis
            </button>
          </div>
          <div className="relative">
            <Clock size={14} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              name="totalDuration"
              value={totalDuration}
              onChange={(e) => onTotalDurationChange(e.target.value)}
              placeholder="Contoh: 1 Jam 45 Menit (8 Video)"
              className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-[#0A1128] border border-gray-200 dark:border-[#2C3246] rounded-lg focus:outline-none focus:border-rn-accent"
            />
          </div>
        </div>
        <div className="flex flex-col justify-center text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
          <span>
            ⚡ <strong>Otomatis:</strong> Durasi video terisi otomatis saat Anda memasukkan link YouTube, dan total durasi kursus dihitung otomatis dari seluruh materi.
          </span>
        </div>
      </div>

      {/* Header Playlist */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider flex items-center gap-1.5">
            <Video size={14} className="text-red-500" /> Daftar Playlist Video ({videos.length})
          </span>
        </div>
        <button
          type="button"
          onClick={addVideo}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-bold transition-all shadow-sm shadow-red-500/20 cursor-pointer"
        >
          <Plus size={14} />
          <span>Tambah Video</span>
        </button>
      </div>

      {/* Empty State jika belum ada video */}
      {videos.length === 0 ? (
        <div className="text-center py-6 px-4 bg-gray-50 dark:bg-white/5 border border-dashed border-gray-200 dark:border-[#2C3246] rounded-xl">
          <Video className="mx-auto text-gray-400 mb-2" size={28} />
          <p className="text-xs font-bold text-gray-700 dark:text-gray-300">
            Belum ada materi video
          </p>
          <p className="text-[11px] text-gray-400 mt-1 max-w-sm mx-auto">
            Klik tombol <strong>&quot;Tambah Video&quot;</strong> di atas untuk memasukkan video materi pertama ke dalam kurikulum kelas ini.
          </p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[380px] overflow-y-auto custom-scrollbar pr-1">
          {videos.map((vid, idx) => {
            const ytThumb = getYoutubeThumbnail(vid.youtubeUrl);
            const isValidYt = !!getYoutubeVideoId(vid.youtubeUrl);
            const isFetching = loadingIndex === idx;
            const isAutoDetected = autoDetectedIndices[idx];

            return (
              <div
                key={vid.id || idx}
                className="p-3 bg-gray-50 dark:bg-[#0A1128] border border-gray-200 dark:border-[#2C3246] rounded-xl space-y-2.5 relative transition-all hover:border-gray-300 dark:hover:border-gray-600"
              >
                {/* Baris Atas: Badge Urutan & Kontrol */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                      VIDEO #{idx + 1}
                    </span>
                    {isFetching ? (
                      <span className="text-[10px] text-rn-accent font-medium flex items-center gap-1 animate-pulse">
                        <Loader2 size={11} className="animate-spin" /> Membaca durasi YouTube...
                      </span>
                    ) : isAutoDetected ? (
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                        <Check size={11} className="stroke-[3]" /> Durasi terisi otomatis ({vid.duration})
                      </span>
                    ) : isValidYt ? (
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                        ✓ Link YouTube Valid
                      </span>
                    ) : null}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => moveVideo(idx, "up")}
                      className="p-1 rounded hover:bg-gray-200 dark:hover:bg-white/10 text-gray-500 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                      title="Pindah ke Atas"
                    >
                      <ArrowUp size={13} />
                    </button>
                    <button
                      type="button"
                      disabled={idx === videos.length - 1}
                      onClick={() => moveVideo(idx, "down")}
                      className="p-1 rounded hover:bg-gray-200 dark:hover:bg-white/10 text-gray-500 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                      title="Pindah ke Bawah"
                    >
                      <ArrowDown size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeVideo(idx)}
                      className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 cursor-pointer ml-1"
                      title="Hapus Video"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Input Judul Video & Durasi */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <div className="sm:col-span-3">
                    <input
                      type="text"
                      value={vid.title}
                      onChange={(e) => updateItem(idx, "title", e.target.value)}
                      placeholder="Judul Materi, cth: 01. Cara Riset Konten Viral"
                      required
                      className="w-full bg-white dark:bg-[#141B31] border border-gray-200 dark:border-[#2C3246] rounded-lg px-2.5 py-1.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-rn-accent"
                    />
                  </div>
                  <div className="sm:col-span-1 relative">
                    <input
                      type="text"
                      value={vid.duration || ""}
                      onChange={(e) => updateItem(idx, "duration", e.target.value)}
                      placeholder="Durasi, cth: 12:45"
                      className="w-full bg-white dark:bg-[#141B31] border border-gray-200 dark:border-[#2C3246] rounded-lg pl-2.5 pr-8 py-1.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-rn-accent"
                    />
                    <button
                      type="button"
                      disabled={isFetching || !isValidYt}
                      onClick={() => handleFetchMetadata(idx, vid.youtubeUrl)}
                      title="Deteksi durasi otomatis dari link YouTube"
                      className="absolute right-1.5 top-1.5 p-1 text-gray-400 hover:text-rn-accent disabled:opacity-30 cursor-pointer transition-colors"
                    >
                      {isFetching ? (
                        <Loader2 size={13} className="animate-spin text-rn-accent" />
                      ) : (
                        <Sparkles
                          size={13}
                          className={isAutoDetected ? "text-emerald-500 fill-emerald-500/20" : ""}
                        />
                      )}
                    </button>
                  </div>
                </div>

                {/* Input URL YouTube + Preview Thumbnail */}
                <div className="flex gap-2 items-center">
                  {ytThumb && (
                    <img
                      src={ytThumb}
                      alt="Thumbnail"
                      className="w-14 h-9 object-cover rounded border border-gray-200 dark:border-[#2C3246] shrink-0"
                    />
                  )}
                  <input
                    type="url"
                    value={vid.youtubeUrl}
                    onChange={(e) => {
                      const newUrl = e.target.value;
                      updateItem(idx, "youtubeUrl", newUrl);
                      const newId = getYoutubeVideoId(newUrl);
                      const oldId = getYoutubeVideoId(vid.youtubeUrl);
                      if (newId && newId !== oldId) {
                        handleFetchMetadata(idx, newUrl);
                      }
                    }}
                    onBlur={(e) => {
                      const val = e.target.value;
                      if (getYoutubeVideoId(val) && !vid.duration) {
                        handleFetchMetadata(idx, val);
                      }
                    }}
                    placeholder="Link YouTube (cth: https://www.youtube.com/watch?v=... atau https://youtu.be/...)"
                    required
                    className="flex-1 bg-white dark:bg-[#141B31] border border-gray-200 dark:border-[#2C3246] rounded-lg px-2.5 py-1.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-rn-accent"
                  />
                </div>

                {/* Toggle Free Preview / Trailer */}
                <div className="flex items-center justify-between pt-1 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={!!vid.isFreePreview}
                      onChange={(e) => updateItem(idx, "isFreePreview", e.target.checked)}
                      className="w-4 h-4 rounded text-red-500 focus:ring-red-500 border-gray-300"
                    />
                    <span className="text-[11px] font-semibold text-gray-700 dark:text-gray-300">
                      Gratis Ditonton / Trailer (Bisa diputar sebelum membeli)
                    </span>
                  </label>
                </div>

                {/* Catatan / Prompt Opsional */}
                <div>
                  <textarea
                    value={vid.notes || ""}
                    onChange={(e) => updateItem(idx, "notes", e.target.value)}
                    rows={1}
                    placeholder="Catatan / Prompt AI pendukung materi ini (Opsional)..."
                    className="w-full bg-white dark:bg-[#141B31] border border-gray-200 dark:border-[#2C3246] rounded-lg px-2.5 py-1 text-[11px] text-gray-900 dark:text-white focus:outline-none focus:border-rn-accent custom-scrollbar"
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ==========================================
// 3. EDITOR AKSES LINK / TEMPLATE NOTION
// ==========================================
interface ResourceDataEditorProps {
  data: ResourceData;
  onChange: (data: ResourceData) => void;
}

export function ResourceDataEditor({ data, onChange }: ResourceDataEditorProps) {
  const updateField = (field: keyof ResourceData, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-3.5 pt-2 border-t border-gray-100 dark:border-[#2C3246]">
      <div className="bg-purple-50/60 dark:bg-purple-950/20 p-3 rounded-xl border border-purple-100 dark:border-purple-900/30 flex items-start gap-2.5">
        <Sparkles size={16} className="text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
        <div className="text-[11px] text-gray-600 dark:text-gray-300 leading-relaxed">
          <p className="font-bold text-purple-900 dark:text-purple-200">
            Akses Template / Resource Vault
          </p>
          <p>
            Setelah membeli, pembeli akan membuka halaman khusus yang berisi tombol aksi cepat menuju template, tombol salin tautan, serta panduan langkah-langkah duplikasi.
          </p>
        </div>
      </div>

      {/* URL Link Tujuan Utama */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Link2 size={13} className="text-purple-500" /> Link URL Template / Resource (Wajib)
          </span>
          <span className="text-[10px] text-purple-600 font-semibold">Tujuan Akses</span>
        </label>
        <div className="relative">
          <input
            type="url"
            value={data.targetUrl}
            onChange={(e) => updateField("targetUrl", e.target.value)}
            placeholder="https://notion.so/... atau https://docs.google.com/..."
            required
            className="w-full bg-gray-50 dark:bg-[#0A1128] border border-gray-200 dark:border-[#2C3246] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
          />
        </div>
      </div>

      {/* Teks Tombol Aksi CTA */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block">
          Teks Tombol Aksi (CTA Button)
        </label>
        <input
          type="text"
          value={data.buttonText || ""}
          onChange={(e) => updateField("buttonText", e.target.value)}
          placeholder="Contoh: Buka Template Notion ↗"
          className="w-full bg-gray-50 dark:bg-[#0A1128] border border-gray-200 dark:border-[#2C3246] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
        />
      </div>

      {/* Panduan Langkah Duplikasi / Penggunaan */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block">
          Panduan Cara Duplikasi / Akses (Step-by-step)
        </label>
        <textarea
          rows={3}
          value={data.instructions || ""}
          onChange={(e) => updateField("instructions", e.target.value)}
          placeholder="Tuliskan instruksi langkah demi langkah untuk user..."
          className="w-full bg-gray-50 dark:bg-[#0A1128] border border-gray-200 dark:border-[#2C3246] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all custom-scrollbar"
        />
      </div>

      {/* Grid: Password File & Link Grup Support */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
            Password Akses (Opsional)
          </label>
          <input
            type="text"
            value={data.accessPassword || ""}
            onChange={(e) => updateField("accessPassword", e.target.value)}
            placeholder="Jika file diproteksi password"
            className="w-full bg-gray-50 dark:bg-[#0A1128] border border-gray-200 dark:border-[#2C3246] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-purple-500 transition-all"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
            Link Grup / Support (Opsional)
          </label>
          <input
            type="url"
            value={data.supportUrl || ""}
            onChange={(e) => updateField("supportUrl", e.target.value)}
            placeholder="https://t.me/grup_support..."
            className="w-full bg-gray-50 dark:bg-[#0A1128] border border-gray-200 dark:border-[#2C3246] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-purple-500 transition-all"
          />
        </div>
      </div>
    </div>
  );
}
