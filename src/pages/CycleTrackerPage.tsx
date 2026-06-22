import { useState, useEffect } from 'react'
import { format, subMonths, addMonths, startOfMonth, endOfMonth,
         eachDayOfInterval, getDay, isSameMonth, isToday, parseISO } from 'date-fns'
import { getLogs, saveLog } from '../lib/storage'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import type { CycleDay, CycleSymptom, LogEntry } from '../types'
import { FLOW_COLORS } from '../types'

function todayId() { return format(new Date(), 'yyyy-MM-dd') }

export default function CycleTrackerPage() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const tc = t.cycle
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
    if (!user) return
    getLogs(user.uid).then(setLogs)
  }, [user])

  useEffect(() => {
    const entry = logs[selectedDate]
    if (entry?.cycle) {
      setCycleDay(entry.cycle)
    } else {
      setCycleDay({ date: selectedDate, isMenstruating: false, flow: 0, symptoms: [], notes: '' })
    }
  }, [selectedDate, logs])

  const handleSave = async () => {
    if (!user) return
    const existing = logs[selectedDate] ?? {
      id: selectedDate,
      pain: 0, fatigue: 0, mood: 3, sleep: 7,
      triggers: { gluten: false, dairy: false, sugar: false, caffeine: false,
                  alcohol: false, stress: false, poor_sleep: false,
                  overexertion: false, pressure_change: false,
                  temperature_change: false, sun_exposure: false },
      activity: 'medium' as const,
      medications: [],
      note: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    const updated = { ...existing, cycle: cycleDay, updatedAt: new Date() }
    await saveLog(user.uid, selectedDate, updated)
    setLogs(prev => ({ ...prev, [selectedDate]: updated }))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  // Calendar
  const monthStart = startOfMonth(currentMonth)
  const monthEnd   = endOfMonth(currentMonth)
  const days       = eachDayOfInterval({ start: monthStart, end: monthEnd })
  const startPad   = getDay(monthStart)

  const FLOW_LABELS_LOCAL: Record<number, string> = {
    1: tc.flow_light,
    2: tc.flow_medium,
    3: tc.flow_heavy,
  }

  const SYMPTOM_LABELS_LOCAL: Record<CycleSymptom, string> = {
    cramps:            tc.symptom_cramps,
    bloating:          tc.symptom_bloating,
    headache:          tc.symptom_headache,
    mood_swings:       tc.symptom_mood_swings,
    breast_tenderness: tc.symptom_breast_tenderness,
    spotting:          tc.symptom_spotting,
    clots:             tc.symptom_clots,
  }

  return (
    <div style={{ padding: '20px 16px 100px', maxWidth: '480px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '16px' }}>
        {tc.title}
      </h1>

      {/* Month navigation */}
      <div style={{
        background: 'var(--color-surface)', borderRadius: '16px',
        padding: '16px', marginBottom: '16px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <button onClick={() => setCurrentMonth(m => subMonths(m, 1))}
            style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--color-text)' }}>‹</button>
          <span style={{ fontWeight: 700, color: 'var(--color-text)' }}>
            {format(currentMonth, 'MMMM yyyy')}
          </span>
          <button onClick={() => setCurrentMonth(m => addMonths(m, 1))}
            style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--color-text)' }}>›</button>
        </div>

        {/* Weekday headers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', marginBottom: '4px' }}>
          {tc.weekdays.map((d: string) => (
            <div key={d} style={{ textAlign: 'center', fontSize: '0.72rem', fontWeight: 600, color: 'var(--color-text-muted)', padding: '4px 0' }}>{d}</div>
          ))}
        </div>

        {/* Days grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
          {Array.from({ length: startPad }).map((_, i) => <div key={`pad-${i}`} />)}
          {days.map(day => {
            const id      = format(day, 'yyyy-MM-dd')
            const cycle   = logs[id]?.cycle
            const inMonth = isSameMonth(day, currentMonth)
            const today   = isToday(day)
            const sel     = id === selectedDate
            const flowColor = cycle?.isMenstruating && cycle.flow > 0
              ? FLOW_COLORS[cycle.flow as keyof typeof FLOW_COLORS]
              : null

            return (
              <button key={id} onClick={() => setSelectedDate(id)} style={{
                aspectRatio: '1',
                borderRadius: '50%',
                border: sel ? '2px solid var(--color-primary)' : '2px solid transparent',
                background: today ? 'var(--color-primary-light)' : 'none',
                cursor: 'pointer',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                padding: '2px',
                opacity: inMonth ? 1 : 0.3,
              }}>
                <span style={{ fontSize: '0.82rem', fontWeight: today ? 700 : 400, color: 'var(--color-text)' }}>
                  {format(day, 'd')}
                </span>
                {flowColor && (
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: flowColor, marginTop: '1px' }} />
                )}
              </button>
            )
          })}
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '10px', justifyContent: 'center' }}>
          {([1, 2, 3] as const).map(f => (
            <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: FLOW_COLORS[f], display: 'inline-block' }} />
              <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>{FLOW_LABELS_LOCAL[f]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Daily input */}
      <div style={{
        background: 'var(--color-surface)', borderRadius: '16px',
        padding: '16px', marginBottom: '16px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '14px' }}>
          {selectedDate === todayId() ? tc.today : format(parseISO(selectedDate), 'MMM d, yyyy')}
        </h2>

        {/* Period toggle */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <span style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--color-text)' }}>{tc.period_today}</span>
          <button
            onClick={() => setCycleDay(prev => ({
              ...prev,
              isMenstruating: !prev.isMenstruating,
              flow: !prev.isMenstruating ? 2 : 0,
            }))}
            style={{
              padding: '6px 18px', borderRadius: '20px', border: 'none', cursor: 'pointer',
              fontWeight: 700, fontSize: '0.85rem',
              background: cycleDay.isMenstruating ? '#e11d48' : 'var(--color-surface-2)',
              color: cycleDay.isMenstruating ? '#fff' : 'var(--color-text-muted)',
            }}
          >
            {cycleDay.isMenstruating ? tc.yes : tc.no}
          </button>
        </div>

        {/* Flow selector */}
        {cycleDay.isMenstruating && (
          <div style={{ marginBottom: '16px' }}>
            <p style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '8px', letterSpacing: '0.05em' }}>
              {tc.flow_label.toUpperCase()}
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              {([1, 2, 3] as const).map(f => (
                <button key={f} onClick={() => setCycleDay(prev => ({ ...prev, flow: f }))}
                  style={{
                    flex: 1, padding: '8px', borderRadius: '10px', cursor: 'pointer',
                    border: cycleDay.flow === f ? `2px solid ${FLOW_COLORS[f]}` : '2px solid var(--color-border)',
                    background: cycleDay.flow === f ? `${FLOW_COLORS[f]}22` : 'none',
                    fontSize: '0.82rem', fontWeight: 600,
                    color: cycleDay.flow === f ? FLOW_COLORS[f] : 'var(--color-text-muted)',
                  }}>
                  {FLOW_LABELS_LOCAL[f]}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Symptoms */}
        <div style={{ marginBottom: '16px' }}>
          <p style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '8px', letterSpacing: '0.05em' }}>
            {tc.symptoms_label.toUpperCase()}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {(Object.keys(SYMPTOM_LABELS_LOCAL) as CycleSymptom[]).map(s => {
              const active = cycleDay.symptoms.includes(s)
              return (
                <button key={s} onClick={() => setCycleDay(prev => ({
                  ...prev,
                  symptoms: active ? prev.symptoms.filter(x => x !== s) : [...prev.symptoms, s],
                }))} style={{
                  padding: '6px 14px', borderRadius: '20px', cursor: 'pointer',
                  border: active ? '1.5px solid var(--color-primary)' : '1.5px solid var(--color-border)',
                  background: active ? 'var(--color-primary-light)' : 'none',
                  color: active ? 'var(--color-primary)' : 'var(--color-text)',
                  fontSize: '0.82rem', fontWeight: active ? 600 : 400,
                }}>
                  {SYMPTOM_LABELS_LOCAL[s]}
                </button>
              )
            })}
          </div>
        </div>

        {/* Notes */}
        <div style={{ marginBottom: '16px' }}>
          <p style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '8px', letterSpacing: '0.05em' }}>
            {tc.notes_label.toUpperCase()}
          </p>
          <textarea
            value={cycleDay.notes}
            onChange={e => setCycleDay(prev => ({ ...prev, notes: e.target.value }))}
            placeholder={tc.notes_placeholder}
            rows={3}
            style={{
              width: '100%', padding: '10px 12px', borderRadius: '10px',
              border: '1.5px solid var(--color-border)', background: 'var(--color-surface-2)',
              color: 'var(--color-text)', fontSize: '0.9rem', resize: 'none',
              fontFamily: 'inherit', boxSizing: 'border-box',
            }}
          />
        </div>

        <button onClick={handleSave} style={{
          width: '100%', padding: '14px', borderRadius: '12px', border: 'none',
          background: saved ? '#22c55e' : 'linear-gradient(135deg, #e11d48, #f43f5e)',
          color: '#fff', fontWeight: 700, fontSize: '1rem', cursor: 'pointer',
          transition: 'background 0.3s',
        }}>
          {saved ? tc.saved : tc.save_btn}
        </button>
      </div>

      <p style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', textAlign: 'center', lineHeight: 1.5 }}>
        {tc.disclaimer}
      </p>
    </div>
  )
}
