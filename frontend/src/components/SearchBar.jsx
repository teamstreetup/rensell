import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function SearchBar({ className = '', placeholder = 'Search rentals, electronics...', onSubmitted }) {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('search') || '');
  const navigate = useNavigate();

  useEffect(() => {
    setQuery(searchParams.get('search') || '');
  }, [searchParams]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      navigate(`/?search=${encodeURIComponent(trimmed)}`);
    } else {
      navigate('/');
    }
    onSubmitted?.();
  };

  return (
    <form onSubmit={handleSubmit} className={className} role="search">
      <div className="input-group">
        <span className="input-group-text bg-light border-end-0 rounded-start-pill text-muted ps-3">
          <i className="bi bi-search small" />
        </span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          aria-label="Search products"
          className="form-control form-control-sm bg-light border-start-0 rounded-end-pill py-2 pe-3"
        />
      </div>
    </form>
  );
}
