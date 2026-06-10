import { useMemo } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay } from 'date-fns'
import { useLanguage } from '../contexts/LanguageContext'
import type { LogEntry } from '../types'

interface Props {
  logs: Record<string, LogEntry>
  month: Date
  onDayClick: (dateId: string) => void
  selectedDate?: string
}

function getDayColor(entry: LogEntry | undefined): string {
  if (!entry) return 'var(--color-surface-2)'
  const avg = (entry.pain + entry.fatigue) / 2
  if (avg <= 2) return '#22c55e'
  if (avg <= 4) return '#86efac'
  if (avg <= 6) return '#f59e0b'
  if (avg <= 8) return '#ef4444'
  return '#991b1b'
}

function getDayLabel(entry: LogEntry | undefined): string {
  if (!entry) return 'No data'
  const avg = (entry.pain + entry.fatigue) / 2
  if (avg <= 2) return 'Good day'
  if (avg <= 4) return 'Okay day'
  if (avg <= 6) return 'Rough day'
  return 'Bad day'
}

// WEEKDAYS는 컴포넌트 내부에서 t로 처리

export default function CalendarHeatmap({ logs, month, onDayClick, selectedDate }: Props) {
  const { t } = useLanguage()
  const WEEKDAYS = t.history.weekdays

  const days = useMemo(() => {
    const start = startOfMonth(month)
    const end = endOfMonth(month)
    return eachDayOfInterval({ start, end })
  }, [month])

  const firstDayOfWeek = getDay(startOfMonth(month))

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '4px' }}>
        {WEEKDAYS.map(d => (
          <div key={d} style={{ textAlign: 'center', fontSize: '0.7rem', color: 'var(--color-text-muted)', fontWeight: 600, padding: '2px 0' }}>
            {d}
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {days.map(day => {
          const dateId = format(day, 'yyyy-MM-dd')
          const entry = logs[dateId]
          const isToday = dateId === format(new Date(), 'yyyy-MM-dd')
          const isSelected = dateId === selectedDate
          const color = getDayColor(entry)
          return (
            <button
              key={dateId}
              onClick={() => onDayClick(dateId)}
              title={`${format(day, 'MMM d')} - ${getDayLabel(entry)}`}
              style={{
                aspectRatio: '1',
                borderRadius: '8px',
                border: isSelected ? '2px solid var(--color-primary)' : isToday ? '2px solid var(--color-text-muted)' : '2px solid transparent',
                background: color,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.72rem',
                fontWeight: isToday ? 700 : 400,
                color: entry ? '#fff' : 'var(--color-text-muted)',
                opacity: entry ? 1 : 0.5,
              }}
            >
              {format(day, 'd')}
            </button>
          )
        })}
      </div>
      <div style={{ display: 'flex', gap: '12px', marginTop: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
        {[
          { color: '#22c55e', label: t.history.cal_good },
          { color: '#86efac', label: t.history.cal_okay },
          { color: '#f59e0b', label: t.history.cal_rough },
          { color: '#ef4444', label: t.history.cal_bad },
          { color: 'var(--color-surface-2)', label: t.history.cal_nodata },
        ].map(({ color, label }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: color, border: '1px solid var(--color-border)' }} />
            <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
