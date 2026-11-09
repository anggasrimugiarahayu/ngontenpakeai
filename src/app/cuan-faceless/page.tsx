import type { Metadata } from "next";
import { Check } from "lucide-react";
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
      <section className="max-w-xl mx-auto px-4 sm:px-6 pt-4 sm:pt-8 pb-16 flex flex-col items-center text-center">
        
        {/* Main Headline (Harmonized Golden Ratio Scale) */}
        <h1 className="text-[25px] sm:text-[32px] md:text-[36px] font-extrabold text-gray-950 tracking-tight leading-[1.26] text-center max-w-lg mx-auto">
          Tutorial Dapetin Cuan dari Produk Digital Lewat Ngonten Faceless
        </h1>

        {/* Sub-headline (Proportional Secondary Text) */}
        <p className="text-[14px] sm:text-[16px] text-gray-600 font-normal leading-relaxed max-w-md mx-auto mt-3.5 mb-5 text-center">
          Belajar menghasilkan uang dari produk digital tanpa harus tampil wajah. Cukup modal HP dan internet!
        </p>

        {/* Bonus Badge with Curved Arrow */}
        <div className="relative inline-flex items-center justify-center my-2 sm:my-3 w-full max-w-md">
          {/* Hand-drawn style curved pointer arrow (Pink) */}
          <div className="hidden sm:block absolute -left-8 -top-5 transform -rotate-6 pointer-events-none text-[#FF1493]">
            <svg 
              className="w-9 h-9" 
              viewBox="0 0 50 50" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M 8 8 Q 18 36 38 38" />
              <path d="M 28 38 L 40 40 L 38 28" />
            </svg>
          </div>

          <div className="w-full bg-[#E6007A] text-white text-[12px] sm:text-[13px] font-bold px-4 sm:px-5 py-2.5 rounded-full shadow-sm text-center tracking-wide leading-snug flex items-center justify-center gap-1.5">
            <span>🎁 BONUS: 8 Tools Ngonten &amp; Riset Instagram, TikTok, Facebook, dan YouTube.</span>
          </div>
        </div>

        {/* 3 Green Checklist Points */}
        <div className="w-full max-w-md mx-auto mt-4 space-y-2.5 text-left">
          {/* Point 1 */}
          <div className="flex items-center gap-3 p-3 sm:p-3.5 rounded-xl bg-gray-50/80 border border-gray-200/80 shadow-xs">
            <div className="w-5 h-5 rounded-md bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </div>
            <span className="text-[13px] sm:text-[14px] text-gray-800 font-medium leading-snug">
              Cocok untuk pemula, bahkan yang masih gaptek.
            </span>
          </div>

          {/* Point 2 */}
          <div className="flex items-center gap-3 p-3 sm:p-3.5 rounded-xl bg-gray-50/80 border border-gray-200/80 shadow-xs">
            <div className="w-5 h-5 rounded-md bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </div>
            <span className="text-[13px] sm:text-[14px] text-gray-800 font-medium leading-snug">
              Pelajari strategi mendapatkan potensi cuan <span className="text-emerald-700 font-bold">Rp100 ribu per hari</span>.
            </span>
          </div>

          {/* Point 3 */}
          <div className="flex items-center gap-3 p-3 sm:p-3.5 rounded-xl bg-gray-50/80 border border-gray-200/80 shadow-xs">
            <div className="w-5 h-5 rounded-md bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </div>
            <span className="text-[13px] sm:text-[14px] text-gray-800 font-medium leading-snug">
              Praktik 100% cukup menggunakan HP.
            </span>
          </div>
        </div>

      </section>
    </div>
  );
}
