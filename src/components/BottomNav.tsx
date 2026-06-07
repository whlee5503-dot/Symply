import { useNavigate, useLocation } from 'react-router-dom'

const TABS = [
  { icon: '🏠', label: 'Home',     path: '/' },
  { icon: '📅', label: 'History',  path: '/history' },
  { icon: '📊', label: 'Insights', path: '/insights' },
  { icon: '📄', label: 'Report',   path: '/report' },
  { icon: '⚙️', label: 'Settings', path: '/settings' },
]

export default function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      paddingBottom: 'env(safe-area-inset-bottom)',
      display: 'flex',
      backgroundColor: 'var(--color-surface)',
      borderTop: '1px solid var(--color-border)',
      zIndex: 9999,
    }}>
      {TABS.map((tab) => {
        const active = location.pathname === tab.path
        return (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            style={{
              flex: 1,
              border: 'none',
              background: 'none',
              padding: '8px 4px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '2px',
              color: active ? 'var(--color-primary)' : 'var(--color-text-muted)',
              fontWeight: active ? 600 : 400,
              fontSize: '0.7rem',
            }}
          >
            <span style={{ fontSize: '1.3rem' }}>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
