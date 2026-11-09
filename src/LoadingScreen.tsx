import type { CSSProperties } from 'react'

type ParticleStyle = CSSProperties & {
  '--particle-x': string
  '--particle-y': string
  '--particle-x-far': string
  '--particle-y-far': string
  '--particle-size': string
  '--particle-delay': string
}

const particleStyles: ParticleStyle[] = Array.from({ length: 40 }, (_, index) => {
  const angle = (index / 40) * Math.PI * 2
  const radius = 48 + (index % 5) * 14
  const x = Math.cos(angle) * radius
  const y = Math.sin(angle) * radius

  return {
    '--particle-x': `${x.toFixed(1)}px`,
    '--particle-y': `${y.toFixed(1)}px`,
    '--particle-x-far': `${(x * 1.22).toFixed(1)}px`,
    '--particle-y-far': `${(y * 1.22).toFixed(1)}px`,
    '--particle-size': `${2 + (index % 3)}px`,
    '--particle-delay': `${-((index % 10) * 0.09).toFixed(2)}s`,
  }
})

export function LoadingScreen({ isLeaving }: { isLeaving: boolean }) {
  return (
    <div
      className={`loading-screen${isLeaving ? ' loading-screen--leaving' : ''}`}
      role="status"
      aria-live="polite"
      aria-label="Loading DEV{thon} 4.0"
    >
      <div className="loading-particles" aria-hidden="true">
        {particleStyles.map((style, index) => (
          <span
            key={index}
            className={`loading-particle${index % 6 === 0 ? ' loading-particle--white' : ''}`}
            style={style}
          />
        ))}
      </div>

      <div className="loading-wordmark" aria-hidden="true">
        <span>DEV</span>
        <span className="loading-accent">{'{thon}'}</span>
        <span className="loading-version">4.0</span>
      </div>
    </div>
  )
}
