import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getAnalytics, isSupported, type Analytics } from 'firebase/analytics'

const firebaseConfig = {
  apiKey:            "AIzaSyC58sttIxCfvDOG4SItHEta7VFs448bcmY",
  authDomain:        "symply-7f93d.firebaseapp.com",
  projectId:         "symply-7f93d",
  storageBucket:     "symply-7f93d.firebasestorage.app",
  messagingSenderId: "68312830927",
  appId:             "1:68312830927:web:e8474605f556924e0678ba",
  measurementId:     "G-1RX1DPY55J",
}

export const app            = initializeApp(firebaseConfig)
export const auth           = getAuth(app)
export const db             = getFirestore(app)
export const googleProvider = new GoogleAuthProvider()

// Analytics only works in a real browser (not SSR/build) and only when the
// browser supports it (e.g. not blocked by tracking-protection features).
// isSupported() resolves async, so `analytics` starts null and is filled in
// once support is confirmed — callers should always null-check before use.
export let analytics: Analytics | null = null
isSupported().then(supported => {
  if (supported) analytics = getAnalytics(app)
}).catch(() => { /* analytics unsupported in this environment — safe to ignore */ })
