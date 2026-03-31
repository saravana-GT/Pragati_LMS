import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import { Toaster } from 'react-hot-toast';
import { ADMIN_EMAIL } from './utils/constants';

import Login        from './pages/Login';
import Dashboard    from './pages/Dashboard';
import Seats        from './pages/Seats';
import Students     from './pages/Students';
import Payments     from './pages/Payments';
import Attendance   from './pages/Attendance';
import Waitlist     from './pages/Waitlist';
import StudentHome  from './pages/StudentHome'; // <-- New
import Sidebar      from './components/Sidebar';

function useAuthUser() {
  const [user, setUser] = React.useState(undefined); // undefined = loading
  React.useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => setUser(u || null));
    return () => unsub();
  }, []);
  return user;
}

function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div className={`app-layout ${collapsed ? 'sidebar-collapsed' : ''}`}>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />
      <main className="main-content">
        <Routes>
          <Route path="/"           element={<Dashboard />}    />
          <Route path="/seats"      element={<Seats />}        />
          <Route path="/students"   element={<Students />}     />
          <Route path="/payments"   element={<Payments />}     />
          <Route path="/attendance" element={<Attendance />}   />
          <Route path="/waitlist"   element={<Waitlist />}     />
          <Route path="*"           element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  const firebaseUser = useAuthUser();
  const [demoUser, setDemoUser] = useState(null);

  const user = demoUser || firebaseUser;

  // Handle demo login (called from Login page if I update it)
  window.setDemoAuth = (u) => setDemoUser(u);

  if (user === undefined && !demoUser) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        <p>Initializing Pragati Abhyasika…</p>
      </div>
    );
  }

  // Determine user role
  const isAdmin = (user && user.email === ADMIN_EMAIL) || (demoUser && demoUser.email === 'admin@pragati.com');

  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      
      {!user ? (
        <Routes>
          <Route path="*" element={<Login />} />
        </Routes>
      ) : (
        // Logged In
        isAdmin ? <AdminLayout /> : (
          <Routes>
            <Route path="/" element={<StudentHome />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        )
      )}
    </BrowserRouter>
  );
}
