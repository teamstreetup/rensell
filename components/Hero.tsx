'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-dark-deep via-[#0d1629] to-secondary-dark py-16 sm:py-20 lg:py-24">
      {/* Decorative background grids and blur blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[45rem] h-[45rem] bg-primary-soft rounded-full blur-3xl animate-pulse-soft opacity-30" />
        <div className="absolute bottom-0 left-0 w-[35rem] h-[35rem] bg-secondary-soft rounded-full blur-3xl opacity-20" />
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Text Content */}
          <div className="lg:col-span-7 text-center lg:text-left space-y-6 sm:space-y-8">
            {/* Trust badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/80 text-xs font-semibold uppercase tracking-wider animate-fade-in mx-auto lg:mx-0">
              <span className="w-2 h-2 bg-success rounded-full animate-ping" />
              Trusted Full-Stack Platform
            </div>

            {/* Main heading */}
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.1] tracking-tight animate-fade-in-up">
              Rent what you need,
              <br />
              <span className="text-gradient">Buy what you love</span>
            </h2>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-gray-400 max-w-xl mx-auto lg:mx-0 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
              Your ultimate marketplace for top-tier rentals and quality purchases. Access premium items at unmatched daily rates or buy permanently.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <Link href="/rent">
                <button className="btn bg-white text-dark hover:bg-gray-100 hover:shadow-xl active:scale-[0.98] shadow-lg px-8 py-3.5 text-xs font-extrabold uppercase tracking-wider !rounded-xl w-full sm:w-auto">
                  <i className="fas fa-clock text-secondary mr-2" />
                  Browse Rentals
                </button>
              </Link>
              <Link href="/sell">
                <button className="btn bg-primary text-white hover:bg-primary-dark hover:shadow-glow-primary active:scale-[0.98] shadow-lg px-8 py-3.5 text-xs font-extrabold uppercase tracking-wider !rounded-xl w-full sm:w-auto">
                  <i className="fas fa-shopping-bag mr-2" />
                  Shop Products
                </button>
              </Link>
            </div>

            {/* Stats list */}
            <div className="grid grid-cols-3 gap-4 sm:gap-8 max-w-md mx-auto lg:mx-0 pt-6 border-t border-white/5 animate-fade-in-up" style={{ animationDelay: '0.45s' }}>
              {[
                { value: '1,200+', label: 'Listings', icon: 'fa-box-open' },
                { value: '4.9/5.0', label: 'Satisfaction', icon: 'fa-star' },
                { value: '48h', label: 'Return Guarantee', icon: 'fa-undo-alt' },
              ].map((stat) => (
                <div key={stat.label} className="group">
                  <div className="flex items-center gap-2 mb-1 justify-center lg:justify-start">
                    <i className={`fas ${stat.icon} text-primary text-xs opacity-80`} />
                    <span className="text-lg sm:text-xl font-black text-white">{stat.value}</span>
                  </div>
                  <p className="text-[10px] sm:text-xs text-gray-400 font-bold uppercase tracking-wider">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Visual Floating Graphic */}
          <div className="hidden lg:block lg:col-span-5 relative h-[420px] w-full animate-float">
            {/* Glowing background halo */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-primary/20 rounded-full blur-[80px]" />
            
            {/* Main Mockup Card */}
            <div className="absolute top-6 left-12 w-80 glass-dark rounded-2xl p-4 border border-white/10 shadow-2xl relative z-10 transition-all duration-500 hover:border-primary/30">
              <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden mb-4 bg-gray-900 border border-white/5">
                <Image
                  src="/photo/chair .webp"
                  alt="Premium Chair Mockup"
                  fill
                  className="object-cover"
                  sizes="320px"
                />
                <div className="absolute top-2 left-2">
                  <span className="badge bg-primary-soft text-primary-light text-[9px] font-black border border-primary/20">HOT DEAL</span>
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="font-extrabold text-white text-sm">Nordic Ergonomic Lounge Chair</h3>
                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Furniture • Mint Condition</p>
                <div className="flex items-center justify-between pt-3 border-t border-white/5 mt-3">
                  <div>
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Daily Rental</p>
                    <p className="text-base font-black text-white">₹499<span className="text-xs font-normal text-gray-400">/day</span></p>
                  </div>
                  <button className="btn bg-primary text-white text-[10px] font-black px-4 py-2 !rounded-lg hover:bg-primary-dark">
                    RENT NOW
                  </button>
                </div>
              </div>
            </div>

            {/* Smaller secondary decorative stats card */}
            <div className="absolute bottom-10 -right-4 w-48 glass rounded-xl p-3.5 border border-white/20 shadow-xl z-20 animate-pulse-soft">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                  <i className="fas fa-shield-alt text-sm" />
                </div>
                <div>
                  <p className="text-xs font-black text-dark">Verified Vendor</p>
                  <p className="text-[9px] text-gray-500 font-bold uppercase">100% Secure Transaction</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Wave Path SVG Divider */}
      <div className="absolute bottom-0 left-0 right-0 leading-none z-10">
        <svg viewBox="0 0 1440 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
          <path d="M0 40H1440V15C1320 30 1140 32 960 25C780 18 600 -2 420 5C240 12 120 28 0 35V40Z" fill="#F8FAFC" />
        </svg>
      </div>
    </section>
  );
}
