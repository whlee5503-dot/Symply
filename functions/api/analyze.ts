import { verifyFirebaseUser } from './_auth'
import { reserveAiCall, type FirestoreEnv } from './_firestore'

interface Env extends FirestoreEnv {
  ANTHROPIC_API_KEY: string
  RELAY_SECRET?: string
}
interface CycleSummary {
  hasCycleData: boolean
  menstruatingDays: string[]
  cycleLengthEstimate?: number
  preMenstrualDays: string[]
  conditions: string[]
}

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type , Authorization',
}

export const onRequestOptions = () => new Response(null, { headers: CORS })

const MOCK_ANALYSIS_EN = {
  summary: "Your symptoms show clear patterns linked to your menstrual cycle, sleep, and dietary triggers.",
  patterns: [
    { title: "Pain peaks 2–3 days before menstruation", description: "Your pain scores are on average 40% higher in the 2–3 days preceding your period, consistent with premenstrual symptom patterns common in endometriosis and PCOS.", severity: "negative" },
    { title: "Sleep strongly affects next-day pain", description: "On days with less than 6 hours of sleep, your pain score is on average 35% higher than well-rested days.", severity: "negative" },
    { title: "Medium activity days are your best days", description: "Days with medium activity level correlate with your lowest combined pain and fatigue scores.", severity: "positive" }
  ],
  topTriggers: [
    { trigger: "Pre-menstrual phase", impact: "Pain increases ~40% in the 2–3 days before your period" },
    { trigger: "Poor sleep", impact: "Increases pain by ~35% the following day" },
    { trigger: "Stress", impact: "Correlates with both higher pain and fatigue" }
  ],
  doctorPoints: [
    "My pain consistently spikes 2–3 days before my period, suggesting premenstrual flares",
    "Sleep under 6 hours reliably increases my next-day pain levels",
    "Medium activity days show the best overall symptom control"
  ]
}

const MOCK_ANALYSIS_KO = {
  summary: "생리 주기, 수면, 식이 트리거와 관련된 명확한 증상 패턴이 나타납니다.",
  patterns: [
    { title: "생리 2~3일 전 통증이 급증", description: "생리 시작 2~3일 전 통증 점수가 평균 40% 높아집니다. 자궁내막증·PCOS에서 흔히 나타나는 월경 전 증상 패턴과 일치합니다.", severity: "negative" },
    { title: "수면이 다음 날 통증에 강하게 영향", description: "수면 6시간 미만인 날의 다음 날 통증 점수가 충분히 잔 날보다 평균 35% 높습니다.", severity: "negative" },
    { title: "중간 활동량인 날이 가장 좋은 날", description: "중간 활동량인 날은 통증과 피로의 합산 점수가 가장 낮습니다.", severity: "positive" }
  ],
  topTriggers: [
    { trigger: "월경 전 구간", impact: "생리 2~3일 전 통증이 약 40% 상승" },
    { trigger: "수면 부족", impact: "다음 날 통증을 약 35% 증가시킴" },
    { trigger: "스트레스", impact: "통증과 피로 모두 높은 날과 연관됨" }
  ],
  doctorPoints: [
    "생리 2~3일 전 통증이 일관되게 급증합니다 — 월경 전 플레어가 의심됩니다",
    "수면 6시간 미만인 날 이후 통증이 일관되게 높아집니다",
    "중간 활동량인 날에 전반적인 증상 조절이 가장 잘 됩니다"
  ]
}

const MOCK_ANALYSIS_ES = {
  summary: "Tus síntomas muestran patrones claros vinculados a tu ciclo menstrual, el sueño y los desencadenantes dietéticos.",
  patterns: [
    { title: "El dolor aumenta 2–3 días antes de la menstruación", description: "Tus puntuaciones de dolor son un 40% más altas en los 2–3 días previos a tu periodo, coherente con los patrones premenstruales de endometriosis y SOP.", severity: "negative" },
    { title: "El sueño afecta fuertemente el dolor del día siguiente", description: "Con menos de 6 horas de sueño, tu puntuación de dolor es un 35% más alta al día siguiente.", severity: "negative" },
    { title: "Los días de actividad media son tus mejores días", description: "Los días con nivel de actividad media se correlacionan con tus puntuaciones más bajas de dolor y fatiga.", severity: "positive" }
  ],
  topTriggers: [
    { trigger: "Fase premenstrual", impact: "El dolor aumenta ~40% en los 2–3 días antes del periodo" },
    { trigger: "Poco sueño", impact: "Aumenta el dolor ~35% al día siguiente" },
    { trigger: "Estrés", impact: "Se correlaciona con mayor dolor y fatiga" }
  ],
  doctorPoints: [
    "Mi dolor aumenta consistentemente 2–3 días antes de mi periodo, lo que sugiere brotes premenstruales",
    "Dormir menos de 6 horas aumenta de manera fiable mis niveles de dolor al día siguiente",
    "Los días de actividad media muestran el mejor control general de síntomas"
  ]
}

