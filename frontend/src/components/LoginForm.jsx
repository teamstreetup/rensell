import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function LoginForm({ onSubmit, loading = false, error = '' }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ email: email.trim(), password });
  };

  return (
    <div className="rensell-panel p-4 p-sm-5 mx-auto" style={{ maxWidth: '460px' }}>
      <div className="text-center mb-4">
        <div className="rensell-logo-mark mx-auto mb-3" style={{ width: '52px', height: '52px', fontSize: '1.35rem' }}>
          R
        </div>
        <h3 className="fw-bold text-dark mb-1">Sign in to RENSELL</h3>
        <p className="text-muted small mb-0">
          New here?{' '}
          <Link to="/auth/signup" className="text-rensell-primary fw-bold text-decoration-underline">
            Create an account
          </Link>
        </p>
      </div>

      {error && (
        <div className="alert alert-danger d-flex align-items-center gap-2 py-2 small rounded-3" role="alert">
          <i className="bi bi-x-circle-fill" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="d-grid gap-3">
        <div>
          <label htmlFor="loginEmail" className="form-label small fw-bold text-muted text-uppercase">
            Email Address
          </label>
          <div className="input-group">
            <span className="input-group-text bg-light text-muted">
              <i className="bi bi-envelope" />
            </span>
            <input
              id="loginEmail"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-control"
              placeholder="name@mitaoe.ac.in"
            />
          </div>
        </div>

        <div>
          <label htmlFor="loginPassword" className="form-label small fw-bold text-muted text-uppercase">
            Password
          </label>
          <div className="input-group">
            <span className="input-group-text bg-light text-muted">
              <i className="bi bi-lock" />
            </span>
            <input
              id="loginPassword"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-control"
              placeholder="••••••••"
            />
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn btn-rensell py-2.5 mt-2">
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" />
              Signing In...
            </>
          ) : (
            'Sign In'
          )}
        </button>
      </form>
    </div>
  );
}
