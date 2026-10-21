"use client";

import React from "react";
import {
  InstagramIcon,
  TikTokIcon,
  YouTubeIcon,
  FacebookIcon,
} from "./components/RisetIcons";
import { RisetPlatformCard, RisetPlatform } from "./components/RisetPlatformCard";

interface RuangRisetClientProps {
  isLoggedIn: boolean;
  isAdmin: boolean;
}

const RISET_PLATFORMS: RisetPlatform[] = [
  {
    id: "instagram",
    name: "Riset Instagram",
    description:
      "Analisis akun kompetitor, bedah Reels viral, dan temukan format caption paling efektif di niche kamu.",
    icon: InstagramIcon,
    badge: "COMING SOON",
    isActive: true,
    points: [
      "Riset Profil & Top Post Kompetitor",
      "Ekstrak Pola Hook & Caption Viral",
      "Analisis Minat & Demografi Followers",
    ],
  },
  {
    id: "tiktok",
    name: "Riset TikTok",
    description:
      "Pantau tren FYP terkini, temukan audio/sound viral lebih awal, dan bedah struktur video retensi tinggi.",
    icon: TikTokIcon,
    badge: "COMING SOON",
    isActive: false,
    points: [
      "Deteksi Topik & Sound Viral FYP",
      "Analisis Struktur Video 3 Detik Pertama",
      "Temukan Celah Konten & Niche Unik",
    ],
  },
  {
    id: "youtube",
    name: "Riset YouTube",
    description:
      "Riset ide video panjang & Shorts, analisis thumbnail dan judul dengan CTR tinggi dari channel teratas.",
    icon: YouTubeIcon,
    badge: "COMING SOON",
    isActive: false,
    points: [
      "Riset Keyword & Judul High CTR",
      "Analisis Performa Shorts & Video Panjang",
      "Formula Hook Pembuka & Retensi Audiens",
    ],
  },
  {
    id: "facebook",
    name: "Riset Facebook",
    description:
      "Bongkar perbincangan hangat di grup Facebook, analisis konten fanspage viral, dan sentimen audiens.",
    icon: FacebookIcon,
    badge: "COMING SOON",
    isActive: false,
    points: [
      "Riset Diskusi Grup & Komunitas Ramai",
      "Bedah Konten Organik & Iklan Pemenang",
      "Petakan Pain Points & Masalah Audiens",
    ],
  },
];

export default function RuangRisetClient({
  isLoggedIn,
  isAdmin,
}: RuangRisetClientProps) {
  return (
    <div className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-6 py-4 md:py-8 animate-in fade-in duration-300">
      {/* Header - EXACT SAME CLEAN STYLE & SPACING AS RUANG NGONTEN */}
      <div className="flex flex-col items-center justify-center text-center gap-2 mb-6 md:mb-10">
        <div className="space-y-3 flex flex-col items-center">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Mau mulai dari mana?
          </h1>
          <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 max-w-xl mx-auto text-balance leading-relaxed">
            Pilih platform media sosial di bawah ini untuk riset topik tren viral, analisis kompetitor di niche kamu, dan temukan celah konten terbaik bareng AI.
          </p>
        </div>
      </div>

      {/* Platform Cards Grid - EXACT SAME STYLE & GAP AS RUANG NGONTEN */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        {RISET_PLATFORMS.map((platform) => (
          <RisetPlatformCard key={platform.id} platform={platform} />
        ))}
      </div>
    </div>
  );
}
