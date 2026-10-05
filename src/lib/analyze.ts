import { auth } from './firebase'

// Returns the signed-in user's Firebase ID token as an Authorization header.
// Returns an empty object if nobody is signed in (the server will answer 401).
// Pass forceRefresh = true to fetch a fresh token instead of the cached one.
async function getAuthHeader(forceRefresh = false): Promise<Record<string, string>> {
  const user = auth.currentUser
  if (!user) return {}
  const token = await user.getIdToken(forceRefresh)
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

// Thrown when the server refuses because the user is a guest (anonymous sign-in).
export class LoginRequiredError extends Error {
  constructor() {
    super('login_required')
  }
}

export async function runAnalysis(
  logs: unknown[],
  language = 'en',
  cycleData?: CycleSummary
): Promise<AIAnalysis> {
  const send = async (forceRefresh: boolean) =>
    fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(await getAuthHeader(forceRefresh)) },
      body: JSON.stringify({ logs, language, cycleData }),
    })

  let res = await send(false)
  // A guest who just upgraded to a real account still holds a cached token that
  // says "anonymous" (valid up to an hour). Refresh the token once and retry.
  if (res.status === 403) {
    res = await send(true)
    if (res.status === 403) throw new LoginRequiredError()
  }
  if (res.status === 429) throw new AnalysisQuotaError('limit')
  if (res.status === 409) throw new AnalysisQuotaError('busy')
  const data = await res.json() as { analysis?: AIAnalysis; error?: string; mock?: boolean }
  if (data.error) throw new Error(data.error)
  const analysis = data.analysis ?? null
  if (!analysis) throw new Error('No analysis returned')
  if (data.mock) analysis.mock = true
  return analysis
}