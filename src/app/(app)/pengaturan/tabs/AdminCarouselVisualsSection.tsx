"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { mutate } from "swr";
import toast from "react-hot-toast";
import {
  Palette,
  Type,
  Plus,
  Edit2,
  Trash2,
  Sparkles,
  Search,
  Check,
  Copy,
  X,
  Save,
  Loader2,
  Layers,
} from "lucide-react";
import { Switch } from "@/components/ui/Switch";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { confirmSwal } from "./confirmSwal";
import {
  upsertCarouselStyleArt,
  toggleCarouselStyleArt,
  deleteCarouselStyleArt,
  upsertCarouselFont,
  toggleCarouselFont,
  deleteCarouselFont,
  seedDefaultCarouselStylesAndFonts,
} from "@/app/actions/adminSettings";
import { cn } from "@/lib/design-tokens";

interface CarouselVisualItem {
  id: string;
  kode: string;
  namaLabel: string;
  deskripsiPrompt: string;
  isActive: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

interface AdminCarouselVisualsSectionProps {
  initialStyles?: CarouselVisualItem[];
  initialFonts?: CarouselVisualItem[];
}

export function AdminCarouselVisualsSection({
  initialStyles = [],
  initialFonts = [],
}: AdminCarouselVisualsSectionProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"styles" | "fonts">("styles");
  const [styles, setStyles] = useState<CarouselVisualItem[]>(initialStyles);
  const [fonts, setFonts] = useState<CarouselVisualItem[]>(initialFonts);
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editingItem, setEditingItem] = useState<CarouselVisualItem | null>(null);
  const [formData, setFormData] = useState({
    id: "",
    kode: "",
    namaLabel: "",
    deskripsiPrompt: "",
    isActive: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  useEffect(() => {
    setStyles(initialStyles);
  }, [initialStyles]);

  useEffect(() => {
    setFonts(initialFonts);
  }, [initialFonts]);

  // Copy helper
  const handleCopyPrompt = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success("Prompt disalin ke clipboard!");
  };

  // Toggle active status
  const handleToggleActive = async (item: CarouselVisualItem, nextVal: boolean) => {
    if (activeTab === "styles") {
      const prev = [...styles];
      setStyles((cur) => cur.map((s) => (s.id === item.id ? { ...s, isActive: nextVal } : s)));
      try {
        await toggleCarouselStyleArt(item.id, nextVal);
        mutate("pengaturan");
        router.refresh();
        toast.success(`Style ${item.kode} ${nextVal ? "diaktifkan" : "dinonaktifkan"}`);
      } catch (e: any) {
        setStyles(prev);
        toast.error("Gagal mengubah status Style Art");
      }
    } else {
      const prev = [...fonts];
      setFonts((cur) => cur.map((f) => (f.id === item.id ? { ...f, isActive: nextVal } : f)));
      try {
        await toggleCarouselFont(item.id, nextVal);
        mutate("pengaturan");
        router.refresh();
        toast.success(`Font ${item.kode} ${nextVal ? "diaktifkan" : "dinonaktifkan"}`);
      } catch (e: any) {
        setFonts(prev);
        toast.error("Gagal mengubah status Font");
      }
    }
  };

  // Delete item
  const handleDeleteItem = async (item: CarouselVisualItem) => {
    const confirmed = await confirmSwal(
      `Hapus ${activeTab === "styles" ? "Style Art" : "Font"} "${item.namaLabel}" (${item.kode})?`
    );
    if (!confirmed) return;

    if (activeTab === "styles") {
      const prev = [...styles];
      setStyles((cur) => cur.filter((s) => s.id !== item.id));
      try {
        await deleteCarouselStyleArt(item.id);
        mutate("pengaturan");
        router.refresh();
        toast.success("Style Art berhasil dihapus");
      } catch (e: any) {
        setStyles(prev);
        toast.error("Gagal menghapus Style Art");
      }
    } else {
      const prev = [...fonts];
      setFonts((cur) => cur.filter((f) => f.id !== item.id));
      try {
        await deleteCarouselFont(item.id);
        mutate("pengaturan");
        router.refresh();
        toast.success("Font berhasil dihapus");
      } catch (e: any) {
        setFonts(prev);
        toast.error("Gagal menghapus Font");
      }
    }
  };

  // Open modal create
  const handleOpenCreateModal = () => {
    const nextNum =
      activeTab === "styles"
        ? String(styles.length + 1).padStart(2, "0")
        : String(fonts.length + 1).padStart(2, "0");
    const defaultCode = activeTab === "styles" ? `STYLE_${nextNum}` : `FONT_${nextNum}`;

    setModalMode("create");
    setEditingItem(null);
    setFormData({
      id: "",
      kode: defaultCode,
      namaLabel: "",
      deskripsiPrompt: "",
      isActive: true,
    });
    setModalOpen(true);
  };

  // Open modal edit
  const handleOpenEditModal = (item: CarouselVisualItem) => {
    setModalMode("edit");
    setEditingItem(item);
    setFormData({
      id: item.id,
      kode: item.kode,
      namaLabel: item.namaLabel,
      deskripsiPrompt: item.deskripsiPrompt,
      isActive: item.isActive,
    });
    setModalOpen(true);
  };

  // Submit modal form
  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.kode.trim() || !formData.namaLabel.trim() || !formData.deskripsiPrompt.trim()) {
      toast.error("Semua field (Kode, Nama Label, dan Deskripsi Prompt) wajib diisi!");
      return;
    }

