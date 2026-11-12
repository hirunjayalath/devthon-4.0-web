import { useEffect, useState } from 'react'
import devthon1Champions from './assets/gallery/devthon-1-champions.jpeg'
import devthon1FirstRunnersUp from './assets/gallery/devthon-1-first-runners-up.jpeg'
import devthon1Group from './assets/gallery/devthon-1-group.jpeg'
import devthon1SecondRunnersUp from './assets/gallery/devthon-1-second-runners-up.jpeg'
import devthon1Stage from './assets/gallery/devthon-1-stage.jpeg'
import devthon2Champions from './assets/gallery/devthon-2-champions.jpeg'
import devthon2FirstRunnersUp from './assets/gallery/devthon-2-first-runners-up.jpeg'
import devthon2Judging from './assets/gallery/devthon-2-judging.jpeg'
import devthon2SecondRunnersUp from './assets/gallery/devthon-2-second-runners-up.jpeg'
import devthon2Stage from './assets/gallery/devthon-2-stage.jpeg'
import devthon3BestAiTeam from './assets/gallery/devthon-3-best-ai-team.jpeg'
import devthon3SchoolChampions from './assets/gallery/devthon-3-school-champions.jpeg'
import devthon3SchoolFirstRunnersUpA from './assets/gallery/devthon-3-school-first-runners-up-a.jpeg'
import devthon3SchoolFirstRunnersUpB from './assets/gallery/devthon-3-school-first-runners-up-b.jpeg'
import devthon3SchoolSecondRunnersUp from './assets/gallery/devthon-3-school-second-runners-up.jpeg'
import devthon3Stage from './assets/gallery/devthon-3-stage.jpeg'
import devthon3UniversityAwardees from './assets/gallery/devthon-3-university-awardees.jpeg'
import devthon3UniversityAwards from './assets/gallery/devthon-3-university-awards.jpeg'
import devthon3UniversityChampions from './assets/gallery/devthon-3-university-champions.jpeg'
import devthon3UniversityFirstRunnersUp from './assets/gallery/devthon-3-university-first-runners-up.jpeg'
import devthon3UniversitySecondRunnersUp from './assets/gallery/devthon-3-university-second-runners-up.jpeg'

type GalleryImage = {
  src: string
  alt: string
  caption: string
}

type Edition = {
  name: string
  images: GalleryImage[]
}

const editions: Edition[] = [
  {
    name: '1.0',
    images: [
      { src: devthon1Stage, alt: 'DEVthon 1.0 participants gathered on the event stage', caption: 'The DEVthon 1.0 stage' },
      { src: devthon1Group, alt: 'DEVthon 1.0 participants and organizers', caption: 'Event day' },
      { src: devthon1Champions, alt: 'DEVthon 1.0 champions receiving their award', caption: 'Champions' },
      { src: devthon1FirstRunnersUp, alt: 'DEVthon 1.0 first runners-up receiving their award', caption: 'First runners-up' },
      { src: devthon1SecondRunnersUp, alt: 'DEVthon 1.0 second runners-up receiving their award', caption: 'Second runners-up' },
    ],
  },
  {
    name: '2.0',
    images: [
      { src: devthon2Stage, alt: 'DEVthon 2.0 team beside the stage decoration', caption: 'The DEVthon 2.0 stage' },
      { src: devthon2Judging, alt: 'Judges at DEVthon 2.0', caption: 'Judging panel' },
      { src: devthon2Champions, alt: 'DEVthon 2.0 champions receiving their award', caption: 'Champions' },
      { src: devthon2FirstRunnersUp, alt: 'DEVthon 2.0 first runners-up receiving their award', caption: 'First runners-up' },
      { src: devthon2SecondRunnersUp, alt: 'DEVthon 2.0 second runners-up receiving their award', caption: 'Second runners-up' },
    ],
  },
  {
    name: '3.0',
    images: [
      { src: devthon3Stage, alt: 'DEVthon 3.0 participants, organizers and winners gathered at the decorated event stage', caption: 'The DEVthon 3.0 stage' },
      { src: devthon3BestAiTeam, alt: 'DEVthon 3.0 university category best AI team', caption: 'University best AI team' },
      { src: devthon3SchoolSecondRunnersUp, alt: 'DEVthon 3.0 school category second runners-up', caption: 'School second runners-up' },
      { src: devthon3UniversityAwards, alt: 'DEVthon 3.0 university category award winners', caption: 'University award winners' },
      { src: devthon3UniversityAwardees, alt: 'DEVthon 3.0 university category teams with their awards', caption: 'University awardees' },
      { src: devthon3SchoolChampions, alt: 'DEVthon 3.0 school category champions', caption: 'School champions' },
      { src: devthon3SchoolFirstRunnersUpA, alt: 'DEVthon 3.0 school category first runners-up', caption: 'School first runners-up' },
      { src: devthon3SchoolFirstRunnersUpB, alt: 'A DEVthon 3.0 school category first runners-up team', caption: 'School first runners-up team' },
      { src: devthon3UniversitySecondRunnersUp, alt: 'DEVthon 3.0 university category second runners-up', caption: 'University second runners-up' },
      { src: devthon3UniversityChampions, alt: 'DEVthon 3.0 university category champions', caption: 'University champions' },
      { src: devthon3UniversityFirstRunnersUp, alt: 'DEVthon 3.0 university category first runners-up', caption: 'University first runners-up' },
    ],
  },
]

