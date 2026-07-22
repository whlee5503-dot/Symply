// ─── User & Auth ───────────────────────────────────────────────────────────

export interface UserProfile {
  uid: string
  email: string
  displayName: string
  createdAt: Date
  plan: 'free' | 'pro'
  planExpiresAt?: Date
  conditions: ChronicCondition[]
  primaryCondition?: ChronicCondition
  medications: Medication[]
}

export type ChronicCondition =
  | 'PCOS'
  | 'endometriosis'
  | 'fibromyalgia'
  | 'lupus'
  | 'rheumatoid_arthritis'
  | 'crohns'
  | 'ibs'
  | 'chronic_fatigue'
  | 'other'

export interface Medication {
  id: string
  name: string
  frequency: 'daily' | 'as_needed' | 'weekly'
}

// ─── Cycle Tracking ────────────────────────────────────────────────────────

export type CyclePhase = 'menstruation' | 'follicular' | 'ovulation' | 'luteal' | null

export interface CycleDay {
  date: string         // YYYY-MM-DD
  isMenstruating: boolean
  flow: 0 | 1 | 2 | 3  // 0=none, 1=light, 2=medium, 3=heavy
  symptoms: CycleSymptom[]
  notes: string
}

export type CycleSymptom =
  | 'cramps'
  | 'bloating'
  | 'headache'
  | 'mood_swings'
  | 'breast_tenderness'
  | 'spotting'
  | 'clots'

export const CYCLE_SYMPTOM_LABELS: Record<CycleSymptom, string> = {
  cramps:            'Cramps',
  bloating:          'Bloating',
  headache:          'Headache',
  mood_swings:       'Mood swings',
  breast_tenderness: 'Breast tenderness',
  spotting:          'Spotting',
  clots:             'Clots',
}

export const FLOW_LABELS: Record<0|1|2|3, string> = {
  0: 'None',
  1: 'Light',
  2: 'Medium',
  3: 'Heavy',
}

export const FLOW_COLORS: Record<0|1|2|3, string> = {
  0: 'transparent',
  1: '#fca5a5',
  2: '#f87171',
  3: '#dc2626',
}

// ─── Check-in / Log Entry ──────────────────────────────────────────────────

export interface LogEntry {
  id: string          // YYYY-MM-DD
  userId: string
  pain: number        // 0-10
  fatigue: number     // 0-10
  mood: 1 | 2 | 3 | 4 | 5
  sleep: number       // hours
  triggers: TriggerMap
  activity: 'low' | 'medium' | 'high'
  medications: MedicationLog[]
  note: string
  weather?: WeatherData
  cycle?: CycleDay    // optional cycle data
  createdAt: Date
  updatedAt: Date
}

export interface TriggerMap {
  gluten: boolean
  dairy: boolean
  sugar: boolean
  caffeine: boolean
  alcohol: boolean
  high_fodmap: boolean
  high_glycemic: boolean
  stress: boolean
  poor_sleep: boolean
  overexertion: boolean
  pressure_change: boolean
  temperature_change: boolean
  sun_exposure: boolean
}

// ─── Trigger ↔ Condition Relevance Catalog ────────────────────────────────
// Maps each trigger to the conditions it is clinically relevant for, with an
// evidence-strength label. This does NOT change what gets logged (the
// TriggerMap schema above is unchanged) — it is UI-layer metadata used to
// reorder and highlight triggers based on the user's primary condition.
// Evidence strength is deliberately not uniform: e.g. IBS + high_fodmap is
// backed by ACG/NICE-level dietary guidance ("strong"), while endometriosis
// + diet triggers remain contested in the literature ("weak"). Collapsing
// these into one confidence level would be the same kind of overclaiming
// avoided in the severity-band / PROMIS naming decision.

export type EvidenceStrength = 'strong' | 'moderate' | 'weak'

export const TRIGGER_CONDITION_RELEVANCE: Record<
  keyof TriggerMap,
  Partial<Record<ChronicCondition, EvidenceStrength>>
