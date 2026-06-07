interface Env {
  ANTHROPIC_API_KEY: string
}

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export const onRequestOptions = () => new Response(null, { headers: CORS })

export const onRequestPost: PagesFunction<Env> = async (ctx) => {
  try {
    const { logs, userName } = await ctx.request.json() as {
      logs: Record<string, unknown>[]
      userName: string
    }

    if (!logs || logs.length === 0) {
      return Response.json({ error: 'No data provided' }, { status: 400, headers: CORS })
    }

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
        'x-api-key': ctx.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      return Response.json({ error: err }, { status: response.status, headers: CORS })
    }

    const data = await response.json() as {
      content: { type: string; text: string }[]
    }

    const text = data.content[0]?.text ?? ''

    let analysis
    try {
      analysis = JSON.parse(text)
    } catch {
      analysis = { raw: text }
    }

    return Response.json({ analysis }, { headers: CORS })

  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : 'Unknown error' },
      { status: 500, headers: CORS }
    )
  }
}
