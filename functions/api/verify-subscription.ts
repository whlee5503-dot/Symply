import type { PagesFunction } from '@cloudflare/workers-types'
import { verifyFirebaseUser } from './_auth'
import { activatePro, type FirestoreEnv } from './_firestore'

interface Env extends FirestoreEnv {
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
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    // 1) Only signed-in, non-guest users can activate Pro.
    const user = await verifyFirebaseUser(context.request as unknown as Request)
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: CORS_HEADERS,
      })
    }
    if (user.isAnonymous) {
      return new Response(JSON.stringify({ error: 'login_required' }), {
        status: 403,
        headers: CORS_HEADERS,
      })
    }

    const { checkoutId } = await context.request.json() as { checkoutId: string }

    if (!checkoutId) {
      return new Response(JSON.stringify({ error: 'checkoutId required' }), {
        status: 400,
        headers: CORS_HEADERS,
      })
    }

    // 2) Ask Polar about this checkout.
    const res = await fetch(`https://api.polar.sh/v1/checkouts/${encodeURIComponent(checkoutId)}`, {
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
      metadata?: Record<string, unknown>
    }

    if (data.status !== 'succeeded') {
      return new Response(JSON.stringify({ ok: false, status: data.status }), {
        status: 402,
        headers: CORS_HEADERS,
      })
    }

    // 3) The checkout must belong to THIS user (uid was attached when it was created).
    if (data.metadata?.uid !== user.uid) {
      return new Response(JSON.stringify({ error: 'checkout_mismatch' }), {
        status: 403,
        headers: CORS_HEADERS,
      })
    }

    // 4) The server, not the browser, writes plan = 'pro'.
    await activatePro(context.env, user.uid)

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