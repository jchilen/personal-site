import { useEffect, useState, type ReactNode, type RefCallback } from 'react'
import {
    IconArrowsLeftRight,
    IconCheck,
    IconChevronDown,
    IconCopy,
    IconDeviceFloppy,
    IconStar,
    IconStarFilled,
    IconX,
} from '@tabler/icons-react'
import { cn } from 'cn'
import { Choice } from '@/components/choice'
import { EffectToggle } from '@/components/effect-toggle'
import { lockedButtonClass } from '@/components/field-styles'
import {
    collapseClass,
    glideClass,
    reducedMotionClass,
} from '@/components/motion-styles'
import { MoveButton } from '@/components/move-button'
import { Stepper } from '@/components/stepper'
import { lowerLimitReason, upperLimitReason } from '@/lib/limit-reasons'
import { eyebrowClass } from '@/components/text-styles'
import { Button } from '@/components/ui/button'
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Hint } from '@/components/hint'
import { COVER_DIFFICULTY } from '../rules'
import { TIER_OPTIONS, tierFromOption } from '../tier-options'
import {
    blastsText,
    CHANGES,
    statParts,
    sumText,
    totalHpText,
    type ResultKey,
} from './breakdowns'
import type { CardResults } from './card-results'
import { blasts, rankColor, survivesComparedTo } from './format'
import { LOCK_REASONS } from './lock-reasons'
import { NameField } from './name-field'
import {
    STAT_LIMITS,
    type BuildCard as BuildCardData,
    type CardSettings,
    type PilotStat,
} from './settings'

// Notes for frames whose numbers need explaining, shown on their cards
const FRAME_NOTES: Record<string, string> = {
    'White Witch':
        'The White Witch’s armor is too complex to map onto these rules, so it’s counted as 3 Armor. See methodology for more info.',
    Emperor:
        'The Emperor’s shield trait makes it much tankier than these rules can account for, so it ranks lower here than it should.',
    Lich: 'The Lich’s Soul Vessel trait makes it much tankier than these rules can account for, so it ranks lower here than it should.',
}

const STATS: [PilotStat, string][] = [
    ['hull', 'HULL'],
    ['agility', 'AGI'],
    ['systems', 'SYS'],
]

const CORE_BONUSES: [
    Exclude<keyof typeof CHANGES, PilotStat>,
    string,
    string,
][] = [
    ['reinforcedFrame', 'Reinforced Frame', '+5 HP'],
    ['fullSubjectivitySync', 'Full Subjectivity Sync', '+2 Evasion, up to 20'],
    ['slopedPlating', 'Sloped Plating', '+1 Armor'],
    ['lessonOfDisbelief', 'Lesson of Disbelief', '+2 E-Defense'],
]

/** What the card's save button needs: its name, a reason if it's locked, and what saving does */
export type SaveControl = {
    // Like "Save Everest-1", or "Update saved Everest-1" when a save already has the card's name
    label: string
    lockedReason?: string
    // Saves the card, and says whether that made a new save or updated one
    onSave: () => 'Saved' | 'Updated'
}

// How long the save button shows its check after saving
const SAVED_FOR = 2000

// The floppy disk that saves the card. It turns into a check for a moment after saving, and the
// card's status line tells screen readers what happened
function SaveButton({ name, save }: { name: string; save: SaveControl }) {
    const [done, setDone] = useState<'Saved' | 'Updated' | null>(null)

    useEffect(() => {
        if (done === null) return
        const timer = window.setTimeout(() => setDone(null), SAVED_FOR)
        return () => window.clearTimeout(timer)
    }, [done])

    const locked = save.lockedReason !== undefined
    return (
        <>
            <Hint
                label={done ?? save.label}
                reason={done ? undefined : save.lockedReason}
            >
                <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={save.label}
                    aria-disabled={locked}
                    onClick={() => {
                        if (!locked) setDone(save.onSave())
                    }}
                    className={cn(locked && lockedButtonClass)}
                >
                    {done ? <IconCheck /> : <IconDeviceFloppy />}
                </Button>
            </Hint>
            <span role="status" className="sr-only">
                {done && `${done} ${name}`}
            </span>
        </>
    )
}

// The card's name, edited in place, then the button that saves the card. A blank name is refused
// by the reducer, so the old one stays
function CardName({
    name,
    onRename,
    inputRef,
    save,
}: {
    name: string
    onRename: (name: string) => void
    inputRef: RefCallback<HTMLTextAreaElement>
    save: SaveControl
}) {
    return (
        <div className="flex min-w-0 items-center gap-1">
            <NameField
                name={name}
                label="Card name"
                onRename={onRename}
                inputRef={inputRef}
                className="text-lg"
            />
            <SaveButton name={name} save={save} />
        </div>
    )
}

