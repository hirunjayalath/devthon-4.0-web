import { useEffect, useState } from 'react'
import { EventTimeline, PrizePool } from './EventSections'
import { CursorBallField } from './CursorBallField'
import { GallerySection } from './GallerySection'
import { HeroSection } from './HeroSection'
import { LoadingScreen } from './LoadingScreen'
import { RegistrationPage } from './RegistrationPage'
import { SubmissionPage } from './SubmissionPage'
import { AboutSection, CategoryOverview, ContactSection, Footer, OrganizersSection } from './StaticSections'
import { triggerBuildSequence } from './heroExperienceEvents'
import { SUBMISSION_WINDOWS } from './submissionSchedule'
import type { SubmissionKey } from './submissionSchedule'

type PageView = 'home' | 'registration' | 'submission'

function getPageView(): PageView {
  if (window.location.hash === '#register') return 'registration'
  if (window.location.hash.startsWith('#submit')) return 'submission'
  return 'home'
}

function getSubmissionKeyFromHash(): SubmissionKey | null {
  const key = window.location.hash.replace('#submit/', '') as SubmissionKey
  return Object.hasOwn(SUBMISSION_WINDOWS, key) ? key : null
}

function goToRegistration() {
  window.location.hash = 'register'
}

function goToSubmissions(key?: SubmissionKey) {
  window.location.hash = key ? `submit/${key}` : 'submit'
}

function Navigation({ onRegister, onSubmit }: { onRegister: () => void; onSubmit: () => void }) {
  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#111014]/90 px-6 py-4 backdrop-blur md:px-12">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <a href="#home" className="brand-wordmark text-xl font-black tracking-tight">
          <span className="text-white">DEV</span><span className="text-orange-500">{'{thon}'} 4.0</span>
        </a>
        <div className="hidden items-center gap-7 text-sm text-orange-100/70 md:flex">
          <a className="transition hover:text-white" href="#about">About</a>
          <a className="transition hover:text-white" href="#timeline">Timeline</a>
          <a className="transition hover:text-white" href="#prizes">Prizes</a>
          <a className="transition hover:text-white" href="#gallery">Gallery</a>
          <a className="transition hover:text-white" href="#organizers">Organizers</a>
          <button onClick={onSubmit} className="border border-orange-500 px-5 py-2 font-bold text-orange-200 transition hover:bg-orange-500 hover:text-white">Submissions</button>
          <button onClick={onRegister} onFocus={triggerBuildSequence} onMouseEnter={triggerBuildSequence} onPointerDown={triggerBuildSequence} className="bg-orange-600 px-5 py-2 font-bold text-white transition hover:bg-orange-500">Register now</button>
        </div>
        <div className="flex gap-2 md:hidden">
          <button onClick={onSubmit} className="border border-orange-500 px-3 py-2 text-xs font-bold">Submit</button>
          <button onClick={onRegister} onPointerDown={triggerBuildSequence} className="bg-orange-600 px-3 py-2 text-xs font-bold">Register</button>
        </div>
      </div>
    </nav>
  )
}

function HomePage({ onRegister, onSubmit }: { onRegister: () => void; onSubmit: (key?: SubmissionKey) => void }) {
  return (
    <>
      <Navigation onRegister={onRegister} onSubmit={() => onSubmit()} />
      <main id="home">
        <HeroSection onRegister={onRegister} onSubmit={() => onSubmit()} />
        <AboutSection />
        <CategoryOverview />
        <EventTimeline onSubmit={onSubmit} />
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
  const [pageView, setPageView] = useState<PageView>(getPageView)
  const [submissionKey, setSubmissionKey] = useState<SubmissionKey | null>(getSubmissionKeyFromHash)
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
    const onHashChange = () => {
      setPageView(getPageView())
      setSubmissionKey(getSubmissionKeyFromHash())
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  useEffect(() => {
    if (pageView !== 'home') return
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
  }, [pageView])

  const goHome = () => {
    window.location.hash = 'home'
    setPageView('home')
  }

  const page = pageView === 'registration'
    ? <RegistrationPage onBack={goHome} />
    : pageView === 'submission'
      ? <SubmissionPage onBack={goHome} initialKey={submissionKey} />
      : <HomePage onRegister={goToRegistration} onSubmit={goToSubmissions} />

  return (
    <>
      <CursorBallField />
      {loadingStage !== 'done' && <LoadingScreen isLeaving={loadingStage === 'leaving'} />}
      {page}
    </>
  )
}

export default App
