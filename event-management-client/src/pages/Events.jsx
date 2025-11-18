import { useEffect, useState } from 'react';
import { fetchEvents, checkAvailability, createBooking } from '../api';
import EventCard from '../components/EventCard';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [availability, setAvailability] = useState({});
  const { isAuthed, token } = useAuth();
  const nav = useNavigate();

  useEffect(() => {
    fetchEvents()
      .then(setEvents)
      .catch(() => alert('Failed to load events'))
      .finally(() => setLoading(false));
  }, []);

  const handleCheck = async (id) => {
    try {
      const data = await checkAvailability(id);
      setAvailability((prev) => ({ ...prev, [id]: data }));
    } catch (e) {
      alert(e.message);
    }
  };

  const handleBook = async (id) => {
    if (!isAuthed) {
      nav('/login');
      return;
    }
    try {
      await createBooking(id, token);
      alert('Booking created!');
    } catch (e) {
      alert(e.message);
    }
  };

  if (loading) return <Loader />;
  if (!events.length) return <EmptyState title="No events yet" text="Check back soon." />;

  return (
    <main className="container grid">
      {events.map(ev => (
        <EventCard
          key={ev.event_id}
          event={ev}
          availability={availability[ev.event_id]}
          onCheck={() => handleCheck(ev.event_id)}
          onBook={() => handleBook(ev.event_id)}
        />
      ))}
    </main>
  );
}
