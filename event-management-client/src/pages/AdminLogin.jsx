import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const nav = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    setError("");

    try {
      // pointing to backend port 3001
      const res = await fetch("http://localhost:3001/api/admin/login", { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("adminToken", data.token);
        nav("/admin/dashboard"); // using router navigation
      } else {
        setError(data.message || "Login failed.");
      }
    } catch (err) {
      setError("Server error. Is the backend running?");
    }
  }

  return (
    <main className="container" style={{maxWidth: '400px', marginTop: '100px'}}>
      <section className="card" style={{borderColor: 'var(--neon-pink)'}}>
        <h2 style={{color: 'var(--neon-pink)', textAlign: 'center'}}>ADMIN PORTAL</h2>
        
        <form onSubmit={handleLogin} style={{marginTop: '20px'}}>
          <input 
            placeholder="Admin Username" 
            value={username} 
            onChange={e => setUsername(e.target.value)} 
            required
            style={{marginBottom: '15px'}}
          />
          
          <input 
            type="password" 
            placeholder="Access Code" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            required
            style={{marginBottom: '20px'}}
          />

          {error && <p style={{color: 'var(--neon-pink)', textAlign: 'center'}}>{error}</p>}
          
          {/* admin pink border */}
          <button 
            type="submit" 
            className="btn ghost"
            style={{width: '100%', color: 'var(--neon-pink)', borderColor: 'var(--neon-pink)'}}
          >
            AUTHENTICATE
          </button>
        </form>
      </section>
    </main>
  );
}