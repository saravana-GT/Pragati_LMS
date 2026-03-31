import React, { useState } from 'react';
import { collection, doc, writeBatch, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useSeats } from '../hooks/useSeats';
import { SEATS_PER_SHIFT, STATUS_COLORS } from '../utils/constants';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';

// Seed all seats into Firestore (run once)
async function seedSeats() {
  const batch = writeBatch(db);
  ['morning', 'evening'].forEach(shift => {
    for (let n = 1; n <= SEATS_PER_SHIFT; n++) {
      const id  = `${shift}_${String(n).padStart(2, '0')}`;
      const ref = doc(collection(db, 'seats'), id);
      batch.set(ref, {
        seatNumber:   n,
        shift,
        status:       'available',
        assignedTo:   null,
        studentName:  null,
        assignedDate: null,
      }, { merge: true });
    }
  });
  await batch.commit();
  toast.success('60 seats initialized!');
}

function SeatBox({ seat }) {
  const bg = seat.status === 'occupied' ? '#fee2e2' : '#dcfce7';
  const border = STATUS_COLORS[seat.status] || '#ccc';

  return (
    <div
      className="seat-box"
      style={{ background: bg, borderColor: border }}
      title={seat.status === 'occupied' ? seat.studentName : 'Available'}
    >
      <span className="seat-number">{seat.seatNumber}</span>
      {seat.status === 'occupied' && (
        <span className="seat-student">{seat.studentName?.split(' ')[0]}</span>
      )}
    </div>
  );
}

export default function Seats() {
  const [activeShift, setActiveShift] = useState('morning');
  const { getShiftSeats, stats, loading } = useSeats();

  const shiftSeats = getShiftSeats(activeShift);
  const s = stats[activeShift];

  return (
    <div className="page">
      <Navbar title="Seat Manager" subtitle="Visual seat map — click a seat to view details" />

      <div className="page-content">

        {/* Seed button (one-time) */}
        <div className="seats-toolbar">
          <div className="shift-tabs">
            {['morning', 'evening'].map(shift => (
              <button
                key={shift}
                className={`shift-tab ${activeShift === shift ? 'active' : ''}`}
                onClick={() => setActiveShift(shift)}
              >
                {shift === 'morning' ? '🌅' : '🌙'} {shift.charAt(0).toUpperCase() + shift.slice(1)}
              </button>
            ))}
          </div>
          <button className="btn-outline-sm" onClick={seedSeats}>
            ⚙️ Initialize Seats (Run Once)
          </button>
        </div>

        {/* Shift stats */}
        <div className="seats-stats">
          <span className="badge occupied">{s.occupied} Occupied</span>
          <span className="badge available">{s.available} Available</span>
          <span className="badge total">{s.total} Total</span>
        </div>

        {/* Seat Grid */}
        {loading ? (
          <div className="loading">Loading seats…</div>
        ) : (
          <div className="seat-grid">
            {shiftSeats.map(seat => (
              <SeatBox key={seat.id} seat={seat} />
            ))}
            {shiftSeats.length === 0 && (
              <p className="empty-state">No seats found. Click "Initialize Seats" to seed Firestore.</p>
            )}
          </div>
        )}

        {/* Legend */}
        <div className="seat-legend">
          <span><span className="legend-dot" style={{ background: STATUS_COLORS.available }} /> Available</span>
          <span><span className="legend-dot" style={{ background: STATUS_COLORS.occupied  }} /> Occupied</span>
        </div>
      </div>
    </div>
  );
}
