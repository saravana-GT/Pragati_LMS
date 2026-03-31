import React, { useState } from 'react';
import {
  collection, doc, addDoc, updateDoc, serverTimestamp, writeBatch, getDocs, query, where
} from 'firebase/firestore';
import { db } from '../firebase';
import { useStudents } from '../hooks/useStudents';
import { useSeats } from '../hooks/useSeats';
import { getCurrentMonth, formatDate } from '../utils/dateHelpers';
import { MONTHLY_FEE, SHIFT_LABELS } from '../utils/constants';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';

const EMPTY_FORM = { name: '', phone: '', email: '', address: '', shift: 'morning', seatNumber: '' };

export default function Students() {
  const { students, loading } = useStudents();
  const { getShiftSeats }     = useSeats();
  const [search,   setSearch]   = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form,     setForm]     = useState(EMPTY_FORM);
  const [saving,   setSaving]   = useState(false);

  const availableSeats = getShiftSeats(form.shift).filter(s => s.status === 'available');

  const filtered = students.filter(s =>
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.phone?.includes(search) ||
    String(s.seatNumber).includes(search)
  );

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.seatNumber) return toast.error('Please select a seat');
    setSaving(true);

    try {
      const batch = writeBatch(db);

      // 1. Add student
      const studentRef = doc(collection(db, 'students'));
      batch.set(studentRef, {
        ...form,
        seatNumber: Number(form.seatNumber),
        status:    'active',
        joinDate:  serverTimestamp(),
        createdAt: serverTimestamp(),
      });

      // 2. Update seat
      const seatId  = `${form.shift}_${String(form.seatNumber).padStart(2, '0')}`;
      const seatRef = doc(db, 'seats', seatId);
      batch.update(seatRef, {
        status:       'occupied',
        assignedTo:   studentRef.id,
        studentName:  form.name,
        assignedDate: serverTimestamp(),
      });

      // 3. Create payment record for current month
      const payRef = doc(collection(db, 'payments'));
      batch.set(payRef, {
        studentId:     studentRef.id,
        studentName:   form.name,
        seatNumber:    Number(form.seatNumber),
        shift:         form.shift,
        amount:        MONTHLY_FEE,
        month:         getCurrentMonth(),
        status:        'unpaid',
        paidDate:      null,
        receiptNumber: null,
        createdAt:     serverTimestamp(),
      });

      await batch.commit();
      toast.success(`${form.name} added successfully!`);
      setForm(EMPTY_FORM);
      setShowForm(false);
    } catch (err) {
      toast.error('Error adding student: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (student) => {
    if (!confirm(`Deactivate ${student.name}? This will free seat #${student.seatNumber}.`)) return;

    const batch = writeBatch(db);

    // Update student
    batch.update(doc(db, 'students', student.id), { status: 'inactive' });

    // Free seat
    const seatId = `${student.shift}_${String(student.seatNumber).padStart(2, '0')}`;
    batch.update(doc(db, 'seats', seatId), {
      status: 'available', assignedTo: null, studentName: null, assignedDate: null,
    });

    await batch.commit();
    toast.success(`${student.name} deactivated.`);
  };

  return (
    <div className="page">
      <Navbar title="Students" subtitle={`${students.filter(s => s.status === 'active').length} active students`} />

      <div className="page-content">
        {/* Toolbar */}
        <div className="toolbar">
          <input
            className="search-input"
            type="text"
            placeholder="🔍 Search by name, phone, seat…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button className="btn-primary" onClick={() => setShowForm(true)}>+ Add Student</button>
        </div>

        {/* Add Student Form */}
        {showForm && (
          <div className="modal-overlay" onClick={() => setShowForm(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Add New Student</h3>
                <button className="modal-close" onClick={() => setShowForm(false)}>✕</button>
              </div>
              <form onSubmit={handleAdd} className="modal-form">
                <div className="form-row">
                  <div className="field-group">
                    <label>Full Name *</label>
                    <input name="name" value={form.name} onChange={handleChange} required placeholder="Rahul Sharma" />
                  </div>
                  <div className="field-group">
                    <label>Phone *</label>
                    <input name="phone" value={form.phone} onChange={handleChange} required placeholder="9876543210" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="field-group">
                    <label>Email</label>
                    <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="rahul@email.com" />
                  </div>
                  <div className="field-group">
                    <label>Shift *</label>
                    <select name="shift" value={form.shift} onChange={handleChange}>
                      <option value="morning">🌅 Morning</option>
                      <option value="evening">🌙 Evening</option>
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="field-group">
                    <label>Seat Number *</label>
                    <select name="seatNumber" value={form.seatNumber} onChange={handleChange} required>
                      <option value="">— Select Seat —</option>
                      {availableSeats.map(s => (
                        <option key={s.id} value={s.seatNumber}>Seat #{s.seatNumber}</option>
                      ))}
                    </select>
                    <small>{availableSeats.length} seats available in {form.shift} shift</small>
                  </div>
                  <div className="field-group">
                    <label>Address</label>
                    <input name="address" value={form.address} onChange={handleChange} placeholder="City, State" />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
                  <button type="submit" className="btn-primary" disabled={saving}>
                    {saving ? 'Saving…' : 'Add Student'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Students Table */}
        {loading ? <div className="loading">Loading…</div> : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Seat</th>
                  <th>Shift</th>
                  <th>Joined</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(s => (
                  <tr key={s.id}>
                    <td><strong>{s.name}</strong><br /><small>{s.email}</small></td>
                    <td>{s.phone}</td>
                    <td><span className="seat-badge">#{s.seatNumber}</span></td>
                    <td>{SHIFT_LABELS[s.shift]}</td>
                    <td>{formatDate(s.joinDate)}</td>
                    <td>
                      <span className={`status-badge ${s.status}`}>{s.status}</span>
                    </td>
                    <td>
                      {s.status === 'active' && (
                        <button className="btn-danger-sm" onClick={() => handleDeactivate(s)}>
                          Deactivate
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={7} className="empty-state">No students found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
