import React, { useState } from "react";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleLogin(e) {
    e.preventDefault();

    const res = await fetch("http://localhost:3001/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (res.ok) {
      localStorage.setItem("adminToken", data.token);
      window.location.href = "/admin";  // Go to dashboard
    } else {
      setError(data.message);
    }
  }

  return (
    <div className="login-box">
      <h2>Admin Login</h2>

      <form onSubmit={handleLogin}>
        <input placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />

        {error && <p style={{color:"red"}}>{error}</p>}
        <button>Login</button>
      </form>
    </div>
  );
}