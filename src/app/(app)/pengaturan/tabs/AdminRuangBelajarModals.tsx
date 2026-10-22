"use client";

import React from "react";
import toast from "react-hot-toast";
import { mutate } from "swr";
import { BookOpen, Tag, Ticket, X, Trash2, ChevronDown } from "lucide-react";
import {
  createCategory,
  deleteCategory,
  createProduct,
  updateProduct,
  createVoucher,
  deleteVoucher,
} from "@/app/actions/adminSettings";
import { confirmSwal } from "./confirmSwal";
import CustomSelect from "@/components/ui/CustomSelect";

interface AdminRuangBelajarModalsProps {
  categories: any[];
  products: any[];
  loading: boolean;
  setLoading: (val: boolean) => void;
  uploadedUrls: Record<string, string>;
  setUploadedUrls: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  handleCoverUpload: (e: React.ChangeEvent<HTMLInputElement>, targetInputId: string) => Promise<void>;
  handleCoverDelete: (targetInputId: string, defaultLabel: string, fieldKey?: string) => Promise<void>;
  showAddCategory: boolean;
  setShowAddCategory: (val: boolean) => void;
  showGlobalVoucherModal: boolean;
  setShowGlobalVoucherModal: (val: boolean) => void;
  showAddProduct: boolean;
  setShowAddProduct: (val: boolean) => void;
  addAccessLevel: string;
  setAddAccessLevel: (val: string) => void;
  managingVouchers: any;
  setManagingVouchers: (val: any) => void;
  newVoucher: { code: string; discountType: string; discountValue: number; digitalProductId?: string };
  setNewVoucher: React.Dispatch<
    React.SetStateAction<{ code: string; discountType: string; discountValue: number; digitalProductId?: string }>
  >;
  editingProduct: any;
  setEditingProduct: React.Dispatch<React.SetStateAction<any>>;
}

