import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Check } from "lucide-react";
import { LightModeLock } from "./LightModeLock";

export const metadata: Metadata = {
  title: "Tutorial Dapat Cuan dari Produk Digital Lewat Konten Faceless | ruangcreativemuslim",
  description: "Tutorial dapat cuan dari produk digital lewat konten faceless. Bonus 8 tools untuk ngonten dan riset Instagram, TikTok, Facebook, dan YouTube.",
  openGraph: {
    title: "Tutorial Dapat Cuan dari Produk Digital Lewat Konten Faceless",
    description: "Belajar menghasilkan uang dari produk digital tanpa harus tampil wajah. Cukup modal HP dan internet!",
    url: "https://www.ruangcreativemuslim.com/cuan-faceless",
    siteName: "ruangcreativemuslim",
    images: [
      {
        url: "/img_paket/paket_ebook.png",
        width: 1200,
        height: 630,
        alt: "Tutorial Dapat Cuan dari Produk Digital Lewat Konten Faceless",
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
            <span className="block">Tutorial Dapat Cuan</span>
            <span className="block">dari Produk Digital Lewat</span>
            <span className="block">Konten Faceless</span>
          </h1>

          {/* Bonus Card (Mengikuti Style Kotak Soft Accent) */}
          <div className="w-full max-w-[440px] sm:max-w-[480px] mx-auto mt-4 mb-2">
            <div className="w-full p-2.5 sm:p-3 rounded-xl bg-rn-accent/10 border border-rn-accent/20 text-[12.5px] sm:text-[13.5px] text-gray-900 leading-snug text-center">
              <strong className="font-bold text-gray-950">Bonus 8 Tools</strong> untuk Ngonten dan Riset Instagram, TikTok, Facebook, dan YouTube.
            </div>
          </div>

          {/* 3 Green Checklist Points (Kompak, Sejajar & Rapi) */}
          <div className="w-full max-w-[440px] sm:max-w-[480px] mx-auto mt-2.5 space-y-2 text-left">
            {/* Point 1 */}
            <div className="flex items-center gap-3 p-2.5 sm:p-3 rounded-xl bg-gray-50/80 border border-gray-200/80 shadow-xs">
              <div className="w-5 h-5 rounded-md bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <span className="text-[13px] sm:text-[14px] text-gray-800 font-medium leading-snug">
                Cocok untuk pemula, bahkan yang gaptek sekalipun.
              </span>
            </div>

            {/* Point 2 */}
            <div className="flex items-center gap-3 p-2.5 sm:p-3 rounded-xl bg-gray-50/80 border border-gray-200/80 shadow-xs">
              <div className="w-5 h-5 rounded-md bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <span className="text-[13px] sm:text-[14px] text-gray-800 font-medium leading-snug">
                Potensi cuan hingga <span className="text-emerald-700 font-bold">Rp100 ribu per hari</span>.
              </span>
            </div>

            {/* Point 3 */}
            <div className="flex items-center gap-3 p-2.5 sm:p-3 rounded-xl bg-gray-50/80 border border-gray-200/80 shadow-xs">
              <div className="w-5 h-5 rounded-md bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <span className="text-[13px] sm:text-[14px] text-gray-800 font-medium leading-snug">
                100% cukup pakai HP dan internet.
              </span>
            </div>
          </div>

          {/* Narrative Story Section (Menyatu Bersih di Canvas Putih) */}
          <div className="w-full max-w-[440px] sm:max-w-[480px] mx-auto mt-10 mb-0">
            
            {/* Story Heading (Posisi di Tengah, 2 Baris Terkunci, Ukuran Font Sama dengan Headline Utama) */}
            <h2 className="text-[25px] sm:text-[30px] md:text-[34px] font-extrabold text-gray-950 tracking-tight leading-[1.22] text-center mb-4">
              <span className="block">Ceritanya gini,</span>
              <span className="block">teman-teman.</span>
            </h2>

            {/* Story Paragraphs */}
            <div className="space-y-2 text-[14px] sm:text-[15px] text-gray-700 leading-[1.55] text-left">
              <p>Di tahun 2025, kantor saya mulai banyak melakukan PHK. Jujur, saya pun khawatir suatu saat akan mengalami hal yang sama.</p>
              <p>Akhirnya, saya mulai mencari cara menghasilkan uang hanya lewat HP dan dari rumah.</p>
              <p>Saya pun iseng mencoba membuat produk digital dan memasarkannya lewat konten faceless.</p>
              <p className="font-bold text-gray-950 pt-0.5">Eh, ternyata peluangnya besar banget!</p>
            </div>

            {/* Achievement Highlights (3 Kotak Poin Pencapaian) */}
            <div className="mt-4 text-left">
              <div className="space-y-2">
                <div className="flex items-start gap-2.5 p-2.5 sm:p-3 rounded-xl bg-gray-50/80 border border-gray-200/80 shadow-xs">
                  <span className="text-base shrink-0 leading-none mt-0.5">📈</span>
                  <span className="text-[13px] sm:text-[14px] text-gray-800 font-medium leading-snug">
                    Akun Instagram dari <strong className="text-gray-950 font-bold">NOL</strong>, sekarang sudah <strong className="text-gray-950 font-bold">162 ribu followers</strong>.
                  </span>
                </div>

                <div className="flex items-start gap-2.5 p-2.5 sm:p-3 rounded-xl bg-gray-50/80 border border-gray-200/80 shadow-xs">
                  <span className="text-base shrink-0 leading-none mt-0.5">🔥</span>
                  <span className="text-[13px] sm:text-[14px] text-gray-800 font-medium leading-snug">
                    View yang awalnya sepi, sekarang sering <strong className="text-gray-950 font-bold">VIRAL</strong>.
                  </span>
                </div>

                <div className="flex items-start gap-2.5 p-2.5 sm:p-3 rounded-xl bg-gray-50/80 border border-gray-200/80 shadow-xs">
                  <span className="text-base shrink-0 leading-none mt-0.5">💰</span>
                  <span className="text-[13px] sm:text-[14px] text-gray-800 font-medium leading-snug">
                    Bisa menghasilkan cuan setiap hari, dengan total <strong className="text-emerald-700 font-bold">penghasilan bulanan mencapai 2 digit</strong>.
                  </span>
                </div>
              </div>
            </div>

            {/* Visual Social Proof (Tanpa Bungkus Kontainer, Jarak Simetris Presisi 20px) */}
            <div className="mt-[20px] w-full flex justify-center">
              <Image
                src="/cuan-faceless/bukti-instagram-v2.jpg"
                alt="Bukti akun Instagram ruangcreativemuslim 162 ribu followers dan konten viral"
                width={658}
                height={769}
                className="w-full h-auto object-contain block select-none"
                priority
              />
            </div>
          </div>

          {/* Tutorial Creation & Social Response Section (Jarak Simetris Presisi 20px dari Bawah Gambar) */}
          <div className="w-full max-w-[440px] sm:max-w-[480px] mx-auto mt-[20px] mb-4">
            
            {/* Section Heading (Harmonis dengan Heading Lainnya) */}
            <h2 className="text-[25px] sm:text-[30px] md:text-[34px] font-extrabold text-gray-950 tracking-tight leading-[1.22] text-center mb-4">
              <span className="block">Dan dari konten yang</span>
              <span className="block">saya bagikan tersebut</span>
            </h2>

            {/* Section Paragraphs */}
            <div className="space-y-2 text-[14px] sm:text-[15px] text-gray-700 leading-[1.55] text-left">
              <p>
                Saya juga membuat tutorial cara mendapatkan cuan dari produk digital lewat konten faceless versi saya sendiri.
              </p>
              <p>
                Alhamdulillah, qadarullah, ternyata banyak yang memberikan respons positif dan mulai merasakan hasilnya juga.
              </p>
            </div>

            {/* Visual Testimonial Proof (Tanpa Bungkus Kontainer, Jarak Presisi 20px) */}
            <div className="mt-[20px] w-full flex justify-center">
              <Image
                src="/cuan-faceless/bukti-testimoni-member.jpg"
                alt="Bukti testimoni dan hasil penjualan member tutorial cuan produk digital faceless"
                width={724}
                height={868}
                className="w-full h-auto object-contain block select-none"
                priority
              />
            </div>
          </div>

        </main>

        {/* Bottom Footer Inside the Canvas */}
        <footer className="w-full pb-6 pt-3 sm:pt-4 flex flex-col items-center justify-center gap-1 text-xs text-gray-500 bg-white">
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
