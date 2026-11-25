import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { reviewAPI, extractApiError } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { formatFullDate } from '../utils/formatters';
import { resolveImageUrl } from '../utils/imageUrl';

export default function ReviewSection({ productId, initialRating = 0, onRatingChange }) {
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentRating, setCurrentRating] = useState(Number(initialRating || 0));

  const [ratingInput, setRatingInput] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [commentInput, setCommentInput] = useState('');

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      const data = await reviewAPI.getByProduct(productId);
      setReviews(data.reviews || []);
    } catch (error) {
      console.error('Failed to load reviews:', error);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    setCurrentRating(Number(initialRating || 0));
  }, [initialRating]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (ratingInput < 1) {
      showToast('Please select a star rating', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const data = await reviewAPI.create({
        productId,
        rating: ratingInput,
        comment: commentInput.trim(),
      });
      showToast('Review published successfully!', 'success');
      if (data.newAvgRating !== undefined) {
        setCurrentRating(Number(data.newAvgRating));
        onRatingChange?.(Number(data.newAvgRating));
      }
      setRatingInput(0);
      setCommentInput('');
      fetchReviews();
    } catch (error) {
      showToast(extractApiError(error, 'Failed to publish review'), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rensell-panel p-4 p-md-5 mt-4">
      <h4 className="fw-bold text-dark d-flex align-items-center gap-2 mb-4">
        <i className="bi bi-star-fill text-warning" /> Customer Reviews
      </h4>

      <div className="row g-4 pb-4 mb-4 border-bottom">
        {/* Average Score Box */}
        <div className="col-12 col-md-4">
          <div className="bg-light rounded-4 p-4 text-center h-100 d-flex flex-column justify-content-center">
            <div className="text-muted text-uppercase fw-bold small mb-1">Average Score</div>
            <div className="display-4 fw-bold text-dark lh-1 mb-2">{currentRating.toFixed(1)}</div>
            <div className="text-warning mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <i
                  key={star}
                  className={`bi ${
                    star <= Math.round(currentRating) ? 'bi-star-fill text-warning' : 'bi-star text-secondary opacity-25'
                  } mx-1`}
                />
              ))}
            </div>
            <div className="text-muted small fw-semibold">
              Based on {reviews.length} review{reviews.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {/* Review Form */}
        <div className="col-12 col-md-8">
          {isAuthenticated ? (
            <form onSubmit={handleSubmit} className="border rounded-4 p-4 bg-white">
              <h6 className="fw-bold text-muted text-uppercase small mb-3">Write or Update Your Review</h6>

              <div className="d-flex align-items-center gap-2 mb-3">
                <div>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className="btn btn-link p-0 me-1 fs-4 text-decoration-none"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRatingInput(star)}
                      aria-label={`Rate ${star} stars`}
                    >
                      <i
                        className={`bi ${
                          (hoverRating || ratingInput) >= star
                            ? 'bi-star-fill text-warning'
                            : 'bi-star text-secondary opacity-25'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <span className="text-muted small fw-semibold">
                  {ratingInput > 0 ? `${ratingInput} of 5 Stars` : 'Select a rating'}
                </span>
              </div>

              <textarea
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                rows={3}
                maxLength={500}
                placeholder="Share your thoughts about item condition, delivery, or experience..."
                className="form-control rounded-3 mb-2"
              />

              <div className="d-flex justify-content-between align-items-center">
                <span className="text-muted small">{commentInput.length} / 500 characters</span>
                <button
                  type="submit"
                  disabled={submitting || ratingInput === 0}
                  className="btn btn-rensell btn-sm px-4"
                >
                  {submitting ? 'Publishing...' : 'Publish Review'}
                </button>
              </div>
            </form>
          ) : (
            <div className="bg-light border border-dashed rounded-4 p-4 text-center h-100 d-flex flex-column justify-content-center align-items-center">
              <i className="bi bi-lock fs-3 text-secondary mb-2" />
              <p className="text-muted small fw-semibold mb-3">Sign in to share a review for this product.</p>
              <Link to="/auth/login" className="btn btn-rensell-outline btn-sm px-4">
                Sign In
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Review List */}
      {loading ? (
        <div className="text-center py-4">
          <div className="spinner-border spinner-border-sm text-rensell-primary" role="status" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-4 bg-light rounded-4 text-muted small">
          <div className="fw-bold">No reviews yet</div>
          <div>Be the first to share your experience with this item!</div>
        </div>
      ) : (
        <div className="list-group list-group-flush">
          {reviews.map((review) => {
            const reviewer = review.userId || {};
            return (
              <div key={review._id} className="list-group-item px-0 py-3">
                <div className="d-flex justify-content-between align-items-start gap-3">
                  <div className="d-flex align-items-center gap-3">
                    {reviewer.profileImage ? (
                      <img
                        src={resolveImageUrl(reviewer.profileImage)}
                        alt={reviewer.name || 'Reviewer'}
                        className="rounded-circle object-fit-cover border"
                        style={{ width: '40px', height: '40px' }}
                      />
                    ) : (
                      <span className="avatar-circle" style={{ width: '40px', height: '40px' }}>
                        {reviewer.name?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    )}
                    <div>
                      <div className="fw-bold text-dark small">{reviewer.name || 'Community Member'}</div>
                      <div className="text-warning" style={{ fontSize: '0.75rem' }}>
                        {[1, 2, 3, 4, 5].map((s) => (
                          <i
                            key={s}
                            className={`bi ${
                              s <= review.rating ? 'bi-star-fill text-warning' : 'bi-star text-secondary opacity-25'
                            } me-1`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <span className="text-muted small">{formatFullDate(review.createdAt)}</span>
                </div>
                {review.comment && <p className="text-secondary small mb-0 mt-2 ps-5">{review.comment}</p>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
