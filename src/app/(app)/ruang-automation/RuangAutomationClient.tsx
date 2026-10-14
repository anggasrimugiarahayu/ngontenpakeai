"use client";

import React, { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import useSWR, { mutate } from "swr";
import {
  Bot,
  Zap,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowLeft,
  Plus,
  Trash2,
  Edit3,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Eye,
  Clock,
  Send,
  MessageSquare,
  ChevronRight,
  Info,
  Check,
  X,
  Loader2,
  Link2,
  Unlink,
  KeyRound,
  Lock
} from "lucide-react";
import {
  getInstagramAutomationDataAction,
  saveAutomationRuleAction,
  toggleAutomationRuleAction,
  deleteAutomationRuleAction,
  connectInstagramAccountAction,
  disconnectInstagramAccountAction
} from "@/app/actions/instagramAutomation";

// Helper Spintax Randomizer
function parseSpintax(text: string): string {
  if (!text) return "";
  return text.replace(/\{([^{}]+)\}/g, (_, choices) => {
    const parts = choices.split("|");
    return parts[Math.floor(Math.random() * parts.length)];
  });
}

// Custom SVGs for platforms
function InstagramIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function TikTokIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
    </svg>
  );
}

function WhatsAppIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  );
}

export default function RuangAutomationClient({
  initialData,
  isLoggedIn = true,
  isPro,
  isAdmin,
}: {
  initialData: any;
  isLoggedIn?: boolean;
  isPro: boolean;
  isAdmin: boolean;
}) {
  const router = useRouter();
  const [selectedPlatform, setSelectedPlatform] = useState<"instagram" | null>(null);
  const [isPending, startTransition] = useTransition();

  const shouldFetch = isLoggedIn && (isPro || isAdmin);

  // SWR Caching & Revalidating (Stale-While-Revalidate / STA pattern)
  const { data: swrData, isLoading, mutate: mutateData } = useSWR(
    shouldFetch ? "instagramAutomation" : null,
    getInstagramAutomationDataAction,
    {
      fallbackData: initialData,
      revalidateOnFocus: false,
      revalidateIfStale: true,
      dedupingInterval: 5000,
    }
  );

  const data = swrData || initialData || {
    account: null,
    rules: [],
    stats: { totalComments: 0, totalDms: 0 },
    logs: [],
  };

  // Notification Toast state
  const [toast, setToast] = useState<{ type: "success" | "error" | "info"; message: string } | null>(null);

  const showToast = (type: "success" | "error" | "info", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // Instagram Avatar State
  const [avatarError, setAvatarError] = useState(false);

  // Listen to OAuth Callback query parameters & Platform query
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const connected = params.get("connected");
    const username = params.get("username");
    const errorParam = params.get("error");
    const platformParam = params.get("platform");

    // Auto-open platform if coming back from login or direct link
    if (platformParam === "instagram") {
      if (isLoggedIn && (isPro || isAdmin)) {
        setSelectedPlatform("instagram");
      }
    }

    if (connected === "true") {
      showToast(
        "success",
        username
          ? `Akun @${username} berhasil terhubung via Meta!`
          : "Akun Instagram berhasil terhubung!"
      );
      mutateData();
      window.history.replaceState({}, "", "/ruang-automation");
    } else if (errorParam) {
      if (errorParam === "cancelled") {
        showToast("info", "Proses login Instagram dibatalkan.");
      } else if (errorParam === "no_business_account") {
        showToast(
          "error",
          "Akun Instagram belum berupa Akun Profesional (Kreator/Bisnis) atau belum ditautkan ke Facebook Page."
        );
      } else if (errorParam === "missing_credentials") {
        showToast("error", "Kredensial Meta App belum terpasang di sistem.");
      } else {
        showToast("error", decodeURIComponent(errorParam));
      }
      window.history.replaceState({}, "", "/ruang-automation");
    }
  }, [mutateData, isLoggedIn, isPro, isAdmin]);

  // Handle click on Instagram Automation Card
  const handleSelectInstagram = () => {
    if (!isLoggedIn) {
      router.push("/login?redirect=/ruang-automation?platform=instagram");
      return;
    }
    if (!isPro && !isAdmin) {
      router.push("/?pricing=true");
      return;
    }
    setSelectedPlatform("instagram");
  };

  // Redirect to official Meta OAuth login
  const handleStartMetaOAuth = () => {
    window.location.href = "/api/auth/instagram/login";
  };

  // Rule Modal state
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<any | null>(null);
  const [ruleFormData, setRuleFormData] = useState({
    name: "",
    postType: "ALL",
    postId: "",
    triggerType: "KEYWORDS",
    keywords: "mau, harga, info",
    isReplyComment: true,
    replyCommentTemplates: "{Halo|Hai|Kak} @username, cek DM ya kak sudah kami kirimkan link detailnya! 😊",
    isSendDm: true,
    dmTemplates: "Halo @username! Terima kasih sudah tertarik. Ini link akses katalog & promo spesial untuk kamu:\nhttps://ruangcreativemuslim.com/checkout",
    isActive: true,
  });

  // Spintax test live preview state in modal
  const [spintaxPreview, setSpintaxPreview] = useState("");

  const handleOpenAddRuleModal = () => {
    if (!account || !account.isActive) {
      showToast("error", "Silakan hubungkan akun Instagram terlebih dahulu untuk membuat aturan automasi.");
      return;
    }
    setEditingRule(null);
    setRuleFormData({
      name: "Aturan Balas Komentar Otomatis",
      postType: "ALL",
      postId: "",
      triggerType: "KEYWORDS",
      keywords: "mau, harga, info, spill",
      isReplyComment: true,
      replyCommentTemplates: "{Halo|Hai|Kak} @username, cek DM ya kak sudah kami kirimkan link detailnya! 😊",
      isSendDm: true,
      dmTemplates: "Halo @username! Terima kasih sudah tertarik. Ini link akses katalog & promo spesial untuk kamu:\nhttps://ruangcreativemuslim.com/checkout",
      isActive: true,
    });
    setSpintaxPreview(parseSpintax("{Halo|Hai|Kak} @username, cek DM ya kak sudah kami kirimkan link detailnya! 😊"));
    setIsRuleModalOpen(true);
  };

  const handleOpenEditRuleModal = (rule: any) => {
    setEditingRule(rule);
    const keywordsStr = Array.isArray(rule.keywords)
      ? rule.keywords.join(", ")
      : typeof rule.keywords === "string"
      ? rule.keywords
      : "";

    const replyTemplateStr = Array.isArray(rule.commentReplies) && rule.commentReplies.length > 0
      ? rule.commentReplies[0]
      : Array.isArray(rule.replyCommentTemplates) && rule.replyCommentTemplates.length > 0
      ? rule.replyCommentTemplates[0]
      : rule.commentReplies || rule.replyCommentTemplates || "";

    const dmTemplateStr = rule.dmMessage || (Array.isArray(rule.dmTemplates) ? rule.dmTemplates[0] : rule.dmTemplates) || "";

    setRuleFormData({
      name: rule.name || "",
      postType: rule.triggerType === "SPECIFIC_POST" ? "SPECIFIC" : "ALL",
      postId: rule.specificPostId || "",
      triggerType: "KEYWORDS",
      keywords: keywordsStr,
      isReplyComment: true,
      replyCommentTemplates: replyTemplateStr,
      isSendDm: true,
      dmTemplates: dmTemplateStr,
      isActive: rule.isActive ?? true,
    });
    setSpintaxPreview(parseSpintax(replyTemplateStr));
    setIsRuleModalOpen(true);
  };

  // Toggle rule status ON/OFF with optimistic SWR update
  const handleToggleRule = (ruleId: string, currentStatus: boolean) => {
    const nextStatus = !currentStatus;

    // Optimistic SWR mutate
    mutateData(
      (prev: any) => ({
        ...prev,
        rules: (prev?.rules || []).map((r: any) => (r.id === ruleId ? { ...r, isActive: nextStatus } : r)),
      }),
      false
    );

    startTransition(async () => {
      try {
        const res = await toggleAutomationRuleAction(ruleId, nextStatus);
        if (res.success) {
          showToast("success", `Aturan berhasil di-${nextStatus ? "aktifkan" : "nonaktifkan"}`);
          await mutateData();
        } else {
          showToast("error", res.error || "Gagal mengubah status aturan");
          await mutateData();
        }
      } catch (err: any) {
        showToast("error", err.message || "Terjadi kesalahan server");
        await mutateData();
      }
    });
  };

  // Delete rule with optimistic SWR update
  const handleDeleteRule = (ruleId: string, ruleName: string) => {
    if (!confirm(`Hapus aturan "${ruleName}"? Tindakan ini tidak dapat dibatalkan.`)) return;

    // Optimistic SWR mutate
    mutateData(
      (prev: any) => ({
        ...prev,
        rules: (prev?.rules || []).filter((r: any) => r.id !== ruleId),
      }),
      false
    );

    startTransition(async () => {
      try {
        const res = await deleteAutomationRuleAction(ruleId);
        if (res.success) {
          showToast("success", "Aturan automasi berhasil dihapus");
          await mutateData();
        } else {
          showToast("error", res.error || "Gagal menghapus aturan");
          await mutateData();
        }
      } catch (err: any) {
        showToast("error", err.message || "Terjadi kesalahan server");
        await mutateData();
      }
    });
  };

  // Save Rule (Create or Update)
  const handleSaveRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruleFormData.name.trim()) {
      showToast("error", "Nama aturan wajib diisi");
      return;
    }

    const keywordArray = ruleFormData.keywords
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean);

    startTransition(async () => {
      try {
        const payload = {
          ruleId: editingRule?.id,
          name: ruleFormData.name,
          postType: ruleFormData.postType,
          postId: ruleFormData.postId,
          keywords: keywordArray,
          commentReplies: [ruleFormData.replyCommentTemplates],
          dmMessage: ruleFormData.dmTemplates,
          isActive: ruleFormData.isActive,
        };

        const res = await saveAutomationRuleAction(payload);
        if (res.success && res.rule) {
          showToast("success", editingRule ? "Aturan berhasil diperbarui!" : "Aturan baru berhasil ditambahkan!");
          setIsRuleModalOpen(false);
          await mutateData();
        } else {
          showToast("error", res.error || "Gagal menyimpan aturan");
        }
      } catch (err: any) {
        showToast("error", err.message || "Gagal menyimpan aturan");
      }
    });
  };


  // Resync Account from Meta API
  const handleResyncAccount = () => {
    startTransition(async () => {
      try {
        const res = await connectInstagramAccountAction();
        if (res.success && res.account) {
          showToast("success", `Akun @${res.account.username} berhasil disinkronkan kembali!`);
          setAvatarError(false);
          await mutateData();
        } else {
          showToast("error", res.error || "Gagal menyinkronkan akun");
        }
      } catch (err: any) {
        showToast("error", err.message || "Terjadi kesalahan koneksi Meta API");
      }
    });
  };

  // Disconnect Account with Optimistic SWR Update
  const handleDisconnect = () => {
    if (!data.account?.id) return;
    if (!confirm("Putuskan koneksi akun Instagram ini? Automasi komentar dan DM akan dinonaktifkan sementara.")) return;

    // Optimistically set account to null in SWR cache for instant UI feedback
    mutateData(
      (prev: any) => ({
        ...prev,
        account: null,
      }),
      false
    );

    startTransition(async () => {
      try {
        const res = await disconnectInstagramAccountAction(data.account.id);
        if (res.success) {
          showToast("info", "Koneksi akun Instagram berhasil diputuskan");
          await mutateData();
        } else {
          showToast("error", res.error || "Gagal memutuskan koneksi");
          await mutateData();
        }
      } catch (err: any) {
        showToast("error", err.message || "Terjadi kesalahan server");
        await mutateData();
      }
    });
  };

  const account = data?.account;
  const rules = data?.rules || [];
  const stats = data?.stats || { totalComments: 0, totalDms: 0 };
  const logs = data?.logs || [];

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-8 animate-in fade-in duration-300">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-[100] px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 text-sm font-semibold transition-all border ${
            toast.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-white dark:bg-[#18181b]"
              : toast.type === "error"
              ? "bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400 bg-white dark:bg-[#18181b]"
              : "bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400 bg-white dark:bg-[#18181b]"
          }`}
        >
          {toast.type === "success" && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
          {toast.type === "error" && <AlertCircle className="w-5 h-5 text-rose-500" />}
          {toast.type === "info" && <Info className="w-5 h-5 text-blue-500" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* LEVEL 1: PLATFORM HUB SELECTION */}
      {/* ========================================================================= */}
      {selectedPlatform === null ? (
        <div className="space-y-8">
          {/* Header - EXACT SAME STYLE & CENTER ALIGNED AS RUANG NGONTEN */}
          <div className="flex flex-col items-center justify-center text-center gap-2 mb-6 md:mb-10">
            <div className="space-y-3 flex flex-col items-center">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                Mau mulai dari mana?
              </h1>
              <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 max-w-xl mx-auto text-balance leading-relaxed">
                Pilih platform media sosial di bawah ini untuk mengaktifkan automasi balasan komentar pintar, kirim pesan DM privat otomatis, dan perluas jangkauan audiens Anda 24/7.
              </p>
            </div>
          </div>

          {/* Platform Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 1. INSTAGRAM AUTOMATION (ACTIVE) */}
            <div
              onClick={handleSelectInstagram}
              className="group relative flex flex-col justify-between rounded-2xl border-2 border-pink-500/30 hover:border-pink-500/70 p-6 md:p-7 text-left transition-all duration-300 hover:shadow-2xl hover:-translate-y-1.5 cursor-pointer bg-white dark:bg-[#18181b] overflow-hidden"
            >
              {/* Background Glow */}
              <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-bl from-pink-500/20 via-purple-500/10 to-transparent rounded-bl-full pointer-events-none transition-transform group-hover:scale-125" />

              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-pink-500/20 group-hover:scale-110 transition-transform">
                    <InstagramIcon className="w-6 h-6" />
                  </div>
                  <div className="flex items-center gap-2">
                    {!isPro && !isAdmin && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-purple-700 dark:text-purple-300 bg-purple-500/15 border border-purple-500/30">
                        <Lock className="w-3 h-3 text-purple-500" />
                        PRO Only
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Siap Digunakan
                    </span>
                  </div>
                </div>

                <h3 className="font-heading text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
                  Instagram Automation
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                  Balas komentar postingan & Reels otomatis serta kirim link/DM instan ke followers secara otomatis menggunakan Meta API resmi.
                </p>

                {/* Feature Chips */}
                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Auto-reply komentar postingan & Reels</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Kirim link checkout / katalog via DM instan</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Anti-ban spintax text randomizer</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-white/5 flex items-center justify-between text-sm font-bold text-pink-600 dark:text-pink-400 group-hover:translate-x-1 transition-transform">
                <span>
                  {!isLoggedIn
                    ? "Login untuk Menggunakan"
                    : !isPro && !isAdmin
                    ? "Langganan PRO untuk Membuka"
                    : "Buka Pengaturan & Aturan"}
                </span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>

            {/* 2. TIKTOK AUTOMATION (DISABLED / COMING SOON) */}
            <div
              className="relative flex flex-col justify-between rounded-2xl border-2 border-gray-200 dark:border-white/5 p-6 md:p-7 text-left bg-gray-50/60 dark:bg-[#121214]/60 opacity-75 cursor-not-allowed overflow-hidden"
              title="TikTok Automation sedang dalam tahap pengembangan"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 flex items-center justify-center shadow-sm">
                    <TikTokIcon className="w-6 h-6" />
                  </div>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20">
                    Segera Hadir
                  </span>
                </div>

                <h3 className="font-heading text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                  TikTok Automation
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-500 leading-relaxed mb-6">
                  Otomasi interaksi video VT, respon komentar audiens, dan pesan instan pengikut TikTok secara otomatis.
                </p>

                {/* Feature Chips */}
                <div className="space-y-2 mb-6 opacity-60">
                  <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                    <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>Auto-reply video komentar TikTok</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                    <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>Direct Message Auto-Responder</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                    <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>TikTok Live Chat Assistant</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-white/5 text-xs font-semibold text-gray-400">
                Tahap Riset & Pengembangan
              </div>
            </div>

            {/* 3. WHATSAPP AUTOMATION (DISABLED / COMING SOON) */}
            <div
              className="relative flex flex-col justify-between rounded-2xl border-2 border-gray-200 dark:border-white/5 p-6 md:p-7 text-left bg-gray-50/60 dark:bg-[#121214]/60 opacity-75 cursor-not-allowed overflow-hidden"
              title="WhatsApp Automation sedang dalam tahap pengembangan"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-[#25D366] text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
                    <WhatsAppIcon className="w-6 h-6" />
                  </div>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20">
                    Segera Hadir
                  </span>
                </div>

                <h3 className="font-heading text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                  WhatsApp Automation
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-500 leading-relaxed mb-6">
                  Kirim pesan broadcast, sambutan pelanggan otomatis, dan CS chatbot resmi terintegrasi WhatsApp Business API.
                </p>

                {/* Feature Chips */}
                <div className="space-y-2 mb-6 opacity-60">
                  <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                    <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>WhatsApp Cloud API Integration</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                    <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>Customer Service Auto-Responder</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                    <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>Broadcast Pesan Terjadwal</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-white/5 text-xs font-semibold text-gray-400">
                Tahap Riset & Pengembangan
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* LEVEL 2: INSTAGRAM AUTOMATION SUB-DASHBOARD */
        /* ========================================================================= */
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Breadcrumb & Back Navigation */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200 dark:border-white/10">
            <button
              onClick={() => setSelectedPlatform(null)}
              className="inline-flex items-center gap-2 text-sm font-bold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors group"
            >
              <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-white/5 flex items-center justify-center group-hover:bg-gray-200 dark:group-hover:bg-white/10 transition-colors">
                <ArrowLeft className="w-4 h-4" />
              </div>
              <span>Kembali ke Pilihan Platform</span>
            </button>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-pink-500/10 text-pink-600 dark:text-pink-400 border border-pink-500/20">
                <InstagramIcon className="w-3.5 h-3.5" /> Instagram Automation Hub
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="w-3.5 h-3.5" /> Meta Graph API v22.0
              </span>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SUB-CARD 1: KONEKSI AKUN INSTAGRAM */}
          {/* ========================================================================= */}
          {account && account.isActive ? (
            <div className="rounded-2xl border-2 border-emerald-500/20 dark:border-emerald-500/20 p-6 md:p-8 bg-white dark:bg-[#18181b] shadow-sm">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex items-start md:items-center gap-4">
                  {/* Avatar / Profile Picture */}
                  <div className="relative shrink-0">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 p-0.5 shadow-lg shadow-pink-500/20 overflow-hidden">
                      {account.profilePicUrl && !avatarError ? (
                        <img
                          src={account.profilePicUrl}
                          alt={account.username || "Instagram Avatar"}
                          onError={() => setAvatarError(true)}
                          className="w-full h-full object-cover rounded-[14px]"
                        />
                      ) : (
                        <div className="w-full h-full rounded-[14px] bg-white dark:bg-[#18181b] flex items-center justify-center">
                          <InstagramIcon className="w-8 h-8 text-pink-600 dark:text-pink-400" />
                        </div>
                      )}
                    </div>
                    <span
                      className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-white dark:border-[#18181b] rounded-full flex items-center justify-center shadow-sm"
                      title="Akun Terhubung & Aktif"
                    >
                      <Check className="w-3 h-3 text-white stroke-[3]" />
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-xl md:text-2xl font-black font-heading text-gray-900 dark:text-white">
                        @{account.username}
                      </h2>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Terhubung & Aktif
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {account.name || `@${account.username}`} • ID Akun:{" "}
                      <code className="text-xs font-mono bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded">
                        {account.instagramId}
                      </code>
                    </p>
                    <div className="flex items-center gap-3 pt-1 text-xs text-gray-500 dark:text-gray-400 flex-wrap">
                      <span>
                        Status: <strong className="text-emerald-600 dark:text-emerald-400 font-semibold">Aktif 24/7</strong>
                      </span>
                      <span>•</span>
                      <span>
                        Webhook Meta:{" "}
                        <strong className="text-emerald-600 dark:text-emerald-400 font-semibold">
                          Siap Menerima Komentar & DM
                        </strong>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons for Connected Account */}
                <div className="flex items-center gap-2.5 self-start lg:self-auto flex-wrap">
                  <button
                    onClick={handleResyncAccount}
                    disabled={isPending}
                    className="px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300 text-xs font-bold flex items-center gap-2 transition-colors disabled:opacity-50"
                    title="Sinkronkan ulang data profil dari Meta API"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isPending ? "animate-spin" : ""}`} />
                    Sinkronkan Ulang
                  </button>
                  <button
                    onClick={handleStartMetaOAuth}
                    disabled={isPending}
                    className="px-3.5 py-2.5 rounded-xl border border-purple-500/30 hover:bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                    title="Ganti akun Instagram yang terhubung via Meta Login"
                  >
                    <Link2 className="w-3.5 h-3.5" />
                    Ganti Akun
                  </button>
                  <button
                    onClick={handleDisconnect}
                    disabled={isPending}
                    className="px-3.5 py-2.5 rounded-xl border border-rose-500/20 hover:bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                    title="Putuskan koneksi akun ini"
                  >
                    <Unlink className="w-3.5 h-3.5" />
                    Putuskan Koneksi
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* DISCONNECTED STATE */
            <div className="rounded-2xl border-2 border-dashed border-gray-300 dark:border-white/10 p-6 md:p-8 bg-gray-50/50 dark:bg-white/[0.02] shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex items-start sm:items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gray-200 dark:bg-white/10 flex items-center justify-center shrink-0">
                    <InstagramIcon className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-xl font-bold font-heading text-gray-900 dark:text-white">
                        Belum Ada Akun Instagram Terhubung
                      </h2>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                        Terputus / Belum Aktif
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xl">
                      Hubungkan akun Instagram Bisnis atau Kreator Anda untuk mulai mengaktifkan auto-reply komentar postingan/Reels dan pengiriman DM privat otomatis 24/7.
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleStartMetaOAuth}
                  disabled={isPending}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white text-xs md:text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-pink-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] self-start sm:self-auto shrink-0"
                  title="Hubungkan akun Instagram Anda secara resmi via Meta"
                >
                  <InstagramIcon className="w-4 h-4" />
                  Hubungkan Akun Instagram
                </button>
              </div>
            </div>
          )}

          {/* Quick Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#18181b]">
              <span className="text-xs text-gray-500 font-medium">Total Aturan</span>
              <p className="text-2xl font-black text-gray-900 dark:text-white mt-1">{rules.length}</p>
            </div>
            <div className="p-4 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#18181b]">
              <span className="text-xs text-gray-500 font-medium">Aturan Aktif</span>
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                {rules.filter((r: any) => r.isActive).length}
              </p>
            </div>
            <div className="p-4 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#18181b]">
              <span className="text-xs text-gray-500 font-medium">Komentar Dibalas</span>
              <p className="text-2xl font-black text-pink-600 dark:text-pink-400 mt-1">{stats.totalComments}</p>
            </div>
            <div className="p-4 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#18181b]">
              <span className="text-xs text-gray-500 font-medium">DM Terkirim</span>
              <p className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">{stats.totalDms}</p>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SUB-CARD 2: KOMENTAR INSTAGRAM (ATURAN BALASAN & DM) */}
          {/* ========================================================================= */}
          <div className="rounded-2xl border-2 border-gray-200 dark:border-white/10 p-6 md:p-8 bg-white dark:bg-[#18181b] shadow-sm space-y-6">
            {/* Top Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-black font-heading text-gray-900 dark:text-white">
                  Komentar Instagram & Auto DM
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Atur pemicu kata kunci pada komentar postingan/Reels untuk membalas dan mengirimkan DM otomatis.
                </p>
              </div>

              <button
                onClick={handleOpenAddRuleModal}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-pink-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Plus className="w-4 h-4" />
                Tambah Aturan Baru
              </button>
            </div>

            {/* List of Rules */}
            {rules.length === 0 ? (
              <div className="text-center py-12 px-4 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-2xl space-y-4">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-pink-500/10 text-pink-600 dark:text-pink-400 flex items-center justify-center">
                  <Bot className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-gray-900 dark:text-white">Belum Ada Aturan Automasi</h4>
                  <p className="text-sm text-gray-500 max-w-md mx-auto">
                    Buat aturan automasi pertama Anda agar sistem membalas komentar dan mengirim link ke DM followers secara instan.
                  </p>
                </div>
                <button
                  onClick={handleOpenAddRuleModal}
                  className="px-4 py-2 rounded-xl bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 text-xs font-bold transition-colors"
                >
                  + Buat Aturan Sekarang
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {rules.map((rule: any) => {
                  const keywordList = Array.isArray(rule.keywords)
                    ? rule.keywords
                    : typeof rule.keywords === "string"
                    ? JSON.parse(rule.keywords || "[]")
                    : [];

                  const replyTemplate = Array.isArray(rule.commentReplies) && rule.commentReplies.length > 0
                    ? rule.commentReplies[0]
                    : Array.isArray(rule.replyCommentTemplates) && rule.replyCommentTemplates.length > 0
                    ? rule.replyCommentTemplates[0]
                    : rule.commentReplies || rule.replyCommentTemplates || "";

                  const dmTemplate = rule.dmMessage || (Array.isArray(rule.dmTemplates) ? rule.dmTemplates[0] : rule.dmTemplates) || "";

                  return (
                    <div
                      key={rule.id}
                      className={`rounded-xl border transition-all p-5 ${
                        rule.isActive
                          ? "border-pink-500/30 bg-pink-500/[0.02] dark:border-pink-500/20"
                          : "border-gray-200 dark:border-white/5 opacity-70 bg-gray-50/50 dark:bg-white/[0.01]"
                      }`}
                    >
                      {/* Rule Card Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100 dark:border-white/5">
                        <div className="flex items-center gap-3">
                          {/* Toggle Switch */}
                          <button
                            type="button"
                            onClick={() => handleToggleRule(rule.id, rule.isActive)}
                            className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-1 ${
                              rule.isActive ? "bg-emerald-500" : "bg-gray-300 dark:bg-white/20"
                            }`}
                            title={rule.isActive ? "Klik untuk mematikan" : "Klik untuk mengaktifkan"}
                          >
                            <span
                              className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
                                rule.isActive ? "translate-x-5" : "translate-x-0"
                              }`}
                            />
                          </button>

                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-base text-gray-900 dark:text-white">{rule.name}</h4>
                              <span
                                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                  rule.isActive
                                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                                    : "bg-gray-200 dark:bg-white/10 text-gray-600 dark:text-gray-400"
                                }`}
                              >
                                {rule.isActive ? "Aktif" : "Nonaktif"}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500">
                              Target: {rule.triggerType === "SPECIFIC_POST" ? `Post ID: ${rule.specificPostId || "-"}` : "Semua Postingan & Reels"}
                            </p>
                          </div>
                        </div>

                        {/* Edit & Delete Actions */}
                        <div className="flex items-center gap-2 self-end sm:self-auto">
                          <button
                            onClick={() => handleOpenEditRuleModal(rule)}
                            className="p-2 rounded-lg text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                            title="Edit Aturan"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteRule(rule.id, rule.name)}
                            className="p-2 rounded-lg text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 transition-colors"
                            title="Hapus Aturan"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Rule Trigger Keywords */}
                      <div className="py-3 flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold text-gray-500">Kata Kunci Pemicu:</span>
                        {keywordList.length > 0 ? (
                          keywordList.map((kw: string, idx: number) => (
                            <span
                              key={idx}
                              className="px-2.5 py-0.5 rounded-md text-xs font-bold uppercase bg-pink-500/10 text-pink-600 dark:text-pink-400 border border-pink-500/20"
                            >
                              {kw}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs italic text-gray-400">Semua Komentar (Tanpa Filter)</span>
                        )}
                      </div>

                      {/* Rule Action Previews */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                        {/* 1. Reply Comment Box */}
                        <div className="p-3.5 rounded-xl border border-gray-100 dark:border-white/5 bg-white/60 dark:bg-black/20 space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                              <MessageSquare className="w-3.5 h-3.5 text-pink-500" /> Balas Komentar Publik:
                            </span>
                            <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                              Spintax Acak Aktif
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed font-mono bg-gray-50 dark:bg-white/[0.02] p-2 rounded-lg border border-gray-100 dark:border-white/5 line-clamp-2">
                            {replyTemplate || "Tidak membalas komentar publik"}
                          </p>
                        </div>

                        {/* 2. Direct Message Box */}
                        <div className="p-3.5 rounded-xl border border-gray-100 dark:border-white/5 bg-white/60 dark:bg-black/20 space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                              <Send className="w-3.5 h-3.5 text-purple-500" /> Kirim DM Privat:
                            </span>
                            <span className="text-[10px] font-semibold text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded">
                              Auto-DM Aktif
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed font-mono bg-gray-50 dark:bg-white/[0.02] p-2 rounded-lg border border-gray-100 dark:border-white/5 line-clamp-2">
                            {dmTemplate || "Tidak mengirim pesan DM"}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ========================================================================= */}
          {/* RIWAYAT LOG AKTIVITAS AUTOMASI */}
          {/* ========================================================================= */}
          <div className="rounded-2xl border border-gray-200 dark:border-white/10 p-6 bg-white dark:bg-[#18181b] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-base text-gray-900 dark:text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" /> Riwayat Log Automasi Terkini
                </h4>
                <p className="text-xs text-gray-500">
                  Memantau eksekusi balasan komentar dan pengiriman DM secara realtime.
                </p>
              </div>
              <span className="text-xs text-gray-400">{logs.length} Log Terakhir</span>
            </div>

            {logs.length === 0 ? (
              <div className="py-8 text-center text-xs text-gray-400">
                Belum ada aktivitas automasi yang tercatat. Log akan muncul otomatis saat ada user yang berkomentar di Instagram Anda.
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-white/5 max-h-72 overflow-y-auto">
                {logs.map((log: any) => (
                  <div key={log.id} className="py-2.5 flex items-center justify-between text-xs gap-4">
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        @{log.fromUsername || log.commenterUsername || "user"}
                      </span>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-500">
                        Komentar: <span className="text-gray-700 dark:text-gray-300 font-medium">"{log.commentText || "-"}"</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          log.replyCommentStatus === "SENT"
                            ? "bg-emerald-500/10 text-emerald-600"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        Komentar: {log.replyCommentStatus || "N/A"}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          log.dmStatus === "SENT"
                            ? "bg-purple-500/10 text-purple-600"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        DM: {log.dmStatus || "N/A"}
                      </span>
                      <span className="text-gray-400 text-[10px]">
                        {new Date(log.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL FORM: TAMBAH / EDIT ATURAN AUTOMASI */}
      {/* ========================================================================= */}
      {isRuleModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-white dark:bg-[#18181b] border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl p-6 md:p-8 max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-white/10">
              <div>
                <h3 className="text-lg font-black font-heading text-gray-900 dark:text-white">
                  {editingRule ? "Edit Aturan Automasi" : "Tambah Aturan Automasi Baru"}
                </h3>
                <p className="text-xs text-gray-500">
                  Konfigurasikan pemicu kata kunci, variasi balasan komentar, dan pesan DM otomatis.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsRuleModalOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRule} className="space-y-5">
              {/* Nama Aturan */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  Nama Aturan
                </label>
                <input
                  type="text"
                  required
                  value={ruleFormData.name}
                  onChange={(e) => setRuleFormData({ ...ruleFormData, name: e.target.value })}
                  placeholder="Misal: Promo Ebook Ramadhan - Kata Kunci MAU"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500/50"
                />
              </div>

              {/* Target Postingan & Kata Kunci */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    Target Postingan
                  </label>
                  <select
                    value={ruleFormData.postType}
                    onChange={(e) => setRuleFormData({ ...ruleFormData, postType: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500/50"
                  >
                    <option value="ALL">Semua Postingan & Reels</option>
                    <option value="SPECIFIC">Postingan Tertentu (Spesifik)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    Kata Kunci Pemicu (Pisahkan dengan koma)
                  </label>
                  <input
                    type="text"
                    value={ruleFormData.keywords}
                    onChange={(e) => setRuleFormData({ ...ruleFormData, keywords: e.target.value })}
                    placeholder="mau, harga, spill, link, ebook"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500/50 font-mono"
                  />
                </div>
              </div>

              {ruleFormData.postType === "SPECIFIC" && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    Instagram Media / Post ID
                  </label>
                  <input
                    type="text"
                    value={ruleFormData.postId}
                    onChange={(e) => setRuleFormData({ ...ruleFormData, postId: e.target.value })}
                    placeholder="Masukkan ID Postingan Instagram (contoh: 179823482390234)"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500/50 font-mono"
                  />
                </div>
              )}

              {/* Template Balas Komentar */}
              <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-white/5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-pink-500" />
                    Template Balas Komentar (Mendukung Spintax Anti-Ban)
                  </label>
                  <button
                    type="button"
                    onClick={() => setSpintaxPreview(parseSpintax(ruleFormData.replyCommentTemplates))}
                    className="text-[11px] font-bold text-pink-600 dark:text-pink-400 hover:underline flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" /> Coba Acak Spintax
                  </button>
                </div>
                <textarea
                  rows={3}
                  value={ruleFormData.replyCommentTemplates}
                  onChange={(e) => {
                    setRuleFormData({ ...ruleFormData, replyCommentTemplates: e.target.value });
                    setSpintaxPreview(parseSpintax(e.target.value));
                  }}
                  placeholder="Gunakan {opsi1|opsi2} untuk acak kata. Contoh: {Halo|Hai|Kak} @username, cek DM ya!"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500/50 font-mono"
                />
                {/* Spintax Live Result */}
                <div className="p-2.5 rounded-lg bg-pink-500/5 border border-pink-500/10 text-xs text-gray-600 dark:text-gray-400">
                  <span className="font-bold text-pink-600 dark:text-pink-400">Preview Variasi Acak: </span>
                  <span className="italic font-mono">{spintaxPreview}</span>
                </div>
              </div>

              {/* Template Pesan DM */}
              <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-white/5">
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                  <Send className="w-3.5 h-3.5 text-purple-500" />
                  Template Pesan DM Privat (Otomatis Dikirim ke Inbox)
                </label>
                <textarea
                  rows={4}
                  value={ruleFormData.dmTemplates}
                  onChange={(e) => setRuleFormData({ ...ruleFormData, dmTemplates: e.target.value })}
                  placeholder="Halo @username! Terima kasih atas responnya. Ini link detailnya: https://..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 font-mono"
                />
                <span className="text-[11px] text-gray-400 block">
                  Tip: Sertakan link checkout produk atau panduan lengkap yang ingin Anda bagikan.
                </span>
              </div>

              {/* Toggle Aktifkan */}
              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="isActiveToggle"
                  checked={ruleFormData.isActive}
                  onChange={(e) => setRuleFormData({ ...ruleFormData, isActive: e.target.checked })}
                  className="w-4 h-4 rounded text-pink-600 focus:ring-pink-500 border-gray-300"
                />
                <label htmlFor="isActiveToggle" className="text-xs font-semibold text-gray-700 dark:text-gray-300 cursor-pointer">
                  Langsung aktifkan aturan ini setelah disimpan
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setIsRuleModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-xs font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-pink-500/20 transition-all hover:scale-[1.02] disabled:opacity-50"
                >
                  {isPending ? "Menyimpan..." : editingRule ? "Simpan Perubahan" : "Buat Aturan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