export function GallerySection() {
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null)

  useEffect(() => {
    if (!selectedImage) return

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelectedImage(null)
    }
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', closeOnEscape)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [selectedImage])

  return (
    <section id="gallery" className="reveal-on-scroll scroll-mt-16 bg-[#171419] px-6 py-24 md:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 max-w-2xl">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-orange-400">Gallery</p>
          <h2 className="text-3xl font-black tracking-tight md:text-5xl">Three editions. One growing story.</h2>
        </div>

        <div className="space-y-20">
          {editions.map((edition) => {
            const [featured, ...moments] = edition.images
            const hasManyPhotos = moments.length > 6

            return (
              <article key={edition.name} className="border-t border-orange-400/35 pt-6">
                <header className="mb-6">
                  <h3 className="text-2xl font-black md:text-3xl">
                    <span className="text-white">DEV</span><span className="text-orange-500">{'{thon}'}</span> {edition.name}
                  </h3>
                </header>

                <div className={`grid gap-2 ${hasManyPhotos ? '' : 'lg:grid-cols-[1.35fr_1fr]'}`}>
                  <button
                    type="button"
                    onClick={() => setSelectedImage(featured)}
                    className={`group relative overflow-hidden border border-orange-300/15 bg-[#111014] text-left focus-visible:outline-2 focus-visible:outline-orange-500 ${hasManyPhotos ? 'aspect-[16/9] md:aspect-[16/7]' : 'min-h-[20rem] lg:min-h-full'}`}
                    aria-label={`Open ${featured.caption}`}
                  >
                    <img className="absolute inset-0 h-full w-full object-cover" src={featured.src} alt={featured.alt} loading="lazy" />
                  </button>

                  <div className={`grid grid-cols-2 gap-2 ${hasManyPhotos ? 'md:grid-cols-3 lg:grid-cols-5' : ''}`}>
                    {moments.map((image) => (
                      <button
                        key={image.src}
                        type="button"
                        onClick={() => setSelectedImage(image)}
                        className="group relative aspect-[4/3] overflow-hidden border border-orange-300/15 bg-[#111014] text-left transition-colors hover:border-orange-500/70 focus-visible:outline-2 focus-visible:outline-orange-500"
                        aria-label={`Open ${image.caption}`}
                      >
                        <img className="h-full w-full object-cover" src={image.src} alt={image.alt} loading="lazy" />
                      </button>
                    ))}
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </div>

      {selectedImage && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-[#0b0a0d]/95 p-4 md:p-10"
          role="dialog"
          aria-modal="true"
          aria-label={selectedImage.caption}
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) setSelectedImage(null)
          }}
        >
          <div className="relative max-h-full max-w-6xl border border-orange-300/25 bg-[#111014]">
            <img className="max-h-[82vh] w-auto max-w-full object-contain" src={selectedImage.src} alt={selectedImage.alt} />
            <button type="button" onClick={() => setSelectedImage(null)} className="absolute right-0 top-0 border-b border-l border-orange-300/20 bg-[#111014] px-5 py-3 text-sm font-bold text-orange-400 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-orange-500">
              Close
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
