import { useRef } from 'react'
import { DragonGuardian } from './DragonGuardian'
import { triggerBuildSequence } from './heroExperienceEvents'

export function HeroSection({ onRegister }: { onRegister: () => void }) {
  const heroRef = useRef<HTMLElement>(null)

  return (
    <section ref={heroRef} className="relative isolate overflow-hidden px-6 py-16 md:px-12">
      <DragonGuardian hostRef={heroRef} />
      <div className="relative z-10 mx-auto flex max-w-[90rem] justify-center">
        <div className="code-frame hero-code-frame w-full min-w-0 max-w-5xl text-center" data-code-file="hero.tsx">
          <p className="code-comment mb-5 font-bold uppercase tracking-[0.26em] text-orange-400">Web development competition</p>
          <h1 className="text-[clamp(1.4rem,7vw,5.7rem)] font-black leading-[0.95] tracking-tight">
            <span className="block whitespace-nowrap">Design your dreams</span>
            <span className="block whitespace-nowrap text-orange-500">into reality.</span>
          </h1>
          <p className="mx-auto mt-7 max-w-4xl text-lg leading-8 text-orange-100/65">DEV{'{thon}'} 4.0 is a practical platform for school and university developers to learn, collaborate and build meaningful web solutions.</p>
          <div className="mt-9 flex flex-wrap justify-center gap-4">
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
      </div>
    </section>
  )
}
