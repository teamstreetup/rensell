import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { orderAPI, extractApiError } from '../services/api';
import { useToast } from '../hooks/useToast';
import ReconcilePaymentAction from '../components/ReconcilePaymentAction';
import { formatINR, formatFullDate } from '../utils/formatters';
import { resolveImageUrl } from '../utils/imageUrl';

export default function DashboardOrdersPage() {
  const { showToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState('all'); // 'all' | 'rent' | 'sale'

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const data = await orderAPI.getAll();
      setOrders(data.orders || []);
    } catch (err) {
      showToast(extractApiError(err, 'Failed to load orders'), 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const filteredOrders = orders.filter((order) => {
    if (filterTab === 'all') return true;
    return order.items?.some((item) => (item.type || 'sale') === filterTab);
  });

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-rensell-primary" role="status" />
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 pb-3 mb-4 border-bottom">
        <div>
          <h3 className="fw-bold text-dark mb-1">
            <i className="bi bi-receipt text-rensell-primary me-2" />
            My Purchases &amp; Rentals
          </h3>
          <p className="text-muted small mb-0">Track checkouts, deliveries, and active rental dates.</p>
        </div>

        <div className="btn-group btn-group-sm" role="group">
          {[
            { key: 'all', label: 'All' },
            { key: 'rent', label: 'My Rentals' },
            { key: 'sale', label: 'My Purchases' },
          ].map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setFilterTab(t.key)}
              className={`btn ${filterTab === t.key ? 'btn-rensell' : 'btn-rensell-outline'}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="text-center py-5 bg-light rounded-4 border border-dashed">
          <i className="bi bi-bag-x display-4 text-secondary opacity-50" />
          <h5 className="fw-bold mt-3">No Orders Found</h5>
          <p className="text-muted small mb-4">You haven&apos;t placed any matching orders yet.</p>
          <Link to="/" className="btn btn-rensell px-4">
            Explore Marketplace
          </Link>
        </div>
      ) : (
        <div className="d-grid gap-4">
          {filteredOrders.map((order) => (
            <div key={order._id} className="border rounded-4 overflow-hidden">
              <div className="bg-light px-4 py-3 border-bottom d-flex flex-wrap justify-content-between align-items-center gap-3">
                <div className="d-flex flex-wrap gap-4 small">
                  <div>
                    <div className="text-muted fw-bold text-uppercase" style={{ fontSize: '0.68rem' }}>
                      Order Placed
                    </div>
                    <div className="fw-semibold text-dark">{formatFullDate(order.createdAt)}</div>
                  </div>
                  <div>
                    <div className="text-muted fw-bold text-uppercase" style={{ fontSize: '0.68rem' }}>
                      Total
                    </div>
                    <div className="fw-bold text-rensell-primary">{formatINR(order.totalAmount)}</div>
                  </div>
                  <div>
                    <div className="text-muted fw-bold text-uppercase" style={{ fontSize: '0.68rem' }}>
                      Order ID
                    </div>
                    <div className="font-monospace small text-secondary">
                      #{String(order._id).slice(-8).toUpperCase()}
                    </div>
                  </div>
                </div>

                <div className="d-flex gap-2">
                  <span
                    className={`badge text-uppercase px-3 py-2 ${
                      order.paymentStatus === 'paid' ? 'text-bg-success' : 'text-bg-danger'
                    }`}
                  >
                    {order.paymentStatus}
                  </span>
                  <span className="badge text-bg-primary text-uppercase px-3 py-2">{order.status}</span>
                </div>
              </div>

              <div className="p-4 d-grid gap-3">
                {order.items?.map((item, idx) => {
                  const isRent = item.type === 'rent';
                  const name = item.productId?.name || item.name || 'Item';
                  const image = resolveImageUrl(item.productId?.image || item.image);
                  const linkId = item.productId?._id || item.productId;

                  return (
                    <div key={idx} className="row g-3 align-items-center pb-3 border-bottom">
                      <div className="col-auto">
                        <div className="position-relative">
                          <img
                            src={image}
                            alt={name}
                            className="rounded-3 border object-fit-cover"
                            style={{ width: '84px', height: '84px' }}
                          />
                          <span
                            className={`badge position-absolute top-0 end-0 ${
                              isRent ? 'bg-primary' : 'bg-rensell-gradient'
                            }`}
                            style={{ fontSize: '0.62rem' }}
                          >
                            {isRent ? 'Rented' : 'Purchased'}
                          </span>
                        </div>
                      </div>
                      <div className="col">
                        <Link to={linkId ? `/products/${linkId}` : '#'} className="text-decoration-none">
                          <h6 className="fw-bold text-dark mb-1">{name}</h6>
                        </Link>
                        {isRent ? (
                          <div className="small text-secondary">
                            {item.startDate && item.endDate && (
                              <div className="mb-1">
                                <i className="bi bi-calendar3 text-rensell-secondary me-1" />
                                <strong>{formatFullDate(item.startDate)}</strong> &rarr;{' '}
                                <strong>{formatFullDate(item.endDate)}</strong>{' '}
                                <span className="badge text-bg-secondary ms-1">{item.rentalDays || 1} Days</span>
                              </div>
                            )}
                            <div className="text-warning-emphasis fw-semibold">
                              Security Deposit: +{formatINR(item.securityDeposit || 0)}
                            </div>
                          </div>
                        ) : (
                          <div className="small text-success fw-semibold">
                            <i className="bi bi-check2 me-1" /> Permanent Purchase &bull; Qty {item.quantity}
                          </div>
                        )}
                        <div className="fw-bold text-dark mt-1">
                          {formatINR(isRent ? item.price * (item.rentalDays || 1) : item.price * (item.quantity || 1))}
                        </div>
                      </div>
                      <div className="col-12 col-sm-auto">
                        {linkId && (
                          <Link to={`/products/${linkId}`} className="btn btn-rensell-outline btn-sm">
                            View Item
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}

                <ReconcilePaymentAction
                  orderId={order._id}
                  paymentMethod={order.paymentMethod}
                  paymentStatus={order.paymentStatus}
                  razorpayPaymentId={order.razorpayPaymentId}
                  onSuccess={fetchOrders}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
