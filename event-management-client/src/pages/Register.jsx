// src/pages/Register.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register as registerClient } from '../api';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth(); // reuse login helper to set token/user
  const nav = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    if (!username || !password) {
      alert('Username and password are required');
      return;
    }
    setLoading(true);
    try {
      const token = await registerClient(username, password); // POST /api/auth/register
      login(token, username); // persist token + username in context/localStorage
      nav('/events'); // go to catalog after sign-up
    } catch (err) {
      alert(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container narrow">
      <section className="card">
        <h2>Create your account</h2>
        <p className="muted">Sign up to book events and track your reservations.</p>
        <form className="form" onSubmit={handleSubmit}>
          <input
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="Username"
            autoComplete="username"
          />
          <input
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Password"
            type="password"
            autoComplete="new-password"
          />
          <button className="btn solid" disabled={loading}>
            {loading ? 'Creating account...' : 'Sign up'}
          </button>
        </form>
        <p className="muted" style={{ marginTop: 12 }}>
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </section>
    </main>
  );
}