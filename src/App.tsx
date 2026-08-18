import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import BottomNav from './components/BottomNav'
import HomePage from './pages/HomePage'
import HistoryPage from './pages/HistoryPage'
import InsightsPage from './pages/InsightsPage'
import ReportPage from './pages/ReportPage'
import SettingsPage from './pages/SettingsPage'
import LoginPage from './pages/LoginPage'
import OnboardingPage, { hasOnboarded } from './pages/OnboardingPage'
import CycleTrackerPage from './pages/CycleTrackerPage'
import MockDataPage from './pages/MockDataPage'
import GuidePage from './pages/GuidePage'
import LandingPage from './pages/LandingPage'
import { lazy, Suspense } from 'react'
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage'))
import { initNotifications } from './lib/notifications'
import { trackEvent } from './lib/trackEvent'
import { useEffect } from 'react'

// Logs a page_view on every route change (Firebase Analytics only auto-logs
// the first load, not client-side SPA navigation).
function PageViewTracker() {
  const location = useLocation()
  useEffect(() => {
    trackEvent('page_view', { page_path: location.pathname })
  }, [location.pathname])
  return null
}

function AppRoutes() {
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!user) return
    const lang = navigator.language.startsWith('ko') ? 'ko' : navigator.language.startsWith('es') ? 'es' : 'en'
    initNotifications(
      lang === 'ko' ? '💜 Symply 체크인 시간이에요' : lang === 'es' ? '💜 Hora de registrar síntomas' : '�� Time for your daily check-in',
      lang === 'ko' ? '오늘 증상을 기록하고 패턴을 추적하세요.' : lang === 'es' ? 'Registra tus síntomas de hoy.' : 'Log your symptoms and track your patterns.'
    )
  }, [user])
  const [onboarded, setOnboarded] = useState(() => hasOnboarded())

  if (loading) {
    return (
      <div style={{
        minHeight: '100dvh', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        backgroundColor: 'var(--color-bg)',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '12px' }}>💜</div>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <>
        <PageViewTracker />
        <Routes>
          <Route path="/"     element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/mock" element={<MockDataPage />} />
          <Route path="/privacy"    element={<Suspense fallback={null}><PrivacyPolicyPage lang="en" /></Suspense>} />
          <Route path="/privacy/ko" element={<Suspense fallback={null}><PrivacyPolicyPage lang="ko" /></Suspense>} />
          <Route path="/privacy/es" element={<Suspense fallback={null}><PrivacyPolicyPage lang="es" /></Suspense>} />
          <Route path="*"    element={<LandingPage />} />
        </Routes>
      </>
    )
  }

  if (!onboarded) {
    return <OnboardingPage onComplete={() => setOnboarded(true)} />
  }

  return (
    <div style={{ backgroundColor: 'var(--color-bg)', minHeight: '100dvh' }}>
      <PageViewTracker />
      <Routes>
        <Route path="/"         element={<HomePage />} />
        <Route path="/history"  element={<HistoryPage />} />
        <Route path="/cycle"    element={<CycleTrackerPage />} />
        <Route path="/insights" element={<InsightsPage />} />
        <Route path="/report"   element={<ReportPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/mock"     element={<MockDataPage />} />
        <Route path="/guide"    element={<GuidePage />} />
        <Route path="/privacy"    element={<Suspense fallback={null}><PrivacyPolicyPage lang="en" /></Suspense>} />
        <Route path="/privacy/ko" element={<Suspense fallback={null}><PrivacyPolicyPage lang="ko" /></Suspense>} />
        <Route path="/privacy/es" element={<Suspense fallback={null}><PrivacyPolicyPage lang="es" /></Suspense>} />
        <Route path="*"         element={<Navigate to="/" replace />} />
      </Routes>
      <BottomNav />
      <div className="bottom-nav-spacer" />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}
