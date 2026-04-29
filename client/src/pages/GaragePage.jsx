import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/layout/PageHeader';
import { IconPlus, IconCar, IconWrench, IconEdit, IconCamera, IconUpload, IconTrash } from '../components/ui/Icons';
import { createCar, updateCar, deleteCar, uploadCarPhoto } from '../api/cars';

const getCarPhotoStyle = (car) => ({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  objectPosition: car.photoPosition || '50% 50%',
  transform: `scale(${car.photoScale || 1})`,
  transformOrigin: car.photoPosition || '50% 50%',
});

export default function GaragePage({ cars, sessions, onCarsChange, onLogSessionFor, onToast }) {
  const [selectedId, setSelectedId] = useState(cars[0]?._id || null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showAdjuster, setShowAdjuster] = useState(false);
  const photoInputRef = useRef(null);
  const selected = cars.find(c => c._id === selectedId) || cars[0] || null;

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !selected) return;
    setUploading(true);
    try {
      const res = await uploadCarPhoto(selected._id, file);
      onCarsChange(cars.map(c => c._id === selected._id ? res.data.car : c));
      onToast('Photo uploaded.');
    } catch {
      onToast('Failed to upload photo.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };
  const carSessions = sessions.filter(s =>
    s.car?._id === selected?._id || s.car === selected?._id
  );
  const navigate = useNavigate();

  return (
    <div className="fade-in">
      <PageHeader
        eyebrow="MY GARAGE"
        title="The cars in rotation."
        subtitle={`${cars.length} car${cars.length !== 1 ? 's' : ''} on file. Each logs its own laps, mods, and circuits.`}
        right={
          <button onClick={() => setShowAddModal(true)} className="btn btn-ghost" style={{ height: 44 }}>
            <IconPlus size={13} sw={2} /> ADD CAR
          </button>
        }
      />

      <div className="garage-split">
        {/* Car list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <span className="label-cap" style={{ marginBottom: 4 }}>Stable</span>
          {cars.length === 0 && (
            <div style={{ color: 'var(--muted)', fontSize: 13, padding: '24px 0' }}>
              No cars yet. Add one to get started.
            </div>
          )}
          {cars.map(c => (
            <div key={c._id} onClick={() => setSelectedId(c._id)}
              className="card"
              style={{
                padding: 14, display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer',
                ...(selected?._id === c._id ? { borderColor: 'var(--gold)', boxShadow: '0 0 0 1px rgba(212,168,67,0.3)' } : {}),
              }}>
              <div style={{
                width: 56, height: 56, flexShrink: 0, overflow: 'hidden',
                background: 'repeating-linear-gradient(135deg, #222 0px, #222 6px, #1a1a1a 6px, #1a1a1a 12px)',
                border: '1px solid var(--border)',
                position: 'relative',
              }}>
                {c.photo
                  ? <img src={c.photo} alt={c.make} style={{ ...getCarPhotoStyle(c), position: 'absolute', top: 0, left: 0 }} />
                  : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><IconCar size={20} sw={1.2} style={{ color: 'var(--muted)' }} /></div>
                }
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <span className="label-cap" style={{ fontSize: 9 }}>{c.nickname || '—'}</span>
                <div style={{ fontSize: 14, color: 'var(--ivory)', marginTop: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {c.make} {c.model.split(' ')[0]}
                </div>
                <div className="mono gold" style={{ fontSize: 11, marginTop: 4 }}>{c.bestLap || '—'}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Car detail */}
        {selected ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Hero */}
            <div className="card-static" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{
                height: 280, position: 'relative',
                background: selected.photo
                  ? 'none'
                  : 'linear-gradient(180deg, rgba(212,168,67,0.04), rgba(0,0,0,0)), repeating-linear-gradient(135deg, #1f1f1f 0px, #1f1f1f 10px, #181818 10px, #181818 20px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderBottom: '1px solid var(--border)',
                overflow: 'hidden',
              }}>
                {selected.photo ? (
                  <>
                    <img src={selected.photo} alt={`${selected.make} ${selected.model}`}
                      style={getCarPhotoStyle(selected)} />
                    <button className="btn" disabled={uploading}
                      style={{ position: 'absolute', bottom: 14, right: 16, height: 30, fontSize: 10, background: 'rgba(0,0,0,0.6)', borderColor: 'rgba(255,255,255,0.2)' }}
                      onClick={() => setShowAdjuster(true)}>
                      ADJUST
                    </button>
                  </>
                ) : (
                  <div style={{ textAlign: 'center', color: 'var(--muted)', fontFamily: 'JetBrains Mono', fontSize: 11, letterSpacing: '0.18em' }}>
                    <IconCamera size={28} sw={1} style={{ color: 'var(--muted-2)', marginBottom: 12 }} />
                    <div>VEHICLE PHOTO</div>
                    <div style={{ marginTop: 6, fontSize: 9, color: 'var(--muted-2)' }}>UPLOAD A 3/4 PROFILE</div>
                  </div>
                )}
                <input ref={photoInputRef} type="file" accept="image/jpeg,image/png,image/webp"
                  style={{ display: 'none' }} onChange={handlePhotoUpload} />
                <button className="btn" disabled={uploading}
                  style={{ position: 'absolute', top: 16, right: 16, height: 34, fontSize: 11 }}
                  onClick={() => photoInputRef.current?.click()}>
                  <IconUpload size={12} sw={1.6} /> {uploading ? 'UPLOADING…' : 'UPLOAD'}
                </button>
                {selected.plate && (
                  <span className="sector-tag sector-tag-gold" style={{ position: 'absolute', top: 18, left: 18 }}>{selected.plate}</span>
                )}
              </div>

              <div style={{ padding: 28 }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                  <div>
                    {selected.nickname && <span className="label-cap" style={{ fontSize: 10 }}>{selected.nickname}</span>}
                    <div style={{ fontSize: 26, color: 'var(--ivory)', marginTop: 8, letterSpacing: '-0.01em' }}>
                      {selected.year} {selected.make} {selected.model}
                    </div>
                    {selected.color && <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 6 }}>{selected.color}</div>}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => onLogSessionFor(selected._id)} className="btn btn-primary" style={{ height: 40 }}>
                      <IconPlus size={13} sw={2} /> LOG SESSION
                    </button>
                    <button className="btn-icon" title="Edit car" onClick={() => setShowEditModal(true)}>
                      <IconEdit size={14} sw={1.4} />
                    </button>
                    <button className="btn-icon" title="Delete car"
                      onClick={async () => {
                        if (!confirm(`Remove ${selected.year} ${selected.make} ${selected.model} from your garage?`)) return;
                        try {
                          await deleteCar(selected._id);
                          const remaining = cars.filter(c => c._id !== selected._id);
                          onCarsChange(remaining);
                          setSelectedId(remaining[0]?._id || null);
                          onToast('Car removed from garage.');
                        } catch { onToast('Failed to remove car.'); }
                      }}
                      style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}>
                      <IconTrash size={14} sw={1.4} />
                    </button>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', marginTop: 28, borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
                  <MiniStat label="Best Lap"  value={selected.bestLap || '—'} mono gold />
                  <MiniStat label="Best At"   value={selected.bestTrack || '—'} />
                  <MiniStat label="Sessions"  value={String(carSessions.length).padStart(2, '0')} mono />
                  <MiniStat label="Odometer"  value={selected.odo || '—'} mono last />
                </div>
              </div>
            </div>

            {/* Mods */}
            {selected.mods?.length > 0 && (
              <div className="card-static" style={{ padding: 28 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                  <span className="label-cap">Modifications · {selected.mods.length}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {selected.mods.map((m, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 0', borderBottom: i < selected.mods.length - 1 ? '1px solid var(--border)' : 'none' }}>
                      <div className="mono" style={{ color: 'var(--muted-2)', fontSize: 11, minWidth: 28 }}>{String(i + 1).padStart(2, '0')}</div>
                      <IconWrench size={13} sw={1.4} style={{ color: 'var(--gold)' }} />
                      <div style={{ flex: 1, fontSize: 14, color: 'var(--ivory)' }}>{m}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent sessions */}
            {carSessions.length > 0 && (
              <div className="card-static" style={{ padding: 28 }}>
                <span className="label-cap" style={{ marginBottom: 18, display: 'block' }}>Recent Sessions in this car</span>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {carSessions.slice(0, 3).map((s, i) => (
                    <div key={s._id}
                      onClick={() => navigate(`/sessions/${s._id}`)}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: i < Math.min(carSessions.length, 3) - 1 ? '1px solid var(--border)' : 'none', cursor: 'pointer' }}>
                      <div>
                        <div style={{ fontSize: 14, color: 'var(--ivory)' }}>{s.track}</div>
                        <span className="label-cap" style={{ fontSize: 9, marginTop: 4 }}>
                          {new Date(s.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })}
                        </span>
                      </div>
                      <div className="mono gold" style={{ fontSize: 16 }}>{s.bestLap}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div style={{ color: 'var(--muted)', fontSize: 14, padding: '60px 0', textAlign: 'center' }}>
            Add a car to your garage to get started.
          </div>
        )}
      </div>

      {showAddModal && (
        <AddCarModal
          onClose={() => setShowAddModal(false)}
          onCreate={async (data) => {
            try {
              const res = await createCar(data);
              onCarsChange([res.data.car, ...cars]);
              setSelectedId(res.data.car._id);
              setShowAddModal(false);
              onToast('Car added to garage.');
            } catch (e) {
              onToast(e.response?.data?.message || 'Failed to add car.');
            }
          }}
        />
      )}

      {showAdjuster && selected?.photo && (
        <PhotoAdjuster
          src={selected.photo}
          initialPosition={selected.photoPosition || '50% 50%'}
          initialScale={selected.photoScale || 1}
          onClose={() => setShowAdjuster(false)}
          onSave={async ({ position, scale }) => {
            try {
              const res = await updateCar(selected._id, { photoPosition: position, photoScale: scale });
              onCarsChange(cars.map(c => c._id === selected._id ? res.data.car : c));
              setShowAdjuster(false);
              onToast('Photo position saved.');
            } catch { onToast('Failed to save position.'); }
          }}
        />
      )}

      {showEditModal && selected && (
        <EditCarModal
          car={selected}
          onClose={() => setShowEditModal(false)}
          onSave={async (data) => {
            try {
              const res = await updateCar(selected._id, data);
              onCarsChange(cars.map(c => c._id === selected._id ? res.data.car : c));
              setShowEditModal(false);
              onToast('Car updated.');
            } catch (e) {
              onToast(e.response?.data?.message || 'Failed to update car.');
            }
          }}
        />
      )}
    </div>
  );
}

function MiniStat({ label, value, mono, gold, last }) {
  return (
    <div style={{ padding: '20px 22px', borderRight: last ? 'none' : '1px solid var(--border)' }}>
      <span className="label-cap" style={{ fontSize: 9 }}>{label}</span>
      <div className={mono ? 'mono' : ''} style={{ fontSize: 16, marginTop: 8, color: gold ? 'var(--gold)' : 'var(--ivory)' }}>
        {value}
      </div>
    </div>
  );
}

function AddCarModal({ onClose, onCreate }) {
  const [form, setForm] = useState({ make: '', model: '', year: new Date().getFullYear(), color: '', nickname: '', plate: '', odo: '', mods: '' });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.make.trim())  e.make  = 'Required';
    if (!form.model.trim()) e.model = 'Required';
    if (!form.year || form.year < 1886) e.year = 'Enter a valid year';
    return e;
  };

  const submit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    const data = {
      ...form,
      year: Number(form.year),
      mods: form.mods ? form.mods.split('\n').map(s => s.trim()).filter(Boolean) : [],
    };
    await onCreate(data);
    setSaving(false);
  };

  return (
    <div className="modal-backdrop" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', zIndex: 90, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div className="modal-content" style={{ width: '100%', maxWidth: 540 }}>
        <div className="modal-header">
          <span className="label-cap">Add Car</span>
        </div>
        <form onSubmit={submit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div>
                <label className="field-label">Make *</label>
                <input className="field" value={form.make} onChange={e => set('make', e.target.value)} placeholder="Porsche" />
                {errors.make && <div className="invalid-feedback">{errors.make}</div>}
              </div>
              <div>
                <label className="field-label">Model *</label>
                <input className="field" value={form.model} onChange={e => set('model', e.target.value)} placeholder="911 GT3" />
                {errors.model && <div className="invalid-feedback">{errors.model}</div>}
              </div>
              <div>
                <label className="field-label">Year *</label>
                <input className="field" type="number" value={form.year} onChange={e => set('year', e.target.value)} />
                {errors.year && <div className="invalid-feedback">{errors.year}</div>}
              </div>
              <div>
                <label className="field-label">Color</label>
                <input className="field" value={form.color} onChange={e => set('color', e.target.value)} placeholder="Guards Red" />
              </div>
              <div>
                <label className="field-label">Nickname</label>
                <input className="field" value={form.nickname} onChange={e => set('nickname', e.target.value)} placeholder="Daily" />
              </div>
              <div>
                <label className="field-label">Plate / Identifier</label>
                <input className="field" value={form.plate} onChange={e => set('plate', e.target.value)} placeholder="SCTR · 01" />
              </div>
              <div>
                <label className="field-label">Odometer</label>
                <input className="field" value={form.odo} onChange={e => set('odo', e.target.value)} placeholder="e.g. 12,400 mi" />
              </div>
            </div>
            <div>
              <label className="field-label">Modifications (one per line)</label>
              <textarea className="field" rows={4} value={form.mods} onChange={e => set('mods', e.target.value)} placeholder={"Michelin Cup 2 R\nBrembo CCM-R brakes"} />
            </div>
          </div>
          <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button type="button" className="btn" onClick={onClose}>CANCEL</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'SAVING…' : 'ADD CAR'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditCarModal({ car, onClose, onSave }) {
  const [form, setForm] = useState({
    make: car.make || '',
    model: car.model || '',
    year: car.year || new Date().getFullYear(),
    color: car.color || '',
    nickname: car.nickname || '',
    plate: car.plate || '',
    odo: car.odo || '',
    mods: (car.mods || []).join('\n'),
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.make.trim())  e.make  = 'Required';
    if (!form.model.trim()) e.model = 'Required';
    if (!form.year || form.year < 1886) e.year = 'Enter a valid year';
    return e;
  };

  const submit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    const data = {
      ...form,
      year: Number(form.year),
      mods: form.mods ? form.mods.split('\n').map(s => s.trim()).filter(Boolean) : [],
    };
    await onSave(data);
    setSaving(false);
  };

  return (
    <div className="modal-backdrop" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', zIndex: 90, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div className="modal-content" style={{ width: '100%', maxWidth: 540 }}>
        <div className="modal-header">
          <span className="label-cap">Edit Car</span>
        </div>
        <form onSubmit={submit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div>
                <label className="field-label">Make *</label>
                <input className="field" value={form.make} onChange={e => set('make', e.target.value)} />
                {errors.make && <div className="invalid-feedback">{errors.make}</div>}
              </div>
              <div>
                <label className="field-label">Model *</label>
                <input className="field" value={form.model} onChange={e => set('model', e.target.value)} />
                {errors.model && <div className="invalid-feedback">{errors.model}</div>}
              </div>
              <div>
                <label className="field-label">Year *</label>
                <input className="field" type="number" value={form.year} onChange={e => set('year', e.target.value)} />
                {errors.year && <div className="invalid-feedback">{errors.year}</div>}
              </div>
              <div>
                <label className="field-label">Color</label>
                <input className="field" value={form.color} onChange={e => set('color', e.target.value)} />
              </div>
              <div>
                <label className="field-label">Nickname</label>
                <input className="field" value={form.nickname} onChange={e => set('nickname', e.target.value)} />
              </div>
              <div>
                <label className="field-label">Plate / Identifier</label>
                <input className="field" value={form.plate} onChange={e => set('plate', e.target.value)} />
              </div>
              <div>
                <label className="field-label">Odometer</label>
                <input className="field" value={form.odo} onChange={e => set('odo', e.target.value)} placeholder="e.g. 12,400 mi" />
              </div>
            </div>
            <div>
              <label className="field-label">Modifications (one per line)</label>
              <textarea className="field" rows={4} value={form.mods} onChange={e => set('mods', e.target.value)} />
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

function PhotoAdjuster({ src, initialPosition, initialScale, onClose, onSave }) {
  const parsePos = (pos) => {
    const [x, y] = (pos || '50% 50%').split(' ').map(v => parseFloat(v));
    return { x: isNaN(x) ? 50 : x, y: isNaN(y) ? 50 : y };
  };
  const [pos, setPos] = useState(parsePos(initialPosition));
  const [scale, setScale] = useState(initialScale || 1);
  const [dragging, setDragging] = useState(false);
  const lastRef = useRef(null);
  const containerRef = useRef(null);

  const onMouseDown = (e) => {
    e.preventDefault();
    setDragging(true);
    lastRef.current = { x: e.clientX, y: e.clientY };
  };

  const onMouseMove = (e) => {
    if (!dragging || !lastRef.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const sensitivity = 100 / scale;
    const dx = -(e.clientX - lastRef.current.x) / rect.width * sensitivity;
    const dy = -(e.clientY - lastRef.current.y) / rect.height * sensitivity;
    setPos(p => ({ x: Math.min(100, Math.max(0, p.x + dx)), y: Math.min(100, Math.max(0, p.y + dy)) }));
    lastRef.current = { x: e.clientX, y: e.clientY };
  };

  const onMouseUp = () => { setDragging(false); lastRef.current = null; };

  const onWheel = (e) => {
    e.preventDefault();
    setScale(s => Math.min(4, Math.max(1, s + (e.deltaY < 0 ? 0.15 : -0.15))));
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', zIndex: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
      <div style={{ color: 'var(--muted)', fontSize: 9, letterSpacing: '0.22em' }}>DRAG TO REPOSITION · SCROLL TO ZOOM</div>
      <div ref={containerRef}
        style={{ width: 720, height: 380, overflow: 'hidden', position: 'relative', cursor: dragging ? 'grabbing' : 'grab', border: '1px solid var(--border)' }}
        onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}
        onWheel={onWheel}
      >
        <img src={src} alt="" draggable={false} style={{
          width: '100%', height: '100%',
          objectFit: 'cover',
          objectPosition: `${pos.x}% ${pos.y}%`,
          transform: `scale(${scale})`,
          transformOrigin: `${pos.x}% ${pos.y}%`,
          userSelect: 'none',
        }} />
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', border: '1px solid rgba(212,168,67,0.3)' }} />
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        <button className="btn" style={{ height: 36, fontSize: 11 }} onClick={() => { setScale(1); setPos({ x: 50, y: 50 }); }}>RESET</button>
        <button className="btn" style={{ height: 36, fontSize: 11 }} onClick={onClose}>CANCEL</button>
        <button className="btn btn-primary" style={{ height: 36, fontSize: 11 }} onClick={() => onSave({
          position: `${Math.round(pos.x)}% ${Math.round(pos.y)}%`,
          scale: Number(scale.toFixed(2)),
        })}>APPLY</button>
      </div>
    </div>
  );
}
