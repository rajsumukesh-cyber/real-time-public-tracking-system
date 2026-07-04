import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, MapPin, User, Route as RouteIcon, LogOut, Bus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const driverLinks = [
  { to: '/driver/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/driver/route', label: 'My Route', icon: RouteIcon },
  { to: '/driver/profile', label: 'Profile', icon: User },
];

const passengerLinks = [
  { to: '/passenger/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/passenger/tracking', label: 'Live Tracking', icon: MapPin },
  { to: '/passenger/profile', label: 'Profile', icon: User },
];

const Sidebar = ({ role }) => {
  const links = role === 'driver' ? driverLinks : passengerLinks;
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <aside className="flex h-screen w-64 flex-col justify-between border-r border-slate-100 bg-white px-4 py-6">
      <div>
        <div className="mb-8 flex items-center gap-2 px-2">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-transit-teal text-white">
            <Bus size={18} />
          </span>
          <span className="font-display text-lg font-bold text-transit-navy">TransitLive</span>
        </div>

        <nav className="space-y-1">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? 'bg-transit-teal/10 text-transit-teal'
                    : 'text-transit-slate hover:bg-slate-50 hover:text-transit-navy'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
      </div>

      <button
        onClick={() => {
          logout();
          navigate('/');
        }}
        className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-transit-slate hover:bg-slate-50 hover:text-red-500"
      >
        <LogOut size={18} />
        Log out
      </button>
    </aside>
  );
};

export default Sidebar;
