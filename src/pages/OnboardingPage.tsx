import { useState } from 'react'
import type { ChronicCondition } from '../types'
import { useLanguage } from '../contexts/LanguageContext'
import { trackEvent } from '../lib/trackEvent'

const ONBOARDING_KEY = 'symply-onboarded'
const PROFILE_KEY = 'symply-profile'

export function hasOnboarded(): boolean {
  return localStorage.getItem(ONBOARDING_KEY) === 'true'
}

function markOnboarded() {
  localStorage.setItem(ONBOARDING_KEY, 'true')
}

const CONDITIONS: { value: ChronicCondition; labelKey: string; emoji: string }[] = [
  { value: 'PCOS',                 labelKey: 'condition_PCOS',                emoji: '🔄' },
  { value: 'endometriosis',        labelKey: 'condition_endometriosis',        emoji: '🌸' },
  { value: 'fibromyalgia',         labelKey: 'condition_fibromyalgia',         emoji: '💜' },
  { value: 'lupus',                labelKey: 'condition_lupus',                emoji: '🦋' },
  { value: 'rheumatoid_arthritis', labelKey: 'condition_rheumatoid_arthritis', emoji: '🦴' },
  { value: 'crohns',               labelKey: 'condition_crohns',               emoji: '🫁' },
  { value: 'ibs',                  labelKey: 'condition_ibs',                  emoji: '⚡' },
  { value: 'chronic_fatigue',      labelKey: 'condition_chronic_fatigue',      emoji: '😴' },
  { value: 'other',                labelKey: 'condition_other',                emoji: '➕' },
]

type SlideId = 'welcome' | 'problem' | 'how' | 'conditions' | 'ready'
const SLIDE_IDS: SlideId[] = ['welcome', 'problem', 'how', 'conditions', 'ready']

function detectPlatform(): 'ios' | 'android' | 'other' {
  const ua = navigator.userAgent.toLowerCase()
  if (/iphone|ipad|ipod/.test(ua)) return 'ios'
  if (/android/.test(ua)) return 'android'
  return 'other'
}

function ProgressDots({ current, total }: { current: number; total: number }) {
  return (
    <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', marginBottom: '32px' }}>
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          style={{
            width: i === current ? '20px' : '7px',
            height: '7px',
            borderRadius: '4px',
            backgroundColor: i === current ? 'var(--color-primary)' : 'var(--color-border)',
            transition: 'all 0.25s',
          }}
        />
      ))}
    </div>
  )
}

