import type { PagesFunction } from '@cloudflare/workers-types'

interface Env {
  POLAR_ACCESS_TOKEN: string
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Content-Type': 'application/json',
}

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const { successUrl, userEmail } = await context.request.json() as {
      successUrl: string
      userEmail: string
    }

    const response = await fetch('https://api.polar.sh/v1/checkouts/', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${context.env.POLAR_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        product_id:     'd2a91a4d-e453-4107-9b28-9b1c81211ada',
        success_url:    successUrl,
        customer_email: userEmail,
      }),
    })

    const data = await response.json() as { url?: string; id?: string; error?: string }

    if (!response.ok || !data.url) {
      return new Response(JSON.stringify({ error: 'Failed to create checkout', detail: data }), {
        status: 500,
        headers: CORS_HEADERS,
      })
    }

    return new Response(JSON.stringify({ url: data.url, id: data.id }), {
      status: 200,
      headers: CORS_HEADERS,
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: CORS_HEADERS,
    })
  }
}
