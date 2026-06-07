interface Env {
  ANTHROPIC_API_KEY: string
}

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export const onRequestOptions = () => new Response(null, { headers: CORS })

const MOCK_ANALYSIS = {
  summary: "Your symptoms show a clear pattern linked to sleep and dietary triggers.",
  patterns: [
    {
      title: "Sleep strongly affects pain levels",
      description: "On days with less than 6 hours of sleep, your pain score is on average 40% higher than well-rested days.",
      severity: "negative"
    },
    {
      title: "Caffeine linked to fatigue spikes",
      description: "Your fatigue scores are consistently 2-3 points higher the day after caffeine consumption.",
      severity: "negative"
    },
    {
      title: "Medium activity days are your best days",
      description: "Days with medium activity level correlate with your lowest combined pain and fatigue scores.",
      severity: "positive"
    }
  ],
  topTriggers: [
    { trigger: "Poor sleep", impact: "Increases pain by ~40% the following day" },
    { trigger: "Caffeine", impact: "Elevates fatigue scores 2-3 points next day" },
    { trigger: "Stress", impact: "Correlates with both higher pain and fatigue" }
  ],
  doctorPoints: [
    "My pain levels are consistently higher after less than 6 hours of sleep",
    "I have logged X flare days in the past 30 days with average pain of Y",
    "Caffeine appears to be a significant fatigue trigger for me"
  ]
}

export const onRequestPost: PagesFunction<Env> = async (ctx) => {
  try {
    const { logs, userName } = await ctx.request.json() as {
      logs: Record<string, unknown>[]
      userName: string
    }

    if (!logs || logs.length === 0) {
      return Response.json({ error: 'No data provided' }, { status: 400, headers: CORS })
    }

    // Use real API if credit is available, otherwise use mock
    const apiKey = ctx.env.ANTHROPIC_API_KEY
    if (apiKey) {
      const prompt = `You are a public health expert (MPH) analyzing symptom data for a chronic illness patient.
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
        const data = await response.json() as {
          content: { type: string; text: string }[]
        }
        const text = data.content[0]?.text ?? ''
        try {
          const analysis = JSON.parse(text)
          return Response.json({ analysis }, { headers: CORS })
        } catch {
          return Response.json({ analysis: MOCK_ANALYSIS, mock: true }, { headers: CORS })
        }
      }
    }

    // Fallback to mock
    await new Promise(r => setTimeout(r, 1500)) // simulate API delay
    return Response.json({ analysis: MOCK_ANALYSIS, mock: true }, { headers: CORS })

  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : 'Unknown error' },
      { status: 500, headers: CORS }
    )
  }
}
