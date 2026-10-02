"use client";

import { useState } from "react";
import { Heart, Share2, Star, X, Download } from "lucide-react";
import { toggleFavorite, addReview } from "../actions";

export default function EbookActions({ 
  productId, 
  initialIsFavorite,
  canReview = false,
  userReview = null,
  pdfUrl = null,
  isDownloadable = false
}: { 
  productId: string, 
  initialIsFavorite: boolean,
  canReview?: boolean,
  userReview?: any,
  pdfUrl?: string | null,
  isDownloadable?: boolean
}) {
  const [isFav, setIsFav] = useState(initialIsFavorite);
  const [isSubmittingFav, setIsSubmittingFav] = useState(false);
  const [shareText, setShareText] = useState("Bagikan");

  // Review Modal State
  const [showModal, setShowModal] = useState(false);
  const [rating, setRating] = useState(userReview?.rating || 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState(userReview?.comment || "");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const handleFavorite = async () => {
    if (isSubmittingFav) return;
    setIsSubmittingFav(true);
    setIsFav(!isFav); // optimistic UI
    try {
      await toggleFavorite(productId);
    } catch (e) {
      setIsFav(isFav); // revert on error
    } finally {
      setIsSubmittingFav(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: document.title,
          url: url
        });
      } catch (err) {
        console.log("Error sharing", err);
      }
    } else {
      await navigator.clipboard.writeText(url);
      setShareText("Disalin!");
      setTimeout(() => setShareText("Bagikan"), 2000);
    }
  };

  const handleSubmitReview = async (e: any) => {
    e.preventDefault();
    if (rating === 0) return alert("Pilih rating bintang terlebih dahulu");
    
    setIsSubmittingReview(true);
    try {
      await addReview(productId, rating, comment);
      setShowModal(false);
      alert("Ulasan berhasil disimpan! Terima kasih.");
    } catch (e) {
      alert("Gagal menyimpan ulasan.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-3 md:gap-4">
        {isDownloadable && pdfUrl && (
          <a 
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm font-bold text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
          >
            <Download className="w-4 h-4" /> 
            <span className="hidden sm:inline">Download</span>
          </a>
        )}
        {canReview && (
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 text-sm font-bold text-gray-600 dark:text-gray-400 hover:text-yellow-500 dark:hover:text-yellow-400 transition-colors"
          >
            <Star className="w-4 h-4" />
            <span className="hidden sm:inline">{userReview ? "Edit Ulasan" : "Beri Ulasan"}</span>
          </button>
        )}
        
        <button 
          onClick={handleFavorite}
          disabled={isSubmittingFav}
          className={`flex items-center gap-1.5 text-sm font-bold transition-colors ${
            isFav ? 'text-red-500 hover:text-red-600' : 'text-gray-600 dark:text-gray-400 hover:text-rn-accent'
          }`}
        >
          <Heart className="w-4 h-4" fill={isFav ? "currentColor" : "none"} /> 
          <span className="hidden sm:inline">Favorit</span>
        </button>

        <button 
          onClick={handleShare}
          className="flex items-center gap-1.5 text-sm font-bold text-gray-600 dark:text-gray-400 hover:text-rn-accent transition-colors"
        >
          <Share2 className="w-4 h-4" /> 
          <span className="hidden sm:inline">{shareText}</span>
        </button>
      </div>

      {/* Review Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#18181b] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden relative border border-gray-100 dark:border-white/10 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/5">
              <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                Ulasan Anda
              </h3>
              <button 
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-gray-200 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/20 flex items-center justify-center text-gray-600 dark:text-gray-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmitReview} className="p-6">
              <div className="flex justify-center items-center gap-2 mb-6">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setRating(s)}
                    onMouseEnter={() => setHoverRating(s)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="focus:outline-none transition-transform hover:scale-110"
                  >
                    <Star 
                      className={`w-10 h-10 transition-colors ${
                        (hoverRating || rating) >= s 
                          ? "fill-yellow-400 text-yellow-400" 
                          : "text-gray-200 dark:text-gray-700"
                      }`} 
                    />
                  </button>
                ))}
              </div>
              <p className="text-center text-sm font-bold text-gray-500 dark:text-gray-400 mb-6 uppercase tracking-wider">
                {rating === 0 ? "Pilih Bintang" : rating === 5 ? "Luar Biasa!" : rating === 4 ? "Sangat Bagus" : rating === 3 ? "Bagus" : rating === 2 ? "Kurang Memuaskan" : "Sangat Mengecewakan"}
              </p>

              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Komentar (Opsional)
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Ceritakan pengalaman Anda belajar dari e-book ini..."
                  className="w-full bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl p-4 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-rn-accent focus:border-transparent outline-none min-h-[120px] resize-none"
                />
              </div>

              <button 
                type="submit"
                disabled={isSubmittingReview || rating === 0}
                className="w-full py-3.5 bg-rn-accent text-white font-bold rounded-xl hover:bg-orange-600 disabled:opacity-50 transition-colors shadow-lg shadow-rn-accent/20 flex items-center justify-center gap-2"
              >
                {isSubmittingReview ? "Menyimpan..." : "Kirim Ulasan"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
