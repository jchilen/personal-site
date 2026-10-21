import CategoryBar from '../components/CategoryBar'
import SafeLeadRing from '../components/SafeLeadRing'
import { useState } from 'react'
import { Minus, Plus } from 'lucide-react'
import { calculateSafeLead, type Possession } from '../utils/safeLead'

// Turns whatever was typed into a whole number between 0 and max
function clampInput(value: string, max: number) {
  const number = parseInt(value, 10)
  if (Number.isNaN(number)) return 0
  return Math.min(max, Math.max(0, number))
}

function SafeLeadPage() {
  const [pointsAhead, setPointsAhead] = useState(0)
  const [possession, setPossession] = useState<Possession>('leading')
  const [minutes, setMinutes] = useState(0)
  const [seconds, setSeconds] = useState(0)
  const secondsLeft = minutes * 60 + seconds
  const hasValidInput = pointsAhead > 0 && secondsLeft > 0
  const result = hasValidInput
    ? calculateSafeLead(pointsAhead, possession, secondsLeft)
    : null
  const status = !result ? 'empty' : result.isSafe ? 'safe' : 'unsafe'

  return (
    <>
      <CategoryBar floating />
      <section className="tool-page">
        <p className="eyebrow">Tools</p>
        <h1>CBB: Is the Lead Safe?</h1>
        <p className="tool-intro">
          Find out if a college basketball game is effectively over.
        </p>

        <div className="safe-lead">
          <div className="safe-lead-panel safe-lead-inputs">
            <div className="field">
              <label className="field-label" htmlFor="points-ahead">
                Points ahead
              </label>
              <div className="stepper">
                <button
                  type="button"
                  className="stepper-button"
                  aria-label="Decrease lead"
                  onClick={() => setPointsAhead(Math.max(0, pointsAhead - 1))}
                >
                  <Minus size={20} />
                </button>
                <input
                  id="points-ahead"
                  className="stepper-input"
                  type="text"
                  inputMode="numeric"
                  value={pointsAhead}
                  onChange={(event) =>
                    setPointsAhead(clampInput(event.target.value, 99))
                  }
                />
                <button
                  type="button"
                  className="stepper-button"
                  aria-label="Increase lead"
                  onClick={() => setPointsAhead(Math.min(99, pointsAhead + 1))}
                >
                  <Plus size={20} />
                </button>
              </div>
            </div>

            <div className="field">
              <p className="field-label">Who has the ball?</p>
              <div className="toggle-group">
                <button
                  type="button"
                  className={
                    'toggle-button' +
                    (possession === 'leading' ? ' is-active' : '')
                  }
                  aria-pressed={possession === 'leading'}
                  onClick={() => setPossession('leading')}
                >
                  Leading team
                </button>
                <button
                  type="button"
                  className={
                    'toggle-button' +
                    (possession === 'trailing' ? ' is-active' : '')
                  }
                  aria-pressed={possession === 'trailing'}
                  onClick={() => setPossession('trailing')}
                >
                  Trailing team
                </button>
              </div>
            </div>

            <div className="field">
              <p className="field-label">Time remaining</p>
              <div className="time-group">
                <label className="time-field">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={minutes}
                    onChange={(event) =>
                      setMinutes(clampInput(event.target.value, 40))
                    }
                  />
                  <span>Minutes</span>
                </label>
                <label className="time-field">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={seconds}
                    onChange={(event) =>
                      setSeconds(clampInput(event.target.value, 59))
                    }
                  />
                  <span>Seconds</span>
                </label>
              </div>
            </div>
          </div>
          <div className="safe-lead-panel safe-lead-result">
            <SafeLeadRing
              percent={result ? result.safePercent : 0}
              status={status}
            >
              {status === 'empty' && (
                <span className="ring-hint">Enter inputs</span>
              )}
              {status === 'safe' && (
                <>
                  <span className="ring-verdict">Lead is</span>
                  <span className="ring-value">Safe</span>
                </>
              )}
              {result && status === 'unsafe' && (
                <>
                  <span className="ring-verdict">Not safe</span>
                  <span className="ring-value">{result.safePercent}%</span>
                </>
              )}
            </SafeLeadRing>
          </div>
        </div>

        <p className="tool-credit">
          Uses the{' '}
          <a
            href="https://www.slate.com/articles/sports/sports_nut/2008/03/the_lead_is_safe.single.html"
            target="_blank"
            rel="noopener noreferrer"
          >
            Safe Lead Formula
          </a>{' '}
          created by Bill James.
        </p>
      </section>
    </>
  )
}

export default SafeLeadPage
