'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);

  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.replace('/auth/login');
    } else {
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user.role === 'admin') setIsAdmin(true);
      } catch (e) {
        console.error('Failed to parse user role', e);
      }
      setLoading(false);
    }
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const menuItems = [
    { href: '/dashboard/items', label: 'My Items', icon: 'fa-box-open' },
    { href: '/dashboard/items/add', label: 'List an Item', icon: 'fa-plus-circle' },
    { href: '/dashboard/orders', label: 'My Rentals & Orders', icon: 'fa-shopping-bag' },
    { href: '/dashboard/settings', label: 'Profile Settings', icon: 'fa-user-cog' },
    ...(isAdmin ? [{ href: '/dashboard/admin', label: 'Admin Portal', icon: 'fa-shield-alt' }] : []),
  ];

  return (
    <div className="min-h-screen bg-surface py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-6 md:gap-8">
          {/* Sidebar Navigation */}
          <div className="w-full md:w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-soft p-4 md:p-5 border border-gray-100 sticky top-20 md:top-24">
              <h2 className="hidden md:block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 px-2">Dashboard Menu</h2>
              <nav className="flex flex-row md:flex-col overflow-x-auto md:overflow-x-visible gap-2 pb-2 md:pb-0 scrollbar-none">
                {menuItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex-shrink-0 flex items-center gap-2.5 px-4 py-3 rounded-xl transition-all duration-300 text-xs font-extrabold uppercase tracking-wider ${
                        isActive
                          ? 'bg-primary text-white shadow-glow-primary hover:text-white'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-primary'
                      }`}
                    >
                      <i className={`fas ${item.icon} text-sm ${isActive ? 'text-white' : 'text-gray-400'}`} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Dashboard Content Area */}
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-2xl shadow-soft p-4 sm:p-6 md:p-8 border border-gray-100">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
