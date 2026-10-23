"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Flame,
  BookOpen,
  Wrench,
  Bot,
  Search,
  Gem,
  Plus,
  Trash2,
  Check,
  Package,
  Save,
  Loader2,
  Clock,
  Sparkles,
} from "lucide-react";
import {
  PricingPackagesConfig,
  PricingPackageItem,
  PricingCategoryKey,
  PRICING_CATEGORIES,
  generatePackageId,
} from "@/lib/pricing-packages";

interface PricingEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: PricingPackagesConfig;
  products: any[];
  initialCategory?: PricingCategoryKey;
  onSave: (newConfig: PricingPackagesConfig) => Promise<void>;
}

type ModalTab = "promo" | PricingCategoryKey;

export function PricingEditModal({
  isOpen,
  onClose,
  config,
  products,
  initialCategory = "ebook",
  onSave,
}: PricingEditModalProps) {
  const [activeTab, setActiveTab] = useState<ModalTab>(initialCategory);
  const [formData, setFormData] = useState<PricingPackagesConfig>(config);
  const [saving, setSaving] = useState(false);

  // Selected package ID within the active category
  const [selectedPkgId, setSelectedPkgId] = useState<string>("");

  // Sync state whenever modal opens
  useEffect(() => {
    if (isOpen) {
      const cloned: PricingPackagesConfig = JSON.parse(JSON.stringify(config));
      setFormData(cloned);
      setActiveTab(initialCategory);

      // Pick first package in this category
      const firstInCat = cloned.categoryOrder?.[initialCategory]?.[0] || "";
      setSelectedPkgId(firstInCat);
    }
  }, [isOpen, config, initialCategory]);

  // When switching category tabs, select the first package of that category
  const handleSelectTab = (tab: ModalTab) => {
    setActiveTab(tab);
    if (tab !== "promo") {
      const list = formData.categoryOrder?.[tab] || [];
      if (list.length > 0) {
        setSelectedPkgId(list[0]);
      } else {
        setSelectedPkgId("");
      }
    }
  };

  if (!isOpen) return null;

  const currentPkg = selectedPkgId ? formData.packages?.[selectedPkgId] : null;

  const handleUpdateCurrentPkg = (
    field: keyof PricingPackageItem,
    value: any
  ) => {
    if (!selectedPkgId) return;
    setFormData((prev) => {
      const updatedPkg = {
        ...prev.packages[selectedPkgId],
        [field]: value,
      };
      return {
        ...prev,
        packages: {
          ...prev.packages,
          [selectedPkgId]: updatedPkg,
        },
        [selectedPkgId]: updatedPkg,
      };
    });
  };

  const handleUpdateFeature = (idx: number, value: string) => {
    if (!currentPkg) return;
    const features = [...currentPkg.features];
    features[idx] = value;
    handleUpdateCurrentPkg("features", features);
  };

  const handleAddFeature = () => {
    if (!currentPkg) return;
    const features = [...currentPkg.features, ""];
    handleUpdateCurrentPkg("features", features);
  };

  const handleRemoveFeature = (idx: number) => {
    if (!currentPkg) return;
    const features = currentPkg.features.filter((_, i) => i !== idx);
    handleUpdateCurrentPkg("features", features);
  };

  const handleToggleProduct = (productId: string) => {
    if (!currentPkg) return;
    const current = [...(currentPkg.bundledProductIds || [])];
    const exists = current.includes(productId);
    const updated = exists
      ? current.filter((id) => id !== productId)
      : [...current, productId];
    handleUpdateCurrentPkg("bundledProductIds", updated);
  };

  // Add a new package to the current active category
  const handleAddNewPackage = (category: PricingCategoryKey) => {
    const newId = generatePackageId(category);
    const newPackage: PricingPackageItem = {
      id: newId,
      category,
      name: `Paket Baru ${category === "ebook" ? "E-Book" : category.toUpperCase()}`,
      desc: "Deskripsi singkat mengenai paket ini.",
      price: 99000,
      originalPrice: 199000,
      discountLabel: "50% OFF",
      highlightText: "",
      periodLabel: category === "ebook" ? "Sekali Bayar" : "/bulan",
      subBillingText: category === "ebook" ? "Akses Selamanya" : "",
      durationDays: category === "ebook" ? 0 : 30,
      features: ["Fitur unggulan 1", "Fitur unggulan 2"],
      bundledProductIds: [],
      isActive: true,
    };

    setFormData((prev) => {
      const currentCatList = prev.categoryOrder?.[category] || [];
      return {
        ...prev,
        packages: {
          ...prev.packages,
          [newId]: newPackage,
        },
        categoryOrder: {
          ...prev.categoryOrder,
          [category]: [...currentCatList, newId],
        },
        [newId]: newPackage,
      };
    });

    setSelectedPkgId(newId);
  };

  // Delete a package
  const handleDeletePackage = (pkgId: string, category: PricingCategoryKey) => {
    if (confirm("Apakah Anda yakin ingin menghapus paket ini?")) {
      setFormData((prev) => {
        const newPackages = { ...prev.packages };
        delete newPackages[pkgId];

        const newCatOrder = {
          ...prev.categoryOrder,
          [category]: (prev.categoryOrder?.[category] || []).filter(
            (id) => id !== pkgId
          ),
        };

        const nextState = {
          ...prev,
          packages: newPackages,
          categoryOrder: newCatOrder,
        };
        delete nextState[pkgId];
        return nextState;
      });

      // Select next available package in category
      const remaining = (formData.categoryOrder?.[category] || []).filter(
        (id) => id !== pkgId
      );
      setSelectedPkgId(remaining[0] || "");
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(formData);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const categoryIcons: Record<PricingCategoryKey, any> = {
    ebook: BookOpen,
    tools: Wrench,
    automation: Bot,
    riset: Search,
    plus: Gem,
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#141B31] w-full max-w-5xl max-h-[92vh] overflow-hidden rounded-2xl border border-gray-200 dark:border-[#2C3246] shadow-2xl flex flex-col">
        {/* Header Modal */}
        <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-[#2C3246] flex items-center justify-between shrink-0 bg-white dark:bg-[#141B31]">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-orange-500" />
              <span>Edit Paket Pricing &amp; Promo</span>
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Kelola kategori (E-Book, Tools, Automation, Riset, Paket Plus), tambah paket baru, dan atur banner promo.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#1e2746] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigasi Kategori */}
        <div className="flex items-center gap-1.5 px-4 sm:px-5 pt-3 pb-2.5 border-b border-gray-100 dark:border-[#2C3246] overflow-x-auto scrollbar-hide shrink-0 bg-gray-50/70 dark:bg-[#0A1128]/50">
          {/* Tab Promo */}
          <button
            type="button"
            onClick={() => handleSelectTab("promo")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === "promo"
                ? "bg-white text-gray-900 dark:bg-[#1E2746] dark:text-white shadow-sm border border-gray-200/80 dark:border-[#3E4766]"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <Flame className="w-4 h-4 shrink-0 text-orange-500" />
            <span>Banner Promo</span>
          </button>

          <div className="w-[1px] h-5 bg-gray-200 dark:bg-[#2C3246] mx-1 shrink-0" />

          {/* Tab 5 Kategori */}
          {PRICING_CATEGORIES.map((cat) => {
            const isActive = activeTab === cat.id;
            const count = (formData.categoryOrder?.[cat.id] || []).length;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleSelectTab(cat.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? "bg-white text-gray-900 dark:bg-[#1E2746] dark:text-white shadow-sm border border-gray-200/80 dark:border-[#3E4766]"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <span>{cat.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive
                      ? "bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white"
                      : "bg-gray-200/80 dark:bg-white/5 text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* TAB 1: BANNER PROMO */}
          {activeTab === "promo" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="border border-orange-200 dark:border-orange-500/20 bg-orange-50/40 dark:bg-orange-500/5 rounded-2xl p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-orange-500 text-white flex items-center justify-center shrink-0">
                    <Flame className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white">
                      Pengaturan Teks &amp; Tampilan Banner Promo
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Teks promo ini muncul di tombol pill pada bagian atas beranda dan tombol kembali halaman harga.
                    </p>
                  </div>
                </div>

                <div className="space-y-4 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                      Kalimat / Teks Promo
                    </label>
                    <input
                      type="text"
                      value={formData.promoBanner?.text || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          promoBanner: {
                            ...prev.promoBanner,
                            text: e.target.value,
                          },
                        }))
                      }
                      placeholder="Contoh: PROMO hingga 95%"
                      className="w-full bg-white dark:bg-[#0A1128] border border-gray-300 dark:border-[#2C3246] rounded-xl px-3.5 py-2.5 text-sm text-gray-900 dark:text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3.5 bg-white dark:bg-[#0A1128] rounded-xl border border-gray-200 dark:border-[#2C3246]">
                    <div>
                      <span className="text-xs font-bold text-gray-900 dark:text-white block">
                        Tampilkan Tombol Promo di Beranda
                      </span>
                      <span className="text-[11px] text-gray-500 dark:text-gray-400">
                        Jika dinonaktifkan, tombol promo di atas judul beranda akan disembunyikan.
                      </span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={formData.promoBanner?.show !== false}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            promoBanner: {
                              ...prev.promoBanner,
                              show: e.target.checked,
                            },
                          }))
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                    </label>
                  </div>

                  {/* Live Visual Preview of Promo Button */}
                  <div className="pt-2">
                    <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-2">
                      Live Preview Tombol di Beranda:
                    </span>
                    <div className="p-4 bg-gray-100/60 dark:bg-[#0A1128]/80 rounded-xl border border-dashed border-gray-300 dark:border-[#2C3246] flex items-center justify-center">
                      <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 shadow-sm">
                        <Flame className="w-3.5 h-3.5 text-amber-500" fill="currentColor" />
                        {formData.promoBanner?.text || "PROMO hingga 95%"}
                        <span className="ml-0.5 text-sm leading-none">&rsaquo;</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2-6: KATEGORI PRODUK (EBOOK, TOOLS, AUTO, RISET, PLUS) */}
          {activeTab !== "promo" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Header Kategori & Tombol Tambah Paket */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-gray-50 dark:bg-[#0A1128]/70 rounded-2xl border border-gray-200 dark:border-[#2C3246]">
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white capitalize">
                    Daftar Paket di Kategori {activeTab}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Pilih paket untuk diedit atau tambahkan paket pricing baru untuk kategori ini.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleAddNewPackage(activeTab)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold text-xs shadow-sm shadow-orange-500/20 transition-all cursor-pointer whitespace-nowrap shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Paket Baru</span>
                </button>
              </div>

              {/* Sub-Tabs / Daftar Paket dalam Kategori Ini */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {(formData.categoryOrder?.[activeTab] || []).map((pkgId) => {
                  const pkg = formData.packages?.[pkgId];
                  if (!pkg) return null;
                  const isSelected = selectedPkgId === pkgId;

                  return (
                    <button
                      key={pkgId}
                      type="button"
                      onClick={() => setSelectedPkgId(pkgId)}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer whitespace-nowrap ${
                        isSelected
                          ? "border-orange-500 bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 shadow-sm"
                          : "border-gray-200 dark:border-[#2C3246] bg-white dark:bg-[#141B31] text-gray-700 dark:text-gray-300 hover:border-gray-300"
                      }`}
                    >
                      <span>{pkg.name}</span>
                      <span className="text-[10px] text-gray-400 font-mono">
                        (Rp {(pkg.price / 1000).toFixed(0)}k)
                      </span>
                      {pkg.highlightText && (
                        <span className="text-[9px] bg-orange-500 text-white px-1.5 py-0.2 rounded font-black uppercase">
                          {pkg.highlightText}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* FORM DETAIL PAKET YANG DIPILIH */}
              {currentPkg ? (
                <div className="space-y-6 pt-2">
                  <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-[#2C3246]">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
                        Editing Paket:
                      </span>
                      <span className="text-xs font-mono font-bold text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded">
                        {currentPkg.id}
                      </span>
                    </div>

                    {/* Tombol Hapus Paket */}
                    <button
                      type="button"
                      onClick={() => handleDeletePackage(currentPkg.id, activeTab)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-red-500 hover:text-red-600 px-2.5 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors cursor-pointer"
                      title="Hapus paket ini"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus Paket</span>
                    </button>
                  </div>

                  {/* Informasi Utama */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                        Nama Paket
                      </label>
                      <input
                        type="text"
                        value={currentPkg.name}
                        onChange={(e) =>
                          handleUpdateCurrentPkg("name", e.target.value)
                        }
                        className="w-full bg-gray-50 dark:bg-[#0A1128] border border-gray-300 dark:border-[#2C3246] rounded-xl px-3.5 py-2 text-sm text-gray-900 dark:text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                        Label Pita Atas / Highlight (Opsional)
                      </label>
                      <input
                        type="text"
                        value={currentPkg.highlightText || ""}
                        onChange={(e) =>
                          handleUpdateCurrentPkg("highlightText", e.target.value)
                        }
                        placeholder="Contoh: PALING WORTH / HEMAT 25%"
                        className="w-full bg-gray-50 dark:bg-[#0A1128] border border-gray-300 dark:border-[#2C3246] rounded-xl px-3.5 py-2 text-sm text-gray-900 dark:text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                      Deskripsi Pendek
                    </label>
                    <input
                      type="text"
                      value={currentPkg.desc}
                      onChange={(e) =>
                        handleUpdateCurrentPkg("desc", e.target.value)
                      }
                      className="w-full bg-gray-50 dark:bg-[#0A1128] border border-gray-300 dark:border-[#2C3246] rounded-xl px-3.5 py-2 text-sm text-gray-900 dark:text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none"
                    />
                  </div>

                  {/* Harga, Durasi & Diskon */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                        Harga Jual (Rp)
                      </label>
                      <input
                        type="number"
                        value={currentPkg.price}
                        onChange={(e) =>
                          handleUpdateCurrentPkg(
                            "price",
                            parseInt(e.target.value) || 0
                          )
                        }
                        className="w-full bg-gray-50 dark:bg-[#0A1128] border border-gray-300 dark:border-[#2C3246] rounded-xl px-3.5 py-2 text-sm text-gray-900 dark:text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                        Harga Coret (Rp)
                      </label>
                      <input
                        type="number"
                        value={currentPkg.originalPrice}
                        onChange={(e) =>
                          handleUpdateCurrentPkg(
                            "originalPrice",
                            parseInt(e.target.value) || 0
                          )
                        }
                        className="w-full bg-gray-50 dark:bg-[#0A1128] border border-gray-300 dark:border-[#2C3246] rounded-xl px-3.5 py-2 text-sm text-gray-900 dark:text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                        Label Diskon
                      </label>
                      <input
                        type="text"
                        value={currentPkg.discountLabel || ""}
                        onChange={(e) =>
                          handleUpdateCurrentPkg("discountLabel", e.target.value)
                        }
                        placeholder="Misal: 95% OFF"
                        className="w-full bg-gray-50 dark:bg-[#0A1128] border border-gray-300 dark:border-[#2C3246] rounded-xl px-3.5 py-2 text-sm text-gray-900 dark:text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                        Masa Aktif (Hari)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={currentPkg.durationDays ?? 30}
                          onChange={(e) =>
                            handleUpdateCurrentPkg(
                              "durationDays",
                              parseInt(e.target.value) || 0
                            )
                          }
                          placeholder="0 = Lifetime"
                          className="w-full bg-gray-50 dark:bg-[#0A1128] border border-gray-300 dark:border-[#2C3246] rounded-xl px-3.5 py-2 text-sm text-gray-900 dark:text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none"
                        />
                        <span className="absolute right-3 top-2.5 text-[10px] text-gray-400 font-bold">
                          {currentPkg.durationDays === 0
                            ? "Lifetime"
                            : `${currentPkg.durationDays} hari`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Label Periode & Teks Sub-billing */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                        Label Periode Harga
                      </label>
                      <input
                        type="text"
                        value={currentPkg.periodLabel || ""}
                        onChange={(e) =>
                          handleUpdateCurrentPkg("periodLabel", e.target.value)
                        }
                        placeholder="Misal: Sekali Bayar, /bulan, /3 bulan, /tahun"
                        className="w-full bg-gray-50 dark:bg-[#0A1128] border border-gray-300 dark:border-[#2C3246] rounded-xl px-3.5 py-2 text-sm text-gray-900 dark:text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                        Teks Sub-billing Tambahan (Opsional)
                      </label>
                      <input
                        type="text"
                        value={currentPkg.subBillingText || ""}
                        onChange={(e) =>
                          handleUpdateCurrentPkg("subBillingText", e.target.value)
                        }
                        placeholder="Misal: Bayar Rp 199.000 / 3 bulan atau Hemat Rp 68.000"
                        className="w-full bg-gray-50 dark:bg-[#0A1128] border border-gray-300 dark:border-[#2C3246] rounded-xl px-3.5 py-2 text-sm text-gray-900 dark:text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none"
                      />
                    </div>
                  </div>

                  <hr className="border-gray-200 dark:border-[#2C3246]" />

                  {/* Checklist Fitur / Benefit */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                        Daftar Fitur / Benefit (Checklist)
                      </label>
                      <button
                        type="button"
                        onClick={handleAddFeature}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-500 hover:text-orange-600 px-2 py-1 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-500/10 transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Tambah Fitur</span>
                      </button>
                    </div>

                    <div className="space-y-2">
                      {currentPkg.features.map((feat, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-orange-500 shrink-0" />
                          <input
                            type="text"
                            value={feat}
                            onChange={(e) => handleUpdateFeature(i, e.target.value)}
                            placeholder="Ketik rincian fitur..."
                            className="flex-1 bg-gray-50 dark:bg-[#0A1128] border border-gray-300 dark:border-[#2C3246] rounded-xl px-3 py-2 text-sm text-gray-900 dark:text-white outline-none focus:border-orange-500"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveFeature(i)}
                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors cursor-pointer"
                            title="Hapus fitur"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <hr className="border-gray-200 dark:border-[#2C3246]" />

                  {/* Bundling E-Book Otomatis */}
                  <div>
                    <label className="block text-sm font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
                      <Package className="w-4 h-4 text-orange-500" />
                      <span>E-Book Bundling Otomatis (Database Unlock)</span>
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                      Centang e-book yang akan otomatis dimiliki oleh member setelah pembayaran paket ini berhasil.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-52 overflow-y-auto p-1 border border-gray-100 dark:border-[#2C3246] rounded-xl">
                      {products && products.length > 0 ? (
                        products.map((p) => {
                          const isBundled = (
                            currentPkg.bundledProductIds || []
                          ).includes(p.id);

                          return (
                            <label
                              key={p.id}
                              className={`flex items-start gap-3 p-3 border rounded-xl cursor-pointer transition-all ${
                                isBundled
                                  ? "border-orange-500/50 bg-orange-50/20 dark:bg-orange-500/5"
                                  : "border-gray-200 dark:border-[#2C3246] hover:bg-gray-50 dark:hover:bg-white/5"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isBundled}
                                onChange={() => handleToggleProduct(p.id)}
                                className="mt-0.5 rounded text-orange-500 focus:ring-orange-500 border-gray-300 dark:border-gray-700 bg-transparent w-4 h-4"
                              />
                              <div className="flex flex-col">
                                <span className="text-xs font-bold text-gray-900 dark:text-white line-clamp-1 leading-tight">
                                  {p.title}
                                </span>
                                <span className="text-[10px] text-gray-500 mt-0.5 font-medium">
                                  {p.accessLevel}
                                </span>
                              </div>
                            </label>
                          );
                        })
                      ) : (
                        <div className="col-span-2 text-center py-4 text-xs text-gray-400">
                          Tidak ada produk e-book yang tersedia.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-10 text-gray-400 text-sm">
                  Belum ada paket di kategori ini. Silakan klik tombol{" "}
                  <span className="font-bold text-orange-500">
                    + Tambah Paket Baru
                  </span>{" "}
                  di atas.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-gray-100 dark:border-[#2C3246] flex items-center justify-end gap-3 shrink-0 bg-gray-50/70 dark:bg-[#141B31]">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200/50 dark:hover:bg-[#1e2746] transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-[#f97316] hover:bg-[#ea580c] dark:bg-[#f97316] dark:hover:bg-[#fb923c] text-white px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-sm shadow-orange-500/20 transition-all disabled:opacity-50 cursor-pointer"
          >
            {saving ? (
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
      </div>
    </div>
  );
}
