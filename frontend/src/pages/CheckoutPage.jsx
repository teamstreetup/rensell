import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { orderAPI, paymentAPI, extractApiError } from '../services/api';
import CheckoutForm from '../components/CheckoutForm';
import { formatINR } from '../utils/formatters';
import { resolveImageUrl, PLACEHOLDER_IMAGE } from '../utils/imageUrl';

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && window.Razorpay) {
      resolve(true);
      return;
    }
    const existing = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existing) {
      existing.addEventListener('load', () => resolve(true));
      existing.addEventListener('error', () => resolve(false));
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function CheckoutPage() {
  const { cart, baseSubtotal, totalDeposits, totalAmount, clearCart } = useCart();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [loading, setLoading] = useState(false);
  const [failedOrderId, setFailedOrderId] = useState(null);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });

  useEffect(() => {
    if (cart.length === 0 && !failedOrderId) {
      navigate('/cart', { replace: true });
    }
  }, [cart.length, failedOrderId, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const nextErrors = {};
    if (!formData.fullName.trim()) nextErrors.fullName = 'Full name is required';
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      nextErrors.email = 'Please enter a valid email address';
    }
    if (!/^\d{10}$/.test(formData.phone.trim())) {
      nextErrors.phone = 'Enter a valid 10-digit mobile number';
    }
    if (!formData.address.trim()) nextErrors.address = 'Shipping address is required';
    if (!formData.city.trim()) nextErrors.city = 'City is required';
    if (!formData.state.trim()) nextErrors.state = 'State is required';
    if (!/^\d{6}$/.test(formData.pincode.trim())) {
      nextErrors.pincode = 'Enter a valid 6-digit pincode';
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      showToast('Please fix the highlighted delivery fields', 'error');
      return false;
    }
    return true;
  };

  const createBackendOrder = async () => {
    const items = cart.map((item) => ({
      productId: item._id,
      quantity: Number(item.quantity || 1),
      price: Number(item.price),
      name: item.name,
      image: item.image || PLACEHOLDER_IMAGE,
      type: item.type || 'sale',
      ...(item.type === 'rent' && {
        startDate: item.startDate,
        endDate: item.endDate,
        rentalDays: Number(item.rentalDays || 1),
        securityDeposit: Number(item.securityDeposit || 0),
      }),
    }));

    const data = await orderAPI.create({
      items,
      shippingAddress: {
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        pincode: formData.pincode.trim(),
      },
      paymentMethod,
      totalAmount,
    });

    return data.order;
  };

  const markOrderFailed = async (orderId) => {
    try {
      await orderAPI.update(orderId, { paymentStatus: 'failed', status: 'cancelled' });
    } catch {
      // ignore secondary status error
    }
  };

  const openRazorpayModal = async (orderId, isRetry = false) => {
    const razorpayData = await paymentAPI.createOrder({ orderId, receipt: orderId });
    const keyId = razorpayData.keyId || import.meta.env.VITE_RAZORPAY_KEY_ID;

    if (!keyId) {
      throw new Error('Razorpay public key is not configured.');
    }

    const sdkReady = await loadRazorpayScript();
    if (!sdkReady || !window.Razorpay) {
      throw new Error('Failed to load Razorpay SDK. Check your internet connection.');
    }

    const options = {
      key: keyId,
      amount: razorpayData.amount,
      currency: razorpayData.currency || 'INR',
      name: 'RENSELL',
      description: isRetry ? 'Order Payment - Retry' : 'Order Payment',
      order_id: razorpayData.orderId,
      notes: { orderId },
      handler: async (response) => {
        try {
          showToast('Verifying payment...', 'info');
          const verifyData = await paymentAPI.verify({
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
            orderId,
          });

          if (verifyData.success) {
            clearCart();
            showToast('Payment successful! Redirecting...', 'success');
            navigate(`/order-success?orderId=${orderId}&payment_id=${response.razorpay_payment_id}`);
          } else {
            showToast('Payment verification failed', 'error');
            setFailedOrderId(orderId);
          }
        } catch (err) {
          showToast(extractApiError(err, 'Payment verification failed'), 'error');
          setFailedOrderId(orderId);
        }
      },
      prefill: {
        name: formData.fullName,
        email: formData.email || user?.email || '',
        contact: formData.phone,
      },
      theme: { color: '#FF6B35' },
      modal: {
        ondismiss: () => {
          showToast('Payment cancelled. You can retry anytime.', 'info');
          setFailedOrderId(orderId);
          setLoading(false);
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', (resp) => {
      showToast(`Payment failed: ${resp?.error?.description || 'Transaction declined'}`, 'error');
      setFailedOrderId(orderId);
      if (!isRetry) markOrderFailed(orderId);
    });
    rzp.open();
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      setFailedOrderId(null);

      if (paymentMethod === 'cod') {
        const order = await createBackendOrder();
        clearCart();
        showToast('Order placed successfully!', 'success');
        navigate(`/order-success?orderId=${order._id}`);
      } else {
        const order = await createBackendOrder();
        try {
          await openRazorpayModal(order._id, false);
        } catch (payErr) {
          setFailedOrderId(order._id);
          throw payErr;
        }
      }
    } catch (error) {
      showToast(`Checkout failed: ${extractApiError(error)}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRetryPayment = async () => {
    if (!failedOrderId) return;
    try {
      setLoading(true);
      await openRazorpayModal(failedOrderId, true);
    } catch (error) {
      showToast(`Retry failed: ${extractApiError(error)}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-xl py-4 py-md-5">
      {/* Processing Overlay */}
      {loading && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ background: 'rgba(15, 23, 42, 0.35)', backdropFilter: 'blur(4px)', zIndex: 1080 }}
        >
          <div className="bg-white rounded-4 shadow-lg p-4 text-center" style={{ maxWidth: '300px' }}>
            <div className="spinner-border text-rensell-primary mb-3" role="status" />
            <div className="fw-bold text-dark">Processing Checkout</div>
            <div className="text-muted small">Please do not refresh or close this tab.</div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="d-flex align-items-center gap-3 pb-3 mb-4 border-bottom">
        <span className="bg-rensell-gradient text-white rounded-3 p-2 px-3">
          <i className="bi bi-shield-lock fs-5" />
        </span>
        <div>
          <h2 className="fw-bold text-dark mb-0">Secure Checkout</h2>
          <div className="text-muted small fw-semibold">Delivery address &amp; payment options</div>
        </div>
      </div>

      <div className="row g-4">
        {/* Form Column */}
        <div className="col-12 col-lg-8">
          <CheckoutForm
            formData={formData}
            onChange={handleChange}
            paymentMethod={paymentMethod}
            onPaymentMethodChange={setPaymentMethod}
            errors={errors}
          />
        </div>

        {/* Summary Column */}
        <div className="col-12 col-lg-4">
          <div className="rensell-panel p-4 sticky-top" style={{ top: '5.5rem' }}>
            <h5 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
              <i className="bi bi-bag-check text-rensell-primary" /> Order Summary
            </h5>

            <div className="d-grid gap-2 mb-3 pb-3 border-bottom" style={{ maxHeight: '240px', overflowY: 'auto' }}>
              {cart.map((item, idx) => {
                const isRent = item.type === 'rent';
                const qty = Number(item.quantity || 1);
                const days = Number(item.rentalDays || 1);
                const lineTotal = isRent
                  ? (Number(item.price) * days + Number(item.securityDeposit || 0)) * qty
                  : Number(item.price) * qty;

                return (
                  <div key={idx} className="d-flex gap-2 align-items-center">
                    <img
                      src={resolveImageUrl(item.image)}
                      alt={item.name}
                      className="rounded-2 border object-fit-cover flex-shrink-0"
                      style={{ width: '48px', height: '48px' }}
                    />
                    <div className="flex-grow-1 overflow-hidden">
                      <div className="fw-semibold small text-dark text-truncate">{item.name}</div>
                      <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                        Qty {qty}
                        {isRent && ` • ${days}d • +${formatINR((item.securityDeposit || 0) * qty)} dep.`}
                      </div>
                    </div>
                    <div className="fw-bold small text-rensell-primary">{formatINR(lineTotal)}</div>
                  </div>
                );
              })}
            </div>

            <div className="d-grid gap-2 small mb-4">
              <div className="d-flex justify-content-between text-muted">
                <span>Base Subtotal</span>
                <span className="fw-bold text-dark">{formatINR(baseSubtotal)}</span>
              </div>
              {totalDeposits > 0 && (
                <div className="d-flex justify-content-between text-muted">
                  <span>Security Deposits</span>
                  <span className="fw-bold text-warning-emphasis">+ {formatINR(totalDeposits)}</span>
                </div>
              )}
              <div className="d-flex justify-content-between text-muted">
                <span>Delivery Charge</span>
                <span className="fw-bold text-success">FREE</span>
              </div>
              <div className="d-flex justify-content-between align-items-center border-top pt-3">
                <span className="fw-bold text-dark">Total</span>
                <span className="fw-bold fs-4 text-rensell-primary">{formatINR(totalAmount)}</span>
              </div>
            </div>

            {failedOrderId ? (
              <div className="d-grid gap-2">
                <div className="alert alert-danger py-2 small text-center mb-1 rounded-3">
                  Transaction was not completed. Retry below without re-entering details.
                </div>
                <button
                  type="button"
                  onClick={handleRetryPayment}
                  disabled={loading}
                  className="btn btn-rensell py-2.5"
                >
                  <i className="bi bi-arrow-repeat me-2" /> Retry Razorpay Payment
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={loading}
                className="btn btn-rensell w-100 py-2.5"
              >
                <i className="bi bi-lock-fill me-2" />
                {paymentMethod === 'razorpay' ? 'Pay Securely with Razorpay' : 'Confirm Order (COD)'}
              </button>
            )}

            <div className="text-center text-muted small mt-3">
              <i className="bi bi-shield-fill-check text-success me-1" />
              Totals are recalculated &amp; verified server-side
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
