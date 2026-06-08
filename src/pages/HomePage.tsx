import { useState, useEffect } from 'react'
import Card from '../components/ui/Card'
import AnchorSlider from '../components/ui/AnchorSlider'
import { PAIN_ANCHORS, FATIGUE_ANCHORS, MOOD_EMOJIS } from '../types'
import type { LogEntry, TriggerMap } from '../types'
import { saveLog, getLog, todayId } from '../lib/storage'
import { useAuth } from '../contexts/AuthContext'

const TRIGGERS: { key: keyof TriggerMap; label: string; emoji: string }[] = [
  { key: 'gluten',       label: 'Gluten',     emoji: '🌾' },
  { key: 'dairy',        label: 'Dairy',      emoji: '🥛' },
  { key: 'sugar',        label: 'Sugar',      emoji: '🍬' },
  { key: 'caffeine',     label: 'Caffeine',   emoji: '☕' },
  { key: 'alcohol',      label: 'Alcohol',    emoji: '��' },
  { key: 'stress',       label: 'Stress',     emoji: '😤' },
  { key: 'poor_sleep',   label: 'Poor sleep', emoji: '😴' },
  { key: 'overexertion', label: 'Overdid it', emoji: '🏃' },
]

function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

export default function HomePage() {
  const today     = todayId()
  const { user }  = useAuth()

  const [pain,         setPain]         = useState(0)
  const [fatigue,      setFatigue]      = useState(0)
  const [mood,         setMood]         = useState<1|2|3|4|5>(3)
  const [sleep,        setSleep]        = useState(7)
  const [activity,     setActivity]     = useState<'low'|'medium'|'high'>('medium')
  const [triggers,     setTriggers]     = useState<TriggerMap>({
    gluten: false, dairy: false, sugar: false, caffeine: false,
    alcohol: false, stress: false, poor_sleep: false, overexertion: false,
  })
  const [note,         setNote]         = useState('')
  const [saved,        setSaved]        = useState(false)
  const [alreadyLogged, setAlreadyLogged] = useState(false)

  useEffect(() => {
    getLog(today, user?.uid).then(existing => {
      if (existing) {
        setPain(existing.pain)
        setFatigue(existing.fatigue)
        setMood(existing.mood)
        setSleep(existing.sleep)
        setActivity(existing.activity)
        setTriggers(existing.triggers)
        setNote(existing.note)
        setAlreadyLogged(true)
      }
    })
  }, [today, user?.uid])

  function toggleTrigger(key: keyof TriggerMap) {
    setTriggers(prev => ({ ...prev, [key]: !prev[key] }))
  }

  function handleSave() {
    const entry: LogEntry = {
      id: today, userId: user?.uid ?? 'local-user',
      pain, fatigue, mood, sleep, triggers, activity,
      medications: [], note,
      createdAt: new Date(), updatedAt: new Date(),
    }
    saveLog(entry, user?.uid)
    setSaved(true)
    setAlreadyLogged(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div style={{ padding: '20px 16px 16px', maxWidth: '480px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-text)' }}>
          {getGreeting()} 💜
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginTop: '2px' }}>
          {alreadyLogged ? "You've logged today — update anytime." : "How are you feeling today?"}
        </p>
      </div>

      <Card style={{ marginBottom: '12px' }}>
        <AnchorSlider label="Pain" value={pain} onChange={setPain} anchors={PAIN_ANCHORS} />
      </Card>
      <Card style={{ marginBottom: '12px' }}>
        <AnchorSlider label="Fatigue" value={fatigue} onChange={setFatigue} anchors={FATIGUE_ANCHORS} />
      </Card>

      <Card style={{ marginBottom: '12px' }}>
        <p style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--color-text)', marginBottom: '10px' }}>Mood</p>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          {([1,2,3,4,5] as const).map((m) => (
            <button key={m} onClick={() => setMood(m)} style={{
              flex: 1, cursor: 'pointer', padding: '8px 4px',
              border: mood === m ? '2px solid var(--color-primary)' : '2px solid transparent',
              borderRadius: '12px',
              background: mood === m ? 'var(--color-primary-light)' : 'none',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
            }}>
              <span style={{ fontSize: '1.6rem' }}>{MOOD_EMOJIS[m].emoji}</span>
              <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>{MOOD_EMOJIS[m].label}</span>
            </button>
          ))}
        </div>
      </Card>

      <Card style={{ marginBottom: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--color-text)' }}>Sleep</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button onClick={() => setSleep(s => Math.max(0, s - 0.5))} style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1px solid var(--color-border)', background: 'var(--color-surface-2)', cursor: 'pointer', fontSize: '1rem', color: 'var(--color-text)' }}>−</button>
            <span style={{ fontWeight: 700, fontSize: '1.1rem', minWidth: '48px', textAlign: 'center', color: 'var(--color-text)' }}>{sleep}h</span>
            <button onClick={() => setSleep(s => Math.min(24, s + 0.5))} style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1px solid var(--color-border)', background: 'var(--color-surface-2)', cursor: 'pointer', fontSize: '1rem', color: 'var(--color-text)' }}>+</button>
          </div>
        </div>
      </Card>

      <Card style={{ marginBottom: '12px' }}>
        <p style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--color-text)', marginBottom: '10px' }}>Activity</p>
        <div style={{ display: 'flex', gap: '8px' }}>
          {(['low', 'medium', 'high'] as const).map((a) => (
            <button key={a} onClick={() => setActivity(a)} style={{
              flex: 1, padding: '8px', borderRadius: '10px', cursor: 'pointer',
              border: activity === a ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
              background: activity === a ? 'var(--color-primary-light)' : 'var(--color-surface-2)',
              fontWeight: activity === a ? 600 : 400, fontSize: '0.85rem',
              color: activity === a ? 'var(--color-primary)' : 'var(--color-text-muted)',
            }}>
              {a === 'low' ? '🐢 Low' : a === 'medium' ? '🚶 Medium' : '🏃 High'}
            </button>
          ))}
        </div>
      </Card>

      <Card style={{ marginBottom: '12px' }}>
        <p style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--color-text)', marginBottom: '10px' }}>Triggers</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {TRIGGERS.map(({ key, label, emoji }) => (
            <button key={key} onClick={() => toggleTrigger(key)} style={{
              padding: '6px 12px', borderRadius: '20px', cursor: 'pointer',
              border: triggers[key] ? '2px solid var(--color-secondary)' : '1px solid var(--color-border)',
              background: triggers[key] ? 'var(--color-secondary-light)' : 'var(--color-surface-2)',
              fontSize: '0.82rem', fontWeight: triggers[key] ? 600 : 400,
              color: triggers[key] ? 'var(--color-secondary)' : 'var(--color-text-muted)',
            }}>
              {emoji} {label}
            </button>
          ))}
        </div>
      </Card>

      <Card style={{ marginBottom: '20px' }}>
        <p style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--color-text)', marginBottom: '8px' }}>
          Note <span style={{ fontWeight: 400, color: 'var(--color-text-muted)' }}>(optional)</span>
        </p>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Anything else you'd like to remember..."
          rows={3}
          style={{
            width: '100%', padding: '10px', borderRadius: '10px',
            border: '1px solid var(--color-border)',
            background: 'var(--color-surface-2)', color: 'var(--color-text)',
            fontSize: '0.9rem', resize: 'none', outline: 'none', fontFamily: 'inherit',
          }}
        />
      </Card>

      <button onClick={handleSave} style={{
        width: '100%', padding: '16px', borderRadius: '14px', border: 'none',
        background: saved ? 'var(--color-success)' : 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
        color: '#fff', fontWeight: 700, fontSize: '1rem', cursor: 'pointer',
        transition: 'all 0.2s ease',
      }}>
        {saved ? '✓ Saved!' : alreadyLogged ? "Update Today's Log" : "Save Today's Check-in"}
      </button>
    </div>
  )
}

