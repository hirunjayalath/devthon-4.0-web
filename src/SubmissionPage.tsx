import { useEffect, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import {
  getDefaultSubmissionKey,
  getSubmissionWindowState,
  SUBMISSION_ORDER,
  SUBMISSION_WINDOWS,
} from './submissionSchedule'
import type { SubmissionKey } from './submissionSchedule'

const MAX_FILE_BYTES = 8 * 1024 * 1024
const submissionEndpoint = (import.meta.env.VITE_SUBMISSION_ENDPOINT as string | undefined)
  || (import.meta.env.VITE_REGISTRATION_ENDPOINT as string | undefined)
  || 'https://script.google.com/macros/s/AKfycbxTFsb4jBsGUXOzEa3whB99XmNk8kUTBz37X5ZOHLs5yw1JAb5xuD-NgbK7U9QTk2487A/exec'

function StatusIcon({ open }: { open: boolean }) {
  return open ? (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-[2]">
      <path d="M7 10V7a5 5 0 0 1 9.7-1.7M5 10h14v11H5z" />
    </svg>
  ) : (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-[2]">
      <path d="M7 10V7a5 5 0 0 1 10 0v3M5 10h14v11H5z" />
    </svg>
  )
}

function readFileAsBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('The selected file could not be read.'))
    reader.onload = () => {
      const value = String(reader.result || '')
      const encoded = value.includes(',') ? value.slice(value.indexOf(',') + 1) : value
      resolve(encoded)
    }
    reader.readAsDataURL(file)
  })
}