const LANG_INSTRUCTION: Record<string, string> = {
  ko: 'IMPORTANT: You must respond entirely in Korean (한국어). All text including titles, descriptions, triggers, and doctor points must be in Korean.',
  es: 'IMPORTANT: You must respond entirely in Spanish (Español). All text including titles, descriptions, triggers, and doctor points must be in Spanish.',
  en: 'Respond in English.',
}

function buildCycleSection(cycleData: CycleSummary): string {
  if (!cycleData.hasCycleData) {
    return `\nCYCLE DATA: Patient has ${cycleData.conditions.join(', ')} but has not yet logged menstrual cycle data. Do not speculate on cycle patterns.\n`
  }

  const lines = [
    `\nMENSTRUAL CYCLE DATA (integrate into pattern analysis):`,
    `- Conditions: ${cycleData.conditions.join(', ')}`,
    `- Days with menstruation logged: ${cycleData.menstruatingDays.join(', ')}`,
    `- Estimated cycle length: ${cycleData.cycleLengthEstimate ? `${cycleData.cycleLengthEstimate} days` : 'insufficient data'}`,
    `- Premenstrual days (2–5 days before period start): ${cycleData.preMenstrualDays.join(', ')}`,
    ``,
    `Please cross-reference pain/fatigue scores on menstruating days and premenstrual days vs. other days.`,
    `If a pattern exists (e.g., pain 3+ points higher premenstrually), quantify it with actual numbers from the data.`,
    `If no clear cycle-symptom correlation is found, state that explicitly rather than speculating.\n`,
  ]
  return lines.join('\n')
}

// Mirrors buildCycleSection's approach: only fires when the data actually
// supports it, gives the model an explicit instruction (rather than hoping
// it notices on its own inside a large JSON blob), and — matching the same
// honesty principle used everywhere else in this app (see
// docs/TRIGGER_EVIDENCE.md's "don't overclaim" stance) — requires it to say
// so explicitly when no pattern is found, instead of inventing one.
function buildTimingSection(logs: Record<string, unknown>[]): string {
  const hasTimingData = logs.some(log => {
    const meds = (log as { medications?: { timeOfDay?: string }[] }).medications
    const triggerTimings = (log as { triggerTimings?: Record<string, string> }).triggerTimings
    return (meds?.some(m => m.timeOfDay)) || (triggerTimings && Object.keys(triggerTimings).length > 0)
  })

  if (!hasTimingData) return ''

  const lines = [
    `\nMEDICATION/TRIGGER TIMING DATA (integrate into pattern analysis):`,
    `Some log entries include a "timeOfDay" value (morning/midday/evening/bedtime) on medications and on certain triggers (e.g. caffeine, dairy) — this records roughly WHEN each occurred that day, not just whether it happened.`,
    ``,
    `Check whether the GAP between a medication's timeOfDay and a trigger's timeOfDay on the same day correlates with that day's pain/fatigue scores — e.g. "taken 2+ time-buckets apart" vs. "taken in the same or an adjacent bucket". This can surface absorption-interaction patterns (e.g. certain supplements vs. caffeine or dairy) the patient may not have consciously tracked.`,
    `If such a pattern exists, quantify it with actual numbers from the data (how many days in each group, and the average score for each) rather than a vague claim.`,
    `If there isn't enough timing-tagged data yet, or no clear difference between the separated/together groups, state that explicitly — a small sample size is a real limitation here, name it rather than speculating.\n`,
  ]
  return lines.join('\n')
}

const LIMITED_DATA_DAYS = 14

// Keeps the model honest: describe what was logged, do not diagnose or guess.
function buildSafetySection(logCount: number): string {
  const lines = [
    `\nSAFETY AND HONESTY RULES (always apply):`,
    `- Describe only what is visible in the data. Do not diagnose, and do not speculate about causes that are not in the data (for example inflammation, nerve sensitivity, depression or anxiety).`,
    `- Do not recommend starting, stopping or changing any medication or treatment.`,
    `- Doctor points must be factual observations about the logged values (what was recorded and how it changed), phrased as things to discuss, never as conclusions.`,
    `- A persistently low mood score may be reported as a recorded value worth mentioning to the doctor, without naming any condition.`,
  ]
  if (logCount < LIMITED_DATA_DAYS) {
    lines.push(
      `- LIMITED DATA: only ${logCount} day(s) were logged. A few days cannot show a trend, so do not describe trends, improvement or worsening. Report the recorded values, say plainly that about ${LIMITED_DATA_DAYS - logCount} more day(s) of logging are needed before patterns can be identified, and use "neutral" severity for every pattern.`,
    )
  }
  return lines.join('\n') + '\n'
}

