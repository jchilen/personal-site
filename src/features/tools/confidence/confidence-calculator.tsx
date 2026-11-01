import { useId, useState, type ReactNode } from 'react'
import { IconX } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { useNumberField } from '@/hooks/use-number-field'
import { SectionTitle } from '@/components/section-title'
import { fieldLabelClass, numberInputClass } from '@/components/field-styles'
import {
    CONFIDENCE_MILESTONES,
    chanceAfter,
    formatPercent,
    killMilestones,
    killsNeeded,
    percentToFraction,
} from './confidence'

type Mode = 'kills' | 'chance'

export type CalculatorStart = {
    dropChance: number
    confidence: number
    kills: number
    killsSoFar: number
}

type ConfidenceCalculatorProps = {
    start: CalculatorStart
    onRemove?: () => void
}

const modeItemClass =
    'corner-brackets h-10 border text-muted-foreground hover:bg-transparent hover:text-foreground data-[state=on]:border-primary data-[state=on]:bg-primary/10 data-[state=on]:text-primary'

type FieldRowProps = {
    id: string
    label: string
    suffix?: string
    inputMode: 'decimal' | 'numeric'
    field: ReturnType<typeof useNumberField>
}

function FieldRow({ id, label, suffix, inputMode, field }: FieldRowProps) {
    return (
        <div className="grid grid-cols-[minmax(0,1fr)_7rem] items-center gap-3">
            <label htmlFor={id} className={fieldLabelClass}>
                {label}
            </label>
            <div className="flex items-baseline gap-1">
                <Input
                    id={id}
                    inputMode={inputMode}
                    {...field.inputProps}
                    className={numberInputClass}
                />
                {suffix && (
                    <span className="font-heading text-muted-foreground">
                        {suffix}
                    </span>
                )}
            </div>
        </div>
    )
}

type MilestoneBarProps = {
    label: string
    value: string
    percent: number
}

function MilestoneBar({ label, value, percent }: MilestoneBarProps) {
    return (
        <div>
            <div className="flex justify-between font-heading text-xs tracking-eyebrow text-muted-foreground uppercase">
                <span>{label}</span>
                <span className="tracking-normal text-foreground normal-case">
                    {value}
                </span>
            </div>
            <div aria-hidden="true" className="mt-1.5 h-2 bg-muted">
                <div
                    className="h-full bg-cat-tools transition-[width] duration-500 ease-out motion-reduce:transition-none"
                    style={{ width: `${percent}%` }}
                />
            </div>
        </div>
    )
}

