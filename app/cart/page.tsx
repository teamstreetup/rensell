'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const [cart, setCart] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const router = useRouter();

  useEffect(() => {
    loadCart();

    const handleStorageChange = () => loadCart();
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('cart-updated', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('cart-updated', handleStorageChange);
    };
  }, []);

  const loadCart = () => {
    const cartData = JSON.parse(localStorage.getItem('cart') || '[]');
    setCart(cartData);
    
    const totalAmount = cartData.reduce((sum: number, item: any) => {
      if (item.type === 'rent') {
        const itemTotal = (item.price * (item.rentalDays || 1)) + (item.securityDeposit || 0);
        return sum + itemTotal;
      }
      return sum + item.price;
    }, 0);
    
    setTotal(totalAmount);
  };

  const removeItem = (index: number) => {
    const newCart = cart.filter((_, i) => i !== index);
    localStorage.setItem('cart', JSON.stringify(newCart));
    setCart(newCart);
    loadCart();
    window.dispatchEvent(new CustomEvent('cart-updated'));
  };

  const checkout = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login');
      return;
    }
    router.push('/checkout');
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-[60vh] bg-surface flex items-center justify-center px-4">
        <div className="text-center animate-fade-in-up space-y-6">
          <div className="w-24 h-24 rounded-full bg-white border border-gray-100 flex items-center justify-center mx-auto shadow-soft">
            <i className="fas fa-shopping-basket text-3xl text-gray-300" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-dark">Your cart is empty</h2>
            <p className="text-sm text-gray-400 max-w-xs mx-auto">
              Browse products to rent or buy and checkout safely with secure payments.
            </p>
          </div>
          <Link href="/" className="block">
            <button className="btn-primary !px-8 uppercase tracking-wider text-xs">
              <i className="fas fa-arrow-left text-xs mr-2" />
              Continue Shopping
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface min-h-screen py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page title header */}
        <div className="flex items-center gap-3.5 mb-8 border-b border-gray-100 pb-5">
          <div className="w-11 h-11 rounded-xl bg-primary-soft text-primary flex items-center justify-center border border-primary/10">
            <i className="fas fa-shopping-basket text-base" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-dark tracking-tight">Shopping Cart</h1>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-0.5">{cart.length} item{cart.length > 1 ? 's' : ''} inside your cart</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* Cart items list */}
          <div className="lg:col-span-8 space-y-4">
            {cart.map((item, index) => {
              const isRent = item.type === 'rent';
              const itemTotal = isRent 
                ? (item.price * (item.rentalDays || 1)) + (item.securityDeposit || 0)
                : item.price;

              return (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row gap-5 p-5 bg-white rounded-2xl border border-gray-100 shadow-soft hover:shadow-card transition-all duration-300 animate-fade-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex gap-4 flex-1 min-w-0">
                    {/* Thumbnail image */}
                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0 border border-gray-100">
                      <Image
                        src={item.image || '/photo/placeholder.svg'}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="96px"
                      />
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                      <div>
                        <h3 className="font-extrabold text-dark text-sm sm:text-base leading-snug truncate" title={item.name}>{item.name}</h3>
                        
                        {/* Mode badge tag */}
                        <div className="mt-2">
                          <span className={`px-2.5 py-1 text-[9px] font-black uppercase rounded-md tracking-wider border ${
                            isRent ? 'badge-rent' : 'badge-sale'
                          }`}>
                            {isRent ? 'Rent' : 'Buy'}
                          </span>
                        </div>

                        {/* Rental specific period information details */}
                        {isRent && item.startDate && (
                          <div className="mt-3 text-[11px] font-bold text-gray-500 bg-gray-50 p-2.5 rounded-xl border border-gray-100 flex items-center gap-2 w-fit">
                            <i className="far fa-calendar-alt text-secondary-light" />
                            <span>{formatDate(item.startDate)} - {formatDate(item.endDate)}</span>
                            <span className="w-1.5 h-1.5 bg-gray-300 rounded-full" />
                            <span className="text-secondary-light">{item.rentalDays} Days</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Pricing and Action side layout */}
                  <div className="flex sm:flex-col justify-between items-end sm:border-l sm:border-gray-100 sm:pl-5 sm:w-36 flex-shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-50">
                    <div className="text-right">
                      <div className="font-black text-lg text-dark">
                        ₹{itemTotal.toLocaleString('en-IN')}
                      </div>
                      {isRent && (
                        <div className="text-[10px] text-gray-400 font-semibold mt-0.5">
                          Incl. ₹{item.securityDeposit?.toLocaleString('en-IN')} deposit
                        </div>
                      )}
                    </div>
                    
                    <button
                      onClick={() => removeItem(index)}
                      className="text-gray-400 hover:text-red-500 text-xs font-bold uppercase tracking-wider transition-colors inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-red-50 active:scale-95"
                    >
                      <i className="fas fa-trash text-[10px]" />
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Receipt invoice summary */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-soft p-6 md:p-8 sticky top-28 space-y-6">
              <h2 className="text-lg font-black text-dark flex items-center gap-2">
                <i className="fas fa-receipt text-primary text-sm" />
                Order Summary
              </h2>

              <div className="space-y-4 text-xs font-bold">
                <div className="flex justify-between items-center text-gray-400 uppercase tracking-wider">
                  <span>Subtotal ({cart.length} item{cart.length > 1 ? 's' : ''})</span>
                  <span className="text-dark">
                    ₹{cart.reduce((s: number, i: any) => s + (i.type === 'rent' ? i.price * (i.rentalDays || 1) : i.price), 0).toLocaleString('en-IN')}
                  </span>
                </div>
                
                {/* Security Deposit row */}
                {cart.some((i: any) => i.type === 'rent') && (
                  <div className="flex justify-between items-center text-gray-400 uppercase tracking-wider">
                    <span className="flex items-center gap-1.5">
                      Security Deposit
                      <div className="group relative cursor-pointer">
                        <i className="fas fa-info-circle text-[10px] text-gray-300" />
                        <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-dark text-white text-[9px] font-medium rounded-lg shadow-lg z-10 normal-case leading-snug">
                          Refundable deposits are paid back within 48 hours after safe return of rental item.
                        </div>
                      </div>
                    </span>
                    <span className="text-amber-600">
                      + ₹{cart.reduce((s: number, i: any) => s + (i.securityDeposit || 0), 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center text-gray-400 uppercase tracking-wider">
                  <span>Shipping & Delivery</span>
                  <span className="text-emerald-500 font-black">FREE</span>
                </div>
                
                <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
                  <span className="font-black text-dark text-sm uppercase tracking-wider">Total Amount</span>
                  <span className="font-black text-2xl text-primary leading-none">₹{total.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="space-y-3 pt-2">
                <button
                  onClick={checkout}
                  className="btn-primary w-full !py-3.5 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  <i className="fas fa-lock text-[10px] opacity-80" />
                  Secure Checkout
                </button>

                <Link href="/" className="block">
                  <button className="btn-outline w-full !py-3 text-xs font-black uppercase tracking-wider">
                    <i className="fas fa-arrow-left text-[10px] mr-1" />
                    Continue Shopping
                  </button>
                </Link>
              </div>
              
              {/* Payment systems trust labels */}
              <div className="border-t border-gray-100 pt-5 flex flex-col items-center gap-2">
                <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">Accepted Methods</p>
                <div className="flex justify-center gap-4 text-gray-400 text-lg">
                  <i className="fab fa-cc-visa hover:text-[#1A1F71] transition-colors cursor-pointer" title="Visa" />
                  <i className="fab fa-cc-mastercard hover:text-[#EB001B] transition-colors cursor-pointer" title="MasterCard" />
                  <i className="fab fa-cc-amex hover:text-[#002663] transition-colors cursor-pointer" title="Amex" />
                  <i className="fab fa-cc-paypal hover:text-[#00457C] transition-colors cursor-pointer" title="PayPal" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
