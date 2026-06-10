import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'

export default function LandingPage() {
  const navigate = useNavigate()

  const { language, setLanguage } = useLanguage()

  function goToLogin() {
    navigate('/login')
  }

  return (
    <div style={{
      minHeight: '100dvh',
      backgroundColor: '#faf5ff',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#1e1b4b',
    }}>

      {/* NAV */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 24px', maxWidth: '680px', margin: '0 auto',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img src="/favicon.svg" width={28} height={28} alt="Symply" />
          <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#7c3aed' }}>symply</span>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            onClick={() => setLanguage(language === 'ko' ? 'en' : 'ko')}
            style={{
              padding: '6px 12px', borderRadius: '8px',
              border: '1px solid #ede9fe', background: '#faf5ff',
              color: '#7c3aed', fontWeight: 600, fontSize: '0.82rem',
              cursor: 'pointer',
            }}
          >
            {language === 'ko' ? '🇺🇸 EN' : '🇰🇷 KO'}
          </button>
          <button
            onClick={goToLogin}
            style={{
              padding: '8px 18px', borderRadius: '10px',
              border: '1.5px solid #7c3aed', background: 'transparent',
              color: '#7c3aed', fontWeight: 600, fontSize: '0.88rem',
              cursor: 'pointer',
            }}
          >
            {language === 'ko' ? '로그인' : 'Sign in'}
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section style={{
        maxWidth: '680px', margin: '0 auto',
        padding: '48px 24px 56px',
        textAlign: 'center',
      }}>
        <div style={{
          display: 'inline-block',
          padding: '4px 14px', borderRadius: '20px',
          background: '#ede9fe', color: '#6d28d9',
          fontSize: '0.78rem', fontWeight: 700,
          marginBottom: '20px', letterSpacing: '0.04em',
        }}>
          🩺 For PCOS · Endometriosis · Fibromyalgia
        </div>
        <h1 style={{
          fontSize: 'clamp(1.8rem, 5vw, 2.8rem)',
          fontWeight: 800, lineHeight: 1.2,
          color: '#1e1b4b', marginBottom: '20px',
        }}>
          Track your symptoms.<br/>
          <span style={{ color: '#7c3aed' }}>Prove your pain.</span>
        </h1>
        <p style={{
          fontSize: '1.05rem', color: '#6b7280',
          lineHeight: 1.7, maxWidth: '480px',
          margin: '0 auto 32px',
        }}>
          Log in 30 seconds. Discover patterns with AI.
          Generate a clinical report your doctor can read in 3 minutes.
        </p>
        <button
          onClick={goToLogin}
          style={{
            padding: '16px 40px', borderRadius: '14px', border: 'none',
            background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
            color: '#fff', fontWeight: 700, fontSize: '1rem',
            cursor: 'pointer', boxShadow: '0 4px 20px rgba(124,58,237,0.3)',
          }}
        >
          Get Started Free →
        </button>
        <p style={{ fontSize: '0.78rem', color: '#9ca3af', marginTop: '12px' }}>
          Free forever · No credit card required
        </p>
      </section>

      {/* PROBLEM */}
      <section style={{
        background: '#fff', padding: '56px 24px',
      }}>
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>
          <p style={{
            textAlign: 'center', fontSize: '0.75rem', fontWeight: 700,
            color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.08em',
            marginBottom: '12px',
          }}>
            The Problem
          </p>
          <h2 style={{
            textAlign: 'center', fontSize: '1.6rem', fontWeight: 800,
            color: '#1e1b4b', marginBottom: '40px', lineHeight: 1.3,
          }}>
            Living with chronic illness is hard enough.<br/>
            <span style={{ color: '#7c3aed' }}>Not being believed makes it worse.</span>
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
            {[
              { emoji: '⏳', title: '2–12 years', body: 'Average time to diagnosis for conditions like endometriosis' },
              { emoji: '🗣️', title: '"It\'s in your head"', body: 'Medical gaslighting affects millions of chronic illness patients' },
              { emoji: '📋', title: '3-minute appointments', body: 'Not enough time to explain months of complex symptoms' },
            ].map((item, i) => (
              <div key={i} style={{
                padding: '24px', borderRadius: '16px',
                background: '#faf5ff', border: '1px solid #ede9fe',
                textAlign: 'center',
              }}>
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
          <p style={{
            textAlign: 'center', fontSize: '0.75rem', fontWeight: 700,
            color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.08em',
            marginBottom: '12px',
          }}>
            How Symply Helps
          </p>
          <h2 style={{
            textAlign: 'center', fontSize: '1.6rem', fontWeight: 800,
            color: '#1e1b4b', marginBottom: '40px',
          }}>
            Your body has a story.<br/>
            <span style={{ color: '#7c3aed' }}>Symply helps you tell it.</span>
          </h2>
          {[
            {
              emoji: '⏱️',
              title: '30-second daily check-in',
              body: 'Log pain, fatigue, sleep, triggers, and mood — even on your worst days. Anchor descriptions help you be consistent.',
              badge: 'Free',
              badgeColor: '#059669',
            },
            {
              emoji: '🤖',
              title: 'AI finds your patterns',
              body: '"On days following less than 6 hours of sleep, your pain is 40% higher." Claude AI delivers insights you can actually use.',
              badge: 'Pro',
              badgeColor: '#7c3aed',
            },
            {
              emoji: '📄',
              title: 'Doctor-ready report in seconds',
              body: 'Generate a 1-2 page clinical PDF summarizing months of symptoms. Designed by an MPH professional for real medical appointments.',
              badge: 'Pro',
              badgeColor: '#7c3aed',
            },
          ].map((item, i) => (
            <div key={i} style={{
              display: 'flex', gap: '20px', alignItems: 'flex-start',
              padding: '24px', borderRadius: '16px',
              background: '#fff', border: '1px solid #ede9fe',
              marginBottom: '12px',
              boxShadow: '0 2px 8px rgba(124,58,237,0.06)',
            }}>
              <div style={{
                fontSize: '1.8rem', flexShrink: 0,
                width: '52px', height: '52px', borderRadius: '14px',
                background: '#faf5ff', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
              }}>
                {item.emoji}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1e1b4b' }}>{item.title}</span>
                  <span style={{
                    padding: '2px 8px', borderRadius: '10px', fontSize: '0.68rem',
                    fontWeight: 700, color: '#fff',
                    background: item.badgeColor,
                  }}>
                    {item.badge}
                  </span>
                </div>
                <p style={{ fontSize: '0.85rem', color: '#6b7280', lineHeight: 1.6, margin: 0 }}>
                  {item.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section style={{ background: '#fff', padding: '56px 24px' }}>
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>
          <p style={{
            textAlign: 'center', fontSize: '0.75rem', fontWeight: 700,
            color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.08em',
            marginBottom: '12px',
          }}>
            Pricing
          </p>
          <h2 style={{
            textAlign: 'center', fontSize: '1.6rem', fontWeight: 800,
            color: '#1e1b4b', marginBottom: '8px',
          }}>
            Less than a coffee a month.
          </h2>
          <p style={{ textAlign: 'center', color: '#6b7280', fontSize: '0.9rem', marginBottom: '36px' }}>
            No ads. No data sales. Ever.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            {/* Free */}
            <div style={{
              padding: '28px', borderRadius: '18px',
              border: '1.5px solid #ede9fe', background: '#faf5ff',
            }}>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: '#1e1b4b', marginBottom: '4px' }}>Free</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#1e1b4b', marginBottom: '16px' }}>$0</div>
              {[
                '✓ Unlimited symptom logging',
                '✓ Calendar heatmap',
                '✓ Trend charts',
                '✓ Weather auto-detection',
                '✓ Pattern Insights (preview)',
              ].map((f, i) => (
                <div key={i} style={{ fontSize: '0.83rem', color: '#6b7280', marginBottom: '8px' }}>{f}</div>
              ))}
              <button
                onClick={goToLogin}
                style={{
                  width: '100%', marginTop: '20px', padding: '12px',
                  borderRadius: '10px', border: '1.5px solid #7c3aed',
                  background: 'transparent', color: '#7c3aed',
                  fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer',
                }}
              >
                Get Started Free
              </button>
            </div>
            {/* Pro */}
            <div style={{
              padding: '28px', borderRadius: '18px',
              border: '2px solid #7c3aed',
              background: 'linear-gradient(135deg, #faf5ff, #ede9fe)',
              position: 'relative',
            }}>
              <div style={{
                position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)',
                background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                color: '#fff', padding: '3px 14px', borderRadius: '20px',
                fontSize: '0.72rem', fontWeight: 700,
              }}>
                MOST POPULAR
              </div>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: '#7c3aed', marginBottom: '4px' }}>Pro</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '4px' }}>
                <span style={{ fontSize: '2rem', fontWeight: 800, color: '#1e1b4b' }}>$3.99</span>
                <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>/month</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#7c3aed', marginBottom: '16px', fontWeight: 600 }}>
                or $29.99/year — save 37%
              </div>
              {[
                '✓ Everything in Free',
                '✓ AI Pattern Analysis',
                '✓ Doctor\'s Report PDF',
                '✓ Flare Prediction (coming soon)',
                '✓ Priority support',
              ].map((f, i) => (
                <div key={i} style={{ fontSize: '0.83rem', color: '#4b5563', marginBottom: '8px', fontWeight: i === 0 ? 400 : 500 }}>{f}</div>
              ))}
              <button
                onClick={goToLogin}
                style={{
                  width: '100%', marginTop: '20px', padding: '12px',
                  borderRadius: '10px', border: 'none',
                  background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                  color: '#fff', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer',
                }}
              >
                ✨ Start Pro
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* BUILT BY */}
      <section style={{ padding: '48px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: '480px', margin: '0 auto' }}>
          <div style={{ fontSize: '1.5rem', marginBottom: '12px' }}>👨‍🔬</div>
          <p style={{ fontSize: '0.9rem', color: '#6b7280', lineHeight: 1.7 }}>
            Built by a <strong style={{ color: '#1e1b4b' }}>public health professional (MPH)</strong> who
            believes chronic illness patients deserve to be heard.
            Evidence-based content from WHO & Cochrane.
            No ads. No data sales.
          </p>
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={{
        background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
        padding: '56px 24px', textAlign: 'center',
      }}>
        <h2 style={{
          fontSize: '1.8rem', fontWeight: 800,
          color: '#fff', marginBottom: '12px',
        }}>
          Start tracking today.
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.95rem', marginBottom: '28px' }}>
          Free to start. No credit card. Cancel anytime.
        </p>
        <button
          onClick={goToLogin}
          style={{
            padding: '16px 40px', borderRadius: '14px', border: 'none',
            background: '#fff', color: '#7c3aed',
            fontWeight: 700, fontSize: '1rem', cursor: 'pointer',
          }}
        >
          Get Started Free →
        </button>
      </section>

      {/* FOOTER */}
      <footer style={{
        padding: '24px', textAlign: 'center',
        borderTop: '1px solid #ede9fe',
        background: '#faf5ff',
      }}>
        <p style={{ fontSize: '0.78rem', color: '#9ca3af' }}>
          © 2026 Symply · No ads · No data sales ·{' '}
          <a href="mailto:whlee5503@gmail.com" style={{ color: '#7c3aed', textDecoration: 'none' }}>
            Contact
          </a>
        </p>
      </footer>

    </div>
  )
}
