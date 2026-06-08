import { format, subDays } from 'date-fns'
import type { LogEntry, TriggerMap } from '../types'

const LOGS_KEY = 'symply-logs'

function makeEntry(
  daysAgo: number,
  overrides: Partial<LogEntry>
): LogEntry {
  const date = format(subDays(new Date(), daysAgo), 'yyyy-MM-dd')
  return {
    id:          date,
    userId:      'mock-user',
    pain:        3,
    fatigue:     3,
    mood:        3,
    sleep:       7,
    triggers:    {
      gluten:       false,
      dairy:        false,
      sugar:        false,
      caffeine:     false,
      alcohol:      false,
      stress:       false,
      poor_sleep:   false,
      overexertion: false,
    } as TriggerMap,
    activity:    'medium',
    medications: [],
    note:        '',
    createdAt:   new Date(),
    updatedAt:   new Date(),
    ...overrides,
  }
}

// ─── Scenario 1: Sarah / PCOS ──────────────────────────────────────────────
// 패턴: 글루텐 섭취일 다음 날 통증 급증 + 수면 부족 → 피로
export const SARAH_PCOS: LogEntry[] = [
  // Day 30 — 글루텐 섭취, 통증 낮음
  makeEntry(30, { pain: 2, fatigue: 3, sleep: 7.5, mood: 4,
    triggers: { ...emptyTriggers(), gluten: true },
    note: 'Had pasta for dinner.' }),
  // Day 29 — 글루텐 다음날 통증 급증
  makeEntry(29, { pain: 7, fatigue: 6, sleep: 6, mood: 2,
    triggers: { ...emptyTriggers(), poor_sleep: true },
    note: 'Woke up in pain.' }),
  // Day 28 — 회복
  makeEntry(28, { pain: 4, fatigue: 4, sleep: 7, mood: 3 }),
  // Day 27 — 좋은 날
  makeEntry(27, { pain: 1, fatigue: 2, sleep: 8, mood: 5,
    activity: 'medium' }),
  // Day 26 — 글루텐 섭취
  makeEntry(26, { pain: 3, fatigue: 3, sleep: 7, mood: 3,
    triggers: { ...emptyTriggers(), gluten: true, sugar: true },
    note: 'Birthday cake at work.' }),
  // Day 25 — 글루텐 다음날 통증 급증
  makeEntry(25, { pain: 8, fatigue: 7, sleep: 5.5, mood: 1,
    triggers: { ...emptyTriggers(), poor_sleep: true },
    note: 'Terrible pain, had to cancel plans.' }),
  // Day 24 — 여전히 힘듦
  makeEntry(24, { pain: 5, fatigue: 6, sleep: 6.5, mood: 2 }),
  // Day 23 — 회복 중
  makeEntry(23, { pain: 3, fatigue: 4, sleep: 7.5, mood: 3 }),
  // Day 22 — 좋은 날
  makeEntry(22, { pain: 1, fatigue: 2, sleep: 8.5, mood: 5,
    activity: 'high' }),
  // Day 21 — 과활동 다음날 피로
  makeEntry(21, { pain: 3, fatigue: 7, sleep: 9, mood: 3,
    activity: 'low', note: 'So tired after yesterday.' }),
  // Day 20 — 정상
  makeEntry(20, { pain: 2, fatigue: 3, sleep: 7, mood: 4 }),
  // Day 19 — 수면 부족
  makeEntry(19, { pain: 3, fatigue: 4, sleep: 5, mood: 3,
    triggers: { ...emptyTriggers(), poor_sleep: true },
    note: 'Couldn\'t sleep, anxious.' }),
  // Day 18 — 수면 부족 다음날 통증
  makeEntry(18, { pain: 6, fatigue: 7, sleep: 6, mood: 2 }),
  // Day 17 — 스트레스
  makeEntry(17, { pain: 5, fatigue: 5, sleep: 6.5, mood: 2,
    triggers: { ...emptyTriggers(), stress: true },
    note: 'Work deadline.' }),
  // Day 16 — 회복
  makeEntry(16, { pain: 3, fatigue: 3, sleep: 8, mood: 4 }),
  // Day 15 — 좋은 날
  makeEntry(15, { pain: 1, fatigue: 2, sleep: 8, mood: 5 }),
  // Day 14 — 글루텐 섭취
  makeEntry(14, { pain: 2, fatigue: 3, sleep: 7, mood: 4,
    triggers: { ...emptyTriggers(), gluten: true } }),
  // Day 13 — 글루텐 다음날 통증
  makeEntry(13, { pain: 7, fatigue: 6, sleep: 6, mood: 2,
    note: 'Pain again after gluten.' }),
  // Day 12 — 회복 중
  makeEntry(12, { pain: 4, fatigue: 5, sleep: 7, mood: 3 }),
  // Day 11 — 정상
  makeEntry(11, { pain: 2, fatigue: 3, sleep: 7.5, mood: 4 }),
  // Day 10 — 수면 부족
  makeEntry(10, { pain: 3, fatigue: 4, sleep: 5.5, mood: 3,
    triggers: { ...emptyTriggers(), poor_sleep: true, caffeine: true } }),
  // Day 9 — 수면 부족 다음날
  makeEntry(9, { pain: 5, fatigue: 8, sleep: 7, mood: 2 }),
  // Day 8 — 회복
  makeEntry(8, { pain: 3, fatigue: 4, sleep: 8, mood: 3 }),
  // Day 7 — 좋은 날
  makeEntry(7, { pain: 1, fatigue: 2, sleep: 8.5, mood: 5,
    activity: 'medium' }),
  // Day 6 — 스트레스 + 글루텐
  makeEntry(6, { pain: 4, fatigue: 4, sleep: 6.5, mood: 2,
    triggers: { ...emptyTriggers(), stress: true, gluten: true },
    note: 'Stressful day, ate poorly.' }),
  // Day 5 — 복합 다음날
  makeEntry(5, { pain: 8, fatigue: 7, sleep: 5.5, mood: 1,
    note: 'Worst day this week.' }),
  // Day 4 — 회복 시작
  makeEntry(4, { pain: 5, fatigue: 5, sleep: 7, mood: 3 }),
  // Day 3 — 회복 중
  makeEntry(3, { pain: 3, fatigue: 4, sleep: 7.5, mood: 3 }),
  // Day 2 — 거의 정상
  makeEntry(2, { pain: 2, fatigue: 3, sleep: 8, mood: 4 }),
  // Day 1 — 어제
  makeEntry(1, { pain: 3, fatigue: 3, sleep: 7, mood: 3,
    triggers: { ...emptyTriggers(), gluten: true },
    note: 'Had bread again, monitoring.' }),
]

