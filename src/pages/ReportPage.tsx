import { useState } from 'react'
import { format, subDays } from 'date-fns'
import jsPDF from 'jspdf'
import { useFirestoreLogs } from '../hooks/useFirestoreLogs'
import { useAuth } from '../contexts/AuthContext'
import Card from '../components/ui/Card'
import UpgradeModal from '../components/UpgradeModal'
import { useLanguage } from '../contexts/LanguageContext'
import type { LogEntry } from '../types'
import { MOOD_EMOJIS } from '../types'

function getReportLogs(logs: Record<string, LogEntry>, days: number): LogEntry[] {
  return Array.from({ length: days })
    .map((_, i) => {
      const dateId = format(subDays(new Date(), i), 'yyyy-MM-dd')
      return logs[dateId]
    })
    .filter(Boolean)
    .reverse()
}

function getSeverityLabel(avg: number): string {
  if (avg <= 2) return 'Mild'
  if (avg <= 4) return 'Moderate'
  if (avg <= 6) return 'Severe'
  return 'Very Severe'
}

export default function ReportPage() {
  const { user, isPro } = useAuth()
  const { t } = useLanguage()
  const { logs: allLogs, loading } = useFirestoreLogs(user?.uid)
  const [period, setPeriod]         = useState<30 | 60 | 90>(30)
  const [generating, setGenerating] = useState(false)
  const [showUpgrade, setShowUpgrade] = useState(false)

  const logs      = getReportLogs(allLogs, period)
  const totalDays = logs.length

  const avgPain    = totalDays > 0 ? (logs.reduce((s, e) => s + e.pain, 0) / totalDays) : 0
  const avgFatigue = totalDays > 0 ? (logs.reduce((s, e) => s + e.fatigue, 0) / totalDays) : 0
  const avgSleep   = totalDays > 0 ? (logs.reduce((s, e) => s + e.sleep, 0) / totalDays) : 0
  const flareDays  = logs.filter(e => (e.pain + e.fatigue) / 2 >= 6).length
  const goodDays   = logs.filter(e => (e.pain + e.fatigue) / 2 <= 2).length

  const triggerCounts: Record<string, number> = {}
  logs.forEach(e => {
    Object.entries(e.triggers).forEach(([k, v]) => {
      if (v) triggerCounts[k] = (triggerCounts[k] ?? 0) + 1
    })
  })
  const topTriggers = Object.entries(triggerCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  async function generatePDF() {
    if (!isPro) {
      setShowUpgrade(true)
      return
    }
    setGenerating(true)
    try {
      const pdf      = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const pageW    = 210
      const margin   = 20
      const contentW = pageW - margin * 2
      let y = margin

      pdf.setFillColor(124, 58, 237)
      pdf.rect(0, 0, pageW, 40, 'F')
      pdf.setTextColor(255, 255, 255)
      pdf.setFontSize(22)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Symply', margin, 18)
      pdf.setFontSize(11)
      pdf.setFont('helvetica', 'normal')
      pdf.text('Chronic Symptom Tracking Report', margin, 27)
      pdf.setFontSize(9)
      pdf.text(`Generated: ${format(new Date(), 'MMMM d, yyyy')}`, margin, 35)
      pdf.text(`Period: Last ${period} days  |  Days logged: ${totalDays}`, pageW - margin, 35, { align: 'right' })

      y = 52

      pdf.setFillColor(254, 243, 199)
      pdf.roundedRect(margin, y, contentW, 10, 2, 2, 'F')
      pdf.setTextColor(146, 64, 14)
      pdf.setFontSize(8)
      pdf.text('This report is for informational purposes only and does not constitute medical advice.', margin + 4, y + 6.5)
      y += 16

      if (totalDays === 0) {
        pdf.setTextColor(100, 100, 100)
        pdf.setFontSize(12)
        pdf.text('No data logged in this period.', margin, y)
        pdf.save(`symply-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`)
        return
      }

      pdf.setTextColor(124, 58, 237)
      pdf.setFontSize(13)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Summary', margin, y)
      y += 2
      pdf.setDrawColor(124, 58, 237)
      pdf.setLineWidth(0.5)
      pdf.line(margin, y, margin + contentW, y)
      y += 6

      const stats = [
        { label: 'Avg Pain',    value: avgPain.toFixed(1),    sub: getSeverityLabel(avgPain) },
        { label: 'Avg Fatigue', value: avgFatigue.toFixed(1), sub: getSeverityLabel(avgFatigue) },
        { label: 'Avg Sleep',   value: `${avgSleep.toFixed(1)}h`, sub: 'per night' },
        { label: 'Flare Days',  value: String(flareDays),     sub: `${((flareDays / totalDays) * 100).toFixed(0)}% of days` },
        { label: 'Good Days',   value: String(goodDays),      sub: `${((goodDays / totalDays) * 100).toFixed(0)}% of days` },
        { label: 'Days Logged', value: String(totalDays),     sub: `of last ${period}` },
      ]

      const colW = contentW / 3
      const rowH = 22
      stats.forEach((s, i) => {
        const col = i % 3
        const row = Math.floor(i / 3)
        const x   = margin + col * colW
        const cy  = y + row * rowH
        pdf.setFillColor(245, 243, 255)
        pdf.roundedRect(x + 1, cy, colW - 2, rowH - 2, 3, 3, 'F')
        pdf.setTextColor(124, 58, 237)
        pdf.setFontSize(16)
        pdf.setFont('helvetica', 'bold')
        pdf.text(s.value, x + colW / 2, cy + 9, { align: 'center' })
        pdf.setTextColor(80, 80, 80)
        pdf.setFontSize(8)
        pdf.setFont('helvetica', 'normal')
        pdf.text(s.label, x + colW / 2, cy + 14, { align: 'center' })
        pdf.setTextColor(150, 150, 150)
        pdf.setFontSize(7)
        pdf.text(s.sub, x + colW / 2, cy + 18, { align: 'center' })
      })
      y += rowH * 2 + 8

      if (topTriggers.length > 0) {
        pdf.setTextColor(124, 58, 237)
        pdf.setFontSize(13)
        pdf.setFont('helvetica', 'bold')
        pdf.text('Top Triggers', margin, y)
        y += 2
        pdf.setDrawColor(124, 58, 237)
        pdf.line(margin, y, margin + contentW, y)
        y += 6

        topTriggers.forEach(([key, count]) => {
          const pct   = count / totalDays
          const label = key.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())
          pdf.setTextColor(50, 50, 50)
          pdf.setFontSize(9)
          pdf.setFont('helvetica', 'normal')
          pdf.text(label, margin, y)
          pdf.text(`${count} days (${(pct * 100).toFixed(0)}%)`, margin + contentW, y, { align: 'right' })
          y += 3
          pdf.setFillColor(229, 222, 255)
          pdf.roundedRect(margin, y, contentW, 3, 1, 1, 'F')
          pdf.setFillColor(124, 58, 237)
          pdf.roundedRect(margin, y, contentW * pct, 3, 1, 1, 'F')
          y += 7
        })
        y += 4
      }

      const recentLogs = logs.slice(-14)
      if (recentLogs.length > 0) {
        pdf.setTextColor(124, 58, 237)
        pdf.setFontSize(13)
        pdf.setFont('helvetica', 'bold')
        pdf.text('Recent Daily Log', margin, y)
        y += 2
        pdf.setDrawColor(124, 58, 237)
        pdf.line(margin, y, margin + contentW, y)
        y += 6

        pdf.setFillColor(124, 58, 237)
        pdf.rect(margin, y, contentW, 7, 'F')
        pdf.setTextColor(255, 255, 255)
        pdf.setFontSize(8)
        pdf.setFont('helvetica', 'bold')
        const cols = [
          { label: 'Date',     x: margin + 2 },
          { label: 'Pain',     x: margin + 32 },
          { label: 'Fatigue',  x: margin + 48 },
          { label: 'Sleep',    x: margin + 68 },
          { label: 'Mood',     x: margin + 86 },
          { label: 'Activity', x: margin + 102 },
          { label: 'Triggers', x: margin + 124 },
        ]
        cols.forEach(c => pdf.text(c.label, c.x, y + 5))
        y += 8

        recentLogs.forEach((entry, idx) => {
          if (y > 260) { pdf.addPage(); y = margin }
          if (idx % 2 === 0) {
            pdf.setFillColor(248, 245, 255)
            pdf.rect(margin, y - 1, contentW, 7, 'F')
          }
          const activeTriggers = Object.entries(entry.triggers)
            .filter(([, v]) => v)
            .map(([k]) => k.replace('_', ' '))
            .join(', ')
          pdf.setTextColor(50, 50, 50)
          pdf.setFontSize(7.5)
          pdf.setFont('helvetica', 'normal')
          pdf.text(format(new Date(entry.id), 'MMM d, yyyy'), cols[0].x, y + 4)
          pdf.text(String(entry.pain),    cols[1].x, y + 4)
          pdf.text(String(entry.fatigue), cols[2].x, y + 4)
          pdf.text(`${entry.sleep}h`,     cols[3].x, y + 4)
          pdf.text(MOOD_EMOJIS[entry.mood].label, cols[4].x, y + 4)
          pdf.text(entry.activity,        cols[5].x, y + 4)
          pdf.text(activeTriggers || '—', cols[6].x, y + 4, { maxWidth: 50 })
          y += 7
        })
      }

      pdf.setFillColor(245, 243, 255)
      pdf.rect(0, 282, pageW, 15, 'F')
      pdf.setTextColor(124, 58, 237)
      pdf.setFontSize(8)
      pdf.text('Generated by Symply — symply.pages.dev', pageW / 2, 290, { align: 'center' })
      pdf.setTextColor(150, 150, 150)
      pdf.setFontSize(7)
      pdf.text('This report is not a medical diagnosis. Please consult your healthcare provider.', pageW / 2, 294, { align: 'center' })

      pdf.save(`symply-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`)
    } finally {
      setGenerating(false)
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '20px 16px', maxWidth: '480px', margin: '0 auto', textAlign: 'center' }}>
        <p style={{ color: 'var(--color-text-muted)', marginTop: '40px' }}>Loading report data…</p>
      </div>
    )
  }

  return (
    <div style={{ padding: '20px 16px 16px', maxWidth: '480px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '4px' }}>
        {t.report.title}
      </h1>
      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '16px' }}>
        {t.report.subtitle}
      </p>

      {/* Pro 잠금 배너 (Free 유저용) */}
      {!isPro && (
        <div style={{
          padding: '14px 16px',
          borderRadius: '14px',
          background: 'linear-gradient(135deg, #7c3aed15, #a855f715)',
          border: '1.5px solid var(--color-primary)',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          <span style={{ fontSize: '1.5rem' }}>📄</span>
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--color-primary)', marginBottom: '2px' }}>
              {t.report.pro_banner_title}
            </p>
            <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
              {t.report.pro_banner_body}
            </p>
          </div>
          <button
            onClick={() => setShowUpgrade(true)}
            style={{
              padding: '8px 14px',
              borderRadius: '10px',
              border: 'none',
              background: 'var(--color-primary)',
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.78rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            Upgrade
          </button>
        </div>
      )}

      <Card style={{ marginBottom: '16px' }}>
        <p style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--color-text)', marginBottom: '10px' }}>
          {t.report.period_label}
        </p>
        <div style={{ display: 'flex', gap: '8px' }}>
          {([30, 60, 90] as const).map(d => (
            <button
              key={d}
              onClick={() => setPeriod(d)}
              style={{
                flex: 1,
                padding: '8px',
                borderRadius: '10px',
                border: period === d ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                background: period === d ? 'var(--color-primary-light)' : 'var(--color-surface-2)',
                cursor: 'pointer',
                fontWeight: period === d ? 700 : 400,
                fontSize: '0.85rem',
                color: period === d ? 'var(--color-primary)' : 'var(--color-text-muted)',
              }}
            >
              {d === 30 ? t.report.period_30 : d === 60 ? t.report.period_60 : t.report.period_90}
            </button>
          ))}
        </div>
      </Card>

      <Card style={{ marginBottom: '16px' }}>
        <p style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-text)', marginBottom: '12px' }}>
          {t.report.preview_title}
        </p>
        {totalDays === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px' }}>
            <p style={{ fontSize: '1.5rem', marginBottom: '8px' }}>📭</p>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
              {t.report.no_data.replace('{n}', String(period))}
            </p>
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '12px' }}>
              {[
                { label: t.report.days_logged, value: totalDays },
                { label: t.report.avg_pain,    value: avgPain.toFixed(1) },
                { label: t.report.flare_days,  value: flareDays },
              ].map(({ label, value }) => (
                <div key={label} style={{ textAlign: 'center', padding: '10px', background: 'var(--color-surface-2)', borderRadius: '10px' }}>
                  <div style={{ fontWeight: 700, fontSize: '1.3rem', color: 'var(--color-primary)' }}>{value}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>{label}</div>
                </div>
              ))}
            </div>
            {topTriggers.length > 0 && (
              <div style={{ marginBottom: '12px' }}>
                <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '6px' }}>{t.report.top_triggers}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {topTriggers.map(([key, count]) => (
                    <span key={key} style={{
                      padding: '3px 10px',
                      borderRadius: '12px',
                      background: 'var(--color-secondary-light)',
                      color: 'var(--color-secondary)',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      textTransform: 'capitalize',
                    }}>
                      {key.replace('_', ' ')} ({count})
                    </span>
                  ))}
                </div>
              </div>
            )}
            <div style={{ padding: '10px 12px', background: '#fef9c3', borderRadius: '8px', fontSize: '0.78rem', color: '#92400e' }}>
              {t.report.disclaimer_short}
            </div>
          </>
        )}
      </Card>

      <button
        onClick={generatePDF}
        disabled={generating || totalDays === 0}
        style={{
          width: '100%',
          padding: '16px',
          borderRadius: '14px',
          border: 'none',
          background: totalDays === 0 || generating
            ? 'var(--color-border)'
            : isPro
              ? 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))'
              : 'linear-gradient(135deg, #7c3aed, #a855f7)',
          color: '#fff',
          fontWeight: 700,
          fontSize: '1rem',
          cursor: totalDays === 0 || generating ? 'not-allowed' : 'pointer',
        }}
      >
        {generating
          ? '⏳ Generating PDF...'
          : isPro
            ? t.report.download
            : '🔒 Unlock PDF Report — Pro'}
      </button>

      {/* Upgrade Modal */}
      {showUpgrade && user && (
        <UpgradeModal
          onClose={() => setShowUpgrade(false)}
          userEmail={user.email ?? ''}
          feature="report"
        />
      )}
    </div>
  )
}
