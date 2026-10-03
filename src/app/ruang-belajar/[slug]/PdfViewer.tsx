"use client";

import { useState, useRef, useEffect } from "react";
import { Maximize, Minimize } from "lucide-react";

export default function PdfViewer({ embedUrl, title }: { embedUrl: string, title: string }) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const viewerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      viewerRef.current?.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <div ref={viewerRef} className="flex-1 w-full bg-[#0f0f0f] relative overflow-hidden flex flex-col group">
      <iframe 
        src={embedUrl} 
        className="absolute -top-[56px] left-0 w-full h-[calc(100%+56px)] border-0"
        allow="autoplay; fullscreen"
        title={title}
      />
      
      {/* Floating Fullscreen Button */}
      <button
        onClick={toggleFullscreen}
        className="absolute bottom-5 right-5 z-10 bg-[#1a1a1a]/80 hover:bg-black text-gray-300 hover:text-white p-2.5 rounded-full shadow-lg backdrop-blur-sm border border-white/10 transition-all flex items-center justify-center opacity-40 group-hover:opacity-100"
        title={isFullscreen ? "Keluar Layar Penuh" : "Layar Penuh"}
      >
        {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
      </button>
    </div>
  );
}