// ─── Scenario 2: Emma / Endometriosis ─────────────────────────────────────
// 패턴: 스트레스 + 통증 상관 + 고활동 후 피로 급증
export const EMMA_ENDO: LogEntry[] = [
  makeEntry(30, { pain: 3, fatigue: 4, sleep: 7, mood: 3 }),
  makeEntry(29, { pain: 2, fatigue: 3, sleep: 8, mood: 4,
    activity: 'high', note: 'Yoga class, felt good.' }),
  makeEntry(28, { pain: 4, fatigue: 8, sleep: 9, mood: 2,
    activity: 'low', note: 'Exhausted after yesterday.' }),
  makeEntry(27, { pain: 3, fatigue: 5, sleep: 7.5, mood: 3 }),
  makeEntry(26, { pain: 5, fatigue: 5, sleep: 6.5, mood: 2,
    triggers: { ...emptyTriggers(), stress: true },
    note: 'Doctor appointment stress.' }),
  makeEntry(25, { pain: 7, fatigue: 6, sleep: 6, mood: 1,
    note: 'Flare day — missed work.' }),
  makeEntry(24, { pain: 6, fatigue: 7, sleep: 7, mood: 2 }),
  makeEntry(23, { pain: 4, fatigue: 5, sleep: 8, mood: 3 }),
  makeEntry(22, { pain: 2, fatigue: 3, sleep: 8, mood: 5 }),
  makeEntry(21, { pain: 2, fatigue: 3, sleep: 8, mood: 4,
    activity: 'high', note: 'Long walk with friends.' }),
  makeEntry(20, { pain: 3, fatigue: 7, sleep: 9.5, mood: 2,
    activity: 'low' }),
  makeEntry(19, { pain: 4, fatigue: 5, sleep: 7, mood: 3 }),
  makeEntry(18, { pain: 6, fatigue: 6, sleep: 6, mood: 2,
    triggers: { ...emptyTriggers(), stress: true, dairy: true } }),
  makeEntry(17, { pain: 8, fatigue: 7, sleep: 5.5, mood: 1,
    note: 'Worst flare in weeks.' }),
  makeEntry(16, { pain: 6, fatigue: 6, sleep: 7, mood: 2 }),
  makeEntry(15, { pain: 4, fatigue: 4, sleep: 8, mood: 3 }),
  makeEntry(14, { pain: 2, fatigue: 3, sleep: 8.5, mood: 5 }),
  makeEntry(13, { pain: 3, fatigue: 3, sleep: 7, mood: 4 }),
  makeEntry(12, { pain: 5, fatigue: 5, sleep: 6.5, mood: 2,
    triggers: { ...emptyTriggers(), stress: true },
    note: 'Work presentation.' }),
  makeEntry(11, { pain: 7, fatigue: 6, sleep: 6, mood: 1 }),
  makeEntry(10, { pain: 5, fatigue: 5, sleep: 7.5, mood: 3 }),
  makeEntry(9,  { pain: 3, fatigue: 4, sleep: 8, mood: 4 }),
  makeEntry(8,  { pain: 2, fatigue: 3, sleep: 8, mood: 4,
    activity: 'high' }),
  makeEntry(7,  { pain: 3, fatigue: 8, sleep: 10, mood: 2,
    activity: 'low', note: 'Crashed after exercise.' }),
  makeEntry(6,  { pain: 4, fatigue: 5, sleep: 7.5, mood: 3 }),
  makeEntry(5,  { pain: 3, fatigue: 4, sleep: 7, mood: 4 }),
  makeEntry(4,  { pain: 6, fatigue: 6, sleep: 6, mood: 2,
    triggers: { ...emptyTriggers(), stress: true, alcohol: true } }),
  makeEntry(3,  { pain: 7, fatigue: 7, sleep: 5.5, mood: 1,
    note: 'Flare after stressful weekend.' }),
  makeEntry(2,  { pain: 5, fatigue: 5, sleep: 7, mood: 3 }),
  makeEntry(1,  { pain: 3, fatigue: 4, sleep: 7.5, mood: 3 }),
]

