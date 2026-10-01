import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from './ui/Card'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import { trackEvent } from '../lib/trackEvent'
import {
    getNextVisit,
    saveNextVisit,
    clearNextVisit,
    daysUntil,
    localDateId,
} from '../lib/visit'
import type { NextVisit } from '../lib/visit'

type Lang = 'en' | 'ko' | 'es'

const TEXT: Record<Lang, Record<string, string>> = {
    ko: {
        title: '다음 진료',
        empty: '다음 진료일을 입력해 두면 진료 전에 보고서를 준비하도록 알려 드려요.',
        past: '진료일이 지났어요. 다음 진료일이 정해졌나요?',
        save: '저장',
        change: '변경',
        remove: '삭제',
        cancel: '취소',
        today: '오늘 진료',
        report: '진료 준비 보고서 만들기',
        hint: '진료 전날 만들어 두면 의사에게 바로 보여 줄 수 있어요.',
    },
    en: {
        title: 'Next visit',
        empty: 'Add your next appointment date and we will remind you to prepare your report.',
        past: 'Your appointment date has passed. Do you have a new date?',
        save: 'Save',
        change: 'Change',
        remove: 'Remove',
        cancel: 'Cancel',
        today: 'Visit today',
        report: 'Create visit-prep report',
        hint: 'Create it the day before so you can show it to your doctor.',
    },
    es: {
        title: 'Próxima cita',
        empty: 'Agrega la fecha de tu próxima cita y te recordaremos preparar tu informe.',
        past: 'La fecha de tu cita ya pasó. ¿Tienes una nueva fecha?',
        save: 'Guardar',
        change: 'Cambiar',
        remove: 'Eliminar',
        cancel: 'Cancelar',
        today: 'Cita hoy',
        report: 'Crear informe para la cita',
        hint: 'Créalo el día anterior para mostrarlo a tu médico.',
    },
}

const smallBtn: React.CSSProperties = {
    padding: '6px 12px',
    borderRadius: '16px',
    cursor: 'pointer',
    border: '1px solid var(--color-border)',
    background: 'var(--color-surface-2)',
    color: 'var(--color-text-muted)',
    fontSize: '0.78rem',
}

export default function NextVisitCard() {
    const { user } = useAuth()
    const { language } = useLanguage()
    const navigate = useNavigate()
    const L = TEXT[(language as Lang) in TEXT ? (language as Lang) : 'en']

    const [visit, setVisit] = useState<NextVisit | null>(null)
    const [loaded, setLoaded] = useState(false)
    const [editing, setEditing] = useState(false)
    const [draft, setDraft] = useState('')

    useEffect(() => {
        let cancelled = false
        getNextVisit(user?.uid).then(v => {
            if (cancelled) return
            setVisit(v)
            setLoaded(true)
        })
        return () => {
            cancelled = true
        }
    }, [user?.uid])

    if (!loaded) return null

    const days = visit ? daysUntil(visit.date) : null
    const showInput = editing || !visit || (days !== null && days < 0)

    async function handleSave() {
        if (!draft) return
        const next: NextVisit = { date: draft }
        setVisit(next)
        setEditing(false)
        setDraft('')
        try {
            await saveNextVisit(next, user?.uid)
            trackEvent('visit_date_saved', { source: 'visit_card' })
        } catch {
            /* local copy is already saved; Firestore sync will retry on next save */
        }
    }

    async function handleRemove() {
        setVisit(null)
        setEditing(false)
        try {
            await clearNextVisit(user?.uid)
        } catch {
            /* ignore */
        }
    }

    function handleReport() {
        trackEvent('visit_report_clicked', { source: 'visit_card' })
        navigate('/report')
    }

    return (
        <Card style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <p style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--color-text)', margin: 0 }}>
                    🩺 {L.title}
                </p>
                {!showInput && days !== null && days >= 0 && (
                    <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--color-primary)' }}>
                        {days === 0 ? L.today : `D-${days}`}
                    </span>
                )}
            </div>

            {showInput ? (
                <div>
                    <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginBottom: '8px', lineHeight: 1.4 }}>
                        {visit && days !== null && days < 0 ? L.past : L.empty}
                    </p>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <input
                            type="date"
                            value={draft}
                            min={localDateId()}
                            onChange={e => setDraft(e.target.value)}
                            style={{
                                flex: 1, padding: '8px', borderRadius: '10px',
                                border: '1px solid var(--color-border)',
                                background: 'var(--color-surface-2)', color: 'var(--color-text)',
                                fontSize: '0.9rem', fontFamily: 'inherit',
                            }}
                        />
                        <button
                            onClick={handleSave}
                            disabled={!draft}
                            style={{
                                padding: '8px 14px', borderRadius: '10px', border: 'none',
                                cursor: draft ? 'pointer' : 'default',
                                background: draft ? 'var(--color-primary)' : 'var(--color-border)',
                                color: '#fff', fontWeight: 600, fontSize: '0.85rem',
                            }}
                        >
                            {L.save}
                        </button>
                        {editing && (
                            <button onClick={() => { setEditing(false); setDraft('') }} style={smallBtn}>
                                {L.cancel}
                            </button>
                        )}
                    </div>
                </div>
            ) : (
                <div>
                    <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginBottom: '8px' }}>
                        {visit?.date}
                    </p>
                    {days !== null && days >= 0 && days <= 3 && (
                        <div style={{ marginBottom: '10px' }}>
                            <button
                                onClick={handleReport}
                                style={{
                                    width: '100%', padding: '10px', borderRadius: '12px', border: 'none',
                                    cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem', color: '#fff',
                                    background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                                }}
                            >
                                📄 {L.report}
                            </button>
                            <p style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: '6px' }}>
                                {L.hint}
                            </p>
                        </div>
                    )}
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => { setDraft(visit?.date ?? ''); setEditing(true) }} style={smallBtn}>
                            {L.change}
                        </button>
                        <button onClick={handleRemove} style={smallBtn}>
                            {L.remove}
                        </button>
                    </div>
                </div>
            )}
        </Card>
    )
}