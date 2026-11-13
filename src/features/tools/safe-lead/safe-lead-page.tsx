import { useState } from 'react'
import { cn } from 'cn'
import { IconMinus, IconPlus } from '@tabler/icons-react'
import { ToolLayout } from '@/components/tool-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { underlineInputClass } from '@/components/field-styles'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { PanelHeader } from '@/components/panel-header'
import { flatCardClass } from '@/components/card-styles'
import { glideClass } from '@/components/motion-styles'
import { calculateSafeLead, POSSESSIONS, type Possession } from './safe-lead'
import { isOneOf } from '@/lib/one-of'
import { SafeLeadOutput } from './safe-lead-output'
import { useNumberField, type NumberField } from '@/hooks/use-number-field'
import { MethodologyLayout } from '@/components/methodology-layout'
import { SafeLeadMethodology } from './safe-lead-methodology'
import { InlineLink } from '@/components/inline-link'
import { eyebrowClass } from '@/components/text-styles'

// The shared underline input, centered and larger, for the lead and seconds. Named apart from the
// shared numberInputClass, which is right-aligned and smaller
const largeNumberInputClass = `${underlineInputClass} text-center font-heading text-2xl font-semibold`

// One input row with a fixed label column, so Lead, Ball, and Seconds Remaining line up. Wide
// enough for "Remaining", the longest word; "Seconds Remaining" wraps onto two lines
const rowClass = 'grid grid-cols-[6.5rem_minmax(0,1fr)] items-center gap-3'

// The longest game is 40 minutes; overtime isn't covered
const MAX_SECONDS = 40 * 60

const possessionItemClass =
    'corner-brackets h-10 border text-muted-foreground hover:bg-transparent hover:text-cat-tools data-[state=on]:bg-transparent data-[state=on]:text-cat-tools'

export function SafeLeadPage() {
    const lead = useNumberField({ max: 99 })
    // Starts at the last two minutes, when the question usually comes up
    const seconds = useNumberField({ max: MAX_SECONDS, initial: 120 })
    const [possession, setPossession] = useState<Possession>('leading')

    const pointsAhead = lead.number
    const secondsLeft = seconds.number
    const hasValidInput = pointsAhead > 0 && secondsLeft > 0
    const result = hasValidInput
        ? calculateSafeLead(pointsAhead, possession, secondsLeft)
        : null
    const status = !result ? 'empty' : result.isSafe ? 'safe' : 'unsafe'

    return (
        <ToolLayout
            eyebrow="Tools"
            title="Is the Lead Safe?"
            intro="Find out if a college basketball game is effectively over."
        >
            <MethodologyLayout
                title="How the lead is measured"
                methodology={<SafeLeadMethodology />}
            >
                <div className="grid gap-4 @xl:grid-cols-2">
                    <Card size="sm" className={cn(flatCardClass, glideClass)}>
                        <PanelHeader label="Input" number={1} />
                        <CardContent className="flex flex-col gap-5">
                            <LargeNumberStepper
                                id="points-ahead"
                                label="Lead"
                                decreaseLabel="Decrease lead"
                                increaseLabel="Increase lead"
                                field={lead}
                            />

                            <div className={rowClass}>
                                <span
                                    id="possession-label"
                                    className={eyebrowClass}
                                >
                                    Ball
                                </span>
                                <ToggleGroup
                                    type="single"
                                    aria-labelledby="possession-label"
                                    value={possession}
                                    onValueChange={(value) => {
                                        if (isOneOf(value, POSSESSIONS))
                                            setPossession(value)
                                    }}
                                    className="grid w-full grid-cols-2 gap-2"
                                >
                                    <ToggleGroupItem
                                        value="leading"
                                        className={possessionItemClass}
                                    >
                                        Leading
                                    </ToggleGroupItem>
                                    <ToggleGroupItem
                                        value="trailing"
                                        className={possessionItemClass}
                                    >
                                        Trailing
                                    </ToggleGroupItem>
                                </ToggleGroup>
                            </div>

                            <LargeNumberStepper
                                id="seconds-remaining"
                                label="Seconds Remaining"
                                decreaseLabel="Decrease seconds remaining"
                                increaseLabel="Increase seconds remaining"
                                field={seconds}
                            />
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

                <p
                    className={cn(
                        'mt-6 text-center text-xs text-muted-foreground',
                        glideClass,
                    )}
                >
                    Uses the{' '}
                    <InlineLink href="https://www.slate.com/articles/sports/sports_nut/2008/03/the_lead_is_safe.single.html">
                        Safe Lead Formula
                    </InlineLink>{' '}
                    created by Bill James.
                </p>
            </MethodologyLayout>
        </ToolLayout>
    )
}

type LargeNumberStepperProps = {
    id: string
    label: string
    decreaseLabel: string
    increaseLabel: string
    field: NumberField
}

// A row of − / input / + in the page's label column. The shared Stepper isn't used because its
// layout doesn't fit this page's fixed label column and large centered inputs
function LargeNumberStepper({
    id,
    label,
    decreaseLabel,
    increaseLabel,
    field,
}: LargeNumberStepperProps) {
    return (
        <div className={rowClass}>
            <label htmlFor={id} className={eyebrowClass}>
                {label}
            </label>
            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="icon-sm"
                    aria-label={decreaseLabel}
                    className="text-cat-tools"
                    onClick={() => field.setNumber(field.number - 1)}
                >
                    <IconMinus />
                </Button>
                <Input
                    id={id}
                    inputMode="numeric"
                    {...field.inputProps}
                    className={largeNumberInputClass}
                />
                <Button
                    variant="outline"
                    size="icon-sm"
                    aria-label={increaseLabel}
                    className="text-cat-tools"
                    onClick={() => field.setNumber(field.number + 1)}
                >
                    <IconPlus />
                </Button>
            </div>
        </div>
    )
}
