import ProductCard from './ProductCard';

export default function ProductList({
  products = [],
  loading = false,
  error = '',
  pagination = null,
  onPageChange = null,
  emptyMessage = 'No products found',
  emptySubtext = 'Try adjusting your search or filter criteria.',
}) {
  if (loading) {
    return (
      <div className="row g-4">
        {[1, 2, 3, 4].map((n) => (
          <div key={n} className="col-12 col-sm-6 col-lg-4 col-xl-3">
            <div className="rensell-panel p-3 placeholder-glow">
              <div className="placeholder col-12 rounded-3 mb-3" style={{ height: '180px' }} />
              <div className="placeholder col-7 mb-2" />
              <div className="placeholder col-4 mb-3" />
              <div className="placeholder col-12 py-3 rounded-3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger rounded-4 d-flex align-items-center gap-2" role="alert">
        <i className="bi bi-exclamation-triangle-fill fs-5" />
        <span>{error}</span>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-5 rensell-panel">
        <div
          className="rounded-circle bg-light d-inline-flex align-items-center justify-content-center mb-3"
          style={{ width: '76px', height: '76px' }}
        >
          <i className="bi bi-box-seam fs-1 text-secondary opacity-50" />
        </div>
        <h5 className="fw-bold text-dark mb-1">{emptyMessage}</h5>
        <p className="text-muted small mb-0">{emptySubtext}</p>
      </div>
    );
  }

  return (
    <>
      <div className="row g-4">
        {products.map((product) => (
          <div key={product._id} className="col-12 col-sm-6 col-lg-4 col-xl-3">
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      {/* Bootstrap 5 Pagination */}
      {pagination && pagination.totalPages > 1 && onPageChange && (
        <nav aria-label="Product pagination" className="mt-5 d-flex justify-content-center">
          <ul className="pagination pagination-sm mb-0 gap-1">
            <li className={`page-item ${pagination.page <= 1 ? 'disabled' : ''}`}>
              <button
                type="button"
                className="page-link rounded-3"
                onClick={() => onPageChange(pagination.page - 1)}
              >
                <i className="bi bi-chevron-left" /> Previous
              </button>
            </li>
            {[...Array(pagination.totalPages)].map((_, i) => {
              const p = i + 1;
              return (
                <li key={p} className={`page-item ${pagination.page === p ? 'active' : ''}`}>
                  <button
                    type="button"
                    className={`page-link rounded-3 ${
                      pagination.page === p ? 'bg-rensell-gradient border-0 text-white fw-bold' : ''
                    }`}
                    onClick={() => onPageChange(p)}
                  >
                    {p}
                  </button>
                </li>
              );
            })}
            <li className={`page-item ${pagination.page >= pagination.totalPages ? 'disabled' : ''}`}>
              <button
                type="button"
                className="page-link rounded-3"
                onClick={() => onPageChange(pagination.page + 1)}
              >
                Next <i className="bi bi-chevron-right" />
              </button>
            </li>
          </ul>
        </nav>
      )}
    </>
  );
}
