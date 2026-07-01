import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('user'); // 'user' or 'admin'
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (isRegister && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    const url = isRegister ? '/api/auth/register' : '/api/auth/login';
    const payload = isRegister
      ? { email, fullName, password, role }
      : { email, password, role };

    try {
      const res = await axios.post(url, payload);
      const { user, token } = res.data;
      
      login(user, token);
      
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card__icon">
          <i className={`fas ${role === 'admin' ? 'fa-user-shield' : 'fa-user'}`}></i>
        </div>
        <h1>{isRegister ? 'Create Account' : 'Welcome Back'}</h1>
        <p className="subtitle">
          {isRegister ? 'Register to start shopping or managing' : 'Sign in to access your account'}
        </p>

        {/* Auth Mode Tabs */}
        <div style={{
          display: 'flex',
          background: 'var(--clr-surface-2)',
          borderRadius: 'var(--radius-sm)',
          padding: 4,
          marginBottom: 24,
          border: '1px solid var(--clr-border)'
        }}>
          <button
            type="button"
            style={{
              flex: 1,
              padding: '10px 0',
              background: !isRegister ? 'var(--clr-primary)' : 'transparent',
              color: '#fff',
              border: 'none',
              borderRadius: 'calc(var(--radius-sm) - 2px)',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.85rem',
              transition: 'all var(--transition)'
            }}
            onClick={() => {
              setIsRegister(false);
              setError('');
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            style={{
              flex: 1,
              padding: '10px 0',
              background: isRegister ? 'var(--clr-primary)' : 'transparent',
              color: '#fff',
              border: 'none',
              borderRadius: 'calc(var(--radius-sm) - 2px)',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.85rem',
              transition: 'all var(--transition)'
            }}
            onClick={() => {
              setIsRegister(true);
              setRole('user'); // Registration is restricted to customer accounts
              setError('');
            }}
          >
            Register
          </button>
        </div>

        {error && (
          <div className="error-msg">
            <i className="fas fa-circle-exclamation"></i>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Role selection (Only shown for Sign In) */}
          {!isRegister && (
            <div className="form-group">
              <label htmlFor="auth-role">I am a...</label>
              <div className="input-wrapper">
                <i className="fas fa-user-gear"></i>
                <select
                  id="auth-role"
                  className="form-input select-input"
                  style={{ paddingLeft: 40 }}
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  required
                >
                  <option value="user">Customer / Buyer</option>
                  <option value="admin">Store Admin</option>
                </select>
              </div>
            </div>
          )}

          {/* Full Name (Only for Registration) */}
          {isRegister && (
            <div className="form-group">
              <label htmlFor="auth-fullname">Full Name</label>
              <div className="input-wrapper">
                <i className="fas fa-signature"></i>
                <input
                  id="auth-fullname"
                  type="text"
                  className="form-input"
                  placeholder="Enter full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          {/* Email Address */}
          <div className="form-group">
            <label htmlFor="auth-email">Email Address</label>
            <div className="input-wrapper">
              <i className="fas fa-envelope"></i>
              <input
                id="auth-email"
                type="email"
                className="form-input"
                placeholder="Enter email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password */}
          <div className="form-group">
            <label htmlFor="auth-password">Password</label>
            <div className="input-wrapper">
              <i className="fas fa-key"></i>
              <input
                id="auth-password"
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
          </div>

          {/* Confirm Password (Only for Registration) */}
          {isRegister && (
            <div className="form-group">
              <label htmlFor="auth-confirm-password">Confirm Password</label>
              <div className="input-wrapper">
                <i className="fas fa-key"></i>
                <input
                  id="auth-confirm-password"
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            className="btn-login"
            id="btn-auth-submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }}></div>
                Authenticating...
              </>
            ) : (
              <>
                <i className={`fas ${isRegister ? 'fa-user-plus' : 'fa-right-to-bracket'}`}></i>
                {isRegister ? 'Create Account' : 'Sign In'}
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  );
}
