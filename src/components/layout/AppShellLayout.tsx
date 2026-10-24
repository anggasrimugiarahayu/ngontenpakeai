"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import useSWR, { preload } from "swr";
import { getDashboardDataAction } from "@/app/actions/dashboard";
import { getPengaturanDataAction } from "@/app/actions/pengaturan";
import { getRuangBelajarDataAction } from "@/app/actions/ruangBelajar";
import { getBlueprintAction } from "@/app/actions/blueprint";
import { getBioBuilderAction, getContentCalendarAction } from "@/app/actions/toolsData";
import { getInstagramAutomationDataAction } from "@/app/actions/instagramAutomation";
import BlueprintRequiredModal from "@/components/ui/BlueprintRequiredModal";
import {
  CreditCard,
  Compass,
  User,
  Lightbulb,
  FileText,
  LayoutTemplate,
  RefreshCw,
  BookOpen,
  Calendar,
  Menu,
  X,
  ChevronLeft,
  Lock,
  LayoutGrid,
  Settings,
  HelpCircle,
  MessageSquare,
  LayoutDashboard,
  Bot,
  Search,
} from "lucide-react";

const handleHoverPrefetch = (href: string) => {
  if (href === "/dashboard") {
    preload("dashboard", getDashboardDataAction);
  } else if (href === "/pengaturan") {
    preload("pengaturan", getPengaturanDataAction);
  } else if (href === "/ruang-belajar") {
    preload("ruangBelajar", getRuangBelajarDataAction);
  } else if (href === "/ruang-automation" || href === "/ruang-growing") {
    preload("instagramAutomation", getInstagramAutomationDataAction);
  } else if (href === "/ruang-ngonten" || href.startsWith("/ruang-ngonten/")) {
    preload("blueprint", getBlueprintAction);

    if (href === "/ruang-ngonten/bio-builder") {
      preload("bioBuilder", getBioBuilderAction);
    } else if (
      href === "/ruang-ngonten/content-calendar" ||
      href === "/ruang-ngonten/script-builder" ||
      href === "/ruang-ngonten/atm-builder"
    ) {
      preload("contentCalendar", getContentCalendarAction);
    }
  }
};

const TOOLS = [
  { href: "/ruang-ngonten/master-blueprint", label: "Master Blueprint", icon: Compass },
  { href: "/ruang-ngonten/bio-builder", label: "Bio Builder", icon: User },
  { href: "/ruang-ngonten/idea-rooms", label: "Idea Rooms", icon: Lightbulb },
  { href: "/ruang-ngonten/script-builder", label: "Script Builder", icon: FileText },
  { href: "/ruang-ngonten/carousel-builder", label: "Carousel Prompt Builder", icon: LayoutTemplate },
  { href: "/ruang-ngonten/atm-builder", label: "ATM Content Builder", icon: RefreshCw },
  { href: "/ruang-ngonten/ebook-builder", label: "Ebook Prompt Builder", icon: BookOpen },
  { href: "/ruang-ngonten/content-calendar", label: "Content Calendar", icon: Calendar },
];

