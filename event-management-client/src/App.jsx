import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Home from './pages/Home';
import Events from './pages/Events';
import Login from './pages/Login';
import Register from './pages/Register';
import Bookings from './pages/Booking';
import { AuthProvider, useAuth } from './context/AuthContext';
import AdminLogin from './pages/AdminLogin';
import AdminView from './pages/AdminView';
import './index.css';
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
          {/* client routes */}
          <Route path="/" element={<Home />} />
          <Route path="/events" element={<Events />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/bookings" element={<Protected><Bookings /></Protected>} />

          {/* admin routes */}
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminView />} />
        </Routes>
        <footer style={{ textAlign: 'center', padding: '30px', marginTop: '40px', borderTop: '1px solid #222' }}>
        <Link 
        to="/admin" 
        style={{ 
          color: '#666', // Light gray (visible on black)
          fontSize: '12px', 
          textDecoration: 'none',
          fontFamily: 'monospace',
          letterSpacing: '1px'
    }}
  >
    [ ADMIN PORTAL ]
  </Link>
</footer>
      </BrowserRouter>
    </AuthProvider>
  );
}