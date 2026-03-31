import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { formatDate } from '../utils/dateHelpers';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';

const EMPTY = { name: '', phone: '', preferredShift: 'morning', notes: '' };

export default function Waitlist() {
  const [waitlist, setWaitlist] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form,     setForm]     = useState(EMPTY);

  useEffect(() => {
    const q = query(collection(db, 'waitlist'), orderBy('requestDate', 'desc'));
    const unsub = onSnapshot(q, snap => {
      setWaitlist(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    await addDoc(collection(db, 'waitlist'), {
      ...form, status: 'waiting', requestDate: serverTimestamp(),
    });
    toast.success(`${form.name} added to waitlist`);
    setForm(EMPTY);
    setShowForm(false);
  };

  const markNotified = async (id) => {
    await updateDoc(doc(db, 'waitlist', id), { status: 'notified' });
    toast.success('Marked as notified');
  };

  const getStatusBadge = (status) => {
    const map = {
      waiting:   { label: '⏳ Waiting',   color: '#d97706', bg: '#fef3c7' },
      notified:  { label: '📞 Notified',  color: '#2563eb', bg: '#dbeafe' },
      converted: { label: '✅ Converted', color: '#059669', bg: '#d1fae5' },
    };
    const s = map[status] || map.waiting;
    return <span className="status-pill" style={{ color: s.color, background: s.bg }}>{s.label}</span>;
  };

  return (
    <div className="page">
      <Navbar title="Waitlist" subtitle={`${waitlist.filter(w => w.status === 'waiting').length} people waiting`} />

      <div className="page-content">
        <div className="toolbar">
          <div />
          <button className="btn-primary" onClick={() => setShowForm(true)}>+ Add to Waitlist</button>
        </div>

        {showForm && (
          <div className="modal-overlay" onClick={() => setShowForm(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Add to Waitlist</h3>
                <button className="modal-close" onClick={() => setShowForm(false)}>✕</button>
              </div>
              <form onSubmit={handleAdd} className="modal-form">
                <div className="form-row">
                  <div className="field-group">
                    <label>Full Name *</label>
                    <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required placeholder="Priya Joshi" />
                  </div>
                  <div className="field-group">
                    <label>Phone *</label>
                    <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} required placeholder="9876543210" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="field-group">
                    <label>Preferred Shift</label>
                    <select value={form.preferredShift} onChange={e => setForm(f => ({ ...f, preferredShift: e.target.value }))}>
                      <option value="morning">🌅 Morning</option>
                      <option value="evening">🌙 Evening</option>
                      <option value="any">Any</option>
                    </select>
                  </div>
                  <div className="field-group">
                    <label>Notes</label>
                    <input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Any notes…" />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
                  <button type="submit" className="btn-primary">Add to Waitlist</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {loading ? <div className="loading">Loading…</div> : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr><th>Name</th><th>Phone</th><th>Preferred Shift</th><th>Requested On</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {waitlist.map(w => (
                  <tr key={w.id}>
                    <td><strong>{w.name}</strong></td>
                    <td>{w.phone}</td>
                    <td>{w.preferredShift}</td>
                    <td>{formatDate(w.requestDate)}</td>
                    <td>{getStatusBadge(w.status)}</td>
                    <td>
                      {w.status === 'waiting' && (
                        <button className="btn-outline-sm" onClick={() => markNotified(w.id)}>Mark Notified</button>
                      )}
                    </td>
                  </tr>
                ))}
                {waitlist.length === 0 && (
                  <tr><td colSpan={6} className="empty-state">No one on the waitlist.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
