import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { getTodayString } from '../utils/dateHelpers';

export const useAttendance = (date = getTodayString()) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'attendance'),
      where('date', '==', date),
      orderBy('studentName')
    );
    const unsub = onSnapshot(q, (snap) => {
      setRecords(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, [date]);

  const stats = {
    present:  records.filter(r => r.checkIn).length,
    checkedOut: records.filter(r => r.checkOut).length,
    stillIn:  records.filter(r => r.checkIn && !r.checkOut).length,
  };

  return { records, loading, stats };
};
