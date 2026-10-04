import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Lock, Crown, Star, BookOpen, Tag } from "lucide-react";
import { auth } from "@/auth";
import EbookActions from "./EbookActions";
import EbookGallery from "./EbookGallery";
import ReviewSection from "./ReviewSection";
import PdfViewer from "./PdfViewer";

export const dynamic = "force-dynamic";

export default async function ReadEbookPage({ params }: { params: { slug: string } }) {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/login");
  }

  const userId = session.user.id;
  const isPro = session?.user?.email?.toLowerCase() === "anggasrimugiarahayu@gmail.com";

  const ebook = await prisma.digitalProduct.findFirst({
    where: { slug: (await params).slug, isActive: true },
    include: { 
      category: true,
      favorites: { where: { userId } },
      reviews: { 
        include: { user: { select: { name: true, image: true } } },
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!ebook) {
    notFound();
  }


  const userProducts = await prisma.userOwnedProduct.findMany({
    where: { userId: session.user.id },
    select: { digitalProductId: true }
  });
  const ownedProductIds = new Set(userProducts.map(up => up.digitalProductId));

  const isFree = ebook.accessLevel === "FREE";
  const isProEbook = ebook.accessLevel === "PRO";
  const isPremiumEbook = ebook.accessLevel === "PREMIUM";
  
  const isOwned = ownedProductIds.has(ebook.id);
  
  const isAdmin = session?.user?.email === "anggasrimugiarahayu@gmail.com";
  let isLocked = true;
  if (isAdmin) isLocked = false;
  else if (isOwned) isLocked = false;

  const isFavorite = ebook.favorites.length > 0;

  
  // Calculate average rating
  const totalReviews = ebook.reviews.length;
  const averageRating = totalReviews > 0 
    ? (ebook.reviews.reduce((acc, rev) => acc + rev.rating, 0) / totalReviews).toFixed(1)
    : "0.0";
    
  const userReview = ebook.reviews.find(r => r.userId === userId);

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
        <div className="flex-shrink-0 h-16 border-b border-gray-200 dark:border-white/10 bg-transparent px-4 md:px-8 flex items-center justify-between z-10">
          <div className="flex items-center gap-3 md:gap-4">
            <Link href="/ruang-belajar" className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 transition-colors text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white shrink-0">
              <ArrowLeft size={20} />
            </Link>
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
         <Link href="/ruang-belajar" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors mb-8">
           <ArrowLeft size={16} />
           Kembali ke Katalog
         </Link>

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
                 
                 <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 dark:border-white/10 pb-6">
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
                    
                    <EbookActions productId={ebook.id} initialIsFavorite={isFavorite} pdfUrl={!isLocked ? ebook.fileUrl : null} isDownloadable={ebook.isDownloadable} />
                 </div>
               </div>

               {/* Purchase / Upgrade Box */}
               <div className="bg-white dark:bg-[#121214] shadow-sm border border-gray-200 dark:border-white/10 rounded-2xl p-6 mb-10">
                 {isLocked ? (
                   <>
                     <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                       <Lock className="w-4 h-4 text-rn-accent" />
                       Buka Akses E-Book
                     </h3>
                     <div className="bg-gray-50 dark:bg-[#18181b] border border-orange-200 dark:border-rn-accent/30 rounded-xl p-5 mb-5 shadow-inner relative overflow-hidden">
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
                             : "Beli eceran untuk hak milik seumur hidup, ATAU Anda bisa klaim secara GRATIS jika Anda berlangganan paket PRO!"}
                       </p>
                     </div>
                     
                     <div className="flex flex-col sm:flex-row gap-3">
                       {/* If it's a FREE ebook, show the Klaim (Rp 0) Form */}
                       {isFree ? (
                         <form action={async () => {
                           "use server";
                           await claimFreeEbook(ebook.id);
                         }} className="w-full">
                           <button type="submit" className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-green-600/20">
                             Klaim Gratis (Rp 0)
                           </button>
                         </form>
                       ) : (
                         /* Otherwise, show standard pricing logic */
                         <>
                           {/* For PRO ebook AND user is currently PRO -> Show Klaim Rp 0! */}
                           {isProEbook && isPro ? (
                             <form action={async () => {
                               "use server";
                               await claimFreeEbook(ebook.id);
                             }} className="w-full flex flex-col gap-3">
                               <button type="submit" className="w-full flex items-center justify-center gap-2 bg-rn-accent hover:bg-orange-600 text-white px-6 py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-rn-accent/20">
                                 Klaim Gratis (Khusus Member PRO)
                               </button>
                             </form>
                           ) : (
                             /* For PRO ebook (User is FREE) or PREMIUM ebook -> Needs actual Checkout! */
                             <>
                               <button className="flex-1 flex items-center justify-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-200 px-6 py-3.5 rounded-xl font-bold transition-all shadow-lg">
                                 Beli Eceran (Rp {ebook.price ? ebook.price.toLocaleString('id-ID') : '0'})
                               </button>
                               {isProEbook && (
                                 <Link 
                                   href="/?pricing=true" 
                                   className="flex-1 flex items-center justify-center gap-2 bg-rn-accent hover:bg-orange-600 text-white px-6 py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-rn-accent/20"
                                 >
                                   <Crown className="w-5 h-5" />
                                   Langganan PRO
                                 </Link>
                               )}
                             </>
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
                     <div className="bg-gray-50 dark:bg-[#18181b] border border-green-200 dark:border-green-500/30 rounded-xl p-5 mb-5 shadow-inner relative overflow-hidden">
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
                     <span className="text-gray-500 font-medium col-span-1">Bahasa</span>
                     <span className="text-gray-900 dark:text-white font-medium col-span-2 flex gap-2"><span>:</span> Indonesia</span>
                   </div>
                   <div className="grid grid-cols-3 gap-2">
                     <span className="text-gray-500 font-medium col-span-1">Format</span>
                     <span className="text-gray-900 dark:text-white font-medium col-span-2 flex gap-2"><span>:</span> PDF / Digital</span>
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
