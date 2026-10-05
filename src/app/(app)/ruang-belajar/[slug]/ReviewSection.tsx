"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { addReview } from "../actions";

export default function ReviewSection({ 
  productId, 
  reviews, 
  canReview, 
  userReview 
}: { 
  productId: string, 
  reviews: any[], 
  canReview: boolean,
  userReview: any 
}) {
  const [rating, setRating] = useState(userReview?.rating || 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState(userReview?.comment || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(!userReview && canReview);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (rating === 0) return alert("Pilih rating bintang terlebih dahulu");
    
    setIsSubmitting(true);
    try {
      await addReview(productId, rating, comment);
      setShowForm(false);
      alert("Ulasan berhasil disimpan!");
    } catch (e) {
      alert("Gagal menyimpan ulasan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-12 pt-10 border-t border-gray-200 dark:border-white/10">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Ulasan Pembaca</h3>
        {canReview && !showForm && (
          <button 
            onClick={() => setShowForm(true)}
            className="text-sm font-bold text-rn-accent hover:text-orange-600"
          >
            {userReview ? "Edit Ulasan Saya" : "Tulis Ulasan"}
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white shadow-sm dark:bg-[#121214] border border-gray-200 dark:border-white/10 rounded-2xl p-6 mb-8">
          <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-4">
            {userReview ? "Edit Ulasan Anda" : "Bagikan Pengalaman Anda"}
          </h4>
          
          <div className="flex items-center gap-2 mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="focus:outline-none"
              >
                <Star 
                  className={`w-8 h-8 transition-colors ${
                    (hoverRating || rating) >= star 
                      ? "fill-yellow-400 text-yellow-400" 
                      : "text-gray-300 dark:text-gray-600"
                  }`} 
                />
              </button>
            ))}
            <span className="text-xs text-gray-500 ml-2">
              {rating === 0 ? "Pilih Bintang" : `${rating} Bintang`}
            </span>
          </div>

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Tulis ulasan, kritik, atau saran tentang e-book ini..."
            className="w-full bg-white dark:bg-[#18181b] border border-gray-200 dark:border-white/10 rounded-xl p-4 text-sm text-gray-900 dark:text-white mb-4 focus:ring-2 focus:ring-rn-accent focus:border-transparent outline-none min-h-[100px]"
          />

          <div className="flex justify-end gap-3">
            {userReview && (
              <button 
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-sm font-bold text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              >
                Batal
              </button>
            )}
            <button 
              type="submit"
              disabled={isSubmitting || rating === 0}
              className="px-6 py-2 bg-rn-accent text-white font-bold rounded-lg hover:bg-orange-600 disabled:opacity-50"
            >
              {isSubmitting ? "Menyimpan..." : "Simpan Ulasan"}
            </button>
          </div>
        </form>
      )}

      <div className="space-y-6">
        {reviews.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
            Belum ada ulasan untuk e-book ini. Jadilah yang pertama!
          </p>
        ) : (
          reviews.map((rev) => (
            <div key={rev.id} className="border-b border-gray-100 dark:border-white/5 pb-6 last:border-0">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-white/10 flex items-center justify-center font-bold text-gray-500 text-xs overflow-hidden">
                  {rev.user?.image ? (
                    <img src={rev.user.image} alt={rev.user.name} className="w-full h-full object-cover" />
                  ) : (
                    rev.user?.name?.charAt(0) || "U"
                  )}
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-900 dark:text-white">
                    {rev.user?.name || "Member"}
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star} 
                        className={`w-3 h-3 ${rev.rating >= star ? "fill-yellow-400 text-yellow-400" : "text-gray-300 dark:text-gray-700"}`} 
                      />
                    ))}
                    <span className="text-[10px] text-gray-400 ml-1">
                      {new Date(rev.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              </div>
              {rev.comment && (
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  {rev.comment}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
