'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useToast } from './ToastProvider';

interface Product {
  _id: string;
  name: string;
  price: number;
  originalPrice: number;
  type: string;
  category: string;
  description: string;
  image: string;
  rating: number;
  discount: number;
}

export default function ProductCard({ product }: { product: Product }) {
  const [imageSrc, setImageSrc] = useState(product.image?.trim() || '/photo/placeholder.svg');
  const fallbackImage = '/photo/placeholder.svg';
  const { showToast } = useToast();

  const addToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation when clicking button inside the Link structure
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    cart.push({
      _id: product._id,
      name: product.name,
      price: product.price,
      image: product.image,
      type: product.type,
    });
    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('cart-updated'));
    showToast(`${product.name} added to cart!`, 'success');
  };

  const badgeClass = product.type === 'rent' ? 'badge-rent' : 'badge-sale';
  const badgeText = product.type === 'rent' ? 'Rent' : 'Buy';
  const priceLabel = product.type === 'rent' ? '/day' : '';

  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-card card-hover border border-gray-100 flex flex-col h-full">
      {/* Image Area */}
      <Link href={`/products/${product._id}`} className="relative w-full aspect-[4/3] overflow-hidden bg-gray-50 flex-shrink-0 block">
        <Image
          src={imageSrc}
          alt={product.name}
          fill
          className="object-cover img-zoom"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          onError={() => setImageSrc(fallbackImage)}
        />
        {/* Subtle overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-dark/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Rent/Sale Badge */}
        <div className="absolute top-3.5 left-3.5 z-10">
          <span className={`${badgeClass} shadow-sm px-2.5 py-1 text-[9px] uppercase font-black rounded-lg`}>
            {badgeText}
          </span>
        </div>

        {/* Discount Badge */}
        {product.discount > 0 && (
          <div className="absolute top-3.5 right-3.5 z-10">
            <span className="bg-emerald-500 text-white text-[9px] font-black px-2.5 py-1 rounded-lg shadow-sm">
              {product.discount}% OFF
            </span>
          </div>
        )}
      </Link>

      {/* Content Area */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between">
        <div>
          {/* Rating */}
          <div className="flex items-center gap-1 mb-2">
            <div className="flex items-center text-amber-400">
              {[...Array(5)].map((_, i) => (
                <i
                  key={i}
                  className={`fas fa-star text-[9px] ${
                    i < Math.round(product.rating) ? 'text-amber-400' : 'text-gray-200'
                  }`}
                />
              ))}
            </div>
            <span className="text-[10px] text-gray-400 font-bold ml-1">{product.rating.toFixed(1)}</span>
          </div>

          {/* Title */}
          <Link href={`/products/${product._id}`}>
            <h3 className="font-extrabold text-dark text-sm sm:text-base leading-tight mb-2 line-clamp-2 hover:text-primary transition-colors cursor-pointer">
              {product.name}
            </h3>
          </Link>
        </div>

        <div>
          {/* Price Layout */}
          <div className="flex items-baseline gap-1.5 mb-4 mt-2">
            <span className="text-lg font-black text-dark">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
            {priceLabel && (
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{priceLabel}</span>
            )}
            {product.originalPrice > product.price && (
              <span className="text-xs text-gray-400 line-through ml-auto">
                ₹{product.originalPrice.toLocaleString('en-IN')}
              </span>
            )}
          </div>

          {/* Add to Cart button */}
          <button
            onClick={addToCart}
            className="w-full btn-outline !py-2.5 !px-4 !text-xs uppercase tracking-wider font-extrabold flex items-center justify-center gap-2"
          >
            <i className="fas fa-shopping-basket text-[11px]" />
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
