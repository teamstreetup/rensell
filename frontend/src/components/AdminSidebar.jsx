export default function AdminSidebar({ activeTab, onSelectTab, counts = {} }) {
  const tabs = [
    { key: 'overview', label: 'Analytics Overview', icon: 'bi-graph-up-arrow', count: null },
    { key: 'products', label: 'Product Moderation', icon: 'bi-boxes', count: counts.products },
    { key: 'orders', label: 'Order Fulfillment', icon: 'bi-truck', count: counts.orders },
    { key: 'users', label: 'User Accounts', icon: 'bi-people', count: counts.users },
  ];

  return (
    <div className="rensell-panel p-3 mb-4">
      <div className="d-flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const active = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onSelectTab(tab.key)}
              className={`btn btn-sm d-inline-flex align-items-center gap-2 px-3 py-2 rounded-3 fw-bold ${
                active ? 'btn-rensell' : 'btn-rensell-outline'
              }`}
            >
              <i className={`bi ${tab.icon}`} />
              <span>{tab.label}</span>
              {tab.count !== null && tab.count !== undefined && (
                <span className={`badge rounded-pill ${active ? 'bg-white text-dark' : 'bg-light text-dark border'}`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