// A number that shows how it's worked out, on hover or keyboard focus, with a question-mark cursor
// on hover. It can be tabbed to, so the breakdown isn't mouse-only, and while it's shown, onShow
// lights up the stats it came from
function Explained({
    text,
    onShow,
    onHide,
    children,
}: {
    text: string
    onShow?: () => void
    onHide?: () => void
    children: ReactNode
}) {
    return (
        <Hint label={text}>
            <span
                tabIndex={0}
                onPointerEnter={onShow}
                onPointerLeave={onHide}
                onFocus={onShow}
                onBlur={onHide}
                className="cursor-help outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
                {children}
            </span>
        </Hint>
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
    save: SaveControl
    onFeature: () => void
    onCompare: () => void
    onMove: (direction: 'up' | 'down') => void
    onDuplicate: () => void
    onRemove: () => void
    onToggleCollapse: () => void
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
    save,
    onFeature,
    onCompare,
    onMove,
    onDuplicate,
    onRemove,
    onToggleCollapse,
    controlRef,
}: BuildCardProps) {
    const { frame, stats } = results
    const note = FRAME_NOTES[card.frame]
    // The reducer never leaves the featured card collapsed, but it's checked here too
    const collapsed = !featured && card.collapsed
    const parts = statParts(frame, card)
    // The results lit up by whatever is hovered or focused: a control lights up the stats it
    // changes, and a worked-out number lights up the stats it's worked out from
    const [lit, setLit] = useState<readonly ResultKey[]>([])
    const lights = (keys: readonly ResultKey[]) => ({
        onPointerEnter: () => setLit(keys),
        onPointerLeave: () => setLit([]),
        onFocus: () => setLit(keys),
        onBlur: () => setLit([]),
    })
    // A lit result turns gold. In the stat list, the rows that aren't lit also fade back while
    // anything is lit, so the eye goes straight to the gold ones
    const litClass = (key: ResultKey) =>
        cn(
            'transition-[color,opacity] motion-reduce:transition-none',
            lit.includes(key) && 'text-primary',
        )
    const rowClass = (key: ResultKey) =>
        cn(litClass(key), lit.length > 0 && !lit.includes(key) && 'opacity-35')
    const blastsColor = rankColor(results.rank, results.fieldSize)

    return (
        // The whole card is the Collapsible, so the chevron in its top row and the body below it
        // are linked: the chevron gets aria-expanded and aria-controls pointing at the body
        <Collapsible
            asChild
            open={!collapsed}
            onOpenChange={() => onToggleCollapse()}
        >
            <article
                aria-label={card.name}
                className={cn(
                    'flex flex-col bg-background p-4',
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
                            save={save}
                        />
                        <p className="mt-1 flex flex-wrap items-baseline gap-x-3 text-sm text-muted-foreground">
                            <span>
                                {frame.name} · {frame.source} ·{' '}
                                {frame.roles.join(', ')}
                            </span>
                            {/* With the results folded away, the number that matters stays in sight */}
                            {collapsed && (
                                <span
                                    className={cn(
                                        'animate-in duration-300 fade-in-0',
                                        reducedMotionClass,
                                    )}
                                >
                                    <span
                                        className="font-heading text-base font-semibold tabular-nums"
                                        style={{ color: blastsColor }}
                                    >
                                        {blasts(results.blastsToKill)}
                                    </span>{' '}
                                    blasts to kill
                                </span>
                            )}
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
                        <MoveButton
                            itemName={card.name}
                            direction="up"
                            atEnd={!canMoveUp}
                            buttonRef={controlRef('up')}
                            onMove={() => onMove('up')}
                            side="bottom"
                        />
                        <MoveButton
                            itemName={card.name}
                            direction="down"
                            atEnd={!canMoveDown}
                            buttonRef={controlRef('down')}
                            onMove={() => onMove('down')}
                            side="bottom"
                        />
                        <Hint
                            label={`Duplicate ${card.name}`}
                            reason={full ? LOCK_REASONS.cardsFull : undefined}
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
                                // At the limit it gets the same locked look as the move arrows
                                className={cn(full && lockedButtonClass)}
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
                        {/* The featured card is always open, so only the cards below it can fold */}
                        {!featured && (
                            <Hint
                                label={`${collapsed ? 'Expand' : 'Collapse'} ${card.name}`}
                                side="bottom"
                            >
                                <CollapsibleTrigger asChild>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon-sm"
                                        aria-label={`${collapsed ? 'Expand' : 'Collapse'} ${card.name}`}
                                        className="group"
                                    >
                                        <IconChevronDown className="transition-transform group-data-[state=open]:rotate-180 motion-reduce:transition-none" />
                                    </Button>
                                </CollapsibleTrigger>
                            </Hint>
                        )}
                    </div>
                </div>

                {/* The space above the body lives inside it, so it folds away with the body instead of
                snapping shut once the slide ends */}
                <CollapsibleContent className={collapseClass}>
                    <div className="grid gap-6 pt-4 @3xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-wrap gap-x-6 gap-y-4">
                                <Choice
                                    label="NPC type"
                                    value={card.ruleset}
                                    options={[
                                        ['original', 'Original'],
                                        ['rebake', 'Rebake'],
                                    ]}
                                    onChange={(ruleset) =>
                                        onChange({ ruleset })
                                    }
                                />
                                <Choice
                                    label="Tier"
                                    value={String(card.tier)}
                                    options={TIER_OPTIONS}
                                    onChange={(option) =>
                                        onChange({
                                            tier: tierFromOption(
                                                option,
                                                card.tier,
                                            ),
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
                                    // Hovering or focusing a stepper lights up the stats it changes
                                    <div key={stat} {...lights(CHANGES[stat])}>
                                        <Stepper
                                            stacked
                                            label={label}
                                            decreaseLabel={`Lower ${label}`}
                                            increaseLabel={`Raise ${label}`}
                                            decreaseLockedReason={
                                                card[stat] >
                                                STAT_LIMITS[stat].min
                                                    ? undefined
                                                    : lowerLimitReason(
                                                          STAT_LIMITS[stat].min,
                                                      )
                                            }
                                            increaseLockedReason={
                                                card[stat] <
                                                STAT_LIMITS[stat].max
                                                    ? undefined
                                                    : upperLimitReason(
                                                          STAT_LIMITS[stat].max,
                                                      )
                                            }
                                            onDecrease={() =>
                                                onChange({
                                                    [stat]: card[stat] - 1,
                                                })
                                            }
                                            onIncrease={() =>
                                                onChange({
                                                    [stat]: card[stat] + 1,
                                                })
                                            }
                                        >
                                            <span
                                                aria-live="polite"
                                                className="w-6 text-center font-heading text-xl font-semibold tabular-nums"
                                            >
                                                {card[stat]}
                                            </span>
                                        </Stepper>
                                    </div>
                                ))}
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <span className={eyebrowClass}>
                                    Core bonuses
                                </span>
                                <div className="grid gap-2 @lg:grid-cols-2">
                                    {CORE_BONUSES.map(
                                        ([key, label, detail]) => (
                                            // grid: so the toggle still fills its cell inside the wrapper
                                            <div
                                                key={key}
                                                className="grid"
                                                {...lights(CHANGES[key])}
                                            >
                                                <EffectToggle
                                                    label={label}
                                                    detail={detail}
                                                    pressed={card[key] === true}
                                                    onChange={(pressed) =>
                                                        onChange({
                                                            [key]: pressed,
                                                        })
                                                    }
                                                />
                                            </div>
                                        ),
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 @3xl:border-l @3xl:pl-6">
                            <dl className="grid grid-cols-[1fr_auto] gap-y-1 text-sm">
                                {(
                                    [
                                        ['evasion', 'Evasion'],
                                        ['eDefense', 'E-Defense'],
                                        ['armor', 'Armor'],
                                        ['hp', 'HP'],
                                        ['repairCap', 'Repairs'],
                                    ] as const
                                ).map(([key, label]) => (
                                    // Each row spans both columns (subgrid), so the label and number light up
                                    // and fade together
                                    <div
                                        key={key}
                                        className={cn(
                                            'col-span-2 grid grid-cols-subgrid gap-x-4',
                                            rowClass(key),
                                        )}
                                    >
                                        <dt
                                            className={
                                                lit.includes(key)
                                                    ? undefined
                                                    : 'text-muted-foreground'
                                            }
                                        >
                                            {label}
                                        </dt>
                                        <dd className="text-right font-heading font-semibold tabular-nums">
                                            <Explained
                                                text={sumText(parts[key])}
                                            >
                                                {stats[key]}
                                            </Explained>
                                        </dd>
                                    </div>
                                ))}
                            </dl>
                            <div aria-live="polite" className="border-t pt-3">
                                <p className={eyebrowClass}>Blasts to kill</p>
                                <p
                                    className="font-heading text-5xl font-semibold tabular-nums"
                                    style={{ color: blastsColor }}
                                >
                                    <Explained
                                        text={blastsText(
                                            results.totalHp,
                                            results.blastDamage,
                                            results.blastsToKill,
                                        )}
                                        onShow={() =>
                                            setLit(['totalHp', 'blastDamage'])
                                        }
                                        onHide={() => setLit([])}
                                    >
                                        {blasts(results.blastsToKill)}
                                    </Explained>
                                </p>
                                <p className="mt-1 text-sm">
                                    {survivesComparedTo(
                                        results.blastsToKill,
                                        results.standard.blastsToKill,
                                        'the average frame',
                                    )}
                                </p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    <span className={litClass('totalHp')}>
                                        <Explained
                                            text={totalHpText(
                                                stats.hp,
                                                stats.repairCap,
                                                frame.structureRepairCost,
                                                results.totalHp,
                                            )}
                                            onShow={() =>
                                                setLit(['hp', 'repairCap'])
                                            }
                                            onHide={() => setLit([])}
                                        >
                                            Total HP {results.totalHp}
                                        </Explained>
                                    </span>{' '}
                                    ·{' '}
                                    <span className={litClass('blastDamage')}>
                                        {results.blastDamage.toFixed(1)} damage
                                        per blast
                                    </span>
                                </p>
                            </div>
                            {note && (
                                <p className="text-sm text-muted-foreground">
                                    {note}
                                </p>
                            )}
                        </div>
                    </div>
                </CollapsibleContent>
            </article>
        </Collapsible>
    )
}
