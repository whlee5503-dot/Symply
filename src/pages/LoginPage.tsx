import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'

function authErrorMessage(err: unknown, t: typeof TEXT['en']): string {
  const code = (err as { code?: string })?.code ?? ''
  if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') return t.errWrongCreds
  if (code === 'auth/email-already-in-use') return t.errEmailInUse
  if (code === 'auth/weak-password') return t.errWeakPassword
  if (code === 'auth/invalid-email') return t.errInvalidEmail
  return t.errGeneric
}

const TEXT = {
  en: {
    sub: 'Track your symptoms, discover patterns,\nand bring evidence to your doctor.',
    google: 'Continue with Google',
    hint: 'Sign in with Google. First time? Your account will be created automatically.',
    noads: 'No ads. No data sales. Ever.',
    encrypted: 'Your data is encrypted and belongs to you.',
    or: 'or',
    emailToggle: 'Continue with email',
    emailLabel: 'Email',
    passwordLabel: 'Password',
    signIn: 'Sign in',
    signUp: 'Create account',
    switchToSignUp: 'New here? Create an account',
    switchToSignIn: 'Already have an account? Sign in',
    guest: 'Continue as guest',
    guestHint: 'Try Symply without an account. You can add sign-in later, but guest data may be lost if you clear your browser.',
    errWrongCreds: 'Incorrect email or password.',
    errEmailInUse: 'An account with this email already exists. Try signing in instead.',
    errWeakPassword: 'Password should be at least 6 characters.',
    errInvalidEmail: 'Please enter a valid email address.',
    errGeneric: 'Something went wrong. Please try again.',
  },
  es: {
    sub: 'Registra tus síntomas, descubre patrones\ny lleva evidencia a tu médico.',
    google: 'Continuar con Google',
    hint: 'Inicia sesión con Google. ¿Primera vez? Tu cuenta se creará en ese momento.',
    noads: 'Sin anuncios. Sin venta de datos.',
    encrypted: 'Tus datos están cifrados y son tuyos.',
    or: 'o',
    emailToggle: 'Continuar con correo electrónico',
    emailLabel: 'Correo electrónico',
    passwordLabel: 'Contraseña',
    signIn: 'Iniciar sesión',
    signUp: 'Crear cuenta',
    switchToSignUp: '¿Nuevo aquí? Crea una cuenta',
    switchToSignIn: '¿Ya tienes cuenta? Inicia sesión',
    guest: 'Continuar como invitado',
    guestHint: 'Prueba Symply sin cuenta. Puedes iniciar sesión más tarde, pero los datos de invitado pueden perderse si borras el navegador.',
    errWrongCreds: 'Correo electrónico o contraseña incorrectos.',
    errEmailInUse: 'Ya existe una cuenta con este correo. Intenta iniciar sesión.',
    errWeakPassword: 'La contraseña debe tener al menos 6 caracteres.',
    errInvalidEmail: 'Introduce un correo electrónico válido.',
    errGeneric: 'Algo salió mal. Inténtalo de nuevo.',
  },
  ko: {
    sub: '증상을 기록하고, 패턴을 발견하고,\n의사에게 증거를 가져가세요.',
    google: 'Google로 계속하기',
    hint: 'Google 계정으로 로그인하세요. 처음이시면 계정이 만들어집니다.',
    noads: '광고 없음. 데이터 판매 없음.',
    encrypted: '데이터는 암호화되어 있으며 당신의 것입니다.',
    or: '또는',
    emailToggle: '이메일로 계속하기',
    emailLabel: '이메일',
    passwordLabel: '비밀번호',
    signIn: '로그인',
    signUp: '계정 만들기',
    switchToSignUp: '처음이신가요? 계정 만들기',
    switchToSignIn: '이미 계정이 있으신가요? 로그인',
    guest: '게스트로 계속하기',
    guestHint: '계정 없이 Symply를 체험해보세요. 나중에 로그인을 추가할 수 있지만, 브라우저 데이터를 지우면 게스트 기록이 사라질 수 있습니다.',
    errWrongCreds: '이메일 또는 비밀번호가 올바르지 않습니다.',
    errEmailInUse: '이미 가입된 이메일입니다. 로그인을 시도해주세요.',
    errWeakPassword: '비밀번호는 6자 이상이어야 합니다.',
    errInvalidEmail: '올바른 이메일 주소를 입력해주세요.',
    errGeneric: '문제가 발생했습니다. 다시 시도해주세요.',
  },
}

