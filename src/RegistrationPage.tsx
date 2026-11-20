import { useMemo, useState } from 'react'
import type { FormEvent, HTMLInputTypeAttribute } from 'react'

type Category = 'University' | 'School'
type TeamSize = '' | '3' | '4' | '5'

type MemberDetails = {
  name: string
  email: string
  whatsapp: string
  nic: string
}

type RegistrationForm = {
  category: Category
  teamName: string
  teamSize: TeamSize
  institution: string
  leader: MemberDetails
  members: MemberDetails[]
}

const createMember = (): MemberDetails => ({ name: '', email: '', whatsapp: '', nic: '' })
const inputClass = 'mt-2 w-full border border-white/10 bg-[#111014] px-4 py-3 font-normal text-white outline-none transition focus:border-orange-500'
const registrationEndpoint = (import.meta.env.VITE_REGISTRATION_ENDPOINT as string | undefined)
  || 'https://script.google.com/macros/s/AKfycbxTFsb4jBsGUXOzEa3whB99XmNk8kUTBz37X5ZOHLs5yw1JAb5xuD-NgbK7U9QTk2487A/exec'
const whatsappGroupByCategory: Record<Category, string> = {
  School: 'https://chat.whatsapp.com/KGt36cRCNjr5Bil011CaTG?s=cl&p=a&iam=2',
  University: 'https://chat.whatsapp.com/IVZeeVAL7QZ3Chx2qqAWPV?s=cl&p=a&iam=2',
}

function Field({ label, value, onChange, type = 'text', placeholder, autoComplete, pattern, title, required = true }: {
  label: string
  value: string
  onChange: (value: string) => void
  type?: HTMLInputTypeAttribute
  placeholder?: string
  autoComplete?: string
  pattern?: string
  title?: string
  required?: boolean
}) {
  return (
    <label className="text-sm font-bold">
      {label}{required ? ' *' : ''}
      <input
        required={required}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        pattern={pattern}
        title={title}
        className={inputClass}
      />
    </label>
  )
}

function MemberFields({ heading, member, onChange, requireNic }: {
  heading: string
  member: MemberDetails
  onChange: (key: keyof MemberDetails, value: string) => void
  requireNic: boolean
}) {
  return (
    <div>
      <p className="text-sm font-black uppercase tracking-[0.22em] text-orange-400">Participant details</p>
      <h2 className="mt-3 text-2xl font-black">{heading}</h2>
      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <Field label="Full name" value={member.name} onChange={(value) => onChange('name', value)} autoComplete="name" />
        <Field label="Email" type="email" value={member.email} onChange={(value) => onChange('email', value)} autoComplete="email" />
        <Field
          label="WhatsApp number"
          type="tel"
          value={member.whatsapp}
          onChange={(value) => onChange('whatsapp', value)}
          placeholder="+94 77 123 4567"
          autoComplete="tel"
        />
        {requireNic && (
          <Field
            label="NIC number"
            value={member.nic}
            onChange={(value) => onChange('nic', value)}
            placeholder="123456789V or 200012345678"
            pattern="([0-9]{9}[vVxX]|[0-9]{12})"
            title="Enter a valid old or new Sri Lankan NIC number"
          />
        )}
      </div>
    </div>
  )
}

