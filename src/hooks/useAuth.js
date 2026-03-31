import { useState } from 'react';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../firebase';

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const login = async (email, password) => {
    setLoading(true);
    setError('');

    // --- Hardcoded Demo Login Bypass ---
    if (email === 'admin@pragati.com' && password === 'admin123') {
      setLoading(false);
      return true; // Simulate successful login
    }
    // -----------------------------------

    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return !!result.user;
    } catch (err) {
      setError('Invalid email or password. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  return { login, logout, loading, error };
};
