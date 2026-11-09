import type { PointerEvent } from 'react'

function HeroVisual() {
  const updatePointer = (event: PointerEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect()
    const xRatio = (event.clientX - bounds.left) / bounds.width
    const yRatio = (event.clientY - bounds.top) / bounds.height
    const x = xRatio - 0.5
    const y = yRatio - 0.5

    event.currentTarget.style.setProperty('--cursor-x', `${xRatio * 100}%`)
    event.currentTarget.style.setProperty('--cursor-y', `${yRatio * 100}%`)
    event.currentTarget.style.setProperty('--scene-x', `${x * 16}px`)
    event.currentTarget.style.setProperty('--scene-y', `${y * 16}px`)
    event.currentTarget.style.setProperty('--scene-x-inverse', `${x * -10}px`)
    event.currentTarget.style.setProperty('--scene-y-inverse', `${y * -10}px`)
    event.currentTarget.style.setProperty('--scene-rotate-x', `${y * -2.5}deg`)
    event.currentTarget.style.setProperty('--scene-rotate-y', `${x * 3.5}deg`)
  }

  const resetPointer = (event: PointerEvent<HTMLDivElement>) => {
    event.currentTarget.style.setProperty('--cursor-x', '50%')
    event.currentTarget.style.setProperty('--cursor-y', '50%')
    for (const property of ['--scene-x', '--scene-y', '--scene-x-inverse', '--scene-y-inverse']) {
      event.currentTarget.style.setProperty(property, '0px')
    }
    event.currentTarget.style.setProperty('--scene-rotate-x', '0deg')
    event.currentTarget.style.setProperty('--scene-rotate-y', '0deg')
  }

  return (
    <div
      onPointerMove={updatePointer}
      onPointerLeave={resetPointer}
      className="studio-scene relative min-h-[430px] overflow-hidden rounded-[2rem] border border-orange-300/20 bg-[#140f12] sm:min-h-[500px]"
      aria-label="Interactive UI and web development workspace"
    >
      <div className="studio-grid absolute inset-0" />
      <div className="studio-focus absolute inset-0" />

      <div className="studio-kicker absolute left-5 top-5 border-l-2 border-orange-500 pl-3 text-[9px] font-black uppercase tracking-[0.24em] text-orange-300 sm:left-7 sm:top-7">
        Interactive web lab
      </div>

      <div className="studio-note studio-note-ux absolute left-4 top-24 z-20 w-[42%] border border-orange-300/20 bg-[#191316]/95 p-3 sm:left-7 sm:w-44 sm:p-4">
        <p className="text-[8px] font-black uppercase tracking-[0.22em] text-orange-500">UX direction</p>
        <p className="mt-2 text-xs font-bold text-white sm:text-sm">A clear path from idea to action.</p>
        <div className="mt-3 space-y-2" aria-hidden="true">
          <div className="h-px w-full bg-orange-200/25" />
          <div className="h-px w-3/4 bg-orange-200/25" />
          <div className="h-5 w-1/2 border border-orange-500/50 bg-orange-500/10" />
        </div>
      </div>

      <div className="studio-browser absolute left-[12%] top-[26%] z-10 w-[76%] overflow-hidden border border-orange-200/35 bg-[#100d10] sm:left-[16%] sm:top-[22%] sm:w-[68%]">
        <div className="flex items-center justify-between border-b border-orange-200/15 px-3 py-2 text-[7px] font-bold uppercase tracking-[0.18em] text-orange-100/55 sm:px-4 sm:text-[8px]">
          <span>DEV{'{thon}'} interface</span>
          <span className="text-orange-400">Live preview</span>
        </div>

        <div className="studio-page relative min-h-56 overflow-hidden p-4 sm:min-h-64 sm:p-6">
          <div className="studio-page-grid absolute inset-0" />
          <div className="relative z-10 flex items-center justify-between">
            <p className="text-[8px] font-black tracking-[0.2em]"><span className="text-white">DEV</span><span className="text-orange-500">{'{thon}'}</span></p>
            <div className="flex gap-3" aria-hidden="true">
              <div className="h-px w-5 bg-orange-100/40" />
              <div className="h-px w-5 bg-orange-100/40" />
              <div className="h-px w-5 bg-orange-100/40" />
            </div>
          </div>

          <div className="relative z-10 mt-8 grid grid-cols-[1.15fr_0.85fr] gap-4 sm:mt-10 sm:gap-6">
            <div>
              <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-orange-400">Web experience in progress</p>
              <div className="studio-title-line mt-3 h-3 w-[88%] bg-white sm:h-4" />
              <div className="studio-title-line studio-title-line-short mt-2 h-3 w-[64%] bg-white sm:h-4" />
              <div className="mt-4 h-1 w-[82%] bg-orange-100/20" />
              <div className="mt-2 h-1 w-[68%] bg-orange-100/20" />
              <div className="studio-action mt-5 h-7 w-24 border border-orange-400 bg-orange-600/80" />
            </div>
            <div className="studio-layout-preview border border-orange-300/20 bg-orange-500/[0.04] p-2 sm:p-3">
              <div className="h-8 border border-orange-400/40 bg-orange-500/10" />
              <div className="mt-2 grid grid-cols-2 gap-2">
                <div className="h-12 border border-orange-200/20" />
                <div className="h-12 border border-orange-200/20 bg-orange-500/[0.06]" />
              </div>
              <div className="mt-2 h-5 border border-orange-200/20" />
            </div>
          </div>
        </div>
      </div>

      <div className="studio-note studio-note-code absolute bottom-16 right-4 z-20 w-[43%] border border-orange-300/20 bg-[#191316]/95 p-3 sm:bottom-20 sm:right-7 sm:w-48 sm:p-4">
        <p className="text-[8px] font-black uppercase tracking-[0.22em] text-orange-500">Frontend build</p>
        <p className="mt-2 text-xs font-bold text-white sm:text-sm">Responsive. Fast. Ready to ship.</p>
        <div className="mt-3 font-mono text-[8px] leading-4 text-orange-200/55 sm:text-[9px]">
          <p>&lt;section className=&quot;idea&quot;&gt;</p>
          <p className="text-orange-400">display: grid;</p>
          <p>&lt;/section&gt;</p>
        </div>
      </div>

      <div className="studio-progress absolute bottom-6 left-5 right-5 flex items-center gap-3 sm:left-7 sm:right-7">
        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-orange-200/55">Brief</span>
        <div className="h-px flex-1 bg-orange-200/15"><div className="studio-progress-line h-px bg-orange-500" /></div>
        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-orange-400">Launch</span>
      </div>

      <div className="studio-scan absolute bottom-14 top-16 w-px bg-orange-400/45" aria-hidden="true" />
    </div>
  )
}

export function HeroSection({ onRegister }: { onRegister: () => void }) {
  return (
    <section className="relative isolate overflow-hidden px-6 py-16 md:px-12">
      <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="min-w-0">
          <p className="mb-5 font-bold uppercase tracking-[0.35em] text-orange-400">Web development competition</p>
          <h1 className="max-w-4xl text-5xl font-black leading-[0.95] tracking-tight md:text-8xl">Design your dreams <span className="text-orange-500">into reality.</span></h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-orange-100/65">DEV{'{thon}'} 4.0 is a practical platform for school and university developers to learn, collaborate and build meaningful web solutions.</p>
          <div className="mt-9 flex flex-wrap gap-4">
            <button onClick={onRegister} className="rounded-xl bg-orange-600 px-7 py-3.5 font-bold transition hover:-translate-y-0.5 hover:bg-orange-500">Register now</button>
            <a href="#about" className="rounded-xl border border-orange-300/30 px-7 py-3.5 font-bold text-orange-100 transition hover:bg-orange-500/10">Explore event</a>
          </div>
        </div>
        <HeroVisual />
      </div>
    </section>
  )
}
