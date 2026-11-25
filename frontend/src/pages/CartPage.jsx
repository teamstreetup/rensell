import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import CartItem from '../components/CartItem';
import { formatINR } from '../utils/formatters';

export default function CartPage() {
  const {
    cart,
    cartCount,
    baseSubtotal,
    totalDeposits,
    totalAmount,
    updateQuantity,
    updateRentalDates,
    removeFromCart,
    clearCart,
  } = useCart();
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (!isAuthenticated) {
      showToast('Please sign in to proceed to checkout', 'info');
      navigate('/auth/login', { state: { from: { pathname: '/checkout' } } });
      return;
    }
    navigate('/checkout');
  };

  if (cart.length === 0) {
    return (
      <div className="container-xl py-5 my-5 text-center">
        <div
          className="rounded-circle bg-white border shadow-sm d-inline-flex align-items-center justify-content-center mb-4"
          style={{ width: '96px', height: '96px' }}
        >
          <i className="bi bi-cart-x fs-1 text-secondary opacity-50" />
        </div>
        <h2 className="fw-bold text-dark mb-2">Your cart is empty</h2>
        <p className="text-muted mb-4 mx-auto" style={{ maxWidth: '360px' }}>
          Browse products to rent or buy and checkout safely with Razorpay or Cash on Delivery.
        </p>
        <Link to="/" className="btn btn-rensell px-4 py-2">
          <i className="bi bi-arrow-left me-2" /> Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container-xl py-4 py-md-5">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 pb-3 mb-4 border-bottom">
        <div className="d-flex align-items-center gap-3">
          <span className="bg-rensell-gradient text-white rounded-3 p-2 px-3">
            <i className="bi bi-cart3 fs-5" />
          </span>
          <div>
            <h2 className="fw-bold text-dark mb-0">Shopping Cart</h2>
            <div className="text-muted small fw-semibold">
              {cartCount} item{cartCount !== 1 ? 's' : ''} in your cart
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            clearCart();
            showToast('Cart cleared', 'info');
          }}
          className="btn btn-outline-danger btn-sm rounded-3"
        >
          <i className="bi bi-trash3 me-1" /> Clear Cart
        </button>
      </div>

      <div className="row g-4">
        {/* Cart Item List */}
        <div className="col-12 col-lg-8">
          {cart.map((item, idx) => (
            <CartItem
              key={`${item._id}-${item.startDate || 'sale'}-${idx}`}
              item={item}
              index={idx}
              onUpdateQuantity={updateQuantity}
              onUpdateDates={updateRentalDates}
              onRemove={(index) => {
                removeFromCart(index);
                showToast('Item removed from cart', 'info');
              }}
            />
          ))}
        </div>

        {/* Order Summary Sidebar */}
        <div className="col-12 col-lg-4">
          <div className="rensell-panel p-4 sticky-top" style={{ top: '5.5rem' }}>
            <h5 className="fw-bold text-dark mb-4 d-flex align-items-center gap-2">
              <i className="bi bi-receipt text-rensell-primary" /> Order Summary
            </h5>

            <div className="d-grid gap-3 small mb-4">
              <div className="d-flex justify-content-between text-muted">
                <span>Subtotal ({cartCount} items)</span>
                <span className="fw-bold text-dark">{formatINR(baseSubtotal)}</span>
              </div>

              {totalDeposits > 0 && (
                <div className="d-flex justify-content-between text-muted">
                  <span>
                    Refundable Deposits{' '}
                    <i
                      className="bi bi-info-circle"
                      title="Returned within 48h after safe return of rental items"
                    />
                  </span>
                  <span className="fw-bold text-warning-emphasis">+ {formatINR(totalDeposits)}</span>
                </div>
              )}

              <div className="d-flex justify-content-between text-muted">
                <span>Shipping &amp; Delivery</span>
                <span className="fw-bold text-success">FREE</span>
              </div>

              <div className="d-flex justify-content-between align-items-center border-top pt-3">
                <span className="fw-bold text-dark fs-6">Total Amount</span>
                <span className="fw-bold text-rensell-primary fs-4">{formatINR(totalAmount)}</span>
              </div>
            </div>

            <div className="d-grid gap-2">
              <button type="button" onClick={handleCheckout} className="btn btn-rensell py-2.5">
                <i className="bi bi-lock-fill me-2" /> Secure Checkout
              </button>
              <Link to="/" className="btn btn-rensell-outline py-2">
                <i className="bi bi-arrow-left me-1" /> Continue Shopping
              </Link>
            </div>

            <div className="text-center text-muted small mt-4 pt-3 border-top">
              <i className="bi bi-shield-check text-success me-1" />
              Encrypted payments via Razorpay &amp; COD
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
