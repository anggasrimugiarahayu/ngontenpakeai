"use client";

import { useState, useMemo, useEffect } from "react";
import Script from "next/script";
import { useSession } from "next-auth/react";
import { createCheckoutToken, verifyPayment, cancelPayment } from "@/app/actions/payment";
import { validatePromoCodeAction } from "@/app/actions/checkout";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle2, ChevronRight, X, Lock, CreditCard, AlertCircle } from "lucide-react";
import { BackButton } from "@/components/ui/BackButton";
import Link from "next/link";
import dynamic from "next/dynamic";
import { PAYMENT_METHODS, calculatePaymentFees, PaymentMethodKey } from "@/lib/payment-calc";
import type { CheckoutAddonItem } from "./CheckoutModals";

const CheckoutModals = dynamic(() => import("./CheckoutModals"), { ssr: false });

interface CheckoutClientProps {
  type: string;
  productId?: string;
  itemName: string;
  itemDescription: string;
  baseAmount: number;
  clientKey: string;
  isProduction: boolean;
  initialName: string;
  initialEmail: string;
  initialPhone: string;
  isLoggedIn?: boolean;
  productImage?: string;
  existingPendingOrder?: { token: string | null; orderId: string; expiryTime: string; paymentMethodKey: string } | null;
  availableAddons?: CheckoutAddonItem[];
  includedAddons?: CheckoutAddonItem[];
}

