import { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import Sidebar    from './components/layout/Sidebar';
import BottomNav  from './components/layout/BottomNav';
import Toast      from './components/ui/Toast';

import AuthPage          from './pages/AuthPage';
import DashboardPage     from './pages/DashboardPage';
import GaragePage        from './pages/GaragePage';
import SessionsPage      from './pages/SessionsPage';
import SessionDetailPage from './pages/SessionDetailPage';
import LogSessionPage    from './pages/LogSessionPage';
import ProfilePage       from './pages/ProfilePage';

import { getCars }     from './api/cars';
import { getSessions } from './api/sessions';

// ── Auth guard ────────────────────────────────────────────────────────────────

function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="loading-screen">
      <div className="sector-spinner" />
      <span className="label-cap">SECTOR</span>
    </div>
  );
  return user ? children : <Navigate to="/login" replace />;
}

// ── Authenticated shell ───────────────────────────────────────────────────────

function AppShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [cars,        setCars]        = useState([]);
  const [sessions,    setSessions]    = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [toast,       setToast]       = useState(null);
  const [presetCarId, setPresetCarId] = useState(null);

  // Toast auto-dismiss
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  // Load cars + sessions once on mount
  useEffect(() => {
    Promise.all([getCars(), getSessions()])
      .then(([carsRes, sessRes]) => {
        setCars(carsRes.data.cars);
        setSessions(sessRes.data.sessions);
      })
      .catch(() => {})
      .finally(() => setDataLoading(false));
  }, []);

  const handleLogSession = useCallback((carId = null) => {
    setPresetCarId(carId);
    navigate('/log');
  }, [navigate]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (dataLoading) return (
    <div className="loading-screen">
      <div className="sector-spinner" />
      <span className="label-cap">Loading logbook…</span>
    </div>
  );

  return (
    <div className="app-shell">
      <Sidebar user={user} onLogout={handleLogout} onLogSession={handleLogSession} />

      <main className="main">
        <Routes>
          <Route path="/dashboard" element={
            <DashboardPage user={user} sessions={sessions} cars={cars} onLogSession={handleLogSession} />
          } />
          <Route path="/garage" element={
            <GaragePage
              cars={cars} sessions={sessions}
              onCarsChange={setCars}
              onLogSessionFor={(id) => handleLogSession(id)}
              onToast={setToast}
            />
          } />
          <Route path="/sessions" element={
            <SessionsPage sessions={sessions} cars={cars} onLogSession={handleLogSession} />
          } />
          <Route path="/sessions/:id" element={
            <SessionDetailPage
              sessions={sessions}
              onSessionsChange={setSessions}
              onToast={setToast}
            />
          } />
          <Route path="/log" element={
            <LogSessionPage
              cars={cars}
              presetCarId={presetCarId}
              onSessionCreated={(s) => {
                setSessions(prev => [s, ...prev]);
                getCars().then(r => setCars(r.data.cars)).catch(() => {});
              }}
              onToast={setToast}
            />
          } />
          <Route path="/profile" element={
            <ProfilePage onToast={setToast} />
          } />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>

      <BottomNav onLogSession={handleLogSession} />
      <Toast message={toast} />
    </div>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <Routes>
      <Route path="/login"  element={<AuthPage />} />
      <Route path="/*"      element={<RequireAuth><AppShell /></RequireAuth>} />
    </Routes>
  );
}
