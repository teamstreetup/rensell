import Image from 'next/image';
import Link from 'next/link';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Product from '@/models/Product';
import mongoose from 'mongoose';

async function getVendorData(id: string) {
  await connectDB();
  
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return null;
  }

  const user = await User.findById(id).select('name bio profileImage isVerified createdAt').lean();
  if (!user) return null;

  const products = await Product.find({ ownerId: id }).sort({ createdAt: -1 }).lean();

  return { 
    user: JSON.parse(JSON.stringify(user)), 
    products: JSON.parse(JSON.stringify(products)) 
  };
}

export default async function PublicVendorProfile({ params }: { params: { id: string } }) {
  const data = await getVendorData(params.id);

  if (!data) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-user-slash text-4xl text-gray-300 mb-4" />
          <h1 className="text-2xl font-bold">User Not Found</h1>
          <p className="text-gray-500 mt-2">This profile may have been removed or does not exist.</p>
          <Link href="/" className="btn-primary mt-6 inline-block">Return to Home</Link>
        </div>
      </div>
    );
  }

  const { user, products } = data;
  const rentals = products.filter((p: any) => p.type === 'rent');
  const sales = products.filter((p: any) => p.type === 'sale');

  return (
    <div className="min-h-screen bg-surface">
      {/* Hero Banner */}
      <div className="h-48 w-full bg-gradient-to-r from-primary/80 to-accent/80 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/20" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* Profile Card Overlay */}
        <div className="relative -mt-20 mb-12">
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-gray-100 flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gray-50 flex-shrink-0">
              {user.profileImage ? (
                <Image src={user.profileImage} alt={user.name} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <i className="fas fa-user text-4xl text-gray-400" />
                </div>
              )}
              {user.isVerified && (
                <div className="absolute bottom-1 right-1 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <i className="fas fa-check-circle text-green-500 text-xl" title="Verified Member" />
                </div>
              )}
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold text-dark flex flex-col sm:flex-row items-center md:items-start gap-2 justify-center md:justify-start">
                {user.name}
                {user.isVerified && (
                  <span className="text-[10px] bg-green-100 text-green-700 px-2.5 py-1 rounded-full uppercase tracking-wider font-bold">
                    ID Verified
                  </span>
                )}
              </h1>
              <p className="text-gray-400 text-sm mt-1 mb-4 flex items-center justify-center md:justify-start gap-2">
                <i className="fas fa-calendar-alt" />
                Member since {new Date(user.createdAt).getFullYear()}
              </p>
              
              <div className="bg-gray-50 p-4 rounded-xl inline-block text-left w-full max-w-xl">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">About the seller</h4>
                <p className="text-gray-700 text-sm leading-relaxed">
                  {user.bio || "This user hasn't added a bio yet."}
                </p>
              </div>
            </div>

            <div className="flex flex-row md:flex-col gap-4 text-center">
              <div className="bg-primary/5 px-6 py-4 rounded-2xl border border-primary/10">
                <div className="text-2xl font-black text-primary">{products.length}</div>
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Active Items</div>
              </div>
            </div>
          </div>
        </div>

        {/* Listings Section */}
        <div className="space-y-12">
          {products.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200">
              <i className="fas fa-store-slash text-4xl text-gray-300 mb-3" />
              <p className="text-gray-500 font-medium">This user has no active listings.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product: any) => (
                <Link
                  key={product._id}
                  href={`/products/${product._id}`}
                  className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-soft hover:shadow-card transition-all duration-300 hover:-translate-y-1 flex flex-col"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-50">
                    <Image
                      src={product.image || '/photo/placeholder.svg'}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2 right-2 flex gap-1">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider text-white shadow-sm backdrop-blur-md ${
                        product.type === 'rent' ? 'bg-secondary/90' : 'bg-primary/90'
                      }`}>
                        {product.type === 'rent' ? 'For Rent' : 'For Sale'}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="text-sm font-semibold text-dark mb-1 line-clamp-2 group-hover:text-primary transition-colors">
                      {product.name}
                    </h3>
                    
                    <div className="mt-auto pt-3">
                      <div className="flex items-center gap-1.5 mb-1 text-[10px]">
                        <span className="text-accent">{'⭐'.repeat(Math.round(product.rating || 0))}</span>
                        <span className="text-gray-400">({product.rating || 'New'})</span>
                      </div>
                      
                      <div className="flex items-end justify-between">
                        <div>
                          <span className="text-lg font-black text-dark">
                            ₹{product.price.toLocaleString('en-IN')}
                          </span>
                          {product.type === 'rent' && (
                            <span className="text-xs text-gray-500 font-medium tracking-wide">/day</span>
                          )}
                        </div>
                        {product.originalPrice > product.price && (
                          <span className="text-xs text-success font-bold bg-success/10 px-1.5 py-0.5 rounded">
                            {product.discount}% OFF
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
