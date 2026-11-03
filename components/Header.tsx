'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function Header() {
  const [cartCount, setCartCount] = useState(0);
  const [user, setUser] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateCartCount = () => {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      setCartCount(cart.length);
    };
    updateCartCount();

    window.addEventListener('storage', updateCartCount);
    window.addEventListener('cart-updated', updateCartCount);

    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('storage', updateCartCount);
      window.removeEventListener('cart-updated', updateCartCount);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Update user state whenever pathname changes (e.g. after login redirects)
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        // Fallback
      }
    } else {
      setUser(null);
    }
  }, [pathname]);

  // Close mobile menu and dropdown on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
  }, [pathname]);

  // Close mobile menu and profile dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMobileMenuOpen(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    router.push('/');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const navLinks = [
    { href: '/', label: 'Home', icon: 'fa-house' },
    { href: '/rent', label: 'Rent', icon: 'fa-clock' },
    { href: '/sell', label: 'Buy', icon: 'fa-shopping-bag' },
    { href: '/electronics', label: 'Electronics', icon: 'fa-microchip' },
    { href: '/furniture', label: 'Furniture', icon: 'fa-couch' },
  ];

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-all duration-500 ${scrolled
          ? 'glass-premium shadow-premium py-2'
          : 'bg-white/95 border-b border-gray-100 py-3 md:py-4'
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 md:h-16 gap-4">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 group">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-md group-hover:shadow-glow-primary transition-all duration-300 group-hover:scale-105">
                <span className="text-white font-black text-base">R</span>
              </div>
              <div>
                <h1 className="text-lg font-black tracking-wider text-dark leading-none group-hover:text-primary transition-colors">
                  RENSELL
                </h1>
                <span className="text-[9px] font-bold text-gray-400 tracking-widest uppercase block mt-0.5">
                  Rent & Sell
                </span>
              </div>
            </Link>

            {/* Desktop Nav Links (Centered) */}
            <nav className="hidden lg:block">
              <ul className="flex items-center gap-1">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all duration-300 ${isActive
                          ? 'text-primary bg-primary/5'
                          : 'text-gray-600 hover:text-primary hover:bg-gray-50'
                          }`}
                      >
                        <i className={`fas ${link.icon} text-[10px] opacity-75`} />
                        {link.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* Search — desktop/tablet */}
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xs lg:max-w-sm mx-4">
              <div className="relative w-full">
                <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search rentals, electronics..."
                  className="input !pl-11 !pr-4 !py-2.5 !text-xs !rounded-full bg-gray-50/80 border-gray-100 hover:border-gray-200/80 focus:bg-white transition-all duration-300"
                />
              </div>
            </form>

            {/* Action buttons */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Cart Button */}
              <Link href="/cart" className="relative group">
                <div className="flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:border-gray-200 hover:shadow-sm transition-all duration-300 active:scale-95">
                  <div className="relative">
                    <i className="fas fa-shopping-cart text-gray-700 text-sm group-hover:text-primary transition-colors" />
                    {cartCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-md animate-scale-in border border-white leading-none">
                        {cartCount}
                      </span>
                    )}
                  </div>
                  <span className="hidden sm:inline text-xs font-bold text-gray-700 group-hover:text-primary transition-colors uppercase tracking-wider">Cart</span>
                </div>
              </Link>

              {/* Auth status desktop with profile dropdown */}
              {user ? (
                <div className="hidden sm:flex items-center gap-3 relative" ref={profileDropdownRef}>
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-gray-50 border border-gray-100 hover:bg-white hover:border-gray-200 transition-all duration-300 shadow-sm outline-none active:scale-95"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-xs font-black shadow-sm flex-shrink-0">
                      {user.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <span className="text-xs font-extrabold text-gray-700 max-w-[85px] truncate">
                      {user.name}
                    </span>
                    <i className={`fas fa-chevron-down text-[10px] text-gray-400 transition-transform duration-300 ${profileDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {profileDropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-100 rounded-2xl shadow-premium py-2 z-50 animate-scale-in">
                      <div className="px-4 py-2 border-b border-gray-50 mb-1">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Welcome</p>
                        <p className="text-xs font-bold text-gray-700 truncate">{user.name}</p>
                      </div>

                      <Link
                        href="/dashboard/settings"
                        className="flex items-center gap-3.5 px-4 py-2.5 text-xs font-extrabold uppercase tracking-wider text-gray-600 hover:text-primary hover:bg-gray-50 transition-colors"
                      >
                        <i className="fas fa-user-cog text-gray-400 text-sm w-4" />
                        Settings
                      </Link>

                      <Link
                        href="/dashboard/items"
                        className="flex items-center gap-3.5 px-4 py-2.5 text-xs font-extrabold uppercase tracking-wider text-gray-600 hover:text-primary hover:bg-gray-50 transition-colors"
                      >
                        <i className="fas fa-box-open text-gray-400 text-sm w-4" />
                        My Items
                      </Link>

                      <Link
                        href="/dashboard/orders"
                        className="flex items-center gap-3.5 px-4 py-2.5 text-xs font-extrabold uppercase tracking-wider text-gray-600 hover:text-primary hover:bg-gray-50 transition-colors"
                      >
                        <i className="fas fa-shopping-basket text-gray-400 text-sm w-4" />
                        Rentals & Orders
                      </Link>

                      <div className="border-t border-gray-50 mt-1.5 pt-1.5">
                        <button
                          onClick={handleSignOut}
                          className="flex items-center gap-3.5 w-full text-left px-4 py-2.5 text-xs font-extrabold uppercase tracking-wider text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <i className="fas fa-sign-out-alt text-red-400 text-sm w-4" />
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link href="/auth/login" className="hidden sm:block">
                  <button className="btn-primary !py-2.5 !px-5 !text-xs uppercase tracking-wider">Sign In</button>
                </Link>
              )}

              {/* Hamburger Button (mobile/tablet) */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2.5 rounded-xl bg-gray-50 border border-gray-100 hover:bg-gray-100 transition-colors"
                aria-label="Toggle menu"
              >
                <div className="w-5 h-4 flex flex-col justify-between">
                  <span
                    className={`block h-0.5 bg-gray-700 rounded-full transition-all duration-300 ${mobileMenuOpen ? 'rotate-45 translate-y-[7px]' : ''
                      }`}
                  />
                  <span
                    className={`block h-0.5 bg-gray-700 rounded-full transition-all duration-300 ${mobileMenuOpen ? 'opacity-0 scale-0' : ''
                      }`}
                  />
                  <span
                    className={`block h-0.5 bg-gray-700 rounded-full transition-all duration-300 ${mobileMenuOpen ? '-rotate-45 -translate-y-[7px]' : ''
                      }`}
                  />
                </div>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-dark/20 backdrop-blur-sm transition-opacity duration-300 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Drawer Menu */}
      <div
        ref={menuRef}
        className={`fixed top-0 right-0 z-50 h-full w-80 bg-white shadow-premium transform transition-transform duration-300 ease-out lg:hidden ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
      >
        <div className="flex flex-col h-full">
          {/* Mobile drawer header */}
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                <span className="text-white font-black text-xs">R</span>
              </div>
              <span className="font-black text-sm text-dark uppercase tracking-wider">Navigation</span>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors"
            >
              <i className="fas fa-times text-gray-500 text-xs" />
            </button>
          </div>

          {/* Mobile Search input */}
          <div className="p-4 border-b border-gray-50">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <i className="fas fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="input !pl-10 !pr-4 !py-2.5 !text-xs !rounded-xl"
                />
              </div>
            </form>
          </div>

          {/* Mobile Links */}
          <nav className="flex-1 px-4 py-3 overflow-y-auto space-y-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all duration-200 ${isActive
                    ? 'text-primary bg-primary/5'
                    : 'text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  <i className={`fas ${link.icon} w-5 text-center text-sm ${isActive ? 'text-primary' : 'text-gray-400'}`} />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Mobile user profile info & logout */}
          <div className="p-5 border-t border-gray-100 bg-gray-50/80">
            {user ? (
              <div className="space-y-4">
                <Link
                  href="/dashboard/items"
                  className="flex items-center justify-center gap-2 w-full py-3 bg-primary text-white font-extrabold text-xs uppercase tracking-wider rounded-xl hover:bg-primary-dark transition-colors shadow-sm"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <i className="fas fa-chart-line text-xs" />
                  Dashboard Menu
                </Link>
                <div className="flex items-center justify-between border-t border-gray-100/50 pt-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-black text-xs shadow-sm">
                      {user.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <p className="font-extrabold text-xs text-dark max-w-[120px] truncate">{user.name}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Account Active</p>
                    </div>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="text-xs text-red-500 hover:text-red-600 font-bold uppercase tracking-wider"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <Link href="/auth/login" className="block" onClick={() => setMobileMenuOpen(false)}>
                <button className="btn-primary w-full !py-3 uppercase tracking-wider text-xs">Sign In</button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
