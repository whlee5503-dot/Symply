import type { PainAnchor, FatigueAnchor } from '../../types'
import { useLanguage } from '../../contexts/LanguageContext'

interface AnchorSliderProps {
  value: number
  onChange: (v: number) => void
  anchors: (PainAnchor | FatigueAnchor)[]
  anchorsKo?: (PainAnchor | FatigueAnchor)[]
  color?: string
  label: string
}

function getAnchorForValue(value: number, anchors: (PainAnchor | FatigueAnchor)[]) {
  let best = anchors[0]
  for (const a of anchors) {
    if (a.level <= value) best = a
  }
  return best
}

function getColorForValue(value: number): string {
  if (value <= 2) return '#22c55e'
  if (value <= 4) return '#86efac'
  if (value <= 6) return '#f59e0b'
  if (value <= 8) return '#ef4444'
  return '#991b1b'
}

export default function AnchorSlider({ value, onChange, anchors, anchorsKo, label }: AnchorSliderProps) {
  const { language } = useLanguage()
  const activeAnchors = (language === 'ko' && anchorsKo) ? anchorsKo : anchors
  const anchor = getAnchorForValue(value, activeAnchors)
  const color = getColorForValue(value)

  return (
    <div style={{ marginBottom: '4px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <span style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--color-text)' }}>{label}</span>
        <span style={{ fontWeight: 700, fontSize: '1.1rem', color, minWidth: '28px', textAlign: 'right' }}>{value}</span>
      </div>
      <input
        type="range" min={0} max={10} step={1} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: '100%', accentColor: color, height: '6px', cursor: 'pointer' }}
      />
      <div style={{ marginTop: '6px', padding: '8px 12px', backgroundColor: `${color}18`, borderRadius: '8px', borderLeft: `3px solid ${color}` }}>
        <span style={{ fontWeight: 600, fontSize: '0.8rem', color }}>{anchor.label}</span>
        <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginLeft: '6px' }}>{anchor.description}</span>
      </div>
    </div>
  )
}
