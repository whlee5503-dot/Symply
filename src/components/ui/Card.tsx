import type { ReactNode, CSSProperties } from 'react'

interface CardProps {
  children: ReactNode
  style?: CSSProperties
  padding?: string
}

export default function Card({ children, style, padding = '16px' }: CardProps) {
  return (
    <div style={{
      backgroundColor: 'var(--color-surface)',
      borderRadius: '16px',
      border: '1px solid var(--color-border)',
      padding,
      ...style,
    }}>
      {children}
    </div>
  )
}
