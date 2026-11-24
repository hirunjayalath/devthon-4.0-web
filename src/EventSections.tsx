import { useEffect, useState } from 'react'
import { REGISTRATION_WINDOWS } from './registrationSchedule'
import type { Category } from './registrationSchedule'
import { getSubmissionWindowState, SUBMISSION_WINDOWS } from './submissionSchedule'
import type { SubmissionKey } from './submissionSchedule'
import { StageCountdown } from './StageCountdown'

type TimelineItem = {
  stage: string
  date: string
  submissionKey?: SubmissionKey
  registrationCategory?: Category
}

const timelineByCategory: Record<Category, TimelineItem[]> = {
  University: [
    { stage: 'Team Registration', date: REGISTRATION_WINDOWS.University.timelineLabel, registrationCategory: 'University' },
    {
      stage: 'Proposal Submission',
      date: SUBMISSION_WINDOWS['university-proposal'].timelineLabel,
      submissionKey: 'university-proposal',
    },
    {
      stage: 'UI/UX Submission',
      date: SUBMISSION_WINDOWS['university-uiux'].timelineLabel,
      submissionKey: 'university-uiux',
    },
    { stage: 'UI/UX Session', date: 'Jan 16' },
    {
      stage: 'Semi Finals',
      date: 'Feb 01 – Feb 13',
    },
    { stage: 'Full Web Development Session', date: 'Feb 06' },
    { stage: 'Panel Discussion', date: 'Date to be announced' },
    { stage: 'Grand Finale', date: 'Feb 27' },
  ],
  School: [
    {
      stage: 'Team Registration',
      date: REGISTRATION_WINDOWS.School.timelineLabel,
      registrationCategory: 'School',
    },
    { stage: 'Online Introductory Session', date: 'Date to be announced' },
    {
      stage: 'Proposal Submission',
      date: SUBMISSION_WINDOWS['school-proposal'].timelineLabel,
      submissionKey: 'school-proposal',
    },
    { stage: 'Proposal Creation Workshop', date: 'Date to be announced' },
    {
      stage: 'Semi Finals',
      date: 'Jan 27 – Feb 13',
    },
    { stage: 'Full Web Development Session', date: 'Jan 30' },
    { stage: 'Grand Finale', date: 'Feb 27' },
  ],
}

const prizeByCategory = {
  School: {
    total: 'LKR 70,000',
    placements: [
      { title: 'Champion', amount: 'LKR 20,000' },
      { title: '1st Runner Up', amount: 'LKR 15,000' },
      { title: '2nd Runner Up', amount: 'LKR 10,000' },
    ],
  },
  University: {
    total: 'LKR 150,000',
    placements: [
      { title: 'Champion', amount: 'LKR 50,000' },
      { title: '1st Runner Up', amount: 'LKR 30,000' },
      { title: '2nd Runner Up', amount: 'LKR 20,000' },
    ],
  },
} satisfies Record<Category, {
  total: string
  placements: { title: string; amount: string }[]
}>

function CategoryTabs({ active, onChange }: { active: Category; onChange: (category: Category) => void }) {
  return (
    <div className="mb-8 flex w-full border border-orange-300/15 bg-[#111014] p-1 sm:mb-10 sm:inline-flex sm:w-auto sm:p-1.5">
      {(['School', 'University'] as Category[]).map((category) => (
        <button
          key={category}
          type="button"
          aria-pressed={active === category}
          onClick={() => onChange(category)}
          className={`min-w-0 flex-1 px-2.5 py-2.5 text-xs font-bold transition sm:flex-none sm:px-7 sm:text-sm ${
            active === category
              ? 'bg-orange-600 text-white'
              : 'text-orange-100/55 hover:text-white'
          }`}
        >
          {category} Category
        </button>
      ))}
    </div>
  )
}

