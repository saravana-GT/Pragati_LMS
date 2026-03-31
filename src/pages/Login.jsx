import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { CENTER_NAME } from '../utils/constants';

export default function Login() {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, error } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login(email, password);
    if (success && email === 'admin@pragati.com') {
      window.setDemoAuth({ email: 'admin@pragati.com' });
    }
  };

  return (
    <div className="login-bg">
      <div className="login-card">
        {/* Logo / Brand */}
        <div className="login-brand">
          <div className="login-icon">📚</div>
          <h1>{CENTER_NAME}</h1>
          <p>Admin Management Panel</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="login-form">
          <div className="field-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@pragatiabhyasika.com"
              required
              autoFocus
            />
          </div>

          <div className="field-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {error && <div className="login-error">{error}</div>}

          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In →'}
          </button>

          <div style={{ marginTop: '16px', fontSize: '0.8rem', color: '#64748b', textAlign: 'center', background: '#f8fafc', padding: '10px', borderRadius: '8px' }}>
            <strong>Demo Login:</strong> admin@pragati.com | admin123
          </div>
        </form>

        <p className="login-footer">Pragati Abhyasika © {new Date().getFullYear()}</p>
      </div>
    </div>
  );
}
