import type { PagesFunction } from '@cloudflare/workers-types'
import { verifyFirebaseUser } from './_auth'
import { deleteAuthUser, deleteUserData, type FirestoreEnv } from './_firestore'

const JSON_HEADERS = { 'Content-Type': 'application/json' }

// Same-origin only: no CORS headers on purpose.
// Order matters: data first, then the Auth account, so a failed attempt can be retried.
export const onRequestPost: PagesFunction<FirestoreEnv> = async (context) => {
    const user = await verifyFirebaseUser(context.request as unknown as Request)
    if (!user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: JSON_HEADERS,
        })
    }

    try {
        await deleteUserData(context.env, user.uid)
        await deleteAuthUser(context.env, user.uid)
        return new Response(JSON.stringify({ ok: true }), { headers: JSON_HEADERS })
    } catch (err) {
        console.error('delete-account failed:', err instanceof Error ? err.message : String(err))
        return new Response(JSON.stringify({ error: 'Internal server error' }), {
            status: 500,
            headers: JSON_HEADERS,
        })
    }
}