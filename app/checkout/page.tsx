'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Script from 'next/script';

declare global {
  interface Window {
    Razorpay: any;
  }
}

const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

type ToastType = 'success' | 'error' | 'info';

export default function CheckoutPage() {
  const [cart, setCart] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [failedOrderId, setFailedOrderId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [userEmail, setUserEmail] = useState('');
  const router = useRouter();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setUserEmail(user.email || '');
        setFormData(prev => ({
          ...prev,
          fullName: user.name || prev.fullName,
          email: user.email || prev.email,
        }));
      } catch (e) { /* ignore */ }
    }

    const cartData = JSON.parse(localStorage.getItem('cart') || '[]');
    if (cartData.length === 0) {
      router.push('/cart');
      return;
    }

    setCart(cartData);
    const totalAmount = cartData.reduce((sum: number, item: any) => {
      if (item.type === 'rent') {
        return sum + (item.price * (item.rentalDays || 1)) + (item.securityDeposit || 0);
      }
      return sum + item.price;
    }, 0);
    setTotal(totalAmount);
  }, [router]);

  const showToast = (message: string, type: ToastType = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    if (!formData.fullName || !formData.phone || !formData.address ||
      !formData.city || !formData.state || !formData.pincode) {
      showToast('Please fill all delivery details', 'error');
      return false;
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      showToast('Please enter a valid email address', 'error');
      return false;
    }
    if (!/^\d{10}$/.test(formData.phone)) {
      showToast('Please enter valid 10-digit phone number', 'error');
      return false;
    }
    if (!/^\d{6}$/.test(formData.pincode)) {
      showToast('Please enter valid 6-digit pincode', 'error');
      return false;
    }
    return true;
  };

  const createOrder = async () => {
    try {
      const token = localStorage.getItem('token');
      const { email, ...shippingAddress } = formData;

      const orderData = {
        items: cart.map(item => ({
          productId: item._id,
          quantity: 1,
          price: item.price,
          name: item.name,
          image: item.image,
          type: item.type,
          ...(item.type === 'rent' && {
            startDate: item.startDate,
            endDate: item.endDate,
            rentalDays: item.rentalDays,
            securityDeposit: item.securityDeposit
          })
        })),
        shippingAddress,
        paymentMethod,
        totalAmount: total,
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create order');
      }

      return data.order;
    } catch (error: any) {
      console.error(error);
      throw error;
    }
  };

  const markOrderFailed = async (orderId: string) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          paymentStatus: 'failed',
          status: 'cancelled',
        }),
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleRazorpayPayment = async () => {
    try {
      setLoading(true);
      setFailedOrderId(null);

      const order = await createOrder();
      const token = localStorage.getItem('token');

      const razorpayResponse = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          orderId: order._id,
          amount: total,
          receipt: order._id,
        }),
      });

      const razorpayData = await razorpayResponse.json();
      if (!razorpayResponse.ok) {
        setFailedOrderId(order._id);
        throw new Error(razorpayData.details || razorpayData.error || 'Failed to create Razorpay order');
      }
      if (!razorpayData.keyId) {
        setFailedOrderId(order._id);
        throw new Error('Razorpay public key is not configured.');
      }

      const options = {
        key: razorpayData.keyId,
        amount: razorpayData.amount,
        currency: razorpayData.currency,
        name: 'RENSELL',
        description: 'Order Payment',
        order_id: razorpayData.orderId,
        notes: {
          orderId: order._id,
        },
        handler: async function (response: any) {
          try {
            showToast('Verifying payment...', 'info');
            const verifyResponse = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
              },
              body: JSON.stringify({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                orderId: order._id,
              }),
            });

            const verifyData = await verifyResponse.json();
            if (verifyData.success) {
              localStorage.removeItem('cart');
              window.dispatchEvent(new CustomEvent('cart-updated'));
              showToast('Payment successful! Redirecting...', 'success');
              setTimeout(() => router.push(`/order-success?orderId=${order._id}`), 1000);
            } else {
              showToast('Payment verification failed.', 'error');
              setFailedOrderId(order._id);
            }
          } catch (error) {
            showToast('Payment verification failed.', 'error');
            setFailedOrderId(order._id);
          }
        },
        prefill: {
          name: formData.fullName,
          email: formData.email || userEmail,
          contact: formData.phone,
        },
        theme: {
          color: '#FF6B35',
        },
        modal: {
          ondismiss: function () {
            showToast('Payment cancelled.', 'info');
            setFailedOrderId(order._id);
            setLoading(false);
          },
        },
      };

      const isLoaded = await loadRazorpayScript();
      if (!isLoaded || !window.Razorpay) {
        throw new Error('Failed to load Razorpay SDK. Please check your internet connection.');
      }

      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', function (response: any) {
        showToast('Payment failed: ' + response.error.description, 'error');
        setFailedOrderId(order._id);
        markOrderFailed(order._id);
      });
      razorpay.open();
    } catch (error: any) {
      showToast('Payment failed: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRetryPayment = async () => {
    if (!failedOrderId) return;
    try {
      setLoading(true);
      setFailedOrderId(null);
      const token = localStorage.getItem('token');

      const razorpayResponse = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          orderId: failedOrderId,
          amount: total,
          receipt: failedOrderId,
        }),
      });

      const razorpayData = await razorpayResponse.json();
      if (!razorpayResponse.ok) {
        throw new Error(razorpayData.details || razorpayData.error || 'Failed to create Razorpay order');
      }

      const options = {
        key: razorpayData.keyId,
        amount: razorpayData.amount,
        currency: razorpayData.currency,
        name: 'RENSELL',
        description: 'Order Payment - Retry',
        order_id: razorpayData.orderId,
        notes: {
          orderId: failedOrderId,
        },
        handler: async function (response: any) {
          try {
            const verifyResponse = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
              },
              body: JSON.stringify({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                orderId: failedOrderId,
              }),
            });

            const verifyData = await verifyResponse.json();
            if (verifyData.success) {
              localStorage.removeItem('cart');
              window.dispatchEvent(new CustomEvent('cart-updated'));
              showToast('Payment successful! Redirecting...', 'success');
              setTimeout(() => router.push(`/order-success?orderId=${failedOrderId}`), 1000);
            } else {
              showToast('Payment verification failed.', 'error');
              setFailedOrderId(failedOrderId);
            }
          } catch (error) {
            showToast('Payment verification error.', 'error');
            setFailedOrderId(failedOrderId);
          }
        },
        prefill: {
          name: formData.fullName,
          email: formData.email || userEmail,
          contact: formData.phone,
        },
        theme: {
          color: '#FF6B35',
        },
        modal: {
          ondismiss: function () {
            showToast('Payment cancelled.', 'info');
            setFailedOrderId(failedOrderId);
            setLoading(false);
          },
        },
      };

      const isLoaded = await loadRazorpayScript();
      if (!isLoaded || !window.Razorpay) {
        throw new Error('Failed to load Razorpay SDK. Please check your internet connection.');
      }

      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', function (response: any) {
        showToast('Payment failed: ' + response.error.description, 'error');
        setFailedOrderId(failedOrderId);
      });
      razorpay.open();
    } catch (error: any) {
      showToast('Retry failed: ' + error.message, 'error');
      setFailedOrderId(failedOrderId);
    } finally {
      setLoading(false);
    }
  };

  const handleCODPayment = async () => {
    try {
      setLoading(true);
      const order = await createOrder();
      localStorage.removeItem('cart');
      window.dispatchEvent(new CustomEvent('cart-updated'));
      showToast('Order placed successfully!', 'success');
      setTimeout(() => router.push(`/order-success?orderId=${order._id}`), 1000);
    } catch (error: any) {
      showToast('Order failed: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) return;

    if (paymentMethod === 'razorpay') {
      await handleRazorpayPayment();
    } else {
      await handleCODPayment();
    }
  };

  const toastStyles: Record<ToastType, string> = {
    success: 'bg-emerald-600',
    error: 'bg-red-600',
    info: 'bg-[#004E89]',
  };

  const toastIcons: Record<ToastType, string> = {
    success: 'fa-check-circle',
    error: 'fa-times-circle',
    info: 'fa-info-circle',
  };

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />

      {/* Modern Toast Notification */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[9999] ${toastStyles[toast.type]} text-white px-5 py-4 rounded-2xl shadow-premium flex items-center gap-3 max-w-sm toast-enter`}>
          <i className={`fas ${toastIcons[toast.type]} text-lg`} />
          <span className="text-xs font-bold uppercase tracking-wider flex-1">{toast.message}</span>
          <button onClick={() => setToast(null)} className="text-white/80 hover:text-white transition-colors ml-2">
            <i className="fas fa-times" />
          </button>
        </div>
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-dark/30 backdrop-blur-sm z-[9998] flex items-center justify-center">
          <div className="bg-white rounded-3xl p-8 shadow-premium flex flex-col items-center gap-4 max-w-xs text-center border border-gray-100">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <div className="space-y-1">
              <p className="text-sm font-black text-dark uppercase tracking-wider">Processing Checkout</p>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Please do not refresh or close this tab</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-surface min-h-screen py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header Title */}
          <div className="flex items-center gap-3.5 mb-8 border-b border-gray-100 pb-5">
            <div className="w-11 h-11 rounded-xl bg-primary-soft text-primary flex items-center justify-center border border-primary/10">
              <i className="fas fa-shield-alt text-base" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-dark tracking-tight">Checkout</h1>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-0.5">Secure payment & shipping options</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
            {/* Steps / Input forms */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Delivery Address Form Card */}
              <div className="bg-white rounded-3xl border border-gray-100 shadow-soft p-5 sm:p-8">
                <h2 className="text-base font-black text-dark uppercase tracking-wider mb-6 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-primary-soft text-primary flex items-center justify-center text-[10px] font-black">1</span>
                  Delivery Address Details
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Full Name *</label>
                    <input
                      type="text"
                      name="fullName"
                      placeholder="John Doe"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="input !text-xs !py-3"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Email (for digital receipt)</label>
                    <input
                      type="email"
                      name="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="input !text-xs !py-3"
                    />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Phone Number *</label>
                    <input
                      type="tel"
                      name="phone"
                      placeholder="10-Digit Mobile Number"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="input !text-xs !py-3"
                      maxLength={10}
                      required
                    />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Shipping Address *</label>
                    <textarea
                      name="address"
                      placeholder="Street name, building, apartment number..."
                      value={formData.address}
                      onChange={handleInputChange}
                      className="input !text-xs !py-3 resize-none"
                      rows={3}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">City *</label>
                    <input
                      type="text"
                      name="city"
                      placeholder="e.g. Mumbai"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="input !text-xs !py-3"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">State *</label>
                    <input
                      type="text"
                      name="state"
                      placeholder="e.g. Maharashtra"
                      value={formData.state}
                      onChange={handleInputChange}
                      className="input !text-xs !py-3"
                      required
                    />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Pincode *</label>
                    <input
                      type="text"
                      name="pincode"
                      placeholder="6-Digit Area Code"
                      value={formData.pincode}
                      onChange={handleInputChange}
                      className="input !text-xs !py-3"
                      maxLength={6}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Payment Methods selector card */}
              <div className="bg-white rounded-3xl border border-gray-100 shadow-soft p-5 sm:p-8">
                <h2 className="text-base font-black text-dark uppercase tracking-wider mb-6 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-primary-soft text-primary flex items-center justify-center text-[10px] font-black">2</span>
                  Select Payment Option
                </h2>
                
                <div className="space-y-4">
                  <label className={`flex items-center gap-4 p-5 border rounded-2xl cursor-pointer transition-all duration-300 ${
                    paymentMethod === 'razorpay' 
                      ? 'border-primary bg-primary-soft/30 shadow-sm' 
                      : 'border-gray-100 hover:bg-gray-50/50'
                  }`}>
                    <input
                      type="radio"
                      name="payment"
                      value="razorpay"
                      checked={paymentMethod === 'razorpay'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4 text-primary focus:ring-primary border-gray-300"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-extrabold text-xs sm:text-sm text-dark uppercase tracking-wider">Online Payment</div>
                      <div className="text-[10px] text-gray-400 font-bold uppercase mt-1">Pay instantly via UPI, Credit/Debit Card, Netbanking</div>
                    </div>
                    <div className="flex-shrink-0 relative w-12 h-6 sm:w-16">
                      <Image 
                        src="https://razorpay.com/assets/razorpay-glyph.svg" 
                        alt="Razorpay logo" 
                        fill 
                        className="object-contain" 
                        unoptimized 
                      />
                    </div>
                  </label>

                  <label className={`flex items-center gap-4 p-5 border rounded-2xl cursor-pointer transition-all duration-300 ${
                    paymentMethod === 'cod' 
                      ? 'border-primary bg-primary-soft/30 shadow-sm' 
                      : 'border-gray-100 hover:bg-gray-50/50'
                  }`}>
                    <input
                      type="radio"
                      name="payment"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4 text-primary focus:ring-primary border-gray-300"
                    />
                    <div className="flex-1">
                      <div className="font-extrabold text-xs sm:text-sm text-dark uppercase tracking-wider">Cash on Delivery (COD)</div>
                      <div className="text-[10px] text-gray-400 font-bold uppercase mt-1">Pay cash or scan QR when item is delivered</div>
                    </div>
                    <div className="text-xl sm:text-2xl flex-shrink-0">💵</div>
                  </label>
                </div>
              </div>

            </div>

            {/* Sidebar Summary & Pay Actions */}
            <div className="lg:col-span-4">
              <div className="bg-white rounded-3xl border border-gray-100 shadow-soft p-6 md:p-8 sticky top-28 space-y-6">
                <h2 className="text-base font-black text-dark uppercase tracking-wider mb-2 flex items-center gap-2">
                  <i className="fas fa-shopping-basket text-primary text-sm" />
                  Your Order Details
                </h2>

                {/* Items preview list */}
                <div className="space-y-4 max-h-56 overflow-y-auto pr-1 border-b border-gray-100 pb-5">
                  {cart.map((item, index) => {
                    const isRent = item.type === 'rent';
                    const itemTotal = isRent
                      ? (item.price * (item.rentalDays || 1)) + (item.securityDeposit || 0)
                      : item.price;

                    return (
                      <div key={index} className="flex gap-3 pb-2 border-b border-gray-50 last:border-b-0 last:pb-0">
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0 border border-gray-100">
                          <Image src={item.image || '/photo/placeholder.svg'} alt={item.name} fill className="object-cover" sizes="48px" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-extrabold text-xs text-dark truncate leading-tight">{item.name}</div>
                          {isRent && item.startDate && (
                            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">
                              {item.rentalDays} Days • +₹{item.securityDeposit} dep.
                            </p>
                          )}
                          <div className="text-xs font-black text-primary mt-1">₹{itemTotal.toLocaleString('en-IN')}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Costs details summary */}
                <div className="space-y-3.5 text-xs font-bold border-b border-gray-100 pb-5">
                  <div className="flex justify-between items-center text-gray-400 uppercase tracking-wider">
                    <span>Base Subtotal</span>
                    <span className="text-dark">
                      ₹{cart.reduce((s: number, i: any) => s + (i.type === 'rent' ? i.price * (i.rentalDays || 1) : i.price), 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                  {cart.some((i: any) => i.type === 'rent') && (
                    <div className="flex justify-between items-center text-gray-400 uppercase tracking-wider">
                      <span>Deposits</span>
                      <span className="text-amber-600">
                        + ₹{cart.reduce((s: number, i: any) => s + (i.securityDeposit || 0), 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-gray-400 uppercase tracking-wider">
                    <span>Delivery Charge</span>
                    <span className="text-emerald-500 font-black">FREE</span>
                  </div>
                  <div className="border-t border-gray-100 pt-3.5 flex justify-between items-center text-sm font-black uppercase tracking-wider">
                    <span className="text-dark">Total</span>
                    <span className="text-xl text-primary leading-none">₹{total.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Payment checkout buttons */}
                {failedOrderId ? (
                  <div className="space-y-3">
                    <div className="bg-red-50 border border-red-100 rounded-2xl p-3.5 text-center">
                      <p className="text-red-700 font-extrabold text-[10px] uppercase tracking-wider">Transaction was not processed</p>
                    </div>
                    <button
                      onClick={handleRetryPayment}
                      disabled={loading}
                      className="w-full btn-primary !py-3.5 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2"
                    >
                      <i className="fas fa-redo-alt" />
                      Retry Payment
                    </button>
                    <button
                      onClick={() => setFailedOrderId(null)}
                      className="w-full btn-outline !py-3 text-xs font-black uppercase tracking-wider"
                    >
                      Place New Order
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handlePlaceOrder}
                    disabled={loading}
                    className="w-full btn-primary !py-3.5 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-lock text-[10px] opacity-80" />
                        {paymentMethod === 'razorpay' ? 'Secure Payment' : 'Confirm Order (COD)'}
                      </>
                    )}
                  </button>
                )}

                <div className="text-[10px] text-gray-400 text-center font-semibold uppercase tracking-wider">
                  🔒 Payments are encrypted and secure
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
