// Fictional 30-day sample shown on the landing page.
// - No real user data, no AI call, nothing is sent anywhere.
// - Every number in the report is computed from the arrays below,
//   so the chart and the text always agree.
// Oldest day first. SLEEP[i] = hours slept on day i; "the next day" = day i + 1.
// Deliberately uneven, like real entries: spikes differ in height and spacing,
// one high-pain day does not follow a short night, and one short night is not followed by a spike.
const PAIN = [3, 2, 3, 3, 4, 7, 5, 3, 2, 3, 4, 3, 6, 5, 3, 5, 4, 3, 2, 6, 4, 3, 3, 7, 4, 2, 3, 4, 8, 5]
const FATIGUE = [4, 3, 4, 3, 5, 7, 6, 4, 3, 3, 4, 4, 7, 5, 4, 6, 5, 3, 3, 5, 4, 3, 4, 8, 6, 3, 3, 5, 8, 6]
const SLEEP = [7.5, 6.5, 7, 8, 5.5, 6.5, 7, 7.5, 6, 7, 8, 5, 6.5, 7, 5.5, 7.5, 7, 6.5, 8, 7, 6.5, 7.5, 5, 6, 7, 8, 6.5, 5.5, 7, 7.5]
const mean = (xs: number[]) => xs.reduce((sum, x) => sum + x, 0) / xs.length
const fmt = (n: number) => n.toFixed(1)

function computeStats() {
    const days = PAIN.length
    const shortNight = SLEEP.map(h => h < 6)
    const afterShort: number[] = []
    const otherDays: number[] = []
    for (let i = 1; i < days; i++) {
        if (shortNight[i - 1]) afterShort.push(i)
        else otherDays.push(i)
    }
    const highDays = PAIN.map((p, i) => (p >= 6 ? i : -1)).filter(i => i >= 0)
    return {
        days,
        shortNights: shortNight.filter(Boolean).length,
        nAfter: afterShort.length,
        painAfter: mean(afterShort.map(i => PAIN[i])),
        painOther: mean(otherDays.map(i => PAIN[i])),
        fatigueAfter: mean(afterShort.map(i => FATIGUE[i])),
        fatigueOther: mean(otherDays.map(i => FATIGUE[i])),
        highDays: highDays.length,
        highAfterShort: highDays.filter(i => i > 0 && shortNight[i - 1]).length,
        avgPain: mean(PAIN),
        avgFatigue: mean(FATIGUE),
    }
}

type Stats = ReturnType<typeof computeStats>
const S = computeStats()

// Chart geometry (SVG viewBox units)
const W = 600
const H = 200
const L = 28
const R = 8
const T = 8
const B = 30
const x = (i: number) => L + (i * (W - L - R)) / (PAIN.length - 1)
const y = (v: number) => T + ((10 - v) * (H - T - B)) / 10
const toPoints = (xs: number[]) => xs.map((v, i) => `${x(i)},${y(v)}`).join(' ')

interface SampleText {
    label: string
    title: string
    sub: string
    notice: string
    badge: string
    chartTitle: string
    pain: string
    fatigue: string
    shortNight: string
    axisStart: string
    axisEnd: string
    chartAria: string
    reportTitle: string
    summary: (s: Stats) => string
    patterns: (s: Stats) => { title: string; body: string }[]
    doctorTitle: string
    doctor: (s: Stats) => string[]
    caveat: string
    cta: string
}

