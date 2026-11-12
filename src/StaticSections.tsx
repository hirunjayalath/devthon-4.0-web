import { useState } from 'react'
import hirunJayalath from './assets/contacts/hirun-jayalath.png'
import hirunaKarunarathna from './assets/contacts/hiruna-karunarathna.png'
import pasanAmarakoon from './assets/contacts/pasan-amarakoon.png'
import leoSltcLogo from './assets/organizers/leo-sltc.jpeg'
import leoUomLogo from './assets/organizers/leo-uom.png'

function SectionTitle({ eyebrow, title, text }: { eyebrow: string; title: string; text: string }) {
  return (
    <div className="mb-10 max-w-2xl">
      <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-orange-400">{eyebrow}</p>
      <h2 className="text-3xl font-black tracking-tight md:text-5xl">{title}</h2>
      <p className="mt-4 text-base leading-7 text-orange-100/60">{text}</p>
    </div>
  )
}

export function AboutSection() {
  const cards = [
    ['Vision', 'Help emerging developers apply their skills with confidence and create useful web solutions.'],
    ['Mission', 'Provide an inclusive setting for practical learning, collaboration and constructive feedback.'],
    ['Core objectives', 'Grow full-stack skills, encourage teamwork and connect learners with responsible technology guidance.'],
  ]

  return (
    <section id="about" className="reveal-on-scroll bg-[#171419] px-6 py-24 md:px-12">
      <div className="mx-auto max-w-7xl">
        <SectionTitle eyebrow="About the event" title="Learning through development" text="Turn an idea into a proposal, refine the user experience and demonstrate a working solution with guidance from mentors and facilitators." />
        <div className="grid gap-5 md:grid-cols-3">
          {cards.map(([title, copy]) => (
            <article key={title} className="border border-orange-300/10 bg-[#111014] p-7 transition hover:-translate-y-1 hover:border-orange-500/40">
              <div className="h-px w-14 bg-orange-500/60" />
              <h3 className="mt-7 text-xl font-bold">{title}</h3>
              <p className="mt-3 leading-7 text-orange-100/55">{copy}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export function CategoryOverview() {
  const categories = [
    ['School category', 'A friendly starting point for students who want to explore proposals, design and web development foundations.'],
    ['University category', 'A deeper build journey for university and institute teams solving real problems with full-stack web skills.'],
  ]

  return (
    <section className="reveal-on-scroll px-6 py-24 md:px-12">
      <div className="mx-auto max-w-7xl">
        <SectionTitle eyebrow="Choose your track" title="Two categories. One shared ambition." text="The final eligibility rules, team sizes and submission requirements will be added once confirmed by the organizing committee." />
        <div className="grid gap-6 md:grid-cols-2">
          {categories.map(([title, copy]) => (
            <article key={title} className="border border-orange-300/15 bg-gradient-to-br from-orange-500/15 to-transparent p-8">
              <div className="h-px w-20 bg-gradient-to-r from-orange-500/70 to-transparent" />
              <h3 className="mt-16 text-3xl font-black">{title}</h3>
              <p className="mt-4 max-w-lg leading-7 text-orange-100/60">{copy}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export function OrganizersSection() {
  const organizers = [
    {
      role: 'Lead organizer',
      name: 'Leo Club of University of Moratuwa',
      description: 'Leading the charge in youth empowerment and technological innovation through service and leadership.',
      focus: 'Service / Leadership / Innovation',
      logo: leoUomLogo,
      logoAlt: 'Leo Club of University of Moratuwa logo',
      logoScale: 1.06,
    },
    {
      role: 'Co-organizer',
      name: 'Leo Club of Sri Lanka Technology Campus',
      description: 'Building future leaders through technology and service with a vision for sustainable development.',
      focus: 'Technology / Innovation / Leadership',
      logo: leoSltcLogo,
      logoAlt: 'Leo Club of Sri Lanka Technology Campus logo',
      logoScale: 1.18,
    },
  ]

  return (
    <section id="organizers" className="reveal-on-scroll bg-[#171419] px-6 py-24 md:px-12">
      <div className="mx-auto max-w-7xl">
        <SectionTitle eyebrow="Organizers" title="Built by people who care about the next generation." text="A collaboration of visionary organizations committed to fostering innovation, leadership and community service." />
        <div className="grid gap-5 md:grid-cols-2">
          {organizers.map((organizer) => (
            <article key={organizer.name} className="grid gap-7 border border-orange-300/10 bg-[#111014] p-7 sm:grid-cols-[6rem_1fr] sm:items-center">
              <div className="mx-auto h-24 w-24 overflow-hidden rounded-full">
                <img
                  className="h-full w-full object-cover"
                  style={{ transform: `scale(${organizer.logoScale})` }}
                  src={organizer.logo}
                  alt={organizer.logoAlt}
                />
              </div>
              <div>
                <div className="h-px w-16 bg-orange-500/40" />
                <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-orange-400">{organizer.role}</p>
                <h3 className="mt-2 text-2xl font-black">{organizer.name}</h3>
                <p className="mt-4 leading-7 text-orange-100/55">{organizer.description}</p>
                <p className="mt-5 border-t border-orange-300/10 pt-4 text-xs font-bold uppercase tracking-[0.14em] text-orange-300/70">{organizer.focus}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function ContactLinks() {
  return (
    <address className="grid gap-2 not-italic">
      <a className="break-words transition hover:text-orange-400" href="mailto:hirunjayalath24@gmail.com">hirunjayalath24@gmail.com</a>
      <a className="w-fit transition hover:text-orange-400" href="tel:+94769155963">0769155963</a>
    </address>
  )
}

export function ContactSection({ onRegister }: { onRegister: () => void }) {
  const [activeContact, setActiveContact] = useState<number | null>(null)
  const contacts = [
    {
      name: 'Leo Hiruna Karunarathna',
      position: 'President',
      club: 'Leo Club of University of Moratuwa',
      phone: '071 486 8960',
      phoneHref: '+94714868960',
      email: 'karunarathnahiruna2002@gmail.com',
      photo: hirunaKarunarathna,
      photoPosition: 'center top',
    },
    {
      name: 'Leo Pasan Amarakoon',
      position: 'Vice President',
      club: 'Leo Club of University of Moratuwa',
      phone: '070 324 2440',
      phoneHref: '+94703242440',
      email: 'amarakoonpasan1@gmail.com',
      photo: pasanAmarakoon,
      photoPosition: 'center 18%',
      photoTransform: 'translateX(-18%) scale(1.4)',
    },
    {
      name: 'Leo Hirun Jayalath',
      position: 'Director of Web & PR',
      club: 'Leo Club of University of Moratuwa',
      phone: '076 915 5953',
      phoneHref: '+94769155953',
      email: 'hirunjayalath24@gmail.com',
      photo: hirunJayalath,
      photoPosition: 'center 26%',
    },
  ]
  return (
    <section id="contact" className="scroll-mt-16 px-6 py-24 md:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 max-w-2xl">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-orange-400">Contact us</p>
          <h2 className="text-3xl font-black tracking-tight md:text-5xl">Organizing team</h2>
          <p className="mt-4 leading-7 text-orange-100/60">Select a team member to view their contact details.</p>
        </div>

        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col border-t border-orange-300/15 lg:h-[30rem] lg:flex-row">
            {contacts.map((contact, index) => (
              <article
                key={contact.name}
                role="button"
                tabIndex={0}
                onMouseEnter={() => setActiveContact(index)}
                onMouseLeave={() => setActiveContact(null)}
                onFocus={() => setActiveContact(index)}
                onBlur={(event) => {
                  if (!event.currentTarget.contains(event.relatedTarget)) setActiveContact(null)
                }}
                onClick={() => setActiveContact(index)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    setActiveContact(index)
                  }
                }}
                aria-label={`Show contact details for ${contact.name}`}
                className="group relative h-[25rem] cursor-pointer overflow-hidden border-b border-orange-300/15 outline-none last:border-b-0 focus-visible:outline-2 focus-visible:outline-orange-500 focus-visible:outline-offset-[-3px] lg:h-full lg:flex-1 lg:border-b-0 lg:border-r lg:last:border-r-0"
              >
                <img
                  src={contact.photo}
                  alt={contact.name}
                  className="absolute inset-0 h-full w-full object-cover"
                  style={{ objectPosition: contact.photoPosition, transform: contact.photoTransform }}
                />

                <div className={`absolute left-0 top-0 h-0.5 bg-orange-500 transition-[width] duration-300 ${activeContact === index ? 'w-full' : 'w-0'}`} />

                <div className="absolute inset-x-0 bottom-0 bg-[#111014]/95 p-6">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-400">{contact.position}</p>
                  <h3 className="mt-2 text-xl font-black md:text-2xl">{contact.name}</h3>
                  <div className={`grid transition-[grid-template-rows,opacity] duration-300 ${activeContact === index ? 'mt-4 grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                    <div className="overflow-hidden">
                      <p className="leading-6 text-orange-100/60">{contact.club}</p>
                      <address className="mt-4 grid gap-2 not-italic">
                        <a className="w-fit font-bold text-white transition-colors hover:text-orange-400" href={`tel:${contact.phoneHref}`}>{contact.phone}</a>
                        <a className="w-fit max-w-full break-all text-sm text-orange-100/65 transition-colors hover:text-orange-400" href={`mailto:${contact.email}`}>{contact.email}</a>
                      </address>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="mt-12 text-center">
          <button onClick={onRegister} className="border border-orange-500 bg-orange-600 px-7 py-3.5 font-bold transition hover:bg-orange-500">Start registration</button>
        </div>
      </div>
    </section>
  )
}

export function Footer() {
  const quickLinks = [
    ['Home', '#home'],
    ['About', '#about'],
    ['Timeline', '#timeline'],
    ['Prizes', '#prizes'],
    ['Gallery', '#gallery'],
    ['Organizers', '#organizers'],
    ['Contact', '#contact'],
  ]
  const socialLinks = [
    ['Facebook', 'https://www.facebook.com/share/1DRSQHcwxH/'],
    ['Instagram', 'https://www.instagram.com/uomleos?igsh=OGhhN2trY3dtdXdq'],
    ['LinkedIn', 'https://www.linkedin.com/company/uomleos/'],
    ['WhatsApp', 'https://whatsapp.com/channel/0029VaezlqsIN9ikcQiKyg39'],
  ]

  return (
    <footer className="border-t border-orange-300/15 bg-[#111014] px-6 pt-14 md:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 pb-12 text-sm text-orange-100/70 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <a href="#home" className="text-3xl font-black tracking-tight text-white">
              DEV<span className="text-orange-500">{'{thon}'} 4.0</span>
            </a>
            <p className="mt-3">Design your dreams into reality.</p>
            <ul aria-label="Social media" className="mt-5 flex flex-wrap gap-x-4 gap-y-2">
              {socialLinks.map(([label, href]) => (
                <li key={label}><a className="transition hover:text-orange-400" href={href}>{label}</a></li>
              ))}
            </ul>
          </div>
          <nav aria-label="Footer quick links">
            <h2 className="mb-4 text-base font-bold text-white">Quick Links</h2>
            <ul className="grid gap-2">
              {quickLinks.map(([label, href]) => (
                <li key={href}><a className="transition hover:text-orange-400" href={href}>{label}</a></li>
              ))}
            </ul>
          </nav>
          <div className="min-w-0">
            <h2 className="mb-4 text-base font-bold text-white">Contact</h2>
            <ContactLinks />
            <p className="mt-2">University of Moratuwa</p>
          </div>
        </div>
        <div className="border-y border-orange-300/15 py-7 text-center">
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-orange-400">Organized By</h2>
          <ul aria-label="Organizing clubs" className="mt-6 flex items-center justify-center gap-8 sm:gap-12">
            <li>
              <div className="h-16 w-16 overflow-hidden rounded-full">
                <img className="h-full w-full scale-[1.06] object-cover" src={leoUomLogo} alt="Leo Club of University of Moratuwa logo" />
              </div>
            </li>
            <li>
              <div className="h-16 w-16 overflow-hidden rounded-full">
                <img className="h-full w-full scale-[1.18] object-cover" src={leoSltcLogo} alt="Leo Club of Sri Lanka Technology Campus logo" />
              </div>
            </li>
          </ul>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 py-6 text-sm text-orange-100/60">
          <p>© 2026 <strong className="text-white">DEV<span className="text-orange-500">{'{thon}'} 4.0</span></strong> · All rights reserved</p>
          <a href="#home" className="transition hover:text-orange-400">Back to top</a>
        </div>
      </div>
    </footer>
  )
}
