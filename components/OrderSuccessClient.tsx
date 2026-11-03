'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import ReconcilePaymentAction from './ReconcilePaymentAction';

interface OrderSuccessClientProps {
    orderId?: string | null;
    prefilledPaymentId?: string | null;
}

export default function OrderSuccessClient({ orderId, prefilledPaymentId }: OrderSuccessClientProps) {
    const router = useRouter();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!orderId) {
            router.push('/');
            return;
        }

        fetchOrder(orderId);
    }, [orderId, router]);

    const fetchOrder = async (orderId: string) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/orders?orderId=${orderId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await response.json();
            if (response.ok) {
                setOrder(data.orders[0]);
            }
        } catch (error) {
            console.error('Fetch order error:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <div className="text-2xl">Loading...</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-16">
            <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
                <div className="text-6xl mb-4">✅</div>
                <h1 className="text-3xl font-bold text-green-600 mb-2">Order Placed Successfully!</h1>
                <p className="text-gray-600 mb-6">Thank you for shopping with RENSELL</p>

                {order && (
                    <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <div className="text-sm text-gray-600">Order ID</div>
                                <div className="font-bold">{order._id}</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-600">Total Amount</div>
                                <div className="font-bold text-primary">₹{order.totalAmount.toLocaleString('en-IN')}</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-600">Payment Method</div>
                                <div className="font-bold capitalize">{order.paymentMethod}</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-600">Payment Status</div>
                                <div className={`font-bold ${order.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                                    {order.paymentStatus.toUpperCase()}
                                </div>
                            </div>
                        </div>

                        <ReconcilePaymentAction
                            orderId={order._id}
                            paymentMethod={order.paymentMethod}
                            paymentStatus={order.paymentStatus}
                            razorpayPaymentId={order.razorpayPaymentId || prefilledPaymentId || ''}
                            onSuccess={() => fetchOrder(order._id)}
                        />

                        <div className="border-t pt-4">
                            <div className="text-sm text-gray-600 mb-2">Delivery Address</div>
                            <div className="font-medium">{order.shippingAddress.fullName}</div>
                            <div className="text-sm text-gray-700">
                                {order.shippingAddress.address}, {order.shippingAddress.city}
                            </div>
                            <div className="text-sm text-gray-700">
                                {order.shippingAddress.state} - {order.shippingAddress.pincode}
                            </div>
                            <div className="text-sm text-gray-700">Phone: {order.shippingAddress.phone}</div>
                        </div>

                        <div className="border-t pt-4 mt-4">
                            <div className="text-sm text-gray-600 mb-3">Order Items</div>
                            {order.items.map((item: any, index: number) => (
                                <div key={index} className="flex gap-3 mb-3">
                                    <Image src={item.image} alt={item.name} width={64} height={64} className="rounded object-cover" />
                                    <div className="flex-1">
                                        <div className="font-medium">{item.name}</div>
                                        <div className="text-primary font-bold">₹{item.price.toLocaleString('en-IN')}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="space-y-3">
                    <Link href="/">
                        <button className="w-full bg-primary text-white py-3 rounded-lg font-bold hover:bg-accent transition">
                            Continue Shopping
                        </button>
                    </Link>
                    <Link href="/orders">
                        <button className="w-full border border-primary text-primary py-3 rounded-lg font-bold hover:bg-gray-50 transition">
                            View All Orders
                        </button>
                    </Link>
                </div>

                <div className="mt-6 text-sm text-gray-600">
                    📧 Order confirmation has been sent to your email
                </div>
            </div>
        </div>
    );
}
