import Image from 'next/image';
import Link from 'next/link';
import AddToCartButton from '@/components/AddToCartButton';
import ReviewSection from '@/components/ReviewSection';
import connectDB from '@/lib/db';
import Product from '@/models/Product';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

async function getProduct(id: string) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error('Product not found');
  }

  await connectDB();
  const product = (await Product.findById(id).lean()) as any;
  if (!product) {
    throw new Error('Product not found');
  }

  const productData: any = {
    ...product,
    _id: product._id.toString(),
    ownerId: product.ownerId ? product.ownerId.toString() : undefined,
    createdAt: product.createdAt ? product.createdAt.toISOString() : undefined,
    updatedAt: product.updatedAt ? product.updatedAt.toISOString() : undefined,
  };

  if (productData.ownerId) {
    const { default: UserModel } = await import('@/models/User');
    const owner = await UserModel.findById(productData.ownerId).select('name profileImage isVerified').lean() as any;
    if (owner) {
      productData.owner = {
        ...owner,
        _id: owner._id.toString(),
      };
    }
  }

  return { product: productData };
}

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  const { product } = await getProduct(params.id);
  const imageSrc = product.image?.trim() || '/photo/placeholder.svg';

  return (
    <div className="bg-surface min-h-screen py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Elegant Breadcrumbs */}
        <div className="flex items-center flex-wrap gap-2 text-xs font-bold uppercase tracking-wider text-gray-400 mb-6 sm:mb-8">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <span className="text-[10px] text-gray-300">/</span>
          <Link href={`/${product.category}`} className="hover:text-primary transition-colors">{product.category}</Link>
          <span className="text-[10px] text-gray-300">/</span>
          <span className="text-gray-600 truncate max-w-[200px]">{product.name}</span>
        </div>

        {/* Main Details Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 bg-white rounded-3xl border border-gray-100 shadow-soft p-5 sm:p-8 md:p-10">
          
          {/* Left Column: Product Image (Fixed Ratio Frame) */}
          <div className="lg:col-span-6 flex flex-col justify-start">
            <div className="relative w-full aspect-[4/3] sm:aspect-[1.1] rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 shadow-sm">
              <Image
                src={imageSrc}
                alt={product.name}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 500px"
              />
              <div className="absolute top-4 left-4 z-10">
                <span className={`shadow-md px-3.5 py-1.5 text-[10px] font-black uppercase rounded-xl ${
                  product.type === 'rent' ? 'badge-rent bg-white/95' : 'badge-sale bg-white/95'
                }`}>
                  {product.type === 'rent' ? 'For Rent' : 'For Sale'}
                </span>
              </div>
              {product.discount > 0 && (
                <div className="absolute top-4 right-4 z-10">
                  <span className="bg-emerald-500 text-white text-[10px] font-black px-3 py-1.5 rounded-xl shadow-md uppercase tracking-wider">
                    {product.discount}% OFF
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Information & Actions */}
          <div className="lg:col-span-6 flex flex-col justify-between">
            <div className="space-y-5 sm:space-y-6">
              
              {/* Product title */}
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-dark leading-tight tracking-tight">
                {product.name}
              </h1>

              {/* Stars & Rating Summary */}
              <div className="flex items-center gap-2 border-b border-gray-100 pb-4">
                <div className="flex text-amber-400 gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <i
                      key={i}
                      className={`fas fa-star text-sm ${
                        i < Math.floor(product.rating) ? 'text-amber-400' : 'text-gray-200'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs font-bold text-gray-700 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">
                  {product.rating.toFixed(1)} / 5.0
                </span>
              </div>

              {/* Price Tag container */}
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-3xl sm:text-4xl font-black text-dark">
                  ₹{product.price.toLocaleString('en-IN')}
                  {product.type === 'rent' && <span className="text-sm font-bold text-gray-400 uppercase tracking-widest ml-1">/day</span>}
                </span>
                {product.originalPrice > product.price && (
                  <>
                    <span className="text-lg text-gray-400 line-through">
                      ₹{product.originalPrice.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs font-extrabold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md uppercase tracking-wider">
                      Save ₹{(product.originalPrice - product.price).toLocaleString('en-IN')}
                    </span>
                  </>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider">Product Description</h3>
                <p className="text-sm text-gray-600 leading-relaxed font-medium">
                  {product.description}
                </p>
              </div>

              {/* Specs Grid */}
              <div className="p-4 sm:p-5 bg-gray-50/50 border border-gray-100 rounded-2xl space-y-3">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-2">Specifications</h3>
                <div className="grid grid-cols-2 gap-4 text-xs font-bold">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-gray-400 font-medium uppercase tracking-wider text-[10px]">Category</span>
                    <span className="text-dark uppercase tracking-wider">{product.category}</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-gray-400 font-medium uppercase tracking-wider text-[10px]">Listing Mode</span>
                    <span className="text-dark uppercase tracking-wider">{product.type === 'rent' ? 'Rental Option' : 'Permanent Purchase'}</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-gray-400 font-medium uppercase tracking-wider text-[10px]">Stock Status</span>
                    <span className="text-emerald-600 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                      In Stock
                    </span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-gray-400 font-medium uppercase tracking-wider text-[10px]">Secure Escrow</span>
                    <span className="text-secondary-light uppercase tracking-wider">Yes (Verified)</span>
                  </div>
                </div>
              </div>

            </div>

            {/* CTA Buy/Rent actions component */}
            <div className="mt-8 border-t border-gray-100 pt-6">
              <AddToCartButton product={product} />
            </div>

            {/* Listing Vendor Card */}
            {product.owner && (
              <div className="mt-8 pt-6 border-t border-gray-100">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-3">Listed By</h3>
                <div className="flex justify-between items-center bg-gray-50 border border-gray-100 p-4 rounded-2xl hover:border-primary/20 transition-all duration-300 group">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="relative w-11 h-11 rounded-full overflow-hidden bg-white shadow-sm border border-gray-200 flex-shrink-0 flex items-center justify-center">
                      {product.owner.profileImage ? (
                        <Image src={product.owner.profileImage} alt={product.owner.name} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm bg-gray-100">
                          <i className="fas fa-user" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-extrabold text-xs sm:text-sm text-dark flex items-center gap-1.5 truncate">
                        {product.owner.name}
                        {product.owner.isVerified && (
                          <i className="fas fa-check-circle text-emerald-500 text-xs" title="Verified vendor" />
                        )}
                      </h4>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">
                        Trusted RENSELL Vendor
                      </p>
                    </div>
                  </div>
                  <Link href={`/user/${product.ownerId}`} className="flex-shrink-0">
                    <button className="text-xs font-extrabold uppercase tracking-wider text-primary border border-primary/25 px-4 py-2.5 rounded-xl hover:bg-primary hover:text-white transition-all duration-300 shadow-sm active:scale-95">
                      Profile
                    </button>
                  </Link>
                </div>
              </div>
            )}

          </div>

        </div>

        {/* Dynamic Reviews Component */}
        <div className="mt-8">
          <ReviewSection productId={product._id} initialRating={product.rating} />
        </div>

      </div>
    </div>
  );
}
