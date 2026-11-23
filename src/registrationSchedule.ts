import { TESTING_MODE } from './testingMode'

export type Category = 'University' | 'School'

type RegistrationWindow = {
  opensAt: string
  closesAt: string
  opensLabel: string
  closesLabel: string
  timelineLabel: string
}

export type RegistrationPhase = 'upcoming' | 'open' | 'closed'

export type RegistrationWindowState = {
  phase: RegistrationPhase
  isOpen: boolean
  statusLabel: 'Locked' | 'Unlocked' | 'Closed'
  message: string
}

export const REGISTRATION_WINDOWS: Record<Category, RegistrationWindow> = {
  University: {
    opensAt: '2026-12-10T00:00:00+05:30',
    closesAt: '2026-12-17T23:59:59.999+05:30',
    opensLabel: 'December 10, 2026',
    closesLabel: 'December 17, 2026',
    timelineLabel: 'Dec 10 – Dec 17',
  },
  School: {
    opensAt: '2026-12-15T00:00:00+05:30',
    closesAt: '2026-12-29T23:59:59.999+05:30',
    opensLabel: 'December 15, 2026',
    closesLabel: 'December 29, 2026',
    timelineLabel: 'Dec 15 – Dec 29',
  },
}

const CATEGORY_ORDER: Category[] = ['University', 'School']

export function getRegistrationWindowState(category: Category, now = Date.now()): RegistrationWindowState {
  const schedule = REGISTRATION_WINDOWS[category]

  if (TESTING_MODE) {
    return {
      phase: 'open',
      isOpen: true,
      statusLabel: 'Unlocked',
      message: `${category} registration is temporarily unlocked for testing.`,
    }
  }

  const opensAt = Date.parse(schedule.opensAt)
  const closesAt = Date.parse(schedule.closesAt)

  if (now < opensAt) {
    return {
      phase: 'upcoming',
      isOpen: false,
      statusLabel: 'Locked',
      message: `${category} registration opens on ${schedule.opensLabel}.`,
    }
  }

  if (now <= closesAt) {
    return {
      phase: 'open',
      isOpen: true,
      statusLabel: 'Unlocked',
      message: `${category} registration is open until ${schedule.closesLabel}.`,
    }
  }

  return {
    phase: 'closed',
    isOpen: false,
    statusLabel: 'Closed',
    message: `${category} registration closed on ${schedule.closesLabel}.`,
  }
}

export function getDefaultRegistrationCategory(now = Date.now()): Category {
  const openCategory = CATEGORY_ORDER.find((category) => getRegistrationWindowState(category, now).isOpen)
  if (openCategory) return openCategory

  const upcomingCategory = CATEGORY_ORDER.find((category) => getRegistrationWindowState(category, now).phase === 'upcoming')
  return upcomingCategory ?? 'School'
}
