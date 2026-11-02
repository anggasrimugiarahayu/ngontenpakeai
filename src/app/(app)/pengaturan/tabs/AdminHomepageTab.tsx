"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { mutate } from "swr";
import {
  Edit3,
  MoreVertical,
  Eye,
  EyeOff,
  Wrench,
  AlertTriangle,
  Clock,
  ExternalLink,
  Save,
  LayoutGrid,
} from "lucide-react";
import { cn } from "@/lib/design-tokens";
import {
  HomepageCardConfig,
  DEFAULT_HOMEPAGE_CARDS,
  mergeHomepageCards,
} from "@/lib/homepage-cards";
import {
  saveHomepageCardsAction,
  saveMaintenanceConfigAction,
} from "@/app/actions/adminSettings";
import { MaintenanceConfig, DEFAULT_MAINTENANCE_CONFIG } from "@/lib/cache";
import { HomeCardVisual } from "@/components/home/HomeCardVisuals";
import { HomepageEditModal } from "./HomepageEditModal";

export function AdminHomepageTab({ settings }: { settings: any[] }) {
  const router = useRouter();

  // Find stored settings for HOMEPAGE_CARDS
  const rawSetting = settings?.find((s) => s.key === "HOMEPAGE_CARDS")?.value;
  let initialCards = DEFAULT_HOMEPAGE_CARDS;
  try {
    if (rawSetting) {
      initialCards = mergeHomepageCards(JSON.parse(rawSetting));
    }
  } catch (e) {
    console.error("Failed to parse HOMEPAGE_CARDS setting:", e);
  }

  // Find stored settings for MAINTENANCE_CONFIG
  const rawMaintSetting = settings?.find((s) => s.key === "MAINTENANCE_CONFIG")?.value;
  let initialMaint: MaintenanceConfig = DEFAULT_MAINTENANCE_CONFIG;
  try {
    if (rawMaintSetting) {
      const parsed = JSON.parse(rawMaintSetting);
      if (parsed.message && parsed.message.toLowerCase().includes("clawd sedang")) {
        parsed.message = DEFAULT_MAINTENANCE_CONFIG.message;
      }
      initialMaint = { ...DEFAULT_MAINTENANCE_CONFIG, ...parsed };
    }
  } catch (e) {
    console.error("Failed to parse MAINTENANCE_CONFIG setting:", e);
  }

  const [activeSubTab, setActiveSubTab] = useState<"homepage" | "maintenance">("homepage");
  const [cards, setCards] = useState<HomepageCardConfig[]>(initialCards);
  const [maintConfig, setMaintConfig] = useState<MaintenanceConfig>(initialMaint);
  const [isSavingMaint, setIsSavingMaint] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  useEffect(() => {
    try {
      const sp = new URLSearchParams(window.location.search);
      const sub = sp.get("sub");
      if (sub === "maintenance" || sub === "homepage") {
        setActiveSubTab(sub as any);
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (rawSetting) {
      try {
        setCards(mergeHomepageCards(JSON.parse(rawSetting)));
      } catch (e) {}
    }
  }, [rawSetting]);

  useEffect(() => {
    if (rawMaintSetting) {
      try {
        const parsed = JSON.parse(rawMaintSetting);
        if (parsed.message && parsed.message.toLowerCase().includes("clawd sedang")) {
          parsed.message = DEFAULT_MAINTENANCE_CONFIG.message;
        }
        setMaintConfig({ ...DEFAULT_MAINTENANCE_CONFIG, ...parsed });
      } catch (e) {}
    }
  }, [rawMaintSetting]);

  const handleSaveMaintenance = async (overrideConfig?: Partial<MaintenanceConfig>) => {
    setIsSavingMaint(true);
    const toSave: MaintenanceConfig = { ...maintConfig, ...(overrideConfig || {}) };
    try {
      await saveMaintenanceConfigAction(toSave);
      setMaintConfig(toSave);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("maintenance-mode-change", { detail: toSave }));
      }
      mutate("pengaturan");
      router.refresh();
      if (toSave.isActive) {
        toast.success("Mode Maintenance AKTIF! Halaman depan kini menampilkan Under Maintenance.");
      } else {
        toast.success("Mode Maintenance NONAKTIF! Halaman depan kembali normal.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Gagal menyimpan pengaturan Maintenance.");
    } finally {
      setIsSavingMaint(false);
    }
  };

  // Handle Enable / Disable toggle via the 3-dots menu
  const handleToggleActive = async (cardId: string) => {
    setOpenMenuId(null);
    const updated = cards.map((c) =>
      c.id === cardId ? { ...c, isActive: !c.isActive } : c
    );
    setCards(updated);

    const targetCard = updated.find((c) => c.id === cardId);
    try {
      await saveHomepageCardsAction(updated);
      mutate("pengaturan");
      router.refresh();
      if (targetCard?.isActive) {
        toast.success(`Card ${targetCard.title} berhasil diaktifkan!`);
      } else {
        toast.success(`Card ${targetCard?.title} dinonaktifkan (mati di Beranda & Sidebar)`);
      }
    } catch (err) {
      console.error(err);
      toast.error("Gagal menyimpan status kartu.");
      mutate("pengaturan");
    }
  };

  // Handle Drag & Drop reordering
  const handleDrop = async (dropIndex: number) => {
    setDragOverIdx(null);
    if (draggedIdx === null || draggedIdx === dropIndex) return;

    const newCards = [...cards];
    const [draggedItem] = newCards.splice(draggedIdx, 1);
    newCards.splice(dropIndex, 0, draggedItem);

    setCards(newCards);
    setDraggedIdx(null);

    try {
      await saveHomepageCardsAction(newCards);
      mutate("pengaturan");
      router.refresh();
      toast.success("Urutan kartu berhasil diperbarui!");
    } catch (err) {
      console.error(err);
      toast.error("Gagal menyimpan urutan kartu.");
    }
  };

  // Handle saving edits from modal
  const handleSaveModal = async (updatedCards: HomepageCardConfig[]) => {
    try {
      await saveHomepageCardsAction(updatedCards);
      setCards(updatedCards);
      mutate("pengaturan");
      router.refresh();
      toast.success("Konten & badge kartu berhasil diperbarui!");
    } catch (err) {
      console.error(err);
      toast.error("Gagal menyimpan perubahan konten.");
      throw err;
    }
  };

  return (
    <div className="border border-gray-200 dark:border-[#2C3246] rounded-2xl p-6 bg-white dark:bg-[#141B31] space-y-6 animate-in fade-in duration-300">
      {/* Header Utama Tab Home Page */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
          Manajemen Homepage
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Kelola tampilan kartu beranda serta kendalikan mode pemeliharaan sistem (under maintenance).
        </p>
      </div>

      {/* Horizontal Sub-Tabs Navigation (Persis gaya Manajemen Fitur) */}
      <div className="flex items-center gap-2 border-b border-gray-100 dark:border-[#2C3246]/60 pb-3 overflow-x-auto scrollbar-hide">
        <button
          type="button"
          onClick={() => setActiveSubTab("homepage")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer",
            activeSubTab === "homepage"
              ? "bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/30"
              : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#1f2947]"
          )}
        >
          <LayoutGrid className="w-4 h-4" />
          <span>Manajemen Homepage</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("maintenance")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer",
            activeSubTab === "maintenance"
              ? "bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/30"
              : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#1f2947]"
          )}
        >
          <Wrench className="w-4 h-4" />
          <span>Under Maintenance</span>
          {maintConfig.isActive && (
            <span className="flex h-2 w-2 relative ml-0.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
            </span>
          )}
        </button>
      </div>

      {/* Sub-Tab 1: UNDER MAINTENANCE */}
      {activeSubTab === "maintenance" && (
        <div
          className={`border rounded-2xl p-6 transition-all duration-300 ${
            maintConfig.isActive
              ? "border-amber-400 dark:border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/20 shadow-md shadow-amber-500/10"
              : "border-gray-200 dark:border-[#2C3246] bg-gray-50/40 dark:bg-white/5 shadow-xs"
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div
                className={`p-3 rounded-xl shrink-0 ${
                  maintConfig.isActive
                    ? "bg-amber-500 text-white"
                    : "bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400"
                }`}
              >
                <Wrench className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Mode Pemeliharaan Sistem (Under Maintenance)
                  </h3>
                  {maintConfig.isActive ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                      AKTIF
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      NORMAL
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-xl">
                  Alihkan halaman depan &amp; ruang fitur menjadi tampilan <strong>Under Maintenance</strong> dengan animasi karakter Clawd. Admin tetap dapat mengakses dashboard dan pengaturan.
                </p>
              </div>
            </div>

            {/* Toggle Switch */}
            <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={maintConfig.isActive}
                  onChange={(e) => {
                    const updated = { ...maintConfig, isActive: e.target.checked };
                    setMaintConfig(updated);
                    handleSaveMaintenance({ isActive: e.target.checked });
                  }}
                  className="sr-only peer"
                />
                <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500" />
              </label>
              <span className="text-xs font-bold text-gray-700 dark:text-gray-300 min-w-[3.5rem]">
                {maintConfig.isActive ? "AKTIF" : "OFF"}
              </span>
            </div>
          </div>

          {/* Form kustomisasi pesan maintenance */}
          <div className="mt-5 pt-5 border-t border-gray-200/70 dark:border-white/10 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Judul Halaman Maintenance
              </label>
              <input
                type="text"
                value={maintConfig.title}
                onChange={(e) => setMaintConfig({ ...maintConfig, title: e.target.value })}
                placeholder="Contoh: Sistem Sedang Dalam Pemeliharaan"
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1E2538] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Estimasi Waktu Selesai (Opsional)
              </label>
              <input
                type="text"
                value={maintConfig.estimatedTime || ""}
                onChange={(e) => setMaintConfig({ ...maintConfig, estimatedTime: e.target.value })}
                placeholder="Contoh: Estimasi selesai: 30 Menit (atau kosongkan)"
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1E2538] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Pesan Informasi Pengunjung
              </label>
              <textarea
                rows={2}
                value={maintConfig.message}
                onChange={(e) => setMaintConfig({ ...maintConfig, message: e.target.value })}
                placeholder="Kami sedang melakukan peningkatan sistem dan pembaruan fitur agar pengalaman ngontenmu semakin optimal. Kami akan segera kembali!"
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1E2538] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
              />
            </div>

            <div className="md:col-span-2 flex flex-wrap items-center justify-between gap-3 pt-2">
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                {maintConfig.updatedAt && (
                  <>Terakhir diperbarui: {new Date(maintConfig.updatedAt).toLocaleString("id-ID")}</>
                )}
              </p>
              <div className="flex items-center gap-2">
                <a
                  href="/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 transition-colors"
                >
                  <ExternalLink size={13} />
                  <span>Lihat Halaman Depan</span>
                </a>
                <button
                  type="button"
                  onClick={() => handleSaveMaintenance()}
                  disabled={isSavingMaint}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-orange-500 hover:bg-orange-600 text-white shadow-sm shadow-orange-500/20 transition-all disabled:opacity-60 cursor-pointer"
                >
                  <Save size={14} />
                  <span>{isSavingMaint ? "Menyimpan..." : "Simpan Pesan Maintenance"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tab 2: MANAJEMEN HOMEPAGE CARDS */}
      {activeSubTab === "homepage" && (
        <div className="space-y-6">
          {/* Card Aksi Edit Konten & Badge (Persis gaya Batas Percobaan Gratis Ruang Ngonten) */}
          <div className="p-4 sm:p-5 rounded-xl bg-orange-50/50 dark:bg-orange-950/10 border border-orange-200/60 dark:border-orange-900/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-orange-500" />
                Kustomisasi Konten &amp; Badge Homepage
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                Ubah teks judul, deskripsi penjelasan, dan tag badge untuk setiap kartu beranda.
              </p>
            </div>
            <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0">
              <button
                type="button"
                onClick={() => setShowEditModal(true)}
                className="w-full sm:w-auto justify-center bg-[#f97316] hover:bg-[#ea580c] dark:bg-[#f97316] dark:hover:bg-[#fb923c] text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-sm shadow-orange-500/20 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit Konten &amp; Badge</span>
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <div className="w-2 h-6 bg-rn-accent rounded-full"></div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Live Preview</h3>
              </div>
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                {cards.filter((c) => c.isActive).length} dari {cards.length} Aktif
              </span>
            </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
            {cards.map((card, index) => {
              const isMenuOpen = openMenuId === card.id;

              return (
                <div
                  key={card.id}
                  draggable
                  onDragStart={(e) => {
                    setDraggedIdx(index);
                    e.dataTransfer.effectAllowed = "move";
                    e.dataTransfer.setData("text/plain", card.id);
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = "move";
                    if (dragOverIdx !== index) {
                      setDragOverIdx(index);
                    }
                  }}
                  onDragLeave={() => {
                    if (dragOverIdx === index) {
                      setDragOverIdx(null);
                    }
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    handleDrop(index);
                  }}
                  onDragEnd={() => {
                    setDraggedIdx(null);
                    setDragOverIdx(null);
                  }}
                  className={`cursor-grab active:cursor-grabbing group relative flex flex-col justify-start rounded-2xl border-2 p-6 text-left transition-all duration-200 select-none ${
                    draggedIdx === index
                      ? "opacity-30 scale-95 border-dashed border-orange-500 ring-2 ring-orange-500/30"
                      : ""
                  } ${
                    dragOverIdx === index && draggedIdx !== index ? "border-orange-500 scale-[1.02] ring-2 ring-orange-500/20" : ""
                  } ${
                    card.isActive
                      ? "bg-white dark:bg-[#141B31] border-gray-200 dark:border-[#2C3246] hover:border-gray-300 dark:hover:border-gray-600 shadow-sm"
                      : "bg-gray-100/60 dark:bg-[#101626]/60 border-dashed border-gray-300 dark:border-gray-700 opacity-60"
                  }`}
                >
                  {/* Header Kartu: Posisi Drag & Drop Handle + Kanan Badge/Menu */}
                  <div className="flex items-center justify-between w-full mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded-md">
                        #{index + 1}
                      </span>
                      {!card.isActive && (
                        <span className="text-[11px] font-semibold text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-md">
                          Nonaktif
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 relative">
                      {/* Badge Teks */}
                      {card.showBadge && card.badgeText && (
                        <span className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white bg-rn-accent shadow-xs">
                          {card.badgeText}
                        </span>
                      )}

                      {/* Dropdown Menu Titik Tiga */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(isMenuOpen ? null : card.id);
                          }}
                          className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {isMenuOpen && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="absolute right-0 top-full mt-1 w-44 bg-white dark:bg-[#1A2238] rounded-xl shadow-xl border border-gray-200 dark:border-[#2C3246] py-1.5 z-20 animate-in fade-in zoom-in-95 duration-150"
                          >
                            <button
                              type="button"
                              onClick={() => handleToggleActive(card.id)}
                              className="w-full px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-2 transition-colors cursor-pointer"
                            >
                              {card.isActive ? (
                                <>
                                  <EyeOff className="w-3.5 h-3.5 text-rose-500" />
                                  <span>Nonaktifkan Kartu</span>
                                </>
                              ) : (
                                <>
                                  <Eye className="w-3.5 h-3.5 text-emerald-500" />
                                  <span>Aktifkan Kartu</span>
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Visual Animasi SVG Asli Card */}
                  <div className="pointer-events-none">
                    <HomeCardVisual id={card.id} />
                  </div>

                  {/* Konten Judul & Teks Deskripsi */}
                  <div className="relative mt-4 space-y-1">
                    <h4 className="font-heading text-lg font-bold leading-snug transition-colors duration-200 text-gray-900 dark:text-[#F3F4F6]">
                      {card.title}
                    </h4>
                    <p className="text-sm leading-relaxed transition-colors duration-200 text-gray-600 dark:text-[#9CA3AF] line-clamp-3">
                      {card.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        </div>
      )}

      {/* MODAL EDIT KONTEN & BADGE */}
      <HomepageEditModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        cards={cards}
        onSave={handleSaveModal}
      />
    </div>
  );
}
