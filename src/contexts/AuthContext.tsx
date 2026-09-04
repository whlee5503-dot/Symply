import {
  createContext, useContext, useEffect, useState, type ReactNode
} from 'react'
import {
  onAuthStateChanged, signInWithPopup, signOut, type User,
  signInWithEmailAndPassword, createUserWithEmailAndPassword, signInAnonymously,
  linkWithPopup, linkWithCredential, EmailAuthProvider,
} from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db, googleProvider } from '../lib/firebase'

interface AuthContextValue {
  user:             User | null
  loading:          boolean
  isPro:            boolean
  signInWithGoogle: () => Promise<void>
  signInWithEmail:  (email: string, password: string) => Promise<void>
  signUpWithEmail:  (email: string, password: string) => Promise<void>
  signInAsGuest:    () => Promise<void>
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
          // 게스트(익명) 계정이 Google/이메일로 연결(link)된 경우, uid는 그대로 유지되고
          // 데이터도 그대로 보존되지만 Firestore 문서에는 여전히 email: null 이 남아있으므로
          // 실제 계정 정보로 채워준다.
          const data = snap.data()
          if (!u.isAnonymous && (data?.email !== u.email || data?.displayName !== u.displayName)) {
            await setDoc(ref, { email: u.email, displayName: u.displayName }, { merge: true })
          }
        }
      } else {
        setIsPro(false)
      }
      setLoading(false)
    })
    return unsub
  }, [])

  // 게스트(익명) 세션 도중 Google로 전환하는 경우: 새 계정을 만드는 대신
  // linkWithPopup으로 기존 uid에 Google 자격증명을 "연결"한다.
  // 이렇게 하면 uid가 그대로 유지되어 게스트 때 쌓인 Firestore 데이터가 보존된다.
  // 단, 그 Google 계정이 이미 다른 Symply 계정에 연결되어 있다면 링크가 실패하는데,
  // 이 경우는 "원래 있던 내 계정으로 돌아가는 것"이므로 일반 로그인으로 전환한다
  // (이때는 게스트 세션 동안의 데이터가 이관되지 않고 남겨진다 — 이미 별도 계정이 있던 사용자이므로 예상된 동작).
  const signInWithGoogle = async () => {
    if (auth.currentUser?.isAnonymous) {
      try {
        await linkWithPopup(auth.currentUser, googleProvider)
        return
      } catch (err) {
        const code = (err as { code?: string })?.code
        if (code !== 'auth/credential-already-in-use' && code !== 'auth/email-already-in-use') throw err
        // 이미 가입된 Google 계정 → 기존 계정으로 로그인 (게스트 데이터는 이관되지 않음)
      }
    }
    await signInWithPopup(auth, googleProvider)
  }

  const signInWithEmail  = async (email: string, password: string) => {
    // 기존에 가입된 이메일/비밀번호로 "로그인"하는 경우는 완전히 별도의 계정이므로
    // 게스트 데이터와 자동으로 합치지 않는다 (서로 다른 사람의 데이터일 수 있어 임의 병합은 위험).
    await signInWithEmailAndPassword(auth, email, password)
  }

  // 게스트(익명) 세션 도중 이메일로 "새 계정 만들기"를 하는 경우: signInWithGoogle과 동일하게
  // linkWithCredential로 기존 uid에 이메일/비밀번호를 연결해 데이터를 보존한다.
  const signUpWithEmail  = async (email: string, password: string) => {
    if (auth.currentUser?.isAnonymous) {
      const credential = EmailAuthProvider.credential(email, password)
      await linkWithCredential(auth.currentUser, credential)
      return
    }
    await createUserWithEmailAndPassword(auth, email, password)
  }
  const signInAsGuest    = async () => { await signInAnonymously(auth) }
  const signOutUser      = async () => { await signOut(auth) }

  return (
    <AuthContext.Provider value={{
      user, loading, isPro,
      signInWithGoogle, signInWithEmail, signUpWithEmail, signInAsGuest, signOutUser,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

