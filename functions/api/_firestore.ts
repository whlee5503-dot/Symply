const PROJECT_ID = 'symply-7f93d'
const DOC_ROOT = `projects/${PROJECT_ID}/databases/(default)/documents`
const BASE = `https://firestore.googleapis.com/v1/${DOC_ROOT}`

// Free users get this many real AI analyses per calendar month.
export const FREE_MONTHLY_LIMIT = 5
// Value stored in users/{uid}.plan for paying users. Adjust if the app uses a different string.
const PRO_PLAN = 'pro'

export interface FirestoreEnv {
    // Entire service-account JSON, stored as a Cloudflare secret.
    FIREBASE_SERVICE_ACCOUNT: string
}

type FsValue = { stringValue?: string; integerValue?: string; doubleValue?: number }

// ---------- Service-account access token (JWT signed with Web Crypto) ----------

let cachedToken: { value: string; expiresAt: number } | null = null

function base64url(input: string | ArrayBuffer): string {
    const bytes = typeof input === 'string' ? new TextEncoder().encode(input) : new Uint8Array(input)
    let bin = ''
    for (const b of bytes) bin += String.fromCharCode(b)
    return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function pemToDer(pem: string): ArrayBuffer {
    const b64 = pem.replace(/-----[^-]+-----/g, '').replace(/\s+/g, '')
    const bin = atob(b64)
    const bytes = new Uint8Array(bin.length)
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
    return bytes.buffer
}

async function getAccessToken(env: FirestoreEnv): Promise<string> {
    const now = Math.floor(Date.now() / 1000)
    if (cachedToken && cachedToken.expiresAt - 60 > now) return cachedToken.value

    const sa = JSON.parse(env.FIREBASE_SERVICE_ACCOUNT) as { client_email: string; private_key: string }
    const header = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
    const claims = base64url(
        JSON.stringify({
            iss: sa.client_email,
            scope: 'https://www.googleapis.com/auth/datastore',
            aud: 'https://oauth2.googleapis.com/token',
            iat: now,
            exp: now + 3600,
        }),
    )

    const key = await crypto.subtle.importKey(
        'pkcs8',
        pemToDer(sa.private_key),
        { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
        false,
        ['sign'],
    )
    const signature = await crypto.subtle.sign(
        'RSASSA-PKCS1-v1_5',
        key,
        new TextEncoder().encode(`${header}.${claims}`),
    )

    const res = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            assertion: `${header}.${claims}.${base64url(signature)}`,
        }),
    })
    if (!res.ok) throw new Error(`Service account token exchange failed: ${res.status}`)

    const json = (await res.json()) as { access_token: string; expires_in: number }
    cachedToken = { value: json.access_token, expiresAt: now + json.expires_in }
    return json.access_token
}

// ---------- Firestore REST helpers ----------

interface UserUsage {
    plan: string | null
    count: number
    month: string | null
    updateTime: string | null // null = document does not exist yet
}

// IMPORTANT: must match the month format the client writes to aiCallMonth.
function currentMonthKey(): string {
    return new Date().toISOString().slice(0, 7) // e.g. "2026-10" (UTC)
}

async function readUserUsage(env: FirestoreEnv, uid: string): Promise<UserUsage> {
    const token = await getAccessToken(env)
    const res = await fetch(`${BASE}/users/${encodeURIComponent(uid)}`, {
        headers: { Authorization: `Bearer ${token}` },
    })
    if (res.status === 404) return { plan: null, count: 0, month: null, updateTime: null }
    if (!res.ok) throw new Error(`Firestore read failed: ${res.status}`)

    const doc = (await res.json()) as { fields?: Record<string, FsValue>; updateTime?: string }
    const f = doc.fields ?? {}
    const count = f.aiCallCount?.integerValue ?? f.aiCallCount?.doubleValue ?? 0
    return {
        plan: f.plan?.stringValue ?? null,
        count: Number(count),
        month: f.aiCallMonth?.stringValue ?? null,
        updateTime: doc.updateTime ?? null,
    }
}

async function commitWrite(env: FirestoreEnv, write: Record<string, unknown>): Promise<Response> {
    const token = await getAccessToken(env)
    return fetch(`${BASE}:commit`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ writes: [write] }),
    })
}

// ---------- Public API ----------

export type QuotaResult =
    | { ok: true; refund: () => Promise<void> }
    | { ok: false; reason: 'limit' | 'busy' }

// Reserves one AI call BEFORE the model is called.
// - Pro users: always allowed, nothing is counted.
// - Free users: blocked after FREE_MONTHLY_LIMIT calls in the current month.
// The write is guarded by the document's updateTime, so parallel requests
// cannot all pass the check at once (the losers get reason: 'busy').
// Call refund() if the AI call fails or falls back to mock output.
export async function reserveAiCall(env: FirestoreEnv, uid: string): Promise<QuotaResult> {
    const usage = await readUserUsage(env, uid)
    if (usage.plan === PRO_PLAN) return { ok: true, refund: async () => { } }

    const month = currentMonthKey()
    const used = usage.month === month ? usage.count : 0
    if (used >= FREE_MONTHLY_LIMIT) return { ok: false, reason: 'limit' }

    const docName = `${DOC_ROOT}/users/${encodeURIComponent(uid)}`
    const res = await commitWrite(env, {
        update: {
            name: docName,
            fields: {
                aiCallMonth: { stringValue: month },
                aiCallCount: { integerValue: String(used + 1) },
            },
        },
        updateMask: { fieldPaths: ['aiCallMonth', 'aiCallCount'] },
        currentDocument: usage.updateTime ? { updateTime: usage.updateTime } : { exists: false },
    })

    if (!res.ok) {
        const body = await res.text()
        if (body.includes('FAILED_PRECONDITION') || body.includes('ABORTED')) {
            return { ok: false, reason: 'busy' }
        }
        throw new Error(`Firestore write failed: ${res.status}`)
    }

    const refund = async () => {
        try {
            await commitWrite(env, {
                update: { name: docName },
                updateMask: { fieldPaths: [] },
                updateTransforms: [{ fieldPath: 'aiCallCount', increment: { integerValue: '-1' } }],
            })
        } catch {
            // Best effort: a failed refund only costs the user one free call.
        }
    }
    return { ok: true, refund }
}
// Called only by the server after a Polar payment has been verified.
// The browser must never write plan; Firestore security rules will enforce that.
export async function activatePro(env: FirestoreEnv, uid: string): Promise<void> {
    const docName = `${DOC_ROOT}/users/${encodeURIComponent(uid)}`
    const res = await commitWrite(env, {
        update: {
            name: docName,
            fields: {
                plan: { stringValue: PRO_PLAN },
                planActivatedAt: { stringValue: new Date().toISOString() },
            },
        },
        updateMask: { fieldPaths: ['plan', 'planActivatedAt'] },
    })
    if (!res.ok) throw new Error(`Firestore write failed: ${res.status}`)
}