import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'

export default function LoginPage() {
  const { signInWithGoogle } = useAuth()
  const { language, setLanguage } = useLanguage()

  const text = {
    en: {
      sub: 'Track your symptoms, discover patterns,\nand bring evidence to your doctor.',
      google: 'Continue with Google',
      noads: 'No ads. No data sales. Ever.',
      encrypted: 'Your data is encrypted and belongs to you.',
    },
    es: {
      sub: 'Registra tus síntomas, descubre patrones\ny lleva evidencia a tu médico.',
      google: 'Continuar con Google',
      noads: 'Sin anuncios. Sin venta de datos.',
      encrypted: 'Tus datos están cifrados y son tuyos.',
    },
    ko: {
      sub: '증상을 기록하고, 패턴을 발견하고,\n의사에게 증거를 가져가세요.',
      google: 'Google로 계속하기',
      noads: '광고 없음. 데이터 판매 없음.',
      encrypted: '데이터는 암호화되어 있으며 당신의 것입니다.',
    },
  }

  const t = text[language as keyof typeof text] ?? text.en

  return (
    <div style={{ minHeight: '100dvh', backgroundColor: 'var(--color-bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 24px', color: 'var(--color-text)' }}>
      <div style={{ maxWidth: 400, width: '100%', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>💜</div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '8px' }}>symply</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '1rem', lineHeight: 1.6, marginBottom: '48px' }}>
          {t.sub.split('\n').map((line, i) => <span key={i}>{line}{i === 0 && <br />}</span>)}
        </p>
        <button
          onClick={signInWithGoogle}
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '16px 24px', borderRadius: '14px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)', color: 'var(--color-text)', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
        >
          <svg width="20" height="20" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          {t.google}
        </button>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.82rem', marginTop: '24px', lineHeight: 1.6 }}>
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
                background: language === lang ? 'var(--color-primary-light)' : 'transparent',
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
