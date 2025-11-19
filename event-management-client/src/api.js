// src/api.js

const API_URL = 'http://localhost:3001/api';

// --- PUBLIC ROUTES ---

export const fetchEvents = async () => {
  // This matches the backend route: /api + /events
  const res = await fetch(`${API_URL}/events`);
  if (!res.ok) throw new Error('Failed to fetch events');
  return res.json();
};

export const fetchVenues = async () => {
  const res = await fetch(`${API_URL}/venues`);
  if (!res.ok) throw new Error('Failed to fetch venues');
  return res.json();
};

export const checkAvailability = async (eventId) => {
  const res = await fetch(`${API_URL}/events/${eventId}/availability`);
  if (!res.ok) throw new Error('Failed to check availability');
  return res.json();
};

// --- AUTH ROUTES ---

export const login = async (username, password) => {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Login failed');
  return data.token;
};

export const register = async (username, password) => {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Registration failed');
  return data.token;
};

// --- PROTECTED ROUTES (Bookings) ---

export const fetchBookings = async (token) => {
  const res = await fetch(`${API_URL}/my-bookings`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch bookings');
  return res.json();
};

export const createBooking = async (eventId, token) => {
  const res = await fetch(`${API_URL}/bookings`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}` 
    },
    body: JSON.stringify({ event_id: eventId }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Booking failed');
  return data;
};

export const cancelBooking = async (bookingId, token) => {
  const res = await fetch(`${API_URL}/bookings/${bookingId}/cancel`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Cancellation failed');
  return res.json();
};