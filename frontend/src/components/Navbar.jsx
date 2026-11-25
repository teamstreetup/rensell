import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import { useToast } from '../hooks/useToast';
import SearchBar from './SearchBar';

const NAV_LINKS = [
  { to: '/', label: 'Home', icon: 'bi-house-door' },
  { to: '/rent', label: 'Rent', icon: 'bi-clock-history' },
  { to: '/sell', label: 'Buy', icon: 'bi-bag' },
  { to: '/electronics', label: 'Electronics', icon: 'bi-cpu' },
  { to: '/furniture', label: 'Furniture', icon: 'bi-lamp' },
];

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { cartCount } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [scrolled, setScrolled] = useState(false);
  const [offcanvasOpen, setOffcanvasOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleSignOut = () => {
    logout();
    setDropdownOpen(false);
    setOffcanvasOpen(false);
    showToast('Logged out successfully', 'info');
    navigate('/');
  };

  return (
    <>
      <nav className={`navbar navbar-expand-lg sticky-top rensell-navbar py-2 ${scrolled ? 'scrolled' : ''}`}>
        <div className="container-xl gap-3">
          {/* Brand Logo */}
          <Link to="/" className="navbar-brand d-flex align-items-center gap-2 text-decoration-none me-0">
            <span className="rensell-logo-mark">R</span>
            <span className="d-flex flex-column lh-1">
              <span className="fw-black text-dark fs-5" style={{ fontWeight: 900, letterSpacing: '0.06em' }}>
                RENSELL
              </span>
              <span className="text-muted text-uppercase fw-bold" style={{ fontSize: '0.6rem', letterSpacing: '0.16em' }}>
                Rent &amp; Sell
              </span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="d-none d-lg-flex align-items-center gap-1 mx-auto">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  `nav-pill-rensell d-inline-flex align-items-center gap-1 text-uppercase ${
                    isActive ? 'active' : ''
                  }`
                }
                style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}
              >
                <i className={`bi ${link.icon}`} />
                <span>{link.label}</span>
              </NavLink>
            ))}
          </div>

          {/* Desktop Search Bar */}
          <SearchBar className="d-none d-md-block flex-grow-1" placeholder="Search rentals, electronics..." />

          {/* Right Action Controls */}
          <div className="d-flex align-items-center gap-2 ms-auto ms-md-0">
            {/* Cart Link */}
            <Link
              to="/cart"
              className="btn btn-rensell-outline btn-sm d-inline-flex align-items-center gap-2 px-3 py-2 position-relative text-decoration-none"
            >
              <i className="bi bi-cart3 fs-6" />
              <span className="d-none d-sm-inline text-uppercase" style={{ fontSize: '0.74rem' }}>
                Cart
              </span>
              {cartCount > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                  {cartCount}
                  <span className="visually-hidden">items in cart</span>
                </span>
              )}
            </Link>

            {/* User Auth Dropdown / Sign In */}
            {isAuthenticated ? (
              <div className="dropdown d-none d-sm-block position-relative">
                <button
                  type="button"
                  onClick={() => setDropdownOpen((o) => !o)}
                  className="btn btn-light border rounded-3 d-inline-flex align-items-center gap-2 py-1 px-2"
                  aria-expanded={dropdownOpen}
                >
                  <span className="avatar-circle" style={{ width: '32px', height: '32px', fontSize: '0.8rem' }}>
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                  <span className="fw-bold small text-dark text-truncate" style={{ maxWidth: '95px' }}>
                    {user?.name}
                  </span>
                  <i className={`bi bi-chevron-${dropdownOpen ? 'up' : 'down'} small text-muted`} />
                </button>

                {dropdownOpen && (
                  <>
                    <div
                      className="position-fixed top-0 start-0 w-100 h-100"
                      style={{ zIndex: 1040 }}
                      onClick={() => setDropdownOpen(false)}
                    />
                    <ul
                      className="dropdown-menu dropdown-menu-end show shadow-lg border-0 rounded-4 p-2 mt-2"
                      style={{ minWidth: '220px', zIndex: 1050, right: 0 }}
                    >
                      <li className="px-3 py-2 border-bottom mb-1">
                        <div className="text-muted text-uppercase fw-bold" style={{ fontSize: '0.65rem' }}>
                          Signed in as
                        </div>
                        <div className="fw-bold small text-dark text-truncate">{user?.name}</div>
                        <div className="text-muted text-truncate" style={{ fontSize: '0.72rem' }}>
                          {user?.email}
                        </div>
                      </li>
                      <li>
                        <Link
                          to="/dashboard/items"
                          className="dropdown-item rounded-3 py-2 fw-semibold small d-flex align-items-center gap-2"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <i className="bi bi-box-seam text-muted" /> My Items
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/dashboard/items/add"
                          className="dropdown-item rounded-3 py-2 fw-semibold small d-flex align-items-center gap-2"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <i className="bi bi-plus-circle text-muted" /> List an Item
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/dashboard/orders"
                          className="dropdown-item rounded-3 py-2 fw-semibold small d-flex align-items-center gap-2"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <i className="bi bi-bag-check text-muted" /> Rentals &amp; Orders
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/dashboard/settings"
                          className="dropdown-item rounded-3 py-2 fw-semibold small d-flex align-items-center gap-2"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <i className="bi bi-gear text-muted" /> Profile Settings
                        </Link>
                      </li>
                      {isAdmin && (
                        <li>
                          <Link
                            to="/dashboard/admin"
                            className="dropdown-item rounded-3 py-2 fw-bold small text-rensell-primary d-flex align-items-center gap-2"
                            onClick={() => setDropdownOpen(false)}
                          >
                            <i className="bi bi-shield-lock" /> Admin Portal
                          </Link>
                        </li>
                      )}
                      <li>
                        <hr className="dropdown-divider my-1" />
                      </li>
                      <li>
                        <button
                          type="button"
                          onClick={handleSignOut}
                          className="dropdown-item rounded-3 py-2 fw-bold small text-danger d-flex align-items-center gap-2"
                        >
                          <i className="bi bi-box-arrow-right" /> Logout
                        </button>
                      </li>
                    </ul>
                  </>
                )}
              </div>
            ) : (
              <Link to="/auth/login" className="btn btn-rensell btn-sm px-3 py-2 d-none d-sm-inline-flex align-items-center gap-1">
                <i className="bi bi-person-circle" />
                <span>Sign In</span>
              </Link>
            )}

            {/* Mobile Offcanvas Trigger */}
            <button
              type="button"
              className="btn btn-light border rounded-3 d-lg-none px-2 py-1"
              onClick={() => setOffcanvasOpen(true)}
              aria-label="Open navigation menu"
            >
              <i className="bi bi-list fs-4" />
            </button>
          </div>
        </div>
      </nav>

      {/* Bootstrap 5 Offcanvas Mobile Navigation */}
      {offcanvasOpen && (
        <>
          <div className="offcanvas-backdrop fade show" onClick={() => setOffcanvasOpen(false)} />
          <div
            className="offcanvas offcanvas-end show"
            tabIndex="-1"
            style={{ visibility: 'visible', maxWidth: '320px' }}
          >
            <div className="offcanvas-header border-bottom">
              <div className="d-flex align-items-center gap-2">
                <span className="rensell-logo-mark" style={{ width: '32px', height: '32px', fontSize: '0.9rem' }}>
                  R
                </span>
                <h5 className="offcanvas-title fw-bold mb-0">RENSELL Menu</h5>
              </div>
              <button
                type="button"
                className="btn-close"
                aria-label="Close"
                onClick={() => setOffcanvasOpen(false)}
              />
            </div>

            <div className="offcanvas-body d-flex flex-column">
              <div className="mb-3">
                <SearchBar onSubmitted={() => setOffcanvasOpen(false)} />
              </div>

              <div className="nav flex-column gap-1 mb-4">
                {NAV_LINKS.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.to === '/'}
                    onClick={() => setOffcanvasOpen(false)}
                    className={({ isActive }) =>
                      `nav-pill-rensell d-flex align-items-center gap-2 ${isActive ? 'active' : ''}`
                    }
                  >
                    <i className={`bi ${link.icon}`} />
                    <span>{link.label}</span>
                  </NavLink>
                ))}
              </div>

              <div className="mt-auto border-top pt-3">
                {isAuthenticated ? (
                  <div className="d-grid gap-2">
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <span className="avatar-circle">{user?.name?.charAt(0)?.toUpperCase() || 'U'}</span>
                      <div className="overflow-hidden">
                        <div className="fw-bold small text-truncate">{user?.name}</div>
                        <div className="text-muted text-truncate" style={{ fontSize: '0.72rem' }}>
                          {user?.email}
                        </div>
                      </div>
                    </div>
                    <Link
                      to="/dashboard/items"
                      className="btn btn-rensell btn-sm"
                      onClick={() => setOffcanvasOpen(false)}
                    >
                      <i className="bi bi-speedometer2 me-1" /> User Dashboard
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/dashboard/admin"
                        className="btn btn-rensell-secondary btn-sm"
                        onClick={() => setOffcanvasOpen(false)}
                      >
                        <i className="bi bi-shield-lock me-1" /> Admin Portal
                      </Link>
                    )}
                    <button type="button" onClick={handleSignOut} className="btn btn-outline-danger btn-sm">
                      <i className="bi bi-box-arrow-right me-1" /> Logout
                    </button>
                  </div>
                ) : (
                  <div className="d-grid gap-2">
                    <Link
                      to="/auth/login"
                      className="btn btn-rensell"
                      onClick={() => setOffcanvasOpen(false)}
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/auth/signup"
                      className="btn btn-rensell-outline"
                      onClick={() => setOffcanvasOpen(false)}
                    >
                      Create Account
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
