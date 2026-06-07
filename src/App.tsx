import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import BottomNav from './components/BottomNav'
import HomePage from './pages/HomePage'
import HistoryPage from './pages/HistoryPage'
import InsightsPage from './pages/InsightsPage'
import ReportPage from './pages/ReportPage'
import SettingsPage from './pages/SettingsPage'
import OnboardingPage, { hasOnboarded } from './pages/OnboardingPage'

export default function App() {
  const [onboarded, setOnboarded] = useState(() => hasOnboarded())

  if (!onboarded) {
    return <OnboardingPage onComplete={() => setOnboarded(true)} />
  }

  return (
    <BrowserRouter>
      <div style={{ backgroundColor: 'var(--color-bg)', minHeight: '100dvh' }}>
        <Routes>
          <Route path="/"         element={<HomePage />} />
          <Route path="/history"  element={<HistoryPage />} />
          <Route path="/insights" element={<InsightsPage />} />
          <Route path="/report"   element={<ReportPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*"         element={<Navigate to="/" replace />} />
        </Routes>
        <BottomNav />
        <div className="bottom-nav-spacer" />
      </div>
    </BrowserRouter>
  )
}
