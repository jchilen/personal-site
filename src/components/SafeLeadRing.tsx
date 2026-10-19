import type { ReactNode } from 'react'

type SafeLeadRingProps = {
  percent: number
  status: 'empty' | 'safe' | 'unsafe'
  children: ReactNode
}

const RADIUS = 54
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

function SafeLeadRing({ percent, status, children }: SafeLeadRingProps) {
  const filledLength = (Math.min(percent, 100) / 100) * CIRCUMFERENCE

  return (
    <div className={`safe-lead-ring is-${status}`}>
      <svg viewBox="0 0 120 120" aria-hidden="true">
        <circle className="ring-track" cx="60" cy="60" r={RADIUS} />
        <circle
          className={'ring-progress' + (filledLength === 0 ? ' is-hidden' : '')}
          cx="60"
          cy="60"
          r={RADIUS}
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE - filledLength}
        />
      </svg>
      <div className="ring-content">{children}</div>
    </div>
  )
}

export default SafeLeadRing