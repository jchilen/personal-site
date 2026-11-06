import { useId, useState } from 'react'
import { IconX } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { useNumberField, type NumberField } from '@/hooks/use-number-field'
import { isOneOf } from '@/lib/one-of'
import { LabeledProgressBar } from '@/components/progress-bar'
import { SectionTitle } from '@/components/section-title'
import {
    choiceItemClass,
    fieldLabelClass,
    numberInputClass,
} from '@/components/field-styles'
import {
    chanceSummary,
    killsNeededSummary,
    type Summary,
} from './calculator-summary'
import { chanceAfter, formatPercent, percentToFraction } from './confidence'

const MODES = ['kills', 'chance'] as const
type Mode = (typeof MODES)[number]

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

type FieldRowProps = {
    id: string
    label: string
    suffix?: string
    inputMode: 'decimal' | 'numeric'
    field: NumberField
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

// The big answer at the top, with its unit in smaller type, or a dash until there is one
function Readout({ readout }: Pick<Summary, 'readout'>) {
    if (!readout) return '—'
    return (
        <>
            {readout.value}
            {readout.unit && (
                <>
                    {' '}
                    <span className="text-base tracking-widest text-muted-foreground uppercase">
                        {readout.unit}
                    </span>
                </>
            )}
        </>
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

    // The answer, its note, and the milestones, for whichever mode is active
    const { title, readout, note, milestones } =
        mode === 'kills'
            ? killsNeededSummary(dropChance, target, confidence.number)
            : chanceSummary(dropChance, kills.number)

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
                    <Readout readout={readout} />
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{note}</p>
            </section>

            <section className="flex flex-col gap-4 p-4">
                <ToggleGroup
                    type="single"
                    aria-label="Calculator mode"
                    value={mode}
                    onValueChange={(value) => {
                        if (isOneOf(value, MODES)) setMode(value)
                    }}
                    className="grid w-full grid-cols-2 gap-2"
                >
                    <ToggleGroupItem value="kills" className={choiceItemClass}>
                        Kills needed
                    </ToggleGroupItem>
                    <ToggleGroupItem value="chance" className={choiceItemClass}>
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
                            <LabeledProgressBar
                                key={milestone.label}
                                {...milestone}
                                fillClass="bg-cat-tools"
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
