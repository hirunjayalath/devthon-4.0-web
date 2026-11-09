export function LoadingScreen({ isLeaving }: { isLeaving: boolean }) {
  return (
    <div
      className={`loading-screen${isLeaving ? ' loading-screen--leaving' : ''}`}
      role="status"
      aria-live="polite"
      aria-label="Loading DEV{thon} 4.0"
    >
      <div className="loading-grid" aria-hidden="true" />
      <div className="loading-stage">
        <div className="loading-wireframe" aria-hidden="true">
          <span className="loading-wire loading-wire--top" />
          <span className="loading-wire loading-wire--side" />
          <span className="loading-wire loading-wire--line-a" />
          <span className="loading-wire loading-wire--line-b" />
          <span className="loading-wire loading-wire--panel-a" />
          <span className="loading-wire loading-wire--panel-b" />
        </div>
        <div className="loading-sweep" aria-hidden="true" />

        <div className="loading-wordmark" aria-hidden="true">
          <span>DEV</span>
          <span className="loading-accent">{'{thon}'}</span>
          <span className="loading-version">4.0</span>
        </div>

        <div className="loading-progress" aria-hidden="true">
          <span />
        </div>

        <span className="loading-corner loading-corner--tl" aria-hidden="true" />
        <span className="loading-corner loading-corner--tr" aria-hidden="true" />
        <span className="loading-corner loading-corner--bl" aria-hidden="true" />
        <span className="loading-corner loading-corner--br" aria-hidden="true" />
      </div>
    </div>
  )
}
