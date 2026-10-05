import { createRemoteJWKSet, jwtVerify } from 'jose'

const PROJECT_ID = 'symply-7f93d'

// Google's public keys used to sign Firebase ID tokens.
const JWKS = createRemoteJWKSet(
    new URL('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com'),
)

export interface VerifiedUser {
    uid: string
    email?: string
    // true when the user signed in as a guest (Firebase anonymous auth).
    isAnonymous: boolean
}

// Returns the verified user from an "Authorization: Bearer <token>" header,
// or null if the header is missing or the token is invalid/expired.
export async function verifyFirebaseUser(request: Request): Promise<VerifiedUser | null> {
    const header = request.headers.get('Authorization') ?? ''
    const token = header.startsWith('Bearer ') ? header.slice(7) : ''
    if (!token) return null

    try {
        const { payload } = await jwtVerify(token, JWKS, {
            issuer: `https://securetoken.google.com/${PROJECT_ID}`,
            audience: PROJECT_ID,
        })
        if (!payload.sub) return null
        // Firebase ID tokens carry the sign-in method in the "firebase" claim.
        const firebaseClaim = payload.firebase as { sign_in_provider?: string } | undefined
        return {
            uid: payload.sub,
            email: payload.email as string | undefined,
            isAnonymous: firebaseClaim?.sign_in_provider === 'anonymous',
        }
    } catch {
        return null
    }
}