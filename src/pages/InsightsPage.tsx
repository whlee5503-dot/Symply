import { useEffect, useMemo, useState } from 'react'
import { format, subDays, differenceInDays, parseISO } from 'date-fns'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useFirestoreLogs } from '../hooks/useFirestoreLogs'
import { useAuth } from '../contexts/AuthContext'
import Card from '../components/ui/Card'
import UpgradeModal from '../components/UpgradeModal'
import { useLanguage } from '../contexts/LanguageContext'
import { runAnalysis, type AIAnalysis, type CycleSummary } from '../lib/analyze'
import type { LogEntry } from '../types'

function getTriggerLabel(key: string, t: any): string {
  const map: Record<string, string> = {
    gluten:       t.home.trigger_gluten,
    dairy:        t.home.trigger_dairy,
    sugar:        t.home.trigger_sugar,
    caffeine:     t.home.trigger_caffeine,
    alcohol:      t.home.trigger_alcohol,
    stress:       t.home.trigger_stress,
    poor_sleep:   t.home.trigger_poor_sleep,
    overexertion: t.home.trigger_overexertion,
  }
  return map[key] ?? key.replace('_', ' ')
}

function getTriggerStats(logs: LogEntry[]) {
  const counts: Record<string, number> = {}
  logs.forEach(log => {
    Object.entries(log.triggers).forEach(([key, val]) => {
      if (val) counts[key] = (counts[key] ?? 0) + 1
    })
  })
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
}

function severityColor(s: string) {
  if (s === 'positive') return { bg: '#dcfce7', border: '#22c55e', text: '#15803d' }
  if (s === 'negative') return { bg: '#fee2e2', border: '#ef4444', text: '#b91c1c' }
  return { bg: 'var(--color-surface-2)', border: 'var(--color-border)', text: 'var(--color-text-muted)' }
}

/** logs에서 생리주기 요약 데이터 추출 */
function extractCycleSummary(logs: LogEntry[], conditions: string[]): CycleSummary | undefined {
  const hasCycleCondition =
    conditions.includes('PCOS') || conditions.includes('endometriosis')
  if (!hasCycleCondition) return undefined

  const menstruatingDays = logs
    .filter(l => l.cycle?.isMenstruating)
    .map(l => l.id)
    .sort()

  if (menstruatingDays.length === 0) {
    return { hasCycleData: false, menstruatingDays: [], preMenstrualDays: [], conditions }
  }

  // 생리 시작일 추출 (연속 날짜 중 첫 번째만)
  const cycleStarts: string[] = []
  for (let i = 0; i < menstruatingDays.length; i++) {
    if (i === 0) { cycleStarts.push(menstruatingDays[i]); continue }
    const prev = parseISO(menstruatingDays[i - 1])
    const curr = parseISO(menstruatingDays[i])
    if (differenceInDays(curr, prev) > 2) cycleStarts.push(menstruatingDays[i])
  }

  // 평균 주기 계산 (시작일 간격)
  let cycleLengthEstimate: number | undefined
  if (cycleStarts.length >= 2) {
    const gaps: number[] = []
    for (let i = 1; i < cycleStarts.length; i++) {
      gaps.push(differenceInDays(parseISO(cycleStarts[i]), parseISO(cycleStarts[i - 1])))
    }
    cycleLengthEstimate = Math.round(gaps.reduce((s, g) => s + g, 0) / gaps.length)
  }

  // 생리 2~5일 전 날짜 (premenstrual 구간)
  const preMenstrualDays: string[] = []
  cycleStarts.forEach(start => {
    const startDate = parseISO(start)
    for (let d = 2; d <= 5; d++) {
      const preDate = format(subDays(startDate, d), 'yyyy-MM-dd')
      preMenstrualDays.push(preDate)
    }
  })

  return {
    hasCycleData: true,
    menstruatingDays,
    cycleLengthEstimate,
    preMenstrualDays,
    conditions,
  }
}

