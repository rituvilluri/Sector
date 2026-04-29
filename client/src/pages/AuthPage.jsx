import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SectorLogo, SectorMark, GoogleG } from '../components/ui/Icons';
import { login as apiLogin, signup as apiSignup, googleLogin } from '../api/auth';
import { useAuth } from '../context/AuthContext';

export default function AuthPage() {
  const [tab, setTab]             = useState('signin');
  const [name, setName]           = useState('');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors]       = useState({});
  const [serverError, setServerError] = useState('');

  const { login } = useAuth();
  const navigate  = useNavigate();
  const isSignUp  = tab === 'signup';

  const validate = () => {
    const e = {};
    if (isSignUp && !name.trim())      e.name     = 'Name is required';
    if (!email.trim())                  e.email    = 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Enter a valid email';
    if (!password)                      e.password = 'Password is required';
    if (isSignUp && password.length < 8) e.password = 'Password must be at least 8 characters';
    return e;
  };

  const submit = async (e) => {
    e.preventDefault();
    setServerError('');
    const fieldErrors = validate();
    if (Object.keys(fieldErrors).length) { setErrors(fieldErrors); return; }
    setErrors({});
    setSubmitting(true);

    try {
      const res = isSignUp
        ? await apiSignup({ name, email, password })
        : await apiLogin({ email, password });
      login(res.data.user);
      navigate('/dashboard');
    } catch (err) {
      setServerError(err.response?.data?.message || 'Something went wrong. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={styles.wrap}>
      <div style={styles.bg} />
      <div style={styles.overlay} />
      <div style={styles.vignette} />

      {/* Top bar */}
      <div style={styles.topbar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <SectorMark size={16} color="var(--gold)" />
          <span className="label-cap" style={{ color: 'var(--muted)' }}>SESSION LOGBOOK · MEMBERS ONLY</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <span className="label-cap" style={{ color: 'var(--muted)' }}>SUNSET · 19:42</span>
          <span style={{ width: 1, height: 12, background: 'var(--border)' }} />
          <span className="label-cap" style={{ color: 'var(--muted)' }}>WIND · 4 KT NW</span>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={styles.bottombar}>
        <span className="label-cap" style={{ color: 'var(--muted-2)' }}>PRIVACY</span>
        <span className="label-cap" style={{ color: 'var(--muted-2)' }}>TERMS</span>
        <span className="label-cap" style={{ color: 'var(--muted-2)' }}>SUPPORT</span>
      </div>

      {/* Glass card */}
      <div style={styles.cardWrap}>
        <div className="auth-card fade-up">
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 38, paddingBottom: 28 }}>
            <SectorLogo size={26} fontSize={15} spacing="0.48em" />
          </div>

          <div style={{ height: 1, background: 'var(--border)' }} />

          {/* Tabs */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
            <button type="button" className={`auth-tab${tab === 'signin' ? ' active' : ''}`} onClick={() => { setTab('signin'); setErrors({}); setServerError(''); }}>
              SIGN IN
            </button>
            <button type="button" className={`auth-tab${tab === 'signup' ? ' active' : ''}`} onClick={() => { setTab('signup'); setErrors({}); setServerError(''); }}>
              SIGN UP
            </button>
          </div>

          <form onSubmit={submit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: '36px 40px 20px' }}>
            {serverError && (
              <div style={{ color: 'var(--danger)', fontSize: 12, letterSpacing: '0.04em', padding: '10px 14px', border: '1px solid var(--danger)', background: 'rgba(192,57,43,0.08)' }}>
                {serverError}
              </div>
            )}

            {isSignUp && (
              <div className="fade-in">
                <label className="field-label">Full Name</label>
                <input className={`field${errors.name ? ' is-invalid' : ''}`} placeholder="As it appears on your license"
                  value={name} onChange={(e) => setName(e.target.value)} />
                {errors.name && <div className="invalid-feedback">{errors.name}</div>}
              </div>
            )}

            <div>
              <label className="field-label">Email</label>
              <input className={`field${errors.email ? ' is-invalid' : ''}`} type="email" placeholder="driver@sector.app"
                value={email} onChange={(e) => setEmail(e.target.value)} />
              {errors.email && <div className="invalid-feedback">{errors.email}</div>}
            </div>

            <div>
              <label className="field-label">Password</label>
              <input className={`field${errors.password ? ' is-invalid' : ''}`} type="password" placeholder="••••••••••••"
                value={password} onChange={(e) => setPassword(e.target.value)} />
              {errors.password && <div className="invalid-feedback">{errors.password}</div>}
            </div>

            {!isSignUp && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: -4 }}>
                <a href="#" style={{ color: 'var(--muted)', fontSize: 12, letterSpacing: '0.04em' }}
                  onClick={(e) => e.preventDefault()}>
                  Forgot password?
                </a>
              </div>
            )}

            <button type="submit" className="btn btn-primary" style={{ width: '100%', height: 48, marginTop: 8 }} disabled={submitting}>
              {submitting ? 'AUTHENTICATING…' : isSignUp ? 'CREATE ACCOUNT' : 'ENTER SECTOR'}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '4px 0' }}>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
              <span style={{ color: 'var(--muted)', fontSize: 10, letterSpacing: '0.3em' }}>OR</span>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            </div>
            <button type="button" className="btn btn-google" style={{ width: '100%', height: 48 }} onClick={googleLogin}>
              <GoogleG /> {isSignUp ? 'Sign up with Google' : 'Sign in with Google'}
            </button>
          </form>

          <div style={{ padding: '20px 40px 32px', textAlign: 'center', color: 'var(--muted-2)', fontSize: 10, letterSpacing: '0.1em', lineHeight: 1.7 }}>
            By continuing you agree to the SECTOR Terms of Service<br />
            and Driver Privacy Notice.
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  wrap: { position: 'relative', minHeight: '100vh', width: '100%', overflow: 'hidden', color: 'var(--ivory)' },
  bg: {
    position: 'absolute', inset: 0,
    backgroundImage: 'url("/assets/track-bg.jpeg"), linear-gradient(160deg, #1a1206 0%, #0e0e0e 50%, #080808 100%)',
    backgroundSize: 'cover', backgroundPosition: 'center',
    transform: 'scale(1.03)',
  },
  overlay: { position: 'absolute', inset: 0, background: 'rgba(8,8,8,0.62)' },
  vignette: {
    position: 'absolute', inset: 0,
    background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 30%, rgba(0,0,0,0.55) 100%)',
    pointerEvents: 'none',
  },
  topbar: {
    position: 'relative', display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', padding: '28px 36px', zIndex: 2,
  },
  bottombar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    gap: 32, padding: '24px 36px', zIndex: 2, flexWrap: 'wrap',
  },
  cardWrap: {
    position: 'relative', zIndex: 3, display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    minHeight: 'calc(100vh - 120px)', padding: '20px',
  },
};
