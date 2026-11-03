'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ToastProvider';
import Image from 'next/image';

export default function SettingsPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '', // read-only
    phone: '',
    bio: '',
  });
  const [profileImage, setProfileImage] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isVerified, setIsVerified] = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/users/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();

      if (res.ok && data.user) {
        setFormData({
          name: data.user.name || '',
          email: data.user.email || '',
          phone: data.user.phone || '',
          bio: data.user.bio || '',
        });
        setProfileImage(data.user.profileImage || '');
        setIsVerified(data.user.isVerified || false);
      } else {
        if (res.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          showToast('Session expired. Please log in again.', 'error');
          router.push('/auth/login');
        } else {
          showToast('Failed to load profile settings', 'error');
        }
      }
    } catch (error) {
      console.error('Failed to fetch profile', error);
      showToast('Failed to load profile settings', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast, router]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showToast('Image size must be less than 2MB', 'error');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      let imageUrl = profileImage;

      // 1. Upload new image if file exists
      if (imageFile) {
        showToast('Uploading profile picture...', 'info');
        const imgData = new FormData();
        imgData.append('file', imageFile);

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: imgData,
        });

        if (!uploadRes.ok) throw new Error('Image upload failed');
        const uploadResult = await uploadRes.json();
        imageUrl = uploadResult.url;
      }

      // 2. Save profile data
      const token = localStorage.getItem('token');
      const res = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          bio: formData.bio,
          profileImage: imageUrl
        })
      });

      if (!res.ok) throw new Error('Failed to save profile');

      showToast('Profile updated successfully!', 'success');

      // Update local storage name locally just in case
      const localUser = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({ ...localUser, name: formData.name }));
      window.dispatchEvent(new Event('storage'));

    } catch (error: any) {
      console.error(error);
      showToast(error.message || 'Something went wrong', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8 border-b border-gray-100 pb-5">
        <h1 className="text-2xl font-bold text-dark flex items-center gap-3">
          Profile Settings
          {isVerified && (
            <span className="flex items-center gap-1 text-[10px] bg-green-100 text-green-700 px-2 py-1 rounded-full uppercase tracking-wider">
              <i className="fas fa-check-circle" /> Verified
            </span>
          )}
        </h1>
        <p className="text-gray-500 text-sm mt-1">Manage your public vendor profile and account details.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-soft">

        {/* Avatar Section */}
        <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-gray-100">
          <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <div className={`w-24 h-24 rounded-full overflow-hidden flex items-center justify-center bg-gray-100 border-2 border-dashed ${profileImage && !profileImage.startsWith('data:') ? 'border-primary' : 'border-gray-300'}`}>
              {profileImage ? (
                <Image src={profileImage} alt="Profile" fill className="object-cover" />
              ) : (
                <i className="fas fa-user text-3xl text-gray-400" />
              )}
            </div>
            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <i className="fas fa-camera text-white text-xl" />
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              className="hidden"
            />
          </div>
          <div className="text-center sm:text-left">
            <h3 className="font-bold text-dark">Profile Picture</h3>
            <p className="text-sm text-gray-500 max-w-sm mt-1">Upload a photo to help buyers and renters trust your listings. Max 2MB.</p>
            <button type="button" onClick={() => fileInputRef.current?.click()} className="text-sm text-primary font-semibold mt-2 hover:underline">
              Change Photo
            </button>
          </div>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="input"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex justify-between">
              Email <span className="text-gray-400 text-[10px] uppercase tracking-wider font-normal">Private • Read Only</span>
            </label>
            <input
              type="email"
              value={formData.email}
              className="input bg-gray-50 text-gray-500 cursor-not-allowed"
              disabled
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex justify-between">
              Phone Number <span className="text-gray-400 text-[10px] uppercase tracking-wider font-normal">Private</span>
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="10-digit number"
              className="input"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex justify-between">
              Public Bio <span className="text-gray-400 text-[10px] uppercase tracking-wider font-normal">Public</span>
            </label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows={4}
              placeholder="Tell the community about yourself. What kind of items do you list?"
              className="input resize-none py-3"
              maxLength={300}
            />
            <p className="text-xs text-gray-400 text-right mt-1">{formData.bio.length}/300</p>
          </div>
        </div>

        <div className="pt-4 flex justify-end">
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
