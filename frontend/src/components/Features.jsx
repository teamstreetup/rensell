export default function Features() {
  const features = [
    { icon: 'bi-truck', color: 'text-primary', title: 'Fast Delivery', desc: 'Quick doorstep delivery on all rentals & orders' },
    { icon: 'bi-shield-lock', color: 'text-success', title: 'Secure Payment', desc: '100% encrypted Razorpay & COD checkout' },
    { icon: 'bi-arrow-counterclockwise', color: 'text-warning', title: 'Easy Returns', desc: 'Refundable deposits returned within 48 hours' },
    { icon: 'bi-headset', color: 'text-info', title: '24/7 Support', desc: 'Dedicated campus & student community support' },
  ];

  return (
    <section className="py-5 bg-white border-top border-bottom">
      <div className="container-xl">
        <div className="row g-4">
          {features.map((f) => (
            <div key={f.title} className="col-12 col-sm-6 col-lg-3">
              <div className="text-center p-4 rounded-4 h-100 border border-light-subtle bg-light bg-opacity-50">
                <div className={`fs-1 mb-3 ${f.color}`}>
                  <i className={`bi ${f.icon}`} />
                </div>
                <h5 className="fw-bold text-dark mb-2">{f.title}</h5>
                <p className="text-muted small mb-0">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
