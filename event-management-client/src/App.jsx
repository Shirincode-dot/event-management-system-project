import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Home from './pages/Home';
import Events from './pages/Events';
import Login from './pages/Login';
import Register from './pages/Register';
import Bookings from './pages/Booking';
import { AuthProvider, useAuth } from './context/AuthContext';
import './index.css';

function Protected({ children }) {
  const { isAuthed } = useAuth();
  return isAuthed ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/events" element={<Events />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/bookings" element={<Protected><Bookings /></Protected>} />
        </Routes>
        <footer style={{ 
            textAlign: 'center', 
            padding: '40px', 
            borderTop: '1px solid var(--panel-border)',
            marginTop: '50px'
            }}>
        <p className="muted">Euphoria Events</p>
  
        {/* admin link */}
        <a 
        href="http://localhost:5174" 
        target="_blank" 
        rel="noreferrer"
        style={{ 
        color: 'var(--text-muted)', 
        fontSize: '12px', 
        textDecoration: 'none',
        borderBottom: '1px dotted var(--text-muted)' 
    }}
  >
    Admin Portal Login
  </a>
</footer>
      </BrowserRouter>
    </AuthProvider>
  );
}