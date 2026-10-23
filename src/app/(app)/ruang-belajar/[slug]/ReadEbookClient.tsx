"use client";

import { useState, useEffect } from "react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import useSWR, { preload } from "swr";
import { getEbookDetailAction, getRuangBelajarDataAction, claimFreeEbook } from "@/app/actions/ruangBelajar";
import { getCheckoutDetailsAction } from "@/app/actions/checkout";
import { trackProductViewAction, trackProductClickAction } from "@/app/actions/analytics";
import { useRouter } from "next/navigation";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Lock, Crown, Star, BookOpen, Tag } from "lucide-react";
import { BackButton } from "@/components/ui/BackButton";
import { createCheckoutToken } from "@/app/actions/payment";
import EbookActions from "./EbookActions";
import EbookGallery from "./EbookGallery";
import ReviewSection from "./ReviewSection";
import PdfViewer from "./PdfViewer";


export default function ReadEbookClient({ slug, initialData }: { slug: string; initialData?: any }) {

  const router = useRouter();
  const { data, isLoading, mutate } = useSWR(["ebookDetail", slug], () => getEbookDetailAction(slug), {
    fallbackData: initialData,
    revalidateOnFocus: false,
    dedupingInterval: 60000
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (data && !data.notFound && data.ebook?.id) {
      trackProductViewAction(data.ebook.id);
    }
  }, [data?.ebook?.id]);

  if (!data) {
    return <LoadingSpinner message="Memuat E-Book..." />;
  }

  if (data.notFound) {
    router.push('/ruang-belajar');
    return null;
  }

  const { ebook, isPro, isAdmin, ownedProductIds, userId } = data;
  
  const isFree = ebook.accessLevel === "FREE";
  const isProEbook = ebook.accessLevel === "PRO";
  const isPremiumEbook = ebook.accessLevel === "PREMIUM";
  
  const isOwned = (ownedProductIds || []).includes(ebook.id) || isAdmin;
  let isLocked = !isOwned;


  const isFavorite = ebook.favorites?.length > 0;
  const favoriteCount = ebook.favoriteCount ?? (ebook._count?.favorites || 0);

  
  // Calculate average rating
  const totalReviews = ebook.reviews.length;
  const averageRating = totalReviews > 0 
    ? (ebook.reviews.reduce((acc: number, rev: any) => acc + rev.rating, 0) / totalReviews).toFixed(1)
    : "0.0";
    
  const userReview = ebook.reviews.find((r: any) => r.userId === userId);

  // Convert Google Drive 'view' link to 'preview' to allow embedding
  let embedUrl = ebook.fileUrl || "";
  if (embedUrl.includes("drive.google.com") && embedUrl.includes("/view")) {
    embedUrl = embedUrl.replace("/view", "/preview");
  }

  // If the user has access and we have an embedUrl, show the PDF Viewer
  if (!isLocked && embedUrl) {
    return (
      <div className="flex flex-col h-[calc(100vh-148px)] md:h-[calc(100vh-164px)] overflow-hidden bg-transparent">
        {/* Header Toolbar */}
        <div className="flex-shrink-0 h-16 border-b border-gray-200 dark:border-[#2C3246] bg-gray-50/95 dark:bg-[#0A1128]/95 backdrop-blur-md px-4 md:px-8 flex items-center justify-between relative z-20">
          <div className="flex items-center gap-3 md:gap-4">
            <BackButton 
              href="/ruang-belajar" 
              onClick={() => {
                window.location.href = "/ruang-belajar";
              }}
            />
            <div className="min-w-0">
              <h1 className="font-bold text-sm md:text-base text-gray-900 dark:text-white leading-none flex items-center gap-2 truncate">
                {ebook.title}
                {!isFree && !isOwned && (
                   <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-gray-100 dark:bg-white/10 text-gray-500 shrink-0 hidden sm:inline-block">
                     PRO
                   </span>
                )}
              </h1>
              <p className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">{ebook.category?.name || 'Produk Digital'}</p>
            </div>
          </div>
          
          <EbookActions 
            productId={ebook.id} 
            initialIsFavorite={isFavorite} 
            initialFavoriteCount={favoriteCount}
            canReview={true} 
            userReview={userReview}
            pdfUrl={ebook.fileUrl}
            isDownloadable={ebook.isDownloadable} 
          />
        </div>

        {/* PDF Viewer */}
        <PdfViewer embedUrl={embedUrl} title={ebook.title} />
      </div>
    );
  }

  // Otherwise, show the E-book Detail / Landing Page (for FREE users or if no URL)
  return (
    <div className="min-h-[calc(100vh-80px)]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
         {/* Navigation */}
         <div className="mb-8 w-fit">
           <BackButton href="/ruang-belajar" />
         </div>

         <div className="flex flex-col md:flex-row gap-8 lg:gap-16">
            
            {/* Left Column - Cover & Gallery */}
            <EbookGallery 
               title={ebook.title} 
               images={[ebook.coverUrl, (ebook as any).coverUrl2, (ebook as any).coverUrl3]} 
            />

            {/* Right Column - Book Details */}
            <div className="flex-1 flex flex-col">
               
               {/* Title & Metadata */}
               <div className="mb-8">
                 <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white leading-tight mb-4 tracking-tight">
                   {ebook.title}
                 </h1>
                 
                 <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 dark:border-[#2C3246] pb-6">
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-1 text-sm font-bold text-gray-900 dark:text-white">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        {averageRating}
                        <span className="text-gray-500 font-normal ml-1">({totalReviews} ulasan)</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                        <Tag className="w-4 h-4" />
                        {ebook.category?.name || 'Produk Digital'}
                      </div>
                    </div>
                    
                    <EbookActions productId={ebook.id} initialIsFavorite={isFavorite} initialFavoriteCount={favoriteCount} pdfUrl={!isLocked ? ebook.fileUrl : null} isDownloadable={ebook.isDownloadable} />
                 </div>
               </div>

               {/* Purchase / Upgrade Box */}
               <div className="bg-white dark:bg-[#141B31] shadow-sm border border-gray-200 dark:border-[#2C3246] rounded-2xl p-6 mb-10">
                 {isLocked ? (
                   <>
                     <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                       <Lock className="w-4 h-4 text-rn-accent" />
                       Buka Akses E-Book
                     </h3>
                     <div className="bg-gray-50 dark:bg-[#141B31] border border-orange-200 dark:border-rn-accent/30 rounded-xl p-5 mb-5 shadow-inner relative overflow-hidden">
                       <div className="absolute top-0 left-0 w-1 h-full bg-rn-accent"></div>
                       <div className="flex items-center justify-between mb-2">
                         <span className="text-sm font-bold text-gray-900 dark:text-white">{isFree ? "E-Book Gratis" : (isPremiumEbook ? "Eksklusif Premium" : "E-Book PRO")}</span>
                         <span className="bg-rn-accent/10 text-rn-accent px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider">Hak Milik Seumur Hidup</span>
                       </div>
                       <div className="text-2xl font-black text-gray-900 dark:text-white mb-1">
                         Rp {ebook.price ? ebook.price.toLocaleString('id-ID') : '0'}
                       </div>
                       <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                         {isFree
                           ? "Silakan klaim e-book ini secara gratis (Rp 0) untuk memasukkannya ke dalam Brankas Perpustakaan Pribadi Anda seumur hidup."
                           : isPremiumEbook 
                             ? "E-book ini sangat eksklusif. Beli sekarang dan dapatkan akses penuh untuk membaca dan mendownload selamanya." 
                             : isPro ? "Sebagai member Paket E-Book, Anda berhak mengklaim e-book ini secara gratis!" : "Beli satuan untuk hak milik seumur hidup, atau berlangganan Paket E-Book untuk akses gratis!"}
                       </p>
                     </div>
                     
                     <div className="flex flex-col sm:flex-row gap-3">
                       {/* If it's a FREE ebook, show the Klaim (Rp 0) Form */}
                       {isFree ? (
                         <form action={async () => {
                           setIsSubmitting(true);
                           await claimFreeEbook(ebook.id);
                           mutate();
                           setIsSubmitting(false);
                         }} className="w-full">
                           <button type="submit" disabled={isSubmitting} className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-green-600/20 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}">
                             Klaim Gratis (Rp 0)
                           </button>
                         </form>
                       ) : (
                         /* Otherwise, show standard pricing logic */
                         <>
                           {/* For PRO ebook AND user is currently PRO -> Show Klaim Rp 0! */}
                           {isProEbook && isPro ? (
                             <form action={async () => {
                               setIsSubmitting(true);
                               await claimFreeEbook(ebook.id);
                               mutate();
                               setIsSubmitting(false);
                             }} className="w-full flex flex-col gap-3">
                               <button type="submit" disabled={isSubmitting} className="w-full flex items-center justify-center gap-2 bg-[#f97316] hover:bg-[#ea580c] dark:bg-[#f97316] dark:hover:bg-[#fb923c] text-white px-6 py-3.5 rounded-xl font-bold transition-all shadow-sm shadow-orange-500/20 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}">
                                 Klaim Gratis (Khusus Member Paket E-Book)
                               </button>
                             </form>
                           ) : (
                             /* For PRO ebook (User is FREE) or PREMIUM ebook -> Needs actual Checkout! */
                             <div className="w-full flex flex-col gap-3">
                               <Link 
                                 href={`/checkout?type=EBOOK&productId=${ebook.id}`} 
                                 onMouseEnter={() => preload(["checkout", "EBOOK", ebook.id], () => getCheckoutDetailsAction("EBOOK", ebook.id))}
                                 onTouchStart={() => preload(["checkout", "EBOOK", ebook.id], () => getCheckoutDetailsAction("EBOOK", ebook.id))}
                                 onClick={() => trackProductClickAction(ebook.id)}
                                 className="w-full flex items-center justify-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-200 px-6 py-3.5 rounded-xl font-bold transition-all shadow-lg">
                                   Beli Satuan (Rp {ebook.price ? ebook.price.toLocaleString('id-ID') : '0'})
                               </Link>
                               {isProEbook && (
                                 <Link 
                                   href="/?pricing=true&cat=ebook" 
                                   className="w-full flex items-center justify-center gap-2 bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-500/20 px-6 py-3.5 rounded-xl font-bold transition-all border border-orange-200 dark:border-orange-500/20"
                                 >
                                   <Crown className="w-5 h-5" /> Beli Paket E-Book (Akses Semua E-book PRO)
                                 </Link>
                               )}
                             </div>
                           )}
                         </>
                       )}
                     </div>
                   </>
                 ) : (
                   <>
                     <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                       <BookOpen className="w-4 h-4 text-green-500" />
                       Status Akses
                     </h3>
                     <div className="bg-gray-50 dark:bg-[#141B31] border border-green-200 dark:border-green-500/30 rounded-xl p-5 mb-5 shadow-inner relative overflow-hidden">
                       <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
                       <div className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                         Akses Terbuka
                       </div>
                       <p className="text-xs text-gray-500 mt-2">Namun dokumen PDF E-Book ini belum tersedia (tautan masih kosong).</p>
                     </div>
                   </>
                 )}
               </div>

               {/* Description */}
               <div className="mb-10">
                 <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Deskripsi</h3>
                 <div className="prose prose-sm dark:prose-invert max-w-none text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap">
                   {ebook.description || "Tidak ada deskripsi yang ditambahkan untuk e-book ini."}
                 </div>
               </div>

               {/* Information Table */}
               <div>
                 <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Informasi Buku</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 text-sm">
                   <div className="grid grid-cols-3 gap-2">
                     <span className="text-gray-500 font-medium col-span-1">Penulis</span>
                     <span className="text-gray-900 dark:text-white font-medium col-span-2 flex gap-2"><span>:</span> {ebook.author || "Admin"}</span>
                   </div>
                   <div className="grid grid-cols-3 gap-2">
                     <span className="text-gray-500 font-medium col-span-1">Halaman</span>
                     <span className="text-gray-900 dark:text-white font-medium col-span-2 flex gap-2"><span>:</span> {ebook.pageCount ? `${ebook.pageCount} Halaman` : '-'}</span>
                   </div>
                   
                   
                   <div className="grid grid-cols-3 gap-2">
                     <span className="text-gray-500 font-medium col-span-1">Bahasa</span>
                     <span className="text-gray-900 dark:text-white font-medium col-span-2 flex gap-2"><span>:</span> {ebook.language || "Indonesia"}</span>
                   </div>
                   <div className="grid grid-cols-3 gap-2">
                     <span className="text-gray-500 font-medium col-span-1">Format</span>
                     <span className="text-gray-900 dark:text-white font-medium col-span-2 flex gap-2"><span>:</span> {ebook.formatType || "PDF / Digital"}</span>
                   </div>
                   <div className="grid grid-cols-3 gap-2">
                     <span className="text-gray-500 font-medium col-span-1">Kategori</span>
                     <span className="text-gray-900 dark:text-white font-medium col-span-2 flex gap-2"><span>:</span> {ebook.category?.name || 'Umum'}</span>
                   </div>
                   <div className="grid grid-cols-3 gap-2">
                     <span className="text-gray-500 font-medium col-span-1">Akses</span>
                     <span className="text-gray-900 dark:text-white font-medium col-span-2 flex gap-2"><span>:</span> {isFree ? 'Gratis' : isPremiumEbook ? 'Premium' : 'Pro Only'}</span>
                   </div>
                 </div>
               </div>
               
               {/* Reviews */}
               <ReviewSection 
                 productId={ebook.id} 
                 reviews={ebook.reviews} 
                 canReview={!isLocked} 
                 userReview={userReview} 
               />
               
            </div>
         </div>
      </div>
    </div>
  );
}
