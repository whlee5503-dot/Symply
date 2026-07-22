import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'

type Mode = 'signin' | 'signup'

export default function LoginPage() {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail, signInAsGuest } = useAuth()
  const { language, setLanguage } = useLanguage()

  const [mode, setMode]         = useState<Mode>('signin')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [busy, setBusy]         = useState(false)

  const text = {
    en: {
      sub: 'Track your symptoms, discover patterns,\nand bring evidence to your doctor.',
      google: 'Continue with Google',
      hint: 'Sign in with Google. First time? Your account will be created automatically.',
      noads: 'No ads. No data sales. Ever.',
      encrypted: 'Your data is encrypted and belongs to you.',
      or: 'or',
      emailPh: 'Email',
      passwordPh: 'Password (6+ characters)',
      signin: 'Sign In',
      signup: 'Create Account',
      toggleToSignup: 'New here? Create an account',
      toggleToSignin: 'Already have an account? Sign in',
      guest: 'Continue as Guest',
      guestHint: 'Try it out with no account. You can add an email later to keep your data safe.',
      errInvalid: 'That email or password does not look right.',
      errInUse: 'An account with this email already exists. Try signing in instead.',
      errWeak: 'Please use a password with at least 6 characters.',
      errGeneric: 'Something went wrong. Please try again.',
    },
    es: {
      sub: 'Registra tus síntomas, descubre patrones\ny lleva evidencia a tu médico.',
      google: 'Continuar con Google',
      hint: 'Inicia sesión con Google. ¿Primera vez? Tu cuenta se creará en ese momento.',
      noads: 'Sin anuncios. Sin venta de datos.',
      encrypted: 'Tus datos están cifrados y son tuyos.',
      or: 'o',
      emailPh: 'Correo electrónico',
      passwordPh: 'Contraseña (6+ caracteres)',
      signin: 'Iniciar Sesión',
      signup: 'Crear Cuenta',
      toggleToSignup: '¿Nuevo aquí? Crea una cuenta',
      toggleToSignin: '¿Ya tienes cuenta? Inicia sesión',
      guest: 'Continuar como Invitado',
      guestHint: 'Pruébalo sin cuenta. Puedes agregar un correo más tarde para proteger tus datos.',
      errInvalid: 'El correo o la contraseña no son correctos.',
      errInUse: 'Ya existe una cuenta con este correo. Intenta iniciar sesión.',
      errWeak: 'Usa una contraseña de al menos 6 caracteres.',
      errGeneric: 'Algo salió mal. Intenta de nuevo.',
    },
    ko: {
      sub: '증상을 기록하고, 패턴을 발견하고,\n의사에게 증거를 가져가세요.',
      google: 'Google로 계속하기',
      hint: 'Google 계정으로 로그인하세요. 처음이시면 계정이 만들어집니다.',
      noads: '광고 없음. 데이터 판매 없음.',
      encrypted: '데이터는 암호화되어 있으며 당신의 것입니다.',
      or: '또는',
      emailPh: '이메일',
      passwordPh: '비밀번호 (6자 이상)',
      signin: '로그인',
      signup: '계정 만들기',
      toggleToSignup: '처음이신가요? 계정 만들기',
      toggleToSignin: '이미 계정이 있으신가요? 로그인',
      guest: '게스트로 계속하기',
      guestHint: '계정 없이 먼저 사용해볼 수 있습니다. 나중에 이메일을 추가하면 데이터를 안전하게 보관할 수 있습니다.',
      errInvalid: '이메일 또는 비밀번호가 올바르지 않습니다.',
      errInUse: '이미 이 이메일로 가입된 계정이 있습니다. 로그인을 시도해주세요.',
      errWeak: '비밀번호는 6자 이상으로 설정해주세요.',
      errGeneric: '문제가 발생했습니다. 다시 시도해주세요.',
    },
  }

  const t = text[language as keyof typeof text] ?? text.en

  function mapError(code: string): string {
    if (code.includes('invalid-credential') || code.includes('wrong-password') || code.includes('user-not-found')) return t.errInvalid
    if (code.includes('email-already-in-use')) return t.errInUse
    if (code.includes('weak-password')) return t.errWeak
    return t.errGeneric
  }

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      if (mode === 'signin') {
        await signInWithEmail(email, password)
      } else {
        await signUpWithEmail(email, password)
      }
    } catch (err) {
      const code = err instanceof Error ? err.message : ''
      setError(mapError(code))
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
    width: '100%', padding: '14px 16px', borderRadius: '12px',
    border: '1px solid #ede9fe', fontSize: '0.95rem', marginBottom: '10px',
    boxSizing: 'border-box', color: '#1e1b4b', backgroundColor: '#ffffff',
  }

  return (
    <div style={{ minHeight: '100dvh', backgroundColor: '#faf5ff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 24px', color: '#1e1b4b' }}>
      <div style={{ maxWidth: 400, width: '100%', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>💜</div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '8px' }}>symply</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '1rem', lineHeight: 1.6, marginBottom: '32px' }}>
          {t.sub.split('\n').map((line, i) => <span key={i}>{line}{i === 0 && <br />}</span>)}
        </p>

        <button
          onClick={signInWithGoogle}
          disabled={busy}
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '16px 24px', borderRadius: '14px', border: '1px solid #ede9fe', backgroundColor: '#ffffff', color: '#1e1b4b', fontSize: '1rem', fontWeight: 600, cursor: busy ? 'default' : 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', opacity: busy ? 0.6 : 1 }}
        >
          <svg width="20" height="20" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          {t.google}
        </button>

        <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', margin: '10px 0' }}>{t.hint}</p>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '18px 0' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#ede9fe' }} />
          <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>{t.or}</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#ede9fe' }} />
        </div>

        <form onSubmit={handleEmailSubmit}>
          <input
            type="email"
            placeholder={t.emailPh}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={inputStyle}
          />
          <input
            type="password"
            placeholder={t.passwordPh}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            style={inputStyle}
          />
          {error && (
            <p style={{ color: '#dc2626', fontSize: '0.82rem', marginBottom: '10px', textAlign: 'left' }}>{error}</p>
          )}
          <button
            type="submit"
            disabled={busy}
            style={{ width: '100%', padding: '14px 24px', borderRadius: '12px', border: 'none', backgroundColor: 'var(--color-primary)', color: '#ffffff', fontSize: '0.95rem', fontWeight: 600, cursor: busy ? 'default' : 'pointer', opacity: busy ? 0.6 : 1 }}
          >
            {mode === 'signin' ? t.signin : t.signup}
          </button>
        </form>

        <button
          onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError('') }}
          style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontSize: '0.82rem', marginTop: '12px', cursor: 'pointer', textDecoration: 'underline' }}
        >
          {mode === 'signin' ? t.toggleToSignup : t.toggleToSignin}
        </button>

        <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #ede9fe' }}>
          <button
            onClick={handleGuest}
            disabled={busy}
            style={{ width: '100%', padding: '12px 24px', borderRadius: '12px', border: '1px dashed #c4b5fd', backgroundColor: 'transparent', color: 'var(--color-text-muted)', fontSize: '0.9rem', fontWeight: 500, cursor: busy ? 'default' : 'pointer', opacity: busy ? 0.6 : 1 }}
          >
            {t.guest}
          </button>
          <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '8px', lineHeight: 1.5 }}>
            {t.guestHint}
          </p>
        </div>

        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.82rem', marginTop: '24px', lineHeight: 1.6 }}>
          {t.noads}<br/>{t.encrypted}
        </p>

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
