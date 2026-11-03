'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ToastProvider';
import Image from 'next/image';
import Link from 'next/link';
import ReconcilePaymentAction from '@/components/ReconcilePaymentAction';

export default function MyOrdersPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();

      if (res.ok && data.orders) {
        setOrders(data.orders);
      } else {
        if (res.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          showToast('Session expired. Please log in again.', 'error');
          router.push('/auth/login');
        }
      }
    } catch (error) {
      console.error('Failed to fetch orders', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
        <i className="fas fa-shopping-bag text-5xl text-gray-300 mb-4" />
        <h2 className="text-xl font-bold text-dark mb-2">No Orders Yet</h2>
        <p className="text-gray-500 mb-6">Looks like you haven&apos;t bought or rented any items yet.</p>
        <Link href="/" className="btn-primary">Explore Categories</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="mb-6 border-b border-gray-100 pb-4">
        <h1 className="text-2xl font-bold text-dark flex items-center gap-3">
          <i className="fas fa-receipt text-primary" /> My Purchases & Rentals
        </h1>
        <p className="text-gray-500 text-sm mt-1">Track your recent checkouts and active rental timelines.</p>
      </div>

      {orders.map((order) => (
        <div key={order._id} className="bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden group">
          {/* Order Header */}
          <div className="bg-gray-50/80 px-6 py-4 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Order Placed</p>
                <p className="font-medium text-dark">{new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Total</p>
                <p className="font-bold text-primary">₹{(order.totalAmount || 0).toLocaleString('en-IN')}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Order ID</p>
                <p className="font-medium text-gray-600 font-mono text-xs mt-0.5">#{order._id.toString().slice(-8).toUpperCase()}</p>
              </div>
            </div>

            <div className="flex gap-2 text-xs font-bold uppercase tracking-wider">
              {order.paymentStatus === 'paid' ? (
                <span className="bg-green-100 text-green-700 px-3 py-1.5 rounded-lg flex items-center gap-1">
                  <i className="fas fa-check-circle" /> Paid
                </span>
              ) : (
                <span className="bg-red-100 text-red-700 px-3 py-1.5 rounded-lg flex items-center gap-1">
                  <i className="fas fa-times-circle" /> {order.paymentStatus}
                </span>
              )}
              {order.status === 'confirmed' || order.status === 'shipped' || order.status === 'delivered' ? (
                <span className="bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg">
                  {order.status}
                </span>
              ) : (
                <span className="bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg">
                  {order.status}
                </span>
              )}
            </div>
          </div>

          {/* Order Items */}
          <div className="divide-y divide-gray-100">
            {order.items?.map((item: any, idx: number) => {
              const isRent = item.type === 'rent';
              const nameFallback = item.productId?.name || item.name || 'Unknown Item';
              const imageFallback = item.productId?.image || item.image || '/photo/placeholder.svg';

              return (
                <div key={idx} className="p-6 flex flex-col sm:flex-row gap-6 hover:bg-gray-50/50 transition-colors">
                  <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200 shadow-sm">
                    <Image src={imageFallback} alt={nameFallback} fill className="object-cover" />
                    <div className={`absolute top-0 right-0 px-2 py-1 text-[9px] font-bold uppercase text-white shadow-sm backdrop-blur-md rounded-bl-lg ${isRent ? 'bg-secondary/90' : 'bg-primary/90'
                      }`}>
                      {isRent ? 'Rented' : 'Purchased'}
                    </div>
                  </div>

                  <div className="flex-1">
                    <Link href={item.productId?._id ? `/products/${item.productId._id}` : '#'} className="hover:text-primary transition-colors">
                      <h3 className="text-lg font-bold text-dark mb-1">{nameFallback}</h3>
                    </Link>

                    {isRent ? (
                      <div className="mt-3 space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-2.5 rounded-lg border border-gray-100 w-fit">
                          <i className="far fa-calendar-alt text-secondary" />
                          <span className="font-semibold">{new Date(item.startDate).toLocaleDateString()}</span>
                          <i className="fas fa-arrow-right text-gray-300 text-xs mx-1" />
                          <span className="font-semibold">{new Date(item.endDate).toLocaleDateString()}</span>
                          <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded ml-2 font-bold">{item.rentalDays} Days</span>
                        </div>
                        <div className="text-sm font-medium text-gray-600 flex items-center gap-2">
                          <span className="text-gray-400 border border-gray-200 px-2 rounded font-mono text-xs">Security Deposit</span>
                          <span className="text-amber-600 font-bold">+₹{item.securityDeposit?.toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 mt-2 flex items-center gap-1.5 font-medium">
                        <i className="fas fa-check text-green-500" /> Permanent Buyout
                      </p>
                    )}

                    <div className="mt-4 flex items-center gap-2">
                      <span className="text-xl font-black text-dark">
                        ₹{(isRent ? item.price * (item.rentalDays || 1) : item.price).toLocaleString('en-IN')}
                      </span>
                      {isRent && <span className="text-xs text-gray-400 font-medium">(Daily Rate: ₹{item.price})</span>}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex sm:flex-col justify-end sm:justify-start gap-3 border-t sm:border-t-0 sm:border-l border-gray-100 pt-4 sm:pt-0 sm:pl-6 min-w-[140px]">
                    <Link href={item.productId?._id ? `/products/${item.productId._id}` : '#'} className="btn-outline w-full text-center !py-2 text-xs">
                      View Item
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="px-6 pb-6">
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
  );
}
