import { useState } from 'react'
import { format, subMonths, addMonths } from 'date-fns'
import { ko, es } from 'date-fns/locale'
import { todayId } from '../lib/storage'
import { useFirestoreLogs } from '../hooks/useFirestoreLogs'
import { useAuth } from '../contexts/AuthContext'
import CalendarHeatmap from '../components/CalendarHeatmap'
import DayDetail from '../components/DayDetail'
import Card from '../components/ui/Card'
import { useLanguage } from '../contexts/LanguageContext'

export default function HistoryPage() {
  const { user } = useAuth()
  const { t, language } = useLanguage()
  const locale = language === "ko" ? ko : language === "es" ? es : undefined
  const { logs, loading } = useFirestoreLogs(user?.uid)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string>(todayId())

  const totalDays = Object.keys(logs).length
  const avgPain = totalDays > 0
    ? (Object.values(logs).reduce((s, e) => s + e.pain, 0) / totalDays).toFixed(1)
    : '—'
  const avgFatigue = totalDays > 0
    ? (Object.values(logs).reduce((s, e) => s + e.fatigue, 0) / totalDays).toFixed(1)
    : '—'

  if (loading) {
    return (
      <div style={{ padding: '20px 16px', maxWidth: '480px', margin: '0 auto', textAlign: 'center' }}>
        <p style={{ color: 'var(--color-text-muted)', marginTop: '40px' }}>Loading your history…</p>
      </div>
    )
  }

  return (
    <div style={{ padding: '20px 16px 16px', maxWidth: '480px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '4px' }}>
        {t.history.title}
      </h1>
      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '16px' }}>
        {t.history.days_logged_count.replace('{n}', String(totalDays))}
      </p>

      {/* Summary stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '16px' }}>
        {[
          { label: t.history.days_logged, value: totalDays, emoji: '📅' },
          { label: t.history.avg_pain, value: avgPain, emoji: '🩹' },
          { label: t.history.avg_fatigue, value: avgFatigue, emoji: '😴' },
        ].map(({ label, value, emoji }) => (
          <Card key={label} padding="12px" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.2rem' }}>{emoji}</div>
            <div style={{ fontWeight: 700, fontSize: '1.2rem', color: 'var(--color-text)' }}>{value}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>{label}</div>
          </Card>
        ))}
      </div>

      {/* Calendar */}
      <Card style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <button
            onClick={() => setCurrentMonth(m => subMonths(m, 1))}
            style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.4rem', color: 'var(--color-text)', padding: '4px 8px' }}
          >
            ‹
          </button>
          <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-text)' }}>
            {language === 'ko'
              ? format(currentMonth, 'yyyy년 M월', { locale })
              : format(currentMonth, 'MMMM yyyy', { locale })}
          </span>
          <button
            onClick={() => setCurrentMonth(m => addMonths(m, 1))}
            style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.4rem', color: 'var(--color-text)', padding: '4px 8px' }}
          >
            ›
          </button>
        </div>
        <CalendarHeatmap
          logs={logs}
          month={currentMonth}
          onDayClick={setSelectedDate}
          selectedDate={selectedDate}
        />
      </Card>

      {/* Selected day detail */}
      <DayDetail
        dateId={selectedDate}
        entry={logs[selectedDate] ?? null}
      />
      {totalDays >= 7 && (
        <div
          style={{
            marginTop: '8px', padding: '12px 16px', borderRadius: '12px',
            background: 'var(--color-primary-light)',
            border: '1px solid var(--color-primary)',
            fontSize: '0.85rem', color: 'var(--color-primary)',
            fontWeight: 600, textAlign: 'center',
          }}
        >
          {t.history.next_insight}
        </div>
      )}
    </div>
  )
}
