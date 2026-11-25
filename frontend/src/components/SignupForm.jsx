import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function SignupForm({ onSubmit, loading = false, error = '' }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setLocalError('');

    if (name.trim().length < 2) {
      setLocalError('Name must be at least 2 characters');
      return;
    }

    if (!email.trim().toLowerCase().endsWith('@mitaoe.ac.in')) {
      setLocalError('Only college emails ending with @mitaoe.ac.in are allowed');
      return;
    }

    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters');
      return;
    }

    onSubmit({ name: name.trim(), email: email.trim(), password });
  };

  const displayError = localError || error;

  return (
    <div className="rensell-panel p-4 p-sm-5 mx-auto" style={{ maxWidth: '460px' }}>
      <div className="text-center mb-4">
        <div className="rensell-logo-mark mx-auto mb-3" style={{ width: '52px', height: '52px', fontSize: '1.35rem' }}>
          R
        </div>
        <h3 className="fw-bold text-dark mb-1">Create your account</h3>
        <p className="text-muted small mb-0">
          Already have an account?{' '}
          <Link to="/auth/login" className="text-rensell-primary fw-bold text-decoration-underline">
            Sign in
          </Link>
        </p>
      </div>

      {displayError && (
        <div className="alert alert-danger d-flex align-items-center gap-2 py-2 small rounded-3" role="alert">
          <i className="bi bi-x-circle-fill" />
          <span>{displayError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="d-grid gap-3">
        <div>
          <label htmlFor="signupName" className="form-label small fw-bold text-muted text-uppercase">
            Full Name
          </label>
          <div className="input-group">
            <span className="input-group-text bg-light text-muted">
              <i className="bi bi-person" />
            </span>
            <input
              id="signupName"
              type="text"
              required
              minLength={2}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="form-control"
              placeholder="Atharv Jadhav"
            />
          </div>
        </div>

        <div>
          <label htmlFor="signupEmail" className="form-label small fw-bold text-muted text-uppercase">
            College Email Address
          </label>
          <div className="input-group">
            <span className="input-group-text bg-light text-muted">
              <i className="bi bi-envelope" />
            </span>
            <input
              id="signupEmail"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-control"
              placeholder="you@mitaoe.ac.in"
            />
          </div>
          <div className="form-text small">
            Must end with <strong>@mitaoe.ac.in</strong> for campus KYC verification.
          </div>
        </div>

        <div>
          <label htmlFor="signupPassword" className="form-label small fw-bold text-muted text-uppercase">
            Password
          </label>
          <div className="input-group">
            <span className="input-group-text bg-light text-muted">
              <i className="bi bi-lock" />
            </span>
            <input
              id="signupPassword"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-control"
              placeholder="••••••••"
            />
          </div>
          <div className="form-text small">Must be at least 6 characters.</div>
        </div>

        <button type="submit" disabled={loading} className="btn btn-rensell py-2.5 mt-2">
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" />
              Creating Account...
            </>
          ) : (
            'Sign Up'
          )}
        </button>
      </form>
    </div>
  );
}
