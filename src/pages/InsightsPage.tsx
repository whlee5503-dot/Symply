import { useMemo } from 'react'
import { format, subDays } from 'date-fns'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { getLogs } from '../lib/storage'
import Card from '../components/ui/Card'
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

export default function InsightsPage() {
  const allLogs = getLogs()

  const chartData = useMemo(() => {
    return Array.from({ length: 30 }).map((_, i) => {
      const date = subDays(new Date(), 29 - i)
      const dateId = format(date, 'yyyy-MM-dd')
      const entry = allLogs[dateId]
      return {
        date: format(date, 'MM/dd'),
        pain: entry?.pain ?? null,
        fatigue: entry?.fatigue ?? null,
        sleep: entry?.sleep ?? null,
      }
    })
  }, [])

  const logs = Object.values(allLogs)
  const totalDays = logs.length

  if (totalDays === 0) {
    return (
      <div style={{ padding: '20px 16px', maxWidth: '480px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '4px' }}>
          Insights
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>
          Your patterns will appear here.
        </p>
        <Card style={{ textAlign: 'center', padding: '40px 24px' }}>
          <p style={{ fontSize: '2rem', marginBottom: '12px' }}>📊</p>
          <p style={{ fontWeight: 600, color: 'var(--color-text)', marginBottom: '8px' }}>
            Not enough data yet
          </p>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
            Log at least 7 days to start seeing patterns.
          </p>
        </Card>
      </div>
    )
  }

  const avgPain    = (logs.reduce((s, e) => s + e.pain, 0) / totalDays).toFixed(1)
  const avgFatigue = (logs.reduce((s, e) => s + e.fatigue, 0) / totalDays).toFixed(1)
  const avgSleep   = (logs.reduce((s, e) => s + e.sleep, 0) / totalDays).toFixed(1)
  const goodDays   = logs.filter(e => (e.pain + e.fatigue) / 2 <= 2).length
  const triggerStats = getTriggerStats(logs)

  return (
    <div style={{ padding: '20px 16px 16px', maxWidth: '480px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '4px' }}>
        Insights
      </h1>
      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '16px' }}>
        Based on {totalDays} days of data
      </p>

      {/* Summary stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginBottom: '16px' }}>
        {[
          { label: 'Avg Pain',    value: avgPain,    emoji: '🩹', color: '#ef4444' },
          { label: 'Avg Fatigue', value: avgFatigue,  emoji: '😴', color: '#f59e0b' },
          { label: 'Avg Sleep',   value: `${avgSleep}h`, emoji: '🌙', color: '#3b82f6' },
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

      {/* Pain & Fatigue trend chart */}
      <Card style={{ marginBottom: '16px' }}>
        <p style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-text)', marginBottom: '12px' }}>
          Pain & Fatigue — Last 30 Days
        </p>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }}
              interval={6}
            />
            <YAxis domain={[0, 10]} tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }} />
            <Tooltip
              contentStyle={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                fontSize: '0.8rem',
              }}
            />
            <Legend wrapperStyle={{ fontSize: '0.75rem' }} />
            <Line type="monotone" dataKey="pain"    stroke="#ef4444" strokeWidth={2} dot={false} connectNulls />
            <Line type="monotone" dataKey="fatigue" stroke="#f59e0b" strokeWidth={2} dot={false} connectNulls />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Sleep trend chart */}
      <Card style={{ marginBottom: '16px' }}>
        <p style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-text)', marginBottom: '12px' }}>
          Sleep — Last 30 Days
        </p>
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }}
              interval={6}
            />
            <YAxis domain={[0, 12]} tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }} />
            <Tooltip
              contentStyle={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                fontSize: '0.8rem',
              }}
            />
            <Line type="monotone" dataKey="sleep" stroke="#3b82f6" strokeWidth={2} dot={false} connectNulls />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Top triggers */}
      {triggerStats.length > 0 && (
        <Card>
          <p style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-text)', marginBottom: '12px' }}>
            Top Triggers
          </p>
          {triggerStats.map(([key, count]) => (
            <div key={key} style={{ marginBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--color-text)', textTransform: 'capitalize' }}>
                  {key.replace('_', ' ')}
                </span>
                <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                  {count} days
                </span>
              </div>
              <div style={{ height: '6px', borderRadius: '3px', background: 'var(--color-surface-2)' }}>
                <div style={{
                  height: '100%',
                  borderRadius: '3px',
                  background: 'linear-gradient(90deg, var(--color-primary), var(--color-secondary))',
                  width: `${(count / totalDays) * 100}%`,
                  transition: 'width 0.4s ease',
                }} />
              </div>
            </div>
          ))}
        </Card>
      )}
    </div>
  )
}
