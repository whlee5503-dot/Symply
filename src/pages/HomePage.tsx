import { useState, useEffect } from 'react'
import Card from '../components/ui/Card'
import AnchorSlider from '../components/ui/AnchorSlider'
import { PAIN_ANCHORS, FATIGUE_ANCHORS, PAIN_ANCHORS_KO, FATIGUE_ANCHORS_KO, PAIN_ANCHORS_ES, FATIGUE_ANCHORS_ES, MOOD_EMOJIS } from '../types'
import type { LogEntry, TriggerMap, ChronicCondition, RelevanceDetail, EvidenceStrength } from '../types'
import { getTriggerPriority } from '../types'
import { trackEvent } from '../lib/trackEvent'
import { saveLog, getLog, todayId } from '../lib/storage'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import GuideLink from '../components/ui/GuideLink'

const TRIGGER_CATEGORIES = [
  {
    labelKey: 'triggers_food_label' as const,
    keys: [
      { key: 'gluten'        as keyof TriggerMap, tKey: 'trigger_gluten',        emoji: '🌾' },
      { key: 'dairy'         as keyof TriggerMap, tKey: 'trigger_dairy',         emoji: '🥛' },
      { key: 'sugar'         as keyof TriggerMap, tKey: 'trigger_sugar',         emoji: '🍬' },
      { key: 'caffeine'      as keyof TriggerMap, tKey: 'trigger_caffeine',      emoji: '☕' },
      { key: 'alcohol'       as keyof TriggerMap, tKey: 'trigger_alcohol',       emoji: '🍷' },
      { key: 'high_fodmap'   as keyof TriggerMap, tKey: 'trigger_high_fodmap',   emoji: '🧅' },
      { key: 'high_glycemic' as keyof TriggerMap, tKey: 'trigger_high_glycemic', emoji: '🍚' },
    ],
  },
  {
    labelKey: 'triggers_lifestyle_label' as const,
    keys: [
      { key: 'stress'       as keyof TriggerMap, tKey: 'trigger_stress',       emoji: '😤' },
      { key: 'poor_sleep'   as keyof TriggerMap, tKey: 'trigger_poor_sleep',   emoji: '😴' },
      { key: 'overexertion' as keyof TriggerMap, tKey: 'trigger_overexertion', emoji: '🏃' },
    ],
  },
  {
    labelKey: 'triggers_environment_label' as const,
    keys: [
      { key: 'pressure_change'    as keyof TriggerMap, tKey: 'trigger_pressure_change',    emoji: '🌪️' },
      { key: 'temperature_change' as keyof TriggerMap, tKey: 'trigger_temperature_change', emoji: '🌡️' },
      { key: 'sun_exposure'       as keyof TriggerMap, tKey: 'trigger_sun_exposure',       emoji: '☀️' },
    ],
  },
]

const PROFILE_KEY = 'symply-profile'

function getPrimaryCondition(): ChronicCondition | undefined {
  try {
    const raw = localStorage.getItem(PROFILE_KEY)
    if (!raw) return undefined
    const profile = JSON.parse(raw)
    return profile.primaryCondition || undefined
  } catch { return undefined }
}

// Reorders a category's trigger keys so items with stronger evidence for the
// user's primary condition appear first. Never removes items — all triggers
// stay visible and loggable regardless of condition.
function sortByRelevance<T extends { key: keyof TriggerMap }>(
  items: T[],
  priority: Partial<Record<keyof TriggerMap, RelevanceDetail>>,
): T[] {
  const rank: Record<EvidenceStrength, number> = { strong: 0, moderate: 1, weak: 2 }
  return [...items].sort((a, b) => {
    const ra = priority[a.key] ? rank[priority[a.key]!.strength] : 3
    const rb = priority[b.key] ? rank[priority[b.key]!.strength] : 3
    return ra - rb
  })
}

function getGreeting(t: ReturnType<typeof useLanguage>['t']): string {
  const h = new Date().getHours()
  if (h < 12) return t.home.greeting_morning
  if (h < 18) return t.home.greeting_afternoon
  return t.home.greeting_evening
}

