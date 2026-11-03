import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-dark text-white">
      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center">
                <span className="text-white font-black text-sm">R</span>
              </div>
              <h3 className="text-xl font-extrabold tracking-tight">RENSELL</h3>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-5 max-w-xs">
              Your trusted platform for renting and buying quality products. Get the best deals on electronics, furniture, and more.
            </p>
            <div className="flex gap-3">
              {[
                { icon: 'fa-brands fa-facebook-f', href: '#' },
                { icon: 'fa-brands fa-instagram', href: '#' },
                { icon: 'fa-brands fa-twitter', href: '#' },
                { icon: 'fa-brands fa-youtube', href: '#' },
              ].map((social) => (
                <a
                  key={social.icon}
                  href={social.href}
                  className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:bg-primary hover:text-white hover:border-primary transition-all duration-200"
                >
                  <i className={`${social.icon} text-sm`} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider text-gray-300 mb-4">Quick Links</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'Home', href: '/' },
                { label: 'Rent Products', href: '/rent' },
                { label: 'Buy Products', href: '/sell' },
                { label: 'Electronics', href: '/electronics' },
                { label: 'Furniture', href: '/furniture' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-gray-400 hover:text-white text-sm transition-colors inline-flex items-center gap-2 group">
                    <i className="fas fa-chevron-right text-[8px] text-gray-600 group-hover:text-primary transition-colors" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider text-gray-300 mb-4">Support</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'Shipping Info', href: '#' },
                { label: 'Returns & Refunds', href: '#' },
                { label: 'Terms & Conditions', href: '#' },
                { label: 'Privacy Policy', href: '#' },
                { label: 'Contact Us', href: '#' },
              ].map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-gray-400 hover:text-white text-sm transition-colors inline-flex items-center gap-2 group">
                    <i className="fas fa-chevron-right text-[8px] text-gray-600 group-hover:text-primary transition-colors" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider text-gray-300 mb-4">Stay Updated</h4>
            <p className="text-gray-400 text-sm mb-4">
              Subscribe for exclusive deals and new arrivals.
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
              />
              <button className="px-4 py-2.5 bg-primary rounded-xl hover:bg-primary-dark transition-colors text-sm font-semibold shadow-sm hover:shadow-glow-primary">
                <i className="fas fa-paper-plane" />
              </button>
            </div>

            {/* Trust badges */}
            <div className="flex items-center gap-4 mt-6 pt-6 border-t border-white/5">
              <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                <i className="fas fa-shield-halved text-success" />
                <span>Secure</span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                <i className="fas fa-truck text-blue-400" />
                <span>Fast Delivery</span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                <i className="fas fa-rotate-left text-amber-400" />
                <span>Easy Returns</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-gray-500">
          <p>&copy; {currentYear} RENSELL. All rights reserved.</p>
          <p className="text-xs">Made with <span className="text-red-400">❤</span> in India</p>
        </div>
      </div>
    </footer>
  );
}