const TEXT: Record<'en' | 'es' | 'ko', SampleText> = {
    en: {
        label: 'Sample report',
        title: 'See what the AI analysis looks like',
        sub: 'A 30-day example, in the same layout you get in the app.',
        notice: '⚠️ Fictional sample. This data is made up, belongs to no real person, and is not medical advice or a diagnosis.',
        badge: 'SAMPLE',
        chartTitle: '30 days of check-ins',
        pain: 'Pain',
        fatigue: 'Fatigue',
        shortNight: 'Night with under 6 h of sleep',
        axisStart: '30 days ago',
        axisEnd: 'Today',
        chartAria: 'Sample chart showing 30 days of pain and fatigue',
        reportTitle: 'AI pattern analysis (sample)',
        summary: s =>
            `Over ${s.days} days, average pain was ${fmt(s.avgPain)}/10 and average fatigue was ${fmt(s.avgFatigue)}/10. On average, pain was higher on the days after nights with less than 6 hours of sleep.`,
        patterns: s => [
            {
                title: 'Pain on the day after a short night',
                body: `${s.nAfter} days followed a night with under 6 hours of sleep. Average pain on those days was ${fmt(s.painAfter)}, compared with ${fmt(s.painOther)} on the other days.`,
            },
            {
                title: 'Fatigue on the day after a short night',
                body: `Average fatigue on those ${s.nAfter} days was ${fmt(s.fatigueAfter)}, compared with ${fmt(s.fatigueOther)} on the other days.`,
            },
            {
                title: 'Highest-pain days',
                body: `Pain was 6 or higher on ${s.highDays} of ${s.days} days. ${s.highAfterShort} of them came the day after a night with under 6 hours of sleep.`,
            },
        ],
        doctorTitle: 'Points to discuss with your doctor',
        doctor: s => [
            `Pain was 6 or higher on ${s.highDays} of the last ${s.days} days.`,
            `Sleep was under 6 hours on ${s.shortNights} nights; pain averaged ${fmt(s.painAfter)} the next day versus ${fmt(s.painOther)} otherwise.`,
            `Average pain ${fmt(s.avgPain)}/10 and average fatigue ${fmt(s.avgFatigue)}/10 over ${s.days} days.`,
        ],
        caveat: 'Based only on the recorded values. This is not a diagnosis, and a small number of entries cannot show a cause. Your own report is built from your own entries.',
        cta: 'Try it with your own data →',
    },
    es: {
        label: 'Informe de ejemplo',
        title: 'Así se ve el análisis con IA',
        sub: 'Un ejemplo de 30 días, con el mismo formato que recibes en la app.',
        notice: '⚠️ Ejemplo ficticio. Estos datos son inventados, no pertenecen a ninguna persona real y no son consejo médico ni un diagnóstico.',
        badge: 'EJEMPLO',
        chartTitle: '30 días de registros',
        pain: 'Dolor',
        fatigue: 'Fatiga',
        shortNight: 'Noche con menos de 6 h de sueño',
        axisStart: 'hace 30 días',
        axisEnd: 'hoy',
        chartAria: 'Gráfico de ejemplo con 30 días de dolor y fatiga',
        reportTitle: 'Análisis de patrones con IA (ejemplo)',
        summary: s =>
            `En ${s.days} días, el dolor promedio fue ${fmt(s.avgPain)}/10 y la fatiga promedio ${fmt(s.avgFatigue)}/10. En promedio, el dolor fue mayor los días después de noches con menos de 6 horas de sueño.`,
        patterns: s => [
            {
                title: 'Dolor al día siguiente de una noche corta',
                body: `${s.nAfter} días siguieron a una noche con menos de 6 horas de sueño. El dolor promedio esos días fue ${fmt(s.painAfter)}, frente a ${fmt(s.painOther)} en los demás días.`,
            },
            {
                title: 'Fatiga al día siguiente de una noche corta',
                body: `La fatiga promedio en esos ${s.nAfter} días fue ${fmt(s.fatigueAfter)}, frente a ${fmt(s.fatigueOther)} en los demás días.`,
            },
            {
                title: 'Días con más dolor',
                body: `El dolor fue 6 o más en ${s.highDays} de ${s.days} días. ${s.highAfterShort} de ellos llegaron al día siguiente de una noche con menos de 6 horas de sueño.`,
            },
        ],
        doctorTitle: 'Puntos para hablar con tu médico',
        doctor: s => [
            `El dolor fue 6 o más en ${s.highDays} de los últimos ${s.days} días.`,
            `Dormiste menos de 6 horas en ${s.shortNights} noches; el dolor promedió ${fmt(s.painAfter)} al día siguiente, frente a ${fmt(s.painOther)} en los demás días.`,
            `Dolor promedio ${fmt(s.avgPain)}/10 y fatiga promedio ${fmt(s.avgFatigue)}/10 en ${s.days} días.`,
        ],
        caveat: 'Basado solo en los valores registrados. No es un diagnóstico, y pocos registros no permiten saber la causa. Tu informe se crea con tus propios registros.',
        cta: 'Pruébalo con tus datos →',
    },
    ko: {
        label: '샘플 보고서',
        title: 'AI 분석은 이렇게 보입니다',
        sub: '30일치 예시이며, 앱에서 받는 화면과 같은 구성입니다.',
        notice: '⚠️ 가상의 샘플입니다. 이 데이터는 지어낸 것이며 실제 사람의 기록이 아니고, 의료 조언이나 진단이 아닙니다.',
        badge: '샘플',
        chartTitle: '30일 체크인 기록',
        pain: '통증',
        fatigue: '피로',
        shortNight: '수면 6시간 미만인 밤',
        axisStart: '30일 전',
        axisEnd: '오늘',
        chartAria: '30일간의 통증과 피로를 보여 주는 샘플 그래프',
        reportTitle: 'AI 패턴 분석 (샘플)',
        summary: s =>
            `${s.days}일 동안 평균 통증은 ${fmt(s.avgPain)}/10, 평균 피로는 ${fmt(s.avgFatigue)}/10이었습니다. 평균적으로 통증은 수면이 6시간 미만인 밤의 다음 날에 더 높았습니다.`,
        patterns: s => [
            {
                title: '수면이 짧았던 다음 날의 통증',
                body: `${s.nAfter}일이 수면 6시간 미만인 밤의 다음 날이었습니다. 그날들의 평균 통증은 ${fmt(s.painAfter)}였고, 나머지 날의 평균은 ${fmt(s.painOther)}였습니다.`,
            },
            {
                title: '수면이 짧았던 다음 날의 피로',
                body: `그 ${s.nAfter}일의 평균 피로는 ${fmt(s.fatigueAfter)}였고, 나머지 날의 평균은 ${fmt(s.fatigueOther)}였습니다.`,
            },
            {
                title: '통증이 가장 높았던 날',
                body: `통증이 6 이상인 날이 ${s.days}일 중 ${s.highDays}일이었습니다. 그중 ${s.highAfterShort}일이 수면 6시간 미만인 밤의 다음 날이었습니다.`,
            },
        ],
        doctorTitle: '진료 때 이야기해 볼 점',
        doctor: s => [
            `최근 ${s.days}일 중 통증이 6 이상인 날이 ${s.highDays}일이었습니다.`,
            `수면이 6시간 미만인 밤이 ${s.shortNights}번 있었고, 그다음 날 평균 통증은 ${fmt(s.painAfter)}, 나머지 날은 ${fmt(s.painOther)}였습니다.`,
            `${s.days}일 동안 평균 통증 ${fmt(s.avgPain)}/10, 평균 피로 ${fmt(s.avgFatigue)}/10이었습니다.`,
        ],
        caveat: '기록된 값만 바탕으로 한 설명입니다. 진단이 아니며, 적은 기록으로는 원인을 알 수 없습니다. 실제 보고서는 내 기록으로 만들어집니다.',
        cta: '내 기록으로 해 보기 →',
    },
}

