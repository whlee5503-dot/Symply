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
    const { checkoutId } = await context.request.json() as { checkoutId: string }

    if (!checkoutId) {
      return new Response(JSON.stringify({ error: 'checkoutId required' }), {
        status: 400,
        headers: CORS_HEADERS,
      })
    }

    // Polar에서 checkout 상태 확인
    const res = await fetch(`https://sandbox-api.polar.sh/v1/checkouts/${checkoutId}`, {
      headers: {
        Authorization: `Bearer ${context.env.POLAR_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
    })

    if (!res.ok) {
      return new Response(JSON.stringify({ error: 'Failed to verify' }), {
        status: 502,
        headers: CORS_HEADERS,
      })
    }

    const data = await res.json() as {
      status: string
      customer_email?: string
      product_id?: string
    }

    if (data.status !== 'succeeded') {
      return new Response(JSON.stringify({ ok: false, status: data.status }), {
        status: 402,
        headers: CORS_HEADERS,
      })
    }

    return new Response(JSON.stringify({ ok: true, status: data.status }), {
      headers: CORS_HEADERS,
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: CORS_HEADERS,
    })
  }
}