// ─── Scenario 3: Maya / Fibromyalgia ──────────────────────────────────────
// 패턴: 과활동 후 피로 급증 (PEM) + 수면 부족 통증
export const MAYA_FIBRO: LogEntry[] = [
  makeEntry(30, { pain: 4, fatigue: 5, sleep: 6.5, mood: 3 }),
  makeEntry(29, { pain: 3, fatigue: 4, sleep: 7.5, mood: 4 }),
  makeEntry(28, { pain: 2, fatigue: 3, sleep: 8, mood: 4,
    activity: 'high', note: 'Felt good, cleaned the whole house.' }),
  makeEntry(27, { pain: 6, fatigue: 9, sleep: 11, mood: 1,
    activity: 'low', note: 'PEM crash. Can\'t move.' }),
  makeEntry(26, { pain: 7, fatigue: 8, sleep: 10, mood: 2,
    activity: 'low' }),
  makeEntry(25, { pain: 5, fatigue: 7, sleep: 9, mood: 2 }),
  makeEntry(24, { pain: 4, fatigue: 5, sleep: 8, mood: 3 }),
  makeEntry(23, { pain: 3, fatigue: 4, sleep: 7.5, mood: 4 }),
  makeEntry(22, { pain: 4, fatigue: 5, sleep: 5.5, mood: 3,
    triggers: { ...emptyTriggers(), poor_sleep: true },
    note: 'Pain woke me up at 3am.' }),
  makeEntry(21, { pain: 7, fatigue: 8, sleep: 7, mood: 1,
    note: 'Sleep deprivation made everything worse.' }),
  makeEntry(20, { pain: 5, fatigue: 6, sleep: 8.5, mood: 2 }),
  makeEntry(19, { pain: 4, fatigue: 5, sleep: 8, mood: 3 }),
  makeEntry(18, { pain: 3, fatigue: 4, sleep: 7.5, mood: 4 }),
  makeEntry(17, { pain: 2, fatigue: 3, sleep: 8, mood: 5,
    activity: 'high', note: 'Good day! Went for a short walk.' }),
  makeEntry(16, { pain: 5, fatigue: 8, sleep: 10, mood: 2,
    activity: 'low', note: 'Regretting yesterday\'s walk.' }),
  makeEntry(15, { pain: 6, fatigue: 8, sleep: 10, mood: 1 }),
  makeEntry(14, { pain: 5, fatigue: 7, sleep: 9, mood: 2 }),
  makeEntry(13, { pain: 4, fatigue: 5, sleep: 8, mood: 3 }),
  makeEntry(12, { pain: 3, fatigue: 4, sleep: 7.5, mood: 4 }),
  makeEntry(11, { pain: 4, fatigue: 5, sleep: 5, mood: 3,
    triggers: { ...emptyTriggers(), poor_sleep: true, stress: true } }),
  makeEntry(10, { pain: 8, fatigue: 9, sleep: 8, mood: 1,
    note: 'Worst pain day this month.' }),
  makeEntry(9,  { pain: 6, fatigue: 7, sleep: 9, mood: 2 }),
  makeEntry(8,  { pain: 5, fatigue: 6, sleep: 8, mood: 3 }),
  makeEntry(7,  { pain: 4, fatigue: 5, sleep: 7.5, mood: 3 }),
  makeEntry(6,  { pain: 3, fatigue: 4, sleep: 8, mood: 4 }),
  makeEntry(5,  { pain: 2, fatigue: 3, sleep: 8, mood: 4,
    activity: 'high', note: 'Felt okay, did some stretching.' }),
  makeEntry(4,  { pain: 5, fatigue: 8, sleep: 10, mood: 2,
    activity: 'low', note: 'Crash again after activity.' }),
  makeEntry(3,  { pain: 6, fatigue: 8, sleep: 10, mood: 1 }),
  makeEntry(2,  { pain: 4, fatigue: 6, sleep: 8.5, mood: 3 }),
  makeEntry(1,  { pain: 4, fatigue: 5, sleep: 7, mood: 3,
    triggers: { ...emptyTriggers(), poor_sleep: true } }),
]