export function RegistrationPage({ onBack }: { onBack: () => void }) {
  const [step, setStep] = useState(1)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [registrationId, setRegistrationId] = useState('')
  const [form, setForm] = useState<RegistrationForm>({
    category: 'University',
    teamName: '',
    teamSize: '',
    institution: '',
    leader: createMember(),
    members: Array.from({ length: 4 }, createMember),
  })

  const teamSize = Number(form.teamSize || 3)
  const reviewStep = teamSize + 2
  const activeMemberIndex = step >= 3 && step < reviewStep ? step - 3 : null
  const visibleMembers = useMemo(() => form.members.slice(0, teamSize - 1), [form.members, teamSize])

  const updateForm = <Key extends keyof RegistrationForm>(key: Key, value: RegistrationForm[Key]) => {
    setForm((current) => ({ ...current, [key]: value }))
  }

  const updateLeader = (key: keyof MemberDetails, value: string) => {
    setForm((current) => ({ ...current, leader: { ...current.leader, [key]: value } }))
  }

  const updateMember = (index: number, key: keyof MemberDetails, value: string) => {
    setForm((current) => ({
      ...current,
      members: current.members.map((member, memberIndex) => memberIndex === index ? { ...member, [key]: value } : member),
    }))
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (step < reviewStep) {
      setStep((current) => current + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    if (!registrationEndpoint) {
      setSubmitError('Registration storage is not connected yet. Please try again shortly.')
      return
    }

    setSubmitting(true)
    setSubmitError('')
    try {
      const response = await fetch(registrationEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          source: 'devthon-4-registration-v1',
          category: form.category,
          teamName: form.teamName.trim(),
          teamSize,
          institution: form.institution.trim(),
          leader: form.leader,
          members: visibleMembers,
        }),
        redirect: 'follow',
      })
      const result = await response.json() as { success?: boolean; registrationId?: string; error?: string }
      if (!response.ok || !result.success || !result.registrationId) {
        throw new Error(result.error || 'Registration could not be saved')
      }
      setRegistrationId(result.registrationId)
      setSubmitted(true)
    } catch (error) {
      console.error(error)
      setSubmitError('We could not save your registration. Please check your connection and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const goBack = () => {
    setStep((current) => Math.max(1, current - 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <main className="min-h-screen bg-[#111014] px-6 py-8 text-white md:px-12">
      <div className="mx-auto max-w-4xl">
        <button onClick={onBack} className="text-sm font-bold text-orange-300 hover:text-white">Back to homepage</button>
        <div className="mt-12">
          <p className="brand-wordmark text-sm font-black tracking-[0.3em]"><span className="text-white">DEV</span><span className="text-orange-500">{'{thon}'} 4.0</span></p>
          <h1 className="mt-3 text-4xl font-black md:text-6xl">Team registration</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-orange-100/60">Register a team of three to five members. University teams provide NIC details; school teams only need their contact and institution details.</p>
        </div>

        {submitted ? (
          <div className="mt-12 border border-orange-400/30 bg-orange-500/10 p-8">
            <p className="text-sm font-black uppercase tracking-[0.22em] text-orange-400">Registration complete</p>
            <h2 className="mt-4 text-2xl font-black">Your team is registered</h2>
            <p className="mt-3 text-base leading-7 text-orange-100/65">Your information has been securely saved for the DEV{'{thon}'} 4.0 organizing team.</p>
            <p className="mt-4 border border-orange-300/20 bg-[#111014] px-4 py-3 font-mono text-sm text-orange-300">Registration ID: {registrationId}</p>
            <div className="mt-6 border border-[#25D366]/35 bg-[#25D366]/10 p-5">
              <p className="font-black text-white">Join your {form.category.toLowerCase()} category WhatsApp group</p>
              <p className="mt-2 text-sm leading-6 text-orange-100/65">Get important competition announcements, reminders and updates from the organizing team.</p>
              <a
                href={whatsappGroupByCategory[form.category]}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex items-center gap-3 bg-[#25D366] px-5 py-3 font-black text-[#07170d] transition hover:bg-[#38e477] focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:ring-offset-2 focus:ring-offset-[#20191b]"
              >
                <svg aria-hidden="true" viewBox="0 0 32 32" className="h-6 w-6 fill-current">
                  <path d="M16.04 3A12.83 12.83 0 0 0 5.01 22.36L3.2 29l6.8-1.78A12.96 12.96 0 0 0 16.03 29h.01A13 13 0 0 0 16.04 3Zm0 23.8a10.74 10.74 0 0 1-5.48-1.5l-.39-.23-4.03 1.06 1.08-3.93-.25-.4a10.64 10.64 0 1 1 9.07 5Zm5.84-7.98c-.32-.16-1.9-.93-2.2-1.04-.29-.11-.5-.16-.72.16-.21.32-.82 1.04-1 1.25-.19.22-.38.24-.7.08-.32-.16-1.35-.5-2.57-1.58a9.66 9.66 0 0 1-1.78-2.22c-.18-.32-.02-.5.14-.66.14-.14.32-.37.48-.56.16-.18.21-.32.32-.53.1-.22.05-.4-.03-.56-.08-.16-.72-1.73-.98-2.37-.26-.62-.52-.54-.72-.55h-.61c-.21 0-.56.08-.85.4-.3.32-1.12 1.1-1.12 2.66 0 1.57 1.15 3.09 1.31 3.3.16.21 2.25 3.43 5.45 4.81.76.33 1.36.52 1.82.67.76.24 1.46.21 2 .13.62-.09 1.9-.77 2.17-1.52.27-.75.27-1.4.19-1.53-.08-.13-.3-.21-.62-.37Z" />
                </svg>
                Join {form.category} WhatsApp group
              </a>
            </div>
            <button onClick={onBack} className="mt-6 border border-orange-300/30 px-6 py-3 font-bold text-orange-100 hover:border-orange-400 hover:text-white">Return home</button>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-10 border border-orange-300/15 bg-[#171419] p-6 md:p-8">
            <div className="mb-8">
              <div className="flex gap-2" aria-hidden="true">
                {Array.from({ length: reviewStep }, (_, index) => (
                  <div key={index} className={`h-2 flex-1 ${index + 1 <= step ? 'bg-orange-500' : 'bg-white/10'}`} />
                ))}
              </div>
              <p className="mt-3 text-sm font-bold text-orange-100/55">Step {step} of {reviewStep}</p>
            </div>

            {step === 1 && (
              <div>
                <p className="text-sm font-black uppercase tracking-[0.22em] text-orange-400">Team setup</p>
                <h2 className="mt-3 text-2xl font-black">Basic team information</h2>
                <div className="mt-6">
                  <label className="text-sm font-bold">Choose category *</label>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {(['University', 'School'] as Category[]).map((category) => (
                      <button
                        type="button"
                        key={category}
                        aria-pressed={form.category === category}
                        onClick={() => updateForm('category', category)}
                        className={`border p-5 text-left font-bold transition ${form.category === category ? 'border-orange-500 bg-orange-500/15 text-orange-300' : 'border-white/10 text-orange-100/60 hover:border-orange-300/40'}`}
                      >
                        {category} category
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  <Field label="Team name" value={form.teamName} onChange={(value) => updateForm('teamName', value)} />
                  <label className="text-sm font-bold">
                    Number of team members *
                    <select
                      required
                      value={form.teamSize}
                      onChange={(event) => updateForm('teamSize', event.target.value as TeamSize)}
                      className={`${inputClass} appearance-none pr-12`}
                    >
                      <option value="">Select team size</option>
                      <option value="3">3 members</option>
                      <option value="4">4 members</option>
                      <option value="5">5 members</option>
                    </select>
                  </label>
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <MemberFields heading="Team leader (Member 1)" member={form.leader} onChange={updateLeader} requireNic={form.category === 'University'} />
                <div className="mt-5">
                  <Field
                    label={`${form.category === 'University' ? 'University' : 'School'} name`}
                    value={form.institution}
                    onChange={(value) => updateForm('institution', value)}
                    placeholder={`Enter your ${form.category.toLowerCase()} name`}
                    autoComplete="organization"
                  />
                </div>
              </div>
            )}

            {activeMemberIndex !== null && (
              <MemberFields
                heading={`Member ${activeMemberIndex + 2}`}
                member={form.members[activeMemberIndex]}
                onChange={(key, value) => updateMember(activeMemberIndex, key, value)}
                requireNic={form.category === 'University'}
              />
            )}

            {step === reviewStep && (
              <div>
                <p className="text-sm font-black uppercase tracking-[0.22em] text-orange-400">Final check</p>
                <h2 className="mt-3 text-2xl font-black">Review the registration</h2>
                <dl className="mt-6 grid gap-4 border border-white/10 bg-[#111014] p-5 sm:grid-cols-2">
                  <div><dt className="text-sm text-orange-100/50">Category</dt><dd className="mt-1 font-bold">{form.category}</dd></div>
                  <div><dt className="text-sm text-orange-100/50">Team</dt><dd className="mt-1 font-bold">{form.teamName}</dd></div>
                  <div><dt className="text-sm text-orange-100/50">Institution</dt><dd className="mt-1 font-bold">{form.institution}</dd></div>
                  <div><dt className="text-sm text-orange-100/50">Team size</dt><dd className="mt-1 font-bold">{teamSize} members</dd></div>
                </dl>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {[form.leader, ...visibleMembers].map((member, index) => (
                    <div key={`${member.email}-${index}`} className="border border-white/10 p-4">
                      <p className="text-sm text-orange-400">{index === 0 ? 'Team leader' : `Member ${index + 1}`}</p>
                      <p className="mt-1 font-bold">{member.name}</p>
                      <p className="mt-1 break-all text-sm text-orange-100/55">{member.email}</p>
                    </div>
                  ))}
                </div>
                <label className="mt-6 flex gap-3 text-base leading-6 text-orange-100/65">
                  <input required type="checkbox" className="mt-1 h-4 w-4 accent-orange-500" />
                  I agree to the event rules and the use of this information for registration purposes.
                </label>
              </div>
            )}

            <div className="mt-8 flex flex-wrap gap-3">
              {step > 1 && <button type="button" onClick={goBack} className="border border-white/15 px-6 py-3 font-bold text-orange-100/75 hover:border-orange-400 hover:text-white">Previous</button>}
              <button type="submit" disabled={submitting} className="bg-orange-600 px-6 py-3 font-bold hover:bg-orange-500 disabled:cursor-wait disabled:opacity-60">{step < reviewStep ? 'Continue' : submitting ? 'Saving registration…' : 'Submit registration'}</button>
            </div>
            {submitError && <p role="alert" className="mt-4 border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-200">{submitError}</p>}
          </form>
        )}
      </div>
    </main>
  )
}
