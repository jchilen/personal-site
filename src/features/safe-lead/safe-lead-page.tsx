import { useState } from 'react'
import { IconMinus, IconPlus } from '@tabler/icons-react'
import { ToolLayout } from '@/components/tool-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { PanelHeader } from './panel-header'
import { calculateSafeLead, type Possession } from './safe-lead'
import { SafeLeadOutput } from './safe-lead-output'

// Turns whatever was typed into a whole number between 0 and max
function clampInput(value: string, max: number) {
  const number = parseInt(value, 10)
  if (Number.isNaN(number)) return 0
  return Math.min(max, Math.max(0, number))
}

const fieldLabelClass = 'font-heading text-xs tracking-eyebrow text-muted-foreground uppercase'

const numberInputClass =
  'h-auto rounded-none border-0 border-b-2 bg-transparent px-0 py-1 text-center font-heading text-2xl font-semibold shadow-none focus-visible:border-cat-tools focus-visible:ring-0 dark:bg-transparent'

const possessionItemClass =
  'corner-brackets h-10 border text-muted-foreground hover:bg-transparent hover:text-cat-tools data-[state=on]:bg-transparent data-[state=on]:text-cat-tools'

export function SafeLeadPage() {
  const [pointsAhead, setPointsAhead] = useState(0)
  const [possession, setPossession] = useState<Possession>('leading')
  const [minutes, setMinutes] = useState(0)
  const [seconds, setSeconds] = useState(0)

  const secondsLeft = minutes * 60 + seconds
  const hasValidInput = pointsAhead > 0 && secondsLeft > 0
  const result = hasValidInput ? calculateSafeLead(pointsAhead, possession, secondsLeft) : null
  const status = !result ? 'empty' : result.isSafe ? 'safe' : 'unsafe'

  return (
    <ToolLayout
      eyebrow="Tools"
      title="CBB: Is the Lead Safe?"
      intro="Find out if a college basketball game is effectively over."
    >
      <div className="mx-auto grid max-w-188 gap-4 md:grid-cols-2">
        <Card size="sm" className="border shadow-none ring-0">
          <PanelHeader label="Input" number="01" />
          <CardContent className="flex flex-col gap-5">
            <div className="grid grid-cols-[4.5rem_minmax(0,1fr)] items-center gap-3">
              <Label htmlFor="points-ahead" className={fieldLabelClass}>
                Lead
              </Label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon-sm"
                  aria-label="Decrease lead"
                  className="text-cat-tools"
                  onClick={() => setPointsAhead(Math.max(0, pointsAhead - 1))}
                >
                  <IconMinus />
                </Button>
                <Input
                  id="points-ahead"
                  inputMode="numeric"
                  value={pointsAhead}
                  onChange={(event) => setPointsAhead(clampInput(event.target.value, 99))}
                  className={numberInputClass}
                />
                <Button
                  variant="outline"
                  size="icon-sm"
                  aria-label="Increase lead"
                  className="text-cat-tools"
                  onClick={() => setPointsAhead(Math.min(99, pointsAhead + 1))}
                >
                  <IconPlus />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-[4.5rem_minmax(0,1fr)] items-center gap-3">
              <span id="possession-label" className={fieldLabelClass}>
                Ball
              </span>
              <ToggleGroup
                type="single"
                aria-labelledby="possession-label"
                value={possession}
                onValueChange={(value) => {
                  if (value) setPossession(value as Possession)
                }}
                className="grid w-full grid-cols-2 gap-2"
              >
                <ToggleGroupItem value="leading" className={possessionItemClass}>
                  Leading
                </ToggleGroupItem>
                <ToggleGroupItem value="trailing" className={possessionItemClass}>
                  Trailing
                </ToggleGroupItem>
              </ToggleGroup>
            </div>

            <div className="grid grid-cols-[4.5rem_minmax(0,1fr)] items-center gap-3">
              <span className={fieldLabelClass}>Clock</span>
              <div className="flex items-center gap-2">
                <Input
                  aria-label="Minutes"
                  inputMode="numeric"
                  value={minutes}
                  onChange={(event) => setMinutes(clampInput(event.target.value, 40))}
                  className={numberInputClass}
                />
                <span aria-hidden="true" className="font-heading text-2xl font-semibold text-muted-foreground">
                  :
                </span>
                <Input
                  aria-label="Seconds"
                  inputMode="numeric"
                  value={seconds}
                  onChange={(event) => setSeconds(clampInput(event.target.value, 59))}
                  className={numberInputClass}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <SafeLeadOutput
          result={result}
          status={status}
          pointsAhead={pointsAhead}
          possession={possession}
          secondsLeft={secondsLeft}
        />
      </div>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        Uses the{' '}
        <Button asChild variant="link" className="h-auto p-0 text-xs font-normal tracking-normal normal-case">
          <a
            href="https://www.slate.com/articles/sports/sports_nut/2008/03/the_lead_is_safe.single.html"
            target="_blank"
            rel="noopener noreferrer"
          >
            Safe Lead Formula
          </a>
        </Button>{' '}
        created by Bill James.
      </p>
    </ToolLayout>
  )
}