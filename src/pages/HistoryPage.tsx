import { useState } from 'react'
import { format, subMonths, addMonths } from 'date-fns'
import { todayId } from '../lib/storage'
import { useFirestoreLogs } from '../hooks/useFirestoreLogs'
import { useAuth } from '../contexts/AuthContext'
import CalendarHeatmap from '../components/CalendarHeatmap'
import DayDetail from '../components/DayDetail'
import Card from '../components/ui/Card'

export default function HistoryPage() {
  const { user } = useAuth()
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
        History
      </h1>
      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '16px' }}>
        {totalDays} days logged
      </p>

      {/* Summary stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '16px' }}>
        {[
          { label: 'Days logged', value: totalDays, emoji: '📅' },
          { label: 'Avg pain',    value: avgPain,   emoji: '🩹' },
          { label: 'Avg fatigue', value: avgFatigue, emoji: '😴' },
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
            {format(currentMonth, 'MMMM yyyy')}
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
    </div>
  )
}
