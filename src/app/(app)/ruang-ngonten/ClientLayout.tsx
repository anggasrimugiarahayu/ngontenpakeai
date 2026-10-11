"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { preload } from "swr";
import { getDashboardDataAction } from "@/app/actions/dashboard";
import { getPengaturanDataAction } from "@/app/actions/pengaturan";
import { getRuangBelajarDataAction } from "@/app/actions/ruangBelajar";
import { getBlueprintAction } from "@/app/actions/blueprint";
import { getBioBuilderAction, getContentCalendarAction } from "@/app/actions/toolsData";

const handleHoverPrefetch = (href: string) => {
  if (href === '/dashboard') {
    preload("dashboard", getDashboardDataAction);
  } else if (href === '/pengaturan') {
    preload("pengaturan", getPengaturanDataAction);
  } else if (href === '/ruang-belajar') {
    preload("ruangBelajar", getRuangBelajarDataAction);
  } else if (href.startsWith('/ruang-ngonten/')) {
    preload("blueprint", getBlueprintAction);
    
    if (href === '/ruang-ngonten/bio-builder') {
      preload("bioBuilder", getBioBuilderAction);
    } else if (href === '/ruang-ngonten/content-calendar' || href === '/ruang-ngonten/script-builder' || href === '/ruang-ngonten/atm-builder') {
      preload("contentCalendar", getContentCalendarAction);
    }
  }
};

import { CreditCard, Compass, User, Lightbulb, FileText, LayoutTemplate, RefreshCw, BookOpen, Calendar, Menu, X, ChevronRight, ChevronLeft, ArrowLeft, Lock, LayoutGrid, Settings, HelpCircle, MessageSquare, LayoutDashboard } from 'lucide-react';

const TOOLS = [
  { href: '/ruang-ngonten/master-blueprint', label: 'Master Blueprint', icon: Compass },
  { href: '/ruang-ngonten/bio-builder', label: 'Bio Builder', icon: User },
  { href: '/ruang-ngonten/idea-rooms', label: 'Idea Rooms', icon: Lightbulb },
  { href: '/ruang-ngonten/script-builder', label: 'Script Builder', icon: FileText },
  { href: '/ruang-ngonten/carousel-builder', label: 'Carousel Prompt Builder', icon: LayoutTemplate },
  { href: '/ruang-ngonten/atm-builder', label: 'ATM Content Builder', icon: RefreshCw },
  { href: '/ruang-ngonten/ebook-builder', label: 'Ebook Prompt Builder', icon: BookOpen },
  { href: '/ruang-ngonten/content-calendar', label: 'Content Calendar', icon: Calendar },
];

