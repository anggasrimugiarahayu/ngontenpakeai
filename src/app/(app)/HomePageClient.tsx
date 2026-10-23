"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { preload } from "swr";
import { getRuangBelajarDataAction } from "@/app/actions/ruangBelajar";
import { getInstagramAutomationDataAction } from "@/app/actions/instagramAutomation";
import { getCheckoutDetailsAction } from "@/app/actions/checkout";
import { redirect } from "next/navigation";
import {
  Flame,
  User,
  PlayCircle,
  Star,
  Zap,
  Moon,
  Check,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTheme } from "next-themes";
import { useSession } from "next-auth/react";
import { Suspense } from "react";
import { HomeCardVisual } from "@/components/home/HomeCardVisuals";
import { HomepageCardConfig, DEFAULT_HOMEPAGE_CARDS } from "@/lib/homepage-cards";

function HomeContent({
  initialPricingConfig,
  initialCards,
}: {
  initialPricingConfig: any;
  initialCards?: HomepageCardConfig[];
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user;
  const searchParams = useSearchParams();
  const showPricingParam = searchParams.get("pricing") === "true";
  const [showPricing, setShowPricing] = useState(showPricingParam);
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const pricingConfig = initialPricingConfig;
  const cards = initialCards && initialCards.length > 0 ? initialCards : DEFAULT_HOMEPAGE_CARDS;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setShowPricing(showPricingParam);
  }, [showPricingParam]);

  useEffect(() => {
    const handlePopState = () => {
      const isPricing = new URLSearchParams(window.location.search).get("pricing") === "true";
      setShowPricing(isPricing);
      window.dispatchEvent(new CustomEvent("pricing-change", { detail: isPricing }));
    };
    const handlePricingEvent = (e: any) => {
      if (typeof e.detail === "boolean") {
        setShowPricing(e.detail);
      }
    };
    window.addEventListener("popstate", handlePopState);
    window.addEventListener("pricing-change", handlePricingEvent);
    return () => {
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("pricing-change", handlePricingEvent);
    };
  }, []);

  const handleOpenPricing = () => {
    setShowPricing(true);
    window.history.pushState(null, "", "/?pricing=true");
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("pricing-change", { detail: true }));
      window.dispatchEvent(new Event("app-shallow-navigate"));
    }
  };

  const handleClosePricing = () => {
    setShowPricing(false);
    window.history.pushState(null, "", "/");
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("pricing-change", { detail: false }));
      window.dispatchEvent(new Event("app-shallow-navigate"));
    }
  };

  

  return (
    <>
      {/* MAIN CONTENT */}
      {!showPricing ? (
        <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 pt-4 md:pt-6 pb-20 sm:pb-28 text-center max-w-6xl mx-auto w-full overscroll-none select-none">
          <button
            onClick={handleOpenPricing}
            draggable={false}
            className="group inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border border-amber-500/30 bg-amber-500/5 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 transition-colors mb-6 select-none"
          >
            <Flame
              className="w-3.5 h-3.5 text-amber-500"
              fill="currentColor"
            />
            PROMO hingga 95%
            <span className="ml-0.5 text-sm leading-none transition-transform duration-200 group-hover:translate-x-0.5">&rsaquo;</span>
          </button>

          <h1
            className={`text-3xl sm:text-4xl md:text-5xl font-extrabold font-heading mb-10 md:mb-12 tracking-tight transition-colors duration-300 text-gray-900 dark:text-[#F3F4F6] select-none`}
          >
            Mau mulai dari mana hari ini?
          </h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-6xl">
            {cards.map((card) => {
              const isCardDisabled = card.isActive === false;

              if (isCardDisabled) {
                return (
                  <div
                    key={card.id}
                    title={`${card.title} (Segera Hadir)`}
                    className="group relative flex flex-col justify-start rounded-xl border-2 p-6 text-left z-0 overflow-hidden bg-white/70 border-gray-200 dark:bg-[#141B31]/60 dark:border-[#2C3246] opacity-60 cursor-not-allowed select-none"
                  >
                    {card.showBadge && card.badgeText && (
                      <span className="absolute top-3 right-3 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white bg-gray-500 dark:bg-gray-600 shadow-sm z-10">
                        {card.badgeText}
                      </span>
                    )}
                    <div className="pointer-events-none grayscale opacity-80">
                      <HomeCardVisual id={card.id} />
                    </div>
                    <div className="relative mt-4 space-y-1">
                      <h2 className="font-heading text-lg font-bold leading-snug transition-colors duration-200 text-gray-500 dark:text-gray-400">
                        {card.title}
                      </h2>
                      <p className="text-sm leading-relaxed transition-colors duration-200 text-gray-400 dark:text-gray-500 line-clamp-3">
                        {card.description}
                      </p>
                    </div>
                  </div>
                );
              }

              return (
                <Link
                  key={card.id}
                  prefetch={true}
                  draggable={false}
                  onMouseEnter={() => {
                    if (isLoggedIn) {
                      if (card.href === "/ruang-belajar") preload("ruangBelajar", getRuangBelajarDataAction);
                      else if (card.href === "/ruang-automation") preload("instagramAutomation", getInstagramAutomationDataAction);
                    }
                  }}
                  onTouchStart={() => {
                    if (isLoggedIn) {
                      if (card.href === "/ruang-belajar") preload("ruangBelajar", getRuangBelajarDataAction);
                      else if (card.href === "/ruang-automation") preload("instagramAutomation", getInstagramAutomationDataAction);
                    }
                  }}
                  href={card.href}
                  className="group relative flex flex-col justify-start rounded-xl border-2 p-6 text-left transition-all duration-150 hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(0,0,0,0.25)] cursor-pointer z-0 overflow-hidden bg-white border-gray-200 hover:border-gray-300 dark:bg-[#141B31] dark:border-[#2C3246] dark:hover:border-[#3E4766] select-none"
                >
                  {card.showBadge && card.badgeText && (
                    <span className="absolute top-3 right-3 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white bg-orange-500 shadow-sm z-10">
                      {card.badgeText}
                    </span>
                  )}
                  <div className="pointer-events-none">
                    <HomeCardVisual id={card.id} />
                  </div>
                  <div className="relative mt-4 space-y-1">
                    <h2 className="font-heading text-lg font-bold leading-snug transition-colors duration-200 text-gray-900 dark:text-[#F3F4F6]">
                      {card.title}
                    </h2>
                    <p className="text-sm leading-relaxed transition-colors duration-200 text-gray-600 dark:text-[#9CA3AF] line-clamp-3">
                      {card.description}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </main>
      ) : (
        /* PRICING MODAL / SECTION */
        <main className="flex-1 flex flex-col items-center justify-center p-3 md:p-4 xl:px-6 text-center max-w-6xl mx-auto w-full py-4 md:py-6 animate-in fade-in zoom-in duration-300">
          <button
            onClick={handleClosePricing}
            className="group inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border border-amber-500/30 bg-amber-500/5 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 transition-colors mb-3"
          >
            <span className="mr-0.5 text-sm leading-none transition-transform duration-200 group-hover:-translate-x-0.5">&lsaquo;</span> PROMO
            hingga 95%{" "}
            <Flame
              className="w-3.5 h-3.5 text-amber-500"
              fill="currentColor"
            />
          </button>

          <h1
            className={`text-xl md:text-2xl xl:text-3xl font-extrabold font-heading mb-1 tracking-tight transition-colors duration-300 text-gray-900 dark:text-[#F3F4F6]`}
          >
            Pilih paket kamu
          </h1>
          <p
            className={`text-xs md:text-sm mb-4 transition-colors duration-300 text-gray-600 dark:text-[#9CA3AF]`}
          >
            Ambil kesempatan mumpung lagi diskon besar-besaran. Sekali bayar!
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3.5 xl:gap-4 w-full text-left">
            {[
              { key: "PRO_BOOK", type: "PRO_BOOK" },
              { key: "PRO_TOOLS", type: "PRO_TOOLS" },
              { key: "PRO_AUTOMATION", type: "PRO_AUTOMATION" },
              { key: "PRO_PLUS", type: "PRO_PLUS" }
            ].map(pkgItem => {
              const defaultPkg = {
                PRO_BOOK: {
                  name: "Paket PRO BOOK",
                  desc: "Cocok buat yang mau fokus belajar teori faceless creator.",
                  price: 99000,
                  originalPrice: 2419000,
                  discountLabel: "95% OFF",
                  highlightText: "",
                  features: ["Ebook Ngonten Pakai AI (Personal Use)", "Ebook 30 Day Creator Challenge (Personal Use)", "Bimbingan Private 1-on-1 WhatsApp (6 Bulan)", "6+ Bonus Strategi & Template Lainnya"]
                },
                PRO_TOOLS: {
                  name: "Paket Sistem Tools",
                  desc: "Cocok buat yang butuh bantuan AI untuk eksekusi ngonten.",
                  price: 99000,
                  originalPrice: 666000,
                  discountLabel: "85% OFF",
                  highlightText: "",
                  features: ["Akses 8 Sistem AI Ngonten Pakai AI", "Ebook Ngonten Pakai AI (Included)", "Bonus 4 Resource Ekstra (Footage, Hook, Tools)", "Akses Selama 30 Hari"]
                },
                PRO_AUTOMATION: {
                  name: "Paket Pro Automation",
                  desc: "Cocok buat yang ingin mengotomasi interaksi, auto DM & komentar Instagram 24/7.",
                  price: 99000,
                  originalPrice: 799000,
                  discountLabel: "88% OFF",
                  highlightText: "",
                  features: ["Koneksi Akun Instagram Bisnis & Creator", "Auto Balas Komentar Post & Reels Instan", "Auto Kirim Link / Kupon Diskon via DM", "Analitik Funnel Konversi Realtime", "Akses Selama 30 Hari"]
                },
                PRO_PLUS: {
                  name: "Paket Lengkap (Ebook)",
                  desc: "Bonus terbanyak, akses jualan (PLR) dan Lifetime support.",
                  price: 149000,
                  originalPrice: 2419000,
                  discountLabel: "94% OFF",
                  highlightText: "Paling Worth",
                  features: ["Semua isi Paket Basic & Tools", "Akses Penuh Instagram Automation", "Hak Jual Ulang (PLR) untuk berbagai materi", "Bimbingan Private 1-on-1 (Lifetime)", "Tools Text to Voice Over & Video Footage"]
                }
              };
              
              const pkgData = (pricingConfig && pricingConfig[pkgItem.key]) || defaultPkg[pkgItem.key as keyof typeof defaultPkg];
              const isLengkap = pkgItem.key === "PRO_PLUS";
              const hasHighlight = pkgData.highlightText && pkgData.highlightText.trim() !== "";
              
              const formatK = (p: number) => p >= 1000 ? (p / 1000) + 'k' : p.toString();

              return (
                <div key={pkgItem.key} className={`border rounded-2xl p-4.5 xl:p-5 flex flex-col justify-between relative transition-all duration-300 ${hasHighlight ? 'border-2 border-orange-500 transform xl:-translate-y-1 bg-white dark:bg-[#141B31] shadow-xl shadow-orange-500/10' : 'bg-white border-2 border-gray-200 dark:bg-[#141B31] dark:border-[#2C3246] hover:border-gray-300 dark:hover:border-orange-500/40'}`}>
                  <div>
                    {hasHighlight && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-widest whitespace-nowrap shadow-sm">
                        {pkgData.highlightText}
                      </div>
                    )}

                    <h3 className={`font-bold text-base xl:text-lg font-heading mb-1 transition-colors duration-300 text-gray-900 dark:text-[#F3F4F6] leading-tight`}>
                      {pkgData.name}
                    </h3>
                    <p className={`text-xs xl:text-[13px] mb-3 transition-colors duration-300 text-gray-600 dark:text-[#9CA3AF] line-clamp-2 leading-relaxed`}>
                      {pkgData.desc}
                    </p>

                    <div className="flex items-baseline gap-2 mb-1">
                      <span className={`text-2xl xl:text-3xl font-black transition-colors duration-300 text-gray-900 dark:text-[#F3F4F6] leading-tight`}>
                        Rp {formatK(pkgData.price)}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`text-xs transition-colors duration-300 text-gray-400 dark:text-[#9CA3AF]/60`}>
                        Total <span className="line-through">Rp {pkgData.originalPrice.toLocaleString('id-ID')}</span>
                      </span>
                      {pkgData.discountLabel && (
                        <span className="inline-block bg-red-500/15 text-red-500 text-[10px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider">
                          {pkgData.discountLabel}
                        </span>
                      )}
                    </div>

                    <div className="mt-3">
                      <ul className={`space-y-2 xl:space-y-2.5 text-xs xl:text-[13px] transition-colors duration-300 text-gray-700 dark:text-[#D1D5DB]`}>
                        {pkgData.features.map((f: string, i: number) => (
                          <li key={i} className={`flex gap-2 items-start leading-snug ${isLengkap && i === 0 ? 'font-bold text-gray-900 dark:text-white' : ''}`}>
                            <Check className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                            <span className="line-clamp-2">{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <Link 
                    prefetch={true} 
                    href={isLoggedIn ? `/checkout?type=${pkgItem.type}` : `/login?redirect=/checkout?type=${pkgItem.type}`}
                    onMouseEnter={() => { if (isLoggedIn) preload(["checkout", pkgItem.type, undefined], () => getCheckoutDetailsAction(pkgItem.type, undefined)) }}
                    onTouchStart={() => { if (isLoggedIn) preload(["checkout", pkgItem.type, undefined], () => getCheckoutDetailsAction(pkgItem.type, undefined)) }}
                    className={`w-full mt-4 xl:mt-5 block text-center font-bold text-xs xl:text-sm py-3 rounded-xl transition-all ${hasHighlight ? 'bg-orange-500 text-white font-bold hover:bg-orange-600 shadow-[0_0_20px_rgba(249,115,22,0.25)]' : 'bg-gray-900 hover:bg-orange-500 hover:text-white text-white dark:bg-[#2C3246] dark:hover:bg-orange-500 dark:hover:text-white dark:text-white'}`}
                  >
                    {pkgData.name.includes("Basic") || pkgData.name.includes("Book") || pkgData.name.includes("Ebook")
                      ? "Pilih Paket Ebook"
                      : pkgData.name.includes("Auto")
                      ? "Pilih Paket Automation"
                      : pkgData.name.includes("Tools")
                      ? "Pilih Sistem Tools"
                      : "Pilih Paket Lengkap"}
                  </Link>
                </div>
              );
            })}
          </div>
        </main>
      )}
    </>
  );
}

export default function HomePageClient({
  initialPricingConfig,
  initialCards,
}: {
  initialPricingConfig: any;
  initialCards?: HomepageCardConfig[];
}) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 dark:bg-rn-dark-bg" />}>
      <HomeContent initialPricingConfig={initialPricingConfig} initialCards={initialCards} />
    </Suspense>
  );
}