export function EventTimeline({ onSubmit }: { onSubmit: (key: SubmissionKey) => void }) {
  const [category, setCategory] = useState<Category>('School')
  const [now, setNow] = useState(() => Date.now())
  const items = timelineByCategory[category]

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1_000)
    return () => window.clearInterval(timer)
  }, [])

  return (
    <section id="timeline" className="reveal-on-scroll scroll-mt-14 bg-[#171419] px-4 py-16 sm:scroll-mt-16 sm:px-6 sm:py-20 lg:px-12 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 max-w-2xl">
          <p className="code-comment mb-3 text-xs font-bold uppercase tracking-[0.24em] text-orange-400">Mark your calendar</p>
          <h2 className="text-3xl font-black leading-tight tracking-tight sm:text-4xl lg:text-5xl">Competition Timeline</h2>
          <p className="mt-4 leading-7 text-orange-100/60">Switch between the two categories to see every competition stage, workshop and finale date.</p>
        </div>

        <CategoryTabs active={category} onChange={setCategory} />

        <div className="relative mx-auto max-w-5xl">
          <div className="timeline-spine" aria-hidden="true">
            <span className="timeline-spine__runner" />
          </div>
          {items.map((item, index) => {
            const isLeft = index % 2 === 0
            const submissionState = item.submissionKey ? getSubmissionWindowState(item.submissionKey, now) : null
            const countdownWindow = item.submissionKey
              ? SUBMISSION_WINDOWS[item.submissionKey]
              : item.registrationCategory
                ? REGISTRATION_WINDOWS[item.registrationCategory]
                : null
            return (
              <div
                key={`${category}-${item.stage}`}
                className="relative mb-6 grid grid-cols-[1.5rem_minmax(0,1fr)] gap-3 last:mb-0 sm:mb-8 sm:grid-cols-[2.75rem_minmax(0,1fr)] sm:gap-4 md:grid-cols-[1fr_4rem_1fr] md:gap-6"
              >
                <div className="relative z-10 col-start-1 row-start-1 mx-auto mt-3 h-3 w-3 rounded-full border-[3px] border-[#171419] bg-orange-500 sm:h-4 sm:w-4 sm:border-4 md:col-start-2" />
                <article
                  className={`group col-start-2 row-start-1 min-w-0 border border-orange-300/10 bg-[#111014] p-4 transition hover:-translate-y-1 hover:border-orange-500/40 sm:p-6 ${
                    isLeft ? 'md:col-start-1' : 'md:col-start-3'
                  }`}
                >
                  <div className="mb-4 flex items-center justify-between gap-4">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-400">stage:</p>
                    <span className="h-px flex-1 bg-orange-500/40" />
                  </div>
                  <h3 className="text-xl font-black sm:text-2xl">{item.stage}</h3>
                  <p className="mt-3 text-sm font-bold text-orange-200"><span className="text-orange-100/40">date: </span>{item.date}</p>
                  {countdownWindow && (
                    <StageCountdown
                      opensAt={countdownWindow.opensAt}
                      closesAt={countdownWindow.closesAt}
                      now={now}
                      className="mt-4"
                    />
                  )}
                  {item.submissionKey && submissionState && (
                    <div className="mt-5 border-t border-orange-300/10 pt-5">
                      <p className={`text-xs font-black uppercase tracking-[0.15em] ${submissionState.isOpen ? 'text-emerald-400' : 'text-orange-100/40'}`}>
                        {submissionState.statusLabel}
                      </p>
                      <button
                        type="button"
                        disabled={!submissionState.isOpen}
                        onClick={() => onSubmit(item.submissionKey as SubmissionKey)}
                        className="mt-3 w-full bg-orange-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-orange-500 disabled:cursor-not-allowed disabled:bg-orange-900/45 disabled:text-orange-100/35"
                      >
                        {submissionState.isOpen ? `Submit ${SUBMISSION_WINDOWS[item.submissionKey].type}` : `${SUBMISSION_WINDOWS[item.submissionKey].type} Submission ${submissionState.statusLabel.toLowerCase()}`}
                      </button>
                    </div>
                  )}
                </article>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export function PrizePool() {
  const [category, setCategory] = useState<Category>('School')
  const prize = prizeByCategory[category]

  return (
    <section id="prizes" className="reveal-on-scroll scroll-mt-14 px-4 py-16 sm:scroll-mt-16 sm:px-6 sm:py-20 lg:px-12 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 max-w-2xl">
          <p className="code-comment mb-3 text-xs font-bold uppercase tracking-[0.24em] text-orange-400">Recognition</p>
          <h2 className="text-3xl font-black leading-tight tracking-tight sm:text-4xl lg:text-5xl">Awards & Prizes</h2>
        </div>

        <CategoryTabs active={category} onChange={setCategory} />

        <div className="grid gap-5 md:grid-cols-2">
          {prize.placements.map((placement, index) => (
            <article
              key={placement.title}
              className={`relative flex min-h-44 flex-col items-center justify-center overflow-hidden border p-5 text-center sm:min-h-48 sm:p-7 ${
                index === 0
                  ? 'border-orange-400/40 bg-[#171419]'
                  : 'border-orange-300/10 bg-[#171419]'
              } ${index === 0 ? 'md:col-span-2 md:mx-auto md:w-[calc(50%-0.625rem)]' : ''}`}
            >
              <p className="code-key absolute left-7 top-7">rank[{index}]</p>
              <h3 className="text-xl font-black">{placement.title}</h3>
              <p className="mt-3 flex flex-wrap items-baseline justify-center gap-x-2 text-2xl font-black text-orange-400 sm:text-3xl"><span className="text-sm font-bold text-orange-100/40">prize:</span>{placement.amount}</p>
            </article>
          ))}
        </div>

        <div className="mt-6 border border-orange-400/25 bg-[#171419] p-7 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-orange-300"><span className="text-orange-100/40">const </span>totalPrizePool</p>
          <p className="mt-2 text-4xl font-black md:text-5xl">{prize.total}</p>
        </div>
      </div>
    </section>
  )
}
