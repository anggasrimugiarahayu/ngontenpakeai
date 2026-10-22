"use client";
import toast from "react-hot-toast";
import { useState } from "react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { MessageSquare, Mic, Loader2, ArrowLeft } from "lucide-react";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function FeedbackPage() {
  const { data: session, status } = useSession();
  const { theme, systemTheme } = useTheme();
  const router = useRouter();
  
  const [step, setStep] = useState(1);
  const [improveText, setImproveText] = useState("");
  const [featureText, setFeatureText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Resolve current theme
  const currentTheme = theme === "system" ? systemTheme : theme;
  const isDark = currentTheme === "dark";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      setStep(2);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          improveText,
          featureText
        }),
      });

      if (!res.ok) throw new Error("Gagal mengirim feedback");
      
      setIsSuccess(true);
      setTimeout(() => {
        router.push("/");
      }, 3000);
    } catch (error) {
      console.error(error);
      toast.error("Gagal mengirim feedback, coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === "loading") {
    return (
      <LoadingSpinner message="Memuat Feedback..." />
    );
  }

  if (isSuccess) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-300">
        <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-6">
          <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className={`text-2xl font-bold font-heading mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
          Terima Kasih!
        </h2>
        <p className={`mb-8 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
          Masukan kamu sangat berarti untuk mengembangkan ruangcreativemuslim.
        </p>
        <Link href="/">
          <button className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-colors">
            Kembali ke Beranda
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full max-w-2xl mx-auto p-6 py-12 md:py-20 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex justify-between items-end mb-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className={`text-2xl md:text-3xl font-bold font-heading ${isDark ? "text-white" : "text-gray-900"}`}>
              Feedback
            </h1>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isDark ? "bg-orange-500/10 text-orange-400" : "bg-orange-50 text-orange-500"}`}>
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
            Masukan kamu bantu kami bikin ruangcreativemuslim jadi lebih baik.
          </p>
        </div>
        <div className={`text-sm font-bold ${isDark ? "text-gray-400" : "text-gray-500"}`}>
          {step}/2
        </div>
      </div>

      {/* Progress Bar */}
      <div className={`w-full h-1 rounded-full mb-8 ${isDark ? "bg-white/10" : "bg-gray-200"}`}>
        <div 
          className="h-full bg-orange-500 rounded-full transition-all duration-500 ease-out"
          style={{ width: step === 1 ? "50%" : "100%" }}
        />
      </div>

      <form onSubmit={handleSubmit}>
        {/* Step 1 */}
        {step === 1 && (
          <div className="space-y-4 animate-in slide-in-from-right-4 fade-in duration-300">
            <p className={`text-sm font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
              1. Menurut kamu, apa yang bisa kami improve?
            </p>
            <div className="relative">
              <textarea
                autoFocus
                required
                value={improveText}
                onChange={(e) => setImproveText(e.target.value)}
                placeholder="Ketikan masukan kamu disini..."
                className={`w-full h-40 p-4 rounded-xl text-sm border focus:ring-2 focus:ring-orange-500/50 outline-none transition-all resize-none ${
                  isDark ? "bg-[#141B31] border-[#2C3246] text-white placeholder:text-gray-600" : "bg-white border-gray-200 text-gray-900 placeholder:text-gray-400"
                }`}
              />
              <button type="button" className={`absolute bottom-4 right-4 p-2 rounded-full transition-colors ${isDark ? "hover:bg-white/10 text-gray-400" : "hover:bg-gray-100 text-gray-400"}`}>
                <Mic className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={!improveText.trim()}
                className="px-6 py-2.5 bg-[#f97316] hover:bg-[#ea580c] dark:bg-[#f97316] dark:hover:bg-[#fb923c] disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-sm shadow-orange-500/20 cursor-pointer"
              >
                Lanjut
              </button>
            </div>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="space-y-4 animate-in slide-in-from-right-4 fade-in duration-300">
            <p className={`text-sm font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
              2. Ada fitur yang kamu harapkan ada di ruangcreativemuslim?
            </p>
            <div className="relative">
              <textarea
                autoFocus
                value={featureText}
                onChange={(e) => setFeatureText(e.target.value)}
                placeholder="Fitur yang bikin kerjaan kamu lebih gampang..."
                className={`w-full h-40 p-4 rounded-xl text-sm border focus:ring-2 focus:ring-orange-500/50 outline-none transition-all resize-none ${
                  isDark ? "bg-[#0F172A] border-[#2C3246] text-white placeholder:text-gray-500" : "bg-white border-gray-200 text-gray-900 placeholder:text-gray-400"
                }`}
              />
              <button type="button" className={`absolute bottom-4 right-4 p-2 rounded-full transition-colors ${isDark ? "hover:bg-white/10 text-gray-400" : "hover:bg-gray-100 text-gray-400"}`}>
                <Mic className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex justify-between items-center pt-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className={`flex items-center gap-2 text-sm font-bold transition-colors ${isDark ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900"}`}
              >
                <ArrowLeft className="w-4 h-4" /> Kembali
              </button>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-[#f97316] hover:bg-[#ea580c] dark:bg-[#f97316] dark:hover:bg-[#fb923c] disabled:opacity-50 text-white font-bold rounded-xl transition-all flex items-center gap-2 shadow-sm shadow-orange-500/20 cursor-pointer"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Kirim Feedback
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
