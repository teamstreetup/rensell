import { useState, useEffect, useCallback, Fragment } from 'react';
import { adminAPI, productAPI, extractApiError } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import AdminSidebar from '../components/AdminSidebar';
import { formatINR, formatFullDate } from '../utils/formatters';
import { resolveImageUrl } from '../utils/imageUrl';

export default function AdminDashboardPage() {
  const { user: currentAdmin } = useAuth();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({ users: 0, products: 0, orders: 0, revenue: 0 });
  const [analytics, setAnalytics] = useState({
    monthlyRevenue: [],
    userGrowth: [],
    categoryDistribution: [],
  });
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);

  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [updatingUserId, setUpdatingUserId] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);

  const currentAdminId = currentAdmin?.id || currentAdmin?._id;

  const fetchAdminData = useCallback(async () => {
    try {
      setLoading(true);
      const [statsRes, prodRes, orderRes, userRes] = await Promise.all([
        adminAPI.getStats(),
        productAPI.getAll(),
        adminAPI.getOrders(),
        adminAPI.getUsers(),
      ]);

      if (statsRes?.stats) setStats(statsRes.stats);
      if (statsRes?.analytics) setAnalytics(statsRes.analytics);
      setProducts(prodRes?.products || []);
      setOrders(orderRes?.orders || []);
      setUsers(userRes?.users || []);
    } catch (err) {
      showToast(extractApiError(err, 'Failed to load admin dashboard data'), 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  const handleDeleteProduct = async (id) => {
    try {
      await adminAPI.deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p._id !== id));
      setStats((prev) => ({ ...prev, products: Math.max(0, prev.products - 1) }));
      showToast('Product deleted by admin', 'success');
    } catch (err) {
      showToast(extractApiError(err, 'Failed to delete product'), 'error');
    } finally {
      setConfirmModal(null);
    }
  };

  const handleUpdateOrder = async (orderId, fields) => {
    setUpdatingOrderId(orderId);
    try {
      const data = await adminAPI.updateOrder({ orderId, ...fields });
      setOrders((prev) => prev.map((o) => (o._id === orderId ? data.order : o)));
      showToast('Order updated successfully', 'success');
    } catch (err) {
      showToast(extractApiError(err, 'Failed to update order'), 'error');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleUpdateUser = async (userId, fields) => {
    setUpdatingUserId(userId);
    try {
      const data = await adminAPI.updateUser({ userId, ...fields });
      setUsers((prev) => prev.map((u) => (u._id === userId ? data.user : u)));
      showToast('User updated successfully', 'success');
    } catch (err) {
      showToast(extractApiError(err, 'Failed to update user'), 'error');
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleDeleteUser = async (userId) => {
    setUpdatingUserId(userId);
    try {
      await adminAPI.deleteUser(userId);
      setUsers((prev) => prev.filter((u) => u._id !== userId));
      setStats((prev) => ({ ...prev, users: Math.max(0, prev.users - 1) }));
      showToast('User account deleted', 'success');
    } catch (err) {
      showToast(extractApiError(err, 'Failed to delete user'), 'error');
    } finally {
      setUpdatingUserId(null);
      setConfirmModal(null);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(userSearchQuery.toLowerCase())
  );

  // Build SVG line chart helper
  const renderLineChart = ({ title, badge, data, valueKey, color, gradId, formatVal }) => {
    if (!data || data.length === 0) return null;
    const maxVal = Math.max(...data.map((d) => Number(d[valueKey] || 0)), 10);
    const W = 500;
    const H = 160;
    const pL = 50;
    const pR = 16;
    const pT = 16;
    const pB = 26;
    const gW = W - pL - pR;
    const gH = H - pT - pB;

    const points = data.map((d, idx) => {
      const val = Number(d[valueKey] || 0);
      const x = pL + (data.length > 1 ? (idx / (data.length - 1)) * gW : gW / 2);
      const y = H - pB - (val / maxVal) * gH;
      return { x, y, val, label: d.month };
    });

    const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const areaPath =
      points.length > 0
        ? `M ${points[0].x} ${H - pB} ${points.map((p) => `L ${p.x} ${p.y}`).join(' ')} L ${points[points.length - 1].x} ${H - pB} Z`
        : '';

    return (
      <div className="border rounded-4 p-4 bg-white h-100">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="fw-bold text-muted text-uppercase small mb-0">{title}</h6>
          <span className="badge text-bg-light border text-dark">{badge}</span>
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-100" style={{ height: 'auto' }}>
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.25" />
              <stop offset="100%" stopColor={color} stopOpacity="0.0" />
            </linearGradient>
          </defs>
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
            const y = pT + ratio * gH;
            const v = Math.round(maxVal * (1 - ratio));
            return (
              <g key={idx}>
                <line x1={pL} y1={y} x2={W - pR} y2={y} stroke="#E2E8F0" strokeDasharray="3 3" />
                <text x={pL - 6} y={y + 3} textAnchor="end" fontSize="9" fill="#94A3B8">
                  {formatVal(v)}
                </text>
              </g>
            );
          })}
          {points.map((p, idx) => (
            <text key={idx} x={p.x} y={H - 6} textAnchor="middle" fontSize="9" fontWeight="700" fill="#64748B">
              {p.label}
            </text>
          ))}
          <path d={areaPath} fill={`url(#${gradId})`} />
          <path d={linePath} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          {points.map((p, idx) => (
            <circle key={idx} cx={p.x} cy={p.y} r="4" fill={color} stroke="#fff" strokeWidth="1.5">
              <title>
                {p.label}: {formatVal(p.val)}
              </title>
            </circle>
          ))}
        </svg>
      </div>
    );
  };

  const renderCategoryBars = () => {
    const map = {};
    (analytics.categoryDistribution || []).forEach((d) => {
      const key = (d.category || 'other').toLowerCase();
      if (!map[key]) map[key] = { name: key, rent: 0, sale: 0 };
      if (d.type === 'rent') map[key].rent += Number(d.count || 0);
      else map[key].sale += Number(d.count || 0);
    });
    const list = Object.values(map).map((c) => ({ ...c, total: c.rent + c.sale }));
    if (list.length === 0) return null;
    const maxTotal = Math.max(...list.map((c) => c.total), 1);

    return (
      <div className="border rounded-4 p-4 bg-white">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
          <div>
            <h6 className="fw-bold text-muted text-uppercase small mb-0">Category Distribution</h6>
            <div className="text-muted small">Rent vs Buy activity breakdown</div>
          </div>
          <div className="d-flex gap-3 small fw-bold">
            <span>
              <i className="bi bi-square-fill text-primary me-1" /> Rent
            </span>
            <span>
              <i className="bi bi-square-fill text-rensell-primary me-1" /> Buy
            </span>
          </div>
        </div>
        <div className="row g-3">
          {list.map((cat) => {
            const rentPct = Math.round((cat.rent / maxTotal) * 100);
            const salePct = Math.round((cat.sale / maxTotal) * 100);
            return (
              <div key={cat.name} className="col-12 col-md-6">
                <div className="d-flex justify-content-between small fw-semibold mb-1">
                  <span className="text-capitalize text-dark">{cat.name}</span>
                  <span className="text-muted">
                    {cat.total} ({cat.rent} Rent &bull; {cat.sale} Buy)
                  </span>
                </div>
                <div className="progress" style={{ height: '20px' }}>
                  {cat.rent > 0 && (
                    <div
                      className="progress-bar"
                      style={{ width: `${rentPct}%`, backgroundColor: '#004E89' }}
                    >
                      {rentPct > 18 ? `Rent: ${cat.rent}` : ''}
                    </div>
                  )}
                  {cat.sale > 0 && (
                    <div
                      className="progress-bar"
                      style={{ width: `${salePct}%`, backgroundColor: '#FF6B35' }}
                    >
                      {salePct > 18 ? `Buy: ${cat.sale}` : ''}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-rensell-primary" role="status" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="pb-3 mb-4 border-bottom d-flex justify-content-between align-items-center flex-wrap gap-2">
        <div>
          <h3 className="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
            <i className="bi bi-shield-lock-fill text-rensell-primary" /> Admin Command Center
          </h3>
          <p className="text-muted small mb-0">
            Platform analytics, user administration, product moderation, and order fulfillment.
          </p>
        </div>
        <button type="button" onClick={fetchAdminData} className="btn btn-rensell-outline btn-sm">
          <i className="bi bi-arrow-clockwise me-1" /> Refresh
        </button>
      </div>

      {/* KPI Stat Cards */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-xl-3">
          <div className="bg-rensell-gradient text-white rounded-4 p-3 p-sm-4 shadow-sm h-100">
            <div className="small text-white-50 fw-bold text-uppercase mb-1">Global Revenue</div>
            <div className="fs-4 fw-bold">{formatINR(stats.revenue)}</div>
          </div>
        </div>
        <div className="col-6 col-xl-3">
          <div className="border rounded-4 p-3 p-sm-4 bg-white h-100">
            <div className="small text-muted fw-bold text-uppercase mb-1">Users</div>
            <div className="fs-4 fw-bold text-dark">{stats.users}</div>
          </div>
        </div>
        <div className="col-6 col-xl-3">
          <div className="border rounded-4 p-3 p-sm-4 bg-white h-100">
            <div className="small text-muted fw-bold text-uppercase mb-1">Listings</div>
            <div className="fs-4 fw-bold text-dark">{stats.products}</div>
          </div>
        </div>
        <div className="col-6 col-xl-3">
          <div className="border rounded-4 p-3 p-sm-4 bg-white h-100">
            <div className="small text-muted fw-bold text-uppercase mb-1">Orders</div>
            <div className="fs-4 fw-bold text-dark">{stats.orders}</div>
          </div>
        </div>
      </div>

      {/* Admin Tab Switcher */}
      <AdminSidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        counts={{ products: products.length, orders: orders.length, users: users.length }}
      />

      {/* Tab 1: Overview Analytics */}
      {activeTab === 'overview' && (
        <div className="d-grid gap-4">
          <div className="row g-4">
            <div className="col-12 col-lg-6">
              {renderLineChart({
                title: 'Monthly Revenue Trend',
                badge: 'Paid Orders',
                data: analytics.monthlyRevenue,
                valueKey: 'revenue',
                color: '#FF6B35',
                gradId: 'revGrad',
                formatVal: (v) => (v >= 1000 ? `₹${(v / 1000).toFixed(0)}k` : `₹${v}`),
              })}
            </div>
            <div className="col-12 col-lg-6">
              {renderLineChart({
                title: 'Monthly User Growth',
                badge: 'Cumulative',
                data: analytics.userGrowth,
                valueKey: 'count',
                color: '#004E89',
                gradId: 'usrGrad',
                formatVal: (v) => String(v),
              })}
            </div>
          </div>
          {renderCategoryBars()}
        </div>
      )}

      {/* Tab 2: Product Moderation */}
      {activeTab === 'products' && (
        <div className="border rounded-4 overflow-hidden">
          <div className="bg-light px-4 py-3 border-bottom">
            <h6 className="fw-bold text-dark mb-0">Global Product Moderation</h6>
            <div className="text-muted small">Remove inappropriate or outdated listings across the marketplace.</div>
          </div>
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0 small">
              <thead className="table-light">
                <tr>
                  <th>Item</th>
                  <th>Category &amp; Mode</th>
                  <th>Pricing</th>
                  <th className="text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product._id}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <img
                          src={resolveImageUrl(product.image)}
                          alt={product.name}
                          className="rounded-2 object-fit-cover border"
                          style={{ width: '42px', height: '42px' }}
                        />
                        <div>
                          <div className="fw-bold text-dark">{product.name}</div>
                          <div className="text-muted font-monospace" style={{ fontSize: '0.72rem' }}>
                            ID: {String(product._id).slice(-8)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="text-capitalize fw-semibold">{product.category}</div>
                      <span className={product.type === 'rent' ? 'badge-rensell-rent' : 'badge-rensell-sale'}>
                        {product.type === 'rent' ? 'For Rent' : 'For Sale'}
                      </span>
                    </td>
                    <td className="fw-bold">
                      {formatINR(product.price)}
                      {product.type === 'rent' && <span className="text-muted fw-normal">/day</span>}
                    </td>
                    <td className="text-end">
                      <button
                        type="button"
                        onClick={() =>
                          setConfirmModal({
                            title: 'Delete Product',
                            message: `Permanently delete "${product.name}"?`,
                            onConfirm: () => handleDeleteProduct(product._id),
                          })
                        }
                        className="btn btn-sm btn-outline-danger rounded-3"
                      >
                        <i className="bi bi-trash me-1" /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center py-4 text-muted">
                      No products in catalog.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Order Fulfillment */}
      {activeTab === 'orders' && (
        <div className="border rounded-4 overflow-hidden">
          <div className="bg-light px-4 py-3 border-bottom">
            <h6 className="fw-bold text-dark mb-0">Global Order Tracking &amp; Status Management</h6>
          </div>
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0 small">
              <thead className="table-light">
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Payment Status</th>
                  <th>Delivery Status</th>
                  <th className="text-end">Details</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const isExpanded = expandedOrderId === order._id;
                  return (
                    <Fragment key={order._id}>
                      <tr>
                        <td>
                          <div className="fw-bold font-monospace">#{String(order._id).slice(-8).toUpperCase()}</div>
                          <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                            {formatFullDate(order.createdAt)}
                          </div>
                        </td>
                        <td>
                          <div className="fw-bold text-dark">{order.shippingAddress?.fullName || 'N/A'}</div>
                          <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                            {order.userId?.email || 'N/A'}
                          </div>
                        </td>
                        <td>
                          <div className="fw-bold">{formatINR(order.totalAmount)}</div>
                          <div className="text-muted text-uppercase" style={{ fontSize: '0.7rem' }}>
                            {order.paymentMethod}
                          </div>
                        </td>
                        <td>
                          <select
                            disabled={updatingOrderId === order._id}
                            value={order.paymentStatus}
                            onChange={(e) => handleUpdateOrder(order._id, { paymentStatus: e.target.value })}
                            className="form-select form-select-sm rounded-3"
                            style={{ minWidth: '110px' }}
                          >
                            <option value="pending">Pending</option>
                            <option value="paid">Paid</option>
                            <option value="failed">Failed</option>
                            <option value="refunded">Refunded</option>
                          </select>
                        </td>
                        <td>
                          <select
                            disabled={updatingOrderId === order._id}
                            value={order.status}
                            onChange={(e) => handleUpdateOrder(order._id, { status: e.target.value })}
                            className="form-select form-select-sm rounded-3"
                            style={{ minWidth: '125px' }}
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="text-end">
                          <button
                            type="button"
                            onClick={() => setExpandedOrderId(isExpanded ? null : order._id)}
                            className={`btn btn-sm rounded-3 ${isExpanded ? 'btn-rensell' : 'btn-rensell-outline'}`}
                          >
                            {isExpanded ? 'Hide' : 'Details'}
                          </button>
                        </td>
                      </tr>

                      {isExpanded && (
                        <tr className="bg-light">
                          <td colSpan={6} className="p-4">
                            <div className="row g-3">
                              <div className="col-12 col-md-7">
                                <div className="fw-bold text-uppercase text-muted small mb-2">
                                  Ordered Items ({order.items?.length || 0})
                                </div>
                                <div className="d-grid gap-2">
                                  {order.items?.map((item, idx) => (
                                    <div key={idx} className="d-flex justify-content-between align-items-center bg-white border rounded-3 p-2">
                                      <div className="d-flex align-items-center gap-2">
                                        <img
                                          src={resolveImageUrl(item.image)}
                                          alt={item.name}
                                          className="rounded-2 object-fit-cover"
                                          style={{ width: '40px', height: '40px' }}
                                        />
                                        <div>
                                          <div className="fw-bold text-dark">{item.name}</div>
                                          <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                                            {item.type === 'rent' ? `Rental (${item.rentalDays || 1}d)` : 'Purchase'} &bull; Qty {item.quantity}
                                          </div>
                                        </div>
                                      </div>
                                      <div className="fw-bold">{formatINR(item.price * item.quantity)}</div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <div className="col-12 col-md-5">
                                <div className="fw-bold text-uppercase text-muted small mb-2">Shipping Address</div>
                                <div className="bg-white border rounded-3 p-3 small">
                                  <div className="fw-bold text-dark">{order.shippingAddress?.fullName}</div>
                                  <div className="text-secondary">{order.shippingAddress?.phone}</div>
                                  <div className="text-secondary mt-1">{order.shippingAddress?.address}</div>
                                  <div className="text-secondary">
                                    {order.shippingAddress?.city}, {order.shippingAddress?.state} -{' '}
                                    {order.shippingAddress?.pincode}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-4 text-muted">
                      No orders found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: User Accounts */}
      {activeTab === 'users' && (
        <div className="border rounded-4 overflow-hidden">
          <div className="bg-light px-4 py-3 border-bottom d-flex flex-wrap justify-content-between align-items-center gap-3">
            <div>
              <h6 className="fw-bold text-dark mb-0">Registered User Directory</h6>
              <div className="text-muted small">Verify KYC, manage roles, or block/unblock accounts.</div>
            </div>
            <input
              type="search"
              value={userSearchQuery}
              onChange={(e) => setUserSearchQuery(e.target.value)}
              placeholder="Search name or email..."
              className="form-control form-control-sm rounded-3"
              style={{ maxWidth: '250px' }}
            />
          </div>

          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0 small">
              <thead className="table-light">
                <tr>
                  <th>User</th>
                  <th>Joined</th>
                  <th>KYC Verified</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th className="text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => {
                  const isSelf = String(u._id) === String(currentAdminId);
                  return (
                    <tr key={u._id}>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <span className="avatar-circle" style={{ width: '32px', height: '32px', fontSize: '0.78rem' }}>
                            {u.name?.charAt(0)?.toUpperCase() || 'U'}
                          </span>
                          <div>
                            <div className="fw-bold text-dark">{u.name}</div>
                            <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                              {u.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>{formatFullDate(u.createdAt)}</td>
                      <td>
                        <span className={`badge me-2 ${u.isVerified ? 'text-bg-success' : 'text-bg-warning'}`}>
                          {u.isVerified ? 'Verified' : 'Pending'}
                        </span>
                        <button
                          type="button"
                          disabled={updatingUserId === u._id}
                          onClick={() => handleUpdateUser(u._id, { isVerified: !u.isVerified })}
                          className="btn btn-link btn-sm p-0 text-decoration-underline"
                        >
                          Toggle
                        </button>
                      </td>
                      <td>
                        <span className={`badge me-2 text-uppercase ${u.role === 'admin' ? 'text-bg-danger' : 'text-bg-secondary'}`}>
                          {u.role}
                        </span>
                        {!isSelf && (
                          <button
                            type="button"
                            disabled={updatingUserId === u._id}
                            onClick={() => handleUpdateUser(u._id, { role: u.role === 'admin' ? 'user' : 'admin' })}
                            className="btn btn-link btn-sm p-0 text-decoration-underline"
                          >
                            Switch
                          </button>
                        )}
                      </td>
                      <td>
                        <span className={`badge me-2 ${u.isBlocked ? 'text-bg-danger' : 'text-bg-success'}`}>
                          {u.isBlocked ? 'Blocked' : 'Active'}
                        </span>
                        {!isSelf && (
                          <button
                            type="button"
                            disabled={updatingUserId === u._id}
                            onClick={() => handleUpdateUser(u._id, { isBlocked: !u.isBlocked })}
                            className={`btn btn-sm py-0 px-2 rounded-2 ${
                              u.isBlocked ? 'btn-outline-success' : 'btn-outline-danger'
                            }`}
                          >
                            {u.isBlocked ? 'Unblock' : 'Block'}
                          </button>
                        )}
                      </td>
                      <td className="text-end">
                        {isSelf ? (
                          <span className="text-muted fst-italic">Current Admin</span>
                        ) : (
                          <button
                            type="button"
                            disabled={updatingUserId === u._id}
                            onClick={() =>
                              setConfirmModal({
                                title: 'Delete User Account',
                                message: `Permanently delete user "${u.name}" (${u.email})?`,
                                onConfirm: () => handleDeleteUser(u._id),
                              })
                            }
                            className="btn btn-sm btn-outline-danger rounded-3"
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-4 text-muted">
                      No matching users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmModal && (
        <>
          <div className="modal-backdrop fade show" />
          <div className="modal fade show d-block" tabIndex="-1" role="dialog">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content rounded-4 border-0 shadow-lg">
                <div className="modal-header border-bottom-0">
                  <h5 className="modal-title fw-bold text-danger">{confirmModal.title}</h5>
                  <button type="button" className="btn-close" onClick={() => setConfirmModal(null)} />
                </div>
                <div className="modal-body pt-0">
                  <p className="text-secondary mb-0">{confirmModal.message}</p>
                </div>
                <div className="modal-footer border-top-0">
                  <button type="button" className="btn btn-light rounded-3" onClick={() => setConfirmModal(null)}>
                    Cancel
                  </button>
                  <button type="button" className="btn btn-danger rounded-3" onClick={confirmModal.onConfirm}>
                    Confirm Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
