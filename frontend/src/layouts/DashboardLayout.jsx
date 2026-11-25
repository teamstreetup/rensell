import { Outlet } from 'react-router-dom';
import DashboardSidebar from '../components/DashboardSidebar';

export default function DashboardLayout() {
  return (
    <div className="container-xl py-4 py-md-5">
      <div className="row g-4">
        <div className="col-12 col-md-3">
          <DashboardSidebar />
        </div>
        <div className="col-12 col-md-9">
          <div className="rensell-panel p-3 p-sm-4 p-md-5">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
