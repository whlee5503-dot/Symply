// ─── User & Auth ───────────────────────────────────────────────────────────

export interface UserProfile {
  uid: string
  email: string
  displayName: string
  createdAt: Date
  plan: 'free' | 'pro'
  planExpiresAt?: Date
  conditions: ChronicCondition[]
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

// ─── Check-in / Log Entry ──────────────────────────────────────────────────

export interface LogEntry {
  id: string          // YYYY-MM-DD
  userId: string
  pain: number        // 0–10
  fatigue: number     // 0–10
  mood: 1 | 2 | 3 | 4 | 5
  sleep: number       // hours
  triggers: TriggerMap
  activity: 'low' | 'medium' | 'high'
  medications: MedicationLog[]
  note: string
  weather?: WeatherData
  createdAt: Date
  updatedAt: Date
}

export interface TriggerMap {
  gluten: boolean
  dairy: boolean
  sugar: boolean
  caffeine: boolean
  alcohol: boolean
  stress: boolean
  poor_sleep: boolean
  overexertion: boolean
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
  { level: 0,  label: 'Energized',  description: 'Fully alert and energized.' },
  { level: 3,  label: 'Tired',      description: 'Afternoon slump feeling.' },
  { level: 5,  label: 'Drained',    description: "Don't want to get off the sofa." },
  { level: 7,  label: 'Exhausted',  description: 'Even showering feels hard.' },
  { level: 10, label: 'Crash',      description: 'Cannot get out of bed at all.' },
]

export const MOOD_EMOJIS: Record<number, { emoji: string; label: string }> = {
  1: { emoji: '😢', label: 'Very low' },
  2: { emoji: '😞', label: 'Low' },
  3: { emoji: '😐', label: 'Neutral' },
  4: { emoji: '🙂', label: 'Good' },
  5: { emoji: '😊', label: 'Great' },
}
