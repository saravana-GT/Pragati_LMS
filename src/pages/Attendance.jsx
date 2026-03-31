import React, { useState } from 'react';
import { doc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAttendance } from '../hooks/useAttendance';
import { useStudents } from '../hooks/useStudents';
import { getTodayString, formatTime, calcDuration } from '../utils/dateHelpers';
import { SHIFT_LABELS } from '../utils/constants';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';

export default function Attendance() {
  const [date, setDate]       = useState(getTodayString());
  const [shift, setShift]     = useState('all');
  const { records, loading, stats } = useAttendance(date);
  const { students } = useStudents();

  const getRecord = (studentId) => records.find(r => r.studentId === studentId);

  const handleCheckIn = async (student) => {
    const recId = `${student.id}_${date}`;
    await setDoc(doc(db, 'attendance', recId), {
      studentId:   student.id,
      studentName: student.name,
      seatNumber:  student.seatNumber,
      shift:       student.shift,
      date,
      checkIn:     serverTimestamp(),
      checkOut:    null,
      durationMins: null,
    });
    toast.success(`${student.name} checked in ✓`);
  };

  const handleCheckOut = async (student, record) => {
    await updateDoc(doc(db, 'attendance', record.id), {
      checkOut:     serverTimestamp(),
      durationMins: Math.round((Date.now() - record.checkIn.toMillis()) / 60000),
    });
    toast.success(`${student.name} checked out`);
  };

  const activeStudents = students
    .filter(s => s.status === 'active')
    .filter(s => shift === 'all' || s.shift === shift);

  return (
    <div className="page">
      <Navbar title="Attendance" subtitle={`Daily check-in / check-out — ${date}`} />

      <div className="page-content">
        {/* Stats */}
        <div className="att-stats">
          <div className="att-stat green"><strong>{stats.present}</strong> Present</div>
          <div className="att-stat blue"><strong>{stats.stillIn}</strong> Still Inside</div>
          <div className="att-stat gray"><strong>{stats.checkedOut}</strong> Checked Out</div>
        </div>

        {/* Toolbar */}
        <div className="toolbar">
          <input
            type="date"
            className="date-picker"
            value={date}
            max={getTodayString()}
            onChange={e => setDate(e.target.value)}
          />
          <div className="filter-tabs">
            {['all', 'morning', 'evening'].map(s => (
              <button key={s} className={`filter-tab ${shift === s ? 'active' : ''}`} onClick={() => setShift(s)}>
                {s === 'all' ? 'All' : SHIFT_LABELS[s]}
              </button>
            ))}
          </div>
        </div>

        {/* Attendance Table */}
        {loading ? <div className="loading">Loading…</div> : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Seat / Shift</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th>Duration</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {activeStudents.map(student => {
                  const rec = getRecord(student.id);
                  const duration = rec ? calcDuration(rec.checkIn, rec.checkOut) : null;
                  return (
                    <tr key={student.id}>
                      <td><strong>{student.name}</strong></td>
                      <td>
                        <span className="seat-badge">#{student.seatNumber}</span>
                        <span className="shift-label">{SHIFT_LABELS[student.shift]}</span>
                      </td>
                      <td>{rec?.checkIn ? formatTime(rec.checkIn) : '—'}</td>
                      <td>{rec?.checkOut ? formatTime(rec.checkOut) : '—'}</td>
                      <td>{duration != null ? `${duration} min` : '—'}</td>
                      <td>
                        {!rec && (
                          <button className="btn-success-sm" onClick={() => handleCheckIn(student)}>
                            ↩ Check In
                          </button>
                        )}
                        {rec && !rec.checkOut && (
                          <button className="btn-warning-sm" onClick={() => handleCheckOut(student, rec)}>
                            ↪ Check Out
                          </button>
                        )}
                        {rec?.checkOut && (
                          <span className="badge-done">✓ Done</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
