import { auth } from './firebase'
import { isRunningInTWA } from './platform'

// Returns the signed-in user's Firebase ID token as an Authorization header.
// The checkout and verification endpoints require it.
async function getAuthHeader(): Promise<Record<string, string>> {
  const user = auth.currentUser
  if (!user) return {}
  const token = await user.getIdToken()
  return { Authorization: `Bearer ${token}` }
}

/**
 * Polar checkout URL을 생성하고 이동합니다.
 * 결제 완료 후 success_url로 돌아올 때 checkout_id가 파라미터로 옵니다.
 *
 * Google Play 결제 정책: 앱 안에서 구매 플로우 자체가 없으면 Play Billing
 * 요건 대상이 아니므로, Play Store로 배포된 TWA(Android 앱) 안에서는 결제
 * 페이지를 앱 내부가 아니라 별도 브라우저 탭에서 열어 "앱 내 결제"가 되지
 * 않도록 합니다. 일반 웹/PWA 사용자는 기존과 동일하게 같은 탭에서 이동합니다.
 *
 * The email is no longer sent from the browser: the server reads it from the
 * verified token. The parameter is kept so existing callers keep compiling.
 */
export async function startCheckout(_userEmail?: string): Promise<void> {
  const successUrl = `${window.location.origin}/settings?checkout_success=true&checkout_id={CHECKOUT_ID}`

  const res = await fetch('/api/create-checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(await getAuthHeader()) },
    body: JSON.stringify({ successUrl }),
  })

  const data = await res.json() as { url?: string; error?: string }

  if (!data.url) {
    throw new Error(data.error ?? 'Failed to create checkout')
  }

  if (isRunningInTWA()) {
    // Android 앱(Play Store 배포본) 안에서는 결제를 앱 밖 브라우저에서 진행
    window.open(data.url, '_blank')
  } else {
    // 웹/PWA에서는 기존과 동일하게 같은 탭에서 이동
    window.location.href = data.url
  }
}

/**
 * 결제 완료 후 checkout_id로 구독을 검증합니다.
 * plan = 'pro' 는 서버가 직접 Firestore에 기록합니다 (브라우저는 쓰지 않음).
 * The uid parameter is kept so existing callers keep compiling.
 */
export async function verifyAndActivatePro(
  checkoutId: string,
  _uid?: string
): Promise<boolean> {
  try {
    const res = await fetch('/api/verify-subscription', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(await getAuthHeader()) },
      body: JSON.stringify({ checkoutId }),
    })

    const data = await res.json() as { ok?: boolean; status?: string }
    return data.ok === true
  } catch {
    return false
  }
}