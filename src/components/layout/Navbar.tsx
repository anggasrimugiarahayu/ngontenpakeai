"use client";

import Link from "next/link";
import Image from "next/image";
import { User, BookOpen, Sun, Moon, LogOut } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { usePathname, useSearchParams } from "next/navigation";

interface NavbarProps {
  followerCount?: string;
  memberCount?: string;
}

export function Navbar({ followerCount = "144K", memberCount = "0" }: NavbarProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isPricingParam = searchParams?.get("pricing") === "true";
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(isPricingParam);

  useEffect(() => {
    setIsPricingModalOpen(isPricingParam);
  }, [isPricingParam]);

  useEffect(() => {
    const handlePricing = (e: any) => {
      if (typeof e.detail === "boolean") {
        setIsPricingModalOpen(e.detail);
      }
    };
    window.addEventListener("pricing-change", handlePricing);
    return () => window.removeEventListener("pricing-change", handlePricing);
  }, []);

  const isPricing = (pathname === "/" || pathname === "") && (isPricingParam || isPricingModalOpen);
  const [followers, setFollowers] = useState(followerCount);

  useEffect(() => {
    setMounted(true);
    fetch("/api/instagram")
      .then((res) => res.json())
      .then((data) => {
        if (data.followers) {
          const formatted = Math.floor(data.followers / 1000) + "K";
          setFollowers(formatted);
        }
      })
      .catch((err) => console.error("Error loading follower count:", err));
  }, []);

  const isDark = mounted ? theme === "dark" : true;
  
  // For now, mock the subscription status
  const isPro = false; 

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 transition-colors duration-300 backdrop-blur-md bg-gray-50/80 dark:bg-[#0f0f11]/80">
      <div className="flex items-center gap-2">
        <Link
          href="/"
          className="font-black font-heading text-[16px] sm:text-[22px] tracking-tight transition-colors duration-300 text-gray-900 dark:text-white"
        >
          Ngonten Pake AI
        </Link>
      </div>

      <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-6 text-sm font-medium text-gray-400">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>{" "}
          <span className="text-emerald-500 font-bold uppercase tracking-wide">
            LIVE
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <User className="w-4 h-4" />{" "}
          <span className="font-bold transition-colors text-gray-900 dark:text-white">
            {followers}
          </span>{" "}
          Follower
        </div>
        <div className="flex items-center gap-1.5">
          <BookOpen className="w-4 h-4" />{" "}
          <span className="font-bold transition-colors text-gray-900 dark:text-white">
            {memberCount}
          </span>{" "}
          Member
        </div>
      </div>

      <div className="flex items-center gap-4">
        {!session && status !== "loading" && (
          <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="text-gray-400 hover:text-rn-accent transition-colors"
          >
            {isDark ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </button>
        )}


        {status === "loading" ? (
          <div className="w-20 h-8 bg-gray-700/20 rounded-full animate-pulse" />
        ) : session ? (
          <div className="flex items-center gap-3">
            {/* Badge Free / Pro */}
            <div className={`px-2 py-0.5 rounded-md text-xs font-bold border ${
              isPro 
                ? "bg-purple-500/10 text-purple-500 border-purple-500/20" 
                : "bg-gray-500/10 text-gray-400 border-gray-500/20"
            }`}>
              {isPro ? "PRO" : "Free"}
            </div>

            {/* Upgrade Button (hides if Pro or if already on pricing view) */}
            {!isPro && !isPricing && (
              <Link
                href="/?pricing=true"
                className="px-4 py-1.5 rounded-full font-bold text-sm transition-all bg-orange-500 text-white hover:bg-orange-600"
              >
                Upgrade
              </Link>
            )}

            {/* Profile Picture with Dropdown (simplified) */}
            <div className="relative group cursor-pointer">
              {session.user?.image ? (
                <Image
                  src={session.user.image}
                  alt="Profile"
                  width={32}
                  height={32}
                  className="rounded-full ring-2 ring-gray-700/50"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-white font-bold">
                  {session.user?.name?.charAt(0) || "U"}
                </div>
              )}
              
              {/* Dropdown Menu */}
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#18181b] border border-gray-200 dark:border-white/10 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 overflow-hidden z-50">
                <div className="p-3 border-b border-gray-200 dark:border-white/5">
                  <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{session.user?.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{session.user?.email}</p>
                </div>
                <div className="py-1">
                  <Link href="/pengaturan" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white transition-colors">
                    Pengaturan
                  </Link>
                  <Link href="/bantuan" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white transition-colors">
                    Bantuan
                  </Link>
                  {isPro && (
                    <Link href="/feedback" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white transition-colors">
                      Feedback
                    </Link>
                  )}
                  <button
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    className="w-full flex items-center justify-start gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white transition-colors text-left"
                  >
                    {mounted && theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                    {mounted && theme === "dark" ? "Light mode" : "Dark mode"}
                  </button>
                </div>
                <div className="py-1 border-t border-gray-200 dark:border-white/5">
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="w-full flex items-center justify-start gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <Link
            href="/login"
            className="px-4 py-1.5 rounded-full font-bold text-sm transition-all bg-orange-500 text-white hover:bg-orange-600"
          >
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}
