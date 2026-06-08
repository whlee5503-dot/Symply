import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SCENARIOS, injectMockData, clearMockData, type ScenarioKey } from '../lib/mockData'

export default function MockDataPage() {
  const navigate = useNavigate()
  const [active, setActive] = useState<ScenarioKey | null>(null)
  const [injected, setInjected] = useState(false)

  function handleInject(key: ScenarioKey) {
    injectMockData(key)
    setActive(key)
    setInjected(true)
  }

  function handleClear() {
    clearMockData()
    setActive(null)
    setInjected(false)
  }

  const scenario = active ? SCENARIOS[active] : null

  return (
    <div style={{
      minHeight: '100dvh',
      backgroundColor: 'var(--color-bg)',
      fontFamily: 'system-ui, sans-serif',
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
        color: 'white',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '1.4rem' }}>🧪</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1rem' }}>Mock Data Testbed</div>
            <div style={{ fontSize: '0.72rem', opacity: 0.85 }}>
              Injects demo data into localStorage for testing
            </div>
          </div>
        </div>
        <button
          onClick={() => navigate('/')}
          style={{
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            borderRadius: '8px',
            color: 'white',
            padding: '6px 12px',
            fontSize: '0.8rem',
            cursor: 'pointer',
          }}
        >
          ← App
        </button>
      </div>

      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '20px 16px' }}>

        {/* 경고 배너 */}
        <div style={{
          padding: '12px 14px',
          borderRadius: '10px',
          background: '#fef9c3',
          border: '1px solid #fbbf24',
          marginBottom: '20px',
          fontSize: '0.8rem',
          color: '#92400e',
        }}>
          ⚠️ This page injects <strong>fake data</strong> into localStorage only.
          Your real Firestore data is never affected.
          Clear before logging real data.
        </div>

        {/* 현재 상태 */}
        {injected && scenario && (
          <div style={{
            padding: '14px 16px',
            borderRadius: '12px',
            background: '#dcfce7',
            border: '1px solid #22c55e',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#15803d' }}>
                ✅ Active: {scenario.emoji} {scenario.label}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#166534', marginTop: '2px' }}>
                {scenario.data.length} days injected into localStorage
              </div>
            </div>
            <button
              onClick={handleClear}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                border: '1.5px solid #dc2626',
                background: 'white',
                color: '#dc2626',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              🗑 Clear
            </button>
          </div>
        )}

        {/* 시나리오 카드들 */}
        <p style={{
          fontSize: '0.75rem',
          fontWeight: 700,
          color: 'var(--color-text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          marginBottom: '12px',
        }}>
          Choose a Scenario
        </p>

        {(Object.entries(SCENARIOS) as [ScenarioKey, typeof SCENARIOS[ScenarioKey]][]).map(([key, s]) => (
          <div
            key={key}
            style={{
              borderRadius: '14px',
              border: active === key
                ? '2px solid var(--color-primary)'
                : '1px solid var(--color-border)',
              background: active === key
                ? 'var(--color-primary-light)'
                : 'var(--color-surface)',
              padding: '16px',
              marginBottom: '12px',
            }}
          >
            {/* 헤더 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <span style={{ fontSize: '1.8rem' }}>{s.emoji}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-text)' }}>
                  {s.label}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                  {s.persona} · {s.data.length} days
                </div>
              </div>
              <span style={{
                padding: '3px 10px',
                borderRadius: '10px',
                background: 'var(--color-secondary-light)',
                color: 'var(--color-secondary)',
                fontSize: '0.72rem',
                fontWeight: 700,
              }}>
                {s.condition}
              </span>
            </div>

            {/* 예상 패턴 */}
            <div style={{ marginBottom: '14px' }}>
              <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '6px' }}>
                EXPECTED PATTERNS
              </p>
              {s.patterns.map((p, i) => (
                <div key={i} style={{
                  fontSize: '0.78rem',
                  color: 'var(--color-text)',
                  padding: '4px 0',
                  borderBottom: i < s.patterns.length - 1 ? '1px solid var(--color-border)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}>
                  <span style={{ color: 'var(--color-primary)', fontWeight: 700 }}>→</span>
                  {p}
                </div>
              ))}
            </div>

            {/* 주입 버튼 */}
            <button
              onClick={() => handleInject(key)}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '10px',
                border: 'none',
                background: active === key
                  ? 'var(--color-primary)'
                  : 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                color: 'white',
                fontWeight: 700,
                fontSize: '0.88rem',
                cursor: 'pointer',
              }}
            >
              {active === key ? '✅ Active' : `💉 Inject ${s.label.split('—')[0].trim()} Data`}
            </button>
          </div>
        ))}

        {/* 테스트 가이드 */}
        <div style={{
          marginTop: '8px',
          padding: '16px',
          borderRadius: '12px',
          background: 'var(--color-surface-2)',
          border: '1px solid var(--color-border)',
        }}>
          <p style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--color-text)', marginBottom: '10px' }}>
            🧭 Test Checklist
          </p>
          {[
            { tab: 'History',  check: 'Calendar heatmap shows 30 days of color-coded data' },
            { tab: 'Insights', check: 'Pattern Insights cards appear (sleep, trigger, activity)' },
            { tab: 'Insights', check: 'Charts show 30-day pain/fatigue/sleep trends' },
            { tab: 'Insights', check: 'Top Triggers bar shows gluten/stress/poor_sleep' },
            { tab: 'Report',   check: 'Preview shows stats + top triggers' },
            { tab: 'Report',   check: 'PDF downloads with full data table' },
          ].map((item, i) => (
            <div key={i} style={{
              display: 'flex',
              gap: '8px',
              padding: '6px 0',
              borderBottom: i < 5 ? '1px solid var(--color-border)' : 'none',
              alignItems: 'flex-start',
            }}>
              <span style={{
                padding: '1px 6px',
                borderRadius: '6px',
                background: 'var(--color-primary-light)',
                color: 'var(--color-primary)',
                fontSize: '0.65rem',
                fontWeight: 700,
                flexShrink: 0,
                marginTop: '1px',
              }}>
                {item.tab}
              </span>
              <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                {item.check}
              </span>
            </div>
          ))}
        </div>

        {/* 하단 여백 */}
        <div style={{ height: '32px' }} />
      </div>
    </div>
  )
}
