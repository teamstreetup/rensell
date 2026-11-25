import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { userAPI, extractApiError } from '../services/api';
import ProductList from '../components/ProductList';
import { resolveImageUrl } from '../utils/imageUrl';

export default function VendorProfilePage() {
  const { id } = useParams();
  const [vendor, setVendor] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        setLoading(true);
        const data = await userAPI.getPublicProfile(id);
        if (active) {
          setVendor(data.user);
          setProducts(data.products || []);
        }
      } catch (err) {
        if (active) setError(extractApiError(err, 'User not found'));
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="container-xl py-5 my-5 text-center">
        <div className="spinner-border text-rensell-primary" role="status" />
      </div>
    );
  }

  if (error || !vendor) {
    return (
      <div className="container-xl py-5 my-5 text-center">
        <i className="bi bi-person-x display-3 text-secondary opacity-50" />
        <h3 className="fw-bold mt-3">User Not Found</h3>
        <p className="text-muted">This vendor profile may have been removed or does not exist.</p>
        <Link to="/" className="btn btn-rensell mt-2">
          Return to Home
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-rensell-gradient" style={{ height: '160px' }} />

      <div className="container-xl pb-5" style={{ marginTop: '-72px' }}>
        <div className="rensell-panel p-4 p-md-5 mb-5">
          <div className="row g-4 align-items-center">
            <div className="col-12 col-md-auto text-center">
              <div className="position-relative d-inline-block">
                {vendor.profileImage ? (
                  <img
                    src={resolveImageUrl(vendor.profileImage)}
                    alt={vendor.name}
                    className="rounded-circle object-fit-cover border border-4 border-white shadow"
                    style={{ width: '116px', height: '116px' }}
                  />
                ) : (
                  <span
                    className="avatar-circle border border-4 border-white shadow"
                    style={{ width: '116px', height: '116px', fontSize: '2.5rem' }}
                  >
                    {vendor.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                )}
                {vendor.isVerified && (
                  <span
                    className="position-absolute bottom-0 end-0 bg-white rounded-circle p-1 shadow-sm"
                    title="ID Verified Member"
                  >
                    <i className="bi bi-patch-check-fill text-success fs-5" />
                  </span>
                )}
              </div>
            </div>

            <div className="col-12 col-md text-center text-md-start">
              <div className="d-flex flex-wrap align-items-center justify-content-center justify-content-md-start gap-2 mb-1">
                <h2 className="fw-bold text-dark mb-0">{vendor.name}</h2>
                {vendor.isVerified && (
                  <span className="badge bg-success bg-opacity-10 text-success rounded-pill px-3 py-1">
                    ID Verified
                  </span>
                )}
              </div>
              <p className="text-muted small mb-3">
                <i className="bi bi-calendar3 me-1" />
                Member since {new Date(vendor.createdAt).getFullYear()}
              </p>
              <div className="bg-light rounded-3 p-3 small text-start">
                <div className="text-muted fw-bold text-uppercase mb-1" style={{ fontSize: '0.7rem' }}>
                  About the Seller
                </div>
                <p className="text-secondary mb-0">
                  {vendor.bio || "This user hasn't added a bio yet."}
                </p>
              </div>
            </div>

            <div className="col-12 col-md-auto text-center">
              <div className="bg-primary bg-opacity-10 border border-primary border-opacity-25 rounded-4 px-4 py-3">
                <div className="fs-2 fw-bold text-rensell-primary lh-1">{products.length}</div>
                <div className="text-muted fw-bold text-uppercase small mt-1">Active Listings</div>
              </div>
            </div>
          </div>
        </div>

        <h4 className="fw-bold text-dark mb-4">Listings by {vendor.name}</h4>
        <ProductList
          products={products}
          emptyMessage="No active listings"
          emptySubtext="This vendor has not listed any products yet."
        />
      </div>
    </div>
  );
}
