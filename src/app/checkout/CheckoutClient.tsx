"use client";

import { useState, useMemo, useEffect } from "react";
import Script from "next/script";
import { createCheckoutToken, verifyPayment, cancelPayment } from "@/app/actions/payment";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle2, ArrowLeft, ShieldCheck, ChevronRight, X, Info, Lock, CreditCard, Clock, XCircle, RefreshCcw } from "lucide-react";
import Link from "next/link";
import { PAYMENT_METHODS, calculatePaymentFees, PaymentMethodKey } from "@/lib/payment-calc";
import Image from "next/image";

interface CheckoutClientProps {
  type: "EBOOK" | "PRO_BASIC" | "PRO_TOOLS" | "PRO_LENGKAP";
  productId?: string;
  itemName: string;
  itemDescription: string;
  baseAmount: number;
  clientKey: string;
  isProduction: boolean;
  initialName: string;
  initialEmail: string;
  initialPhone: string;
  productImage?: string;
  existingPendingOrder?: { token: string, orderId: string, expiryTime: string, paymentMethodKey: string } | null;
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
  productImage,
  existingPendingOrder
}: CheckoutClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [paymentState, setPaymentState] = useState<"idle" | "verifying" | "success" | "pending" | "error">(existingPendingOrder ? "pending" : "idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodKey>((existingPendingOrder?.paymentMethodKey as PaymentMethodKey) || "QRIS");
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const [customerName, setCustomerName] = useState(initialName);
  const [customerEmail, setCustomerEmail] = useState(initialEmail);
  const [customerPhone, setCustomerPhone] = useState(initialPhone);
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const [currentToken, setCurrentToken] = useState(existingPendingOrder?.token || "");
  const [currentOrderId, setCurrentOrderId] = useState(existingPendingOrder?.orderId || "");
  const [expiryTime, setExpiryTime] = useState(existingPendingOrder?.expiryTime || "");
  const [timeLeft, setTimeLeft] = useState("");

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(num);
  };

  const { grossAmount, adminFee } = useMemo(() => {
    return calculatePaymentFees(baseAmount, selectedMethod);
  }, [baseAmount, selectedMethod]);

  // Countdown Effect for expiration check in background
  useEffect(() => {
    if (paymentState !== "pending" || !expiryTime) return;

    const interval = setInterval(() => {
      const expiry = new Date(expiryTime).getTime();
      const now = new Date().getTime();
      const distance = expiry - now;

      if (distance < 0) {
        clearInterval(interval);
        setTimeLeft("EXPIRED");
        setPaymentState("error");
        setErrorMessage("Waktu pembayaran telah habis. Silakan buat pesanan baru.");
        return;
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [paymentState, expiryTime]);

  const openSnap = (token: string, orderId: string) => {
    // @ts-ignore
    window.snap.pay(token, {
      onSuccess: async function (result: any) {
        setPaymentState("verifying");
        const verifyRes = await verifyPayment(orderId);
        if (verifyRes.success && verifyRes.status === "SUCCESS") {
          setPaymentState("success");
        } else {
          setPaymentState("error");
          setErrorMessage("Pembayaran berhasil di Midtrans, tetapi gagal diverifikasi sistem. Silakan hubungi admin.");
        }
      },
      onPending: async function (result: any) {
        setPaymentState("verifying");
        const verifyRes = await verifyPayment(orderId);
        if (verifyRes.success && verifyRes.status === "PENDING") {
          setExpiryTime(verifyRes.expiryTime || "");
          setPaymentState("pending");
        }
      },
      onError: function (result: any) {
        alert("Pembayaran gagal!");
        setLoading(false);
      },
      onClose: async function () {
        setPaymentState("verifying");
        const verifyRes = await verifyPayment(orderId);
        if (verifyRes.success && verifyRes.status === "SUCCESS") {
           setPaymentState("success");
        } else if (verifyRes.success && verifyRes.status === "PENDING") {
           setExpiryTime(verifyRes.expiryTime || "");
           setPaymentState("pending");
        } else {
           setLoading(false);
           setPaymentState("idle");
        }
      }
    });
  };

  const handlePay = async () => {
    if (!customerName || !customerEmail || !customerPhone) {
      setErrorMessage("Mohon lengkapi Email, Nama, dan Phone Number Anda.");
      return;
    }
    if (!agreeToTerms) {
      setErrorMessage("Anda harus menyetujui Terms of Use untuk melanjutkan.");
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
        customerPhone
      });
      
      if (res?.token && res?.orderId) {
        setCurrentToken(res.token);
        setCurrentOrderId(res.orderId);
        openSnap(res.token, res.orderId);
      }
    } catch (error: any) {
      setErrorMessage(error.message);
      setLoading(false);
    }
  };

  const snapScriptUrl = isProduction 
    ? "https://app.midtrans.com/snap/snap.js" 
    : "https://app.sandbox.midtrans.com/snap/snap.js";

  const groupedMethods = {
    "Transfer Bank (Virtual Account)": ["BCA_VA", "BNI_VA", "MANDIRI_VA", "BRI_VA", "PERMATA_VA", "CIMB_VA", "OTHER_VA"],
    "E-Wallet & QRIS": ["QRIS", "GOPAY", "SHOPEEPAY", "OVO", "DANA"],
    "Minimarket": ["ALFAMART", "INDOMARET"],
    "Kartu Kredit & Cicilan": ["CREDIT_CARD", "AKULAKU", "KREDIVO"]
  } as Record<string, PaymentMethodKey[]>;

  if (paymentState === "success") {
    return (
      <div className="bg-white dark:bg-[#18181b] p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 max-w-md w-full mx-auto text-center mt-10">
        <div className="w-20 h-20 bg-rn-accent/20 text-rn-accent rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-black mb-2 text-gray-900 dark:text-white">Pembayaran Berhasil!</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">Terima kasih, pembayaran Anda telah kami terima dan akses telah dibuka.</p>
        <Link href="/ruang-belajar" className="block w-full bg-rn-accent text-white font-bold py-3.5 rounded-xl hover:opacity-90 transition-opacity">
          Lanjut ke Ruang Belajar
        </Link>
      </div>
    );
  }

  if (paymentState === "verifying") {
    return (
      <div className="bg-white dark:bg-[#18181b] p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 max-w-md w-full mx-auto text-center mt-10">
        <Loader2 className="w-16 h-16 text-rn-accent animate-spin mx-auto mb-6" />
        <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Memverifikasi Status...</h2>
        <p className="text-gray-500 text-sm">Mohon tunggu sebentar, sistem sedang menghubungi Midtrans.</p>
      </div>
    );
  }

  // Disable forms if pending
  const isPending = paymentState === "pending";

  return (
    <div className="w-full relative">
      <Script src={snapScriptUrl} data-client-key={clientKey} strategy="afterInteractive" />
      
      <button onClick={() => router.back()} className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white mb-4 transition-colors w-fit">
        <ArrowLeft className="w-4 h-4" /> Kembali
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6 items-stretch">
        
        {/* Kolom Kiri */}
        <div className="flex flex-col space-y-6">
          <div className="bg-white dark:bg-[#18181b] rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-5 md:p-6 flex-none">
            <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 tracking-wider mb-4">PRODUCT</h3>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 mt-1">1x</span>
                <div className="w-14 h-14 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden flex items-center justify-center shrink-0">
                  {productImage ? (
                    <img src={productImage} alt={itemName} className="w-full h-full object-cover" />
                  ) : (
                    <CreditCard className="w-6 h-6 text-gray-300 dark:text-gray-600" />
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white text-sm max-w-[200px] leading-snug">{itemName}</h4>
                </div>
              </div>
              <span className="font-medium text-gray-900 dark:text-white text-sm">Rp {formatRupiah(baseAmount)}</span>
            </div>
          </div>

          <div className="bg-white dark:bg-[#18181b] rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-5 md:p-6 flex-1 flex flex-col">
            <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 tracking-wider mb-5">BUYER INFO</h3>
            
            <div className="space-y-4 flex-1">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                  <span className="text-red-500">*</span> Email
                  <Info className="w-3.5 h-3.5 text-gray-400" />
                </label>
                <input 
                  type="email" 
                  value={customerEmail} 
                  onChange={(e) => setCustomerEmail(e.target.value)} disabled={paymentState === "pending"} 
                  disabled={isPending}
                  className="w-full px-3 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:ring-1 focus:ring-rn-accent focus:border-rn-accent outline-none dark:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed" 
                  placeholder="Your Email" 
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                  <span className="text-red-500">*</span> Name
                </label>
                <input 
                  type="text" 
                  value={customerName} 
                  onChange={(e) => setCustomerName(e.target.value)} disabled={paymentState === "pending"} 
                  disabled={isPending}
                  className="w-full px-3 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:ring-1 focus:ring-rn-accent focus:border-rn-accent outline-none dark:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed" 
                  placeholder="Your Name" 
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                  <span className="text-red-500">*</span> Phone Number
                </label>
                <input 
                  type="tel" 
                  value={customerPhone} 
                  onChange={(e) => setCustomerPhone(e.target.value)} disabled={paymentState === "pending"} 
                  disabled={isPending}
                  className="w-full px-3 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:ring-1 focus:ring-rn-accent focus:border-rn-accent outline-none dark:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed" 
                  placeholder="08xxxxxxx" 
                />
              </div>
            </div>
          </div>
        </div>

        {/* Kolom Kanan */}
        <div className="w-full bg-white dark:bg-[#18181b] rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-5 md:p-6 flex flex-col h-full">
          <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 tracking-wider mb-5">PAYMENT DETAIL</h3>
          
          <div className="space-y-3 mb-5">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600 dark:text-gray-400 font-medium">Subtotal</span>
              <span className="text-gray-900 dark:text-white">Rp {formatRupiah(baseAmount)}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600 dark:text-gray-400 font-medium">Discount</span>
              <span className="text-rn-accent">- Rp 0</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600 dark:text-gray-400 font-medium">Convenience fee</span>
              <span className="text-gray-900 dark:text-white">Rp {formatRupiah(adminFee)}</span>
            </div>
          </div>
          
          <div className="flex justify-between items-center mb-5 pt-4 border-t border-gray-100 dark:border-gray-800">
            <span className="font-bold text-gray-900 dark:text-gray-100">TOTAL</span>
            <span className="text-lg font-bold text-gray-900 dark:text-white">Rp {formatRupiah(grossAmount)}</span>
          </div>

          <div className="border border-rn-accent/50 dark:border-rn-accent/40 rounded-xl overflow-hidden mb-5 relative flex-none">
            <button 
              onClick={() => !isPending && setShowPaymentModal(true)}
              disabled={isPending}
              className={`w-full p-3.5 flex items-center justify-between bg-white dark:bg-gray-900 transition-colors ${isPending ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-7 border border-gray-200 dark:border-gray-700 rounded flex items-center justify-center bg-white shrink-0">
                   <span className="text-[9px] font-bold text-gray-400">LOGO</span>
                </div>
                <span className="font-bold text-sm text-rn-accent">{PAYMENT_METHODS[selectedMethod]?.name || "Pilih Metode"}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-rn-accent" />
            </button>
            <div className="bg-gray-50 dark:bg-gray-800/60 p-3 border-t border-gray-100 dark:border-gray-800 flex items-start gap-2.5">
              <div className="mt-0.5 text-rn-accent">
                <Lock className="w-5 h-5 fill-current opacity-20 absolute" />
                <Lock className="w-5 h-5 relative z-10" />
              </div>
              <div>
                <h5 className="text-[11px] font-bold text-gray-900 dark:text-white mb-0.5">Secure Payment</h5>
                <p className="text-[9px] text-gray-500">All your payments are secured with RSA encryption</p>
              </div>
            </div>
          </div>

          <div className="space-y-2 mb-5 flex-1">
            <label className="flex items-start gap-2.5 cursor-pointer group">
              <div className="relative flex items-center justify-center mt-0.5 shrink-0">
                <input 
                  type="checkbox" 
                  checked={agreeToTerms}
                  onChange={(e) => setAgreeToTerms(e.target.checked)} disabled={paymentState === "pending"}
                  disabled={isPending}
                  className="peer appearance-none w-4 h-4 border-2 border-gray-300 dark:border-gray-600 rounded checked:border-rn-accent checked:bg-rn-accent outline-none focus:ring-2 focus:ring-rn-accent/30 transition-all cursor-pointer disabled:opacity-50"
                />
                <CheckCircle2 className="w-3 h-3 text-white absolute opacity-0 peer-checked:opacity-100 pointer-events-none" />
              </div>
              <span className="text-[12px] text-gray-600 dark:text-gray-400 pt-0.5">
                I agree to the <Link href="#" className="text-rn-accent font-medium hover:underline">Terms of Use</Link>
              </span>
            </label>
            <label className="flex items-start gap-2.5 cursor-pointer group">
              <div className="relative flex items-center justify-center mt-0.5 shrink-0">
                <input 
                  type="checkbox" 
                  className="peer appearance-none w-4 h-4 border-2 border-gray-300 dark:border-gray-600 rounded checked:border-rn-accent checked:bg-rn-accent outline-none focus:ring-2 focus:ring-rn-accent/30 transition-all cursor-pointer disabled:opacity-50"
                  defaultChecked
                  disabled={isPending}
                />
                <CheckCircle2 className="w-3 h-3 text-white absolute opacity-0 peer-checked:opacity-100 pointer-events-none" />
              </div>
              <span className="text-[10px] leading-tight text-gray-500 pt-0.5">
                I agree that the creator may contact me by email or phone about my purchase, updates, offers, and other relevant information. I can unsubscribe at any time.
              </span>
            </label>
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-xs rounded-xl border border-red-100 text-center font-medium">
              {errorMessage}
            </div>
          )}

          <button 
            onClick={
              paymentState === "error" 
                ? () => {
                    setPaymentState("idle");
                    setCurrentToken("");
                    setCurrentOrderId("");
                  }
                : paymentState === "pending"
                ? () => openSnap(currentToken, currentOrderId)
                : handlePay
            } 
            disabled={loading}
            className={`w-full text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 mt-auto flex-none shadow-md ${
              isPending ? 'bg-orange-500 hover:bg-orange-600 animate-pulse shadow-orange-500/20' : 'bg-rn-accent hover:bg-rn-accent/90'
            }`}
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
            {
              paymentState === "error" 
                ? "Buat Pesanan Baru" 
                : paymentState === "pending" 
                ? "Menunggu Pembayaran" 
                : loading 
                ? "Processing..." 
                : `Buy Now - IDR ${formatRupiah(grossAmount)}`
            }
          </button>
        </div>
      </div>

      {/* Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between shrink-0">
              <h3 className="font-bold text-gray-900 dark:text-white">Select Payment Method</h3>
              <button 
                onClick={() => setShowPaymentModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-5 overflow-y-auto space-y-6">
              {Object.entries(groupedMethods).map(([groupName, keys]) => {
                const validKeys = keys.filter(k => PAYMENT_METHODS[k]);
                if (validKeys.length === 0) return null;
                
                return (
                  <div key={groupName}>
                    <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 tracking-wider mb-3 uppercase">
                      {groupName}
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {validKeys.map((key) => {
                        const method = PAYMENT_METHODS[key];
                        const isSelected = selectedMethod === key;
                        return (
                          <label 
                            key={key} 
                            onClick={() => {
                              setSelectedMethod(key);
                              setShowPaymentModal(false);
                            }}
                            className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-all ${
                              isSelected 
                                ? 'border-rn-accent bg-rn-accent/5 ring-1 ring-rn-accent shadow-sm' 
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800/30'
                            }`}
                          >
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                              isSelected ? 'border-rn-accent' : 'border-gray-300 dark:border-gray-600'
                            }`}>
                              {isSelected && <div className="w-2 h-2 rounded-full bg-rn-accent" />}
                            </div>
                            <span className={`text-sm font-bold leading-tight ${isSelected ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                              {method.name}
                            </span>
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
    </div>
  );
}
