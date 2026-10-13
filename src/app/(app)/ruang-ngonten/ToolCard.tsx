"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Lock, Compass } from "lucide-react";

export default function ToolCard({
  feature,
  hasBlueprint,
  isPro = false,
  isLoggedIn = true,
}: {
  feature: any;
  hasBlueprint: boolean;
  isPro?: boolean;
  isLoggedIn?: boolean;
}) {
  const [showError, setShowError] = useState(false);

  const Icon = feature.icon;
  const isMasterBlueprint = feature.href === "/ruang-ngonten/master-blueprint";
  const isProOnly = feature.isProOnly;
  const isActive = feature.isActive;
  const isBlueprintLocked = !hasBlueprint && !isMasterBlueprint;
  const canAccess = (isMasterBlueprint || hasBlueprint) && isActive && (!isProOnly || isPro);

  const router = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isLoggedIn) {
      router.push(`/login?redirect=${feature.href}`);
      return;
    }

    if (!canAccess) {
      if (!isActive) {
        setShowError(true);
        setTimeout(() => setShowError(false), 3000);
      } else if (isProOnly && !isPro) {
        router.push("/?pricing=true");
      } else if (isBlueprintLocked) {
        window.dispatchEvent(
          new CustomEvent("open-blueprint-modal", {
            detail: { toolName: feature.title },
          })
        );
      }
      return;
    }

    // Instant shallow routing if already inside /ruang-ngonten
    if (window.location.pathname.startsWith("/ruang-ngonten")) {
      window.history.pushState(null, "", feature.href);
      window.dispatchEvent(new Event("app-shallow-navigate"));
    } else {
      router.push(feature.href);
    }
  };

  const cardContent = (
    <>
      {/* Maintenance Overlay if inactive */}
      {!isActive && showError && (
        <div className="absolute inset-0 bg-red-500/10 backdrop-blur-[1px] flex flex-col items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="bg-red-50 dark:bg-red-950/80 text-red-600 dark:text-red-400 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-2 shadow-sm border border-red-200 dark:border-red-900">
            <AlertCircle className="w-4 h-4" />
            Sedang Maintenance
          </div>
        </div>
      )}

      {/* Card Header */}
      <div className="flex items-center gap-3 mb-3">
        <div
          className={`w-10 h-10 rounded-xl bg-gray-50 dark:bg-white/5 flex items-center justify-center transition-colors ${
            canAccess
              ? "text-gray-600 dark:text-gray-400 group-hover:bg-rn-accent/10 group-hover:text-rn-accent"
              : isBlueprintLocked
              ? "text-orange-500 group-hover:bg-orange-500/10"
              : "text-gray-500"
          }`}
        >
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex flex-col gap-1 w-full">
          <div className="flex items-start justify-between w-full">
            <h3
              className={`font-bold text-base leading-tight transition-colors ${
                canAccess
                  ? "text-gray-900 dark:text-white group-hover:text-rn-accent"
                  : isBlueprintLocked
                  ? "text-gray-900 dark:text-white group-hover:text-orange-500"
                  : "text-gray-900 dark:text-white"
              }`}
            >
              {feature.title}
            </h3>
            <div className="flex items-center gap-1 shrink-0">
              {isBlueprintLocked ? (
                <span className="text-[9px] font-bold bg-orange-50 text-orange-600 dark:bg-orange-950/60 dark:text-orange-400 px-1.5 py-0.5 rounded flex items-center gap-1 border border-orange-200 dark:border-orange-800/40">
                  <Lock className="w-2.5 h-2.5" /> Butuh Blueprint
                </span>
              ) : isProOnly ? (
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                    !isPro
                      ? "bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400"
                      : "bg-gray-100 text-gray-500 dark:bg-white/10 dark:text-gray-400"
                  }`}
                >
                  PRO
                </span>
              ) : (
                <span className="text-[9px] font-bold bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 px-1.5 py-0.5 rounded">
                  FREE
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-[13px] leading-relaxed text-gray-500 dark:text-gray-400 mb-5 line-clamp-2">
        {feature.description}
      </p>

      {/* Timeline List */}
      <div className="relative ml-1.5 space-y-3 mb-2">
        <div className="absolute left-[3px] top-1.5 bottom-1.5 w-[2px] bg-gray-200 dark:bg-white/5" />

        {feature.points.map((point: string, pIdx: number) => (
          <div key={pIdx} className="relative flex items-center gap-3">
            <div
              className={`w-2 h-2 rounded-full z-10 transition-colors ${
                pIdx === 0
                  ? canAccess
                    ? "bg-rn-accent ring-4 ring-rn-accent/20"
                    : isBlueprintLocked
                    ? "bg-orange-400 ring-4 ring-orange-400/20"
                    : "bg-gray-400 ring-4 ring-gray-400/20"
                  : `bg-gray-300 dark:bg-gray-600 ${
                      canAccess ? "group-hover:bg-rn-accent/50" : ""
                    }`
              }`}
            />
            <span
              className={`text-[11px] font-medium transition-colors ${
                pIdx === 0
                  ? "text-gray-900 dark:text-white"
                  : `text-gray-500 dark:text-gray-400 ${
                      canAccess
                        ? "group-hover:text-gray-400 dark:group-hover:text-gray-300"
                        : ""
                    }`
              }`}
            >
              {point}
            </span>
          </div>
        ))}
      </div>

      {/* Blueprint requirement banner on card hover/footer */}
      {isBlueprintLocked && (
        <div className="mt-auto pt-3 border-t border-gray-100 dark:border-white/5 flex items-center justify-between text-[11px] text-orange-600 dark:text-orange-400 font-semibold transition-colors">
          <span className="flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-orange-500 shrink-0" />
            Wajib Isi Blueprint
          </span>
          <span className="text-[10px] text-orange-500 font-bold group-hover:underline">
            Klik untuk Buka &rarr;
          </span>
        </div>
      )}
    </>
  );

  const cardClasses = `group relative flex flex-col justify-start rounded-xl border-2 p-5 text-left transition-all duration-300 cursor-pointer z-0 overflow-hidden bg-white dark:bg-[#18181b] border-gray-200 dark:border-white/5 ${
    canAccess
      ? "hover:border-rn-accent dark:hover:border-rn-accent/50 hover:shadow-xl hover:-translate-y-1.5 shadow-gray-200 dark:shadow-black/50"
      : isBlueprintLocked
      ? "hover:border-orange-500/60 dark:hover:border-orange-500/60 hover:shadow-lg hover:-translate-y-1"
      : "opacity-80 hover:border-red-500/50 dark:hover:border-red-500/50"
  }`;

  const tooltipTitle = isBlueprintLocked
    ? `Wajib mengisi Master Blueprint terlebih dahulu agar AI memahami persona & topik bisnismu. Klik untuk buka panduan.`
    : undefined;

  if (!canAccess) {
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") handleClick(e as any);
        }}
        title={tooltipTitle}
        className={cardClasses}
      >
        {cardContent}
      </div>
    );
  }

  return (
    <Link
      href={feature.href}
      onClick={handleClick}
      title={tooltipTitle}
      className={cardClasses}
    >
      {cardContent}
    </Link>
  );
}
