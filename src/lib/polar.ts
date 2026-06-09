import { doc, updateDoc } from 'firebase/firestore'
import { db } from './firebase'

/**
 * Polar checkout URL을 생성하고 리다이렉트합니다.
 * 결제 완료 후 success_url로 돌아올 때 checkout_id가 파라미터로 옵니다.
 */
export async function startCheckout(userEmail: string): Promise<void> {
  const successUrl = `${window.location.origin}/settings?checkout_success=true&checkout_id={CHECKOUT_ID}`

  const res = await fetch('/api/create-checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ successUrl, userEmail }),
  })

  const data = await res.json() as { url?: string; error?: string }

  if (!data.url) {
    throw new Error(data.error ?? 'Failed to create checkout')
  }

  // Polar 결제 페이지로 이동
  window.location.href = data.url
}

/**
 * 결제 완료 후 checkout_id로 구독을 검증하고
 * Firestore의 plan을 'pro'로 업데이트합니다.
 */
export async function verifyAndActivatePro(
  checkoutId: string,
  uid: string
): Promise<boolean> {
  try {
    const res = await fetch('/api/verify-subscription', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ checkoutId }),
    })

    const data = await res.json() as { ok: boolean; status?: string }

    if (data.ok) {
      // Firestore plan 업데이트
      await updateDoc(doc(db, 'users', uid), {
        plan: 'pro',
        planActivatedAt: new Date().toISOString(),
      })
      return true
    }
    return false
  } catch {
    return false
  }
}
