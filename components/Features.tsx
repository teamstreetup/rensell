export default function Features() {
  const features = [
    { icon: '🚚', title: 'Fast Delivery', desc: 'Quick shipping on all orders' },
    { icon: '🛡️', title: 'Secure Payment', desc: '100% secure transactions' },
    { icon: '↩️', title: 'Easy Returns', desc: '30-day return policy' },
    { icon: '🎧', title: '24/7 Support', desc: 'Always here to help' },
  ];

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="text-center p-6 rounded-lg hover:shadow-lg transition">
              <div className="text-5xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