export const onRequestPost: PagesFunction<Env> = async (ctx) => {
  let refund: () => Promise<void> = async () => { }
  try {
    const user = await verifyFirebaseUser(ctx.request)
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401, headers: CORS })
    }
    // Guests (anonymous auth) get a fresh account after reinstalling, which would
    // reset the free monthly limit. Only signed-in accounts can use AI analysis.
    if (user.isAnonymous) {
      return Response.json({ error: 'login_required' }, { status: 403, headers: CORS })
    }

    const { logs, language = 'en', cycleData } = await ctx.request.json() as {
      logs: Record<string, unknown>[]
      language?: string
      cycleData?: CycleSummary
    }

    if (!logs || logs.length === 0) {
      return Response.json({ error: 'No data provided' }, { status: 400, headers: CORS })
    }

    const mockAnalysis = language === 'ko' ? MOCK_ANALYSIS_KO : language === 'es' ? MOCK_ANALYSIS_ES : MOCK_ANALYSIS_EN
    const langInstruction = LANG_INSTRUCTION[language] ?? LANG_INSTRUCTION.en
    const cycleSection = cycleData ? buildCycleSection(cycleData) : ''
    const timingSection = buildTimingSection(logs)
    const safetySection = buildSafetySection(logs.length)

    const apiKey = ctx.env.ANTHROPIC_API_KEY
    if (apiKey) {
      const quota = await reserveAiCall(ctx.env, user.uid)
      if (!quota.ok) {
        const status = quota.reason === 'limit' ? 429 : 409
        return Response.json({ error: quota.reason }, { status, headers: CORS })
      }
      refund = quota.refund
    }

    if (apiKey) {
      const prompt = `You are a public health expert (MPH) analyzing symptom data for a chronic illness patient.
${langInstruction}
Analyze the following ${logs.length} days of symptom data and provide personalized insights.
${cycleSection}${timingSection}${safetySection}
Data (JSON):
${JSON.stringify(logs, null, 2)}

Please provide your analysis in the following JSON format only (no markdown, no extra text):
{
  "patterns": [
    { "title": "Pattern title", "description": "Detailed description with specific numbers from the data", "severity": "positive|neutral|negative" }
  ],
  "topTriggers": [
    { "trigger": "trigger name", "impact": "description of impact on symptoms" }
  ],
  "doctorPoints": [
    "Key point 1 to discuss with doctor",
    "Key point 2 to discuss with doctor",
    "Key point 3 to discuss with doctor"
  ],
  "summary": "One sentence overall summary"
}`

      // When RELAY_SECRET is set, go through the relay Worker (pinned to a supported region).
      const relaySecret = ctx.env.RELAY_SECRET
      const response = await fetch(
        relaySecret ? 'https://anthropic-relay-test.whlee5503.workers.dev' : 'https://api.anthropic.com/v1/messages',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            ...(relaySecret ? { 'X-Relay-Secret': relaySecret } : {}),
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-6',
            max_tokens: 4096,
            messages: [{ role: 'user', content: prompt }],
          }),
        },
      )

      if (response.ok) {
        const data = await response.json() as { content: { type: string; text: string }[]; stop_reason?: string }
        const text = data.content[0]?.text ?? ''
        try {
          // The model sometimes wraps the JSON in a ```json fence; keep only the outermost {...}.
          const start = text.indexOf('{')
          const end = text.lastIndexOf('}')
          const analysis = JSON.parse(start >= 0 && end > start ? text.slice(start, end + 1) : text)
          return Response.json({ analysis }, { headers: CORS })
        } catch {
          console.error('Anthropic JSON parse failed', {
            length: text.length,
            startsWithFence: text.trimStart().startsWith('```'),
            stopReason: data.stop_reason,
          })
          await refund()
          return Response.json({ error: 'ai_unavailable' }, { status: 502, headers: CORS })
        }
      }
      console.error('Anthropic API error', response.status, (await response.text()).slice(0, 300))
      await refund()
      return Response.json({ error: 'ai_unavailable' }, { status: 502, headers: CORS })
    }

    await new Promise(r => setTimeout(r, 1500))
    return Response.json({ analysis: mockAnalysis, mock: true }, { headers: CORS })

  } catch (e) {
    await refund()
    return Response.json(
      { error: e instanceof Error ? e.message : 'Unknown error' },
      { status: 500, headers: CORS }
    )
  }
}