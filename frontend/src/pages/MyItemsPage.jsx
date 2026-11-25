import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { productAPI, extractApiError } from '../services/api';
import { useToast } from '../hooks/useToast';
import { formatINR } from '../utils/formatters';
import { resolveImageUrl, PLACEHOLDER_IMAGE } from '../utils/imageUrl';

export default function MyItemsPage() {
  const { showToast } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchMyItems = useCallback(async () => {
    try {
      setLoading(true);
      const data = await productAPI.getMine();
      setItems(data.products || []);
    } catch (err) {
      showToast(extractApiError(err, 'Failed to fetch your items'), 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchMyItems();
  }, [fetchMyItems]);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await productAPI.remove(deleteTarget._id);
      setItems((prev) => prev.filter((item) => item._id !== deleteTarget._id));
      showToast('Item deleted successfully', 'success');
      setDeleteTarget(null);
    } catch (err) {
      showToast(extractApiError(err, 'Failed to delete item'), 'error');
    } finally {
      setDeleting(false);
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
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 pb-3 mb-4 border-bottom">
        <div>
          <h3 className="fw-bold text-dark mb-1">My Listed Items</h3>
          <p className="text-muted small mb-0">
            Manage all the products you have available for rent or sale.
          </p>
        </div>
        <Link to="/dashboard/items/add" className="btn btn-rensell btn-sm px-3 py-2">
          <i className="bi bi-plus-lg me-1" /> Add New Item
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-5 bg-light rounded-4 border border-dashed">
          <i className="bi bi-box-seam display-4 text-secondary opacity-50" />
          <h5 className="fw-bold text-dark mt-3 mb-2">No items listed yet</h5>
          <p className="text-muted small mb-4 mx-auto" style={{ maxWidth: '340px' }}>
            Start earning by listing your underused gadgets, furniture, or textbooks for rent or sale.
          </p>
          <Link to="/dashboard/items/add" className="btn btn-dark rounded-3 px-4">
            List Your First Item
          </Link>
        </div>
      ) : (
        <div className="row g-4">
          {items.map((item) => {
            const isRent = item.type === 'rent';
            return (
              <div key={item._id} className="col-12 col-sm-6 col-lg-4">
                <div className="rensell-card h-100 d-flex flex-column">
                  <div className="product-img-wrapper">
                    <img
                      src={resolveImageUrl(item.image)}
                      alt={item.name}
                      onError={(e) => {
                        e.currentTarget.src = PLACEHOLDER_IMAGE;
                      }}
                    />
                    <span
                      className={`position-absolute top-0 start-0 m-2 bg-white shadow-sm ${
                        isRent ? 'badge-rensell-rent' : 'badge-rensell-sale'
                      }`}
                    >
                      {isRent ? 'RENT' : 'SALE'}
                    </span>
                  </div>

                  <div className="p-3 d-flex flex-column flex-grow-1 justify-content-between">
                    <h6 className="fw-bold text-dark text-truncate mb-3" title={item.name}>
                      {item.name}
                    </h6>

                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <div className="text-muted" style={{ fontSize: '0.7rem' }}>
                          Price
                        </div>
                        <div className="fw-bold text-rensell-primary fs-6">
                          {formatINR(item.price)}
                          {isRent && <span className="small text-muted fw-normal">/d</span>}
                        </div>
                      </div>

                      <div className="btn-group btn-group-sm" role="group">
                        <Link
                          to={`/dashboard/items/${item._id}/edit`}
                          className="btn btn-outline-primary"
                          title="Edit item"
                        >
                          <i className="bi bi-pencil" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(item)}
                          className="btn btn-outline-danger"
                          title="Delete item"
                        >
                          <i className="bi bi-trash" />
                        </button>
                        <Link
                          to={`/products/${item._id}`}
                          className="btn btn-outline-secondary"
                          title="View live listing"
                        >
                          <i className="bi bi-box-arrow-up-right" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Bootstrap 5 Delete Confirmation Modal */}
      {deleteTarget && (
        <>
          <div className="modal-backdrop fade show" />
          <div className="modal fade show d-block" tabIndex="-1" role="dialog">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content rounded-4 border-0 shadow-lg">
                <div className="modal-header border-bottom-0">
                  <h5 className="modal-title fw-bold text-danger">
                    <i className="bi bi-exclamation-triangle-fill me-2" /> Delete Listing
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => !deleting && setDeleteTarget(null)}
                  />
                </div>
                <div className="modal-body pt-0">
                  <p className="text-secondary mb-0">
                    Are you sure you want to permanently delete <strong>{deleteTarget.name}</strong>? This action cannot be undone.
                  </p>
                </div>
                <div className="modal-footer border-top-0">
                  <button
                    type="button"
                    className="btn btn-light rounded-3"
                    disabled={deleting}
                    onClick={() => setDeleteTarget(null)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger rounded-3"
                    disabled={deleting}
                    onClick={confirmDelete}
                  >
                    {deleting ? 'Deleting...' : 'Delete Permanently'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