function InstagramIcon({ size = 20, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
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

function TikTokIcon({ size = 20, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
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

function WhatsAppIcon({ size = 20, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
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

function YouTubeIcon({ size = 20, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19.1c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.43z" />
      <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="currentColor" stroke="none" />
    </svg>
  );
}

function FacebookIcon({ size = 20, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

const AUTOMATION_TOOLS = [
  { href: "/ruang-automation?platform=instagram", label: "Instagram Automation", icon: InstagramIcon, platformKey: "instagram" },
  { href: "/ruang-automation?platform=tiktok", label: "TikTok Automation", icon: TikTokIcon, platformKey: "tiktok", disabled: true },
  { href: "/ruang-automation?platform=whatsapp", label: "WhatsApp Automation", icon: WhatsAppIcon, platformKey: "whatsapp", disabled: true },
];

const RISET_TOOLS = [
  { href: "/ruang-riset?platform=instagram", label: "Instagram Riset", icon: InstagramIcon, platformKey: "instagram" },
  { href: "/ruang-riset?platform=tiktok", label: "TikTok Riset", icon: TikTokIcon, platformKey: "tiktok", disabled: true },
  { href: "/ruang-riset?platform=youtube", label: "YouTube Riset", icon: YouTubeIcon, platformKey: "youtube", disabled: true },
  { href: "/ruang-riset?platform=facebook", label: "Facebook Riset", icon: FacebookIcon, platformKey: "facebook", disabled: true },
];

export default function AppShellLayout({
  children,
  hasBlueprint,
  dbFeatures = [],
  isPro = false,
  isAdmin = false,
  isLoggedIn = false,
  homepageCards = [],
}: {
  children: React.ReactNode;
  hasBlueprint: boolean;
  dbFeatures?: any[];
  isPro?: boolean;
  isAdmin?: boolean;
  isLoggedIn?: boolean;
  homepageCards?: any[];
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [activePath, setActivePath] = useState(pathname);
  const [activePlatform, setActivePlatform] = useState<string | null>(null);
  const [activeRisetPlatform, setActiveRisetPlatform] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false); // Mobile drawer
  const [isExpanded, setIsExpanded] = useState(false); // Desktop floating dock

  const { data: blueprintData } = useSWR(isLoggedIn ? "blueprint" : null, getBlueprintAction);
  const activeHasBlueprint = hasBlueprint || !!blueprintData?.aiResult || !!blueprintData;
  const [blueprintModal, setBlueprintModal] = useState<{ isOpen: boolean; toolName?: string }>({ isOpen: false });

  useEffect(() => {
    const handleOpenModal = (e: any) => {
      setBlueprintModal({ isOpen: true, toolName: e.detail?.toolName || "Fitur AI" });
    };
    window.addEventListener("open-blueprint-modal", handleOpenModal);
    return () => window.removeEventListener("open-blueprint-modal", handleOpenModal);
  }, []);

  useEffect(() => {
    setActivePath(pathname);
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const plat = params.get("platform");
      if (pathname.startsWith("/ruang-automation")) {
        setActivePlatform(plat || null);
        setActiveRisetPlatform(null);
      } else if (pathname.startsWith("/ruang-riset")) {
        setActiveRisetPlatform(plat || null);
        setActivePlatform(null);
      } else {
        setActivePlatform(null);
        setActiveRisetPlatform(null);
      }
    }
  }, [pathname]);

  useEffect(() => {
    const handleLocationChange = () => {
      setActivePath(window.location.pathname);
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        const plat = params.get("platform");
        if (window.location.pathname.startsWith("/ruang-automation")) {
          setActivePlatform(plat || null);
          setActiveRisetPlatform(null);
        } else if (window.location.pathname.startsWith("/ruang-riset")) {
          setActiveRisetPlatform(plat || null);
          setActivePlatform(null);
        } else {
          setActivePlatform(null);
          setActiveRisetPlatform(null);
        }
      }
    };
    const handlePlatformChange = (e: any) => {
      setActivePlatform(e.detail || null);
    };
    const handleRisetPlatformChange = (e: any) => {
      setActiveRisetPlatform(e.detail || null);
    };

    window.addEventListener("popstate", handleLocationChange);
    window.addEventListener("app-shallow-navigate", handleLocationChange);
    window.addEventListener("automation-platform-change", handlePlatformChange);
    window.addEventListener("riset-platform-change", handleRisetPlatformChange);
    return () => {
      window.removeEventListener("popstate", handleLocationChange);
      window.removeEventListener("app-shallow-navigate", handleLocationChange);
      window.removeEventListener("automation-platform-change", handlePlatformChange);
      window.removeEventListener("riset-platform-change", handleRisetPlatformChange);
    };
  }, []);

  // Close mobile drawer on navigation
  useEffect(() => {
    setIsOpen(false);
  }, [activePath]);

  // Listen for open-tools-drawer event from Navbar
  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener("open-tools-drawer", handleOpen);
    return () => window.removeEventListener("open-tools-drawer", handleOpen);
  }, []);

  const handleToolNav = (e: React.MouseEvent, href: string) => {
    if (activePath.startsWith("/ruang-ngonten") && href.startsWith("/ruang-ngonten")) {
      e.preventDefault();
      window.history.pushState(null, "", href);
      window.dispatchEvent(new Event("app-shallow-navigate"));
      setIsOpen(false);
    } else if (href === "/ruang-automation" && activePath.startsWith("/ruang-automation")) {
      e.preventDefault();
      window.history.pushState(null, "", "/ruang-automation");
      setActivePlatform(null);
      window.dispatchEvent(new CustomEvent("automation-platform-change", { detail: null }));
      window.dispatchEvent(new Event("app-shallow-navigate"));
      setIsOpen(false);
    } else if (href.startsWith("/ruang-automation?platform=") && activePath.startsWith("/ruang-automation")) {
      e.preventDefault();
      const params = new URLSearchParams(href.split("?")[1]);
      const plat = params.get("platform");
      window.history.pushState(null, "", href);
      setActivePlatform(plat);
      window.dispatchEvent(new CustomEvent("automation-platform-change", { detail: plat }));
      window.dispatchEvent(new Event("app-shallow-navigate"));
      setIsOpen(false);
    } else if (href === "/ruang-riset" && activePath.startsWith("/ruang-riset")) {
      e.preventDefault();
      window.history.pushState(null, "", "/ruang-riset");
      setActiveRisetPlatform(null);
      window.dispatchEvent(new CustomEvent("riset-platform-change", { detail: null }));
      window.dispatchEvent(new Event("app-shallow-navigate"));
      setIsOpen(false);
    } else if (href.startsWith("/ruang-riset?platform=") && activePath.startsWith("/ruang-riset")) {
      e.preventDefault();
      const params = new URLSearchParams(href.split("?")[1]);
      const plat = params.get("platform");
      window.history.pushState(null, "", href);
      setActiveRisetPlatform(plat);
      window.dispatchEvent(new CustomEvent("riset-platform-change", { detail: plat }));
      window.dispatchEvent(new Event("app-shallow-navigate"));
      setIsOpen(false);
    } else if ((href === "/" || href === "/?pricing=true") && (activePath === "/" || activePath === "" || activePath.startsWith("/?"))) {
      e.preventDefault();
      const isPricing = href === "/?pricing=true";
      window.history.pushState(null, "", href);
      window.dispatchEvent(new CustomEvent("pricing-change", { detail: isPricing }));
      window.dispatchEvent(new Event("app-shallow-navigate"));
      setIsOpen(false);
    }
  };

  const isToolsMode = activePath.startsWith("/ruang-ngonten/") && activePath !== "/ruang-ngonten" && activePath !== "/ruang-ngonten/";
  const isAutomationMode = activePath.startsWith("/ruang-automation") && !!activePlatform;
  const isRisetMode = activePath.startsWith("/ruang-riset") && !!activeRisetPlatform;

  let GLOBAL_NAV_ITEMS = [];

  const isBelajarDisabled = homepageCards.find((c: any) => c.id === "ruang-belajar")?.isActive === false;
  const isNgontenDisabled = homepageCards.find((c: any) => c.id === "ruang-ngonten")?.isActive === false;
  const isAutomationDisabled = homepageCards.find((c: any) => c.id === "ruang-automation")?.isActive === false;
  const isRisetDisabled = homepageCards.find((c: any) => c.id === "ruang-riset")?.isActive === false;

  if (!isLoggedIn) {
    GLOBAL_NAV_ITEMS = [
      { label: "Ruang Belajar", href: "/ruang-belajar", icon: BookOpen, disabled: isBelajarDisabled },
      { label: "Ruang Ngonten", href: "/ruang-ngonten", icon: LayoutTemplate, disabled: isNgontenDisabled },
      { label: "Ruang Automation", href: "/ruang-automation", icon: Bot, disabled: isAutomationDisabled },
      { label: "Ruang Riset", href: "/ruang-riset", icon: Search, disabled: isRisetDisabled },
      { label: "Pricing", href: "/?pricing=true", icon: CreditCard },
    ];
  } else {
    GLOBAL_NAV_ITEMS = [
      { label: "Ruang Belajar", href: "/ruang-belajar", icon: BookOpen, disabled: isBelajarDisabled },
      { label: "Ruang Ngonten", href: "/ruang-ngonten", icon: LayoutTemplate, disabled: isNgontenDisabled },
      { label: "Ruang Automation", href: "/ruang-automation", icon: Bot, disabled: isAutomationDisabled },
      { label: "Ruang Riset", href: "/ruang-riset", icon: Search, disabled: isRisetDisabled },
    ];
    if (isAdmin) {
      GLOBAL_NAV_ITEMS.push({ label: "Dashboard", icon: LayoutDashboard, href: "/dashboard", disabled: false });
    }
    GLOBAL_NAV_ITEMS.push(
      { label: "Pengaturan", icon: Settings, href: "/pengaturan", disabled: false },
      { label: "Bantuan", icon: HelpCircle, href: "/bantuan", disabled: false },
      { label: "Feedback", icon: MessageSquare, href: "/feedback", disabled: false }
    );
  }

  const mappedTools = TOOLS.map((tool) => {
    const dbMatch = dbFeatures.find((db) => db.name === tool.label);
    return {
      ...tool,
      isActive: dbMatch ? dbMatch.isActive : true,
      isProOnly: dbMatch ? dbMatch.isProOnly : false,
    };
  }).filter((tool) => tool.isActive);

  let itemsToRender: any[] = GLOBAL_NAV_ITEMS;
  let backHref = "/";
  let drawerTitle = "Navigasi";

  if (isToolsMode) {
    itemsToRender = mappedTools;
    backHref = "/ruang-ngonten";
    drawerTitle = "Menu Tools";
  } else if (isAutomationMode) {
    itemsToRender = AUTOMATION_TOOLS;
    backHref = "/ruang-automation";
    drawerTitle = "Menu Automasi";
  } else if (isRisetMode) {
    itemsToRender = RISET_TOOLS;
    backHref = "/ruang-riset";
    drawerTitle = "Menu Riset";
  }

  return (
    <div className="flex flex-1 w-full relative">
      {/* FLOATING SIDEBAR (DESKTOP) */}
      <aside
        className={`hidden md:flex fixed left-4 top-1/2 -translate-y-1/2 z-[60] bg-white/90 dark:bg-[#141B31]/90 backdrop-blur-xl border border-gray-200 dark:border-[#2C3246] shadow-2xl rounded-2xl flex-col transition-all duration-300 ease-in-out ${
          isExpanded ? "w-[260px]" : "w-[64px]"
        } overflow-hidden`}
      >
        {/* Toggle Button */}
        <div className="flex items-center justify-end p-2 border-b border-gray-100 dark:border-[#2C3246]/60">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-10 h-10 flex items-center justify-center rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-[#1f2947] hover:text-gray-900 dark:hover:text-white transition-colors"
            title={isExpanded ? "Tutup Sidebar" : "Buka Sidebar"}
          >
            {isExpanded ? <ChevronLeft size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Tools Icons */}
        <div className="flex flex-col py-2 px-2 space-y-1 overflow-y-auto custom-scrollbar max-h-[calc(100vh-140px)]">
          {itemsToRender.map((tool) => {
            const Icon = tool.icon;
            let isActive = false;
            if (isAutomationMode) {
              isActive = activePlatform === (tool as any).platformKey;
            } else if (isRisetMode) {
              isActive = activeRisetPlatform === (tool as any).platformKey;
            } else if (!isToolsMode) {
              isActive =
                activePath === tool.href ||
                (tool.href !== "/" && tool.href !== "/?pricing=true" && !tool.href.startsWith("/login") && activePath.startsWith(tool.href));
            } else {
              isActive = activePath === tool.href;
            }
            const isProLocked = isToolsMode && (tool as any).isProOnly && !isPro;
            const isBlueprintLocked = isToolsMode && !activeHasBlueprint && tool.href !== "/ruang-ngonten/master-blueprint";
            const isLocked = isProLocked || isBlueprintLocked;

            if ((tool as any).disabled) {
              return (
                <div
                  key={tool.href}
                  title={!isExpanded ? (isRisetMode ? tool.label : `${tool.label} (Segera Hadir)`) : undefined}
                  className={`flex items-center rounded-xl transition-all duration-200 text-gray-400 dark:text-gray-600 opacity-60 cursor-not-allowed ${
                    isExpanded ? "px-3 py-3 gap-3" : "justify-center w-10 h-10 mx-auto"
                  }`}
                >
                  <Icon size={isExpanded ? 18 : 20} className="shrink-0" />
                  {isExpanded && <span className="text-sm font-medium whitespace-nowrap truncate">{tool.label}</span>}
                </div>
              );
            }
            if (isLocked) {
              return (
                <div
                  key={tool.href}
                  onClick={() => {
                    if (!isLoggedIn) router.push(`/login?redirect=${tool.href}`);
                    else if (isProLocked) {
                      if (activePath === "/" || activePath === "") {
                        window.history.pushState(null, "", "/?pricing=true");
                        window.dispatchEvent(new CustomEvent("pricing-change", { detail: true }));
                        window.dispatchEvent(new Event("app-shallow-navigate"));
                      } else {
                        router.push("/?pricing=true");
                      }
                    } else if (isBlueprintLocked) {
                      setBlueprintModal({ isOpen: true, toolName: tool.label });
                    }
                  }}
                  title={!isExpanded ? (isBlueprintLocked ? `${tool.label} (Wajib isi Master Blueprint)` : `${tool.label} (Terkunci)`) : undefined}
                  className={`flex items-center rounded-xl transition-all duration-200 ${
                    isBlueprintLocked
                      ? "text-gray-400 dark:text-gray-500 hover:text-orange-500 hover:bg-orange-500/10 cursor-pointer"
                      : isProLocked
                      ? "cursor-pointer hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400 dark:text-gray-600 opacity-60"
                      : "cursor-not-allowed text-gray-400 dark:text-gray-600 opacity-60"
                  } ${isExpanded ? "px-3 py-3 gap-3" : "justify-center w-10 h-10 mx-auto"}`}
                >
                  <Icon size={isExpanded ? 18 : 20} className="shrink-0" />
                  {isExpanded && (
                    <>
                      <span className="text-sm font-medium whitespace-nowrap truncate">{tool.label}</span>
                      <Lock size={14} className={`ml-auto ${isBlueprintLocked ? "text-orange-500" : ""}`} />
                    </>
                  )}
                </div>
              );
            }

            return (
              <Link
                prefetch={true}
                key={tool.href}
                href={tool.href}
                onClick={(e) => handleToolNav(e, tool.href)}
                onMouseEnter={() => handleHoverPrefetch(tool.href)}
                onTouchStart={() => handleHoverPrefetch(tool.href)}
                title={!isExpanded ? tool.label : undefined}
                className={`flex items-center rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-orange-500 text-white shadow-md shadow-orange-500/20"
                    : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white"
                } ${isExpanded ? "px-3 py-3 gap-3" : "justify-center w-10 h-10 mx-auto"}`}
              >
                <Icon size={isExpanded ? 18 : 20} className={`shrink-0 ${isActive ? "text-white" : ""}`} />
                {isExpanded && <span className="text-sm font-medium whitespace-nowrap truncate">{tool.label}</span>}
              </Link>
            );
          })}
        </div>

        {(isToolsMode || isAutomationMode || isRisetMode) && (
          <div className="p-2 border-t border-gray-100 dark:border-[#2C3246]/60 mt-auto">
            <Link
              prefetch={true}
              href={backHref}
              onClick={(e) => handleToolNav(e, backHref)}
              title={!isExpanded ? "Back" : undefined}
              className={`flex items-center rounded-xl transition-all duration-200 text-gray-600 dark:text-gray-400 hover:bg-orange-50 hover:text-orange-600 dark:hover:bg-orange-500/10 dark:hover:text-orange-400 ${
                isExpanded ? "px-3 py-3 gap-3" : "justify-center w-10 h-10 mx-auto"
              }`}
            >
              <LayoutGrid size={isExpanded ? 18 : 20} className="shrink-0" />
              {isExpanded && <span className="text-sm font-medium whitespace-nowrap truncate">Back</span>}
            </Link>
          </div>
        )}
      </aside>

      {/* MOBILE DRAWER */}
      <>
        {isOpen && (
          <div
            className="fixed inset-0 bg-black/60 z-[70] md:hidden backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
        )}

        <aside
          className={`fixed top-0 bottom-0 left-0 z-[80] w-[260px] bg-white dark:bg-[#141B31] border-r border-gray-200 dark:border-[#2C3246] transition-transform duration-300 ease-in-out md:hidden flex flex-col ${
            isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-[#2C3246]/60">
            <span className="font-bold text-gray-900 dark:text-white">{drawerTitle}</span>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-lg bg-white hover:bg-gray-50 dark:bg-[#141B31] dark:hover:bg-[#1f2947] border border-gray-200 dark:border-[#2C3246] text-gray-600 dark:text-gray-300 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          <div className="flex flex-col py-4 px-3 overflow-y-auto space-y-1">
            {itemsToRender.map((tool) => {
              const Icon = tool.icon;
              let isActive = false;
              if (isAutomationMode) {
                isActive = activePlatform === (tool as any).platformKey;
              } else if (isRisetMode) {
                isActive = activeRisetPlatform === (tool as any).platformKey;
              } else if (!isToolsMode) {
                isActive =
                  activePath === tool.href ||
                  (tool.href !== "/" && tool.href !== "/?pricing=true" && !tool.href.startsWith("/login") && activePath.startsWith(tool.href));
              } else {
                isActive = activePath === tool.href;
              }
              const isProLocked = isToolsMode && (tool as any).isProOnly && !isPro;
              const isBlueprintLocked = isToolsMode && !activeHasBlueprint && tool.href !== "/ruang-ngonten/master-blueprint";
              const isLocked = isProLocked || isBlueprintLocked;

              if ((tool as any).disabled) {
                return (
                  <div
                    key={tool.href}
                    className="flex items-center justify-between px-3 py-3 rounded-xl font-medium text-gray-400 dark:text-gray-600 opacity-60 cursor-not-allowed"
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={18} />
                      <span className="text-sm">{tool.label}</span>
                    </div>
                  </div>
                );
              }
              if (isLocked) {
                return (
                  <div
                    key={tool.href}
                    onClick={() => {
                      if (!isLoggedIn) {
                        setIsOpen(false);
                        router.push(`/login?redirect=${tool.href}`);
                      } else if (isProLocked) {
                        setIsOpen(false);
                        if (activePath === "/" || activePath === "") {
                          window.history.pushState(null, "", "/?pricing=true");
                          window.dispatchEvent(new CustomEvent("pricing-change", { detail: true }));
                          window.dispatchEvent(new Event("app-shallow-navigate"));
                        } else {
                          router.push("/?pricing=true");
                        }
                      } else if (isBlueprintLocked) {
                        setIsOpen(false);
                        setBlueprintModal({ isOpen: true, toolName: tool.label });
                      }
                    }}
                    className={`flex items-center justify-between px-3 py-3 rounded-xl font-medium transition-colors ${
                      isBlueprintLocked
                        ? "text-gray-600 dark:text-gray-300 hover:bg-orange-500/10 hover:text-orange-500 cursor-pointer"
                        : isProLocked
                        ? "cursor-pointer hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400 dark:text-gray-600 opacity-60"
                        : "cursor-not-allowed text-gray-400 dark:text-gray-600 opacity-60"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={18} />
                      <span className="text-sm">{tool.label}</span>
                    </div>
                    <Lock size={14} className={isBlueprintLocked ? "text-orange-500" : ""} />
                  </div>
                );
              }

              return (
                <Link
                  prefetch={true}
                  key={tool.href}
                  href={tool.href}
                  onClick={(e) => handleToolNav(e, tool.href)}
                  onMouseEnter={() => handleHoverPrefetch(tool.href)}
                  onTouchStart={() => handleHoverPrefetch(tool.href)}
                  className={`flex items-center gap-3 px-3 py-3 rounded-xl font-medium transition-colors ${
                    isActive
                      ? "bg-orange-500 text-white"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"
                  }`}
                >
                  <Icon size={18} />
                  <span className="text-sm">{tool.label}</span>
                </Link>
              );
            })}
          </div>

          {(isToolsMode || isAutomationMode || isRisetMode) && (
            <div className="p-4 border-t border-gray-100 dark:border-[#2C3246]/60 mt-auto">
              <Link
                prefetch={true}
                href={backHref}
                onClick={(e) => handleToolNav(e, backHref)}
                className="flex items-center gap-3 px-3 py-3 rounded-xl font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-white/5 transition-colors hover:bg-orange-50 hover:text-orange-600 dark:hover:bg-orange-500/10 dark:hover:text-orange-400"
              >
                <LayoutGrid size={18} />
                <span className="text-sm">Back</span>
              </Link>
            </div>
          )}
        </aside>
      </>

      {/* Main Content Area */}
      <div className="flex-1 w-full flex flex-col transition-all duration-300">
        <div className="flex-1 w-full flex flex-col relative">{children}</div>
      </div>

      <BlueprintRequiredModal
        isOpen={blueprintModal.isOpen}
        onClose={() => setBlueprintModal({ isOpen: false })}
        toolName={blueprintModal.toolName}
      />
    </div>
  );
}
