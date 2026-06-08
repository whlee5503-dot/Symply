import { useMemo, useState } from 'react'
import { format, subDays } from 'date-fns'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useFirestoreLogs } from '../hooks/useFirestoreLogs'
import { useAuth } from '../contexts/AuthContext'
import Card from '../components/ui/Card'
import { runAnalysis, type AIAnalysis } from '../lib/analyze'
import type { LogEntry } from '../types'

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

// 실제 데이터에서 패턴을 계산해 Mock 플레어 예측 인사이트를 생성
function getMockFlareInsights(logs: LogEntry[]) {
  if (logs.length < 7) return null

  const sorted = [...logs].sort((a, b) => a.id.localeCompare(b.id))
  const insights: { icon: string; title: string; body: string; tag: string }[] = []

  // 패턴 1: 수면 부족 → 다음 날 통증 상관
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
        title: 'Sleep–Pain Pattern',
        body: `On days following less than 6 hours of sleep, your pain was ~${pct}% higher than average. Prioritising 7–8 hours may help reduce flare risk.`,
        tag: 'Sleep',
      })
    }
  }

  // 패턴 2: 트리거 + 통증 상관
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
          title: `${key.charAt(0).toUpperCase() + key.slice(1)} May Be a Trigger`,
          body: `On days you logged ${key}, your average pain was ${avgWith.toFixed(1)} vs ${avgWithout.toFixed(1)} on days without it. Consider tracking this correlation with your doctor.`,
          tag: 'Trigger',
        })
        break // 트리거 하나만 표시
      }
    }
  }

  // 패턴 3: 활동량 vs 피로
  const highActivity = logs.filter(l => l.activity === 'high')
  const lowActivity  = logs.filter(l => l.activity === 'low')
  if (highActivity.length >= 3 && lowActivity.length >= 3) {
    const avgHighFatigue = highActivity.reduce((s, l) => s + l.fatigue, 0) / highActivity.length
    const avgLowFatigue  = lowActivity.reduce((s, l) => s + l.fatigue, 0) / lowActivity.length
    if (avgHighFatigue > avgLowFatigue + 2) {
      insights.push({
        icon: '🏃',
        title: 'Post-Exertion Fatigue',
        body: `High-activity days correlate with fatigue ${avgHighFatigue.toFixed(1)} vs ${avgLowFatigue.toFixed(1)} on rest days. This pattern is common in fibromyalgia — pacing strategies may help.`,
        tag: 'Activity',
      })
    }
  }

  return insights.length > 0 ? insights : null
}

export default function InsightsPage() {
  const { user } = useAuth()
  const { logs: allLogs, loading } = useFirestoreLogs(user?.uid)
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null)
  const [aiLoading, setAiLoading]   = useState(false)
  const [aiError, setAiError]       = useState<string | null>(null)

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
    setAiLoading(true)
    setAiError(null)
    try {
      const analysis = await runAnalysis(logs, 'User')
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
        <p style={{ color: 'var(--color-text-muted)', marginTop: '40px' }}>Loading insights…</p>
      </div>
    )
  }

  if (totalDays === 0) {
    return (
      <div style={{ padding: '20px 16px', maxWidth: '480px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '4px' }}>Insights</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>Your patterns will appear here.</p>
        <Card style={{ textAlign: 'center', padding: '40px 24px' }}>
          <p style={{ fontSize: '2rem', marginBottom: '12px' }}>📊</p>
          <p style={{ fontWeight: 600, color: 'var(--color-text)', marginBottom: '8px' }}>Not enough data yet</p>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Log at least 7 days to start seeing patterns.</p>
        </Card>
      </div>
    )
  }

  const avgPain      = (logs.reduce((s, e) => s + e.pain, 0) / totalDays).toFixed(1)
  const avgFatigue   = (logs.reduce((s, e) => s + e.fatigue, 0) / totalDays).toFixed(1)
  const avgSleep     = (logs.reduce((s, e) => s + e.sleep, 0) / totalDays).toFixed(1)
  const goodDays     = logs.filter(e => (e.pain + e.fatigue) / 2 <= 2).length
  const triggerStats = getTriggerStats(logs)
  const flareInsights = getMockFlareInsights(logs)

  return (
    <div style={{ padding: '20px 16px 16px', maxWidth: '480px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '4px' }}>Insights</h1>
      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '16px' }}>
        Based on {totalDays} days of data
      </p>

      {/* Summary stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginBottom: '16px' }}>
        {[
          { label: 'Avg Pain',    value: avgPain,                   emoji: '🩹', color: '#ef4444' },
          { label: 'Avg Fatigue', value: avgFatigue,                 emoji: '😴', color: '#f59e0b' },
          { label: 'Avg Sleep',   value: `${avgSleep}h`,             emoji: '🌙', color: '#3b82f6' },
          { label: 'Good days',   value: `${goodDays}/${totalDays}`, emoji: '✨', color: '#22c55e' },
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

      {/* Mock Flare Prediction Insights */}
      {flareInsights && flareInsights.length > 0 && (
        <Card style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <span style={{ fontSize: '1.2rem' }}>🔮</span>
            <p style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-text)' }}>
              Pattern Insights
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
              Based on your data
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

      {/* AI Analysis */}
      <Card style={{ marginBottom: '16px' }}>
        {!aiAnalysis ? (
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '1.5rem', marginBottom: '8px' }}>🤖</p>
            <p style={{ fontWeight: 600, color: 'var(--color-text)', marginBottom: '4px' }}>AI Pattern Analysis</p>
            <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginBottom: '16px' }}>
              Claude AI will analyze your symptom data and identify personalized patterns.
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
              {aiLoading ? '🔄 Analyzing...' : '✨ Analyze My Patterns'}
            </button>
          </div>
        ) : (
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
              🔄 Re-analyze
            </button>
          </div>
        )}
      </Card>

      {/* Pain & Fatigue chart */}
      <Card style={{ marginBottom: '16px' }}>
        <p style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-text)', marginBottom: '12px' }}>
          Pain & Fatigue — Last 30 Days
        </p>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }} interval={6} />
            <YAxis domain={[0, 10]} tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }} />
            <Tooltip contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px', fontSize: '0.8rem' }} />
            <Legend wrapperStyle={{ fontSize: '0.75rem' }} />
            <Line type="monotone" dataKey="pain"    stroke="#ef4444" strokeWidth={2} dot={false} connectNulls />
            <Line type="monotone" dataKey="fatigue" stroke="#f59e0b" strokeWidth={2} dot={false} connectNulls />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Sleep chart */}
      <Card style={{ marginBottom: '16px' }}>
        <p style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-text)', marginBottom: '12px' }}>
          Sleep — Last 30 Days
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
          <p style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-text)', marginBottom: '12px' }}>Top Triggers</p>
          {triggerStats.map(([key, count]) => (
            <div key={key} style={{ marginBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--color-text)', textTransform: 'capitalize' }}>{key.replace('_', ' ')}</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{count} days</span>
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
    </div>
  )
}
