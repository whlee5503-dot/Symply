import {
  createContext, useContext, useEffect, useState, type ReactNode
} from 'react'
import {
  onAuthStateChanged, signInWithPopup, signOut, type User
} from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db, googleProvider } from '../lib/firebase'

interface AuthContextValue {
  user:             User | null
  loading:          boolean
  isPro:            boolean
  signInWithGoogle: () => Promise<void>
  signOutUser:      () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,    setUser]    = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isPro,   setIsPro]   = useState(false)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u)
      if (u) {
        const ref  = doc(db, 'users', u.uid)
        const snap = await getDoc(ref)
        if (!snap.exists()) {
          await setDoc(ref, {
            email:       u.email,
            displayName: u.displayName,
            createdAt:   serverTimestamp(),
            plan:        'free',
            conditions:  [],
            medications: [],
          })
        } else {
          setIsPro(snap.data()?.plan === 'pro')
        }
      } else {
        setIsPro(false)
      }
      setLoading(false)
    })
    return unsub
  }, [])

  const signInWithGoogle = async () => { await signInWithPopup(auth, googleProvider) }
  const signOutUser      = async () => { await signOut(auth) }

  return (
    <AuthContext.Provider value={{ user, loading, isPro, signInWithGoogle, signOutUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

