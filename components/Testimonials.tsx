export default function Testimonials() {
  const testimonials = [
    { name: 'Sarah M.', text: 'Amazing service! Rented a camera for my event and it was perfect.', rating: 5 },
    { name: 'John D.', text: 'Great prices and fast delivery. Highly recommend!', rating: 5 },
    { name: 'Emily R.', text: 'Love the variety of products. Found exactly what I needed.', rating: 5 },
  ];

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8">What Our Customers Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-gray-50 p-6 rounded-lg">
              <div className="text-accent text-2xl mb-2">{'⭐'.repeat(testimonial.rating)}</div>
              <p className="text-gray-700 mb-4 italic">“{testimonial.text}”</p>
              <strong>- {testimonial.name}</strong>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
