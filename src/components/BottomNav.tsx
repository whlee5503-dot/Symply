import { useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'

const PROFILE_KEY = 'symply-profile'

function hasCycleCondition(): boolean {
  try {
    const raw = localStorage.getItem(PROFILE_KEY)
    if (!raw) return false
    const profile = JSON.parse(raw)
    const conditions: string[] = profile.conditions ?? []
    return conditions.includes('PCOS') || conditions.includes('endometriosis')
  } catch { return false }
}

export default function BottomNav() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const [showCycle, setShowCycle] = useState(hasCycleCondition)

  useEffect(() => {
    setShowCycle(hasCycleCondition())
  }, [location.pathname])

  useEffect(() => {
    function handleStorage() {
      setShowCycle(hasCycleCondition())
    }
    window.addEventListener('storage', handleStorage)
    window.addEventListener('symply-profile-updated', handleStorage)
    return () => {
      window.removeEventListener('storage', handleStorage)
      window.removeEventListener('symply-profile-updated', handleStorage)
    }
  }, [])

  const TABS = [
    { icon: '🏠', label: 'Home',     path: '/' },
    { icon: '📅', label: 'History',  path: '/history' },
    ...(showCycle ? [{ icon: '🌸', label: 'Cycle', path: '/cycle' }] : []),
    { icon: '📊', label: 'Insights', path: '/insights' },
    { icon: '📄', label: 'Report',   path: '/report' },
    { icon: '⚙️', label: 'Settings', path: '/settings' },
  ]

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      paddingBottom: 'env(safe-area-inset-bottom)',
      display: 'flex',
      backgroundColor: 'var(--color-surface)',
      borderTop: '1px solid var(--color-border)',
      zIndex: 9999,
    }}>
      {TABS.map((tab) => {
        const active = location.pathname === tab.path
        return (
          <button key={tab.path} onClick={() => navigate(tab.path)} style={{
            flex: 1, border: 'none', background: 'none',
            padding: '8px 4px', cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
            color: active ? 'var(--color-primary)' : 'var(--color-text-muted)',
            fontWeight: active ? 600 : 400, fontSize: '0.7rem',
          }}>
            <span style={{ fontSize: '1.3rem' }}>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
