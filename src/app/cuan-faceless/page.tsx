import type { Metadata } from "next";
import Link from "next/link";
import { Check, ArrowRight, ShieldCheck } from "lucide-react";
import { LightModeLock } from "./LightModeLock";

export const metadata: Metadata = {
  title: "Tutorial Dapetin Cuan dari Produk Digital Lewat Ngonten Faceless | ruangcreativemuslim",
  description: "Belajar menghasilkan uang dari produk digital tanpa harus tampil wajah. Cukup modal HP dan internet! Dapatkan bonus 8 tools ngonten & riset.",
  openGraph: {
    title: "Tutorial Dapetin Cuan dari Produk Digital Lewat Ngonten Faceless",
    description: "Belajar menghasilkan uang dari produk digital tanpa harus tampil wajah. Cukup modal HP dan internet!",
    url: "https://www.ruangcreativemuslim.com/cuan-faceless",
    siteName: "ruangcreativemuslim",
    images: [
      {
        url: "/img_paket/paket_ebook.png",
        width: 1200,
        height: 630,
        alt: "Tutorial Dapetin Cuan dari Produk Digital Lewat Ngonten Faceless",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
};

export default function CuanFacelessLandingPage() {
  return (
    <div className="w-full min-h-[calc(100vh-4rem)] bg-white text-gray-900 font-sans selection:bg-amber-300 selection:text-gray-950">
      <LightModeLock />
      {/* Hero Section Container */}
      <section className="max-w-2xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10 pb-16 flex flex-col items-center text-center">
        
        {/* Main Headline */}
        <div className="space-y-1 mb-5">
          <span className="text-3xl sm:text-5xl md:text-6xl font-black text-gray-950 tracking-tight block">
            Tutorial
          </span>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-gray-900 tracking-tight leading-[1.18] sm:leading-[1.15]">
            Dapetin Cuan dari Produk Digital Lewat Ngonten Faceless
          </h1>
        </div>

        {/* Sub-headline */}
        <p className="text-base sm:text-lg text-gray-700 font-medium leading-relaxed max-w-xl mx-auto mb-6">
          Belajar menghasilkan uang dari produk digital tanpa harus tampil wajah. Cukup modal HP dan internet!
        </p>

        {/* Bonus Badge with Curved Arrow */}
        <div className="relative inline-flex items-center justify-center my-3 sm:my-4 w-full max-w-lg">
          {/* Hand-drawn style curved pointer arrow (Pink) */}
          <div className="hidden sm:block absolute -left-7 -top-6 transform -rotate-6 pointer-events-none text-[#FF1493]">
            <svg 
              className="w-10 h-10 animate-bounce duration-1000" 
              viewBox="0 0 50 50" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2.8" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M 8 8 Q 18 36 38 38" />
              <path d="M 28 38 L 40 40 L 38 28" />
            </svg>
          </div>

          <div className="w-full bg-[#E6007A] hover:bg-[#D4006F] text-white text-xs sm:text-sm font-extrabold px-4 sm:px-6 py-2.5 sm:py-3 rounded-full shadow-md transition-colors text-center tracking-wide leading-tight flex items-center justify-center gap-1.5">
            <span>🎁 BONUS: 8 Tools Ngonten &amp; Riset Instagram, TikTok, Facebook, dan YouTube.</span>
          </div>
        </div>

        {/* 3 Green Checklist Points */}
        <div className="w-full max-w-md mx-auto my-6 space-y-2.5 text-left">
          {/* Point 1 */}
          <div className="flex items-center gap-3 p-3 sm:p-3.5 rounded-xl bg-gray-50 border border-gray-200/90 shadow-sm hover:border-emerald-300 transition-colors">
            <div className="w-6 h-6 rounded-md bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Check className="w-4 h-4 stroke-[3]" />
            </div>
            <span className="text-sm sm:text-base text-gray-900 font-bold leading-snug">
              Cocok untuk pemula, bahkan yang masih gaptek.
            </span>
          </div>

          {/* Point 2 */}
          <div className="flex items-center gap-3 p-3 sm:p-3.5 rounded-xl bg-gray-50 border border-gray-200/90 shadow-sm hover:border-emerald-300 transition-colors">
            <div className="w-6 h-6 rounded-md bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Check className="w-4 h-4 stroke-[3]" />
            </div>
            <span className="text-sm sm:text-base text-gray-900 font-bold leading-snug">
              Pelajari strategi mendapatkan potensi cuan <span className="text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded font-extrabold">Rp100 ribu per hari</span>.
            </span>
          </div>

          {/* Point 3 */}
          <div className="flex items-center gap-3 p-3 sm:p-3.5 rounded-xl bg-gray-50 border border-gray-200/90 shadow-sm hover:border-emerald-300 transition-colors">
            <div className="w-6 h-6 rounded-md bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Check className="w-4 h-4 stroke-[3]" />
            </div>
            <span className="text-sm sm:text-base text-gray-900 font-bold leading-snug">
              Praktik 100% cukup menggunakan HP.
            </span>
          </div>
        </div>

        {/* Primary Call To Action (CTA) Button */}
        <div className="w-full max-w-md mx-auto mt-4 mb-2 flex flex-col items-center gap-3">
          <Link
            href="/checkout?type=PRO_BOOK"
            className="w-full py-4 px-6 rounded-2xl bg-gray-950 hover:bg-black text-white font-extrabold text-base sm:text-lg shadow-xl hover:shadow-2xl hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 text-center flex items-center justify-center gap-2 group cursor-pointer border-2 border-gray-950"
          >
            <span>Ambil Akses Sekarang</span>
            <ArrowRight className="w-5 h-5 text-rn-accent group-hover:translate-x-1 transition-transform" />
          </Link>
          <div className="flex items-center justify-center gap-1.5 text-xs text-gray-500 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Akses Selamanya • Sekali Bayar • Update Materi Rutin</span>
          </div>
        </div>

        {/* Divider */}
        <div className="w-16 h-1 bg-gray-200 rounded-full my-12"></div>

        {/* Storytelling Hook Section (Sesuai Referensi Gambar) */}
        <div className="w-full max-w-xl mx-auto text-left bg-gray-50/70 border border-gray-200/80 rounded-2xl p-5 sm:p-7 shadow-sm">
          <h2 className="text-2xl sm:text-3xl font-black text-gray-950 tracking-tight mb-3 text-center sm:text-left">
            Ceritanya Gini teman-teman...
          </h2>
          <p className="text-sm sm:text-base text-gray-700 leading-relaxed font-medium mb-5">
            Awalnya aku cuma iseng-iseng aja bikin konten ilustrasi faceless tanpa nampilin wajah sama sekali, <strong className="text-gray-900 font-bold">eh, tiba-tiba kok banyak peluang dan cuan yang masuk!</strong>
          </p>

          <div className="space-y-3 pt-1">
            <div className="flex items-start gap-3">
              <span className="text-lg">📈</span>
              <p className="text-sm sm:text-base text-gray-800 font-semibold leading-snug">
                Akun <strong className="text-gray-950 font-black">INSTAGRAM</strong> dari <span className="underline decoration-pink-400">NOL</span> sekarang tembus <span className="text-emerald-700 font-extrabold">162 RIBU follower</span>.
              </p>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-lg">🔥</span>
              <p className="text-sm sm:text-base text-gray-800 font-semibold leading-snug">
                Views konten yang awalnya cuma sedikit, sekarang konsisten naik dan <span className="bg-amber-100 text-amber-900 px-1 py-0.5 rounded font-black">FYP / VIRAL</span> terus.
              </p>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-lg">💸</span>
              <p className="text-sm sm:text-base text-gray-800 font-semibold leading-snug">
                Bisa ngasilin cuan setiap hari dari produk digital, cukup modal HP dan kuota internet doang.
              </p>
            </div>
          </div>

          <div className="mt-7 pt-5 border-t border-gray-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-gray-500 text-center sm:text-left">
              Kamu juga bisa memulainya hari ini tanpa harus punya skill desain yang rumit.
            </div>
            <Link
              href="/checkout?type=PRO_BOOK"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow hover:shadow-md transition-all text-center whitespace-nowrap"
            >
              Mulai Sekarang 👉
            </Link>
          </div>
        </div>

      </section>
    </div>
  );
}
