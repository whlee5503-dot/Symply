import { logEvent } from 'firebase/analytics'
import { analytics } from './firebase'

// Thin wrapper so call sites never need to null-check `analytics` themselves
// (it starts null until Firebase's async isSupported() check resolves).
export function trackEvent(name: string, params?: Record<string, unknown>) {
  if (!analytics) return
  try {
    logEvent(analytics, name, params)
  } catch {
    // Never let analytics failures affect the actual user-facing feature.
  }
}
