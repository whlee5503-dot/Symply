import { useLanguage } from '../contexts/LanguageContext'
import { useAuth } from '../contexts/AuthContext'

const CONTENT = {
  en: {
    badge: '🩺 For PCOS · Endometriosis · Fibromyalgia & more',
    hero1: 'Track your symptoms.',
    hero2: 'Prove your pain.',
    heroSub: 'Log in 30 seconds. Discover patterns with AI. Generate a clinical report your doctor can read in 3 minutes.',
    cta: 'Continue with Google →',
    ctaSub: 'Free to start · Pro from $3.99/mo',
    problemLabel: 'The Problem',
    problemTitle: 'Living with chronic illness is hard enough.',
    problemSub: 'Not being believed makes it worse.',
    problems: [
      { emoji: '⏳', title: '2–12 years', body: 'Average time to diagnosis for conditions like endometriosis' },
      { emoji: '🗣️', title: '"It\'s in your head"', body: 'Medical gaslighting affects millions of chronic illness patients' },
      { emoji: '📋', title: '3-minute appointments', body: 'Not enough time to explain months of complex symptoms' },
    ],
    solutionLabel: 'How Symply Helps',
    solutionTitle: 'Your body has a story.',
    solutionSub: 'Symply helps you tell it.',
    solutions: [
      { emoji: '⏱️', title: '30-second daily check-in', body: 'Log pain, fatigue, sleep, mood, and today\'s factors (food, lifestyle, environment) — even on your worst days.', badge: 'Free', color: '#059669' },
      { emoji: '🤖', title: 'AI finds your patterns', body: '"On days following less than 6 hours of sleep, your pain is 40% higher." Claude AI delivers insights you can actually use.', badge: 'Pro', color: '#7c3aed' },
      { emoji: '📄', title: 'Doctor-ready report in seconds', body: 'Generate a 1-2 page clinical PDF summarizing months of symptoms.', badge: 'Pro', color: '#7c3aed' },
    ],
    pricingLabel: 'Pricing',
    pricingTitle: 'Less than a coffee a month.',
    pricingSub: 'No ads. No data sales. Ever.',
    freeFeatures: ['✓ Unlimited symptom logging', '✓ Calendar heatmap', '✓ Trend charts', '✓ Pattern Insights (preview)', '✓ Daily check-in reminders'],
    proFeatures: ['✓ Everything in Free', '✓ AI Pattern Analysis', "✓ Doctor's Report PDF", '✓ Priority support'],
    proSave: 'or $29.99/year — save 37%',
    startFree: 'Continue with Google',
    startPro: '✨ Start Pro',
    builtBy: 'Built by a <b>public health professional (MPH)</b> who believes chronic illness patients deserve to be heard. No ads. No data sales.',
    finalTitle: 'Start tracking today.',
    finalSub: 'Free to start. No credit card. Cancel anytime.',
    footer: '© 2026 Symply · No ads · No data sales',
    signIn: 'Continue with Google',
  },
  es: {
    badge: '🩺 Para SOP · Endometriosis · Fibromialgia y más',
    hero1: 'Registra tus síntomas.',
    hero2: 'Demuestra tu dolor.',
    heroSub: 'Registra en 30 segundos. Descubre patrones con IA. Genera un informe clínico que tu médico puede leer en 3 minutos.',
    cta: 'Continuar con Google →',
    ctaSub: 'Gratis para empezar · Pro desde $3.99/mes',
    problemLabel: 'El problema',
    problemTitle: 'Vivir con una enfermedad crónica ya es difícil.',
    problemSub: 'No ser creída lo hace peor.',
    problems: [
      { emoji: '⏳', title: '2–12 años', body: 'Tiempo promedio de diagnóstico para condiciones como la endometriosis' },
      { emoji: '🗣️', title: '"Es psicológico"', body: 'El gaslighting médico afecta a millones de pacientes con enfermedades crónicas' },
      { emoji: '📋', title: 'Citas de 3 minutos', body: 'No hay tiempo suficiente para explicar meses de síntomas complejos' },
    ],
    solutionLabel: 'Cómo ayuda Symply',
    solutionTitle: 'Tu cuerpo tiene una historia.',
    solutionSub: 'Symply te ayuda a contarla.',
    solutions: [
      { emoji: '⏱️', title: 'Check-in diario de 30 segundos', body: 'Registra dolor, fatiga, sueño, desencadenantes y ánimo — incluso en tus peores días.', badge: 'Gratis', color: '#059669' },
      { emoji: '🤖', title: 'La IA encuentra tus patrones', body: '"Los días con menos de 6h de sueño, tu dolor es un 40% mayor." Claude AI entrega insights que puedes usar.', badge: 'Pro', color: '#7c3aed' },
      { emoji: '📄', title: 'Informe médico en segundos', body: 'Genera un PDF clínico de 1-2 páginas resumiendo meses de síntomas. Diseñado por un profesional de salud pública.', badge: 'Pro', color: '#7c3aed' },
    ],
    pricingLabel: 'Precios',
    pricingTitle: 'Menos que un café al mes.',
    pricingSub: 'Sin anuncios. Sin venta de datos.',
    freeFeatures: ['✓ Registro ilimitado de síntomas', '✓ Mapa de calor del calendario', '✓ Gráficos de tendencias', '✓ Insights de patrones (vista previa)', '✓ Recordatorios diarios'],
    proFeatures: ['✓ Todo lo del plan gratuito', '✓ Análisis de IA', '✓ Informe médico PDF', '✓ Soporte prioritario'],
    proSave: 'o $29.99/año — ahorra 37%',
    startFree: 'Continuar con Google',
    startPro: '✨ Comenzar Pro',
    builtBy: 'Creado por un <b>profesional de salud pública (MPH)</b> que cree que los pacientes crónicos merecen ser escuchados. Sin anuncios. Sin venta de datos.',
    finalTitle: 'Empieza a registrar hoy.',
    finalSub: 'Gratis para comenzar. Sin tarjeta. Cancela cuando quieras.',
    footer: '© 2026 Symply · Sin anuncios · Sin venta de datos',
    signIn: 'Continuar con Google',
  },
  ko: {
    badge: '🩺 PCOS · 자궁내막증 · 섬유근통 외 만성질환 환자를 위한 앱',
    hero1: '증상을 기록하세요.',
    hero2: '당신의 고통을 증명하세요.',
    heroSub: '30초 체크인. AI로 패턴 발견. 의사가 3분 안에 읽을 수 있는 임상 보고서를 생성하세요.',
    cta: 'Google로 시작하기 →',
    ctaSub: '무료로 시작 · Pro는 월 $3.99부터',
    problemLabel: '문제',
    problemTitle: '만성질환과 함께 사는 것만으로도 힘듭니다.',
    problemSub: '아무도 믿어주지 않으면 더욱 힘들어집니다.',
    problems: [
      { emoji: '⏳', title: '2~12년', body: '자궁내막증 같은 질환의 평균 진단 지연 기간' },
      { emoji: '🗣️', title: '"심리적인 문제예요"', body: '의료 가스라이팅을 경험하는 만성질환 환자들' },
      { emoji: '📋', title: '3분짜리 진료', body: '수개월의 복잡한 증상을 설명하기엔 너무 짧은 시간' },
    ],
    solutionLabel: 'Symply가 해결합니다',
    solutionTitle: '당신의 몸은 이야기를 가지고 있습니다.',
    solutionSub: 'Symply가 그 이야기를 전달합니다.',
    solutions: [
      { emoji: '⏱️', title: '30초 일일 체크인', body: '통증, 피로, 수면, 트리거, 기분을 가장 힘든 날에도 기록하세요.', badge: '무료', color: '#059669' },
      { emoji: '🤖', title: 'AI가 패턴을 찾습니다', body: '"수면 6시간 미만인 날 다음 날 통증이 40% 높아집니다." Claude AI가 실제로 사용할 수 있는 인사이트를 제공합니다.', badge: 'Pro', color: '#7c3aed' },
      { emoji: '📄', title: '몇 초 만에 진료 보고서 생성', body: '수개월의 증상을 요약한 1~2페이지 임상 PDF를 생성합니다.', badge: 'Pro', color: '#7c3aed' },
    ],
    pricingLabel: '가격',
    pricingTitle: '한 달에 커피 한 잔보다 저렴합니다.',
    pricingSub: '광고 없음. 데이터 판매 없음.',
    freeFeatures: ['✓ 무제한 증상 기록', '✓ 달력 히트맵', '✓ 트렌드 차트', '✓ 패턴 인사이트 (미리보기)', '✓ 매일 체크인 리마인더'],
    proFeatures: ['✓ 무료 기능 전체', '✓ AI 패턴 분석', '✓ 진료 보고서 PDF', '✓ 우선 지원'],
    proSave: '또는 $29.99/년 — 37% 절약',
    startFree: 'Google로 시작하기',
    startPro: '✨ Pro 시작하기',
    builtBy: '<b>공중보건 전문가(MPH)</b>가 만성질환 환자들이 마땅히 들을 자격이 있다는 신념으로 만들었습니다. 광고 없음. 데이터 판매 없음.',
    finalTitle: '오늘부터 기록을 시작하세요.',
    finalSub: '무료로 시작. 신용카드 불필요. 언제든 취소 가능.',
    footer: '© 2026 Symply · 광고 없음 · 데이터 판매 없음',
    signIn: 'Google로 시작하기',
  }
}

