import { useMemo, useState } from 'react'
import { format, subDays } from 'date-fns'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useFirestoreLogs } from '../hooks/useFirestoreLogs'
import { useAuth } from '../contexts/AuthContext'
import Card from '../components/ui/Card'
import UpgradeModal from '../components/UpgradeModal'
import { useLanguage } from '../contexts/LanguageContext'
import { runAnalysis, type AIAnalysis } from '../lib/analyze'
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

function getMockFlareInsights(logs: LogEntry[], language = 'en') {
  if (logs.length < 7) return null

  const sorted = [...logs].sort((a, b) => a.id.localeCompare(b.id))
  const insights: { icon: string; title: string; body: string; tag: string }[] = []

  const sleepPainPairs = sorted.slice(0, -1).map((entry, i) => ({
    sleep: entry.sleep,
    nextPain: sorted[i + 1].pain,
  }))
  const lowSleepPain = sleepPainPairs.filter(p => p.sleep < 6)
  const normalSleepPain = sleepPainPairs.filter(p => p.sleep >= 6)
  if (lowSleepPain.length >= 3 && normalSleepPain.length >= 3) {
    const avgLow    = lowSleepPain.reduce((s, p) => s + p.nextPain, 0) / lowSleepPain.length
    const avgNormal = normalSleepPain.reduce((s, p) => s + p.nextPain, 0) / normalSleepPain.length
    if (avgLow > avgNormal + 1) {
      const pct = Math.round(((avgLow - avgNormal) / Math.max(avgNormal, 1)) * 100)
      insights.push({
        icon: '🌙',
        title: language === 'ko' ? '수면–통증 패턴' : language === 'es' ? 'Patrón Sueño–Dolor' : 'Sleep–Pain Pattern',
        body: language === 'ko' ? `수면 6시간 미만인 날 이후 통증이 평균 ~${pct}% 높았습니다. 7~8시간 수면이 플레어 위험을 줄이는 데 도움이 될 수 있습니다.` : `On days following less than 6 hours of sleep, your pain was ~${pct}% higher than average. Prioritising 7–8 hours may help reduce flare risk.`,
        tag: language === 'ko' ? '수면' : language === 'es' ? 'Sueño' : 'Sleep',
      })
    }
  }

  const triggerKeys = ['gluten', 'dairy', 'sugar', 'caffeine', 'alcohol', 'stress'] as const
  for (const key of triggerKeys) {
    const withTrigger    = logs.filter(l => l.triggers[key as keyof typeof l.triggers])
    const withoutTrigger = logs.filter(l => !l.triggers[key as keyof typeof l.triggers])
    if (withTrigger.length >= 3 && withoutTrigger.length >= 3) {
      const avgWith    = withTrigger.reduce((s, l) => s + l.pain, 0) / withTrigger.length
      const avgWithout = withoutTrigger.reduce((s, l) => s + l.pain, 0) / withoutTrigger.length
      if (avgWith > avgWithout + 1.5) {
        insights.push({
          icon: '⚠️',
          title: language === 'ko' ? `${key} 트리거 가능성` : language === 'es' ? `${key} puede ser un desencadenante` : `${key.charAt(0).toUpperCase() + key.slice(1)} May Be a Trigger`,`
          body: language === 'ko' ? `${key} 기록일의 평균 통증은 ${avgWith.toFixed(1)}으로, 미기록일 ${avgWithout.toFixed(1)}보다 높았습니다. 이 상관관계를 의사와 상담해보세요.` : `On days you logged ${key}, your average pain was ${avgWith.toFixed(1)} vs ${avgWithout.toFixed(1)} on days without it. Consider tracking this correlation with your doctor.`,
          tag: language === 'ko' ? '트리거' : language === 'es' ? 'Desencadenante' : 'Trigger',
        })
        break
      }
    }
  }

  const highActivity = logs.filter(l => l.activity === 'high')
  const lowActivity  = logs.filter(l => l.activity === 'low')
  if (highActivity.length >= 3 && lowActivity.length >= 3) {
    const avgHighFatigue = highActivity.reduce((s, l) => s + l.fatigue, 0) / highActivity.length
    const avgLowFatigue  = lowActivity.reduce((s, l) => s + l.fatigue, 0) / lowActivity.length
    if (avgHighFatigue > avgLowFatigue + 2) {
      insights.push({
        icon: '🏃',
        title: language === 'ko' ? '활동 후 피로' : language === 'es' ? 'Fatiga Post-Esfuerzo' : 'Post-Exertion Fatigue',
        body: language === 'ko' ? `고활동일의 피로는 ${avgHighFatigue.toFixed(1)}으로 저활동일 ${avgLowFatigue.toFixed(1)}보다 높았습니다. 섬유근통에서 흔한 패턴으로, 페이싱 전략이 도움이 될 수 있습니다.` : `High-activity days correlate with fatigue ${avgHighFatigue.toFixed(1)} vs ${avgLowFatigue.toFixed(1)} on rest days. This pattern is common in fibromyalgia — pacing strategies may help.`,
        tag: language === 'ko' ? '활동' : language === 'es' ? 'Actividad' : 'Activity',
      })
    }
  }

  return insights.length > 0 ? insights : null
}

export default function InsightsPage() {
  const { user, isPro } = useAuth()
  const { t, language } = useLanguage()
  const { logs: allLogs, loading } = useFirestoreLogs(user?.uid)
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null)
  const [aiLoading, setAiLoading]   = useState(false)
  const [aiError, setAiError]       = useState<string | null>(null)
  const [showUpgrade, setShowUpgrade] = useState(false)

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
      setShowUpgrade(true)
      return
    }
    setAiLoading(true)
    setAiError(null)
    try {
      const analysis = await runAnalysis(recentLogs, user.displayName ?? 'User', language)
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
  const flareInsights = getMockFlareInsights(logs, language)

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

      {/* Pattern Insights (Free — 맛보기) */}
      {flareInsights && flareInsights.length > 0 && (
        <Card style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <span style={{ fontSize: '1.2rem' }}>🔮</span>
            <p style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-text)' }}>
              {t.insights.pattern_insights}
            </p>
            <span style={{
              marginLeft: 'auto',
              padding: '2px 8px',
              borderRadius: '10px',
              background: '#fef9c3',
              border: '1px solid #fbbf24',
              fontSize: '0.68rem',
              color: '#92400e',
              fontWeight: 600,
            }}>
              {t.insights.based_on_data}
            </span>
          </div>
          {flareInsights.map((insight, i) => (
            <div key={i} style={{
              padding: '12px',
              borderRadius: '10px',
              border: '1px solid var(--color-border)',
              background: 'var(--color-surface-2)',
              marginBottom: i < flareInsights.length - 1 ? '8px' : 0,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <span>{insight.icon}</span>
                <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--color-text)' }}>
                  {insight.title}
                </span>
                <span style={{
                  marginLeft: 'auto',
                  padding: '1px 6px',
                  borderRadius: '8px',
                  background: 'var(--color-primary-light)',
                  fontSize: '0.68rem',
                  color: 'var(--color-primary)',
                  fontWeight: 600,
                }}>
                  {insight.tag}
                </span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                {insight.body}
              </p>
            </div>
          ))}
        </Card>
      )}

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
            {aiError && (
              <p style={{ fontSize: '0.82rem', color: '#ef4444', marginBottom: '12px' }}>{aiError}</p>
            )}
            <button
              onClick={handleAnalyze}
              disabled={aiLoading}
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
                🧪 Demo Analysis — Add credits for personalized AI insights
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
                  🩺 Tell your doctor:
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
