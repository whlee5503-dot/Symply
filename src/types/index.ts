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


export const PAIN_ANCHORS_KO: PainAnchor[] = [
  { level: 0,  label: '없음',   description: '통증 없음. 완전히 정상.',                        color: '#22c55e' },
  { level: 2,  label: '약함',   description: '신경 쓰이지만 하던 일을 계속할 수 있음.',          color: '#86efac' },
  { level: 4,  label: '보통',   description: '집중하기 어렵지만 참을 수 있음. 심한 두통 수준.',  color: '#f59e0b' },
  { level: 6,  label: '심함',   description: '하던 일을 멈춰야 함. 심한 치통 수준.',             color: '#f97316' },
  { level: 8,  label: '극심함', description: '말하기도 힘듦. 신장결석·심한 골절 수준.',          color: '#ef4444' },
  { level: 10, label: '최악',   description: '출산 진통 수준. 의식이 흐려질 정도.',              color: '#991b1b' },
]

export const FATIGUE_ANCHORS_KO: FatigueAnchor[] = [
  { level: 0,  label: '활기참',  description: '완전히 활기차고 기민한 상태.' },
  { level: 3,  label: '피곤함',  description: '오후에 좀 처지는 느낌.' },
  { level: 5,  label: '기력없음', description: '소파에서 일어나기 싫음.' },
  { level: 7,  label: '탈진',    description: '씻는 것도 힘듦.' },
  { level: 10, label: '완전탈진', description: '침대에서 전혀 못 일어남.' },
]

export const PAIN_ANCHORS_ES: PainAnchor[] = [
  { level: 0,  label: 'Sin dolor',  description: 'Sin dolor. Completamente normal.',                    color: '#22c55e' },
  { level: 2,  label: 'Leve',       description: 'Molesto pero puedes continuar con tus actividades.',  color: '#86efac' },
  { level: 4,  label: 'Moderado',   description: 'Difícil concentrarse pero manejable. Como una jaqueca fuerte.', color: '#f59e0b' },
  { level: 6,  label: 'Severo',     description: 'Debes parar actividades. Como un dolor de muela severo.', color: '#f97316' },
  { level: 8,  label: 'Intenso',    description: 'Difícil hablar. Como cálculos renales o una fractura.', color: '#ef4444' },
  { level: 10, label: 'Máximo',     description: 'Como contracciones de parto. La conciencia se desvanece.', color: '#991b1b' },
]

export const FATIGUE_ANCHORS_ES: FatigueAnchor[] = [
  { level: 0,  label: 'Con energía',  description: 'Completamente alerta y con energía.' },
  { level: 3,  label: 'Cansado',      description: 'Sensación de bajón por la tarde.' },
  { level: 5,  label: 'Agotado',      description: 'No quieres levantarte del sofá.' },
  { level: 7,  label: 'Exhausto',     description: 'Incluso ducharse se siente difícil.' },
  { level: 10, label: 'Sin fuerzas',  description: 'No puedes levantarte de la cama.' },
]
