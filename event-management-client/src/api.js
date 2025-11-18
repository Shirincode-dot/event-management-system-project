const API = 'http://localhost:3001/api';

function getAuthHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchEvents() {
  const res = await fetch(`${API}/client/events`);
  if (!res.ok) throw new Error('Failed to load events');
  return res.json();
}

export async function fetchVenues() {
  const res = await fetch(`${API}/client/venues`);
  if (!res.ok) throw new Error('Failed to load venues');
  return res.json();
}

export async function checkAvailability(eventId) {
  const res = await fetch(`${API}/client/events/${eventId}/availability`);
  if (!res.ok) throw new Error('Failed to check availability');
  return res.json();
}

export async function login(username, password) {
  const res = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Login failed');
  return data.token;
}

export async function register(username, password) {
  const res = await fetch(`${API}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Registration failed');
  return data.token;
}

export async function fetchBookings(token) {
  const res = await fetch(`${API}/client/bookings`, { headers: getAuthHeaders(token) });
  if (!res.ok) throw new Error('Failed to load bookings');
  return res.json();
}

export async function createBooking(eventId, token) {
  const res = await fetch(`${API}/client/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders(token) },
    body: JSON.stringify({ event_id: eventId })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Booking failed');
  return data;
}

export async function cancelBooking(bookingId, token) {
  const res = await fetch(`${API}/client/bookings/${bookingId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(token)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Cancel failed');
  return data;
}
