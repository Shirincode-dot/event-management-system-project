import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { isAuthed, user, logout } = useAuth();
  const loc = useLocation();
  const nav = useNavigate();

  const active = (p) => loc.pathname === p ? 'active' : '';

  return (
    <header className="nav">
      <div className="nav-inner">
        <Link to="/" className="brand">
          <div className="brand-badge">EE</div>
          <div>
            <div className="brand-title">Euphoria Events</div>
            <div className="brand-sub">Client Portal</div>
          </div>
        </Link>
        <nav className="nav-links">
          <Link className={active('/')} to="/">Home</Link>
          <Link className={active('/events')} to="/events">Events</Link>
          {isAuthed && <Link className={active('/bookings')} to="/bookings">My Bookings</Link>}
        </nav>
        <div className="nav-actions">
          {isAuthed ? (
            <>
              <span className="muted">Hi, {user?.username || 'Guest'}</span>
              <button className="btn ghost" onClick={() => { logout(); nav('/'); }}>Logout</button>
            </>
          ) : (
            <>
              <Link className="btn ghost" to="/login">Login</Link>
              <Link className="btn solid" to="/register">Sign up</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
