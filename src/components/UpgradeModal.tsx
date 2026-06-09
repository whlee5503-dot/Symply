import { useState } from 'react'
import { startCheckout } from '../lib/polar'

interface Props {
  onClose: () => void
  userEmail: string
  feature: 'ai' | 'report'
}

export default function UpgradeModal({ onClose, userEmail, feature }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  const featureText = feature === 'ai'
    ? 'AI Pattern Analysis'
    : "Doctor's Report PDF"

  async function handleUpgrade() {
    setLoading(true)
    setError(null)
    try {
      await startCheckout(userEmail)
      // 리다이렉트되므로 이후 코드 실행 안됨
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
      setLoading(false)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      zIndex: 1000,
      padding: '0',
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
        {/* 핸들 */}
        <div style={{
          width: '40px', height: '4px',
          background: 'var(--color-border)',
          borderRadius: '2px',
          margin: '0 auto 24px',
        }} />

        {/* 아이콘 */}
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <span style={{ fontSize: '3rem' }}>✨</span>
        </div>

        {/* 제목 */}
        <h2 style={{
          textAlign: 'center',
          fontSize: '1.3rem',
          fontWeight: 800,
          color: 'var(--color-text)',
          marginBottom: '8px',
        }}>
          Upgrade to Pro
        </h2>
        <p style={{
          textAlign: 'center',
          fontSize: '0.85rem',
          color: 'var(--color-text-muted)',
          marginBottom: '24px',
        }}>
          {featureText} is a Pro feature.
          Unlock all Pro features for less than a coffee a month.
        </p>

        {/* 기능 목록 */}
        <div style={{
          background: 'var(--color-surface-2)',
          borderRadius: '14px',
          padding: '16px',
          marginBottom: '20px',
        }}>
          {[
            { icon: '🤖', text: 'AI Pattern Analysis — personalized insights' },
            { icon: '📄', text: "Doctor's Report PDF — clinical summary" },
            { icon: '��', text: 'Flare Prediction — pattern alerts' },
            { icon: '📊', text: 'Unlimited history & advanced charts' },
          ].map((item, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '6px 0',
              borderBottom: i < 3 ? '1px solid var(--color-border)' : 'none',
            }}>
              <span style={{ fontSize: '1.1rem' }}>{item.icon}</span>
              <span style={{ fontSize: '0.82rem', color: 'var(--color-text)' }}>{item.text}</span>
            </div>
          ))}
        </div>

        {/* 가격 */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <span style={{
            fontSize: '1.8rem', fontWeight: 800,
            color: 'var(--color-primary)',
          }}>$3.99</span>
          <span style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}> / month</span>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
            or $29.99/year · Cancel anytime
          </div>
        </div>

        {/* 에러 */}
        {error && (
          <p style={{
            fontSize: '0.8rem', color: '#ef4444',
            textAlign: 'center', marginBottom: '12px',
          }}>{error}</p>
        )}

        {/* 버튼 */}
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
          {loading ? '⏳ Redirecting to checkout...' : '✨ Start Pro — $3.99/mo'}
        </button>

        <button
          onClick={onClose}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '14px',
            border: '1px solid var(--color-border)',
            background: 'none',
            color: 'var(--color-text-muted)',
            fontSize: '0.9rem',
            cursor: 'pointer',
          }}
        >
          Maybe later
        </button>
      </div>
    </div>
  )
}
