"use client";

import { useState, useRef, useEffect } from "react";
import { Maximize, Minimize } from "lucide-react";

export default function PdfViewer({ embedUrl, title }: { embedUrl: string, title: string }) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const viewerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      if (iframeRef.current) {
        try {
          iframeRef.current.src = "about:blank";
        } catch {
          // ignore
        }
      }
    };
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
    <div ref={viewerRef} className="flex-1 w-full bg-[#0f0f0f] relative overflow-hidden flex flex-col group [isolation:isolate] z-0">
      <iframe 
        ref={iframeRef}
        src={embedUrl} 
        className="absolute -top-[56px] left-0 w-full h-[calc(100%+56px)] border-0"
        allow="autoplay; fullscreen"
        title={title}
      />
      
      {/* Floating Fullscreen Button */}
      <button
        onClick={toggleFullscreen}
        className="absolute top-4 right-4 z-10 text-[#e8eaed] hover:bg-white/10 p-2 rounded-full transition-all flex items-center justify-center opacity-60 hover:opacity-100"
        title={isFullscreen ? "Keluar Layar Penuh" : "Layar Penuh"}
      >
        {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
      </button>
    </div>
  );
}
