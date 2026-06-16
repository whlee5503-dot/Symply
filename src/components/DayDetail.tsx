import { format, parseISO } from 'date-fns'
import { ko, es } from 'date-fns/locale'
import type { LogEntry } from '../types'
import { MOOD_EMOJIS } from '../types'
import Card from './ui/Card'
import { useLanguage } from '../contexts/LanguageContext'

interface Props {
  dateId: string
  entry: LogEntry | null
}

export default function DayDetail({ dateId, entry }: Props) {
  const { language } = useLanguage()
  const locale = language === "ko" ? ko : language === "es" ? es : undefined
  const date = parseISO(dateId)
  const { t } = useLanguage()

  if (!entry) {
    return (
      <Card style={{ textAlign: 'center', padding: '24px' }}>
        <p style={{ fontSize: '1.5rem', marginBottom: '8px' }}>📭</p>
        <p style={{ fontWeight: 600, color: 'var(--color-text)' }}>
          {language === 'ko'
            ? format(date, 'yyyy년 M월 d일', { locale })
            : format(date, 'MMMM d, yyyy', { locale })}
        </p>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>
          {t.history.no_checkin}
        </p>
      </Card>
    )
  }

  const activeTriggers = Object.entries(entry.triggers)
    .filter(([, v]) => v)
    .map(([k]) => (t.home as Record<string, string>)['trigger_' + k] || k.replace('_', ' '))

  return (
    <Card>
      {/* Date header */}
      <p style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-text)', marginBottom: '12px' }}>
        {language === 'ko'
        ? format(date, 'yyyy년 M월 d일 (EEEE)', { locale })
        : format(date, 'EEEE, MMMM d', { locale })}
      </p>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '12px' }}>
        {[
          { label: t.history.pain, value: entry.pain, emoji: '🩹' },
          { label: t.history.fatigue, value: entry.fatigue, emoji: '😴' },
          { label: t.history.sleep, value: `${entry.sleep}h`, emoji: '🌙' },
          { label: t.history.mood, value: MOOD_EMOJIS[entry.mood].emoji, emoji: '' },
        ].map(({ label, value, emoji }) => (
          <div key={label} style={{
            background: 'var(--color-surface-2)',
            borderRadius: '10px',
            padding: '8px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '1.1rem' }}>{emoji}</div>
            <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-text)' }}>{value}</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Activity */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{t.history.activity_label}</span>
        <span style={{
          padding: '2px 10px',
          borderRadius: '12px',
          background: 'var(--color-primary-light)',
          color: 'var(--color-primary)',
          fontSize: '0.8rem',
          fontWeight: 600,
          textTransform: 'capitalize',
        }}>
          {entry.activity === 'low' ? t.home.activity_low : entry.activity === 'high' ? t.home.activity_high : t.home.activity_medium}
        </span>
      </div>

      {/* Triggers */}
      {activeTriggers.length > 0 && (
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{t.history.triggers_label}</span>
          {activeTriggers.map(t => (
            <span key={t} style={{
              padding: '2px 10px',
              borderRadius: '12px',
              background: 'var(--color-secondary-light)',
              color: 'var(--color-secondary)',
              fontSize: '0.78rem',
              fontWeight: 600,
              textTransform: 'capitalize',
            }}>
              {t}
            </span>
          ))}
        </div>
      )}

      {/* Note */}
      {entry.note && (
        <div style={{
          marginTop: '8px',
          padding: '8px 12px',
          background: 'var(--color-surface-2)',
          borderRadius: '8px',
          fontSize: '0.85rem',
          color: 'var(--color-text-muted)',
          fontStyle: 'italic',
        }}>
          "{entry.note}"
        </div>
      )}
    </Card>
  )
}
