import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Bus, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const dashboardPath = user?.role === 'driver' ? '/driver/dashboard' : '/passenger/dashboard';

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-transit-navy/95 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2 text-white">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-transit-teal">
            <Bus size={18} />
          </span>
          <span className="font-display text-xl font-bold tracking-tight">TransitLive</span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          <a href="/#features" className="text-sm font-medium text-white/80 hover:text-white">
            Features
          </a>
          <a href="/#how-it-works" className="text-sm font-medium text-white/80 hover:text-white">
            How it works
          </a>
          <a href="/#contact" className="text-sm font-medium text-white/80 hover:text-white">
            Contact
          </a>

          {user ? (
            <div className="flex items-center gap-3">
              <Link to={dashboardPath} className="btn-amber !px-5 !py-2 text-sm">
                Dashboard
              </Link>
              <button onClick={handleLogout} className="text-sm font-medium text-white/80 hover:text-white">
                Log out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="text-sm font-medium text-white/80 hover:text-white">
                Log in
              </Link>
              <Link to="/register" className="btn-amber !px-5 !py-2 text-sm">
                Register
              </Link>
            </div>
          )}
        </div>

        <button className="text-white md:hidden" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          {open ? <X /> : <Menu />}
        </button>
      </nav>

      {open && (
        <div className="flex flex-col gap-4 border-t border-white/10 bg-transit-navy px-6 py-4 md:hidden">
          <a href="/#features" className="text-white/80" onClick={() => setOpen(false)}>
            Features
          </a>
          <a href="/#how-it-works" className="text-white/80" onClick={() => setOpen(false)}>
            How it works
          </a>
          <a href="/#contact" className="text-white/80" onClick={() => setOpen(false)}>
            Contact
          </a>
          {user ? (
            <>
              <Link to={dashboardPath} className="text-white">
                Dashboard
              </Link>
              <button onClick={handleLogout} className="text-left text-white/80">
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-white/80">
                Log in
              </Link>
              <Link to="/register" className="text-white">
                Register
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