    setIsSubmitting(true);
    try {
      if (activeTab === "styles") {
        const res = await upsertCarouselStyleArt(formData);
        if (modalMode === "create") {
          setStyles((cur) => [...cur, res as any]);
          toast.success("Style Art baru berhasil ditambahkan!");
        } else {
          setStyles((cur) => cur.map((s) => (s.id === formData.id ? (res as any) : s)));
          toast.success("Style Art berhasil diperbarui!");
        }
      } else {
        const res = await upsertCarouselFont(formData);
        if (modalMode === "create") {
          setFonts((cur) => [...cur, res as any]);
          toast.success("Font baru berhasil ditambahkan!");
        } else {
          setFonts((cur) => cur.map((f) => (f.id === formData.id ? (res as any) : f)));
          toast.success("Font berhasil diperbarui!");
        }
      }

      setModalOpen(false);
      mutate("pengaturan");
      router.refresh();
    } catch (e: any) {
      toast.error(e.message || "Gagal menyimpan data");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Seed default items
  const handleSeedDefaults = async () => {
    const confirmed = await confirmSwal(
      "Muat setelan data bawaan (Default) untuk Style Art dan Font Carousel?"
    );
    if (!confirmed) return;

    setIsSeeding(true);
    try {
      await seedDefaultCarouselStylesAndFonts();
      mutate("pengaturan");
      router.refresh();
      toast.success("Preset default Style Art & Font berhasil dimuat!");
    } catch (e: any) {
      toast.error("Gagal memuat preset default: " + (e.message || "Terjadi kesalahan"));
    } finally {
      setIsSeeding(false);
    }
  };

  // Filter items based on active tab & search query
  const currentItems = activeTab === "styles" ? styles : fonts;
  const filteredItems = currentItems.filter((item) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      item.kode.toLowerCase().includes(q) ||
      item.namaLabel.toLowerCase().includes(q) ||
      item.deskripsiPrompt.toLowerCase().includes(q)
    );
  });

  return (
    <div className="mt-8 border-t border-gray-200 dark:border-[#2C3246] pt-8 space-y-6">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400">
              <Layers className="w-5 h-5" />
            </span>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Katalog Visual Carousel (Style Art & Font)
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Kelola pilihan gaya visual dan kombinasi tipografi yang dapat dipilih pengguna pada Carousel Prompt Builder.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleSeedDefaults}
            disabled={isSeeding}
            isLoading={isSeeding}
            icon={<Sparkles className="w-3.5 h-3.5 text-amber-500" />}
            className="text-xs font-bold"
            title="Muat preset standar bawaan jika database kosong atau butuh rekomendasi awal"
          >
            Muat Preset Bawaan
          </Button>

          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleOpenCreateModal}
            icon={<Plus className="w-3.5 h-3.5" />}
            className="bg-[#f97316] hover:bg-[#ea580c] text-white text-xs font-bold"
          >
            {activeTab === "styles" ? "Tambah Style Art" : "Tambah Font"}
          </Button>
        </div>
      </div>

      {/* Sub Tabs (Style Art vs Font) & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-1.5 bg-gray-50 dark:bg-[#0A1128] rounded-2xl border border-gray-200 dark:border-[#2C3246]">
        {/* Switcher Tab */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => {
              setActiveTab("styles");
              setSearchQuery("");
            }}
            className={cn(
              "flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer",
              activeTab === "styles"
                ? "bg-white dark:bg-[#141B31] text-orange-600 dark:text-orange-400 shadow-xs border border-gray-200 dark:border-[#2C3246]"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            )}
          >
            <Palette className="w-4 h-4" />
            <span>Style Art Visual</span>
            <span className="ml-1 text-[11px] px-1.5 py-0.2 rounded-full bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 font-extrabold">
              {styles.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("fonts");
              setSearchQuery("");
            }}
            className={cn(
              "flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer",
              activeTab === "fonts"
                ? "bg-white dark:bg-[#141B31] text-orange-600 dark:text-orange-400 shadow-xs border border-gray-200 dark:border-[#2C3246]"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            )}
          >
            <Type className="w-4 h-4" />
            <span>Pilihan Font</span>
            <span className="ml-1 text-[11px] px-1.5 py-0.2 rounded-full bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 font-extrabold">
              {fonts.length}
            </span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative flex-1 max-w-xs">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder={`Cari ${activeTab === "styles" ? "style art" : "font"}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-[#141B31] border border-gray-200 dark:border-[#2C3246] rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-orange-500/50"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Item List / Table */}
      {filteredItems.length === 0 ? (
        <div className="p-8 text-center rounded-2xl border border-dashed border-gray-200 dark:border-[#2C3246] bg-gray-50/50 dark:bg-[#0A1128]/50 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center mx-auto">
            {activeTab === "styles" ? <Palette className="w-6 h-6" /> : <Type className="w-6 h-6" />}
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-900 dark:text-white">
              {searchQuery
                ? `Tidak ada ${activeTab === "styles" ? "Style Art" : "Font"} yang cocok`
                : `Belum ada ${activeTab === "styles" ? "Style Art" : "Font"} terdaftar`}
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">
              {searchQuery
                ? "Coba ubah kata kunci pencarian Anda."
                : "Klik tombol 'Muat Preset Bawaan' untuk memasukkan data rekomendasi default, atau klik 'Tambah' untuk membuat baru."}
            </p>
          </div>
          {!searchQuery && (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleSeedDefaults}
              disabled={isSeeding}
              icon={<Sparkles className="w-3.5 h-3.5 text-amber-500" />}
              className="text-xs font-bold mx-auto"
            >
              Muat Preset Bawaan Sekarang
            </Button>
          )}
        </div>
      ) : (
        <div className="border border-gray-200 dark:border-[#2C3246] rounded-2xl overflow-hidden bg-white dark:bg-[#141B31] shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 dark:bg-white/5 border-b border-gray-200 dark:border-[#2C3246] text-gray-500 dark:text-gray-400 uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4 w-28">Kode</th>
                  <th className="py-3 px-4 w-52">Nama Label</th>
                  <th className="py-3 px-4">Deskripsi Prompt Visual / AI</th>
                  <th className="py-3 px-4 w-28 text-center">Status</th>
                  <th className="py-3 px-4 w-28 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-[#2C3246]/50">
                {filteredItems.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50/70 dark:hover:bg-white/5 transition-colors group"
                  >
                    {/* Kode */}
                    <td className="py-3.5 px-4 align-top">
                      <span className="font-mono font-bold text-[11px] px-2 py-1 rounded-md bg-gray-100 dark:bg-[#0A1128] border border-gray-200 dark:border-[#2C3246] text-gray-800 dark:text-gray-200 block w-fit">
                        {item.kode}
                      </span>
                    </td>

                    {/* Nama Label */}
                    <td className="py-3.5 px-4 align-top">
                      <span className="font-bold text-gray-900 dark:text-white text-xs block leading-tight">
                        {item.namaLabel}
                      </span>
                    </td>

                    {/* Deskripsi Prompt */}
                    <td className="py-3.5 px-4 align-top">
                      <div className="relative group/prompt">
                        <p className="text-gray-600 dark:text-gray-300 font-mono text-[11px] leading-relaxed line-clamp-2 pr-8">
                          {item.deskripsiPrompt}
                        </p>
                        <button
                          type="button"
                          onClick={() => handleCopyPrompt(item.deskripsiPrompt, item.id)}
                          className="absolute right-0 top-0 p-1 text-gray-400 hover:text-gray-900 dark:hover:text-white rounded hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                          title="Salin deskripsi prompt"
                        >
                          {copiedId === item.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Switch Status */}
                    <td className="py-3.5 px-4 align-top text-center">
                      <div className="flex flex-col items-center gap-1">
                        <Switch
                          size="sm"
                          checked={Boolean(item.isActive)}
                          onChange={(nextVal) => handleToggleActive(item, nextVal)}
                        />
                        <span className="text-[10px] font-semibold text-gray-400">
                          {item.isActive ? "Aktif" : "Mati"}
                        </span>
                      </div>
                    </td>

                    {/* Action Buttons */}
                    <td className="py-3.5 px-4 align-top text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(item)}
                          className="p-1.5 text-gray-500 hover:text-orange-600 dark:text-gray-400 dark:hover:text-orange-400 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-500/10 transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteItem(item)}
                          className="p-1.5 text-gray-500 hover:text-rose-600 dark:text-gray-400 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                          title="Hapus"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Dialog Form Tambah / Edit */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-gray-900/60 dark:bg-black/75 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => !isSubmitting && setModalOpen(false)}
        >
          <div
            className="bg-white dark:bg-[#141B31] rounded-2xl shadow-2xl border border-gray-200 dark:border-[#2C3246] w-full max-w-lg overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-gray-200 dark:border-[#2C3246] flex items-center justify-between bg-gray-50 dark:bg-white/5">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400">
                  {activeTab === "styles" ? <Palette className="w-4 h-4" /> : <Type className="w-4 h-4" />}
                </span>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">
                    {modalMode === "create" ? "Tambah" : "Edit"}{" "}
                    {activeTab === "styles" ? "Style Art Visual" : "Pilihan Font"}
                  </h3>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    Konfigurasi parameter visual untuk panduan generator AI
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setModalOpen(false)}
                disabled={isSubmitting}
                className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSaveForm} className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Kode */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Kode Unik <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    type="text"
                    value={formData.kode}
                    onChange={(e) => setFormData({ ...formData, kode: e.target.value.toUpperCase() })}
                    placeholder={activeTab === "styles" ? "STYLE_01" : "FONT_01"}
                    required
                    className="font-mono text-xs font-bold"
                  />
                  <span className="text-[10px] text-gray-400 mt-0.5 block">
                    Digunakan sebagai identifier unik
                  </span>
                </div>

                {/* Status Aktif */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Status Aktif
                  </label>
                  <div className="flex items-center justify-between p-2 rounded-xl border border-gray-200 dark:border-[#2C3246] bg-gray-50 dark:bg-[#0A1128] h-[38px]">
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      {formData.isActive ? "Tampil ke User" : "Disembunyikan"}
                    </span>
                    <Switch
                      size="sm"
                      checked={formData.isActive}
                      onChange={(checked) => setFormData({ ...formData, isActive: checked })}
                    />
                  </div>
                </div>
              </div>

              {/* Nama Label */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Nama Label <span className="text-rose-500">*</span>
                </label>
                <Input
                  type="text"
                  value={formData.namaLabel}
                  onChange={(e) => setFormData({ ...formData, namaLabel: e.target.value })}
                  placeholder={
                    activeTab === "styles"
                      ? "Contoh: 3D Claymation Minimalist"
                      : "Contoh: Bold Modern Sans-Serif"
                  }
                  required
                  className="text-xs font-medium"
                />
                <span className="text-[10px] text-gray-400 mt-0.5 block">
                  Nama yang akan tampil di pilihan dropdown pengguna
                </span>
              </div>

              {/* Deskripsi Prompt */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Deskripsi Prompt Visual / AI <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  value={formData.deskripsiPrompt}
                  onChange={(e) => setFormData({ ...formData, deskripsiPrompt: e.target.value })}
                  placeholder={
                    activeTab === "styles"
                      ? "Instruksi visual AI (contoh: 3D claymation style, cute handcrafted clay texture, smooth plasticine, soft studio lighting...)"
                      : "Instruksi tipografi AI (contoh: Typography: Bold extra-black geometric sans-serif for headline paired with clean sans...)"
                  }
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-[#2C3246] bg-white dark:bg-[#141B31] text-xs font-mono text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-orange-500/50 resize-y"
                />
                <span className="text-[10px] text-gray-400 mt-0.5 block">
                  Instruksi ini akan digabungkan ke dalam Master Prompt Generator saat membuat gambar carousel
                </span>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100 dark:border-[#2C3246]">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setModalOpen(false)}
                  disabled={isSubmitting}
                  className="text-xs font-semibold"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isSubmitting}
                  isLoading={isSubmitting}
                  icon={<Save className="w-3.5 h-3.5" />}
                  className="bg-[#f97316] hover:bg-[#ea580c] text-white text-xs font-bold"
                >
                  {modalMode === "create" ? "Tambahkan" : "Simpan Perubahan"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
