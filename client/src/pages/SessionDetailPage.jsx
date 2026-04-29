import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageHeader from '../components/layout/PageHeader';
import { IconArrowLeft, IconEdit, IconTrash, IconPlus, IconClose } from '../components/ui/Icons';
import { getSession, deleteSession, updateSession } from '../api/sessions';

export default function SessionDetailPage({ onToast, onSessionsChange, sessions }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(() => sessions.find(s => s._id === id) || null);
  const [loading, setLoading] = useState(!session);
  const [showEdit, setShowEdit] = useState(false);

  useEffect(() => {
    if (!session) {
      getSession(id)
        .then(r => setSession(r.data.session))
        .catch(() => navigate('/sessions'))
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) return (
    <div style={{ padding: '80px 0', textAlign: 'center' }}>
      <div className="sector-spinner" style={{ margin: '0 auto' }} />
    </div>
  );

  if (!session) return null;

  const laps     = session.laps || [];
  const bestIdx  = laps.length ? laps.indexOf([...laps].sort()[0]) : -1;
  const worstLap = laps.length ? [...laps].sort().at(-1) : null;

  const car = session.car;
  const carLabel = session.carLabel || car?.model || '—';

  const handleDelete = async () => {
    if (!confirm('Remove this session from the logbook?')) return;
    try {
      await deleteSession(id);
      onSessionsChange(sessions.filter(s => s._id !== id));
      onToast('Session removed from logbook.');
      navigate('/sessions');
    } catch {
      onToast('Failed to delete session.');
    }
  };

  return (
    <div className="fade-in" style={{ maxWidth: 1100 }}>
      <button onClick={() => navigate('/sessions')} className="btn" style={{ marginBottom: 24, height: 36, fontSize: 11 }}>
        <IconArrowLeft size={12} sw={1.6} /> BACK TO LOGBOOK
      </button>

      <PageHeader
        eyebrow={`SESSION · ${new Date(session.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).toUpperCase()}`}
        title={session.track}
        subtitle={`${car ? `${car.year} ${car.make} ${car.model}` : carLabel} · ${laps.length || session.totalLaps || 0} laps${session.duration ? ` · ${session.duration}` : ''}${session.weather ? ` · ${session.weather}` : ''}`}
        right={
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setShowEdit(true)} className="btn">
              <IconEdit size={13} sw={1.4} /> EDIT
            </button>
            <button onClick={handleDelete} className="btn-icon" title="Delete">
              <IconTrash size={13} sw={1.4} />
            </button>
          </div>
        }
      />

      {/* Top stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 36 }}>
        <DetailStat label="Best Lap"   value={session.bestLap} hero gold />
        {session.avgLap && <DetailStat label="Average"   value={session.avgLap} />}
        {worstLap        && <DetailStat label="Slowest"   value={worstLap} muted />}
        <DetailStat label="Total Laps" value={String(laps.length || session.totalLaps || 0).padStart(2, '0')} />
      </div>

      <div className="session-detail-split">
        {/* Left: chart + lap table */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {laps.length >= 2 && (
            <div className="card-static" style={{ padding: 28 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
                <span className="label-cap">Lap Time Trace</span>
                <span className="label-cap" style={{ fontSize: 9 }}>
                  {(Math.max(...laps.map(toSec)) - Math.min(...laps.map(toSec))).toFixed(2)}s SPREAD
                </span>
              </div>
              <LapChart laps={laps} bestIdx={bestIdx} />
            </div>
          )}

          {laps.length > 0 && (
            <div className="card-static" style={{ padding: 0 }}>
              <div style={{ padding: '20px 28px', borderBottom: '1px solid var(--border)' }}>
                <span className="label-cap">All Laps · {laps.length}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))' }}>
                {laps.map((lap, i) => {
                  const isBest = i === bestIdx;
                  return (
                    <div key={i} style={{
                      padding: '14px 18px',
                      borderRight: '1px solid var(--border)',
                      borderBottom: '1px solid var(--border)',
                      background: isBest ? 'rgba(212,168,67,0.06)' : 'transparent',
                    }}>
                      <span className="label-cap" style={{ fontSize: 9, color: isBest ? 'var(--gold)' : 'var(--muted)' }}>
                        L{String(i + 1).padStart(2, '0')}{isBest ? ' · BEST' : ''}
                      </span>
                      <div className="mono" style={{ fontSize: 14, marginTop: 4, color: isBest ? 'var(--gold)' : 'var(--ivory)', fontWeight: isBest ? 500 : 400 }}>
                        {lap}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right: conditions, sectors, notes */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {session.sectors?.length > 0 && (
            <div className="card-static" style={{ padding: 24 }}>
              <span className="label-cap" style={{ marginBottom: 16, display: 'block' }}>Sectors</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {session.sectors.map((sec, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 24, height: 2, background: i === 0 ? 'var(--gold)' : i === 1 ? '#888' : '#555' }} />
                      <span className="label-cap" style={{ fontSize: 10 }}>S{i + 1}</span>
                    </div>
                    <span className="mono gold" style={{ fontSize: 14 }}>{sec}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="card-static" style={{ padding: 24 }}>
            <span className="label-cap" style={{ marginBottom: 16, display: 'block' }}>Conditions</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {session.weather    && <KV label="Weather"  value={session.weather} />}
              {session.tireSet    && <KV label="Tire Set" value={session.tireSet} />}
              {session.duration   && <KV label="Duration" value={session.duration} />}
              {session.conditions && <KV label="Surface"  value={session.conditions} />}
            </div>
          </div>

          {session.notes && (
            <div className="card-static" style={{ padding: 24 }}>
              <span className="label-cap" style={{ marginBottom: 16, display: 'block' }}>Driver Notes</span>
              <div style={{ fontSize: 14, color: 'var(--ivory)', lineHeight: 1.7 }}>{session.notes}</div>
            </div>
          )}
        </aside>
      </div>

      {showEdit && (
        <EditSessionModal
          session={session}
          onClose={() => setShowEdit(false)}
          onSave={async (updates) => {
            try {
              const res = await updateSession(session._id, updates);
              const updated = res.data.session;
              setSession(updated);
              onSessionsChange(sessions.map(s => s._id === updated._id ? updated : s));
              setShowEdit(false);
              onToast('Session updated.');
            } catch (e) {
              onToast(e.response?.data?.message || 'Failed to update session.');
            }
          }}
        />
      )}
    </div>
  );
}

const toSec = (t) => { const [m, s] = t.split(':'); return parseInt(m, 10) * 60 + parseFloat(s); };

function LapChart({ laps, bestIdx }) {
  const secs = laps.map(toSec);
  const min = Math.min(...secs), max = Math.max(...secs), range = max - min || 1;
  const W = 800, H = 180, P = 20, innerW = W - P * 2, innerH = H - P * 2;
  const pts = secs.map((s, i) => [P + (i / Math.max(1, laps.length - 1)) * innerW, P + ((s - min) / range) * innerH]);
  const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0]},${p[1]}`).join(' ');
  const area = `${path} L${pts.at(-1)[0]},${H - P} L${pts[0][0]},${H - P} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 180, display: 'block' }}>
      <line x1={P} y1={H-P} x2={W-P} y2={H-P} stroke="#2A2A2A" strokeWidth="1" />
      <line x1={P} y1={P}   x2={W-P} y2={P}   stroke="#1f1f1f" strokeWidth="1" strokeDasharray="2,4" />
      {[0.25, 0.5, 0.75].map((f, i) => (
        <line key={i} x1={P} y1={P + f * innerH} x2={W-P} y2={P + f * innerH} stroke="#1a1a1a" strokeWidth="1" />
      ))}
      <path d={area} fill="rgba(212,168,67,0.06)" />
      <path d={path} fill="none" stroke="#D4A843" strokeWidth="1.4" strokeLinejoin="round" />
      {pts.map((p, i) => (
        <circle key={i} cx={p[0]} cy={p[1]} r={i === bestIdx ? 4 : 2.4}
          fill={i === bestIdx ? '#D4A843' : '#1A1A1A'}
          stroke={i === bestIdx ? '#D4A843' : '#888'} strokeWidth="1.2" />
      ))}
      {bestIdx >= 0 && (
        <g>
          <line x1={pts[bestIdx][0]} y1={P} x2={pts[bestIdx][0]} y2={H-P} stroke="rgba(212,168,67,0.3)" strokeWidth="1" strokeDasharray="2,3" />
          <text x={pts[bestIdx][0] + 8} y={P + 12} fill="#D4A843" fontFamily="JetBrains Mono" fontSize="10" letterSpacing="2">BEST</text>
        </g>
      )}
    </svg>
  );
}

function DetailStat({ label, value, hero, gold, muted }) {
  return (
    <div className="card-static" style={{ padding: hero ? 28 : 22, minHeight: hero ? 130 : 100, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <span className="label-cap" style={{ fontSize: 10 }}>{label}</span>
      <div className="mono" style={{ fontSize: hero ? 36 : 22, color: gold ? 'var(--gold)' : muted ? 'var(--muted)' : 'var(--ivory)', letterSpacing: '-0.01em', marginTop: 12 }}>
        {value}
      </div>
    </div>
  );
}

function KV({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span className="label-cap" style={{ fontSize: 9 }}>{label}</span>
      <span style={{ fontSize: 13, color: 'var(--ivory)' }}>{value}</span>
    </div>
  );
}

const TRACKS = [
  'Laguna Seca', 'Road Atlanta', 'Watkins Glen', 'Circuit of the Americas',
  'Lime Rock Park', 'Virginia International Raceway', 'Sonoma Raceway',
  'Sebring International Raceway', 'Mid-Ohio Sports Car Course', 'Barber Motorsports Park',
  'Eagles Canyon Raceway', 'Motorsport Ranch 3.1 Mile', 'Motorsport Ranch 1.7 Mile',
];

function EditSessionModal({ session, onClose, onSave }) {
  const normalizeLap = (raw) => {
    const s = raw.trim();
    if (!s) return s;
    if (/^\d+:\d{2}\.\d{3}$/.test(s)) return s;
    let m = s.match(/^(\d+):(\d{2})\.(\d{1,2})$/);
    if (m) return `${m[1]}:${m[2]}.${m[3].padEnd(3, '0')}`;
    m = s.match(/^(\d+)\.(\d{2})\.(\d{1,3})$/);
    if (m) return `${m[1]}:${m[2]}.${m[3].padEnd(3, '0')}`;
    m = s.match(/^(\d+)\.(\d{1,3})$/);
    if (m) {
      const total = parseFloat(s);
      const mins = Math.floor(total / 60);
      const [sec, ms = ''] = (total - mins * 60).toFixed(3).split('.');
      return `${mins}:${sec.padStart(2, '0')}.${ms}`;
    }
    return s;
  };

  const [track,   setTrack]   = useState(session.track || '');
  const [date,    setDate]    = useState(session.date ? new Date(session.date).toISOString().slice(0,10) : '');
  const [weather, setWeather] = useState(session.weather || '');
  const [tireSet, setTireSet] = useState(session.tireSet || '');
  const [notes,   setNotes]   = useState(session.notes || '');
  const [laps,    setLaps]    = useState(session.laps?.length ? [...session.laps] : ['']);
  const [saving,  setSaving]  = useState(false);

  const addLap    = () => setLaps(l => [...l, '']);
  const updateLap = (i, v) => setLaps(l => { const n = [...l]; n[i] = v; return n; });
  const removeLap = (i) => setLaps(l => l.filter((_, idx) => idx !== i));
  const blurLap   = (i) => { const n = normalizeLap(laps[i]); if (n !== laps[i]) updateLap(i, n); };

  const submit = async (e) => {
    e.preventDefault();
    const validLaps = laps.filter(l => l.trim());
    const bestLap = validLaps.length ? [...validLaps].sort()[0] : session.bestLap;
    const avgLap  = validLaps.length ? validLaps.sort()[Math.floor(validLaps.length / 2)] : session.avgLap;
    setSaving(true);
    await onSave({ track, date, weather, tireSet, notes, laps: validLaps, bestLap, avgLap, totalLaps: validLaps.length });
    setSaving(false);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)', zIndex: 90, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div className="modal-content" style={{ width: '100%', maxWidth: 600, maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="label-cap">Edit Session</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer' }}><IconClose size={14} sw={1.6} /></button>
        </div>
        <form onSubmit={submit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div>
                <label className="field-label">Track</label>
                <select className="field" value={track} onChange={e => setTrack(e.target.value)}>
                  {TRACKS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="field-label">Date</label>
                <input className="field" type="date" value={date} onChange={e => setDate(e.target.value)} />
              </div>
              <div>
                <label className="field-label">Weather</label>
                <input className="field" value={weather} onChange={e => setWeather(e.target.value)} placeholder="Clear · 18°C" />
              </div>
              <div>
                <label className="field-label">Tire Set</label>
                <input className="field" value={tireSet} onChange={e => setTireSet(e.target.value)} />
              </div>
            </div>
            <div>
              <label className="field-label">Laps</label>
              <div style={{ border: '1px solid var(--border)' }}>
                {laps.map((lap, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '50px 1fr 48px', alignItems: 'center', borderBottom: i < laps.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <div className="mono label-cap" style={{ fontSize: 10, padding: '12px 14px', borderRight: '1px solid var(--border)', background: '#141414' }}>L{String(i+1).padStart(2,'0')}</div>
                    <input className="mono lap-input" style={{ fontSize: 14, padding: '12px 14px' }} placeholder="1:20.220" value={lap}
                      onChange={e => updateLap(i, e.target.value)} onBlur={() => blurLap(i)} />
                    <button type="button" onClick={() => removeLap(i)} disabled={laps.length === 1} className="lap-remove"><IconClose size={11} sw={1.6} /></button>
                  </div>
                ))}
              </div>
              <button type="button" onClick={addLap} className="btn" style={{ marginTop: 10, height: 34, fontSize: 11 }}>
                <IconPlus size={11} sw={2} /> ADD LAP
              </button>
            </div>
            <div>
              <label className="field-label">Driver Notes</label>
              <textarea className="field" rows={4} value={notes} onChange={e => setNotes(e.target.value)} />
            </div>
          </div>
          <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button type="button" className="btn" onClick={onClose}>CANCEL</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'SAVING…' : 'SAVE CHANGES'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
