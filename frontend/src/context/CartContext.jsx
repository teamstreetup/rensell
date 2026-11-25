import { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  calculateRentalDays,
  calculateSecurityDeposit,
  getTomorrowDateStr,
  getNextDayStr,
} from '../utils/formatters';

export const CartContext = createContext(null);

function normalizeCartItem(raw) {
  const isRent = raw.type === 'rent';
  const quantity = Math.max(1, Number(raw.quantity || 1));
  if (isRent) {
    const startDate = raw.startDate || getTomorrowDateStr();
    const endDate = raw.endDate || getNextDayStr(startDate);
    const rentalDays = Number(raw.rentalDays) || calculateRentalDays(startDate, endDate) || 1;
    const originalPrice = Number(raw.originalPrice ?? 0);
    const securityDeposit =
      raw.securityDeposit !== undefined
        ? Number(raw.securityDeposit)
        : calculateSecurityDeposit(originalPrice);

    return {
      _id: raw._id,
      name: raw.name,
      price: Number(raw.price),
      originalPrice,
      image: raw.image,
      type: 'rent',
      category: raw.category,
      quantity,
      startDate,
      endDate,
      rentalDays,
      securityDeposit,
    };
  }

  return {
    _id: raw._id,
    name: raw.name,
    price: Number(raw.price),
    originalPrice: Number(raw.originalPrice ?? raw.price),
    image: raw.image,
    type: 'sale',
    category: raw.category,
    quantity,
  };
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('cart') || '[]');
      return Array.isArray(saved) ? saved.map(normalizeCartItem) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    const syncFromStorage = () => {
      try {
        const saved = JSON.parse(localStorage.getItem('cart') || '[]');
        setCart(Array.isArray(saved) ? saved.map(normalizeCartItem) : []);
      } catch {
        setCart([]);
      }
    };
    window.addEventListener('storage', syncFromStorage);
    return () => window.removeEventListener('storage', syncFromStorage);
  }, []);

  const addToCart = useCallback((product, rentalOptions = null) => {
    const isRent = product.type === 'rent';
    const startDate = rentalOptions?.startDate || getTomorrowDateStr();
    const endDate = rentalOptions?.endDate || getNextDayStr(startDate);
    const rentalDays =
      rentalOptions?.rentalDays || calculateRentalDays(startDate, endDate) || 1;
    const securityDeposit = isRent
      ? rentalOptions?.securityDeposit !== undefined
        ? Number(rentalOptions.securityDeposit)
        : calculateSecurityDeposit(product.originalPrice)
      : 0;

    setCart((prev) => {
      const matchIndex = prev.findIndex((item) => {
        if (item._id !== product._id) return false;
        if (!isRent) return true;
        return item.startDate === startDate && item.endDate === endDate;
      });

      if (matchIndex !== -1) {
        const next = [...prev];
        next[matchIndex] = {
          ...next[matchIndex],
          quantity: (next[matchIndex].quantity || 1) + 1,
        };
        return next;
      }

      const newItem = normalizeCartItem({
        _id: product._id,
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice,
        image: product.image,
        type: product.type,
        category: product.category,
        quantity: 1,
        ...(isRent && { startDate, endDate, rentalDays, securityDeposit }),
      });

      return [...prev, newItem];
    });
  }, []);

  const updateQuantity = useCallback((index, newQuantity) => {
    const qty = Math.max(1, Number(newQuantity) || 1);
    setCart((prev) =>
      prev.map((item, i) => (i === index ? { ...item, quantity: qty } : item))
    );
  }, []);

  const updateRentalDates = useCallback((index, startDate, endDate) => {
    const days = calculateRentalDays(startDate, endDate);
    if (days < 1) return false;
    setCart((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, startDate, endDate, rentalDays: days } : item
      )
    );
    return true;
  }, []);

  const removeFromCart = useCallback((index) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    localStorage.removeItem('cart');
  }, []);

  const totals = useMemo(() => {
    let cartCount = 0;
    let baseSubtotal = 0;
    let totalDeposits = 0;

    for (const item of cart) {
      const qty = Number(item.quantity || 1);
      cartCount += qty;
      if (item.type === 'rent') {
        const days = Number(item.rentalDays || 1);
        baseSubtotal += Number(item.price) * days * qty;
        totalDeposits += Number(item.securityDeposit || 0) * qty;
      } else {
        baseSubtotal += Number(item.price) * qty;
      }
    }

    const totalAmount = Math.round((baseSubtotal + totalDeposits) * 100) / 100;

    return { cartCount, baseSubtotal, totalDeposits, totalAmount };
  }, [cart]);

  return (
    <CartContext.Provider
      value={{
        cart,
        ...totals,
        addToCart,
        updateQuantity,
        updateRentalDates,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
