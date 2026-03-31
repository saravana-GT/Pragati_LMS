import React, { useState } from 'react';
import { doc, updateDoc, serverTimestamp, collection, getDocs, query, where, writeBatch } from 'firebase/firestore';
import { db } from '../firebase';
import { usePayments } from '../hooks/usePayments';
import { useStudents } from '../hooks/useStudents';
import { getCurrentMonth, formatDate, formatMonth, generateReceiptNumber } from '../utils/dateHelpers';
import { MONTHLY_FEE, PAYMENT_STATUS, SHIFT_LABELS } from '../utils/constants';
import { generateReceiptPDF } from '../utils/generateReceipt';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';

export default function Payments() {
  const [month, setMonth]     = useState(getCurrentMonth());
  const [filter, setFilter]   = useState('all');
  const { payments, loading, stats } = usePayments(month);
  const { students } = useStudents();

  // Generate payment records for all active students (run each month)
  const generateMonthlyRecords = async () => {
    if (!confirm(`Generate payment records for ${formatMonth(month)}?`)) return;
    const active = students.filter(s => s.status === 'active');
    const existing = new Set(payments.map(p => p.studentId));

    const batch = writeBatch(db);
    let count = 0;
    active.forEach(s => {
      if (!existing.has(s.id)) {
        const ref = doc(collection(db, 'payments'));
        batch.set(ref, {
          studentId: s.id, studentName: s.name,
          seatNumber: s.seatNumber, shift: s.shift,
          amount: MONTHLY_FEE, month,
          status: 'unpaid', paidDate: null,
          receiptNumber: null, createdAt: serverTimestamp(),
        });
        count++;
      }
    });
    await batch.commit();
    toast.success(`${count} payment records created!`);
  };

  const markPaid = async (payment) => {
    const count      = payments.filter(p => p.status === 'paid').length + 1;
    const receiptNum = generateReceiptNumber(count);
    await updateDoc(doc(db, 'payments', payment.id), {
      status: 'paid', paidDate: serverTimestamp(), receiptNumber: receiptNum,
    });
    toast.success('Marked as paid ✓');
  };

  const handleDownloadReceipt = (payment) => {
    const student = students.find(s => s.id === payment.studentId);
    generateReceiptPDF(payment, student);
  };

  const filtered = payments.filter(p => filter === 'all' || p.status === filter);

  return (
    <div className="page">
      <Navbar title="Payments" subtitle={`Fee management — ${formatMonth(month)}`} />

      <div className="page-content">
        {/* Stats */}
        <div className="pay-stats-row">
          <div className="pay-stat green">
            <div className="pay-stat-val">₹ {stats.revenue.toLocaleString('en-IN')}</div>
            <div className="pay-stat-label">Collected</div>
          </div>
          <div className="pay-stat red">
            <div className="pay-stat-val">₹ {stats.pending.toLocaleString('en-IN')}</div>
            <div className="pay-stat-label">Pending</div>
          </div>
          <div className="pay-stat blue">
            <div className="pay-stat-val">{stats.paid} / {stats.total}</div>
            <div className="pay-stat-label">Paid / Total</div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="toolbar">
          <input
            type="month"
            className="month-picker"
            value={month}
            onChange={e => setMonth(e.target.value)}
          />
          <div className="filter-tabs">
            {['all', 'paid', 'unpaid'].map(f => (
              <button key={f} className={`filter-tab ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          <button className="btn-outline" onClick={generateMonthlyRecords}>⚡ Generate Records</button>
        </div>

        {/* Table */}
        {loading ? <div className="loading">Loading…</div> : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Seat / Shift</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Paid On</th>
                  <th>Receipt</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => {
                  const ps = PAYMENT_STATUS[p.status];
                  return (
                    <tr key={p.id}>
                      <td><strong>{p.studentName}</strong></td>
                      <td>
                        <span className="seat-badge">#{p.seatNumber}</span>
                        <span className="shift-label">{SHIFT_LABELS[p.shift]}</span>
                      </td>
                      <td>₹ {p.amount?.toLocaleString('en-IN') || MONTHLY_FEE}</td>
                      <td>
                        <span className="status-pill" style={{ color: ps.color, background: ps.bg }}>
                          {ps.label}
                        </span>
                      </td>
                      <td>{formatDate(p.paidDate)}</td>
                      <td>{p.receiptNumber || '—'}</td>
                      <td className="action-cell">
                        {p.status === 'unpaid' && (
                          <button className="btn-success-sm" onClick={() => markPaid(p)}>Mark Paid</button>
                        )}
                        {p.status === 'paid' && (
                          <button className="btn-outline-sm" onClick={() => handleDownloadReceipt(p)}>
                            📄 Receipt
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan={7} className="empty-state">
                    No records. Click "Generate Records" to create payment entries for active students.
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
