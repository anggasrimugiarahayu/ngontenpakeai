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
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Sparkles } from "lucide-react";

interface RuangRisetClientProps {
  isLoggedIn: boolean;
  isPro?: boolean;
  isAdmin?: boolean;
  initialPlatform?: "instagram" | "youtube" | "tiktok" | "facebook" | null;
  features?: any[];
  usages?: any[];
  quotaConfig?: {
    risetFreeLimit?: number;
    [key: string]: any;
  };
}

const RISET_PLATFORMS: RisetPlatform[] = [
  {
    id: "instagram",
    name: "Riset Instagram",
    description:
      "Analisis performa akun, temukan Reels dengan Outlier Score tinggi, dan urutkan konten viral.",
    icon: InstagramIcon,
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
  features = [],
  usages = [],
  quotaConfig,
}: RuangRisetClientProps) {
  const router = useRouter();
  const [selectedPlatform, setSelectedPlatform] = useState<
    "instagram" | "youtube" | "tiktok" | "facebook" | null
  >(initialPlatform);

  const [quotaModalOpen, setQuotaModalOpen] = useState(false);
  const [quotaModalInfo, setQuotaModalInfo] = useState<{
    name: string;
    used: number;
    limit: number;
  } | null>(null);

  // Set platform yang sudah pernah dibuka (untuk Keep-Alive / DOM Preservation)
  const [visitedPlatforms, setVisitedPlatforms] = useState<Set<string>>(
    () => new Set(initialPlatform ? [initialPlatform] : [])
  );

  useEffect(() => {
    if (selectedPlatform) {
      setVisitedPlatforms((prev) => {
        if (prev.has(selectedPlatform)) return prev;
        const next = new Set(prev);
        next.add(selectedPlatform);
        return next;
      });
    }
  }, [selectedPlatform]);

  const getMatchedFeature = (platformId: string) => {
    return (features || []).find(
      (f: any) =>
        f.name.toLowerCase() === `riset ${platformId}` ||
        f.name.toLowerCase().includes(platformId)
    );
  };

  // Sync state with URL search params on mount & popstate
  useEffect(() => {
    if (typeof window === "undefined") return;

    const syncFromUrl = () => {
      const params = new URLSearchParams(window.location.search);
      const platformParam = params.get("platform");
      if (
        platformParam === "instagram" ||
        platformParam === "youtube" ||
        platformParam === "tiktok" ||
        platformParam === "facebook"
      ) {
        const feature = getMatchedFeature(platformParam);
        const isProOnly = feature ? feature.isProOnly : true;
        if (isLoggedIn && (isPro || isAdmin || !isProOnly)) {
          setSelectedPlatform(platformParam);
          window.dispatchEvent(
            new CustomEvent("riset-platform-change", { detail: platformParam })
          );
          return;
        }
      }
      setSelectedPlatform(null);
      window.dispatchEvent(
        new CustomEvent("riset-platform-change", { detail: null })
      );
    };

    const handlePlatformChange = (e: any) => {
      if (
        e.detail === "instagram" ||
        e.detail === "youtube" ||
        e.detail === "tiktok" ||
        e.detail === "facebook"
      ) {
        setSelectedPlatform(e.detail);
      } else {
        setSelectedPlatform(null);
      }
    };

    window.addEventListener("popstate", syncFromUrl);
    window.addEventListener("riset-platform-change", handlePlatformChange);
    return () => {
      window.removeEventListener("popstate", syncFromUrl);
      window.removeEventListener("riset-platform-change", handlePlatformChange);
    };
  }, [isLoggedIn, isPro, isAdmin, features]);

  const handleSelectPlatform = (
    platformId: "instagram" | "youtube" | "tiktok" | "facebook"
  ) => {
    if (!isLoggedIn) {
      window.dispatchEvent(new Event("app-loading-start"));
      router.push(`/login?redirect=/ruang-riset?platform=${platformId}`);
      return;
    }

    const feature = getMatchedFeature(platformId);
    const isActive = feature !== undefined ? Boolean(feature?.isActive) : true;
    const isProOnly = feature !== undefined ? Boolean(feature?.isProOnly) : true;

    if (!isActive) {
      return;
    }

    if (isProOnly && !isPro && !isAdmin) {
      window.dispatchEvent(new Event("app-loading-start"));
      router.push("/?pricing=true&cat=riset");
      return;
    }

    // Free Mode check
    if (!isProOnly && !isPro && !isAdmin) {
      const usageCount =
        (usages || []).find((u: any) => u.featureId === feature?.id)?.count || 0;
      const maxQuota = quotaConfig?.risetFreeLimit || 3;
      if (usageCount >= maxQuota) {
        setQuotaModalInfo({
          name: feature?.name || `Riset ${platformId}`,
          used: usageCount,
          limit: maxQuota,
        });
        setQuotaModalOpen(true);
        return;
      }
    }

    setSelectedPlatform(platformId);
    if (typeof window !== "undefined") {
      window.history.pushState(null, "", `/ruang-riset?platform=${platformId}`);
      window.dispatchEvent(
        new CustomEvent("riset-platform-change", { detail: platformId })
      );
      window.dispatchEvent(new Event("app-shallow-navigate"));
    }
  };

  const handleBackToHub = () => {
    setSelectedPlatform(null);
    if (typeof window !== "undefined") {
      window.history.pushState(null, "", "/ruang-riset");
      window.dispatchEvent(
        new CustomEvent("riset-platform-change", { detail: null })
      );
      window.dispatchEvent(new Event("app-shallow-navigate"));
    }
  };

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8 animate-in fade-in duration-300">
      {/* Platform Studios dengan Keep-Alive (DOM & State Preservation) */}
      {visitedPlatforms.has("instagram") && (
        <div className={selectedPlatform === "instagram" ? "block" : "hidden"}>
          <InstagramResearchStudio
            onBackToPlatformHub={handleBackToHub}
            defaultUsername="creativemuslim.co"
            isAdmin={isAdmin}
          />
        </div>
      )}

      {visitedPlatforms.has("youtube") && (
        <div className={selectedPlatform === "youtube" ? "block" : "hidden"}>
          <YouTubeResearchStudio onBackToHub={handleBackToHub} />
        </div>
      )}

      {visitedPlatforms.has("tiktok") && (
        <div className={selectedPlatform === "tiktok" ? "block" : "hidden"}>
          <TikTokResearchStudio onBackToHub={handleBackToHub} />
        </div>
      )}

      {visitedPlatforms.has("facebook") && (
        <div className={selectedPlatform === "facebook" ? "block" : "hidden"}>
          <FacebookResearchStudio onBackToHub={handleBackToHub} />
        </div>
      )}

      {/* Platform Selection Hub (Hanya tampil saat selectedPlatform === null) */}
      {selectedPlatform === null && (
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
            {RISET_PLATFORMS.map((platform) => {
              const matchedFeature = getMatchedFeature(platform.id);
              return (
                <RisetPlatformCard
                  key={platform.id}
                  platform={platform}
                  isPro={isPro || isAdmin}
                  feature={matchedFeature}
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
              );
            })}
          </div>
        </>
      )}

      {/* Modal Batas Riset Gratis Tercapai */}
      <Modal
        isOpen={quotaModalOpen}
        onClose={() => setQuotaModalOpen(false)}
        title="Batas Riset Gratis Tercapai"
        description={`Kuota percobaan gratis kamu untuk ${quotaModalInfo?.name || "fitur ini"} sudah mencapai batas (${quotaModalInfo?.used || 3}/${quotaModalInfo?.limit || 3}).`}
        icon={
          <div className="w-9 h-9 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
        }
      >
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-orange-50/60 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/30 text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            <p className="font-semibold text-gray-900 dark:text-white mb-1">
              Nikmati Riset Tanpa Batas dengan Paket PRO Riset
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              Upgrade sekarang untuk membongkar outlier score, naskah konten viral, dan analisis kompetitor tanpa batasan kuota.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100 dark:border-[#2C3246]/60">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setQuotaModalOpen(false)}
            >
              Nanti Saja
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => {
                setQuotaModalOpen(false);
                window.dispatchEvent(new Event("app-loading-start"));
                router.push("/?pricing=true&cat=riset");
              }}
              className="bg-[#f97316] hover:bg-[#ea580c] text-white font-bold"
            >
              Upgrade ke PRO Riset
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
