"use client";

import React, { useState } from "react";
import { X, Save, Loader2, Tag } from "lucide-react";
import { HomepageCardConfig } from "@/lib/homepage-cards";

interface HomepageEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  cards: HomepageCardConfig[];
  onSave: (updatedCards: HomepageCardConfig[]) => Promise<void>;
}

export function HomepageEditModal({
  isOpen,
  onClose,
  cards,
  onSave,
}: HomepageEditModalProps) {
  const [localCards, setLocalCards] = useState<HomepageCardConfig[]>(cards);
  const [selectedId, setSelectedId] = useState<string>(cards[0]?.id || "ruang-belajar");
  const [isSaving, setIsSaving] = useState(false);

  // Sync if cards change
  React.useEffect(() => {
    setLocalCards(cards);
    if (!cards.find((c) => c.id === selectedId) && cards[0]) {
      setSelectedId(cards[0].id);
    }
  }, [cards, isOpen]);

  if (!isOpen) return null;

  const currentCard = localCards.find((c) => c.id === selectedId) || localCards[0];

  const handleFieldChange = (field: keyof HomepageCardConfig, value: any) => {
    setLocalCards((prev) =>
      prev.map((c) => (c.id === selectedId ? { ...c, [field]: value } : c))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(localCards);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white dark:bg-[#141B31] border border-gray-200 dark:border-[#2C3246] rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-gray-200 dark:border-[#2C3246] flex items-center justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Tag className="w-5 h-5 text-orange-500" />
              Edit Konten &amp; Badge Card
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Pilih kartu yang ingin disesuaikan judul, deskripsi, atau badgenya.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Card Selector Tabs */}
        <div className="px-5 sm:px-6 pt-4 pb-2 border-b border-gray-100 dark:border-[#2C3246]/60 flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
          {localCards.map((c) => {
            const isSelected = c.id === selectedId;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedId(c.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer border ${
                  isSelected
                    ? "bg-orange-500 text-white border-orange-500 shadow-sm shadow-orange-500/20"
                    : "bg-gray-100 dark:bg-[#0A1128] text-gray-600 dark:text-gray-400 border-gray-200 dark:border-[#2C3246] hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                {c.title}
              </button>
            );
          })}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {currentCard && (
            <>
              {/* Judul Card */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                  Judul Card
                </label>
                <input
                  type="text"
                  value={currentCard.title}
                  onChange={(e) => handleFieldChange("title", e.target.value)}
                  placeholder="Contoh: Ruang Belajar"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-[#2C3246] bg-gray-50 dark:bg-[#0A1128] text-gray-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500/30"
                />
              </div>

              {/* Deskripsi Card */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                  Teks Deskripsi
                </label>
                <textarea
                  rows={3}
                  value={currentCard.description}
                  onChange={(e) => handleFieldChange("description", e.target.value)}
                  placeholder="Deskripsi singkat yang tampil di bawah judul kartu..."
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-[#2C3246] bg-gray-50 dark:bg-[#0A1128] text-gray-900 dark:text-white text-xs sm:text-sm font-normal leading-relaxed focus:outline-none focus:ring-2 focus:ring-orange-500/30 resize-none"
                />
              </div>

              {/* Pengaturan Badge */}
              <div className="pt-2 border-t border-gray-100 dark:border-[#2C3246]">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 block">
                      Badge Pojok Kanan Atas
                    </label>
                    <span className="text-[11px] text-gray-400">
                      Tampilkan badge penanda khusus di atas kartu
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={currentCard.showBadge}
                      onChange={(e) => handleFieldChange("showBadge", e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5.5 bg-gray-200 dark:bg-[#0A1128] border border-gray-300 dark:border-[#2C3246] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-orange-500"></div>
                  </label>
                </div>

                {currentCard.showBadge && (
                  <div className="animate-in fade-in duration-150">
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                      Teks Badge
                    </label>
                    <input
                      type="text"
                      value={currentCard.badgeText}
                      onChange={(e) => handleFieldChange("badgeText", e.target.value)}
                      placeholder="Contoh: UPDATE BARU / COMING SOON / HOT"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-[#2C3246] bg-gray-50 dark:bg-[#0A1128] text-gray-900 dark:text-white text-xs sm:text-sm font-bold uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-orange-500/30"
                    />
                  </div>
                )}
              </div>
            </>
          )}

          {/* Footer Actions */}
          <div className="pt-4 border-t border-gray-100 dark:border-[#2C3246] flex items-center justify-end gap-2.5">
            <button
              type="button"
              disabled={isSaving}
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#2C3246] bg-white dark:bg-[#0A1128] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 text-xs font-bold transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 bg-[#f97316] hover:bg-[#ea580c] dark:bg-[#f97316] dark:hover:bg-[#fb923c] text-white px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm shadow-orange-500/20 disabled:opacity-50 cursor-pointer"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Simpan Perubahan</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