function HowItWorks({ steps }: { steps: { icon: string; title: string; body: string }[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', margin: '8px 0' }}>
      {steps.map((s, i) => (
        <div
          key={i}
          style={{
            display: 'flex', gap: '14px', alignItems: 'flex-start',
            backgroundColor: 'var(--color-surface-2)',
            borderRadius: '14px', padding: '14px',
          }}
        >
          <span style={{ fontSize: '1.6rem', lineHeight: 1 }}>{s.icon}</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-text)', marginBottom: '3px' }}>
              {s.title}
            </div>
            <div style={{ fontSize: '0.83rem', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
              {s.body}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function OnboardingPage({ onComplete }: { onComplete: () => void }) {
  const { t } = useLanguage()
  const o = t.onboarding
  const platform = detectPlatform()

  const [step, setStep] = useState(0)
  const [conditions, setConditions] = useState<ChronicCondition[]>([])

  const slideId = SLIDE_IDS[step]
  const isLast = step === SLIDE_IDS.length - 1
  const isConditions = slideId === 'conditions'
  const isHow = slideId === 'how'
  const isReady = slideId === 'ready'

  // Slide content from translations
  const SLIDES: Record<SlideId, { icon: string | null; title: string; body: string | null }> = {
    welcome:    { icon: '💜', title: o.slide_welcome_title,    body: o.slide_welcome_body },
    problem:    { icon: '😔', title: o.slide_problem_title,    body: o.slide_problem_body },
    how:        { icon: '✨', title: o.slide_how_title,         body: null },
    conditions: { icon: null,  title: o.slide_conditions_title, body: o.slide_conditions_body },
    ready:      { icon: '🚀', title: o.slide_ready_title,      body: o.slide_ready_body },
  }

  const slide = SLIDES[slideId]

  const tipKey = platform === 'ios'
    ? o.slide_ready_tip_ios
    : platform === 'android'
      ? o.slide_ready_tip_android
      : o.slide_ready_tip_other

  const toggleCondition = (c: ChronicCondition) => {
    setConditions(prev =>
      prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]
    )
  }

  const handleNext = () => {
    if (isLast) {
      const existing = (() => {
        try { return JSON.parse(localStorage.getItem(PROFILE_KEY) ?? '{}') } catch { return {} }
      })()
      const updated = { ...existing, conditions, medications: existing.medications ?? [] }
      localStorage.setItem(PROFILE_KEY, JSON.stringify(updated))
      markOnboarded()
      trackEvent('signup_completed', { condition_count: conditions.length })
      onComplete()
    } else {
      setStep(s => s + 1)
    }
  }

  const btnLabel = isLast
    ? o.get_started
    : isConditions && conditions.length === 0
      ? o.conditions_none
      : o.next

  return (
    <div style={{
      minHeight: '100dvh',
      backgroundColor: 'var(--color-bg)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '48px 24px 40px',
      color: 'var(--color-text)',
    }}>
      <div style={{ width: '100%', maxWidth: 440 }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <span style={{ fontSize: '1rem', fontWeight: 800, letterSpacing: '0.05em', color: 'var(--color-primary)' }}>
            symply
          </span>
        </div>
        <ProgressDots current={step} total={SLIDE_IDS.length} />
      </div>

      <div style={{ flex: 1, width: '100%', maxWidth: 440, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        {slide.icon && (
          <div style={{ textAlign: 'center', fontSize: '3.5rem', marginBottom: '24px', lineHeight: 1 }}>
            {slide.icon}
          </div>
        )}
        <h1 style={{
          fontSize: '1.75rem', fontWeight: 800, lineHeight: 1.25,
          textAlign: isConditions ? 'left' : 'center',
          marginBottom: '16px', whiteSpace: 'pre-line',
        }}>
          {slide.title}
        </h1>
        {slide.body && (
          <p style={{
            fontSize: '1rem', color: 'var(--color-text-muted)',
            lineHeight: 1.65, textAlign: isConditions ? 'left' : 'center',
            marginBottom: '24px',
          }}>
            {slide.body}
          </p>
        )}
        {isHow && <HowItWorks steps={o.how_works} />}
        {isConditions && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}>
            {CONDITIONS.map(c => {
              const sel = conditions.includes(c.value)
              const label = (t.settings as Record<string, string>)[c.labelKey] || c.labelKey
              return (
                <button
                  key={c.value}
                  onClick={() => toggleCondition(c.value)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '8px 14px', borderRadius: '20px',
                    border: `1.5px solid ${sel ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    backgroundColor: sel ? 'var(--color-primary-light)' : 'var(--color-surface)',
                    color: sel ? 'var(--color-primary)' : 'var(--color-text-muted)',
                    fontSize: '0.88rem', fontWeight: sel ? 700 : 400,
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}
                >
                  {c.emoji} {label}{sel ? ' ✓' : ''}
                </button>
              )
            })}
          </div>
        )}
        {isReady && (
          <div style={{
            backgroundColor: 'var(--color-primary-light)',
            borderRadius: '16px', padding: '16px', marginTop: '8px',
          }}>
            <p style={{ fontSize: '0.88rem', color: 'var(--color-primary)', lineHeight: 1.55, fontWeight: 500 }}>
              {tipKey}
            </p>
          </div>
        )}
      </div>

      <div style={{ width: '100%', maxWidth: 440, marginTop: '32px' }}>
        <button
          onClick={handleNext}
          style={{
            width: '100%', padding: '16px', borderRadius: '14px', border: 'none',
            backgroundColor: 'var(--color-primary)', color: '#fff',
            fontSize: '1.05rem', fontWeight: 700, cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(124,58,237,0.35)',
          }}
        >
          {btnLabel}
        </button>
        {step > 0 && (
          <button
            onClick={() => setStep(s => s - 1)}
            style={{
              width: '100%', marginTop: '10px', padding: '10px',
              border: 'none', background: 'none',
              color: 'var(--color-text-muted)', fontSize: '0.9rem', cursor: 'pointer',
            }}
          >
            {o.back}
          </button>
        )}
      </div>
    </div>
  )
}
