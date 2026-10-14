// Detects whether the app is currently running inside the TWA (Trusted Web
// Activity) — i.e. launched as the Android app from Google Play — as opposed
// to a regular browser tab or installed PWA.
//
// TWAs set document.referrer to "android-app://<package-id>" on launch; no
// other context sets this. But the referrer is lost after a full page reload,
// so the first detection is remembered in sessionStorage for the rest of the
// session. For testing on a desktop browser, open the site with ?twa=1.
const TWA_FLAG = 'symply-twa-session'

function detectTWA(): boolean {
  try {
    if (sessionStorage.getItem(TWA_FLAG) === '1') return true
  } catch {
    // sessionStorage can be unavailable; fall through to the live check.
  }

  const detected =
    document.referrer.startsWith('android-app://') ||
    new URLSearchParams(window.location.search).get('twa') === '1'

  if (detected) {
    try {
      sessionStorage.setItem(TWA_FLAG, '1')
    } catch {
      // Ignore: the live check will still work until the next reload.
    }
  }
  return detected
}

// Run once at import time so the flag is stored as early as possible.
detectTWA()

export function isRunningInTWA(): boolean {
  return detectTWA()
}