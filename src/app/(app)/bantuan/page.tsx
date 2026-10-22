"use client";

import { useState } from "react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { Mail, Send, Loader2, CheckCircle, X } from "lucide-react";
import { useSession } from "next-auth/react";

export default function BantuanPage() {
  const { data: session, status } = useSession();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    replyTo: "",
    subject: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/bantuan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          name: session?.user?.name || formData.name,
          replyTo: session?.user?.email || formData.replyTo,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengirim email.");

      setIsSuccess(true);
      setFormData({ name: "", replyTo: "", subject: "", message: "" });
      
      // Auto-hide popup after 5 seconds
      setTimeout(() => setIsSuccess(false), 5000);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 text-center max-w-4xl mx-auto w-full py-8 md:py-12">
      
      {/* Toast Popup */}
      {isSuccess && (
        <div className="fixed top-20 right-4 md:right-8 z-50 animate-in fade-in slide-in-from-top-5 duration-300">
          <div className="bg-emerald-500 text-white px-5 py-4 rounded-2xl shadow-xl flex items-center gap-4 max-w-sm">
            <CheckCircle className="w-6 h-6 flex-shrink-0" />
            <div className="text-left flex-1">
              <h4 className="font-bold text-sm">Pesan Terkirim!</h4>
              <p className="text-xs text-emerald-50 mt-0.5">Kami akan membalas melalui email secepatnya.</p>
            </div>
            <button 
              onClick={() => setIsSuccess(false)} 
              className="text-emerald-100 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      <h1 className="text-3xl md:text-5xl font-black font-heading mb-2 tracking-tight transition-colors duration-300 text-gray-900 dark:text-white">
        Bantuan & Support
      </h1>
      <p className="text-sm md:text-base mb-8 max-w-lg mx-auto transition-colors duration-300 text-gray-600 dark:text-gray-400">
        Punya pertanyaan, butuh bantuan teknis, atau ada kendala? Kirimkan pesan melalui form di bawah dan kami akan membalas ke email Anda secepatnya.
      </p>

      {/* Card Form */}
      <div className="w-full max-w-lg rounded-2xl border-2 p-6 md:p-8 transition-all duration-300 text-left relative overflow-hidden bg-white dark:bg-[#141B31] border-gray-200 dark:border-[#2C3246] hover:border-rn-orange/30 shadow-gray-200 dark:shadow-black/50">
        <div className="flex items-center justify-center mb-4">
          <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
            <Mail className="w-5 h-5 text-orange-500" />
          </div>
        </div>
        
        <h2 className="text-lg md:text-xl font-bold text-center mb-6 text-gray-900 dark:text-white">
          Kirim Email
        </h2>

        {status === "loading" ? (
          <LoadingSpinner message="Memuat Bantuan..." />
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 animate-in fade-in duration-300">
            {!session && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1.5 text-gray-700 dark:text-gray-400">Nama</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl text-sm border focus:ring-2 focus:ring-orange-500/50 outline-none transition-all resize-none bg-gray-50 dark:bg-[#27272a] border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                    placeholder="Nama Anda"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1.5 text-gray-700 dark:text-gray-400">Email Balasan</label>
                  <input
                    type="email"
                    required
                    value={formData.replyTo}
                    onChange={(e) => setFormData({ ...formData, replyTo: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl text-sm border focus:ring-2 focus:ring-orange-500/50 outline-none transition-all resize-none bg-gray-50 dark:bg-[#27272a] border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                    placeholder="nama@email.com"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold mb-1.5 text-gray-700 dark:text-gray-400">Subjek</label>
              <input
                type="text"
                required
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl text-sm border focus:ring-2 focus:ring-orange-500/50 outline-none transition-all resize-none bg-gray-50 dark:bg-[#27272a] border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                placeholder="Misal: Kendala login akun"
              />
            </div>

            <div>
              <label className="block text-xs font-bold mb-1.5 text-gray-700 dark:text-gray-400">Pesan</label>
              <textarea
                required
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl text-sm border focus:ring-2 focus:ring-orange-500/50 outline-none transition-all resize-none bg-gray-50 dark:bg-[#27272a] border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                placeholder="Ceritakan detail pertanyaan atau kendala yang dialami..."
              />
            </div>

            {errorMsg && (
              <p className="text-red-500 text-xs font-bold text-center mt-2">{errorMsg}</p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full mt-4 flex items-center justify-center gap-2 font-bold py-3 px-6 rounded-xl transition-all shadow-md ${
                isSubmitting 
                  ? "bg-gray-500/50 text-gray-300 cursor-not-allowed" 
                  : "bg-orange-500 hover:bg-orange-600 text-white hover:shadow-orange-500/25"
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Mengirim...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Kirim Pesan
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
