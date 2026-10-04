import prisma from "@/lib/prisma";
import Link from "next/link";
import { BookOpen, Star, Lock } from "lucide-react";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

export default async function RuangBelajarPage() {
  const session = await auth();
  let isPro = false;

  if (session?.user?.email) {
    isPro = session.user.email.toLowerCase() === "anggasrimugiarahayu@gmail.com";
  }

  
  const products = await prisma.digitalProduct.findMany({
    where: { isActive: true },
    include: { category: true, reviews: { select: { rating: true } } },
    orderBy: { createdAt: 'desc' }
  });

  const userProducts = session?.user?.id ? await prisma.userOwnedProduct.findMany({
    where: { userId: session.user.id },
    select: { digitalProductId: true }
  }) : [];
  const ownedProductIds = new Set(userProducts.map(up => up.digitalProductId));


  return (
    <div className="flex-1 flex flex-col p-4 md:p-8 max-w-7xl mx-auto w-full">
      <div className="mb-10 text-center max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-3 font-heading text-gray-900 dark:text-white">Mau mulai belajar dari mana?</h1>
        <p className="text-[15px] leading-relaxed text-gray-600 dark:text-gray-400">
          Temukan E-book, strategi, dan blueprint premium untuk membangun fondasi bisnis kontenmu.
        </p>
      </div>

      <div className="space-y-6">
        {products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 max-w-7xl mx-auto">
            
            {products.map((ebook: any) => {
              const isFree = ebook.accessLevel === "FREE";
              const isProEbook = ebook.accessLevel === "PRO";
              const isPremiumEbook = ebook.accessLevel === "PREMIUM";
              
              const isAdmin = session?.user?.email === "anggasrimugiarahayu@gmail.com";
              const isOwned = ownedProductIds.has(ebook.id) || isAdmin;
              
              // For Admin, everything is unlocked. For others, ONLY if they own it.
              let isLocked = true;
              if (isOwned) isLocked = false;

              const reviewCount = ebook.reviews?.length || 0;

              const averageRating = reviewCount > 0 
                ? (ebook.reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviewCount).toFixed(1)
                : "0.0";

              return (
                <Link href={`/ruang-belajar/${ebook.slug}`} key={ebook.id} className="group flex">
                  <div className="flex flex-col sm:flex-row w-full hover:border-rn-accent dark:hover:border-rn-accent/50 hover:shadow-xl hover:-translate-y-1.5 hover:shadow-gray-200 dark:hover:shadow-black/50 transition-all duration-300 border border-gray-200 dark:border-white/10 bg-white dark:bg-[#18181b] rounded-2xl overflow-hidden relative p-4 gap-4">
                    
                    <div className="w-full sm:w-[120px] shrink-0 relative overflow-hidden bg-gray-100 dark:bg-[#1f1f23] border border-gray-200 dark:border-white/5 rounded-xl shadow-sm">
                      <div className="aspect-[3/4] relative">
                        {ebook.coverUrl ? (
                          <>
                            <img src={ebook.coverUrl} alt={ebook.title} className="absolute inset-0 w-full h-full object-cover z-0" />
                            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-transparent z-10 pointer-events-none" />
                          </>
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center z-10">
                            <BookOpen className="w-12 h-12 text-gray-300 dark:text-gray-600 opacity-50" />
                          </div>
                        )}
                        
                      </div>
                    </div>
                    
                    <div className="flex flex-col flex-1 py-1">
                      <div className="flex-1">
                        <h3 className="text-[17px] font-bold leading-tight tracking-tight text-gray-900 dark:text-white group-hover:text-rn-accent transition-colors line-clamp-2" title={ebook.title}>
                          {ebook.title}
                        </h3>
                        
                        <div className="flex items-center gap-1 text-xs font-medium text-gray-500 mt-1.5 mb-2">
                          <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                          <span>{averageRating === "0.0" ? "0" : averageRating}</span>
                          <span className="text-gray-400 font-normal ml-0.5">
                            ({reviewCount > 0 ? `${reviewCount} ulasan` : "Belum ada ulasan"})
                          </span>
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

                      
                      <div className="mt-auto pt-2.5 flex items-center justify-between border-t border-gray-100 dark:border-white/5">
                        {isOwned ? (
                          <span className="text-[17px] font-black text-green-600 dark:text-green-500">Dimiliki</span>
                        ) : isFree ? (
                          <span className="text-[17px] font-black text-green-600 dark:text-green-500">Rp 0</span>
                        ) : (
                          <div className="flex flex-col">
                            <span className="text-[17px] font-black text-gray-900 dark:text-white leading-none">
                              Rp {ebook.price ? ebook.price.toLocaleString('id-ID') : '0'}
                            </span>
                            {isProEbook && (
                               <span className="text-[8px] text-rn-accent font-bold mt-1 uppercase tracking-wider">Atau Klaim Rp 0 dgn PRO</span>
                            )}
                          </div>
                        )}
                        <button className="bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-200 text-white dark:text-gray-900 rounded-lg px-4 py-2 text-xs font-bold shadow-sm transition-colors">
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
