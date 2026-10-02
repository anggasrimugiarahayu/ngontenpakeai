"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Compass, User, Lightbulb, FileText, LayoutTemplate, 
  RefreshCw, BookOpen, Calendar, Menu, X, ChevronRight, ChevronLeft, ArrowLeft, Lock, LayoutGrid
} from 'lucide-react';

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
}: {
  children: React.ReactNode;
  hasBlueprint: boolean;
  dbFeatures?: any[];
  isPro?: boolean;
}) {

  const pathname = usePathname();
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

  const isDashboard = pathname === '/ruang-ngonten' || pathname === '/ruang-ngonten/';
  
  const mappedTools = TOOLS.map(tool => {
    const dbMatch = dbFeatures.find(db => db.name === tool.label);
    return {
      ...tool,
      isActive: dbMatch ? dbMatch.isActive : true,
      isProOnly: dbMatch ? dbMatch.isProOnly : false
    };
  }).filter(tool => tool.isActive);

  return (
    <div className="flex flex-1 w-full relative">
      {/* 
        FLOATING SIDEBAR (DESKTOP)
        Only visible if NOT on the main dashboard page
      */}
      {!isDashboard && (
        <aside 
          className={`hidden md:flex fixed left-4 top-1/2 -translate-y-1/2 z-[60] bg-white/90 dark:bg-[#121214]/90 backdrop-blur-xl border border-gray-200 dark:border-white/10 shadow-2xl rounded-2xl flex-col transition-all duration-300 ease-in-out ${
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
            {mappedTools.map((tool) => {
              const Icon = tool.icon;
              const isActive = pathname.startsWith(tool.href);
              const isLocked = (!hasBlueprint && tool.href !== '/ruang-ngonten/master-blueprint') || (tool.isProOnly && !isPro);
              
              if (isLocked) {
                return (
                  <div 
                    key={tool.href}
                    title={!isExpanded ? `${tool.label} (Terkunci)` : undefined}
                    className={`flex items-center rounded-xl transition-all duration-200 text-gray-400 dark:text-gray-600 cursor-not-allowed opacity-60 ${isExpanded ? 'px-3 py-3 gap-3' : 'justify-center w-10 h-10 mx-auto'}`}
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
                <Link 
                  key={tool.href}
                  href={tool.href}
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

          {/* BACK TO DASHBOARD BUTTON (BOTTOM) */}
          <div className="p-2 border-t border-gray-100 dark:border-white/5 mt-auto">
            <Link 
              href="/ruang-ngonten"
              title={!isExpanded ? "Kembali ke Dashboard" : undefined}
              className={`flex items-center rounded-xl transition-all duration-200 text-gray-600 dark:text-gray-400 hover:bg-orange-50 hover:text-orange-600 dark:hover:bg-orange-500/10 dark:hover:text-orange-400 ${
                isExpanded ? 'px-3 py-3 gap-3' : 'justify-center w-10 h-10 mx-auto'
              }`}
            >
              <LayoutGrid size={isExpanded ? 18 : 20} className="shrink-0" />
              {isExpanded && (
                <span className="text-sm font-medium whitespace-nowrap truncate">Dashboard</span>
              )}
            </Link>
          </div>
        </aside>
      )}

      {/* 
        MOBILE DRAWER
        Visible only on mobile, toggleable via FAB or header button
      */}
      {!isDashboard && (
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
              <span className="font-bold text-gray-900 dark:text-white">Menu Tools</span>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-lg bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex flex-col py-4 px-3 overflow-y-auto space-y-1">


              {mappedTools.map((tool) => {
                const Icon = tool.icon;
                const isActive = pathname.startsWith(tool.href);
                const isLocked = (!hasBlueprint && tool.href !== '/ruang-ngonten/master-blueprint') || (tool.isProOnly && !isPro);
                
                if (isLocked) {
                  return (
                    <div 
                      key={tool.href}
                      className="flex items-center justify-between px-3 py-3 rounded-xl font-medium text-gray-400 dark:text-gray-600 cursor-not-allowed opacity-60"
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
                  <Link 
                    key={tool.href}
                    href={tool.href}
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

            {/* BACK TO DASHBOARD (BOTTOM) */}
            <div className="p-4 border-t border-gray-100 dark:border-white/5 mt-auto">
              <Link 
                href="/ruang-ngonten"
                className="flex items-center gap-3 px-3 py-3 rounded-xl font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-white/5 transition-colors hover:bg-orange-50 hover:text-orange-600 dark:hover:bg-orange-500/10 dark:hover:text-orange-400"
              >
                <LayoutGrid size={18} />
                <span className="text-sm">Dashboard</span>
              </Link>
            </div>
          </aside>
        </>
      )}

      {/* Main Content Area */}
      {/* We apply left padding on desktop if the floating sidebar is present, to prevent content from hiding behind it */}
      <div className={`flex-1 w-full flex flex-col transition-all duration-300 ${!isDashboard ? 'md:pl-[88px]' : ''}`}>
        


        <div className="flex-1 w-full relative">
          {children}
        </div>
      </div>
    </div>
  );
}
