import { useState } from 'react'
import type { ChronicCondition } from '../types'

const ONBOARDING_KEY = 'symply-onboarded'
const PROFILE_KEY = 'symply-profile'

export function hasOnboarded(): boolean {
  return localStorage.getItem(ONBOARDING_KEY) === 'true'
}

function markOnboarded() {
  localStorage.setItem(ONBOARDING_KEY, 'true')
}

const CONDITIONS: { value: ChronicCondition; label: string; emoji: string }[] = [
  { value: 'PCOS',                 label: 'PCOS',                     emoji: '🔄' },
  { value: 'endometriosis',        label: 'Endometriosis',            emoji: '🌸' },
  { value: 'fibromyalgia',         label: 'Fibromyalgia',             emoji: '💜' },
  { value: 'lupus',                label: 'Lupus',                    emoji: '🦋' },
  { value: 'rheumatoid_arthritis', label: 'Rheumatoid Arthritis',     emoji: '🦴' },
  { value: 'crohns',               label: "Crohn's Disease",          emoji: '🫁' },
  { value: 'ibs',                  label: 'IBS',                      emoji: '⚡' },
  { value: 'chronic_fatigue',      label: 'Chronic Fatigue (ME/CFS)', emoji: '😴' },
  { value: 'other',                label: 'Other / Not listed',       emoji: '➕' },
]

const SLIDES = [
  {
    id: 'welcome',
    icon: '💜',
    title: 'Your symptoms\ndeserve to be heard.',
    body: 'Symply helps you track your daily symptoms, discover personal patterns, and bring clear evidence to your doctor — all in 30 seconds a day.',
  },
  {
    id: 'problem',
    icon: '😔',
    title: "You're not imagining it.",
    body: 'On average, it takes 7-12 years to be diagnosed with conditions like endometriosis or fibromyalgia. Medical gaslighting is real — documented data changes that.',
  },
  {
    id: 'how',
    icon: '✨',
    title: 'How Symply works',
    body: null,
  },
  {
    id: 'conditions',
    icon: null,
    title: 'What are you managing?',
    body: 'Select all that apply. This personalizes your AI insights. You can always update this later.',
  },
  {
    id: 'ready',
    icon: '🚀',
    title: "You're all set!",
    body: 'Your first check-in takes about 30 seconds. The more you log, the more Symply learns about your body.',
  },
]

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

function HowItWorks() {
  const steps = [
    { icon: '📝', title: '30-sec check-in',     desc: 'Log pain, fatigue, mood, sleep, and triggers every day.' },
    { icon: '🤖', title: 'AI finds patterns',   desc: '"Sleep under 6h → 40% higher pain next day"' },
    { icon: '📄', title: 'Doctor-ready report', desc: 'Auto-generate a 1-2 page clinical PDF before your appointment.' },
  ]
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
              {s.desc}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function OnboardingPage({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0)
  const [conditions, setConditions] = useState<ChronicCondition[]>([])

  const slide = SLIDES[step]
  const isLast = step === SLIDES.length - 1
  const isConditions = slide.id === 'conditions'

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
      onComplete()
    } else {
      setStep(s => s + 1)
    }
  }

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
        <ProgressDots current={step} total={SLIDES.length} />
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
        {slide.id === 'how' && <HowItWorks />}
        {isConditions && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}>
            {CONDITIONS.map(c => {
              const sel = conditions.includes(c.value)
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
                  {c.emoji} {c.label}{sel ? ' ✓' : ''}
                </button>
              )
            })}
          </div>
        )}
        {slide.id === 'ready' && (
          <div style={{
            backgroundColor: 'var(--color-primary-light)',
            borderRadius: '16px', padding: '16px', marginTop: '8px',
          }}>
            <p style={{ fontSize: '0.88rem', color: 'var(--color-primary)', lineHeight: 1.55, fontWeight: 500 }}>
              💡 Tip: Add Symply to your home screen for the fastest access.
              In your browser, tap Share → Add to Home Screen.
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
          {isLast ? 'Start tracking →' : (isConditions && conditions.length === 0 ? 'Skip for now →' : 'Continue →')}
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
            ← Back
          </button>
        )}
      </div>
    </div>
  )
}
