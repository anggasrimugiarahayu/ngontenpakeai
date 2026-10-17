"use client";

import React from "react";
import { Loader2, CheckCircle2, X, CreditCard } from "lucide-react";
import { PAYMENT_METHODS, PaymentMethodKey } from "@/lib/payment-calc";
import { revalidateAfterPurchaseAction } from "@/app/actions/checkout";

export interface CheckoutAddonItem {
  id: string;
  title: string;
  coverUrl: string | null;
  price: number;
}

interface CheckoutModalsProps {
  type: "EBOOK" | "PRO_BOOK" | "PRO_TOOLS" | "PRO_PLUS";
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
          <div className="bg-white dark:bg-[#18181b] rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200 border border-gray-200 dark:border-white/10">
            <div className="p-4 border-b border-gray-100 dark:border-white/10 flex items-center justify-between shrink-0">
              <h3 className="font-bold text-gray-900 dark:text-white">Pilih Add-on</h3>
              <button onClick={() => setShowAddonModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors text-gray-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-3">
              {availableAddons &&
                availableAddons
                  .filter((a) => !selectedAddons.includes(a.id))
                  .map((addon) => (
                    <div key={addon.id} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-black/10">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white dark:bg-[#18181b] rounded-lg p-0.5 border border-gray-100 dark:border-white/5 shrink-0 flex items-center justify-center overflow-hidden">
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
                        className="shrink-0 px-4 py-2 rounded-lg text-xs font-bold transition-all bg-rn-accent text-white hover:bg-rn-accent/90"
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
          <div className="bg-white dark:bg-[#18181b] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200 border border-gray-200 dark:border-white/10">
            <div className="p-4 border-b border-gray-100 dark:border-white/10 flex items-center justify-between shrink-0">
              <h3 className="font-bold text-gray-900 dark:text-white">Masukkan Kode Promo</h3>
              <button
                onClick={() => {
                  setShowVoucherModal(false);
                  setPromoError("");
                  setPromoCodeInput("");
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors text-gray-500"
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
                className="w-full px-4 py-3 bg-gray-50 dark:bg-black/20 border border-gray-300 dark:border-white/10 rounded-xl text-base font-bold uppercase focus:ring-2 focus:ring-rn-accent/50 focus:border-rn-accent outline-none dark:text-white transition-all text-center"
              />
              {promoError && <p className="text-red-500 text-xs font-medium text-center">{promoError}</p>}
              <button
                onClick={handleApplyPromo}
                disabled={isVerifyingPromo || !promoCodeInput.trim()}
                className="w-full bg-rn-accent text-white font-bold py-3 rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isVerifyingPromo ? <Loader2 className="w-5 h-5 animate-spin" /> : "Gunakan Kode"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showPaymentModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#18181b] rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200 border border-gray-200 dark:border-white/10">
            <div className="p-4 border-b border-gray-100 dark:border-white/10 flex items-center justify-between shrink-0">
              <h3 className="font-bold text-gray-900 dark:text-white">Select Payment Method</h3>
              <button onClick={() => setShowPaymentModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors text-gray-500">
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
          <div className="bg-white dark:bg-[#18181b] p-8 rounded-3xl shadow-2xl border border-gray-200 dark:border-white/10 max-w-md w-full mx-auto text-center animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-green-50 text-green-500 dark:bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-black mb-2 text-gray-900 dark:text-white">Pembayaran Berhasil!</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">Terima kasih, pembayaran Anda telah kami terima.</p>
            <button
              onClick={async () => {
                setIsRedirecting(true);
                try {
                  await revalidateAfterPurchaseAction();
                } catch (e) {
                  console.error("Revalidation error:", e);
                }
                const targetUrl = type === "PRO_TOOLS" || type === "PRO_PLUS" ? "/ruang-ngonten" : "/ruang-belajar";
                window.location.href = targetUrl;
              }}
              disabled={isRedirecting}
              className="flex items-center justify-center gap-2 w-full bg-rn-accent text-white font-bold py-3.5 rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity cursor-pointer shadow-lg shadow-rn-accent/25"
            >
              {isRedirecting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Menyiapkan Akses E-Book...</span>
                </>
              ) : (
                `Lanjut ke ${type === "PRO_TOOLS" || type === "PRO_PLUS" ? "Ruang Ngonten" : "Ruang Belajar"}`
              )}
            </button>
          </div>
        </div>
      )}

      {/* INCLUDED ADDONS MODAL */}
      {isIncludedModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#18181b] rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200 border border-gray-200 dark:border-white/10">
            <div className="p-4 border-b border-gray-100 dark:border-white/10 flex items-center justify-between shrink-0">
              <h3 className="font-bold text-gray-900 dark:text-white">Produk Included (Gratis)</h3>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setIsIncludedModalOpen(false);
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-3">
              {includedAddons.map((addon) => (
                <div key={addon.id} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-black/10">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white dark:bg-[#18181b] rounded-lg p-0.5 border border-gray-100 dark:border-white/5 shrink-0 flex items-center justify-center overflow-hidden">
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
