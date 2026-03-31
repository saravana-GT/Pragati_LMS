import React from 'react';
import { useSeats } from '../hooks/useSeats';
import { useStudents } from '../hooks/useStudents';
import { usePayments } from '../hooks/usePayments';
import { useAttendance } from '../hooks/useAttendance';
import { getCurrentMonth, formatMonth } from '../utils/dateHelpers';
import Navbar from '../components/Navbar';

function StatCard({ icon, label, value, sub, color }) {
  return (
    <div className="stat-card" style={{ borderLeftColor: color }}>
      <div className="stat-icon" style={{ background: color + '18' }}>{icon}</div>
      <div className="stat-body">
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
        {sub && <div className="stat-sub">{sub}</div>}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { stats: seatStats } = useSeats();
  const { students }         = useStudents();
  const { stats: payStats }  = usePayments(getCurrentMonth());
  const { stats: attStats }  = useAttendance();

  const activeStudents = students.filter(s => s.status === 'active').length;

  return (
    <div className="page">
      <Navbar title="Dashboard" subtitle={`Overview for ${formatMonth(getCurrentMonth())}`} />

      <div className="page-content">

        {/* Stats Grid */}
        <div className="stats-grid">
          <StatCard icon="👥" label="Active Students" value={activeStudents}
            sub={`${students.length} total enrolled`} color="#2563eb" />

          <StatCard icon="🪑" label="Seats Occupied"
            value={`${seatStats.morning.occupied + seatStats.evening.occupied} / 60`}
            sub={`${seatStats.morning.available + seatStats.evening.available} available`}
            color="#7c3aed" />

          <StatCard icon="💰" label="Monthly Revenue"
            value={`₹ ${payStats.revenue.toLocaleString('en-IN')}`}
            sub={`₹ ${payStats.pending.toLocaleString('en-IN')} pending`}
            color="#059669" />

          <StatCard icon="✅" label="Today's Attendance"
            value={attStats.present}
            sub={`${attStats.stillIn} still inside`}
            color="#d97706" />
        </div>

        {/* Shift Summary */}
        <div className="section-title">Shift Overview</div>
        <div className="shift-cards">
          {['morning', 'evening'].map(shift => {
            const s = seatStats[shift];
            const pct = s.total ? Math.round((s.occupied / s.total) * 100) : 0;
            return (
              <div key={shift} className="shift-card">
                <div className="shift-header">
                  <span className="shift-emoji">{shift === 'morning' ? '🌅' : '🌙'}</span>
                  <span className="shift-name">{shift.charAt(0).toUpperCase() + shift.slice(1)} Shift</span>
                </div>
                <div className="shift-stats">
                  <div><strong>{s.occupied}</strong> Occupied</div>
                  <div><strong>{s.available}</strong> Available</div>
                </div>
                <div className="progress-bar-bg">
                  <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
                </div>
                <div className="progress-label">{pct}% full</div>
              </div>
            );
          })}
        </div>

        {/* Payment Summary */}
        <div className="section-title">Fee Collection — {formatMonth(getCurrentMonth())}</div>
        <div className="payment-summary">
          <div className="ps-item paid">
            <span className="ps-count">{payStats.paid}</span>
            <span className="ps-label">Paid</span>
          </div>
          <div className="ps-divider" />
          <div className="ps-item unpaid">
            <span className="ps-count">{payStats.unpaid}</span>
            <span className="ps-label">Unpaid</span>
          </div>
          <div className="ps-divider" />
          <div className="ps-item total">
            <span className="ps-count">{payStats.total}</span>
            <span className="ps-label">Total</span>
          </div>
        </div>

      </div>
    </div>
  );
}
