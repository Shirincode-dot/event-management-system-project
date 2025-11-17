import React from 'react';

/**
 * BookingRequestItem
 * Props:
 *  - request: { id, clientName, venueName, date, totalGuests, status }
 *  - onApprove(id)
 *  - onReject(id)
 */
export default function BookingRequestItem({ request, onApprove, onReject }) {
  const { id, clientName, venueName, date, totalGuests, status } = request;

  return (
    <div className="booking-item" role="article" aria-label={`booking-${id}`}>
      <div className="booking-left">
        <div style={{minWidth:56, minHeight:56, borderRadius:10, background:'#fff8f0', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 12px rgba(112,94,70,0.06)'}}>
          <strong style={{color:'#705E46'}}>{clientName.split(' ').map(n=>n[0]).slice(0,2).join('')}</strong>
        </div>
        <div>
          <div className="booking-meta">{clientName} • <span className="booking-venue">{venueName}</span></div>
          <div className="muted">{new Date(date).toLocaleDateString()} • Guests: {totalGuests}</div>
        </div>
      </div>

      <div style={{display:'flex', gap:12, alignItems:'center'}}>
        <div>
          <span className={`pill ${status.toLowerCase()}`} aria-hidden>{status}</span>
        </div>

        <div className="actions" role="group" aria-label={`actions-${id}`}>
          <button
            className="btn view"
            onClick={() => alert(`Viewing booking ${id} — client: ${clientName}`)}
            title="View details"
          >
            View
          </button>

          {status === 'Pending' && (
            <>
              <button className="btn approve" onClick={() => onApprove(id)} title="Approve booking">Approve</button>
              <button className="btn reject" onClick={() => {
                if(window.confirm('Reject this booking?')) onReject(id);
              }} title="Reject booking">Reject</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}