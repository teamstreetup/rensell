import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productAPI, uploadAPI, extractApiError } from '../services/api';
import { useToast } from '../hooks/useToast';
import { resolveImageUrl } from '../utils/imageUrl';

export default function EditItemPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [currentImageUrl, setCurrentImageUrl] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    originalPrice: '',
    type: 'rent',
    category: 'electronics',
    description: '',
  });

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        setLoading(true);
        const data = await productAPI.getForManage(id);
        if (active && data.product) {
          const p = data.product;
          setFormData({
            name: p.name || '',
            price: String(p.price ?? ''),
            originalPrice: String(p.originalPrice ?? ''),
            type: p.type || 'rent',
            category: p.category || 'electronics',
            description: p.description || '',
          });
          setCurrentImageUrl(p.image || '');
          setImagePreview(resolveImageUrl(p.image));
        }
      } catch (err) {
        showToast(extractApiError(err, 'Unable to load item for editing'), 'error');
        navigate('/dashboard/items', { replace: true });
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [id, navigate, showToast]);

  const handleFileSelected = (file) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      showToast('Image size should be less than 10MB', 'error');
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(String(reader.result || ''));
    reader.readAsDataURL(file);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const priceNum = Number(formData.price);
    if (!formData.name.trim() || Number.isNaN(priceNum) || priceNum <= 0 || !formData.description.trim()) {
      showToast('Please provide valid title, price, and description', 'error');
      return;
    }

    try {
      setSaving(true);
      let imageUrl = currentImageUrl;

      if (imageFile) {
        showToast('Uploading new image...', 'info');
        const uploadRes = await uploadAPI.uploadImage(imageFile);
        imageUrl = uploadRes.url;
      }

      if (!imageUrl) {
        throw new Error('Please upload an item photo');
      }

      const origNum = Number(formData.originalPrice) || priceNum;
      const discount =
        origNum > priceNum
          ? Math.min(100, Math.max(0, Math.round(((origNum - priceNum) / origNum) * 100)))
          : 0;

      await productAPI.update(id, {
        name: formData.name.trim(),
        price: priceNum,
        originalPrice: origNum,
        type: formData.type,
        category: formData.category,
        description: formData.description.trim(),
        image: imageUrl,
        discount,
      });

      showToast('Item updated successfully!', 'success');
      navigate('/dashboard/items');
    } catch (err) {
      showToast(extractApiError(err, 'Failed to update item'), 'error');
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
        <h3 className="fw-bold text-dark mb-1">Edit Item</h3>
        <p className="text-muted small mb-0">Update your listing details and photo.</p>
      </div>

      <form onSubmit={handleSubmit} className="d-grid gap-4">
        <div>
          <h6 className="fw-bold text-dark mb-3">Item Photo</h6>
          <div
            className={`upload-dropzone p-4 text-center ${imagePreview ? 'has-preview' : ''}`}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              handleFileSelected(e.dataTransfer.files?.[0]);
            }}
            onClick={() => !imagePreview && fileInputRef.current?.click()}
          >
            {imagePreview ? (
              <div className="position-relative mx-auto" style={{ maxWidth: '340px', aspectRatio: '4/3' }}>
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-100 h-100 object-fit-cover rounded-3 shadow-sm"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setImageFile(null);
                    setImagePreview('');
                    setCurrentImageUrl('');
                  }}
                  className="btn btn-sm btn-danger rounded-circle position-absolute top-0 end-0 m-2"
                >
                  <i className="bi bi-x-lg" />
                </button>
              </div>
            ) : (
              <div className="py-3">
                <i className="bi bi-cloud-arrow-up fs-1 text-rensell-primary" />
                <div className="fw-bold text-dark mt-2">Click or drag image to upload</div>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="d-none"
              onChange={(e) => handleFileSelected(e.target.files?.[0])}
            />
          </div>
        </div>

        <div className="row g-3">
          <div className="col-12">
            <label className="form-label small fw-bold text-muted">Item Title *</label>
            <input
              name="name"
              type="text"
              required
              value={formData.name}
              onChange={handleChange}
              className="form-control rounded-3"
            />
          </div>

          <div className="col-12 col-md-6">
            <label className="form-label small fw-bold text-muted">Listing Type</label>
            <select name="type" value={formData.type} onChange={handleChange} className="form-select rounded-3">
              <option value="rent">For Rent (Daily)</option>
              <option value="sale">For Sale (One-time)</option>
            </select>
          </div>

          <div className="col-12 col-md-6">
            <label className="form-label small fw-bold text-muted">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="form-select rounded-3"
            >
              <option value="electronics">Electronics</option>
              <option value="furniture">Furniture</option>
              <option value="stationery">Stationery</option>
              <option value="lifestyle">Lifestyle</option>
              <option value="vehicles">Vehicles</option>
              <option value="tools">Tools &amp; Equipment</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="col-12 col-md-6">
            <label className="form-label small fw-bold text-muted">
              {formData.type === 'rent' ? 'Daily Rent Price (₹) *' : 'Selling Price (₹) *'}
            </label>
            <input
              name="price"
              type="number"
              min="1"
              required
              value={formData.price}
              onChange={handleChange}
              className="form-control rounded-3"
            />
          </div>

          <div className="col-12 col-md-6">
            <label className="form-label small fw-bold text-muted">Original Retail Price (₹)</label>
            <input
              name="originalPrice"
              type="number"
              min="0"
              value={formData.originalPrice}
              onChange={handleChange}
              className="form-control rounded-3"
            />
          </div>

          <div className="col-12">
            <label className="form-label small fw-bold text-muted">Description *</label>
            <textarea
              name="description"
              rows={4}
              required
              value={formData.description}
              onChange={handleChange}
              className="form-control rounded-3"
            />
          </div>
        </div>

        <div className="d-flex justify-content-end gap-2 pt-3 border-top">
          <button
            type="button"
            onClick={() => navigate('/dashboard/items')}
            disabled={saving}
            className="btn btn-rensell-outline px-4"
          >
            Cancel
          </button>
          <button type="submit" disabled={saving} className="btn btn-rensell px-4">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
