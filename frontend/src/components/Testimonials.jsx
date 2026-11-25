export default function Testimonials() {
  const testimonials = [
    {
      name: 'Sarah M.',
      role: 'Final Year Student',
      text: 'Amazing service! Rented a study desk and ergonomic chair for exam season and both arrived in pristine condition.',
      rating: 5,
    },
    {
      name: 'Rohan K.',
      role: 'Verified Buyer',
      text: 'Great prices and super smooth Razorpay checkout. Love that every vendor is verified with a college ID.',
      rating: 5,
    },
    {
      name: 'Priya D.',
      role: 'Campus Vendor',
      text: 'Listed my headphones and earned money immediately. Managing listings and tracking orders is effortless.',
      rating: 5,
    },
  ];

  return (
    <section className="py-5">
      <div className="container-xl">
        <div className="text-center mb-5">
          <h2 className="fw-bold text-dark">What Our Community Says</h2>
          <p className="text-muted">Trusted by students and verified members across campus.</p>
        </div>
        <div className="row g-4">
          {testimonials.map((t) => (
            <div key={t.name} className="col-12 col-md-4">
              <div className="rensell-panel p-4 h-100 d-flex flex-column">
                <div className="text-warning mb-3">
                  {[...Array(t.rating)].map((_, i) => (
                    <i key={i} className="bi bi-star-fill me-1" />
                  ))}
                </div>
                <p className="text-secondary fst-italic flex-grow-1">&ldquo;{t.text}&rdquo;</p>
                <div className="pt-3 border-top">
                  <div className="fw-bold text-dark small">{t.name}</div>
                  <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                    {t.role}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
