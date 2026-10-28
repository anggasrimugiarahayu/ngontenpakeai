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
import { YouTubeResearchStudio } from "./youtube/YouTubeResearchStudio";
import { TikTokResearchStudio } from "./tiktok/TikTokResearchStudio";
import { FacebookResearchStudio } from "./facebook/FacebookResearchStudio";

interface RuangRisetClientProps {
  isLoggedIn: boolean;
  isPro?: boolean;
  isAdmin?: boolean;
  initialPlatform?: "instagram" | "youtube" | "tiktok" | "facebook" | null;
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
    id: "youtube",
    name: "Riset YouTube",
    description:
      "Bongkar Outlier Score video & Shorts kompetitor, pisahkan format konten, dan ekspor data ide.",
    icon: YouTubeIcon,
    badge: "Populer",
    isActive: true,
    points: [
      "Bongkar Outlier Score & Video Paling Meledak",
      "Pilah Format YouTube Shorts vs Video Reguler",
      "Ekspor Referensi Ide ke CSV / Excel",
    ],
  },
  {
    id: "tiktok",
    name: "Riset TikTok",
    description:
      "Bongkar Outlier Score video & Photo Slide kompetitor, sortir views tertinggi, dan ekspor data ide.",
    icon: TikTokIcon,
    badge: "Baru",
    isActive: true,
    points: [
      "Bongkar Outlier Score & Konten Paling FYP",
      "Pilah Format Video vs Photo Slide",
      "Ekspor Naskah, Hook, & Data ke CSV / Excel",
    ],
  },
  {
    id: "facebook",
    name: "Riset Facebook",
    description:
      "Bongkar Outlier Score Reels, Video & Foto halaman kompetitor, sortir interaksi tertinggi, dan ekspor data ide.",
    icon: FacebookIcon,
    badge: "Baru",
    isActive: true,
    points: [
      "Bongkar Outlier Score & Konten Paling Viral",
      "Pilah Format Reels & Video vs Postingan Foto",
      "Ekspor Caption, Hook, & Data ke CSV / Excel",
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
  const [selectedPlatform, setSelectedPlatform] = useState<
    "instagram" | "youtube" | "tiktok" | "facebook" | null
  >(initialPlatform);

  // Sync state with URL search params on mount & popstate
  useEffect(() => {
    if (typeof window === "undefined") return;

    const syncFromUrl = () => {
      const params = new URLSearchParams(window.location.search);
      const platformParam = params.get("platform");
      if (
        (platformParam === "instagram" ||
          platformParam === "youtube" ||
          platformParam === "tiktok" ||
          platformParam === "facebook") &&
        isLoggedIn &&
        (isPro || isAdmin)
      ) {
        setSelectedPlatform(platformParam);
        window.dispatchEvent(new CustomEvent("riset-platform-change", { detail: platformParam }));
      } else {
        setSelectedPlatform(null);
        window.dispatchEvent(new CustomEvent("riset-platform-change", { detail: null }));
      }
    };

    const handlePlatformChange = (e: any) => {
      if (
        (e.detail === "instagram" ||
          e.detail === "youtube" ||
          e.detail === "tiktok" ||
          e.detail === "facebook") &&
        isLoggedIn &&
        (isPro || isAdmin)
      ) {
        setSelectedPlatform(e.detail);
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

  const handleSelectPlatform = (
    platformId: "instagram" | "youtube" | "tiktok" | "facebook"
  ) => {
    if (!isLoggedIn || (!isPro && !isAdmin)) {
      window.dispatchEvent(new Event("app-loading-start"));
      router.push("/?pricing=true&cat=riset");
      return;
    }
    setSelectedPlatform(platformId);
    if (typeof window !== "undefined") {
      window.history.pushState(null, "", `/ruang-riset?platform=${platformId}`);
      window.dispatchEvent(new CustomEvent("riset-platform-change", { detail: platformId }));
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
      ) : selectedPlatform === "youtube" ? (
        <YouTubeResearchStudio onBackToHub={handleBackToHub} />
      ) : selectedPlatform === "tiktok" ? (
        <TikTokResearchStudio onBackToHub={handleBackToHub} />
      ) : selectedPlatform === "facebook" ? (
        <FacebookResearchStudio onBackToHub={handleBackToHub} />
      ) : (
        <>
          {/* Header */}
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

          {/* Platform Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
            {RISET_PLATFORMS.map((platform) => (
              <RisetPlatformCard
                key={platform.id}
                platform={platform}
                onSelect={
                  platform.id === "instagram" ||
                  platform.id === "youtube" ||
                  platform.id === "tiktok" ||
                  platform.id === "facebook"
                    ? () =>
                        handleSelectPlatform(
                          platform.id as
                            | "instagram"
                            | "youtube"
                            | "tiktok"
                            | "facebook"
                        )
                    : undefined
                }
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
