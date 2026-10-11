"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function NavigationProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // When pathname or searchParams change, route change is complete!
  useEffect(() => {
    if (loading) {
      if (timerRef.current) clearInterval(timerRef.current);
      setProgress(100);
      const finishTimer = setTimeout(() => {
        setLoading(false);
        setProgress(0);
      }, 300);
      return () => clearTimeout(finishTimer);
    }
  }, [pathname, searchParams]);

  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      // Find nearest link
      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;

      const href = target.getAttribute("href");
      if (!href) return;

      // Ignore external, anchors, downloads, new tabs, modifier keys
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

      // Check if href is different from current page
      const currentUrl = window.location.pathname + window.location.search;
      if (href === currentUrl || href === window.location.pathname) {
        return;
      }

      startProgress();
    };

    const handleCustomStart = () => startProgress();
    const handleCustomStop = () => {
      if (timerRef.current) clearInterval(timerRef.current);
      setProgress(100);
      setTimeout(() => {
        setLoading(false);
        setProgress(0);
      }, 300);
    };

    document.addEventListener("click", handleDocumentClick);
    window.addEventListener("app-loading-start", handleCustomStart);
    window.addEventListener("app-loading-stop", handleCustomStop);

    return () => {
      document.removeEventListener("click", handleDocumentClick);
      window.removeEventListener("app-loading-start", handleCustomStart);
      window.removeEventListener("app-loading-stop", handleCustomStop);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startProgress = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setLoading(true);
    setProgress(15);

    let current = 15;
    timerRef.current = setInterval(() => {
      // Step incrementally towards 90%
      if (current < 45) {
        current += Math.floor(Math.random() * 15) + 8;
      } else if (current < 75) {
        current += Math.floor(Math.random() * 8) + 4;
      } else if (current < 92) {
        current += Math.floor(Math.random() * 3) + 1;
      }
      setProgress(current);
    }, 120);
  };

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
