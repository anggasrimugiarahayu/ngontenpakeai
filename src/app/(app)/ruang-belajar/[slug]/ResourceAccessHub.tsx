"use client";

import React, { useState } from "react";
import {
  ExternalLink,
  Copy,
  Check,
  Key,
  MessageSquare,
  ShieldCheck,
  BookOpen,
  Star,
} from "lucide-react";
import { BackButton } from "@/components/ui/BackButton";
import ProductActions from "./ProductActions";
import ReviewSection from "./ReviewSection";
import toast from "react-hot-toast";

interface ResourceData {
  targetUrl: string;
  buttonText?: string;
  instructions?: string;
  accessPassword?: string;
  supportUrl?: string;
}

interface ResourceAccessHubProps {
  ebook: any;
  isFavorite: boolean;
  favoriteCount: number;
  userReview: any;
  userId?: string | null;
}

export default function ResourceAccessHub({
  ebook,
  isFavorite,
  favoriteCount,
  userReview,
  userId,
}: ResourceAccessHubProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedPass, setCopiedPass] = useState(false);
  const [activeTab, setActiveTab] = useState<"instructions" | "reviews">("instructions");

  // Parse resource data
  const resourceData: ResourceData = React.useMemo(() => {
    if (!ebook.resourceData) {
      return {
        targetUrl: ebook.fileUrl || "",
        buttonText: "Buka Template Notion ↗",
        instructions: "",
      };
    }
    if (typeof ebook.resourceData === "object") {
      return ebook.resourceData;
    }
    try {
      return JSON.parse(ebook.resourceData);
    } catch {
      return {
        targetUrl: ebook.fileUrl || "",
        buttonText: "Buka Template Notion ↗",
        instructions: "",
      };
    }
  }, [ebook.resourceData, ebook.fileUrl]);

  const handleCopyLink = () => {
    if (!resourceData.targetUrl) return;
    navigator.clipboard.writeText(resourceData.targetUrl);
    setCopiedLink(true);
    toast.success("Tautan berhasil disalin ke clipboard!");
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyPassword = () => {
    if (!resourceData.accessPassword) return;
    navigator.clipboard.writeText(resourceData.accessPassword);
    setCopiedPass(true);
    toast.success("Password berhasil disalin!");
    setTimeout(() => setCopiedPass(false), 2000);
  };

  const instructionsList = resourceData.instructions
    ? resourceData.instructions
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gray-50 dark:bg-[#0A1128] text-gray-900 dark:text-white flex flex-col">
      {/* Sticky Header Toolbar */}
      <header className="sticky top-0 z-30 h-16 border-b border-gray-200 dark:border-[#2C3246] bg-white/95 dark:bg-[#0A1128]/95 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <BackButton
            href="/ruang-belajar"
            onClick={() => {
              window.location.href = "/ruang-belajar";
            }}
          />
          <div className="min-w-0">
            <h1 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white truncate">
              {ebook.title}
            </h1>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 truncate">
              {ebook.category?.name || "Template & Resource Vault"}
            </p>
          </div>
        </div>

        <ProductActions
          productId={ebook.id}
          initialIsFavorite={isFavorite}
          initialFavoriteCount={favoriteCount}
          canReview={true}
          userReview={userReview}
        />
      </header>

      {/* Main Vault Content */}
      <div className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* HERO CARD ACCESS (STANDAR TOOLS KITA) */}
        <div className="bg-white dark:bg-[#141B31] border border-gray-200 dark:border-[#2C3246] rounded-2xl p-6 sm:p-8 shadow-sm">
          {/* Access Badge */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40">
              <ShieldCheck size={14} className="text-emerald-600" />
              <span>Akses Eksklusif Aktif</span>
            </div>
            <span className="text-xs text-gray-400 font-medium">Akses Seumur Hidup</span>
          </div>

          {/* Cover & Title Details */}
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            {ebook.coverUrl && (
              <img
                src={ebook.coverUrl}
                alt={ebook.title}
                className="w-24 h-32 sm:w-28 sm:h-38 object-cover rounded-xl shadow-sm border border-gray-200 dark:border-[#2C3246] shrink-0"
              />
            )}

            <div className="flex-1">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white leading-tight mb-3">
                {ebook.title}
              </h2>
              {ebook.description && (
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-3 mb-6">
                  {ebook.description}
                </p>
              )}

              {/* ACTION BUTTONS (STANDAR PRIMARY & SECONDARY) */}
              <div className="flex flex-wrap items-center gap-3">
                {resourceData.targetUrl ? (
                  <a
                    href={resourceData.targetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm text-white bg-[#f97316] hover:bg-[#ea580c] dark:bg-[#f97316] dark:hover:bg-[#fb923c] shadow-sm shadow-orange-500/20 hover:shadow-md transition-all cursor-pointer"
                  >
                    <span>{resourceData.buttonText || "Buka Template Notion ↗"}</span>
                    <ExternalLink size={16} />
                  </a>
                ) : (
                  <div className="px-4 py-3 bg-amber-50 text-amber-700 rounded-xl text-xs font-medium border border-amber-200">
                    ⚠️ Tautan template sedang dipersiapkan oleh admin.
                  </div>
                )}

                {resourceData.targetUrl && (
                  <button
                    onClick={handleCopyLink}
                    className="inline-flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl font-bold text-xs bg-white hover:bg-gray-50 dark:bg-[#141B31] dark:hover:bg-white/5 border border-gray-200 dark:border-[#2C3246] text-gray-700 dark:text-gray-200 transition-all cursor-pointer"
                  >
                    {copiedLink ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                    <span>{copiedLink ? "Tautan Tersalin!" : "Salin Link"}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* TABBED CONTAINER: PANDUAN PENGGUNAAN & ULASAN */}
        <div className="bg-white dark:bg-[#141B31] border border-gray-200 dark:border-[#2C3246] rounded-2xl p-5 sm:p-6 shadow-sm">
          {/* Tab Headers */}
          <div className="flex border-b border-gray-200 dark:border-[#2C3246] gap-6 text-sm font-bold mb-6">
            <button
              onClick={() => setActiveTab("instructions")}
              className={`pb-3 transition-colors relative cursor-pointer ${
                activeTab === "instructions"
                  ? "text-rn-accent"
                  : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <span className="flex items-center gap-2">
                <BookOpen size={16} /> Panduan Penggunaan
              </span>
              {activeTab === "instructions" && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-rn-accent rounded-full" />
              )}
            </button>

            <button
              onClick={() => setActiveTab("reviews")}
              className={`pb-3 transition-colors relative cursor-pointer ${
                activeTab === "reviews"
                  ? "text-rn-accent"
                  : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <span className="flex items-center gap-2">
                <Star size={16} /> Ulasan & Diskusi ({ebook.reviews?.length || 0})
              </span>
              {activeTab === "reviews" && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-rn-accent rounded-full" />
              )}
            </button>
          </div>

          {/* Tab Content */}
          <div>
            {activeTab === "instructions" && (
              <div className="space-y-6">
                {instructionsList.length > 0 ? (
                  <div className="space-y-3">
                    {instructionsList.map((step, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 p-3.5 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-[#2C3246]"
                      >
                        <span className="w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-900/50 font-extrabold text-xs flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                          {step.replace(/^\d+[\.\)]\s*/, "")}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3.5 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-[#2C3246]">
                      <span className="w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-900/50 font-extrabold text-xs flex items-center justify-center shrink-0 mt-0.5">
                        1
                      </span>
                      <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                        Klik tombol <strong>&quot;Buka Template Notion ↗&quot;</strong> di atas untuk membuka tautan template di tab baru browser Anda.
                      </p>
                    </div>

                    <div className="flex items-start gap-3 p-3.5 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-[#2C3246]">
                      <span className="w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-900/50 font-extrabold text-xs flex items-center justify-center shrink-0 mt-0.5">
                        2
                      </span>
                      <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                        Di pojok kanan atas halaman Notion, klik tombol <strong>&quot;Duplicate&quot;</strong> (Duplikat). Pastikan Anda sudah login ke akun Notion Anda.
                      </p>
                    </div>

                    <div className="flex items-start gap-3 p-3.5 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-[#2C3246]">
                      <span className="w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-900/50 font-extrabold text-xs flex items-center justify-center shrink-0 mt-0.5">
                        3
                      </span>
                      <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                        Pilih workspace Notion pribadi Anda. Template akan otomatis tersalin dan siap Anda gunakan atau sesuaikan sepuasnya!
                      </p>
                    </div>
                  </div>
                )}

                {/* INFORMASI TAMBAHAN: PASSWORD & SUPPORT URL (JIKA ADA) */}
                {(resourceData.accessPassword || resourceData.supportUrl) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-100 dark:border-[#2C3246]">
                    {resourceData.accessPassword && (
                      <div className="p-4 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-[#2C3246] rounded-xl flex flex-col justify-between">
                        <div>
                          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1 flex items-center gap-1.5">
                            <Key size={14} className="text-amber-500" /> Password Akses
                          </span>
                          <div className="font-mono text-sm font-bold text-gray-900 dark:text-white bg-white dark:bg-black/30 p-2.5 rounded-lg border border-gray-200 dark:border-[#2C3246] select-all">
                            {resourceData.accessPassword}
                          </div>
                        </div>
                        <button
                          onClick={handleCopyPassword}
                          className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-rn-accent hover:underline cursor-pointer"
                        >
                          {copiedPass ? <Check size={14} /> : <Copy size={14} />}
                          <span>{copiedPass ? "Password Tersalin!" : "Salin Password"}</span>
                        </button>
                      </div>
                    )}

                    {resourceData.supportUrl && (
                      <div className="p-4 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-[#2C3246] rounded-xl flex flex-col justify-between">
                        <div>
                          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1 flex items-center gap-1.5">
                            <MessageSquare size={14} className="text-blue-500" /> Grup Komunitas / Support
                          </span>
                          <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed mb-3">
                            Bergabung dengan ruang diskusi dan dapatkan update template versi terbaru.
                          </p>
                        </div>
                        <a
                          href={resourceData.supportUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                        >
                          <span>Gabung Grup Diskusi</span>
                          <ExternalLink size={13} />
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === "reviews" && (
              <ReviewSection
                productId={ebook.id}
                reviews={ebook.reviews}
                canReview={true}
                userReview={userReview}
                noMargin={true}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
