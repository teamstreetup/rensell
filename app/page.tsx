import ProductGrid, { Product as ProductType } from '@/components/ProductGrid';
import Hero from '@/components/Hero';
import connectDB from '@/lib/db';
import Product from '@/models/Product';

export const dynamic = 'force-dynamic';

export default async function Home() {
  let serializedProducts: ProductType[] = [];
  let databaseUnavailable = false;

  try {
    await connectDB();
    const products = await Product.find({}).lean() as any[];
    serializedProducts = products.map((p) => ({
      ...p,
      _id: p._id.toString(),
    })) as ProductType[];
  } catch (error) {
    databaseUnavailable = true;
    console.error('Failed to load featured products:', error);
  }

  return (
    <>
      <Hero />

      {/* Featured Products */}
      <section className="py-12 md:py-16 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="section-title">Featured Products</h2>
            <p className="section-subtitle mx-auto">
              Handpicked products at unbeatable prices — rent or own today.
            </p>
          </div>
          {databaseUnavailable ? (
            <p className="text-center text-gray-500" role="status">
              Products are temporarily unavailable. Please try again later.
            </p>
          ) : (
            <ProductGrid products={serializedProducts} />
          )}
        </div>
      </section>
    </>
  );
}
