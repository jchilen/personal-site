import { Fragment, useState } from 'react'
import { IconMinus, IconPlus } from '@tabler/icons-react'

import { PanelHeader } from '@/components/panel-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardTitle } from '@/components/ui/card'
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { cn } from 'cn'
import { isOneOf } from '@/lib/one-of'
import {
    CAREER_STAGES,
    EXPERIENCE,
    type ExperienceEntry,
    type StageId,
} from './experience'
import { flatCardClass } from '@/components/card-styles'
import { eyebrowClass } from '@/components/text-styles'
import { collapseClass } from '@/components/motion-styles'

const STAGE_IDS = CAREER_STAGES.map((stage) => stage.id)

const stageItemClass = cn(
    eyebrowClass,
    'corner-brackets h-auto gap-2 px-3 py-2 hover:bg-transparent hover:text-foreground data-[state=on]:bg-transparent data-[state=on]:text-foreground dark:data-[state=on]:text-primary',
)

export function ExperienceSection() {
    const [selectedStage, setSelectedStage] = useState<StageId | null>(null)
    const lastIndex = CAREER_STAGES.length - 1

    return (
        <>
            <ToggleGroup
                type="single"
                aria-label="Highlight experience by career stage"
                value={selectedStage ?? ''}
                onValueChange={(value) =>
                    // '' means the selected stage was clicked again, to turn the highlight off
                    setSelectedStage(isOneOf(value, STAGE_IDS) ? value : null)
                }
                className="mb-10 grid w-full grid-cols-2 gap-2 sm:flex sm:items-center sm:gap-3"
            >
                {CAREER_STAGES.map((stage, index) => (
                    <Fragment key={stage.id}>
                        <ToggleGroupItem
                            value={stage.id}
                            className={stageItemClass}
                        >
                            {stage.label}
                            <span className="opacity-70">{stage.detail}</span>
                        </ToggleGroupItem>
                        {index < lastIndex && (
                            <span
                                aria-hidden
                                className={cn(
                                    'h-px flex-1 bg-border max-sm:hidden',
                                    index === lastIndex - 1 && 'bg-primary',
                                )}
                            />
                        )}
                    </Fragment>
                ))}
            </ToggleGroup>

            <div className="grid items-start gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {EXPERIENCE.map((entry, index) => (
                    <ExperienceCard
                        key={entry.title}
                        entry={entry}
                        number={index + 1}
                        isHighlighted={entry.stage === selectedStage}
                        isDimmed={
                            selectedStage !== null &&
                            entry.stage !== selectedStage
                        }
                    />
                ))}
            </div>
        </>
    )
}

type ExperienceCardProps = {
    entry: ExperienceEntry
    number: number
    isHighlighted: boolean
    isDimmed: boolean
}

function ExperienceCard({
    entry,
    number,
    isHighlighted,
    isDimmed,
}: ExperienceCardProps) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <Card
            size="sm"
            onClick={() => setIsOpen(!isOpen)}
            className={cn(
                flatCardClass,
                'cursor-pointer transition-[opacity,border-color] duration-200 hover:border-muted-foreground/50',
                isHighlighted && 'border-primary hover:border-primary',
                isDimmed && 'opacity-50',
            )}
        >
            {/* h3: each card sits inside the Experience section's h2 */}
            <PanelHeader label={entry.org} number={number} as="h3" />
            <CardContent>
                <CardTitle className="text-base">
                    {entry.title}
                    {/* The highlight is a gold border, so screen readers get it in words */}
                    {isHighlighted && (
                        <span className="sr-only">
                            {' '}
                            (matches the selected stage)
                        </span>
                    )}
                </CardTitle>
                <p className="mt-3">{entry.summary}</p>
                <Collapsible open={isOpen}>
                    <CollapsibleContent className={collapseClass}>
                        <ul className="list-disc space-y-1.5 pt-3 pl-5 text-sm text-muted-foreground marker:text-foreground dark:marker:text-primary">
                            {entry.highlights.map((highlight) => (
                                <li key={highlight}>{highlight}</li>
                            ))}
                        </ul>
                    </CollapsibleContent>
                </Collapsible>
            </CardContent>
            {/* flex-wrap: on narrow screens Details drops below the stack list instead of running
                off the card's edge */}
            <CardFooter className="flex-wrap items-end justify-between gap-4 border-t">
                <ul className="grid grid-cols-[auto_auto] gap-x-4 gap-y-1 font-heading text-xs tracking-widest text-muted-foreground uppercase">
                    {entry.stack.map((item) => (
                        <li key={item}>{item}</li>
                    ))}
                </ul>
                <Button
                    variant="ghost"
                    size="sm"
                    aria-expanded={isOpen}
                    className="shrink-0"
                >
                    Details
                    {isOpen ? (
                        <IconMinus data-icon="inline-end" />
                    ) : (
                        <IconPlus data-icon="inline-end" />
                    )}
                </Button>
            </CardFooter>
        </Card>
    )
}
