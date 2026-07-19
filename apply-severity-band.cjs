// apply-severity-band.cjs
// Run from repo root: node apply-severity-band.cjs
// Adds a general clinical severity-band helper (Mild/Moderate/Severe) to
// types/index.ts and wires ReportPage.tsx to use it instead of its old
// ad-hoc 4-band logic. Deliberately does NOT label anything "PROMIS" in the
// app UI/PDF — see the comment block inserted into types/index.ts for why.

const fs = require('fs')
const path = require('path')

function applyReplace(filePath, oldStr, newStr, label) {
  const full = path.join(process.cwd(), filePath)
  let content = fs.readFileSync(full, 'utf8')
  if (!content.includes(oldStr)) {
    console.error(`[SKIP] Anchor not found for "${label}" in ${filePath}. File may already be updated, or content has diverged — check manually.`)
    return false
  }
  const occurrences = content.split(oldStr).length - 1
  if (occurrences > 1) {
    console.error(`[ABORT] Anchor for "${label}" in ${filePath} is not unique (${occurrences} matches). Aborting to avoid a bad edit.`)
    process.exit(1)
  }
  content = content.replace(oldStr, newStr)
  fs.writeFileSync(full, content, 'utf8')
  console.log(`[OK] ${label} -> ${filePath}`)
  return true
}

// ── 1. types/index.ts: insert severity band block ──────────────────────────
const typesOld = `export const PAIN_ANCHORS_ES: PainAnchor[] = [`

const typesNew = `// ─── Severity Bands ────────────────────────────────────────────────────────
// General-purpose Mild/Moderate/Severe categorization for average pain and
// fatigue scores, based on commonly used 0-10 Numeric Rating Scale cut points
// from the pain literature (Serlin et al. 1995; Cleeland et al.).
// This is NOT a validated PROMIS score — real PROMIS measures use multi-item
// questionnaires scored via IRT into T-scores (mean 50, SD 10), not a direct
// mapping from a single 0-10 self-report. Symply's anchor scales were
// designed with that literature (including PROMIS) as a reference point,
// but this function only classifies Symply's own NRS-style averages.

export type SeverityBand = 'none' | 'mild' | 'moderate' | 'severe'

export function getSeverityBand(score: number): SeverityBand {
  const rounded = Math.round(score)
  if (rounded <= 0) return 'none'
  if (rounded <= 3) return 'mild'
  if (rounded <= 6) return 'moderate'
  return 'severe'
}

export const SEVERITY_BAND_LABELS: Record<SeverityBand, string> = {
  none:     'None',
  mild:     'Mild',
  moderate: 'Moderate',
  severe:   'Severe',
}

export const SEVERITY_BAND_LABELS_KO: Record<SeverityBand, string> = {
  none:     '없음',
  mild:     '경미',
  moderate: '보통',
  severe:   '심함',
}

export const SEVERITY_BAND_LABELS_ES: Record<SeverityBand, string> = {
  none:     'Ninguno',
  mild:     'Leve',
  moderate: 'Moderado',
  severe:   'Severo',
}

export const PAIN_ANCHORS_ES: PainAnchor[] = [`

// ── 2. ReportPage.tsx: import ───────────────────────────────────────────────
const importOld = `import type { LogEntry } from '../types'\nimport { MOOD_EMOJIS } from '../types'`
const importNew = `import type { LogEntry } from '../types'\nimport { MOOD_EMOJIS, getSeverityBand, SEVERITY_BAND_LABELS } from '../types'`

// ── 3. ReportPage.tsx: remove old local severity function ─────────────────
const fnOld = `function getSeverityLabel(avg: number): string {\n  if (avg <= 2) return 'Mild'\n  if (avg <= 4) return 'Moderate'\n  if (avg <= 6) return 'Severe'\n  return 'Very Severe'\n}\n\n`
const fnNew = ``

// ── 4. ReportPage.tsx: use shared helper in stats array ────────────────────
const statsOld = `        { label: 'Avg Pain',    value: avgPain.toFixed(1),    sub: getSeverityLabel(avgPain) },\n        { label: 'Avg Fatigue', value: avgFatigue.toFixed(1), sub: getSeverityLabel(avgFatigue) },`
const statsNew = `        { label: 'Avg Pain',    value: avgPain.toFixed(1),    sub: SEVERITY_BAND_LABELS[getSeverityBand(avgPain)] },\n        { label: 'Avg Fatigue', value: avgFatigue.toFixed(1), sub: SEVERITY_BAND_LABELS[getSeverityBand(avgFatigue)] },`

const results = [
  applyReplace('src/types/index.ts', typesOld, typesNew, 'severity band block'),
  applyReplace('src/pages/ReportPage.tsx', importOld, importNew, 'import line'),
  applyReplace('src/pages/ReportPage.tsx', fnOld, fnNew, 'remove old getSeverityLabel'),
  applyReplace('src/pages/ReportPage.tsx', statsOld, statsNew, 'stats array usage'),
]

if (results.every(Boolean)) {
  console.log('\nAll edits applied. Next: npx tsc --noEmit, then git add -A && git commit && git push')
} else {
  console.log('\nSome edits were skipped — check the [SKIP]/[ABORT] messages above before committing.')
}
