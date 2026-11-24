import { DragonGuardian } from './DragonGuardian'
import { triggerBuildSequence } from './heroExperienceEvents'

const BOOKLET_DRIVE_URL = (import.meta.env.VITE_BOOKLET_DRIVE_URL as string | undefined)?.trim()
  || 'https://drive.google.com/drive/folders/1O8vSp6vfekBMIT7CCKJNnURtoBPM2gzb?usp=sharing'

export function HeroSection({ onRegister, onSubmit }: { onRegister: () => void; onSubmit: () => void }) {
  return (
    <section className="relative isolate flex min-h-[calc(100svh-3.75rem)] items-center overflow-hidden px-4 py-10 sm:min-h-[calc(100svh-4.25rem)] sm:px-6 sm:py-12 lg:px-12 lg:py-16">
      <DragonGuardian />
      <div className="relative z-10 mx-auto flex max-w-[90rem] justify-center">
        <div className="code-frame hero-code-frame w-full min-w-0 max-w-5xl text-center" data-code-file="hero.tsx">
          <p className="code-comment mb-4 text-xs font-bold uppercase tracking-[0.15em] text-orange-400 sm:mb-5 sm:tracking-[0.26em]">Web development competition</p>
          <h1
            className="text-[clamp(1.65rem,6.3vw,4.35rem)] font-black leading-[0.92] tracking-tight sm:leading-[0.95]"
            aria-label="Design your dreams into reality"
          >
            <span className="block sm:whitespace-nowrap">
              <span className="text-orange-500" aria-hidden="true">&lt;!-- </span>
              Design your dreams
            </span>
            <span className="block sm:whitespace-nowrap">
              <span className="text-orange-500">into reality</span>
              <span className="text-orange-500" aria-hidden="true"> --&gt;</span>
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-4xl text-base leading-7 text-orange-100/65 sm:mt-7 sm:text-lg sm:leading-8">DEV{'{thon}'} 4.0 is a practical platform for school and university developers to learn, collaborate and build meaningful web solutions.</p>
          <div className="mx-auto mt-7 grid w-full max-w-sm gap-3 sm:mt-9 sm:flex sm:max-w-none sm:flex-wrap sm:justify-center sm:gap-4">
            <button
              onClick={onRegister}
              onFocus={triggerBuildSequence}
              onMouseEnter={triggerBuildSequence}
              onPointerDown={triggerBuildSequence}
              className="w-full bg-orange-600 px-6 py-3.5 font-bold transition-colors hover:bg-orange-500 sm:w-auto sm:px-7"
            >
              Register now
            </button>
            <button
              type="button"
              onClick={onSubmit}
              className="w-full border border-orange-500 px-6 py-3.5 font-bold text-orange-200 transition-colors hover:bg-orange-500 hover:text-white sm:w-auto sm:px-7"
            >
              Submissions
            </button>
            <a href="#about" className="w-full border border-orange-300/30 px-6 py-3.5 font-bold text-orange-100 transition-colors hover:border-orange-400/60 sm:w-auto sm:px-7">Explore event</a>
          </div>
          <div className="mx-auto mt-4 flex w-full max-w-sm justify-center sm:mt-5 sm:max-w-none">
            <a
              href={BOOKLET_DRIVE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block w-full border border-orange-300/30 bg-[#171419]/90 px-6 py-3.5 font-bold text-orange-100 transition-colors hover:border-orange-400/60 hover:bg-orange-500/10 sm:w-auto sm:min-w-[14rem] sm:px-7"
            >
              Booklet
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
