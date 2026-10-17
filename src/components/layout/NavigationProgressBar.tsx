"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function NavigationProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const finishTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const clearTimers = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (finishTimeoutRef.current) {
      clearTimeout(finishTimeoutRef.current);
      finishTimeoutRef.current = null;
    }
  }, []);

  const completeProgress = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setProgress(100);
    if (finishTimeoutRef.current) clearTimeout(finishTimeoutRef.current);
    finishTimeoutRef.current = setTimeout(() => {
      setLoading(false);
      setProgress(0);
    }, 320);
  }, []);

  const startProgress = useCallback(
    (isShallow = false) => {
      clearTimers();
      setLoading(true);
      setProgress(1);

      let current = 1;
      if (isShallow) {
        // Fast smooth 1% -> 100% animation for instant shallow card navigations
        timerRef.current = setInterval(() => {
          current += Math.floor(Math.random() * 18) + 16;
          if (current >= 100) {
            completeProgress();
          } else {
            setProgress(current);
          }
        }, 45);
      } else {
        // Real route transition: smooth 1% -> 95% progression while waiting for route commit
        timerRef.current = setInterval(() => {
          if (current < 35) {
            current += Math.floor(Math.random() * 12) + 6;
          } else if (current < 70) {
            current += Math.floor(Math.random() * 8) + 4;
          } else if (current < 90) {
            current += Math.floor(Math.random() * 3) + 1;
          } else if (current < 96) {
            current += 1;
          }
          setProgress(Math.min(96, current));
        }, 90);
      }
    },
    [clearTimers, completeProgress]
  );

  // When pathname or searchParams change, route change is complete!
  useEffect(() => {
    if (loading) {
      completeProgress();
    }
  }, [pathname, searchParams, completeProgress]);

  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      if (e.defaultPrevented) return;

      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;

      const href = target.getAttribute("href");
      if (!href) return;

      if (
        href.startsWith("http") ||
        href.startsWith("//") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        href.startsWith("#") ||
        target.target === "_blank" ||
        target.hasAttribute("download") ||
        e.ctrlKey ||
        e.metaKey ||
        e.shiftKey ||
        e.altKey
      ) {
        return;
      }

      const currentUrl = window.location.pathname + window.location.search;
      if (href === currentUrl || href === window.location.pathname) {
        return;
      }

      startProgress(false);
    };

    const handleCustomStart = () => startProgress(false);
    const handleShallowNavigate = () => startProgress(true);
    const handleCustomStop = () => completeProgress();

    document.addEventListener("click", handleDocumentClick);
    window.addEventListener("app-loading-start", handleCustomStart);
    window.addEventListener("app-shallow-navigate", handleShallowNavigate);
    window.addEventListener("app-loading-stop", handleCustomStop);

    return () => {
      document.removeEventListener("click", handleDocumentClick);
      window.removeEventListener("app-loading-start", handleCustomStart);
      window.removeEventListener("app-shallow-navigate", handleShallowNavigate);
      window.removeEventListener("app-loading-stop", handleCustomStop);
      clearTimers();
    };
  }, [startProgress, completeProgress, clearTimers]);

  if (!loading && progress === 0) return null;

  return (
    <>
      {/* 1. Top Gradient Glowing Bar */}
      <div className="fixed top-0 left-0 right-0 z-[9999] pointer-events-none transition-opacity duration-300">
        <div
          className="h-[3px] bg-gradient-to-r from-orange-600 via-orange-500 to-amber-400 shadow-[0_0_12px_rgba(249,115,22,0.9)] transition-all duration-150 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* 2. Floating Percentage Counter Pill (Pojok Kanan Bawah) */}
      <div className="fixed bottom-5 right-5 z-[9999] pointer-events-none animate-in fade-in slide-in-from-bottom-2 duration-200">
        <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-black/85 dark:bg-[#18181b]/95 backdrop-blur-md border border-white/10 text-white shadow-2xl text-[12px] font-semibold font-mono tracking-tight">
          <span
            className={`w-2 h-2 rounded-full ${
              progress === 100 ? "bg-emerald-400" : "bg-orange-500 animate-ping"
            }`}
          />
          <span className="text-gray-300">
            {progress === 100 ? "Selesai" : "Memuat"}
          </span>
          <span className="text-orange-400 font-bold">{Math.min(100, progress)}%</span>
        </div>
      </div>
    </>
  );
}
