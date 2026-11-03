'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ReconcilePaymentAction from '@/components/ReconcilePaymentAction';

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    fetchOrders();
  }, [router]);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/orders', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (response.ok) {
        setOrders(data.orders);
      }
    } catch (error) {
      console.error('Fetch orders error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: any = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      processing: 'bg-purple-100 text-purple-800',
      shipped: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="text-2xl">Loading orders...</div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-4">📦</div>
        <h2 className="text-2xl font-bold mb-4">No orders yet</h2>
        <p className="text-gray-600 mb-8">Start shopping to see your orders here!</p>
        <Link href="/">
          <button className="bg-primary text-white px-8 py-3 rounded-lg hover:bg-accent transition">
            Start Shopping
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Orders</h1>

      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order._id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="text-sm text-gray-600">Order ID</div>
                <div className="font-bold">{order._id}</div>
                <div className="text-sm text-gray-600 mt-1">
                  {new Date(order.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </div>
              </div>
              <div className="text-right">
                <span className={`px-3 py-1 rounded-full text-sm font-bold ${getStatusColor(order.status)}`}>
                  {order.status.toUpperCase()}
                </span>
                <div className="mt-2 text-sm text-gray-600">
                  Payment: <span className="font-bold capitalize">{order.paymentStatus}</span>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="space-y-3">
                {order.items.map((item: any, index: number) => (
                  <div key={index} className="flex gap-4">
                    <Image src={item.image} alt={item.name} width={80} height={80} className="rounded object-cover" />
                    <div className="flex-1">
                      <div className="font-bold">{item.name}</div>
                      <div className="text-sm text-gray-600">Quantity: {item.quantity}</div>
                      <div className="text-primary font-bold">₹{item.price.toLocaleString('en-IN')}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t mt-4 pt-4 flex justify-between items-center">
              <div>
                <div className="text-sm text-gray-600">Total Amount</div>
                <div className="text-2xl font-bold text-primary">
                  ₹{order.totalAmount.toLocaleString('en-IN')}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600">Delivery Address</div>
                <div className="font-medium">{order.shippingAddress.fullName}</div>
                <div className="text-sm text-gray-700">
                  {order.shippingAddress.city}, {order.shippingAddress.state}
                </div>
              </div>
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
    </div>
  );
}
