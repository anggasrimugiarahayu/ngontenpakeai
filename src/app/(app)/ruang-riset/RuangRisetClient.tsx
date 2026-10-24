"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { RisetPlatformCard, RisetPlatform } from "./components/RisetPlatformCard";
import {
  InstagramIcon,
  TikTokIcon,
  YouTubeIcon,
  FacebookIcon,
} from "./components/RisetIcons";
import { InstagramResearchStudio } from "./instagram/InstagramResearchStudio";

interface RuangRisetClientProps {
  isLoggedIn: boolean;
  isPro?: boolean;
  isAdmin?: boolean;
  initialPlatform?: "instagram" | null;
}

const RISET_PLATFORMS: RisetPlatform[] = [
  {
    id: "instagram",
    name: "Riset Instagram",
    description:
      "Analisis performa akun, temukan Reels dengan Outlier Score tinggi, dan urutkan konten viral.",
    icon: InstagramIcon,
    badge: "Populer",
    isActive: true,
    points: [
      "Bongkar Outlier Score & Konten Paling Viral",
      "Urutkan Reels Berdasarkan Views & Komentar",
      "Ekspor Naskah, Hook, & Data ke CSV/Excel",
    ],
  },
  {
    id: "tiktok",
    name: "Riset TikTok",
    description:
      "Eksplorasi sound tren, pola durasi FYP, dan struktur hook video kompetitor.",
    icon: TikTokIcon,
    badge: "Segera Hadir",
    isActive: false,
    points: [
      "Deteksi Audio & Sound FYP yang Sedang Naik",
      "Analisis Struktur 3 Detik Pertama Video Populer",
      "Petakan Pola Durasi & Tipe Konten Pemenang",
    ],
  },
  {
    id: "youtube",
    name: "Riset YouTube",
    description:
      "Riset judul, rasio klik tayang (CTR) thumbnail, dan topik Shorts dengan pencarian tinggi.",
    icon: YouTubeIcon,
    badge: "Segera Hadir",
    isActive: false,
    points: [
      "Bongkar Pola Judul & Thumbnail Penarik Klik",
      "Temukan Celah Kata Kunci Volume Pencarian Tinggi",
      "Pilah Format Durasi Shorts & Long-Form Efektif",
    ],
  },
  {
    id: "facebook",
    name: "Riset Facebook",
    description:
      "Pantau topik diskusi grup ramai, performa postingan organik, dan iklan kompetitor.",
    icon: FacebookIcon,
    badge: "Segera Hadir",
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
  isPro = false,
  isAdmin = false,
  initialPlatform = null,
}: RuangRisetClientProps) {
  const router = useRouter();
  const [selectedPlatform, setSelectedPlatform] = useState<"instagram" | null>(
    initialPlatform
  );

  // Sync state with URL search params on mount & popstate
  useEffect(() => {
    if (typeof window === "undefined") return;

    const syncFromUrl = () => {
      const params = new URLSearchParams(window.location.search);
      const platformParam = params.get("platform");
      if (platformParam === "instagram" && isLoggedIn && (isPro || isAdmin)) {
        setSelectedPlatform("instagram");
        window.dispatchEvent(new CustomEvent("riset-platform-change", { detail: "instagram" }));
      } else {
        setSelectedPlatform(null);
        window.dispatchEvent(new CustomEvent("riset-platform-change", { detail: null }));
      }
    };

    const handlePlatformChange = (e: any) => {
      if (e.detail === "instagram" && isLoggedIn && (isPro || isAdmin)) {
        setSelectedPlatform("instagram");
      } else {
        setSelectedPlatform(null);
      }
    };

    syncFromUrl();
    window.addEventListener("popstate", syncFromUrl);
    window.addEventListener("riset-platform-change", handlePlatformChange);
    return () => {
      window.removeEventListener("popstate", syncFromUrl);
      window.removeEventListener("riset-platform-change", handlePlatformChange);
    };
  }, [isLoggedIn, isPro, isAdmin]);

  // Handle click on Instagram Research Card
  const handleSelectInstagram = () => {
    if (!isLoggedIn || (!isPro && !isAdmin)) {
      window.dispatchEvent(new Event("app-loading-start"));
      router.push("/?pricing=true&cat=riset");
      return;
    }
    setSelectedPlatform("instagram");
    if (typeof window !== "undefined") {
      window.history.pushState(null, "", "/ruang-riset?platform=instagram");
      window.dispatchEvent(new CustomEvent("riset-platform-change", { detail: "instagram" }));
      window.dispatchEvent(new Event("app-shallow-navigate"));
    }
  };

  const handleBackToHub = () => {
    setSelectedPlatform(null);
    if (typeof window !== "undefined") {
      window.history.pushState(null, "", "/ruang-riset");
      window.dispatchEvent(new CustomEvent("riset-platform-change", { detail: null }));
      window.dispatchEvent(new Event("app-shallow-navigate"));
    }
  };

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8 animate-in fade-in duration-300">
      {selectedPlatform === "instagram" ? (
        <InstagramResearchStudio
          onBackToPlatformHub={handleBackToHub}
          defaultUsername="creativemuslim.co"
          isAdmin={isAdmin}
        />
      ) : (
        <>
          {/* Header - EXACT SAME CLEAN STYLE & SPACING AS RUANG NGONTEN */}
          <div className="flex flex-col items-center justify-center text-center gap-2 mb-8 md:mb-10">
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
              <RisetPlatformCard
                key={platform.id}
                platform={platform}
                onSelect={platform.id === "instagram" ? handleSelectInstagram : undefined}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
