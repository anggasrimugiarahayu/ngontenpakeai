"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveOnboardingData } from "@/app/actions/onboarding";
import { ChevronRight, Sparkles, Target, Zap, LayoutTemplate } from "lucide-react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function OnboardingClient() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [answers, setAnswers] = useState({
    niche: "",
    struggle: "",
    platform: "",
    goal: "",
  });

  const handleSelect = async (field: keyof typeof answers, value: string) => {
    const newAnswers = { ...answers, [field]: value };
    setAnswers(newAnswers);

    if (step < 4) {
      setStep(step + 1);
    } else {
      // Selesai
      setLoading(true);
      const res = await saveOnboardingData(newAnswers);
      if (res.success) {
        router.push("/");
      } else {
        alert(res.error || "Terjadi kesalahan.");
        setLoading(false);
      }
    }
  };

  const steps = [
    {
      title: "Salam kenal! Biasanya kamu bikin konten seputar apa nih?",
      subtitle: "Biar kami bisa merekomendasikan alat yang paling pas.",
      field: "niche" as const,
      options: [
        { label: "Dakwah & Edukasi Islam", icon: <Target className="w-5 h-5" /> },
        { label: "Bisnis & Jualan Produk", icon: <Target className="w-5 h-5" /> },
        { label: "Personal Branding", icon: <Target className="w-5 h-5" /> },
        { label: "Hiburan / Komedi", icon: <Target className="w-5 h-5" /> },
        { label: "Faceless / Affiliate", icon: <Target className="w-5 h-5" /> },
      ],
    },
    {
      title: "Jujur-jujuran aja, apa hambatan terbesar kamu saat mau ngonten?",
      subtitle: "Tenang, Ngonten Pakai AI punya solusi buat semua masalah ini.",
      field: "struggle" as const,
      options: [
        { label: "Sering stuck / kehabisan ide", icon: <Zap className="w-5 h-5" /> },
        { label: "Nggak jago nulis skrip/hook (susah viral)", icon: <Zap className="w-5 h-5" /> },
        { label: "Kurang pede ngomong depan kamera", icon: <Zap className="w-5 h-5" /> },
        { label: "Masih gaptek pakai AI", icon: <Zap className="w-5 h-5" /> },
      ],
    },
    {
      title: "Platform mana yang jadi fokus utama kamu saat ini?",
      subtitle: "Fokus di satu platform dulu itu strategi yang bagus lho.",
      field: "platform" as const,
      options: [
        { label: "TikTok", icon: <LayoutTemplate className="w-5 h-5" /> },
        { label: "Instagram Reels", icon: <LayoutTemplate className="w-5 h-5" /> },
        { label: "YouTube Shorts", icon: <LayoutTemplate className="w-5 h-5" /> },
        { label: "X (Twitter) / Threads", icon: <LayoutTemplate className="w-5 h-5" /> },
      ],
    },
    {
      title: "Apa target utama yang pengen banget kamu capai?",
      subtitle: "Kami akan bantu wujudkan target ini.",
      field: "goal" as const,
      options: [
        { label: "Jualan makin laris / Banjir orderan", icon: <Sparkles className="w-5 h-5" /> },
        { label: "Followers naik tajam / Personal Branding", icon: <Sparkles className="w-5 h-5" /> },
        { label: "Amal Jariyah via Dakwah Digital", icon: <Sparkles className="w-5 h-5" /> },
        { label: "Dapat penghasilan tambahan (Affiliate)", icon: <Sparkles className="w-5 h-5" /> },
      ],
    }
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center text-center">
        <LoadingSpinner message="Menyiapkan ruang kerja personalmu..." />
      </div>
    );
  }

  const currentStepData = steps[step - 1];

  return (
    <div className="w-full max-w-2xl bg-white dark:bg-[#121214] border border-gray-200 dark:border-white/5 shadow-2xl rounded-3xl overflow-hidden relative">
      {/* Progress Bar */}
      <div className="w-full h-1.5 bg-gray-100 dark:bg-white/5 relative">
        <div 
          className="absolute top-0 left-0 h-full bg-rn-accent transition-all duration-500 ease-out"
          style={{ width: `${(step / 4) * 100}%` }}
        />
      </div>

      <div className="p-8 md:p-12">
        <div className="text-center mb-10">
          <div className="text-orange-500 font-black text-sm mb-3 tracking-wider uppercase">Langkah {step} dari 4</div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2 leading-tight">
            {currentStepData.title}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {currentStepData.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {currentStepData.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => handleSelect(currentStepData.field, opt.label)}
              className="flex items-center justify-between w-full p-4 md:p-5 rounded-2xl border-2 border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-black/20 hover:border-rn-accent hover:bg-orange-50 dark:hover:bg-orange-900/10 transition-all text-left group"
            >
              <div className="flex items-center gap-4 text-gray-700 dark:text-gray-300 group-hover:text-rn-accent transition-colors">
                <div className="text-gray-400 group-hover:text-rn-accent transition-colors">
                  {opt.icon}
                </div>
                <span className="font-bold text-sm md:text-base">{opt.label}</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-300 dark:text-gray-600 group-hover:text-rn-accent group-hover:translate-x-1 transition-all" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