// helper
function emptyTriggers(): TriggerMap {
  return {
    gluten:       false,
    dairy:        false,
    sugar:        false,
    caffeine:     false,
    alcohol:      false,
    stress:       false,
    poor_sleep:   false,
    overexertion: false,
  }
}

export type ScenarioKey = 'sarah_pcos' | 'emma_endo' | 'maya_fibro'

export const SCENARIOS: Record<ScenarioKey, {
  label:     string
  persona:   string
  condition: string
  emoji:     string
  data:      LogEntry[]
  patterns:  string[]
}> = {
  sarah_pcos: {
    label:     'Sarah, 28 — PCOS',
    persona:   'Office worker, Seoul',
    condition: 'PCOS',
    emoji:     '🌸',
    data:      SARAH_PCOS,
    patterns:  [
      'Gluten intake → pain spike next day',
      'Sleep < 6h → fatigue surge',
      'Stress + gluten = worst flares',
    ],
  },
  emma_endo: {
    label:     'Emma, 32 — Endometriosis',
    persona:   'Teacher, London',
    condition: 'Endometriosis',
    emoji:     '��',
    data:      EMMA_ENDO,
    patterns:  [
      'Stress → flare within 24h',
      'High activity → fatigue crash next day',
      'Stress + alcohol = severe flare',
    ],
  },
  maya_fibro: {
    label:     'Maya, 45 — Fibromyalgia',
    persona:   'Remote worker, Toronto',
    condition: 'Fibromyalgia',
    emoji:     '💜',
    data:      MAYA_FIBRO,
    patterns:  [
      'Post-exertion malaise (PEM) pattern',
      'Sleep < 6h → pain spike next day',
      'Good day → 2-day crash follows',
    ],
  },
}

// ─── localStorage 주입 / 제거 ──────────────────────────────────────────────

export function injectMockData(key: ScenarioKey): void {
  const scenario = SCENARIOS[key]
  const logs: Record<string, LogEntry> = {}
  scenario.data.forEach(entry => {
    logs[entry.id] = entry
  })
  localStorage.setItem(LOGS_KEY, JSON.stringify(logs))
}

export function clearMockData(): void {
  localStorage.removeItem(LOGS_KEY)
}

export function getCurrentScenario(): ScenarioKey | null {
  const raw = localStorage.getItem(LOGS_KEY)
  if (!raw) return null
  try {
    const logs = JSON.parse(raw) as Record<string, LogEntry>
    const first = Object.values(logs)[0]
    if (first?.userId === 'mock-user') {
      // userId로 시나리오 구분 불가 → 데이터 크기로 추정
      return Object.keys(logs).length >= 28 ? 'sarah_pcos' : null
    }
  } catch { /* ignore */ }
  return null
}
