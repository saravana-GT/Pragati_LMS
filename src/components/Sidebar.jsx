import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { CENTER_NAME } from '../utils/constants';

const navItems = [
  { to: '/',           icon: '📊', label: 'Dashboard'  },
  { to: '/seats',      icon: '🪑', label: 'Seats'       },
  { to: '/students',   icon: '👥', label: 'Students'    },
  { to: '/payments',   icon: '💰', label: 'Payments'    },
  { to: '/attendance', icon: '✅', label: 'Attendance'  },
  { to: '/waitlist',   icon: '⏳', label: 'Waitlist'    },
];

export default function Sidebar({ collapsed, onToggle }) {
  const { logout } = useAuth();

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      {/* Brand */}
      <div className="sidebar-brand">
        <span className="brand-icon">📚</span>
        {!collapsed && <span className="brand-name">{CENTER_NAME}</span>}
      </div>

      {/* Toggle button */}
      <button className="sidebar-toggle" onClick={onToggle} title="Toggle sidebar">
        {collapsed ? '»' : '«'}
      </button>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {navItems.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            title={collapsed ? label : ''}
          >
            <span className="nav-icon">{icon}</span>
            {!collapsed && <span className="nav-label">{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <button className="sidebar-logout" onClick={logout} title="Logout">
        <span className="nav-icon">🚪</span>
        {!collapsed && <span>Logout</span>}
      </button>
    </aside>
  );
}
