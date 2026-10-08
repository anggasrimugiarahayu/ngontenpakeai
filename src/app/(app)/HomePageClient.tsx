"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { preload } from "swr";
import { getRuangBelajarDataAction } from "@/app/actions/ruangBelajar";
import { getCheckoutDetailsAction } from "@/app/actions/checkout";
import { redirect } from "next/navigation";
import { LayoutDashboard, UserCircle, Lightbulb, Camera, Calendar, BookOpen,
  Wrench,
  MessageCircle,
  FileText,
  Check,
  Copy,
  Flame,
  User,
  PlayCircle,
  Star,
  Zap,
  Moon,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTheme } from "next-themes";
import { useSession } from "next-auth/react";
import { Suspense } from "react";

function HomeContent({ initialPricingConfig }: { initialPricingConfig: any }) {
  const router = useRouter();
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user;
  const searchParams = useSearchParams();
  const showPricingParam = searchParams.get("pricing") === "true";
  const [showPricing, setShowPricing] = useState(showPricingParam);
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const pricingConfig = initialPricingConfig;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setShowPricing(showPricingParam);
  }, [showPricingParam]);

  const handleOpenPricing = () => {
    setShowPricing(true);
    router.push("/?pricing=true");
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("pricing-change", { detail: true }));
    }
  };

  const handleClosePricing = () => {
    setShowPricing(false);
    router.push("/");
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("pricing-change", { detail: false }));
    }
  };

  

  return (
    <>
      {/* MAIN CONTENT */}
      {!showPricing ? (
        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-5xl mx-auto w-full py-20">
          <button
            onClick={handleOpenPricing}
            className="group flex items-center gap-2 px-4 py-1.5 rounded-full font-bold text-[10px] uppercase tracking-widest mb-8 transition-colors border border-yellow-500/50 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-600 dark:border-yellow-500/30 dark:text-yellow-400"
          >
            <Flame
              className="w-3.5 h-3.5 text-yellow-500"
              fill="currentColor"
            />
            PROMO hingga 95%{" "}
            <span className="ml-1 text-base leading-none transition-transform duration-300 group-hover:translate-x-1 group-active:translate-x-2">&rsaquo;</span>
          </button>

          <h1
            className={`text-4xl md:text-5xl font-bold font-heading mb-8 md:mb-10 tracking-tight transition-colors duration-300 text-gray-900 dark:text-white`}
          >
            Mau mulai dari mana hari ini?
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
            {/* EBOOK CARD */}
            <Link
              prefetch={true}
              onMouseEnter={() => { if (isLoggedIn) preload("ruangBelajar", getRuangBelajarDataAction) }}
              onTouchStart={() => { if (isLoggedIn) preload("ruangBelajar", getRuangBelajarDataAction) }}
              href="/ruang-belajar"
              className={`group relative flex flex-col justify-start rounded-xl border-2 p-6 text-left transition-all duration-300 hover:shadow-xl hover:-translate-y-1.5 cursor-pointer z-0 overflow-hidden bg-white border-gray-200 hover:border-rn-orange shadow-gray-200 dark:bg-[#18181b] dark:border-white/5 dark:hover:border-rn-orange/50 dark:shadow-black/50`}
            >
              <span className="absolute top-3 right-3 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white bg-orange-500 shadow-sm z-10">
                Update Baru
              </span>
              <div className="relative w-full overflow-hidden aspect-[16/9] rounded-lg">
                <div
                  data-active="true"
                  className={`iso-stage pointer-events-none absolute -z-10 aspect-[1642/1200] max-w-none -translate-x-1/2 -translate-y-1/2 transition-transform duration-700 ease-out group-hover:scale-[1.05] text-gray-600 dark:text-gray-400`}
                  style={{ top: "50%", left: "50%", width: "290%" }}
                >
                  <svg viewBox="0 0 1642 1200" className="size-full" aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><g strokeOpacity="0.18" strokeWidth="3" strokeDasharray="3 14"><line x1="21" y1="0" x2="21" y2="1200"></line><line x1="101" y1="0" x2="101" y2="1200"></line><line x1="181" y1="0" x2="181" y2="1200"></line><line x1="261" y1="0" x2="261" y2="1200"></line><line x1="341" y1="0" x2="341" y2="1200"></line><line x1="421" y1="0" x2="421" y2="1200"></line><line x1="501" y1="0" x2="501" y2="1200"></line><line x1="581" y1="0" x2="581" y2="1200"></line><line x1="661" y1="0" x2="661" y2="1200"></line><line x1="741" y1="0" x2="741" y2="1200"></line><line x1="821" y1="0" x2="821" y2="1200"></line><line x1="901" y1="0" x2="901" y2="1200"></line><line x1="981" y1="0" x2="981" y2="1200"></line><line x1="1061" y1="0" x2="1061" y2="1200"></line><line x1="1141" y1="0" x2="1141" y2="1200"></line><line x1="1221" y1="0" x2="1221" y2="1200"></line><line x1="1301" y1="0" x2="1301" y2="1200"></line><line x1="1381" y1="0" x2="1381" y2="1200"></line><line x1="1461" y1="0" x2="1461" y2="1200"></line><line x1="1541" y1="0" x2="1541" y2="1200"></line><line x1="1621" y1="0" x2="1621" y2="1200"></line><line x1="0" y1="40" x2="1642" y2="40"></line><line x1="0" y1="120" x2="1642" y2="120"></line><line x1="0" y1="200" x2="1642" y2="200"></line><line x1="0" y1="280" x2="1642" y2="280"></line><line x1="0" y1="360" x2="1642" y2="360"></line><line x1="0" y1="440" x2="1642" y2="440"></line><line x1="0" y1="520" x2="1642" y2="520"></line><line x1="0" y1="600" x2="1642" y2="600"></line><line x1="0" y1="680" x2="1642" y2="680"></line><line x1="0" y1="760" x2="1642" y2="760"></line><line x1="0" y1="840" x2="1642" y2="840"></line><line x1="0" y1="920" x2="1642" y2="920"></line><line x1="0" y1="1000" x2="1642" y2="1000"></line><line x1="0" y1="1080" x2="1642" y2="1080"></line><line x1="0" y1="1160" x2="1642" y2="1160"></line></g><g transform="translate(821 600)"><g transform="translate(-12 0)"><g className="sc-rise-10"><circle cx="-200" cy="-22" r="30" fill="currentColor" fillOpacity="0.06" strokeOpacity="0.75" strokeWidth="5"></circle><path d="M-212 -22 L-206 -33 L-200 -19 L-194 -33 L-188 -22" strokeWidth="5" strokeOpacity="0.8" className="sc-draw-50" pathLength="1" strokeDasharray="1" strokeDashoffset="1"></path><rect x="-212" y="6" width="24" height="15" rx="3" fill="currentColor" fillOpacity="0.12" strokeOpacity="0.7" strokeWidth="4"></rect><line x1="-206" y1="25" x2="-194" y2="25" strokeWidth="5" strokeOpacity="0.6"></line><g className="sc-pop-90"><path d="M-200 -60 L-200 -74" strokeWidth="6" strokeOpacity="0.7"></path></g><g className="sc-pop-105"><path d="M-226 -44 L-236 -54" strokeWidth="6" strokeOpacity="0.7"></path></g><g className="sc-pop-120"><path d="M-174 -44 L-164 -54" strokeWidth="6" strokeOpacity="0.7"></path></g></g><g className="sc-rise-150"><g transform="translate(-160 -10)"><g className="sc-flow" style={{ animationDelay: '' }}><path d="M0 -12 L11 0 L0 12" strokeWidth="7" strokeOpacity="0.8"></path></g></g><g transform="translate(-144 -10)"><g className="sc-flow" style={{ animationDelay: '' }}><path d="M0 -12 L11 0 L0 12" strokeWidth="7" strokeOpacity="0.8"></path></g></g><g transform="translate(-128 -10)"><g className="sc-flow" style={{ animationDelay: '' }}><path d="M0 -12 L11 0 L0 12" strokeWidth="7" strokeOpacity="0.8"></path></g></g></g><g className="sc-rise-180"><rect x="-95" y="-100" width="210" height="190" rx="16" fill="currentColor" fillOpacity="0.05" strokeOpacity="0.7" strokeWidth="5"></rect><g className="sc-pop-210"><text x="-70" y="-70" fontSize="24" fontWeight="700" fill="currentColor" fillOpacity="0.85" stroke="none" dominantBaseline="central" letterSpacing="0.68">FACELESS</text></g><line x1="78" y1="-70" x2="110" y2="-70" strokeWidth="11" strokeOpacity="0.3" className="sc-draw-230" pathLength="1" strokeDasharray="1" strokeDashoffset="1"></line><line x1="-70" y1="-44" x2="90" y2="-44" strokeWidth="3" strokeOpacity="0.35" className="sc-draw-250" pathLength="1" strokeDasharray="1" strokeDashoffset="1"></line><line x1="-70" y1="-18" x2="55" y2="-18" strokeWidth="10" strokeOpacity="0.6" className="sc-draw-280" pathLength="1" strokeDasharray="1" strokeDashoffset="1"></line><line x1="-70" y1="8" x2="85" y2="8" strokeWidth="10" strokeOpacity="0.6" className="sc-draw-305" pathLength="1" strokeDasharray="1" strokeDashoffset="1"></line><line x1="-70" y1="34" x2="35" y2="34" strokeWidth="10" strokeOpacity="0.6" className="sc-draw-330" pathLength="1" strokeDasharray="1" strokeDashoffset="1"></line></g><g className="sc-rise-360"><rect x="75" y="-50" width="190" height="150" rx="16" className="fill-white dark:fill-[#18181b]" strokeOpacity="0.8" strokeWidth="5"></rect><rect x="69" y="-56" width="12" height="12" fill="currentColor" stroke="none" opacity="0.85"></rect><rect x="259" y="-56" width="12" height="12" fill="currentColor" stroke="none" opacity="0.85"></rect><rect x="259" y="94" width="12" height="12" fill="currentColor" stroke="none" opacity="0.85"></rect><rect x="69" y="94" width="12" height="12" fill="currentColor" stroke="none" opacity="0.85"></rect><g className="sc-pop-390"><text x="95" y="-24" fontSize="28" fontWeight="600" fill="currentColor" fillOpacity="0.6" stroke="none" dominantBaseline="central" letterSpacing="0.56">Cuan</text></g><g><line x1="128" y1="4" x2="210" y2="4" strokeWidth="10" strokeOpacity="0.65" className="sc-draw-395" pathLength="1" strokeDasharray="1" strokeDashoffset="1"></line><g transform="translate(107 4)"><g className="sc-pop-410"><rect x="-11" y="-11" width="22" height="22" rx="6" strokeOpacity="0.55" strokeWidth="4"></rect></g><g className="sc-pop-490"><rect x="-11" y="-11" width="22" height="22" rx="6" fill="oklch(0.75 0.13 150)" fillOpacity="0.18" stroke="oklch(0.75 0.13 150)" strokeOpacity="0.95" strokeWidth="4"></rect><path d="M-6 0 L-2 4 L7 -5" stroke="oklch(0.75 0.13 150)" strokeWidth="5"></path></g></g></g><g><line x1="128" y1="34" x2="240" y2="34" strokeWidth="10" strokeOpacity="0.65" className="sc-draw-415" pathLength="1" strokeDasharray="1" strokeDashoffset="1"></line><g transform="translate(107 34)"><g className="sc-pop-430"><rect x="-11" y="-11" width="22" height="22" rx="6" strokeOpacity="0.55" strokeWidth="4"></rect></g><g className="sc-pop-530"><rect x="-11" y="-11" width="22" height="22" rx="6" fill="oklch(0.75 0.13 150)" fillOpacity="0.18" stroke="oklch(0.75 0.13 150)" strokeOpacity="0.95" strokeWidth="4"></rect><path d="M-6 0 L-2 4 L7 -5" stroke="oklch(0.75 0.13 150)" strokeWidth="5"></path></g></g></g><g><line x1="128" y1="64" x2="188" y2="64" strokeWidth="10" strokeOpacity="0.65" className="sc-draw-435" pathLength="1" strokeDasharray="1" strokeDashoffset="1"></line><g transform="translate(107 64)"><g className="sc-pop-450"><rect x="-11" y="-11" width="22" height="22" rx="6" strokeOpacity="0.55" strokeWidth="4"></rect></g><g className="sc-pop-570"><rect x="-11" y="-11" width="22" height="22" rx="6" fill="oklch(0.75 0.13 150)" fillOpacity="0.18" stroke="oklch(0.75 0.13 150)" strokeOpacity="0.95" strokeWidth="4"></rect><path d="M-6 0 L-2 4 L7 -5" stroke="oklch(0.75 0.13 150)" strokeWidth="5"></path></g></g></g></g></g></g></svg>
                </div>
              </div>
              <div className="relative mt-4 space-y-1">
                <h2
                  className={`font-heading text-lg font-bold leading-snug transition-colors duration-300 text-gray-900 dark:text-white`}
                >
                  Ruang Belajar
                </h2>
                <p
                  className={`text-sm leading-relaxed transition-colors duration-300 text-gray-600 dark:text-gray-400`}
                >
                  Dari dasar sampai strategi, pelajari ilmu yang kamu butuhkan untuk ngonten lebih terarah.
                </p>
              </div>
            </Link>

            {/* TOOLS CARD */}
            <Link prefetch={true}
              href="/ruang-ngonten"
              className={`group relative flex flex-col justify-start rounded-xl border-2 p-6 text-left transition-all duration-300 hover:shadow-xl hover:-translate-y-1.5 cursor-pointer z-0 overflow-hidden bg-white border-gray-200 hover:border-rn-accent shadow-gray-200 dark:bg-[#18181b] dark:border-white/5 dark:hover:border-rn-accent/50 dark:shadow-black/50`}
            >

              <div className="relative w-full overflow-hidden aspect-[16/9] rounded-lg">
                <div
                  data-active="true"
                  className={`iso-stage pointer-events-none absolute -z-10 aspect-[1642/1200] max-w-none -translate-x-1/2 -translate-y-1/2 transition-transform duration-700 ease-out group-hover:scale-[1.05] text-gray-600 dark:text-gray-400 w-[200%] md:w-[270%]`}
                  style={{ top: "45%", left: "50%" }}
                >
                  <svg viewBox="0 0 1642 1200" className="size-full" aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><g strokeOpacity="0.18" strokeWidth="3" strokeDasharray="3 14"><line x1="21" y1="0" x2="21" y2="1200"></line><line x1="101" y1="0" x2="101" y2="1200"></line><line x1="181" y1="0" x2="181" y2="1200"></line><line x1="261" y1="0" x2="261" y2="1200"></line><line x1="341" y1="0" x2="341" y2="1200"></line><line x1="421" y1="0" x2="421" y2="1200"></line><line x1="501" y1="0" x2="501" y2="1200"></line><line x1="581" y1="0" x2="581" y2="1200"></line><line x1="661" y1="0" x2="661" y2="1200"></line><line x1="741" y1="0" x2="741" y2="1200"></line><line x1="821" y1="0" x2="821" y2="1200"></line><line x1="901" y1="0" x2="901" y2="1200"></line><line x1="981" y1="0" x2="981" y2="1200"></line><line x1="1061" y1="0" x2="1061" y2="1200"></line><line x1="1141" y1="0" x2="1141" y2="1200"></line><line x1="1221" y1="0" x2="1221" y2="1200"></line><line x1="1301" y1="0" x2="1301" y2="1200"></line><line x1="1381" y1="0" x2="1381" y2="1200"></line><line x1="1461" y1="0" x2="1461" y2="1200"></line><line x1="1541" y1="0" x2="1541" y2="1200"></line><line x1="1621" y1="0" x2="1621" y2="1200"></line><line x1="0" y1="40" x2="1642" y2="40"></line><line x1="0" y1="120" x2="1642" y2="120"></line><line x1="0" y1="200" x2="1642" y2="200"></line><line x1="0" y1="280" x2="1642" y2="280"></line><line x1="0" y1="360" x2="1642" y2="360"></line><line x1="0" y1="440" x2="1642" y2="440"></line><line x1="0" y1="520" x2="1642" y2="520"></line><line x1="0" y1="600" x2="1642" y2="600"></line><line x1="0" y1="680" x2="1642" y2="680"></line><line x1="0" y1="760" x2="1642" y2="760"></line><line x1="0" y1="840" x2="1642" y2="840"></line><line x1="0" y1="920" x2="1642" y2="920"></line><line x1="0" y1="1000" x2="1642" y2="1000"></line><line x1="0" y1="1080" x2="1642" y2="1080"></line><line x1="0" y1="1160" x2="1642" y2="1160"></line></g><g transform="translate(821 600)">
  <g transform="translate(-138 -110)">
    <g className="sc-pop-15">
      <rect x="-25" y="-25" width="50" height="50" rx="15" fill="currentColor" fillOpacity="0.05" strokeOpacity="0.45" strokeWidth="4"></rect>
      <LayoutDashboard x="-12" y="-12" width="24" height="24" strokeWidth="2" stroke="currentColor" fill="none" opacity="0.8" />
    </g>
  </g>
  <g transform="translate(-46 -110)">
    <g className="sc-pop-30">
      <rect x="-25" y="-25" width="50" height="50" rx="15" fill="currentColor" fillOpacity="0.05" strokeOpacity="0.45" strokeWidth="4"></rect>
      <UserCircle x="-12" y="-12" width="24" height="24" strokeWidth="2" stroke="currentColor" fill="none" opacity="0.8" />
    </g>
  </g>
  <g transform="translate(46 -110)">
    <g className="sc-pop-45">
      <rect x="-25" y="-25" width="50" height="50" rx="15" fill="currentColor" fillOpacity="0.05" strokeOpacity="0.45" strokeWidth="4"></rect>
      <Lightbulb x="-12" y="-12" width="24" height="24" strokeWidth="2" stroke="currentColor" fill="none" opacity="0.8" />
    </g>
  </g>
  <g transform="translate(138 -110)">
    <g className="sc-pop-60">
      <rect x="-25" y="-25" width="50" height="50" rx="15" fill="currentColor" fillOpacity="0.05" strokeOpacity="0.45" strokeWidth="4"></rect>
      <FileText x="-12" y="-12" width="24" height="24" strokeWidth="2" stroke="currentColor" fill="none" opacity="0.8" />
    </g>
  </g>
  <g transform="translate(-138 -45)">
    <g className="sc-pop-72">
      <rect x="-25" y="-25" width="50" height="50" rx="15" fill="currentColor" fillOpacity="0.05" strokeOpacity="0.45" strokeWidth="4"></rect>
      <Copy x="-12" y="-12" width="24" height="24" strokeWidth="2" stroke="currentColor" fill="none" opacity="0.8" />
    </g>
  </g>
  <g transform="translate(-46 -45)">
    <g className="sc-pop-84">
      <rect x="-25" y="-25" width="50" height="50" rx="15" fill="currentColor" fillOpacity="0.05" strokeOpacity="0.45" strokeWidth="4"></rect>
      <Camera x="-12" y="-12" width="24" height="24" strokeWidth="2" stroke="currentColor" fill="none" opacity="0.8" />
    </g>
  </g>
  <g transform="translate(46 -45)">
    <g className="sc-pop-90">
      <rect x="-25" y="-25" width="50" height="50" rx="15" fill="currentColor" fillOpacity="0.05" strokeOpacity="0.45" strokeWidth="4"></rect>
      <BookOpen x="-12" y="-12" width="24" height="24" strokeWidth="2" stroke="currentColor" fill="none" opacity="0.8" />
    </g>
  </g>
  <g transform="translate(138 -45)">
    <g className="sc-pop-105">
      <rect x="-25" y="-25" width="50" height="50" rx="15" fill="currentColor" fillOpacity="0.05" strokeOpacity="0.45" strokeWidth="4"></rect>
      <Calendar x="-12" y="-12" width="24" height="24" strokeWidth="2" stroke="currentColor" fill="none" opacity="0.8" />
    </g>
  </g>
  <g className="sc-ring-8">
    <rect x="-29" y="-29" width="58" height="58" rx="18" fill="oklch(0.78 0.15 45)" fillOpacity="0.1" stroke="oklch(0.78 0.15 45)" strokeOpacity="0.95" strokeWidth="5"></rect>
  </g>
  <defs><clipPath id="home-v2-chat-viewport"><rect x="-272" y="10" width="544" height="200"></rect></clipPath></defs>
  <g clipPath="url(#home-v2-chat-viewport)">
    <g transform="translate(0 -10)">
      <g className="sc-scroll">
        <g className="sc-rise-250">
          <path d="M 114 24 H 236 a 14 14 0 0 1 14 14 V 56 H 114 a 14 14 0 0 1 -14 -14 V 38 a 14 14 0 0 1 14 -14 Z" fill="currentColor" fillOpacity="0.08" stroke="currentColor" strokeOpacity="0.6" strokeWidth="5"></path>
          <g><line x1="120" y1="40" x2="230" y2="40" strokeWidth="9" strokeOpacity="0.55" className="sc-draw-270" pathLength="1" strokeDasharray="1" strokeDashoffset="1"></line></g>
        </g>
        <g className="sc-rise-300">
          <path d="M -236 66 H 16 a 14 14 0 0 1 14 14 V 106 a 14 14 0 0 1 -14 14 H -250 V 80 a 14 14 0 0 1 14 -14 Z" fill="currentColor" fillOpacity="0.12" stroke="currentColor" strokeOpacity="0.95" strokeWidth="5"></path>
          <g><line x1="-230" y1="84" x2="10" y2="84" strokeWidth="9" strokeOpacity="0.7" className="sc-draw-320" pathLength="1" strokeDasharray="1" strokeDashoffset="1"></line></g>
          <g><line x1="-230" y1="106" x2="-60" y2="106" strokeWidth="9" strokeOpacity="0.7" className="sc-draw-340" pathLength="1" strokeDasharray="1" strokeDashoffset="1"></line></g>
        </g>
        <g className="sc-rise-370">
          <path d="M 164 130 H 236 a 14 14 0 0 1 14 14 V 162 H 164 a 14 14 0 0 1 -14 -14 V 144 a 14 14 0 0 1 14 -14 Z" fill="currentColor" fillOpacity="0.08" stroke="currentColor" strokeOpacity="0.6" strokeWidth="5"></path>
          <g><line x1="170" y1="146" x2="230" y2="146" strokeWidth="9" strokeOpacity="0.55" className="sc-draw-390" pathLength="1" strokeDasharray="1" strokeDashoffset="1"></line></g>
        </g>
        <g className="sc-rise-420">
          <path d="M -236 172 H 36 a 14 14 0 0 1 14 14 V 298 a 14 14 0 0 1 -14 14 H -250 V 186 a 14 14 0 0 1 14 -14 Z" fill="currentColor" fillOpacity="0.12" stroke="currentColor" strokeOpacity="0.95" strokeWidth="5"></path>
          <g><line x1="-230" y1="194" x2="-110" y2="194" strokeWidth="12" strokeOpacity="0.85" className="sc-draw-470" pathLength="1" strokeDasharray="1" strokeDashoffset="1"></line></g>
          <g><line x1="-230" y1="210" x2="30" y2="210" strokeWidth="2" strokeOpacity="0.25" className="sc-draw-490" pathLength="1" strokeDasharray="1" strokeDashoffset="1"></line></g>
          <g><line x1="-210" y1="228" x2="30" y2="228" strokeWidth="9" strokeOpacity="0.7" className="sc-draw-510" pathLength="1" strokeDasharray="1" strokeDashoffset="1"></line>
             <g transform="translate(-226 228)"><g className="sc-pop-510"><circle r="4.5" fill="oklch(0.78 0.15 45)" stroke="none"></circle></g></g>
          </g>
          <g><line x1="-210" y1="250" x2="-50" y2="250" strokeWidth="9" strokeOpacity="0.7" className="sc-draw-540" pathLength="1" strokeDasharray="1" strokeDashoffset="1"></line>
             <g transform="translate(-226 250)"><g className="sc-pop-540"><circle r="4.5" fill="oklch(0.78 0.15 45)" stroke="none"></circle></g></g>
          </g>
          <g><line x1="-210" y1="272" x2="10" y2="272" strokeWidth="9" strokeOpacity="0.7" className="sc-draw-570" pathLength="1" strokeDasharray="1" strokeDashoffset="1"></line>
             <g transform="translate(-226 272)"><g className="sc-pop-570"><circle r="4.5" fill="oklch(0.78 0.15 45)" stroke="none"></circle></g></g>
          </g>
          <g><line x1="-230" y1="294" x2="-130" y2="294" strokeWidth="7" strokeOpacity="0.45" className="sc-draw-600" pathLength="1" strokeDasharray="1" strokeDashoffset="1"></line></g>
        </g>
      </g>
    </g>
  </g>
</g></svg>
                </div>
              </div>
              <div className="relative mt-4 space-y-1">
                <h2
                  className={`font-heading text-lg font-bold leading-snug transition-colors duration-300 text-gray-900 dark:text-white`}
                >
                  Ruang Ngonten
                </h2>
                <p
                  className={`text-sm leading-relaxed transition-colors duration-300 text-gray-600 dark:text-gray-400`}
                >
                  Dari ide sampai jadi konten, kerjakan semuanya lebih cepat dengan bantuan AI.
                </p>
              </div>
            </Link>

            {/* E-LEARNING CARD */}
            {/* E-LEARNING CARD */}
            <div
              className={`group relative flex flex-col justify-start rounded-xl border-2 p-6 text-left transition-all duration-300 hover:shadow-xl hover:-translate-y-1.5 cursor-not-allowed z-0 overflow-hidden bg-white border-gray-200 shadow-gray-200 hover:border-purple-400 dark:bg-[#18181b] dark:border-white/5 dark:shadow-black/50 dark:hover:border-purple-500/50`}
            >
              <span className="absolute top-3 right-3 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white bg-[#d97706] shadow-sm z-10" style={{ backgroundColor: "#f97316" }}>
                Coming Soon
              </span>

              <div className="relative w-full overflow-hidden aspect-[16/9] rounded-lg">
                <div
                  data-active="true"
                  className={`iso-stage pointer-events-none absolute -z-10 aspect-[1642/1200] max-w-none -translate-x-1/2 -translate-y-1/2 transition-transform duration-700 ease-out group-hover:scale-[1.05] text-gray-600 dark:text-gray-400`}
                  style={{ top: "50%", left: "50%", width: "300%" }}
                >
                  <svg viewBox="0 0 1642 1200" className="size-full" aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><g strokeOpacity="0.18" strokeWidth="3" strokeDasharray="3 14"><line x1="21" y1="0" x2="21" y2="1200"></line><line x1="101" y1="0" x2="101" y2="1200"></line><line x1="181" y1="0" x2="181" y2="1200"></line><line x1="261" y1="0" x2="261" y2="1200"></line><line x1="341" y1="0" x2="341" y2="1200"></line><line x1="421" y1="0" x2="421" y2="1200"></line><line x1="501" y1="0" x2="501" y2="1200"></line><line x1="581" y1="0" x2="581" y2="1200"></line><line x1="661" y1="0" x2="661" y2="1200"></line><line x1="741" y1="0" x2="741" y2="1200"></line><line x1="821" y1="0" x2="821" y2="1200"></line><line x1="901" y1="0" x2="901" y2="1200"></line><line x1="981" y1="0" x2="981" y2="1200"></line><line x1="1061" y1="0" x2="1061" y2="1200"></line><line x1="1141" y1="0" x2="1141" y2="1200"></line><line x1="1221" y1="0" x2="1221" y2="1200"></line><line x1="1301" y1="0" x2="1301" y2="1200"></line><line x1="1381" y1="0" x2="1381" y2="1200"></line><line x1="1461" y1="0" x2="1461" y2="1200"></line><line x1="1541" y1="0" x2="1541" y2="1200"></line><line x1="1621" y1="0" x2="1621" y2="1200"></line><line x1="0" y1="40" x2="1642" y2="40"></line><line x1="0" y1="120" x2="1642" y2="120"></line><line x1="0" y1="200" x2="1642" y2="200"></line><line x1="0" y1="280" x2="1642" y2="280"></line><line x1="0" y1="360" x2="1642" y2="360"></line><line x1="0" y1="440" x2="1642" y2="440"></line><line x1="0" y1="520" x2="1642" y2="520"></line><line x1="0" y1="600" x2="1642" y2="600"></line><line x1="0" y1="680" x2="1642" y2="680"></line><line x1="0" y1="760" x2="1642" y2="760"></line><line x1="0" y1="840" x2="1642" y2="840"></line><line x1="0" y1="920" x2="1642" y2="920"></line><line x1="0" y1="1000" x2="1642" y2="1000"></line><line x1="0" y1="1080" x2="1642" y2="1080"></line><line x1="0" y1="1160" x2="1642" y2="1160"></line></g><g transform="translate(821 600)"><g className="sc-rise-20"><rect x="-235" y="-108" width="470" height="216" rx="18" fill="currentColor" fillOpacity="0.04" strokeOpacity="0.7" strokeWidth="5"></rect><line x1="-235" y1="-80" x2="235" y2="-80" strokeWidth="3" strokeOpacity="0.28"></line><g transform="translate(-216 -94)"><g className="sc-pop-60"><circle r="4.5" fill="currentColor" fillOpacity="0.5" stroke="none"></circle></g></g><g transform="translate(-201 -94)"><g className="sc-pop-72"><circle r="4.5" fill="currentColor" fillOpacity="0.5" stroke="none"></circle></g></g><g transform="translate(-186 -94)"><g className="sc-pop-84"><circle r="4.5" fill="currentColor" fillOpacity="0.5" stroke="none"></circle></g></g><line x1="-161" y1="-94" x2="-51" y2="-94" strokeWidth="11" strokeOpacity="0.18" className="sc-draw-90" pathLength="1" strokeDasharray="1" strokeDashoffset="1"></line></g><g className="sc-ghost-115-250"><rect x="-228" y="-68" width="64" height="166" rx="10" fill="currentColor" fillOpacity="0.03" strokeOpacity="0.38" strokeWidth="3" strokeDasharray="10 8"></rect></g><g className="sc-ghost-130-280"><rect x="-137" y="-67" width="372" height="26" rx="10" fill="currentColor" fillOpacity="0.03" strokeOpacity="0.38" strokeWidth="3" strokeDasharray="10 8"></rect></g><g className="sc-ghost-145-330"><rect x="-137" y="-28" width="152" height="112" rx="10" fill="currentColor" fillOpacity="0.03" strokeOpacity="0.38" strokeWidth="3" strokeDasharray="10 8"></rect><g strokeOpacity="0.2" strokeWidth="2.5" strokeDasharray="8 7"><line x1="-137" y1="-28" x2="15" y2="84"></line><line x1="15" y1="-28" x2="-137" y2="84"></line></g></g><g className="sc-ghost-160-400"><rect x="35" y="-28" width="182" height="112" rx="10" fill="currentColor" fillOpacity="0.03" strokeOpacity="0.38" strokeWidth="3" strokeDasharray="10 8"></rect><g strokeOpacity="0.2" strokeWidth="2.5" strokeDasharray="8 7"><line x1="35" y1="-28" x2="217" y2="84"></line><line x1="217" y1="-28" x2="35" y2="84"></line></g></g><g className="sc-rise-250"><line x1="-157" y1="-80" x2="-157" y2="108" strokeWidth="3" strokeOpacity="0.28"></line><g className="sc-pop-270"><rect x="-223" y="-66" width="30" height="20" rx="5" fill="currentColor" fillOpacity="0.18" strokeOpacity="0.5" strokeWidth="3"></rect></g><line x1="-223" y1="-30" x2="-178" y2="-30" strokeWidth="7" strokeOpacity="0.45" className="sc-draw-285" pathLength="1" strokeDasharray="1" strokeDashoffset="1"></line><line x1="-223" y1="-8" x2="-190" y2="-8" strokeWidth="7" strokeOpacity="0.45" className="sc-draw-295" pathLength="1" strokeDasharray="1" strokeDashoffset="1"></line><line x1="-223" y1="14" x2="-174" y2="14" strokeWidth="7" strokeOpacity="0.45" className="sc-draw-305" pathLength="1" strokeDasharray="1" strokeDashoffset="1"></line><line x1="-223" y1="36" x2="-196" y2="36" strokeWidth="7" strokeOpacity="0.45" className="sc-draw-315" pathLength="1" strokeDasharray="1" strokeDashoffset="1"></line><line x1="-223" y1="58" x2="-184" y2="58" strokeWidth="7" strokeOpacity="0.45" className="sc-draw-325" pathLength="1" strokeDasharray="1" strokeDashoffset="1"></line></g><line x1="-137" y1="-54" x2="-45" y2="-54" strokeWidth="12" strokeOpacity="0.8" className="sc-draw-280" pathLength="1" strokeDasharray="1" strokeDashoffset="1"></line><g transform="translate(188 -54)"><g className="sc-pop-295"><rect x="-31" y="-9" width="62" height="18" rx="9" fill="currentColor" fillOpacity="0.3" stroke="none"></rect></g></g><g className="sc-rise-330"><rect x="-137" y="-28" width="152" height="112" rx="12" fill="currentColor" fillOpacity="0.04" strokeOpacity="0.5" strokeWidth="4"></rect><line x1="-122" y1="-12" x2="-74" y2="-12" strokeWidth="7" strokeOpacity="0.4" className="sc-draw-350" pathLength="1" strokeDasharray="1" strokeDashoffset="1"></line><line x1="-122" y1="10" x2="-18" y2="10" strokeWidth="13" strokeOpacity="0.16" className="sc-draw-370" pathLength="1" strokeDasharray="1" strokeDashoffset="1"></line><line x1="-122" y1="36" x2="-18" y2="36" strokeWidth="13" strokeOpacity="0.16" className="sc-draw-390" pathLength="1" strokeDasharray="1" strokeDashoffset="1"></line><g transform="translate(-86 66)"><g className="sc-pop-410"><rect x="-36" y="-8.5" width="72" height="17" rx="8.5" fill="oklch(0.76 0.14 300)" stroke="none"></rect></g></g></g><g className="sc-rise-400"><rect x="35" y="-28" width="182" height="112" rx="12" fill="currentColor" fillOpacity="0.04" strokeOpacity="0.5" strokeWidth="4"></rect><line x1="130" y1="-2" x2="130" y2="76" strokeWidth="2.5" strokeOpacity="0.2"></line><line x1="51" y1="-10" x2="201" y2="-10" strokeWidth="3" strokeOpacity="0.3" className="sc-draw-420" pathLength="1" strokeDasharray="1" strokeDashoffset="1"></line><g><line x1="51" y1="8" x2="114" y2="8" strokeWidth="9" strokeOpacity="0.5" className="sc-draw-445" pathLength="1" strokeDasharray="1" strokeDashoffset="1"></line><line x1="142" y1="8" x2="196" y2="8" strokeWidth="9" strokeOpacity="0.28" className="sc-draw-445" pathLength="1" strokeDasharray="1" strokeDashoffset="1"></line></g><g><line x1="51" y1="30" x2="104" y2="30" strokeWidth="9" strokeOpacity="0.5" className="sc-draw-460" pathLength="1" strokeDasharray="1" strokeDashoffset="1"></line><line x1="142" y1="30" x2="188" y2="30" strokeWidth="9" strokeOpacity="0.28" className="sc-draw-460" pathLength="1" strokeDasharray="1" strokeDashoffset="1"></line></g><g><line x1="51" y1="52" x2="120" y2="52" strokeWidth="9" strokeOpacity="0.5" className="sc-draw-475" pathLength="1" strokeDasharray="1" strokeDashoffset="1"></line><line x1="142" y1="52" x2="200" y2="52" strokeWidth="9" strokeOpacity="0.28" className="sc-draw-475" pathLength="1" strokeDasharray="1" strokeDashoffset="1"></line></g><g><line x1="51" y1="74" x2="97" y2="74" strokeWidth="9" strokeOpacity="0.5" className="sc-draw-490" pathLength="1" strokeDasharray="1" strokeDashoffset="1"></line><line x1="142" y1="74" x2="180" y2="74" strokeWidth="9" strokeOpacity="0.28" className="sc-draw-490" pathLength="1" strokeDasharray="1" strokeDashoffset="1"></line></g></g><g transform="translate(215 -94)"><g className="sc-pop-540"><circle r="13" fill="oklch(0.76 0.14 300)" stroke="none"></circle><path d="M-5.5 0 L-2 3.5 L6.5 -4.5" stroke="var(--card)" strokeWidth="4" fill="none"></path></g></g></g></svg>
                </div>
              </div>
              <div className="relative mt-4 space-y-1">
                <h2
                  className={`font-heading text-lg font-bold leading-snug transition-colors duration-300 text-gray-900 dark:text-white`}
                >
                  Ruang Growing
                </h2>
                <p
                  className={`text-sm leading-relaxed transition-colors duration-300 text-gray-600 dark:text-gray-400`}
                >
                  Dari konten sampai sistem, bangun aset dan strategi untuk mengembangkan hasilmu.
                </p>
              </div>
            </div>

            </div>
        </main>
      ) : (
        /* PRICING MODAL / SECTION */
        <main className="flex-1 flex flex-col items-center p-4 md:p-6 text-center max-w-5xl mx-auto w-full py-6 md:py-8 animate-in fade-in zoom-in duration-300">
          <button
            onClick={handleClosePricing}
            className="group flex items-center gap-2 px-4 py-1.5 rounded-full font-bold text-[10px] uppercase tracking-widest mb-4 transition-colors border border-yellow-500/50 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-600 dark:border-yellow-500/30 dark:text-yellow-400"
          >
            <span className="mr-1 text-base leading-none transition-transform duration-300 group-hover:-translate-x-1 group-active:-translate-x-2">&lsaquo;</span> PROMO
            hingga 95%{" "}
            <Flame
              className="w-3.5 h-3.5 text-yellow-500"
              fill="currentColor"
            />
          </button>

          <h1
            className={`text-2xl md:text-4xl font-black font-heading mb-2 tracking-tight transition-colors duration-300 text-gray-900 dark:text-white`}
          >
            Pilih paket kamu
          </h1>
          <p
            className={`text-xs md:text-sm mb-6 md:mb-8 transition-colors duration-300 text-gray-600 dark:text-gray-400`}
          >
            Ambil kesempatan mumpung lagi diskon besar-besaran. Sekali bayar!
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full text-left">
            {[
              { key: "PRO_BOOK", type: "PRO_BOOK" },
              { key: "PRO_TOOLS", type: "PRO_TOOLS" },
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
                  features: ["Akses 8 Sistem AI Ngonten Pakai AI", "Ebook Ngonten Pakai AI (Included)", "Bonus 4 Resource Ekstra (Footage, Hook, Tools)", "Sekali Bayar, Akses Selamanya"]
                },
                PRO_PLUS: {
                  name: "Paket Lengkap (Ebook)",
                  desc: "Bonus terbanyak, akses jualan (PLR) dan Lifetime support.",
                  price: 149000,
                  originalPrice: 2419000,
                  discountLabel: "94% OFF",
                  highlightText: "Paling Worth",
                  features: ["Semua isi Paket Basic", "Hak Jual Ulang (PLR) untuk berbagai materi", "Bimbingan Private 1-on-1 (Lifetime)", "Tools Text to Voice Over", "Video Footage Siap Pakai"]
                }
              };
              
              const pkgData = (pricingConfig && pricingConfig[pkgItem.key]) || defaultPkg[pkgItem.key as keyof typeof defaultPkg];
              const isLengkap = pkgItem.key === "PRO_PLUS";
              const hasHighlight = pkgData.highlightText && pkgData.highlightText.trim() !== "";
              
              const formatK = (p: number) => p >= 1000 ? (p / 1000) + 'k' : p.toString();

              return (
                <div key={pkgItem.key} className={`border rounded-2xl p-5 md:p-6 flex flex-col relative transition-colors duration-300 ${hasHighlight ? 'border-2 border-rn-accent transform lg:-translate-y-4 bg-white dark:bg-[#18181b]' : 'bg-white border-gray-200 dark:bg-[#18181b] dark:border-white/5'}`}>
                  {hasHighlight && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-rn-accent text-black text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest whitespace-nowrap">
                      {pkgData.highlightText}
                    </div>
                  )}

                  <h3 className={`font-bold text-lg md:text-xl font-heading mb-1 transition-colors duration-300 text-gray-900 dark:text-white`}>
                    {pkgData.name}
                  </h3>
                  <p className={`text-xs md:text-sm mb-4 transition-colors duration-300 text-gray-600 dark:text-gray-400 line-clamp-2`}>
                    {pkgData.desc}
                  </p>

                  <div className="flex items-end gap-2 mb-2">
                    <span className={`text-2xl md:text-3xl font-black transition-colors duration-300 text-gray-900 dark:text-white`}>
                      Rp {formatK(pkgData.price)}
                    </span>
                  </div>
                  
                  <div className={`text-xs md:text-sm mb-2 transition-colors duration-300 text-gray-500 dark:text-gray-400`}>
                    Total <span className="line-through">Rp {pkgData.originalPrice.toLocaleString('id-ID')}</span>
                  </div>
                  
                  {pkgData.discountLabel && (
                    <div className="inline-block bg-red-500/20 text-red-500 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider w-max mb-4">
                      {pkgData.discountLabel}
                    </div>
                  )}

                  <div className="flex-1">
                    <ul className={`space-y-2 md:space-y-3 text-xs md:text-sm transition-colors duration-300 text-gray-700 dark:text-gray-300`}>
                      {pkgData.features.map((f: string, i: number) => (
                        <li key={i} className={`flex gap-2 items-start ${isLengkap && i === 0 ? 'font-bold text-gray-900 dark:text-white' : ''}`}>
                          <Check className="w-4 h-4 text-rn-accent shrink-0 mt-0.5" /> {f}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Link 
                    prefetch={true} 
                    href={isLoggedIn ? `/checkout?type=${pkgItem.type}` : `/login?redirect=/checkout?type=${pkgItem.type}`}
                    onClick={(e) => {
                      if (!isLoggedIn) {
                        e.preventDefault();
                        window.location.href = `/login?redirect=/checkout?type=${pkgItem.type}`;
                      }
                    }} 
                    onMouseEnter={() => { if (isLoggedIn) preload(["checkout", pkgItem.type, undefined], () => getCheckoutDetailsAction(pkgItem.type, undefined)) }}
                    onTouchStart={() => { if (isLoggedIn) preload(["checkout", pkgItem.type, undefined], () => getCheckoutDetailsAction(pkgItem.type, undefined)) }}
                    className={`w-full mt-6 block text-center font-bold py-3 rounded-xl transition-all ${hasHighlight ? 'bg-rn-accent text-black font-black hover:bg-white shadow-[0_0_20px_rgba(208,226,6,0.2)]' : 'bg-gray-900 hover:bg-rn-accent hover:text-black text-white dark:bg-[#27272a] dark:hover:bg-rn-accent dark:hover:text-black dark:text-white'}`}
                  >
                    {pkgData.name.includes("Basic") ? "Pilih Paket Basic" : pkgData.name.includes("Tools") ? "Pilih Sistem Tools" : "Pilih Paket Lengkap"}
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

export default function HomePageClient({ initialPricingConfig }: { initialPricingConfig: any }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#111111]" />}>
      <HomeContent initialPricingConfig={initialPricingConfig} />
    </Suspense>
  );
}
