import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'
import { TRIGGER_CONDITION_RELEVANCE, getRelevanceDetail, type TriggerMap, type ChronicCondition } from '../types'

const STRENGTH_STARS: Record<string, string> = { strong: '★★★', moderate: '★★', weak: '★' }

export default function GuidePage() {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const g = t.guide

  return (
    <div style={{
      minHeight: '100dvh',
      backgroundColor: 'var(--color-bg)',
      color: 'var(--color-text)',
      paddingBottom: '40px',
    }}>
      {/* Header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 10,
        backgroundColor: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-border)',
        padding: '14px 16px',
        display: 'flex', alignItems: 'center', gap: '12px',
      }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--color-primary)', fontSize: '1.1rem', padding: '4px',
            display: 'flex', alignItems: 'center',
          }}
        >
          ←
        </button>
        <h1 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>
          {g.title}
        </h1>
      </div>

      <div style={{ padding: '20px 16px', maxWidth: '480px', margin: '0 auto' }}>

        {/* Intro */}
        <p style={{
          fontSize: '0.85rem', color: 'var(--color-text-muted)',
          lineHeight: 1.6, marginBottom: '24px',
        }}>
          {g.intro}
        </p>

        {/* Terms Section (glossary — shown first) */}
        <SectionTitle>{g.terms_title}</SectionTitle>

        {g.terms.map((term) => (
          <GuideCard key={term.term} icon={term.icon} title={term.term}>
            <p style={{ fontSize: '0.83rem', color: 'var(--color-text-muted)', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-line' }}>
              {term.desc}
            </p>
          </GuideCard>
        ))}

        {/* Pages Section (how each screen works) */}
        <SectionTitle style={{ marginTop: '28px' }}>{g.pages_title}</SectionTitle>

        {g.pages.map((page) => (
          <GuideCard key={page.icon} icon={page.icon} title={page.title}>
            <p style={{ fontSize: '0.83rem', color: 'var(--color-text-muted)', lineHeight: 1.6, margin: 0 }}>
              {page.desc}
            </p>
          </GuideCard>
        ))}

        {/* Evidence Reference Section */}
        <SectionTitle style={{ marginTop: '28px' }}>{g.evidence_title}</SectionTitle>
        <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', lineHeight: 1.6, marginBottom: '14px' }}>
          {g.evidence_intro}
        </p>

        {(Object.keys(TRIGGER_CONDITION_RELEVANCE) as (keyof TriggerMap)[]).map(triggerKey => {
          const relevance = TRIGGER_CONDITION_RELEVANCE[triggerKey]
          const conditionKeys = Object.keys(relevance) as ChronicCondition[]
          if (conditionKeys.length === 0) return null
          const triggerLabel = t.home[`trigger_${triggerKey}` as keyof typeof t.home] as string

          return (
            <div key={triggerKey} style={{
              backgroundColor: 'var(--color-surface)', borderRadius: '14px',
              border: '1px solid var(--color-border)', padding: '12px 16px', marginBottom: '8px',
            }}>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '8px' }}>{triggerLabel}</div>
              {conditionKeys.map(conditionKey => {
                const detail = getRelevanceDetail(relevance[conditionKey])
                if (!detail) return null
                const conditionLabel = t.settings[`condition_${conditionKey}` as keyof typeof t.settings] as string
                const noteText = detail.note
                  ? (g[`evidence_note_${detail.note}` as keyof typeof g] as string)
                  : null
                return (
                  <div key={conditionKey} style={{ marginBottom: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                      <span style={{ color: 'var(--color-text)' }}>{conditionLabel}</span>
                      <span style={{ color: 'var(--color-primary)', letterSpacing: '1px' }}>{STRENGTH_STARS[detail.strength]}</span>
                    </div>
                    {noteText && (
                      <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: '2px', lineHeight: 1.4 }}>
                        {noteText}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )
        })}

        {/* Disclaimer */}
        <p style={{
          fontSize: '0.72rem', color: 'var(--color-text-muted)',
          textAlign: 'center', marginTop: '32px', lineHeight: 1.5,
        }}>
          {t.settings.about_disclaimer}
        </p>
      </div>
    </div>
  )
}

function SectionTitle({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <h2 style={{
      fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em',
      textTransform: 'uppercase', color: 'var(--color-text-muted)',
      margin: '0 0 12px 4px', ...style,
    }}>
      {children}
    </h2>
  )
}

function GuideCard({ icon, title, children }: {
  icon: string; title: string; children: React.ReactNode
}) {
  return (
    <div style={{
      backgroundColor: 'var(--color-surface)',
      borderRadius: '14px',
      border: '1px solid var(--color-border)',
      padding: '14px 16px',
      marginBottom: '10px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
        <span style={{ fontSize: '1.1rem' }}>{icon}</span>
        <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{title}</span>
      </div>
      {children}
    </div>
  )
}
