import { Link } from 'react-router-dom';

export default function Hero() {
  return (
    <section className="rensell-hero text-white py-5">
      <div className="container-xl py-lg-5">
        <div className="row align-items-center g-5">
          {/* Left Content */}
          <div className="col-12 col-lg-7 text-center text-lg-start">
            <span className="badge rounded-pill bg-white bg-opacity-10 border border-white border-opacity-25 text-light px-3 py-2 mb-4 text-uppercase fw-semibold">
              <i className="bi bi-patch-check-fill text-success me-2" />
              Trusted Full-Stack Marketplace
            </span>

            <h1 className="display-4 fw-bold lh-sm mb-3">
              Rent what you need,
              <br />
              <span className="text-rensell-gradient">Buy what you love</span>
            </h1>

            <p className="lead text-secondary mb-4 mx-auto mx-lg-0" style={{ maxWidth: '540px', fontSize: '1.05rem' }}>
              Your ultimate marketplace for top-tier rentals and quality purchases. Access premium items at unmatched daily rates or own permanently.
            </p>

            <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center justify-content-lg-start mb-5">
              <Link to="/rent" className="btn btn-light btn-lg fw-bold px-4 rounded-3 text-dark">
                <i className="bi bi-clock-history text-rensell-secondary me-2" />
                Browse Rentals
              </Link>
              <Link to="/sell" className="btn btn-rensell btn-lg fw-bold px-4 rounded-3">
                <i className="bi bi-bag-fill me-2" />
                Shop Products
              </Link>
            </div>

            <div className="row g-3 pt-4 border-top border-white border-opacity-10 text-center text-lg-start">
              {[
                { value: '1,200+', label: 'Listings', icon: 'bi-box-seam' },
                { value: '4.9/5.0', label: 'Satisfaction', icon: 'bi-star-fill' },
                { value: '48h', label: 'Return Guarantee', icon: 'bi-arrow-counterclockwise' },
              ].map((stat) => (
                <div key={stat.label} className="col-4">
                  <div className="fw-bold fs-5 d-flex align-items-center justify-content-center justify-content-lg-start gap-2">
                    <i className={`bi ${stat.icon} text-rensell-primary small`} />
                    <span>{stat.value}</span>
                  </div>
                  <div className="text-secondary text-uppercase fw-bold" style={{ fontSize: '0.68rem' }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Highlight Card */}
          <div className="col-12 col-lg-5 d-none d-lg-block">
            <div className="position-relative">
              <div className="rensell-hero-card p-3 mx-auto" style={{ maxWidth: '360px' }}>
                <div className="position-relative rounded-3 overflow-hidden mb-3" style={{ aspectRatio: '4/3' }}>
                  <img
                    src="/photo/chair .webp"
                    alt="Executive Ergonomic Chair"
                    className="w-100 h-100 object-fit-cover"
                  />
                  <span className="badge bg-rensell-gradient position-absolute top-0 start-0 m-2 px-2 py-1">
                    HOT DEAL
                  </span>
                </div>
                <h5 className="fw-bold text-white mb-1">Nordic Ergonomic Lounge Chair</h5>
                <p className="text-secondary text-uppercase fw-semibold mb-3" style={{ fontSize: '0.72rem' }}>
                  Furniture &bull; Mint Condition
                </p>
                <div className="d-flex justify-content-between align-items-center pt-3 border-top border-white border-opacity-10">
                  <div>
                    <div className="text-secondary text-uppercase fw-bold" style={{ fontSize: '0.65rem' }}>
                      Daily Rental
                    </div>
                    <div className="fs-5 fw-bold text-white">
                      ₹299<span className="fs-6 fw-normal text-secondary">/day</span>
                    </div>
                  </div>
                  <Link to="/rent" className="btn btn-rensell btn-sm px-3 py-2">
                    RENT NOW
                  </Link>
                </div>
              </div>

              <div
                className="bg-white text-dark rounded-4 shadow-lg p-3 d-inline-flex align-items-center gap-3 position-absolute bottom-0 end-0"
                style={{ transform: 'translate(10px, 16px)' }}
              >
                <span className="bg-success bg-opacity-10 text-success rounded-3 p-2">
                  <i className="bi bi-shield-check fs-5" />
                </span>
                <div>
                  <div className="fw-bold small lh-1">Verified Vendors</div>
                  <div className="text-muted text-uppercase fw-semibold" style={{ fontSize: '0.65rem' }}>
                    100% Secure Escrow
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
