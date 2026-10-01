import Card from './ui/Card'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import { useFirestoreLogs } from '../hooks/useFirestoreLogs'
import { localDateId } from '../lib/visit'

type Lang = 'en' | 'ko' | 'es'

const LOCALE: Record<Lang, string> = { ko: 'ko-KR', en: 'en-US', es: 'es-ES' }

const TEXT: Record<Lang, { count: (n: number) => string; start: string; note: string }> = {
    ko: {
        count: n => `최근 7일 중 ${n}일 기록했어요`,
        start: '오늘 기록하면 이번 일주일이 시작돼요',
        note: '하루 쉬어도 괜찮아요. 기록은 이어집니다.',
    },
    en: {
        count: n => `You logged ${n} of the last 7 days`,
        start: 'Log today to start this week',
        note: 'Missing a day is fine. Your record carries on.',
    },
    es: {
        count: n => `Registraste ${n} de los últimos 7 días`,
        start: 'Registra hoy para empezar esta semana',
        note: 'Faltar un día no pasa nada. Tu registro continúa.',
    },
}

interface Props {
    todayLogged: boolean
}

export default function WeekProgressCard({ todayLogged }: Props) {
    const { user } = useAuth()
    const { language } = useLanguage()
    const { logs } = useFirestoreLogs(user?.uid)
    const lang: Lang = (language as Lang) in TEXT ? (language as Lang) : 'en'
    const L = TEXT[lang]

    // Oldest first, ending with today (local calendar dates).
    const days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date()
        d.setDate(d.getDate() - (6 - i))
        const id = localDateId(d)
        const isToday = i === 6
        const logged = !!logs[id] || (isToday && todayLogged)
        return {
            id,
            isToday,
            logged,
            label: d.toLocaleDateString(LOCALE[lang], { weekday: 'short' }),
        }
    })

    const count = days.filter(d => d.logged).length

    return (
        <Card style={{ marginBottom: '12px', padding: '12px 14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                {days.map(d => (
                    <div key={d.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                        <div
                            style={{
                                width: '28px',
                                height: '28px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.8rem',
                                color: '#fff',
                                background: d.logged ? 'var(--color-primary)' : 'var(--color-surface-2)',
                                border: d.isToday
                                    ? '2px solid var(--color-primary)'
                                    : '1px solid var(--color-border)',
                            }}
                        >
                            {d.logged ? '✓' : ''}
                        </div>
                        <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>{d.label}</span>
                    </div>
                ))}
            </div>
            <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text)', margin: 0 }}>
                {count === 0 ? L.start : L.count(count)}
            </p>
            {count > 0 && count < 7 && (
                <p style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', margin: '2px 0 0' }}>{L.note}</p>
            )}
        </Card>
    )
}