> = {
  gluten:              { ibs: 'moderate', crohns: 'moderate' },
  dairy:                { ibs: 'moderate', crohns: 'moderate' },
  sugar:                { PCOS: 'moderate' },
  caffeine:             { ibs: 'weak', fibromyalgia: 'weak' },
  alcohol:              { crohns: 'moderate', fibromyalgia: 'weak' },
  high_fodmap:          { ibs: 'strong', crohns: 'moderate' },
  high_glycemic:        { PCOS: 'moderate' },
  stress:               {
    PCOS: 'moderate', endometriosis: 'moderate', fibromyalgia: 'strong',
    lupus: 'moderate', rheumatoid_arthritis: 'moderate', crohns: 'moderate',
    ibs: 'moderate', chronic_fatigue: 'strong',
  },
  poor_sleep:           { fibromyalgia: 'strong', chronic_fatigue: 'strong', PCOS: 'moderate' },
  overexertion:         { chronic_fatigue: 'strong', fibromyalgia: 'strong', lupus: 'moderate', rheumatoid_arthritis: 'moderate' },
  pressure_change:      { fibromyalgia: 'moderate' },
  temperature_change:   { fibromyalgia: 'moderate' },
  sun_exposure:         { lupus: 'strong' },
}

// Returns the trigger keys most relevant to a given condition, sorted with
// the strongest evidence first (used to reorder/highlight, not to filter —
// all triggers always remain visible and loggable).
export function getTriggerPriority(
  condition: ChronicCondition | undefined,
): Partial<Record<keyof TriggerMap, EvidenceStrength>> {
  if (!condition) return {}
  const result: Partial<Record<keyof TriggerMap, EvidenceStrength>> = {}
  for (const key of Object.keys(TRIGGER_CONDITION_RELEVANCE) as (keyof TriggerMap)[]) {
    const strength = TRIGGER_CONDITION_RELEVANCE[key][condition]
    if (strength) result[key] = strength
  }
  return result
}

export interface MedicationLog {
  name: string
  taken: boolean
}

export interface WeatherData {
  temp: number
  humidity: number
  pressure: number
  description: string
}

// ─── UI Helpers ────────────────────────────────────────────────────────────

export interface PainAnchor {
  level: number
  label: string
  description: string
  color: string
}

export interface FatigueAnchor {
  level: number
  label: string
  description: string
}

export const PAIN_ANCHORS: PainAnchor[] = [
  { level: 0,  label: 'None',     description: 'No pain at all. Feeling completely normal.',           color: '#22c55e' },
  { level: 2,  label: 'Mild',     description: 'Noticeable but you can continue what you were doing.', color: '#86efac' },
  { level: 4,  label: 'Moderate', description: 'Hard to concentrate but manageable. Like a bad headache.', color: '#f59e0b' },
  { level: 6,  label: 'Severe',   description: 'Must stop activities. Like a severe toothache.',        color: '#f97316' },
  { level: 8,  label: 'Intense',  description: 'Hard to speak. Like kidney stones or a bad fracture.',  color: '#ef4444' },
  { level: 10, label: 'Worst',    description: 'Like labor contractions. Consciousness fading.',        color: '#991b1b' },
]

export const FATIGUE_ANCHORS: FatigueAnchor[] = [
  { level: 0,  label: 'Energized',  description: 'Fully alert. Fatigue does not interfere with daily activities.' },
  { level: 2,  label: 'Mild',       description: 'Slightly tired but able to carry out all daily activities.' },
  { level: 4,  label: 'Moderate',   description: 'Fatigue limits some activities. Hard to sustain physical effort.' },
  { level: 6,  label: 'Severe',     description: 'Fatigue interferes with most activities. Work or family life affected.' },
  { level: 8,  label: 'Intense',    description: 'Fatigue prevents most activities. Even basic tasks feel difficult.' },
  { level: 10, label: 'Crash',      description: 'Cannot get out of bed. Fatigue is completely disabling.' },
]

