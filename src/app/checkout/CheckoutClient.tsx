"use client";

import { useState, useMemo } from "react";
import Script from "next/script";
import { createCheckoutToken, verifyPayment } from "@/app/actions/payment";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle2, ArrowLeft, ShieldCheck, ChevronRight, X, Info, Tag, Lock, CreditCard } from "lucide-react";
import Link from "next/link";
import { PAYMENT_METHODS, calculatePaymentFees, PaymentMethodKey } from "@/lib/payment-calc";

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
  initialPhone
}: CheckoutClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [paymentState, setPaymentState] = useState<"idle" | "verifying" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodKey>("QRIS");
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const [customerName, setCustomerName] = useState(initialName);
  const [customerEmail, setCustomerEmail] = useState(initialEmail);
  const [customerPhone, setCustomerPhone] = useState(initialPhone);
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(num);
  };

  const { grossAmount, adminFee } = useMemo(() => {
    return calculatePaymentFees(baseAmount, selectedMethod);
  }, [baseAmount, selectedMethod]);

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
      
      if (res?.token) {
        // @ts-ignore
        window.snap.pay(res.token, {
          onSuccess: async function (result: any) {
            setPaymentState("verifying");
            const verifyRes = await verifyPayment(result.order_id);
            if (verifyRes.success) {
              setPaymentState("success");
            } else {
              setPaymentState("error");
              setErrorMessage("Pembayaran berhasil, tetapi gagal diverifikasi sistem. Silakan hubungi admin.");
            }
          },
          onPending: function (result: any) {
            alert("Menunggu pembayaran Anda!");
          },
          onError: function (result: any) {
            alert("Pembayaran gagal!");
            setLoading(false);
          },
          onClose: function () {
            setLoading(false);
          }
        });
      }
    } catch (error: any) {
      setErrorMessage(error.message);
      setLoading(false);
    }
  };

  const snapScriptUrl = isProduction 
    ? "https://app.midtrans.com/snap/snap.js" 
    : "https://app.sandbox.midtrans.com/snap/snap.js";

  if (paymentState === "success") {
    return (
      <div className="bg-white dark:bg-[#18181b] p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 max-w-md w-full mx-auto text-center mt-10">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
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
        <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Memverifikasi Pembayaran...</h2>
        <p className="text-gray-500 text-sm">Mohon tunggu sebentar, sistem sedang mengonfirmasi status pembayaran Anda.</p>
      </div>
    );
  }

  return (
    <div className="w-full relative">
      <Script src={snapScriptUrl} data-client-key={clientKey} strategy="afterInteractive" />
      
      <button onClick={() => router.back()} className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors w-fit">
        <ArrowLeft className="w-4 h-4" /> Kembali
      </button>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Kolom Kiri */}
        <div className="flex-1 w-full space-y-6">
          
          {/* Card: PRODUCT */}
          <div className="bg-white dark:bg-[#18181b] rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
            <h3 className="text-sm font-bold text-gray-400 dark:text-gray-500 tracking-wider mb-6">PRODUCT</h3>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 mt-1">1x</span>
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden flex items-center justify-center shrink-0">
                  <CreditCard className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white text-base max-w-[200px] leading-tight mb-2">{itemName}</h4>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-semibold cursor-pointer hover:bg-green-100 dark:hover:bg-green-500/20 transition-colors">
                    <span className="text-lg leading-none">+</span> Add On
                  </div>
                </div>
              </div>
              <span className="font-medium text-gray-900 dark:text-white">{formatRupiah(baseAmount)}</span>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
              <button className="text-sm font-bold text-green-500 hover:text-green-600 dark:text-green-400 transition-colors">
                See Description
              </button>
            </div>
          </div>

          {/* Card: BUYER INFO */}
          <div className="bg-white dark:bg-[#18181b] rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
            <h3 className="text-sm font-bold text-gray-400 dark:text-gray-500 tracking-wider mb-6">BUYER INFO</h3>
            
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                  <span className="text-red-500">*</span> Email
                  <Info className="w-4 h-4 text-gray-400" />
                </label>
                <input 
                  type="email" 
                  value={customerEmail} 
                  onChange={(e) => setCustomerEmail(e.target.value)} 
                  className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:ring-1 focus:ring-green-500 focus:border-green-500 outline-none dark:text-white transition-all" 
                  placeholder="Your Email" 
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                  <span className="text-red-500">*</span> Name
                </label>
                <input 
                  type="text" 
                  value={customerName} 
                  onChange={(e) => setCustomerName(e.target.value)} 
                  className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:ring-1 focus:ring-green-500 focus:border-green-500 outline-none dark:text-white transition-all" 
                  placeholder="Your Name" 
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                  <span className="text-red-500">*</span> Phone Number
                </label>
                <input 
                  type="tel" 
                  value={customerPhone} 
                  onChange={(e) => setCustomerPhone(e.target.value)} 
                  className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:ring-1 focus:ring-green-500 focus:border-green-500 outline-none dark:text-white transition-all" 
                  placeholder="08xxxxxxx" 
                />
              </div>
            </div>
          </div>

        </div>

        {/* Kolom Kanan: PAYMENT DETAIL */}
        <div className="w-full lg:w-[400px] bg-white dark:bg-[#18181b] rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 lg:sticky lg:top-24">
          <h3 className="text-sm font-bold text-gray-400 dark:text-gray-500 tracking-wider mb-6">PAYMENT DETAIL</h3>
          
          <div className="space-y-4 mb-6">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600 dark:text-gray-400 font-medium">Subtotal</span>
              <span className="text-gray-900 dark:text-white">Rp {formatRupiah(baseAmount)}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600 dark:text-gray-400 font-medium">Discount</span>
              <span className="text-green-500">- Rp 0</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600 dark:text-gray-400 font-medium">Convenience fee</span>
              <span className="text-gray-900 dark:text-white">Rp {formatRupiah(adminFee)}</span>
            </div>
          </div>
          
          <div className="flex justify-between items-center mb-6 pt-4 border-t border-gray-100 dark:border-gray-800">
            <span className="font-bold text-gray-900 dark:text-gray-100">TOTAL</span>
            <span className="text-lg font-bold text-gray-900 dark:text-white">Rp {formatRupiah(grossAmount)}</span>
          </div>

          <button className="w-full py-3 px-4 rounded-xl border border-green-500 text-green-500 font-bold text-sm flex items-center justify-center gap-2 hover:bg-green-50 dark:hover:bg-green-500/10 transition-colors mb-4">
            <Tag className="w-4 h-4" /> Add Voucher
          </button>

          <div className="border border-green-500 rounded-xl overflow-hidden mb-6 relative">
            <button 
              onClick={() => setShowPaymentModal(true)}
              className="w-full p-4 flex items-center justify-between bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-8 border border-gray-200 dark:border-gray-700 rounded flex items-center justify-center bg-white">
                   <span className="text-[10px] font-bold text-gray-400">LOGO</span>
                </div>
                <span className="font-bold text-green-600 dark:text-green-400">{PAYMENT_METHODS[selectedMethod].name}</span>
              </div>
              <ChevronRight className="w-5 h-5 text-green-500" />
            </button>
            <div className="bg-gray-50 dark:bg-gray-800/60 p-4 border-t border-gray-100 dark:border-gray-800 flex items-start gap-3">
              <div className="mt-0.5 text-green-500">
                <Lock className="w-6 h-6 fill-current opacity-20 absolute" />
                <Lock className="w-6 h-6 relative z-10" />
              </div>
              <div>
                <h5 className="text-xs font-bold text-gray-900 dark:text-white mb-0.5">Secure Payment</h5>
                <p className="text-[10px] text-gray-500">All your payments are secured with RSA encryption</p>
              </div>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="relative flex items-center justify-center mt-0.5">
                <input 
                  type="checkbox" 
                  checked={agreeToTerms}
                  onChange={(e) => setAgreeToTerms(e.target.checked)}
                  className="peer appearance-none w-5 h-5 border-2 border-gray-300 dark:border-gray-600 rounded checked:border-green-500 checked:bg-green-500 outline-none focus:ring-2 focus:ring-green-500/30 transition-all cursor-pointer"
                />
                <CheckCircle2 className="w-3.5 h-3.5 text-white absolute opacity-0 peer-checked:opacity-100 pointer-events-none" />
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                I agree to the <Link href="#" className="text-green-500 font-medium hover:underline">Terms of Use</Link>
              </span>
            </label>
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="relative flex items-center justify-center mt-0.5">
                <input 
                  type="checkbox" 
                  className="peer appearance-none w-5 h-5 border-2 border-gray-300 dark:border-gray-600 rounded checked:border-green-500 checked:bg-green-500 outline-none focus:ring-2 focus:ring-green-500/30 transition-all cursor-pointer"
                  defaultChecked
                />
                <CheckCircle2 className="w-3.5 h-3.5 text-white absolute opacity-0 peer-checked:opacity-100 pointer-events-none" />
              </div>
              <span className="text-[11px] leading-tight text-gray-500">
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
            onClick={handlePay} 
            disabled={loading}
            className="w-full bg-[#41c29a] text-white font-bold py-4 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
            {loading ? "Processing..." : `Buy Now - IDR ${formatRupiah(grossAmount)}`}
          </button>
        </div>
      </div>

      {/* Modal Pemilihan Metode Pembayaran */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 dark:text-white">Select Payment Method</h3>
              <button 
                onClick={() => setShowPaymentModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 max-h-[60vh] overflow-y-auto space-y-2">
              {(Object.keys(PAYMENT_METHODS) as PaymentMethodKey[]).map((key) => {
                const method = PAYMENT_METHODS[key];
                const isSelected = selectedMethod === key;
                return (
                  <label 
                    key={key} 
                    onClick={() => {
                      setSelectedMethod(key);
                      setShowPaymentModal(false);
                    }}
                    className={`flex items-start gap-3 p-4 border rounded-xl cursor-pointer transition-all ${
                      isSelected 
                        ? 'border-green-500 bg-green-50 dark:bg-green-500/10 ring-1 ring-green-500' 
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800/30'
                    }`}
                  >
                    <div className="pt-0.5">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        isSelected ? 'border-green-500' : 'border-gray-300 dark:border-gray-600'
                      }`}>
                        {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-green-500" />}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className={`text-sm font-bold leading-tight mb-1 ${isSelected ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                        {method.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {method.feeType.includes('MDR') ? `Fee: ${method.mdr! * 100}%` : ''}
                        {method.feeType.includes('FLAT') ? `Fee: Rp ${formatRupiah(method.flat!)}` : ''}
                        {method.feeType.includes('MIXED') ? `Fee: ${method.mdr! * 100}% + Rp ${formatRupiah(method.flat!)}` : ''}
                        {method.feeType.includes('PPN') && method.feeType !== 'MDR_NO_PPN' ? ' + PPN' : ''}
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
