'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useToast } from '@/components/ToastProvider';

export default function EditItemPage() {
    const router = useRouter();
    const params = useParams();
    const { showToast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const itemId = String(params.id || '');

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [currentImageUrl, setCurrentImageUrl] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        price: '',
        originalPrice: '',
        type: 'rent',
        category: 'electronics',
        description: '',
    });

    const fetchItem = useCallback(async (token: string) => {
        try {
            const res = await fetch(`/api/products/${itemId}/manage`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await res.json();

            if (res.status === 401) {
                throw new Error('Session expired. Please log in again');
            }

            if (res.status === 403) {
                throw new Error('You do not have permission to edit this item');
            }

            if (res.status === 404) {
                throw new Error('Item not found');
            }

            if (!res.ok || !data.product) {
                throw new Error(data.error || 'Failed to load item details');
            }

            const product = data.product;

            setFormData({
                name: product.name || '',
                price: String(product.price ?? ''),
                originalPrice: String(product.originalPrice ?? ''),
                type: product.type || 'rent',
                category: product.category || 'electronics',
                description: product.description || '',
            });
            setCurrentImageUrl(product.image || '');
            setImagePreview(product.image || null);
        } catch (error: any) {
            showToast(error?.message || 'Failed to load item', 'error');
            router.push('/dashboard/items');
        } finally {
            setLoading(false);
        }
    }, [itemId, router, showToast]);

    useEffect(() => {
        if (!itemId) {
            router.push('/dashboard/items');
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            showToast('Please log in to edit items', 'error');
            router.push('/auth/login');
            return;
        }

        fetchItem(token);
    }, [itemId, router, showToast, fetchItem]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            showToast('Image size should be less than 5MB', 'error');
            return;
        }

        setImageFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            if (!file.type.startsWith('image/')) return;
            if (file.size > 5 * 1024 * 1024) {
                showToast('Image size should be less than 5MB', 'error');
                return;
            }

            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name || !formData.price || !formData.originalPrice || !formData.description) {
            showToast('Please fill out all required fields', 'error');
            return;
        }

        try {
            setSaving(true);
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Session expired. Please log in again');
            }

            let imageUrl = currentImageUrl;

            if (imageFile) {
                showToast('Uploading new image...', 'info');
                const imgData = new FormData();
                imgData.append('file', imageFile);

                const uploadRes = await fetch('/api/upload', {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    body: imgData,
                });

                if (!uploadRes.ok) {
                    throw new Error('Failed to upload image');
                }

                const uploadResult = await uploadRes.json();
                imageUrl = uploadResult.url;
            }

            const price = Number(formData.price);
            const originalPrice = Number(formData.originalPrice);
            const discount =
                originalPrice > 0
                    ? Math.max(0, Math.round(((originalPrice - price) / originalPrice) * 100))
                    : 0;

            const productPayload = {
                name: formData.name,
                price,
                originalPrice,
                type: formData.type,
                category: formData.category,
                description: formData.description,
                image: imageUrl,
                discount,
            };

            const updateRes = await fetch(`/api/products/${itemId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(productPayload),
            });

            const updateData = await updateRes.json();
            if (!updateRes.ok) {
                if (updateRes.status === 401) {
                    throw new Error('Session expired. Please log in again');
                }
                if (updateRes.status === 403) {
                    throw new Error('You are not allowed to edit this item');
                }
                if (updateRes.status === 404) {
                    throw new Error('Item not found');
                }
                throw new Error(updateData.error || 'Failed to update item');
            }

            showToast('Item updated successfully', 'success');
            router.push('/dashboard/items');
        } catch (error: any) {
            showToast(error?.message || 'Failed to update item', 'error');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8 border-b border-gray-100 pb-5">
                <h1 className="text-2xl font-bold text-dark">Edit Item</h1>
                <p className="text-gray-500 text-sm mt-1">Update your listing details and keep your product information fresh.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                <section>
                    <h2 className="text-lg font-bold text-dark mb-4 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs">1</span>
                        Item Photo
                    </h2>

                    <div
                        className={`relative border-2 border-dashed rounded-2xl p-8 transition-colors ${imagePreview ? 'border-primary bg-primary/5' : 'border-gray-200 bg-gray-50 hover:bg-gray-100'}`}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        onClick={() => !imagePreview && fileInputRef.current?.click()}
                    >
                        {imagePreview ? (
                            <div className="relative w-full max-w-sm mx-auto aspect-[4/3] rounded-xl overflow-hidden shadow-md">
                                <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setImagePreview(null);
                                        setImageFile(null);
                                        setCurrentImageUrl('');
                                    }}
                                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 text-white hover:bg-red-500 flex items-center justify-center backdrop-blur-sm transition-colors"
                                >
                                    <i className="fas fa-times text-sm" />
                                </button>
                            </div>
                        ) : (
                            <div className="text-center cursor-pointer">
                                <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mx-auto mb-4 shadow-sm text-primary">
                                    <i className="fas fa-cloud-upload-alt text-2xl" />
                                </div>
                                <p className="font-semibold text-dark mb-1">Click or drag image here</p>
                                <p className="text-xs text-gray-500">Supported formats: JPG, PNG, WEBP (Max 5MB)</p>
                            </div>
                        )}
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImageChange}
                            accept="image/*"
                            className="hidden"
                        />
                    </div>
                </section>

                <section className="pt-6 border-t border-gray-100">
                    <h2 className="text-lg font-bold text-dark mb-4 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs">2</span>
                        Item Details
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Item Title</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="e.g. Sony PlayStation 5 Console"
                                className="input"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Listing Type</label>
                            <select name="type" value={formData.type} onChange={handleChange} className="input">
                                <option value="rent">For Rent (Daily)</option>
                                <option value="sale">For Sale (One-time)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Category</label>
                            <select name="category" value={formData.category} onChange={handleChange} className="input" required>
                                <option value="electronics">Electronics</option>
                                <option value="furniture">Furniture</option>
                                <option value="vehicles">Vehicles</option>
                                <option value="tools">Tools & Equipment</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                {formData.type === 'rent' ? 'Daily Rent Price (₹)' : 'Selling Price (₹)'}
                            </label>
                            <input
                                type="number"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                placeholder="0"
                                min="0"
                                className="input"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Original Retail Price (₹)</label>
                            <input
                                type="number"
                                name="originalPrice"
                                value={formData.originalPrice}
                                onChange={handleChange}
                                placeholder="0"
                                min="0"
                                className="input"
                                required
                            />
                            <p className="text-[10px] text-gray-500 mt-1">Used to calculate discount badge</p>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={5}
                                placeholder="Describe your item's condition, features, and any rules for renters..."
                                className="input resize-none py-3"
                                required
                            />
                        </div>
                    </div>
                </section>

                <div className="pt-8 border-t border-gray-100 flex justify-end gap-4">
                    <button
                        type="button"
                        onClick={() => router.push('/dashboard/items')}
                        className="btn-outline !px-6"
                        disabled={saving}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="btn-primary !px-8"
                        disabled={saving}
                    >
                        {saving ? (
                            <span className="flex items-center gap-2">
                                <i className="fas fa-spinner fa-spin" /> Saving...
                            </span>
                        ) : (
                            'Save Changes'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
