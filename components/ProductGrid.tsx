'use client';

import ProductCard from './ProductCard';

export interface Product {
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

export default function ProductGrid({ products }: { products: Product[] }) {
  if (!products || products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
        <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <i className="fas fa-box-open text-3xl text-gray-300" />
        </div>
        <p className="text-gray-500 font-medium">No products found</p>
        <p className="text-sm text-gray-400 mt-1">Check back later for new arrivals!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6">
      {products.map((product, index) => (
        <div
          key={product._id}
          className="animate-fade-in-up"
          style={{ animationDelay: `${index * 0.05}s`, animationFillMode: 'both' }}
        >
          <ProductCard product={product} />
        </div>
      ))}
    </div>
  );
}
