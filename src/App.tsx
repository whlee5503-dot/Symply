import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
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

function AppRoutes() {
  const { user, loading } = useAuth()
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
    // /mock 는 로그인 없이 접근 가능
    return (
      <Routes>
        <Route path="/mock" element={<MockDataPage />} />
        <Route path="*"    element={<LoginPage />} />
      </Routes>
    )
  }

  if (!onboarded) {
    return <OnboardingPage onComplete={() => setOnboarded(true)} />
  }

  return (
    <div style={{ backgroundColor: 'var(--color-bg)', minHeight: '100dvh' }}>
      <Routes>
        <Route path="/"         element={<HomePage />} />
        <Route path="/history"  element={<HistoryPage />} />
        <Route path="/cycle"    element={<CycleTrackerPage />} />
        <Route path="/insights" element={<InsightsPage />} />
        <Route path="/report"   element={<ReportPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/mock"     element={<MockDataPage />} />
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
