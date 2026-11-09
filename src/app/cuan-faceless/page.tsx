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

      {/* Centered Canvas Container (Lebar Pas ~680px dengan Batas Kiri-Kanan) */}
      <div className="w-full max-w-[680px] min-h-screen bg-white border-x border-gray-200/90 shadow-[0_0_30px_rgba(0,0,0,0.03)] flex flex-col justify-between">
        
        {/* Top Header Inside the Canvas (Seamless White, No Horizontal Line) */}
        <header className="w-full pt-5 sm:pt-6 pb-2 sm:pb-3 flex items-center justify-center bg-white">
          <span className="font-bold font-heading text-sm sm:text-[15px] tracking-tight text-gray-800 select-none">
            ruangcreativemuslim
          </span>
        </header>

        {/* Hero Section Container */}
        <main className="flex-1 w-full px-5 sm:px-8 py-2 flex flex-col items-center text-center">
          
          {/* Main Headline (Harmonized 3-Line Cascade across Mobile & Desktop) */}
          <h1 className="text-[25px] sm:text-[30px] md:text-[34px] font-extrabold text-gray-950 tracking-tight leading-[1.22] text-center max-w-[460px] mx-auto">
            <span className="block">Tutorial Dapetin Cuan</span>
            <span className="block">dari Produk Digital Lewat</span>
            <span className="block">Ngonten Faceless</span>
          </h1>

          {/* Sub-headline (Kompak & Mengalir Nyaman) */}
          <p className="text-[14px] sm:text-[15.5px] text-gray-600 font-normal leading-[1.45] max-w-[420px] mx-auto mt-3 mb-4 text-center">
            Belajar menghasilkan uang dari produk digital tanpa harus tampil wajah. Cukup modal HP dan internet!
          </p>

          {/* Bonus Badge (No Icon, Brand Accent Color) */}
          <div className="w-full max-w-[440px] sm:max-w-[480px] mx-auto my-1.5 sm:my-2">
            <div className="w-full bg-rn-accent text-white text-[12px] sm:text-[13px] font-bold px-4 sm:px-6 py-2.5 rounded-full shadow-xs text-center tracking-wide leading-snug">
              BONUS: 8 Tools Ngonten &amp; Riset Instagram, TikTok, Facebook, dan YouTube.
            </div>
          </div>

          {/* 3 Green Checklist Points (Kompak, Sejajar & Rapi) */}
          <div className="w-full max-w-[440px] sm:max-w-[480px] mx-auto mt-3.5 space-y-2 text-left">
            {/* Point 1 */}
            <div className="flex items-center gap-3 p-2.5 sm:p-3 rounded-xl bg-gray-50/80 border border-gray-200/80 shadow-xs">
              <div className="w-5 h-5 rounded-md bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <span className="text-[13px] sm:text-[14px] text-gray-800 font-medium leading-snug">
                Cocok untuk pemula, bahkan yang masih gaptek.
              </span>
            </div>

            {/* Point 2 */}
            <div className="flex items-center gap-3 p-2.5 sm:p-3 rounded-xl bg-gray-50/80 border border-gray-200/80 shadow-xs">
              <div className="w-5 h-5 rounded-md bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <span className="text-[13px] sm:text-[14px] text-gray-800 font-medium leading-snug">
                Pelajari strategi mendapatkan potensi cuan <span className="text-emerald-700 font-bold">Rp100 ribu per hari</span>.
              </span>
            </div>

            {/* Point 3 */}
            <div className="flex items-center gap-3 p-2.5 sm:p-3 rounded-xl bg-gray-50/80 border border-gray-200/80 shadow-xs">
              <div className="w-5 h-5 rounded-md bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <span className="text-[13px] sm:text-[14px] text-gray-800 font-medium leading-snug">
                Praktik 100% cukup menggunakan HP.
              </span>
            </div>
          </div>

          {/* Narrative Story Section (Kompak, Rapi & Sejajar) */}
          <div className="w-full max-w-[440px] sm:max-w-[480px] mx-auto mt-7 text-left bg-gray-50/80 border border-gray-200/80 rounded-2xl p-4 sm:p-5 shadow-xs">
            <h2 className="text-[17px] sm:text-[19px] font-black text-gray-950 tracking-tight mb-3">
              Ceritanya Gini, Teman-Teman...
            </h2>

            <div className="space-y-2 text-[13px] sm:text-[14px] text-gray-700 leading-[1.5]">
              <p>Tahun 2025, saya mulai khawatir melihat banyak teman kantor yang terkena PHK.</p>
              <p>Saya pun berpikir, bagaimana kalau suatu saat saya mengalami hal yang sama?</p>
              <p>Akhirnya, saya mencoba mencari peluang penghasilan yang bisa dikerjakan dari rumah hanya bermodalkan HP.</p>
              <p>Sampai akhirnya saya mencoba bisnis produk digital lewat ngonten faceless.</p>
              <p className="font-bold text-gray-950 pt-0.5">Alhamdulillah, ternyata peluangnya luar biasa!</p>
            </div>

            {/* Achievement Highlights */}
            <div className="mt-4 pt-3.5 border-t border-gray-200/70">
              <p className="text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-2.5">
                Dari yang awalnya mulai dari nol, sekarang:
              </p>
              <div className="space-y-2">
                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white border border-gray-200/70 shadow-xs">
                  <span className="text-base shrink-0 leading-none mt-0.5">📈</span>
                  <span className="text-[13px] sm:text-[13.5px] text-gray-800 font-medium leading-snug">
                    Akun Instagram berkembang hingga <strong className="text-gray-950 font-bold">162 ribu followers</strong>.
                  </span>
                </div>

                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white border border-gray-200/70 shadow-xs">
                  <span className="text-base shrink-0 leading-none mt-0.5">🔥</span>
                  <span className="text-[13px] sm:text-[13.5px] text-gray-800 font-medium leading-snug">
                    Konten yang awalnya sepi, kini bisa menjangkau <strong className="text-gray-950 font-bold">ribuan hingga jutaan views</strong>.
                  </span>
                </div>

                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white border border-gray-200/70 shadow-xs">
                  <span className="text-base shrink-0 leading-none mt-0.5">💰</span>
                  <span className="text-[13px] sm:text-[13.5px] text-gray-800 font-medium leading-snug">
                    Menghasilkan pemasukan setiap hari dengan total <strong className="text-emerald-700 font-bold">pendapatan bulanan mencapai dua digit</strong>.
                  </span>
                </div>
              </div>
            </div>

            {/* Closing Note */}
            <div className="mt-4 p-3 rounded-xl bg-rn-accent/10 border border-rn-accent/20 text-[12.5px] sm:text-[13px] text-gray-900 leading-snug space-y-1">
              <p className="font-bold text-gray-950">
                Semua itu saya bangun tanpa harus menunjukkan wajah.
              </p>
              <p className="text-gray-700 font-normal">
                Sekarang, saya ingin berbagi pengalaman dan cara yang sudah saya praktikkan melalui tutorial ini.
              </p>
            </div>
          </div>

        </main>

        {/* Bottom Footer Inside the Canvas */}
        <footer className="w-full pb-6 pt-4 flex flex-col items-center justify-center gap-1 text-xs text-gray-500 bg-white">
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
