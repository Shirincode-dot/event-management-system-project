import React from 'react';
import './BookingRequestItem.css'; // Add the CSS file

export default function BookingRequestItem({ request, onApprove, onReject }) {
  if (!request) return null;

  const { id, clientName, venueName, date, totalGuests, status } = request;

  return (
    <div className="booking-item">
      <div className="booking-left">
        <div className="avatar">
          {clientName.split(' ').map(n => n[0]).slice(0, 2).join('')}
        </div>
        <div className="booking-info">
          <div className="client-name">{clientName}</div>
          <div className="venue-name">{venueName}</div>
          <div className="booking-meta">
            {new Date(date).toLocaleDateString()} • Guests: {totalGuests}
          </div>
        </div>
      </div>

      <div className="booking-right">
        <span className={`status-pill ${status.toLowerCase()}`}>{status}</span>
        <div className="action-buttons">
          <button className="btn view" onClick={() => console.log(`View ${id}`)}>View</button>
          {status === 'Pending' && (
            <>
              <button className="btn approve" onClick={() => onApprove(id)}>Approve</button>
              <button className="btn reject" onClick={() => onReject(id)}>Reject</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
