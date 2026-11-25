import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { orderAPI } from '../services/api';
import ReconcilePaymentAction from '../components/ReconcilePaymentAction';
import { formatINR } from '../utils/formatters';
import { resolveImageUrl } from '../utils/imageUrl';

export default function OrderSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const orderId = searchParams.get('orderId');
  const prefilledPaymentId =
    searchParams.get('razorpay_payment_id') ||
    searchParams.get('razorpayPaymentId') ||
    searchParams.get('payment_id') ||
    '';

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchOrder = useCallback(async () => {
    if (!orderId) {
      navigate('/', { replace: true });
      return;
    }
    try {
      setLoading(true);
      const data = await orderAPI.getAll({ orderId });
      if (data.orders?.length > 0) {
        setOrder(data.orders[0]);
      }
    } catch (error) {
      console.error('Failed to load order details:', error);
    } finally {
      setLoading(false);
    }
  }, [orderId, navigate]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  if (loading) {
    return (
      <div className="container-xl py-5 my-5 text-center">
        <div className="spinner-border text-rensell-primary" role="status" />
        <p className="text-muted mt-3">Loading order confirmation...</p>
      </div>
    );
  }

  return (
    <div className="container-xl py-5">
      <div className="rensell-panel p-4 p-md-5 mx-auto text-center" style={{ maxWidth: '680px' }}>
        <div className="text-success display-3 mb-3">
          <i className="bi bi-check-circle-fill" />
        </div>
        <h2 className="fw-bold text-success mb-2">Order Placed Successfully!</h2>
        <p className="text-muted mb-4">Thank you for renting and shopping with RENSELL.</p>

        {order && (
          <div className="bg-light rounded-4 p-4 text-start mb-4 border">
            <div className="row g-3 mb-3">
              <div className="col-6">
                <div className="text-muted small">Order ID</div>
                <div className="fw-bold font-monospace small">{order._id}</div>
              </div>
              <div className="col-6">
                <div className="text-muted small">Total Amount</div>
                <div className="fw-bold text-rensell-primary fs-5">{formatINR(order.totalAmount)}</div>
              </div>
              <div className="col-6">
                <div className="text-muted small">Payment Method</div>
                <div className="fw-bold text-uppercase small">{order.paymentMethod}</div>
              </div>
              <div className="col-6">
                <div className="text-muted small">Payment Status</div>
                <span
                  className={`badge ${
                    order.paymentStatus === 'paid' ? 'text-bg-success' : 'text-bg-warning'
                  } text-uppercase`}
                >
                  {order.paymentStatus}
                </span>
              </div>
            </div>

            <ReconcilePaymentAction
              orderId={order._id}
              paymentMethod={order.paymentMethod}
              paymentStatus={order.paymentStatus}
              razorpayPaymentId={order.razorpayPaymentId || prefilledPaymentId}
              onSuccess={fetchOrder}
            />

            {order.shippingAddress && (
              <div className="border-top pt-3 mt-3 small">
                <div className="text-muted fw-bold text-uppercase mb-1">Delivery Address</div>
                <div className="fw-bold text-dark">{order.shippingAddress.fullName}</div>
                <div className="text-secondary">
                  {order.shippingAddress.address}, {order.shippingAddress.city},{' '}
                  {order.shippingAddress.state} - {order.shippingAddress.pincode}
                </div>
                <div className="text-secondary">Phone: {order.shippingAddress.phone}</div>
              </div>
            )}

            <div className="border-top pt-3 mt-3">
              <div className="text-muted fw-bold text-uppercase small mb-2">Order Items</div>
              <div className="d-grid gap-2">
                {order.items?.map((item, idx) => (
                  <div key={idx} className="d-flex align-items-center gap-3 bg-white p-2 rounded-3 border">
                    <img
                      src={resolveImageUrl(item.image)}
                      alt={item.name}
                      className="rounded-2 object-fit-cover"
                      style={{ width: '56px', height: '56px' }}
                    />
                    <div className="flex-grow-1">
                      <div className="fw-bold small text-dark">{item.name}</div>
                      <div className="text-muted small">
                        Qty {item.quantity} &bull; {formatINR(item.price)}
                        {item.type === 'rent' ? `/day × ${item.rentalDays || 1}d` : ''}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="d-grid gap-2">
          <Link to="/" className="btn btn-rensell py-2.5">
            Continue Shopping
          </Link>
          <Link to="/dashboard/orders" className="btn btn-rensell-outline py-2">
            View All Orders &amp; Rentals
          </Link>
        </div>
      </div>
    </div>
  );
}
