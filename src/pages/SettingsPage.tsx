import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../contexts/ThemeContext'
import { useLanguage, AVAILABLE_LANGS } from '../contexts/LanguageContext'
import { useAuth } from '../contexts/AuthContext'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { verifyAndActivatePro } from '../lib/polar'
import UpgradeModal from '../components/UpgradeModal'
import type { ChronicCondition, Medication } from '../types'
import {
  loadNotifSettings, requestPermission, applyNotifSettings,
  isNotificationSupported, type NotificationSettings,
} from '../lib/notifications'

const PROFILE_KEY = 'symply-profile'

interface UserSettings {
  name: string
  gender: 'female' | 'male' | 'other' | ''
  conditions: ChronicCondition[]
  medications: Medication[]
}

function loadLocalSettings(): UserSettings {
  try {
    const raw = localStorage.getItem(PROFILE_KEY)
    return raw ? JSON.parse(raw) : { name: '', gender: '' as const, conditions: [], medications: [] }
  } catch {
    return { name: '', gender: '' as const, conditions: [], medications: [] }
  }
}

function saveLocalSettings(s: UserSettings) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(s))
  window.dispatchEvent(new Event('symply-profile-updated'))
}

const CONDITION_OPTIONS: { value: ChronicCondition; label: string; emoji: string }[] = [
  { value: 'PCOS',                 label: 'PCOS',                    emoji: '🔄' },
  { value: 'endometriosis',        label: 'Endometriosis',           emoji: '🌸' },
  { value: 'fibromyalgia',         label: 'Fibromyalgia',            emoji: '💜' },
  { value: 'lupus',                label: 'Lupus',                   emoji: '🫀' },
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

function SectionHeader({ children, mt }: { children: React.ReactNode; mt?: number }) {
  return (
    <h2 style={{
      fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase',
      letterSpacing: '0.08em', color: 'var(--color-text-muted)',
      marginBottom: '12px', marginTop: mt ?? 0,
    }}>
      {children}
    </h2>
  )
}

function SettingsCard({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      background: 'var(--color-surface)', borderRadius: '16px',
      border: '1px solid var(--color-border)', overflow: 'hidden',
      marginBottom: '8px',
    }}>
      {children}
    </div>
  )
}

function SettingsRow({
  label, value, icon, onClick, danger,
}: {
  label: string; value?: string; icon?: string
  onClick?: () => void; danger?: boolean
}) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 16px', cursor: onClick ? 'pointer' : 'default',
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      <span style={{ fontSize: '0.9rem', color: danger ? '#ef4444' : 'var(--color-text)' }}>
        {label}
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        {value && <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{value}</span>}
        {icon && <span>{icon}</span>}
      </div>
    </div>
  )
}

