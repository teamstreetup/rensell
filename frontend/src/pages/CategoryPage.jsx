import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { productAPI, extractApiError } from '../services/api';
import ProductList from '../components/ProductList';

const CATEGORY_META = {
  electronics: {
    title: 'Electronics',
    subtitle: 'Latest gadgets and technology at your fingertips',
    icon: 'bi-cpu',
    bannerClass: 'page-banner-electronics',
  },
  furniture: {
    title: 'Furniture',
    subtitle: 'Quality furniture for your hostel, home, and office',
    icon: 'bi-lamp',
    bannerClass: 'page-banner-furniture',
  },
};

export default function CategoryPage({ fixedCategory }) {
  const params = useParams();
  const categoryName = (fixedCategory || params.category || 'electronics').toLowerCase();
  const meta = CATEGORY_META[categoryName] || {
    title: categoryName.charAt(0).toUpperCase() + categoryName.slice(1),
    subtitle: `Browse all ${categoryName} listings to rent or buy`,
    icon: 'bi-box-seam',
    bannerClass: 'page-banner-rent',
  };

  const [typeFilter, setTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const reqParams = { category: categoryName, page, limit: 8, sort: sortBy };
      if (typeFilter !== 'all') reqParams.type = typeFilter;
      const data = await productAPI.getAll(reqParams);
      setProducts(data.products || []);
      setPagination(data.pagination || null);
    } catch (err) {
      setError(extractApiError(err, 'Failed to load category items'));
    } finally {
      setLoading(false);
    }
  }, [categoryName, typeFilter, sortBy, page]);

  useEffect(() => {
    setPage(1);
  }, [categoryName, typeFilter, sortBy]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return (
    <div>
      <section className={`${meta.bannerClass} text-white py-5 text-center`}>
        <div className="container-xl py-3">
          <div
            className="d-inline-flex align-items-center justify-content-center rounded-4 bg-white bg-opacity-10 border border-white border-opacity-25 mb-3"
            style={{ width: '58px', height: '58px' }}
          >
            <i className={`bi ${meta.icon} fs-3`} />
          </div>
          <h1 className="display-5 fw-bold mb-2">{meta.title}</h1>
          <p className="text-white-50 text-uppercase fw-bold small mb-0" style={{ letterSpacing: '0.12em' }}>
            {meta.subtitle}
          </p>
        </div>
      </section>

      <section className="py-5">
        <div className="container-xl">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
            <div>
              <h3 className="fw-bold text-dark mb-1">{meta.title} Products</h3>
              <p className="text-muted small mb-0">
                {pagination?.total ?? products.length} item{(pagination?.total ?? products.length) !== 1 ? 's' : ''} available
              </p>
            </div>
            <div className="d-flex gap-2">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="form-select form-select-sm rounded-3 fw-semibold"
              >
                <option value="all">Rent &amp; Buy</option>
                <option value="rent">For Rent</option>
                <option value="sale">For Sale</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="form-select form-select-sm rounded-3 fw-semibold"
              >
                <option value="newest">Newest First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>

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
