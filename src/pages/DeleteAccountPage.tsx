import ReactMarkdown from 'react-markdown'
import { Link } from 'react-router-dom'
import enContent from '../content/delete-account-en.md?raw'
import koContent from '../content/delete-account-ko.md?raw'
import esContent from '../content/delete-account-es.md?raw'

type Lang = 'en' | 'ko' | 'es'

const CONTENT: Record<Lang, string> = { en: enContent, ko: koContent, es: esContent }
const LABELS: Record<Lang, string> = { en: 'English', ko: '한국어', es: 'Español' }
const PATHS: Record<Lang, string> = {
    en: '/delete-account', ko: '/delete-account/ko', es: '/delete-account/es',
}

export default function DeleteAccountPage({ lang }: { lang: Lang }) {
    return (
        <div style={{ backgroundColor: 'var(--color-bg)', minHeight: '100dvh' }}>
            <div style={{ maxWidth: '720px', margin: '0 auto', padding: '24px 20px 60px' }}>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
                    {(Object.keys(LABELS) as Lang[]).map(l => (
                        <Link
                            key={l}
                            to={PATHS[l]}
                            style={{
                                padding: '6px 14px', borderRadius: '20px', fontSize: '0.85rem', textDecoration: 'none',
                                border: l === lang ? '2px solid var(--color-secondary)' : '1px solid var(--color-border)',
                                background: l === lang ? 'var(--color-secondary-light)' : 'var(--color-surface-2)',
                                color: l === lang ? 'var(--color-secondary)' : 'var(--color-text-muted)',
                                fontWeight: l === lang ? 700 : 400,
                            }}
                        >
                            {LABELS[l]}
                        </Link>
                    ))}
                </div>

                <ReactMarkdown
                    components={{
                        h1: p => <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: '6px' }} {...p} />,
                        h2: p => <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-text)', marginTop: '28px', marginBottom: '10px' }} {...p} />,
                        p: p => <p style={{ fontSize: '0.9rem', color: 'var(--color-text)', lineHeight: 1.7, marginBottom: '12px' }} {...p} />,
                        ul: p => <ul style={{ fontSize: '0.9rem', color: 'var(--color-text)', lineHeight: 1.7, marginBottom: '12px', paddingLeft: '20px' }} {...p} />,
                        ol: p => <ol style={{ fontSize: '0.9rem', color: 'var(--color-text)', lineHeight: 1.7, marginBottom: '12px', paddingLeft: '20px' }} {...p} />,
                        li: p => <li style={{ marginBottom: '4px' }} {...p} />,
                        strong: p => <strong style={{ fontWeight: 700 }} {...p} />,
                    }}
                >
                    {CONTENT[lang]}
                </ReactMarkdown>
            </div>
        </div>
    )
}
