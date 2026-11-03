import ProductGrid from '@/components/ProductGrid';
import connectDB from '@/lib/db';
import Product from '@/models/Product';

export const dynamic = 'force-dynamic';

async function getFurniture() {
  await connectDB();
  const products = await Product.find({ category: 'furniture' }).sort({ createdAt: -1 }).lean();
  const serializedProducts = products.map((p: any) => ({
    ...p,
    _id: p._id.toString(),
    ownerId: p.ownerId ? p.ownerId.toString() : undefined,
    createdAt: p.createdAt ? p.createdAt.toISOString() : undefined,
    updatedAt: p.updatedAt ? p.updatedAt.toISOString() : undefined,
  }));
  return { products: serializedProducts };
}

export default async function FurniturePage() {
  const { products } = await getFurniture();

  return (
    <div className="bg-surface min-h-screen">
      {/* Page header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-rose-500 via-pink-500 to-fuchsia-600 text-white py-16 md:py-20">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-[30rem] h-[30rem] bg-white/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-pink-300/10 rounded-full blur-2xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md mb-2 shadow-inner border border-white/10">
            <i className="fas fa-couch text-2xl" />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-none">Furniture</h1>
          <p className="text-pink-100/80 text-xs sm:text-sm font-bold uppercase tracking-widest max-w-md mx-auto">Quality furniture for your home and office</p>
        </div>

        {/* Curved Divider */}
        <div className="absolute bottom-0 left-0 right-0 leading-none">
          <svg viewBox="0 0 1440 30" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
            <path d="M0 30H1440V15C1320 28 1140 30 960 25C780 20 600 0 420 5C240 10 120 25 0 28V30Z" fill="#F8FAFC" />
          </svg>
        </div>
      </div>

      {/* Products list area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h2 className="section-title text-xl sm:text-2xl font-black text-dark">Furniture Products</h2>
            <p className="text-xs sm:text-sm font-semibold text-gray-400 uppercase tracking-wider mt-1">Rent or buy premium furniture pieces and office decorations</p>
          </div>
          <span className="text-[10px] sm:text-xs font-black text-rose-500 bg-rose-50/80 border border-rose-200/25 px-3 py-1.5 rounded-xl uppercase tracking-wider">
            {products?.length || 0} Items Found
          </span>
        </div>
        <ProductGrid products={products} />
      </div>
    </div>
  );
}
