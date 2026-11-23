import { TESTING_MODE } from './testingMode'

type StageCountdownProps = {
  opensAt: string
  closesAt: string
  now: number
  className?: string
}

function pad(value: number) {
  return String(value).padStart(2, '0')
}

export function StageCountdown({ opensAt, closesAt, now, className = '' }: StageCountdownProps) {
  const opens = Date.parse(opensAt)
  const closes = Date.parse(closesAt)
  const isUpcoming = now < opens
  const isClosed = now > closes

  if (isClosed) {
    return (
      <p className={`text-xs font-bold uppercase tracking-[0.12em] text-orange-100/40 ${className}`}>
        Official window closed
      </p>
    )
  }

  const target = isUpcoming ? opens : closes
  const remainingSeconds = Math.max(0, Math.floor((target - now) / 1000))
  const days = Math.floor(remainingSeconds / 86_400)
  const hours = Math.floor((remainingSeconds % 86_400) / 3_600)
  const minutes = Math.floor((remainingSeconds % 3_600) / 60)
  const seconds = remainingSeconds % 60
  const action = isUpcoming ? 'opening' : 'closing'
  const label = TESTING_MODE ? `Official ${action} in` : `${isUpcoming ? 'Opens' : 'Closes'} in`
  const time = `${days}d ${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`

  return (
    <div className={`flex flex-wrap items-baseline gap-x-2 gap-y-1 border-l-2 border-orange-500/70 pl-3 ${className}`}>
      <span className="text-xs font-bold uppercase tracking-[0.12em] text-orange-100/45">{label}</span>
      <time dateTime={new Date(target).toISOString()} className="font-mono text-sm font-black tabular-nums text-orange-300">
        {time}
      </time>
    </div>
  )
}
