import { useState } from 'react';
import { login } from '../api';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login: doLogin } = useAuth();
  const nav = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = await login(username, password);
      doLogin(token, username);
      nav('/events');
    } catch (e) {
      alert(e.message);
    } finally { setLoading(false); }
  };

  return (
    <main className="container narrow">
      <section className="card">
        <h2>Login</h2>
        <form className="form" onSubmit={handleSubmit}>
          <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" />
          <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" type="password" />
          <button className="btn solid" disabled={loading}>{loading ? '...' : 'Login'}</button>
        </form>
        <p className="muted">No account? <Link to="/register">Register</Link></p>
      </section>
    </main>
  );
}
