const CATEGORIES = [
  { value: 'all', label: 'All Categories', icon: 'bi-grid' },
  { value: 'electronics', label: 'Electronics', icon: 'bi-cpu' },
  { value: 'furniture', label: 'Furniture', icon: 'bi-lamp' },
  { value: 'stationery', label: 'Stationery', icon: 'bi-journal-bookmark' },
  { value: 'lifestyle', label: 'Lifestyle', icon: 'bi-cup-straw' },
  { value: 'vehicles', label: 'Vehicles', icon: 'bi-bicycle' },
  { value: 'tools', label: 'Tools', icon: 'bi-tools' },
  { value: 'other', label: 'Other', icon: 'bi-box-seam' },
];

export default function CategoryFilter({
  selectedCategory = 'all',
  onSelectCategory,
  selectedType = 'all',
  onSelectType,
  sortBy = 'newest',
  onSortChange,
}) {
  return (
    <div className="rensell-panel p-3 p-md-4 mb-4">
      <div className="row g-3 align-items-center justify-content-between">
        {/* Category pills */}
        <div className="col-12 col-lg-8">
          <div className="d-flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat.value;
              return (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => onSelectCategory?.(cat.value)}
                  className={`btn btn-sm d-inline-flex align-items-center gap-1 px-3 py-2 rounded-pill fw-semibold ${
                    active ? 'btn-rensell' : 'btn-rensell-outline'
                  }`}
                >
                  <i className={`bi ${cat.icon}`} />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Mode & Sort controls */}
        <div className="col-12 col-lg-4">
          <div className="d-flex flex-wrap flex-sm-nowrap gap-2 justify-content-lg-end">
            {onSelectType && (
              <select
                value={selectedType}
                onChange={(e) => onSelectType(e.target.value)}
                className="form-select form-select-sm rounded-3 fw-semibold"
                aria-label="Filter by listing type"
              >
                <option value="all">Rent &amp; Buy</option>
                <option value="rent">For Rent Only</option>
                <option value="sale">For Sale Only</option>
              </select>
            )}
            {onSortChange && (
              <select
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value)}
                className="form-select form-select-sm rounded-3 fw-semibold"
                aria-label="Sort products"
              >
                <option value="newest">Newest First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
