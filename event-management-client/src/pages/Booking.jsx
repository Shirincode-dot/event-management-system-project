import { useEffect, useState } from 'react';
import { fetchBookings, cancelBooking } from '../api';
import { useAuth } from '../context/AuthContext';
import BookingCard from '../components/BookingCard';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';

export default function Bookings() {
  const { token } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    // if there is no token yet, don't attempt fetch
    if(!token) return;

    setLoading(true);
    fetchBookings(token)
      .then(setBookings)
      .catch(() => alert('Failed to load bookings'))
      .finally(() => setLoading(false));
  };

  //added token to dependency array; if the token changes it should run automatically

  useEffect(load, [token]); 

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this booking?')) return;
    try {
      await cancelBooking(id, token);
      load();
    } catch (e) {
      alert(e.message);
    }
  };

  if (loading) return <Loader />;
  if (!bookings.length) return <EmptyState title="No bookings yet" text="Book an event to see it here." />;

  return (
    <main className="container grid">
      {bookings.map(b => (
        <BookingCard key={b.booking_id} booking={b} onCancel={() => handleCancel(b.booking_id)} />
      ))}
    </main>
  );
}