"use client";

import { useState } from "react";
import { BookOpen, ChevronLeft, ChevronRight } from "lucide-react";

interface EbookGalleryProps {
  title: string;
  images: (string | null)[];
}

export default function EbookGallery({ title, images }: EbookGalleryProps) {
  const validImages = images.filter((img): img is string => typeof img === 'string' && img.trim() !== '');
  const [activeIndex, setActiveIndex] = useState(0);

  if (validImages.length === 0) {
    return (
      <div className="w-full max-w-sm mx-auto lg:mx-0 shrink-0">
         <div className="aspect-[3/4] w-full rounded-2xl overflow-hidden shadow-2xl relative bg-white dark:bg-[#121214] border border-gray-100 dark:border-white/5">
            <div className="absolute inset-0 flex items-center justify-center">
              <BookOpen className="w-16 h-16 text-gray-300 dark:text-gray-600 opacity-50" />
            </div>
         </div>
      </div>
    );
  }

  const nextImage = () => {
    setActiveIndex((prev) => (prev === validImages.length - 1 ? 0 : prev + 1));
  };

  const prevImage = () => {
    setActiveIndex((prev) => (prev === 0 ? validImages.length - 1 : prev - 1));
  };

  return (
    <div className="w-full max-w-sm mx-auto lg:mx-0 shrink-0 flex flex-col gap-4">
       {/* Main Image */}
       <div className="aspect-[3/4] w-full rounded-2xl overflow-hidden shadow-2xl relative bg-white dark:bg-[#121214] border border-gray-100 dark:border-white/5 group transition-all duration-300">
          <img 
            key={validImages[activeIndex]}
            src={validImages[activeIndex]} 
            alt={`${title} - image ${activeIndex + 1}`} 
            className="absolute inset-0 w-full h-full object-cover animate-in fade-in duration-300" 
          />
          
          {/* Navigation Arrows */}
          {validImages.length > 1 && (
            <>
              {/* Left Arrow */}
              <button 
                onClick={prevImage}
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white p-2 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 z-10 shadow-lg"
                aria-label="Previous image"
              >
                <ChevronLeft size={24} />
              </button>
              
              {/* Right Arrow */}
              <button 
                onClick={nextImage}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white p-2 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 z-10 shadow-lg"
                aria-label="Next image"
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}
       </div>
       
       {/* Thumbnails (Selalu Muncul) */}
       <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide items-center justify-start px-1">
         {validImages.map((img, idx) => (
           <button 
             key={idx}
             onClick={() => setActiveIndex(idx)}
             className={`relative w-20 aspect-[3/4] rounded-lg overflow-hidden shrink-0 transition-all duration-200 ${activeIndex === idx ? 'border-2 border-rn-accent opacity-100 ring-2 ring-orange-500/20 shadow-md transform scale-105' : 'border border-gray-200 dark:border-white/10 opacity-50 hover:opacity-100 hover:scale-100'}`}
           >
              <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
           </button>
         ))}
       </div>
    </div>
  );
}