export const MOOD_EMOJIS: Record<number, { emoji: string; label: string }> = {
  1: { emoji: '😢', label: 'Very low' },
  2: { emoji: '😞', label: 'Low' },
  3: { emoji: '😐', label: 'Neutral' },
  4: { emoji: '🙂', label: 'Good' },
  5: { emoji: '😊', label: 'Great' },
}


export const PAIN_ANCHORS_KO: PainAnchor[] = [
  { level: 0,  label: '없음',   description: '통증 없음. 완전히 정상.',                        color: '#22c55e' },
  { level: 2,  label: '약함',   description: '신경 쓰이지만 하던 일을 계속할 수 있음.',          color: '#86efac' },
  { level: 4,  label: '보통',   description: '집중하기 어렵지만 참을 수 있음. 심한 두통 수준.',  color: '#f59e0b' },
  { level: 6,  label: '심함',   description: '하던 일을 멈춰야 함. 심한 치통 수준.',             color: '#f97316' },
  { level: 8,  label: '극심함', description: '말하기도 힘듦. 신장결석·심한 골절 수준.',          color: '#ef4444' },
  { level: 10, label: '최악',   description: '출산 진통 수준. 의식이 흐려질 정도.',              color: '#991b1b' },
]

export const FATIGUE_ANCHORS_KO: FatigueAnchor[] = [
  { level: 0,  label: '활기참',   description: '완전히 활기참. 피로가 일상 활동에 전혀 영향을 주지 않음.' },
  { level: 2,  label: '약한 피로', description: '약간 피곤하지만 모든 일상 활동을 수행할 수 있음.' },
  { level: 4,  label: '보통 피로', description: '피로로 인해 일부 활동이 제한됨. 지속적인 신체 활동이 어려움.' },
  { level: 6,  label: '심한 피로', description: '피로가 대부분의 활동을 방해함. 직장이나 가정생활에 영향을 줌.' },
  { level: 8,  label: '극심한 피로', description: '피로로 인해 대부분의 활동이 불가능함. 기본적인 일도 힘듦.' },
  { level: 10, label: '완전탈진',  description: '침대에서 전혀 못 일어남. 피로가 완전히 일상을 마비시킴.' },
]

// ─── Severity Bands ────────────────────────────────────────────────────────
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

export const PAIN_ANCHORS_ES: PainAnchor[] = [
  { level: 0,  label: 'Sin dolor',  description: 'Sin dolor. Completamente normal.',                    color: '#22c55e' },
  { level: 2,  label: 'Leve',       description: 'Molesto pero puedes continuar con tus actividades.',  color: '#86efac' },
  { level: 4,  label: 'Moderado',   description: 'Difícil concentrarse pero manejable. Como una jaqueca fuerte.', color: '#f59e0b' },
  { level: 6,  label: 'Severo',     description: 'Debes parar actividades. Como un dolor de muela severo.', color: '#f97316' },
  { level: 8,  label: 'Intenso',    description: 'Difícil hablar. Como cálculos renales o una fractura.', color: '#ef4444' },
  { level: 10, label: 'Máximo',     description: 'Como contracciones de parto. La conciencia se desvanece.', color: '#991b1b' },
]

export const FATIGUE_ANCHORS_ES: FatigueAnchor[] = [
  { level: 0,  label: 'Con energia',    description: 'Completamente alerta. La fatiga no interfiere con las actividades.' },
  { level: 2,  label: 'Leve',           description: 'Ligeramente cansado pero capaz de realizar todas las actividades.' },
  { level: 4,  label: 'Moderado',       description: 'La fatiga limita algunas actividades. Dificil mantener el esfuerzo.' },
  { level: 6,  label: 'Severo',         description: 'La fatiga interfiere con la mayoria de actividades y el trabajo.' },
  { level: 8,  label: 'Intenso',        description: 'La fatiga impide la mayoria de actividades. Incluso lo basico es dificil.' },
  { level: 10, label: 'Sin fuerzas',    description: 'No puedes levantarte de la cama. La fatiga es completamente incapacitante.' },
]
