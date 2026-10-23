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
} from "lucide-react";
import {
  HomepageCardConfig,
  DEFAULT_HOMEPAGE_CARDS,
  mergeHomepageCards,
} from "@/lib/homepage-cards";
import { saveHomepageCardsAction } from "@/app/actions/adminSettings";
import { HomeCardVisual } from "@/components/home/HomeCardVisuals";
import { HomepageEditModal } from "./HomepageEditModal";

export function AdminHomepageTab({ settings }: { settings: any[] }) {
  const router = useRouter();

  // Find stored settings
  const rawSetting = settings?.find((s) => s.key === "HOMEPAGE_CARDS")?.value;
  let initialCards = DEFAULT_HOMEPAGE_CARDS;
  try {
    if (rawSetting) {
      initialCards = mergeHomepageCards(JSON.parse(rawSetting));
    }
  } catch (e) {
    console.error("Failed to parse HOMEPAGE_CARDS setting:", e);
  }

  const [cards, setCards] = useState<HomepageCardConfig[]>(initialCards);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  useEffect(() => {
    if (rawSetting) {
      try {
        setCards(mergeHomepageCards(JSON.parse(rawSetting)));
      } catch (e) {}
    }
  }, [rawSetting]);

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
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. CARD HEADER ATAS (PERSIS TAMPILAN RUANG BELAJAR) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-gray-200 dark:border-[#2C3246] rounded-2xl p-6 bg-white dark:bg-[#141B31] shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
            Manajemen Homepage
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Kelola tampilan kartu beranda, atur urutan posisi dengan drag &amp; drop, serta aktifkan atau nonaktifkan kartu.
          </p>
        </div>

        {/* Tombol Edit Teks & Badge di Header Kanan */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setShowEditModal(true)}
            className="justify-center bg-[#f97316] hover:bg-[#ea580c] dark:bg-[#f97316] dark:hover:bg-[#fb923c] text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-sm shadow-orange-500/20 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer"
          >
            <Edit3 className="w-4 h-4" />
            <span>Edit Konten &amp; Badge</span>
          </button>
        </div>
      </div>

      {/* 2. GRID 4 KARTU BERBENTUK FISIK ASLI HOMEPAGE */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <div className="w-2 h-6 bg-rn-accent rounded-full"></div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Live Preview</h2>
          </div>
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
            {cards.filter((c) => c.isActive).length} dari {cards.length} Aktif
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full">
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
                className={`group relative flex flex-col justify-start rounded-xl border-2 p-6 text-left transition-all duration-150 z-0 overflow-visible bg-white dark:bg-[#141B31] select-none cursor-grab active:cursor-grabbing ${
                  draggedIdx === index
                    ? "opacity-30 scale-95 border-dashed border-orange-500 ring-2 ring-orange-500/30"
                    : ""
                } ${
                  dragOverIdx === index && draggedIdx !== index
                    ? "ring-2 ring-orange-500 shadow-2xl border-orange-500 scale-[1.02]"
                    : ""
                } ${
                  card.isActive
                    ? "border-gray-200 dark:border-[#2C3246] hover:border-gray-300 dark:hover:border-[#3E4766] hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(0,0,0,0.25)]"
                    : "opacity-50 grayscale-[40%] bg-gray-50/80 dark:bg-[#141B31]/50 border-dashed border-gray-300 dark:border-[#2C3246]"
                }`}
              >
                {/* Top Corner: Badge & Tombol Titik Tiga (⋮) */}
                <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5">
                  {/* Badge (jika showBadge aktif & ada teks) */}
                  {card.showBadge && card.badgeText && (
                    <span className="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white bg-orange-500 shadow-sm shrink-0">
                      {card.badgeText}
                    </span>
                  )}

                  {/* Tombol Titik Tiga (⋮) Khusus untuk Enable/Disable */}
                  <div className="relative" onMouseDown={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => setOpenMenuId(isMenuOpen ? null : card.id)}
                      className={`p-1.5 rounded-lg border transition-colors shadow-2xs ${
                        card.isActive
                          ? "bg-white/90 dark:bg-[#141B31] border-gray-200 dark:border-[#2C3246] text-gray-600 dark:text-gray-300 hover:text-orange-500 hover:border-orange-500"
                          : "bg-red-500/10 border-red-500/30 text-red-500 hover:bg-red-500/20"
                      }`}
                      title="Pengaturan Enable / Disable Card"
                    >
                      <MoreVertical size={15} />
                    </button>

                    {/* Dropdown Popup Titik Tiga */}
                    {isMenuOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-30"
                          onClick={() => setOpenMenuId(null)}
                        />
                        <div className="absolute right-0 top-full mt-1.5 w-48 bg-white dark:bg-[#141B31] rounded-2xl shadow-2xl border border-gray-200 dark:border-[#2C3246] p-2 z-40 text-xs animate-in fade-in zoom-in-95 duration-150">
                          <div className="px-2.5 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-[#2C3246] mb-1 flex items-center justify-between">
                            <span>Status Card</span>
                            <span
                              className={`w-2 h-2 rounded-full ${
                                card.isActive ? "bg-emerald-500" : "bg-gray-400"
                              }`}
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => handleToggleActive(card.id)}
                            className={`w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-xl font-bold transition-colors text-left cursor-pointer ${
                              card.isActive
                                ? "hover:bg-red-50 dark:hover:bg-red-500/10 text-gray-700 dark:text-gray-200 hover:text-red-600 dark:hover:text-red-400"
                                : "hover:bg-emerald-50 dark:hover:bg-emerald-500/10 text-gray-700 dark:text-gray-200 hover:text-emerald-600 dark:hover:text-emerald-400"
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              {card.isActive ? (
                                <EyeOff size={14} className="text-red-500" />
                              ) : (
                                <Eye size={14} className="text-emerald-500" />
                              )}
                              {card.isActive ? "Nonaktifkan Card" : "Aktifkan Card"}
                            </span>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Visual Animasi SVG Asli Card */}
                <div className="pointer-events-none">
                  <HomeCardVisual id={card.id} />
                </div>

                {/* Konten Judul & Teks Deskripsi */}
                <div className="relative mt-4 space-y-1">
                  <h2 className="font-heading text-lg font-bold leading-snug transition-colors duration-200 text-gray-900 dark:text-[#F3F4F6]">
                    {card.title}
                  </h2>
                  <p className="text-sm leading-relaxed transition-colors duration-200 text-gray-600 dark:text-[#9CA3AF] line-clamp-3">
                    {card.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. MODAL EDIT KONTEN & BADGE */}
      <HomepageEditModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        cards={cards}
        onSave={handleSaveModal}
      />
    </div>
  );
}