export default function CheckoutClient({
  type,
  productId,
  itemName,
  itemDescription,
  baseAmount,
  clientKey,
  isProduction,
  initialName,
  initialEmail,
  initialPhone,
  isLoggedIn = false,
  productImage,
  existingPendingOrder,
  availableAddons = [],
  includedAddons = [],
}: CheckoutClientProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const userIsLoggedIn = isLoggedIn || Boolean(session?.user?.id);
  const [loading, setLoading] = useState(false);
  const [paymentState, setPaymentState] = useState<"idle" | "verifying" | "success" | "pending" | "error">(existingPendingOrder ? "pending" : "idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [isIncludedModalOpen, setIsIncludedModalOpen] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodKey>((existingPendingOrder?.paymentMethodKey as PaymentMethodKey) || "QRIS");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [showAddonModal, setShowAddonModal] = useState(false);
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [promoCodeInput, setPromoCodeInput] = useState("");
  const [promoError, setPromoError] = useState("");
  const [isVerifyingPromo, setIsVerifyingPromo] = useState(false);
  const [appliedVoucher, setAppliedVoucher] = useState<{ code: string; type: string; value: number; amount: number } | null>(null);
  const [isCancelLoading, setIsCancelLoading] = useState(false);

  const handleCancelPayment = async () => {
    if (!currentOrderId) return;
    setIsCancelLoading(true);
    try {
      await cancelPayment(currentOrderId);
      window.location.reload();
    } catch (e) {
      console.error(e);
      setIsCancelLoading(false);
    }
  };

  const [customerName, setCustomerName] = useState(initialName);
  const [customerEmail, setCustomerEmail] = useState(initialEmail);
  const [customerPhone, setCustomerPhone] = useState(initialPhone);

  // Restore any draft saved when an unauthenticated guest was redirected to login
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("guest_checkout_draft");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.customerName) setCustomerName(parsed.customerName);
        if (parsed.customerEmail) setCustomerEmail(parsed.customerEmail);
        if (parsed.customerPhone) setCustomerPhone(parsed.customerPhone);
        if (parsed.selectedMethod) setSelectedMethod(parsed.selectedMethod);
        if (Array.isArray(parsed.selectedAddons) && parsed.selectedAddons.length > 0) {
          setSelectedAddons(parsed.selectedAddons);
        }
        if (parsed.agreeToTerms) setAgreeToTerms(true);
        if (parsed.agreeToMarketing) setAgreeToMarketing(true);
        if (parsed.voucherCode) setPromoCodeInput(parsed.voucherCode);
        sessionStorage.removeItem("guest_checkout_draft");
      }
    } catch (e) {
      console.error("Failed to restore checkout draft", e);
    }
  }, []);

  useEffect(() => {
    if (initialName && !customerName) setCustomerName(initialName);
    if (initialEmail && !customerEmail) setCustomerEmail(initialEmail);
    if (initialPhone && !customerPhone) setCustomerPhone(initialPhone);
  }, [initialName, initialEmail, initialPhone]);

  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [agreeToMarketing, setAgreeToMarketing] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const [currentToken, setCurrentToken] = useState(existingPendingOrder?.token || "");
  const [currentOrderId, setCurrentOrderId] = useState(existingPendingOrder?.orderId || "");
  const [expiryTime, setExpiryTime] = useState(existingPendingOrder?.expiryTime || "");
  const [timeLeft, setTimeLeft] = useState("");

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(num);
  };

  const { grossAmount, adminFee, discountAmount } = useMemo(() => {
    const addonsTotal = availableAddons.filter((a) => selectedAddons.includes(a.id)).reduce((acc, curr) => acc + (curr.price || 0), 0);

    let discount = 0;
    if (appliedVoucher) {
      if (appliedVoucher.type === "PERCENTAGE") {
        discount = Math.floor(baseAmount * (appliedVoucher.value / 100));
      } else {
        discount = appliedVoucher.value;
      }
      if (discount > baseAmount) discount = baseAmount;
      appliedVoucher.amount = discount;
    }

    const finalBase = baseAmount + addonsTotal - discount;

    const calc = calculatePaymentFees(finalBase, selectedMethod);
    return { ...calc, totalAddonsPrice: addonsTotal, discountAmount: discount };
  }, [baseAmount, selectedMethod, selectedAddons, availableAddons, appliedVoucher]);

  const handleApplyPromo = async () => {
    if (!promoCodeInput.trim()) return;
    setIsVerifyingPromo(true);
    setPromoError("");

    if (!productId) {
      setTimeout(() => {
        setIsVerifyingPromo(false);
        setPromoError("Kode promo tidak ditemukan atau tidak berlaku untuk Paket.");
      }, 600);
      return;
    }

    try {
      const res = await validatePromoCodeAction(promoCodeInput.trim(), productId);
      if (res.success) {
        setAppliedVoucher({
          code: promoCodeInput.trim().toUpperCase(),
          type: res.discountType || "PERCENTAGE",
          value: res.discountValue || 0,
          amount: 0,
        });
        setShowVoucherModal(false);
        setPromoCodeInput("");
      } else {
        setPromoError(res.message || "Kode promo tidak valid.");
      }
    } catch {
      setPromoError("Terjadi kesalahan.");
    } finally {
      setIsVerifyingPromo(false);
    }
  };

  useEffect(() => {
    if (paymentState !== "pending" || !expiryTime) return;

    const parseDateSafely = (timeStr: string) => {
      try {
        let cleaned = timeStr.trim();
        cleaned = cleaned.replace(/\s+([+-]\d{4})$/, "$1");
        cleaned = cleaned.replace(" ", "T");
        const d = new Date(cleaned);
        if (!isNaN(d.getTime())) return d.getTime();
        const fallback = new Date(timeStr);
        if (!isNaN(fallback.getTime())) return fallback.getTime();
      } catch {}
      return null;
    };

    const targetTime = parseDateSafely(expiryTime);

    const updateTimer = () => {
      if (!targetTime) {
        setTimeLeft("...");
        return;
      }
      const distance = targetTime - Date.now();
      if (isNaN(distance) || distance <= 0) {
        setTimeLeft("EXPIRED");
        setPaymentState("error");
        setErrorMessage("Waktu pembayaran telah habis. Silakan buat pesanan baru.");
      } else {
        const hours = Math.floor(distance / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        if (hours > 0) {
          setTimeLeft(`${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`);
        } else {
          setTimeLeft(`${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`);
        }
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [paymentState, expiryTime]);

  // Polling mechanism to check payment status in the background
  useEffect(() => {
    if (paymentState !== "pending" || !currentOrderId) return;

    let isMounted = true;
    const checkNow = async () => {
      try {
        const verifyRes = await verifyPayment(currentOrderId);
        if (!isMounted) return;
        if (verifyRes.success && verifyRes.status === "SUCCESS") {
          setPaymentState("success");
        } else if (verifyRes.success && verifyRes.status === "FAILED") {
          setPaymentState("error");
          setErrorMessage("Pesanan telah dibatalkan atau waktu telah habis.");
          setTimeLeft("EXPIRED");
        }
      } catch {
        // silently ignore network errors during polling
      }
    };

    checkNow();

    const pollInterval = setInterval(checkNow, 6000);

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
    };
  }, [paymentState, currentOrderId]);

  const openSnap = (token: string, orderId: string) => {
    (window as any).snap.pay(token, {
      onSuccess: async function () {
        setPaymentState("verifying");
        let verifyRes = await verifyPayment(orderId);
        if (verifyRes.success && verifyRes.status === "SUCCESS") {
          setPaymentState("success");
          return;
        }

        await new Promise((resolve) => setTimeout(resolve, 3000));
        verifyRes = await verifyPayment(orderId);

        if (verifyRes.success && verifyRes.status === "SUCCESS") {
          setPaymentState("success");
        } else if (verifyRes.success && verifyRes.status === "PENDING") {
          setPaymentState("pending");
          if (verifyRes.expiryTime) setExpiryTime(verifyRes.expiryTime);
        } else {
          setPaymentState("error");
          setErrorMessage("Pembayaran berhasil di Midtrans, tetapi statusnya masih menunggu konfirmasi. Jika saldo sudah terpotong, silakan hubungi admin.");
        }
      },
      onPending: async function () {
        setPaymentState("pending");
        const verifyRes = await verifyPayment(orderId);
        if (verifyRes.success && verifyRes.status === "PENDING") {
          setExpiryTime(verifyRes.expiryTime || "");
        }
      },
      onError: function () {
        setPaymentState("error");
        setErrorMessage("Pembayaran gagal ditagihkan.");
        setLoading(false);
      },
      onClose: async function () {
        setPaymentState("pending");
        const verifyRes = await verifyPayment(orderId);
        if (verifyRes.success && verifyRes.status === "SUCCESS") setPaymentState("success");
        else if (verifyRes.success && verifyRes.status === "PENDING") {
          setExpiryTime(verifyRes.expiryTime || "");
        } else {
          setLoading(false);
          setPaymentState("idle");
        }
      },
    });
  };

  const handlePay = async () => {
    if (!customerName || !customerEmail || !customerPhone) return setErrorMessage("Mohon lengkapi Email, Nama, dan Phone Number Anda.");
    if (!agreeToTerms || !agreeToMarketing) return setErrorMessage("Anda harus menyetujui kedua persyaratan di atas untuk melanjutkan.");

    // If user is not logged in, save draft to sessionStorage and redirect to login
    if (!userIsLoggedIn) {
      if (typeof window !== "undefined") {
        const draft = {
          customerName,
          customerEmail,
          customerPhone,
          selectedMethod,
          selectedAddons,
          voucherCode: appliedVoucher?.code || promoCodeInput || undefined,
          agreeToTerms,
          agreeToMarketing,
        };
        try {
          sessionStorage.setItem("guest_checkout_draft", JSON.stringify(draft));
        } catch (e) {
          console.error("Failed to save checkout draft", e);
        }
        const currentPath = window.location.pathname + window.location.search;
        window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
      }
      return;
    }

    setLoading(true);
    setErrorMessage("");
    try {
      const res = await createCheckoutToken({
        type,
        productId,
        paymentMethodKey: selectedMethod,
        customerName,
        customerEmail,
        customerPhone,
        addonIds: selectedAddons,
        voucherCode: appliedVoucher?.code,
        discountAmount,
      });
      if (res?.token && res?.orderId) {
        setCurrentToken(res.token);
        setCurrentOrderId(res.orderId);
        if (res.expiryTime) {
          setExpiryTime(res.expiryTime);
        }
        openSnap(res.token, res.orderId);
      }
      setLoading(false);
    } catch (error: any) {
      setErrorMessage(error.message);
      setPaymentState("error");
      setLoading(false);
    }
  };

  const groupedMethods = {
    "Transfer Bank (Virtual Account)": ["BCA_VA", "BRI_VA", "BNI_VA", "MANDIRI_VA", "PERMATA_VA", "CIMB_VA", "DANAMON_VA", "BSI_VA", "SEABANK_VA", "BANK_SAQU_VA"],
    "E-Wallet & QRIS": ["GOPAY", "QRIS", "SHOPEEPAY", "DANA", "OVO"],
    Minimarket: ["INDOMARET", "ALFAMART", "ALFAMIDI", "DAN_DAN"],
    "Kartu Kredit & Cicilan": ["CREDIT_CARD", "AKULAKU", "KREDIVO"],
  } as Record<string, PaymentMethodKey[]>;

  if (paymentState === "verifying") {
    return (
      <div className="bg-white dark:bg-[#141B31] p-8 rounded-2xl shadow-xl border border-gray-200 dark:border-[#2C3246] max-w-md w-full mx-auto text-center mt-10">
        <Loader2 className="w-16 h-16 text-rn-accent animate-spin mx-auto mb-6" />
        <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Memverifikasi Status...</h2>
        <p className="text-gray-500 text-sm">Sistem sedang menghubungi Midtrans.</p>
      </div>
    );
  }

  const isPending = paymentState === "pending";
  const selectedMethodIconUrls = PAYMENT_METHODS[selectedMethod]?.iconUrls;

  return (
    <div className="w-full relative h-full flex flex-col justify-center">
      <Script src={isProduction ? "https://app.midtrans.com/snap/snap.js" : "https://app.sandbox.midtrans.com/snap/snap.js"} data-client-key={clientKey} strategy="afterInteractive" />

      <div className="flex items-center justify-between mb-6">
        <BackButton />
        <h1 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white absolute left-1/2 -translate-x-1/2">Checkout</h1>
        <div className="w-9"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-4 lg:gap-6 items-stretch">
        <div className="flex flex-col space-y-4">
          <div className="bg-white dark:bg-[#141B31] rounded-2xl shadow-sm border border-gray-200 dark:border-[#2C3246] p-4 md:p-5 flex-none">
            <h3 className="text-[11px] font-bold text-gray-400 dark:text-gray-500 tracking-wider mb-3 uppercase">PRODUCT</h3>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 mt-1">1x</span>
                <div className="w-16 h-16 bg-gray-50 dark:bg-[#0F172A] rounded-xl overflow-hidden flex items-center justify-center shrink-0 border border-gray-100 dark:border-[#2C3246] p-1">
                  {productImage ? <img src={productImage} alt={itemName} className="w-full h-full object-contain" /> : <CreditCard className="w-6 h-6 text-gray-300 dark:text-gray-600" />}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white text-sm md:text-base leading-snug mb-1">{itemName}</h4>
                  <div
                    className="text-xs text-gray-500 dark:text-gray-400 max-w-[250px] line-clamp-2 prose prose-sm dark:prose-invert"
                    dangerouslySetInnerHTML={{ __html: itemDescription || "Akses selamanya untuk E-book ini." }}
                  />
                </div>
              </div>
              <span className="font-medium text-gray-900 dark:text-white text-sm md:text-base shrink-0 ml-2">Rp {formatRupiah(baseAmount)}</span>
            </div>

            {/* Addons Section */}
            {availableAddons && availableAddons.length > 0 && (
              <div className="mt-5 pt-4 border-t border-gray-100 dark:border-[#2C3246]">
                <h3 className="text-[11px] font-bold text-gray-400 dark:text-gray-500 tracking-wider mb-3 uppercase">ADD-ON PRODUK LAIN</h3>
                <div className="space-y-3">
                  {includedAddons.length > 0 && (
                    <div className="mb-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setIsIncludedModalOpen(true);
                        }}
                        className="w-full flex items-center justify-between p-3 rounded-xl border border-gray-100 dark:border-[#2C3246] bg-green-50/50 dark:bg-green-900/10 hover:bg-green-100/50 dark:hover:bg-green-900/20 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                          <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Lihat {includedAddons.length} Produk Included (Gratis)</span>
                        </div>
                        <span className="text-xs text-green-600 dark:text-green-400 font-semibold cursor-pointer">Buka</span>
                      </button>
                    </div>
                  )}
                  {selectedAddons.length > 0 && <p className="text-[10px] uppercase font-bold tracking-widest text-gray-500 mb-1 ml-1 mt-3">Tambahan Ekstra</p>}
                  {selectedAddons.map((addonId) => {
                    const addon = availableAddons.find((a) => a.id === addonId);
                    if (!addon) return null;
                    return (
                      <div key={addon.id} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 dark:border-[#2C3246] bg-gray-50/50 dark:bg-black/10">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white dark:bg-[#141B31] rounded-lg p-0.5 border border-gray-100 dark:border-[#2C3246] shrink-0 flex items-center justify-center overflow-hidden">
                            {addon.coverUrl ? <img src={addon.coverUrl} className="w-full h-full object-contain" alt="" /> : <CreditCard className="w-4 h-4 text-gray-300" />}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-gray-900 dark:text-white line-clamp-1">{addon.title}</p>
                            <p className="text-xs font-medium text-rn-accent">+ Rp {formatRupiah(addon.price || 0)}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setSelectedAddons((prev) => prev.filter((id) => id !== addon.id))}
                          disabled={isPending}
                          className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-50 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 dark:bg-red-950/30 dark:hover:bg-red-900/40 dark:border-red-900/40 dark:text-red-400 font-bold"
                        >
                          Batal
                        </button>
                      </div>
                    );
                  })}

                  <button
                    onClick={() => setShowAddonModal(true)}
                    disabled={isPending}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-orange-500/50 text-orange-600 dark:text-orange-400 text-sm font-bold hover:bg-orange-500/5 dark:hover:bg-orange-500/10 transition-colors disabled:opacity-50"
                  >
                    + Add on
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-[#141B31] rounded-2xl shadow-sm border border-gray-200 dark:border-[#2C3246] p-4 md:p-5 flex-1 flex flex-col">
            <h3 className="text-[11px] font-bold text-gray-400 dark:text-gray-500 tracking-wider mb-4 uppercase">BUYER INFO</h3>
            <div className="space-y-3.5 flex-1">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  <span className="text-red-500">*</span> Email
                </label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  disabled={isPending}
                  className="w-full px-3 py-2 bg-white dark:bg-[#0F172A] border border-gray-300 dark:border-[#2C3246] rounded-lg text-sm focus:ring-1 focus:ring-rn-accent focus:border-rn-accent outline-none dark:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  <span className="text-red-500">*</span> Name
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  disabled={isPending}
                  className="w-full px-3 py-2 bg-white dark:bg-[#0F172A] border border-gray-300 dark:border-[#2C3246] rounded-lg text-sm focus:ring-1 focus:ring-rn-accent focus:border-rn-accent outline-none dark:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  <span className="text-red-500">*</span> Phone Number
                </label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  disabled={isPending}
                  className="w-full px-3 py-2 bg-white dark:bg-[#0F172A] border border-gray-300 dark:border-[#2C3246] rounded-lg text-sm focus:ring-1 focus:ring-rn-accent focus:border-rn-accent outline-none dark:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="w-full bg-white dark:bg-[#141B31] rounded-2xl shadow-sm border border-gray-200 dark:border-[#2C3246] p-4 md:p-5 flex flex-col h-full">
          <h3 className="text-[11px] font-bold text-gray-400 dark:text-gray-500 tracking-wider mb-4 uppercase">PAYMENT DETAIL</h3>

          <div className="space-y-2 mb-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600 dark:text-gray-400 font-medium">Subtotal</span>
              <span className="text-gray-900 dark:text-white">Rp {formatRupiah(baseAmount)}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600 dark:text-gray-400 font-medium">Discount {appliedVoucher && `(${appliedVoucher.code})`}</span>
              <span className="text-rn-accent">- Rp {formatRupiah(discountAmount)}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600 dark:text-gray-400 font-medium">Convenience fee</span>
              <span className="text-gray-900 dark:text-white">Rp {formatRupiah(adminFee)}</span>
            </div>
          </div>

          <div className="flex justify-between items-center mb-4 pt-3 border-t border-gray-100 dark:border-white/10">
            <span className="font-bold text-gray-900 dark:text-gray-100">TOTAL</span>
            <span className="text-lg font-black text-gray-900 dark:text-white">Rp {formatRupiah(grossAmount)}</span>
          </div>

          {appliedVoucher ? (
            <div className="flex justify-between text-rn-accent text-sm items-center mb-4 p-3 bg-rn-accent/10 rounded-xl border border-rn-accent/20">
              <div className="flex items-center gap-2 font-bold">
                <span className="uppercase">{appliedVoucher.code}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-black">- Rp {formatRupiah(appliedVoucher.amount)}</span>
                <button onClick={() => setAppliedVoucher(null)} className="p-1 hover:bg-rn-accent/20 rounded-full transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowVoucherModal(true)}
              disabled={isPending}
              className="w-full flex items-center justify-center gap-2 py-3 mb-4 rounded-xl border border-dashed border-orange-500/50 text-orange-600 dark:text-orange-400 text-sm font-bold hover:bg-orange-500/5 dark:hover:bg-orange-500/10 transition-colors disabled:opacity-50"
            >
              + Add Voucher
            </button>
          )}

          <div className="border border-rn-accent/50 dark:border-rn-accent/40 rounded-xl overflow-hidden mb-4 relative flex-none">
            <button
              onClick={() => !isPending && setShowPaymentModal(true)}
              disabled={isPending}
              className={`w-full p-3 flex items-center justify-between bg-white transition-colors ${isPending ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50"}`}
            >
              <div className="flex items-center gap-3">
                {selectedMethodIconUrls && selectedMethodIconUrls.length > 0 ? (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {selectedMethodIconUrls.map((url, i) => (
                      <img key={i} src={url} alt={selectedMethod} className={`max-w-[140px] object-contain ${selectedMethodIconUrls.length > 1 ? "h-4" : "h-5"}`} />
                    ))}
                  </div>
                ) : (
                  <span className="font-bold text-sm text-gray-800">{PAYMENT_METHODS[selectedMethod]?.name || "Pilih Metode"}</span>
                )}
              </div>
              <ChevronRight className="w-4 h-4 text-rn-accent" />
            </button>
            <div className="bg-gray-50 dark:bg-[#0F172A] p-2.5 border-t border-gray-100 dark:border-[#2C3246] flex items-start gap-2.5">
              <div className="mt-0.5 text-rn-accent">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <h5 className="text-[11px] font-bold text-gray-900 dark:text-white">Secure Payment</h5>
                <p className="text-[9px] text-gray-500">All your payments are secured with RSA encryption</p>
              </div>
            </div>
          </div>

          <div className="mb-5 flex-1 flex flex-col justify-end min-h-[90px]">
            {isPending ? (
              <div className="bg-orange-50 dark:bg-orange-950/30 border border-orange-100 dark:border-orange-900/50 rounded-xl p-4 flex flex-col items-center justify-center text-center h-full">
                <p className="text-xs text-orange-600 dark:text-orange-400 font-medium uppercase tracking-wider mb-1">Pay Within</p>
                <div className="text-2xl font-black text-rn-accent mb-1 tracking-widest">{timeLeft || "..."}</div>
                <div className="text-xs font-semibold text-gray-600 dark:text-gray-300">Status: Menunggu Pembayaran</div>
              </div>
            ) : (
              <div className="space-y-3">
                {errorMessage && (
                  <div className="p-3 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-xs rounded-xl border border-red-100 dark:border-red-900/50 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span className="font-medium">{errorMessage}</span>
                  </div>
                )}
                <label className="flex items-start gap-2.5 cursor-pointer group">
                  <div className="relative flex items-center justify-center mt-0.5 shrink-0">
                    <input
                      type="checkbox"
                      checked={agreeToTerms}
                      onChange={(e) => setAgreeToTerms(e.target.checked)}
                      className="peer appearance-none w-4 h-4 border-2 border-gray-300 dark:border-gray-600 rounded checked:border-rn-accent checked:bg-rn-accent outline-none focus:ring-2 focus:ring-rn-accent/30 transition-all cursor-pointer disabled:opacity-50"
                    />
                    <CheckCircle2 className="w-3 h-3 text-white absolute opacity-0 peer-checked:opacity-100 pointer-events-none" />
                  </div>
                  <span className="text-[11px] text-gray-600 dark:text-gray-400 pt-0.5 leading-tight">
                    I agree to the{" "}
                    <Link href="#" className="text-rn-accent font-medium hover:underline">
                      Terms of Use
                    </Link>
                  </span>
                </label>
                <label className="flex items-start gap-2.5 cursor-pointer group">
                  <div className="relative flex items-center justify-center mt-0.5 shrink-0">
                    <input
                      type="checkbox"
                      checked={agreeToMarketing}
                      onChange={(e) => setAgreeToMarketing(e.target.checked)}
                      className="peer appearance-none w-4 h-4 border-2 border-gray-300 dark:border-gray-600 rounded checked:border-rn-accent checked:bg-rn-accent outline-none focus:ring-2 focus:ring-rn-accent/30 transition-all cursor-pointer disabled:opacity-50"
                    />
                    <CheckCircle2 className="w-3 h-3 text-white absolute opacity-0 peer-checked:opacity-100 pointer-events-none" />
                  </div>
                  <span className="text-[10px] text-gray-500 dark:text-gray-400 pt-0.5 leading-tight">
                    I agree that the creator may contact me by email or phone about my purchase, updates, offers, and other relevant information. I can unsubscribe at any time.
                  </span>
                </label>
              </div>
            )}
          </div>

          <div className="mt-auto w-full">
            {paymentState === "pending" ? (
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleCancelPayment}
                  disabled={isCancelLoading}
                  className="flex-1 text-red-600 dark:text-red-400 bg-red-50 hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-900/40 border border-red-200 dark:border-red-900/40 font-bold py-3.5 px-2 rounded-xl transition-all flex items-center justify-center gap-2 shadow-xs"
                >
                  {isCancelLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <X className="w-5 h-5" />}
                  <span className="text-[15px] sm:text-base">Cancel Order</span>
                </button>
                <button
                  onClick={async () => {
                    if (currentOrderId) {
                      setIsCancelLoading(true);
                      try {
                        const checkRes = await verifyPayment(currentOrderId);
                        if (checkRes.success && checkRes.status === "SUCCESS") {
                          setPaymentState("success");
                          setIsCancelLoading(false);
                          return;
                        }
                      } catch {}
                      setIsCancelLoading(false);
                    }
                    openSnap(currentToken, currentOrderId);
                  }}
                  disabled={isCancelLoading}
                  className="flex-1 text-white font-bold py-3.5 px-2 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm shadow-orange-500/20 bg-[#f97316] hover:bg-[#ea580c] dark:bg-[#f97316] dark:hover:bg-[#fb923c]"
                >
                  <span className="text-[15px] sm:text-base">Continue Payment</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <button
                  onClick={
                    paymentState === "error"
                      ? () => {
                          setCurrentToken("");
                          setCurrentOrderId("");
                          handlePay();
                        }
                      : handlePay
                  }
                  disabled={loading || isCancelLoading}
                  className="w-full text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm shadow-orange-500/20 bg-[#f97316] hover:bg-[#ea580c] dark:bg-[#f97316] dark:hover:bg-[#fb923c]"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                  {loading ? "Processing..." : `Buy Now - IDR ${formatRupiah(grossAmount)}`}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {(showAddonModal || showVoucherModal || showPaymentModal || isIncludedModalOpen || paymentState === "success") && (
        <CheckoutModals
          type={type}
          showAddonModal={showAddonModal}
          setShowAddonModal={setShowAddonModal}
          availableAddons={availableAddons}
          selectedAddons={selectedAddons}
          setSelectedAddons={setSelectedAddons}
          showVoucherModal={showVoucherModal}
          setShowVoucherModal={setShowVoucherModal}
          promoCodeInput={promoCodeInput}
          setPromoCodeInput={setPromoCodeInput}
          promoError={promoError}
          setPromoError={setPromoError}
          isVerifyingPromo={isVerifyingPromo}
          handleApplyPromo={handleApplyPromo}
          showPaymentModal={showPaymentModal}
          setShowPaymentModal={setShowPaymentModal}
          groupedMethods={groupedMethods}
          selectedMethod={selectedMethod}
          setSelectedMethod={setSelectedMethod}
          paymentState={paymentState}
          isRedirecting={isRedirecting}
          setIsRedirecting={setIsRedirecting}
          isIncludedModalOpen={isIncludedModalOpen}
          setIsIncludedModalOpen={setIsIncludedModalOpen}
          includedAddons={includedAddons}
          formatRupiah={formatRupiah}
        />
      )}
    </div>
  );
}