export default function LoginPage() {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail, signInAsGuest } = useAuth()
  const { language, setLanguage } = useLanguage()
  const [showEmailForm, setShowEmailForm] = useState(false)
  const [mode,     setMode]     = useState<'signin' | 'signup'>('signin')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [busy,     setBusy]     = useState(false)

  const t = TEXT[language as keyof typeof TEXT] ?? TEXT.en

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      if (mode === 'signin') await signInWithEmail(email, password)
      else await signUpWithEmail(email, password)
    } catch (err) {
      setError(authErrorMessage(err, t))
    } finally {
      setBusy(false)
    }
  }

  async function handleGuest() {
    setError('')
    setBusy(true)
    try {
      await signInAsGuest()
    } catch {
      setError(t.errGeneric)
    } finally {
      setBusy(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '13px 16px', borderRadius: '10px',
    border: '1px solid #ede9fe', fontSize: '0.95rem', color: '#1e1b4b',
    marginBottom: '10px', boxSizing: 'border-box',
  }

  return (
    <div style={{ minHeight: '100dvh', backgroundColor: '#faf5ff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 24px', color: '#1e1b4b' }}>
      <div style={{ maxWidth: 400, width: '100%', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>💜</div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '8px' }}>symply</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '1rem', lineHeight: 1.6, marginBottom: '48px' }}>
          {t.sub.split('\n').map((line, i) => <span key={i}>{line}{i === 0 && <br />}</span>)}
        </p>
        <p style={{ fontSize: '0.82rem', color: 'var(--color-primary)', marginBottom: '16px', fontWeight: 500 }}>
          {t.hint}
        </p>
        <button
          onClick={signInWithGoogle}
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '16px 24px', borderRadius: '14px', border: '1px solid #ede9fe', backgroundColor: '#ffffff', color: '#1e1b4b', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
        >
          <svg width="20" height="20" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          {t.google}
        </button>

        {!showEmailForm ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '20px 0' }}>
              <div style={{ flex: 1, height: 1, background: '#ede9fe' }} />
              <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>{t.or}</span>
              <div style={{ flex: 1, height: 1, background: '#ede9fe' }} />
            </div>
            <button
              onClick={() => setShowEmailForm(true)}
              style={{ width: '100%', padding: '14px 24px', borderRadius: '14px', border: '1px solid #ede9fe', backgroundColor: 'transparent', color: '#1e1b4b', fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer' }}
            >
              ✉️ {t.emailToggle}
            </button>
          </>
        ) : (
          <form onSubmit={handleEmailSubmit} style={{ marginTop: '20px', textAlign: 'left' }}>
            <input
              type="email" required autoComplete="email" placeholder={t.emailLabel}
              value={email} onChange={e => setEmail(e.target.value)} style={inputStyle}
            />
            <input
              type="password" required autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              placeholder={t.passwordLabel} value={password}
              onChange={e => setPassword(e.target.value)} style={inputStyle}
            />
            {error && <p style={{ color: '#dc2626', fontSize: '0.8rem', marginBottom: '10px' }}>{error}</p>}
            <button
              type="submit" disabled={busy}
              style={{ width: '100%', padding: '14px 24px', borderRadius: '14px', border: 'none', backgroundColor: 'var(--color-primary)', color: 'white', fontSize: '0.95rem', fontWeight: 700, cursor: busy ? 'default' : 'pointer', opacity: busy ? 0.7 : 1 }}
            >
              {mode === 'signin' ? t.signIn : t.signUp}
            </button>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}>
              <button
                type="button"
                onClick={() => { setMode(m => m === 'signin' ? 'signup' : 'signin'); setError('') }}
                style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontSize: '0.8rem', cursor: 'pointer', padding: 0 }}
              >
                {mode === 'signin' ? t.switchToSignUp : t.switchToSignIn}
              </button>
              <button
                type="button"
                onClick={() => { setShowEmailForm(false); setError('') }}
                style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', fontSize: '0.8rem', cursor: 'pointer', padding: 0 }}
              >
                ← {t.google}
              </button>
            </div>
          </form>
        )}

        <button
          onClick={handleGuest}
          disabled={busy}
          style={{ width: '100%', marginTop: '16px', padding: '12px 24px', borderRadius: '14px', border: 'none', background: 'transparent', color: 'var(--color-text-muted)', fontSize: '0.85rem', fontWeight: 600, cursor: busy ? 'default' : 'pointer', textDecoration: 'underline' }}
        >
          {t.guest}
        </button>
        <p style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: '-8px', marginBottom: '8px', lineHeight: 1.5 }}>
          {t.guestHint}
        </p>

        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.82rem', marginTop: '16px', lineHeight: 1.6 }}>
          {t.noads}<br/>{t.encrypted}
        </p>
        {/* 언어 토글 — 3버튼 */}
        <div style={{ marginTop: '24px', display: 'flex', gap: '4px', justifyContent: 'center' }}>
          {(['en', 'es', 'ko'] as const).map(lang => (
            <button
              key={lang}
              onClick={() => setLanguage(lang)}
              style={{
                padding: '5px 12px', borderRadius: '8px',
                border: language === lang ? '1.5px solid var(--color-primary)' : '1px solid var(--color-border)',
                background: language === lang ? '#ede9fe' : 'transparent',
                color: language === lang ? 'var(--color-primary)' : 'var(--color-text-muted)',
                fontSize: '0.82rem', cursor: 'pointer', fontWeight: language === lang ? 700 : 400,
              }}
            >
              {lang === 'en' ? '🇺🇸 EN' : lang === 'es' ? '🇪🇸 ES' : '🇰🇷 KO'}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
