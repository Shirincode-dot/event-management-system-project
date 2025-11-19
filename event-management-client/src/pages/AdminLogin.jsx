import React, { useState } from "react";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleLogin(e) {
    e.preventDefault();
    setError(""); 

    t
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
        // Failure: Display the error message from the backend
        setError(data.message || "Login failed. Check server log for details.");
      }
    } catch (err) {
      // Network or parsing error
      console.error("Login attempt failed:", err);
      setError("Could not connect to the API server. Is the backend running?");
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-2xl border border-gray-200">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-8 text-center">Admin Login</h2>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input 
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out shadow-sm"
              placeholder="admin" 
              value={username} 
              onChange={e => setUsername(e.target.value)} 
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input 
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out shadow-sm"
              type="password" 
              placeholder="admin123" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required
            />
          </div>

          {error && <p className="text-red-600 text-sm text-center font-medium mt-4">{error}</p>}
          
          <button 
            type="submit" 
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold text-lg hover:bg-indigo-700 transition duration-200 ease-in-out shadow-lg transform hover:scale-[1.01]"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
