import { useEffect, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import {
  getSubmissionWindowState,
  SUBMISSION_ORDER,
  SUBMISSION_WINDOWS,
} from './submissionSchedule'
import type { SubmissionKey } from './submissionSchedule'
import type { Category } from './registrationSchedule'
import { StageCountdown } from './StageCountdown'

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

function isFigmaLink(value: string) {
  try {
    const url = new URL(value.trim())
    return url.protocol === 'https:'
      && (url.hostname === 'figma.com' || url.hostname.endsWith('.figma.com'))
      && url.pathname.length > 1
  } catch {
    return false
  }
}

export function SubmissionPage({
  onBack,
  initialKey,
}: {
  onBack: () => void
  initialKey?: SubmissionKey | null
}) {
  const [now, setNow] = useState(() => Date.now())
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(() => (
    initialKey ? SUBMISSION_WINDOWS[initialKey].category : null
  ))
  const [selectedKey, setSelectedKey] = useState<SubmissionKey | null>(() => initialKey || null)
  const [registrationId, setRegistrationId] = useState('')
  const [teamName, setTeamName] = useState('')
  const [leaderEmail, setLeaderEmail] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [figmaUrl, setFigmaUrl] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [submissionId, setSubmissionId] = useState('')

  const categorySubmissionKeys = selectedCategory
    ? SUBMISSION_ORDER.filter((key) => SUBMISSION_WINDOWS[key].category === selectedCategory)
    : []
  const schedule = selectedKey ? SUBMISSION_WINDOWS[selectedKey] : null
  const state = selectedKey ? getSubmissionWindowState(selectedKey, now) : null

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1_000)
    return () => window.clearInterval(timer)
  }, [])

  const selectCategory = (category: Category) => {
    const firstRelevantKey = SUBMISSION_ORDER.find((key) => SUBMISSION_WINDOWS[key].category === category) || null
    setSelectedCategory(category)
    setSelectedKey(firstRelevantKey)
    setFile(null)
    setFigmaUrl('')
    setAgreed(false)
    setError('')
    setSubmissionId('')
  }

  const selectSubmission = (key: SubmissionKey) => {
    setSelectedKey(key)
    setFile(null)
    setFigmaUrl('')
    setAgreed(false)
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

    if (!selectedKey || !schedule) {
      setError('Choose a category and Submission stage before continuing.')
      return
    }

    const currentState = getSubmissionWindowState(selectedKey)
    if (!currentState.isOpen) {
      setNow(Date.now())
      setError(`${currentState.message} Dates use Sri Lanka time (UTC+5:30).`)
      return
    }
    if (!registrationId.trim() || !teamName.trim() || !leaderEmail.trim() || !agreed) {
      setError('Complete every field and confirm the declaration before submitting.')
      return
    }
    if (schedule.inputMode === 'figma-link' && !figmaUrl.trim()) {
      setError('Paste your public Figma link before submitting.')
      return
    }
    if (schedule.inputMode === 'figma-link' && !isFigmaLink(figmaUrl)) {
      setError('Enter a valid Figma link beginning with https://figma.com or https://www.figma.com.')
      return
    }
    if (schedule.inputMode === 'file' && !file) {
      setError('Select a file before submitting.')
      return
    }
    if (schedule.inputMode === 'file' && file && file.size > MAX_FILE_BYTES) {
      setError('The file is larger than 8 MB. Please compress it and try again.')
      return
    }

    setSubmitting(true)
    try {
      const submissionPayload: Record<string, unknown> = {
        source: 'devthon-4-submission-v1',
        submissionKey: selectedKey,
        category: schedule.category,
        submissionType: schedule.type,
        registrationId: registrationId.trim(),
        teamName: teamName.trim(),
        leaderEmail: leaderEmail.trim(),
      }
      if (schedule.inputMode === 'figma-link') {
        submissionPayload.figmaUrl = figmaUrl.trim()
      } else {
        const selectedFile = file as File
        const fileBase64 = await readFileAsBase64(selectedFile)
        submissionPayload.file = {
          name: selectedFile.name,
          type: selectedFile.type || 'application/octet-stream',
          size: selectedFile.size,
          base64: fileBase64,
        }
      }
      const response = await fetch(submissionEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(submissionPayload),
      })
      const result = await response.json() as { success?: boolean; submissionId?: string; error?: string }
      if (!response.ok || !result.success || !result.submissionId) {
        throw new Error(result.error || 'The submission could not be saved.')
      }
      setSubmissionId(result.submissionId)
      setFile(null)
      setFigmaUrl('')
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
          <h1 className="mt-3 text-4xl font-black md:text-6xl">Project Submissions</h1>
          <p className="mt-5 leading-7 text-orange-100/60">Choose your category first, then select the relevant Submission stage. Your Team ID and leader email are checked before your submission is stored.</p>
        </header>

        <section aria-labelledby="submission-category-heading" className="mt-10">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-400">Step 1</p>
          <h2 id="submission-category-heading" className="mt-2 text-2xl font-black">Choose your category</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {(['University', 'School'] as Category[]).map((category) => {
              const selected = category === selectedCategory
              return (
                <button
                  key={category}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => selectCategory(category)}
                  className={`border p-6 text-left transition ${selected ? 'border-orange-500 bg-[#21171a]' : 'border-orange-300/15 bg-[#171419] hover:border-orange-500/45'}`}
                >
                  <span className="text-xs font-bold uppercase tracking-[0.16em] text-orange-400">{category} category</span>
                  <strong className="mt-3 block text-2xl">{category}</strong>
                  <span className="mt-3 block text-sm leading-6 text-orange-100/55">
                    {category === 'University' ? 'Proposal and UI/UX Submissions' : 'Proposal Submission'}
                  </span>
                </button>
              )
            })}
          </div>
        </section>

        {selectedCategory && categorySubmissionKeys.length > 1 && (
          <section aria-labelledby="submission-stage-heading" className="mt-8">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-400">Step 2</p>
            <h2 id="submission-stage-heading" className="mt-2 text-2xl font-black">Choose your Submission stage</h2>
            <div className={`mt-5 grid gap-4 ${categorySubmissionKeys.length > 1 ? 'md:grid-cols-2' : 'md:grid-cols-1'}`}>
          {categorySubmissionKeys.map((key) => {
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
                <strong className="mt-3 block text-xl">{item.type} Submission</strong>
                <span className={`mt-5 flex items-center gap-2 text-sm font-black uppercase tracking-[0.12em] ${itemState.isOpen ? 'text-emerald-400' : 'text-orange-100/45'}`}>
                  <StatusIcon open={itemState.isOpen} /> {itemState.statusLabel}
                </span>
                <span className="mt-3 block text-sm leading-6 text-orange-100/55">{itemState.message}</span>
                <StageCountdown
                  opensAt={item.opensAt}
                  closesAt={item.closesAt}
                  now={now}
                  className="mt-4"
                />
              </button>
            )
          })}
            </div>
          </section>
        )}

        {schedule && state && (
        <section key={selectedKey} className="mt-6 border border-orange-300/15 bg-[#171419] p-6 md:p-8">
          <div className="flex flex-col justify-between gap-4 border-b border-orange-300/10 pb-6 sm:flex-row sm:items-start">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-400">
                {categorySubmissionKeys.length > 1 ? 'Selected stage' : 'Submission details'}
              </p>
              <h2 className="mt-2 text-2xl font-black">{schedule.category} {schedule.type} Submission</h2>
              <p className="mt-2 text-sm text-orange-100/55">{schedule.timelineLabel} · Sri Lanka time</p>
              <StageCountdown
                opensAt={schedule.opensAt}
                closesAt={schedule.closesAt}
                now={now}
                className="mt-4"
              />
            </div>
            <span className={`flex w-fit items-center gap-2 border px-3 py-2 text-xs font-black uppercase tracking-[0.14em] ${state.isOpen ? 'border-emerald-400/35 text-emerald-400' : 'border-orange-300/20 text-orange-100/45'}`}>
              <StatusIcon open={state.isOpen} /> {state.statusLabel}
            </span>
          </div>

          {submissionId ? (
            <div className="py-8">
              <p className="text-sm font-black uppercase tracking-[0.2em] text-emerald-400">{schedule.inputMode === 'figma-link' ? 'Figma link received' : 'File received'}</p>
              <h3 className="mt-3 text-3xl font-black">Submission complete</h3>
              <p className="mt-4 leading-7 text-orange-100/60">Keep this confirmation ID. Your {schedule.inputMode === 'figma-link' ? 'Figma link' : 'file'} has been stored for the organizing team.</p>
              <p className="mt-5 border border-orange-300/20 bg-[#111014] px-4 py-3 text-sm font-bold text-orange-300">Submission ID: {submissionId}</p>
            </div>
          ) : state.isOpen ? (
            <form onSubmit={submit} className="mt-7 space-y-5">
              <div className="grid gap-5 md:grid-cols-2">
                <label className="block text-sm font-bold">
                  Team ID *
                  <input
                    value={registrationId}
                    onChange={(event) => setRegistrationId(event.target.value.toUpperCase())}
                    placeholder={schedule.category === 'University' ? 'DEV-001U' : 'DEV-001S'}
                    pattern={schedule.category === 'University' ? 'DEV-[0-9]{3}U' : 'DEV-[0-9]{3}S'}
                    title={`Enter the ${schedule.category.toLowerCase()} Team ID in the format ${schedule.category === 'University' ? 'DEV-001U' : 'DEV-001S'}`}
                    className="mt-2 w-full border border-orange-300/15 bg-[#111014] px-4 py-3 outline-none transition focus:border-orange-500"
                  />
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
              {schedule.inputMode === 'figma-link' ? (
                <label className="block text-sm font-bold">
                  Public Figma link *
                  <input
                    type="url"
                    inputMode="url"
                    value={figmaUrl}
                    onChange={(event) => setFigmaUrl(event.target.value)}
                    placeholder="https://www.figma.com/design/..."
                    className="mt-2 w-full border border-orange-300/15 bg-[#111014] px-4 py-3 outline-none transition focus:border-orange-500"
                  />
                  <span className="mt-2 block text-xs font-normal leading-5 text-orange-100/45">{schedule.acceptedFormats}</span>
                  <span className="mt-3 block border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-sm font-normal leading-6 text-amber-100">
                    Important: The Figma link should be public. Private or restricted links cannot be reviewed.
                  </span>
                </label>
              ) : (
                <label className="block text-sm font-bold">
                  Upload file *
                  <input type="file" accept={schedule.accept} onChange={chooseFile} className="mt-2 block w-full border border-dashed border-orange-400/35 bg-[#111014] px-4 py-6 text-sm text-orange-100/60 file:mr-4 file:border-0 file:bg-orange-600 file:px-4 file:py-2 file:font-bold file:text-white" />
                  <span className="mt-2 block text-xs font-normal leading-5 text-orange-100/45">{schedule.acceptedFormats}</span>
                </label>
              )}
              <label className="flex items-start gap-3 text-sm leading-6 text-orange-100/65">
                <input type="checkbox" checked={agreed} onChange={(event) => setAgreed(event.target.checked)} className="mt-1 h-4 w-4 accent-orange-600" />
                {schedule.inputMode === 'figma-link'
                  ? 'I confirm this Figma link belongs to my registered team and the link is public.'
                  : 'I confirm this is the correct file for my registered team and submission stage.'}
              </label>
              {error && <p role="alert" className="border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</p>}
              <button type="submit" disabled={submitting} className="bg-orange-600 px-6 py-3 font-bold transition hover:bg-orange-500 disabled:cursor-not-allowed disabled:opacity-45">
                {submitting
                  ? (schedule.inputMode === 'figma-link' ? 'Submitting link…' : 'Uploading file…')
                  : `Submit ${schedule.type}`}
              </button>
            </form>
          ) : (
            <div className="py-8">
              <p className="max-w-2xl leading-7 text-orange-100/60">{state.message}</p>
            </div>
          )}

          {!submissionId && error && !state.isOpen && <p role="alert" className="mb-2 border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</p>}
        </section>
        )}
      </div>
    </main>
  )
}
