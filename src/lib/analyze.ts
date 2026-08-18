export interface CycleSummary {
  hasCycleData: boolean
  menstruatingDays: string[]    // YYYY-MM-DD[]
  cycleLengthEstimate?: number  // 추정 주기 (일)
  preMenstrualDays: string[]    // 생리 2~5일 전
  conditions: string[]          // ['PCOS', 'endometriosis', ...]
}

export interface AIAnalysis {
  patterns: { title: string; description: string; severity: 'positive' | 'neutral' | 'negative' }[]
  topTriggers: { trigger: string; impact: string }[]
  doctorPoints: string[]
  summary: string
  mock?: boolean
}

export async function runAnalysis(
  logs: unknown[],
  language = 'en',
  cycleData?: CycleSummary
): Promise<AIAnalysis> {
  const res = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ logs, language, cycleData }),
  })
  const data = await res.json() as { analysis?: AIAnalysis; error?: string; mock?: boolean }
  if (data.error) throw new Error(data.error)
  const analysis = data.analysis ?? null
  if (!analysis) throw new Error('No analysis returned')
  if (data.mock) analysis.mock = true
  return analysis
}
