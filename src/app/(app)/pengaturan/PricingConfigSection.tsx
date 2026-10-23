"use client";

import React, { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { mutate } from "swr";
import {
  Edit3,
  MoreVertical,
  Eye,
  EyeOff,
  Check,
} from "lucide-react";
import { saveAppSetting } from "@/app/actions/adminSettings";
import {
  PricingPackagesConfig,
  mergePricingConfig,
} from "@/lib/pricing-packages";
import { PricingEditModal } from "./PricingEditModal";

export function PricingConfigSection({
  products,
  settings,
}: {
  products: any[];
  settings: any[];
}) {
  const router = useRouter();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Drag and drop state
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  // Parse settings
  const settingRaw = settings?.find((s) => s.key === "PRICING_PACKAGES")?.value;
  let parsedConfig: any = null;
  try {
    if (settingRaw) {
      parsedConfig = JSON.parse(settingRaw);
    }
  } catch (e) {
    console.error("Failed to parse PRICING_PACKAGES:", e);
  }

  const [config, setConfig] = useState<PricingPackagesConfig>(() =>
    mergePricingConfig(parsedConfig)
  );

  const formatK = (price: number) => {
    if (price >= 1000) return price / 1000 + "k";
    return price.toString();
  };

  const saveConfig = async (newConfig: PricingPackagesConfig) => {
    try {
      await saveAppSetting("PRICING_PACKAGES", JSON.stringify(newConfig));
      setConfig(newConfig);
      mutate("pengaturan");
      router.refresh();
      return true;
    } catch (e) {
      console.error(e);
      toast.error("Gagal menyimpan konfigurasi pricing");
      return false;
    }
  };

  const handleToggleActive = async (pkgKey: string) => {
    setOpenMenuId(null);
    const targetPkg = config[pkgKey];
    if (!targetPkg) return;

    const newStatus = targetPkg.isActive === false;
    const updatedConfig: PricingPackagesConfig = {
      ...config,
      [pkgKey]: {
        ...targetPkg,
        isActive: newStatus,
      },
    };

    setConfig(updatedConfig);
    const ok = await saveConfig(updatedConfig);
    if (ok) {
      if (newStatus) {
        toast.success(`Paket ${targetPkg.name} berhasil diaktifkan!`);
      } else {
        toast.success(`Paket ${targetPkg.name} dinonaktifkan (disembunyikan dari beranda).`);
      }
    }
  };

  const handleDrop = async (dropIndex: number) => {
    if (draggedIdx === null || draggedIdx === dropIndex) {
      setDraggedIdx(null);
      setDragOverIdx(null);
      return;
    }

    const newOrder = [...config.packageOrder];
    const [movedItem] = newOrder.splice(draggedIdx, 1);
    newOrder.splice(dropIndex, 0, movedItem);

    setDraggedIdx(null);
    setDragOverIdx(null);

    const updatedConfig: PricingPackagesConfig = {
      ...config,
      packageOrder: newOrder,
    };

    setConfig(updatedConfig);
    const ok = await saveConfig(updatedConfig);
    if (ok) {
      toast.success("Urutan paket pricing berhasil diperbarui!");
    }
  };

  const handleSaveModal = async (newConfig: PricingPackagesConfig) => {
    const ok = await saveConfig(newConfig);
    if (ok) {
      toast.success("Konfigurasi paket & promo berhasil disimpan!");
    }
  };

  const activeCount = config.packageOrder.filter(
    (key) => config[key]?.isActive !== false
  ).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. HEADER CARD (METODE PERSIS SEPERTI HOMEPAGE & RUANG BELAJAR) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-gray-200 dark:border-[#2C3246] rounded-2xl p-6 bg-white dark:bg-[#141B31] shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
            Manajemen Pricing Paket
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Kelola pricing paket, promo, urutan posisi, dan aktifkan atau nonaktifkan paket langganan.
          </p>
        </div>

        {/* 1 Tombol Utama di Kanan Header */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setIsEditModalOpen(true)}
            className="justify-center bg-[#f97316] hover:bg-[#ea580c] dark:bg-[#f97316] dark:hover:bg-[#fb923c] text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-sm shadow-orange-500/20 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer"
          >
            <Edit3 className="w-4 h-4" />
            <span>Edit Paket &amp; Promo</span>
          </button>
        </div>
      </div>

      {/* 2. LIVE PREVIEW SECTION */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <div className="w-2 h-6 bg-rn-accent rounded-full"></div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Live Preview
            </h2>
          </div>
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
            {activeCount} dari {config.packageOrder.length} Aktif
          </span>
        </div>

        {/* DRAGGABLE CARDS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
          {config.packageOrder.map((pkgKey, index) => {
            const pkg = config[pkgKey];
            if (!pkg) return null;

            const isMenuOpen = openMenuId === pkgKey;
            const isSpecial = pkg.highlightText && pkg.highlightText.trim().length > 0;
            const isActive = pkg.isActive !== false;

            return (
              <div
                key={pkgKey}
                draggable
                onDragStart={(e) => {
                  setDraggedIdx(index);
                  e.dataTransfer.effectAllowed = "move";
                  e.dataTransfer.setData("text/plain", pkgKey);
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
                className={`group relative flex flex-col justify-between rounded-2xl border-2 p-5 text-left transition-all duration-150 z-0 overflow-visible select-none cursor-grab active:cursor-grabbing ${
                  draggedIdx === index
                    ? "opacity-30 scale-95 border-dashed border-orange-500 ring-2 ring-orange-500/30"
                    : ""
                } ${
                  dragOverIdx === index && draggedIdx !== index
                    ? "ring-2 ring-orange-500 shadow-2xl border-orange-500 scale-[1.02]"
                    : ""
                } ${
                  isActive
                    ? isSpecial
                      ? "border-orange-500 bg-white dark:bg-[#141B31] shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                      : "border-gray-200 dark:border-[#2C3246] bg-white dark:bg-[#141B31] shadow-sm hover:border-gray-300 dark:hover:border-[#3E4766] hover:shadow-md hover:-translate-y-0.5"
                    : "opacity-50 grayscale-[40%] bg-gray-50/80 dark:bg-[#141B31]/50 border-dashed border-gray-300 dark:border-[#2C3246]"
                }`}
              >
                {/* Ribbon Highlight Pita Atas */}
                {isSpecial && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-[9px] font-black uppercase px-3 py-0.5 rounded-full tracking-widest border-[3px] border-white dark:border-[#141B31] whitespace-nowrap shadow-sm z-10 pointer-events-none">
                    {pkg.highlightText}
                  </div>
                )}

                {/* Pojok Kanan Atas: Titik Tiga (⋮) untuk Enable/Disable */}
                <div
                  className="absolute top-3 right-3 z-20"
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() => setOpenMenuId(isMenuOpen ? null : pkgKey)}
                    className={`p-1.5 rounded-lg border transition-colors shadow-2xs ${
                      isActive
                        ? "bg-white/90 dark:bg-[#141B31] border-gray-200 dark:border-[#2C3246] text-gray-600 dark:text-gray-300 hover:text-orange-500 hover:border-orange-500"
                        : "bg-red-500/10 border-red-500/30 text-red-500 hover:bg-red-500/20"
                    }`}
                    title="Pengaturan Enable / Disable Paket"
                  >
                    <MoreVertical size={15} />
                  </button>

                  {/* Dropdown Menu Titik Tiga */}
                  {isMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-30"
                        onClick={() => setOpenMenuId(null)}
                      />
                      <div className="absolute right-0 top-full mt-1.5 w-48 bg-white dark:bg-[#141B31] rounded-2xl shadow-2xl border border-gray-200 dark:border-[#2C3246] p-2 z-40 text-xs animate-in fade-in zoom-in-95 duration-150">
                        <div className="px-2.5 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-[#2C3246] mb-1 flex items-center justify-between">
                          <span>Status Paket</span>
                          <span
                            className={`w-2 h-2 rounded-full ${
                              isActive ? "bg-emerald-500" : "bg-gray-400"
                            }`}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleToggleActive(pkgKey)}
                          className={`w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-xl font-bold transition-colors text-left cursor-pointer ${
                            isActive
                              ? "hover:bg-red-50 dark:hover:bg-red-500/10 text-gray-700 dark:text-gray-200 hover:text-red-600 dark:hover:text-red-400"
                              : "hover:bg-emerald-50 dark:hover:bg-emerald-500/10 text-gray-700 dark:text-gray-200 hover:text-emerald-600 dark:hover:text-emerald-400"
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            {isActive ? (
                              <EyeOff size={14} className="text-red-500" />
                            ) : (
                              <Eye size={14} className="text-emerald-500" />
                            )}
                            {isActive ? "Nonaktifkan Paket" : "Aktifkan Paket"}
                          </span>
                        </button>
                      </div>
                    </>
                  )}
                </div>

                {/* Konten Card Atas */}
                <div>
                  <h3 className="text-gray-900 dark:text-white font-bold text-lg mb-1 leading-tight pr-8">
                    {pkg.name}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-[11px] mb-3 leading-relaxed line-clamp-2">
                    {pkg.desc}
                  </p>

                  <div className="text-gray-900 dark:text-white font-black text-2xl mb-0.5 tracking-tight">
                    Rp {formatK(pkg.price)}
                  </div>
                  <div className="text-gray-400 text-[11px] font-medium mb-1.5 line-through">
                    Total Rp {pkg.originalPrice?.toLocaleString("id-ID")}
                  </div>
                  {pkg.discountLabel && (
                    <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-500 border border-red-200 dark:border-red-500/20 text-[9px] font-black px-1.5 py-0.5 rounded w-max mb-4 tracking-wider">
                      {pkg.discountLabel}
                    </div>
                  )}

                  {/* Checklist Fitur */}
                  <ul className="space-y-2 mb-5">
                    {pkg.features.map((feat: string, i: number) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-[11px] text-gray-700 dark:text-gray-300 font-medium"
                      >
                        <Check className="w-3.5 h-3.5 text-orange-500 shrink-0 mt-0.5" />
                        <span className="leading-snug">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Bagian Bawah: Tombol Preview */}
                <div>
                  <button
                    type="button"
                    tabIndex={-1}
                    className={`w-full py-2.5 rounded-xl font-black text-xs transition-all pointer-events-none ${
                      isSpecial
                        ? "bg-[#f97316] text-white shadow-sm shadow-orange-500/20"
                        : "bg-white border border-gray-200 text-gray-700 dark:bg-[#141B31] dark:border-[#2C3246] dark:text-gray-200"
                    }`}
                  >
                    {pkg.name.includes("Basic") ||
                    pkg.name.includes("Book") ||
                    pkg.name.includes("Ebook")
                      ? "Pilih Paket Ebook"
                      : pkg.name.includes("Auto")
                      ? "Pilih Paket Automation"
                      : pkg.name.includes("Tools")
                      ? "Pilih Sistem Tools"
                      : "Pilih Paket Lengkap"}
                  </button>

                  {!isActive && (
                    <div className="mt-2 text-center text-[10px] font-semibold text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-[#0A1128] py-1 px-2 rounded-lg border border-dashed border-gray-200 dark:border-[#2C3246]">
                      Nonaktif (Dihilangkan dari Beranda)
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. MODAL EDIT MULTI-TAB (PROMO & 4 PAKET) */}
      <PricingEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        config={config}
        products={products}
        onSave={handleSaveModal}
      />
    </div>
  );
}
