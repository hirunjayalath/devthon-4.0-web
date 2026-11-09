export function LoadingScreen({ isLeaving }: { isLeaving: boolean }) {
  return (
    <div
      className={`loading-screen${isLeaving ? ' loading-screen--leaving' : ''}`}
      role="status"
      aria-live="polite"
      aria-label="Loading DEV{thon} 4.0"
    >
      <div className="loading-grid" aria-hidden="true" />
      <div className="loading-scan" aria-hidden="true" />

      <div className="loading-shell">
        <p className="loading-kicker">Web development competition</p>
        <div className="loading-wordmark" aria-hidden="true">
          <span>DEV</span>
          <span className="loading-accent">{'{thon}'}</span>
          <span className="loading-version">4.0</span>
          <span className="loading-cursor" />
        </div>

        <div className="loading-progress" aria-hidden="true">
          <span />
        </div>

        <div className="loading-phases" aria-hidden="true">
          <span>Design</span>
          <span>Build</span>
          <span>Launch</span>
        </div>
        <p className="loading-status">Preparing the experience</p>
      </div>
    </div>
  )
}
