import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../../contexts/LanguageContext'

export default function GuideLink() {
  const navigate = useNavigate()
  const { t } = useLanguage()
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '4px' }}>
      <button
        onClick={() => navigate('/guide')}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--color-primary)', fontSize: '0.78rem',
          display: 'flex', alignItems: 'center', gap: '4px', padding: '2px 0',
        }}
      >
        📖 {t.settings.about_guide}
      </button>
    </div>
  )
}