export default function SettingsPage() {
  const navigate = useNavigate()
  const { mode: theme, setMode: setTheme } = useTheme()
  const { language, setLanguage, t } = useLanguage()
  const { user, isPro, signOutUser } = useAuth()

  const [settings, setSettings]             = useState<UserSettings>(loadLocalSettings)
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false)
  const [notifSettings, setNotifSettings] = useState<NotificationSettings>(() => loadNotifSettings())
  const [notifPermission, setNotifPermission] = useState<NotificationPermission | null>(
    isNotificationSupported() ? Notification.permission : null
  )
  const [showMedForm, setShowMedForm]       = useState(false)
  const [medName, setMedName]               = useState('')
  const [medFreq, setMedFreq]               = useState<Medication['frequency']>('daily')
  const [saving, setSaving]                 = useState(false)
  const [showUpgrade, setShowUpgrade]       = useState(false)
  const [proActivated, setProActivated]     = useState(false)
  const [verifying, setVerifying]           = useState(false)

  // 결제 완료 후 리턴 처리
  useEffect(() => {
    const params     = new URLSearchParams(window.location.search)
    const success    = params.get('checkout_success')
    const checkoutId = params.get('checkout_id')
    if (success === 'true' && checkoutId && user) {
      setVerifying(true)
      verifyAndActivatePro(checkoutId, user.uid).then(ok => {
        setVerifying(false)
        if (ok) {
          setProActivated(true)
          window.history.replaceState({}, '', '/settings')
        }
      })
    }
  }, [user])

  // Firestore에서 설정 로드
  useEffect(() => {
    if (!user) return
    getDoc(doc(db, 'users', user.uid)).then(snap => {
      if (snap.exists()) {
        const data = snap.data()
        const merged: UserSettings = {
          name:        data.displayName ?? user.displayName ?? '',
          gender:      data.gender      ?? '',
          conditions:  data.conditions  ?? [],
          medications: data.medications ?? [],
        }
        setSettings(merged)
        saveLocalSettings(merged)
      }
    })
  }, [user])

  async function saveToFirestore(updated: UserSettings) {
    if (!user) return
    setSaving(true)
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        displayName: updated.name,
        conditions:  updated.conditions,
        medications: updated.medications,
      })
    } finally {
      setSaving(false)
    }
  }

  function updateSettings(patch: Partial<UserSettings>) {
    const updated = { ...settings, ...patch }
    setSettings(updated)
    saveLocalSettings(updated)
    saveToFirestore(updated)
  }

  function toggleCondition(c: ChronicCondition) {
    const conditions = settings.conditions.includes(c)
      ? settings.conditions.filter(x => x !== c)
      : [...settings.conditions, c]
    updateSettings({ conditions })
  }

  function addMedication() {
    if (!medName.trim()) return
    const med: Medication = {
      id: Date.now().toString(), name: medName.trim(), frequency: medFreq,
    }
    updateSettings({ medications: [...settings.medications, med] })
    setMedName('')
    setMedFreq('daily')
    setShowMedForm(false)
  }

  function removeMedication(id: string) {
    updateSettings({ medications: settings.medications.filter(m => m.id !== id) })
  }

  async function handleNotifToggle(enabled: boolean) {
    if (enabled && isNotificationSupported()) {
      const perm = await requestPermission()
      setNotifPermission(perm)
      if (perm !== 'granted') return
    }
    const next = { ...notifSettings, enabled }
    setNotifSettings(next)
    applyNotifSettings(
      next,
      language === 'ko' ? '💜 Symply 체크인 시간이에요' : language === 'es' ? '💜 Hora de registrar síntomas' : '💜 Time for your daily check-in',
      language === 'ko' ? '오늘 증상을 기록하고 패턴을 추적하세요.' : language === 'es' ? 'Registra tus síntomas de hoy.' : 'Log your symptoms and track your patterns.'
    )
  }

  function handleNotifTime(time: string) {
    const next = { ...notifSettings, time }
    setNotifSettings(next)
    applyNotifSettings(
      next,
      language === 'ko' ? '💜 Symply 체크인 시간이에요' : language === 'es' ? '💜 Hora de registrar síntomas' : '💜 Time for your daily check-in',
      language === 'ko' ? '오늘 증상을 기록하고 패턴을 추적하세요.' : language === 'es' ? 'Registra tus síntomas de hoy.' : 'Log your symptoms and track your patterns.'
    )
  }

  const showCycleTab = settings.gender === 'female'

  return (
    <div style={{ padding: '20px 16px 100px', maxWidth: '480px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '20px' }}>
        {t.settings.title}
      </h1>

      {/* 결제 완료 배너 */}
      {verifying && (
        <div style={{
          padding: '14px 16px', borderRadius: '12px',
          background: '#ede9fe', border: '1px solid var(--color-primary)',
          marginBottom: '16px', textAlign: 'center',
          fontSize: '0.85rem', color: 'var(--color-primary)', fontWeight: 600,
        }}>
          ⏳ Verifying your subscription…
        </div>
      )}
      {proActivated && (
        <div style={{
          padding: '14px 16px', borderRadius: '12px',
          background: '#dcfce7', border: '1px solid #22c55e',
          marginBottom: '16px', textAlign: 'center',
        }}>
          <div style={{ fontSize: '1.5rem', marginBottom: '4px' }}>🎉</div>
          <div style={{ fontWeight: 700, color: '#15803d', fontSize: '0.95rem' }}>
            Welcome to Symply Pro!
          </div>
          <div style={{ fontSize: '0.78rem', color: '#166534', marginTop: '2px' }}>
            AI Analysis and PDF Reports are now unlocked.
          </div>
        </div>
      )}

      {/* SUBSCRIPTION */}
      <SectionHeader>{t.settings.subscription_title}</SectionHeader>
      <SettingsCard>
        {isPro ? (
          <div style={{ padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '1.4rem' }}>✨</span>
              <div>
                <div style={{ fontWeight: 700, color: 'var(--color-primary)', fontSize: '0.95rem' }}>
                  Symply Pro
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                  {t.settings.plan_pro}
                </div>
              </div>
              <span style={{
                marginLeft: 'system', padding: '3px 10px', borderRadius: '10px',
                background: 'var(--color-primary-light)', color: 'var(--color-primary)',
                fontSize: '0.72rem', fontWeight: 700,
              }}>ACTIVE</span>
            </div>
          </div>
        ) : (
          <div style={{ padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 600, color: 'var(--color-text)', fontSize: '0.9rem' }}>
                  {t.settings.plan_free}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                  {t.settings.plan_free}
                </div>
              </div>
              <button
                onClick={() => setShowUpgrade(true)}
                style={{
                  padding: '8px 16px', borderRadius: '10px', border: 'none',
                  background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                  color: '#fff', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer',
                }}
              >{t.settings.upgrade_btn}</button>
            </div>
          </div>
        )}
      </SettingsCard>

      {/* PROFILE */}
      <SectionHeader mt={20}>{t.settings.account_title}</SectionHeader>
      <SettingsCard>
        <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {user?.photoURL && (
              <img src={user.photoURL} alt="" style={{ width: 40, height: 40, borderRadius: '50%' }} />
            )}
            <div>
              <div style={{ fontWeight: 600, color: 'var(--color-text)' }}>
                {user?.displayName ?? 'User'}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                {user?.email}
              </div>
            </div>
          </div>
        </div>
        <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--color-border)' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {t.settings.display_name_label}
          </div>
          <input
            value={settings.name}
            onChange={e => updateSettings({ name: e.target.value })}
            placeholder={t.settings.language_sub}
            style={{
              width: '100%', padding: '8px 12px', borderRadius: '8px',
              border: '1px solid var(--color-border)', background: 'var(--color-surface-2)',
              color: 'var(--color-text)', fontSize: '0.9rem', boxSizing: 'border-box',
            }}
          />
          {saving && <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>{t.settings.saving}</div>}
        </div>
        <div style={{ padding: '14px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--color-text)' }}>{t.settings.theme_label}</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{t.settings.theme_sub}</span>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {(['light', 'system', 'dark'] as const).map(themeOpt => (
              <button
                key={themeOpt}
                onClick={() => setTheme(themeOpt)}
                style={{
                  flex: 1, padding: '8px', borderRadius: '10px',
                  border: theme === themeOpt ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                  background: theme === themeOpt ? 'var(--color-primary-light)' : 'var(--color-surface-2)',
                  cursor: 'pointer', fontWeight: theme === themeOpt ? 700 : 400, fontSize: '0.82rem',
                  color: theme === themeOpt ? 'var(--color-primary)' : 'var(--color-text-muted)',
                }}
              >
                {themeOpt === 'light' ? t.settings.theme_light : themeOpt === 'dark' ? t.settings.theme_dark : t.settings.theme_auto}
              </button>
            ))}
          </div>
        </div>
        <div style={{ padding: '14px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--color-text)' }}>{t.settings.language_label}</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{t.settings.language_sub}</span>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {AVAILABLE_LANGS.map(lang => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                style={{
                  flex: 1, padding: '8px', borderRadius: '10px',
                  border: language === lang ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                  background: language === lang ? 'var(--color-primary-light)' : 'var(--color-surface-2)',
                  cursor: 'pointer', fontWeight: language === lang ? 700 : 400, fontSize: '0.75rem',
                  color: language === lang ? 'var(--color-primary)' : 'var(--color-text-muted)',
                }}
              >
                {lang === 'en' ? '🇺🇸 EN' : lang === 'es' ? '🇪🇸 ES' : '🇰🇷 KO'}
              </button>
            ))}
          </div>
        </div>
      </SettingsCard>

      {/* MY CONDITIONS */}
      {/* GENDER */}
      <SectionHeader mt={20}>{t.settings.gender_title}</SectionHeader>
      <SettingsCard>
        <div style={{ padding: '14px 16px' }}>
          <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginBottom: '10px' }}>
            {t.settings.gender_sub}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {([
              { value: 'female', label: t.settings.gender_female },
              { value: 'male',   label: t.settings.gender_male },
              { value: 'other',  label: t.settings.gender_other },
            ] as const).map(({ value, label }) => (
              <button key={value} onClick={() => updateSettings({ gender: value })} style={{
                padding: '10px 14px', borderRadius: '10px', cursor: 'pointer', textAlign: 'left',
                border: settings.gender === value ? '2px solid var(--color-primary)' : '1.5px solid var(--color-border)',
                background: settings.gender === value ? 'var(--color-primary-light)' : 'var(--color-surface-2)',
                color: settings.gender === value ? 'var(--color-primary)' : 'var(--color-text)',
                fontWeight: settings.gender === value ? 700 : 400,
                fontSize: '0.9rem',
              }}>
                {label}
              </button>
            ))}
          </div>
          {settings.gender === 'female' && (
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '10px', lineHeight: 1.5 }}>
              {t.settings.gender_cycle_note}
            </p>
          )}
        </div>
      </SettingsCard>

      <SectionHeader mt={20}>{t.settings.conditions_title}</SectionHeader>
      <SettingsCard>
        <div style={{ padding: '14px 16px' }}>
          <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginBottom: '12px' }}>
            {t.settings.conditions_sub}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {CONDITION_OPTIONS.map(opt => {
              const selected = settings.conditions.includes(opt.value)
              return (
                <button
                  key={opt.value}
                  onClick={() => toggleCondition(opt.value)}
                  style={{
                    padding: '6px 14px', borderRadius: '20px', cursor: 'pointer',
                    border: selected ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                    background: selected ? 'var(--color-primary-light)' : 'var(--color-surface-2)',
                    color: selected ? 'var(--color-primary)' : 'var(--color-text)',
                    fontWeight: selected ? 700 : 400, fontSize: '0.85rem',
                  }}
                >
                  {opt.emoji} {t.settings[('condition_' + opt.value) as keyof typeof t.settings] as string || opt.label} {selected ? '✓' : ''}
                </button>
              )
            })}
          </div>
          {showCycleTab && (
            <p style={{ fontSize: '0.75rem', color: 'var(--color-primary)', marginTop: '10px' }}>
              {t.settings.cycle_tab_enabled}
            </p>
          )}
        </div>
      </SettingsCard>

      {/* MEDICATIONS */}
      <SectionHeader mt={20}>{t.settings.medications_title}</SectionHeader>
      <SettingsCard>
        <div style={{ padding: '14px 16px' }}>
          {settings.medications.length === 0 ? (
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', textAlign: 'center', padding: '8px 0' }}>
              {t.settings.no_meds_yet}
            </p>
          ) : (
            settings.medications.map(med => (
              <div key={med.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '8px 0', borderBottom: '1px solid var(--color-border)',
              }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-text)' }}>{med.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{FREQ_LABELS[med.frequency]}</div>
                </div>
                <button
                  onClick={() => removeMedication(med.id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: '1.1rem' }}
                >×</button>
              </div>
            ))
          )}
          {!showMedForm ? (
            <button
              onClick={() => setShowMedForm(true)}
              style={{
                width: '100%', marginTop: '10px', padding: '10px',
                borderRadius: '10px', border: '1.5px dashed var(--color-border)',
                background: 'none', color: 'var(--color-primary)',
                fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
              }}
            >{t.settings.add_med}</button>
          ) : (
            <div style={{ marginTop: '12px' }}>
              <input
                value={medName}
                onChange={e => setMedName(e.target.value)}
                placeholder={t.settings.med_name_placeholder}
                style={{
                  width: '100%', padding: '8px 12px', borderRadius: '8px',
                  border: '1px solid var(--color-border)', background: 'var(--color-surface-2)',
                  color: 'var(--color-text)', fontSize: '0.9rem',
                  boxSizing: 'border-box', marginBottom: '8px',
                }}
                onClick={e => e.stopPropagation()}
              />
              <select
                value={medFreq}
                onChange={e => setMedFreq(e.target.value as Medication['frequency'])}
                style={{
                  width: '100%', padding: '8px 12px', borderRadius: '8px',
                  border: '1px solid var(--color-border)', background: 'var(--color-surface-2)',
                  color: 'var(--color-text)', fontSize: '0.9rem',
                  boxSizing: 'border-box', marginBottom: '8px',
                }}
                onClick={e => e.stopPropagation()}
              >
                <option value="daily">{t.settings.med_freq_daily}</option>
                <option value="as_needed">{t.settings.med_freq_asneeded}</option>
                <option value="weekly">{t.settings.med_freq_weekly}</option>
              </select>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={addMedication}
                  style={{
                    flex: 1, padding: '8px', borderRadius: '8px', border: 'none',
                    background: 'var(--color-primary)', color: '#fff',
                    fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer',
                  }}
                >{t.settings.med_add_btn}</button>
                <button
                  onClick={() => { setShowMedForm(false); setMedName('') }}
                  style={{
                    flex: 1, padding: '8px', borderRadius: '8px',
                    border: '1px solid var(--color-border)', background: 'none',
                    color: 'var(--color-text-muted)', fontSize: '0.85rem', cursor: 'pointer',
                  }}
                >{t.settings.med_cancel_btn}</button>
              </div>
            </div>
          )}
        </div>
      </SettingsCard>

      {/* NOTIFICATIONS */}
      <SectionHeader mt={20}>{t.settings.notifications_title}</SectionHeader>
      <SettingsCard>
        <div style={{ padding: '14px 16px' }}>
          {!isNotificationSupported() ? (
            <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
              {t.settings.notifications_not_supported}
            </p>
          ) : notifPermission === 'denied' ? (
            <p style={{ fontSize: '0.82rem', color: '#ef4444' }}>
              {t.settings.notifications_permission_denied}
            </p>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: notifSettings.enabled ? '14px' : '0' }}>
                <div>
                  <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '2px' }}>
                    {t.settings.notifications_enable}
                  </p>
                  <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                    {t.settings.notifications_sub}
                  </p>
                </div>
                <button
                  onClick={() => handleNotifToggle(!notifSettings.enabled)}
                  style={{
                    width: '48px', height: '28px', borderRadius: '14px', border: 'none',
                    background: notifSettings.enabled ? 'var(--color-primary)' : 'var(--color-border)',
                    position: 'relative', cursor: 'pointer', flexShrink: 0, transition: 'background 0.2s',
                  }}
                >
                  <span style={{
                    position: 'absolute', top: '4px',
                    left: notifSettings.enabled ? '24px' : '4px',
                    width: '20px', height: '20px', borderRadius: '50%',
                    background: '#fff', transition: 'left 0.2s',
                  }} />
                </button>
              </div>
              {notifSettings.enabled && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text)' }}>
                    {t.settings.notifications_time}
                  </p>
                  <input
                    type="time"
                    value={notifSettings.time}
                    onChange={e => handleNotifTime(e.target.value)}
                    style={{
                      padding: '6px 10px', borderRadius: '8px',
                      border: '1px solid var(--color-border)',
                      background: 'var(--color-surface-2)',
                      color: 'var(--color-text)',
                      fontSize: '0.9rem', cursor: 'pointer',
                    }}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </SettingsCard>

      {/* ABOUT */}
      <SectionHeader mt={20}>{t.settings.about_title}</SectionHeader>
      <SettingsCard>
        <SettingsRow label="Symply"        value="Version 1.0.0 · Sprint 7" icon="💜" />
        <SettingsRow label={t.settings.about_guide} value={t.settings.about_guide_val} icon="📖" onClick={() => navigate('/guide')} />
        <SettingsRow label={t.settings.about_privacy} value={t.settings.about_privacy_val} icon="🔒" />
        <SettingsRow label={t.settings.about_evidence} value={t.settings.about_evidence_val} icon="📚" />
      </SettingsCard>

      {/* ACCOUNT */}
      <SectionHeader mt={20}>{t.settings.account_title}</SectionHeader>
      <SettingsCard>
        {!showSignOutConfirm ? (
          <SettingsRow
            label={t.settings.sign_out}
            value={user?.email ?? ''}
            icon="—"
            danger
            onClick={() => setShowSignOutConfirm(true)}
          />
        ) : (
          <div style={{ padding: '16px' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text)', marginBottom: '12px', textAlign: 'center' }}>
              {t.settings.sign_out_confirm}
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setShowSignOutConfirm(false)}
                style={{
                  flex: 1, padding: '10px', borderRadius: '10px',
                  border: '1px solid var(--color-border)', background: 'none',
                  color: 'var(--color-text-muted)', fontSize: '0.85rem', cursor: 'pointer',
                }}
              >{t.settings.sign_out_cancel}</button>
              <button
                onClick={signOutUser}
                style={{
                  flex: 1, padding: '10px', borderRadius: '10px', border: 'none',
                  background: '#ef4444', color: '#fff',
                  fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
                }}
              >{t.settings.sign_out_yes}</button>
            </div>
          </div>
        )}
      </SettingsCard>

      <p style={{
        fontSize: '0.72rem', color: 'var(--color-text-muted)',
        textAlign: 'center', marginTop: '24px', lineHeight: 1.5,
      }}>
        {t.settings.about_disclaimer}
      </p>

      {showUpgrade && user && (
        <UpgradeModal
          onClose={() => setShowUpgrade(false)}
          userEmail={user.email ?? ''}
          feature="ai"
        />
      )}
    </div>
  )
}
