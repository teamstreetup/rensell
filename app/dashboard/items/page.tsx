'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useToast } from '@/components/ToastProvider';

export default function MyItemsPage() {
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { showToast } = useToast();

  const fetchMyItems = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/products/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setItems(data.products || []);
      } else {
        if (res.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          showToast('Session expired. Please log in again.', 'error');
          router.push('/auth/login');
        } else {
          showToast('Failed to fetch your items', 'error');
        }
      }
    } catch (error) {
      showToast('Error loading items', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast, router]);

  useEffect(() => {
    fetchMyItems();
  }, [fetchMyItems]);

  const handleDeleteItem = async (itemId: string, itemName: string) => {
    const shouldDelete = window.confirm(`Delete "${itemName}" permanently? This action cannot be undone.`);
    if (!shouldDelete) return;

    try {
      setDeletingId(itemId);
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/products/${itemId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete item');
      }

      setItems((prev) => prev.filter((product) => product._id !== itemId));
      showToast('Item deleted successfully', 'success');
    } catch (error: any) {
      showToast(error?.message || 'Failed to delete item', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent flex rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-dark">My Listed Items</h1>
          <p className="text-gray-500 text-sm mt-1">Manage all the products you have available for rent or sale.</p>
        </div>
        <Link href="/dashboard/items/add">
          <button className="btn-primary !py-2.5">
            <i className="fas fa-plus mr-2" />
            Add New Item
          </button>
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm mb-4">
            <i className="fas fa-box-open text-3xl text-gray-300" />
          </div>
          <h3 className="text-lg font-bold text-dark mb-2">No items listed yet</h3>
          <p className="text-gray-500 max-w-sm mx-auto mb-6">
            Start earning by listing your underused items for rent or sale on the platform.
          </p>
          <Link href="/dashboard/items/add">
            <button className="btn !bg-dark !text-white hover:bg-gray-800 !rounded-xl">
              List Your First Item
            </button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div key={item._id} className="bg-white rounded-2xl border border-gray-100 shadow-soft overflow-hidden group">
              <div className="relative w-full aspect-[4/3] bg-gray-50">
                <Image
                  src={item.image || '/photo/placeholder.svg'}
                  alt={item.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-3 left-3 flex gap-2 z-10">
                  <span className={item.type === 'rent' ? 'badge-rent shadow-sm' : 'badge-sale shadow-sm'}>
                    {item.type === 'rent' ? 'RENT' : 'SALE'}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-dark text-base truncate mb-2" title={item.name}>{item.name}</h3>
                <div className="flex items-center justify-between mt-4">
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-400">Price</span>
                    <span className="font-bold text-lg text-primary">₹{item.price.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/dashboard/items/${item._id}/edit`}>
                      <button
                        className="w-8 h-8 rounded-full bg-blue-50 text-blue-500 hover:bg-blue-500 hover:text-white transition-colors flex items-center justify-center shadow-sm"
                        title="Edit item"
                      >
                        <i className="fas fa-pen text-xs" />
                      </button>
                    </Link>
                    <button
                      onClick={() => handleDeleteItem(item._id, item.name)}
                      disabled={deletingId === item._id}
                      className="w-8 h-8 rounded-full bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-colors flex items-center justify-center shadow-sm disabled:opacity-60"
                      title="Delete item"
                    >
                      <i className={`fas ${deletingId === item._id ? 'fa-spinner fa-spin' : 'fa-trash'} text-xs`} />
                    </button>
                    <Link href={`/products/${item._id}`}>
                      <button className="w-8 h-8 rounded-full bg-gray-50 text-gray-500 hover:bg-primary hover:text-white transition-colors flex items-center justify-center shadow-sm">
                        <i className="fas fa-external-link-alt text-xs" />
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
