import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [menuOpen, setMenuOpen] = useState(false);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav style={{
      background: 'rgba(13,21,32,0.95)',
      borderBottom: '1px solid var(--border)',
      backdropFilter: 'blur(12px)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '64px',
      }}>
        {/* Logo */}
        <Link to="/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: 32, height: 32,
            background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
            borderRadius: '6px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '16px', fontWeight: 700,
            fontFamily: 'Rajdhani, sans-serif',
            color: '#fff',
          }}>⚔</div>
          <span style={{
            fontFamily: 'Rajdhani, sans-serif',
            fontSize: '22px',
            fontWeight: 700,
            color: 'var(--text-primary)',
            letterSpacing: '0.05em',
          }}>CLAN<span style={{ color: 'var(--accent-bright)' }}>FORGE</span></span>
        </Link>

        {/* Nav links */}
        <div style={{ display: 'flex', gap: '4px' }}>
          {[
            { path: '/dashboard', label: 'Dashboard', icon: '⊞' },
            { path: '/stats', label: 'Stats', icon: '◈' },
          ].map(({ path, label, icon }) => (
            <Link key={path} to={path} style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '8px 16px',
              borderRadius: '6px',
              textDecoration: 'none',
              fontFamily: 'Rajdhani, sans-serif',
              fontSize: '14px',
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: isActive(path) ? 'var(--accent-bright)' : 'var(--text-secondary)',
              background: isActive(path) ? 'rgba(26,111,212,0.12)' : 'transparent',
              border: isActive(path) ? '1px solid rgba(26,111,212,0.3)' : '1px solid transparent',
              transition: 'all 0.2s',
            }}>
              <span>{icon}</span> {label}
            </Link>
          ))}
        </div>

        {/* User + logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '6px 12px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '6px',
          }}>
            <div style={{
              width: 28, height: 28,
              background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '12px', fontWeight: 700, color: '#fff',
              fontFamily: 'Rajdhani',
            }}>
              {user.username?.[0]?.toUpperCase() || 'U'}
            </div>
            <span style={{ fontFamily: 'Rajdhani', fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>
              {user.username || 'Player'}
            </span>
          </div>
          <button onClick={logout} className="btn btn-outline btn-sm">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
