import { useState, type RefCallback } from 'react'
import {
    IconArrowDown,
    IconArrowsLeftRight,
    IconArrowUp,
    IconCopy,
    IconPencil,
    IconStar,
    IconStarFilled,
    IconX,
} from '@tabler/icons-react'
import { cn } from 'cn'
import { Choice } from '@/components/choice'
import { EffectToggle } from '@/components/effect-toggle'
import { lockedClass } from '@/components/field-styles'
import { glideClass } from '@/components/motion-styles'
import { Stepper } from '@/components/stepper'
import { eyebrowClass } from '@/components/text-styles'
import { Button } from '@/components/ui/button'
import { Hint } from '@/components/hint'
import { COVER_DIFFICULTY } from '../rules'
import { TIER_OPTIONS, tierFromOption } from '../tier-options'
import type { CardResults } from './card-results'
import { blasts, ordinal, rankColor, survivesComparedTo } from './format'
import { LOCK_REASONS } from './lock-reasons'
import {
    STAT_LIMITS,
    type BuildCard as BuildCardData,
    type CardSettings,
    type PilotStat,
} from './settings'

// Notes for frames whose numbers need explaining, shown on their cards
const FRAME_NOTES: Record<string, string> = {
    'White Witch':
        'The White Witch’s armor is too complex to map onto these rules, so it’s counted as 3 Armor, a fixed stand-in.',
}

const STATS: [PilotStat, string][] = [
    ['hull', 'HULL'],
    ['agility', 'AGI'],
    ['systems', 'SYS'],
]

const TALENTS: [keyof CardSettings, string, string][] = [
    ['reinforcedFrame', 'Reinforced Frame', '+5 HP'],
    ['fullSubjectivitySync', 'Full Subjectivity Sync', '+2 Evasion, up to 20'],
    ['slopedPlating', 'Sloped Plating', '+1 Armor'],
    ['lessonOfDisbelief', 'Lesson of Disbelief', '+2 E-Defense'],
]

