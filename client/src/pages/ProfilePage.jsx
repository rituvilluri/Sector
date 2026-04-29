import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/layout/PageHeader';
import { updateProfile, deleteAccount } from '../api/auth';

export default function ProfilePage({ onToast }) {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();

  const nameParts = (user?.name || '').split(' ');
  const [firstName, setFirstName] = useState(nameParts[0] || '');
  const [lastName,  setLastName]  = useState(nameParts.slice(1).join(' ') || '');
  const [phone,     setPhone]     = useState(user?.phone || '');
  const [saving,    setSaving]    = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting,  setDeleting]  = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const name = `${firstName} ${lastName}`.trim() || firstName;
      const res = await updateProfile({ name, phone: phone.trim() });
      updateUser(res.data.user);
      onToast('Profile updated.');
    } catch {
      onToast('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteAccount();
      await logout();
      navigate('/login');
    } catch {
      onToast('Failed to delete account.');
      setDeleting(false);
    }
  };

  return (
    <div className="fade-in">
      <PageHeader
        eyebrow="ACCOUNT"
        title="Profile & Settings"
        subtitle="Manage your personal information and account preferences."
      />

      <div style={{ maxWidth: 560 }}>
        <form onSubmit={handleSave}>
          <div className="card-static" style={{ padding: 28, marginBottom: 24 }}>
            <span className="label-cap" style={{ display: 'block', marginBottom: 20 }}>Personal Info</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label className="field-label">First Name</label>
                  <input className="field" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="First name" />
                </div>
                <div>
                  <label className="field-label">Last Name</label>
                  <input className="field" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Last name" />
                </div>
              </div>
              <div>
                <label className="field-label">Email</label>
                <input
                  className="field"
                  value={user?.email || ''}
                  readOnly
                  style={{ opacity: 0.55, cursor: 'default' }}
                />
              </div>
              <div>
                <label className="field-label">Phone</label>
                <input
                  className="field"
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>
            <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn btn-primary" style={{ height: 40 }} disabled={saving}>
                {saving ? 'SAVING…' : 'SAVE CHANGES'}
              </button>
            </div>
          </div>
        </form>

        <div className="card-static" style={{ padding: 28 }}>
          <span className="label-cap" style={{ display: 'block', marginBottom: 8, color: 'var(--danger)' }}>Danger Zone</span>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 20, lineHeight: 1.6 }}>
            Permanently delete your account and all associated data — cars, sessions, and every lap record on file. This cannot be undone.
          </p>
          {!showConfirm ? (
            <button
              type="button"
              className="btn"
              onClick={() => setShowConfirm(true)}
              style={{ color: 'var(--danger)', borderColor: 'var(--danger)', height: 36, fontSize: 11 }}
            >
              DELETE ACCOUNT
            </button>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ fontSize: 11, color: 'var(--danger)', fontFamily: 'JetBrains Mono', letterSpacing: '0.12em' }}>
                THIS CANNOT BE UNDONE. ALL DATA WILL BE PERMANENTLY ERASED.
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" className="btn" onClick={() => setShowConfirm(false)} style={{ height: 34, fontSize: 11 }}>CANCEL</button>
                <button
                  type="button"
                  className="btn"
                  onClick={handleDelete}
                  disabled={deleting}
                  style={{ color: 'var(--danger)', borderColor: 'var(--danger)', height: 34, fontSize: 11 }}
                >
                  {deleting ? 'DELETING…' : 'CONFIRM DELETE'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
