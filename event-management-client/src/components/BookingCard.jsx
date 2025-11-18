export default function BookingCard({ booking, onCancel }) {
  return (
    <section className="card">
      <h3>{booking.event_title}</h3>
      <p className="muted">{new Date(booking.event_date).toLocaleDateString()}</p>
      <p className="muted">Venue: {booking.venue_name}</p>
      <p>Status: <span className={`pill ${booking.status}`}>{booking.status}</span></p>
      <div className="actions-row">
        <button className="btn ghost" onClick={onCancel}>Cancel</button>
      </div>
    </section>
  );
}