"use client";

import React from "react";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { Loader2, CheckCircle2, X, CreditCard, AlertCircle, MessageSquare, RefreshCw } from "lucide-react";
import { PAYMENT_METHODS, PaymentMethodKey } from "@/lib/payment-calc";
import { revalidateAfterPurchaseAction } from "@/app/actions/checkout";
import { ClawdSuccessVisual, ClawdErrorVisual } from "@/components/ui/ClawdLoadingVisuals";

export interface CheckoutAddonItem {
  id: string;
  title: string;
  coverUrl: string | null;
  price: number;
}

interface CheckoutModalsProps {
  type: string;
  productId?: string;
  productSlug?: string;
  currentOrderId?: string;
  itemName?: string;
  grossAmount?: number;
  errorMessage?: string;
  customerEmail?: string;
  customerName?: string;
  customerPhone?: string;
  onRetryPayment?: () => void;
  onCloseErrorModal?: () => void;
  showAddonModal: boolean;
  setShowAddonModal: (v: boolean) => void;
  availableAddons: CheckoutAddonItem[];
  selectedAddons: string[];
  setSelectedAddons: React.Dispatch<React.SetStateAction<string[]>>;
  showVoucherModal: boolean;
  setShowVoucherModal: (v: boolean) => void;
  promoCodeInput: string;
  setPromoCodeInput: (v: string) => void;
  promoError: string;
  setPromoError: (v: string) => void;
  isVerifyingPromo: boolean;
  handleApplyPromo: () => void;
  showPaymentModal: boolean;
  setShowPaymentModal: (v: boolean) => void;
  groupedMethods: Record<string, PaymentMethodKey[]>;
  selectedMethod: PaymentMethodKey;
  setSelectedMethod: (v: PaymentMethodKey) => void;
  paymentState: "idle" | "verifying" | "success" | "pending" | "error";
  isRedirecting: boolean;
  setIsRedirecting: (v: boolean) => void;
  isIncludedModalOpen: boolean;
  setIsIncludedModalOpen: (v: boolean) => void;
  includedAddons: CheckoutAddonItem[];
  formatRupiah: (num: number) => string;
}

