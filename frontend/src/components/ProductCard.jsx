import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { useToast } from '../hooks/useToast';
import { formatINR } from '../utils/formatters';
import { resolveImageUrl, PLACEHOLDER_IMAGE } from '../utils/imageUrl';

export default function ProductCard({ product }) {
  const [imgSrc, setImgSrc] = useState(() => resolveImageUrl(product.image));
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const isRent = product.type === 'rent';
  const rating = Number(product.rating || 0);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    showToast(`${product.name} added to cart!`, 'success');
  };

  return (
    <div className="rensell-card h-100 d-flex flex-column">
      {/* Product Image */}
      <Link to={`/products/${product._id}`} className="product-img-wrapper d-block text-decoration-none">
        <img
          src={imgSrc}
          alt={product.name}
          loading="lazy"
          onError={() => setImgSrc(PLACEHOLDER_IMAGE)}
        />
        <span
          className={`position-absolute top-0 start-0 m-3 ${
            isRent ? 'badge-rensell-rent bg-white' : 'badge-rensell-sale bg-white'
          } shadow-sm`}
        >
          {isRent ? 'Rent' : 'Buy'}
        </span>
        {Number(product.discount) > 0 && (
          <span className="badge bg-success position-absolute top-0 end-0 m-3 shadow-sm">
            {product.discount}% OFF
          </span>
        )}
      </Link>

      {/* Card Content */}
      <div className="p-3 p-sm-4 d-flex flex-column flex-grow-1 justify-content-between">
        <div>
          {/* Rating Stars */}
          <div className="d-flex align-items-center gap-1 mb-2">
            <div className="text-warning small">
              {[...Array(5)].map((_, i) => (
                <i
                  key={i}
                  className={`bi ${
                    i < Math.round(rating) ? 'bi-star-fill text-warning' : 'bi-star text-secondary opacity-25'
                  } me-1`}
                  style={{ fontSize: '0.72rem' }}
                />
              ))}
            </div>
            <span className="text-muted fw-bold" style={{ fontSize: '0.72rem' }}>
              {rating.toFixed(1)}
            </span>
            <span className="ms-auto badge text-bg-light text-capitalize text-muted" style={{ fontSize: '0.68rem' }}>
              {product.category}
            </span>
          </div>

          {/* Product Title */}
          <Link to={`/products/${product._id}`} className="text-decoration-none">
            <h6 className="fw-bold text-dark line-clamp-2 mb-2">{product.name}</h6>
          </Link>
        </div>

        <div className="pt-2">
          {/* Pricing Row */}
          <div className="d-flex align-items-baseline gap-2 mb-3">
            <span className="fs-5 fw-bold text-dark">{formatINR(product.price)}</span>
            {isRent && <span className="text-muted small fw-semibold">/day</span>}
            {Number(product.originalPrice) > Number(product.price) && (
              <span className="text-muted text-decoration-line-through small ms-auto">
                {formatINR(product.originalPrice)}
              </span>
            )}
          </div>

          {/* Add to Cart Button */}
          <button
            type="button"
            onClick={handleAddToCart}
            className="btn btn-rensell-outline w-100 btn-sm py-2 text-uppercase d-flex align-items-center justify-content-center gap-2"
            style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}
          >
            <i className="bi bi-cart-plus" />
            <span>Add to Cart</span>
          </button>
        </div>
      </div>
    </div>
  );
}
