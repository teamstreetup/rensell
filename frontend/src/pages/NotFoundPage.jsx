import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="container-xl py-5 my-5 text-center">
      <div className="display-1 fw-bold text-rensell-primary">404</div>
      <h2 className="fw-bold text-dark mb-2">Page Not Found</h2>
      <p className="text-muted mb-4">
        The page you are looking for doesn&apos;t exist or has been moved.
      </p>
      <Link to="/" className="btn btn-rensell px-4 py-2">
        <i className="bi bi-house-door me-2" /> Back to Home
      </Link>
    </div>
  );
}
