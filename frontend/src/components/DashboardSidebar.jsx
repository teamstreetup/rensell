import { NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function DashboardSidebar() {
  const { isAdmin } = useAuth();

  const items = [
    { to: '/dashboard/items', label: 'My Items', icon: 'bi-box-seam', end: true },
    { to: '/dashboard/items/add', label: 'List an Item', icon: 'bi-plus-circle' },
    { to: '/dashboard/orders', label: 'My Orders & Rentals', icon: 'bi-bag-check' },
    { to: '/dashboard/settings', label: 'Profile Settings', icon: 'bi-person-gear' },
    ...(isAdmin
      ? [{ to: '/dashboard/admin', label: 'Admin Portal', icon: 'bi-shield-lock' }]
      : []),
  ];

  return (
    <div className="rensell-panel p-3 sticky-top" style={{ top: '5.5rem' }}>
      <div className="text-muted text-uppercase fw-bold px-2 mb-3 d-none d-md-block" style={{ fontSize: '0.68rem', letterSpacing: '0.1em' }}>
        Dashboard Menu
      </div>
      <nav className="nav flex-row flex-md-column flex-nowrap overflow-auto gap-1 pb-1 pb-md-0">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `nav-pill-rensell d-flex align-items-center gap-2 text-nowrap ${isActive ? 'active' : ''}`
            }
          >
            <i className={`bi ${item.icon}`} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
