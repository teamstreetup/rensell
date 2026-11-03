'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from './ToastProvider';
import Image from 'next/image';

interface ReviewSectionProps {
  productId: string;
  initialRating: number;
}

export default function ReviewSection({ productId, initialRating }: ReviewSectionProps) {
  const { showToast } = useToast();
  
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentRating, setCurrentRating] = useState(initialRating);
  
  // Form State
  const [ratingInput, setRatingInput] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [commentInput, setCommentInput] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/reviews?productId=${productId}`);
      if (!res.ok) throw new Error('Failed to fetch reviews');
      
      const data = await res.json();
      setReviews(data.reviews || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) setIsAuthenticated(true);
    fetchReviews();
  }, [fetchReviews]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (ratingInput < 1) {
      showToast('Please select a star rating', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId,
          rating: ratingInput,
          comment: commentInput
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit review');

      showToast('Review published successfully!', 'success');
      
      setCurrentRating(data.newAvgRating);
      setRatingInput(0);
      setCommentInput('');
      fetchReviews();

    } catch (error: any) {
      console.error(error);
      showToast(error.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-12 bg-white rounded-3xl border border-gray-100 shadow-soft p-5 sm:p-8">
      <h2 className="text-xl sm:text-2xl font-black mb-6 text-dark flex items-center gap-2.5">
        <i className="fas fa-star text-amber-400" /> Customer Reviews
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-8 border-b border-gray-100 pb-8">
        {/* Rating Overview */}
        <div className="md:col-span-1 bg-gray-50 border border-gray-100/50 rounded-2xl p-6 text-center flex flex-col items-center justify-center">
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Average Score</p>
          <h3 className="text-5xl font-black text-dark mb-2 leading-none">{currentRating.toFixed(1)}</h3>
          <div className="text-amber-400 text-sm mb-2.5 flex gap-1 justify-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <i key={star} className={`fas fa-star ${star <= Math.round(currentRating) ? 'text-amber-400' : 'text-gray-200'}`} />
            ))}
          </div>
          <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">
            Based on {reviews.length} total review{reviews.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Input Form */}
        <div className="md:col-span-2">
          {isAuthenticated ? (
            <form onSubmit={handleSubmit} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-4">
              <h4 className="font-extrabold text-xs text-gray-400 uppercase tracking-wider">Write your review</h4>
              
              {/* Star Selector */}
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className="text-xl focus:outline-none transition-all duration-200 hover:scale-125"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRatingInput(star)}
                    >
                      <i className={`fas fa-star ${
                        (hoverRating || ratingInput) >= star ? 'text-amber-400' : 'text-gray-200'
                      }`} />
                    </button>
                  ))}
                </div>
                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider ml-2">
                  {ratingInput > 0 ? `${ratingInput} of 5 Stars` : 'Select a rating'}
                </span>
              </div>

              <textarea
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                placeholder="Share your thoughts about this item (condition, fit, delivery)..."
                rows={3}
                maxLength={500}
                className="input !py-2.5 !text-xs mb-1"
              />
              
              <div className="flex justify-between items-center pt-2">
                <p className="text-[10px] text-gray-400 font-semibold">{commentInput.length} / 500 characters</p>
                <button 
                  type="submit" 
                  disabled={submitting || ratingInput === 0}
                  className="btn-primary !py-2.5 !px-6 !text-xs uppercase tracking-wider font-extrabold"
                >
                  {submitting ? 'Publishing...' : 'Publish'}
                </button>
              </div>
            </form>
          ) : (
            <div className="h-full bg-gray-50 rounded-2xl border border-dashed border-gray-200/80 flex flex-col items-center justify-center p-6 text-center">
              <i className="fas fa-lock text-gray-300 text-xl mb-2" />
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-3">Login to write a review</p>
              <a href="/auth/login" className="btn-outline !py-2 !px-5 !text-xs uppercase tracking-wider font-extrabold">Sign In</a>
            </div>
          )}
        </div>
      </div>

      {/* Review List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-6">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-10 bg-gray-50/50 rounded-2xl border border-gray-100">
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">No reviews listed yet</p>
            <p className="text-[11px] text-gray-400 mt-1">Be the first to share your experience with this item!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {reviews.map((review) => (
              <div key={review._id} className="py-5 first:pt-0 last:pb-0">
                <div className="flex justify-between items-start gap-4 mb-2">
                  <div className="flex items-center gap-3">
                    <div className="relative w-9 h-9 rounded-full overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-100">
                      {review.userId.profileImage ? (
                        <Image src={review.userId.profileImage} alt={review.userId.name} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs bg-gray-50">
                          <i className="fas fa-user" />
                        </div>
                      )}
                    </div>
                    <div>
                      <strong className="text-dark block text-xs sm:text-sm font-extrabold">{review.userId.name}</strong>
                      <div className="flex text-amber-400 text-[9px] mt-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <i key={s} className={`fas fa-star ${s <= review.rating ? 'text-amber-400' : 'text-gray-200'}`} />
                        ))}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider whitespace-nowrap">
                    {new Date(review.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                {review.comment && (
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-medium pl-12 mt-1 max-w-2xl">
                    {review.comment}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
