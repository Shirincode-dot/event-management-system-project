import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminView() { 
  const [bookings, setBookings] = useState([]); 
  const [activeTab, setActiveTab] = useState('Bookings');
  const nav = useNavigate();
  const token = localStorage.getItem("adminToken");

  useEffect(() => {
    if(!token) nav('/admin'); // will redirect if not logged in
    loadBookings();
  }, []);

  async function loadBookings() {
    try {
      const res = await fetch("http://localhost:3001/api/admin/bookings", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setBookings(data);
      }
    } catch (error) {
      console.error("Fetch error", error);
    }
  }

  async function handleAction(id, action) {
    // action is 'approve' or 'reject'
    try {
      await fetch(`http://localhost:3001/api/admin/bookings/${id}/${action}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
      });
      // to update the UI
      setBookings(prev => prev.map(b => b.id === id ? {...b, status: action === 'approve' ? 'Approved' : 'Rejected'} : b));
    } catch (e) {
      alert("Action failed");
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    nav('/');
  }

  // helper for status colors
  const getStatusColor = (status) => {
    if(status === 'Approved') return 'var(--neon-cyan)'; // cyan
    if(status === 'Rejected') return 'var(--neon-pink)'; // pink
    return 'var(--neon-yellow)'; // yellow for pending
  }

  return (
    <main className="container">
      {/* admin header */}
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'30px'}}>
        <h1 style={{color: 'var(--neon-pink)'}}>ADMIN CONSOLE</h1>
        <button onClick={handleLogout} className="btn ghost" style={{fontSize: '12px'}}>EXIT SYSTEM</button>
      </div>

      {/* tabs */}
      <div style={{display:'flex', gap:'15px', marginBottom:'30px'}}>
        {['Bookings', 'Venues'].map(t => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={activeTab === t ? "btn solid" : "btn ghost"}
            style={{padding: '10px 20px'}}
          >
            {t}
          </button>
        ))}
      </div>

      {/* content area */}
      {activeTab === 'Bookings' && (
        <div className="grid">
          {bookings.length === 0 ? <p className="muted">No bookings found.</p> : null}
          
          {bookings.map(b => (
            <div key={b.id} className="card">
              <div style={{display:'flex', justifyContent:'space-between', marginBottom:'10px'}}>
                <h3 style={{margin:0}}>{b.clientName || "Client"}</h3>
                <span style={{
                  color: getStatusColor(b.status), 
                  border: `1px solid ${getStatusColor(b.status)}`,
                  padding: '2px 8px',
                  fontSize: '12px',
                  textTransform: 'uppercase'
                }}>
                  {b.status}
                </span>
              </div>
              
              <p className="muted">
                {b.venueName} <br/>
                {new Date(b.date).toLocaleDateString()} • Guests: {b.totalGuests}
              </p>

              {b.status === 'Pending' && (
                <div className="actions-row">
                  <button 
                    onClick={() => handleAction(b.id, 'approve')}
                    className="btn ghost"
                    style={{borderColor: 'var(--neon-cyan)', color: 'var(--neon-cyan)', flex:1}}
                  >
                    APPROVE
                  </button>
                  <button 
                    onClick={() => handleAction(b.id, 'reject')}
                    className="btn ghost"
                    style={{borderColor: 'var(--neon-pink)', color: 'var(--neon-pink)', flex:1}}
                  >
                    REJECT
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {activeTab === 'Venues' && (
        <div className="card">
          <h3>VENUE DATABASE</h3>
          <p className="muted">Venue management modules offline. Connect backend to enable.</p>
        </div>
      )}
    </main>
  );
}