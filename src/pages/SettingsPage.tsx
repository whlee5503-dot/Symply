import { useState, useEffect } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import type { ChronicCondition, Medication } from '../types'

const PROFILE_KEY = 'symply-profile'

interface UserSettings {
  name: string
  conditions: ChronicCondition[]
  medications: Medication[]
}

function loadSettings(): UserSettings {
  try {
    const raw = localStorage.getItem(PROFILE_KEY)
    return raw ? JSON.parse(raw) : { name: '', conditions: [], medications: [] }
  } catch {
    return { name: '', conditions: [], medications: [] }
  }
}

function saveSettings(s: UserSettings) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(s))
}

const CONDITION_OPTIONS: { value: ChronicCondition; label: string; emoji: string }[] = [
  { value: 'PCOS',                 label: 'PCOS',                    emoji: '🔄' },
  { value: 'endometriosis',        label: 'Endometriosis',           emoji: '🌸' },
  { value: 'fibromyalgia',         label: 'Fibromyalgia',            emoji: '💜' },
  { value: 'lupus',                label: 'Lupus',                   emoji: '🦋' },
  { value: 'rheumatoid_arthritis', label: 'Rheumatoid Arthritis',    emoji: '🦴' },
  { value: 'crohns',               label: "Crohn's Disease",         emoji: '🫁' },
  { value: 'ibs',                  label: 'IBS',                     emoji: '⚡' },
  { value: 'chronic_fatigue',      label: 'Chronic Fatigue (ME/CFS)',emoji: '😴' },
  { value: 'other',                label: 'Other',                   emoji: '➕' },
]

const FREQ_LABELS: Record<Medication['frequency'], string> = {
  daily:     'Daily',
  as_needed: 'As needed',
  weekly:    'Weekly',
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{
      fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase',
      letterSpacing: '0.08em', color: 'var(--color-text-muted)', marginBottom: '12px',
    }}>
      {children}
    </h2>
  )
}

function SettingsCard({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)',
      borderRadius: '16px', overflow: 'hidden', marginBottom: '24px',
    }}>
      {children}
    </div>
  )
}

function SettingsRow({
  label, sublabel, right, onClick, noBorder,
}: {
  label: string; sublabel?: string; right?: React.ReactNode
  onClick?: () => void; noBorder?: boolean
}) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 16px',
        borderBottom: noBorder ? 'none' : '1px solid var(--color-border)',
        cursor: onClick ? 'pointer' : 'default', gap: '12px',
      }}
    >
      <div>
        <div style={{ fontSize: '0.95rem', color: 'var(--color-text)', fontWeight: 500 }}>{label}</div>
        {sublabel && (
          <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>{sublabel}</div>
        )}
      </div>
      {right}
    </div>
  )
}

