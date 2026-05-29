import { Building2, Calculator, Heart, Home, LayoutDashboard, ListChecks, LogOut, UserRound } from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const canManage = user && ['seller', 'agent'].includes(user.role);
  const canDashboard = user && ['agent', 'admin'].includes(user.role);

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <>
      <nav className="navbar navbar-expand-lg bg-white border-bottom sticky-top">
        <div className="container">
          <Link className="navbar-brand d-flex align-items-center gap-2 fw-bold" to="/">
            <Building2 className="text-success" />
            EstateFlow
          </Link>
          <button className="navbar-toggler" type="button" onClick={() => setOpen((value) => !value)} aria-controls="mainNav" aria-expanded={open} aria-label="Toggle navigation">
            <span className="navbar-toggler-icon" />
          </button>
          <div className={`${open ? '' : 'collapse'} navbar-collapse`} id="mainNav">
            <div className="navbar-nav me-auto">
              <NavLink className="nav-link" to="/properties"><Home size={17} /> Properties</NavLink>
              {(!user || user.role === 'buyer') && <NavLink className="nav-link" to="/emi-calculator"><Calculator size={17} /> EMI</NavLink>}
              {user && <NavLink className="nav-link" to="/bookings"><ListChecks size={17} /> Bookings</NavLink>}
              {user?.role === 'buyer' && <NavLink className="nav-link" to="/favorites"><Heart size={17} /> Favorites</NavLink>}
              {canManage && <NavLink className="nav-link" to="/my-listings">My Listings</NavLink>}
              {canDashboard && <NavLink className="nav-link" to="/dashboard"><LayoutDashboard size={17} /> Dashboard</NavLink>}
            </div>
            <div className="d-flex align-items-center gap-2">
              {user ? (
                <>
                  <span className="badge text-bg-light border text-capitalize"><UserRound size={15} /> {user.name} · {user.role}</span>
                  <button className="btn btn-outline-danger btn-sm" onClick={handleLogout}><LogOut size={16} /> Logout</button>
                </>
              ) : (
                <>
                  <Link className="btn btn-outline-success btn-sm" to="/login">Login</Link>
                  <Link className="btn btn-success btn-sm" to="/register">Register</Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
      <Outlet />
    </>
  );
}
