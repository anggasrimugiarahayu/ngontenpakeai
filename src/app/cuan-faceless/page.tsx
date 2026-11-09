import type { Metadata } from "next";
import Link from "next/link";
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
    <div className="w-full min-h-screen bg-[#EEF2F6] flex justify-center -mt-16 -mb-1 font-sans selection:bg-amber-300 selection:text-gray-950">
      <LightModeLock />

      {/* Centered Canvas Container with Left and Right Border Lines */}
      <div className="w-full max-w-[620px] min-h-screen bg-white border-x border-gray-200/90 shadow-[0_0_30px_rgba(0,0,0,0.03)] flex flex-col justify-between">
        
        {/* Top Header Inside the Canvas (Seamless White, No Horizontal Line) */}
        <header className="w-full pt-8 sm:pt-10 pb-4 flex items-center justify-center bg-white">
          <span className="font-bold font-heading text-lg sm:text-xl tracking-tight text-gray-900 select-none">
            ruangcreativemuslim
          </span>
        </header>

        {/* Hero Section Container */}
        <main className="flex-1 w-full px-5 sm:px-8 py-2 flex flex-col items-center text-center">
          
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

            <div className="w-full bg-[#E6007A] text-white text-[12px] sm:text-[13px] font-bold px-4 sm:px-5 py-2.5 rounded-full shadow-xs text-center tracking-wide leading-snug flex items-center justify-center gap-1.5">
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

        </main>

        {/* Bottom Footer Inside the Canvas (Seamless White, No Horizontal Line) */}
        <footer className="w-full pb-8 pt-4 flex flex-col items-center justify-center gap-1.5 text-xs text-gray-500 bg-white">
          <div className="flex items-center gap-1.5">
            <span>Product by</span>
            <a
              href="https://www.instagram.com/ruangcreativemuslim/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-gray-900 hover:text-emerald-600 transition-colors"
            >
              ruangcreativemuslim
            </a>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-gray-400">
            <Link
              href="/kebijakan-privasi"
              className="hover:underline hover:text-gray-600 transition-colors"
            >
              Kebijakan Privasi
            </Link>
            <span>•</span>
            <Link
              href="/syarat-ketentuan"
              className="hover:underline hover:text-gray-600 transition-colors"
            >
              Syarat &amp; Ketentuan
            </Link>
          </div>
        </footer>

      </div>
    </div>
  );
}
