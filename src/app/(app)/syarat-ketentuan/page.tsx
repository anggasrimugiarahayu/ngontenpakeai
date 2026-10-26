import React from "react";
import Link from "next/link";
import { FileText, ArrowLeft, ShieldAlert, CheckCircle2, UserCheck, Scale, AlertTriangle, Mail } from "lucide-react";

export const metadata = {
  title: "Syarat & Ketentuan Layanan | ruangcreativemuslim",
  description: "Syarat dan ketentuan penggunaan layanan ruangcreativemuslim, aturan penggunaan automasi media sosial, dan hak serta kewajiban pengguna.",
};

export default function SyaratKetentuanPage() {
  const lastUpdated = "26 Oktober 2026";

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-gray-800 dark:text-gray-200">
      {/* Header Nav */}
      <div className="mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Beranda
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              Syarat &amp; Ketentuan Layanan
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Terakhir diperbarui: {lastUpdated} • Perjanjian Penggunaan Platform ruangcreativemuslim
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Box */}
      <div className="space-y-8 bg-white dark:bg-[#141B2D] border border-gray-200 dark:border-[#232D42] rounded-3xl p-6 sm:p-10 shadow-sm leading-relaxed text-sm sm:text-base">
        {/* Ringkasan */}
        <div className="p-4 sm:p-5 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 text-gray-700 dark:text-gray-300">
          <p className="font-medium text-indigo-700 dark:text-indigo-300 mb-1 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            Ketentuan Umum Penggunaan
          </p>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            Selamat datang di <strong>ruangcreativemuslim</strong>. Dengan mengakses dan menggunakan platform kami, Anda menyetujui untuk terikat oleh Syarat dan Ketentuan ini serta mematuhi seluruh hukum yang berlaku dan kebijakan pihak ketiga yang terintegrasi (termasuk Meta Platform Terms).
          </p>
        </div>

        {/* 1. Definisi Layanan */}
        <section className="space-y-3">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            1. Definisi Layanan
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            <strong>ruangcreativemuslim</strong> adalah platform produktivitas konten digital berbasis web yang menyediakan berbagai modul:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-gray-600 dark:text-gray-300 text-xs sm:text-sm">
            <li><strong>Ruang Belajar:</strong> Akses materi edukasi, modul strategi, dan E-Book digital PRO.</li>
            <li><strong>Ruang Ngonten:</strong> Generator ide konten berbasis AI (ATM Content Builder, Bio Builder, Script Builder, Carousel Builder, Content Calendar).</li>
            <li><strong>Ruang Automation:</strong> Sistem manajemen automasi interaksi komentar publik dan pesan langsung (DM) Instagram terintegrasi Meta Graph API.</li>
            <li><strong>Ruang Riset:</strong> Alat analitik konten viral dan riset performa video publik Instagram.</li>
          </ul>
        </section>

        {/* 2. Pendaftaran Akun & Keamanan */}
        <section className="space-y-3">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-blue-500" />
            2. Akun &amp; Keamanan Pengguna
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-gray-600 dark:text-gray-300">
            <li>Anda bertanggung jawab menjaga kerahasiaan kredensial akun Anda dan setiap aktivitas yang terjadi di bawah akun Anda.</li>
            <li>Anda wajib memberikan informasi yang akurat dan sah saat melakukan registrasi maupun pembayaran paket.</li>
            <li>Satu akun hanya diperuntukkan bagi pengguna bersangkutan dan dilarang dipindahtangankan atau disewakan kepada pihak lain tanpa izin tertulis dari kami.</li>
          </ul>
        </section>

        {/* 3. Aturan Penggunaan Ruang Automation (Instagram Integration) */}
        <section className="space-y-3">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-500" />
            3. Kebijakan Penggunaan Ruang Automation &amp; Meta API
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Fitur automasi pesan dan komentar Instagram disediakan untuk memfasilitasi interaksi wajar antara kreator/bisnis dan audiensnya. Anda secara tegas <strong>DILARANG</strong>:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-gray-600 dark:text-gray-300">
            <li>Mengirimkan pesan massal tak diminta (spam), pesan promosi berulang tanpa persetujuan interaksi audiens, atau penawaran produk ilegal/terlarang.</li>
            <li>Menyebarkan konten bermuatan ujaran kebencian, pelecehan, penipuan (*scam/phishing*), judi online, pornografi, atau konten yang melanggar hukum Republik Indonesia dan Standar Komunitas Meta.</li>
            <li>Melanggar batasan kecepatan (*rate limits*) yang telah ditetapkan oleh Meta Graph API.</li>
          </ul>
          <p className="text-xs sm:text-sm text-amber-600 dark:text-amber-400 bg-amber-500/10 p-3.5 rounded-xl border border-amber-500/20">
            <strong>Penting:</strong> Kami berhak menonaktifkan aturan automasi atau menangguhkan akun pengguna yang terbukti melanggar kebijakan Meta Platform tanpa kewajiban pengembalian biaya langganan.
          </p>
        </section>

        {/* 4. Paket Berlangganan & Pembayaran */}
        <section className="space-y-3">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Scale className="w-5 h-5 text-emerald-500" />
            4. Paket Berlangganan (FREE &amp; PRO)
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-gray-600 dark:text-gray-300">
            <li><strong>Paket FREE:</strong> Pengguna dapat mengakses modul gratis dengan kuota penggunaan fitur AI terbatas per siklus (3x per fitur).</li>
            <li><strong>Paket PRO:</strong> Memberikan akses tanpa batas fitur AI, akses E-Book selamanya, fitur Ruang Automation, atau Ruang Riset sesuai durasi masa aktif yang dibeli (misal 30 hari / 1 tahun / selamanya).</li>
            <li><strong>Masa Berlaku &amp; Perpanjangan:</strong> Masa aktif paket PRO dihitung sejak transaksi dinyatakan sukses terverifikasi melalui payment gateway resmi (Midtrans) atau aktivasi admin.</li>
            <li><strong>Kebijakan Pengembalian Dana (Refund):</strong> Karena produk ini berupa akses digital dan layanan cloud instan, pembayaran yang telah berhasil tidak dapat dikembalikan kecuali terdapat kegagalan sistem teknis berkelanjutan dari pihak kami yang tidak dapat diselesaikan lebih dari 7x24 jam.</li>
          </ul>
        </section>

        {/* 5. Batasan Tanggung Jawab */}
        <section className="space-y-3">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-500" />
            5. Batasan Tanggung Jawab (Disclaimer)
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-gray-600 dark:text-gray-300">
            <li>Layanan kami disediakan secara <em>&quot;sebagaimana adanya&quot;</em> (*as-is*) tanpa jaminan bahwa operasi akan selalu bebas dari gangguan jaringan, pemeliharaan pihak ketiga (Meta downtime), atau perubahan algoritma platform media sosial.</li>
            <li>Kami tidak bertanggung jawab atas tindakan penalti, pembatasan jangkauan (*shadowban*), atau penangguhan akun Instagram Anda oleh pihak Meta yang diakibatkan oleh konfigurasi pesan pengguna sendiri yang melanggar ketentuan spam Meta.</li>
          </ul>
        </section>

        {/* 6. Perubahan Ketentuan */}
        <section className="space-y-3">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            6. Perubahan Ketentuan Layanan
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Kami berhak untuk mengubah atau memperbarui Syarat &amp; Ketentuan ini sewaktu-waktu. Perubahan material akan diberitahukan melalui pembaruan tanggal di bagian atas halaman ini atau pengumuman di aplikasi. Penggunaan berkelanjutan atas layanan setelah perubahan menandakan persetujuan Anda terhadap ketentuan baru.
          </p>
        </section>

        {/* 7. Hubungi Kami */}
        <section className="space-y-3 pt-4 border-t border-gray-200 dark:border-[#232D42]">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Mail className="w-5 h-5 text-indigo-500" />
            7. Kontak Layanan
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Untuk pertanyaan atau klarifikasi lebih lanjut mengenai Syarat &amp; Ketentuan ini, silakan hubungi:
          </p>
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#0E1322] border border-gray-200 dark:border-[#232D42] text-xs sm:text-sm space-y-1">
            <p><strong>Platform:</strong> ruangcreativemuslim</p>
            <p><strong>Email Dukungan:</strong> <a href="mailto:ruangcreativemuslim@gmail.com" className="text-indigo-600 dark:text-indigo-400 hover:underline">ruangcreativemuslim@gmail.com</a></p>
            <p><strong>Website Resmi:</strong> <a href="https://www.ruangcreativemuslim.com" target="_blank" rel="noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline">https://www.ruangcreativemuslim.com</a></p>
          </div>
        </section>
      </div>
    </div>
  );
}
