"use client";

import { useState, useMemo } from "react";
import Script from "next/script";
import { createCheckoutToken, verifyPayment } from "@/app/actions/payment";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle2, ArrowLeft, ShieldCheck, Wallet, User, Mail, Phone } from "lucide-react";
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

  const [customerName, setCustomerName] = useState(initialName);
  const [customerEmail, setCustomerEmail] = useState(initialEmail);
  const [customerPhone, setCustomerPhone] = useState(initialPhone);

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(num);
  };

  const { grossAmount, adminFee } = useMemo(() => {
    return calculatePaymentFees(baseAmount, selectedMethod);
  }, [baseAmount, selectedMethod]);

  const handlePay = async () => {
    if (!customerName || !customerEmail || !customerPhone) {
      setErrorMessage("Mohon lengkapi Nama, Email, dan No. HP Anda terlebih dahulu.");
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
    <div className="w-full">
      <Script src={snapScriptUrl} data-client-key={clientKey} strategy="afterInteractive" />
      
      <button onClick={() => router.back()} className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors w-fit">
        <ArrowLeft className="w-4 h-4" /> Kembali
      </button>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Kolom Kiri: Informasi Customer & Metode Pembayaran */}
        <div className="flex-1 w-full bg-white dark:bg-[#18181b] rounded-3xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="p-6 md:p-8">
            <h1 className="text-2xl font-black mb-2 text-gray-900 dark:text-white">Detail Pembayaran</h1>
            <p className="text-gray-500 text-sm mb-8">Lengkapi informasi dan pilih metode pembayaran.</p>
            
            {/* Informasi Customer */}
            <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-2">
              <User className="w-4 h-4 text-rn-accent" /> Informasi Kontak
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-semibold text-gray-500">Nama Lengkap</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-gray-400" />
                  </div>
                  <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-rn-accent focus:border-transparent outline-none dark:text-white" placeholder="Nama Anda" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500">Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-gray-400" />
                  </div>
                  <input type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-rn-accent focus:border-transparent outline-none dark:text-white" placeholder="Email Anda" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500">No. WhatsApp / HP</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-4 w-4 text-gray-400" />
                  </div>
                  <input type="tel" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-rn-accent focus:border-transparent outline-none dark:text-white" placeholder="Contoh: 081234567890" />
                </div>
              </div>
            </div>

            {/* Metode Pembayaran */}
            <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-2">
              <Wallet className="w-4 h-4 text-rn-accent" /> Pilih Metode Pembayaran
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {(Object.keys(PAYMENT_METHODS) as PaymentMethodKey[]).map((key) => {
                const method = PAYMENT_METHODS[key];
                const isSelected = selectedMethod === key;
                return (
                  <label 
                    key={key} 
                    className={`flex items-start gap-3 p-3 border rounded-xl cursor-pointer transition-all ${
                      isSelected 
                        ? 'border-rn-accent bg-rn-accent/5 ring-1 ring-rn-accent shadow-sm' 
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800/30'
                    }`}
                  >
                    <div className="pt-0.5">
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        isSelected ? 'border-rn-accent' : 'border-gray-400'
                      }`}>
                        {isSelected && <div className="w-2 h-2 rounded-full bg-rn-accent" />}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className={`text-sm font-bold leading-tight mb-1 ${isSelected ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                        {method.name}
                      </div>
                      <div className="text-[10px] text-gray-500 line-clamp-2 leading-snug">
                        {method.feeType.includes('MDR') ? `Biaya: ${method.mdr! * 100}%` : ''}
                        {method.feeType.includes('FLAT') ? `Biaya: Rp${method.flat}` : ''}
                        {method.feeType.includes('MIXED') ? `Biaya: ${method.mdr! * 100}% + Rp${method.flat}` : ''}
                        {method.feeType.includes('PPN') && method.feeType !== 'MDR_NO_PPN' ? ' + PPN' : ''}
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>

          </div>
        </div>

        {/* Kolom Kanan: Ringkasan Tagihan */}
        <div className="w-full lg:w-[380px] bg-white dark:bg-[#18181b] rounded-3xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden lg:sticky lg:top-24">
          <div className="p-6">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">Ringkasan Pesanan</h3>
            
            <div className="flex flex-col gap-2 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl mb-6 border border-gray-100 dark:border-gray-700">
              <h4 className="font-bold text-gray-900 dark:text-white text-sm">{itemName}</h4>
              <p className="text-xs text-gray-500 leading-relaxed">{itemDescription}</p>
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

            <div className="flex justify-between items-end mb-6">
              <span className="font-bold text-gray-900 dark:text-white">Total Bayar</span>
              <span className="text-2xl font-black text-rn-accent">{formatRupiah(grossAmount)}</span>
            </div>

            {errorMessage && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 text-xs rounded-xl border border-red-100 text-center font-medium">
                {errorMessage}
              </div>
            )}

            <button 
              onClick={handlePay} 
              disabled={loading}
              className="w-full bg-gray-900 dark:bg-white text-white dark:text-black font-black py-3.5 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
              {loading ? "Memproses..." : `Bayar Sekarang`}
            </button>
            <div className="text-center mt-4">
               <span className="text-[10px] text-gray-400 font-bold tracking-wider">SECURE PAYMENT BY MIDTRANS</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
