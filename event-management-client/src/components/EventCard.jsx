export default function EventCard({ event, availability, onCheck, onBook }) {
  return (
    <section className="card">
      <h3>{event.title}</h3>
      <p className="muted">{event.description}</p>
      <div className="meta">
        <span>{new Date(event.event_date).toLocaleDateString()}</span>
        <span>{event.venue_name}</span>
        <span>${event.ticket_price}</span>
      </div>
      {availability && (
        <p className="muted">
          Status: {availability.status} • {availability.available} spots left
        </p>
      )}
      <div className="actions-row">
        <button className="btn ghost" onClick={onCheck}>Check availability</button>
        <button className="btn solid" onClick={onBook}>Book now</button>
      </div>
    </section>
  );
}