// The card's name, edited in place. While typing it's a draft; leaving the field (or Enter) saves
// it, and Escape puts the old name back. A blank name is refused by the reducer, so the old one stays
function CardName({
    name,
    onRename,
    inputRef,
}: {
    name: string
    onRename: (name: string) => void
    inputRef: RefCallback<HTMLInputElement>
}) {
    const [draft, setDraft] = useState<string | null>(null)
    const [input, setInput] = useState<HTMLInputElement | null>(null)

    return (
        <div className="flex min-w-0 items-center gap-1">
            <input
                ref={(node) => {
                    setInput(node)
                    inputRef(node)
                }}
                aria-label="Card name"
                value={draft ?? name}
                maxLength={40}
                onFocus={() => setDraft(name)}
                onChange={(event) => setDraft(event.target.value)}
                onBlur={() => {
                    if (draft !== null) onRename(draft)
                    setDraft(null)
                }}
                onKeyDown={(event) => {
                    if (event.key === 'Enter') event.currentTarget.blur()
                    if (event.key === 'Escape') {
                        setDraft(null)
                        // Blurring after clearing the draft saves nothing
                        requestAnimationFrame(() => input?.blur())
                    }
                }}
                className="field-sizing-content max-w-full min-w-16 border-b border-dashed border-muted-foreground bg-transparent font-heading text-lg font-semibold tracking-widest uppercase outline-none focus-visible:border-solid focus-visible:border-cat-lancer"
            />
            <Hint label="Rename">
                <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Rename ${name}`}
                    onClick={() => input?.focus()}
                >
                    <IconPencil />
                </Button>
            </Hint>
        </div>
    )
}

type BuildCardProps = {
    card: BuildCardData
    results: CardResults
    featured: boolean
    // Shown head to head with the featured card
    comparing: boolean
    canMoveUp: boolean
    canMoveDown: boolean
    full: boolean
    onChange: (changes: Partial<CardSettings>) => void
    onRename: (name: string) => void
    onFeature: () => void
    onCompare: () => void
    onMove: (direction: 'up' | 'down') => void
    onDuplicate: () => void
    onRemove: () => void
    // Hold on to the card's controls, so focus can be put back after the card moves or a neighbor goes
    controlRef: (
        control: 'name' | 'up' | 'down' | 'remove',
    ) => RefCallback<HTMLElement>
}

/** One frame with one pilot build: its controls on the left, and how long it survives on the right */
export function BuildCard({
    card,
    results,
    featured,
    comparing,
    canMoveUp,
    canMoveDown,
    full,
    onChange,
    onRename,
    onFeature,
    onCompare,
    onMove,
    onDuplicate,
    onRemove,
    controlRef,
}: BuildCardProps) {
    const { frame, stats } = results
    const note = FRAME_NOTES[card.frame]

    return (
        <article
            aria-label={card.name}
            className={cn(
                'flex flex-col gap-4 bg-background p-4',
                featured ? 'border-2 border-primary' : 'border',
                glideClass,
            )}
        >
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                    <CardName
                        name={card.name}
                        onRename={onRename}
                        inputRef={controlRef('name')}
                    />
                    <p className="mt-1 text-sm text-muted-foreground">
                        {frame.name} · {frame.source} · {frame.roles.join(', ')}
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-1">
                    {featured ? (
                        <p className="flex h-10 items-center gap-2 border border-primary bg-primary/10 px-3 font-heading text-xs font-semibold tracking-widest text-primary uppercase">
                            <IconStarFilled
                                aria-hidden="true"
                                className="size-4"
                            />
                            Featured
                        </p>
                    ) : (
                        <>
                            {/* Pressed while this card is shown head to head with the featured card */}
                            <Button
                                type="button"
                                variant="outline"
                                aria-pressed={comparing}
                                onClick={onCompare}
                                className="h-10 aria-pressed:border-primary aria-pressed:bg-primary/10 aria-pressed:text-primary"
                            >
                                <IconArrowsLeftRight data-icon="inline-start" />
                                {comparing ? 'Comparing' : 'Compare'}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                className="h-10"
                                onClick={onFeature}
                            >
                                <IconStar data-icon="inline-start" />
                                Make featured
                            </Button>
                        </>
                    )}
                    {/* Moves that can't happen are hidden, not disabled: the top card has no Move up */}
                    {canMoveUp && (
                        <Hint label={`Move ${card.name} up`} side="bottom">
                            <Button
                                ref={controlRef('up')}
                                type="button"
                                variant="outline"
                                size="icon-sm"
                                aria-label={`Move ${card.name} up`}
                                onClick={() => onMove('up')}
                            >
                                <IconArrowUp />
                            </Button>
                        </Hint>
                    )}
                    {canMoveDown && (
                        <Hint label={`Move ${card.name} down`} side="bottom">
                            <Button
                                ref={controlRef('down')}
                                type="button"
                                variant="outline"
                                size="icon-sm"
                                aria-label={`Move ${card.name} down`}
                                onClick={() => onMove('down')}
                            >
                                <IconArrowDown />
                            </Button>
                        </Hint>
                    )}
                    <Hint
                        label={
                            full
                                ? `Duplicate ${card.name} (${LOCK_REASONS.cardsFull})`
                                : `Duplicate ${card.name}`
                        }
                        side="bottom"
                    >
                        <Button
                            type="button"
                            variant="outline"
                            size="icon-sm"
                            aria-label={`Duplicate ${card.name}`}
                            aria-disabled={full}
                            onClick={() => {
                                if (!full) onDuplicate()
                            }}
                            // At the limit it gets the locked look, so it isn't shown by color alone
                            className={cn(
                                'aria-disabled:cursor-not-allowed aria-disabled:text-muted-foreground',
                                full && lockedClass,
                            )}
                        >
                            <IconCopy />
                        </Button>
                    </Hint>
                    <Hint label={`Remove ${card.name}`} side="bottom">
                        <Button
                            ref={controlRef('remove')}
                            type="button"
                            variant="outline"
                            size="icon-sm"
                            aria-label={`Remove ${card.name}`}
                            onClick={onRemove}
                        >
                            <IconX />
                        </Button>
                    </Hint>
                </div>
            </div>

            <div className="grid gap-6 @3xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
                <div className="flex flex-col gap-4">
                    <div className="flex flex-wrap gap-x-6 gap-y-4">
                        <Choice
                            label="NPC type"
                            value={card.ruleset}
                            options={[
                                ['original', 'Original'],
                                ['rebake', 'Rebake'],
                            ]}
                            onChange={(ruleset) => onChange({ ruleset })}
                        />
                        <Choice
                            label="Tier"
                            value={String(card.tier)}
                            options={TIER_OPTIONS}
                            onChange={(option) =>
                                onChange({
                                    tier: tierFromOption(option, card.tier),
                                })
                            }
                        />
                        <Choice
                            label="Cover"
                            value={card.cover}
                            options={[
                                ['none', 'None'],
                                ['soft', 'Soft'],
                                ['hard', 'Hard'],
                            ]}
                            onChange={(cover) => onChange({ cover })}
                            hints={{
                                soft: `Adds ${COVER_DIFFICULTY.soft} difficulty to ranged attacks`,
                                hard: `Adds ${COVER_DIFFICULTY.hard} difficulty to ranged attacks`,
                            }}
                        />
                    </div>
                    <div className="flex flex-wrap gap-x-8 gap-y-4">
                        {STATS.map(([stat, label]) => (
                            <Stepper
                                key={stat}
                                stacked
                                label={label}
                                decreaseLabel={`Lower ${label}`}
                                increaseLabel={`Raise ${label}`}
                                canDecrease={card[stat] > STAT_LIMITS[stat].min}
                                canIncrease={card[stat] < STAT_LIMITS[stat].max}
                                onDecrease={() =>
                                    onChange({ [stat]: card[stat] - 1 })
                                }
                                onIncrease={() =>
                                    onChange({ [stat]: card[stat] + 1 })
                                }
                            >
                                <span
                                    aria-live="polite"
                                    className="w-6 text-center font-heading text-xl font-semibold tabular-nums"
                                >
                                    {card[stat]}
                                </span>
                            </Stepper>
                        ))}
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <span className={eyebrowClass}>
                            Talents and core bonuses
                        </span>
                        <div className="grid gap-2 @lg:grid-cols-2">
                            {TALENTS.map(([key, label, detail]) => (
                                <EffectToggle
                                    key={key}
                                    label={label}
                                    detail={detail}
                                    pressed={card[key] === true}
                                    onChange={(pressed) =>
                                        onChange({ [key]: pressed })
                                    }
                                />
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-3 @3xl:border-l @3xl:pl-6">
                    <dl className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 text-sm">
                        {(
                            [
                                ['Evasion', stats.evasion],
                                ['E-Defense', stats.eDefense],
                                ['Armor', stats.armor],
                                ['HP', stats.hp],
                                ['Repairs', stats.repairCap],
                            ] as const
                        ).map(([label, value]) => (
                            <div key={label} className="contents">
                                <dt className="text-muted-foreground">
                                    {label}
                                </dt>
                                <dd className="text-right font-heading font-semibold tabular-nums">
                                    {value}
                                </dd>
                            </div>
                        ))}
                    </dl>
                    <div aria-live="polite" className="border-t pt-3">
                        <p className={eyebrowClass}>Blasts to kill</p>
                        <p
                            className="font-heading text-5xl font-semibold tabular-nums"
                            style={{
                                color: rankColor(
                                    results.rank,
                                    results.fieldSize,
                                ),
                            }}
                        >
                            {blasts(results.blastsToKill)}
                        </p>
                        <p className="mt-1 text-sm">
                            {survivesComparedTo(
                                results.blastsToKill,
                                results.standard.blastsToKill,
                                'the average frame',
                            )}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {ordinal(results.rank)} of {results.fieldSize} ·
                            Total HP {results.totalHp} ·{' '}
                            {results.blastDamage.toFixed(1)} damage per blast
                        </p>
                    </div>
                    {note && (
                        <p className="text-sm text-muted-foreground">{note}</p>
                    )}
                </div>
            </div>
        </article>
    )
}
