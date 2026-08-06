import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import '../styles/login.css';

export function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error('Please enter username and password');
      return;
    }

    setLoading(true);
    const result = await login(username, password);

    if (result.success) {
      toast.success('Login successful!');
      setTimeout(() => {
        navigate('/');
      }, 500);
    } else {
      toast.error(result.message);
    }
    setLoading(false);
  };

  return (
    <div className="login-container">
      {/* Left Pane — Form */}
      <div className="login-left-pane">
        <div className="login-header">
          <div className="login-logo">
            <div className="login-logo-circle">
              <img src="/octs-logo.png" alt="OCTS Logo" className="official-logo" />
            </div>
            <div className="login-logo-text">
              <h1>OCTS</h1>
              <span>EST. 2020</span>
            </div>
          </div>

          <p className="login-title">Employee Management Portal</p>
          <h2>Sign in to OCTS</h2>
          <p>Oceanic Construction and Technical Services — offshore manpower management system.</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
              disabled={loading}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="password-input-wrapper">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={loading}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <p className="login-footer-note">
          🔒 Secured · Internal Access Only · OCTS © 2020
        </p>
      </div>

      {/* Right Pane — Background Image & Caption */}
      <div className="login-right-pane">
        <div className="caption-container">
          <p className="caption-tags">Offshore &nbsp;·&nbsp; Industrial &nbsp;·&nbsp; Trusted</p>
          <h2>Powering oil & gas operations across the Middle East and India since 2020.</h2>
          <p>Manpower supply, offshore deployment tracking, and certification management — all in one portal.</p>
        </div>
      </div>
    </div>
  );
}
