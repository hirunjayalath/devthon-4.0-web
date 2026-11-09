import { useState } from 'react'

type Category = 'School' | 'University'

type TimelineItem = {
  stage: string
  date: string
  related?: string[]
}

const timelineByCategory: Record<Category, TimelineItem[]> = {
  University: [
    { stage: 'Team Registration', date: 'Dec 10 – Dec 17' },
    { stage: 'Proposal Submission', date: 'Dec 24 – Dec 31' },
    {
      stage: 'UI/UX Submission',
      date: 'Jan 13 – Jan 20',
      related: ['UI/UX Session · Jan 16'],
    },
    {
      stage: 'Semi Finals',
      date: 'Feb 01 – Feb 13',
      related: ['Full Web Development Session · Feb 06', 'Panel Discussion · Date to be announced'],
    },
    { stage: 'Grand Finale', date: 'Feb 27' },
  ],
  School: [
    {
      stage: 'Team Registration',
      date: 'Dec 15 – Dec 29',
      related: ['Online Introductory Session · Date to be announced'],
    },
    {
      stage: 'Proposal Submission',
      date: 'Jan 05 – Jan 17',
      related: ['Proposal Creation Workshop · Date to be announced'],
    },
    {
      stage: 'Semi Finals',
      date: 'Jan 27 – Feb 13',
      related: ['Full Web Development Session · Jan 30'],
    },
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
    <div className="mb-10 inline-flex rounded-xl border border-orange-300/15 bg-[#111014] p-1.5">
      {(['School', 'University'] as Category[]).map((category) => (
        <button
          key={category}
          type="button"
          aria-pressed={active === category}
          onClick={() => onChange(category)}
          className={`rounded-lg px-5 py-2.5 text-sm font-bold transition sm:px-7 ${
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

export function EventTimeline() {
  const [category, setCategory] = useState<Category>('School')
  const items = timelineByCategory[category]

  return (
    <section id="timeline" className="reveal-on-scroll bg-[#171419] px-6 py-24 md:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 max-w-2xl">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-orange-400">Mark your calendar</p>
          <h2 className="text-3xl font-black tracking-tight md:text-5xl">Competition timeline</h2>
          <p className="mt-4 leading-7 text-orange-100/60">Switch between the two categories to see every competition stage, workshop and finale date.</p>
        </div>

        <CategoryTabs active={category} onChange={setCategory} />

        <div className="relative mx-auto max-w-5xl">
          <div className="absolute bottom-0 left-5 top-0 w-px bg-gradient-to-b from-orange-500/10 via-orange-500/80 to-orange-500/10 md:left-1/2" />
          {items.map((item, index) => {
            const isLeft = index % 2 === 0
            return (
              <div
                key={`${category}-${item.stage}`}
                className="relative mb-8 grid grid-cols-[2.75rem_1fr] gap-4 last:mb-0 md:grid-cols-[1fr_4rem_1fr] md:gap-6"
              >
                <div className="relative z-10 col-start-1 row-start-1 mt-3 h-4 w-4 rounded-full border-4 border-[#171419] bg-orange-500 md:col-start-2 md:mx-auto" />
                <article
                  className={`group col-start-2 row-start-1 rounded-3xl border border-orange-300/10 bg-[#111014] p-6 transition hover:-translate-y-1 hover:border-orange-500/40 ${
                    isLeft ? 'md:col-start-1' : 'md:col-start-3'
                  }`}
                >
                  <div className="mb-4 flex items-center justify-between gap-4">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-400">Competition stage</p>
                    <span className="h-px flex-1 bg-gradient-to-r from-orange-500/40 to-transparent" />
                  </div>
                  <h3 className="text-2xl font-black">{item.stage}</h3>
                  <p className="mt-3 text-sm font-bold text-orange-200">{item.date}</p>
                  {item.related?.map((detail) => (
                    <p key={detail} className="mt-4 rounded-xl border border-orange-300/10 bg-orange-500/5 px-4 py-3 text-xs leading-5 text-orange-100/55">{detail}</p>
                  ))}
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
    <section id="prizes" className="reveal-on-scroll px-6 py-24 md:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 max-w-2xl">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-orange-400">Recognition</p>
          <h2 className="text-3xl font-black tracking-tight md:text-5xl">Awards & prizes</h2>
          <p className="mt-4 leading-7 text-orange-100/60">The DEV{'{thon}'} 3.0 prize structure returns for both competition categories.</p>
        </div>

        <CategoryTabs active={category} onChange={setCategory} />

        <div className="grid gap-5 md:grid-cols-3">
          {prize.placements.map((placement, index) => (
            <article
              key={placement.title}
              className={`relative overflow-hidden rounded-3xl border p-7 text-center ${
                index === 0
                  ? 'border-orange-400/40 bg-gradient-to-b from-orange-500/20 to-[#171419]'
                  : 'border-orange-300/10 bg-[#171419]'
              }`}
            >
              <div className="mx-auto h-px w-12 bg-orange-500/60" />
              <h3 className="mt-5 text-xl font-black">{placement.title}</h3>
              <p className="mt-3 text-3xl font-black text-orange-400">{placement.amount}</p>
            </article>
          ))}
        </div>

        <div className="mt-6 rounded-3xl border border-orange-400/25 bg-orange-500/10 p-7 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-orange-300">Total Prize Pool</p>
          <p className="mt-2 text-4xl font-black md:text-5xl">{prize.total}</p>
        </div>
      </div>
    </section>
  )
}
