import { Link, useLocation } from 'react-router-dom';
import { SectorLogo, IconDashboard, IconGarage, IconSessions, IconPlus } from '../ui/Icons';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', Icon: IconDashboard },
  { path: '/garage',    label: 'My Garage',  Icon: IconGarage    },
  { path: '/sessions',  label: 'Sessions',   Icon: IconSessions  },
];

export default function Sidebar({ user, onLogout, onLogSession }) {
  const { pathname } = useLocation();

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <Link to="/dashboard" style={{ textDecoration: 'none' }}>
          <SectorLogo size={22} fontSize={13} spacing="0.42em" />
        </Link>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-section-label">
          <span className="label-cap">Navigate</span>
        </div>
        {NAV_ITEMS.map(({ path, label, Icon }) => (
          <Link
            key={path}
            to={path}
            className={`nav-item${pathname.startsWith(path) ? ' active' : ''}`}
          >
            <Icon size={16} sw={1.4} />
            <span>{label}</span>
          </Link>
        ))}
      </div>

      <div className="sidebar-cta-wrap">
        <button onClick={onLogSession} className="btn btn-primary sidebar-cta" style={{ width: '100%', height: 44 }}>
          <IconPlus size={14} sw={2} />
          <span className="sidebar-cta-text">LOG SESSION</span>
        </button>
      </div>

      <div style={{ flex: 1 }} />

      <div className="sidebar-foot">
        <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
          <div style={{
            width: 34, height: 34, flexShrink: 0,
            background: '#222', border: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--gold)', fontSize: 11, letterSpacing: '0.1em', fontWeight: 600,
          }}>
            {user?.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'U'}
          </div>
          <div className="user-detail" style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 13, color: 'var(--ivory)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.name}
            </div>
            <span className="label-cap" style={{ fontSize: 9 }}>Club Driver</span>
          </div>
        </Link>
        <button
          onClick={onLogout}
          className="signout"
          style={{
            marginTop: 14, width: '100%', background: 'transparent', border: 'none',
            color: 'var(--muted)', fontSize: 10, letterSpacing: '0.22em',
            textAlign: 'left', cursor: 'pointer', padding: '4px 0', textTransform: 'uppercase',
          }}
        >
          Sign out →
        </button>
      </div>
    </aside>
  );
}