export default function InsightsPage() {
  const { user, isPro } = useAuth()
  const { t, language } = useLanguage()
  const { logs: allLogs, loading } = useFirestoreLogs(user?.uid)
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null)
  const [aiLoading, setAiLoading]   = useState(false)
  const [aiError, setAiError]       = useState<string | null>(null)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [userConditions, setUserConditions] = useState<string[]>([])
  const [freeCallsUsed, setFreeCallsUsed] = useState<number | null>(null)

  // Firestore에서 user conditions + AI 호출 횟수 로드
  useEffect(() => {
    if (!user?.uid) return
    getDoc(doc(db, 'users', user.uid)).then(snap => {
      if (snap.exists()) {
        setUserConditions(snap.data().conditions ?? [])
        const thisMonth = new Date().toISOString().slice(0, 7) // YYYY-MM
        const savedMonth = snap.data().aiCallMonth
        const savedCount = snap.data().aiCallCount ?? 0
        setFreeCallsUsed(savedMonth === thisMonth ? savedCount : 0)
      }
    }).catch(() => {})
  }, [user?.uid])

  const logs      = Object.values(allLogs)
  const totalDays = logs.length

  const chartData = useMemo(() => {
    return Array.from({ length: 30 }).map((_, i) => {
      const date   = subDays(new Date(), 29 - i)
      const dateId = format(date, 'yyyy-MM-dd')
      const entry  = allLogs[dateId]
      return {
        date:    format(date, 'MM/dd'),
        pain:    entry?.pain    ?? null,
        fatigue: entry?.fatigue ?? null,
        sleep:   entry?.sleep   ?? null,
      }
    })
  }, [allLogs])

  async function handleAnalyze() {
    if (!isPro) {
      // 무료 사용자: 월 5회 제한 체크
      const thisMonth = new Date().toISOString().slice(0, 7)
      const used = freeCallsUsed ?? 0
      if (used >= 5) {
        setShowUpgrade(true)
        return
      }
      // 횟수 증가 먼저
      const userRef = doc(db, 'users', user!.uid)
      await setDoc(userRef, {
        aiCallCount: used + 1,
        aiCallMonth: thisMonth,
      }, { merge: true })
      setFreeCallsUsed(used + 1)
    }
    setAiLoading(true)
    setAiError(null)
    try {
      const cycleData = extractCycleSummary(logs, userConditions)
      const analysis = await runAnalysis(logs, user?.displayName ?? 'User', language, cycleData)
      setAiAnalysis(analysis)
    } catch (e) {
      setAiError(e instanceof Error ? e.message : 'Analysis failed')
    } finally {
      setAiLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '20px 16px', maxWidth: '480px', margin: '0 auto', textAlign: 'center' }}>
        <p style={{ color: 'var(--color-text-muted)', marginTop: '40px' }}>{language === 'ko' ? '인사이트 불러오는 중…' : language === 'es' ? 'Cargando insights…' : 'Loading insights…'}</p>
      </div>
    )
  }

  if (totalDays === 0) {
    return (
      <div style={{ padding: '20px 16px', maxWidth: '480px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '4px' }}>{t.insights.title}</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>{t.insights.subtitle}</p>
        <Card style={{ textAlign: 'center', padding: '40px 24px' }}>
          <p style={{ fontSize: '2rem', marginBottom: '12px' }}>📊</p>
          <p style={{ fontWeight: 600, color: 'var(--color-text)', marginBottom: '8px' }}>{t.insights.no_data_title}</p>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>{t.insights.no_data_body}</p>
        </Card>
      </div>
    )
  }

  const avgPain      = (logs.reduce((s, e) => s + e.pain, 0) / totalDays).toFixed(1)
  const avgFatigue   = (logs.reduce((s, e) => s + e.fatigue, 0) / totalDays).toFixed(1)
  const avgSleep     = (logs.reduce((s, e) => s + e.sleep, 0) / totalDays).toFixed(1)
  const goodDays     = logs.filter(e => (e.pain + e.fatigue) / 2 <= 2).length
  const triggerStats = getTriggerStats(logs)

  return (
    <div style={{ padding: '20px 16px 16px', maxWidth: '480px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '4px' }}>{t.insights.title}</h1>
      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '16px' }}>
        {t.insights.subtitle_days.replace('{n}', String(totalDays))}
      </p>

      {/* Summary stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginBottom: '16px' }}>
        {[
          { label: t.insights.avg_pain,    value: avgPain,                   emoji: '🩹', color: '#ef4444' },
          { label: t.insights.avg_fatigue, value: avgFatigue,                 emoji: '😴', color: '#f59e0b' },
          { label: t.insights.avg_sleep, value: `${avgSleep}${t.common.hours}`, emoji: '🌙', color: '#3b82f6' },
          { label: t.insights.good_days,   value: `${goodDays}/${totalDays}`, emoji: '✨', color: '#22c55e' },
        ].map(({ label, value, emoji, color }) => (
          <Card key={label} padding="14px">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.4rem' }}>{emoji}</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1.2rem', color }}>{value}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>{label}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* AI Analysis (Pro) */}
      <Card style={{ marginBottom: '16px' }}>
        {!isPro && !aiAnalysis ? (
          /* Pro 잠금 UI */
          <div style={{ textAlign: 'center' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, #7c3aed22, #a855f722)',
              border: '1px solid var(--color-primary)',
              fontSize: '0.72rem',
              color: 'var(--color-primary)',
              fontWeight: 700,
              marginBottom: '12px',
            }}>
              ✨ PRO FEATURE
            </div>
            <p style={{ fontSize: '1.5rem', marginBottom: '8px' }}>🤖</p>
            <p style={{ fontWeight: 600, color: 'var(--color-text)', marginBottom: '4px' }}>{t.insights.ai_title}</p>
            <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginBottom: '16px', lineHeight: 1.5 }}>
              {t.insights.ai_pro_subtitle}
            </p>
            <button
              onClick={() => setShowUpgrade(true)}
              style={{
                padding: '12px 28px',
                borderRadius: '12px',
                border: 'none',
                background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                color: '#fff',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
              }}
            >
              {t.insights.ai_unlock}
            </button>
          </div>
        ) : !aiAnalysis ? (
          /* Pro 유저 — 분석 전 */
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '1.5rem', marginBottom: '8px' }}>🤖</p>
            <p style={{ fontWeight: 600, color: 'var(--color-text)', marginBottom: '4px' }}>{t.insights.ai_title}</p>
            <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginBottom: '16px' }}>
              {t.insights.ai_subtitle}
            </p>
            {/* 무료 사용자 남은 횟수 표시 */}
            {!isPro && freeCallsUsed !== null && (
              <p style={{
                fontSize: '0.8rem',
                color: (freeCallsUsed ?? 0) >= 5 ? '#ef4444' : 'var(--color-text-muted)',
                marginBottom: '12px',
              }}>
                {(freeCallsUsed ?? 0) >= 5
                  ? t.insights.ai_free_limit_reached
                  : t.insights.ai_free_remaining.replace('{n}', String(5 - (freeCallsUsed ?? 0)))}
              </p>
            )}
            {aiError && (
              <p style={{ fontSize: '0.82rem', color: '#ef4444', marginBottom: '12px' }}>{aiError}</p>
            )}
            <button
              onClick={handleAnalyze}
              disabled={aiLoading || (!isPro && (freeCallsUsed ?? 0) >= 5)}
              style={{
                padding: '12px 24px',
                borderRadius: '12px',
                border: 'none',
                background: aiLoading
                  ? 'var(--color-border)'
                  : 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                color: '#fff',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: aiLoading ? 'not-allowed' : 'pointer',
              }}
            >
              {aiLoading ? t.insights.ai_analyzing : t.insights.ai_analyze}
            </button>
          </div>
        ) : (
          /* 분석 결과 */
          <div>
            {aiAnalysis.mock && (
              <div style={{
                display: 'inline-block',
                padding: '2px 10px',
                borderRadius: '12px',
                background: '#fef9c3',
                border: '1px solid #fbbf24',
                fontSize: '0.72rem',
                color: '#92400e',
                fontWeight: 600,
                marginBottom: '10px',
              }}>
                {t.insights.ai_demo_badge}
              </div>
            )}
            <div style={{
              padding: '12px',
              background: 'var(--color-primary-light)',
              borderRadius: '10px',
              marginBottom: '12px',
            }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-primary)', fontWeight: 600 }}>
                💜 {aiAnalysis.summary}
              </p>
            </div>
            {aiAnalysis.patterns?.map((p, i) => {
              const c = severityColor(p.severity)
              return (
                <div key={i} style={{
                  padding: '12px',
                  borderRadius: '10px',
                  border: `1px solid ${c.border}`,
                  background: c.bg,
                  marginBottom: '8px',
                }}>
                  <p style={{ fontWeight: 700, fontSize: '0.85rem', color: c.text, marginBottom: '4px' }}>
                    {p.title}
                  </p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{p.description}</p>
                </div>
              )
            })}
            {aiAnalysis.doctorPoints?.length > 0 && (
              <div style={{
                padding: '12px',
                borderRadius: '10px',
                background: 'var(--color-surface-2)',
                marginBottom: '8px',
              }}>
                <p style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--color-text)', marginBottom: '8px' }}>
                  {t.insights.ai_doctor}
                </p>
                {aiAnalysis.doctorPoints.map((pt, i) => (
                  <p key={i} style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '4px' }}>
                    • {pt}
                  </p>
                ))}
              </div>
            )}
            <button
              onClick={() => setAiAnalysis(null)}
              style={{
                marginTop: '8px',
                padding: '8px 16px',
                borderRadius: '8px',
                border: '1px solid var(--color-border)',
                background: 'none',
                color: 'var(--color-text-muted)',
                fontSize: '0.8rem',
                cursor: 'pointer',
              }}
            >
              {language === 'ko' ? '🔄 다시 분석' : language === 'es' ? '🔄 Reanalizar' : '🔄 Re-analyze'}
            </button>
          </div>
        )}
      </Card>

      {/* Pain & Fatigue chart */}
      <Card style={{ marginBottom: '16px' }}>
        <p style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-text)', marginBottom: '12px' }}>
          {t.insights.chart_pain_fatigue}
        </p>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }} interval={6} />
            <YAxis domain={[0, 10]} tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }} />
            <Tooltip contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px', fontSize: '0.8rem' }} />
            <Legend wrapperStyle={{ fontSize: '0.75rem' }} />
            <Line type="monotone" dataKey="pain"    name={language === 'ko' ? '통증' : language === 'es' ? 'Dolor' : 'pain'}    stroke="#ef4444" strokeWidth={2} dot={false} connectNulls />
            <Line type="monotone" dataKey="fatigue" name={language === 'ko' ? '피로' : language === 'es' ? 'Fatiga' : 'fatigue'} stroke="#f59e0b" strokeWidth={2} dot={false} connectNulls />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Sleep chart */}
      <Card style={{ marginBottom: '16px' }}>
        <p style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-text)', marginBottom: '12px' }}>
          {t.insights.chart_sleep}
        </p>
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }} interval={6} />
            <YAxis domain={[0, 12]} tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }} />
            <Tooltip contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px', fontSize: '0.8rem' }} />
            <Line type="monotone" dataKey="sleep" stroke="#3b82f6" strokeWidth={2} dot={false} connectNulls />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Top triggers */}
      {triggerStats.length > 0 && (
        <Card>
          <p style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-text)', marginBottom: '12px' }}>{t.insights.top_triggers}</p>
          {triggerStats.map(([key, count]) => (
            <div key={key} style={{ marginBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--color-text)' }}>{getTriggerLabel(key, t)}</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{count} {t.insights.days}</span>
              </div>
              <div style={{ height: '6px', borderRadius: '3px', background: 'var(--color-surface-2)' }}>
                <div style={{
                  height: '100%',
                  borderRadius: '3px',
                  background: 'linear-gradient(90deg, var(--color-primary), var(--color-secondary))',
                  width: `${(count / totalDays) * 100}%`,
                }} />
              </div>
            </div>
          ))}
        </Card>
      )}

      {/* Upgrade Modal */}
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