const card: React.CSSProperties = {
    background: '#fff',
    border: '1px solid #ede9fe',
    borderRadius: '16px',
    padding: '20px',
    marginBottom: '16px',
    boxShadow: '0 2px 8px rgba(124,58,237,0.06)',
}

export default function LandingSample({ language, onCta }: { language: string; onCta: () => void }) {
    const t = TEXT[language as keyof typeof TEXT] ?? TEXT.en
    const patterns = t.patterns(S)

    return (
        <section style={{ background: '#f5f3ff', padding: '56px 24px' }}>
            <div style={{ maxWidth: '680px', margin: '0 auto' }}>
                <p style={{ textAlign: 'center', fontSize: '0.75rem', fontWeight: 700, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
                    {t.label}
                </p>
                <h2 style={{ textAlign: 'center', fontSize: '1.6rem', fontWeight: 800, color: '#1e1b4b', marginBottom: '8px' }}>
                    {t.title}
                </h2>
                <p style={{ textAlign: 'center', color: '#6b7280', fontSize: '0.9rem', marginBottom: '20px' }}>{t.sub}</p>

                <div style={{ padding: '12px 16px', borderRadius: '12px', background: '#fef9c3', border: '1px solid #fbbf24', color: '#92400e', fontSize: '0.82rem', fontWeight: 600, lineHeight: 1.5, marginBottom: '16px' }}>
                    {t.notice}
                </div>

                {/* 30-day chart */}
                <div style={card}>
                    <p style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1e1b4b', marginBottom: '12px' }}>{t.chartTitle}</p>
                    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t.chartAria} style={{ width: '100%', height: 'auto', display: 'block' }}>
                        {[0, 5, 10].map(v => (
                            <g key={v}>
                                <line x1={L} x2={W - R} y1={y(v)} y2={y(v)} stroke="#ede9fe" />
                                <text x={L - 6} y={y(v) + 4} fontSize="11" textAnchor="end" fill="#9ca3af">{v}</text>
                            </g>
                        ))}
                        <polyline points={toPoints(FATIGUE)} fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinejoin="round" />
                        <polyline points={toPoints(PAIN)} fill="none" stroke="#ef4444" strokeWidth="2" strokeLinejoin="round" />
                        {SLEEP.map((h, i) => (h < 6 ? <circle key={i} cx={x(i)} cy={H - 20} r={4} fill="#3b82f6" /> : null))}
                        <text x={L} y={H - 4} fontSize="11" fill="#9ca3af">{t.axisStart}</text>
                        <text x={W - R} y={H - 4} fontSize="11" textAnchor="end" fill="#9ca3af">{t.axisEnd}</text>
                    </svg>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', marginTop: '10px', fontSize: '0.78rem', color: '#6b7280' }}>
                        <span><span style={{ color: '#ef4444' }}>●</span> {t.pain}</span>
                        <span><span style={{ color: '#f59e0b' }}>●</span> {t.fatigue}</span>
                        <span><span style={{ color: '#3b82f6' }}>●</span> {t.shortNight}</span>
                    </div>
                </div>

                {/* AI report */}
                <div style={card}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1e1b4b' }}>🤖 {t.reportTitle}</span>
                        <span style={{ padding: '2px 8px', borderRadius: '10px', fontSize: '0.68rem', fontWeight: 700, color: '#92400e', background: '#fef9c3', border: '1px solid #fbbf24' }}>
                            {t.badge}
                        </span>
                    </div>

                    <div style={{ padding: '12px', background: '#f5f3ff', borderRadius: '10px', marginBottom: '12px' }}>
                        <p style={{ fontSize: '0.85rem', color: '#6d28d9', fontWeight: 600, margin: 0, lineHeight: 1.6 }}>💜 {t.summary(S)}</p>
                    </div>

                    {patterns.map((p, i) => (
                        <div key={i} style={{ padding: '12px', borderRadius: '10px', background: '#faf5ff', border: '1px solid #ede9fe', borderLeft: `4px solid ${i < 2 ? '#ef4444' : '#7c3aed'}`, marginBottom: '8px' }}>
                            <p style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1e1b4b', margin: '0 0 4px' }}>{p.title}</p>
                            <p style={{ fontSize: '0.8rem', color: '#6b7280', lineHeight: 1.6, margin: 0 }}>{p.body}</p>
                        </div>
                    ))}

                    <div style={{ padding: '12px', borderRadius: '10px', background: '#f3f4f6', marginTop: '4px' }}>
                        <p style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1e1b4b', margin: '0 0 8px' }}>{t.doctorTitle}</p>
                        {t.doctor(S).map((pt, i) => (
                            <p key={i} style={{ fontSize: '0.8rem', color: '#6b7280', lineHeight: 1.6, margin: '0 0 4px' }}>• {pt}</p>
                        ))}
                    </div>

                    <p style={{ fontSize: '0.72rem', color: '#9ca3af', lineHeight: 1.6, marginTop: '12px', marginBottom: 0 }}>{t.caveat}</p>
                </div>

                <div style={{ textAlign: 'center', marginTop: '24px' }}>
                    <button
                        onClick={onCta}
                        style={{ padding: '14px 32px', borderRadius: '14px', border: 'none', background: 'linear-gradient(135deg, #7c3aed, #a855f7)', color: '#fff', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', boxShadow: '0 4px 20px rgba(124,58,237,0.3)' }}
                    >
                        {t.cta}
                    </button>
                </div>
            </div>
        </section>
    )
}