export function SubmissionPage({
  onBack,
  initialKey,
}: {
  onBack: () => void
  initialKey?: SubmissionKey | null
}) {
  const [now, setNow] = useState(() => Date.now())
  const [selectedKey, setSelectedKey] = useState<SubmissionKey>(() => initialKey || getDefaultSubmissionKey())
  const [registrationId, setRegistrationId] = useState('')
  const [teamName, setTeamName] = useState('')
  const [leaderEmail, setLeaderEmail] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [agreed, setAgreed] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [submissionId, setSubmissionId] = useState('')

  const schedule = SUBMISSION_WINDOWS[selectedKey]
  const state = getSubmissionWindowState(selectedKey, now)

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30_000)
    return () => window.clearInterval(timer)
  }, [])

  const selectSubmission = (key: SubmissionKey) => {
    setSelectedKey(key)
    setFile(null)
    setError('')
    setSubmissionId('')
  }

  const chooseFile = (event: ChangeEvent<HTMLInputElement>) => {
    const nextFile = event.target.files?.[0] || null
    setError('')
    if (nextFile && nextFile.size > MAX_FILE_BYTES) {
      setFile(null)
      event.target.value = ''
      setError('The file is larger than 8 MB. Please compress it and try again.')
      return
    }
    setFile(nextFile)
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')

    const currentState = getSubmissionWindowState(selectedKey)
    if (!currentState.isOpen) {
      setNow(Date.now())
      setError(`${currentState.message} Dates use Sri Lanka time (UTC+5:30).`)
      return
    }
    if (!registrationId.trim() || !teamName.trim() || !leaderEmail.trim() || !file || !agreed) {
      setError('Complete every field, select a file and confirm the declaration before submitting.')
      return
    }
    if (file.size > MAX_FILE_BYTES) {
      setError('The file is larger than 8 MB. Please compress it and try again.')
      return
    }

    setSubmitting(true)
    try {
      const fileBase64 = await readFileAsBase64(file)
      const response = await fetch(submissionEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          source: 'devthon-4-submission-v1',
          submissionKey: selectedKey,
          category: schedule.category,
          submissionType: schedule.type,
          registrationId: registrationId.trim(),
          teamName: teamName.trim(),
          leaderEmail: leaderEmail.trim(),
          file: {
            name: file.name,
            type: file.type || 'application/octet-stream',
            size: file.size,
            base64: fileBase64,
          },
        }),
      })
      const result = await response.json() as { success?: boolean; submissionId?: string; error?: string }
      if (!response.ok || !result.success || !result.submissionId) {
        throw new Error(result.error || 'The submission could not be saved.')
      }
      setSubmissionId(result.submissionId)
      setFile(null)
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : 'The submission could not be saved. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#111014] px-5 py-10 text-white md:px-10">
      <div className="mx-auto max-w-5xl">
        <button type="button" onClick={onBack} className="border border-orange-300/25 px-4 py-2 text-sm font-bold text-orange-100/70 transition hover:border-orange-400 hover:text-white">
          Back to homepage
        </button>

        <header className="mt-10 max-w-3xl">
          <p className="code-comment text-xs font-bold uppercase tracking-[0.22em] text-orange-400">Competition portal</p>
          <h1 className="mt-3 text-4xl font-black md:text-6xl">Project submissions</h1>
          <p className="mt-5 leading-7 text-orange-100/60">Choose the correct category and stage. Your registration ID and leader email are checked before the file is stored.</p>
        </header>

        <section aria-label="Submission windows" className="mt-10 grid gap-4 md:grid-cols-3">
          {SUBMISSION_ORDER.map((key) => {
            const item = SUBMISSION_WINDOWS[key]
            const itemState = getSubmissionWindowState(key, now)
            const selected = key === selectedKey
            return (
              <button
                key={key}
                type="button"
                aria-pressed={selected}
                onClick={() => selectSubmission(key)}
                className={`min-h-52 border p-5 text-left transition ${selected ? 'border-orange-500 bg-[#21171a]' : 'border-orange-300/15 bg-[#171419] hover:border-orange-500/45'}`}
              >
                <span className="text-xs font-bold uppercase tracking-[0.16em] text-orange-400">{item.category} category</span>
                <strong className="mt-3 block text-xl">{item.type} submission</strong>
                <span className={`mt-5 flex items-center gap-2 text-sm font-black uppercase tracking-[0.12em] ${itemState.isOpen ? 'text-emerald-400' : 'text-orange-100/45'}`}>
                  <StatusIcon open={itemState.isOpen} /> {itemState.statusLabel}
                </span>
                <span className="mt-3 block text-sm leading-6 text-orange-100/55">{itemState.message}</span>
              </button>
            )
          })}
        </section>

        <section className="mt-6 border border-orange-300/15 bg-[#171419] p-6 md:p-8">
          <div className="flex flex-col justify-between gap-4 border-b border-orange-300/10 pb-6 sm:flex-row sm:items-start">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-400">Selected stage</p>
              <h2 className="mt-2 text-2xl font-black">{schedule.category} {schedule.type} submission</h2>
              <p className="mt-2 text-sm text-orange-100/55">{schedule.timelineLabel} · Sri Lanka time</p>
            </div>
            <span className={`flex w-fit items-center gap-2 border px-3 py-2 text-xs font-black uppercase tracking-[0.14em] ${state.isOpen ? 'border-emerald-400/35 text-emerald-400' : 'border-orange-300/20 text-orange-100/45'}`}>
              <StatusIcon open={state.isOpen} /> {state.statusLabel}
            </span>
          </div>

          {submissionId ? (
            <div className="py-8">
              <p className="text-sm font-black uppercase tracking-[0.2em] text-emerald-400">File received</p>
              <h3 className="mt-3 text-3xl font-black">Submission complete</h3>
              <p className="mt-4 leading-7 text-orange-100/60">Keep this confirmation ID. Your file has been stored for the organizing team.</p>
              <p className="mt-5 border border-orange-300/20 bg-[#111014] px-4 py-3 text-sm font-bold text-orange-300">Submission ID: {submissionId}</p>
            </div>
          ) : state.isOpen ? (
            <form onSubmit={submit} className="mt-7 space-y-5">
              <div className="grid gap-5 md:grid-cols-2">
                <label className="block text-sm font-bold">
                  Registration ID *
                  <input value={registrationId} onChange={(event) => setRegistrationId(event.target.value)} placeholder="DEV4-..." className="mt-2 w-full border border-orange-300/15 bg-[#111014] px-4 py-3 outline-none transition focus:border-orange-500" />
                </label>
                <label className="block text-sm font-bold">
                  Registered team name *
                  <input value={teamName} onChange={(event) => setTeamName(event.target.value)} className="mt-2 w-full border border-orange-300/15 bg-[#111014] px-4 py-3 outline-none transition focus:border-orange-500" />
                </label>
              </div>
              <label className="block text-sm font-bold">
                Team leader email *
                <input type="email" value={leaderEmail} onChange={(event) => setLeaderEmail(event.target.value)} className="mt-2 w-full border border-orange-300/15 bg-[#111014] px-4 py-3 outline-none transition focus:border-orange-500" />
              </label>
              <label className="block text-sm font-bold">
                Upload file *
                <input type="file" accept={schedule.accept} onChange={chooseFile} className="mt-2 block w-full border border-dashed border-orange-400/35 bg-[#111014] px-4 py-6 text-sm text-orange-100/60 file:mr-4 file:border-0 file:bg-orange-600 file:px-4 file:py-2 file:font-bold file:text-white" />
                <span className="mt-2 block text-xs font-normal leading-5 text-orange-100/45">{schedule.acceptedFormats}</span>
              </label>
              <label className="flex items-start gap-3 text-sm leading-6 text-orange-100/65">
                <input type="checkbox" checked={agreed} onChange={(event) => setAgreed(event.target.checked)} className="mt-1 h-4 w-4 accent-orange-600" />
                I confirm this is the correct file for my registered team and submission stage.
              </label>
              {error && <p role="alert" className="border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</p>}
              <button type="submit" disabled={submitting} className="bg-orange-600 px-6 py-3 font-bold transition hover:bg-orange-500 disabled:cursor-not-allowed disabled:opacity-45">
                {submitting ? 'Uploading file…' : `Submit ${schedule.type}`}
              </button>
            </form>
          ) : (
            <div className="py-8">
              <p className="max-w-2xl leading-7 text-orange-100/60">{state.message} This form will unlock automatically according to the competition timeline.</p>
            </div>
          )}

          {!submissionId && error && !state.isOpen && <p role="alert" className="mb-2 border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</p>}
        </section>
      </div>
    </main>
  )
}
