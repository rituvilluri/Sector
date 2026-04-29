import { Link, useLocation } from 'react-router-dom';
import { IconDashboard, IconGarage, IconSessions, IconPlus } from '../ui/Icons';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Home',     Icon: IconDashboard },
  { path: '/garage',    label: 'Garage',   Icon: IconGarage    },
  { path: '/sessions',  label: 'Sessions', Icon: IconSessions  },
];

export default function BottomNav({ onLogSession }) {
  const { pathname } = useLocation();

  return (
    <nav className="bottom-nav">
      {NAV_ITEMS.map(({ path, label, Icon }) => (
        <Link
          key={path}
          to={path}
          className={`bottom-item${pathname.startsWith(path) ? ' active' : ''}`}
        >
          <Icon size={18} sw={1.4} />
          <span>{label}</span>
        </Link>
      ))}
      <div className="bottom-item cta" onClick={onLogSession}>
        <IconPlus size={18} sw={2} />
        <span>LOG</span>
      </div>
    </nav>
  );
}
