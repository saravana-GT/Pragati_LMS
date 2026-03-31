import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';

export const useSeats = () => {
  const [seats,   setSeats]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'seats'), orderBy('shift'), orderBy('seatNumber'));
    const unsub = onSnapshot(q, (snap) => {
      setSeats(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const getShiftSeats = (shift) => seats.filter(s => s.shift === shift);

  const stats = {
    morning: {
      total:     seats.filter(s => s.shift === 'morning').length,
      occupied:  seats.filter(s => s.shift === 'morning' && s.status === 'occupied').length,
      available: seats.filter(s => s.shift === 'morning' && s.status === 'available').length,
    },
    evening: {
      total:     seats.filter(s => s.shift === 'evening').length,
      occupied:  seats.filter(s => s.shift === 'evening' && s.status === 'occupied').length,
      available: seats.filter(s => s.shift === 'evening' && s.status === 'available').length,
    },
  };

  return { seats, loading, getShiftSeats, stats };
};
