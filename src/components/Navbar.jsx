import React from 'react';

export default function Navbar({ title, subtitle }) {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  return (
    <header className="topbar">
      <div className="topbar-left">
        <h2 className="topbar-title">{title}</h2>
        {subtitle && <p className="topbar-subtitle">{subtitle}</p>}
      </div>
      <div className="topbar-right">
        <span className="topbar-date">📅 {dateStr}</span>
        <div className="admin-badge">
          <span className="admin-dot" />
          Admin
        </div>
      </div>
    </header>
  );
}
