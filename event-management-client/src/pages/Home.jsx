import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <main className="container hero-cyber">
      <section className="glow-panel">
        <p className="pill neon-tag">Plan with confidence</p>
        <h1>Host unforgettable events with Euphoria.</h1>
        <p className="muted">
          Browse curated venues, check availability instantly, and book in a few clicks.
        </p>
        <div className="actions-row">
          <Link className="btn solid neon" to="/events">Browse events</Link>
          <Link className="btn ghost neon-outline" to="/register">Create account</Link>
        </div>
      </section>
    </main>
  );
}