import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { productAPI, extractApiError } from '../services/api';
import AddToCartPanel from '../components/AddToCartPanel';
import ReviewSection from '../components/ReviewSection';
import { formatINR } from '../utils/formatters';
import { resolveImageUrl, PLACEHOLDER_IMAGE } from '../utils/imageUrl';

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [imgSrc, setImgSrc] = useState(PLACEHOLDER_IMAGE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        setLoading(true);
        setError('');
        const data = await productAPI.getById(id);
        if (active && data.product) {
          setProduct(data.product);
          setImgSrc(resolveImageUrl(data.product.image));
        }
      } catch (err) {
        if (active) setError(extractApiError(err, 'Product not found'));
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="container-xl py-5 text-center my-5">
        <div className="spinner-border text-rensell-primary" role="status" />
        <p className="text-muted mt-3 small">Loading product details...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container-xl py-5 text-center my-5">
        <i className="bi bi-exclamation-octagon display-3 text-secondary opacity-50" />
        <h3 className="fw-bold mt-3">Product Not Found</h3>
        <p className="text-muted">{error || 'This listing may have been removed.'}</p>
        <Link to="/" className="btn btn-rensell mt-2">
          Back to Marketplace
        </Link>
      </div>
    );
  }

  const isRent = product.type === 'rent';
  const rating = Number(product.rating || 0);
  const categoryRoute =
    product.category === 'electronics' || product.category === 'furniture'
      ? `/${product.category}`
      : `/category/${product.category}`;

  return (
    <div className="container-xl py-4 py-md-5">
      {/* Breadcrumb */}
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb small fw-semibold text-uppercase">
          <li className="breadcrumb-item">
            <Link to="/" className="text-decoration-none text-muted">
              Home
            </Link>
          </li>
          <li className="breadcrumb-item">
            <Link to={categoryRoute} className="text-decoration-none text-muted">
              {product.category}
            </Link>
          </li>
          <li className="breadcrumb-item active text-dark" aria-current="page">
            {product.name}
          </li>
        </ol>
      </nav>

      {/* Main Details Panel */}
      <div className="rensell-panel p-4 p-md-5">
        <div className="row g-4 g-lg-5">
          {/* Left Image */}
          <div className="col-12 col-lg-6">
            <div className="position-relative rounded-4 overflow-hidden bg-light border" style={{ aspectRatio: '4/3' }}>
              <img
                src={imgSrc}
                alt={product.name}
                onError={() => setImgSrc(PLACEHOLDER_IMAGE)}
                className="w-100 h-100 object-fit-cover"
              />
              <span
                className={`position-absolute top-0 start-0 m-3 shadow-sm ${
                  isRent ? 'badge-rensell-rent bg-white' : 'badge-rensell-sale bg-white'
                }`}
              >
                {isRent ? 'For Rent' : 'For Sale'}
              </span>
              {Number(product.discount) > 0 && (
                <span className="badge bg-success position-absolute top-0 end-0 m-3 px-3 py-2 shadow-sm">
                  {product.discount}% OFF
                </span>
              )}
            </div>
          </div>

          {/* Right Product Info */}
          <div className="col-12 col-lg-6 d-flex flex-column justify-content-between">
            <div>
              <h1 className="h2 fw-bold text-dark mb-3">{product.name}</h1>

              {/* Rating */}
              <div className="d-flex align-items-center gap-2 pb-3 mb-3 border-bottom">
                <div className="text-warning">
                  {[...Array(5)].map((_, i) => (
                    <i
                      key={i}
                      className={`bi ${
                        i < Math.floor(rating) ? 'bi-star-fill text-warning' : 'bi-star text-secondary opacity-25'
                      } me-1`}
                    />
                  ))}
                </div>
                <span className="badge text-bg-light border text-dark">{rating.toFixed(1)} / 5.0</span>
              </div>

              {/* Price */}
              <div className="d-flex align-items-baseline flex-wrap gap-3 mb-4">
                <span className="display-6 fw-bold text-dark">
                  {formatINR(product.price)}
                  {isRent && <span className="fs-6 text-muted fw-semibold ms-1">/day</span>}
                </span>
                {Number(product.originalPrice) > Number(product.price) && (
                  <>
                    <span className="fs-5 text-muted text-decoration-line-through">
                      {formatINR(product.originalPrice)}
                    </span>
                    <span className="badge bg-success bg-opacity-10 text-success fw-bold px-2 py-1">
                      Save {formatINR(product.originalPrice - product.price)}
                    </span>
                  </>
                )}
              </div>

              {/* Description */}
              <div className="mb-4">
                <div className="text-muted text-uppercase fw-bold small mb-1">Product Description</div>
                <p className="text-secondary mb-0">{product.description}</p>
              </div>

              {/* Specs */}
              <div className="bg-light border rounded-4 p-3 mb-4">
                <div className="text-muted text-uppercase fw-bold small mb-2">Specifications</div>
                <div className="row g-3 small">
                  <div className="col-6">
                    <div className="text-muted" style={{ fontSize: '0.72rem' }}>CATEGORY</div>
                    <div className="fw-bold text-dark text-capitalize">{product.category}</div>
                  </div>
                  <div className="col-6">
                    <div className="text-muted" style={{ fontSize: '0.72rem' }}>LISTING MODE</div>
                    <div className="fw-bold text-dark">{isRent ? 'Rental Option' : 'Permanent Purchase'}</div>
                  </div>
                  <div className="col-6">
                    <div className="text-muted" style={{ fontSize: '0.72rem' }}>AVAILABILITY</div>
                    <div className="fw-bold text-success">
                      <i className="bi bi-circle-fill me-1" style={{ fontSize: '0.5rem' }} /> In Stock
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="text-muted" style={{ fontSize: '0.72rem' }}>ESCROW PROTECTION</div>
                    <div className="fw-bold text-rensell-secondary">Yes (Verified)</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Cart Actions */}
            <div className="pt-3 border-top">
              <AddToCartPanel product={product} />
            </div>

            {/* Vendor Card */}
            {product.owner && (
              <div className="mt-4 pt-4 border-top">
                <div className="text-muted text-uppercase fw-bold small mb-2">Listed By</div>
                <div className="bg-light border rounded-4 p-3 d-flex justify-content-between align-items-center gap-3">
                  <div className="d-flex align-items-center gap-3 overflow-hidden">
                    {product.owner.profileImage ? (
                      <img
                        src={resolveImageUrl(product.owner.profileImage)}
                        alt={product.owner.name}
                        className="rounded-circle object-fit-cover border"
                        style={{ width: '44px', height: '44px' }}
                      />
                    ) : (
                      <span className="avatar-circle" style={{ width: '44px', height: '44px' }}>
                        {product.owner.name?.charAt(0)?.toUpperCase() || 'V'}
                      </span>
                    )}
                    <div className="overflow-hidden">
                      <div className="fw-bold text-dark text-truncate d-flex align-items-center gap-1">
                        <span>{product.owner.name}</span>
                        {product.owner.isVerified && (
                          <i className="bi bi-patch-check-fill text-success" title="Verified Vendor" />
                        )}
                      </div>
                      <div className="text-muted small">Trusted RENSELL Vendor</div>
                    </div>
                  </div>
                  <Link
                    to={`/user/${product.ownerId}`}
                    className="btn btn-rensell-outline btn-sm px-3 flex-shrink-0"
                  >
                    View Profile
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reviews */}
      <ReviewSection
        productId={product._id}
        initialRating={rating}
        onRatingChange={(newRating) => setProduct((prev) => ({ ...prev, rating: newRating }))}
      />
    </div>
  );
}
