'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function AdminPortal() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'users'>('products');
  const [stats, setStats] = useState({
    users: 0,
    products: 0,
    orders: 0,
    revenue: 0,
  });
  const [analytics, setAnalytics] = useState({
    monthlyRevenue: [],
    userGrowth: [],
    categoryDistribution: [],
  });
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [currentAdminId, setCurrentAdminId] = useState<string | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  useEffect(() => {
    // Verify user is an admin early
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.role !== 'admin') {
      router.replace('/dashboard');
      return;
    }
    setCurrentAdminId(user.id);
    
    fetchAdminData();
  }, [router]);

  const fetchAdminData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch high-level aggregated Admin stats and charts analytics
      const statsRes = await fetch('/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.stats);
        if (statsData.analytics) {
          setAnalytics(statsData.analytics);
        }
      }

      // Fetch global catalogue
      const prodRes = await fetch('/api/products');
      if (prodRes.ok) {
        const prodData = await prodRes.json();
        setProducts(prodData.products || []);
      }

      // Fetch all orders in system
      const orderRes = await fetch('/api/admin/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (orderRes.ok) {
        const orderData = await orderRes.json();
        setOrders(orderData.orders || []);
      }

      // Fetch all registered users
      const userRes = await fetch('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (userRes.ok) {
        const userData = await userRes.json();
        setUsers(userData.users || []);
      }
    } catch (error) {
      console.error('Failed to load admin data', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete '${name}'? This cannot be undone.`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        setProducts(prev => prev.filter(p => p._id !== id));
        setStats(prev => ({ ...prev, products: prev.products - 1 }));
      } else {
        const data = await res.json();
        alert(`Deletion failed: ${data.error}`);
      }
    } catch (error) {
      console.error(error);
      alert('An error occurred during deletion.');
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    setUpdatingOrderId(orderId);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ orderId, status })
      });

      if (res.ok) {
        const data = await res.json();
        setOrders(prev => prev.map(o => o._id === orderId ? data.order : o));
      } else {
        const data = await res.json();
        alert(`Update failed: ${data.error}`);
      }
    } catch (error) {
      console.error(error);
      alert('An error occurred during update.');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleUpdatePaymentStatus = async (orderId: string, paymentStatus: string) => {
    setUpdatingOrderId(orderId);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ orderId, paymentStatus })
      });

      if (res.ok) {
        const data = await res.json();
        setOrders(prev => prev.map(o => o._id === orderId ? data.order : o));
      } else {
        const data = await res.json();
        alert(`Update failed: ${data.error}`);
      }
    } catch (error) {
      console.error(error);
      alert('An error occurred during update.');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleUpdateUserStatus = async (userId: string, fields: { role?: string; isBlocked?: boolean; isVerified?: boolean }) => {
    setUpdatingUserId(userId);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ userId, ...fields })
      });

      if (res.ok) {
        const data = await res.json();
        setUsers(prev => prev.map(u => u._id === userId ? data.user : u));
      } else {
        const data = await res.json();
        alert(`Update failed: ${data.error}`);
      }
    } catch (error) {
      console.error(error);
      alert('An error occurred during update.');
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleDeleteUser = async (userId: string, name: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete the user '${name}'? This deletes their account and cannot be undone.`)) {
      return;
    }

    setUpdatingUserId(userId);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/admin/users?userId=${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        setUsers(prev => prev.filter(u => u._id !== userId));
        setStats(prev => ({ ...prev, users: prev.users - 1 }));
      } else {
        const data = await res.json();
        alert(`Deletion failed: ${data.error}`);
      }
    } catch (error) {
      console.error(error);
      alert('An error occurred during account deletion.');
    } finally {
      setUpdatingUserId(null);
    }
  };

  const getPaymentStatusStyles = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'pending':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'failed':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'refunded':
        return 'bg-gray-50 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  const getOrderStatusStyles = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'shipped':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'processing':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'confirmed':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'pending':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'cancelled':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(userSearchQuery.toLowerCase())
  );

  // SVG Chart Renderers
  const renderRevenueChart = () => {
    const data = analytics.monthlyRevenue || [];
    if (data.length === 0) return null;

    const maxVal = Math.max(...data.map((d: any) => d.revenue), 1000);
    const chartHeight = 150;
    const chartWidth = 500;
    const paddingLeft = 50;
    const paddingBottom = 25;
    const paddingTop = 15;
    const paddingRight = 15;

    const graphWidth = chartWidth - paddingLeft - paddingRight;
    const graphHeight = chartHeight - paddingTop - paddingBottom;

    // Calculate (x, y) coordinates
    const points = data.map((d: any, i: number) => {
      const x = paddingLeft + (i / (data.length - 1)) * graphWidth;
      const y = chartHeight - paddingBottom - (d.revenue / maxVal) * graphHeight;
      return { x, y, val: d.revenue, label: d.month };
    });

    // Create SVG Path for the Line and Area
    let linePath = '';
    let areaPath = '';
    if (points.length > 0) {
      linePath = `M ${points[0].x} ${points[0].y}`;
      areaPath = `M ${points[0].x} ${chartHeight - paddingBottom} L ${points[0].x} ${points[0].y}`;
      
      for (let i = 1; i < points.length; i++) {
        linePath += ` L ${points[i].x} ${points[i].y}`;
        areaPath += ` L ${points[i].x} ${points[i].y}`;
      }
      areaPath += ` L ${points[points.length - 1].x} ${chartHeight - paddingBottom} Z`;
    }

    return (
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-soft">
        <div className="flex justify-between items-center mb-4">
          <h4 className="font-extrabold text-xs uppercase tracking-wider text-gray-400">Monthly Revenue Trend</h4>
          <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg uppercase tracking-wider">Paid Sales</span>
        </div>
        <div className="relative w-full aspect-[2.2/1]">
          <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-full">
            <defs>
              <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FF6B35" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#FF6B35" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            {/* Grid Lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
              const y = paddingTop + ratio * graphHeight;
              const val = Math.round(maxVal * (1 - ratio));
              return (
                <g key={idx} className="opacity-40">
                  <line x1={paddingLeft} y1={y} x2={chartWidth - paddingRight} y2={y} stroke="#E2E8F0" strokeWidth="1" strokeDasharray="3 3" />
                  <text x={paddingLeft - 8} y={y + 4} textAnchor="end" className="fill-gray-400 text-[8px] font-bold font-mono">
                    ₹{val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}
                  </text>
                </g>
              );
            })}

            {/* X Axis Labels */}
            {points.map((p: any, idx: number) => (
              <text key={idx} x={p.x} y={chartHeight - 6} textAnchor="middle" className="fill-gray-400 text-[8px] font-black uppercase tracking-wider">
                {p.label}
              </text>
            ))}

            {/* Filled Area */}
            <path d={areaPath} fill="url(#revenueGrad)" />

            {/* Line Path */}
            <path d={linePath} fill="none" stroke="#FF6B35" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

            {/* Hover Points / Markers */}
            {points.map((p: any, idx: number) => (
              <g key={idx} className="group cursor-pointer">
                <circle cx={p.x} cy={p.y} r="4" fill="#FF6B35" stroke="#FFFFFF" strokeWidth="1.5" className="transition-all duration-300 group-hover:r-[6px] group-hover:stroke-primary" />
                <g className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <rect x={p.x - 30} y={p.y - 24} width="60" height="16" rx="4" fill="#0F172A" />
                  <text x={p.x} y={p.y - 13} textAnchor="middle" className="fill-white text-[8px] font-black font-mono">
                    ₹{p.val.toLocaleString()}
                  </text>
                </g>
              </g>
            ))}
          </svg>
        </div>
      </div>
    );
  };

  const renderUserGrowthChart = () => {
    const data = analytics.userGrowth || [];
    if (data.length === 0) return null;

    const maxVal = Math.max(...data.map((d: any) => d.count), 10);
    const chartHeight = 150;
    const chartWidth = 500;
    const paddingLeft = 45;
    const paddingBottom = 25;
    const paddingTop = 15;
    const paddingRight = 15;

    const graphWidth = chartWidth - paddingLeft - paddingRight;
    const graphHeight = chartHeight - paddingTop - paddingBottom;

    const points = data.map((d: any, i: number) => {
      const x = paddingLeft + (i / (data.length - 1)) * graphWidth;
      const y = chartHeight - paddingBottom - (d.count / maxVal) * graphHeight;
      return { x, y, val: d.count, label: d.month };
    });

    let linePath = '';
    let areaPath = '';
    if (points.length > 0) {
      linePath = `M ${points[0].x} ${points[0].y}`;
      areaPath = `M ${points[0].x} ${chartHeight - paddingBottom} L ${points[0].x} ${points[0].y}`;
      for (let i = 1; i < points.length; i++) {
        linePath += ` L ${points[i].x} ${points[i].y}`;
        areaPath += ` L ${points[i].x} ${points[i].y}`;
      }
      areaPath += ` L ${points[points.length - 1].x} ${chartHeight - paddingBottom} Z`;
    }

    return (
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-soft">
        <div className="flex justify-between items-center mb-4">
          <h4 className="font-extrabold text-xs uppercase tracking-wider text-gray-400">User Growth Curve</h4>
          <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg uppercase tracking-wider">Cumulative</span>
        </div>
        <div className="relative w-full aspect-[2.2/1]">
          <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-full">
            <defs>
              <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#004E89" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#004E89" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            {/* Grid Lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
              const y = paddingTop + ratio * graphHeight;
              const val = Math.round(maxVal * (1 - ratio));
              return (
                <g key={idx} className="opacity-40">
                  <line x1={paddingLeft} y1={y} x2={chartWidth - paddingRight} y2={y} stroke="#E2E8F0" strokeWidth="1" strokeDasharray="3 3" />
                  <text x={paddingLeft - 8} y={y + 4} textAnchor="end" className="fill-gray-400 text-[8px] font-bold font-mono">
                    {val}
                  </text>
                </g>
              );
            })}

            {/* X Axis Labels */}
            {points.map((p: any, idx: number) => (
              <text key={idx} x={p.x} y={chartHeight - 6} textAnchor="middle" className="fill-gray-400 text-[8px] font-black uppercase tracking-wider">
                {p.label}
              </text>
            ))}

            {/* Filled Area */}
            <path d={areaPath} fill="url(#userGrad)" />

            {/* Line Path */}
            <path d={linePath} fill="none" stroke="#004E89" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

            {/* Hover Points */}
            {points.map((p: any, idx: number) => (
              <g key={idx} className="group cursor-pointer">
                <circle cx={p.x} cy={p.y} r="4" fill="#004E89" stroke="#FFFFFF" strokeWidth="1.5" className="transition-all duration-300 group-hover:r-[6px] group-hover:stroke-secondary" />
                <g className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <rect x={p.x - 20} y={p.y - 24} width="40" height="16" rx="4" fill="#0F172A" />
                  <text x={p.x} y={p.y - 13} textAnchor="middle" className="fill-white text-[8px] font-black font-mono">
                    {p.val}
                  </text>
                </g>
              </g>
            ))}
          </svg>
        </div>
      </div>
    );
  };

  const renderCategoryDistribution = () => {
    const data = analytics.categoryDistribution || [];
    
    // Group counts by category
    const categoriesMap: Record<string, { rent: number; sale: number }> = {};
    data.forEach((d: any) => {
      const cat = d.category.toLowerCase();
      if (!categoriesMap[cat]) {
        categoriesMap[cat] = { rent: 0, sale: 0 };
      }
      if (d.type === 'rent') {
        categoriesMap[cat].rent += d.count;
      } else {
        categoriesMap[cat].sale += d.count;
      }
    });

    const categoryNames = Object.keys(categoriesMap);
    if (categoryNames.length === 0) return null;

    // Calculate totals for scale
    const categoryTotals = categoryNames.map(name => ({
      name,
      rent: categoriesMap[name].rent,
      sale: categoriesMap[name].sale,
      total: categoriesMap[name].rent + categoriesMap[name].sale
    }));

    const maxTotal = Math.max(...categoryTotals.map(t => t.total), 1);

    return (
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-soft lg:col-span-2">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h4 className="font-extrabold text-xs uppercase tracking-wider text-gray-400">Most Active Categories</h4>
            <p className="text-[10px] text-gray-400 mt-0.5">Rent vs Purchase volume breakdown across catalogs</p>
          </div>
          <div className="flex gap-4 text-[9px] font-black uppercase tracking-wider">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-secondary rounded" /> Rent</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-primary rounded" /> Buy</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {categoryTotals.map((cat, idx) => {
            const rentPercentage = (cat.rent / maxTotal) * 100;
            const salePercentage = (cat.sale / maxTotal) * 100;
            return (
              <div key={idx} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black uppercase tracking-wider text-dark capitalize">{cat.name}</span>
                  <span className="text-[10px] font-bold text-gray-500">
                    Total: {cat.total} ({cat.rent} Rent • {cat.sale} Buy)
                  </span>
                </div>
                {/* Horizontal Progress Bar */}
                <div className="h-6 w-full bg-gray-50 border border-gray-100 rounded-xl overflow-hidden flex">
                  {cat.rent > 0 && (
                    <div 
                      style={{ width: `${rentPercentage}%` }}
                      className="bg-gradient-to-r from-secondary to-blue-500 h-full flex items-center justify-center text-[9px] font-black text-white px-2 transition-all duration-500"
                      title={`Rented: ${cat.rent}`}
                    >
                      {rentPercentage > 15 && `Rent: ${cat.rent}`}
                    </div>
                  )}
                  {cat.sale > 0 && (
                    <div 
                      style={{ width: `${salePercentage}%` }}
                      className="bg-gradient-to-r from-primary to-orange-400 h-full flex items-center justify-center text-[9px] font-black text-white px-2 transition-all duration-500"
                      title={`Bought: ${cat.sale}`}
                    >
                      {salePercentage > 15 && `Buy: ${cat.sale}`}
                    </div>
                  )}
                  {cat.total === 0 && (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-[10px]">
                      No activity recorded.
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
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Title */}
      <div className="mb-8 border-b border-gray-100 pb-5">
        <h1 className="text-3xl font-black text-dark flex items-center gap-3">
          <i className="fas fa-shield-alt text-primary" /> Platform Command Center
        </h1>
        <p className="text-gray-500 text-sm mt-1">Super-Admin authority over users, product catalogues, and order fulfillment tracking.</p>
      </div>

      {/* Top Aggregation Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-primary to-accent rounded-2xl p-5 text-white shadow-md relative overflow-hidden">
          <p className="text-orange-100 text-xs uppercase tracking-wider font-bold mb-1">Global Revenue</p>
          <h2 className="text-2xl sm:text-3xl font-black">₹{stats.revenue.toLocaleString('en-IN')}</h2>
          <i className="fas fa-wallet absolute opacity-10 text-6xl -right-2 -bottom-2" />
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-soft relative overflow-hidden">
          <p className="text-gray-400 text-xs uppercase tracking-wider font-bold mb-1">Registered Users</p>
          <h2 className="text-2xl sm:text-3xl font-black text-dark">{stats.users.toLocaleString()}</h2>
          <i className="fas fa-users absolute opacity-5 text-gray-900 text-6xl -right-2 -bottom-2" />
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-soft relative overflow-hidden">
          <p className="text-gray-400 text-xs uppercase tracking-wider font-bold mb-1">Active Listings</p>
          <h2 className="text-2xl sm:text-3xl font-black text-dark">{stats.products.toLocaleString()}</h2>
          <i className="fas fa-box-open absolute opacity-5 text-gray-900 text-6xl -right-2 -bottom-2" />
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-soft relative overflow-hidden">
          <p className="text-gray-400 text-xs uppercase tracking-wider font-bold mb-1">Total Orders</p>
          <h2 className="text-2xl sm:text-3xl font-black text-dark">{stats.orders.toLocaleString()}</h2>
          <i className="fas fa-receipt absolute opacity-5 text-gray-900 text-6xl -right-2 -bottom-2" />
        </div>
      </div>

      {/* Analytics Visual Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {renderRevenueChart()}
        {renderUserGrowthChart()}
        {renderCategoryDistribution()}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100 mb-6 gap-2">
        <button
          onClick={() => setActiveTab('products')}
          className={`px-5 py-3 text-xs uppercase tracking-wider font-black border-b-2 transition-all duration-300 ${
            activeTab === 'products'
              ? 'border-primary text-primary'
              : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          <i className="fas fa-boxes mr-2" /> Product Catalogue ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-5 py-3 text-xs uppercase tracking-wider font-black border-b-2 transition-all duration-300 ${
            activeTab === 'orders'
              ? 'border-primary text-primary'
              : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          <i className="fas fa-truck-loading mr-2" /> Order Tracking ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-5 py-3 text-xs uppercase tracking-wider font-black border-b-2 transition-all duration-300 ${
            activeTab === 'users'
              ? 'border-primary text-primary'
              : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          <i className="fas fa-users-cog mr-2" /> User Accounts ({users.length})
        </button>
      </div>

      {/* Products Tab Content */}
      {activeTab === 'products' && (
        <div className="bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden animate-scale-in">
          <div className="bg-gray-50/80 px-6 py-4 border-b border-gray-100">
            <h3 className="font-extrabold text-dark text-base">Global Product Moderation</h3>
            <p className="text-xs text-gray-400 mt-0.5">Warning: Deletions are permanent and overwrite Vendor listings.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-[10px] uppercase tracking-wider text-gray-400 bg-white">
                  <th className="px-6 py-4 font-black">Item Identifier</th>
                  <th className="px-6 py-4 font-black">Category & Type</th>
                  <th className="px-6 py-4 font-black">Pricing</th>
                  <th className="px-6 py-4 font-black text-right">Admin Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {products.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden flex-shrink-0">
                          <Image src={product.image || '/photo/placeholder.svg'} alt={product.name} fill className="object-cover" />
                        </div>
                        <div className="max-w-[200px] sm:max-w-[300px]">
                          <p className="font-extrabold text-dark text-xs sm:text-sm truncate" title={product.name}>{product.name}</p>
                          <p className="text-[10px] text-gray-400 font-mono mt-0.5">ID: {product._id.toString().slice(-8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold text-gray-600 block capitalize">{product.category}</span>
                      <span className={`inline-block text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg text-white mt-1 ${
                        product.type === 'rent' ? 'bg-secondary' : 'bg-primary'
                      }`}>
                        {product.type === 'rent' ? 'For Rent' : 'For Sale'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-black text-dark">₹{product.price.toLocaleString('en-IN')}</p>
                      {product.type === 'rent' && <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">per day</p>}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleDeleteProduct(product._id, product.name)}
                        className="text-[10px] font-black uppercase tracking-wider text-red-500 hover:text-white border border-red-200 hover:bg-red-500 px-3.5 py-2 rounded-xl transition-all duration-300"
                      >
                        <i className="fas fa-trash-alt mr-1.5" /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-400 text-xs font-bold uppercase tracking-wider">
                      No active listings in the global database.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Orders Tab Content */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden animate-scale-in">
          <div className="bg-gray-50/80 px-6 py-4 border-b border-gray-100">
            <h3 className="font-extrabold text-dark text-base">Global Order Fulfillment & Tracking</h3>
            <p className="text-xs text-gray-400 mt-0.5">Update shipment status or verify checkout transactions below.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-[10px] uppercase tracking-wider text-gray-400 bg-white">
                  <th className="px-6 py-4 font-black">Order ID</th>
                  <th className="px-6 py-4 font-black">Customer Details</th>
                  <th className="px-6 py-4 font-black">Checkout Price</th>
                  <th className="px-6 py-4 font-black">Payment Status</th>
                  <th className="px-6 py-4 font-black">Delivery Status</th>
                  <th className="px-6 py-4 font-black text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orders.map((order) => {
                  const isExpanded = expandedOrderId === order._id;
                  return (
                    <>
                      <tr key={order._id} className="hover:bg-gray-50/30 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-mono font-black text-dark text-xs">#{order._id.toString().slice(-8).toUpperCase()}</p>
                          <p className="text-[10px] text-gray-400 font-bold mt-1">
                            {new Date(order.createdAt).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-extrabold text-dark text-xs sm:text-sm truncate max-w-[150px]">{order.shippingAddress.fullName}</p>
                          <p className="text-[10px] text-gray-400 truncate max-w-[180px] mt-0.5">{order.userId?.email || 'N/A'}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-xs sm:text-sm font-black text-dark">₹{order.totalAmount.toLocaleString('en-IN')}</p>
                          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                            {order.paymentMethod === 'cod' ? '💵 Cash on Delivery' : '💳 Razorpay'}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <select
                            disabled={updatingOrderId === order._id}
                            value={order.paymentStatus}
                            onChange={(e) => handleUpdatePaymentStatus(order._id, e.target.value)}
                            className={`border text-[10px] font-extrabold uppercase tracking-wider rounded-xl px-2.5 py-1.5 focus:outline-none transition-all duration-300 ${getPaymentStatusStyles(
                              order.paymentStatus
                            )}`}
                          >
                            <option value="pending">Pending</option>
                            <option value="paid">Paid</option>
                            <option value="failed">Failed</option>
                            <option value="refunded">Refunded</option>
                          </select>
                        </td>
                        <td className="px-6 py-4">
                          <select
                            disabled={updatingOrderId === order._id}
                            value={order.status}
                            onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                            className={`border text-[10px] font-extrabold uppercase tracking-wider rounded-xl px-2.5 py-1.5 focus:outline-none transition-all duration-300 ${getOrderStatusStyles(
                              order.status
                            )}`}
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => setExpandedOrderId(isExpanded ? null : order._id)}
                            className={`text-[10px] font-black uppercase tracking-wider border px-3 py-2 rounded-xl transition-all duration-300 ${
                              isExpanded
                                ? 'bg-primary text-white border-primary shadow-sm'
                                : 'text-gray-500 border-gray-200 hover:border-primary hover:text-primary hover:bg-primary/5'
                            }`}
                          >
                            {isExpanded ? 'Hide' : 'Details'}
                          </button>
                        </td>
                      </tr>

                      {/* Expanded Section for Order Items and Shipping Details */}
                      {isExpanded && (
                        <tr key={`${order._id}-expanded`} className="bg-gray-50/50">
                          <td colSpan={6} className="px-6 py-5 border-t border-b border-gray-100">
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                              {/* Left details - Order Items */}
                              <div className="md:col-span-7 space-y-3.5">
                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-200/60 pb-1.5">
                                  Ordered items ({order.items.length})
                                </h4>
                                <div className="space-y-3 max-h-[280px] overflow-y-auto pr-2">
                                  {order.items.map((item: any, idx: number) => (
                                    <div key={idx} className="flex items-center justify-between gap-3 bg-white border border-gray-100 p-3 rounded-2xl shadow-sm">
                                      <div className="flex items-center gap-3">
                                        <div className="relative w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden flex-shrink-0">
                                          <Image src={item.image || '/photo/placeholder.svg'} alt={item.name} fill className="object-cover" />
                                        </div>
                                        <div>
                                          <p className="font-extrabold text-xs text-dark leading-tight">{item.name}</p>
                                          <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-wider">
                                            {item.type === 'rent' ? 'Rental Option' : 'Purchase Option'}
                                          </p>
                                          {item.type === 'rent' && (
                                            <p className="text-[9px] font-medium text-amber-600 mt-0.5">
                                              Period: {item.rentalDays} Days (
                                              {new Date(item.startDate).toLocaleDateString()} - {new Date(item.endDate).toLocaleDateString()})
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                      <div className="text-right">
                                        <p className="text-xs font-black text-dark">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                                        <p className="text-[9px] text-gray-400 font-bold mt-0.5">
                                          ₹{item.price.toLocaleString()} x {item.quantity}
                                        </p>
                                        {item.type === 'rent' && (
                                          <p className="text-[9px] font-semibold text-gray-400 mt-0.5">
                                            +₹{item.securityDeposit?.toLocaleString()} deposit
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Right details - Shipping Address */}
                              <div className="md:col-span-5 space-y-3">
                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-200/60 pb-1.5">
                                  Delivery Destination & Contact
                                </h4>
                                <div className="bg-white border border-gray-100 p-4 rounded-2xl shadow-sm text-xs font-bold text-gray-600 space-y-2">
                                  <div className="flex justify-between">
                                    <span className="text-gray-400 font-medium uppercase tracking-wider text-[9px]">Recipient</span>
                                    <span className="text-dark uppercase">{order.shippingAddress.fullName}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-400 font-medium uppercase tracking-wider text-[9px]">Mobile Phone</span>
                                    <span className="text-dark font-mono">{order.shippingAddress.phone}</span>
                                  </div>
                                  <div className="flex justify-between items-start gap-4">
                                    <span className="text-gray-400 font-medium uppercase tracking-wider text-[9px] flex-shrink-0">Address</span>
                                    <span className="text-dark text-right leading-tight max-w-[200px]">{order.shippingAddress.address}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-400 font-medium uppercase tracking-wider text-[9px]">City & State</span>
                                    <span className="text-dark uppercase">{order.shippingAddress.city}, {order.shippingAddress.state}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-400 font-medium uppercase tracking-wider text-[9px]">Postal Pin Code</span>
                                    <span className="text-dark font-mono">{order.shippingAddress.pincode}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400 text-xs font-bold uppercase tracking-wider">
                      No orders registered in the system database.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* User Accounts Tab Content */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden animate-scale-in">
          {/* Header controls with search */}
          <div className="bg-gray-50/80 px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-4">
            <div>
              <h3 className="font-extrabold text-dark text-base">Registered User Directory</h3>
              <p className="text-xs text-gray-400 mt-0.5">Moderate accounts, toggle admin access, or temporarily restrict platform login.</p>
            </div>
            <div className="relative w-full sm:w-64">
              <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
              <input
                type="search"
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                placeholder="Search by name or email..."
                className="input !pl-9 !pr-4 !py-2 !text-xs !rounded-xl"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-[10px] uppercase tracking-wider text-gray-400 bg-white">
                  <th className="px-6 py-4 font-black">User Profile</th>
                  <th className="px-6 py-4 font-black">Joined Date</th>
                  <th className="px-6 py-4 font-black">Verification (KYC)</th>
                  <th className="px-6 py-4 font-black">Role Privilege</th>
                  <th className="px-6 py-4 font-black">Account State</th>
                  <th className="px-6 py-4 font-black text-right">Delete Account</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredUsers.map((u) => {
                  const isSelf = u._id === currentAdminId;
                  return (
                    <tr key={u._id} className="hover:bg-gray-50/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-black text-xs shadow-sm flex-shrink-0">
                            {u.name?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                          <div className="max-w-[200px] sm:max-w-[250px]">
                            <p className="font-extrabold text-dark text-xs sm:text-sm truncate">{u.name}</p>
                            <p className="text-[10px] text-gray-400 truncate mt-0.5">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs font-bold text-gray-600">
                          {new Date(u.createdAt).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`inline-block text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg ${
                            u.isVerified 
                              ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                              : 'bg-amber-50 text-amber-600 border border-amber-100'
                          }`}>
                            {u.isVerified ? 'Verified' : 'Pending'}
                          </span>
                          <button
                            disabled={updatingUserId === u._id}
                            onClick={() => handleUpdateUserStatus(u._id, { isVerified: !u.isVerified })}
                            className="text-[9px] text-gray-400 hover:text-primary font-bold uppercase tracking-wider underline cursor-pointer"
                          >
                            Toggle
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`inline-block text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg text-white ${
                            u.role === 'admin' ? 'bg-red-500' : 'bg-gray-400'
                          }`}>
                            {u.role}
                          </span>
                          {!isSelf && (
                            <button
                              disabled={updatingUserId === u._id}
                              onClick={() => handleUpdateUserStatus(u._id, { role: u.role === 'admin' ? 'user' : 'admin' })}
                              className="text-[9px] text-gray-400 hover:text-primary font-bold uppercase tracking-wider underline cursor-pointer"
                            >
                              Change
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2.5">
                          <span className={`inline-block text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg ${
                            u.isBlocked 
                              ? 'bg-rose-50 text-rose-700 border border-rose-100' 
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          }`}>
                            {u.isBlocked ? 'Blocked' : 'Active'}
                          </span>
                          {!isSelf && (
                            <button
                              disabled={updatingUserId === u._id}
                              onClick={() => handleUpdateUserStatus(u._id, { isBlocked: !u.isBlocked })}
                              className={`text-[9px] font-black uppercase tracking-wider border rounded-lg px-2.5 py-1 ${
                                u.isBlocked
                                  ? 'text-emerald-600 border-emerald-200 hover:bg-emerald-50'
                                  : 'text-rose-600 border-rose-200 hover:bg-rose-50'
                              }`}
                            >
                              {u.isBlocked ? 'Unblock' : 'Block'}
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {!isSelf && (
                          <button
                            disabled={updatingUserId === u._id}
                            onClick={() => handleDeleteUser(u._id, u.name)}
                            className="text-[10px] font-black uppercase tracking-wider text-red-500 hover:text-white border border-red-200 hover:bg-red-500 px-3 py-1.5 rounded-xl transition-all duration-300"
                          >
                            Delete
                          </button>
                        )}
                        {isSelf && <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider italic">You (Current Admin)</span>}
                      </td>
                    </tr>
                  );
                })}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400 text-xs font-bold uppercase tracking-wider">
                      No matching user accounts registered in the database.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
