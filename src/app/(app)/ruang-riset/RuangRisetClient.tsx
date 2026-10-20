"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Sparkles,
  TrendingUp,
  Search,
  Users,
  Compass,
  LineChart,
  CheckCircle2,
  BellRing,
} from "lucide-react";

interface RuangRisetClientProps {
  isLoggedIn: boolean;
  isAdmin: boolean;
}

export default function RuangRisetClient({
  isLoggedIn,
  isAdmin,
}: RuangRisetClientProps) {
  const upcomingFeatures = [
    {
      icon: TrendingUp,
      title: "Tren Konten & Audio Viral",
      desc: "Deteksi topik hangat, hashtag potensial, dan sound/audio yang sedang naik daun di TikTok & Instagram Reels.",
    },
    {
      icon: Users,
      title: "Analisis Karakter Audiens",
      desc: "Pahami apa yang disukai, pain points, serta jam aktif followers target audiens spesifik kamu.",
    },
    {
      icon: LineChart,
      title: "Bedah Strategi Kompetitor",
      desc: "Bongkar formula konten kompetitor di niche kamu yang mendapatkan jutaan views dan engagement tinggi.",
    },
    {
      icon: Compass,
      title: "Generator Sudut Pandang (Angles)",
      desc: "Temukan ratusan ide dan angle unik dari satu topik umum agar konten kamu tidak pernah membosankan.",
    },
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 max-w-5xl mx-auto w-full py-12">
      {/* Top Navigation */}
      <div className="w-full flex items-center justify-between mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
        >
          <ArrowLeft size={16} />
          Kembali ke Beranda
        </Link>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
          <Sparkles className="w-3.5 h-3.5" /> Coming Soon
        </span>
      </div>

      {/* Hero Teaser Section */}
      <div className="w-full text-center space-y-4 mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 mb-2">
          <Search className="w-3.5 h-3.5" /> Ruang Riset AI
        </div>
        <h1 className="text-3xl md:text-5xl font-black font-heading tracking-tight text-gray-900 dark:text-white">
          Riset Konten Lebih Tajam, <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600">
            Divalidasi Data & AI.
          </span>
        </h1>
        <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
          Jangan buang waktu mengira-ngira ide konten. Ruang Riset akan membantu kamu membedah tren, menemukan celah pasar, dan menyusun formula konten viral secara otomatis.
        </p>
      </div>

      {/* Isometric Animated Canvas Stage */}
      <div className="w-full max-w-3xl mb-12 relative">
        <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 bg-white dark:bg-[#121214] shadow-2xl p-4 flex items-center justify-center">
          <div
            data-active="true"
            className="iso-stage pointer-events-none absolute -z-0 aspect-[1642/1200] max-w-none -translate-x-1/2 -translate-y-1/2 text-gray-900 dark:text-white w-[240%] sm:w-[200%]"
            style={{ top: "50%", left: "50%" }}
          >
            <svg viewBox="0 0 1642 1200" className="size-full" aria-hidden={true} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><g strokeOpacity="0.18" strokeWidth="3" strokeDasharray="3 14"><line x1="21" y1="0" x2="21" y2="1200"></line><line x1="101" y1="0" x2="101" y2="1200"></line><line x1="181" y1="0" x2="181" y2="1200"></line><line x1="261" y1="0" x2="261" y2="1200"></line><line x1="341" y1="0" x2="341" y2="1200"></line><line x1="421" y1="0" x2="421" y2="1200"></line><line x1="501" y1="0" x2="501" y2="1200"></line><line x1="581" y1="0" x2="581" y2="1200"></line><line x1="661" y1="0" x2="661" y2="1200"></line><line x1="741" y1="0" x2="741" y2="1200"></line><line x1="821" y1="0" x2="821" y2="1200"></line><line x1="901" y1="0" x2="901" y2="1200"></line><line x1="981" y1="0" x2="981" y2="1200"></line><line x1="1061" y1="0" x2="1061" y2="1200"></line><line x1="1141" y1="0" x2="1141" y2="1200"></line><line x1="1221" y1="0" x2="1221" y2="1200"></line><line x1="1301" y1="0" x2="1301" y2="1200"></line><line x1="1381" y1="0" x2="1381" y2="1200"></line><line x1="1461" y1="0" x2="1461" y2="1200"></line><line x1="1541" y1="0" x2="1541" y2="1200"></line><line x1="1621" y1="0" x2="1621" y2="1200"></line><line x1="0" y1="40" x2="1642" y2="40"></line><line x1="0" y1="120" x2="1642" y2="120"></line><line x1="0" y1="200" x2="1642" y2="200"></line><line x1="0" y1="280" x2="1642" y2="280"></line><line x1="0" y1="360" x2="1642" y2="360"></line><line x1="0" y1="440" x2="1642" y2="440"></line><line x1="0" y1="520" x2="1642" y2="520"></line><line x1="0" y1="600" x2="1642" y2="600"></line><line x1="0" y1="680" x2="1642" y2="680"></line><line x1="0" y1="760" x2="1642" y2="760"></line><line x1="0" y1="840" x2="1642" y2="840"></line><line x1="0" y1="920" x2="1642" y2="920"></line><line x1="0" y1="1000" x2="1642" y2="1000"></line><line x1="0" y1="1080" x2="1642" y2="1080"></line><line x1="0" y1="1160" x2="1642" y2="1160"></line></g><g transform="translate(821 600)"><g className="sc-rise-20"><rect x="-240" y="-110" width="480" height="220" rx="16" fill="var(--card)" strokeWidth="5" strokeOpacity="0.7"></rect><path d="M-240 -76 H240" strokeWidth="3" strokeOpacity="0.25"></path><circle cx="-216" cy="-93" r="4" fill="currentColor" stroke="none" opacity="0.4"></circle><circle cx="-198" cy="-93" r="4" fill="currentColor" stroke="none" opacity="0.4"></circle><circle cx="-180" cy="-93" r="4" fill="currentColor" stroke="none" opacity="0.4"></circle><text x="-156" y="-93" fontSize="15" fontWeight="600" fill="currentColor" fillOpacity="0.55" stroke="none" dominantBaseline="central" letterSpacing="0.3">Canvas</text></g><g transform="translate(-222 -62)"><g className="sc-rise-360"><rect width="140" height="100" rx="8" fill="var(--card)" strokeWidth="3" strokeOpacity="0.6"></rect><path d="M0 18 H140" strokeWidth="2" strokeOpacity="0.2"></path><circle cx="12" cy="9" r="3.5" fill="oklch(0.76 0.14 300)" stroke="none"></circle><line x1="100" y1="9" x2="128" y2="9" strokeWidth="3" strokeOpacity="0.3"></line><g className="sc-pop-410"><rect x="12" y="26" width="36" height="22" rx="5" fill="oklch(0.76 0.14 300)" fillOpacity="0.85" stroke="oklch(0.76 0.14 300)" strokeWidth="2"></rect><rect x="52" y="26" width="36" height="22" rx="5" fill="oklch(0.76 0.14 300)" fillOpacity="0.2" stroke="oklch(0.76 0.14 300)" strokeWidth="2"></rect><rect x="92" y="26" width="36" height="22" rx="5" fill="oklch(0.76 0.14 300)" fillOpacity="0.2" stroke="oklch(0.76 0.14 300)" strokeWidth="2"></rect></g><path d="M12 88 L36 76 L60 80 L84 64 L108 68 L128 56" stroke="oklch(0.76 0.14 300)" strokeWidth="4" className="sc-draw-390" pathLength={1} strokeDasharray="1" strokeDashoffset="1"></path></g></g><g transform="translate(-70 -62)"><g className="sc-rise-400"><rect width="140" height="100" rx="8" fill="var(--card)" strokeWidth="3" strokeOpacity="0.6"></rect><path d="M0 18 H140" strokeWidth="2" strokeOpacity="0.2"></path><circle cx="12" cy="9" r="3.5" fill="oklch(0.76 0.14 300)" stroke="none"></circle><line x1="100" y1="9" x2="128" y2="9" strokeWidth="3" strokeOpacity="0.3"></line><line x1="12" y1="30" x2="128" y2="30" strokeWidth="5" strokeOpacity="0.6" className="sc-draw-430" pathLength={1} strokeDasharray="1" strokeDashoffset="1"></line><line x1="28" y1="46" x2="88" y2="46" strokeWidth="4" strokeOpacity="0.35" className="sc-draw-430" pathLength={1} strokeDasharray="1" strokeDashoffset="1"></line><line x1="28" y1="60" x2="76" y2="60" strokeWidth="4" strokeOpacity="0.35" className="sc-draw-430" pathLength={1} strokeDasharray="1" strokeDashoffset="1"></line><line x1="28" y1="74" x2="92" y2="74" strokeWidth="4" strokeOpacity="0.35" className="sc-draw-430" pathLength={1} strokeDasharray="1" strokeDashoffset="1"></line><line x1="28" y1="88" x2="70" y2="88" strokeWidth="4" strokeOpacity="0.35" className="sc-draw-430" pathLength={1} strokeDasharray="1" strokeDashoffset="1"></line><g className="sc-pop-450"><g><circle cx="18" cy="46" r="4" fill="currentColor" fillOpacity="0.4" stroke="none"></circle><rect x="104" y="42" width="24" height="8" rx="4" fill="oklch(0.76 0.14 300)" fillOpacity="0.85" stroke="none"></rect></g><g><circle cx="18" cy="60" r="4" fill="currentColor" fillOpacity="0.4" stroke="none"></circle><rect x="104" y="56" width="24" height="8" rx="4" fill="oklch(0.76 0.14 300)" fillOpacity="0.3" stroke="none"></rect></g><g><circle cx="18" cy="74" r="4" fill="currentColor" fillOpacity="0.4" stroke="none"></circle><rect x="104" y="70" width="24" height="8" rx="4" fill="oklch(0.76 0.14 300)" fillOpacity="0.85" stroke="none"></rect></g><g><circle cx="18" cy="88" r="4" fill="currentColor" fillOpacity="0.4" stroke="none"></circle><rect x="104" y="84" width="24" height="8" rx="4" fill="oklch(0.76 0.14 300)" fillOpacity="0.3" stroke="none"></rect></g></g></g></g><g transform="translate(82 -62)"><g className="sc-rise-440"><rect width="140" height="100" rx="8" fill="var(--card)" strokeWidth="3" strokeOpacity="0.6"></rect><path d="M0 18 H140" strokeWidth="2" strokeOpacity="0.2"></path><circle cx="12" cy="9" r="3.5" fill="oklch(0.76 0.14 300)" stroke="none"></circle><line x1="100" y1="9" x2="128" y2="9" strokeWidth="3" strokeOpacity="0.3"></line><line x1="12" y1="30" x2="32" y2="30" strokeWidth="4" strokeOpacity="0.6" className="sc-draw-470" pathLength={1} strokeDasharray="1" strokeDashoffset="1"></line><line x1="52" y1="30" x2="72" y2="30" strokeWidth="4" strokeOpacity="0.6" className="sc-draw-470" pathLength={1} strokeDasharray="1" strokeDashoffset="1"></line><line x1="92" y1="30" x2="112" y2="30" strokeWidth="4" strokeOpacity="0.6" className="sc-draw-470" pathLength={1} strokeDasharray="1" strokeDashoffset="1"></line><g className="sc-pop-490"><rect x="12" y="40" width="36" height="15" rx="3" fill="currentColor" fillOpacity="0.08" strokeWidth="2" strokeOpacity="0.4"></rect><rect x="12" y="60" width="36" height="15" rx="3" fill="currentColor" fillOpacity="0.08" strokeWidth="2" strokeOpacity="0.4"></rect><rect x="12" y="80" width="36" height="15" rx="3" fill="currentColor" fillOpacity="0.08" strokeWidth="2" strokeOpacity="0.4"></rect><rect x="52" y="40" width="36" height="15" rx="3" fill="currentColor" fillOpacity="0.08" strokeWidth="2" strokeOpacity="0.4"></rect><rect x="52" y="60" width="36" height="15" rx="3" fill="currentColor" fillOpacity="0.08" strokeWidth="2" strokeOpacity="0.4"></rect><rect x="92" y="40" width="36" height="15" rx="3" fill="oklch(0.76 0.14 300)" fillOpacity="0.85" strokeWidth="2" strokeOpacity="0"></rect></g></g></g><g className="sc-pop-550" stroke="oklch(0.76 0.14 300)" strokeWidth="2"><rect x="-76" y="-68" width="152" height="112" rx="2" strokeDasharray="5 5"></rect><rect x="-80" y="-72" width="8" height="8" fill="var(--card)"></rect><rect x="-80" y="40" width="8" height="8" fill="var(--card)"></rect><rect x="72" y="-72" width="8" height="8" fill="var(--card)"></rect><rect x="72" y="40" width="8" height="8" fill="var(--card)"></rect></g><g className="sc-rise-50"><rect x="-200" y="52" width="400" height="42" rx="21" fill="var(--card)" stroke="oklch(0.76 0.14 300)" strokeWidth="3" strokeOpacity="0.8"></rect><path transform="translate(-178 73)" d="M0 -10 Q2 -2 10 0 Q2 2 0 10 Q-2 2 -10 0 Q-2 -2 0 -10 Z" fill="oklch(0.76 0.14 300)" stroke="none"></path><defs><clipPath id="home-v2-design-type"><rect x="-158" y="52" width="294" height="42" className="sc-type"></rect></clipPath></defs><g className="sc-sent"><text x="-156" y="73" fontSize="18" fontWeight="500" textLength="290" lengthAdjust="spacingAndGlyphs" fill="currentColor" fillOpacity="0.8" stroke="none" dominantBaseline="central" clipPath="url(#home-v2-design-type)">Buatkan dashboard CRM tim sales</text><g className="sc-caret"><line x1="-155" y1="62" x2="-155" y2="84" stroke="oklch(0.76 0.14 300)" strokeWidth="3" className="sc-blink"></line></g></g><g transform="translate(176 73)"><circle r="15" stroke="oklch(0.76 0.14 300)" strokeWidth="3" className="sc-ripple"></circle><g className="sc-enter"><circle r="15" fill="oklch(0.76 0.14 300)" stroke="none"></circle><path d="M0 7 V-7 M-6 -1 L0 -7 L6 -1" stroke="var(--card)" strokeWidth="3"></path></g></g></g><g className="sc-rise-570"><path d="M58 22 L58 52 L66 44 L75 61 L81 58 L72 41 L86 41 Z" fill="currentColor" stroke="var(--card)" strokeWidth="2"></path></g></g></svg>
          </div>
        </div>
      </div>

      {/* Feature Pillars Preview */}
      <div className="w-full">
        <h3 className="text-xl font-bold font-heading text-gray-900 dark:text-white mb-6 text-center">
          Apa yang Akan Hadir di Ruang Riset?
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {upcomingFeatures.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="flex items-start gap-4 p-5 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#18181b] shadow-sm"
              >
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-900 dark:text-white mb-1">
                    {feat.title}
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                    {feat.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
