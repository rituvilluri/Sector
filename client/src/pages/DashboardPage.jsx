import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/layout/PageHeader';
import { IconPlus, IconArrowRight, IconChevron } from '../components/ui/Icons';

const getCarPhotoStyle = (car) => ({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  objectPosition: car.photoPosition || '50% 50%',
  transform: `scale(${car.photoScale || 1})`,
  transformOrigin: car.photoPosition || '50% 50%',
});

export default function DashboardPage({ user, sessions, cars, onLogSession }) {
  const navigate = useNavigate();
  const recent = sessions.slice(0, 4);
  const totalSessions = sessions.length;
  const totalLaps = sessions.reduce((s, x) => s + (x.laps?.length || x.totalLaps || 0), 0);
  const trackCount = new Set(sessions.map(s => s.track)).size;
  const allBest = sessions.reduce((b, s) => (!b || s.bestLap < b.bestLap ? s : b), null);
  const featuredCar = cars[0];
  const today = new Date();
  const hour = today.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="fade-in">
      <PageHeader
        eyebrow={`${greeting.toUpperCase()} · ${today.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase()}`}
        title={`${greeting}, ${user?.name?.split(' ')[0] || 'Driver'}.`}
        subtitle="Track your pace. Log every session. Find the time."
        right={
          <button onClick={onLogSession} className="btn btn-primary" style={{ height: 46 }}>
            <IconPlus size={14} sw={2} /> LOG NEW SESSION
          </button>
        }
      />

      {/* Stats row */}
      <div className="stat-grid">
        <div className="card-static stat-card hero">
          <span className="label-cap" style={{ fontSize: 10 }}>Personal Best</span>
          <div style={{ flex: 1 }} />
          <div className="stat-num-lg mono" style={{ marginBottom: 8 }}>{allBest?.bestLap || '—'}</div>
          {allBest && <div style={{ fontSize: 12, color: 'var(--muted)' }}>{allBest.track} · {allBest.carLabel || allBest.car?.model}</div>}
        </div>
        <div className="card-static stat-card">
          <span className="label-cap" style={{ fontSize: 10 }}>Total Sessions</span>
          <div style={{ flex: 1 }} />
          <div className="stat-num mono" style={{ marginBottom: 8 }}>{String(totalSessions).padStart(2, '0')}</div>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>Across all tracks</div>
        </div>
        <div className="card-static stat-card">
          <span className="label-cap" style={{ fontSize: 10 }}>Laps Logged</span>
          <div style={{ flex: 1 }} />
          <div className="stat-num mono" style={{ marginBottom: 8 }}>{String(totalLaps)}</div>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>{trackCount} circuit{trackCount !== 1 ? 's' : ''}</div>
        </div>
        <div className="card-static stat-card">
          <span className="label-cap" style={{ fontSize: 10 }}>Cars in Garage</span>
          <div style={{ flex: 1 }} />
          <div className="stat-num mono" style={{ marginBottom: 8 }}>{String(cars.length).padStart(2, '0')}</div>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>Active builds</div>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="dash-split">
        {/* Recent sessions */}
        <section>
          <div className="section-head">
            <span className="label-cap">Recent Sessions</span>
            <a onClick={() => navigate('/sessions')} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'var(--gold)', fontSize: 10, letterSpacing: '0.22em', cursor: 'pointer' }}>
              VIEW ALL <IconArrowRight size={11} sw={1.6} />
            </a>
          </div>

          {recent.length === 0 ? (
            <div style={{ color: 'var(--muted)', fontSize: 14, padding: '40px 0', textAlign: 'center' }}>
              No sessions yet. Log your first one.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {recent.map((s) => (
                <div key={s._id} className="card session-row" onClick={() => navigate(`/sessions/${s._id}`)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 24, flex: 1, minWidth: 0 }}>
                    <div className="date-block">
                      <div className="mono" style={{ fontSize: 22, color: 'var(--ivory)', fontWeight: 500, lineHeight: 1 }}>
                        {new Date(s.date).getUTCDate().toString().padStart(2, '0')}
                      </div>
                      <span className="label-cap" style={{ fontSize: 9, marginTop: 4 }}>
                        {new Date(s.date).toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' })}
                      </span>
                    </div>
                    <div style={{ width: 1, height: 40, background: 'var(--border)' }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 16, color: 'var(--ivory)' }}>{s.track}</div>
                      <div style={{ display: 'flex', gap: 14, marginTop: 6, color: 'var(--muted)', fontSize: 12, flexWrap: 'wrap' }}>
                        <span>{s.carLabel || s.car?.model || '—'}</span>
                        <span>·</span>
                        <span>{s.laps?.length || s.totalLaps || 0} laps</span>
                        {s.weather && <><span>·</span><span>{s.weather}</span></>}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span className="label-cap" style={{ fontSize: 9, marginBottom: 6, display: 'block' }}>Best</span>
                      <div className="mono gold" style={{ fontSize: 18, letterSpacing: '-0.01em' }}>{s.bestLap}</div>
                    </div>
                    <IconChevron size={14} sw={1.4} style={{ color: 'var(--muted-2)' }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Right panels */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Featured car */}
          {featuredCar && (
            <div className="card-static" style={{ padding: 0 }}>
              {featuredCar.photo ? (
                <div style={{ height: 140, borderBottom: '1px solid var(--border)', overflow: 'hidden' }}>
                  <img src={featuredCar.photo} alt={featuredCar.make} style={getCarPhotoStyle(featuredCar)} />
                </div>
              ) : (
                <div className="img-ph" style={{ height: 140, borderBottom: '1px solid var(--border)' }}>
                  CAR PHOTO · {featuredCar.make?.toUpperCase()}
                </div>
              )}
              <div style={{ padding: 22 }}>
                <span className="label-cap" style={{ fontSize: 9 }}>{featuredCar.nickname || 'Daily Driver'}</span>
                <div style={{ fontSize: 18, marginTop: 8, color: 'var(--ivory)' }}>
                  {featuredCar.year} {featuredCar.make} {featuredCar.model}
                </div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>{featuredCar.color}</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 22, paddingTop: 18, borderTop: '1px solid var(--border)' }}>
                  <div>
                    <span className="label-cap" style={{ fontSize: 9 }}>Best Lap</span>
                    <div className="mono gold" style={{ fontSize: 16, marginTop: 4 }}>{featuredCar.bestLap || '—'}</div>
                  </div>
                  <div>
                    <span className="label-cap" style={{ fontSize: 9 }}>Sessions</span>
                    <div className="mono" style={{ fontSize: 16, marginTop: 4, color: 'var(--ivory)' }}>
                      {String(sessions.filter(s => s.car?._id === featuredCar._id || s.car === featuredCar._id).length).padStart(2, '0')}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Pace trend */}
          {sessions.length >= 2 && (
            <div className="card-static" style={{ padding: 22 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <span className="label-cap">Pace Trend · Last {Math.min(sessions.length, 6)}</span>
                <span className="mono" style={{ color: 'var(--gold)', fontSize: 11 }}>RECENT</span>
              </div>
              <PaceTrendChart sessions={sessions.slice(0, 6).reverse()} />
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

function PaceTrendChart({ sessions }) {
  const toSec = (t) => {
    if (!t) return null;
    const [m, s] = t.split(':');
    return parseInt(m, 10) * 60 + parseFloat(s);
  };

  const points = sessions
    .map(s => toSec(s.bestLap))
    .filter(Boolean);

  if (points.length < 2) return null;

  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const W = 200, H = 48, P = 4;

  const coords = points.map((p, i) => [
    P + (i / (points.length - 1)) * (W - P * 2),
    P + ((p - min) / range) * (H - P * 2),
  ]);

  const path = coords.map((c, i) => `${i === 0 ? 'M' : 'L'}${c[0]},${c[1]}`).join(' ');

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 48, display: 'block' }}>
      <path d={path} fill="none" stroke="var(--gold)" strokeWidth="1.4" strokeLinecap="round" />
      {coords.map((c, i) => (
        <circle key={i} cx={c[0]} cy={c[1]} r={i === coords.length - 1 ? 3 : 1.8}
          fill={i === coords.length - 1 ? '#D4A843' : '#1A1A1A'} stroke="#D4A843" strokeWidth="1" />
      ))}
    </svg>
  );
}