function ThemeToggle() {
  const { mode, setMode } = useTheme()
  const options = [
    { value: 'light'  as const, label: 'Light', icon: '☀️' },
    { value: 'system' as const, label: 'Auto',  icon: '💻' },
    { value: 'dark'   as const, label: 'Dark',  icon: '🌙' },
  ]
  return (
    <div style={{ display: 'flex', gap: '6px' }}>
      {options.map(opt => {
        const active = mode === opt.value
        return (
          <button
            key={opt.value}
            onClick={() => setMode(opt.value)}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
              padding: '6px 10px', borderRadius: '10px',
              border: `1.5px solid ${active ? 'var(--color-primary)' : 'var(--color-border)'}`,
              backgroundColor: active ? 'var(--color-primary-light)' : 'transparent',
              color: active ? 'var(--color-primary)' : 'var(--color-text-muted)',
              cursor: 'pointer', fontSize: '0.7rem', fontWeight: active ? 700 : 400,
              transition: 'all 0.15s',
            }}
          >
            <span style={{ fontSize: '1rem' }}>{opt.icon}</span>
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

function MedModal({
  initial, onSave, onClose,
}: {
  initial?: Medication; onSave: (med: Medication) => void; onClose: () => void
}) {
  const [name, setName] = useState(initial?.name ?? '')
  const [freq, setFreq] = useState<Medication['frequency']>(initial?.frequency ?? 'daily')

  const handleSave = () => {
    const trimmed = name.trim()
    if (!trimmed) return
    onSave({ id: initial?.id ?? crypto.randomUUID(), name: trimmed, frequency: freq })
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        display: 'flex', alignItems: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%', backgroundColor: 'var(--color-surface)',
          borderRadius: '20px 20px 0 0', padding: '24px 20px 40px',
        }}
        onClick={e => e.stopPropagation()}
      >
        <h3 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '20px', color: 'var(--color-text)' }}>
          {initial ? 'Edit Medication' : 'Add Medication'}
        </h3>
        <label style={{ display: 'block', marginBottom: '12px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
            MEDICATION NAME
          </span>
          <input
            autoFocus
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleSave() }}
            placeholder="e.g. Metformin, Ibuprofen"
            style={{
              display: 'block', width: '100%', marginTop: '6px',
              padding: '10px 14px', borderRadius: '12px',
              border: '1.5px solid var(--color-border)',
              backgroundColor: 'var(--color-surface-2)',
              color: 'var(--color-text)', fontSize: '1rem', outline: 'none',
            }}
          />
        </label>
        <label style={{ display: 'block', marginBottom: '24px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
            FREQUENCY
          </span>
          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
            {(Object.keys(FREQ_LABELS) as Medication['frequency'][]).map(f => (
              <button
                key={f}
                onClick={() => setFreq(f)}
                style={{
                  flex: 1, padding: '8px 4px', borderRadius: '10px',
                  border: `1.5px solid ${freq === f ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  backgroundColor: freq === f ? 'var(--color-primary-light)' : 'transparent',
                  color: freq === f ? 'var(--color-primary)' : 'var(--color-text-muted)',
                  fontWeight: freq === f ? 700 : 400,
                  fontSize: '0.85rem', cursor: 'pointer',
                }}
              >
                {FREQ_LABELS[f]}
              </button>
            ))}
          </div>
        </label>
        <button
          onClick={handleSave}
          disabled={!name.trim()}
          style={{
            width: '100%', padding: '14px', borderRadius: '12px', border: 'none',
            cursor: name.trim() ? 'pointer' : 'not-allowed',
            backgroundColor: name.trim() ? 'var(--color-primary)' : 'var(--color-border)',
            color: name.trim() ? '#fff' : 'var(--color-text-muted)',
            fontWeight: 700, fontSize: '1rem',
          }}
        >
          Save
        </button>
      </div>
    </div>
  )
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<UserSettings>(loadSettings)
  const [showMedModal, setShowMedModal] = useState(false)
  const [editingMed, setEditingMed] = useState<Medication | undefined>()
  const [savedFlash, setSavedFlash] = useState(false)

  useEffect(() => {
    saveSettings(settings)
    setSavedFlash(true)
    const t = setTimeout(() => setSavedFlash(false), 1200)
    return () => clearTimeout(t)
  }, [settings])

  const toggleCondition = (c: ChronicCondition) => {
    setSettings(s => ({
      ...s,
      conditions: s.conditions.includes(c)
        ? s.conditions.filter(x => x !== c)
        : [...s.conditions, c],
    }))
  }

  const saveMed = (med: Medication) => {
    setSettings(s => ({
      ...s,
      medications: editingMed
        ? s.medications.map(m => (m.id === med.id ? med : m))
        : [...s.medications, med],
    }))
    setShowMedModal(false)
  }

  const deleteMed = (id: string) => {
    setSettings(s => ({ ...s, medications: s.medications.filter(m => m.id !== id) }))
  }

  return (
    <div style={{ padding: '24px 16px 8px', color: 'var(--color-text)', maxWidth: 480, margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Settings</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
          Personalize your Symply experience
        </p>
        {savedFlash && (
          <span style={{ display: 'inline-block', marginTop: '6px', fontSize: '0.75rem', color: 'var(--color-success)', fontWeight: 600 }}>
            ✓ Saved
          </span>
        )}
      </div>

      <SectionHeader>Profile</SectionHeader>
      <SettingsCard>
        <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--color-border)' }}>
          <label style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
            YOUR NAME (optional)
          </label>
          <input
            value={settings.name}
            onChange={e => setSettings(s => ({ ...s, name: e.target.value }))}
            placeholder="e.g. Sarah"
            style={{
              width: '100%', padding: '8px 12px', borderRadius: '10px',
              border: '1.5px solid var(--color-border)',
              backgroundColor: 'var(--color-surface-2)',
              color: 'var(--color-text)', fontSize: '0.95rem', outline: 'none',
            }}
          />
        </div>
        <SettingsRow label="Appearance" sublabel="Light, dark, or follow system" right={<ThemeToggle />} noBorder />
      </SettingsCard>

      <SectionHeader>My Conditions</SectionHeader>
      <SettingsCard>
        <div style={{ padding: '14px 16px' }}>
          <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginBottom: '12px' }}>
            Select all that apply. Used to personalize AI insights.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {CONDITION_OPTIONS.map(c => {
              const selected = settings.conditions.includes(c.value)
              return (
                <button
                  key={c.value}
                  onClick={() => toggleCondition(c.value)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '7px 12px', borderRadius: '20px',
                    border: `1.5px solid ${selected ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    backgroundColor: selected ? 'var(--color-primary-light)' : 'transparent',
                    color: selected ? 'var(--color-primary)' : 'var(--color-text-muted)',
                    fontSize: '0.85rem', fontWeight: selected ? 700 : 400,
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}
                >
                  <span>{c.emoji}</span>
                  {c.label}
                  {selected && <span style={{ marginLeft: '2px' }}>✓</span>}
                </button>
              )
            })}
          </div>
        </div>
      </SettingsCard>

      <SectionHeader>Medications</SectionHeader>
      <SettingsCard>
        {settings.medications.length === 0 ? (
          <div style={{ padding: '20px 16px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.88rem' }}>
            No medications added yet.
          </div>
        ) : (
          settings.medications.map((med, i) => (
            <div
              key={med.id}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 16px',
                borderBottom: i < settings.medications.length - 1 ? '1px solid var(--color-border)' : 'none',
              }}
            >
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{med.name}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                  {FREQ_LABELS[med.frequency]}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => { setEditingMed(med); setShowMedModal(true) }}
                  style={{
                    padding: '5px 12px', borderRadius: '8px',
                    border: '1px solid var(--color-border)', backgroundColor: 'transparent',
                    color: 'var(--color-text-muted)', fontSize: '0.8rem', cursor: 'pointer',
                  }}
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteMed(med.id)}
                  style={{
                    padding: '5px 10px', borderRadius: '8px',
                    border: '1px solid var(--color-danger)', backgroundColor: 'transparent',
                    color: 'var(--color-danger)', fontSize: '0.8rem', cursor: 'pointer',
                  }}
                >
                  ✕
                </button>
              </div>
            </div>
          ))
        )}
        <div style={{ padding: '12px 16px', borderTop: settings.medications.length > 0 ? '1px solid var(--color-border)' : 'none' }}>
          <button
            onClick={() => { setEditingMed(undefined); setShowMedModal(true) }}
            style={{
              width: '100%', padding: '10px', borderRadius: '10px',
              border: '1.5px dashed var(--color-primary)',
              backgroundColor: 'transparent', color: 'var(--color-primary)',
              fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer',
            }}
          >
            + Add Medication
          </button>
        </div>
      </SettingsCard>

      <SectionHeader>About</SectionHeader>
      <SettingsCard>
        <SettingsRow label="Symply" sublabel="Version 1.0.0 · Sprint 4" right={<span>💜</span>} />
        <SettingsRow label="Privacy" sublabel="No ads. No data sales. Ever." right={<span>🔒</span>} />
        <SettingsRow label="Evidence base" sublabel="WHO · Cochrane · peer-reviewed" right={<span>📚</span>} noBorder />
      </SettingsCard>

      <p style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', textAlign: 'center', lineHeight: 1.5, paddingBottom: '8px' }}>
        Symply is not a medical device. All medical decisions should be made with your healthcare provider.
      </p>

      {showMedModal && (
        <MedModal initial={editingMed} onSave={saveMed} onClose={() => setShowMedModal(false)} />
      )}
    </div>
  )
}