export function AdminRuangBelajarModals({
  categories,
  products,
  loading,
  setLoading,
  uploadedUrls,
  setUploadedUrls,
  handleCoverUpload,
  handleCoverDelete,
  showAddCategory,
  setShowAddCategory,
  showGlobalVoucherModal,
  setShowGlobalVoucherModal,
  showAddProduct,
  setShowAddProduct,
  addAccessLevel,
  setAddAccessLevel,
  managingVouchers,
  setManagingVouchers,
  newVoucher,
  setNewVoucher,
  editingProduct,
  setEditingProduct,
}: AdminRuangBelajarModalsProps) {
  const allVouchers =
    products?.flatMap((p: any) =>
      (p.vouchers || []).map((v: any) => ({ ...v, productTitle: p.title }))
    ) || [];

  const [addCategoryId, setAddCategoryId] = React.useState("");

  return (
    <>
      {/* Modal Kategori Baru */}
      {showAddCategory && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#141B31] p-5 rounded-2xl border border-gray-200 dark:border-[#2C3246] w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                <Tag className="text-rn-accent" size={20} /> Kelola Kategori
              </h3>
              <button
                onClick={() => setShowAddCategory(false)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form
              action={async (formData) => {
                setLoading(true);
                await createCategory({
                  name: formData.get("name"),
                  slug: formData.get("slug"),
                });
                setLoading(false);
              }}
              className="flex flex-col gap-4 mb-4 pb-6 border-b border-gray-100 dark:border-[#2C3246]"
            >
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Tambah Kategori Baru
                </label>
                <input
                  name="name"
                  placeholder="Contoh: Bisnis & Keuangan"
                  required
                  className="w-full bg-gray-50 dark:bg-[#0A1128] border border-gray-200 dark:border-[#2C3246] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-rn-accent focus:ring-1 focus:ring-rn-accent transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Slug URL
                </label>
                <input
                  name="slug"
                  placeholder="Contoh: bisnis-keuangan"
                  required
                  className="w-full bg-gray-50 dark:bg-[#0A1128] border border-gray-200 dark:border-[#2C3246] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-rn-accent focus:ring-1 focus:ring-rn-accent transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#f97316] hover:bg-[#ea580c] dark:bg-[#f97316] dark:hover:bg-[#fb923c] text-white py-2.5 mt-2 rounded-xl text-sm font-bold shadow-sm shadow-orange-500/20 disabled:opacity-50 transition-colors"
              >
                Simpan Kategori Baru
              </button>
            </form>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-3">
                Daftar Kategori Tersimpan
              </label>
              <div className="flex flex-wrap gap-2 max-h-[200px] overflow-y-auto custom-scrollbar">
                {categories.map((c: any) => (
                  <div
                    key={c.id}
                    className="flex items-center gap-2 bg-gray-50 dark:bg-[#0A1128] border border-gray-200 dark:border-[#2C3246] pl-3 pr-1 py-1.5 rounded-lg text-sm group"
                  >
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {c.name}
                    </span>
                    <button
                      onClick={async () => {
                        if (await confirmSwal("Yakin hapus kategori ini?")) {
                          setLoading(true);
                          await deleteCategory(c.id);
                          setLoading(false);
                        }
                      }}
                      className="text-gray-400 hover:text-red-500 p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      title="Hapus Kategori"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                {categories.length === 0 && (
                  <span className="text-sm text-gray-500 italic">Belum ada kategori.</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Bank Voucher Global */}
      {showGlobalVoucherModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#141B31] p-5 rounded-2xl border border-gray-200 dark:border-[#2C3246] w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4 shrink-0">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                <Ticket className="text-rn-accent" size={20} /> Bank Voucher Global
              </h3>
              <button
                onClick={() => setShowGlobalVoucherModal(false)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="shrink-0 bg-white dark:bg-[#141B31] mt-2 mb-2">
              <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3">
                Buat Voucher Baru
              </h4>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Kode Promo
                  </label>
                  <input
                    type="text"
                    placeholder="Kode Promo (ex: PROMO50)"
                    value={newVoucher.code}
                    onChange={(e) =>
                      setNewVoucher({
                        ...newVoucher,
                        code: e.target.value.replace(/\s/g, "").toUpperCase(),
                      })
                    }
                    className="w-full bg-gray-50 dark:bg-[#0A1128] border border-gray-200 dark:border-[#2C3246] rounded-xl px-3 py-2 text-sm uppercase focus:outline-none focus:border-rn-accent focus:ring-1 focus:ring-rn-accent"
                  />
                </div>
                <div className="flex gap-2">
                  <div className="w-5/12">
                    <CustomSelect
                      label="TIPE DISKON"
                      value={newVoucher.discountType}
                      onChange={(val) => setNewVoucher({ ...newVoucher, discountType: val })}
                      options={[
                        { value: "PERCENTAGE", label: "Persen (%)" },
                        { value: "NOMINAL", label: "Nominal (Rp)" },
                      ]}
                    />
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Nilai Diskon
                    </label>
                    <input
                      type="number"
                      placeholder="Nilai Diskon"
                      value={newVoucher.discountValue || ""}
                      onChange={(e) =>
                        setNewVoucher({
                          ...newVoucher,
                          discountValue: Number(e.target.value),
                        })
                      }
                      className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-[#2C3246] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Target E-Book Dropdown */}
                <div>
                  <CustomSelect
                    label="E-BOOK TUJUAN"
                    placeholder="-- Pilih E-Book Tujuan --"
                    value={newVoucher.digitalProductId || ""}
                    onChange={(val) => setNewVoucher({ ...newVoucher, digitalProductId: val })}
                    options={products?.map((p: any) => ({ value: p.id, label: p.title })) || []}
                  />
                </div>

                <button
                  onClick={async () => {
                    if (
                      !newVoucher.code ||
                      !newVoucher.discountValue ||
                      !newVoucher.digitalProductId
                    )
                      return toast.error("Lengkapi data dan pilih E-Book!");
                    setLoading(true);
                    await createVoucher({
                      code: newVoucher.code.toUpperCase(),
                      discountType: newVoucher.discountType,
                      discountValue: newVoucher.discountValue,
                      digitalProductId: newVoucher.digitalProductId,
                    });
                    setNewVoucher({
                      code: "",
                      discountType: "PERCENTAGE",
                      discountValue: 0,
                      digitalProductId: "",
                    });
                    toast.success("Voucher dibuat! Harap refresh halaman.");
                    setLoading(false);
                  }}
                  disabled={loading}
                  className="w-full bg-[#f97316] hover:bg-[#ea580c] dark:bg-[#f97316] dark:hover:bg-[#fb923c] text-white font-bold py-2.5 rounded-xl shadow-sm shadow-orange-500/20 disabled:opacity-50 transition-all"
                >
                  Simpan Voucher Baru
                </button>
              </div>
            </div>

            <div className="pt-4 mt-2 border-t border-gray-200 dark:border-[#2C3246] flex flex-col flex-1 min-h-[150px]">
              <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3">
                DAFTAR VOUCHER TERSIMPAN
              </h4>
              <div className="overflow-y-auto space-y-3 custom-scrollbar pr-2 flex-1">
                {allVouchers.length > 0 ? (
                  allVouchers.map((v: any) => (
                    <div
                      key={v.id}
                      className="flex justify-between items-center p-3 rounded-xl border border-gray-200 dark:border-[#2C3246] bg-gray-50 dark:bg-[#0A1128]"
                    >
                      <div className="flex-1 min-w-0 pr-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-gray-900 dark:text-white uppercase">
                            {v.code}
                          </span>
                          <span className="bg-rn-accent/10 text-rn-accent text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">
                            {v.discountType === "PERCENTAGE"
                              ? v.discountValue + "%"
                              : "Rp " + v.discountValue.toLocaleString("id-ID")}
                          </span>
                        </div>
                        <div className="text-[10px] text-gray-500 truncate">
                          Berlaku untuk: <span className="font-medium">{v.productTitle}</span>
                        </div>
                      </div>
                      <button
                        onClick={async () => {
                          if (!(await confirmSwal("Hapus voucher ini?"))) return;
                          setLoading(true);
                          await deleteVoucher(v.id);
                          toast.success("Voucher dihapus, harap refresh halaman.");
                          setLoading(false);
                        }}
                        disabled={loading}
                        className="p-2 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-500 rounded-lg transition-colors shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400">
                    <Ticket className="w-8 h-8 mb-2 opacity-20" />
                    <p className="text-sm font-medium">Belum ada voucher aktif.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Add Product */}
      {showAddProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#141B31] p-5 rounded-2xl border border-gray-200 dark:border-[#2C3246] w-full max-w-lg max-h-[85vh] overflow-y-auto custom-scrollbar shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                <BookOpen className="text-rn-accent" size={20} /> Tambah E-Book / Produk
              </h3>
              <button
                onClick={() => {
                  setShowAddProduct(false);
                  setUploadedUrls({});
                }}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <form
              action={async (formData) => {
                setLoading(true);
                await createProduct({
                  title: formData.get("title") as string,
                  slug: formData.get("slug") as string,
                  categoryId: formData.get("categoryId") as string,
                  description: formData.get("description") as string,
                  coverUrl:
                    uploadedUrls["coverUrlInput"] || (formData.get("coverUrl") as string),
                  coverUrl2:
                    uploadedUrls["coverUrl2Input"] || (formData.get("coverUrl2") as string),
                  coverUrl3:
                    uploadedUrls["coverUrl3Input"] || (formData.get("coverUrl3") as string),
                  fileUrl: formData.get("fileUrl") as string,
                  accessLevel: formData.get("accessLevel") as string,
                  isProOnly:
                    formData.get("accessLevel") === "PRO" ||
                    formData.get("accessLevel") === "PREMIUM",
                  price: formData.get("price")
                    ? parseInt(formData.get("price") as string)
                    : 0,
                  isDownloadable: formData.get("isDownloadable") === "on",
                  language: formData.get("language") as string,
                  formatType: formData.get("formatType") as string,
                  author: formData.get("author") as string,
                  pageCount: formData.get("pageCount")
                    ? parseInt(formData.get("pageCount") as string)
                    : 0,
                  originalPrice: formData.get("originalPrice")
                    ? parseInt(formData.get("originalPrice") as string)
                    : 0,
                });
                mutate("pengaturan");
                setLoading(false);
                setShowAddProduct(false);
                setUploadedUrls({});
              }}
              className="flex flex-col gap-3"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Judul Konten
                  </label>
                  <input
                    name="title"
                    placeholder="Contoh: 100 Template Carousel"
                    required
                    className="w-full bg-gray-50 dark:bg-[#0A1128] border border-gray-200 dark:border-[#2C3246] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-rn-accent focus:ring-1 focus:ring-rn-accent transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Slug URL
                  </label>
                  <input
                    name="slug"
                    placeholder="template-carousel"
                    required
                    className="w-full bg-gray-50 dark:bg-[#0A1128] border border-gray-200 dark:border-[#2C3246] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-rn-accent focus:ring-1 focus:ring-rn-accent transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Jumlah Halaman
                  </label>
                  <input
                    name="pageCount"
                    type="number"
                    placeholder="Contoh: 120"
                    defaultValue={0}
                    className="w-full bg-gray-50 dark:bg-[#0A1128] border border-gray-200 dark:border-[#2C3246] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-rn-accent focus:ring-1 focus:ring-rn-accent transition-all"
                  />
                </div>
                <div>
                  <CustomSelect
                    label="KATEGORI"
                    name="categoryId"
                    placeholder="Pilih Kategori..."
                    value={addCategoryId}
                    onChange={(val) => setAddCategoryId(val)}
                    options={categories.map((c: any) => ({ value: c.id, label: c.name }))}
                    required
                  />
                </div>
                <div className="col-span-2 space-y-3">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Galeri Gambar E-Book (Maks 3)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                    {[
                      { id: "coverUrlInput", name: "coverUrl", label: "1. COVER UTAMA" },
                      { id: "coverUrl2Input", name: "coverUrl2", label: "2. PREVIEW 1" },
                      { id: "coverUrl3Input", name: "coverUrl3", label: "3. PREVIEW 2" },
                    ].map((item) => (
                      <div
                        key={item.id}
                        className="flex flex-row items-center justify-between gap-2 bg-gray-50 dark:bg-white/5 p-2 rounded-lg border border-gray-200 dark:border-[#2C3246] relative overflow-visible"
                      >
                        <div className="flex flex-col min-w-0 flex-1 z-10 gap-1">
                          <span
                            id={`label-${item.id}`}
                            className="text-[10px] font-bold text-gray-400 block mb-1"
                          >
                            {item.label}
                          </span>
                          <input
                            id={`file-${item.id}`}
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleCoverUpload(e, item.id)}
                            className="block w-full text-[10px] text-transparent file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:font-bold file:bg-rn-accent/10 file:text-rn-accent hover:file:bg-rn-accent/20 cursor-pointer"
                          />
                          <input type="hidden" name={item.name} id={item.id} />
                        </div>
                        <div className="relative shrink-0 ml-auto">
                          <img
                            id={`preview-${item.id}`}
                            src={uploadedUrls[item.id] || undefined}
                            className={`${
                              uploadedUrls[item.id] ? "" : "hidden"
                            } w-10 h-12 sm:w-8 sm:h-10 object-cover z-0 rounded shadow opacity-100 ring-2 ring-green-500 transition-all duration-300`}
                          />
                          {uploadedUrls[item.id] && (
                            <button
                              type="button"
                              onClick={() => handleCoverDelete(item.id, item.label)}
                              className="absolute -top-1.5 -right-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full p-0.5 shadow-md z-20 transition-transform hover:scale-110 cursor-pointer"
                              title="Hapus gambar dari server"
                            >
                              <X size={10} className="stroke-[3]" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Deskripsi Singkat (Opsional)
                </label>
                <textarea
                  name="description"
                  rows={2}
                  placeholder="Penjelasan singkat mengenai produk ini..."
                  className="w-full bg-gray-50 dark:bg-[#0A1128] border border-gray-200 dark:border-[#2C3246] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-rn-accent focus:ring-1 focus:ring-rn-accent transition-all custom-scrollbar"
                ></textarea>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Link Google Drive PDF (Opsional)
                </label>
                <input
                  name="fileUrl"
                  type="url"
                  placeholder="https://drive.google.com/file/d/..."
                  className="w-full bg-gray-50 dark:bg-[#0A1128] border border-gray-200 dark:border-[#2C3246] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-rn-accent focus:ring-1 focus:ring-rn-accent transition-all"
                />
                <p className="text-[10px] text-gray-400 mt-1">
                  Ganti &quot;view&quot; menjadi &quot;preview&quot; otomatis oleh sistem.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Penulis
                  </label>
                  <input
                    name="author"
                    defaultValue="Admin"
                    className="w-full bg-gray-50 dark:bg-[#0A1128] border border-gray-200 dark:border-[#2C3246] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-rn-accent focus:ring-1 focus:ring-rn-accent transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Bahasa
                  </label>
                  <input
                    name="language"
                    defaultValue="Indonesia"
                    className="w-full bg-gray-50 dark:bg-[#0A1128] border border-gray-200 dark:border-[#2C3246] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-rn-accent focus:ring-1 focus:ring-rn-accent transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Format
                  </label>
                  <input
                    name="formatType"
                    defaultValue="PDF / Digital"
                    className="w-full bg-gray-50 dark:bg-[#0A1128] border border-gray-200 dark:border-[#2C3246] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-rn-accent focus:ring-1 focus:ring-rn-accent transition-all"
                  />
                </div>
              </div>

              <div className="mt-4">
                <CustomSelect
                  label="LEVEL AKSES E-BOOK"
                  name="accessLevel"
                  value={addAccessLevel}
                  onChange={(val) => setAddAccessLevel(val)}
                  options={[
                    { value: "FREE", label: "Free (Gratis untuk semua)" },
                    { value: "PRO", label: "Pro (Khusus Member Bundle)" },
                    { value: "PREMIUM", label: "Premium (Pembelian Eceran / Ala Carte)" },
                  ]}
                />
              </div>

              {(addAccessLevel === "PREMIUM" || addAccessLevel === "PRO") && (
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">
                      HARGA JUAL (Rp)
                    </label>
                    <input
                      name="price"
                      type="number"
                      min="0"
                      placeholder="Contoh: 49000"
                      className="w-full bg-gray-50 dark:bg-[#0A1128] border border-gray-200 dark:border-[#2C3246] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-rn-accent focus:ring-1 focus:ring-rn-accent transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">
                      HARGA CORET (Rp)
                    </label>
                    <input
                      name="originalPrice"
                      type="number"
                      min="0"
                      placeholder="Contoh: 99000"
                      className="w-full bg-gray-50 dark:bg-[#0A1128] border border-gray-200 dark:border-[#2C3246] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-rn-accent focus:ring-1 focus:ring-rn-accent transition-all line-through"
                    />
                  </div>
                </div>
              )}

              <label className="mt-2 flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/30 rounded-lg cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-colors">
                <input
                  type="checkbox"
                  name="isDownloadable"
                  className="w-5 h-5 rounded text-blue-600 focus:ring-blue-600 border-blue-300"
                />
                <div>
                  <div className="font-bold text-sm text-blue-900 dark:text-blue-300">
                    Izinkan Download PDF
                  </div>
                  <div className="text-xs text-blue-700/70 dark:text-blue-400/70">
                    Pengguna dapat mengunduh file PDF secara langsung
                  </div>
                </div>
              </label>

              <div className="flex justify-end gap-3 mt-2 pt-4 border-t border-gray-100 dark:border-[#2C3246]">
                <button
                  type="button"
                  onClick={() => setShowAddProduct(false)}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 dark:bg-[#141B31] dark:hover:bg-[#1f2947] dark:border-[#2C3246] dark:text-gray-200 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-[#f97316] hover:bg-[#ea580c] dark:bg-[#f97316] dark:hover:bg-[#fb923c] text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-sm shadow-orange-500/20 disabled:opacity-50 hover:scale-105 transition-transform"
                >
                  Simpan E-Book
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Kelola Voucher Spesifik Produk */}
      {managingVouchers && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#141B31] p-5 rounded-2xl border border-gray-200 dark:border-[#2C3246] w-full max-w-lg max-h-[85vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4 shrink-0">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                Kelola Voucher
              </h3>
              <button
                onClick={() => setManagingVouchers(null)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 mb-4 space-y-3 custom-scrollbar pr-2">
              {managingVouchers.vouchers?.length > 0 ? (
                managingVouchers.vouchers.map((v: any) => (
                  <div
                    key={v.id}
                    className="flex justify-between items-center p-3 rounded-xl border border-gray-200 dark:border-[#2C3246] bg-gray-50 dark:bg-[#0A1128]"
                  >
                    <div>
                      <div className="font-bold text-gray-900 dark:text-white">{v.code}</div>
                      <div className="text-xs font-medium text-rn-accent">
                        Diskon:{" "}
                        {v.discountType === "PERCENTAGE"
                          ? v.discountValue + "%"
                          : "Rp " + v.discountValue.toLocaleString("id-ID")}
                      </div>
                    </div>
                    <button
                      onClick={async () => {
                        setLoading(true);
                        await deleteVoucher(v.id);
                        toast.success("Voucher dihapus, harap refresh halaman.");
                        setLoading(false);
                      }}
                      disabled={loading}
                      className="p-2 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-500 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  Belum ada voucher untuk ebook ini.
                </p>
              )}
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-[#2C3246] shrink-0">
              <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3">
                Buat Voucher Baru
              </h4>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Kode Promo (ex: PROMO50)"
                  value={newVoucher.code}
                  onChange={(e) => setNewVoucher({ ...newVoucher, code: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-[#0A1128] border border-gray-200 dark:border-[#2C3246] rounded-xl px-3 py-2 text-sm uppercase focus:outline-none focus:border-rn-accent focus:ring-1 focus:ring-rn-accent"
                />
                <div className="flex gap-2">
                  <div className="w-1/3">
                    <CustomSelect
                      value={newVoucher.discountType}
                      onChange={(val) => setNewVoucher({ ...newVoucher, discountType: val })}
                      options={[
                        { value: "PERCENTAGE", label: "Persen (%)" },
                        { value: "NOMINAL", label: "Nominal (Rp)" },
                      ]}
                    />
                  </div>
                  <input
                    type="number"
                    placeholder="Nilai Diskon"
                    value={newVoucher.discountValue || ""}
                    onChange={(e) =>
                      setNewVoucher({ ...newVoucher, discountValue: Number(e.target.value) })
                    }
                    className="flex-1 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-[#2C3246] rounded-xl px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                  />
                </div>
                <button
                  onClick={async () => {
                    if (!newVoucher.code || !newVoucher.discountValue)
                      return toast.error("Lengkapi data!");
                    setLoading(true);
                    await createVoucher({
                      ...newVoucher,
                      code: newVoucher.code.toUpperCase(),
                      digitalProductId: managingVouchers.id,
                    });
                    setNewVoucher({ code: "", discountType: "PERCENTAGE", discountValue: 0 });
                    toast.success("Voucher dibuat! Harap refresh halaman.");
                    setLoading(false);
                  }}
                  disabled={loading}
                  className="w-full bg-[#f97316] hover:bg-[#ea580c] dark:bg-[#f97316] dark:hover:bg-[#fb923c] text-white font-bold py-2.5 rounded-xl shadow-sm shadow-orange-500/20 disabled:opacity-50 transition-all"
                >
                  Simpan Voucher
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Edit Product */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#141B31] p-5 rounded-2xl border border-gray-200 dark:border-[#2C3246] w-full max-w-lg max-h-[85vh] overflow-y-auto custom-scrollbar shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                <BookOpen className="text-rn-accent" size={20} /> Edit E-Book
              </h3>
              <button
                onClick={() => setEditingProduct(null)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <form
              action={async (formData) => {
                setLoading(true);
                await updateProduct(editingProduct.id, {
                  title: formData.get("title") as string,
                  slug: formData.get("slug") as string,
                  categoryId: formData.get("categoryId") as string,
                  description: formData.get("description") as string,
                  coverUrl:
                    uploadedUrls["editCoverUrlInput"] !== undefined
                      ? uploadedUrls["editCoverUrlInput"]
                      : (formData.get("coverUrl") as string) || null,
                  coverUrl2:
                    uploadedUrls["editCoverUrl2Input"] !== undefined
                      ? uploadedUrls["editCoverUrl2Input"]
                      : (formData.get("coverUrl2") as string) || null,
                  coverUrl3:
                    uploadedUrls["editCoverUrl3Input"] !== undefined
                      ? uploadedUrls["editCoverUrl3Input"]
                      : (formData.get("coverUrl3") as string) || null,
                  fileUrl: formData.get("fileUrl") as string,
                  accessLevel: formData.get("accessLevel") as string,
                  isProOnly:
                    formData.get("accessLevel") === "PRO" ||
                    formData.get("accessLevel") === "PREMIUM",
                  price: formData.get("price")
                    ? parseInt(formData.get("price") as string)
                    : 0,
                  isDownloadable: formData.get("isDownloadable") === "on",
                  language: formData.get("language") as string,
                  formatType: formData.get("formatType") as string,
                  author: formData.get("author") as string,
                  pageCount: formData.get("pageCount")
                    ? parseInt(formData.get("pageCount") as string)
                    : 0,
                  originalPrice: formData.get("originalPrice")
                    ? parseInt(formData.get("originalPrice") as string)
                    : 0,
                });
                mutate("pengaturan");
                setLoading(false);
                setEditingProduct(null);
                setUploadedUrls({});
              }}
              className="flex flex-col gap-3"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Judul Konten
                  </label>
                  <input
                    name="title"
                    defaultValue={editingProduct.title}
                    required
                    className="w-full bg-gray-50 dark:bg-[#0A1128] border border-gray-200 dark:border-[#2C3246] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-rn-accent focus:ring-1 focus:ring-rn-accent transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Slug URL
                  </label>
                  <input
                    name="slug"
                    defaultValue={editingProduct.slug}
                    required
                    className="w-full bg-gray-50 dark:bg-[#0A1128] border border-gray-200 dark:border-[#2C3246] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-rn-accent focus:ring-1 focus:ring-rn-accent transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Jumlah Halaman
                  </label>
                  <input
                    name="pageCount"
                    type="number"
                    placeholder="Contoh: 120"
                    defaultValue={editingProduct.pageCount || 0}
                    className="w-full bg-gray-50 dark:bg-[#0A1128] border border-gray-200 dark:border-[#2C3246] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-rn-accent focus:ring-1 focus:ring-rn-accent transition-all"
                  />
                </div>
                <div>
                  <CustomSelect
                    label="KATEGORI"
                    name="categoryId"
                    value={editingProduct.categoryId}
                    onChange={(val) => setEditingProduct({ ...editingProduct, categoryId: val })}
                    options={categories.map((c: any) => ({ value: c.id, label: c.name }))}
                    required
                  />
                </div>
                <div className="col-span-2 space-y-3">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Galeri Gambar E-Book (Maks 3)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                    {[
                      {
                        id: "editCoverUrlInput",
                        name: "coverUrl",
                        field: "coverUrl",
                        label: "1. COVER UTAMA",
                      },
                      {
                        id: "editCoverUrl2Input",
                        name: "coverUrl2",
                        field: "coverUrl2",
                        label: "2. PREVIEW 1",
                      },
                      {
                        id: "editCoverUrl3Input",
                        name: "coverUrl3",
                        field: "coverUrl3",
                        label: "3. PREVIEW 2",
                      },
                    ].map((item) => {
                      const url =
                        uploadedUrls[item.id] !== undefined
                          ? uploadedUrls[item.id]
                          : editingProduct[item.field] || "";
                      return (
                        <div
                          key={item.id}
                          className="flex flex-row items-center justify-between gap-2 bg-gray-50 dark:bg-white/5 p-2 rounded-lg border border-gray-200 dark:border-[#2C3246] relative overflow-visible"
                        >
                          <div className="flex flex-col min-w-0 flex-1 z-10 gap-1">
                            <span
                              id={`label-${item.id}`}
                              className="text-[10px] font-bold text-gray-400 block mb-1"
                            >
                              {item.label}
                            </span>
                            <input
                              id={`file-${item.id}`}
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleCoverUpload(e, item.id)}
                              className="block w-full text-[10px] text-transparent file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:font-bold file:bg-rn-accent/10 file:text-rn-accent hover:file:bg-rn-accent/20 cursor-pointer"
                            />
                            <input
                              type="hidden"
                              name={item.name}
                              id={item.id}
                              defaultValue={editingProduct[item.field] || ""}
                            />
                          </div>
                          <div className="relative shrink-0 ml-auto">
                            {url ? (
                              <>
                                <img
                                  id={`preview-${item.id}`}
                                  src={url}
                                  className="w-10 h-12 sm:w-8 sm:h-10 object-cover z-0 rounded shadow opacity-100 ring-2 ring-green-500 transition-all duration-300"
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleCoverDelete(item.id, item.label, item.field)
                                  }
                                  className="absolute -top-1.5 -right-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full p-0.5 shadow-md z-20 transition-transform hover:scale-110 cursor-pointer"
                                  title="Hapus gambar dari server"
                                >
                                  <X size={10} className="stroke-[3]" />
                                </button>
                              </>
                            ) : (
                              <img
                                id={`preview-${item.id}`}
                                className="hidden w-10 h-12 sm:w-8 sm:h-10 object-cover z-0 rounded shadow transition-all duration-300"
                              />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Deskripsi Singkat
                </label>
                <textarea
                  name="description"
                  defaultValue={editingProduct.description || ""}
                  rows={2}
                  className="w-full bg-gray-50 dark:bg-[#0A1128] border border-gray-200 dark:border-[#2C3246] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-rn-accent focus:ring-1 focus:ring-rn-accent transition-all custom-scrollbar"
                ></textarea>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Link Google Drive PDF
                </label>
                <input
                  name="fileUrl"
                  type="url"
                  defaultValue={editingProduct.fileUrl || ""}
                  className="w-full bg-gray-50 dark:bg-[#0A1128] border border-gray-200 dark:border-[#2C3246] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-rn-accent focus:ring-1 focus:ring-rn-accent transition-all"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Penulis
                  </label>
                  <input
                    name="author"
                    defaultValue={editingProduct.author || "Admin"}
                    className="w-full bg-gray-50 dark:bg-[#0A1128] border border-gray-200 dark:border-[#2C3246] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-rn-accent focus:ring-1 focus:ring-rn-accent transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Bahasa
                  </label>
                  <input
                    name="language"
                    defaultValue={editingProduct.language || "Indonesia"}
                    className="w-full bg-gray-50 dark:bg-[#0A1128] border border-gray-200 dark:border-[#2C3246] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-rn-accent focus:ring-1 focus:ring-rn-accent transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Format
                  </label>
                  <input
                    name="formatType"
                    defaultValue={editingProduct.formatType || "PDF / Digital"}
                    className="w-full bg-gray-50 dark:bg-[#0A1128] border border-gray-200 dark:border-[#2C3246] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-rn-accent focus:ring-1 focus:ring-rn-accent transition-all"
                  />
                </div>
              </div>

              <div className="mt-4">
                <CustomSelect
                  label="LEVEL AKSES E-BOOK"
                  name="accessLevel"
                  value={editingProduct.accessLevel || "FREE"}
                  onChange={(val) => setEditingProduct({ ...editingProduct, accessLevel: val })}
                  options={[
                    { value: "FREE", label: "Free (Gratis untuk semua)" },
                    { value: "PRO", label: "Pro (Khusus Member Bundle)" },
                    { value: "PREMIUM", label: "Premium (Pembelian Eceran / Ala Carte)" },
                  ]}
                />
              </div>

              {(editingProduct.accessLevel === "PREMIUM" ||
                editingProduct.accessLevel === "PRO") && (
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">
                      HARGA JUAL (Rp)
                    </label>
                    <input
                      name="price"
                      type="number"
                      min="0"
                      defaultValue={editingProduct.price || 0}
                      placeholder="Contoh: 49000"
                      className="w-full bg-gray-50 dark:bg-[#0A1128] border border-gray-200 dark:border-[#2C3246] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-rn-accent focus:ring-1 focus:ring-rn-accent transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">
                      HARGA CORET (Rp)
                    </label>
                    <input
                      name="originalPrice"
                      type="number"
                      min="0"
                      defaultValue={editingProduct.originalPrice || ""}
                      placeholder="Contoh: 99000"
                      className="w-full bg-gray-50 dark:bg-[#0A1128] border border-gray-200 dark:border-[#2C3246] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-rn-accent focus:ring-1 focus:ring-rn-accent transition-all line-through"
                    />
                  </div>
                </div>
              )}

              <label className="mt-2 flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/30 rounded-lg cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-colors">
                <input
                  type="checkbox"
                  name="isDownloadable"
                  defaultChecked={editingProduct.isDownloadable}
                  className="w-5 h-5 rounded text-blue-600 focus:ring-blue-600 border-blue-300"
                />
                <div>
                  <div className="font-bold text-sm text-blue-900 dark:text-blue-300">
                    Izinkan Download PDF
                  </div>
                  <div className="text-xs text-blue-700/70 dark:text-blue-400/70">
                    Pengguna dapat mengunduh file PDF secara langsung
                  </div>
                </div>
              </label>

              <div className="flex justify-end gap-3 mt-2 pt-4 border-t border-gray-100 dark:border-[#2C3246]">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 dark:bg-[#141B31] dark:hover:bg-[#1f2947] dark:border-[#2C3246] dark:text-gray-200 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-[#f97316] hover:bg-[#ea580c] dark:bg-[#f97316] dark:hover:bg-[#fb923c] text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-sm shadow-orange-500/20 disabled:opacity-50 hover:scale-105 transition-transform"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
