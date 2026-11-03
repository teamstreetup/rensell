'use client';

import { useState, useEffect } from 'react';
import { useToast } from './ToastProvider';

export default function AddToCartButton({ product }: { product: any }) {
  const { showToast } = useToast();
  
  // Rental specific state
  const isRental = product.type === 'rent';
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [rentalDays, setRentalDays] = useState(0);

  const securityDeposit = isRental ? Math.round((product.originalPrice || 0) * 0.20) : 0;

  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setRentalDays(diffDays > 0 ? diffDays : 1);
    } else {
      setRentalDays(0);
    }
  }, [startDate, endDate]);

  const addToCart = () => {
    if (isRental) {
      if (!startDate || !endDate) {
        showToast('Please select rental dates', 'error');
        return;
      }
      
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (start >= end) {
        showToast('End date must be after start date', 'error');
        return;
      }
      
      if (start < new Date(new Date().setHours(0,0,0,0))) {
        showToast('Start date cannot be in the past', 'error');
        return;
      }
    }

    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    cart.push({
      _id: product._id,
      name: product.name,
      price: product.price, // daily rate or full price
      image: product.image,
      type: product.type,
      ...(isRental && {
        startDate,
        endDate,
        rentalDays,
        securityDeposit
      })
    });
    
    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('cart-updated'));
    showToast(`${product.name} added to cart!`, 'success');
  };

  const buyNow = () => {
    if (isRental && (!startDate || !endDate)) {
      showToast('Please select rental dates first', 'error');
      return;
    }
    
    if (isRental) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (start >= end) {
          showToast('End date must be after start date', 'error');
          return;
        }
    }

    addToCart();
    window.location.href = '/cart';
  };

  // Get tomorrow's date for standard minimum start
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minStartDate = tomorrow.toISOString().split('T')[0];
  
  // Calculate min end date based on selected start date
  const minEndDate = startDate 
    ? new Date(new Date(startDate).setDate(new Date(startDate).getDate() + 1)).toISOString().split('T')[0]
    : minStartDate;

  return (
    <div className="space-y-5">
      {isRental && (
        <div className="bg-gray-50 border border-secondary/20 rounded-xl p-4 shadow-inner">
          <h3 className="font-bold text-dark mb-3 flex items-center gap-2">
            <i className="fas fa-calendar-alt text-secondary" /> 
            Select Rental Period
          </h3>
          
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Start Date</label>
              <input 
                type="date" 
                min={minStartDate}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="input !py-2 !text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">End Date</label>
              <input 
                type="date" 
                min={minEndDate}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="input !py-2 !text-sm"
                disabled={!startDate}
              />
            </div>
          </div>

          {rentalDays > 0 && (
            <div className="bg-white rounded-lg p-3 border border-gray-100 text-sm space-y-1.5 animate-fade-in-up">
              <div className="flex justify-between text-gray-600">
                <span>Daily Rate × {rentalDays} days</span>
                <span className="font-medium">₹{(product.price * rentalDays).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span className="flex items-center gap-1">
                  Security Deposit 
                  <i className="fas fa-info-circle text-[10px] text-gray-400 cursor-help" title="Fully refundable upon safe return" />
                </span>
                <span className="font-medium text-amber-600">₹{securityDeposit.toLocaleString('en-IN')}</span>
              </div>
              <div className="border-t border-gray-100 pt-1.5 mt-1.5 flex justify-between font-bold">
                <span className="text-dark">Upfront Total</span>
                <span className="text-primary text-lg">₹{((product.price * rentalDays) + securityDeposit).toLocaleString('en-IN')}</span>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={addToCart}
          className="flex-1 btn bg-amber-500 text-white hover:bg-amber-600 hover:shadow-lg active:scale-[0.98] !rounded-xl font-bold"
        >
          <i className="fas fa-cart-plus" />
          {isRental ? 'ADD TO CART' : 'ADD TO CART'}
        </button>
        <button
          onClick={buyNow}
          className="flex-1 btn-primary !rounded-xl font-bold"
        >
          <i className="fas fa-bolt" />
          {isRental ? 'RENT NOW' : 'BUY NOW'}
        </button>
      </div>
    </div>
  );
}
