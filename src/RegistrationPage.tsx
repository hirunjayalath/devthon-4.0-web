import { useState } from 'react'
import type { FormEvent } from 'react'

export function RegistrationPage({ onBack }: { onBack: () => void }) {
  const [step, setStep] = useState(1)
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({ category: 'University', teamName: '', leaderName: '', email: '', institution: '', members: '' })
  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }))

  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (step < 3) setStep(step + 1)
    else setSubmitted(true)
  }

  return (
    <main className="min-h-screen bg-[#111014] px-6 py-8 text-white md:px-12">
      <div className="mx-auto max-w-3xl">
        <button onClick={onBack} className="text-sm font-bold text-orange-300 hover:text-white">Back to homepage</button>
        <div className="mt-12">
          <p className="text-xs font-black tracking-[0.3em]"><span className="text-white">DEV</span><span className="text-orange-500">{'{thon}'} 4.0</span></p>
          <h1 className="mt-3 text-4xl font-black md:text-6xl">Team registration</h1>
          <p className="mt-4 text-orange-100/60">This frontend form is ready. We will connect it to the official registration database next.</p>
        </div>

        {submitted ? (
          <div className="mt-12 rounded-3xl border border-orange-400/30 bg-orange-500/10 p-8">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-orange-400">Registration preview complete</p>
            <h2 className="mt-4 text-2xl font-black">Registration received for preview</h2>
            <p className="mt-3 text-orange-100/65">The form is currently in frontend demo mode. No information has been sent to a database yet.</p>
            <button onClick={onBack} className="mt-6 rounded-xl bg-orange-600 px-6 py-3 font-bold">Return home</button>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-10 rounded-3xl border border-orange-300/15 bg-[#171419] p-6 md:p-8">
            <div className="mb-8 flex gap-2">
              {[1, 2, 3].map((item) => <div key={item} className={`h-2 flex-1 rounded-sm ${item <= step ? 'bg-orange-500' : 'bg-white/10'}`} />)}
            </div>

            {step === 1 && (
              <div>
                <label className="text-sm font-bold">Choose category</label>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {['University', 'School'].map((category) => (
                    <button type="button" key={category} onClick={() => update('category', category)} className={`rounded-2xl border p-5 text-left font-bold ${form.category === category ? 'border-orange-500 bg-orange-500/15 text-orange-300' : 'border-white/10 text-orange-100/60'}`}>{category} category</button>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="text-sm font-bold">Team name<input required value={form.teamName} onChange={(event) => update('teamName', event.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-[#111014] px-4 py-3 font-normal outline-none focus:border-orange-500" /></label>
                <label className="text-sm font-bold">Institution<input required value={form.institution} onChange={(event) => update('institution', event.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-[#111014] px-4 py-3 font-normal outline-none focus:border-orange-500" /></label>
                <label className="text-sm font-bold">Team leader<input required value={form.leaderName} onChange={(event) => update('leaderName', event.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-[#111014] px-4 py-3 font-normal outline-none focus:border-orange-500" /></label>
                <label className="text-sm font-bold">Email<input required type="email" value={form.email} onChange={(event) => update('email', event.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-[#111014] px-4 py-3 font-normal outline-none focus:border-orange-500" /></label>
              </div>
            )}

            {step === 3 && (
              <div>
                <label className="text-sm font-bold">Team members</label>
                <textarea required value={form.members} onChange={(event) => update('members', event.target.value)} placeholder="One member per line" className="mt-2 min-h-36 w-full rounded-xl border border-white/10 bg-[#111014] px-4 py-3 font-normal outline-none focus:border-orange-500" />
                <label className="mt-5 flex gap-3 text-sm text-orange-100/65"><input required type="checkbox" className="mt-1 accent-orange-500" /> I agree to the event rules and the use of this information for registration purposes.</label>
              </div>
            )}

            <button type="submit" className="mt-8 rounded-xl bg-orange-600 px-6 py-3 font-bold hover:bg-orange-500">{step < 3 ? 'Continue' : 'Submit preview registration'}</button>
          </form>
        )}
      </div>
    </main>
  )
}
