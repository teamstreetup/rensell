import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { orderAPI, extractApiError } from '../services/api';
import ReconcilePaymentAction from '../components/ReconcilePaymentAction';
import { formatINR, formatFullDate } from '../utils/formatters';
import { resolveImageUrl } from '../utils/imageUrl';

const STATUS_BADGE = {
  pending: 'text-bg-warning',
  confirmed: 'text-bg-info',
  processing: 'text-bg-primary',
  shipped: 'text-bg-secondary',
  delivered: 'text-bg-success',
  cancelled: 'text-bg-danger',
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await orderAPI.getAll();
      setOrders(data.orders || []);
    } catch (err) {
      setError(extractApiError(err, 'Failed to load orders'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  if (loading) {
    return (
      <div className="container-xl py-5 text-center">
        <div className="spinner-border text-rensell-primary" role="status" />
      </div>
    );
  }

  return (
    <div className="container-xl py-4 py-md-5">
      <div className="d-flex justify-content-between align-items-center pb-3 mb-4 border-bottom">
        <div>
          <h2 className="fw-bold text-dark mb-1">My Orders</h2>
          <p className="text-muted small mb-0">Track all your RENSELL purchases and rentals</p>
        </div>
        <Link to="/dashboard/orders" className="btn btn-rensell-outline btn-sm">
          Open in Dashboard
        </Link>
      </div>

      {error && <div className="alert alert-danger rounded-4">{error}</div>}

      {orders.length === 0 ? (
        <div className="rensell-panel p-5 text-center">
          <i className="bi bi-box2 display-3 text-secondary opacity-50" />
          <h4 className="fw-bold mt-3">No orders yet</h4>
          <p className="text-muted mb-4">Start exploring rentals and deals to see your orders here.</p>
          <Link to="/" className="btn btn-rensell px-4">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="d-grid gap-4">
          {orders.map((order) => (
            <div key={order._id} className="rensell-panel p-4">
              <div className="d-flex justify-content-between flex-wrap gap-3 pb-3 mb-3 border-bottom">
                <div>
                  <div className="text-muted small">Order ID</div>
                  <div className="fw-bold font-monospace small">{order._id}</div>
                  <div className="text-muted small">{formatFullDate(order.createdAt)}</div>
                </div>
                <div className="text-sm-end">
                  <span className={`badge ${STATUS_BADGE[order.status] || 'text-bg-secondary'} text-uppercase px-3 py-2`}>
                    {order.status}
                  </span>
                  <div className="small text-muted mt-1">
                    Payment:{' '}
                    <strong className={order.paymentStatus === 'paid' ? 'text-success' : 'text-warning-emphasis'}>
                      {order.paymentStatus?.toUpperCase()}
                    </strong>{' '}
                    ({order.paymentMethod?.toUpperCase()})
                  </div>
                </div>
              </div>

              <div className="d-grid gap-3 mb-3">
                {order.items?.map((item, idx) => (
                  <div key={idx} className="d-flex align-items-center gap-3">
                    <img
                      src={resolveImageUrl(item.productId?.image || item.image)}
                      alt={item.name}
                      className="rounded-3 border object-fit-cover"
                      style={{ width: '68px', height: '68px' }}
                    />
                    <div className="flex-grow-1">
                      <div className="fw-bold text-dark">{item.productId?.name || item.name}</div>
                      <div className="text-muted small">
                        Qty: {item.quantity} &bull; {formatINR(item.price)}
                        {item.type === 'rent' && ` /day × ${item.rentalDays || 1} days (+${formatINR(item.securityDeposit || 0)} dep.)`}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 pt-3 border-top">
                <div>
                  <div className="text-muted small">Total Paid / Payable</div>
                  <div className="fs-4 fw-bold text-rensell-primary">{formatINR(order.totalAmount)}</div>
                </div>
                {order.shippingAddress && (
                  <div className="text-sm-end small">
                    <div className="text-muted">Deliver to</div>
                    <div className="fw-bold text-dark">{order.shippingAddress.fullName}</div>
                    <div className="text-secondary">
                      {order.shippingAddress.city}, {order.shippingAddress.state}
                    </div>
                  </div>
                )}
              </div>

              <ReconcilePaymentAction
                orderId={order._id}
                paymentMethod={order.paymentMethod}
                paymentStatus={order.paymentStatus}
                razorpayPaymentId={order.razorpayPaymentId}
                onSuccess={fetchOrders}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
