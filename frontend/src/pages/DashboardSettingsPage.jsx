import { useState, useEffect, useRef } from 'react';
import { userAPI, uploadAPI, extractApiError } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { resolveImageUrl } from '../utils/imageUrl';

export default function DashboardSettingsPage() {
  const { updateLocalUser } = useAuth();
  const { showToast } = useToast();
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
  });
  const [profileImage, setProfileImage] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    let active = true;
    async function loadProfile() {
      try {
        setLoading(true);
        const data = await userAPI.getMe();
        if (active && data.user) {
          setFormData({
            name: data.user.name || '',
            email: data.user.email || '',
            phone: data.user.phone || '',
            bio: data.user.bio || '',
          });
          setProfileImage(data.user.profileImage || '');
          setIsVerified(Boolean(data.user.isVerified));
        }
      } catch (err) {
        showToast(extractApiError(err, 'Failed to load profile'), 'error');
      } finally {
        if (active) setLoading(false);
      }
    }
    loadProfile();
    return () => {
      active = false;
    };
  }, [showToast]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showToast('Profile image must be less than 5MB', 'error');
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setProfileImage(String(reader.result || ''));
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      let imageUrl = profileImage;

      if (imageFile) {
        showToast('Uploading profile picture...', 'info');
        const uploadResult = await uploadAPI.uploadImage(imageFile);
        imageUrl = uploadResult.url;
      }

      const data = await userAPI.updateMe({
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        bio: formData.bio.trim(),
        profileImage: imageUrl,
      });

      updateLocalUser({
        name: data.user.name,
        profileImage: data.user.profileImage,
        phone: data.user.phone,
        bio: data.user.bio,
      });
      setProfileImage(data.user.profileImage || '');
      setImageFile(null);
      showToast('Profile updated successfully!', 'success');
    } catch (err) {
      showToast(extractApiError(err, 'Failed to update profile'), 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-rensell-primary" role="status" />
      </div>
    );
  }

  return (
    <div>
      <div className="pb-3 mb-4 border-bottom">
        <div className="d-flex align-items-center gap-2">
          <h3 className="fw-bold text-dark mb-0">Profile Settings</h3>
          {isVerified && (
            <span className="badge bg-success bg-opacity-10 text-success rounded-pill px-2 py-1">
              <i className="bi bi-patch-check-fill me-1" /> Verified
            </span>
          )}
        </div>
        <p className="text-muted small mb-0 mt-1">Manage your public vendor profile and contact details.</p>
      </div>

      <form onSubmit={handleSubmit} className="d-grid gap-4">
        {/* Avatar */}
        <div className="d-flex flex-column flex-sm-row align-items-center gap-4 pb-4 border-bottom">
          <div
            className="position-relative"
            style={{ cursor: 'pointer' }}
            onClick={() => fileInputRef.current?.click()}
          >
            {profileImage ? (
              <img
                src={resolveImageUrl(profileImage)}
                alt="Profile"
                className="rounded-circle object-fit-cover border border-2 border-primary"
                style={{ width: '96px', height: '96px' }}
              />
            ) : (
              <span className="avatar-circle" style={{ width: '96px', height: '96px', fontSize: '2.2rem' }}>
                {formData.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            )}
            <span className="position-absolute bottom-0 end-0 badge rounded-pill bg-dark p-2">
              <i className="bi bi-camera-fill" />
            </span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="d-none"
              onChange={handleImageChange}
            />
          </div>

          <div className="text-center text-sm-start">
            <h6 className="fw-bold text-dark mb-1">Profile Picture</h6>
            <p className="text-muted small mb-2">
              Upload a clear photo so buyers and renters trust your listings. Max 5MB.
            </p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="btn btn-sm btn-rensell-outline"
            >
              Change Photo
            </button>
          </div>
        </div>

        {/* Fields */}
        <div className="row g-3">
          <div className="col-12">
            <label className="form-label small fw-bold text-muted">Full Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
              className="form-control rounded-3"
            />
          </div>

          <div className="col-12 col-md-6">
            <label className="form-label small fw-bold text-muted">
              Email <span className="fw-normal">(Private &bull; Read Only)</span>
            </label>
            <input type="email" value={formData.email} disabled className="form-control rounded-3 bg-light" />
          </div>

          <div className="col-12 col-md-6">
            <label className="form-label small fw-bold text-muted">Phone Number</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
              placeholder="10-digit number"
              className="form-control rounded-3"
            />
          </div>

          <div className="col-12">
            <label className="form-label small fw-bold text-muted">Public Bio</label>
            <textarea
              rows={4}
              maxLength={300}
              value={formData.bio}
              onChange={(e) => setFormData((p) => ({ ...p, bio: e.target.value }))}
              placeholder="Tell the community about yourself and the items you share..."
              className="form-control rounded-3"
            />
            <div className="text-end text-muted small mt-1">{formData.bio.length}/300</div>
          </div>
        </div>

        <div className="d-flex justify-content-end">
          <button type="submit" disabled={saving} className="btn btn-rensell px-4">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
