import type { Category } from './registrationSchedule'
import { TESTING_MODE } from './testingMode'

export type SubmissionType = 'Proposal' | 'UI/UX'
export type SubmissionInputMode = 'file' | 'figma-link'
export type SubmissionKey = 'university-proposal' | 'school-proposal' | 'university-uiux'
export type SubmissionPhase = 'upcoming' | 'open' | 'closed'

export type SubmissionWindow = {
  key: SubmissionKey
  category: Category
  type: SubmissionType
  opensAt: string
  closesAt: string
  opensLabel: string
  closesLabel: string
  timelineLabel: string
  inputMode: SubmissionInputMode
  acceptedFormats: string
  accept: string
}

export type SubmissionWindowState = {
  phase: SubmissionPhase
  isOpen: boolean
  statusLabel: 'Locked' | 'Open' | 'Closed'
  message: string
}

export const SUBMISSION_WINDOWS: Record<SubmissionKey, SubmissionWindow> = {
  'university-proposal': {
    key: 'university-proposal',
    category: 'University',
    type: 'Proposal',
    opensAt: '2026-12-24T00:00:00+05:30',
    closesAt: '2026-12-31T23:59:59.999+05:30',
    opensLabel: 'December 24, 2026',
    closesLabel: 'December 31, 2026',
    timelineLabel: 'Dec 24 – Dec 31',
    inputMode: 'file',
    acceptedFormats: 'PDF, DOC, DOCX, PPT, PPTX or ZIP · maximum 8 MB',
    accept: '.pdf,.doc,.docx,.ppt,.pptx,.zip',
  },
  'school-proposal': {
    key: 'school-proposal',
    category: 'School',
    type: 'Proposal',
    opensAt: '2027-01-05T00:00:00+05:30',
    closesAt: '2027-01-17T23:59:59.999+05:30',
    opensLabel: 'January 5, 2027',
    closesLabel: 'January 17, 2027',
    timelineLabel: 'Jan 05 – Jan 17',
    inputMode: 'file',
    acceptedFormats: 'PDF, DOC, DOCX, PPT, PPTX or ZIP · maximum 8 MB',
    accept: '.pdf,.doc,.docx,.ppt,.pptx,.zip',
  },
  'university-uiux': {
    key: 'university-uiux',
    category: 'University',
    type: 'UI/UX',
    opensAt: '2027-01-13T00:00:00+05:30',
    closesAt: '2027-01-20T23:59:59.999+05:30',
    opensLabel: 'January 13, 2027',
    closesLabel: 'January 20, 2027',
    timelineLabel: 'Jan 13 – Jan 20',
    inputMode: 'figma-link',
    acceptedFormats: 'Public Figma link · The link should be public',
    accept: '',
  },
}

export const SUBMISSION_ORDER = Object.keys(SUBMISSION_WINDOWS) as SubmissionKey[]

export function getSubmissionWindowState(key: SubmissionKey, now = Date.now()): SubmissionWindowState {
  const schedule = SUBMISSION_WINDOWS[key]

  if (TESTING_MODE) {
    return {
      phase: 'open',
      isOpen: true,
      statusLabel: 'Open',
      message: `${schedule.category} ${schedule.type} Submission is temporarily open for testing.`,
    }
  }

  const opensAt = new Date(schedule.opensAt).getTime()
  const closesAt = new Date(schedule.closesAt).getTime()

  if (now < opensAt) {
    return {
      phase: 'upcoming',
      isOpen: false,
      statusLabel: 'Locked',
      message: `${schedule.category} ${schedule.type} Submission opens on ${schedule.opensLabel}.`,
    }
  }

  if (now <= closesAt) {
    return {
      phase: 'open',
      isOpen: true,
      statusLabel: 'Open',
      message: `Submissions are open until ${schedule.closesLabel}.`,
    }
  }

  return {
    phase: 'closed',
    isOpen: false,
    statusLabel: 'Closed',
    message: `Submissions closed on ${schedule.closesLabel}.`,
  }
}

export function getSubmissionKey(category: Category, type: SubmissionType): SubmissionKey | null {
  if (type === 'UI/UX') return category === 'University' ? 'university-uiux' : null
  return category === 'University' ? 'university-proposal' : 'school-proposal'
}

export function getDefaultSubmissionKey(now = Date.now()): SubmissionKey {
  return SUBMISSION_ORDER.find((key) => getSubmissionWindowState(key, now).isOpen)
    ?? SUBMISSION_ORDER.find((key) => getSubmissionWindowState(key, now).phase === 'upcoming')
    ?? 'university-uiux'
}
