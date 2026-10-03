import { auth } from './firebase'

// Returns the signed-in user's Firebase ID token as an Authorization header.
// Returns an empty object if nobody is signed in (the server will answer 401).
async function getAuthHeader(): Promise<Record<string, string>> {
  const user = auth.currentUser
  if (!user) return {}
  const token = await user.getIdToken()
  return { Authorization: `Bearer ${token}` }
}

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

// Thrown when the server refuses the call: 'limit' = monthly free quota used up,
// 'busy' = another analysis for the same user is still being registered.
export class AnalysisQuotaError extends Error {
  reason: 'limit' | 'busy'
  constructor(reason: 'limit' | 'busy') {
    super(reason)
    this.reason = reason
  }
}

export async function runAnalysis(
  logs: unknown[],
  language = 'en',
  cycleData?: CycleSummary
): Promise<AIAnalysis> {
  const authHeader = await getAuthHeader()
  const res = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader },
    body: JSON.stringify({ logs, language, cycleData }),
  })
  if (res.status === 429) throw new AnalysisQuotaError('limit')
  if (res.status === 409) throw new AnalysisQuotaError('busy')
  const data = await res.json() as { analysis?: AIAnalysis; error?: string; mock?: boolean }
  if (data.error) throw new Error(data.error)
  const analysis = data.analysis ?? null
  if (!analysis) throw new Error('No analysis returned')
  if (data.mock) analysis.mock = true
  return analysis
}
