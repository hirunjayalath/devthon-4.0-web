import { lazy, Suspense } from 'react'
import { triggerBuildSequence } from './heroExperienceEvents'

const HeroBuildScene = lazy(() => import('./HeroBuildScene').then((module) => ({ default: module.HeroBuildScene })))

export function HeroSection({ onRegister }: { onRegister: () => void }) {
  return (
    <section className="relative isolate overflow-hidden px-6 py-16 md:px-12">
      <div className="mx-auto grid max-w-[90rem] items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="code-frame w-full min-w-0 max-w-[calc(100vw-3rem)] lg:max-w-none" data-code-file="hero.tsx">
          <p className="code-comment mb-5 font-bold uppercase tracking-[0.26em] text-orange-400">Web development competition</p>
          <h1 className="max-w-4xl text-5xl font-black leading-[0.95] tracking-tight md:text-8xl">Design your dreams <span className="text-orange-500">into reality.</span></h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-orange-100/65">DEV{'{thon}'} 4.0 is a practical platform for school and university developers to learn, collaborate and build meaningful web solutions.</p>
          <div className="mt-9 flex flex-wrap gap-4">
            <button
              onClick={onRegister}
              onFocus={triggerBuildSequence}
              onMouseEnter={triggerBuildSequence}
              onPointerDown={triggerBuildSequence}
              className="bg-orange-600 px-7 py-3.5 font-bold transition-colors hover:bg-orange-500"
            >
              Register now
            </button>
            <a href="#about" className="border border-orange-300/30 px-7 py-3.5 font-bold text-orange-100 transition-colors hover:border-orange-400/60">Explore event</a>
          </div>
        </div>
        <Suspense
          fallback={(
            <div className="relative h-[340px] w-full border border-orange-500/30 p-6 sm:h-[430px] lg:-ml-8 lg:h-[590px] lg:w-[calc(100%+4rem)]">
              <div className="border-b border-orange-500/25 pb-3 font-mono text-xs font-bold tracking-[0.18em] text-orange-400">BUILD / TEST / SHIP</div>
              <div className="mt-8 grid grid-cols-3 gap-3"><div className="h-24 border border-orange-300/15" /><div className="h-24 border border-orange-300/15" /><div className="h-24 border border-orange-300/15" /></div>
            </div>
          )}
        >
          <HeroBuildScene />
        </Suspense>
      </div>
    </section>
  )
}
