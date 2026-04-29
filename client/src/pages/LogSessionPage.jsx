import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/layout/PageHeader';
import { IconPlus, IconClose } from '../components/ui/Icons';
import { createSession } from '../api/sessions';

const TRACKS = [
  'Laguna Seca', 'Road Atlanta', 'Watkins Glen', 'Circuit of the Americas',
  'Lime Rock Park', 'Virginia International Raceway', 'Sonoma Raceway',
  'Sebring International Raceway', 'Mid-Ohio Sports Car Course', 'Barber Motorsports Park',
  'Eagles Canyon Raceway', 'Motorsport Ranch 3.1 Mile', 'Motorsport Ranch 1.7 Mile',
];

export default function LogSessionPage({ cars, presetCarId, onSessionCreated, onToast }) {
  const navigate  = useNavigate();
  const [carId,    setCarId]    = useState(presetCarId || cars[0]?._id || '');
  const [track,    setTrack]    = useState('');
  const [date,     setDate]     = useState(new Date().toISOString().slice(0, 10));
  const [duration, setDuration] = useState('');
  const [weather,  setWeather]  = useState('');
  const [tireSet,  setTireSet]  = useState('');
  const [notes,    setNotes]    = useState('');
  const [laps,     setLaps]     = useState(['']);
  const [errors,   setErrors]   = useState({});
  const [saving,   setSaving]   = useState(false);

  const addLap    = () => setLaps(l => [...l, '']);
  const updateLap = (i, v) => setLaps(l => { const n = [...l]; n[i] = v; return n; });
  const removeLap = (i) => setLaps(l => l.filter((_, idx) => idx !== i));

  const validLaps = laps.filter(l => l.trim());
  const bestLap   = validLaps.length ? [...validLaps].sort()[0] : '';
  const avgLap    = validLaps.length ? [...validLaps].sort()[Math.floor(validLaps.length / 2)] : '';

  const normalizeLap = (raw) => {
    const s = raw.trim();
    if (!s) return s;
    if (/^\d+:\d{2}\.\d{3}$/.test(s)) return s;
    // M:SS.mm or M:SS.m — pad milliseconds
    let m = s.match(/^(\d+):(\d{2})\.(\d{1,2})$/);
    if (m) return `${m[1]}:${m[2]}.${m[3].padEnd(3, '0')}`;
    // M.SS.mmm or M.SS.mm or M.SS.m (dots as separators, e.g. 1.20.22)
    m = s.match(/^(\d+)\.(\d{2})\.(\d{1,3})$/);
    if (m) return `${m[1]}:${m[2]}.${m[3].padEnd(3, '0')}`;
    // total seconds like 80.22 → 1:20.220
    m = s.match(/^(\d+)\.(\d{1,3})$/);
    if (m) {
      const total = parseFloat(s);
      const mins = Math.floor(total / 60);
      const [sec, ms = ''] = (total - mins * 60).toFixed(3).split('.');
      return `${mins}:${sec.padStart(2, '0')}.${ms}`;
    }
    return s;
  };

  const blurLap = (i) => {
    const normalized = normalizeLap(laps[i]);
    if (normalized !== laps[i]) updateLap(i, normalized);
  };

  const validate = () => {
    const e = {};
    if (!carId)  e.car   = 'Select a car';
    if (!track)  e.track = 'Select a track';
    if (!date)   e.date  = 'Select a date';
    if (!validLaps.length) e.laps = 'Enter at least one lap time';
    else if (validLaps.some(l => !/^\d+:\d{2}\.\d{3}$/.test(l))) {
      e.laps = 'Could not parse a lap time — use format M:SS.mmm (e.g. 1:20.220)';
    }
    return e;
  };

  const submit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setSaving(true);

    const car = cars.find(c => c._id === carId);

    try {
      const res = await createSession({
        car: carId,
        carLabel: car ? `${car.make} ${car.model.split(' ').slice(0, 2).join(' ')}` : '',
        track,
        date,
        bestLap,
        avgLap,
        totalLaps: validLaps.length,
        laps: validLaps,
        duration: duration || `${Math.max(20, validLaps.length * 2)} min`,
        weather: weather || '',
        tireSet: tireSet || '',
        notes,
        sectors: [],
      });
      onSessionCreated(res.data.session);
      onToast(`Session committed · ${bestLap}`);
      navigate('/sessions');
    } catch (err) {
      const validationMessage = err.response?.data?.errors?.[0]?.msg;
      onToast(validationMessage || err.response?.data?.message || err.message || 'Failed to save session.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fade-in" style={{ maxWidth: 980 }}>
      <PageHeader
        eyebrow="LOG SESSION"
        title="A new entry in the book."
        subtitle="The numbers are the truth. Capture every lap — even the slow ones."
      />

      <form onSubmit={submit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
        {/* 01 Setup */}
        <FormSection number="01" title="Setup" sub="Where, when, what.">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 28 }}>
            <div>
              <label className="field-label">Track *</label>
              <select className={`field${errors.track ? ' is-invalid' : ''}`} value={track} onChange={e => setTrack(e.target.value)} required>
                <option value="">Select circuit…</option>
                {TRACKS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              {errors.track && <div className="invalid-feedback">{errors.track}</div>}
            </div>
            <div>
              <label className="field-label">Car *</label>
              <select className={`field${errors.car ? ' is-invalid' : ''}`} value={carId} onChange={e => setCarId(e.target.value)} required>
                {cars.length === 0 && <option value="">No cars — add one first</option>}
                {cars.map(c => <option key={c._id} value={c._id}>{c.year} {c.make} {c.model}</option>)}
              </select>
              {errors.car && <div className="invalid-feedback">{errors.car}</div>}
            </div>
            <div>
              <label className="field-label">Date *</label>
              <input className={`field${errors.date ? ' is-invalid' : ''}`} type="date" value={date} onChange={e => setDate(e.target.value)} required />
              {errors.date && <div className="invalid-feedback">{errors.date}</div>}
            </div>
            <div>
              <label className="field-label">Session Duration</label>
              <input className="field" placeholder="e.g. 32 min" value={duration} onChange={e => setDuration(e.target.value)} />
            </div>
          </div>
        </FormSection>

        {/* 02 Conditions */}
        <FormSection number="02" title="Conditions" sub="What the day gave you.">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 28 }}>
            <div>
              <label className="field-label">Weather</label>
              <input className="field" placeholder="Clear · 18°C" value={weather} onChange={e => setWeather(e.target.value)} />
            </div>
            <div>
              <label className="field-label">Tire Set</label>
              <input className="field" placeholder="Cup 2 R · 245/305" value={tireSet} onChange={e => setTireSet(e.target.value)} />
            </div>
          </div>
        </FormSection>

        {/* 03 Laps */}
        <FormSection number="03" title="Laps" sub="One row per lap. Format M:SS.mmm">
          {errors.laps && <div className="invalid-feedback" style={{ marginBottom: 12 }}>{errors.laps}</div>}
          <div style={{ display: 'flex', flexDirection: 'column', border: '1px solid var(--border)' }}>
            {laps.map((lap, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '60px 1fr 60px', alignItems: 'center', borderBottom: i < laps.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <div className="mono label-cap" style={{ fontSize: 10, padding: '14px 18px', borderRight: '1px solid var(--border)', background: '#141414' }}>
                  L{String(i + 1).padStart(2, '0')}
                </div>
                <input
                  className="mono lap-input"
                  placeholder="1:20.220"
                  value={lap}
                  onChange={e => updateLap(i, e.target.value)}
                  onBlur={() => blurLap(i)}
                />
                <button type="button" onClick={() => removeLap(i)} disabled={laps.length === 1} className="lap-remove">
                  <IconClose size={12} sw={1.6} />
                </button>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
            <button type="button" onClick={addLap} className="btn" style={{ height: 38 }}>
              <IconPlus size={12} sw={2} /> ADD LAP
            </button>
            {bestLap && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <span className="label-cap" style={{ fontSize: 9 }}>Session Best</span>
                <span className="mono gold" style={{ fontSize: 18 }}>{bestLap}</span>
              </div>
            )}
          </div>
        </FormSection>

        {/* 04 Notes */}
        <FormSection number="04" title="Notes" sub="What worked, what didn't.">
          <label className="field-label">Driver Notes</label>
          <textarea className="field" rows="5" value={notes} onChange={e => setNotes(e.target.value)}
            placeholder="The car. The corners. The conditions. Things you'll want to remember next time." />
        </FormSection>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, paddingTop: 24, borderTop: '1px solid var(--border)' }}>
          <button type="button" onClick={() => navigate(-1)} className="btn">CANCEL</button>
          <button type="submit" className="btn btn-primary" style={{ minWidth: 200 }} disabled={saving}>
            {saving ? 'SAVING…' : 'COMMIT TO LOGBOOK'}
          </button>
        </div>
      </form>
    </div>
  );
}

function FormSection({ number, title, sub, children }) {
  return (
    <section className="form-section-grid">
      <div>
        <span className="mono label-cap label-cap-gold" style={{ fontSize: 10 }}>{number}</span>
        <div style={{ fontSize: 18, color: 'var(--ivory)', marginTop: 8 }}>{title}</div>
        <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 6, lineHeight: 1.5 }}>{sub}</div>
      </div>
      <div className="card-static" style={{ padding: 28 }}>
        {children}
      </div>
    </section>
  );
}
