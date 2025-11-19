import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  const handleLogout = () => {
    logout();
    nav('/');
  };

  return (
    <header className="header">
      <div className="header-inner">
        {/* updated logo */}
        <Link to="/" className="brand">
          <div className="brand-badge">DE</div>
          <span className="brand-title">DUBAI EVENTS</span>
        </Link>

        {/* updated nav links */}
        <nav className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/events">Events</Link>
          
          {user ? (
            <>
              <Link to="/bookings">My Bookings</Link>
              {/* updated logout */}
              <button 
                onClick={handleLogout} 
                className="btn ghost" 
                style={{ padding: '5px 15px', fontSize: '14px', marginLeft: '10px' }}
              >
                LOGOUT
              </button>
            </>
          ) : (
            <Link to="/login">Login</Link>
          )}
        </nav>
      </div>
    </header>
  );
}