export default function HomePage() {
  const today    = todayId()
  const { user } = useAuth()
  const { t, language } = useLanguage()

  const [pain,          setPain]          = useState(0)
  const [fatigue,       setFatigue]       = useState(0)
  const [mood,          setMood]          = useState<1|2|3|4|5>(3)
  const [sleep,         setSleep]         = useState(7)
  const [activity,      setActivity]      = useState<'low'|'medium'|'high'>('medium')
  const [triggers,      setTriggers]      = useState<TriggerMap>({
    gluten: false, dairy: false, sugar: false, caffeine: false,
    alcohol: false, high_fodmap: false, high_glycemic: false,
    stress: false, poor_sleep: false, overexertion: false,
    pressure_change: false, temperature_change: false, sun_exposure: false,
  })
  const [noTriggers,    setNoTriggers]    = useState(false)
  const [note,          setNote]          = useState('')
  const [saved,         setSaved]         = useState(false)
  const [alreadyLogged, setAlreadyLogged] = useState(false)
  const [primaryCondition, setPrimaryCondition] = useState<ChronicCondition | undefined>(getPrimaryCondition)

  useEffect(() => {
    function handleProfileUpdate() { setPrimaryCondition(getPrimaryCondition()) }
    window.addEventListener('symply-profile-updated', handleProfileUpdate)
    return () => window.removeEventListener('symply-profile-updated', handleProfileUpdate)
  }, [])

  const triggerPriority = getTriggerPriority(primaryCondition)

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
        // 저장된 트리거가 모두 false이면 noTriggers로 표시
        const anyTrigger = Object.values(existing.triggers).some(v => v)
        if (!anyTrigger) setNoTriggers(true)
      }
    })
  }, [today, user?.uid])

  function toggleTrigger(key: keyof TriggerMap) {
    setNoTriggers(false)
    setTriggers(prev => ({ ...prev, [key]: !prev[key] }))
  }

  function handleNoTriggers() {
    setNoTriggers(true)
    setTriggers({
      gluten: false, dairy: false, sugar: false, caffeine: false,
      alcohol: false, high_fodmap: false, high_glycemic: false,
      stress: false, poor_sleep: false, overexertion: false,
      pressure_change: false, temperature_change: false, sun_exposure: false,
    })
  }

  function handleSave() {
    const entry: LogEntry = {
      id: today, userId: user?.uid ?? 'local-user',
      pain, fatigue, mood, sleep, triggers, activity,
      medications: [], note,
      createdAt: new Date(), updatedAt: new Date(),
    }
    saveLog(entry, user?.uid)
    trackEvent('checkin_saved', { has_pain: pain > 0, has_fatigue: fatigue > 0, no_triggers: noTriggers })
    setSaved(true)
    setAlreadyLogged(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const anyTriggerSelected = Object.values(triggers).some(v => v)

  return (
    <div style={{ padding: '20px 16px 16px', maxWidth: '480px', margin: '0 auto' }}>
      <GuideLink />
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-text)' }}>
          {getGreeting(t)} 💜
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginTop: '2px' }}>
          {alreadyLogged ? t.home.already_logged : t.home.subtitle}
        </p>
        {alreadyLogged && (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            marginTop: '6px', padding: '4px 10px', borderRadius: '20px',
            background: '#dcfce7', border: '1px solid #22c55e',
            fontSize: '0.75rem', color: '#15803d', fontWeight: 600,
          }}>
            ✏️ {t.home.edit}
          </div>
        )}
      </div>

      <Card style={{ marginBottom: '12px' }}>
        <AnchorSlider label={t.home.pain} value={pain} onChange={setPain} anchors={PAIN_ANCHORS} anchorsKo={PAIN_ANCHORS_KO} anchorsEs={PAIN_ANCHORS_ES} />
      </Card>
      <Card style={{ marginBottom: '12px' }}>
        <AnchorSlider label={t.home.fatigue} value={fatigue} onChange={setFatigue} anchors={FATIGUE_ANCHORS} anchorsKo={FATIGUE_ANCHORS_KO} anchorsEs={FATIGUE_ANCHORS_ES} />
      </Card>

      <Card style={{ marginBottom: '12px' }}>
        <p style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--color-text)', marginBottom: '10px' }}>{t.home.mood}</p>
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
              <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>{(t.mood_labels as Record<number, string>)[m]}</span>
            </button>
          ))}
        </div>
      </Card>

      <Card style={{ marginBottom: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--color-text)' }}>{t.home.sleep}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button onClick={() => setSleep(s => Math.max(0, s - 0.5))} style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1px solid var(--color-border)', background: 'var(--color-surface-2)', cursor: 'pointer', fontSize: '1rem', color: 'var(--color-text)' }}>−</button>
            <span style={{ fontWeight: 700, fontSize: '1.1rem', minWidth: '48px', textAlign: 'center', color: 'var(--color-text)' }}>{sleep}{t.home.sleep_unit}</span>
            <button onClick={() => setSleep(s => Math.min(24, s + 0.5))} style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1px solid var(--color-border)', background: 'var(--color-surface-2)', cursor: 'pointer', fontSize: '1rem', color: 'var(--color-text)' }}>+</button>
          </div>
        </div>
      </Card>

      <Card style={{ marginBottom: '12px' }}>
        <p style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--color-text)', marginBottom: '10px' }}>{t.home.activity}</p>
        <div style={{ display: 'flex', gap: '8px' }}>
          {(['low', 'medium', 'high'] as const).map((a) => (
            <button key={a} onClick={() => setActivity(a)} style={{
              flex: 1, padding: '8px', borderRadius: '10px', cursor: 'pointer',
              border: activity === a ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
              background: activity === a ? 'var(--color-primary-light)' : 'var(--color-surface-2)',
              fontWeight: activity === a ? 600 : 400, fontSize: '0.85rem',
              color: activity === a ? 'var(--color-primary)' : 'var(--color-text-muted)',
            }}>
              {a === 'low' ? `🐢 ${t.home.activity_low}` : a === 'medium' ? `🚶 ${t.home.activity_medium}` : `🏃 ${t.home.activity_high}`}
            </button>
          ))}
        </div>
      </Card>

      <Card style={{ marginBottom: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <p style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--color-text)', margin: 0 }}>{t.home.triggers_section}</p>
        </div>
        {primaryCondition && (
          <p style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginBottom: '10px', lineHeight: 1.4 }}>
            {t.home.triggers_primary_hint}
          </p>
        )}
        {TRIGGER_CATEGORIES.map(({ labelKey, keys }) => (
          <div key={labelKey} style={{ marginBottom: '10px' }}>
            <p style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '6px', letterSpacing: '0.03em' }}>
              {t.home[labelKey as keyof typeof t.home] as string}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {sortByRelevance(keys, triggerPriority).map(({ key, tKey, emoji }) => {
                const strength = triggerPriority[key as keyof TriggerMap]?.strength
                return (
                  <button key={key} onClick={() => toggleTrigger(key as keyof TriggerMap)} style={{
                    padding: '6px 12px', borderRadius: '20px', cursor: 'pointer',
                    border: triggers[key as keyof TriggerMap] ? '2px solid var(--color-secondary)' : strength === 'strong' ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
                    background: triggers[key as keyof TriggerMap] ? 'var(--color-secondary-light)' : 'var(--color-surface-2)',
                    fontSize: '0.82rem', fontWeight: triggers[key as keyof TriggerMap] ? 600 : 400,
                    color: triggers[key as keyof TriggerMap] ? 'var(--color-secondary)' : 'var(--color-text-muted)',
                  }}>
                    {emoji} {t.home[tKey as keyof typeof t.home] as string}{strength === 'strong' ? ' ★' : ''}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
        {/* 트리거 없는 날 버튼 */}
        {!anyTriggerSelected && (
          <button
            onClick={handleNoTriggers}
            style={{
              width: '100%', padding: '8px', borderRadius: '10px', cursor: 'pointer',
              border: noTriggers ? '2px solid #22c55e' : '1px dashed var(--color-border)',
              background: noTriggers ? '#dcfce7' : 'transparent',
              fontSize: '0.82rem', fontWeight: noTriggers ? 600 : 400,
              color: noTriggers ? '#15803d' : 'var(--color-text-muted)',
            }}
          >
            {noTriggers ? t.home.no_triggers_active : t.home.no_triggers_btn}
          </button>
        )}
      </Card>

      <Card style={{ marginBottom: '20px' }}>
        <p style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--color-text)', marginBottom: '8px' }}>
          {t.home.notes} <span style={{ fontWeight: 400, color: 'var(--color-text-muted)' }}>(optional)</span>
        </p>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={t.home.notes_placeholder}
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
        {saved ? (language === 'ko' ? '✓ 저장됨! 기록 탭에서 히스토리를 확인해보세요 →' : '✓ Saved! Check History tab for your log →') : alreadyLogged ? t.home.save.replace('Check-in', 'Log') : t.home.save}
      </button>
    </div>
  )
}
