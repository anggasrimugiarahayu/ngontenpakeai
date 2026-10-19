"use client";

import React from "react";
import { ExternalLink } from "lucide-react";

interface SpintaxAntiSpamTipsProps {
  context?: "dm" | "comment" | "follow" | "followup" | "contact";
  className?: string;
  customExample?: string;
}

export const SpintaxAntiSpamTips: React.FC<SpintaxAntiSpamTipsProps> = ({
  context = "dm",
  className = "",
  customExample,
}) => {
  // Konten tips dan contoh berdasarkan konteks penggunaan
  let tipsItems: React.ReactNode[] = [];
  let exampleContent = customExample;

  if (context === "comment") {
    tipsItems = [
      <span key="c1">Matikan fitur ini ketika konten Anda mendapatkan banyak trafik</span>,
      <span key="c2">Ganti secara berkala isi balasan komentar</span>,
      <span key="c3">Pastikan balasan komentar pada konten Anda berbeda-beda</span>,
      <span key="c4">
        Balas menggunakan{" "}
        <code className="text-blue-600 dark:text-blue-400 font-semibold font-mono">
          @&#123;username&#125;
        </code>{" "}
        untuk bisa secara dinamis memanggil username audiens
      </span>,
      <span key="c5">
        Balas menggunakan format{" "}
        <code className="text-blue-600 dark:text-blue-400 font-semibold font-mono">
          &#123;opsi1|opsi2|opsi3&#125;
        </code>{" "}
        untuk membuat variasi balasan dalam 1 input
      </span>,
    ];
    if (!exampleContent) {
      exampleContent = "@{username} {Cek DM ya kak!|Sudah kami kirimkan ke DM ya|Link akses sudah meluncur ke DM kakak!} 🙌";
    }
  } else if (context === "follow") {
    tipsItems = [
      <span key="f1">
        Panggil nama audiens dengan{" "}
        <code className="text-blue-600 dark:text-blue-400 font-semibold font-mono">
          &#123;first_name&#125;
        </code>{" "}
        atau{" "}
        <code className="text-blue-600 dark:text-blue-400 font-semibold font-mono">
          @&#123;username&#125;
        </code>{" "}
        agar ajakan follow lebih ramah & personal
      </span>,
      <span key="f2">
        Gunakan format{" "}
        <code className="text-blue-600 dark:text-blue-400 font-semibold font-mono">
          &#123;opsi1|opsi2|opsi3&#125;
        </code>{" "}
        agar kalimat ajakan bervariasi dan akun aman dari pembatasan Meta
      </span>,
    ];
    if (!exampleContent) {
      exampleContent = "{Follow dulu akun ini ya kak|Bantu follow akun kami dulu ya} agar materi otomatis terkirim 🙌";
    }
  } else if (context === "followup") {
    tipsItems = [
      <span key="fu1">
        Gunakan variabel{" "}
        <code className="text-blue-600 dark:text-blue-400 font-semibold font-mono">
          &#123;first_name&#125;
        </code>{" "}
        untuk menyapa kembali audiens secara akrab
      </span>,
      <span key="fu2">
        Gunakan format{" "}
        <code className="text-blue-600 dark:text-blue-400 font-semibold font-mono">
          &#123;opsi1|opsi2|opsi3&#125;
        </code>{" "}
        agar pesan pengingat tidak dianggap spam oleh sistem proteksi Instagram
      </span>,
    ];
    if (!exampleContent) {
      exampleContent = "{Halo|Hai} {first_name}! {Gimana, sudah sempat buka linknya?|Materinya sudah sempat dipelajari belum ya?} 😊";
    }
  } else if (context === "contact") {
    tipsItems = [
      <span key="ct1">
        Sapa audiens secara personal dengan{" "}
        <code className="text-blue-600 dark:text-blue-400 font-semibold font-mono">
          &#123;first_name&#125;
        </code>
      </span>,
      <span key="ct2">
        Gunakan variasi kalimat{" "}
        <code className="text-blue-600 dark:text-blue-400 font-semibold font-mono">
          &#123;opsi1|opsi2|opsi3&#125;
        </code>{" "}
        saat meminta email atau nomor WhatsApp audiens
      </span>,
    ];
    if (!exampleContent) {
      exampleContent = "{Ketik alamat email aktif kakak di bawah ya|Boleh minta alamat email kakak?} agar link materi bisa langsung kami kirimkan 👇";
    }
  } else {
    // Default context === "dm" (Pesan Utama DM & Respon Tombol)
    tipsItems = [
      <span key="d1">
        Panggil nama audiens secara dinamis dengan{" "}
        <code className="text-blue-600 dark:text-blue-400 font-semibold font-mono">
          &#123;first_name&#125;
        </code>{" "}
        atau{" "}
        <code className="text-blue-600 dark:text-blue-400 font-semibold font-mono">
          @&#123;username&#125;
        </code>{" "}
        agar pesan terasa personal
      </span>,
      <span key="d2">
        Gunakan format{" "}
        <code className="text-blue-600 dark:text-blue-400 font-semibold font-mono">
          &#123;opsi1|opsi2|opsi3&#125;
        </code>{" "}
        untuk membuat variasi kata/kalimat acak agar setiap orang menerima pesan berbeda dan akun aman dari deteksi bot
      </span>,
    ];
    if (!exampleContent) {
      exampleContent = "{Halo|Hai|Pagi} {first_name}! {Ini materi yang kamu tunggu|Silakan cek link yang sudah kami siapkan}: https://...";
    }
  }

  return (
    <div
      className={`p-3.5 sm:p-4 rounded-xl border border-blue-400/50 dark:border-blue-500/30 bg-blue-50/40 dark:bg-blue-950/20 space-y-2.5 ${className}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-0.5">
          <div className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
            <span>Tips</span>
          </div>
          <p className="text-[11px] text-gray-500 dark:text-gray-400">
            Tips bermanfaat untuk menghindari spam
          </p>
        </div>
        <div className="w-5 h-5 rounded-full border border-blue-500 text-blue-500 flex items-center justify-center shrink-0 text-xs font-bold font-serif">
          i
        </div>
      </div>

      <ol className="space-y-1.5 text-[11px] text-gray-600 dark:text-gray-400 list-decimal pl-4 leading-relaxed">
        {tipsItems.map((item, idx) => (
          <li key={idx}>{item}</li>
        ))}
      </ol>

      {exampleContent && (
        <div className="pt-1 border-t border-blue-200/40 dark:border-blue-500/15">
          <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 block mb-1">
            Contoh format:
          </span>
          <div className="p-2 rounded-lg bg-white/70 dark:bg-black/30 border border-blue-200/50 dark:border-blue-900/50 text-[11px] text-gray-800 dark:text-gray-200 font-mono leading-relaxed break-words select-all">
            {exampleContent}
          </div>
        </div>
      )}

      <div className="flex justify-end pt-0.5">
        <a
          href="https://help.instagram.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
        >
          <span>Panduan</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
};

export default SpintaxAntiSpamTips;
