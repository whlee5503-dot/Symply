import type { PagesFunction } from '@cloudflare/workers-types'
import { deactivatePro, type FirestoreEnv } from './_firestore'

interface Env extends FirestoreEnv {
  // Webhook secret from the Polar dashboard, stored as a Cloudflare secret.
  POLAR_WEBHOOK_SECRET: string
}

interface PolarEvent {
  type: string
  data?: {
    status?: string
    metadata?: Record<string, unknown>
  }
}

const TOLERANCE_SECONDS = 5 * 60

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function utf8Bytes(text: string): ArrayBuffer {
  return new TextEncoder().encode(text).buffer as ArrayBuffer
}

function base64ToBuffer(b64: string): ArrayBuffer | null {
  try {
    const bin = atob(b64)
    const bytes = new Uint8Array(bin.length)
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
    return bytes.buffer as ArrayBuffer
  } catch {
    return null
  }
}

function bufferToBase64(buf: ArrayBuffer): string {
  let bin = ''
  for (const b of new Uint8Array(buf)) bin += String.fromCharCode(b)
  return btoa(bin)
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

// Polar signs with one of two key schemes depending on when the secret was created:
// - older secrets: the UTF-8 bytes of the whole secret string
// - newer secrets (Standard Webhooks): the base64-decoded part after "whsec_"
// Both are tried, so the receiver keeps working after a secret reset.
function candidateKeys(secret: string): ArrayBuffer[] {
  const keys = [utf8Bytes(secret)]
  if (secret.startsWith('whsec_')) {
    const decoded = base64ToBuffer(secret.slice('whsec_'.length))
    if (decoded) keys.push(decoded)
  }
  return keys
}

async function isValidSignature(request: Request, rawBody: string, secret: string): Promise<boolean> {
  const id = request.headers.get('webhook-id')
  const timestamp = request.headers.get('webhook-timestamp')
  const header = request.headers.get('webhook-signature')
  if (!id || !timestamp || !header) return false

  const ts = Number(timestamp)
  if (!Number.isFinite(ts) || Math.abs(Date.now() / 1000 - ts) > TOLERANCE_SECONDS) return false

  // Header looks like "v1,<base64>" (possibly several, separated by spaces).
  const provided = header
    .split(' ')
    .filter((part) => part.startsWith('v1,'))
    .map((part) => part.slice(3))
  if (provided.length === 0) return false

  const signedContent = utf8Bytes(`${id}.${timestamp}.${rawBody}`)
  for (const keyBytes of candidateKeys(secret)) {
    const key = await crypto.subtle.importKey(
      'raw',
      keyBytes,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign'],
    )
    const expected = bufferToBase64(await crypto.subtle.sign('HMAC', key, signedContent))
    if (provided.some((sig) => safeEqual(sig, expected))) return true
  }
  return false
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const secret = context.env.POLAR_WEBHOOK_SECRET
  if (!secret) {
    console.error('webhook: POLAR_WEBHOOK_SECRET is not set')
    return json({ error: 'server_misconfigured' }, 500)
  }

  // Signature must be checked against the raw body, exactly as received.
  const rawBody = await context.request.text()
  const valid = await isValidSignature(context.request as unknown as Request, rawBody, secret)
  if (!valid) return json({ error: 'invalid_signature' }, 403)

  let event: PolarEvent
  try {
    event = JSON.parse(rawBody) as PolarEvent
  } catch {
    return json({ error: 'invalid_json' }, 400)
  }

  // Only two events end Pro access. Everything else is acknowledged and ignored,
  // because any non-2xx answer counts toward Polar disabling this endpoint.
  const endsAccess =
    event.type === 'subscription.revoked' ||
    (event.type === 'order.refunded' && event.data?.status === 'refunded')
  if (!endsAccess) return json({ ok: true, ignored: event.type }, 200)

  const uid = event.data?.metadata?.uid
  if (typeof uid !== 'string' || uid.length === 0) {
    console.error(`webhook: ${event.type} without metadata.uid, nothing downgraded`)
    return json({ ok: true, skipped: 'no_uid' }, 200)
  }

  try {
    await deactivatePro(context.env, uid)
  } catch (err) {
    console.error('webhook: deactivatePro failed', err)
    return json({ error: 'write_failed' }, 500) // Polar will retry
  }
  return json({ ok: true }, 200)
}