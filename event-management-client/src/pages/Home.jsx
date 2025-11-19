import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; //import auth hook

export default function Home() {
    //grab 'user' object from AuthContext
    const {user} = useAuth();

  return (
    <main className="container hero-cyber">
      <section className="glow-panel">
        <p className="pill neon-tag">Plan with confidence</p>

        {/* added personalized greeting */}
        <h1>
            { user ? `Welcome back, ${user.username}!` : "Host unforgettable events with Euphoria." }
        </h1>

        <p className="muted">
          Browse curated venues, check availability instantly, and book in a few clicks.
        </p>

        <div className="actions-row">
            {/*Always show browse events*/}
          <Link className="btn solid neon" to="/events">Browse events</Link>

          {/*Added conditional rendering*/}
          {user ? (
            //if logged in, homepage will show "my bookings" instead of "create account"
            <Link className="btn ghost neon-outline" to="/bookings">My Bookings</Link>
          ) : (
            //if logged out, will show "create account"
            <Link className="btn ghost neon-outline" to="/register">Create account</Link>
          )}
        </div>
      </section>
    </main>
  );
}