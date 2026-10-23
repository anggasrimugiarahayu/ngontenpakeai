"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Flame,
  BookOpen,
  Wrench,
  Bot,
  Gem,
  Plus,
  Trash2,
  Check,
  Package,
  Save,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  PricingPackagesConfig,
  PricingPackageItem,
} from "@/lib/pricing-packages";

interface PricingEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: PricingPackagesConfig;
  products: any[];
  onSave: (newConfig: PricingPackagesConfig) => Promise<void>;
}

type TabType = "promo" | "PRO_BOOK" | "PRO_TOOLS" | "PRO_AUTOMATION" | "PRO_PLUS";

export function PricingEditModal({
  isOpen,
  onClose,
  config,
  products,
  onSave,
}: PricingEditModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>("promo");
  const [formData, setFormData] = useState<PricingPackagesConfig>(config);
  const [saving, setSaving] = useState(false);

  // Sync state whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData(JSON.parse(JSON.stringify(config)));
    }
  }, [isOpen, config]);

  if (!isOpen) return null;

  const handleUpdatePackage = (
    pkgKey: "PRO_BOOK" | "PRO_TOOLS" | "PRO_AUTOMATION" | "PRO_PLUS",
    field: keyof PricingPackageItem,
    value: any
  ) => {
    setFormData((prev) => ({
      ...prev,
      [pkgKey]: {
        ...prev[pkgKey],
        [field]: value,
      },
    }));
  };

  const handleUpdateFeature = (
    pkgKey: "PRO_BOOK" | "PRO_TOOLS" | "PRO_AUTOMATION" | "PRO_PLUS",
    idx: number,
    value: string
  ) => {
    const features = [...formData[pkgKey].features];
    features[idx] = value;
    handleUpdatePackage(pkgKey, "features", features);
  };

  const handleAddFeature = (
    pkgKey: "PRO_BOOK" | "PRO_TOOLS" | "PRO_AUTOMATION" | "PRO_PLUS"
  ) => {
    const features = [...formData[pkgKey].features, ""];
    handleUpdatePackage(pkgKey, "features", features);
  };

  const handleRemoveFeature = (
    pkgKey: "PRO_BOOK" | "PRO_TOOLS" | "PRO_AUTOMATION" | "PRO_PLUS",
    idx: number
  ) => {
    const features = formData[pkgKey].features.filter((_, i) => i !== idx);
    handleUpdatePackage(pkgKey, "features", features);
  };

  const handleToggleProduct = (
    pkgKey: "PRO_BOOK" | "PRO_TOOLS" | "PRO_AUTOMATION" | "PRO_PLUS",
    productId: string
  ) => {
    const current = [...(formData[pkgKey].bundledProductIds || [])];
    const exists = current.includes(productId);
    const updated = exists
      ? current.filter((id) => id !== productId)
      : [...current, productId];
    handleUpdatePackage(pkgKey, "bundledProductIds", updated);
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

  const tabs: { id: TabType; label: string; icon: any }[] = [
    { id: "promo", label: "Banner Promo", icon: Flame },
    { id: "PRO_BOOK", label: "Paket Ebook", icon: BookOpen },
    { id: "PRO_TOOLS", label: "Paket Tools", icon: Wrench },
    { id: "PRO_AUTOMATION", label: "Paket Automation", icon: Bot },
    { id: "PRO_PLUS", label: "Paket Lengkap", icon: Gem },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#141B31] w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl border border-gray-200 dark:border-[#2C3246] shadow-2xl flex flex-col">
        {/* Header Modal */}
        <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-[#2C3246] flex items-center justify-between shrink-0 bg-white dark:bg-[#141B31]">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
              Edit Paket Pricing &amp; Promo
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Atur banner promo, detail benefit, harga diskon, dan bundling otomatis e-book.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#1e2746] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 px-4 sm:px-5 pt-3 pb-2 border-b border-gray-100 dark:border-[#2C3246] overflow-x-auto scrollbar-hide shrink-0 bg-gray-50/70 dark:bg-[#0A1128]/40">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#f97316] text-white shadow-sm shadow-orange-500/30"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-200/60 dark:hover:bg-[#1e2746]"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Form Body - Scrollable */}
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
                      Pengaturan Teks &amp; Tampilan Promo
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

          {/* TAB 2-5: FORM PAKET SPESIFIK */}
          {activeTab !== "promo" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {(() => {
                const pkg = formData[activeTab];
                if (!pkg) return null;

                return (
                  <>
                    {/* Bagian Informasi Utama */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                          Nama Paket
                        </label>
                        <input
                          type="text"
                          value={pkg.name}
                          onChange={(e) =>
                            handleUpdatePackage(activeTab, "name", e.target.value)
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
                          value={pkg.highlightText || ""}
                          onChange={(e) =>
                            handleUpdatePackage(
                              activeTab,
                              "highlightText",
                              e.target.value
                            )
                          }
                          placeholder="Contoh: PALING WORTH"
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
                        value={pkg.desc}
                        onChange={(e) =>
                          handleUpdatePackage(activeTab, "desc", e.target.value)
                        }
                        className="w-full bg-gray-50 dark:bg-[#0A1128] border border-gray-300 dark:border-[#2C3246] rounded-xl px-3.5 py-2 text-sm text-gray-900 dark:text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none"
                      />
                    </div>

                    {/* Harga dan Diskon */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                          Harga Jual (Rp)
                        </label>
                        <input
                          type="number"
                          value={pkg.price}
                          onChange={(e) =>
                            handleUpdatePackage(
                              activeTab,
                              "price",
                              parseInt(e.target.value) || 0
                            )
                          }
                          className="w-full bg-gray-50 dark:bg-[#0A1128] border border-gray-300 dark:border-[#2C3246] rounded-xl px-3.5 py-2 text-sm text-gray-900 dark:text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                          Harga Coret Asli (Rp)
                        </label>
                        <input
                          type="number"
                          value={pkg.originalPrice}
                          onChange={(e) =>
                            handleUpdatePackage(
                              activeTab,
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
                          value={pkg.discountLabel || ""}
                          onChange={(e) =>
                            handleUpdatePackage(
                              activeTab,
                              "discountLabel",
                              e.target.value
                            )
                          }
                          placeholder="Misal: 95% OFF"
                          className="w-full bg-gray-50 dark:bg-[#0A1128] border border-gray-300 dark:border-[#2C3246] rounded-xl px-3.5 py-2 text-sm text-gray-900 dark:text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none"
                        />
                      </div>
                    </div>

                    <hr className="border-gray-200 dark:border-[#2C3246]" />

                    {/* Daftar Fitur / Checklist */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                          Daftar Fitur / Benefit (Checklist)
                        </label>
                        <button
                          type="button"
                          onClick={() => handleAddFeature(activeTab)}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-500 hover:text-orange-600 px-2 py-1 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-500/10 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Tambah Fitur</span>
                        </button>
                      </div>

                      <div className="space-y-2">
                        {pkg.features.map((feat, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-orange-500 shrink-0" />
                            <input
                              type="text"
                              value={feat}
                              onChange={(e) =>
                                handleUpdateFeature(activeTab, i, e.target.value)
                              }
                              placeholder="Ketik rincian fitur..."
                              className="flex-1 bg-gray-50 dark:bg-[#0A1128] border border-gray-300 dark:border-[#2C3246] rounded-xl px-3 py-2 text-sm text-gray-900 dark:text-white outline-none focus:border-orange-500"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveFeature(activeTab, i)}
                              className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors"
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
                        Centang e-book yang akan otomatis dimiliki oleh pembeli setelah pembayaran berhasil.
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto p-1 border border-gray-100 dark:border-[#2C3246] rounded-xl">
                        {products && products.length > 0 ? (
                          products.map((p) => {
                            const isBundled = (
                              pkg.bundledProductIds || []
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
                                  onChange={() =>
                                    handleToggleProduct(activeTab, p.id)
                                  }
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
                  </>
                );
              })()}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-gray-100 dark:border-[#2C3246] flex items-center justify-end gap-3 shrink-0 bg-gray-50/70 dark:bg-[#141B31]">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200/50 dark:hover:bg-[#1e2746] transition-colors"
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