export default function CheckoutModals({
  type,
  productId,
  productSlug,
  currentOrderId,
  itemName,
  grossAmount = 0,
  errorMessage,
  customerEmail,
  customerName,
  customerPhone,
  onRetryPayment,
  onCloseErrorModal,
  showAddonModal,
  setShowAddonModal,
  availableAddons,
  selectedAddons,
  setSelectedAddons,
  showVoucherModal,
  setShowVoucherModal,
  promoCodeInput,
  setPromoCodeInput,
  promoError,
  setPromoError,
  isVerifyingPromo,
  handleApplyPromo,
  showPaymentModal,
  setShowPaymentModal,
  groupedMethods,
  selectedMethod,
  setSelectedMethod,
  paymentState,
  isRedirecting,
  setIsRedirecting,
  isIncludedModalOpen,
  setIsIncludedModalOpen,
  includedAddons,
  formatRupiah,
}: CheckoutModalsProps) {
  return (
    <>
      {showAddonModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#141B31] rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200 border border-gray-200 dark:border-[#2C3246]">
            <div className="p-4 border-b border-gray-100 dark:border-[#2C3246] flex items-center justify-between shrink-0">
              <h3 className="font-bold text-gray-900 dark:text-white">Pilih Add-on</h3>
              <button onClick={() => setShowAddonModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-[#1f2947] rounded-full transition-colors text-gray-500 dark:text-gray-400 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-3">
              {availableAddons &&
                availableAddons
                  .filter((a) => !selectedAddons.includes(a.id))
                  .map((addon) => (
                    <div key={addon.id} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 dark:border-[#2C3246] bg-gray-50/50 dark:bg-black/10">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white dark:bg-[#141B31] rounded-lg p-0.5 border border-gray-100 dark:border-[#2C3246] shrink-0 flex items-center justify-center overflow-hidden">
                          {addon.coverUrl ? <img src={addon.coverUrl} className="w-full h-full object-contain" alt="" /> : <CreditCard className="w-5 h-5 text-gray-300" />}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1">{addon.title}</p>
                          <p className="text-xs font-medium text-rn-accent">+ Rp {formatRupiah(addon.price || 0)}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedAddons((prev) => [...prev, addon.id]);
                          setShowAddonModal(false);
                        }}
                        className="shrink-0 px-4 py-2 rounded-lg text-xs font-bold transition-all bg-[#f97316] hover:bg-[#ea580c] dark:bg-[#f97316] dark:hover:bg-[#fb923c] text-white shadow-sm shadow-orange-500/20"
                      >
                        + Tambah
                      </button>
                    </div>
                  ))}

              {availableAddons && availableAddons.filter((a) => !selectedAddons.includes(a.id)).length === 0 && (
                <div className="text-center py-8 text-gray-500 text-sm">Semua produk sudah ada di keranjang Anda.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {showVoucherModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#141B31] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200 border border-gray-200 dark:border-[#2C3246]">
            <div className="p-4 border-b border-gray-100 dark:border-[#2C3246] flex items-center justify-between shrink-0">
              <h3 className="font-bold text-gray-900 dark:text-white">Masukkan Kode Promo</h3>
              <button
                onClick={() => {
                  setShowVoucherModal(false);
                  setPromoError("");
                  setPromoCodeInput("");
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-[#1f2947] rounded-full transition-colors text-gray-500 dark:text-gray-400 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <input
                type="text"
                placeholder="Contoh: DISKON50"
                value={promoCodeInput}
                onChange={(e) => setPromoCodeInput(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0F172A] border border-gray-300 dark:border-[#2C3246] rounded-xl text-base font-bold uppercase focus:ring-2 focus:ring-rn-accent/50 focus:border-rn-accent outline-none dark:text-white transition-all text-center"
              />
              {promoError && <p className="text-red-500 text-xs font-medium text-center">{promoError}</p>}
              <button
                onClick={handleApplyPromo}
                disabled={isVerifyingPromo || !promoCodeInput.trim()}
                className="w-full bg-[#f97316] hover:bg-[#ea580c] dark:bg-[#f97316] dark:hover:bg-[#fb923c] text-white font-bold py-3 rounded-xl shadow-sm shadow-orange-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isVerifyingPromo ? <Loader2 className="w-5 h-5 animate-spin" /> : "Gunakan Kode"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showPaymentModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#141B31] rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200 border border-gray-200 dark:border-[#2C3246]">
            <div className="p-4 border-b border-gray-100 dark:border-[#2C3246] flex items-center justify-between shrink-0">
              <h3 className="font-bold text-gray-900 dark:text-white">Select Payment Method</h3>
              <button onClick={() => setShowPaymentModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-[#1f2947] rounded-full transition-colors text-gray-500 dark:text-gray-400 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-6">
              {Object.entries(groupedMethods).map(([groupName, keys]) => {
                const validKeys = keys.filter((k) => PAYMENT_METHODS[k]);
                if (validKeys.length === 0) return null;

                return (
                  <div key={groupName}>
                    <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 tracking-wider mb-3 uppercase">{groupName}</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {validKeys.map((key) => {
                        const method = PAYMENT_METHODS[key];
                        const isSelected = selectedMethod === key;
                        const methodIconUrls = method.iconUrls;
                        return (
                          <label
                            key={key}
                            onClick={() => {
                              setSelectedMethod(key);
                              setShowPaymentModal(false);
                            }}
                            className={`flex items-center justify-between gap-3 p-3 border rounded-xl cursor-pointer transition-all bg-white ${
                              isSelected ? "border-rn-accent bg-rn-accent/5 shadow-sm" : "border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            <div className="flex items-center justify-start flex-1 h-8">
                              {methodIconUrls && methodIconUrls.length > 0 ? (
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  {methodIconUrls.map((url, i) => (
                                    <img key={i} src={url} alt={method.name} className={`max-w-[140px] object-contain ${methodIconUrls.length > 1 ? "h-4" : "h-5"}`} />
                                  ))}
                                </div>
                              ) : (
                                <span className="text-sm font-bold text-gray-800">{method.name}</span>
                              )}
                            </div>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${isSelected ? "border-rn-accent" : "border-gray-300"}`}>
                              {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-rn-accent" />}
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {paymentState === "success" && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-[#141B31] p-6 sm:p-8 rounded-3xl shadow-2xl border border-gray-200 dark:border-[#2C3246] max-w-md w-full mx-auto text-center animate-in zoom-in-95 duration-300">
            <div className="flex justify-center mb-2">
              <ClawdSuccessVisual />
            </div>
            <h2 className="text-2xl font-black mb-1 text-gray-900 dark:text-white">Pembayaran Berhasil!</h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-5">
              Alhamdulillah, pembayaran Anda telah kami terima.
            </p>

            {/* Digital Receipt Card */}
            <div className="bg-gray-50/80 dark:bg-[#0F172A] border border-gray-200/80 dark:border-[#2C3246] rounded-2xl p-4 mb-6 text-left text-xs sm:text-sm space-y-2.5">
              {currentOrderId && (
                <div className="flex justify-between items-center pb-2 border-b border-gray-200/60 dark:border-[#2C3246]">
                  <span className="text-gray-500 dark:text-gray-400">No. Pesanan</span>
                  <span className="font-mono font-bold text-gray-900 dark:text-white text-xs tracking-tight">
                    #{currentOrderId}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-start gap-2 pb-2 border-b border-gray-200/60 dark:border-[#2C3246]">
                <span className="text-gray-500 dark:text-gray-400 shrink-0">Produk</span>
                <span className="font-bold text-gray-900 dark:text-white text-right line-clamp-1">
                  {itemName || "Produk Digital"}
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-gray-200/60 dark:border-[#2C3246]">
                <span className="text-gray-500 dark:text-gray-400">Metode Bayar</span>
                <span className="font-medium text-gray-800 dark:text-gray-200">
                  {PAYMENT_METHODS[selectedMethod]?.name || selectedMethod}
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-gray-200/60 dark:border-[#2C3246]">
                <span className="text-gray-500 dark:text-gray-400">Status</span>
                <span className="inline-flex items-center font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full text-[11px] tracking-wide">
                  LUNAS
                </span>
              </div>
              <div className="flex justify-between items-center pt-1 font-bold">
                <span className="text-gray-700 dark:text-gray-300">Total Bayar</span>
                <span className="text-base text-gray-900 dark:text-white font-black text-rn-accent">
                  Rp {formatRupiah(grossAmount)}
                </span>
              </div>
            </div>

            {(() => {
              const upperType = (type || "").toUpperCase();
              let targetUrl = "/ruang-belajar";
              let targetName = "Ruang Belajar";
              let loadingMessage = "Menyiapkan Akses E-Book...";

              if (upperType === "EBOOK") {
                if (productSlug) {
                  targetUrl = `/ruang-belajar/${productSlug}`;
                  targetName = "Akses Buku Sekarang";
                } else {
                  targetUrl = "/ruang-belajar";
                  targetName = "Ruang Belajar";
                }
                loadingMessage = "Membuka Halaman Buku...";
              } else if (upperType.includes("RISET")) {
                targetUrl = "/ruang-riset";
                targetName = "Ruang Riset";
                loadingMessage = "Menyiapkan Akses Ruang Riset...";
              } else if (upperType.includes("AUTO")) {
                targetUrl = "/ruang-automation";
                targetName = "Ruang Automation";
                loadingMessage = "Menyiapkan Akses Ruang Automation...";
              } else if (upperType.includes("TOOLS") || upperType.includes("PLUS")) {
                targetUrl = "/ruang-ngonten";
                targetName = "Ruang Ngonten";
                loadingMessage = "Menyiapkan Akses Ruang Ngonten...";
              }

              return (
                <Button
                  onClick={async () => {
                    setIsRedirecting(true);
                    try {
                      await revalidateAfterPurchaseAction();
                    } catch (e) {
                      console.error("Revalidation error:", e);
                    }
                    window.location.href = targetUrl;
                  }}
                  disabled={isRedirecting}
                  isLoading={isRedirecting}
                  loadingText={loadingMessage}
                  variant="primary"
                  size="lg"
                  className="w-full py-3.5 h-auto text-base font-bold shadow-md shadow-orange-500/20"
                >
                  Lanjut ke {targetName}
                </Button>
              );
            })()}

            <div className="mt-4">
              <Link
                href="/pengaturan?tab=langganan"
                className="text-xs text-gray-500 hover:text-gray-800 dark:hover:text-gray-300 font-medium underline transition-colors"
              >
                Lihat Riwayat Pembelian & Langganan
              </Link>
            </div>
          </div>
        </div>
      )}

      {paymentState === "error" && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-[#141B31] p-6 sm:p-8 rounded-3xl shadow-2xl border border-gray-200 dark:border-[#2C3246] max-w-md w-full mx-auto text-center relative animate-in zoom-in-95 duration-300">
            {onCloseErrorModal && (
              <button
                onClick={onCloseErrorModal}
                className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-[#1f2947] rounded-full transition-colors text-gray-400 hover:text-gray-700 dark:hover:text-white"
                aria-label="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            )}

            <div className="flex justify-center mb-2">
              <ClawdErrorVisual />
            </div>

            <h2 className="text-2xl font-black mb-1 text-gray-900 dark:text-white">Pembayaran Belum Berhasil</h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-5">
              {errorMessage || "Waktu pembayaran telah habis atau transaksi tidak dapat diproses."}
            </p>

            {/* Detail Ringkas */}
            <div className="bg-red-50/50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/40 rounded-2xl p-4 mb-6 text-left text-xs sm:text-sm space-y-2">
              <div className="flex justify-between items-start gap-2 pb-2 border-b border-red-100/80 dark:border-red-900/30">
                <span className="text-gray-500 dark:text-gray-400 shrink-0">Produk</span>
                <span className="font-bold text-gray-900 dark:text-white text-right line-clamp-1">
                  {itemName || "Produk Digital"}
                </span>
              </div>
              {currentOrderId && (
                <div className="flex justify-between items-center pb-2 border-b border-red-100/80 dark:border-red-900/30">
                  <span className="text-gray-500 dark:text-gray-400">No. Pesanan</span>
                  <span className="font-mono font-medium text-gray-800 dark:text-gray-200 text-xs">
                    #{currentOrderId}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center pt-0.5">
                <span className="text-gray-500 dark:text-gray-400">Status</span>
                <span className="inline-flex items-center font-bold text-red-600 dark:text-red-400 text-[11px] tracking-wide bg-red-100/60 dark:bg-red-950/40 px-2.5 py-0.5 rounded-full">
                  GAGAL / EXPIRED
                </span>
              </div>
            </div>

            <div className="space-y-3">
              {onRetryPayment && (
                <Button
                  onClick={onRetryPayment}
                  variant="primary"
                  size="lg"
                  className="w-full py-3.5 h-auto text-base font-bold shadow-md shadow-orange-500/20 flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" /> Coba Bayar Ulang
                </Button>
              )}

              {onCloseErrorModal && (
                <button
                  type="button"
                  onClick={onCloseErrorModal}
                  className="w-full py-3 px-4 rounded-xl text-sm font-bold bg-gray-100 hover:bg-gray-200 dark:bg-[#1E293B] dark:hover:bg-[#28354D] text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-[#2C3246] flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
                >
                  <CreditCard className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  Ganti Metode Pembayaran
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* INCLUDED ADDONS MODAL */}
      {isIncludedModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#141B31] rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200 border border-gray-200 dark:border-[#2C3246]">
            <div className="p-4 border-b border-gray-100 dark:border-[#2C3246] flex items-center justify-between shrink-0">
              <h3 className="font-bold text-gray-900 dark:text-white">Produk Included (Gratis)</h3>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setIsIncludedModalOpen(false);
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-[#1f2947] rounded-full transition-colors text-gray-500 dark:text-gray-400 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-3">
              {includedAddons.map((addon) => (
                <div key={addon.id} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 dark:border-[#2C3246] bg-gray-50/50 dark:bg-black/10">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white dark:bg-[#141B31] rounded-lg p-0.5 border border-gray-100 dark:border-[#2C3246] shrink-0 flex items-center justify-center overflow-hidden">
                      {addon.coverUrl ? <img src={addon.coverUrl} className="w-full h-full object-contain" alt="" /> : <CreditCard className="w-5 h-5 text-gray-300" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1">{addon.title}</p>
                      <p className="text-xs font-medium text-green-500">Termasuk Paket (Rp 0)</p>
                    </div>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
