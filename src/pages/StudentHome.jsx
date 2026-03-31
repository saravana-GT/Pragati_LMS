import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { useAuth } from '../hooks/useAuth';
import { formatDate, formatMonth, formatTime } from '../utils/dateHelpers';
import { SHIFT_LABELS, PAYMENT_STATUS, CENTER_NAME } from '../utils/constants';

export default function StudentHome() {
  const { logout } = useAuth();
  const [student, setStudent] = useState(null);
  const [payments, setPayments] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    // 1. Fetch Student Doc (Find by email OR phone)
    const qS = query(
      collection(db, 'students'), 
      where('email', '==', user.email) 
    );
    
    const unsubS = onSnapshot(qS, (snap) => {
      if (!snap.empty) {
        const sData = { id: snap.docs[0].id, ...snap.docs[0].data() };
        setStudent(sData);

        // 2. Fetch Payments (Last 6 months)
        const qP = query(
          collection(db, 'payments'), 
          where('studentId', '==', sData.id), 
          orderBy('month', 'desc'), 
          limit(6)
        );
        const unsubP = onSnapshot(qP, (pSnap) => {
          setPayments(pSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        });

        // 3. Fetch Attendance (Last 10 records)
        const qA = query(
          collection(db, 'attendance'), 
          where('studentId', '==', sData.id), 
          orderBy('date', 'desc'), 
          limit(10)
        );
        const unsubA = onSnapshot(qA, (aSnap) => {
          setAttendance(aSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        });

        return () => { unsubP(); unsubA(); };
      }
      setLoading(false);
    });

    return () => unsubS();
  }, []);

  if (loading) return <div className="loading">Loading your dashboard...</div>;
  
  if (!student) return (
    <div className="student-error">
      <div className="error-card">
        <h2>⚠️ Access Denied</h2>
        <p>No student record found for <strong>{auth.currentUser?.email}</strong>.</p>
        <p>Please ask the Admin to add you to the system first.</p>
        <button onClick={logout} className="btn-primary">Logout</button>
      </div>
    </div>
  );

  return (
    <div className="student-page">
      {/* Mini Navbar */}
      <nav className="student-nav">
        <div className="sn-left">
          <span className="sn-brand">📚 {CENTER_NAME}</span>
        </div>
        <div className="sn-right">
          <button onClick={logout} className="btn-logout-pill">Logout</button>
        </div>
      </nav>

      <main className="student-content">
        {/* Profile Card */}
        <div className="student-profile-card">
          <div className="spc-header">
            <div className="spc-avatar">{student.name?.charAt(0)}</div>
            <div className="spc-info">
              <h2>{student.name}</h2>
              <p>{student.phone}</p>
            </div>
          </div>
          <div className="spc-details">
            <div className="spc-item">
              <span className="spci-val">#{student.seatNumber}</span>
              <span className="spci-lbl">Your Seat</span>
            </div>
            <div className="spc-item">
              <span className="spci-val">{SHIFT_LABELS[student.shift]}</span>
              <span className="spci-lbl">Shift</span>
            </div>
          </div>
        </div>

        {/* Fees Section */}
        <div className="student-section-title">Monthly Fee Status</div>
        <div className="student-fee-list">
          {payments.map(p => (
            <div key={p.id} className={`student-fee-item ${p.status}`}>
              <div className="sfi-month">
                <strong>{formatMonth(p.month)}</strong>
                <span>₹ {p.amount}</span>
              </div>
              <div className={`sfi-status-badge ${p.status}`}>
                {p.status === 'paid' ? 'Paid ✓' : 'Unpaid !'}
              </div>
            </div>
          ))}
          {payments.length === 0 && <p className="empty-msg">No payment history available.</p>}
        </div>

        {/* Attendance Section */}
        <div className="student-section-title">Recent Attendance</div>
        <div className="student-attendance-table">
          <div className="sat-header">
            <span>Date</span>
            <span>In</span>
            <span>Out</span>
          </div>
          {attendance.map(a => (
            <div key={a.id} className="sat-row">
              <span className="sat-date">{a.date}</span>
              <span className="sat-time">{a.checkIn ? formatTime(a.checkIn) : '—'}</span>
              <span className="sat-time">{a.checkOut ? formatTime(a.checkOut) : '—'}</span>
            </div>
          ))}
          {attendance.length === 0 && <p className="empty-msg">No attendance logs yet.</p>}
        </div>
      </main>
    </div>
  );
}
