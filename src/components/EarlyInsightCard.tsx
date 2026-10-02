import { useEffect, useMemo, useState } from 'react'
import Card from './ui/Card'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import { useFirestoreLogs } from '../hooks/useFirestoreLogs'
import { computeEarlyInsight } from '../lib/earlyInsight'
import { trackEvent } from '../lib/trackEvent'

type Lang = 'en' | 'ko' | 'es'

const TEXT: Record<Lang, {
    title: string
    peak: (date: string, pain: number) => string
    noPeak: string
    triggers: (list: string) => string
    noTriggers: string
    avg: (p: number, f: number) => string
    note: string
    dismiss: string
}> = {
    ko: {
        title: '지금까지 기록을 정리해 봤어요',
        peak: (d, p) => `통증이 가장 높았던 날은 ${d}(${p}점)이에요`,
        noPeak: '아직 통증이 기록된 날이 없어요',
        triggers: l => `그날 함께 기록된 항목: ${l}`,
        noTriggers: '그날 함께 기록된 트리거는 없어요',
        avg: (p, f) => `평균 통증 ${p}, 평균 피로 ${f}`,
        note: '기록된 내용을 정리한 것이며 원인을 뜻하지 않아요. 기록이 쌓일수록 더 정확해져요.',
        dismiss: '닫기',
    },
    en: {
        title: 'A quick look at your logs so far',
        peak: (d, p) => `Your highest pain day was ${d} (${p})`,
        noPeak: 'No pain has been logged yet',
        triggers: l => `Logged that day: ${l}`,
        noTriggers: 'No triggers were logged that day',
        avg: (p, f) => `Average pain ${p}, average fatigue ${f}`,
        note: 'This only summarizes what you logged and does not show a cause. It gets clearer as you log more.',
        dismiss: 'Close',
    },
    es: {
        title: 'Un vistazo a tus registros hasta ahora',
        peak: (d, p) => `Tu día con más dolor fue ${d} (${p})`,
        noPeak: 'Aún no se registró dolor',
        triggers: l => `Registrado ese día: ${l}`,
        noTriggers: 'No se registraron desencadenantes ese día',
        avg: (p, f) => `Dolor promedio ${p}, fatiga promedio ${f}`,
        note: 'Solo resume lo que registraste y no indica una causa. Será más claro con más registros.',
        dismiss: 'Cerrar',
    },
}

function shortDate(id: string): string {
    const [, m, d] = id.split('-')
    return `${Number(m)}/${Number(d)}`
}

export default function EarlyInsightCard() {
    const { user } = useAuth()
    const { t, language } = useLanguage()
    const { logs, loading } = useFirestoreLogs(user?.uid)
    const storageKey = `symply-early-insight-dismissed-${user?.uid ?? 'local'}`

    const [dismissed, setDismissed] = useState(() => {
        try {
            return localStorage.getItem(storageKey) === '1'
        } catch {
            return false
        }
    })

    const insight = useMemo(() => computeEarlyInsight(logs), [logs])
    const visible = !loading && !!insight && !dismissed

    useEffect(() => {
        if (visible) trackEvent('early_insight_viewed', { source: 'home_card' })
    }, [visible])

    if (!visible || !insight) return null

    const L = TEXT[(language as Lang) in TEXT ? (language as Lang) : 'en']

    const triggerNames = (insight.peak?.triggers ?? []).map(
        k => t.home[('trigger_' + k) as keyof typeof t.home] as string,
    )

    function handleDismiss() {
        setDismissed(true)
        try {
            localStorage.setItem(storageKey, '1')
        } catch {
            /* ignore */
        }
        trackEvent('early_insight_dismissed', { source: 'home_card' })
    }

    return (
        <Card style={{ marginBottom: '12px' }}>
            <p style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--color-text)', margin: '0 0 8px' }}>
                ✨ {L.title}
            </p>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text)', margin: '0 0 4px' }}>
                {insight.peak ? L.peak(shortDate(insight.peak.date), insight.peak.pain) : L.noPeak}
            </p>
            {insight.peak && (
                <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', margin: '0 0 4px' }}>
                    {triggerNames.length > 0 ? L.triggers(triggerNames.join(', ')) : L.noTriggers}
                </p>
            )}
            <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', margin: '0 0 8px' }}>
                {L.avg(insight.avgPain, insight.avgFatigue)}
            </p>
            <p style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', margin: '0 0 10px', lineHeight: 1.4 }}>
                {L.note}
            </p>
            <button
                onClick={handleDismiss}
                style={{
                    padding: '6px 12px', borderRadius: '16px', cursor: 'pointer',
                    border: '1px solid var(--color-border)', background: 'var(--color-surface-2)',
                    color: 'var(--color-text-muted)', fontSize: '0.78rem',
                }}
            >
                {L.dismiss}
            </button>
        </Card>
    )
}