export default function ClientLayout({
  children,
  hasBlueprint,
  dbFeatures = [],
  isPro = false,
  isAdmin = false,
  isLoggedIn = false,
}: {
  children: React.ReactNode;
  hasBlueprint: boolean;
  dbFeatures?: any[];
  isPro?: boolean;
  isAdmin?: boolean;
  isLoggedIn?: boolean;
}) {

  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false); // Mobile drawer
  const [isExpanded, setIsExpanded] = useState(false); // Desktop floating dock

  // Close mobile drawer on navigation
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Listen for open-tools-drawer event from Navbar
  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-tools-drawer', handleOpen);
    return () => window.removeEventListener('open-tools-drawer', handleOpen);
  }, []);

  
  const isToolsMode = pathname.startsWith('/ruang-ngonten/') && pathname !== '/ruang-ngonten' && pathname !== '/ruang-ngonten/';

  let GLOBAL_NAV_ITEMS = [];

  if (!isLoggedIn) {
    GLOBAL_NAV_ITEMS = [
      { label: "Ruang Belajar", href: "/ruang-belajar", icon: BookOpen },
      { label: "Ruang Ngonten", href: "/ruang-ngonten", icon: LayoutTemplate },
      { label: "Ruang Growing", href: "#", icon: RefreshCw, disabled: true },
      { label: "Pricing", href: "/?pricing=true", icon: CreditCard },
    ];
  } else {
    GLOBAL_NAV_ITEMS = [
      { label: "Ruang Belajar", href: "/ruang-belajar", icon: BookOpen },
      { label: "Ruang Ngonten", href: "/ruang-ngonten", icon: LayoutTemplate },
      { label: "Ruang Growing", href: "/ruang-growing", icon: RefreshCw },
    ];
    if (isAdmin) {
      GLOBAL_NAV_ITEMS.push({ label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' });
    }
    GLOBAL_NAV_ITEMS.push(
      { label: 'Pengaturan', icon: Settings, href: '/pengaturan' },
      { label: 'Bantuan', icon: HelpCircle, href: '/bantuan' },
      { label: 'Feedback', icon: MessageSquare, href: '/feedback' }
    );
  }

  const mappedTools = TOOLS.map(tool => {
    const dbMatch = dbFeatures.find(db => db.name === tool.label);
    return {
      ...tool,
      isActive: dbMatch ? dbMatch.isActive : true,
      isProOnly: dbMatch ? dbMatch.isProOnly : false
    };
  }).filter(tool => tool.isActive);

  const itemsToRender = isToolsMode ? mappedTools : GLOBAL_NAV_ITEMS;
  const backHref = isToolsMode ? '/ruang-ngonten' : '/';

  return (
    <div className="flex flex-1 w-full relative">
      {/* 
        FLOATING SIDEBAR (DESKTOP)
        Only visible if NOT on the main dashboard page
      */}
      <aside className={`hidden md:flex fixed left-4 top-1/2 -translate-y-1/2 z-[60] bg-white/90 dark:bg-[#121214]/90 backdrop-blur-xl border border-gray-200 dark:border-white/10 shadow-2xl rounded-2xl flex-col transition-all duration-300 ease-in-out ${
            isExpanded ? 'w-[260px]' : 'w-[64px]'
          } overflow-hidden`}
        >
          {/* Toggle Button */}
          <div className="flex items-center justify-end p-2 border-b border-gray-100 dark:border-white/5">
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-10 h-10 flex items-center justify-center rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white transition-colors"
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
                if (!isToolsMode) {
                  isActive = pathname === tool.href || (tool.href !== '/' && tool.href !== '/?pricing=true' && !tool.href.startsWith('/login') && pathname.startsWith(tool.href));
                } else {
                  isActive = pathname === tool.href;
                }
              const isProLocked = isToolsMode && (tool as any).isProOnly && !isPro;
              const isBlueprintLocked = isToolsMode && !hasBlueprint && tool.href !== '/ruang-ngonten/master-blueprint';
              const isLocked = isProLocked || isBlueprintLocked;
              
              if ((tool as any).disabled) {
                return (
                  <div 
                    key={tool.href}
                    title={!isExpanded ? `${tool.label} (Segera Hadir)` : undefined}
                    className={`flex items-center rounded-xl transition-all duration-200 text-gray-400 dark:text-gray-600 opacity-60 cursor-not-allowed ${isExpanded ? 'px-3 py-3 gap-3' : 'justify-center w-10 h-10 mx-auto'}`}
                  >
                    <Icon size={isExpanded ? 18 : 20} className="shrink-0" />
                    {isExpanded && (
                      <>
                        <span className="text-sm font-medium whitespace-nowrap truncate">{tool.label}</span>
                      </>
                    )}
                  </div>
                );
              }
              if (isLocked) {
                return (
                  <div 
                    key={tool.href}
                    onClick={() => { 
                      if (!isLoggedIn) router.push(`/login?redirect=${tool.href}`);
                      else if (isProLocked) router.push('/?pricing=true'); 
                    }}
                    title={!isExpanded ? `${tool.label} (Terkunci)` : undefined}
                    className={`flex items-center rounded-xl transition-all duration-200 text-gray-400 dark:text-gray-600 opacity-60 ${isProLocked ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-white/5' : 'cursor-not-allowed'} ${isExpanded ? 'px-3 py-3 gap-3' : 'justify-center w-10 h-10 mx-auto'}`}
                  >
                    <Icon size={isExpanded ? 18 : 20} className="shrink-0" />
                    {isExpanded && (
                      <>
                        <span className="text-sm font-medium whitespace-nowrap truncate">{tool.label}</span>
                        <Lock size={14} className="ml-auto" />
                      </>
                    )}
                  </div>
                );
              }
              
              return (
                <Link prefetch={true}
                  key={tool.href}
                  href={tool.href}
                  onMouseEnter={() => handleHoverPrefetch(tool.href)}
                  onTouchStart={() => handleHoverPrefetch(tool.href)}
                  title={!isExpanded ? tool.label : undefined}
                  className={`flex items-center rounded-xl transition-all duration-200 ${
                    isActive 
                      ? "bg-orange-500 text-white shadow-md shadow-orange-500/20" 
                      : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white"
                  } ${isExpanded ? 'px-3 py-3 gap-3' : 'justify-center w-10 h-10 mx-auto'}`}
                >
                  <Icon size={isExpanded ? 18 : 20} className={`shrink-0 ${isActive ? "text-white" : ""}`} />
                  {isExpanded && (
                    <span className="text-sm font-medium whitespace-nowrap truncate">{tool.label}</span>
                  )}
                </Link>
              );
            })}
          </div>

          {isToolsMode && (
          <div className="p-2 border-t border-gray-100 dark:border-white/5 mt-auto">
            <Link prefetch={true}
              href={backHref}
              title={!isExpanded ? "Back" : undefined}
              className={`flex items-center rounded-xl transition-all duration-200 text-gray-600 dark:text-gray-400 hover:bg-orange-50 hover:text-orange-600 dark:hover:bg-orange-500/10 dark:hover:text-orange-400 ${
                isExpanded ? 'px-3 py-3 gap-3' : 'justify-center w-10 h-10 mx-auto'
              }`}
            >
              <LayoutGrid size={isExpanded ? 18 : 20} className="shrink-0" />
              {isExpanded && (
                <span className="text-sm font-medium whitespace-nowrap truncate">Back</span>
              )}
            </Link>
          </div>
          )}
        </aside>

      {/* 
        MOBILE DRAWER
        Visible only on mobile, toggleable via FAB or header button
      */}
      <>
          {/* Overlay */}
          {isOpen && (
            <div 
              className="fixed inset-0 bg-black/60 z-[70] md:hidden backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />
          )}

          {/* Drawer */}
          <aside 
            className={`fixed top-0 bottom-0 left-0 z-[80] w-[260px] bg-white dark:bg-[#121214] border-r border-gray-200 dark:border-white/10 transition-transform duration-300 ease-in-out md:hidden flex flex-col ${
              isOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-white/5">
              <span className="font-bold text-gray-900 dark:text-white">{isToolsMode ? 'Menu Tools' : 'Navigasi'}</span>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-lg bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex flex-col py-4 px-3 overflow-y-auto space-y-1">


              {itemsToRender.map((tool) => {
                const Icon = tool.icon;
                let isActive = false;
                if (!isToolsMode) {
                  isActive = pathname === tool.href || (tool.href !== '/' && tool.href !== '/?pricing=true' && !tool.href.startsWith('/login') && pathname.startsWith(tool.href));
                } else {
                  isActive = pathname === tool.href;
                }
                const isProLocked = isToolsMode && (tool as any).isProOnly && !isPro;
                const isBlueprintLocked = isToolsMode && !hasBlueprint && tool.href !== '/ruang-ngonten/master-blueprint';
                const isLocked = isProLocked || isBlueprintLocked;
              if ((tool as any).disabled) {
                  return (
                    <div 
                      key={tool.href}
                      className={`flex items-center justify-between px-3 py-3 rounded-xl font-medium text-gray-400 dark:text-gray-600 opacity-60 cursor-not-allowed`}
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
                           router.push('/?pricing=true');
                        }
                      }}
                      className={`flex items-center justify-between px-3 py-3 rounded-xl font-medium text-gray-400 dark:text-gray-600 opacity-60 ${isProLocked ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-white/5' : 'cursor-not-allowed'}`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={18} />
                        <span className="text-sm">{tool.label}</span>
                      </div>
                      <Lock size={14} />
                    </div>
                  );
                }

                return (
                  <Link prefetch={true}
                  key={tool.href}
                    href={tool.href}
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

            {isToolsMode && (
            <div className="p-4 border-t border-gray-100 dark:border-white/5 mt-auto">
              <Link prefetch={true}
                href={backHref}
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
      {/* We apply left padding on desktop if the floating sidebar is present, to prevent content from hiding behind it */}
      <div className={`flex-1 w-full flex flex-col transition-all duration-300`}>
        


        <div className="flex-1 w-full flex flex-col relative">
          {children}
        </div>
      </div>
    </div>
  );
}
