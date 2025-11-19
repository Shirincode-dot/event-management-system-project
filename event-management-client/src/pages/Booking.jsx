import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Booking() {
  const { token } = useAuth();
  const [bookings, setBookings] = useState([]);
  
  // new state for guest management
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [guests, setGuests] = useState([]);
  const [newGuest, setNewGuest] = useState({ fullName: '', email: '', requests: '' });

  // to load bookings
  useEffect(() => {
    if (!token) return;
    loadBookings();
  }, [token]);

  const loadBookings = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/events/my-bookings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setBookings(await res.json());
    } catch (e) {
      console.error("Failed to load bookings");
    }
  };

  // logic for cancelling booking
  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this mission?')) return;
    try {
      const res = await fetch(`http://localhost:3001/api/events/bookings/${id}/cancel`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) loadBookings(); // to refresh list
    } catch (e) {
      alert("Cancel failed");
    }
  };

  // to open guest manager in the side panel
  const openGuests = async (bookingId) => {
    setSelectedBooking(bookingId);
    // to fetch guests for booking
    try {
      const res = await fetch(`http://localhost:3001/api/events/bookings/${bookingId}/guests`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setGuests(await res.json());
    } catch (e) {
      alert("Could not load guest list");
    }
  };

  // adding new guest
  const handleAddGuest = async (e) => {
    e.preventDefault();
    if(!newGuest.fullName) return;

    try {
      await fetch(`http://localhost:3001/api/events/bookings/${selectedBooking}/guests`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(newGuest)
      });
      
      // clear form and reload list
      setNewGuest({ fullName: '', email: '', requests: '' });
      openGuests(selectedBooking); 
    } catch (e) {
      alert("Failed to add guest");
    }
  };

  return (
    <main className="container">
      <h2 style={{color: 'var(--neon-cyan)', marginBottom: '20px'}}>MY MISSION LOGS</h2>

      <div className="grid">
        {/* booking list on left column */}
        <div style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
          {bookings.length === 0 && (
             <div className="card">
                <p className="muted">No missions pending. Go to "Events" to book one.</p>
             </div>
          )}

          {bookings.map(b => (
            <div key={b.booking_id} className="card" style={{borderColor: b.status === 'Cancelled' ? '#444' : 'var(--panel-border)'}}>
              
              {/* Header */}
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                <h3 style={{margin:0, color: b.status === 'Cancelled' ? '#777' : 'white'}}>
                    {b.event_title}
                </h3>
                <span className="pill" style={{
                    borderColor: b.status === 'Approved' ? 'var(--neon-cyan)' : b.status === 'Cancelled' ? 'red' : 'var(--neon-yellow)',
                    color: b.status === 'Approved' ? 'var(--neon-cyan)' : b.status === 'Cancelled' ? 'red' : 'var(--neon-yellow)'
                }}>
                  {b.status}
                </span>
              </div>

              {/* Details */}
              <p className="muted" style={{margin: '10px 0 20px 0'}}>
                {new Date(b.event_date).toLocaleDateString()} <br/>
                Location: {b.venue_name}
              </p>
              
              {/* Actions */}
              {b.status !== 'Cancelled' && (
                <div className="actions-row">
                  <button className="btn ghost" onClick={() => openGuests(b.booking_id)}>
                    MANAGE GUESTS
                  </button>
                  <button 
                    className="btn ghost" 
                    style={{borderColor: 'var(--neon-pink)', color:'var(--neon-pink)'}} 
                    onClick={() => handleCancel(b.booking_id)}
                  >
                    CANCEL
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* --- guest manager, right column --- */}
        <div>
          {selectedBooking ? (
            <div className="card" style={{borderColor: 'var(--neon-cyan)', position: 'sticky', top: '100px', borderLeft: '4px solid var(--neon-cyan)'}}>
              <h3 style={{color: 'var(--neon-cyan)'}}>GUEST PROTOCOLS</h3>
              <p className="muted" style={{fontSize: '13px'}}>Manage access list for selected mission.</p>
              
              {/* adding guest form */}
              <form onSubmit={handleAddGuest} style={{marginBottom: '20px', borderBottom: '1px dashed #333', paddingBottom: '15px'}}>
                <input 
                    placeholder="Guest Name" 
                    value={newGuest.fullName}
                    onChange={e => setNewGuest({...newGuest, fullName: e.target.value})}
                    required
                />
                <input 
                    placeholder="Email (Optional)" 
                    value={newGuest.email}
                    onChange={e => setNewGuest({...newGuest, email: e.target.value})}
                />
                 <input 
                    placeholder="Special Requests / Diet" 
                    value={newGuest.requests}
                    onChange={e => setNewGuest({...newGuest, requests: e.target.value})}
                />
                <button className="btn solid" style={{width:'100%'}}>ADD TO MANIFEST</button>
              </form>

              {/* list guests */}
              <h4 style={{margin: '10px 0'}}>CURRENT ROSTER ({guests.length})</h4>
              {guests.length === 0 ? <p className="muted">No guests registered yet.</p> : (
                <ul style={{listStyle: 'none', padding: 0}}>
                    {guests.map(g => (
                        <li key={g.guest_id} style={{background: '#111', padding: '10px', marginBottom: '5px', borderLeft: '2px solid var(--neon-cyan)'}}>
                            <strong style={{display:'block', color: 'white'}}>{g.full_name}</strong>
                            <span className="muted" style={{fontSize: '12px'}}>{g.email || "No contact info"}</span>
                            {g.special_requests && <div style={{fontSize:'11px', color:'var(--neon-yellow)'}}>Note: {g.special_requests}</div>}
                        </li>
                    ))}
                </ul>
              )}
              
              <button className="btn ghost" style={{marginTop:'15px', width:'100%'}} onClick={() => setSelectedBooking(null)}>
                CLOSE MANAGER
              </button>
            </div>
          ) : (
            // if no booking selected, placeholder
            <div className="card" style={{textAlign:'center', opacity: 0.4, borderStyle: 'dashed'}}>
              <h3>IDLE</h3>
              <p>Select "Manage Guests" on a mission to open the guest manifest.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}