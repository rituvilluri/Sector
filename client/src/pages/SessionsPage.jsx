import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/layout/PageHeader';
import EmptyState from '../components/ui/EmptyState';
import { IconPlus, IconSearch, IconChevron, IconStopwatch } from '../components/ui/Icons';
import { TRACKS } from '../constants/tracks';

export default function SessionsPage({ sessions, cars, onLogSession }) {
  const [filterCar,   setFilterCar]   = useState('all');
  const [filterTrack, setFilterTrack] = useState('all');
  const [search,      setSearch]      = useState('');
  const navigate = useNavigate();

  const carId = (s) => s.car?._id || s.car;

  const filtered = sessions.filter(s => {
    if (filterCar !== 'all' && carId(s) !== filterCar) return false;
    if (filterTrack !== 'all' && s.track !== filterTrack) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!s.track.toLowerCase().includes(q) &&
          !(s.carLabel || s.car?.model || '').toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const grouped = filtered.reduce((acc, s) => {
    const m = new Date(s.date).toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });
    (acc[m] = acc[m] || []).push(s);
    return acc;
  }, {});

  return (
    <div className="fade-in">
      <PageHeader
        eyebrow="THE LOGBOOK"
        title="Every session, every lap."
        subtitle={`${sessions.length} session${sessions.length !== 1 ? 's' : ''} on file. Filter to find a single afternoon.`}
        right={
          <button onClick={onLogSession} className="btn btn-primary" style={{ height: 44 }}>
            <IconPlus size={13} sw={2} /> LOG SESSION
          </button>
        }
      />

      {/* Filter bar */}
      <div className="filter-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 200 }}>
          <IconSearch size={14} sw={1.4} style={{ color: 'var(--muted)' }} />
          <input
            placeholder="Search by track or car…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'var(--ivory)', fontSize: 13, padding: '12px 0' }}
          />
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <select className="field" style={{ width: 180, borderBottom: 'none', padding: '8px 28px 8px 12px', border: '1px solid var(--border)', background: 'var(--surface)' }}
            value={filterCar} onChange={e => setFilterCar(e.target.value)}>
            <option value="all">All Cars</option>
            {cars.map(c => <option key={c._id} value={c._id}>{c.make} {c.model.split(' ')[0]}</option>)}
          </select>
          <select className="field" style={{ width: 200, borderBottom: 'none', padding: '8px 28px 8px 12px', border: '1px solid var(--border)', background: 'var(--surface)' }}
            value={filterTrack} onChange={e => setFilterTrack(e.target.value)}>
            <option value="all">All Tracks</option>
            {TRACKS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<IconStopwatch size={32} sw={1} />}
          title={sessions.length === 0 ? 'No sessions logged yet.' : 'No sessions match these filters.'}
          sub={sessions.length === 0 ? 'Log your first session to start building your logbook.' : 'Try clearing a filter.'}
          action={sessions.length === 0 && (
            <button onClick={onLogSession} className="btn btn-primary">
              <IconPlus size={13} sw={2} /> LOG FIRST SESSION
            </button>
          )}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          {Object.entries(grouped).map(([month, items]) => (
            <div key={month}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 16 }}>
                <span className="label-cap">{month}</span>
                <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                <span className="label-cap" style={{ fontSize: 9 }}>{items.length} {items.length === 1 ? 'SESSION' : 'SESSIONS'}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {items.map(s => (
                  <div key={s._id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 24, padding: '20px 24px', cursor: 'pointer' }} onClick={() => navigate(`/sessions/${s._id}`)}>
                    <div style={{ minWidth: 48, textAlign: 'center' }}>
                      <div className="mono" style={{ fontSize: 22, color: 'var(--ivory)', lineHeight: 1 }}>
                        {new Date(s.date).getUTCDate().toString().padStart(2, '0')}
                      </div>
                      <span className="label-cap" style={{ fontSize: 9, marginTop: 4 }}>
                        {new Date(s.date).toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' })}
                      </span>
                    </div>
                    <div style={{ width: 1, alignSelf: 'stretch', background: 'var(--border)' }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 16, color: 'var(--ivory)' }}>{s.track}</div>
                      <div style={{ display: 'flex', gap: 14, marginTop: 6, color: 'var(--muted)', fontSize: 12, flexWrap: 'wrap' }}>
                        <span>{s.carLabel || s.car?.model || '—'}</span>
                        <span>·</span>
                        <span>{s.laps?.length || s.totalLaps || 0} laps</span>
                        {s.duration && <><span>·</span><span>{s.duration}</span></>}
                        {s.weather && <><span>·</span><span>{s.weather}</span></>}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
                      {s.avgLap && (
                        <div style={{ textAlign: 'right' }}>
                          <span className="label-cap" style={{ fontSize: 9, marginBottom: 4, display: 'block' }}>Avg</span>
                          <div className="mono" style={{ fontSize: 14, color: 'var(--ivory)' }}>{s.avgLap}</div>
                        </div>
                      )}
                      <div style={{ textAlign: 'right' }}>
                        <span className="label-cap" style={{ fontSize: 9, marginBottom: 4, display: 'block' }}>Best</span>
                        <div className="mono gold" style={{ fontSize: 18 }}>{s.bestLap}</div>
                      </div>
                      <IconChevron size={14} sw={1.4} style={{ color: 'var(--muted-2)' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
