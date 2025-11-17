import React, { useState } from 'react';
import BookingRequestItem from '../components/BookingRequestItem';

// MOCK DATA
const INITIAL_BOOKINGS = [
  { id: 101, clientName: 'John Doe', venueName: 'The Grand Ballroom', date: '2025-12-25', totalGuests: 350, status: 'Pending' },
  { id: 102, clientName: 'Jane Smith', venueName: 'Riverside Gardens', date: '2026-03-15', totalGuests: 120, status: 'Pending' },
  { id: 103, clientName: 'David Lee', venueName: 'The Loft Studio', date: '2025-11-20', totalGuests: 75, status: 'Approved' },
  { id: 104, clientName: 'Emily Chen', venueName: 'Executive Suite', date: '2026-01-05', totalGuests: 25, status: 'Rejected' },
];

const MOCK_USERS = [
  { id: 1, name: 'John Doe', role: 'Client', events: 2 },
  { id: 2, name: 'Jane Smith', role: 'Client', events: 1 },
  { id: 3, name: 'Admin User', role: 'Admin', events: 0 },
];

export default function AdminView(){
  const [bookings, setBookings] = useState([]);

async function loadBookings() {
  const token = localStorage.getItem("adminToken");

  const res = await fetch("http://localhost:3001/api/admin/bookings", {
    headers: { Authorization: `Bearer ${token}` }
  });

  const data = await res.json();
  setBookings(data);
}

useEffect(() => {
  loadBookings();
}, []);
  const [activeTab, setActiveTab] = useState('Bookings');

  const updateBookingStatus = (id, newStatus) => {
    setBookings(prev => prev.map(b => b.id === id ? {...b, status:newStatus} : b));
  };
  async function handleApprove(id) {
  const token = localStorage.getItem("adminToken");

  await fetch(`http://localhost:3001/api/admin/bookings/${id}/approve`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` }
  });

  loadBookings();
}
  async function handleReject(id) {
  const token = localStorage.getItem("adminToken");

  await fetch(`http://localhost:3001/api/admin/bookings/${id}/reject`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` }
  });

  loadBookings();
}

  const pending = bookings.filter(b => b.status === 'Pending');

  return (
    <>
      <header className="header">
        <div className="header-inner">
          <div className="brand">
            <div className="brand-badge">EE</div>
            <div>
              <div className="brand-title">EUPHORIA EVENTS</div>
              <div className="brand-sub">Admin Dashboard</div>
            </div>
          </div>

          <div style={{display:'flex', alignItems:'center', gap:12}}>
            <div style={{textAlign:'right'}}>
              <div style={{fontWeight:700, color:'var(--earth)'}}>Welcome, Admin</div>
              <div className="muted">Overview & monitoring</div>
            </div>
          </div>
        </div>
      </header>

      <main className="container">
        <nav className="tabs" role="tablist" aria-label="Admin sections">
          {['Bookings','Users','Reports','Venues'].map(t => (
            <button
              key={t}
              className={`tab ${activeTab === t ? 'active' : ''}`}
              onClick={() => setActiveTab(t)}
              role="tab"
              aria-selected={activeTab === t}
            >{t}</button>
          ))}
        </nav>

        {/* Content */}
        {activeTab === 'Bookings' && (
          <>
            <div className="grid" aria-live="polite">
              <section className="card">
                <h3>Pending Booking Requests</h3>
                <p className="muted" style={{marginBottom:12}}>Approve or reject booking requests quickly.</p>
                <div className="booking-list">
                  {pending.length === 0 ? (
                    <div className="muted">No pending requests. All caught up 🎉</div>
                  ) : pending.map(b => (
                    <BookingRequestItem key={b.id} request={b} onApprove={handleApprove} onReject={handleReject} />
                  ))}
                </div>
              </section>

              <section className="card">
                <h3>All Bookings</h3>
                <p className="muted" style={{marginBottom:12}}>Full listing with statuses for monitoring.</p>
                <div className="booking-list">
                  {bookings.map(b => (
                    <BookingRequestItem key={`all-${b.id}`} request={b} onApprove={handleApprove} onReject={handleReject} />
                  ))}
                </div>
              </section>
            </div>
          </>
        )}

        {activeTab === 'Users' && (
          <div className="card">
            <h3>User Management</h3>
            <p className="muted">View, edit, or remove users.</p>
            <div style={{marginTop:12, display:'grid', gap:10}}>
              {MOCK_USERS.map(u => (
                <div key={u.id} className="user-row">
                  <div>
                    <div style={{fontWeight:700}}>{u.name}</div>
                    <div className="muted">{u.role} • Events: {u.events}</div>
                  </div>
                  <div style={{display:'flex', gap:8}}>
                    <button className="btn view" onClick={() => alert(`Edit user ${u.name}`)}>Edit</button>
                    <button
                      className="btn reject"
                      onClick={() => {
                        if(window.confirm(`Delete ${u.name}?`)) alert(`${u.name} deleted (mock)`);
                      }}
                    >Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'Reports' && (
          <div className="grid">
            <section className="card">
              <h3>Revenue Snapshot</h3>
              <p className="muted">Mock data — integrate your backend to populate.</p>
              <div style={{marginTop:12}}>
                <div style={{fontSize:22, fontWeight:800, color:'var(--earth)'}}>$50,000</div>
                <div className="muted">Total Revenue (mock)</div>
              </div>
            </section>

            <section className="card">
              <h3>Venue Utilization</h3>
              <p className="muted">Quick overview of booked venues this quarter.</p>
              <div style={{marginTop:12}}>
                <div style={{fontSize:22, fontWeight:700, color:'var(--earth)'}}>12 Bookings</div>
                <div className="muted">Bookings in Q4 (mock)</div>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'Venues' && (
          <div className="card">
            <h3>Venue Management</h3>
            <p className="muted">Add, edit or remove venue listings.</p>
            <div style={{marginTop:12, display:'flex', gap:12, alignItems:'center'}}>
              <button className="btn approve" onClick={() => alert('Add new venue (mock)')}>+ Add New Venue</button>
              <div className="muted">Integrate with your backend to persist changes.</div>
            </div>
          </div>
        )}

        <div className="footer-note">Euphoria Events • Admin Dashboard — Prototype UI for group project</div>
      </main>
    </>
  );
}