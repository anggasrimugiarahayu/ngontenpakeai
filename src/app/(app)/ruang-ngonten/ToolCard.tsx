"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";

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
  const isBlueprintLocked = isPro && !hasBlueprint && !isMasterBlueprint;
  const canAccess = (isMasterBlueprint || hasBlueprint) && isActive && (!isProOnly || isPro);

  const router = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    if (!isLoggedIn) {
      e.preventDefault();
      router.push(`/login?redirect=${feature.href}`);
      return;
    }

    if (!canAccess) {
      e.preventDefault();

      if (!isActive) {
        setShowError(true);
        setTimeout(() => setShowError(false), 3000);
      } else if (isProOnly && !isPro) {
        // User Free atau User PRO BOOK: arahkan ke halaman langganan paket tools
        router.push("/?pricing=true");
      } else if (isBlueprintLocked) {
        // User PRO TOOLS / PRO PLUS yang belum isi blueprint: munculkan modal
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
      e.preventDefault();
      window.history.pushState(null, "", feature.href);
      window.dispatchEvent(new Event("app-shallow-navigate"));
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
                  : "text-gray-900 dark:text-white"
              }`}
            >
              {feature.title}
            </h3>
            <div className="flex items-center gap-1 shrink-0">
              {isProOnly ? (
                !isPro ? (
                  // User belum langganan paket tools (User Free atau PRO BOOK)
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400">
                    PRO
                  </span>
                ) : !hasBlueprint ? (
                  // User SUDAH langganan PRO TOOLS / PRO PLUS tapi belum isi blueprint
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400">
                    Butuh Blueprint
                  </span>
                ) : (
                  // User SUDAH langganan PRO dan blueprint aktif
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 dark:bg-white/10 dark:text-gray-400">
                    PRO
                  </span>
                )
              ) : (
                // Fitur gratis
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
      <div className="relative ml-1.5 space-y-3">
        <div className="absolute left-[3px] top-1.5 bottom-1.5 w-[2px] bg-gray-200 dark:bg-white/5" />

        {feature.points.map((point: string, pIdx: number) => (
          <div key={pIdx} className="relative flex items-center gap-3">
            <div
              className={`w-2 h-2 rounded-full z-10 transition-colors ${
                pIdx === 0
                  ? canAccess
                    ? "bg-rn-accent ring-4 ring-rn-accent/20"
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
    </>
  );

  const cardClasses = `group relative flex flex-col justify-start rounded-xl border-2 p-5 text-left transition-all duration-300 cursor-pointer z-0 overflow-hidden bg-white dark:bg-[#18181b] border-gray-200 dark:border-white/5 ${
    !canAccess
      ? "opacity-80 hover:border-gray-300 dark:hover:border-white/20"
      : "hover:border-rn-accent dark:hover:border-rn-accent/50 shadow-gray-200 dark:shadow-black/50 hover:shadow-xl hover:-translate-y-1.5"
  }`;

  if (!canAccess) {
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") handleClick(e as any);
        }}
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
      className={cardClasses}
    >
      {cardContent}
    </Link>
  );
}
