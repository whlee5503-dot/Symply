import { useState, useEffect } from 'react'
import { format, subMonths, addMonths, startOfMonth, endOfMonth,
         eachDayOfInterval, getDay, isSameMonth, isToday, parseISO } from 'date-fns'
import { getLogs, saveLog } from '../lib/storage'
import { useAuth } from '../contexts/AuthContext'
import type { CycleDay, CycleSymptom, LogEntry } from '../types'
import { CYCLE_SYMPTOM_LABELS, FLOW_LABELS, FLOW_COLORS } from '../types'

function todayId() { return format(new Date(), 'yyyy-MM-dd') }

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function CycleTrackerPage() {
  const { user } = useAuth()
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(todayId())
  const [logs, setLogs] = useState<Record<string, LogEntry>>({})
  const [cycleDay, setCycleDay] = useState<CycleDay>({
    date: todayId(),
    isMenstruating: false,
    flow: 0,
    symptoms: [],
    notes: '',
  })
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setLogs(getLogs())
  }, [])

  useEffect(() => {
    const existing = logs[selectedDate]
    if (existing?.cycle) {
      setCycleDay(existing.cycle)
    } else {
      setCycleDay({ date: selectedDate, isMenstruating: false, flow: 0, symptoms: [], notes: '' })
    }
  }, [selectedDate, logs])

  const handleSave = async () => {
    const existing = logs[selectedDate]
    const entry: LogEntry = existing ? {
      ...existing,
      cycle: cycleDay,
      updatedAt: new Date(),
    } : {
      id: selectedDate,
      userId: user?.uid ?? 'local-user',
      pain: 0, fatigue: 0, mood: 3, sleep: 7,
      triggers: { gluten: false, dairy: false, sugar: false, caffeine: false,
                  alcohol: false, stress: false, poor_sleep: false, overexertion: false,
                  pressure_change: false, temperature_change: false, sun_exposure: false },
      activity: 'medium', medications: [], note: '',
      cycle: cycleDay,
      createdAt: new Date(), updatedAt: new Date(),
    }
    await saveLog(entry, user?.uid)
    setLogs(getLogs())
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const toggleSymptom = (s: CycleSymptom) => {
    setCycleDay(prev => ({
      ...prev,
      symptoms: prev.symptoms.includes(s)
        ? prev.symptoms.filter(x => x !== s)
        : [...prev.symptoms, s],
    }))
  }

  // Calendar
  const monthStart = startOfMonth(currentMonth)
  const monthEnd   = endOfMonth(currentMonth)
  const days       = eachDayOfInterval({ start: monthStart, end: monthEnd })
  const startPad   = getDay(monthStart)

  const getDotColor = (dateStr: string) => {
    const log = logs[dateStr]
    if (!log?.cycle) return null
    const flow = log.cycle.flow as 0|1|2|3
    return flow > 0 ? FLOW_COLORS[flow] : (log.cycle.isMenstruating ? '#f87171' : null)
  }

  return (
    <div style={{ padding: '20px 16px 16px', maxWidth: 480, margin: '0 auto', color: 'var(--color-text)' }}>

      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Cycle Tracker 🌸</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginTop: '2px' }}>
          Track your cycle alongside symptoms
        </p>
      </div>

      {/* Calendar */}
      <div style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: '16px', padding: '16px', marginBottom: '16px',
      }}>
        {/* Month nav */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <button onClick={() => setCurrentMonth(m => subMonths(m, 1))}
            style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.2rem', color: 'var(--color-text)' }}>
            ‹
          </button>
          <span style={{ fontWeight: 700, fontSize: '1rem' }}>
            {format(currentMonth, 'MMMM yyyy')}
          </span>
          <button onClick={() => setCurrentMonth(m => addMonths(m, 1))}
            style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.2rem', color: 'var(--color-text)' }}>
            ›
          </button>
        </div>

        {/* Weekday headers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: '4px' }}>
          {WEEKDAYS.map(d => (
            <div key={d} style={{ textAlign: 'center', fontSize: '0.7rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
              {d}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
          {Array.from({ length: startPad }).map((_, i) => <div key={`pad-${i}`} />)}
          {days.map(day => {
            const dateStr  = format(day, 'yyyy-MM-dd')
            const dotColor = getDotColor(dateStr)
            const selected = selectedDate === dateStr
            const today    = isToday(day)
            const inMonth  = isSameMonth(day, currentMonth)
            return (
              <button
                key={dateStr}
                onClick={() => setSelectedDate(dateStr)}
                style={{
                  position: 'relative',
                  aspectRatio: '1',
                  border: selected ? '2px solid var(--color-primary)' : '2px solid transparent',
                  borderRadius: '8px',
                  background: selected ? 'var(--color-primary-light)' : 'none',
                  cursor: 'pointer',
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', gap: '2px',
                  opacity: inMonth ? 1 : 0.3,
                }}
              >
                <span style={{
                  fontSize: '0.8rem',
                  fontWeight: today ? 700 : 400,
                  color: today ? 'var(--color-primary)' : 'var(--color-text)',
                }}>
                  {format(day, 'd')}
                </span>
                {dotColor && (
                  <div style={{
                    width: '6px', height: '6px', borderRadius: '50%',
                    backgroundColor: dotColor,
                  }} />
                )}
              </button>
            )
          })}
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '12px', flexWrap: 'wrap' }}>
          {([1,2,3] as const).map(f => (
            <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: FLOW_COLORS[f] }} />
              <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>{FLOW_LABELS[f]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Selected day editor */}
      <div style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: '16px', padding: '16px', marginBottom: '16px',
      }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '14px' }}>
          {selectedDate === todayId() ? 'Today' : format(parseISO(selectedDate), 'MMM d, yyyy')}
        </h2>

        {/* Menstruating toggle */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>Period today?</span>
          <button
            onClick={() => setCycleDay(prev => ({ ...prev, isMenstruating: !prev.isMenstruating, flow: prev.isMenstruating ? 0 : 2 }))}
            style={{
              padding: '6px 20px', borderRadius: '20px', border: 'none', cursor: 'pointer',
              backgroundColor: cycleDay.isMenstruating ? '#dc2626' : 'var(--color-surface-2)',
              color: cycleDay.isMenstruating ? '#fff' : 'var(--color-text-muted)',
              fontWeight: 600, fontSize: '0.9rem',
            }}
          >
            {cycleDay.isMenstruating ? 'Yes' : 'No'}
          </button>
        </div>

        {/* Flow intensity */}
        {cycleDay.isMenstruating && (
          <div style={{ marginBottom: '14px' }}>
            <p style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px', color: 'var(--color-text-muted)' }}>
              FLOW INTENSITY
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              {([1,2,3] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setCycleDay(prev => ({ ...prev, flow: f }))}
                  style={{
                    flex: 1, padding: '8px', borderRadius: '10px', cursor: 'pointer',
                    border: `2px solid ${cycleDay.flow === f ? FLOW_COLORS[f] : 'var(--color-border)'}`,
                    backgroundColor: cycleDay.flow === f ? `${FLOW_COLORS[f]}22` : 'transparent',
                    color: cycleDay.flow === f ? FLOW_COLORS[f] : 'var(--color-text-muted)',
                    fontWeight: cycleDay.flow === f ? 700 : 400, fontSize: '0.85rem',
                  }}
                >
                  {FLOW_LABELS[f]}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Symptoms */}
        <div style={{ marginBottom: '14px' }}>
          <p style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px', color: 'var(--color-text-muted)' }}>
            SYMPTOMS
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {(Object.keys(CYCLE_SYMPTOM_LABELS) as CycleSymptom[]).map(s => {
              const sel = cycleDay.symptoms.includes(s)
              return (
                <button
                  key={s}
                  onClick={() => toggleSymptom(s)}
                  style={{
                    padding: '6px 12px', borderRadius: '20px', cursor: 'pointer',
                    border: `1.5px solid ${sel ? '#f43f5e' : 'var(--color-border)'}`,
                    backgroundColor: sel ? '#fce7f3' : 'transparent',
                    color: sel ? '#be185d' : 'var(--color-text-muted)',
                    fontSize: '0.82rem', fontWeight: sel ? 700 : 400,
                  }}
                >
                  {CYCLE_SYMPTOM_LABELS[s]}
                </button>
              )
            })}
          </div>
        </div>

        {/* Notes */}
        <div style={{ marginBottom: '16px' }}>
          <p style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: 'var(--color-text-muted)' }}>
            NOTES
          </p>
          <textarea
            value={cycleDay.notes}
            onChange={e => setCycleDay(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="Any notes about today..."
            rows={2}
            style={{
              width: '100%', padding: '8px 12px', borderRadius: '10px',
              border: '1px solid var(--color-border)',
              background: 'var(--color-surface-2)', color: 'var(--color-text)',
              fontSize: '0.9rem', resize: 'none', outline: 'none', fontFamily: 'inherit',
            }}
          />
        </div>

        <button onClick={handleSave} style={{
          width: '100%', padding: '12px', borderRadius: '12px', border: 'none',
          backgroundColor: saved ? 'var(--color-success)' : '#f43f5e',
          color: '#fff', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer',
        }}>
          {saved ? '✓ Saved!' : 'Save Cycle Data'}
        </button>
      </div>

      {/* Disclaimer */}
      <p style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', textAlign: 'center', lineHeight: 1.5 }}>
        Cycle data is stored securely and never shared.
        Not a medical device — consult your healthcare provider.
      </p>
    </div>
  )
}

