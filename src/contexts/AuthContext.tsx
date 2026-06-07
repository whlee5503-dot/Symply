import { createContext, useContext, useState, type ReactNode } from 'react'
import type { UserProfile } from '../types'

interface AuthContextValue {
  profile: UserProfile | null
  loading: boolean
  isPro: boolean
  setProfile: (p: UserProfile | null) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

const DEFAULT_PROFILE: UserProfile = {
  uid: 'local-user',
  email: '',
  displayName: 'My Symply',
  createdAt: new Date(),
  plan: 'free',
  conditions: [],
  medications: [],
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [profile] = useState<UserProfile>(DEFAULT_PROFILE)

  return (
    <AuthContext.Provider value={{
      profile,
      loading: false,
      isPro: false,
      setProfile: () => {},
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
