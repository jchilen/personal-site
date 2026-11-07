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
import { useNumberField } from '@/hooks/use-number-field'
import { MethodologyLayout } from '@/components/methodology-layout'
import { SafeLeadMethodology } from './safe-lead-methodology'
import { InlineLink } from '@/components/inline-link'
import { eyebrowClass } from '@/components/text-styles'

// The shared underline input, centered and larger, for the lead and clock. Named apart from the
// shared numberInputClass, which is right-aligned and smaller
const largeNumberInputClass = `${underlineInputClass} text-center font-heading text-2xl font-semibold`

// One input row with a fixed label column, so Lead, Ball, and Clock line up
const rowClass = 'grid grid-cols-[4.5rem_minmax(0,1fr)] items-center gap-3'

const possessionItemClass =
    'corner-brackets h-10 border text-muted-foreground hover:bg-transparent hover:text-cat-tools data-[state=on]:bg-transparent data-[state=on]:text-cat-tools'

export function SafeLeadPage() {
    const lead = useNumberField({ max: 99 })
    const minutes = useNumberField({ max: 40 })
    const seconds = useNumberField({ max: 59 })
    const [possession, setPossession] = useState<Possession>('leading')

    const pointsAhead = lead.number
    const secondsLeft = minutes.number * 60 + seconds.number
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
                            <div className={rowClass}>
                                <label
                                    htmlFor="points-ahead"
                                    className={eyebrowClass}
                                >
                                    Lead
                                </label>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="icon-sm"
                                        aria-label="Decrease lead"
                                        className="text-cat-tools"
                                        onClick={() =>
                                            lead.setNumber(lead.number - 1)
                                        }
                                    >
                                        <IconMinus />
                                    </Button>
                                    <Input
                                        id="points-ahead"
                                        inputMode="numeric"
                                        {...lead.inputProps}
                                        className={largeNumberInputClass}
                                    />
                                    <Button
                                        variant="outline"
                                        size="icon-sm"
                                        aria-label="Increase lead"
                                        className="text-cat-tools"
                                        onClick={() =>
                                            lead.setNumber(lead.number + 1)
                                        }
                                    >
                                        <IconPlus />
                                    </Button>
                                </div>
                            </div>

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

                            <div className={rowClass}>
                                <span className={eyebrowClass}>Clock</span>
                                <div className="flex items-center gap-2">
                                    <Input
                                        aria-label="Minutes"
                                        inputMode="numeric"
                                        {...minutes.inputProps}
                                        className={largeNumberInputClass}
                                    />
                                    <span
                                        aria-hidden="true"
                                        className="font-heading text-2xl font-semibold text-muted-foreground"
                                    >
                                        :
                                    </span>
                                    <Input
                                        aria-label="Seconds"
                                        inputMode="numeric"
                                        {...seconds.inputProps}
                                        className={largeNumberInputClass}
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
