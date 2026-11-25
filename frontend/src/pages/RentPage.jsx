import { useState, useEffect, useCallback } from 'react';
import { productAPI, extractApiError } from '../services/api';
import CategoryFilter from '../components/CategoryFilter';
import ProductList from '../components/ProductList';

export default function RentPage() {
  const [category, setCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchRentals = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const params = { type: 'rent', page, limit: 8, sort: sortBy };
      if (category !== 'all') params.category = category;
      const data = await productAPI.getAll(params);
      setProducts(data.products || []);
      setPagination(data.pagination || null);
    } catch (err) {
      setError(extractApiError(err, 'Failed to load rental products'));
    } finally {
      setLoading(false);
    }
  }, [category, sortBy, page]);

  useEffect(() => {
    setPage(1);
  }, [category, sortBy]);

  useEffect(() => {
    fetchRentals();
  }, [fetchRentals]);

  return (
    <div>
      <section className="page-banner-rent text-white py-5 text-center">
        <div className="container-xl py-3">
          <div
            className="d-inline-flex align-items-center justify-content-center rounded-4 bg-white bg-opacity-10 border border-white border-opacity-25 mb-3"
            style={{ width: '58px', height: '58px' }}
          >
            <i className="bi bi-clock-history fs-3" />
          </div>
          <h1 className="display-5 fw-bold mb-2">Rent Products</h1>
          <p className="text-white-50 text-uppercase fw-bold small mb-0" style={{ letterSpacing: '0.12em' }}>
            Affordable daily rentals for every occasion
          </p>
        </div>
      </section>

      <section className="py-5">
        <div className="container-xl">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
            <div>
              <h3 className="fw-bold text-dark mb-1">Available for Rent</h3>
              <p className="text-muted small mb-0">Flexible daily plans with refundable security deposits</p>
            </div>
            <span className="badge-rensell-rent px-3 py-2">
              {pagination?.total ?? products.length} Items Found
            </span>
          </div>

          <CategoryFilter
            selectedCategory={category}
            onSelectCategory={setCategory}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />

          <ProductList
            products={products}
            loading={loading}
            error={error}
            pagination={pagination}
            onPageChange={setPage}
          />
        </div>
      </section>
    </div>
  );
}
