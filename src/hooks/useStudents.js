import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';

export const useStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'students'), orderBy('name'));
    const unsub = onSnapshot(q, (snap) => {
      setStudents(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  return { students, loading };
};