export default function LandingPage() {
  const { signInWithGoogle } = useAuth()
  const { language } = useLanguage()
  const c = CONTENT[language]

  function goToLogin() { signInWithGoogle() }

  return (
    <div style={{ minHeight: '100dvh', backgroundColor: '#faf5ff', fontFamily: 'system-ui, -apple-system, sans-serif', color: '#1e1b4b' }}>

      {/* NAV */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', maxWidth: '680px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img src="/favicon.svg" width={28} height={28} alt="Symply" />
          <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#7c3aed' }}>symply</span>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>

          <button onClick={goToLogin} style={{ padding: '8px 18px', borderRadius: '10px', border: '1.5px solid #7c3aed', background: 'transparent', color: '#7c3aed', fontWeight: 600, fontSize: '0.88rem', cursor: 'pointer' }}>
            {c.signIn}
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ maxWidth: '680px', margin: '0 auto', padding: '48px 24px 56px', textAlign: 'center' }}>
        <div style={{ display: 'inline-block', padding: '4px 14px', borderRadius: '20px', background: '#ede9fe', color: '#6d28d9', fontSize: '0.78rem', fontWeight: 700, marginBottom: '20px' }}>
          {c.badge}
        </div>
        <h1 style={{ fontSize: 'clamp(1.8rem, 5vw, 2.8rem)', fontWeight: 800, lineHeight: 1.2, color: '#1e1b4b', marginBottom: '20px' }}>
          {c.hero1}<br/><span style={{ color: '#7c3aed' }}>{c.hero2}</span>
        </h1>
        <p style={{ fontSize: '1.05rem', color: '#6b7280', lineHeight: 1.7, maxWidth: '480px', margin: '0 auto 32px' }}>{c.heroSub}</p>
        <button onClick={goToLogin} style={{ padding: '16px 40px', borderRadius: '14px', border: 'none', background: 'linear-gradient(135deg, #7c3aed, #a855f7)', color: '#fff', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', boxShadow: '0 4px 20px rgba(124,58,237,0.3)' }}>
          {c.cta}
        </button>
        <p style={{ fontSize: '0.78rem', color: '#9ca3af', marginTop: '12px' }}>{c.ctaSub}</p>
      </section>

      {/* PROBLEM */}
      <section style={{ background: '#fff', padding: '56px 24px' }}>
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>
          <p style={{ textAlign: 'center', fontSize: '0.75rem', fontWeight: 700, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>{c.problemLabel}</p>
          <h2 style={{ textAlign: 'center', fontSize: '1.6rem', fontWeight: 800, color: '#1e1b4b', marginBottom: '40px', lineHeight: 1.3 }}>
            {c.problemTitle}<br/><span style={{ color: '#7c3aed' }}>{c.problemSub}</span>
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
            {c.problems.map((item, i) => (
              <div key={i} style={{ padding: '24px', borderRadius: '16px', background: '#faf5ff', border: '1px solid #ede9fe', textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: '10px' }}>{item.emoji}</div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1e1b4b', marginBottom: '6px' }}>{item.title}</div>
                <div style={{ fontSize: '0.82rem', color: '#6b7280', lineHeight: 1.5 }}>{item.body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SOLUTION */}
      <section style={{ padding: '56px 24px' }}>
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>
          <p style={{ textAlign: 'center', fontSize: '0.75rem', fontWeight: 700, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>{c.solutionLabel}</p>
          <h2 style={{ textAlign: 'center', fontSize: '1.6rem', fontWeight: 800, color: '#1e1b4b', marginBottom: '40px' }}>
            {c.solutionTitle}<br/><span style={{ color: '#7c3aed' }}>{c.solutionSub}</span>
          </h2>
          {c.solutions.map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', padding: '24px', borderRadius: '16px', background: '#fff', border: '1px solid #ede9fe', marginBottom: '12px', boxShadow: '0 2px 8px rgba(124,58,237,0.06)' }}>
              <div style={{ fontSize: '1.8rem', flexShrink: 0, width: '52px', height: '52px', borderRadius: '14px', background: '#faf5ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{item.emoji}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1e1b4b' }}>{item.title}</span>
                  <span style={{ padding: '2px 8px', borderRadius: '10px', fontSize: '0.68rem', fontWeight: 700, color: '#fff', background: item.color }}>{item.badge}</span>
                </div>
                <p style={{ fontSize: '0.85rem', color: '#6b7280', lineHeight: 1.6, margin: 0 }}>{item.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section style={{ background: '#fff', padding: '56px 24px' }}>
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>
          <p style={{ textAlign: 'center', fontSize: '0.75rem', fontWeight: 700, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>{c.pricingLabel}</p>
          <h2 style={{ textAlign: 'center', fontSize: '1.6rem', fontWeight: 800, color: '#1e1b4b', marginBottom: '8px' }}>{c.pricingTitle}</h2>
          <p style={{ textAlign: 'center', color: '#6b7280', fontSize: '0.9rem', marginBottom: '36px' }}>{c.pricingSub}</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            <div style={{ padding: '28px', borderRadius: '18px', border: '1.5px solid #ede9fe', background: '#faf5ff' }}>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: '#1e1b4b', marginBottom: '4px' }}>Free</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#1e1b4b', marginBottom: '16px' }}>$0</div>
              {c.freeFeatures.map((f, i) => <div key={i} style={{ fontSize: '0.83rem', color: '#6b7280', marginBottom: '8px' }}>{f}</div>)}
              <button onClick={goToLogin} style={{ width: '100%', marginTop: '20px', padding: '12px', borderRadius: '10px', border: '1.5px solid #7c3aed', background: 'transparent', color: '#7c3aed', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer' }}>
                {c.startFree}
              </button>
            </div>
            <div style={{ padding: '28px', borderRadius: '18px', border: '2px solid #7c3aed', background: 'linear-gradient(135deg, #faf5ff, #ede9fe)', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg, #7c3aed, #a855f7)', color: '#fff', padding: '3px 14px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700, whiteSpace: 'nowrap' }}>
                MOST POPULAR
              </div>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: '#7c3aed', marginBottom: '4px' }}>Pro</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '4px' }}>
                <span style={{ fontSize: '2rem', fontWeight: 800, color: '#1e1b4b' }}>$3.99</span>
                <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>/month</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#7c3aed', marginBottom: '16px', fontWeight: 600 }}>{c.proSave}</div>
              {c.proFeatures.map((f, i) => <div key={i} style={{ fontSize: '0.83rem', color: '#4b5563', marginBottom: '8px' }}>{f}</div>)}
              <button onClick={goToLogin} style={{ width: '100%', marginTop: '20px', padding: '12px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #7c3aed, #a855f7)', color: '#fff', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer' }}>
                {c.startPro}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* BUILT BY */}
      <section style={{ padding: '48px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: '480px', margin: '0 auto' }}>
          <div style={{ fontSize: '1.5rem', marginBottom: '12px' }}>👨‍🔬</div>
          <p style={{ fontSize: '0.9rem', color: '#6b7280', lineHeight: 1.7 }} dangerouslySetInnerHTML={{ __html: c.builtBy }} />
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)', padding: '56px 24px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', marginBottom: '12px' }}>{c.finalTitle}</h2>
        <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.95rem', marginBottom: '28px' }}>{c.finalSub}</p>
        <button onClick={goToLogin} style={{ padding: '16px 40px', borderRadius: '14px', border: 'none', background: '#fff', color: '#7c3aed', fontWeight: 700, fontSize: '1rem', cursor: 'pointer' }}>
          {c.cta}
        </button>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: '24px', textAlign: 'center', borderTop: '1px solid #ede9fe', background: '#faf5ff' }}>
        <p style={{ fontSize: '0.78rem', color: '#9ca3af' }}>
          {c.footer} · <a href="mailto:contact@phtlab.org" style={{ color: '#7c3aed', textDecoration: 'none' }}>Contact</a>
        </p>
      </footer>
    </div>
  )
}
