// Detects whether the app is currently running inside the TWA (Trusted Web
// Activity) — i.e. launched as the Android app from Google Play — as opposed
// to a regular browser tab or installed PWA.
//
// TWAs set document.referrer to "android-app://<package-id>" on launch; no
// other context sets this. This has no false positives for regular browser
// or "Add to Home Screen" PWA usage.
export function isRunningInTWA(): boolean {
  return document.referrer.startsWith('android-app://')
}
