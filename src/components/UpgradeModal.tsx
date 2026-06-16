import { useState } from 'react'
import { startCheckout } from '../lib/polar'
import { useLanguage } from '../contexts/LanguageContext'

interface Props {
  onClose: () => void
  userEmail: string
  feature: 'ai' | 'report'
}

export default function UpgradeModal({ onClose, userEmail, feature }: Props) {
  const { t } = useLanguage()
  const u = t.upgrade
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  const featureText = feature === 'ai' ? u.feature_ai : u.feature_report
  const subtitle = u.subtitle.replace('{feature}', featureText)

  async function handleUpgrade() {
    setLoading(true)
    setError(null)
    try {
      await startCheckout(userEmail)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--color-surface)',
          borderRadius: '24px 24px 0 0',
          padding: '28px 24px 40px',
          width: '100%',
          maxWidth: '480px',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{
          width: '40px', height: '4px',
          background: 'var(--color-border)',
          borderRadius: '2px',
          margin: '0 auto 24px',
        }} />

        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <span style={{ fontSize: '3rem' }}>✨</span>
        </div>

        <h2 style={{
          textAlign: 'center',
          fontSize: '1.3rem',
          fontWeight: 800,
          color: 'var(--color-text)',
          marginBottom: '8px',
        }}>
          {u.title}
        </h2>
        <p style={{
          textAlign: 'center',
          fontSize: '0.85rem',
          color: 'var(--color-text-muted)',
          marginBottom: '24px',
        }}>
          {subtitle}
        </p>

        <div style={{
          background: 'var(--color-surface-2)',
          borderRadius: '14px',
          padding: '16px',
          marginBottom: '20px',
        }}>
          {u.features.map((item, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '6px 0',
              borderBottom: i < u.features.length - 1 ? '1px solid var(--color-border)' : 'none',
            }}>
              <span style={{ fontSize: '1.1rem' }}>{item.icon}</span>
              <span style={{ fontSize: '0.82rem', color: 'var(--color-text)' }}>{item.text}</span>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <span style={{
            fontSize: '1.8rem', fontWeight: 800,
            color: 'var(--color-primary)',
          }}>{u.price}</span>
          <span style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>{u.per_month}</span>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
            {u.annual}
          </div>
        </div>

        {error && (
          <p style={{
            fontSize: '0.8rem', color: '#ef4444',
            textAlign: 'center', marginBottom: '12px',
          }}>{error}</p>
        )}

        <button
          onClick={handleUpgrade}
          disabled={loading}
          style={{
            width: '100%',
            padding: '16px',
            borderRadius: '14px',
            border: 'none',
            background: loading
              ? 'var(--color-border)'
              : 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
            color: '#fff',
            fontWeight: 700,
            fontSize: '1rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            marginBottom: '12px',
          }}
        >
          {loading ? u.loading : u.cta}
        </button>

        <button
          onClick={onClose}
          style={{
            width: '100%',
            padding: '10px',
            border: 'none',
            background: 'none',
            color: 'var(--color-text-muted)',
            fontSize: '0.9rem',
            cursor: 'pointer',
          }}
        >
          {u.later}
        </button>
      </div>
    </div>
  )
}
