"use client";

import Link from "next/link";
import Image from "next/image";
import { BookOpen, Star, Loader2, Heart } from "lucide-react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import useSWR, { preload } from "swr";
import { getRuangBelajarDataAction, getEbookDetailAction } from "@/app/actions/ruangBelajar";

export default function RuangBelajarClient({ initialData }: { initialData?: any }) {
  const { data, isLoading } = useSWR("ruangBelajar", getRuangBelajarDataAction, {
    fallbackData: initialData,
    revalidateOnFocus: false,
    revalidateIfStale: !initialData,
    dedupingInterval: 30000
  });

  if (!data) {
    return (
      <div className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8 animate-in fade-in duration-300">
        <div className="flex flex-col items-center justify-center text-center gap-2 mb-8 md:mb-10">
          <div className="space-y-3 flex flex-col items-center">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              Mau mulai belajar dari mana?
            </h1>
            <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 max-w-xl mx-auto text-balance leading-relaxed">
              Temukan E-book, strategi, dan blueprint premium untuk membangun fondasi bisnis kontenmu.
            </p>
          </div>
        </div>
        <LoadingSpinner message="Memuat Katalog E-Book..." />
      </div>
    );
  }

  const { products, ownedProductIds, isPro, isAdmin } = data;
  const ownedSet = new Set(ownedProductIds);

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8 animate-in fade-in duration-300">
      <div className="flex flex-col items-center justify-center text-center gap-2 mb-8 md:mb-10">
        <div className="space-y-3 flex flex-col items-center">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Mau mulai belajar dari mana?
          </h1>
          <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 max-w-xl mx-auto text-balance leading-relaxed">
            Temukan E-book, strategi, dan blueprint premium untuk membangun fondasi bisnis kontenmu.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 max-w-7xl mx-auto">
            {products.map((ebook: any) => {
              const isFree = ebook.accessLevel === "FREE";
              const isProEbook = ebook.accessLevel === "PRO";
              const isPremiumEbook = ebook.accessLevel === "PREMIUM";
              
              const isOwned = ownedSet.has(ebook.id) || isAdmin;
              
              let isLocked = true;
              if (isOwned) isLocked = false;

              const reviewCount = ebook.reviews?.length || 0;
              const buyerCount = (ebook as any).buyerCount ?? ebook._count?.owners ?? 0;
              const favCount = ebook._count?.favorites || 0;
              const averageRating = reviewCount > 0 
                ? (ebook.reviews.reduce((acc: number, rev: any) => acc + rev.rating, 0) / reviewCount).toFixed(1)
                : "0.0";

              return (
                <Link 
                  prefetch={true}
                  href={`/ruang-belajar/${ebook.slug}`} 
                  onMouseEnter={() => preload(["ebookDetail", ebook.slug], () => getEbookDetailAction(ebook.slug))}
                  onTouchStart={() => preload(["ebookDetail", ebook.slug], () => getEbookDetailAction(ebook.slug))} key={ebook.id} className="group flex">
                  <div className="flex flex-row items-start w-full hover:border-rn-accent dark:hover:border-rn-accent/50 hover:shadow-xl hover:-translate-y-1.5 hover:shadow-gray-200 dark:hover:shadow-black/50 transition-all duration-300 border border-gray-200 dark:border-white/10 bg-white dark:bg-[#18181b] rounded-[16px] sm:rounded-[20px] overflow-hidden relative p-3 sm:p-4 gap-3 sm:gap-4">
                    
                    <div className="w-[100px] sm:w-[120px] shrink-0 relative overflow-hidden bg-gray-100 dark:bg-[#1f1f23] border border-gray-200 dark:border-white/5 rounded-[10px] sm:rounded-xl shadow-sm">
                      <div className="aspect-[3/4] relative flex items-center justify-center">
                        {ebook.coverUrl ? (
                          <>
                            <Image
                              src={ebook.coverUrl}
                              alt={ebook.title}
                              fill
                              sizes="(max-width: 640px) 100px, 120px"
                              priority
                              unoptimized={typeof ebook.coverUrl === "string" && (ebook.coverUrl.startsWith("data:") || ebook.coverUrl.startsWith("/api/"))}
                              className="object-cover z-0"
                            />
                            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-transparent z-10 pointer-events-none" />
                          </>
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center z-10">
                            <BookOpen className="w-12 h-12 text-gray-300 dark:text-gray-600 opacity-50" />
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col flex-1 min-w-0 py-1">
                      <div className="flex-1">
                        <h3 className="text-[17px] font-bold leading-tight tracking-tight text-gray-900 dark:text-white group-hover:text-rn-accent transition-colors line-clamp-2" title={ebook.title}>
                          {ebook.title}
                        </h3>
                        
                        <div className="flex items-center gap-1 text-xs font-medium text-gray-500 mt-1.5 mb-2">
                          <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                          <span>{averageRating === "0.0" ? "0" : averageRating}</span>
                          <span className="text-gray-400 font-normal ml-0.5">
                            ({reviewCount})
                          </span>
                          <span className="text-gray-300 dark:text-gray-600 mx-1">•</span>
                          <span className="text-gray-500 font-medium">
                            {buyerCount} pembeli
                          </span>
                          {favCount > 0 && (
                            <>
                              <span className="text-gray-300 dark:text-gray-600 mx-1">•</span>
                              <span className="text-red-500 font-medium flex items-center gap-0.5">
                                <Heart className="w-3 h-3 fill-red-500 text-red-500" />
                                {favCount}
                              </span>
                            </>
                          )}
                        </div>

                        {ebook.description && (
                           <p className="text-[11px] leading-relaxed text-gray-500 dark:text-gray-400 line-clamp-1 mb-3">
                             {ebook.description}
                           </p>
                        )}
                        
                        <div className="flex flex-wrap gap-1.5 mb-4 mt-auto">
                          <div className={`font-bold rounded px-1.5 py-0.5 text-[9px] uppercase tracking-wider ${!isLocked ? 'bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300' : 'bg-rn-accent/10 text-rn-accent dark:bg-rn-accent/20 dark:text-rn-accent'}`}>
                            {isFree ? "Gratis" : (isPremiumEbook ? "Premium" : "Pro Only")}
                          </div>
                          {isOwned && (
                             <div className="font-bold rounded px-1.5 py-0.5 text-[9px] uppercase tracking-wider bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                               Dimiliki
                             </div>
                          )}
                          {ebook.category && (
                            <div className="font-bold rounded px-1.5 py-0.5 text-[9px] bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                              {ebook.category.name}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mt-auto pt-2 flex items-end justify-between gap-x-2">
                        {isOwned ? (
                          <span className="text-[17px] font-black text-green-600 dark:text-green-500">Dimiliki</span>
                        ) : isFree ? (
                          <span className="text-[17px] font-black text-green-600 dark:text-green-500">Rp 0</span>
                        ) : (
                          <div className="flex flex-col">
                            {ebook.originalPrice && ebook.originalPrice > ebook.price ? (
                              <span className="text-[11px] sm:text-[13px] font-medium text-gray-400 dark:text-gray-500 line-through leading-none mb-1 whitespace-nowrap">
                                Rp {ebook.originalPrice.toLocaleString('id-ID')}
                              </span>
                            ) : null}
                            <span className="text-[15px] sm:text-[17px] font-black text-gray-900 dark:text-white leading-none whitespace-nowrap">
                              Rp {ebook.price ? ebook.price.toLocaleString('id-ID') : '0'}
                            </span>
                            {isProEbook && (
                               <span className="text-[9px] sm:text-[10px] text-rn-accent font-bold mt-1.5 whitespace-nowrap">(Rp 0 khusus PRO)</span>
                            )}
                          </div>
                        )}
                        <button className="whitespace-nowrap shrink-0 bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-200 text-white dark:text-gray-900 rounded-lg px-3 py-1.5 sm:px-4 sm:py-2 text-[10px] sm:text-xs font-bold shadow-sm transition-colors">
                          Buka E-Book
                        </button>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="py-16 text-center border-2 border-dashed border-gray-200 dark:border-white/10 rounded-2xl bg-white/50 dark:bg-white/5">
            <BookOpen className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Belum Ada E-Book</h3>
            <p className="text-gray-500">Belum ada e-book yang ditambahkan.</p>
          </div>
        )}
      </div>
    </div>
  );
}
