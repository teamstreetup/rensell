import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { productAPI, uploadAPI, extractApiError } from '../services/api';
import { useToast } from '../hooks/useToast';

export default function AddItemPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    originalPrice: '',
    type: 'rent',
    category: 'electronics',
    description: '',
  });

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

    if (!imageFile) {
      showToast('Please upload an image for your item', 'error');
      return;
    }

    if (!formData.name.trim()) {
      showToast('Item title is required', 'error');
      return;
    }

    const priceNum = Number(formData.price);
    if (!formData.price || Number.isNaN(priceNum) || priceNum <= 0) {
      showToast('Price must be greater than 0', 'error');
      return;
    }

    const origNum = formData.originalPrice ? Number(formData.originalPrice) : priceNum;
    if (Number.isNaN(origNum) || origNum < 0) {
      showToast('Original price cannot be negative', 'error');
      return;
    }

    if (!formData.description.trim()) {
      showToast('Description is required', 'error');
      return;
    }

    try {
      setLoading(true);
      showToast('Uploading image...', 'info');
      const uploadResult = await uploadAPI.uploadImage(imageFile);

      showToast('Saving listing...', 'info');
      const effectiveOriginalPrice = origNum > 0 ? origNum : priceNum;
      const discount =
        effectiveOriginalPrice > priceNum
          ? Math.min(100, Math.max(0, Math.round(((effectiveOriginalPrice - priceNum) / effectiveOriginalPrice) * 100)))
          : 0;

      await productAPI.create({
        name: formData.name.trim(),
        price: priceNum,
        originalPrice: effectiveOriginalPrice,
        type: formData.type,
        category: formData.category,
        description: formData.description.trim(),
        image: uploadResult.url,
        discount,
        rating: 4.5,
      });

      showToast('Success! Your item is now live.', 'success');
      navigate('/dashboard/items');
    } catch (error) {
      showToast(extractApiError(error, 'Failed to publish listing'), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="pb-3 mb-4 border-bottom">
        <h3 className="fw-bold text-dark mb-1">List a New Item</h3>
        <p className="text-muted small mb-0">
          Fill out the details below to publish your product for rent or sale.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="d-grid gap-4">
        {/* Step 1: Image Upload */}
        <div>
          <h6 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
            <span className="badge bg-rensell-gradient rounded-circle">1</span>
            Item Photo
          </h6>

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
                  }}
                  className="btn btn-sm btn-danger rounded-circle position-absolute top-0 end-0 m-2"
                  aria-label="Remove photo"
                >
                  <i className="bi bi-x-lg" />
                </button>
              </div>
            ) : (
              <div className="py-3">
                <i className="bi bi-cloud-arrow-up fs-1 text-rensell-primary" />
                <div className="fw-bold text-dark mt-2">Click or drag an image here</div>
                <div className="text-muted small">Supported formats: JPG, PNG, WEBP, GIF, SVG (Max 10MB)</div>
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

        {/* Step 2: Details */}
        <div className="pt-3 border-top">
          <h6 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
            <span className="badge bg-rensell-gradient rounded-circle">2</span>
            Item Details
          </h6>

          <div className="row g-3">
            <div className="col-12">
              <label htmlFor="itemName" className="form-label small fw-bold text-muted">
                Item Title *
              </label>
              <input
                id="itemName"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Sony PlayStation 5 Console"
                className="form-control rounded-3"
              />
            </div>

            <div className="col-12 col-md-6">
              <label htmlFor="itemType" className="form-label small fw-bold text-muted">
                Listing Type *
              </label>
              <select
                id="itemType"
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="form-select rounded-3"
              >
                <option value="rent">For Rent (Daily)</option>
                <option value="sale">For Sale (One-time)</option>
              </select>
            </div>

            <div className="col-12 col-md-6">
              <label htmlFor="itemCategory" className="form-label small fw-bold text-muted">
                Category *
              </label>
              <select
                id="itemCategory"
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
              <label htmlFor="itemPrice" className="form-label small fw-bold text-muted">
                {formData.type === 'rent' ? 'Daily Rent Price (₹) *' : 'Selling Price (₹) *'}
              </label>
              <input
                id="itemPrice"
                name="price"
                type="number"
                min="1"
                required
                value={formData.price}
                onChange={handleChange}
                placeholder="499"
                className="form-control rounded-3"
              />
            </div>

            <div className="col-12 col-md-6">
              <label htmlFor="itemOrigPrice" className="form-label small fw-bold text-muted">
                Original Retail Price (₹) <span className="fw-normal">(Optional)</span>
              </label>
              <input
                id="itemOrigPrice"
                name="originalPrice"
                type="number"
                min="0"
                value={formData.originalPrice}
                onChange={handleChange}
                placeholder="999"
                className="form-control rounded-3"
              />
              <div className="form-text small">Used for discount badge &amp; 20% rental deposit calculation.</div>
            </div>

            <div className="col-12">
              <label htmlFor="itemDesc" className="form-label small fw-bold text-muted">
                Description *
              </label>
              <textarea
                id="itemDesc"
                name="description"
                rows={4}
                required
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe item condition, included accessories, and any rules for renters..."
                className="form-control rounded-3"
              />
            </div>
          </div>
        </div>

        <div className="d-flex justify-content-end gap-2 pt-3 border-top">
          <button
            type="button"
            onClick={() => navigate(-1)}
            disabled={loading}
            className="btn btn-rensell-outline px-4"
          >
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn btn-rensell px-4">
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" />
                Publishing...
              </>
            ) : (
              'Publish Listing'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
