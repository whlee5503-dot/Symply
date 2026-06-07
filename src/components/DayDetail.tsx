import { format, parseISO } from 'date-fns'
import type { LogEntry } from '../types'
import { MOOD_EMOJIS } from '../types'
import Card from './ui/Card'

interface Props {
  dateId: string
  entry: LogEntry | null
}

export default function DayDetail({ dateId, entry }: Props) {
  const date = parseISO(dateId)

  if (!entry) {
    return (
      <Card style={{ textAlign: 'center', padding: '24px' }}>
        <p style={{ fontSize: '1.5rem', marginBottom: '8px' }}>📭</p>
        <p style={{ fontWeight: 600, color: 'var(--color-text)' }}>
          {format(date, 'MMMM d, yyyy')}
        </p>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>
          No check-in recorded for this day.
        </p>
      </Card>
    )
  }

  const activeTriggers = Object.entries(entry.triggers)
    .filter(([, v]) => v)
    .map(([k]) => k.replace('_', ' '))

  return (
    <Card>
      {/* Date header */}
      <p style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-text)', marginBottom: '12px' }}>
        {format(date, 'EEEE, MMMM d')}
      </p>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '12px' }}>
        {[
          { label: 'Pain',    value: entry.pain,    emoji: '🩹' },
          { label: 'Fatigue', value: entry.fatigue,  emoji: '😴' },
          { label: 'Sleep',   value: `${entry.sleep}h`, emoji: '🌙' },
          { label: 'Mood',    value: MOOD_EMOJIS[entry.mood].emoji, emoji: '' },
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
        <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Activity:</span>
        <span style={{
          padding: '2px 10px',
          borderRadius: '12px',
          background: 'var(--color-primary-light)',
          color: 'var(--color-primary)',
          fontSize: '0.8rem',
          fontWeight: 600,
          textTransform: 'capitalize',
        }}>
          {entry.activity}
        </span>
      </div>

      {/* Triggers */}
      {activeTriggers.length > 0 && (
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Triggers:</span>
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
