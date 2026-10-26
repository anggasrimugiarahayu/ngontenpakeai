import React from "react";
import Link from "next/link";
import { ShieldCheck, Lock, Eye, RefreshCw, Trash2, Mail, ArrowLeft, CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "Kebijakan Privasi | Ngonten Pake AI",
  description: "Kebijakan privasi dan perlindungan data pengguna platform Ngonten Pake AI, termasuk integrasi resmi Meta & Instagram Graph API.",
};

export default function KebijakanPrivasiPage() {
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
          <div className="w-12 h-12 rounded-2xl bg-blue-600/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              Kebijakan Privasi
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Terakhir diperbarui: {lastUpdated} • Komitmen Keamanan Data & Integrasi Meta Platform
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Box */}
      <div className="space-y-8 bg-white dark:bg-[#141B2D] border border-gray-200 dark:border-[#232D42] rounded-3xl p-6 sm:p-10 shadow-sm leading-relaxed text-sm sm:text-base">
        {/* Ringkasan Komitmen */}
        <div className="p-4 sm:p-5 rounded-2xl bg-blue-500/5 border border-blue-500/20 text-gray-700 dark:text-gray-300">
          <p className="font-medium text-blue-700 dark:text-blue-300 mb-1 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            Prinsip Utama Perlindungan Privasi Kami:
          </p>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            <strong>Ngonten Pake AI</strong> menghormati dan melindungi privasi setiap pengguna. Kami <strong>TIDAK PERNAH</strong> memperjualbelikan, menyewakan, atau mendistribusikan data pribadi, token akses, atau percakapan Anda kepada pihak ketiga mana pun untuk tujuan periklanan atau komersialisasi pihak luar.
          </p>
        </div>

        {/* 1. Pendahuluan */}
        <section className="space-y-3">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            1. Pendahuluan
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Kebijakan Privasi ini menjelaskan bagaimana platform <strong>Ngonten Pake AI</strong> (&quot;kami&quot;, &quot;layanan&quot;) mengumpulkan, menggunakan, menyimpan, dan melindungi informasi pribadi Anda saat menggunakan aplikasi web kami, termasuk fitur automasi interaksi media sosial (Ruang Automation) yang terintegrasi resmi dengan <strong>Meta Graph API</strong> (Instagram).
          </p>
          <p className="text-gray-600 dark:text-gray-300">
            Dengan mendaftar, mengakses, atau menggunakan layanan kami, Anda menyetujui pengumpulan dan penggunaan informasi sesuai dengan ketentuan dalam kebijakan ini.
          </p>
        </section>

        {/* 2. Informasi yang Kami Kumpulkan */}
        <section className="space-y-3">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Eye className="w-5 h-5 text-blue-500" />
            2. Informasi yang Kami Kumpulkan
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Kami hanya mengumpulkan informasi yang esensial untuk mengoperasikan fungsi platform:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-gray-600 dark:text-gray-300">
            <li>
              <strong>Informasi Akun Utama:</strong> Nama lengkap, alamat email, dan foto profil yang Anda sediakan melalui autentikasi OAuth Google.
            </li>
            <li>
              <strong>Data Akun Instagram Terhubung (Ruang Automation):</strong> Saat Anda secara eksplisit menghubungkan akun Instagram Bisnis atau Kreator Anda, kami menerima:
              <ul className="list-circle pl-5 mt-1 space-y-1 text-gray-500 dark:text-gray-400 text-xs sm:text-sm">
                <li>Instagram User ID dan Page ID publik.</li>
                <li>Nama Pengguna (username) dan Nama Tampilan Profil.</li>
                <li>Foto profil publik Instagram.</li>
                <li>Access Token resmi bersertifikat OAuth dari Meta yang disimpan dalam bentuk terenkripsi.</li>
              </ul>
            </li>
            <li>
              <strong>Data Event & Interaksi Real-Time:</strong> Melalui Webhook resmi Meta, sistem kami memproses event komentar publik pada postingan Anda dan pesan langsung (DM) yang masuk semata-mata untuk mencocokkan kata kunci (*keywords*) dan memicu aturan balasan otomatis (*auto-reply*) yang Anda konfigurasikan.
            </li>
            <li>
              <strong>Log Eksekusi Automasi:</strong> Riwayat status keberhasilan balasan (SENT / FAILED) dan username pengirim komentar/DM untuk menampilkan statistik pada dasbor Anda.
            </li>
          </ul>
        </section>

        {/* 3. Penggunaan Informasi & Izin Meta API */}
        <section className="space-y-3">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Lock className="w-5 h-5 text-emerald-500" />
            3. Penggunaan Izin Meta Graph API (Instagram Permissions)
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Layanan kami hanya meminta izin akses (*permissions*) resmi Meta yang relevan langsung dengan fungsionalitas yang Anda gunakan:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="p-3.5 rounded-xl border border-gray-200 dark:border-[#232D42] bg-gray-50 dark:bg-[#0E1322]">
              <p className="font-semibold text-xs text-blue-600 dark:text-blue-400 mb-1">instagram_business_basic</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Digunakan untuk membaca profil dasar dan memastikan akun adalah profil Bisnis/Kreator aktif.</p>
            </div>
            <div className="p-3.5 rounded-xl border border-gray-200 dark:border-[#232D42] bg-gray-50 dark:bg-[#0E1322]">
              <p className="font-semibold text-xs text-emerald-600 dark:text-emerald-400 mb-1">instagram_business_manage_comments</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Digunakan untuk mendeteksi komentar masuk dan membalas komentar publik secara otomatis sesuai aturan Anda.</p>
            </div>
            <div className="p-3.5 rounded-xl border border-gray-200 dark:border-[#232D42] bg-gray-50 dark:bg-[#0E1322]">
              <p className="font-semibold text-xs text-purple-600 dark:text-purple-400 mb-1">instagram_business_manage_messages</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Digunakan untuk mengirimkan pesan otomatis (DM) dengan tombol/link materi kepada audiens yang berkomentar.</p>
            </div>
          </div>
        </section>

        {/* 4. Keamanan & Kerahasiaan Data */}
        <section className="space-y-3">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-amber-500" />
            4. Keamanan Penyimpanan Data
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Kami menerapkan standar teknis keamanan ketat untuk mencegah akses tanpa izin, kebocoran, atau perubahan data yang tidak sah:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-gray-600 dark:text-gray-300">
            <li>Seluruh pertukaran data melalui jaringan dienkripsi menggunakan protokol aman <strong>HTTPS / TLS 1.3</strong>.</li>
            <li>Token akses Meta disimpan pada basis data terisolasi dengan akses terbatas.</li>
            <li>Komunikasi webhook diverifikasi secara kriptografis menggunakan token verifikasi rahasia.</li>
          </ul>
        </section>

        {/* 5. Hak Pengguna & Penghapusan Data (Data Deletion) */}
        <section className="space-y-3">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-rose-500" />
            5. Hak Pengguna &amp; Instruksi Penghapusan Data (Data Deletion)
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Anda memiliki kendali penuh atas akun dan data Anda:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-gray-600 dark:text-gray-300">
            <li>
              <strong>Memutuskan Koneksi Mandiri:</strong> Anda dapat kapan saja mengklik tombol <em>&quot;Putuskan Akun&quot;</em> di dalam menu Ruang Automation. Begitu diputuskan, token akses dan sinkronisasi akan langsung dihapus.
            </li>
            <li>
              <strong>Pencabutan Akses via Meta/Facebook:</strong> Anda dapat mencabut akses aplikasi kami melalui akun Facebook/Instagram Anda pada menu: <em>Pengaturan &amp; Privasi &gt; Pengaturan &gt; Izin &gt; Aplikasi dan Situs Web</em> &gt; Pilih &quot;Ngonten Pake AI&quot; &gt; Hapus.
            </li>
            <li>
              <strong>Callback Penghapusan Data Otomatis:</strong> Sistem kami telah menyediakan endpoint penghapusan data otomatis sesuai pedoman kepatuhan Meta di:{" "}
              <code className="text-xs px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-blue-600 dark:text-blue-400 font-mono">
                /api/auth/instagram/data-deletion
              </code>.
            </li>
            <li>
              <strong>Permintaan Penghapusan Manual:</strong> Anda dapat mengajukan permohonan penghapusan seluruh riwayat akun dan data Anda kapan saja dengan mengirimkan email ke <a href="mailto:anggasrimugiarahayu@gmail.com" className="text-blue-600 dark:text-blue-400 font-medium hover:underline">anggasrimugiarahayu@gmail.com</a>. Permintaan Anda akan diselesaikan dalam waktu maksimal 3x24 jam kerja.
            </li>
          </ul>
        </section>

        {/* 6. Kepatuhan Meta Platform Terms */}
        <section className="space-y-3">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            6. Kepatuhan Terhadap Kebijakan Meta Platform
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Ngonten Pake AI tunduk dan mematuhi sepenuhnya <strong>Meta Platform Terms</strong> dan <strong>Developer Policies</strong>. Kami melarang keras penggunaan layanan automasi kami untuk tindakan spam, penipuan (*scam/phishing*), pelecehan, atau aktivitas ilegal yang bertentangan dengan Standar Komunitas Meta.
          </p>
        </section>

        {/* 7. Hubungi Kami */}
        <section className="space-y-3 pt-4 border-t border-gray-200 dark:border-[#232D42]">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Mail className="w-5 h-5 text-blue-500" />
            7. Kontak &amp; Dukungan Pengembang
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Jika Anda memiliki pertanyaan mengenai Kebijakan Privasi ini atau pengelolaan data di aplikasi Ngonten Pake AI, silakan hubungi tim kami:
          </p>
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#0E1322] border border-gray-200 dark:border-[#232D42] text-xs sm:text-sm space-y-1">
            <p><strong>Platform:</strong> Ngonten Pake AI</p>
            <p><strong>Pengembang &amp; Pengelola Data:</strong> Angga Sri Mugi Rahayu</p>
            <p><strong>Email Resmi:</strong> <a href="mailto:anggasrimugiarahayu@gmail.com" className="text-blue-600 dark:text-blue-400 hover:underline">anggasrimugiarahayu@gmail.com</a></p>
            <p><strong>Website:</strong> <a href="https://ngontenpakeai.vercel.app" target="_blank" rel="noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">https://ngontenpakeai.vercel.app</a></p>
          </div>
        </section>
      </div>
    </div>
  );
}
