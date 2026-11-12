import { useEffect, useState } from 'react'
import { EventTimeline, PrizePool } from './EventSections'
import { GallerySection } from './GallerySection'
import { HeroSection } from './HeroSection'
import { LoadingScreen } from './LoadingScreen'
import { RegistrationPage } from './RegistrationPage'
import { AboutSection, CategoryOverview, ContactSection, Footer, OrganizersSection } from './StaticSections'

function goToRegistration() {
  window.location.hash = 'register'
}

function Navigation({ onRegister }: { onRegister: () => void }) {
  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#111014]/90 px-6 py-4 backdrop-blur md:px-12">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <a href="#home" className="text-xl font-black tracking-tight">
          <span className="text-white">DEV</span><span className="text-orange-500">{'{thon}'} 4.0</span>
        </a>
        <div className="hidden items-center gap-7 text-sm text-orange-100/70 md:flex">
          <a className="transition hover:text-white" href="#about">About</a>
          <a className="transition hover:text-white" href="#timeline">Timeline</a>
          <a className="transition hover:text-white" href="#prizes">Prizes</a>
          <a className="transition hover:text-white" href="#gallery">Gallery</a>
          <a className="transition hover:text-white" href="#organizers">Organizers</a>
          <button onClick={onRegister} className="bg-orange-600 px-5 py-2 font-bold text-white transition hover:bg-orange-500">Register now</button>
        </div>
        <button onClick={onRegister} className="bg-orange-600 px-4 py-2 text-sm font-bold md:hidden">Register</button>
      </div>
    </nav>
  )
}

function HomePage({ onRegister }: { onRegister: () => void }) {
  return (
    <>
      <Navigation onRegister={onRegister} />
      <main id="home">
        <HeroSection onRegister={onRegister} />
        <AboutSection />
        <CategoryOverview />
        <EventTimeline />
        <PrizePool />
        <GallerySection />
        <OrganizersSection />
        <ContactSection onRegister={onRegister} />
      </main>
      <Footer />
    </>
  )
}

function App() {
  const [isRegistration, setIsRegistration] = useState(window.location.hash === '#register')
  const [loadingStage, setLoadingStage] = useState<'active' | 'leaving' | 'done'>('active')

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const leaveTimer = window.setTimeout(() => setLoadingStage('leaving'), reduceMotion ? 180 : 1350)
    const doneTimer = window.setTimeout(() => setLoadingStage('done'), reduceMotion ? 260 : 1780)

    return () => {
      window.clearTimeout(leaveTimer)
      window.clearTimeout(doneTimer)
    }
  }, [])

  useEffect(() => {
    if (loadingStage === 'done') return
    document.body.classList.add('is-loading')
    return () => document.body.classList.remove('is-loading')
  }, [loadingStage])

  useEffect(() => {
    const onHashChange = () => setIsRegistration(window.location.hash === '#register')
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  useEffect(() => {
    if (isRegistration) return
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    )
    const sections = document.querySelectorAll('.reveal-on-scroll')
    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [isRegistration])

  const goHome = () => {
    window.location.hash = 'home'
    setIsRegistration(false)
  }

  const page = isRegistration ? <RegistrationPage onBack={goHome} /> : <HomePage onRegister={goToRegistration} />

  return (
    <>
      {loadingStage !== 'done' && <LoadingScreen isLeaving={loadingStage === 'leaving'} />}
      {page}
    </>
  )
}

export default App
