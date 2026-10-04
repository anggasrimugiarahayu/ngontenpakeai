"use client";

import { useState, useMemo } from "react";
import Script from "next/script";
import { createCheckoutToken, verifyPayment } from "@/app/actions/payment";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle2, ArrowLeft, ShieldCheck, Wallet } from "lucide-react";
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
}

export default function CheckoutClient({
  type,
  productId,
  itemName,
  itemDescription,
  baseAmount,
  clientKey,
  isProduction
}: CheckoutClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [paymentState, setPaymentState] = useState<"idle" | "verifying" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodKey>("QRIS");

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(num);
  };

  const { grossAmount, adminFee } = useMemo(() => {
    return calculatePaymentFees(baseAmount, selectedMethod);
  }, [baseAmount, selectedMethod]);

  const handlePay = async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      const res = await createCheckoutToken({ type, productId, paymentMethodKey: selectedMethod });
      
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
              setErrorMessage("Pembayaran berhasil di Midtrans, tetapi gagal diverifikasi oleh sistem kami. Silakan hubungi admin.");
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
      alert(error.message);
      setLoading(false);
    }
  };

  const snapScriptUrl = isProduction 
    ? "https://app.midtrans.com/snap/snap.js" 
    : "https://app.sandbox.midtrans.com/snap/snap.js";

  if (paymentState === "success") {
    return (
      <div className="bg-white dark:bg-[#18181b] p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 max-w-md w-full text-center">
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
      <div className="bg-white dark:bg-[#18181b] p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 max-w-md w-full text-center">
        <Loader2 className="w-16 h-16 text-rn-accent animate-spin mx-auto mb-6" />
        <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Memverifikasi Pembayaran...</h2>
        <p className="text-gray-500 text-sm">Mohon tunggu sebentar, sistem sedang mengonfirmasi status pembayaran Anda.</p>
      </div>
    );
  }

  return (
    <div className="max-w-md w-full my-8">
      <Script src={snapScriptUrl} data-client-key={clientKey} strategy="afterInteractive" />
      
      <button onClick={() => router.back()} className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Kembali
      </button>

      <div className="bg-white dark:bg-[#18181b] rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="p-6 md:p-8">
          <h1 className="text-2xl font-black mb-1 text-gray-900 dark:text-white">Checkout</h1>
          <p className="text-gray-500 text-sm mb-6">Selesaikan pembayaran Anda dengan aman.</p>
          
          <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl mb-8">
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 dark:text-white mb-1">{itemName}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{itemDescription}</p>
            </div>
            <div className="font-black text-gray-900 dark:text-white">
              {formatRupiah(baseAmount)}
            </div>
          </div>

          <h3 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <Wallet className="w-4 h-4" /> Pilih Metode Pembayaran
          </h3>
          <div className="space-y-2 mb-8 max-h-[240px] overflow-y-auto pr-2 custom-scrollbar">
            {(Object.keys(PAYMENT_METHODS) as PaymentMethodKey[]).map((key) => {
              const method = PAYMENT_METHODS[key];
              const isSelected = selectedMethod === key;
              return (
                <label 
                  key={key} 
                  className={`flex items-center justify-between p-3 border rounded-xl cursor-pointer transition-all ${
                    isSelected 
                      ? 'border-rn-accent bg-rn-accent/5 ring-1 ring-rn-accent' 
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      isSelected ? 'border-rn-accent' : 'border-gray-400'
                    }`}>
                      {isSelected && <div className="w-2 h-2 rounded-full bg-rn-accent" />}
                    </div>
                    <span className={`text-sm font-medium ${isSelected ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                      {method.name}
                    </span>
                  </div>
                </label>
              );
            })}
          </div>

          <div className="space-y-3 mb-6 pb-6 border-b border-gray-100 dark:border-gray-800">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">Harga Item</span>
              <span className="font-medium text-gray-900 dark:text-white">{formatRupiah(baseAmount)}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">Biaya Layanan (Gross-Up)</span>
              <span className="font-medium text-gray-900 dark:text-white">{formatRupiah(adminFee)}</span>
            </div>
          </div>

          <div className="flex justify-between items-center mb-8">
            <span className="font-bold text-gray-900 dark:text-white">Total Pembayaran</span>
            <span className="text-2xl font-black text-rn-accent">{formatRupiah(grossAmount)}</span>
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 text-center">
              {errorMessage}
            </div>
          )}

          <button 
            onClick={handlePay} 
            disabled={loading}
            className="w-full bg-gray-900 dark:bg-white text-white dark:text-black font-black py-4 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
            {loading ? "Memproses..." : `Bayar ${formatRupiah(grossAmount)}`}
          </button>
          <div className="text-center mt-4 flex items-center justify-center gap-2">
             <span className="text-xs text-gray-400 font-medium tracking-wide">SECURE PAYMENT BY MIDTRANS</span>
          </div>
        </div>
      </div>
    </div>
  );
}
