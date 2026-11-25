import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productAPI, extractApiError } from '../services/api';
import Hero from '../components/Hero';
import CategoryFilter from '../components/CategoryFilter';
import ProductList from '../components/ProductList';
import Features from '../components/Features';
import Testimonials from '../components/Testimonials';

const PAGE_LIMIT = 8;

export default function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchTerm = searchParams.get('search') || '';

  const [category, setCategory] = useState('all');
  const [type, setType] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);

  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const params = {
        page,
        limit: PAGE_LIMIT,
        sort: sortBy,
      };
      if (category !== 'all') params.category = category;
      if (type !== 'all') params.type = type;
      if (searchTerm) params.search = searchTerm;

      const data = await productAPI.getAll(params);
      setProducts(data.products || []);
      setPagination(data.pagination || null);
    } catch (err) {
      setError(extractApiError(err, 'Failed to load products. Please try again.'));
    } finally {
      setLoading(false);
    }
  }, [category, type, sortBy, searchTerm, page]);

  useEffect(() => {
    setPage(1);
  }, [category, type, sortBy, searchTerm]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const clearSearch = () => {
    setSearchParams({});
  };

  return (
    <>
      {!searchTerm && <Hero />}

      <section className="py-5">
        <div className="container-xl">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end gap-3 mb-4">
            <div>
              <h2 className="fw-bold text-dark mb-1">
                {searchTerm ? `Search Results for "${searchTerm}"` : 'Featured Products'}
              </h2>
              <p className="text-muted mb-0">
                Handpicked products at unbeatable prices — rent or own today.
              </p>
            </div>
            <div className="d-flex align-items-center gap-2">
              {searchTerm && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="btn btn-sm btn-outline-secondary rounded-pill px-3"
                >
                  <i className="bi bi-x-lg me-1" /> Clear Search
                </button>
              )}
              {pagination && (
                <span className="badge text-bg-light border text-dark px-3 py-2 rounded-pill">
                  {pagination.total} Item{pagination.total !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>

          <CategoryFilter
            selectedCategory={category}
            onSelectCategory={setCategory}
            selectedType={type}
            onSelectType={setType}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />

          <ProductList
            products={products}
            loading={loading}
            error={error}
            pagination={pagination}
            onPageChange={setPage}
            emptyMessage="No matching products found"
            emptySubtext="Check back later or clear your active filters!"
          />
        </div>
      </section>

      <Features />
      <Testimonials />
    </>
  );
}
