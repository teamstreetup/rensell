import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../hooks/useToast';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');
  const { showToast } = useToast();

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    showToast('Subscribed to RENSELL deals & updates!', 'success');
    setEmail('');
  };

  return (
    <footer className="bg-rensell-dark text-white mt-auto">
      <div className="container-xl py-5">
        <div className="row g-4 g-lg-5">
          {/* Brand */}
          <div className="col-12 col-md-6 col-lg-3">
            <div className="d-flex align-items-center gap-2 mb-3">
              <span className="rensell-logo-mark" style={{ width: '36px', height: '36px', fontSize: '0.95rem' }}>
                R
              </span>
              <span className="fs-5 fw-bold tracking-tight">RENSELL</span>
            </div>
            <p className="text-secondary small mb-4">
              Your trusted campus &amp; community platform for renting and buying quality electronics, furniture, and everyday essentials.
            </p>
            <div className="d-flex gap-2">
              {['bi-facebook', 'bi-instagram', 'bi-twitter-x', 'bi-youtube'].map((icon) => (
                <a
                  key={icon}
                  href="#top"
                  onClick={(e) => {
                    e.preventDefault();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="btn btn-sm btn-outline-secondary rounded-3 text-light border-secondary"
                  aria-label={icon}
                >
                  <i className={`bi ${icon}`} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-6 col-md-3 col-lg-3">
            <h6 className="text-uppercase fw-bold small text-light mb-3">Quick Links</h6>
            <ul className="list-unstyled d-grid gap-2 small">
              {[
                { label: 'Home', to: '/' },
                { label: 'Rent Products', to: '/rent' },
                { label: 'Buy Products', to: '/sell' },
                { label: 'Electronics', to: '/electronics' },
                { label: 'Furniture', to: '/furniture' },
              ].map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className="text-secondary text-decoration-none d-inline-flex align-items-center gap-1">
                    <i className="bi bi-chevron-right text-rensell-primary" style={{ fontSize: '0.7rem' }} />
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div className="col-6 col-md-3 col-lg-2">
            <h6 className="text-uppercase fw-bold small text-light mb-3">Account</h6>
            <ul className="list-unstyled d-grid gap-2 small">
              {[
                { label: 'My Cart', to: '/cart' },
                { label: 'My Orders', to: '/orders' },
                { label: 'My Listings', to: '/dashboard/items' },
                { label: 'List an Item', to: '/dashboard/items/add' },
                { label: 'Profile Settings', to: '/dashboard/settings' },
              ].map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className="text-secondary text-decoration-none d-inline-flex align-items-center gap-1">
                    <i className="bi bi-chevron-right text-rensell-primary" style={{ fontSize: '0.7rem' }} />
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="col-12 col-lg-4">
            <h6 className="text-uppercase fw-bold small text-light mb-3">Stay Updated</h6>
            <p className="text-secondary small mb-3">
              Subscribe for exclusive campus rental deals and new arrivals.
            </p>
            <form onSubmit={handleSubscribe} className="input-group mb-4">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@mitaoe.ac.in"
                className="form-control bg-dark text-white border-secondary rounded-start-3"
              />
              <button type="submit" className="btn btn-rensell rounded-end-3 px-3" aria-label="Subscribe">
                <i className="bi bi-send-fill" />
              </button>
            </form>

            <div className="d-flex flex-wrap gap-3 pt-3 border-top border-secondary border-opacity-25 small text-secondary">
              <span>
                <i className="bi bi-shield-check text-success me-1" />
                Secure Escrow
              </span>
              <span>
                <i className="bi bi-truck text-info me-1" />
                Fast Delivery
              </span>
              <span>
                <i className="bi bi-arrow-counterclockwise text-warning me-1" />
                Easy Returns
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="border-top border-secondary border-opacity-25">
        <div className="container-xl py-3 d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2 small text-secondary">
          <span>&copy; {currentYear} RENSELL. All rights reserved.</span>
          <span>
            Made with <i className="bi bi-heart-fill text-danger" /> in India
          </span>
        </div>
      </div>
    </footer>
  );
}
