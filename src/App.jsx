import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { isConfigured } from './services/supabaseClient';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { HealthProvider } from './context/HealthContext';

// Layouts
import { AppLayout } from './components/layout/AppLayout';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { SignupPage } from './pages/auth/SignupPage';

// Patient Pages
import { HomePage } from './pages/patient/HomePage';
import { CalendarPage } from './pages/patient/CalendarPage';
import { TimelinePage } from './pages/patient/TimelinePage';
import { MedicalRecordsPage } from './pages/patient/MedicalRecordsPage';
import { TrendsPage } from './pages/patient/TrendsPage';
import { HealthStoryPage } from './pages/patient/HealthStoryPage';
import { AIAssistantPage } from './pages/patient/AIAssistantPage';
import { DoctorsPage } from './pages/patient/DoctorsPage';
import { DoctorDetailPage } from './pages/patient/DoctorDetailPage';
import { AppointmentsPage } from './pages/patient/AppointmentsPage';
import { RemindersPage } from './pages/patient/RemindersPage';
import { ProfilePage } from './pages/patient/ProfilePage';
import { SettingsPage } from './pages/patient/SettingsPage';
import { LoadingState } from './components/common/LoadingState';

// ─── Protected Routes Wrapper ───
// Redirects to /login when the user has no active session
const RequireAuth = () => {
  const { isAuthenticated, loading, session } = useAuth();

  // While we check the existing session, show a loading spinner
  if (loading) {
    return <LoadingState message="Checking session…" />;
  }

  // If there's no session and no authenticated user, send to login
  if (!isAuthenticated || !session) {
    return <Navigate to="/login" replace />;
  }

  // User is authenticated — render the child routes
  return <Outlet />;
};

// ─── Config Screen shown when Supabase env vars are missing ───
const ConfigScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
    <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-slate-200 p-8 text-center">
      <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h1 className="text-xl font-bold text-slate-800 mb-2">Supabase not configured</h1>
      <p className="text-sm text-slate-600 mb-6">
        Copy <code className="bg-slate-100 px-1.5 py-0.5 rounded text-red-600 font-mono text-xs">.env.local.example</code> to{' '}
        <code className="bg-slate-100 px-1.5 py-0.5 rounded text-red-600 font-mono text-xs">.env.local</code> and fill
        in your Supabase project URL and anon key.
      </p>
      <pre className="text-left text-xs bg-slate-900 text-slate-200 rounded-lg p-4 overflow-x-auto mb-4">
{`VITE_SUPABASE_URL=https://YOURPROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...`}
      </pre>
      <p className="text-xs text-slate-400">Then restart the dev server.</p>
    </div>
  </div>
);

function App() {
  if (!isConfigured) {
    return <ConfigScreen />;
  }

  return (
    <LanguageProvider>
      <AuthProvider>
        <HealthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

            {/* Root redirects to App Home */}
            <Route path="/" element={<Navigate to="/app/home" replace />} />

            {/* Protected Routes — require authentication */}
            <Route element={<RequireAuth />}>
              <Route path="/app" element={<AppLayout />}>
                <Route index element={<Navigate to="/app/home" replace />} />
                <Route path="home" element={<HomePage />} />
                <Route path="calendar" element={<CalendarPage />} />
                <Route path="timeline" element={<TimelinePage />} />
                <Route path="records" element={<MedicalRecordsPage />} />
                <Route path="trends" element={<TrendsPage />} />
                <Route path="story" element={<HealthStoryPage />} />
                <Route path="ai" element={<AIAssistantPage />} />
                <Route path="doctors" element={<DoctorsPage />} />
                <Route path="doctors/:id" element={<DoctorDetailPage />} />
                <Route path="appointments" element={<AppointmentsPage />} />
                <Route path="reminders" element={<RemindersPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/app/home" replace />} />
          </Routes>
        </HealthProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
