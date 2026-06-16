interface Env {
  ANTHROPIC_API_KEY: string
}

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export const onRequestOptions = () => new Response(null, { headers: CORS })

const MOCK_ANALYSIS_EN = {
  summary: "Your symptoms show a clear pattern linked to sleep and dietary triggers.",
  patterns: [
    { title: "Sleep strongly affects pain levels", description: "On days with less than 6 hours of sleep, your pain score is on average 40% higher than well-rested days.", severity: "negative" },
    { title: "Caffeine linked to fatigue spikes", description: "Your fatigue scores are consistently 2-3 points higher the day after caffeine consumption.", severity: "negative" },
    { title: "Medium activity days are your best days", description: "Days with medium activity level correlate with your lowest combined pain and fatigue scores.", severity: "positive" }
  ],
  topTriggers: [
    { trigger: "Poor sleep", impact: "Increases pain by ~40% the following day" },
    { trigger: "Caffeine", impact: "Elevates fatigue scores 2-3 points next day" },
    { trigger: "Stress", impact: "Correlates with both higher pain and fatigue" }
  ],
  doctorPoints: [
    "My pain levels are consistently higher after less than 6 hours of sleep",
    "I have noticed caffeine is a significant fatigue trigger for me",
    "Medium activity days show the best overall symptom control"
  ]
}

const MOCK_ANALYSIS_KO = {
  summary: "수면과 식이 트리거와 관련된 명확한 증상 패턴이 나타납니다.",
  patterns: [
    { title: "수면이 통증 수준에 강하게 영향을 미침", description: "수면 6시간 미만인 날의 통증 점수는 충분히 잔 날보다 평균 40% 높습니다.", severity: "negative" },
    { title: "카페인이 피로 급증과 연관됨", description: "카페인 섭취 다음 날 피로 점수가 일관되게 2~3점 더 높습니다.", severity: "negative" },
    { title: "중간 활동량인 날이 가장 좋은 날", description: "중간 활동량인 날은 통증과 피로의 합산 점수가 가장 낮습니다.", severity: "positive" }
  ],
  topTriggers: [
    { trigger: "수면 부족", impact: "다음 날 통증을 약 40% 증가시킴" },
    { trigger: "카페인", impact: "다음 날 피로 점수를 2~3점 높임" },
    { trigger: "스트레스", impact: "통증과 피로 모두 높은 날과 연관됨" }
  ],
  doctorPoints: [
    "수면 6시간 미만인 날 이후 통증이 일관되게 높아집니다",
    "카페인이 저에게 주요 피로 트리거인 것 같습니다",
    "중간 활동량인 날에 전반적인 증상 조절이 가장 잘 됩니다"
  ]
}

const MOCK_ANALYSIS_ES = {
  summary: "Tus síntomas muestran un patrón claro relacionado con el sueño y los desencadenantes dietéticos.",
  patterns: [
    { title: "El sueño afecta fuertemente los niveles de dolor", description: "En días con menos de 6 horas de sueño, tu puntuación de dolor es un 40% más alta en promedio.", severity: "negative" },
    { title: "La cafeína se relaciona con picos de fatiga", description: "Tus puntuaciones de fatiga son consistentemente 2-3 puntos más altas al día siguiente del consumo de cafeína.", severity: "negative" },
    { title: "Los días de actividad media son tus mejores días", description: "Los días con nivel de actividad media se correlacionan con tus puntuaciones más bajas de dolor y fatiga.", severity: "positive" }
  ],
  topTriggers: [
    { trigger: "Poco sueño", impact: "Aumenta el dolor ~40% al día siguiente" },
    { trigger: "Cafeína", impact: "Eleva la fatiga 2-3 puntos al día siguiente" },
    { trigger: "Estrés", impact: "Se correlaciona con mayor dolor y fatiga" }
  ],
  doctorPoints: [
    "Mis niveles de dolor son consistentemente más altos después de menos de 6 horas de sueño",
    "La cafeína parece ser un desencadenante significativo de fatiga para mí",
    "Los días de actividad media muestran el mejor control general de síntomas"
  ]
}

const LANG_INSTRUCTION: Record<string, string> = {
  ko: 'IMPORTANT: You must respond entirely in Korean (한국어). All text including titles, descriptions, triggers, and doctor points must be in Korean.',
  es: 'IMPORTANT: You must respond entirely in Spanish (Español). All text including titles, descriptions, triggers, and doctor points must be in Spanish.',
  en: 'Respond in English.',
}

export const onRequestPost: PagesFunction<Env> = async (ctx) => {
  try {
    const { logs, userName, language = 'en' } = await ctx.request.json() as {
      logs: Record<string, unknown>[]
      userName: string
      language?: string
    }

    if (!logs || logs.length === 0) {
      return Response.json({ error: 'No data provided' }, { status: 400, headers: CORS })
    }

    const mockAnalysis = language === 'ko' ? MOCK_ANALYSIS_KO : language === 'es' ? MOCK_ANALYSIS_ES : MOCK_ANALYSIS_EN
    const langInstruction = LANG_INSTRUCTION[language] ?? LANG_INSTRUCTION.en

    const apiKey = ctx.env.ANTHROPIC_API_KEY
    if (apiKey) {
      const prompt = `You are a public health expert (MPH) analyzing symptom data for a chronic illness patient.
${langInstruction}
Analyze the following ${logs.length} days of symptom data and provide personalized insights.

Patient: ${userName}
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

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 1024,
          messages: [{ role: 'user', content: prompt }],
        }),
      })

      if (response.ok) {
        const data = await response.json() as { content: { type: string; text: string }[] }
        const text = data.content[0]?.text ?? ''
        try {
          const analysis = JSON.parse(text)
          return Response.json({ analysis }, { headers: CORS })
        } catch {
          return Response.json({ analysis: mockAnalysis, mock: true }, { headers: CORS })
        }
      }
    }

    await new Promise(r => setTimeout(r, 1500))
    return Response.json({ analysis: mockAnalysis, mock: true }, { headers: CORS })

  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : 'Unknown error' },
      { status: 500, headers: CORS }
    )
  }
}
