"use client";

import React, { useState, useMemo, useEffect } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { mutate } from "swr";
import {
  Edit3,
  MoreVertical,
  Eye,
  EyeOff,
  Check,
  Plus,
  BookOpen,
  Wrench,
  Bot,
  Search,
  Gem,
  Ticket,
  Trash2,
  X,
  Save,
  Loader2,
} from "lucide-react";
import { saveAppSetting, createVoucher, deleteVoucher } from "@/app/actions/adminSettings";
import CustomSelect from "@/components/ui/CustomSelect";
import { confirmSwal } from "./tabs/confirmSwal";
import {
  PricingPackagesConfig,
  PricingCategoryKey,
  PRICING_CATEGORIES,
  mergePricingConfig,
} from "@/lib/pricing-packages";
import { PricingEditModal } from "./PricingEditModal";

export function PricingConfigSection({
  products,
  settings,
  vouchers,
}: {
  products: any[];
  settings: any[];
  vouchers?: any[];
}) {
  const router = useRouter();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [voucherList, setVoucherList] = useState<any[]>(vouchers || []);
  const [newVoucher, setNewVoucher] = useState({
    code: "",
    discountType: "PERCENTAGE",
    discountValue: 0,
    targetSelection: "ALL",
  });
  const [isSavingVoucher, setIsSavingVoucher] = useState(false);
  const [isDeletingVoucherId, setIsDeletingVoucherId] = useState<string | null>(null);

  useEffect(() => {
    if (vouchers) {
      setVoucherList(vouchers);
    }
  }, [vouchers]);

  const [selectedCategory, setSelectedCategory] =
    useState<PricingCategoryKey>("ebook");
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
    const targetPkg = config.packages?.[pkgKey] || config[pkgKey];
    if (!targetPkg) return;

    const newStatus = targetPkg.isActive === false;
    const updatedPkg = {
      ...targetPkg,
      isActive: newStatus,
    };

    const updatedConfig: PricingPackagesConfig = {
      ...config,
      packages: {
        ...config.packages,
        [pkgKey]: updatedPkg,
      },
      [pkgKey]: updatedPkg,
    };

    setConfig(updatedConfig);
    const ok = await saveConfig(updatedConfig);
    if (ok) {
      if (newStatus) {
        toast.success(`Paket ${targetPkg.name} berhasil diaktifkan!`);
      } else {
        toast.success(
          `Paket ${targetPkg.name} dinonaktifkan (disembunyikan dari beranda).`
        );
      }
    }
  };

  const handleDrop = async (dropIndex: number) => {
    if (draggedIdx === null || draggedIdx === dropIndex) {
      setDraggedIdx(null);
      setDragOverIdx(null);
      return;
    }

    const currentOrder = [...(config.categoryOrder?.[selectedCategory] || [])];
    const [movedItem] = currentOrder.splice(draggedIdx, 1);
    currentOrder.splice(dropIndex, 0, movedItem);

    setDraggedIdx(null);
    setDragOverIdx(null);

    const updatedConfig: PricingPackagesConfig = {
      ...config,
      categoryOrder: {
        ...config.categoryOrder,
        [selectedCategory]: currentOrder,
      },
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

  const categoryIcons: Record<PricingCategoryKey, any> = {
    ebook: BookOpen,
    tools: Wrench,
    automation: Bot,
    riset: Search,
    plus: Gem,
  };

  const currentCategoryPackageIds =
    config.categoryOrder?.[selectedCategory] || [];
  const activeCountInCurrentCat = currentCategoryPackageIds.filter(
    (id) => (config.packages?.[id] || config[id])?.isActive !== false
  ).length;

  // Bangun opsi target voucher (All, Kategori, Paket, Digital Product)
  const voucherTargetOptions = useMemo(() => {
    const opts: { value: string; label: string }[] = [
      { value: "ALL", label: "🌟 Semua Produk & Paket (All Products)" },
    ];

    // Opsi Kategori Paket
    PRICING_CATEGORIES.forEach((cat) => {
      opts.push({
        value: `CATEGORY:${cat.id}`,
        label: `📂 Semua Paket Kategori ${cat.label}`,
      });
    });

    // Opsi Paket Spesifik
    const allPkgKeys = Object.keys(config.packages || {});
    if (allPkgKeys.length > 0) {
      allPkgKeys.forEach((key) => {
        const pkg = config.packages[key];
        if (pkg) {
          opts.push({
            value: `PACKAGE:${pkg.id}`,
            label: `📦 Paket: ${pkg.name} (Rp ${(pkg.price / 1000).toFixed(0)}k)`,
          });
        }
      });
    }

    // Opsi Produk Digital Satuan (Ruang Belajar)
    if (products && products.length > 0) {
      products.forEach((p) => {
        const fmt =
          p.productType === "VIDEO"
            ? "Video"
            : p.productType === "NOTION"
            ? "Notion"
            : "E-Book";
        opts.push({
          value: `PRODUCT:${p.id}`,
          label: `📖 [${fmt}] ${p.title} (Rp ${(p.price || 0).toLocaleString("id-ID")})`,
        });
      });
    }

    return opts;
  }, [config.packages, products]);

  const handleSaveVoucher = async () => {
    const cleanCode = newVoucher.code.replace(/\s/g, "").toUpperCase();
    if (!cleanCode) return toast.error("Masukkan kode promo!");
    if (!newVoucher.discountValue || newVoucher.discountValue <= 0) {
      return toast.error("Nilai diskon harus lebih besar dari 0!");
    }

    let targetType = "ALL";
    let targetId: string | null = null;
    let targetTitle = "Semua Produk & Paket";
    let digitalProductId: string | null = null;

    if (newVoucher.targetSelection === "ALL") {
      targetType = "ALL";
      targetTitle = "Semua Produk & Paket";
    } else if (newVoucher.targetSelection.startsWith("CATEGORY:")) {
      const catKey = newVoucher.targetSelection.replace("CATEGORY:", "");
      const catObj = PRICING_CATEGORIES.find((c) => c.id === catKey);
      targetType = "CATEGORY";
      targetId = catKey;
      targetTitle = `Semua Paket ${catObj?.label || catKey}`;
    } else if (newVoucher.targetSelection.startsWith("PACKAGE:")) {
      const pkgId = newVoucher.targetSelection.replace("PACKAGE:", "");
      const pkg = config.packages?.[pkgId] || config[pkgId];
      targetType = "PACKAGE";
      targetId = pkgId;
      targetTitle = pkg?.name || pkgId;
    } else if (newVoucher.targetSelection.startsWith("PRODUCT:")) {
      const prodId = newVoucher.targetSelection.replace("PRODUCT:", "");
      const prod = products.find((p) => p.id === prodId);
      targetType = "DIGITAL_PRODUCT";
      targetId = prodId;
      digitalProductId = prodId;
      targetTitle = prod?.title || "Produk Digital";
    }

    setIsSavingVoucher(true);
    try {
      await createVoucher({
        code: cleanCode,
        discountType: newVoucher.discountType,
        discountValue: Number(newVoucher.discountValue),
        targetType,
        targetId,
        targetTitle,
        digitalProductId,
      });

      const createdItem = {
        id: "v-" + Date.now(),
        code: cleanCode,
        discountType: newVoucher.discountType,
        discountValue: Number(newVoucher.discountValue),
        targetType,
        targetId,
        targetTitle,
        digitalProductId,
        isActive: true,
      };
      setVoucherList((prev) => [createdItem, ...prev]);

      setNewVoucher({
        code: "",
        discountType: "PERCENTAGE",
        discountValue: 0,
        targetSelection: "ALL",
      });

      mutate("pengaturan");
      router.refresh();
      toast.success(`Voucher "${cleanCode}" berhasil disimpan!`);
    } catch (e: any) {
      toast.error(e?.message || "Gagal menyimpan voucher.");
    } finally {
      setIsSavingVoucher(false);
    }
  };

  const handleDeleteVoucher = async (id: string, code: string) => {
    if (!(await confirmSwal(`Hapus voucher "${code}"?`))) return;
    setIsDeletingVoucherId(id);
    try {
      await deleteVoucher(id);
      setVoucherList((prev) => prev.filter((v) => v.id !== id));
      mutate("pengaturan");
      router.refresh();
      toast.success(`Voucher "${code}" berhasil dihapus.`);
    } catch (e: any) {
      toast.error(e?.message || "Gagal menghapus voucher.");
    } finally {
      setIsDeletingVoucherId(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. HEADER CARD MANAJEMEN */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-gray-200 dark:border-[#2C3246] rounded-2xl p-6 bg-white dark:bg-[#141B31] shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
            Manajemen Pricing Paket
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Kelola kategori (E-Book, Tools, Automation, Riset, Paket Plus), atur durasi, harga diskon, dan urutan paket.
          </p>
        </div>

        {/* Tombol Aksi di Kanan Header: Voucher & Edit Paket (Desktop: flex, Mobile: 2 kolom seragam) */}
        <div className="grid grid-cols-2 sm:flex sm:items-center gap-2.5 w-full sm:w-auto shrink-0">
          <button
            type="button"
            onClick={() => setShowVoucherModal(true)}
            className="w-full sm:w-auto justify-center border border-orange-500/30 hover:border-orange-500/60 bg-white dark:bg-[#141B31] text-orange-600 dark:text-orange-400 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer shadow-xs"
          >
            <Ticket className="w-4 h-4" />
            <span>Voucher</span>
          </button>
          <button
            type="button"
            onClick={() => setIsEditModalOpen(true)}
            className="w-full sm:w-auto justify-center bg-[#f97316] hover:bg-[#ea580c] dark:bg-[#f97316] dark:hover:bg-[#fb923c] text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-sm shadow-orange-500/20 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer"
          >
            <Edit3 className="w-4 h-4" />
            <span>Edit Paket &amp; Promo</span>
          </button>
        </div>
      </div>

      {/* 2. LIVE PREVIEW SECTION */}
      <div className="space-y-5">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <div className="w-2 h-6 bg-rn-accent rounded-full"></div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Live Preview
            </h2>
          </div>
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
            {activeCountInCurrentCat} dari {currentCategoryPackageIds.length} Aktif
          </span>
        </div>

        {/* TAB SWITCHER KATEGORI (STYLE CARD SERAGAM) */}
        <div className="p-2 sm:p-2.5 bg-white dark:bg-[#141B31] rounded-2xl border border-gray-200 dark:border-[#2C3246] shadow-xs flex items-center">
          <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-gray-100/90 dark:bg-[#0A1128] border border-gray-200/80 dark:border-white/10 overflow-x-auto max-w-full scrollbar-hide">
            {PRICING_CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? "bg-white text-gray-900 dark:bg-[#1E2746] dark:text-white shadow-sm border border-gray-200/80 dark:border-[#3E4766]"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200/50 dark:hover:bg-white/5"
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* CARDS GRID (Sistem 3 Kolom Desktop, Rata Kiri, Ukuran Seragam) */}
        {currentCategoryPackageIds.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 w-full">
            {currentCategoryPackageIds.map((pkgKey, index) => {
              const pkg = config.packages?.[pkgKey] || config[pkgKey];
              if (!pkg) return null;

              const isMenuOpen = openMenuId === pkgKey;
              const isSpecial =
                pkg.highlightText && pkg.highlightText.trim().length > 0;
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
                  className={`w-full group relative flex flex-col justify-between rounded-2xl border-2 p-6 text-left transition-all duration-150 z-0 overflow-visible select-none cursor-grab active:cursor-grabbing ${
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

                    <div className="flex items-baseline gap-1 mb-0.5">
                      <span className="text-gray-900 dark:text-white font-black text-2xl tracking-tight">
                        Rp {formatK(pkg.price)}
                      </span>
                      {pkg.periodLabel && (
                        <span className="text-xs text-gray-400 font-semibold">
                          {pkg.periodLabel}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-gray-400 text-[11px] font-medium line-through">
                        Total Rp {pkg.originalPrice?.toLocaleString("id-ID")}
                      </span>
                      {pkg.discountLabel && (
                        <span className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-500 border border-red-200 dark:border-red-500/20 text-[9px] font-black px-1.5 py-0.2 rounded tracking-wider">
                          {pkg.discountLabel}
                        </span>
                      )}
                    </div>

                    {pkg.subBillingText && (
                      <p className="text-[11px] text-orange-600 dark:text-orange-400 font-semibold mb-3">
                        {pkg.subBillingText}
                      </p>
                    )}

                    {/* Checklist Fitur */}
                    <ul className="space-y-2 mb-5 mt-3">
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
                      Pilih {pkg.name}
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
        ) : (
          <div className="text-center py-12 border-2 border-dashed border-gray-200 dark:border-[#2C3246] rounded-2xl p-6">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
              Belum ada paket yang terdaftar di kategori ini.
            </p>
            <button
              type="button"
              onClick={() => setIsEditModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm shadow-orange-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Paket Baru</span>
            </button>
          </div>
        )}
      </div>

      {/* 3. MODAL EDIT TERPUSAT */}
      <PricingEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        config={config}
        products={products}
        initialCategory={selectedCategory}
        onSave={handleSaveModal}
      />

      {/* 4. MODAL BANK VOUCHER GLOBAL */}
      {showVoucherModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#141B31] rounded-2xl border border-gray-200 dark:border-[#2C3246] w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header Modal */}
            <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-[#2C3246] flex items-center justify-between shrink-0 bg-white dark:bg-[#141B31]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-orange-50 dark:bg-orange-500/10 text-orange-500 flex items-center justify-center shrink-0 border border-orange-500/20">
                  <Ticket className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base sm:text-lg text-gray-900 dark:text-white">
                    Bank Voucher &amp; Promo
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Kelola voucher diskon untuk seluruh paket atau produk spesifik.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowVoucherModal(false)}
                className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#1e2746] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-5 custom-scrollbar">
              {/* Form Input Voucher Baru */}
              <div className="p-4 bg-gray-50/80 dark:bg-[#0A1128]/70 border border-gray-200 dark:border-[#2C3246] rounded-2xl space-y-3.5">
                <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                  Buat Voucher Baru
                </h4>

                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider block mb-1">
                      Kode Promo
                    </label>
                    <input
                      type="text"
                      placeholder="CONTOH: PROMO50 / HEMAT99"
                      value={newVoucher.code}
                      onChange={(e) =>
                        setNewVoucher({
                          ...newVoucher,
                          code: e.target.value.replace(/\s/g, "").toUpperCase(),
                        })
                      }
                      className="w-full bg-white dark:bg-[#141B31] border border-gray-300 dark:border-[#2C3246] rounded-xl px-3.5 py-2 text-sm uppercase font-mono font-bold text-gray-900 dark:text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <CustomSelect
                        label="Tipe Diskon"
                        value={newVoucher.discountType}
                        onChange={(val) =>
                          setNewVoucher({ ...newVoucher, discountType: val })
                        }
                        options={[
                          { value: "PERCENTAGE", label: "Persen (%)" },
                          { value: "NOMINAL", label: "Nominal (Rp)" },
                        ]}
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider block mb-1">
                        Nilai Diskon
                      </label>
                      <input
                        type="number"
                        placeholder={
                          newVoucher.discountType === "PERCENTAGE"
                            ? "Misal: 50 (untuk 50%)"
                            : "Misal: 10000 (untuk Rp 10.000)"
                        }
                        value={newVoucher.discountValue || ""}
                        onChange={(e) =>
                          setNewVoucher({
                            ...newVoucher,
                            discountValue: Math.max(
                              0,
                              parseInt(e.target.value) || 0
                            ),
                          })
                        }
                        className="w-full bg-white dark:bg-[#141B31] border border-gray-300 dark:border-[#2C3246] rounded-xl px-3.5 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                      />
                    </div>
                  </div>

                  <div>
                    <CustomSelect
                      label="Berlaku Untuk (Target Voucher)"
                      placeholder="Pilih target voucher..."
                      value={newVoucher.targetSelection}
                      onChange={(val) =>
                        setNewVoucher({ ...newVoucher, targetSelection: val })
                      }
                      options={voucherTargetOptions}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleSaveVoucher}
                    disabled={isSavingVoucher}
                    className="w-full mt-2 flex items-center justify-center gap-2 bg-[#f97316] hover:bg-[#ea580c] dark:bg-[#f97316] dark:hover:bg-[#fb923c] text-white font-bold py-2.5 rounded-xl shadow-sm shadow-orange-500/20 disabled:opacity-50 transition-all cursor-pointer text-xs sm:text-sm"
                  >
                    {isSavingVoucher ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Menyimpan...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Simpan Voucher</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Daftar Voucher Tersimpan */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                    Daftar Voucher Tersimpan ({voucherList.length})
                  </h4>
                </div>

                <div className="space-y-2.5 max-h-64 overflow-y-auto custom-scrollbar pr-1">
                  {voucherList.length > 0 ? (
                    voucherList.map((v: any) => (
                      <div
                        key={v.id}
                        className="flex items-center justify-between p-3.5 rounded-xl border border-gray-200 dark:border-[#2C3246] bg-white dark:bg-[#0A1128] transition-all hover:border-gray-300"
                      >
                        <div className="flex-1 min-w-0 pr-3">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="font-mono font-black text-gray-900 dark:text-white uppercase text-sm tracking-wide">
                              {v.code}
                            </span>
                            <span className="bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-500/20 text-[10px] font-bold px-2 py-0.5 rounded-full">
                              {v.discountType === "PERCENTAGE"
                                ? `${v.discountValue}% OFF`
                                : `Potongan Rp ${(v.discountValue || 0).toLocaleString("id-ID")}`}
                            </span>
                          </div>
                          <div className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                            Berlaku untuk:{" "}
                            <span className="font-semibold text-gray-700 dark:text-gray-300">
                              {v.targetTitle || v.product?.title || (v.targetType === "ALL" ? "Semua Produk & Paket" : "Produk Tertentu")}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteVoucher(v.id, v.code)}
                          disabled={isDeletingVoucherId === v.id}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors shrink-0 cursor-pointer disabled:opacity-50"
                          title="Hapus voucher"
                        >
                          {isDeletingVoucherId === v.id ? (
                            <Loader2 className="w-4 h-4 animate-spin text-red-500" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 border border-dashed border-gray-200 dark:border-[#2C3246] rounded-xl">
                      <Ticket className="w-8 h-8 mx-auto text-gray-300 dark:text-gray-600 mb-2 opacity-40" />
                      <p className="text-xs text-gray-400">
                        Belum ada voucher aktif yang tersimpan.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