export function ConfidenceCalculator({
    start,
    onRemove,
}: ConfidenceCalculatorProps) {
    const id = useId()
    const [mode, setMode] = useState<Mode>('kills')
    const drop = useNumberField({
        max: 100,
        initial: start.dropChance,
        decimal: true,
    })
    const confidence = useNumberField({
        max: 100,
        initial: start.confidence,
        decimal: true,
    })
    const kills = useNumberField({ max: 99999, initial: start.kills })
    const killsSoFar = useNumberField({
        max: 99999,
        initial: start.killsSoFar,
    })

    const dropChance = percentToFraction(drop.number)
    const target = percentToFraction(confidence.number)

    // The big answer at the top, in whichever mode is active
    let title: string
    let readout: ReactNode = '—'
    let note: string

    if (mode === 'kills') {
        title = 'Kills needed'
        note = 'Enter a drop chance and a confidence between 0 and 100.'
        if (dropChance !== null && target !== null) {
            const needed = killsNeeded(dropChance, target)
            readout = (
                <>
                    {needed.toLocaleString()}{' '}
                    <span className="text-base tracking-widest text-muted-foreground uppercase">
                        kills
                    </span>
                </>
            )
            note = `for at least a ${confidence.number}% chance.`
        }
    } else {
        title = 'Chance of a drop'
        note = 'Enter a drop chance and a number of kills.'
        if (dropChance !== null && kills.number >= 1) {
            readout = formatPercent(chanceAfter(dropChance, kills.number))
            note = `of at least one drop in ${kills.number.toLocaleString()} kills.`
        }
    }

    // Kills at set confidence levels, or the chance at multiples of the entered kills
    let milestones: MilestoneBarProps[] = []
    if (dropChance !== null && mode === 'kills') {
        milestones = CONFIDENCE_MILESTONES.map((level) => ({
            label: `${Math.round(level * 100)}% sure`,
            value: `${killsNeeded(dropChance, level).toLocaleString()} kills`,
            percent: level * 100,
        }))
    } else if (dropChance !== null && kills.number >= 1) {
        milestones = killMilestones(kills.number).map((count) => {
            const odds = chanceAfter(dropChance, count)
            return {
                label: `${count.toLocaleString()} kills`,
                value: formatPercent(odds),
                percent: odds * 100,
            }
        })
    }

    const haveIt =
        dropChance !== null && killsSoFar.number >= 1
            ? chanceAfter(dropChance, killsSoFar.number)
            : null

    return (
        <div className="divide-y border bg-card">
            <section aria-live="polite" className="p-4">
                <div className="flex min-h-8 items-center justify-between gap-2">
                    <SectionTitle>{title}</SectionTitle>
                    {onRemove && (
                        <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label="Remove this calculator"
                            onClick={onRemove}
                        >
                            <IconX />
                        </Button>
                    )}
                </div>
                <p className="mt-1 font-heading text-4xl font-semibold text-cat-tools">
                    {readout}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{note}</p>
            </section>

            <section className="flex flex-col gap-4 p-4">
                <ToggleGroup
                    type="single"
                    aria-label="Calculator mode"
                    value={mode}
                    onValueChange={(value) => {
                        if (value) setMode(value as Mode)
                    }}
                    className="grid w-full grid-cols-2 gap-2"
                >
                    <ToggleGroupItem value="kills" className={modeItemClass}>
                        Kills needed
                    </ToggleGroupItem>
                    <ToggleGroupItem value="chance" className={modeItemClass}>
                        Chance after N
                    </ToggleGroupItem>
                </ToggleGroup>

                <FieldRow
                    id={`${id}-drop`}
                    label="Drop chance"
                    suffix="%"
                    inputMode="decimal"
                    field={drop}
                />
                {mode === 'kills' ? (
                    <FieldRow
                        id={`${id}-confidence`}
                        label="Confidence"
                        suffix="%"
                        inputMode="decimal"
                        field={confidence}
                    />
                ) : (
                    <FieldRow
                        id={`${id}-kills`}
                        label="Kills"
                        inputMode="numeric"
                        field={kills}
                    />
                )}
            </section>

            <section className="p-4">
                <SectionTitle>Milestones</SectionTitle>
                {milestones.length > 0 ? (
                    <div className="mt-3 flex flex-col gap-3">
                        {milestones.map((milestone) => (
                            <MilestoneBar
                                key={milestone.label}
                                {...milestone}
                            />
                        ))}
                    </div>
                ) : (
                    <p className="mt-3 text-sm text-muted-foreground">
                        Enter a drop chance to fill these in.
                    </p>
                )}
            </section>

            <section className="flex flex-col gap-3 p-4">
                <SectionTitle>How unlucky am I?</SectionTitle>
                <FieldRow
                    id={`${id}-so-far`}
                    label="Kills so far"
                    inputMode="numeric"
                    field={killsSoFar}
                />
                {haveIt !== null ? (
                    <div className="text-sm leading-relaxed text-muted-foreground">
                        <p className="text-pretty">
                            <span className="font-heading text-xl font-semibold text-foreground">
                                {formatPercent(haveIt)}
                            </span>{' '}
                            of players would have it by{' '}
                            {killsSoFar.number.toLocaleString()} kills, so
                            you're in the{' '}
                            <span className="whitespace-nowrap">
                                bottom {formatPercent(1 - haveIt)}
                            </span>
                            .
                        </p>
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground">
                        Enter a drop chance and how many kills you've done
                        without it.
                    </p>
                )}
            </section>
        </div>
    )
}
