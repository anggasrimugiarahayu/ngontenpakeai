"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { mutate } from "swr";
import {
  Plus,
  Trash2,
  Edit,
  BookOpen,
  Tag,
  Star,
  Ticket,
  MoreVertical,
  Eye,
  EyeOff,
  Heart,
} from "lucide-react";
import {
  deleteProduct,
  toggleProductStatus,
  reorderProducts,
} from "@/app/actions/adminSettings";
import { confirmSwal } from "./confirmSwal";
import { AdminRuangBelajarModals } from "./AdminRuangBelajarModals";

export function AdminRuangBelajarTab({
  categories,
  products,
}: {
  categories: any[];
  products: any[];
}) {
  const [productList, setProductList] = useState(products || []);
  const [openMenuProductId, setOpenMenuProductId] = useState<string | null>(null);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadedUrls, setUploadedUrls] = useState<Record<string, string>>({});

  const [showAddProduct, setShowAddProduct] = useState(false);
  const [addAccessLevel, setAddAccessLevel] = useState("FREE");
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [managingVouchers, setManagingVouchers] = useState<any>(null);
  const [newVoucher, setNewVoucher] = useState<{
    code: string;
    discountType: string;
    discountValue: number;
    digitalProductId?: string;
  }>({ code: "", discountType: "PERCENTAGE", discountValue: 0 });
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showGlobalVoucherModal, setShowGlobalVoucherModal] = useState(false);

  useEffect(() => {
    setProductList(products || []);
  }, [products]);

  const handleCoverUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    targetInputId: string
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Ukuran file maksimal 2MB");
      return;
    }

    const labelEl = document.getElementById("label-" + targetInputId);
    if (labelEl) labelEl.innerText = "Mengupload...";

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.url) {
        const input = document.getElementById(targetInputId) as HTMLInputElement;
        if (input) {
          input.value = data.url;
        }
        setUploadedUrls((prev) => ({ ...prev, [targetInputId]: data.url }));
        const img = document.getElementById(
          "preview-" + targetInputId
        ) as HTMLImageElement;
        if (img) {
          img.src = data.url;
          img.classList.remove("hidden");
          img.classList.add("ring-2", "ring-green-500", "opacity-100", "z-10");
          img.classList.remove("opacity-50");
        }
        if (labelEl) {
          labelEl.innerText = "BERHASIL ✓";
          labelEl.classList.remove("text-red-500", "text-gray-400");
          labelEl.classList.add("text-green-500");
        }
        toast.success("Gambar berhasil diunggah!");
      } else {
        toast.error(data.error || "Gagal upload gambar.");
        if (labelEl) {
          labelEl.innerText = "GAGAL X";
          labelEl.classList.remove("text-green-500", "text-gray-400");
          labelEl.classList.add("text-red-500");
        }
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Error upload gambar.");
      if (labelEl) {
        labelEl.innerText = "GAGAL X";
        labelEl.classList.remove("text-green-500", "text-gray-400");
        labelEl.classList.add("text-red-500");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCoverDelete = async (
    targetInputId: string,
    defaultLabel: string,
    fieldKey?: string
  ) => {
    const currentUrl =
      uploadedUrls[targetInputId] !== undefined
        ? uploadedUrls[targetInputId]
        : editingProduct && fieldKey
        ? editingProduct[fieldKey]
        : "";

    setLoading(true);
    try {
      if (currentUrl) {
        await fetch("/api/upload", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: currentUrl }),
        });
      }

      setUploadedUrls((prev) => ({ ...prev, [targetInputId]: "" }));

      const input = document.getElementById(targetInputId) as HTMLInputElement;
      if (input) {
        input.value = "";
      }

      const fileInput = document.getElementById(
        "file-" + targetInputId
      ) as HTMLInputElement;
      if (fileInput) {
        fileInput.value = "";
      }

      const img = document.getElementById(
        "preview-" + targetInputId
      ) as HTMLImageElement;
      if (img) {
        img.src = "";
        img.classList.add("hidden");
        img.classList.remove("ring-2", "ring-green-500", "opacity-100", "z-10");
      }

      const labelEl = document.getElementById("label-" + targetInputId);
      if (labelEl) {
        labelEl.innerText = defaultLabel;
        labelEl.classList.remove("text-green-500", "text-red-500");
        labelEl.classList.add("text-gray-400");
      }

      if (editingProduct && fieldKey) {
        setEditingProduct((prev: any) => ({ ...prev, [fieldKey]: "" }));
      }

      toast.success("Gambar berhasil dihapus dari server!");
    } catch (err) {
      console.error(err);
      toast.error("Gagal menghapus gambar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="space-y-6 animate-in fade-in duration-300">
        {/* Header & Actions */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border border-gray-200 dark:border-[#2C3246] rounded-2xl p-6 bg-white dark:bg-[#141B31]">
          <div className="mb-2 md:mb-0">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
              Manajemen Ruang Belajar
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Kelola kategori dan e-book yang tersedia untuk member.
            </p>
          </div>
          <div className="grid grid-cols-2 md:flex md:items-center gap-2 mt-3 md:mt-0 w-full md:w-auto">
            <button
              onClick={() => setShowAddCategory(true)}
              className="justify-center bg-orange-50 hover:bg-orange-100 dark:bg-orange-500/10 dark:hover:bg-orange-500/20 text-orange-600 dark:text-orange-400 px-3 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-colors flex items-center gap-1.5 whitespace-nowrap"
            >
              <Tag className="w-4 h-4" /> Kategori
            </button>
            <button
              onClick={() => setShowGlobalVoucherModal(true)}
              className="justify-center border border-orange-500/30 hover:border-orange-500/60 bg-white dark:bg-[#141B31] text-orange-600 dark:text-orange-400 px-3 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-colors flex items-center gap-1.5 whitespace-nowrap"
            >
              <Ticket className="w-4 h-4" /> Voucher
            </button>
            <button
              onClick={() => setShowAddProduct(true)}
              className="col-span-2 md:col-span-1 justify-center bg-[#f97316] hover:bg-[#ea580c] dark:bg-[#f97316] dark:hover:bg-[#fb923c] text-white px-4 py-2.5 rounded-lg text-xs sm:text-sm font-bold shadow-sm shadow-orange-500/20 transition-all flex items-center gap-1.5 whitespace-nowrap"
            >
              <Plus className="w-4 h-4" /> Tambah E-Book
            </button>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
          {productList.map((prod: any, index: number) => {
            const reviewCount = prod.reviews?.length || 0;
            const averageRating =
              reviewCount > 0
                ? (
                    prod.reviews.reduce(
                      (acc: number, rev: any) => acc + rev.rating,
                      0
                    ) / reviewCount
                  ).toFixed(1)
                : "0.0";
            const buyerCount = (prod as any).buyerCount ?? prod._count?.owners ?? 0;
            const favCount = prod._count?.favorites || 0;

            return (
              <div
                key={prod.id}
                draggable
                onDragStart={(e) => {
                  setDraggedIdx(index);
                  e.dataTransfer.effectAllowed = "move";
                  e.dataTransfer.setData("text/plain", prod.id);
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
                onDrop={async (e) => {
                  e.preventDefault();
                  setDragOverIdx(null);
                  if (draggedIdx === null || draggedIdx === index) return;

                  const newItems = [...productList];
                  const [draggedItem] = newItems.splice(draggedIdx, 1);
                  newItems.splice(index, 0, draggedItem);

                  setProductList(newItems);
                  setDraggedIdx(null);

                  const orderedIds = newItems.map((p: any) => p.id);
                  try {
                    await reorderProducts(orderedIds);
                    toast.success("Urutan E-Book berhasil diperbarui!");
                  } catch {
                    toast.error("Gagal menyimpan urutan e-book.");
                  }
                }}
                onDragEnd={() => {
                  setDraggedIdx(null);
                  setDragOverIdx(null);
                }}
                className={`cursor-grab active:cursor-grabbing select-none flex flex-row items-start w-full hover:border-rn-accent dark:hover:border-orange-500/50 hover:shadow-xl hover:-translate-y-1 hover:shadow-gray-200 dark:hover:shadow-black/50 transition-all duration-200 border-2 border-gray-200 dark:border-[#2C3246] bg-white dark:bg-[#141B31] rounded-[16px] sm:rounded-[20px] relative p-3 sm:p-4 gap-3 sm:gap-4 ${
                  draggedIdx === index
                    ? "opacity-30 scale-95 border-dashed border-rn-accent ring-2 ring-rn-accent/30"
                    : ""
                } ${
                  dragOverIdx === index && draggedIdx !== index
                    ? "ring-2 ring-rn-accent shadow-2xl border-rn-accent scale-[1.01]"
                    : ""
                } ${
                  prod.isActive === false
                    ? "opacity-75 bg-gray-50/70 dark:bg-[#141B31]/60"
                    : ""
                }`}
              >
                <div className="w-[100px] sm:w-[120px] shrink-0 relative overflow-hidden bg-gray-100 dark:bg-[#0A1128] border border-gray-200 dark:border-[#2C3246] rounded-[10px] sm:rounded-xl shadow-sm pointer-events-none">
                  <div className="aspect-[3/4] relative flex items-center justify-center">
                    {prod.coverUrl ? (
                      <>
                        <Image
                          src={prod.coverUrl}
                          alt={prod.title}
                          fill
                          sizes="(max-width: 640px) 100px, 120px"
                          unoptimized={typeof prod.coverUrl === "string" && (prod.coverUrl.startsWith("data:") || prod.coverUrl.startsWith("/api/"))}
                          className="object-cover z-0"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-transparent z-10 pointer-events-none" />
                      </>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center z-10">
                        <BookOpen className="w-12 h-12 text-gray-300 dark:text-gray-600 opacity-50" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col flex-1 py-1 h-full min-h-[133px] sm:min-h-[160px]">
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3
                        className="text-[17px] font-bold leading-tight tracking-tight text-gray-900 dark:text-white group-hover:text-rn-accent transition-colors line-clamp-2 flex-1"
                        title={prod.title}
                      >
                        {prod.title}
                      </h3>

                      {/* Menu Titik Tiga Vertikal */}
                      <div
                        className="relative shrink-0 ml-1"
                        onMouseDown={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() =>
                            setOpenMenuProductId(
                              openMenuProductId === prod.id ? null : prod.id
                            )
                          }
                          className="p-1 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                          title="Pengaturan Card E-Book"
                        >
                          <MoreVertical size={16} />
                        </button>

                        {openMenuProductId === prod.id && (
                          <>
                            <div
                              className="fixed inset-0 z-30"
                              onClick={() => setOpenMenuProductId(null)}
                            />
                            <div className="absolute right-0 top-full mt-1 w-52 bg-white dark:bg-[#141B31] rounded-2xl shadow-2xl border border-gray-200 dark:border-[#2C3246] p-2 z-40 text-xs animate-in fade-in zoom-in-95 duration-150">
                              <div className="px-2.5 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-white/5 mb-1">
                                Status E-Book
                              </div>
                              <button
                                type="button"
                                onClick={async () => {
                                  setOpenMenuProductId(null);
                                  const newStatus =
                                    prod.isActive === false ? true : false;
                                  setProductList((prev: any) =>
                                    prev.map((p: any) =>
                                      p.id === prod.id
                                        ? { ...p, isActive: newStatus }
                                        : p
                                    )
                                  );
                                  try {
                                    await toggleProductStatus(prod.id, newStatus);
                                    mutate("pengaturan");
                                    toast.success(
                                      newStatus
                                        ? "E-Book diaktifkan (tampil di katalog)"
                                        : "E-Book dinonaktifkan (disembunyikan dari katalog)"
                                    );
                                  } catch {
                                    toast.error("Gagal mengubah status");
                                    mutate("pengaturan");
                                  }
                                }}
                                className={`w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg font-medium transition-colors text-left ${
                                  prod.isActive !== false
                                    ? "hover:bg-red-50 dark:hover:bg-red-500/10 text-gray-700 dark:text-gray-300 hover:text-red-600"
                                    : "hover:bg-green-50 dark:hover:bg-green-500/10 text-gray-700 dark:text-gray-300 hover:text-green-600"
                                }`}
                              >
                                <span className="flex items-center gap-2">
                                  {prod.isActive !== false ? (
                                    <EyeOff size={14} className="text-red-500" />
                                  ) : (
                                    <Eye size={14} className="text-green-500" />
                                  )}
                                  {prod.isActive !== false
                                    ? "Nonaktifkan E-Book"
                                    : "Aktifkan E-Book"}
                                </span>
                                <span
                                  className={`w-2 h-2 rounded-full ${
                                    prod.isActive !== false
                                      ? "bg-green-500"
                                      : "bg-gray-400"
                                  }`}
                                />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-xs font-medium text-gray-500 mt-1 mb-2">
                      <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                      <span>{averageRating === "0.0" ? "0" : averageRating}</span>
                      <span className="text-gray-400 font-normal ml-0.5">
                        ({reviewCount === 0 ? "0 ulasan" : `${reviewCount} ulasan`})
                      </span>
                      <span className="text-gray-300 dark:text-gray-600 mx-1">•</span>
                      <span className="text-gray-500 font-medium">
                        {buyerCount} pembeli
                      </span>
                      {favCount > 0 && (
                        <>
                          <span className="text-gray-300 dark:text-gray-600 mx-1">
                            •
                          </span>
                          <span className="text-red-500 font-medium flex items-center gap-0.5">
                            <Heart className="w-3 h-3 fill-red-500 text-red-500" />
                            {favCount}
                          </span>
                        </>
                      )}
                    </div>

                    {prod.description && (
                      <p className="text-[11px] leading-relaxed text-gray-500 dark:text-gray-400 line-clamp-1 mb-3">
                        {prod.description}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-1.5 mb-4 mt-auto">
                      <div
                        className={`font-bold rounded px-1.5 py-0.5 text-[9px] uppercase tracking-wider ${
                          prod.accessLevel === "FREE"
                            ? "bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300"
                            : "bg-rn-accent/10 text-rn-accent dark:bg-rn-accent/20 dark:text-rn-accent"
                        }`}
                      >
                        {prod.accessLevel === "FREE"
                          ? "Gratis"
                          : prod.accessLevel === "PREMIUM"
                          ? "Premium"
                          : "PRO"}
                      </div>
                      <div className="font-bold rounded px-1.5 py-0.5 text-[9px] bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        {prod.category?.name || "PRODUK DIGITAL"}
                      </div>
                      {prod.isActive === false && (
                        <div className="font-bold rounded px-1.5 py-0.5 text-[9px] bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 uppercase tracking-wider flex items-center gap-1">
                          <EyeOff size={10} /> Nonaktif
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-auto pt-2 flex items-end justify-between gap-x-2">
                    <div className="flex flex-col">
                      {(prod.accessLevel === "PREMIUM" ||
                        prod.accessLevel === "PRO") &&
                      prod.originalPrice &&
                      prod.originalPrice > prod.price ? (
                        <span className="text-[11px] sm:text-[13px] font-medium text-gray-400 dark:text-gray-500 line-through leading-none mb-1 whitespace-nowrap">
                          Rp {prod.originalPrice.toLocaleString("id-ID")}
                        </span>
                      ) : null}
                      <span className="text-[15px] sm:text-[17px] font-black text-gray-900 dark:text-white leading-none whitespace-nowrap">
                        {prod.accessLevel === "PREMIUM" || prod.accessLevel === "PRO"
                          ? `Rp ${(prod.price || 0).toLocaleString("id-ID")}`
                          : "Rp 0"}
                      </span>
                      {prod.accessLevel === "PRO" && (
                        <span className="text-[9px] sm:text-[10px] text-rn-accent font-bold mt-1.5 whitespace-nowrap">
                          (Rp 0 khusus PRO)
                        </span>
                      )}
                    </div>

                    <div
                      className="flex items-center gap-1 sm:gap-1.5 shrink-0 ml-auto"
                      onMouseDown={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => setEditingProduct(prod)}
                        className="flex items-center justify-center gap-1 px-2 py-1 sm:px-2.5 sm:py-1.5 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 dark:bg-[#141B31] dark:hover:bg-[#1f2947] dark:border-[#2C3246] dark:text-gray-200 rounded-lg transition-colors text-[9px] sm:text-[10px] font-bold"
                      >
                        <Edit className="w-3 h-3" />{" "}
                        <span className="hidden sm:inline">Edit</span>
                      </button>
                      <button
                        onClick={async () => {
                          if (await confirmSwal("Yakin ingin menghapus E-book ini?")) {
                            setLoading(true);
                            await deleteProduct(prod.id);
                            mutate("pengaturan");
                            setLoading(false);
                          }
                        }}
                        className="flex items-center justify-center gap-1 px-2 py-1 sm:px-2.5 sm:py-1.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 dark:bg-red-950/30 dark:hover:bg-red-900/40 dark:border-red-900/40 dark:text-red-400 rounded-lg transition-colors text-[9px] sm:text-[10px] font-bold"
                      >
                        <Trash2 className="w-3 h-3" />{" "}
                        <span className="hidden sm:inline">Hapus</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          {productList.length === 0 && (
            <div className="col-span-full py-12 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 dark:border-[#2C3246] rounded-2xl bg-gray-50 dark:bg-[#141B31]">
              <BookOpen size={40} className="mb-3 opacity-20 text-gray-400" />
              <p className="font-medium text-gray-500 text-sm">
                Belum ada produk e-book yang ditambahkan.
              </p>
              <button
                onClick={() => setShowAddProduct(true)}
                className="mt-3 text-xs font-bold text-rn-accent hover:underline"
              >
                + Tambah E-Book Sekarang
              </button>
            </div>
          )}
        </div>
      </div>

      <AdminRuangBelajarModals
        categories={categories}
        products={products}
        loading={loading}
        setLoading={setLoading}
        uploadedUrls={uploadedUrls}
        setUploadedUrls={setUploadedUrls}
        handleCoverUpload={handleCoverUpload}
        handleCoverDelete={handleCoverDelete}
        showAddCategory={showAddCategory}
        setShowAddCategory={setShowAddCategory}
        showGlobalVoucherModal={showGlobalVoucherModal}
        setShowGlobalVoucherModal={setShowGlobalVoucherModal}
        showAddProduct={showAddProduct}
        setShowAddProduct={setShowAddProduct}
        addAccessLevel={addAccessLevel}
        setAddAccessLevel={setAddAccessLevel}
        managingVouchers={managingVouchers}
        setManagingVouchers={setManagingVouchers}
        newVoucher={newVoucher}
        setNewVoucher={setNewVoucher}
        editingProduct={editingProduct}
        setEditingProduct={setEditingProduct}
      />
    </>
  );
}
