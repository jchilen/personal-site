import { IconCopy, IconX } from '@tabler/icons-react'
import { SectionTitle } from '@/components/section-title'
import { Button } from '@/components/ui/button'
import { Choice } from './choice'
import { EffectToggle } from './effect-toggle'
import { chanceColor, percent } from './format'
import type { LancerNpc } from './npc-types'
import {
    targetDefense,
    type AttackOdds,
    type AttackType,
    type TargetEffects,
    type Tier,
} from './odds'
import { MAX_TARGETS, type Target } from './settings'
import { useLimitFlash } from './use-limit-flash'
import { eyebrowClass } from '@/components/text-styles'

/** Everything one enemy card shows */
export type EnemyCardData = {
    target: Target
    npc: LancerNpc
    // "Sniper", or "Sniper (2)" for the second card of the same enemy
    title: string
    odds: AttackOdds
    netAccuracy: number
}

// Stand-in data for the invisible card that holds the section's height while nothing is selected
const PLACEHOLDER: EnemyCardData = {
    target: {
        id: 'placeholder',
        name: '',
        cover: 'none',
        lockOn: false,
        prone: false,
        invisible: false,
    },
    npc: { name: '', role: '', evasion: [0, 0, 0], eDefense: [0, 0, 0] },
    title: '',
    odds: { hit: 0, crit: 0 },
    netAccuracy: 0,
}

// The dice left after Accuracy and Difficulty cancel out: green for accuracy, red for difficulty
function NetDice({ net }: { net: number }) {
    if (net === 0) {
        return (
            <p className="text-sm text-muted-foreground">
                with no accuracy or difficulty
            </p>
        )
    }
    return (
        <p className="text-sm text-muted-foreground">
            with{' '}
            <span
                className={
                    net > 0
                        ? 'font-semibold text-safe'
                        : 'font-semibold text-unsafe'
                }
            >
                {Math.abs(net)} {net > 0 ? 'accuracy' : 'difficulty'}
            </span>
        </p>
    )
}

type EnemyCardProps = {
    card: EnemyCardData
    attackType: AttackType
    tier: Tier
    full: boolean
    onChange: (changes: Partial<TargetEffects>) => void
    onDuplicate: () => void
    onRemove: () => void
}

function EnemyCard({
    card,
    attackType,
    tier,
    full,
    onChange,
    onDuplicate,
    onRemove,
}: EnemyCardProps) {
    const { target, npc, title, odds, netAccuracy } = card
    const tech = attackType === 'tech'
    const defenseName = attackType === 'weapon' ? 'Evasion' : 'E-Defense'

    return (
        <article className="flex flex-col gap-3 border bg-background p-4">
            <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                    <SectionTitle as="h3">
                        {title} · T{tier}
                    </SectionTitle>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {npc.role} · {defenseName}{' '}
                        {targetDefense(npc, attackType, tier)}
                    </p>
                </div>
                <div className="flex shrink-0 gap-1">
                    <Button
                        type="button"
                        variant="outline"
                        size="icon-sm"
                        aria-label={`Duplicate ${title}`}
                        aria-disabled={full}
                        onClick={onDuplicate}
                        className="aria-disabled:cursor-not-allowed aria-disabled:text-muted-foreground"
                    >
                        <IconCopy />
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        size="icon-sm"
                        aria-label={`Remove ${title}`}
                        onClick={onRemove}
                    >
                        <IconX />
                    </Button>
                </div>
            </div>
            <Choice
                label="Cover"
                value={tech ? 'none' : target.cover}
                options={[
                    ['none', 'None'],
                    ['soft', 'Soft'],
                    ['hard', 'Hard'],
                ]}
                onChange={(cover) => onChange({ cover })}
                locked={tech}
            />
            <div className="flex flex-wrap gap-2">
                <EffectToggle
                    label="Lock On"
                    pressed={target.lockOn}
                    onChange={(lockOn) => onChange({ lockOn })}
                />
                <EffectToggle
                    label="Prone"
                    pressed={target.prone}
                    onChange={(prone) => onChange({ prone })}
                />
                <EffectToggle
                    label="Invisible"
                    pressed={target.invisible}
                    onChange={(invisible) => onChange({ invisible })}
                />
            </div>
            <div
                aria-live="polite"
                className="mt-1 flex flex-wrap items-end gap-x-8 gap-y-2"
            >
                <p>
                    <span
                        className="block font-heading text-5xl font-semibold"
                        style={{ color: chanceColor(odds.hit) }}
                    >
                        {percent(odds.hit)}
                    </span>
                    <span className={eyebrowClass}>To hit</span>
                </p>
                <p>
                    <span className="block font-heading text-3xl font-semibold">
                        {percent(odds.crit)}
                    </span>
                    <span className={eyebrowClass}>To crit</span>
                </p>
                <NetDice net={netAccuracy} />
            </div>
            {target.invisible && (
                <p className="text-sm text-muted-foreground">
                    Invisible: 50% of attacks miss before rolling.
                </p>
            )}
        </article>
    )
}

type EnemyCardsProps = {
    cards: EnemyCardData[]
    attackType: AttackType
    tier: Tier
    onChange: (id: string, changes: Partial<TargetEffects>) => void
    onDuplicate: (id: string) => void
    onRemove: (id: string) => void
}

/** Section 04: one card per chosen enemy, each with its own effects and odds */
export function EnemyCards({
    cards,
    attackType,
    tier,
    onChange,
    onDuplicate,
    onRemove,
}: EnemyCardsProps) {
    const full = cards.length >= MAX_TARGETS
    const warning = useLimitFlash(full)

    // At the limit, a copy has nowhere to go, so the warning flashes instead
    function duplicate(id: string) {
        if (full) {
            warning.flash()
            return
        }
        onDuplicate(id)
    }

    return (
        // Its own container, so the number of card columns follows this section's width
        <section className="@container flex flex-col gap-3 border bg-card p-4">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <SectionTitle number={4}>Results</SectionTitle>
                <p aria-live="polite" className="text-xs text-muted-foreground">
                    {warning.visible && (
                        <span
                            key={warning.count}
                            className="animate-flash motion-reduce:animate-none"
                        >
                            {MAX_TARGETS} chosen: remove one to add a copy.
                        </span>
                    )}
                </p>
            </div>
            <div className="grid gap-4 @2xl:grid-cols-2 @4xl:grid-cols-3">
                {cards.length === 0 ? (
                    <>
                        {/* An invisible card holds the section at a real card's height, so it doesn't shrink and move the page */}
                        <div className="invisible col-start-1 row-start-1">
                            <EnemyCard
                                card={PLACEHOLDER}
                                attackType={attackType}
                                tier={tier}
                                full={false}
                                onChange={() => {}}
                                onDuplicate={() => {}}
                                onRemove={() => {}}
                            />
                        </div>
                        <p className="col-span-full row-start-1 text-muted-foreground">
                            No enemies selected, select up to {MAX_TARGETS}{' '}
                            enemies above to see your chance of hitting each.
                        </p>
                    </>
                ) : (
                    cards.map((card) => (
                        <EnemyCard
                            key={card.target.id}
                            card={card}
                            attackType={attackType}
                            tier={tier}
                            full={full}
                            onChange={(changes) =>
                                onChange(card.target.id, changes)
                            }
                            onDuplicate={() => duplicate(card.target.id)}
                            onRemove={() => onRemove(card.target.id)}
                        />
                    ))
                )}
            </div>
        </section>
    )
}
