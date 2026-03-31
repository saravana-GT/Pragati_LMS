import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { getCurrentMonth } from '../utils/dateHelpers';

export const usePayments = (month = getCurrentMonth()) => {
  const [payments, setPayments] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'payments'),
      where('month', '==', month),
      orderBy('studentName')
    );
    const unsub = onSnapshot(q, (snap) => {
      setPayments(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, [month]);

  const stats = {
    total:      payments.length,
    paid:       payments.filter(p => p.status === 'paid').length,
    unpaid:     payments.filter(p => p.status === 'unpaid').length,
    revenue:    payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + (p.amount || 0), 0),
    pending:    payments.filter(p => p.status === 'unpaid').reduce((sum, p) => sum + (p.amount || 0), 0),
  };

  return { payments, loading, stats };
};
