import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'

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

        {/* Pages Section */}
        <SectionTitle>{g.pages_title}</SectionTitle>

        {g.pages.map((page) => (
          <GuideCard key={page.icon} icon={page.icon} title={page.title}>
            <p style={{ fontSize: '0.83rem', color: 'var(--color-text-muted)', lineHeight: 1.6, margin: 0 }}>
              {page.desc}
            </p>
          </GuideCard>
        ))}

        {/* Terms Section */}
        <SectionTitle style={{ marginTop: '28px' }}>{g.terms_title}</SectionTitle>

        {g.terms.map((term) => (
          <GuideCard key={term.term} icon={term.icon} title={term.term}>
            <p style={{ fontSize: '0.83rem', color: 'var(--color-text-muted)', lineHeight: 1.6, margin: 0 }}>
              {term.desc}
            </p>
          </GuideCard>
        ))}

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
