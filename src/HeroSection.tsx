import { DragonScene } from './DragonScene'

export function HeroSection({ onRegister }: { onRegister: () => void }) {
  return (
    <section className="relative isolate overflow-hidden px-6 py-16 md:px-12">
      <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[1.04fr_0.96fr]">
        <div className="min-w-0">
          <p className="mb-5 font-bold uppercase tracking-[0.35em] text-orange-400">Web development competition</p>
          <h1 className="max-w-4xl text-5xl font-black leading-[0.95] tracking-tight md:text-8xl">Design your dreams <span className="text-orange-500">into reality.</span></h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-orange-100/65">DEV{'{thon}'} 4.0 is a practical platform for school and university developers to learn, collaborate and build meaningful web solutions.</p>
          <div className="mt-9 flex flex-wrap gap-4">
            <button onClick={onRegister} className="bg-orange-600 px-7 py-3.5 font-bold transition-colors hover:bg-orange-500">Register now</button>
            <a href="#about" className="border border-orange-300/30 px-7 py-3.5 font-bold text-orange-100 transition-colors hover:border-orange-400/60">Explore event</a>
          </div>
        </div>
        <DragonScene />
      </div>
    </section>
  )
}
