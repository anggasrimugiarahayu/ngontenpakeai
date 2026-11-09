"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Sun, Moon } from "lucide-react";

export function CuanFacelessNavbar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { data: session, status } = useSession();

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted ? theme === "dark" : false;

  return (
    <header className="w-full px-5 sm:px-8 pt-4 sm:pt-5 pb-2 sm:pb-3 flex items-center justify-between bg-white select-none">
      {/* Brand Logo on the Left */}
      <Link
        href="/"
        className="font-bold font-heading text-[15px] sm:text-[16px] tracking-tight text-gray-900 hover:text-orange-500 transition-colors"
      >
        ruangcreativemuslim
      </Link>

      {/* Right Controls: Light/Dark Toggle + Login Button */}
      <div className="flex items-center gap-2.5 sm:gap-3.5">
        <button
          onClick={() => setTheme(isDark ? "light" : "dark")}
          className="p-1.5 text-gray-400 hover:text-orange-500 transition-colors rounded-lg"
          aria-label="Toggle Light/Dark Theme"
        >
          {isDark ? (
            <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
          ) : (
            <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 hover:text-orange-500" />
          )}
        </button>

        {status === "loading" ? (
          <div className="w-16 h-8 bg-gray-100 rounded-lg sm:rounded-xl animate-pulse" />
        ) : session ? (
          <Link
            href="/dashboard"
            className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm transition-all bg-orange-500 text-white hover:bg-orange-600 shadow-xs"
          >
            Dashboard
          </Link>
        ) : (
          <Link
            href="/login"
            className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm transition-all bg-orange-500 text-white hover:bg-orange-600 shadow-xs"
          >
            Login
          </Link>
        )}
      </div>
    </header>
  );
}
